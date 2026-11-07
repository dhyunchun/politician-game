// 배경음악 미리듣기(Playwright): 서버 띄운 뒤 node tools/bgm_render.js <출력폴더> <초> → bgm_<곡>.wav
const {chromium}=require('playwright');const fs=require('fs');
function wav(ch,sr){const n=ch[0].length,b=Buffer.alloc(44+n*4);b.write('RIFF',0);b.writeUInt32LE(36+n*4,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++)for(let c=0;c<2;c++){const v=Math.max(-1,Math.min(1,ch[c][i]));b.writeInt16LE(Math.round(v*32767),44+i*4+c*2)}return b}
(async()=>{const br=await chromium.launch();const p=await br.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
const secs=+(process.argv[3]||22);
for(const s of ['title','play','tense','pres','togul']){const r=await p.evaluate(async([s,secs])=>{const b=await SND._render(s,secs);const c=[b.getChannelData(0),b.getChannelData(1)];let pk=0,rms=0;for(const x of c[0]){pk=Math.max(pk,Math.abs(x));rms+=x*x}return{pk,rms:Math.sqrt(rms/c[0].length),l:Array.from(c[0]),r:Array.from(c[1])}},[s,secs]);
 console.log(s,'peak',r.pk.toFixed(3),'rms',r.rms.toFixed(3));fs.writeFileSync(process.argv[2]+'/bgm_'+s+'.wav',wav([r.l,r.r],44100))}
// 실시간 재생 경로도 에러 없는지
await p.evaluate(()=>{SND.set(true)});await p.waitForTimeout(1500);
console.log('errs',errs);await br.close()})();
