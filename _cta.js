// Все конверсионные CTA-кнопки -> квиз (#kviz). Не трогает навигацию (Подробнее) и скачивание.
(function(){
  var CTA=/рассчита(ть|йте)\s*(стоимост|смет)|узнать\s*стоимост|получить\s*кп|оставить\s*заявк|заказать\s*(расч|кп|звонок)|рассчитать\s*цен/i;
  function openQuiz(){
    // 08.07н (Маша): КВИЗ УБРАН СОВСЕМ — все конверсионные CTA открывают чат-бота (КП-сценарий)
    function go(){ if(window.CatalystConsultant&&window.CatalystConsultant.startKP){ window.CatalystConsultant.startKP(); return true; } return false; }
    if(go())return;
    var t=setInterval(function(){ if(go())clearInterval(t); },120);
    setTimeout(function(){ clearInterval(t); },4000);
  }
  document.addEventListener('click',function(e){
    try{
      if(e.target.closest && e.target.closest('.cc-root'))return; // клики ВНУТРИ чат-бота не трогаем (08.07: чип «Рассчитать стоимость» бота открывал квиз)
      var el=e.target.closest && e.target.closest('a,button,[role="button"],.t-btn,.t-submit,[class*="btn"]');
      if(!el)return;
      var txt=(el.textContent||el.value||'').replace(/\s+/g,' ').trim();
      if(!CTA.test(txt))return;
      var href=el.getAttribute && el.getAttribute('href');
      if(href==='#kviz')return;          // уже ведёт на квиз — не мешаем
      if(/skachat|download|\.pdf|presentation|prezent/i.test(href||''))return; // скачивание — не трогаем
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      openQuiz();
    }catch(_){}
  },true);
})();
