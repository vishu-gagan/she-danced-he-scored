(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // theme toggle (same saved choice as the combined invite)
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', function(){
    var current = root.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('gv-theme', next); } catch(e) {}
  });

  // progress bar
  var bar = document.getElementById('progressBar');
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = (scrolled || 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  // day nav: smooth scroll + active state
  var navButtons = Array.prototype.slice.call(document.querySelectorAll('.day-nav button'));
  navButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.querySelector(btn.getAttribute('data-target'));
      if(el){ el.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'start'}); }
    });
  });
  var sections = navButtons.map(function(btn){ return document.querySelector(btn.getAttribute('data-target')); }).filter(Boolean);
  if('IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var idx = sections.indexOf(entry.target);
        if(idx === -1) return;
        if(entry.isIntersecting){
          navButtons.forEach(function(b){ b.classList.remove('active'); });
          navButtons[idx].classList.add('active');
          var navInner = document.getElementById('dayNavInner');
          var btn = navButtons[idx];
          var targetLeft = btn.offsetLeft - (navInner.clientWidth - btn.offsetWidth) / 2;
          navInner.scrollTo({left: Math.max(0, targetLeft), behavior: 'auto'});
        }
      });
    }, {rootMargin:'-40% 0px -50% 0px'});
    sections.forEach(function(s){ obs.observe(s); });
  }

  // scroll cue anchor smooth scroll
  document.querySelectorAll('a.scroll-cue').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var el = document.querySelector(a.getAttribute('href'));
      if(el){ el.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth'}); }
    });
  });
})();
