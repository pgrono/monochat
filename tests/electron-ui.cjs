// Optional desktop test: use the shared Playwright and axe installation. Fresh disposable profile only.
const {_electron: electron} = require(process.env.MONOCHAT_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AxeBuilder=require(process.env.MONOCHAT_AXE_MODULE || '@axe-core/playwright').default;
(async()=>{
 const profile=fs.mkdtempSync('/tmp/monochat-ui-');
 const env={...process.env}; delete env.ELECTRON_RUN_AS_NODE;
 const packaged=process.env.MONOCHAT_EXECUTABLE;
 const app=await electron.launch({executablePath:path.resolve(packaged||'node_modules/electron/dist/electron'),args:[...(packaged?[]:[path.resolve('.')]),`--user-data-dir=${profile}`, ...(process.env.MONOCHAT_TEST_X11 ? ["--ozone-platform=x11"] : [])],chromiumSandbox:true,env});
 try {
 const page=await app.firstWindow();
 fs.mkdirSync('.test-data',{recursive:true});
 await page.locator('#first-account').waitFor();
 await page.evaluate(()=>window.monochat.command({type:'language',language:'pl'}));
 await page.waitForFunction(()=>document.documentElement.lang==='pl');
 const identity=await app.evaluate(({app,BrowserWindow})=>({name:app.getName(),title:BrowserWindow.getAllWindows()[0].getTitle(),windowId:BrowserWindow.getAllWindows()[0].getNativeWindowHandle().readUInt32LE()}));
 assert.equal(identity.name,'MonoChat'); assert.equal(identity.title,'MonoChat');
 if(process.env.MONOCHAT_TEST_X11){const props=require('node:child_process').execFileSync('xprop',['-id',String(identity.windowId),'WM_CLASS','_NET_WM_NAME'],{encoding:'utf8'}); console.log(props); assert.match(props,/io\.github\.pgrono\.monochat/);}
 assert.equal(await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().width),154);
 console.log('Application identity and 154px sidebar PASS');
 await page.locator('#settings').click();
 await page.locator('#dialog[open]').waitFor();
 await page.locator('#close-dialog').click();
 console.log('axe empty',JSON.stringify((await new AxeBuilder({page}).setLegacyMode().analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))));
 await page.screenshot({path:'docs/electron-empty.png'});
 const invalid=await page.evaluate(async()=>{try { await window.monochat.command({type:'add',service:'evil',name:'Bad'}); return false; } catch { return true; }});
 assert.equal(invalid,true);
 for(const service of ['whatsapp','messenger','google-messages','instagram']){
  await page.locator('#add').click();
  await page.locator('select[name=service]').selectOption(service);
  await page.locator('input[name=name]').fill(`Test ${service}`);
  await page.getByRole('button',{name:'Dodaj',exact:true}).click();
  await page.locator('#dialog').waitFor({state:'hidden'});
  assert.ok(await page.locator('#accounts').innerText().then(t=>t.includes(`Test ${service}`)));
 }
 assert.equal(await page.locator('#accounts button').count(),4);
 assert.equal(await page.locator('.sidebar').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Sidebar content must fit');
 assert.equal(await page.locator('.brand').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Brand must fit');
 await page.waitForTimeout(15000);
 console.log(JSON.stringify(await app.evaluate(async({webContents,app})=>({sandboxDisabled:app.commandLine.hasSwitch('no-sandbox'),views: await Promise.all(webContents.getAllWebContents().filter(w=>w.getType()!=='browserWindow').map(async w=>({origin:new URL(w.getURL()||'about:blank').origin,title:w.getTitle(),secure:w.getLastWebPreferences().sandbox,node:w.getLastWebPreferences().nodeIntegration,loginScreen:await w.executeJavaScript("/Scan to log in|Log into Facebook|Log into Instagram|Welcome to Google Messages/.test(document.body.innerText)").catch(()=>false)})))})),null,2));
 const bounds=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].contentView.children.map(view=>view.getBounds()));
 assert.ok(bounds.some(rect=>rect.x===154 && rect.width>0),'Service view starts at sidebar edge');
 await page.locator('#settings').click();
 await page.locator('#dialog[open]').waitFor();
 const beforeLanguage=await app.evaluate(({webContents})=>Promise.all(webContents.getAllWebContents().filter(w=>w.getType()!=='browserWindow').map(async w=>[w.id,await w.executeJavaScript('performance.timeOrigin').catch(()=>null)])));
 await page.locator('#language').selectOption('de');
 await page.waitForFunction(()=>document.documentElement.lang==='de' && !document.querySelector('#language').disabled);
 await page.locator('#language').selectOption('pl');
 await page.waitForFunction(()=>document.documentElement.lang==='pl' && !document.querySelector('#language').disabled);
 const afterLanguage=await app.evaluate(({webContents})=>Promise.all(webContents.getAllWebContents().filter(w=>w.getType()!=='browserWindow').map(async w=>[w.id,await w.executeJavaScript('performance.timeOrigin').catch(()=>null)])));
 assert.deepEqual(afterLanguage,beforeLanguage,'Language changes must preserve running pages without reload');
 await page.screenshot({path:'docs/electron-settings.png'});
 console.log('axe settings',JSON.stringify((await new AxeBuilder({page}).setLegacyMode().analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))));
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(760,500));
 await page.screenshot({path:'.test-data/electron-compact.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('Electron real UI: add four accounts, modal, invalid IPC PASS');
 } finally {await app.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});
