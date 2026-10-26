(function(){
  // 07.10.2026 скорость: тот же проход (жирный TT Commons → 'wght' 880), но кусками по ~12 мс в простое браузера,
  // а не одной задачей: на главной телефона (CPU×4) проход по всем элементам занимал 0,3–0,5 с подряд, трижды.
  // Сначала читаем стили куска, потом пишем (без пересчёта стиля на каждом элементе).
  var idle = window.requestIdleCallback || function(f){ return setTimeout(function(){ f({timeRemaining:function(){return 12;}}); }, 16); };
  var busy = false, again = false;
  function fix(){
    if(busy){ again = true; return; }
    busy = true;
    var els = document.querySelectorAll('body *'), i = 0;
    function slice(){
      var t0 = Date.now(), heavy = [];
      while(i < els.length && Date.now() - t0 < 12){
        var el = els[i++], cs;
        try{ cs = getComputedStyle(el); }catch(e){ continue; }
        if((cs.fontFamily||'').toLowerCase().indexOf('commons') < 0) continue;
        var w = parseInt(cs.fontWeight,10) || 400;
        if(w >= 600) heavy.push(el); // на оригинале (Arial) всё >=600 = bold/heavy
      }
      heavy.forEach(function(el){ el.style.setProperty('font-variation-settings',"'wght' 880",'important'); });
      if(i < els.length){ idle(slice, {timeout: 1000}); return; }
      busy = false;
      if(again){ again = false; fix(); }
    }
    idle(slice, {timeout: 1000});
  }
  function go(){[0,700,2000].forEach(function(t){setTimeout(fix,t);});}
  if(document.readyState==='complete')go(); else window.addEventListener('load',go);
})();
