// Run on a disposable Ubuntu runner after installing the strict Snap.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = path.join(process.env.HOME, 'snap/monochat/common/ci-smoke');
let processHandle, socket;
let log = '';
async function launch() {
  processHandle = spawn('snap', ['run', 'monochat', '--ozone-platform=x11', '--disable-gpu', '--remote-debugging-port=9222', `--user-data-dir=${profile}`]);
  processHandle.stderr.on('data', data => { log += data; });
  processHandle.stdout.on('data', data => { log += data; });
  let target;
  for (let i = 0; i < 90; i++) {
    if (processHandle.exitCode !== null) throw new Error(`Snap exited: ${log}`);
    try {
      const pages = await (await fetch('http://127.0.0.1:9222/json/list')).json();
      target = pages.find(p => p.type === 'page' && p.url.startsWith('file:'));
      if (target) break;
    } catch {}
    await wait(1000);
  }
  assert.ok(target, `No application window: ${log}`);
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, 'open');
}
let sequence = 0;
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { socket.removeEventListener('message', listener); reject(new Error(`Timeout: ${method}`)); }, 15000);
    const listener = event => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      clearTimeout(timer); socket.removeEventListener('message', listener);
      if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    };
    socket.addEventListener('message', listener);
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const command = value => evaluate(`window.monochat.command(${JSON.stringify(value)})`);
async function stop() {
  socket?.close();
  if (processHandle && processHandle.exitCode === null) {
    processHandle.kill('SIGTERM');
    await Promise.race([once(processHandle, 'exit'), wait(10000)]);
    if (processHandle.exitCode === null) processHandle.kill('SIGKILL');
  }
}
(async () => {
  await launch();
  await command({ type: 'language', language: 'en' });
  const services = ['whatsapp', 'messenger', 'google-messages', 'instagram', 'slack', 'gmail'];
  for (const service of services) {
    await command({ type: 'service', service, enabled: false });
    await command({ type: 'add', service, name: `${service} test` });
  }
  const before = await command({ type: 'snapshot' });
  assert.equal(before.config.accounts.length, 6);
  assert.equal(new Set(before.config.accounts.map(a => a.id)).size, 6);
  fs.mkdirSync('.test-data', { recursive: true });
  const shot = await call('Page.captureScreenshot');
  fs.writeFileSync('.test-data/snap-smoke.png', Buffer.from(shot.data, 'base64'));
  await stop();
  await launch();
  const after = await command({ type: 'snapshot' });
  assert.deepEqual(after.config.accounts, before.config.accounts);
  assert.equal(after.config.settings.language, 'en');
  console.log('PASS: installed strict Snap launches, manages six services and preserves configuration across restart.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await stop();
  fs.mkdirSync('.test-data', { recursive: true });
  fs.writeFileSync('.test-data/snap-smoke.log', log);
});
