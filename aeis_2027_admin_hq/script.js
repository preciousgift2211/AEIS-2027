// AEIS 2027 HQ - frontend starter dashboard
// Replace the demo data functions with API requests to your Node/Express backend when ready.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const demoData = {
  schools: [],
  individuals: [],
  institutions: [],
  sponsors: []
};
let currentRecord = null;
let toastTimer;
const notificationPrefs = {
  visitors: true, schools: true, individuals: true,
  institutions: true, sponsors: true, email: true
};
const preferenceLabels = {
  visitors: "Website visitor alerts",
  schools: "School registration alerts",
  individuals: "Free attendee alerts",
  institutions: "Institution registration alerts",
  sponsors: "Sponsorship application alerts",
  email: "Email notifications"
};
let notifications = [];

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { showToast("Browser storage is unavailable."); }
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function loadData() {
  Object.keys(demoData).forEach(key => {
    demoData[key] = readStore(`aeis_${key}`, []);
  });
  Object.assign(notificationPrefs, readStore("aeis_notification_prefs", {}));
  notifications = readStore("aeis_notifications", []);
}
function persistData(category) { saveStore(`aeis_${category}`, demoData[category]); }

function navigate(page) {
  const target = $(`#page-${page}`);
  if (!target) return;
  $$(".page-view").forEach(view => view.classList.toggle("active", view === target));
  $$(".nav-link[data-page]").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  $("#sidebar").classList.remove("open");
  $("#sidebarBackdrop").classList.remove("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$$(".nav-link[data-page]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
$$(".brand").forEach(brand => brand.addEventListener("click", event => { event.preventDefault(); navigate("dashboard"); }));
$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.add("open");
  $("#sidebarBackdrop").classList.add("show");
});
$("#sidebarBackdrop").addEventListener("click", () => {
  $("#sidebar").classList.remove("open");
  $("#sidebarBackdrop").classList.remove("show");
});
$("#topNotificationButton").addEventListener("click", () => navigate("notifications"));
$("#profileButton").addEventListener("click", () => showToast("Admin profile settings are shown in the Settings section."));
$("#topProfileButton").addEventListener("click", () => navigate("settings"));
$("#logoutButton").addEventListener("click", () => showToast("Connect admin authentication to enable secure logout."));

function setTheme(light) {
  document.body.classList.toggle("light-mode", light);
  const label = light ? "Dark Mode" : "Light Mode";
  const icon = light ? "fa-moon" : "fa-sun";
  $("#themeToggle").innerHTML = `<i class="fa-solid ${icon}"></i><span>${label}</span>`;
  saveStore("aeis_theme", light ? "light" : "dark");
  drawChart("registrationChart", 6);
  drawChart("analyticsChart", 6);
}
function toggleTheme() { setTheme(!document.body.classList.contains("light-mode")); }
$("#themeToggle").addEventListener("click", toggleTheme);
$("#settingsThemeToggle").addEventListener("click", toggleTheme);

function addNotification(title, description, icon = "fa-bell", category = "general") {
  if (notificationPrefs[category] === false) return;
  notifications.unshift({ id: crypto.randomUUID?.() || String(Date.now()), title, description, icon, date: new Date().toISOString(), read: false });
  notifications = notifications.slice(0, 50);
  saveStore("aeis_notifications", notifications);
  renderNotifications();
}
function renderNotifications() {
  const unread = notifications.filter(item => !item.read).length;
  $("#topNotificationCount").textContent = unread;
  $("#notificationNavDot").style.display = unread ? "block" : "none";
  $("#notificationSummary").textContent = `${notifications.length} notification(s) · ${unread} unread`;
  const markup = notifications.length ? notifications.map(item => `
    <div class="activity-item">
      <span class="activity-icon"><i class="fa-solid ${escapeHTML(item.icon)}"></i></span>
      <div class="activity-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small></div>
      <span class="activity-time">${formatDate(item.date)}${item.read ? "" : " · New"}</span>
    </div>`).join("") : '<div class="empty-state">No notifications yet. New registrations will appear here.</div>';
  $("#recentActivity").innerHTML = notifications.slice(0, 4).map(item => `
    <div class="activity-item"><span class="activity-icon"><i class="fa-solid ${escapeHTML(item.icon)}"></i></span>
    <div class="activity-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small></div><span class="activity-time">${formatDate(item.date)}</span></div>`).join("") || '<div class="empty-state">No activity yet. New registrations will appear here.</div>';
  $("#allNotifications").innerHTML = markup;
}
$("#markAllRead").addEventListener("click", () => {
  notifications = notifications.map(item => ({...item, read:true}));
  saveStore("aeis_notifications", notifications);
  renderNotifications();
  showToast("All notifications marked as read.");
});

