// @ts-nocheck: ported as-is from the motion prototype; typed once the direction is settled
// The MyFrontier card: a tour of the app built from the published screens and the project's
// Lottie files. Inside the app every move is the shipped iOS behavior; only the loop seam
// runs through the site's dot grid.
import lottie from 'lottie-web/build/player/lottie_light'

const BASE = '/motion/myfrontier/'
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = ms => new Promise(r => setTimeout(r, ms));
const outCubic = 'cubic-bezier(.2,.7,.2,1)', inOut = 'cubic-bezier(.7,0,.2,1)', push = 'cubic-bezier(.32,.72,0,1)';


// Published screens: status bar color behind the old notch, and the color of its time and icons
const SCREENS = {
  'intro-1': ['#ff033a', '#fff'], 'intro-2': ['#161a29', '#fff'],
  'dashboard-1': ['#151a28', '#fff'], 'bill-pay-1': ['#ffffff', '#0B0F1A'], 'bill-pay-4': ['#f6f6f7', '#0B0F1A'],
  'support-1': ['#ffffff', '#0B0F1A'], 'support-2': ['#161a29', '#fff'], 'support-3': ['#161a29', '#fff'], 'support-4': ['#161a29', '#fff'],
};
// Bottom sheets: the screen that holds the sheet, and where its card starts
const SHEETS = { 'bill-pay-2': 0.312, 'bill-pay-3': 0.266 };
// Tap targets as fractions of the screen
const T = {
  faceId: [0.87, 0.56], makePayment: [0.5, 0.623],
  method: [0.5, 0.757], selectMethod: [0.5, 0.776], date: [0.5, 0.675], day14: [0.6, 0.578], selectDate: [0.5, 0.863],
  pay: [0.5, 0.847], supportTab: [0.62, 0.935], order: [0.5, 0.67],
};
const icons = c => `<svg class="sb r" viewBox="0 0 68 14" aria-hidden="true" fill="${c}"><rect x="0" y="9" width="3" height="4.5" rx=".8"/><rect x="4.6" y="6.5" width="3" height="7" rx=".8"/><rect x="9.2" y="4" width="3" height="9.5" rx=".8"/><rect x="13.8" y="1.5" width="3" height="12" rx=".8"/><path d="M29.5 3.2a12 12 0 0 1 8.3 3.3l1.3-1.3a13.9 13.9 0 0 0-19.2 0l1.3 1.3a12 12 0 0 1 8.3-3.3Zm0 3.8a8 8 0 0 1 5.6 2.3l1.3-1.3a9.9 9.9 0 0 0-13.8 0l1.3 1.3A8 8 0 0 1 29.5 7Zm0 3.8a4 4 0 0 1 2.9 1.2l-2.9 2.9-2.9-2.9a4 4 0 0 1 2.9-1.2Z"/><rect x="43.5" y="1.5" width="21" height="11" rx="3.2" fill="none" stroke="${c}" stroke-opacity=".4" stroke-width="1"/><rect x="45.3" y="3.3" width="17.4" height="7.4" rx="1.8"/><path d="M65.7 5.2v3.6a1.9 1.9 0 0 0 0-3.6Z" fill-opacity=".45"/></svg>`;

const TEMPLATE = `  <div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="phone">
    
    <div class="band"><div class="bezel"><div class="screen">
      <div class="stack"></div>
      <div class="dim"></div>
      <div class="sheets"></div>
      <canvas class="dots" aria-hidden="true"></canvas>
      <div class="wash"></div>
      <div class="lottie intro" data-l="Intro"></div>
      <div class="lottie" data-l="Coin"></div>
      <div class="lottie" data-l="Confirmation"></div>
      <div class="spin" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.25" transform="rotate(0 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.32" transform="rotate(30 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.39" transform="rotate(60 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.45" transform="rotate(90 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.52" transform="rotate(120 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.59" transform="rotate(150 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.66" transform="rotate(180 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.73" transform="rotate(210 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.80" transform="rotate(240 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.86" transform="rotate(270 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.93" transform="rotate(300 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="1.00" transform="rotate(330 12 12)"/></svg></div>
      <div class="tap"></div>
      <div class="sheen" aria-hidden="true"></div>
      <div class="island"><div class="fid" data-l="FaceID"></div></div>
    </div></div></div>
  </div>`

