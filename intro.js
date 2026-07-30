/* Cinematic opening sequence — plays once per session.
   Gate (in <head>) decides whether html.intro-playing is set; this file
   only runs the show when it is. Skippable; honours reduced-motion. */
(function(){
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if(!intro) return;

  // Not playing this load: make sure the page is fully visible and bail.
  if(!root.classList.contains('intro-playing')){
    root.classList.add('intro-revealed');
    return;
  }

  var env = document.getElementById('env');
  var stage = document.getElementById('introStage');
  var card = document.getElementById('card');
  var skipBtn = document.getElementById('introSkip');
  var timers = [];
  var finished = false;

  // --- fit the fixed-size envelope to the viewport ---
  function fit(){
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(1, (vw - 40) / 462, (vh - 150) / 302 * 0.82);
    env.style.setProperty('--s', Math.max(0.45, s).toFixed(3));
  }
  fit();
  window.addEventListener('resize', fit);

  // --- floating dust motes ---
  var canvas = document.getElementById('introDust');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var motes = [], dustRAF = null;
  function sizeCanvas(){
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  function seedDust(){
    var w = window.innerWidth, h = window.innerHeight;
    var n = Math.round(Math.min(46, w/26));
    for(var i=0;i<n;i++){
      motes.push({
        x:Math.random()*w, y:Math.random()*h,
        r:0.6+Math.random()*2.2,
        vy:-(0.06+Math.random()*0.22),
        vx:(Math.random()-0.5)*0.14,
        a:0.15+Math.random()*0.5,
        ph:Math.random()*Math.PI*2,
        sp:0.006+Math.random()*0.012
      });
    }
  }
  seedDust();
  function drawDust(){
    var w=window.innerWidth, h=window.innerHeight;
    ctx.clearRect(0,0,w,h);
    for(var i=0;i<motes.length;i++){
      var m=motes[i];
      m.x+=m.vx; m.y+=m.vy; m.ph+=m.sp;
      if(m.y<-10){m.y=h+10;m.x=Math.random()*w;}
      if(m.x<-10)m.x=w+10; if(m.x>w+10)m.x=-10;
      var tw=m.a*(0.55+0.45*Math.sin(m.ph));
      var g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*3);
      g.addColorStop(0,'rgba(255,248,228,'+tw+')');
      g.addColorStop(1,'rgba(255,248,228,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(m.x,m.y,m.r*3,0,6.28318);ctx.fill();
    }
    dustRAF=requestAnimationFrame(drawDust);
  }
  drawDust();

  // --- timeline ---
  function at(ms, fn){ timers.push(setTimeout(fn,ms)); }

  intro.classList.add('cam-in');                        // camera dolly begins

  // Animation is triggered only when user clicks the real seal element.
  // Remove the automatic auto-play and schedule the timeline relative to
  // the seal click so users must click the seal to open the invitation.
  var sealEl = document.getElementById('seal');
  function scheduleAfter(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function startOpenSequence(){
    if(finished) return;
    if(!sealEl || sealEl._opened) return; // guard against repeated clicks
    sealEl._opened = true;

    // open flap immediately
    env.classList.add('open');
    // timings matched to original timeline (relative to open)
    scheduleAfter(1350, function(){ env.classList.add('rise'); });
    scheduleAfter(2050, function(){ env.classList.add('shimmer'); });
    scheduleAfter(3300, startZoom);
    // pause for 2 seconds after zoom completes (zoom is 2.2s, so reveal at 5500ms)
    scheduleAfter(5500, function(){ intro.classList.add('reveal'); });
    scheduleAfter(6350, finish);
  }

  if(sealEl){
    sealEl.style.cursor = 'pointer';
    sealEl.addEventListener('click', function(e){ e.stopPropagation(); startOpenSequence(); });
  }

  function startZoom(){
    // grow the stage from the card's on-screen centre so the invitation
    // expands to fill the frame, then the overlay dissolves to the site.
    var sr = stage.getBoundingClientRect();
    var cr = card.getBoundingClientRect();
    var ox = ((cr.left+cr.width/2) - sr.left) / sr.width * 100;
    var oy = ((cr.top+cr.height/2) - sr.top) / sr.height * 100;
    stage.style.transformOrigin = ox.toFixed(1)+'% '+oy.toFixed(1)+'%';
    intro.classList.add('zoom');
  }

  function finish(){
    if(finished) return; finished = true;
    timers.forEach(clearTimeout);
    try{ sessionStorage.setItem('gv-intro-seen','1'); }catch(e){}
    root.classList.remove('intro-playing');
    root.classList.add('intro-revealed');
    if(dustRAF) cancelAnimationFrame(dustRAF);
    setTimeout(function(){ if(intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 850);
  }

  // --- skip / fast-forward ---
  function skip(){
    if(finished) return;
    timers.forEach(clearTimeout); timers.length = 0;
    intro.classList.add('reveal');
    setTimeout(finish, 620);
  }
  skipBtn.addEventListener('click', function(e){ e.stopPropagation(); skip(); });
  intro.addEventListener('click', function(e){ if(e.target === intro) skip(); });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'||e.key==='Enter'||e.key===' ') skip();
  });
})();