function renderSettings() {
  const html = Object.entries(preferenceLabels).map(([key, label]) => `
    <div class="setting-row"><div><strong>${label}</strong><small>${key === "email" ? "Send important updates by email when connected." : "Show an alert when this activity is recorded."}</small></div>
    <button class="toggle ${notificationPrefs[key] ? "on" : ""}" data-pref="${key}" aria-label="${label}" aria-pressed="${!!notificationPrefs[key]}"></button></div>`).join("");
  $("#notificationSettings").innerHTML = html;
  $("#quickSettings").innerHTML = Object.entries(preferenceLabels).filter(([key]) => key !== "email").map(([key,label]) => `
    <div class="quick-setting"><span>${label.replace(" alerts","")}</span><button class="toggle ${notificationPrefs[key] ? "on" : ""}" data-pref="${key}" aria-label="${label}" aria-pressed="${!!notificationPrefs[key]}"></button></div>`).join("");
  $$("[data-pref]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.pref;
    notificationPrefs[key] = !notificationPrefs[key];
    saveStore("aeis_notification_prefs", notificationPrefs);
    renderSettings();
    showToast(`${preferenceLabels[key]} ${notificationPrefs[key] ? "enabled" : "disabled"}.`);
  }));
}

const categoryMeta = {
  schools: { title: "School", icon: "fa-school", table: "schoolsTable" },
  individuals: { title: "Free attendee", icon: "fa-user", table: "individualsTable" },
  institutions: { title: "Institution", icon: "fa-building-columns", table: "institutionsTable" },
  sponsors: { title: "Sponsorship", icon: "fa-handshake", table: "sponsorsTable" }
};
const fields = {
  schools: [["schoolName","School"],["contactPerson","Contact person"],["email","Email"],["phone","Phone"],["students","Students"],["date","Date"],["status","Status"]],
  individuals: [["name","Full name"],["email","Email"],["phone","Phone"],["category","Category"],["date","Date"],["status","Status"]],
  institutions: [["institutionName","Institution"],["representative","Representative"],["email","Email"],["phone","Phone"],["date","Date"],["status","Status"]],
  sponsors: [["organization","Organisation"],["contactPerson","Contact person"],["email","Email"],["phone","Phone"],["package","Package"],["type","Type"],["status","Status"]]
};
function getDisplay(record, key) {
  if (key === "date") return formatDate(record.date || record.createdAt);
  if (key === "status") return `<span class="status ${record.status === "Pending" ? "pending" : ""}">${escapeHTML(record.status || "New")}</span>`;
  return escapeHTML(record[key] ?? "—");
}
function renderTable(category, query = "") {
  const tbody = $(`#${categoryMeta[category].table}`);
  const headers = fields[category];
  const filtered = demoData[category].filter(record => JSON.stringify(record).toLowerCase().includes(query.toLowerCase()));
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td class="empty-row" colspan="${headers.length + 1}">No registrations found. Records will appear here when your form is connected.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(record => {
    const index = demoData[category].findIndex(item => item.id === record.id);
    return `<tr>${headers.map(([key]) => `<td>${getDisplay(record,key)}</td>`).join("")}<td><button class="view-button" data-view="${category}" data-index="${index}">View details</button></td></tr>`;
  }).join("");
}
function renderAllTables() {
  Object.keys(categoryMeta).forEach(category => {
    const search = $(`[data-search="${category}"]`);
    renderTable(category, search?.value || "");
  });
}
$$("[data-search]").forEach(input => input.addEventListener("input", () => renderTable(input.dataset.search, input.value)));
$("#globalSearch").addEventListener("input", event => {
  const value = event.target.value.trim();
  if (!value) return;
  const match = Object.keys(categoryMeta).find(category => demoData[category].some(record => JSON.stringify(record).toLowerCase().includes(value.toLowerCase())));
  if (match) {
    navigate(match);
    const search = $(`[data-search="${match}"]`);
    search.value = value;
    renderTable(match, value);
  }
});