// Builds the phone screen inside art and loops the tour while it is on screen. Returns a stop function
export function mountMyFrontier(art) {
  art.insertAdjacentHTML('beforeend', TEMPLATE);
  const reduced_ = reduced();
  const $ = s => art.querySelector(s), stack = $('.stack'), sheets = $('.sheets');
  const L = {};
  const layer = (name, parent, cls = '') => {
    const d = document.createElement('div'); d.className = 'layer ' + cls; d.style.opacity = 0;
    const [bg, fg] = SCREENS[name] || ['#fff', '#000'];
    d.innerHTML = `<img class="view" src="${BASE}screens/${name}.webp" alt=""><div class="notch" style="background:${bg}"></div><img class="sb l" src="${BASE}screens/${name}-t.png" alt="">${icons(fg)}`;
    parent.appendChild(d); return d;
  };
  Object.keys(SCREENS).forEach(n => L[n] = layer(n, stack));
  Object.entries(SHEETS).forEach(([n, top]) => { const s = layer(n, sheets, 'sheet'); s.style.clipPath = `inset(${top * 100}% 0 0 0)`; s.style.opacity = 1; s.style.transform = 'translateY(100%)'; L[n] = s; });
  L['intro-1'].insertAdjacentHTML('beforeend', '<div class="logo-cover"></div>');
  L['dashboard-1'].querySelector('img.view').alt = 'MyFrontier home: Good afternoon, Nick. Total balance $67.99';
  L['dashboard-1'].style.opacity = 1;

  const lot = {};
  const fidAnim = lottie.loadAnimation({ container: $('.fid'), renderer: 'svg', loop: false, autoplay: false, path: `${BASE}lottie/FaceID.json` });
  art.querySelectorAll('.lottie').forEach(el => lot[el.dataset.l] = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false, path: `${BASE}lottie/${el.dataset.l}.json` }));
  if (reduced_) return () => Object.values(lot).concat(fidAnim).forEach(a => a.destroy());

  const anim = (el, kf, ms, easing = 'ease', delay = 0) => el.animate(kf, { duration: ms, easing, delay, fill: 'forwards' }).finished;
  const tapEl = $('.tap'), dim = $('.dim'), wash = $('.wash');
  let current = 'dashboard-1';
  const set = name => { Object.entries(L).forEach(([n, el]) => { if (!(n in SHEETS)) { el.getAnimations().forEach(a => a.cancel()); el.style.opacity = n === name ? 1 : 0; el.style.transform = ''; } }); current = name; };
  const tap = async ([x, y]) => {
    tapEl.style.left = x * 100 + '%'; tapEl.style.top = y * 100 + '%';
    await anim(tapEl, [{ opacity: 0, scale: .4 }, { opacity: .55, scale: 1, offset: .4 }, { opacity: 0, scale: 1.3 }], 650, 'ease-out');
  };
  const top = name => { const to = L[name]; stack.appendChild(to); to.style.opacity = 1; return to; };
  // Circle reveal from a point (launch out of the logo, back into the splash)
  const reveal = async (name, [x, y], ms = 700) => {
    const to = top(name), c = r => `circle(${r} at ${x * 100}% ${y * 100}%)`;
    await anim(to, [{ clipPath: c('0%') }, { clipPath: c('150%') }], ms, inOut); set(name);
  };
  // Signed in: the home screen rises over a receding sign-in screen
  const rise = async name => {
    const from = L[current], to = top(name);
    anim(from, [{ transform: 'none', filter: 'none' }, { transform: 'scale(.9)', filter: 'brightness(.5)' }], 760, push);
    await anim(to, [{ transform: 'translateY(100%)', borderRadius: '14cqw' }, { transform: 'none', borderRadius: '0' }], 760, push); set(name);
  };
  // Status moves forward: a left-to-right wipe reads as progress
  const wipe = async (name, ms = 620) => {
    const to = top(name);
    await anim(to, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], ms, inOut); set(name);
  };
  // Tab change: a short slide with a little give
  const tab = async name => {
    const from = L[current], to = top(name);
    anim(from, [{ transform: 'none' }, { transform: 'translateX(-12%)' }], 460, push);
    await anim(to, [{ transform: 'translateX(18%)', clipPath: 'inset(0 0 0 18%)' }, { transform: 'none', clipPath: 'inset(0 0 0 0)' }], 460, push); set(name);
  };
  // Status updates the way iOS does them: pull to refresh, spinner, the new state under the content
  const spin = $('.spin');
  const refresh = async name => {
    const from = L[current];
    await tap([0.5, 0.42]);
    spin.style.opacity = 1; spin.querySelector('svg').animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 900, iterations: 3, easing: 'steps(12)' });
    await anim(from, [{ transform: 'none' }, { transform: 'translateY(9%)' }], 520, 'cubic-bezier(.25,.8,.3,1)');
    await wait(900);
    const to = L[name]; to.style.opacity = 1; to.style.transform = 'translateY(9%)'; stack.appendChild(to); from.style.opacity = 0;
    from.getAnimations().forEach(a => a.cancel());
    spin.style.opacity = 0;
    await anim(to, [{ transform: 'translateY(9%)' }, { transform: 'none' }], 480, push); set(name);
  };
  const pushTo = async name => {
    const from = L[current], to = top(name);
    anim(from, [{ transform: 'none', filter: 'none' }, { transform: 'translateX(-28%)', filter: 'brightness(.7)' }], 700, push);
    await anim(to, [{ transform: 'translateX(100%)' }, { transform: 'none' }], 700, push); set(name);
  };
  const sheetUp = async name => { anim(dim, [{ opacity: 0 }, { opacity: 1 }], 420); await anim(L[name], [{ transform: 'translateY(100%)' }, { transform: 'none' }], 560, push); };
  const sheetDown = async name => { anim(dim, [{ opacity: 1 }, { opacity: 0 }], 380, 'ease', 80); await anim(L[name], [{ transform: 'none' }, { transform: 'translateY(100%)' }], 460, 'cubic-bezier(.5,0,.75,0)'); };
  // The seam of the loop: the screen breaks into the site's dot grid, a wave warps it outward
  // from the Frontier mark, and it settles back as the launch screen
  const dotsEl = $('.dots');
  const plate = name => {
    const el = L[name], img = el.querySelector('img.view'), c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d');
    x.drawImage(img, 0, 0); x.fillStyle = SCREENS[name][0]; x.fillRect(0, 0, c.width, c.height * 0.044);
    const t = el.querySelector('img.sb.l'); if (t) x.drawImage(t, c.width * 0.085, c.height * 0.0155, t.naturalWidth, c.height * 0.0235);
    return c;
  };
  const cells = (plateC, cols, rows) => { const c = document.createElement('canvas'); c.width = cols; c.height = rows; const x = c.getContext('2d'); x.drawImage(plateC, 0, 0, cols, rows); return x.getImageData(0, 0, cols, rows).data; };
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const dotWarp = (name, [ox, oy], ms = 1900) => new Promise(done => {
    const scr = $('.screen'), W = scr.clientWidth, H = scr.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    dotsEl.width = W * dpr; dotsEl.height = H * dpr; const g = dotsEl.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = 30, cell = W / cols, rows = Math.ceil(H / cell);
    const pa = plate(current), pb = plate(name), A = cells(pa, cols, rows), B = cells(pb, cols, rows);
    const bgA = hexRgb(SCREENS[current][0]), bgB = hexRgb(SCREENS[name][0]);
    const sx = pa.width / W, sy = pa.height / H, tx = pb.width / W, ty = pb.height / H;
    const cx = ox * W, cy = oy * H, far = Math.hypot(Math.max(ox, 1 - ox) * W, Math.max(oy, 1 - oy) * H);
    const ease = k => k * k * (3 - 2 * k);
    dotsEl.style.display = 'block'; let swapped = false; const t0 = performance.now();
    (function frame(now) {
      const t = Math.min(1, (now - t0) / ms);
      const bg = bgA.map((v, i) => Math.round(v + (bgB[i] - v) * ease(t)));
      g.fillStyle = `rgb(${bg})`; g.fillRect(0, 0, W, H);
      const live = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x0 = c * cell, y0 = r * cell, mx = x0 + cell / 2, my = y0 + cell / 2;
        const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        // Local progress: a front that leaves the mark, crosses the screen and passes
        const k = Math.max(0, Math.min(1, t * 1.9 - (d / far) * 0.9));
        if (k <= 0) { g.drawImage(pa, x0 * sx, y0 * sy, cell * sx, cell * sy, x0, y0, cell + .5, cell + .5); continue; }
        if (k >= 1) { g.drawImage(pb, x0 * tx, y0 * ty, cell * tx, cell * ty, x0, y0, cell + .5, cell + .5); continue; }
        live.push([r, c, k, mx, my, dx / d, dy / d]);
      }
      for (const [r, c, k, mx, my, ux, uy] of live) {
        const bump = Math.sin(Math.PI * k), i = (r * cols + c) * 4, m = ease(k);
        const push = bump * cell * 2.4, rad = cell * (0.62 - 0.36 * bump);
        g.fillStyle = `rgb(${Math.round(A[i] + (B[i] - A[i]) * m)},${Math.round(A[i + 1] + (B[i + 1] - A[i + 1]) * m)},${Math.round(A[i + 2] + (B[i + 2] - A[i + 2]) * m)})`;
        g.beginPath(); g.arc(mx + ux * push, my + uy * push, rad, 0, Math.PI * 2); g.fill();
      }
      if (!swapped && t > 0.5) { set(name); stack.appendChild(L[name]); swapped = true; }
      if (t < 1) requestAnimationFrame(frame); else { dotsEl.style.display = 'none'; done(); }
    })(t0);
  });

  const spring = 'cubic-bezier(.34,1.56,.64,1)';
  async function loop() {
    // Sign in
    set('intro-1'); lot.Coin.goToAndStop(0, true); lot.Confirmation.goToAndStop(0, true);
    const intro = $('[data-l="Intro"]'); intro.style.opacity = 1; lot.Intro.goToAndPlay(0, true);
    await wait(2500);
    intro.style.opacity = 0; set('intro-2');
    await wait(900);
    await tap(T.faceId);
    // Face ID on a Dynamic Island phone: the island opens into the Face ID glyph, scans,
    // turns to a check and closes. The old center panel (intro-3, intro-4) belongs to notched phones.
    const isl = $('.island'), g = $('.fid');
    const size = (w, h, r, ms, ease) => { isl.style.transition = `width ${ms}ms ${ease}, height ${ms}ms ${ease}, border-radius ${ms}ms ${ease}`; isl.style.width = w; isl.style.height = h; isl.style.borderRadius = r; return wait(ms); };
    await size('40cqw', '40cqw', '12cqw', 520, spring);
    g.style.opacity = 1; fidAnim.goToAndPlay(0, true);
    await wait(2500);
    g.style.opacity = 0;
    await size('', '', '', 380, push);
    isl.style.transition = ''; fidAnim.goToAndStop(0, true);
    await rise('dashboard-1');
    // Pay a bill
    await wait(1300);
    await tap(T.makePayment); await pushTo('bill-pay-1'); await wait(1100);
    await tap(T.method); await sheetUp('bill-pay-2'); await wait(1000);
    await tap(T.selectMethod); await sheetDown('bill-pay-2'); await wait(500);
    await tap(T.date); await sheetUp('bill-pay-3'); await wait(700);
    await tap(T.day14); await wait(350);
    await tap(T.selectDate); await sheetDown('bill-pay-3'); await wait(600);
    await tap(T.pay);
    const at = (r, p) => `circle(${r} at ${p[0] * 100}% ${p[1] * 100}%)`;
    await anim(wash, [{ clipPath: at('0%', T.pay) }, { clipPath: at('130%', T.pay) }], 700, inOut);
    lot.Coin.goToAndPlay(0, true); await wait(1500);
    const coin = $('[data-l="Coin"]'), conf = $('[data-l="Confirmation"]');
    coin.style.opacity = 0; lot.Confirmation.goToAndPlay(0, true); await wait(1200);
    // Match cut: the red closes down onto the check on the real Payment sent screen
    set('bill-pay-4'); stack.appendChild(L['bill-pay-4']);
    const CHECK = [0.5, 0.245];
    anim(conf, [{ top: '50%', width: '52cqw' }, { top: CHECK[1] * 100 + '%', width: '24cqw', opacity: 0, offset: 1 }], 640, inOut);
    await anim(wash, [{ clipPath: at('130%', CHECK) }, { clipPath: at('0%', CHECK) }], 640, inOut);
    wash.getAnimations().forEach(a => a.cancel()); conf.getAnimations().forEach(a => a.cancel()); coin.style.opacity = '';
    lot.Coin.goToAndStop(0, true); lot.Confirmation.goToAndStop(0, true);
    await wait(1900);
    // Track a visit
    await tap(T.supportTab); set('support-1'); await wait(1200);
    await tap(T.order); await pushTo('support-2'); await wait(2200);
    await refresh('support-3'); await wait(2000);
    await refresh('support-4'); await wait(2200);
    // Back to launch through the dot grid
    await dotWarp('intro-1', [0.12, 0.2]);
  }

  let on = false, running = false, stopped = false;
  const io = new IntersectionObserver(([e]) => { on = e.isIntersecting && !stopped; if (on && !running) run(); }, { threshold: 0.4 });
  io.observe(art);
  async function run() { running = true; while (on) await loop(); running = false; }
  return () => { stopped = true; on = false; io.disconnect(); Object.values(lot).concat(fidAnim).forEach(a => a.destroy()); };
}
