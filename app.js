const data = [
  { id:"NS-001", name:"Rajesh Kumar", dept:"water", title:"No water supply for 3 days", priority:"high", status:"open", loc:"Gomtinagar", filed:"2024-12-08", sla:3,
    steps:[{l:"Submitted",d:true,ts:"08 Dec 10:24 AM"},{l:"Acknowledged",d:true,ts:"08 Dec 11:05 AM"},{l:"In Progress",d:false,ts:""},{l:"Resolved",d:false,ts:""}] },
  { id:"NS-002", name:"Priya Sharma", dept:"roads", title:"Pothole on MG Road", priority:"high", status:"escalated", loc:"Hazratganj", filed:"2024-12-05", sla:5,
    steps:[{l:"Submitted",d:true,ts:"05 Dec 3:10 PM"},{l:"Acknowledged",d:true,ts:"05 Dec 4:00 PM"},{l:"In Progress",d:true,ts:"06 Dec 9:00 AM"},{l:"Resolved",d:false,ts:""}] },
  { id:"NS-003", name:"Anonymous", dept:"sanitation", title:"Garbage not collected", priority:"medium", status:"resolved", loc:"Alambagh", filed:"2024-12-01", sla:3,
    steps:[{l:"Submitted",d:true,ts:"01 Dec 8:00 AM"},{l:"Acknowledged",d:true,ts:"01 Dec 9:30 AM"},{l:"In Progress",d:true,ts:"02 Dec 10 AM"},{l:"Resolved",d:true,ts:"03 Dec 2:00 PM"}] }
];

const depts = { water:"Water Supply", roads:"Roads", electricity:"Electricity", sanitation:"Sanitation", health:"Health", other:"General" };
const slaMap = { water:3, roads:7, electricity:5, sanitation:3, health:2, other:5 };
let nextId = 4;

// Nav
function go(view) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + view).classList.add("active");
  document.getElementById("nav-" + view).classList.add("active");
  if (view === "dept")  renderDept();
  if (view === "admin") renderAdmin();
}

// Submit
function submitForm() {
  const title = document.getElementById("f-title").value.trim();
  const dept  = document.getElementById("f-dept").value;
  const desc  = document.getElementById("f-desc").value.trim();
  const loc   = document.getElementById("f-loc").value.trim();
  if (!title || !dept || !desc || !loc) { toast("❌ Fill all required fields."); return; }

  const anon = document.getElementById("f-anon").checked;
  const id   = "NS-00" + nextId++;
  data.push({
    id, dept, title, priority: document.getElementById("f-priority").value,
    name: anon ? "Anonymous" : (document.getElementById("f-name").value.trim() || "Anonymous"),
    status: "open", loc, filed: new Date().toISOString().slice(0,10), sla: slaMap[dept] || 5,
    steps: [{l:"Submitted",d:true,ts:"Just now"},{l:"Acknowledged",d:false,ts:""},{l:"In Progress",d:false,ts:""},{l:"Resolved",d:false,ts:""}]
  });

  document.getElementById("success-id").textContent = id;
  document.getElementById("f-form").style.display = "none";
  document.getElementById("f-success").style.display = "block";
}

function resetForm() {
  document.getElementById("f-form").reset();
  document.getElementById("f-form").style.display = "block";
  document.getElementById("f-success").style.display = "none";
}

// Track
function search() {
  const id  = document.getElementById("track-id").value.trim().toUpperCase();
  const box = document.getElementById("track-result");
  const c   = data.find(x => x.id === id);
  if (!c) { box.innerHTML = `<div class="alert a-danger">No complaint found with ID <b>${id}</b>.</div>`; return; }

  const pct = {open:25, escalated:60, resolved:100}[c.status] || 25;
  box.innerHTML = `
    <div class="track-box">
      <div><div style="font-size:11px;color:rgba(255,255,255,0.5)">TRACKING ID</div>
        <div class="tid">${c.id}</div>
        <div class="info">${depts[c.dept]} · ${c.loc} · Filed ${c.filed}</div></div>
      <div>${badge(c.status)} ${badge(c.priority)}</div>
    </div>

    <div class="actions" style="margin-top:0;margin-bottom:14px">
      <button class="btn btn-ghost btn-sm" onclick="printReceipt()">🖨 Print Receipt</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="card">
        <b style="font-size:14px">Details</b><br><br>
        <div style="font-size:13.5px;line-height:2;color:#555">
          <b>Title:</b> ${c.title}<br>
          <b>Location:</b> ${c.loc}<br>
          <b>Status:</b> ${c.status}<br>
          <b>Priority:</b> ${c.priority}
        </div>
        <div style="height:6px;background:#dde3ed;border-radius:3px;margin-top:14px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:#f0c040;border-radius:3px"></div>
        </div>
        <div style="font-size:12px;color:#888;margin-top:4px">${pct}% complete</div>
      </div>
      <div class="card">
        <b style="font-size:14px">Timeline</b><br><br>
        <div class="timeline">
          ${c.steps.map((s,i) => {
            const active = !s.d && (i===0 || c.steps[i-1].d);
            return `<div class="tl">
              <div class="tl-left"><div class="dot ${s.d?"done":active?"now":""}"></div><div class="line ${s.d?"done":""}"></div></div>
              <div class="tl-body"><div class="t" style="color:${s.d?"#1a1a2e":active?"#d4a017":"#bbb"}">${s.l}</div>${s.ts?`<div class="s">${s.ts}</div>`:""}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>`;
}