function updateDashboard() {
  const counts = {
    schools: demoData.schools.length,
    individuals: demoData.individuals.length,
    institutions: demoData.institutions.length,
    sponsors: demoData.sponsors.length
  };
  $("#schoolTotal").textContent = counts.schools.toLocaleString();
  $("#individualTotal").textContent = counts.individuals.toLocaleString();
  $("#institutionTotal").textContent = counts.institutions.toLocaleString();
  $("#sponsorTotal").textContent = counts.sponsors.toLocaleString();
  $("#visitorTotal").textContent = readStore("aeis_visitor_count", 0).toLocaleString();
  $("#analyticsVisitors").textContent = $("#visitorTotal").textContent;
  $("#analyticsRegistrations").textContent = Object.values(counts).reduce((a,b)=>a+b,0).toLocaleString();
  $("#schoolsPageTotal").textContent = counts.schools;
  $("#individualsPageTotal").textContent = counts.individuals;
  $("#institutionsPageTotal").textContent = counts.institutions;
  $("#sponsorsPageTotal").textContent = counts.sponsors;
  $("#sponsorsPendingTotal").textContent = demoData.sponsors.filter(item => (item.status || "Pending") === "Pending").length;
  ["schools","individuals","institutions"].forEach(category => {
    const thisMonth = demoData[category].filter(item => {
      const date = new Date(item.date || item.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    $(`#${category}NewTotal`).textContent = thisMonth;
  });
  $("#schoolNavCount").textContent = counts.schools;
  $("#individualNavCount").textContent = counts.individuals;
  $("#institutionNavCount").textContent = counts.institutions;
  $("#sponsorNavCount").textContent = counts.sponsors;
  renderAllTables();
  drawChart("registrationChart", Number($("#trendRange").value));
  drawChart("analyticsChart", 6);
}
function drawChart(canvasId, months) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  const w = rect.width, h = rect.height;
  const light = document.body.classList.contains("light-mode");
  const muted = light ? "#697789" : "#91a9bf";
  const grid = light ? "#e8dfc9" : "#1d4263";
  const pad = {l:36,r:12,t:12,b:26};
  const cw = w-pad.l-pad.r, ch = h-pad.t-pad.b;
  const labels = months === 3 ? ["Apr","May","Jun"] : months === 12 ? ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"] : ["Jan","Feb","Mar","Apr","May","Jun"];
  const sets = [
    {name:"Schools",color:"#168dff",values:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {name:"Individuals",color:"#05c9ee",values:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {name:"Institutions",color:"#a855f7",values:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {name:"Sponsors",color:"#e4b64b",values:[0,0,0,0,0,0,0,0,0,0,0,0]}
  ];
  const maxValue = Math.max(5,...sets.flatMap(s=>s.values));
  ctx.font = "10px Inter, sans-serif";
  for(let i=0;i<=4;i++){
    const y=pad.t+(ch/4)*i;
    ctx.strokeStyle=grid;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();
    ctx.fillStyle=muted;ctx.textAlign="right";ctx.fillText(String(Math.round(maxValue*(4-i)/4)),pad.l-7,y+3);
  }
  sets.forEach(set=>{
    ctx.strokeStyle=set.color;ctx.lineWidth=2.3;ctx.beginPath();
    const offset = 12-labels.length;
    labels.forEach((label,i)=>{
      const x=pad.l+(labels.length===1?cw/2:(cw/(labels.length-1))*i);
      const y=pad.t+ch-(set.values[i+offset]||0)/maxValue*ch;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.stroke();
  });
  labels.forEach((label,i)=>{
    const x=pad.l+(labels.length===1?cw/2:(cw/(labels.length-1))*i);
    ctx.fillStyle=muted;ctx.textAlign="center";ctx.fillText(label,x,h-6);
  });
}
$("#trendRange").addEventListener("change", () => drawChart("registrationChart", Number($("#trendRange").value)));
window.addEventListener("resize", () => { drawChart("registrationChart", Number($("#trendRange").value)); drawChart("analyticsChart",6); });

function openRecord(category,index) {
  const record = demoData[category][index];
  if (!record) return;
  currentRecord = {category,index,id:record.id};
  $("#recordModalTitle").textContent = `${categoryMeta[category].title} registration`;
  $("#recordDetails").innerHTML = `<div class="detail-list">${Object.entries(record).filter(([key])=>key!=="id").map(([key,value])=>`<div class="detail-item"><small>${escapeHTML(key.replace(/([A-Z])/g," $1"))}</small><strong>${escapeHTML(value)}</strong></div>`).join("")}</div>`;
  $("#recordModal").classList.add("open");
}
document.addEventListener("click", event => {
  const button = event.target.closest("[data-view]");
  if (button) openRecord(button.dataset.view, Number(button.dataset.index));
});
function closeModal() { $("#recordModal").classList.remove("open"); currentRecord=null; }
$("#closeRecordModal").addEventListener("click",closeModal);
$("#closeRecordButton").addEventListener("click",closeModal);
$("#recordModal").addEventListener("click",event=>{if(event.target.id==="recordModal")closeModal();});
$("#deleteRecordButton").addEventListener("click",()=>{
  if(!currentRecord)return;
  const {category,index}=currentRecord;
  if(!confirm("Delete this registration from this browser's demo records?"))return;
  const removed=demoData[category].splice(index,1)[0];
  persistData(category);
  addNotification(`${categoryMeta[category].title} record deleted`,removed.name||removed.schoolName||removed.organization||removed.institutionName||"A registration record was removed.","fa-trash","general");
  closeModal();updateDashboard();renderNotifications();showToast("Demo record deleted.");
});

function exportCSV(category) {
  const records=demoData[category];
  if(!records.length){showToast("There are no records to export yet.");return;}
  const headers=[...new Set(records.flatMap(record=>Object.keys(record)))];
  const csv=[headers.join(","),...records.map(record=>headers.map(key=>`"${String(record[key]??"").replace(/"/g,'""')}"`).join(","))].join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download=`aeis-2027-${category}.csv`;link.click();URL.revokeObjectURL(url);
  showToast("CSV export downloaded.");
}
$$("[data-export]").forEach(button=>button.addEventListener("click",()=>exportCSV(button.dataset.export)));

// Integration example for your existing forms:
// After a successful API save, call addRegistration("individuals", {name,email,phone,category}).
// Supported categories: schools, individuals, institutions, sponsors.
function addRegistration(category, record) {
  if (!demoData[category]) throw new Error("Unknown registration category");
  const saved = {...record,id:record.id||crypto.randomUUID?.()||String(Date.now()),date:record.date||new Date().toISOString(),status:record.status||"New"};
  demoData[category].unshift(saved);
  persistData(category);
  const label = saved.name||saved.schoolName||saved.organization||saved.institutionName||"New registration";
  addNotification(`New ${categoryMeta[category].title} registration`,`${label} has submitted a registration.`,categoryMeta[category].icon,category);
  updateDashboard();
  renderNotifications();
}
window.addRegistration = addRegistration;

function init() {
  loadData();
  setTheme(readStore("aeis_theme","dark")==="light");
  renderSettings();
  renderNotifications();
  updateDashboard();
  // Visitor tracking is intentionally not incremented here. A page refresh should not be
  // counted as a unique visitor; record visits through a backend analytics endpoint.
}
init();