/* Local rendering audit. Requires Playwright and axe-core in the development environment. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff'};
const server=http.createServer((req,res)=>{
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 if(name==='/')file=path.join(root,'index.html');
 else if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
});
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()&&!x.name.startsWith('.')&&!['docs','tests'].includes(x.name)?walk(path.join(dir,x.name)):x.isFile()&&x.name.endsWith('.html')?[path.join(dir,x.name)]:[]);
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-zygote','--single-process']}: {})});
 const context=await browser.newContext();const page=await context.newPage();
 // Suppress real GA4 collection and external affiliate traffic during verification.
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.fulfill({body:''}));
 const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 const report={pages:0,layouts:0,overflow:[],accessibility:[],consoleErrors:[],failedAssets:[],analytics:null,keyboard:false,noJavaScript:false};
 page.on('pageerror',e=>report.consoleErrors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))report.failedAssets.push(r.url())});
 const shotdir=path.join(root,'docs/screenshots');fs.mkdirSync(shotdir,{recursive:true});
 for(const file of walk(root)){
  const relative=path.relative(root,file).replaceAll(path.sep,'/');const url=relative==='index.html'?'/':'/'+relative.replace(/\.html$/,'');report.pages++;
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.goto(origin+url);await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);report.layouts++;
   if(overflow)report.overflow.push({url,width});
   await page.evaluate(axe);const scan=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   if(scan.violations.length)report.accessibility.push({url,width,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
   const shot=relative==='index.html'?`home-${width===390?'mobile':'desktop'}`:relative==='garage.html'&&width===1440?'garage-desktop':relative==='guides/drill-vs-impact-driver.html'&&width===390?'guide-mobile':null;
   if(shot){await page.evaluate(async()=>{for(const img of document.querySelectorAll('img[loading=lazy]'))img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))});await page.screenshot({path:path.join(shotdir,shot+'.jpg'),type:'jpeg',quality:85,...(shot==='guide-mobile'?{clip:{x:0,y:0,width,height:1800}}:{fullPage:true})});}
  }
  console.log('Checked',url);
 }
 for(const width of [320,768,1024,1920]){await page.setViewportSize({width,height:900});await page.goto(origin+'/');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Home overflow at '+width)}
 await page.setViewportSize({width:390,height:844});await page.goto(origin+'/');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main-content');
 await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Garage');await page.keyboard.press('Escape');assert.equal(await page.locator(':focus').getAttribute('class'),'menu-toggle');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');report.keyboard=true;
 await page.goto(origin+'/guides/drill-vs-impact-driver');const destination=await page.locator('a[href*="amazon.com"]').first().getAttribute('href');
 await page.locator('a[href*="amazon.com"]').first().evaluate(a=>{a.addEventListener('click',e=>e.preventDefault());a.click()});
 const event=await page.evaluate(()=>Array.from(window.dataLayer).map(v=>Array.from(v)).find(v=>v[0]==='event'&&v[1]==='affiliate_click'));
 assert(event,'affiliate_click was not recorded');assert.equal(event[2].destination_url,destination);assert.equal(event[2].page_path,'/guides/drill-vs-impact-driver');for(const key of ['product_name','link_placement','destination_url','link_domain'])assert(event[2][key]);report.analytics={event:event[1],fields:Object.keys(event[2]),destinationPreserved:true};
 const fallback=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const nojs=await fallback.newPage();await nojs.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({body:''}));await nojs.goto(origin+'/');assert.equal(await nojs.locator('.site-nav a:visible').count(),6);report.noJavaScript=true;// Some single-process development Chromium builds close the browser with the second context.

 fs.writeFileSync(path.join(root,'docs/browser-qa.json'),JSON.stringify(report,null,2));await browser.close();server.close();
 assert.deepEqual(report.overflow,[],'Horizontal overflow');assert.deepEqual(report.failedAssets,[],'Failed local assets');assert.deepEqual(report.consoleErrors,[],'JavaScript errors');assert.deepEqual(report.accessibility,[],'Accessibility violations');console.log('PASS',report.pages,'pages,',report.layouts,'layouts, keyboard, fallback, affiliate event');
})().catch(e=>{console.error(e);server.close();process.exit(1)});
