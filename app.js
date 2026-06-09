// ============================================
//  STUDYMATE AI — app.js
// ============================================

/* ---- Navbar scroll effect + hamburger ---- */
(function initNav() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === page || (page === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
})();

/* ---- Animate progress bars on scroll ---- */
(function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-fill[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
})();

/* ---- Animate circle progress rings ---- */
(function animateCircles() {
  const circles = document.querySelectorAll('.circle-prog[data-pct]');
  if (!circles.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circle = entry.target;
        const pct = parseFloat(circle.dataset.pct);
        const r = parseFloat(circle.getAttribute('r'));
        const circ = 2 * Math.PI * r;
        circle.style.strokeDasharray = circ;
        circle.style.strokeDashoffset = circ - (pct / 100) * circ;
        observer.unobserve(circle);
      }
    });
  }, { threshold: 0.3 });

  circles.forEach(c => {
    const r = parseFloat(c.getAttribute('r'));
    const circ = 2 * Math.PI * r;
    c.style.strokeDasharray = circ;
    c.style.strokeDashoffset = circ;
    observer.observe(c);
  });
})();

/* ---- Animate KPI counters ---- */
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = el.dataset.suffix ? value + el.dataset.suffix : value;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.count));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ---- Bar Chart (Dashboard) ---- */
(function drawBarChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    thisWeek: [65, 80, 55, 90, 72, 85, 68],
    lastWeek: [50, 60, 70, 65, 58, 75, 52]
  };

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const padLeft = 40, padBottom = 30, padTop = 20, padRight = 10;
  const chartW = W - padLeft - padRight;
  const chartH = H - padBottom - padTop;
  const groups = data.labels.length;
  const groupW = chartW / groups;
  const barW = groupW * 0.3;

  function drawGrid() {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + chartH - (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + chartW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(i * 25 + '%', padLeft - 6, y + 4);
    }
  }

  function drawBars(animate = true) {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    data.labels.forEach((label, i) => {
      const gx = padLeft + i * groupW + groupW * 0.05;

      // Last week bar
      const lh = (data.lastWeek[i] / 100) * chartH * (animate ? 1 : 0);
      const grad1 = ctx.createLinearGradient(0, padTop + chartH - lh, 0, padTop + chartH);
      grad1.addColorStop(0, 'rgba(6,182,212,0.7)');
      grad1.addColorStop(1, 'rgba(6,182,212,0.2)');
      ctx.fillStyle = grad1;
      roundRect(ctx, gx, padTop + chartH - lh, barW, lh, 5);

      // This week bar
      const th = (data.thisWeek[i] / 100) * chartH;
      const grad2 = ctx.createLinearGradient(0, padTop + chartH - th, 0, padTop + chartH);
      grad2.addColorStop(0, '#2563eb');
      grad2.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad2;
      roundRect(ctx, gx + barW + 3, padTop + chartH - th, barW, th, 5);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, gx + barW, padTop + chartH + 18);
    });

    // Legend
    ctx.fillStyle = '#2563eb'; ctx.fillRect(W - 120, 8, 12, 8);
    ctx.fillStyle = 'rgba(6,182,212,0.7)'; ctx.fillRect(W - 60, 8, 12, 8);
    ctx.fillStyle = '#475569'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('This week', W - 104, 17);
    ctx.fillText('Last week', W - 44, 17);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  // Animate on intersection
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 0.05, 1);
        ctx.clearRect(0, 0, W, H);
        drawGrid();
        data.labels.forEach((label, i) => {
          const gx = padLeft + i * groupW + groupW * 0.05;
          const lh = (data.lastWeek[i] / 100) * chartH * progress;
          const grad1 = ctx.createLinearGradient(0, padTop + chartH - lh, 0, padTop + chartH);
          grad1.addColorStop(0, 'rgba(6,182,212,0.7)');
          grad1.addColorStop(1, 'rgba(6,182,212,0.2)');
          ctx.fillStyle = grad1;
          roundRect(ctx, gx, padTop + chartH - lh, barW, lh, 5);

          const th = (data.thisWeek[i] / 100) * chartH * progress;
          const grad2 = ctx.createLinearGradient(0, padTop + chartH - th, 0, padTop + chartH);
          grad2.addColorStop(0, '#2563eb');
          grad2.addColorStop(1, '#06b6d4');
          ctx.fillStyle = grad2;
          roundRect(ctx, gx + barW + 3, padTop + chartH - th, barW, th, 5);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, gx + barW, padTop + chartH + 18);
        });

        ctx.fillStyle = '#2563eb'; ctx.fillRect(W - 120, 8, 12, 8);
        ctx.fillStyle = 'rgba(6,182,212,0.7)'; ctx.fillRect(W - 60, 8, 12, 8);
        ctx.fillStyle = '#475569'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('This week', W - 104, 17);
        ctx.fillText('Last week', W - 44, 17);

        if (progress >= 1) clearInterval(interval);
      }, 25);
      observer.unobserve(canvas);
    }
  }, { threshold: 0.3 });
  observer.observe(canvas);
})();

/* ---- Performance Radar (Career Page) ---- */
(function drawRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 40;

  const labels = ['Analytical', 'Creative', 'Technical', 'Communication', 'Problem Solving', 'Research'];
  const values = [88, 72, 85, 78, 90, 80];
  const N = labels.length;

  function getPoint(i, radius) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Rings
    [0.2, 0.4, 0.6, 0.8, 1].forEach(scale => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p = getPoint(i, r * scale);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Spokes
    for (let i = 0; i < N; i++) {
      const p = getPoint(i, r);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    values.forEach((v, i) => {
      const p = getPoint(i, r * (v / 100));
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(37,99,235,0.5)');
    grad.addColorStop(1, 'rgba(6,182,212,0.2)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    values.forEach((v, i) => {
      const p = getPoint(i, r * (v / 100));
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#2563eb'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    });

    // Labels
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const p = getPoint(i, r + 22);
      ctx.fillText(label, p.x, p.y + 4);
    });
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { draw(); observer.unobserve(canvas); }
  }, { threshold: 0.3 });
  observer.observe(canvas);
})();

/* ---- Pathway Tabs (Career Page) ---- */
(function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.pathway-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) { panel.style.display = 'grid'; }
    });
  });
  // Show first panel by default
  if (panels.length) panels[0].style.display = 'grid';
})();

/* ---- Fade-up on scroll for cards ---- */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.feature-card, .student-card, .career-card, .pathway-card, .metric-card, .kpi-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s, box-shadow 0.25s`;
    observer.observe(card);
  });
})();

/* ---- Dynamic date on dashboard ---- */
(function setDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
})();
