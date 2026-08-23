const KEY='jpc_v04';
const skills=['Moving off & stopping','Mirrors & signals','Junctions','Roundabouts','Parking','Independent driving','Dual carriageways'];
const level={red:0,orange:1,yellow:2,green:3};
const levelName={red:'Not introduced',orange:'Learning',yellow:'Almost test standard',green:'Test standard'};

let db=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('jpc_v03')||'null')||{pin:null,pupils:[]};
db.pupils=db.pupils||[];
db.pupils.forEach(p=>{
  p.lessons=p.lessons||[];
  p.progress=p.progress||Object.fromEntries(skills.map(s=>[s,'red']));
});

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));

function shell(title,body){
  app.innerHTML=`<div class="app">
  <header class="top"><div class="brand">🚗 Just Passing</div><div class="sub">${title}</div></header>
  <main class="content">${body}</main>
  <nav class="nav"><div class="navin">
  <button onclick="home()">🏠<br>Home</button>
  <button onclick="pupils()">👨‍🎓<br>Pupils</button>
  <button onclick="calendar()">📅<br>Calendar</button>
  <button onclick="money()">💷<br>Money</button>
  <button onclick="today()">📝<br>Today</button>
  </div></nav></div>`;
}

function start(){
  if(!db.pin){
    app.innerHTML=`<div class="app"><header class="top"><div class="brand">🚗 Just Passing</div><div class="sub">Companion v0.4</div></header>
    <main class="content"><div class="card"><h2>Create PIN</h2>
    <div class="field"><input id="pin" maxlength="4" inputmode="numeric" type="password" placeholder="4 digits"></div>
    <button class="primary" onclick="setPin()">Continue</button></div></main></div>`;
  }else home();
}
function setPin(){let p=pin.value;if(!/^\d{4}$/.test(p))return alert('Enter 4 digits.');db.pin=p;save();home()}

