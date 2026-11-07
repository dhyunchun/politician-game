const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const br=await chromium.launch();const p=await br.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/');await p.waitForTimeout(500);
for(const f of['proto/hd.js','proto/bghd.js'])await p.addScriptTag({content:fs.readFileSync(f,'utf8')});
const out=await p.evaluate(()=>{try{S={party:'jj',look:{st:'part',h:'#2b2421',s:'#f1c7a0'},rival:{party:'sm',look:{st:'slick',h:'#3a3a3a'}}};PF=0;
 const SC=[
  ['street|me^,cit+,old|banner','street',[['me','shake',420,592,0,{face:'smile'}],['old','shake',566,596,1,{face:'smile'}],['cit','cheerQ',760,552,1,{face:'smile'}]]],
  ['office|biz,me|book,cash','office',[['biz','give',388,590,0,{face:'smile'}],['me','think',584,604,1]],[[598,(c,sc)=>hdCase(c,300,598,pxm(sc,598))]]],
  ['court|judge,me~|gavel','court',[['me','clasp',292,590,0,{face:'down2'}]]],
 ];const res=[];
 SC.forEach(([old,bg,ppl,more])=>{const a=document.createElement('canvas');a.width=512;a.height=256;drawPx(old,a);const b=document.createElement('canvas');b.width=512;b.height=320;sceneHD(b,bg,ppl,more);
   const o=document.createElement('canvas');o.width=1024;o.height=512+8+640;const c=o.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.drawImage(a,0,0,1024,512);c.drawImage(b,0,520,1024,640);res.push(o.toDataURL());
   res.push(b.toDataURL())});return res}catch(e){return ['ERR'+e.stack]}});
if(out[0].startsWith('ERR')){console.log(out[0]);process.exit(1)}
out.forEach((u,i)=>fs.writeFileSync(process.argv[2]+'_'+i+'.png',Buffer.from(u.split(',')[1],'base64')));console.log(errs.filter(e=>!/TUNNEL/.test(e)));await br.close()})();
