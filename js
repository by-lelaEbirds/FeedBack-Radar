const feedbackForm = document.getElementById("feedbackForm");
const feedbackList = document.getElementById("feedbackList");
const clearAllBtn = document.getElementById("clearAll");
const themeBtn = document.getElementById("themeBtn");
const filters = document.querySelectorAll(".filter");
const chartCanvas = document.getElementById("chartCanvas");
const matrixCanvas = document.getElementById("matrixCanvas");
const ctx = chartCanvas.getContext("2d");

let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
let chart;

// ---- Render Feedback List ----
function renderFeedbacks(filter="all") {
  feedbackList.innerHTML = "";
  let filtered = feedbacks;
  if(filter==="4-5") filtered = feedbacks.filter(f=>f.nota>=4);

  filtered.forEach((f,i)=>{
    const li=document.createElement("li");
    li.className="feedback-item";
    li.innerHTML=`
      <strong>${f.nome}</strong> — Nota ${f.nota}
      <p>${f.comentario||""}</p>
      <button class="btn" onclick="editFeedback(${i})">Editar</button>
      <button class="btn danger" onclick="deleteFeedback(${i})">Excluir</button>
    `;
    feedbackList.appendChild(li);
  });
  updateChart();
}

// ---- Submit ----
feedbackForm.addEventListener("submit", e=>{
  e.preventDefault();
  const nome=document.getElementById("nome").value;
  const nota=parseInt(document.getElementById("nota").value);
  const comentario=document.getElementById("comentario").value;
  feedbacks.push({nome,nota,comentario});
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  feedbackForm.reset();
  renderFeedbacks();
});

// ---- Edit/Delete ----
window.editFeedback=index=>{
  const f=feedbacks[index];
  document.getElementById("nome").value=f.nome;
  document.getElementById("nota").value=f.nota;
  document.getElementById("comentario").value=f.comentario;
  feedbacks.splice(index,1);
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  renderFeedbacks();
};
window.deleteFeedback=index=>{
  feedbacks.splice(index,1);
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  renderFeedbacks();
};

// ---- Clear All ----
clearAllBtn.addEventListener("click",()=>{
  if(confirm("Apagar todos os feedbacks?")){
    feedbacks=[];
    localStorage.removeItem("feedbacks");
    renderFeedbacks();
  }
});

// ---- Filters ----
filters.forEach(btn=>{
  btn.addEventListener("click",()=>{
    filters.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    renderFeedbacks(btn.dataset.filter);
  });
});

// ---- Chart ----
function updateChart(){
  const counts=[0,0,0,0,0];
  feedbacks.forEach(f=>counts[f.nota-1]++);
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:"bar",
    data:{ labels:["1","2","3","4","5"], datasets:[{ label:"Feedbacks", data:counts, backgroundColor:"#0dcaf0" }] },
    options:{ scales:{ y:{ beginAtZero:true }}}
  });
}

// ---- Theme Toggle ----
let themeState=0; // 0=light,1=dark,2=hacker
themeBtn.addEventListener("click",()=>{
  document.body.classList.remove("dark-theme");
  document.querySelector(".app").classList.remove("hacker");
  if(themeState===0){
    document.body.classList.add("dark-theme");
    themeState=1;
  } else if(themeState===1){
    document.querySelector(".app").classList.add("hacker");
    themeState=2;
    startMatrix();
  } else {
    themeState=0;
  }
});

// ---- Matrix Effect ----
function startMatrix(){
  const ctxM=matrixCanvas.getContext("2d");
  matrixCanvas.width=window.innerWidth;
  matrixCanvas.height=window.innerHeight;
  const letters="アカサタナハマヤラワ0123456789".split("");
  const fontSize=14;
  const columns=matrixCanvas.width/fontSize;
  const drops=Array.from({length:columns},()=>1);
  function draw(){
    ctxM.fillStyle="rgba(0,0,0,0.05)";
    ctxM.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
    ctxM.fillStyle="#0f0";
    ctxM.font=fontSize+"px monospace";
    for(let i=0;i<drops.length;i++){
      const text=letters[Math.floor(Math.random()*letters.length)];
      ctxM.fillText(text,i*fontSize,drops[i]*fontSize);
      if(drops[i]*fontSize>matrixCanvas.height&&Math.random()>0.975) drops[i]=0;
      drops[i]++;
    }
  }
  setInterval(draw,35);
}

renderFeedbacks();
