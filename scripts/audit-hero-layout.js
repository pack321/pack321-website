const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9333;
const base = 'http://127.0.0.1:8765';
const outputRoot = path.resolve('artifacts/storefront-lc1-validation/hero-audit');
const profile = path.join(os.tmpdir(), `pack321-hero-audit-${process.pid}`);
fs.mkdirSync(outputRoot, { recursive: true });

const pages = [
  ['store-home', '/', '.store-v2-hero'],
  ['fundraising-center', '/fundraising.html', '.store-v2-hero'],
  ['campaign-candy', '/campaign.html?id=seroogy-candy-2026', '.campaign-hero--fundraiser'],
  ['campaign-popcorn', '/campaign.html?id=popcorn-2026', '.campaign-hero--fundraiser'],
  ['campaign-wreaths', '/campaign.html?id=rose-wreaths-2026', '.campaign-hero--fundraiser'],
  ['help-orders', '/help.html', '.hero'],
  ['find-scout', '/find-a-scout.html', '.find-scout-workspace'],
  ['donations', '/donations.html', 'main .section-heading'],
  ['checkout', '/checkout.html', 'main .section-heading'],
];
const viewports = [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,576],[390,844]];

let sequence = 0;
function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    const waiter = pending.get(message.id);
    if (waiter) { pending.delete(message.id); waiter(message); }
  };
  const ready = new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  return { socket, ready, send(method, params = {}) {
    return new Promise(resolve => {
      const id = ++sequence;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  }};
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function writeResults(results) {
  fs.writeFileSync(path.join(outputRoot,'hero-geometry.json'),JSON.stringify(results,null,2));
  const constrained = item => item.clipped && /^(hidden|clip|auto|scroll)$/.test(item.overflow || '');
  const failures = results.filter(r => !r.hero.rect || (r.hero.clipped && /^(hidden|clip|auto|scroll)$/.test(r.hero.overflow || '')) || r.overlapNext || r.outside.length || r.horizontalOverflow || Object.entries(r.items).some(([name,item])=>name!=='media'&&constrained(item)));
  fs.writeFileSync(path.join(outputRoot,'hero-failures.json'),JSON.stringify(failures,null,2));
  const lines = [
    '# Global Hero Fit & Spacing Audit', '',
    `Result: ${failures.length ? 'FAIL' : 'PASS'}`, '',
    `Audited ${results.length} page/viewport combinations.`, '',
    'Viewports: 1920×1080, 1440×900, 1366×768, 1280×720, 1024×576, and 390×844.', '',
    'Pages: Store Home, Fundraising Center, three campaign variants, Help & Orders, Find a Scout, Donations, and Checkout.', '',
    'Checks: hero and child rectangles, visible next-region collision, constrained vertical overflow, horizontal document overflow, and content extending outside its hero.', '',
    `Failures: ${failures.length}.`, '',
    'Screenshots: extension-free Microsoft Edge captures at 1920×1080, 1440×900, 1366×768, 1280×720, and 390×844 for each page.'
  ];
  fs.writeFileSync(path.join(outputRoot,'HERO-AUDIT-REPORT.md'),lines.join('\n'));
  return failures;
}
async function endpoint(resource, options) {
  const response = await fetch(`http://127.0.0.1:${port}${resource}`, options);
  if (!response.ok) throw new Error(`${resource}: ${response.status}`);
  return response.json();
}

const auditExpression = selector => `(() => {
  const q = s => document.querySelector(s);
  const rect = el => el ? Object.fromEntries(['x','y','top','right','bottom','left','width','height'].map(k => [k, Number(el.getBoundingClientRect()[k].toFixed(2))])) : null;
  const clipped = el => !!el && el.scrollHeight > el.clientHeight + 2;
  const hero = q(${JSON.stringify(selector)});
  let next = hero?.nextElementSibling;
  while (next && (getComputedStyle(next).display === 'none' || next.getBoundingClientRect().height === 0)) next = next.nextElementSibling;
  const items = {
    eyebrow: hero?.querySelector('.eyebrow,.campaign-hero__eyebrow'),
    title: hero?.querySelector('h1,h2,.campaign-hero__title'),
    description: hero?.querySelector('.campaign-hero__description,.store-v2-hero__copy>p:not(.eyebrow),p:not(.eyebrow)'),
    actions: hero?.querySelector('.hero-actions,.campaign-hero__actions,.anchor-nav,form'),
    media: hero?.querySelector('.store-v2-hero__media,.campaign-hero__media,.hero-visual,img'),
  };
  const heroRect = rect(hero);
  const descendants = [...(hero?.querySelectorAll('*') || [])].filter(el => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  });
  const outside = heroRect ? descendants.filter(el => { const r=el.getBoundingClientRect(); const horizontalScroller=el.closest('.hero-impact-panel'); const intentionalHorizontalOverflow=horizontalScroller&&/^(auto|scroll)$/.test(getComputedStyle(horizontalScroller).overflowX); const clippingFrame=el.parentElement?.closest('.store-v2-hero__media,.campaign-hero__media,.hero-visual'); const intentionallyClippedMedia=clippingFrame&&/^(hidden|clip)$/.test(getComputedStyle(clippingFrame).overflow); const verticalOutside=r.top < heroRect.top-1 || r.bottom > heroRect.bottom+1; const horizontalOutside=r.left < heroRect.left-1 || r.right > heroRect.right+1; return !intentionallyClippedMedia&&(verticalOutside || (horizontalOutside&&!intentionalHorizontalOverflow)); }).map(el => el.tagName+'.'+el.className).slice(0,12) : [];
  const itemData = Object.fromEntries(Object.entries(items).map(([name,el]) => [name,{rect:rect(el),clipped:clipped(el),display:el?getComputedStyle(el).display:null,overflow:el?getComputedStyle(el).overflow:null,objectFit:el?getComputedStyle(el.matches('img')?el:(el.querySelector('img')||el)).objectFit:null,objectPosition:el?getComputedStyle(el.matches('img')?el:(el.querySelector('img')||el)).objectPosition:null,backgroundPosition:el?getComputedStyle(el).backgroundPosition:null,source:el?.matches('img')?el.currentSrc:(el?.querySelector('img')?.currentSrc||el?.dataset.focalSrc||null),focal:{x:el?.dataset.focalX||el?.querySelector('img')?.dataset.focalX||null,y:el?.dataset.focalY||el?.querySelector('img')?.dataset.focalY||null,mobileX:el?.dataset.focalXMobile||el?.querySelector('img')?.dataset.focalXMobile||null,mobileY:el?.dataset.focalYMobile||el?.querySelector('img')?.dataset.focalYMobile||null}}]));
  const hr = hero?.getBoundingClientRect(), nr = next?.getBoundingClientRect();
  return {
    url: location.href, selector:${JSON.stringify(selector)}, viewport:{innerWidth,innerHeight,clientWidth:document.documentElement.clientWidth,clientHeight:document.documentElement.clientHeight,scrollHeight:document.documentElement.scrollHeight,dpr:devicePixelRatio},
    hero:{rect:heroRect,clientHeight:hero?.clientHeight,scrollHeight:hero?.scrollHeight,overflow:hero?getComputedStyle(hero).overflow:null,clipped:clipped(hero)},
    items:itemData,next:{tag:next?.tagName||null,className:next?.className||null,rect:rect(next)},
    overlapNext:!!(hr&&nr&&Math.min(hr.right,nr.right)>Math.max(hr.left,nr.left)&&Math.min(hr.bottom,nr.bottom)>Math.max(hr.top,nr.top)),
    outside, horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1
  };
})()`;

(async () => {
  if (process.argv.includes('--summarize-existing')) {
    const results = JSON.parse(fs.readFileSync(path.join(outputRoot,'hero-geometry.json'),'utf8'));
    const failures = writeResults(results);
    console.log(`Summarized ${results.length} page/viewport combinations; ${failures.length} failed.`);
    return;
  }
  const browser = spawn(edge, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-extensions', '--disable-component-extensions-with-background-pages', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let tries=0; tries<40; tries++) { try { await endpoint('/json/version'); break; } catch { await wait(250); } }
    const results = [];
    for (const [width,height] of viewports) {
      for (const [name,route,selector] of pages) {
        const target = await endpoint(`/json/new?${encodeURIComponent(base+route)}`, { method:'PUT' });
        const cdp = connect(target.webSocketDebuggerUrl); await cdp.ready;
        await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Page.navigate',{url:base+route});
        await wait(1400);
        const evaluated = await cdp.send('Runtime.evaluate',{expression:auditExpression(selector),returnByValue:true});
        if (!evaluated.result?.result || evaluated.result.exceptionDetails) {
          throw new Error(`Evaluation failed for ${name} ${width}x${height}: ${JSON.stringify(evaluated.result?.exceptionDetails || evaluated)}`);
        }
        const result = evaluated.result.result.value;
        if (!result) throw new Error(`No audit result for ${name} ${width}x${height}: ${JSON.stringify(evaluated)}`);
        result.name=name; result.requestedViewport={width,height}; result.timingMs=1400;
        results.push(result);
        if ([1920,1440,1366,1280,390].includes(width)) {
          const shot = await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
          fs.writeFileSync(path.join(outputRoot,`${name}-${width}x${height}.png`),Buffer.from(shot.result.data,'base64'));
        }
        cdp.socket.close();
        await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
      }
    }
    const failures = writeResults(results);
    console.log(`Audited ${results.length} page/viewport combinations; ${failures.length} flagged.`);
  } finally { browser.kill(); }
})().catch(error => { console.error(error); process.exitCode=1; });
