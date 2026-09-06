/* NEXUS — animated 3D-style background. Zero dependencies: works offline & from file:// */
(function () {
  /* ---------- nav + reveals (always run) ---------- */
  var nav = document.querySelector('.nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  document.querySelectorAll('.block h2, .card, .stat, .code-card, .cta-footer h2')
    .forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- canvas setup ---------- */
  var canvas = document.getElementById('scene');
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, S;
  function resize() {
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    S = Math.min(W, H) / 6.5;
  }
  resize();
  addEventListener('resize', function () { resize(); if (reduce) frame(2); });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- geometry ---------- */
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function edgesOf(v, th) {
    var e = [];
    for (var i = 0; i < v.length; i++) for (var j = i + 1; j < v.length; j++)
      if (Math.hypot(v[i][0]-v[j][0], v[i][1]-v[j][1], v[i][2]-v[j][2]) < th) e.push([i, j]);
    return e;
  }
  var t = (1 + Math.sqrt(5)) / 2;
  var icoV = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
  var icoE = edgesOf(icoV, 1.1);
  var octV = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  var octE = edgesOf(octV, 1.5);
  var tetV = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(norm);
  var tetE = edgesOf(tetV, 2);
  var knotP = []; for (var i = 0; i <= 120; i++) { var u = i / 120 * Math.PI * 2, r = (2 + Math.cos(3 * u)) * .45; knotP.push([r * Math.cos(2 * u), r * Math.sin(2 * u), Math.sin(3 * u) * .5]); }
  var ringP = []; for (i = 0; i <= 64; i++) { u = i / 64 * Math.PI * 2; ringP.push([Math.cos(u), Math.sin(u), 0]); }

  var shapes = [
    { p: icoV, e: icoE, x: -2.4, y: 0.8,  z: 0,    s: 1.15, c: 0, rx: .5,  ry: .6 },
    { p: icoV, e: icoE, x: -2.4, y: 0.8,  z: 0,    s: 1.35, c: 1, rx: -.3, ry: .4, dim: true },
    { p: knotP, poly: 1, x: 2.2, y: -0.4, z: -0.5, s: 0.95, c: 1, rx: .4,  ry: .5 },
    { p: octV, e: octE, x: 0.4, y: 1.8,  z: -1.2, s: 0.8,  c: 3, rx: .6,  ry: .4 },
    { p: tetV, e: tetE, x: -0.6, y: -1.6, z: -0.8, s: 0.9,  c: 0, rx: .5,  ry: .7 },
    { p: ringP, poly: 1, x: 1.8, y: 1.4,  z: -0.4, s: 0.8,  c: 2, rx: .7,  ry: .3 }
  ];

  /* particles (screen-space) */
  var dots = [];
  for (i = 0; i < 130; i++) dots.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .4, v: Math.random() * .0004 + .0001 });

  /* ---------- interaction ---------- */
  var mx = 0, my = 0, tmx = 0, tmy = 0, scr = 0;
  addEventListener('mousemove', function (e) {
    tmx = (e.clientX / innerWidth - .5) * 2;
    tmy = -(e.clientY / innerHeight - .5) * 2;
  });
  addEventListener('scroll', function () { scr = scrollY; }, { passive: true });

  /* ---------- theme ---------- */
  var PAL = {
    dark:  ['#8B6CFF', '#4FE7FF', '#FF5FAE', '#E8E8FF'],
    light: ['#6D4AFF', '#0891B2', '#D23B8C', '#3A3A55']
  };
  var cols = PAL.dark, dotCol = 'rgba(255,255,255,.5)', glow = true;
  function setTheme(light) {
    cols = light ? PAL.light : PAL.dark;
    dotCol = light ? 'rgba(20,20,40,.35)' : 'rgba(255,255,255,.5)';
    glow = !light;
    if (reduce) frame(2);
  }
  setTheme(window.__isLight());
  addEventListener('themechange', function (e) { setTheme(e.detail.light); });

  /* ---------- render ---------- */
  function rot(p, ax, ay) {
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
    return [x, y * cx - z * sx, y * sx + z * cx];
  }

  function frame(time) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over';

    /* particles */
    ctx.shadowBlur = 0;
    ctx.fillStyle = dotCol;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.y -= d.v * 16; if (d.y < 0) d.y = 1;
      ctx.beginPath();
      ctx.arc(d.x * W + mx * 20 * DPR, d.y * H + my * 14 * DPR, d.r * DPR, 0, 7);
      ctx.fill();
    }

    /* shapes */
    var camZ = Math.min(scr / 900, 1.4) * DPR;      /* scroll pulls camera back */
    var px = mx * .35, py = -my * .25;              /* parallax */
    for (var sI = 0; sI < shapes.length; sI++) {
      var sh = shapes[sI];
      var ax = time * sh.rx + my * .35, ay = time * sh.ry + mx * .5;
      var pts = [];
      for (i = 0; i < sh.p.length; i++) {
        var q = rot(sh.p[i], ax, ay);
        q[0] = (q[0] + sh.x + px) * sh.s;
        q[1] = (q[1] + sh.y + py + Math.sin(time * .6 + sI) * .07) * sh.s;
        q[2] = (q[2] + sh.z) * sh.s + camZ;
        var f = 3 / (3 + q[2]);
        pts.push([W / 2 + q[0] * S * f, H / 2 - q[1] * S * f]);
      }
      ctx.strokeStyle = cols[sh.c];
      ctx.globalAlpha = sh.dim ? .35 : .9;
      ctx.lineWidth = (sh.dim ? 1 : 1.4) * DPR;
      ctx.shadowColor = cols[sh.c];
      ctx.shadowBlur = glow ? 16 * DPR : 0;
      ctx.beginPath();
      if (sh.poly) {
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      } else {
        for (i = 0; i < sh.e.length; i++) {
          ctx.moveTo(pts[sh.e[i][0]][0], pts[sh.e[i][0]][1]);
          ctx.lineTo(pts[sh.e[i][1]][0], pts[sh.e[i][1]][1]);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  var start = performance.now();
  function tick(now) {
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    frame((now - start) / 1000);
    requestAnimationFrame(tick);
  }
  reduce ? frame(2) : requestAnimationFrame(tick);
})();