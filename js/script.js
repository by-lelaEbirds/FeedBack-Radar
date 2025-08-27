// Faz: coleta feedbacks, salva no localstorage, mostra lista e grafico
(function(){
  const form = document.getElementById('feedbackForm');
  const listEl = document.getElementById('feedbackList');
  const chartCanvas = document.getElementById('chartCanvas');
  const themeBtn = document.getElementById('themeBtn');
  const matrixCanvas = document.getElementById('matrixCanvas');

  let feedbacks = JSON.parse(localStorage.getItem('feedbacks_v3')) || [];

  function saveAndRender(){
    localStorage.setItem('feedbacks_v3', JSON.stringify(feedbacks));
    renderList();
    renderChart();
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const nota = parseInt(document.getElementById('nota').value);
    const comentario = document.getElementById('comentario').value.trim();
    if(!nome || !nota){ alert('Preencha nome e nota'); return; }
    feedbacks.push({ id: Date.now().toString(36), nome, nota, comentario, created: Date.now() });
    saveAndRender();
    form.reset();
  });

  document.getElementById('clearAll').addEventListener('click', ()=>{
    if(!confirm('Remover todos os feedbacks?')) return;
    feedbacks = [];
    saveAndRender();
  });

  document.querySelector('.filters').addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-filter]');
    if(!btn) return;
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });

  function renderList(){
    const active = document.querySelector('.filter.active').dataset.filter;
    listEl.innerHTML = '';
    const filtered = feedbacks.slice().reverse().filter(f=>{
      if(active === '4-5') return f.nota >= 4;
      return true;
    });
    filtered.forEach(f=>{
      const li = document.createElement('li');
      li.className = 'feedback-item';
      const left = document.createElement('div'); left.className='left';
      left.innerHTML = '<strong>'+escapeHtml(f.nome)+'</strong><p>'+escapeHtml(f.comentario||'')+'</p>';
      const right = document.createElement('div'); right.className='meta';
      right.innerHTML = '<span class="nota">Nota: <strong>'+f.nota+'</strong></span><br><small>'+new Date(f.created).toLocaleString()+'</small><br><div class="actions"><button class="btn" data-id="'+f.id+'" data-action="edit">Editar</button><button class="btn" data-id="'+f.id+'" data-action="delete">Excluir</button></div>';
      li.appendChild(left); li.appendChild(right);
      listEl.appendChild(li);
    });
  }

  listEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if(action === 'delete'){
      if(!confirm('Excluir feedback?')) return;
      feedbacks = feedbacks.filter(f=>f.id !== id);
      saveAndRender();
    } else if(action === 'edit'){
      const f = feedbacks.find(x=>x.id===id);
      const novo = prompt('Editar comentário', f.comentario||'');
      if(novo!==null){ f.comentario = novo; saveAndRender(); }
    }
  });

  let chart=null;
  function renderChart(){
    const counts = [1,2,3,4,5].map(n=> feedbacks.filter(f=>f.nota===n).length);
    if(chart) chart.destroy();
    chart = new Chart(chartCanvas.getContext('2d'), {
      type:'bar',
      data:{ labels:['1','2','3','4','5'], datasets:[{ label:'Quantidade', data:counts, backgroundColor:['#ef4444','#f97316','#facc15','#10b981','#06b6d4'] }]},
      options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  let matrixAnim=null, matrixCtx=null, cols=0, drops=[];
  function startMatrix(){
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    matrixCtx = matrixCanvas.getContext('2d');
    const fontSize = 14;
    cols = Math.floor(matrixCanvas.width / fontSize);
    drops = Array(cols).fill(1);
    matrixCtx.font = fontSize+'px monospace';
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポ0123456789@#$%^&*';
    function draw(){
      matrixCtx.fillStyle = 'rgba(0,0,0,0.05)';
      matrixCtx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
      matrixCtx.fillStyle = '#00ff88';
      for(let i=0;i<cols;i++){
        const text = chars[Math.floor(Math.random()*chars.length)];
        matrixCtx.fillText(text, i*fontSize, drops[i]*fontSize);
        if(drops[i]*fontSize > matrixCanvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      }
    }
    matrixAnim = setInterval(draw, 45);
  }
  function stopMatrix(){ if(matrixAnim) clearInterval(matrixAnim); if(matrixCtx) matrixCtx.clearRect(0,0,matrixCanvas.width,matrixCanvas.height); }

  themeBtn.addEventListener('click', ()=>{
    const app = document.querySelector('.app');
    app.classList.toggle('hacker');
    if(app.classList.contains('hacker')) startMatrix(); else stopMatrix();
  });

  window.addEventListener('resize', ()=>{ if(document.querySelector('.app').classList.contains('hacker')){ stopMatrix(); startMatrix(); } });

  renderList(); renderChart();
})();
