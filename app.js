const KEY='jpc_v01';
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{pin:null,pupils:[]};

function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function esc(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 if(!db.pin)return pinScreen();
 dashboard();
}
function pinScreen(){
 document.getElementById('app').innerHTML=`<div class="app"><div class="top"><div class="brand">🚗 Just Passing</div><div class="sub">Companion v0.1</div></div><div class="content"><div class="card"><h2>${db.pin?'Enter your PIN':'Create your 4-digit PIN'}</h2><div class="field"><input id="pin" inputmode="numeric" maxlength="4" type="password" placeholder="4 digits"></div><button class="primary" onclick="setPin()">Continue</button></div></div></div>`;
}
function setPin(){
 const p=document.getElementById('pin').value;
 if(!/^\d{4}$/.test(p))return alert('Please enter exactly 4 digits.');
 if(!db.pin){db.pin=p;save();render()}else if(p===db.pin){dashboard()}else alert('Incorrect PIN.');
}
function shell(title,body){
 document.getElementById('app').innerHTML=`<div class="app"><div class="top"><div class="brand">🚗 Just Passing</div><div class="sub">${title}</div></div><div class="content">${body}</div><div class="nav"><div class="navin"><button onclick="dashboard()">🏠<br>Home</button><button onclick="pupils()">👨‍🎓<br>Pupils</button><button onclick="showAdd()">➕<br>Add Pupil</button></div></div></div>`;
}
function dashboard(){
 const outstanding=db.pupils.reduce((a,p)=>a+(Number(p.balance)||0),0);
 shell('Companion',`<h2>Welcome 👋</h2><div class="grid">
 <div class="card"><div class="muted">Active pupils</div><div class="stat">${db.pupils.length}</div></div>
 <div class="card"><div class="muted">Outstanding</div><div class="stat">£${outstanding.toFixed(2)}</div></div>
 </div>
 <div class="actions"><button class="primary" onclick="showAdd()">➕ Add Pupil</button><button class="dark" onclick="pupils()">👨‍🎓 View Pupils</button></div>
 <div class="card"><h3>Version 0.1</h3><div class="muted">Pupil management foundation. Lessons, progress, calendar and payments are next.</div></div>`);
}
function pupils(){
 const q=(prompt('Search pupils (leave blank for all):')||'').toLowerCase();
 const list=db.pupils.filter(p=>(p.name+' '+p.phone).toLowerCase().includes(q));
 shell('Pupils',`<div class="row"><h2>My Pupils</h2><button class="primary" onclick="showAdd()">Add</button></div>
 <div class="list">${list.length?list.map(p=>`<div class="pupil" onclick="profile('${p.id}')"><div class="row"><div><strong>${esc(p.name)}</strong><span class="muted">${esc(p.phone||'No phone')}</span></div><span class="pill">£${Number(p.balance||0).toFixed(2)}</span></div></div>`).join(''):`<div class="empty">No pupils yet.<br>Add your first pupil to get started.</div>`}</div>`);
}
function showAdd(){
 shell('Add Pupil',`<button class="back" onclick="pupils()">← Back</button><h2>New Pupil</h2>
 <div class="field"><label>Name</label><input id="name" placeholder="Full name"></div>
 <div class="field"><label>Mobile</label><input id="phone" type="tel" placeholder="07..."></div>
 <div class="field"><label>Email</label><input id="email" type="email"></div>
 <div class="field"><label>Address</label><textarea id="address" rows="2"></textarea></div>
 <div class="field"><label>Lesson price (£/hour)</label><input id="price" type="number" value="40"></div>
 <div class="field"><label>Default lesson length</label><select id="duration"><option>1</option><option>1.5</option><option>2</option></select></div>
 <div class="field"><label>Notes</label><textarea id="notes" rows="3"></textarea></div>
 <button class="primary" onclick="addPupil()">Save Pupil</button>`);
}
function addPupil(){
 const name=document.getElementById('name').value.trim(); if(!name)return alert('Please enter a name.');
 db.pupils.push({id:Date.now().toString(),name,phone:document.getElementById('phone').value.trim(),email:document.getElementById('email').value.trim(),address:document.getElementById('address').value.trim(),price:Number(document.getElementById('price').value)||40,duration:Number(document.getElementById('duration').value),notes:document.getElementById('notes').value.trim(),balance:0,lessons:0,passed:false});
 save();profile(db.pupils.at(-1).id);
}
function profile(id){
 const p=db.pupils.find(x=>x.id===id); if(!p)return pupils();
 shell('Pupil Profile',`<button class="back" onclick="pupils()">← Pupils</button><div class="card"><h2>${esc(p.name)}</h2>
 <div class="actions"><a href="tel:${esc(p.phone)}"><button class="primary">📞 Call</button></a><a href="sms:${esc(p.phone)}"><button class="dark">💬 Text</button></a></div>
 <p><b>Phone:</b> ${esc(p.phone)||'—'}</p><p><b>Email:</b> ${esc(p.email)||'—'}</p><p><b>Address:</b> ${esc(p.address)||'—'}</p>
 <p><b>Lesson:</b> £${p.price}/hour · ${p.duration} hour${p.duration==1?'':'s'}</p><p><b>Lessons:</b> ${p.lessons}</p><p><b>Balance:</b> £${Number(p.balance).toFixed(2)}</p>
 <p><b>Notes:</b><br>${esc(p.notes)||'—'}</p></div>
 <div class="actions"><button class="primary" onclick="editPupil('${p.id}')">Edit</button><button class="danger" onclick="removePupil('${p.id}')">Delete</button></div>`);
}
function editPupil(id){
 const p=db.pupils.find(x=>x.id===id); if(!p)return;
 shell('Edit Pupil',`<button class="back" onclick="profile('${id}')">← Back</button><h2>Edit ${esc(p.name)}</h2>
 <div class="field"><label>Name</label><input id="name" value="${esc(p.name)}"></div><div class="field"><label>Mobile</label><input id="phone" value="${esc(p.phone)}"></div><div class="field"><label>Email</label><input id="email" value="${esc(p.email)}"></div><div class="field"><label>Address</label><textarea id="address">${esc(p.address)}</textarea></div><div class="field"><label>Lesson price</label><input id="price" type="number" value="${p.price}"></div><div class="field"><label>Lesson length</label><select id="duration"><option ${p.duration==1?'selected':''}>1</option><option ${p.duration==1.5?'selected':''}>1.5</option><option ${p.duration==2?'selected':''}>2</option></select></div><div class="field"><label>Notes</label><textarea id="notes">${esc(p.notes)}</textarea></div><button class="primary" onclick="updatePupil('${id}')">Save Changes</button>`);
}
function updatePupil(id){
 const p=db.pupils.find(x=>x.id===id); if(!p)return;
 p.name=document.getElementById('name').value.trim();p.phone=document.getElementById('phone').value.trim();p.email=document.getElementById('email').value.trim();p.address=document.getElementById('address').value.trim();p.price=Number(document.getElementById('price').value)||40;p.duration=Number(document.getElementById('duration').value);p.notes=document.getElementById('notes').value.trim();save();profile(id);
}
function removePupil(id){if(confirm('Delete this pupil? This cannot be undone in v0.1.')){db.pupils=db.pupils.filter(p=>p.id!==id);save();pupils()}}
render();