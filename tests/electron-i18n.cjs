// Optional real Electron localization test; always run on Xvfb with a disposable profile.
const { _electron: electron } = require(process.env.MONOCHAT_PLAYWRIGHT_MODULE || 'playwright');
const AxeBuilder = require(process.env.MONOCHAT_AXE_MODULE || '@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { defaultConfig } = require('../build/shared/model.js');
const { translate, resolveLanguage } = require('../build/shared/i18n.js');
(async () => {
 const profile = fs.mkdtempSync('/tmp/monochat-i18n-');
 const config = defaultConfig(); delete config.settings.language; // Simulate an upgrade.
 const id = 'a1111111-1111-4111-8111-111111111111';
 config.accounts.push({ id, service:'whatsapp', name:'Private label', enabled:false, muted:false, notifications:true, order:0 });
 fs.writeFileSync(path.join(profile,'config.json'),JSON.stringify(config));
 let app;
 async function launch(systemLanguage) {
  const env = {...process.env, LANGUAGE:systemLanguage, LANG:'C.UTF-8', LC_ALL:'C.UTF-8'}; delete env.ELECTRON_RUN_AS_NODE;
  const packaged = process.env.MONOCHAT_EXECUTABLE;
  app = await electron.launch({ executablePath:path.resolve(packaged || 'node_modules/electron/dist/electron'), args:[...(packaged ? [] : [path.resolve('.')]),`--user-data-dir=${profile}`,'--ozone-platform=x11'], chromiumSandbox:true, env });
  const page=await app.firstWindow(); await page.locator('#settings').waitFor(); return page;
 }
 try {
  let page=await launch('fr_FR:en');
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#settings').innerText(),'Paramètres');
  let state=await page.evaluate(()=>window.monochat.command({type:'snapshot'}));
  assert.equal(state.config.settings.language,'auto'); assert.equal(state.config.accounts[0].id,id);
  const systemLanguages=await app.evaluate(({app})=>app.getPreferredSystemLanguages());
  assert.equal(state.language,resolveLanguage('auto',systemLanguages));
  await page.locator('#settings').click();
  assert.equal(await page.locator('#language option').count(),7);
  for (const language of ['en','pl','de','fr','es','it']) {
   await page.locator('#language').selectOption(language);
   await page.waitForFunction(lang=>document.documentElement.lang===lang && document.querySelector('#language')?.disabled===false,language);
   assert.equal(await page.locator('#dialog-title').innerText(),translate(language,'Ustawienia'));
   assert.equal(await page.locator('#settings').innerText(),translate(language,'Ustawienia'));
   const menu=await app.evaluate(({Menu})=>Menu.getApplicationMenu().items[0].submenu.items.map(item=>item.label));
   assert.ok(menu.includes(translate(language,'Ustawienia')));
   assert.equal(await page.locator('.sidebar').evaluate(el=>el.scrollWidth>el.clientWidth),false);
   // Intercept only the native confirmation in this disposable test process; always cancel.
   await app.evaluate(({dialog})=>{ dialog.showMessageBox=async(_window, options)=>{global.__languageDialog=options;return {response:0,checkboxChecked:false};}; });
   await page.locator('.settings-actions .danger').click();
   const confirmation=await app.evaluate(()=>global.__languageDialog);
   assert.equal(confirmation.title,translate(language,'Usuń lokalne konto'));
   assert.ok(confirmation.message.includes('Private label'));
   assert.equal(confirmation.buttons[0],translate(language,'Anuluj'));
   await page.locator('#language').waitFor();
   assert.equal(await page.locator('.settings-account input:not([type])').inputValue(),'Private label');
   const violations=(await new AxeBuilder({page}).setLegacyMode().analyze()).violations;
   assert.deepEqual(violations.map(v=>v.id),[],language);
   if(language==='de') {fs.mkdirSync('.test-data',{recursive:true});await page.screenshot({path:'.test-data/language-de.png'});}
   await page.locator('#close-dialog').click(); await page.locator('#add').click();
   assert.equal(await page.locator('#dialog-title').innerText(),translate(language,'Dodaj konto'));
   assert.equal(await page.locator('input[name=name]').getAttribute('placeholder'),translate(language,'np. Prywatne lub Firma'));
   assert.equal(await page.locator('#dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);
   await page.locator('#close-dialog').click(); await page.locator('#settings').click();
   console.log(`UI, add form, menu, native confirmation, account preservation and axe: ${language} PASS`);
  }
  const bad=await page.evaluate(async()=>{try {await window.monochat.command({type:'language',language:'xx'});return false;}catch{return true;}});assert.equal(bad,true);
  await app.close(); app=undefined;
  page=await launch('de_DE:en');
  assert.equal(await page.locator('html').getAttribute('lang'),'it','Manual choice survives restart and a different system language');
  await page.locator('#settings').click();await page.locator('#language').selectOption('auto');
  await page.waitForFunction(()=>document.documentElement.lang==='de');
  assert.equal((await page.evaluate(()=>window.monochat.command({type:'snapshot'}))).config.accounts[0].id,id);
  await app.close();app=undefined;
  page=await launch('ja_JP');assert.equal(await page.locator('html').getAttribute('lang'),'en','Unsupported system language falls back to English');
  console.log('Legacy migration, automatic language, manual persistence, return to auto and fallback PASS');
 } finally { if(app) await app.close(); fs.rmSync(profile,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exit(1);});