function toggleDark() {
  document.body.classList.toggle("dark");
  document.getElementById("dark-btn").textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Dept
function renderDept() {
  const open = data.filter(c => c.status === "open" || c.status === "escalated");
  document.getElementById("dept-table").innerHTML = open.map(c => `
    <tr>
      <td><b style="font-family:monospace">${c.id}</b></td>
      <td>${c.name}</td>
      <td>${c.title}</td>
      <td>${badge(c.priority)}</td>
      <td>${badge(c.status)}</td>
      <td>${c.loc}</td>
      <td><button class="btn btn-sm btn-dark" onclick="openManage('${c.id}')">Manage</button></td>
    </tr>`).join("");
}

function filterTable() {
  const q = document.getElementById("search-q").value.toLowerCase();
  document.querySelectorAll("#dept-table tr").forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

function openManage(id) {
  const comp = data.find(x => x.id === id);
  document.getElementById("modal-body").innerHTML = `
    <div style="margin-bottom:12px">${badge(comp.status)} ${badge(comp.priority)}</div>
    <div class="field" style="margin-bottom:12px">
      <label>Update Status</label>
      <select id="new-status">
        <option value="open" ${comp.status==="open"?"selected":""}>Open</option>
        <option value="inprog">In Progress</option>
        <option value="resolved" ${comp.status==="resolved"?"selected":""}>Resolved</option>
      </select>
    </div>
    <div class="field" style="margin-bottom:14px">
      <label>Note</label>
      <textarea id="new-note" placeholder="Add an update note..."></textarea>
    </div>
    <div class="actions">
      <button class="btn btn-dark" onclick="saveStatus('${id}')">Save</button>
      <button class="btn btn-red btn-sm" onclick="escalateIt('${id}')">Escalate</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById("modal-title").textContent = id + " — " + comp.title.slice(0,35);
  document.getElementById("manage-modal").classList.add("open");
}

function saveStatus(id) {
  const c = data.find(x => x.id === id);
  c.status = document.getElementById("new-status").value;
  if (c.status === "resolved") c.steps.forEach(s => s.d = true);
  closeModal(); renderDept();
  toast(`✅ ${id} updated successfully.`);
}

function escalateIt(id) {
  const c = data.find(x => x.id === id);
  c.status = "escalated";
  closeModal(); renderDept();
  toast(`⚠️ ${id} escalated to senior authority.`);
}

function closeModal() {
  document.getElementById("manage-modal").classList.remove("open");
}

// Admin
function renderAdmin() {
  const bars = [
    {l:"Roads",n:42,c:"#b86a00"},{l:"Water",n:38,c:"#185fa5"},
    {l:"Sanit.",n:29,c:"#1a7f4b"},{l:"Elec.",n:24,c:"#7a5800"}
  ];
  const max = 42;
  document.getElementById("dept-bars").innerHTML = bars.map(b =>
    `<div class="bar"><span class="lbl">${b.l}</span><div class="track"><div class="fill" style="width:${Math.round(b.n/max*100)}%;background:${b.c}">${b.n}</div></div></div>`
  ).join("");
}

// Helpers
function badge(val) {
  const map = {
    open:"b-open Open", resolved:"b-resolved Resolved", escalated:"b-escalated Escalated",
    high:"b-high High", medium:"b-medium Medium", low:"b-low Low"
  };
  const parts = (map[val] || "").split(" ");
  return parts[0] ? `<span class="badge ${parts[0]}">${parts.slice(1).join(" ")}</span>` : "";
}

function switchTab(t) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + t).classList.add("active");
  event.target.classList.add("active");
}

// ── TOAST NOTIFICATION ──────────────────────────────────────
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// ── PRINT RECEIPT ────────────────────────────────────────────
function printReceipt() {
  window.print();
}
