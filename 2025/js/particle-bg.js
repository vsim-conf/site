/* Particle background for #top — v1.0
   Derived from the full simulation in index.html, with UI removed. */  // :contentReference[oaicite:1]{index=1}

(() => {
  /* ==== CONFIG ==================================================== */
  const COLORS = [ '#f33', '#3f3', '#39f', '#ff3', '#f6c' ];   // 5 colours
  const N_PER  = 150;                                         // 150 × 5 = 750 particles total
  const RANGE  = 200;                                         // cut-off distance for forces
  const RAD    = 3;                                           // render radius
  const DAMP   = 0.95, SPEED = 0.05, MIN_DIST = RAD*2;
  const W = 1920, H = 650;                                    // canvas size (Px)

  /* ==== helpers =================================================== */
  const torusDelta = (a,b,s) => { let d = b - a; if (d >  s/2) d -= s;
                                                if (d < -s/2) d += s; return d; };

  /* ==== canvas setup ============================================== */
  const cvs = document.getElementById('top-bg');
  const ctx = cvs.getContext('2d');

  /* pixel-ratio safeguard (optional) */
  const dpr = window.devicePixelRatio || 1;
  cvs.width  = W * dpr;  cvs.height = H * dpr;
  ctx.scale(dpr,dpr);

  /* ==== interaction matrix (random each load) ===================== */
  const strength = {};
  COLORS.forEach((a,i) => COLORS.forEach((b,j) => {
    strength[`${i}-${j}`] = +(Math.random()*2-1).toFixed(1);  // −1.0 … +1.0
  }));

  /* ==== particle class ============================================ */
  class P {
    constructor(col){
      /* rejection-sample so they don’t spawn overlapped */
      for(let tries=0; ; tries++){
        const x = Math.random()*W, y = Math.random()*H;
        if (particles.every(p => Math.hypot(torusDelta(x,p.x,W),torusDelta(y,p.y,H)) >= MIN_DIST) || tries>400) {
          this.x=x; this.y=y; break;
        }
      }
      this.vx = this.vy = 0;
      this.c  = col;               // colour index 0–4
    }
  }

  /* ==== population =============================================== */
  const particles = [];
  COLORS.forEach((_,ci) => { for(let i=0;i<N_PER;i++) particles.push(new P(ci)); });

  /* ==== core loop ================================================= */
  function step() {
    /* physics ----------------------------------------------------- */
    particles.forEach(p => {
      let ax=0, ay=0;
      particles.forEach(q => {
        if (p === q) return;
        const dx = torusDelta(p.x,q.x,W), dy = torusDelta(p.y,q.y,H),
              d  = Math.hypot(dx,dy);
        if (d && d < RANGE){
          const f = strength[`${p.c}-${q.c}`]*(1 - d/RANGE);  // linear fall-off
          ax += f * dx/d;  ay += f * dy/d;
        }
      });
      p.vx = (p.vx + ax*SPEED)*DAMP;
      p.vy = (p.vy + ay*SPEED)*DAMP;
    });
    particles.forEach(p=>{
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });

    /* simple separation to avoid clumps -------------------------- */
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j],
              dx=torusDelta(a.x,b.x,W), dy=torusDelta(a.y,b.y,H),
              d = Math.hypot(dx,dy);
        if (d && d < MIN_DIST){
          const o = (MIN_DIST-d)/2, ux=dx/d, uy=dy/d;
          a.x = (a.x - ux*o + W)%W;  a.y = (a.y - uy*o + H)%H;
          b.x = (b.x + ux*o + W)%W;  b.y = (b.y + uy*o + H)%H;
        }
      }
    }

    /* render ------------------------------------------------------ */
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      ctx.fillStyle = COLORS[p.c];
      ctx.beginPath(); ctx.arc(p.x,p.y,RAD,0,Math.PI*2); ctx.fill();
    });

    requestAnimationFrame(step);
  }

  /* ==== boot ====================================================== */
  requestAnimationFrame(step);
})();

