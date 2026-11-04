/* ANIM AI — client-side SVG animation studio */
const $ = id => document.getElementById(id);
const state = { scenes: [], characterSvg: "", characterName: "Miko", duration: 60, orientation: "portrait", width: 720, height: 1280, style: "", currentScene: 0, playing: false, timer: null, produced: false };
const DEFAULT_CHAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><ellipse cx="170" cy="105" rx="35" ry="94" fill="#d9c7a2" transform="rotate(-12 170 105)"/><ellipse cx="240" cy="102" rx="34" ry="92" fill="#d9c7a2" transform="rotate(13 240 102)"/><ellipse cx="170" cy="105" rx="17" ry="66" fill="#e99d9b" transform="rotate(-12 170 105)"/><ellipse cx="240" cy="102" rx="16" ry="64" fill="#e99d9b" transform="rotate(13 240 102)"/><circle cx="205" cy="225" r="112" fill="#e8d8b7"/><ellipse cx="165" cy="215" rx="12" ry="17" fill="#292a26"/><ellipse cx="245" cy="215" rx="12" ry="17" fill="#292a26"/><ellipse cx="205" cy="250" rx="12" ry="9" fill="#df9993"/><path d="M188 268 Q205 285 222 268" fill="none" stroke="#5b493d" stroke-width="5" stroke-linecap="round"/><path d="M113 300 Q205 330 297 300 L280 355 Q205 385 130 355Z" fill="#72936b"/><circle cx="133" cy="244" r="17" fill="#e9a7a0" opacity=".55"/><circle cx="277" cy="244" r="17" fill="#e9a7a0" opacity=".55"/></svg>`;
const sampleScenes = [
 ["00:00–00:10","Miko memasuki hutan ajaib yang dipenuhi pepohonan tinggi dan cahaya lembut.","wide forest entrance, glowing fireflies, rabbit walking in"],
 ["00:10–00:20","Miko menemukan jamur-jamur kecil yang bercahaya di bawah pohon.","glowing mushrooms, curious rabbit looking down"],
 ["00:20–00:30","Seekor kupu-kupu biru terbang mendekat dan mengajak Miko mengikuti cahaya.","blue butterfly flying beside rabbit, magical forest"],
 ["00:30–00:40","Miko mengikuti kupu-kupu melewati sungai kecil yang berkilau.","small sparkling stream, stepping stones, rabbit following butterfly"],
 ["00:40–00:50","Mereka tiba di pohon tua yang menyimpan cahaya bintang di dalam batangnya.","ancient giant tree with star light, rabbit amazed"],
 ["00:50–01:00","Cahaya bintang menyebar ke seluruh hutan. Miko tersenyum, petualangannya menjadi kenangan indah.","forest filled with gentle stars, happy rabbit, magical ending"]
];
function setStep(n){document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));$("panel"+n).classList.add("active");document.querySelectorAll(".step").forEach(s=>{const x=+s.dataset.step;s.classList.toggle("active",x===n);s.classList.toggle("done",x<n)});window.scrollTo({top:0,behavior:"smooth"})}
function setNotice(t){$("notice1").textContent=t}
function safeSvg(s){return String(s||"").replace(/<script[\s\S]*?<\/script>/gi,"").replace(/\son\w+\s*=\s*(['"]).*?\1/gi,"").replace(/javascript:/gi,"")}
function extractJSON(text){const clean=text.replace(/```json|```/g,"").trim();const a=clean.indexOf("{"),b=clean.lastIndexOf("}");if(a<0||b<a)throw Error("Respons AI bukan JSON yang valid.");return JSON.parse(clean.slice(a,b+1))}
async function gemini(prompt){
 const key=$("apiKey").value.trim();if(!key)throw Error("Masukkan Gemini API key terlebih dahulu.");
 const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:.8}})});
 const data=await res.json();if(!res.ok)throw Error(data.error?.message||"Gemini API gagal.");return data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
}
function useSample(){state.duration=+$("duration").value;state.orientation=$("orientation").value;state.width=state.orientation==="portrait"?720:1280;state.height=state.orientation==="portrait"?1280:720;state.style=$("visualStyle").value;const chosen=state.duration===30?[sampleScenes[0],sampleScenes[2],sampleScenes[5]]:sampleScenes;state.scenes=chosen.map((s,i)=>({time:`${formatTime(i*state.duration/chosen.length)}–${formatTime((i+1)*state.duration/chosen.length)}`,description:s[1],visual:s[2]}));state.characterSvg=DEFAULT_CHAR;state.characterName="Miko";$("characterName").value="Miko";$("characterDescription").value="Kelinci kecil berbulu krem, telinga panjang, syal hijau, mata besar dan ekspresif.";renderReview();setStep(2)}
async function planStory(){
 const prompt=$("storyPrompt").value.trim();if(!prompt){setNotice("Tulis ide cerita terlebih dahulu.");return}
 state.duration=+$("duration").value;state.orientation=$("orientation").value;state.width=state.orientation==="portrait"?720:1280;state.height=state.orientation==="portrait"?1280:720;state.style=$("visualStyle").value;
 $("planBtn").disabled=true;$("planBtn").textContent="Sedang menyusun…";
 try{
  const count=state.duration===60?6:3;
  const out=await gemini(`Bertindak sebagai sutradara animasi 2D. Buat rancangan untuk ide: ${prompt}. Durasi ${state.duration} detik, tepat ${count} adegan, masing-masing ${state.duration/count} detik. Gaya: ${state.style}. Balas JSON valid saja dengan struktur {"title":"judul","character":{"name":"nama","description":"deskripsi visual karakter","svg":"SVG lengkap valid dengan viewBox 0 0 400 400, tanpa script, tanpa external assets"},"scenes":[{"time":"00:00–00:10","description":"aksi cerita bahasa Indonesia","visual":"deskripsi visual ringkas dalam bahasa Inggris untuk komposisi SVG"}]}. Karakter harus orisinal, desain konsisten, SVG sederhana dan lengkap. Tiap scene visual harus beda latar sesuai cerita. Jangan sertakan markdown.`);
  const data=extractJSON(out);if(!data.character?.svg||!Array.isArray(data.scenes)||data.scenes.length!==count)throw Error("Struktur storyboard AI tidak lengkap.");
  state.scenes=data.scenes;state.characterSvg=safeSvg(data.character.svg);state.characterName=data.character.name||"Karakter";$("characterName").value=state.characterName;$("characterDescription").value=data.character.description||"";renderReview();setStep(2);
 }catch(e){setNotice("Gagal membuat konsep: "+e.message)}
 finally{$("planBtn").disabled=false;$("planBtn").innerHTML='Buat karakter & storyboard <span>→</span>'}
}
function renderReview(){
 $("characterPreview").innerHTML=safeSvg(state.characterSvg||DEFAULT_CHAR);$("sceneCount").textContent=state.scenes.length+" ADEGAN";
 $("storyboardList").innerHTML=state.scenes.map((s,i)=>`<div class="scene-edit"><div class="scene-time">${esc(s.time||("ADEGAN "+(i+1)))}</div><div><input data-title="${i}" aria-label="Judul adegan" value="${esc(s.description||"")}"><textarea data-visual="${i}" aria-label="Deskripsi visual">${esc(s.visual||"")}</textarea></div></div>`).join("");
 $("storyboardList").querySelectorAll("[data-title]").forEach(el=>el.addEventListener("input",()=>state.scenes[+el.dataset.title].description=el.value));
 $("storyboardList").querySelectorAll("[data-visual]").forEach(el=>el.addEventListener("input",()=>state.scenes[+el.dataset.visual].visual=el.value));
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function hashColor(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return ["#526b58","#667c8b","#8a735b","#6f6485","#687c70","#8b756c"][Math.abs(h)%6]}
function sceneSvg(scene,index,phase=0){
 const w=state.width,h=state.height,land=state.orientation==="landscape",bg=hashColor(scene.visual||scene.description||String(index)),char=state.characterSvg||DEFAULT_CHAR;
 const scale=land?Math.min(h*.65,430):Math.min(w*.72,430),cx=land?w*.5:w*.5,cy=land?h*.56:h*.56;
 const bob=Math.sin(phase*Math.PI*2)*7, sway=Math.sin(phase*Math.PI*2)*10;
 const charImage=`<g transform="translate(${cx-scale/2+sway} ${cy-scale/2+bob}) scale(${scale/400})">${char.replace(/<\?xml[^>]*>/g,"").replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g>`;
 const seed=index+1;let decor="";
 for(let i=0;i<12;i++){let x=(i*97+seed*43)%w,y=(i*173+seed*71)%h;decor+=`<circle cx="${x}" cy="${y}" r="${(i%3)+3}" fill="#f5e9b0" opacity="${.18+(i%3)*.08}"/>`}
 const trees=Array.from({length:land?6:4},(_,i)=>{let x=(i+1)*w/(land?7:5);let y=h*.64;return `<path d="M${x} ${y} l-8 ${h*.25} h16z" fill="#273d31"/><circle cx="${x}" cy="${y-h*.05}" r="${h*.13}" fill="#304a38"/>`}).join("");
 const title=esc(scene.description||"Petualangan baru");
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img"><defs><linearGradient id="bg${index}" x2="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#1b2924"/></linearGradient><radialGradient id="glow${index}"><stop stop-color="#f5e8a8" stop-opacity=".65"/><stop offset="1" stop-color="#f5e8a8" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#bg${index})"/><circle cx="${w*.5}" cy="${h*.28}" r="${h*.3}" fill="url(#glow${index})"/>${decor}${trees}<path d="M0 ${h*.78} Q${w*.5} ${h*.68} ${w} ${h*.8} V${h} H0Z" fill="#1b3027" opacity=".85"/><g class="character">${charImage}</g><rect x="${w*.07}" y="${h*.07}" width="${w*.86}" height="${h*.14}" rx="18" fill="#101510" opacity=".48"/><text x="${w*.5}" y="${h*.125}" text-anchor="middle" fill="#fff5d8" font-family="Arial" font-size="${land?27:31}" font-weight="bold">${esc(state.characterName)} · ADEGAN ${index+1}</text><text x="${w*.5}" y="${h*.17}" text-anchor="middle" fill="#f4ecd5" font-family="Arial" font-size="${land?17:20}">${title.slice(0,75)}</text><text x="${w*.5}" y="${h*.94}" text-anchor="middle" fill="#f5e9b0" font-family="Arial" font-size="${land?16:18}">${esc(scene.time||"")}</text></svg>`;
}
function addLog(msg,ok=false){const p=document.createElement("div");p.className=ok?"ok":"";p.textContent=(ok?"✓ ":"› ")+msg;$("productionLog").appendChild(p);$("productionLog").scrollTop=$("productionLog").scrollHeight}
async function produce(){
 state.characterName=$("characterName").value.trim()||"Karakter";$("productionLog").innerHTML="";$("toPreviewBtn").disabled=true;setStep(3);
 $("productionStage").innerHTML='<div class="empty-state"><div class="loader-ring"></div><h3>Produksi berjalan</h3><p>Membuat komposisi SVG.</p></div>';
 for(let i=0;i<state.scenes.length;i++){await new Promise(r=>setTimeout(r,220));const svg=sceneSvg(state.scenes[i],i);state.scenes[i].svg=svg;$("productionStage").innerHTML=svg;let pct=Math.round((i+1)/state.scenes.length*100);$("progressBar").style.width=pct+"%";$("progressText").textContent="Menyelesaikan adegan "+(i+1)+" dari "+state.scenes.length;$("progressPercent").textContent=pct+"%";addLog("Adegan "+(i+1)+" berhasil dirender.",true)}
 state.produced=true;$("toPreviewBtn").disabled=false;addLog("Semua adegan siap untuk preview.",true);
}
function renderFinal(){if(!state.scenes.length)return;$("finalPreview").innerHTML=state.scenes[0].svg||sceneSvg(state.scenes[0],0);$("exportResolution").textContent=state.width+" × "+state.height;$("exportDuration").textContent=state.duration+" detik";$("previewTime").textContent="00:00 / "+formatTime(state.duration)}
function formatTime(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function showScene(i){state.currentScene=Math.max(0,Math.min(i,state.scenes.length-1));$("finalPreview").innerHTML=state.scenes[state.currentScene].svg||sceneSvg(state.scenes[state.currentScene],state.currentScene);$("previewSeek").value=state.currentScene/(state.scenes.length-1||1)*100;const sec=Math.round(state.currentScene*state.duration/state.scenes.length);$("previewTime").textContent=formatTime(sec)+" / "+formatTime(state.duration)}
function play(){if(state.playing){clearInterval(state.timer);state.playing=false;$("playPreview").textContent="▶";return}state.playing=true;$("playPreview").textContent="Ⅱ";state.timer=setInterval(()=>{if(state.currentScene>=state.scenes.length-1){clearInterval(state.timer);state.playing=false;$("playPreview").textContent="▶";return}showScene(state.currentScene+1)},state.duration/state.scenes.length*1000)}
async function exportMp4(){
 const status=$("exportStatus"),btn=$("exportBtn");btn.disabled=true;status.textContent="Menyiapkan video tanpa audio…";
 try{
  const {FFmpeg}=await import("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js");
  const {toBlobURL}=await import("https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js");
  const ff=new FFmpeg();ff.on("log",({message})=>{if(message)status.textContent=message.slice(-130)});
  const base="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
  status.textContent="Mengunduh mesin ekspor FFmpeg (~30 MB)…";
  await ff.load({coreURL:await toBlobURL(base+"/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL(base+"/ffmpeg-core.wasm","application/wasm")});
  const canvas=document.createElement("canvas");canvas.width=state.width;canvas.height=state.height;const ctx=canvas.getContext("2d");
  const stream=canvas.captureStream(24);const chunks=[];const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4500000});
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise(resolve=>rec.onstop=resolve);rec.start();
  const durationMs=state.duration*1000,frames=Math.ceil(state.duration*24),frameMs=1000/24;
  for(let f=0;f<frames;f++){let sec=f/24,idx=Math.min(state.scenes.length-1,Math.floor(sec/(state.duration/state.scenes.length)));let svg=sceneSvg(state.scenes[idx],idx,(sec%(state.duration/state.scenes.length))/(state.duration/state.scenes.length));let blob=new Blob([svg],{type:"image/svg+xml"});let url=URL.createObjectURL(blob);let img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});ctx.drawImage(img,0,0,state.width,state.height);URL.revokeObjectURL(url);await new Promise(r=>setTimeout(r,frameMs));if(f%48===0)status.textContent="Merender frame "+f+" / "+frames+"…"}
  await new Promise(r=>setTimeout(r,250));rec.stop();await done;stream.getTracks().forEach(t=>t.stop());
  const webm=new Blob(chunks,{type:"video/webm"});status.textContent="Mengonversi WebM ke MP4 H.264…";await ff.writeFile("anim-input.webm",new Uint8Array(await webm.arrayBuffer()));await ff.exec(["-i","anim-input.webm","-an","-c:v","libx264","-preset","ultrafast","-pix_fmt","yuv420p","-movflags","+faststart","anim-ai.mp4"]);const data=await ff.readFile("anim-ai.mp4");
  if(window.AndroidBridge){
   status.textContent="Menyimpan MP4 ke folder Download…";
   if(!AndroidBridge.beginMp4()) throw Error("Tidak bisa menyiapkan file MP4.");
   const chunkSize=196608;
   for(let i=0;i<data.length;i+=chunkSize){
    let binary="";const part=data.subarray(i,Math.min(i+chunkSize,data.length));
    for(let j=0;j<part.length;j++)binary+=String.fromCharCode(part[j]);
    if(!AndroidBridge.appendMp4Chunk(btoa(binary)))throw Error("Gagal menyimpan bagian video.");
    status.textContent="Menyimpan video "+Math.min(100,Math.round((i+part.length)/data.length*100))+"%…";
   }
   if(!AndroidBridge.finishMp4())throw Error("Gagal menyelesaikan penyimpanan MP4.");
   status.textContent="Selesai. MP4 tersimpan di Download/ANIM AI.";
  }else{
   const mp4=new Blob([data.buffer],{type:"video/mp4"});const url=URL.createObjectURL(mp4);const a=document.createElement("a");a.href=url;a.download="anim-ai-video.mp4";a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent="Selesai. File MP4 sudah dibuat dan diunduh.";
  }
 }catch(e){status.textContent="Ekspor gagal: "+e.message+". Coba browser Chrome terbaru dan koneksi stabil."}
 finally{btn.disabled=false}
}
$("sampleBtn").addEventListener("click",useSample);$("planBtn").addEventListener("click",planStory);$("approveCheck").addEventListener("change",e=>$("produceBtn").disabled=!e.target.checked);$("produceBtn").addEventListener("click",produce);$("backToConcept").addEventListener("click",()=>setStep(1));$("toPreviewBtn").addEventListener("click",()=>{renderFinal();setStep(4)});$("playPreview").addEventListener("click",play);$("previewSeek").addEventListener("input",e=>{if(state.playing)play();showScene(Math.round(+e.target.value/100*(state.scenes.length-1)))});$("exportBtn").addEventListener("click",exportMp4);$("restartBtn").addEventListener("click",()=>{state.scenes=[];state.produced=false;$("approveCheck").checked=false;$("produceBtn").disabled=true;setStep(1)});$("newProjectBtn").addEventListener("click",()=>{if(confirm("Mulai proyek baru? Rancangan saat ini akan diganti."))$("restartBtn").click()});$("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());$("closeHelp").addEventListener("click",()=>$("helpDialog").close());
$("characterName").addEventListener("input",e=>state.characterName=e.target.value);