function lessons(){
  return db.pupils.flatMap(p=>(p.lessons||[]).map(l=>({...l,pid:p.id,pupil:p.name})))
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
function readiness(p){
  let vals=skills.map(s=>level[p.progress?.[s]||'red']);
  return Math.round(vals.reduce((a,b)=>a+b,0)/(skills.length*3)*100);
}

function home(){
  let ls=lessons(),d=new Date().toISOString().slice(0,10),month=d.slice(0,7);
  let tl=ls.filter(x=>x.date===d);
  let inc=ls.filter(x=>x.date.startsWith(month)&&x.payment!=='Not paid').reduce((a,x)=>a+x.amount,0);
  let out=db.pupils.reduce((a,p)=>a+(p.balance||0),0);
  shell('Companion v0.4',`<h2>Dashboard</h2>
  <div class="grid">
  <div class="card"><div class="muted">Active pupils</div><div class="stat">${db.pupils.filter(p=>!p.passed).length}</div></div>
  <div class="card"><div class="muted">Outstanding</div><div class="stat">£${out.toFixed(2)}</div></div>
  <div class="card"><div class="muted">Today's lessons</div><div class="stat">${tl.length}</div></div>
  <div class="card"><div class="muted">This month's income</div><div class="stat">£${inc.toFixed(2)}</div></div></div>
  <div class="actions"><button class="primary" onclick="addPupil()">➕ Add Pupil</button><button class="dark" onclick="calendar()">📅 Calendar</button></div>
  <div class="card"><h3>Today's lessons</h3>${tl.length?tl.map(x=>`<div class="item lesson" onclick="profile('${x.pid}')"><b>${esc(x.time||'')} · ${esc(x.pupil)}</b><div class="muted">Lesson #${x.number} · ${x.duration}h</div></div>`).join(''):'<div class="empty">No lessons scheduled today.</div>'}</div>`);
}

function pupils(){
  shell('Pupils',`<div class="row"><h2>My Pupils</h2><button class="primary" onclick="addPupil()">Add</button></div>
  ${db.pupils.length?db.pupils.map(p=>`<div class="item" onclick="profile('${p.id}')"><div class="row"><div><b>${esc(p.name)}</b><div class="muted">${esc(p.phone||'No phone')} · ${(p.lessons||[]).length} lessons</div></div><span class="pill">${p.passed?'Passed':'£'+(p.balance||0).toFixed(2)}</span></div></div>`).join(''):'<div class="empty">No pupils yet.</div>'}`);
}

function addPupil(){
  shell('Add Pupil',`<button class="back" onclick="pupils()">← Back</button><h2>New pupil</h2>
  <div class="field"><label>Name</label><input id="name"></div>
  <div class="field"><label>Mobile</label><input id="phone" type="tel"></div>
  <div class="field"><label>Email</label><input id="email"></div>
  <div class="field"><label>Lesson price (£/hour)</label><input id="price" type="number" value="40"></div>
  <div class="field"><label>Default lesson length</label><select id="dur"><option value="1">1 hour</option><option value="1.5">1½ hours</option><option value="2">2 hours</option></select></div>
  <div class="field"><label>Notes</label><textarea id="notes"></textarea></div>
  <button class="primary" onclick="savePupil()">Save Pupil</button>`);
}
function savePupil(){
  const nameEl=document.getElementById('name');
  const phoneEl=document.getElementById('phone');
  const emailEl=document.getElementById('email');
  const priceEl=document.getElementById('price');
  const durEl=document.getElementById('dur');
  const notesEl=document.getElementById('notes');

  const pupilName=nameEl.value.trim();

  if(!pupilName){
    alert('Enter a name.');
    nameEl.focus();
    return;
  }

  const p={
    id:Date.now().toString(),
    name:pupilName,
    phone:phoneEl.value.trim(),
    email:emailEl.value.trim(),
    price:Number(priceEl.value)||40,
    duration:Number(durEl.value)||1,
    notes:notesEl.value.trim(),
    balance:0,
    paidTotal:0,
    passed:false,
    lessons:[],
    progress:Object.fromEntries(skills.map(s=>[s,'red']))
  };

  db.pupils.push(p);
  save();
  profile(p.id);
  
}


function profile(id){
  let p=db.pupils.find(x=>x.id===id),ls=p.lessons||[];
  shell('Pupil Profile',`<button class="back" onclick="pupils()">← Pupils</button>
  <div class="card"><h2>${esc(p.name)}</h2><p><b>Mobile:</b> ${esc(p.phone)||'—'}</p>
  <p><b>Lesson:</b> £${p.price}/hour · ${p.duration}h</p>
  <p><b>Outstanding:</b> £${(p.balance||0).toFixed(2)}</p><p><b>Total paid:</b> £${(p.paidTotal||0).toFixed(2)}</p>
  <div class="row"><div><div class="muted">Test readiness</div><div class="score">${readiness(p)}%</div></div><button class="dark" onclick="progress('${id}')">🚦 Progress</button></div></div>
  <div class="actions"><button class="primary" onclick="lessonForm('${id}')">🚗 Record Lesson</button><button class="dark" onclick="quickNote('${id}')">📝 Quick Note</button></div>
  <div class="card"><h3>Lesson history</h3>${ls.length?ls.slice().reverse().map(l=>`<div class="item lesson"><b>Lesson #${l.number}</b><div class="muted">${l.date} ${l.time||''} · ${l.duration}h · ${l.payment}</div><div>£${l.amount.toFixed(2)}</div><div>${esc(l.notes)}</div></div>`).join(''):'<div class="muted">No lessons recorded yet.</div>'}</div>
  <button class="danger" onclick="p.passed=!p.passed;save();profile('${id}')">${p.passed?'Restore pupil':'Mark as Passed / Archive'}</button>`);
}

function lessonForm(id){
  let p=db.pupils.find(x=>x.id===id),n=(p.lessons||[]).length+1,d=new Date().toISOString().slice(0,10);
  shell('Record Lesson',`<button class="back" onclick="profile('${id}')">← Back</button><h2>Lesson #${n}</h2>
  <div class="field"><label>Date</label><input id="date" type="date" value="${d}"></div>
  <div class="field"><label>Time</label><input id="time" type="time"></div>
  <div class="field"><label>Duration</label><select id="ldur"><option value="1">1 hour</option><option value="1.5">1½ hours</option><option value="2">2 hours</option></select></div>
  <div class="field"><label>Payment</label><select id="pay"><option>Paid - Cash</option><option>Paid - Bank transfer</option><option>Not paid</option></select></div>
  <div class="field"><label>Amount (£)</label><input id="amt" type="number" value="${p.price*p.duration}"></div>
  <div class="field"><label>Lesson notes</label><textarea id="ln" rows="4"></textarea></div>
  <button class="primary" onclick="saveLesson('${id}')">Save Lesson</button>`);
}
function saveLesson(id){
  let p=db.pupils.find(x=>x.id===id),a=+amt.value||0,l={number:(p.lessons||[]).length+1,date:date.value,time:time.value,duration:+ldur.value,payment:pay.value,amount:a,notes:ln.value};
  p.lessons.push(l);if(l.payment==='Not paid')p.balance+=a;else p.paidTotal+=a;save();profile(id);
}
function quickNote(id){
  let p=db.pupils.find(x=>x.id===id),n=prompt('Quick post-lesson note:');
  if(n===null)return;p.notes=(p.notes?p.notes+'\n':'')+new Date().toLocaleDateString()+' - '+n;save();profile(id);
}

function calendar(){
  let ls=lessons(),now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=(first.getDay()+6)%7,html='';
  for(let i=0;i<start;i++)html+='<div></div>';
  for(let d=1;d<=days;d++){
    let ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,dayls=ls.filter(x=>x.date===ds);
    html+=`<div class="day ${ds===new Date().toISOString().slice(0,10)?'today':''}"><b>${d}</b>${dayls.map(x=>`<div class="mini" onclick="profile('${x.pid}')">${esc(x.time||'')} ${esc(x.pupil)}</div>`).join('')}</div>`;
  }
  shell('Lesson Calendar',`<div class="row"><h2>${now.toLocaleString('en-GB',{month:'long',year:'numeric'})}</h2><button class="primary" onclick="schedule()">➕</button></div><div class="calendar">${html}</div>`);
}
function schedule(){
  if(!db.pupils.length)return alert('Add a pupil first.');
  let s=db.pupils.map((p,i)=>`${i+1}. ${p.name}`).join('\n'),i=+(prompt('Choose pupil:\n'+s)||0)-1;
  if(db.pupils[i])lessonForm(db.pupils[i].id);
}

function money(){
  let ls=lessons(),cash=ls.filter(x=>x.payment==='Paid - Cash').reduce((a,x)=>a+x.amount,0),bank=ls.filter(x=>x.payment==='Paid - Bank transfer').reduce((a,x)=>a+x.amount,0),out=db.pupils.reduce((a,p)=>a+(p.balance||0),0);
  shell('Payments',`<h2>💷 Payments</h2><div class="grid">
  <div class="card"><div class="muted">Total paid</div><div class="stat">£${(cash+bank).toFixed(2)}</div></div>
  <div class="card"><div class="muted">Outstanding</div><div class="stat">£${out.toFixed(2)}</div></div>
  <div class="card"><div class="muted">Cash</div><div class="stat">£${cash.toFixed(2)}</div></div>
  <div class="card"><div class="muted">Bank</div><div class="stat">£${bank.toFixed(2)}</div></div></div>
  <div class="card"><h3>Unpaid lessons</h3>${ls.filter(x=>x.payment==='Not paid').map(x=>`<div class="item"><b>${esc(x.pupil)}</b><div>£${x.amount.toFixed(2)} · ${x.date}</div></div>`).join('')||'<div class="muted">Nothing outstanding 🎉</div>'}</div>
  <div class="actions"><button class="primary" onclick="backup()">💾 Backup</button><button class="dark" onclick="restore()">↩️ Restore</button></div>`);
}

function today(){
  let d=new Date().toISOString().slice(0,10),ls=lessons().filter(x=>x.date===d);
  shell('Today',`<h2>📝 Today's lessons</h2>${ls.length?ls.map(x=>`<div class="item lesson" onclick="profile('${x.pid}')"><b>${esc(x.time||'No time')} · ${esc(x.pupil)}</b><div class="muted">Lesson #${x.number} · ${x.duration}h</div><button onclick="event.stopPropagation();quickNote('${x.pid}')">Quick note</button></div>`).join(''):'<div class="empty">No lessons today.</div>'}`);
}

function backup(){
  let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));
  a.download='just-passing-backup-v04.json';a.click();
}
function restore(){
  let i=document.createElement('input');i.type='file';i.accept='.json';
  i.onchange=e=>{let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.pupils)throw 0;db=x;save();home();alert('Backup restored.')}catch{alert('Invalid backup file.')}};r.readAsText(e.target.files[0])};i.click();
}

function progress(id){
  let p=db.pupils.find(x=>x.id===id);
  shell('Progress',`<button class="back" onclick="profile('${id}')">← Back</button><h2>🚦 ${esc(p.name)}</h2>
  <div class="card"><div class="score">${readiness(p)}% <span class="muted">test readiness</span></div>
  ${skills.map(s=>`<div style="padding:12px 0;border-bottom:1px solid #eee"><b>${esc(s)}</b>
  <div class="progress">${['red','orange','yellow','green'].map(c=>`<button class="${p.progress[s]===c?'selected':''}" onclick="p.progress['${s}']='${c}';save();progress('${id}')">${c==='red'?'🔴':c==='orange'?'🟠':c==='yellow'?'🟡':'🟢'}</button>`).join('')}</div>
  <div class="muted">${levelName[p.progress[s]]}</div></div>`).join('')}</div>`);
}
start();
