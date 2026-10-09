(function(){
  // countdown to 11 Dec 2026, 00:00 IST (the Goa celebration day)
  var target = new Date('2026-12-11T00:00:00+05:30').getTime();
  function tick(){
    var now = Date.now();
    var diff = Math.max(0, target - now);
    var d = Math.floor(diff/86400000);
    var h = Math.floor(diff/3600000)%24;
    var m = Math.floor(diff/60000)%60;
    var s = Math.floor(diff/1000)%60;
    document.getElementById('cd-days').textContent = d;
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);

  // petal shower
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('petalCanvas');
  var ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var petals = [];
  var colors = ['#F1A8CA','#C42B38','#71A5C8','#B1A6C9'];
  function spawnPetals(){
    if(reduceMotion) return;
    for(var i=0;i<60;i++){
      petals.push({
        x: Math.random()*canvas.width,
        y: -20 - Math.random()*200,
        r: 4 + Math.random()*5,
        vy: 1 + Math.random()*2,
        vx: (Math.random()-0.5)*1.5,
        rot: Math.random()*Math.PI*2,
        vr: (Math.random()-0.5)*0.1,
        color: colors[Math.floor(Math.random()*colors.length)],
        life: 0
      });
    }
    requestAnimationFrame(animate);
  }
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    petals.forEach(function(p){
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      ctx.save();
      ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - p.life/400);
      ctx.beginPath();
      ctx.ellipse(0,0,p.r,p.r*0.6,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
    petals = petals.filter(function(p){ return p.y < canvas.height + 40 && p.life < 400; });
    if(petals.length > 0){ requestAnimationFrame(animate); }
    else { ctx.clearRect(0,0,canvas.width,canvas.height); }
  }
  document.getElementById('petalsBtn').addEventListener('click', spawnPetals);
})();
