import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const fallbackProfile = {
  name: "J. Sai Gajendra",
  headline: "DATA ANALYST | POWER BI | DAX",
  tagline: "Turning Data into Insights & Decisions",
  location: "Bangalore, Karnataka",
  phone: "6305201697",
  email: "jsai6305@gmail.com",
  summary: "Data Research Analyst with 2.5 years of total professional experience, including 1 year 6 months in Data Research and 11 months in BPO. Skilled in data preparation, cleaning, validation, analysis, visualization, reporting, and dashboard development. Experienced with Power BI, DAX, Microsoft Excel, Google Sheets and SQL basics. Seeking opportunities as a Data Analyst.",
  skills: ["Power BI","DAX","Microsoft Excel","Google Sheets","Data Analysis","Data Cleaning","Data Validation","Data Quality","Basic SQL","Dashboard Development","KPI Development","Reporting"],
  experience: [
    {company:"SimpliAxis Solution", role:"Data Research Analyst", duration:"1 Year 6 Months", location:"Bangalore, Karnataka", bullets:["Prepared, cleaned and validated customer enquiry and lead datasets in Google Sheets.","Imported prepared data into Power BI and created charts, graphs, reports and dashboards.","Analyzed patterns, trends, discrepancies and data-quality issues.","Performed quality checks on source data, calculations and reporting outputs."]},
    {company:"Teleperformance", role:"BPO Associate", duration:"11 Months", location:"", bullets:["Handled customer queries and provided accurate information and appropriate resolutions.","Maintained customer information and followed standard operating procedures.","Developed communication, problem-solving and time-management skills."]}
  ],
  projects: [
    {title:"EdTech Lead, Revenue & Payment Analytics Dashboard", domain:"EdTech / Professional Certification", tools:"Power BI | DAX | Google Sheets | Excel | Claude AI", description:"Developed a live analytics and reporting dashboard for an EdTech business to analyze customer enquiries, leads, revenue, payments, and business performance for professional certification programs such as CSM, CSPO, RTE, and other IT certification courses.", bullets:["Prepared and maintained customer enquiry and lead data in Google Sheets.","Cleaned and validated datasets before analysis.","Built Power BI dashboards with KPI cards, charts, graphs, tables, and interactive filters.","Created DAX calculations for Total Leads, Total Revenue, and Total Payments.","Created current-month vs previous-month comparisons for business performance analysis.","Applied data filters to support different business analysis requirements."]}
  ],
  education: [{degree:"Bachelor of Computer Applications (BCA)", institution:"Vijayam Degree College", year:"2023"}],
  strengths:["Problem Solving","Analytical Thinking","Attention to Detail","Team Collaboration","Communication","Time Management"],
  resumeUrl:""
};

let profile = fallbackProfile;
let images = [];

async function loadPortfolioData(){
  if (firebaseConfig.projectId === "YOUR_PROJECT_ID") return;
  try {
    const snap = await getDoc(doc(db,"portfolio","public"));
    if (snap.exists()) profile = {...fallbackProfile,...snap.data()};
    const qs = query(collection(db,"portfolioImages"), orderBy("order","asc"));
    const ss = await getDocs(qs);
    images = ss.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ console.warn("Firebase portfolio data unavailable; using local fallback.",e); }
}

function text(id, value){ const el=document.getElementById(id); if(el && value!=null) el.textContent=value; }
function renderDynamicProfile(){
  text("dynamic-name", profile.name); text("dynamic-headline", profile.headline); text("dynamic-tagline", profile.tagline);
  document.querySelectorAll("[data-profile='name']").forEach(e=>e.textContent=profile.name);
  document.querySelectorAll("[data-profile='headline']").forEach(e=>e.textContent=profile.headline);
  document.querySelectorAll("[data-profile='tagline']").forEach(e=>e.textContent=profile.tagline);
  document.querySelectorAll("[data-profile='summary']").forEach(e=>e.textContent=profile.summary);
  document.querySelectorAll("[data-profile='email']").forEach(e=>{e.textContent=profile.email;e.href=`mailto:${profile.email}`});
  document.querySelectorAll("[data-profile='phone']").forEach(e=>{e.textContent=profile.phone;e.href=`tel:${profile.phone}`});
  document.querySelectorAll("[data-profile='location']").forEach(e=>e.textContent=profile.location);
  const resumeLinks=document.querySelectorAll("[data-profile='resume']");
  resumeLinks.forEach(e=>{ if(profile.resumeUrl) {e.href=profile.resumeUrl;e.target="_blank";} });
  const skills=document.querySelectorAll("[data-profile='skills']");
  skills.forEach(e=>e.innerHTML=(profile.skills||[]).map(s=>`<span class="skill-chip">${escapeHtml(s)}</span>`).join(""));
  if(images.length) renderImages();
}
function renderImages(){
  const host=document.querySelector("[data-profile='images']"); if(!host) return;
  host.innerHTML=images.map(i=>`<figure><img src="${i.url}" alt="${escapeHtml(i.title||'Power BI dashboard')}" loading="lazy"><figcaption>${escapeHtml(i.title||'Dashboard')}</figcaption></figure>`).join("");
}
function escapeHtml(v){return String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

function setupChat(){
  if(document.getElementById("ai-chat")) return;
  const root=document.createElement("div"); root.id="ai-chat"; root.innerHTML=`
  <button id="ai-open" class="ai-fab" aria-label="Open AI assistant">✦</button>
  <section id="ai-panel" class="ai-panel" aria-label="Sai AI Assistant">
    <div class="ai-head"><div><strong>Sai AI</strong><small>Portfolio Assistant</small></div><button id="ai-close">×</button></div>
    <div id="ai-messages" class="ai-messages"><div class="ai-msg bot">Hi! I’m Sai AI. Ask me about Sai’s experience, Power BI projects, skills, education, or contact details.</div></div>
    <form id="ai-form" class="ai-form"><input id="ai-input" autocomplete="off" placeholder="Ask me anything…"><button>Send</button></form>
  </section>`; document.body.appendChild(root);
  const panel=root.querySelector("#ai-panel"); root.querySelector("#ai-open").onclick=()=>panel.classList.add("open"); root.querySelector("#ai-close").onclick=()=>panel.classList.remove("open");
  root.querySelector("#ai-form").onsubmit=async e=>{e.preventDefault(); const input=root.querySelector("#ai-input"); const q=input.value.trim(); if(!q)return; addMsg(q,"user");input.value=""; const pending=addMsg("Thinking…","bot"); try{const token=await auth.currentUser?.getIdToken(); const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})},body:JSON.stringify({message:q})}); const data=await r.json(); pending.remove(); addMsg(data.answer||data.error||"Sorry, I couldn't answer that.","bot");}catch(err){pending.remove();addMsg("The AI service is not connected yet. Please try again after the backend is deployed.","bot");}};
  function addMsg(t,c){const d=document.createElement("div");d.className=`ai-msg ${c}`;d.textContent=t;root.querySelector("#ai-messages").appendChild(d);root.querySelector("#ai-messages").scrollTop=999999;return d;}
}

async function boot(){ await loadPortfolioData(); renderDynamicProfile(); setupChat(); }
boot();

// Expose admin helpers to admin.html.
window.portfolioFirebase = {app,auth,db,storage,ADMIN_EMAIL,profile,signInWithEmailAndPassword,signOut,onAuthStateChanged,setDoc,doc,ref,uploadBytes,getDownloadURL,deleteObject,collection,getDocs,query,orderBy};
