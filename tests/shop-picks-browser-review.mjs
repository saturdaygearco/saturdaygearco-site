import {createServer} from 'node:http';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=process.cwd();
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff':'font/woff'};
const server=createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/')pathname='/index.html';if(!extname(pathname))pathname+='.html';const file=resolve(root,'.'+pathname);if(!file.startsWith(root+'/'))throw Error();const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const html=[];for(const dir of ['.','guides','author'])for(const name of await readdir(dir)){if(!name.endsWith('.html'))continue;const path=dir==='.'?name:join(dir,name);if((await readFile(path,'utf8')).includes('aria-label="Primary navigation"'))html.push(path)}
const browser=await chromium.launch();let checks=0;
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
 for(const file of html){
 const response=await page.goto(origin+'/'+file,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,file);
 await page.evaluate(async()=>{await document.fonts.ready});
 const menu=page.getByRole('button',{name:'Menu',exact:true});if(await menu.isVisible())await menu.click();
 const link=page.locator('nav[aria-label="Primary navigation"] a[href="/shop-our-picks"]');assert.equal(await link.count(),1,file);
 assert.equal(await link.isVisible(),true,file+' visible navigation');const box=await link.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=viewport.width+1,file+' navigation fits');
 const width=await page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(width<=viewport.width+1,file+' horizontal overflow '+width);
 checks++;console.log('PASS',viewport.width,file);
 }
 await page.close();
 }
 const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await page.goto(origin+'/shop-our-picks');
 assert.equal(await page.locator('.product-pick').count(),6);
 assert.equal(await page.locator('.product-pick__cta').count(),6);
 for(const a of await page.locator('.product-pick__cta').all()){assert.match(await a.getAttribute('href'),/^https:\/\/www.amazon.com\//);assert.equal(await a.getAttribute('data-placement'),'shop_our_picks');assert.match(await a.getAttribute('rel'),/sponsored/)}
 console.log('PASS',checks,'desktop/mobile page checks; 6 original affiliate cards; analytics and external requests blocked. No production traffic or affiliate clicks.');
}finally{await browser.close();await new Promise(r=>server.close(r))}
