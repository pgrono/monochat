// Optional live login-page test. Disposable accounts only; no credentials entered.
const {_electron:electron}=require(process.env.MONOCHAT_PLAYWRIGHT_MODULE || 'playwright');
const Axe=require(process.env.MONOCHAT_AXE_MODULE || '@axe-core/playwright').default;
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const profile=fs.mkdtempSync('/tmp/monochat-six-');const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const packaged=process.env.MONOCHAT_EXECUTABLE;
 const app=await electron.launch({executablePath:path.resolve(packaged||'node_modules/electron/dist/electron'),args:[...(packaged?[]:[path.resolve('.')]),`--user-data-dir=${profile}`,'--ozone-platform=x11'],chromiumSandbox:true,env});
 try{
 fs.mkdirSync('.test-data',{recursive:true});
 const page=await app.firstWindow();await page.locator('#first-account').waitFor();
 await page.evaluate(()=>window.monochat.command({type:'language',language:'en'}));
 for(const service of ['slack','slack','gmail','gmail']){
   await page.locator('#add').click();assert.equal(await page.locator('select[name=service] option').count(),6);
   await page.locator('select[name=service]').selectOption(service);await page.locator('input[name=name]').fill(service+' demo');
   await page.getByRole('button',{name:'Add',exact:true}).click();await page.locator('#dialog').waitFor({state:'hidden'});
 }
 await page.waitForTimeout(15000);
 const views=await app.evaluate(async({webContents})=>Promise.all(webContents.getAllWebContents().filter(w=>w.getURL().startsWith('https://')).map(async w=>({id:w.id,origin:new URL(w.getURL()).origin,title:w.getTitle(),sandbox:w.getLastWebPreferences().sandbox,node:w.getLastWebPreferences().nodeIntegration,body:await w.executeJavaScript('document.body.innerText.slice(0,200)').catch(()=>'' )}))));
 console.log(JSON.stringify(views,null,2));assert.equal(views.length,4);assert.ok(views.every(v=>v.sandbox&&!v.node));
 for(const v of views){assert.match(v.origin,/slack\.com|accounts\.google\.com/);assert.match(v.body,/Sign in|sign in|Zaloguj|email|Email|e-mail/);}
 const initial=await page.evaluate(()=>window.monochat.command({type:'snapshot'}));
 const first=initial.config.accounts[0];
 const separation=await app.evaluate(async({session},accounts)=>{
   const a=session.fromPartition('persist:account-'+accounts[0].id),b=session.fromPartition('persist:account-'+accounts[1].id);
   await a.cookies.set({url:'https://monochat-test.invalid',name:'marker',value:'one'});
   return {same:a===b,other:(await b.cookies.get({name:'marker'})).length};
 },initial.config.accounts);assert.deepEqual(separation,{same:false,other:0});
 await page.evaluate(id=>window.monochat.command({type:'select',id}),first.id);
 await page.waitForTimeout(500);await page.screenshot({path:'.test-data/slack-login.png'});
 await page.evaluate(id=>window.monochat.command({type:'select',id}),initial.config.accounts[2].id);
 await page.waitForTimeout(500);await page.screenshot({path:'.test-data/gmail-login.png'});
 const idsBefore=views.map(v=>v.id).sort();
 const idsAfter=await app.evaluate(({webContents})=>webContents.getAllWebContents().filter(w=>w.getURL().startsWith('https://')).map(w=>w.id).sort());assert.deepEqual(idsAfter,idsBefore);
 await page.locator('#settings').click();await page.locator('#language').waitFor();
 assert.equal(await page.locator('.services input').count(),6);
 assert.deepEqual((await new Axe({page}).setLegacyMode().analyze()).violations.map(v=>v.id),[]);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(760,500));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(()=>window.monochat.command({type:'service',service:'slack',enabled:false}));
 assert.equal(await app.evaluate(({webContents})=>webContents.getAllWebContents().filter(w=>w.getURL().startsWith('https://')).length),2);
 await page.evaluate(()=>window.monochat.command({type:'service',service:'slack',enabled:true}));
 const final=await page.evaluate(()=>window.monochat.command({type:'snapshot'}));assert.deepEqual(final.config.accounts,initial.config.accounts);
 console.log('PASS: six choices, new services login screens, isolated sessions, switching, pause/resume, axe, compact window.');
 }finally{await app.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});
