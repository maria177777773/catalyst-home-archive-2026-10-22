// Перехват заявок с форм сайта -> lead-bot (Telegram менеджерам + AmoCRM). Не ломает UX Tilda.
(function(){
  var ENDPOINT='/api/lead/';  // first-party same-origin (своя функция-приёмник заявок; слэш = trailingSlash-канон, как у чат-виджета)
  function val(form,names){for(var i=0;i<names.length;i++){var el=form.querySelector('[name="'+names[i]+'"]');if(el&&el.value&&el.value.trim())return el.value.trim();}return '';}
  function program(){
    // из <title> или og:title — "WOW Пицца — ..." -> "WOW Пицца"
    var og=document.querySelector('meta[property="og:title"]');
    var t=(og&&og.content)||document.title||'';
    return t.replace(/\s*[—|].*$/,'').replace(/^🔥\s*/,'').trim().slice(0,80);
  }
  /* Метрика, счётчик 91307646. Цели, которые шлёт этот файл:
       form_proposal  541708843 — заявка с формы страницы (телефон есть)
       form_subscribe 541709840 — подписка в футере (только почта)
       lead_sent      669491754 — любая отправленная заявка с телефоном (эта форма + поп-ап «Связаться»)
       click_phone    669491751 — клик по tel: или по иконке звонка в шапке ([data-phone])
       click_max      669491752 — клик по ссылке Max
       click_telegram 669491753 — клик по личному Telegram (канал catalyst_agency не считаем)
     Сводная цель 669491758 «Обращение с сайта» = click_phone | click_max | click_telegram | lead_sent.
     Счётчик на 234 страницах подключается через setTimeout 2000 мс: до этого ym нет, и цель
     раньше молча терялась. Теперь копим в очереди и отправляем, как только счётчик появился. */
  var goalQueue=[], goalWaiting=false;
  function flushGoals(){
    if(typeof window.ym!=='function') return false;
    while(goalQueue.length){ try{ window.ym.apply(window,goalQueue.shift()); }catch(_e){} }
    return true;
  }
  function goal(name){
    goalQueue.push([91307646,'reachGoal',name]);
    if(flushGoals()||goalWaiting) return;
    goalWaiting=true;
    (function wait(left){ setTimeout(function(){
      if(flushGoals()||left<=0){ goalWaiting=false; return; }
      wait(left-1);
    },300); })(60); // ждём счётчик до 18 с
  }
  window.__ccGoal=goal; // общий вход для chat/contact-popup.js, чтобы очередь была одна

  /* Намерение связаться: один делегированный обработчик на всю страницу, правка сотен страниц
     не нужна. Слушаем window в фазе перехвата: срабатывает раньше обработчика CTA ниже, который
     гасит событие через stopImmediatePropagation. Ловит и ссылки, созданные скриптами позже. */
  function contactGoal(el){
    if(el.hasAttribute('data-phone')) return 'click_phone';
    var h=String(el.getAttribute('href')||'').trim().toLowerCase();
    if(!h) return '';
    if(h.indexOf('tel:')===0) return 'click_phone';
    if(/^https?:\/\/([a-z0-9-]+\.)*max\.ru\//.test(h)) return 'click_max';
    if(h.indexOf('tg:')===0||/^(https?:\/\/)?([a-z0-9-]+\.)?(t\.me|telegram\.me|telegram\.dog)\//.test(h)){
      return /\/catalyst_agency(\/|\?|#|$)/.test(h)?'':'click_telegram'; // канал = подписка, не обращение
    }
    return '';
  }
  window.addEventListener('click',function(e){
    try{
      var t=e.target; if(!t||!t.closest) return;
      var el=t.closest('a[href],[data-phone]'); if(!el) return;
      var g=contactGoal(el); if(g) goal(g);
    }catch(_e){}
  },true);
  /* Идентификатор посетителя в Метрике. Без него сделку в CRM нельзя связать с визитом,
     то есть нельзя ответить, какой канал принёс деньги (а не просто клик). Берём один раз
     при загрузке: getClientID асинхронный, в момент отправки формы ждать его уже некогда. */
  var clientId='';
  /* Счётчик на страницах поднимается с задержкой, поэтому одной попытки мало:
     ждём появления ym и только тогда спрашиваем идентификатор. */
  (function ждатьСчётчик(осталось){
    try{
      if(typeof window.ym==='function'){ window.ym(91307646,'getClientID',function(id){ clientId=id||''; }); return; }
    }catch(_e){}
    if(осталось>0) setTimeout(function(){ ждатьСчётчик(осталось-1); },500);
  })(20);
  /* Метки рекламной кампании страница сохраняет в localStorage на 90 дней — берём оттуда,
     чтобы заявка с прямого захода всё равно помнила, откуда человек пришёл впервые. */
  function utm(){
    try{ var raw=localStorage.getItem('_utm_data'); if(!raw) return null;
         var d=JSON.parse(raw); return (d&&typeof d==='object')?d:null; }catch(_e){ return null; }
  }
  // Shared attribution for every form, including the delayed contact popup.
  var ATTR_KEY='cc_attribution_v1', attrs, now=Date.now(), currentUtms={};
  try { attrs=JSON.parse(localStorage.getItem(ATTR_KEY)||'null'); } catch(e) {}
  if(!attrs || !attrs.expiry || attrs.expiry<now) attrs={};
  try {
    var params=new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','yclid','gclid'].forEach(function(k){
      var v=params.get(k); if(v) currentUtms[k]=v;
    });
  } catch(e) {}
  var ref=document.referrer||'', external=false, host='';
  try { host=new URL(ref).hostname.toLowerCase(); external=!!host && host!==location.hostname && !/(^|\.)catalystrussia\.ru$/.test(host); } catch(e) {}
  var paid=!!(currentUtms.yclid||currentUtms.gclid||/^(cpc|ppc|paid|paidsearch|display|cpm)$/i.test(currentUtms.utm_medium||''));
  var channel=paid?'paid':currentUtms.utm_source?'campaign':external?(/(^|\.)(google\.[a-z.]+|yandex\.[a-z.]+|ya\.ru|bing\.com|duckduckgo\.com|search\.mail\.ru)$/.test(host)?'organic':'referral'):'direct';
  var touch={channel:channel,referrer:external?ref:'',landing:location.href,utm:currentUtms,at:new Date().toISOString()};
  if(!attrs.first) attrs.first=touch;
  if(channel!=='direct') attrs.last_non_direct=touch;
  attrs.expiry=now+90*86400000;
  try { localStorage.setItem(ATTR_KEY,JSON.stringify(attrs)); } catch(e) {}
  window.__ccAttribution=function(){ return attrs; };
  var ids={};
  function enrichLead(data){
    var last=attrs.last_non_direct||attrs.first;
    data.attribution=attrs;
    if(!data.utm || !Object.keys(data.utm).some(function(k){return k.indexOf('utm_')===0||k==='yclid'||k==='gclid';})) data.utm=Object.keys(currentUtms).length?currentUtms:(last&&last.utm)||utm();
    if(!data.clientId){
      var cookie=document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
      data.clientId=clientId||(cookie?cookie[1]:'');
    }
    if(!data.lead_id){
      var sig=JSON.stringify([data.phone||'',data.task||'',data.comment||'',data.page||'']);
      var idKey='cc_lead_id:'+sig;
      var old=ids[idKey];
      try { if(!old) old=JSON.parse(sessionStorage.getItem(idKey)||'null'); } catch(e) {}
      if(!old || Date.now()-old.at>600000){
        old={id:window.crypto&&crypto.randomUUID?crypto.randomUUID():'lead_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2),at:Date.now()};
      }
      ids[idKey]=old;
      try { sessionStorage.setItem(idKey,JSON.stringify(old)); } catch(e) {}
      data.lead_id=old.id;
    }
    return data;
  }
  var seen={};
  function once(sig){ if(seen[sig])return false; seen[sig]=1; return true; } // одна заявка = одно событие
  function report(name,phone,email,where){
    // ключ без «откуда»: если форма и отдаст submit, и уйдёт XHR-ом — заявка всё равно одна
    if(!once(name+'|'+phone+'|'+email)) return;
    if(phone&&phone.replace(/\D/g,'').length>=7){
      var data={name:(email?(name?name+' ':'')+'('+email+')':name)||'Заявка с сайта',phone:phone,program:program(),
                source:location.pathname||'site',comment:'Заявка с формы сайта ('+where+')',
                page:location.pathname,referer:location.href,title:document.title,
                clientId:clientId,utm:utm()};
      try{ fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),keepalive:true,mode:'cors'})
        .then(function(r){ return r.ok?r.json():null; })
        .then(function(d){
          if(d && d.ok===true){ if(!d.duplicate){ goal('form_proposal'); goal('lead_sent'); } }
          else delete seen[name+'|'+phone+'|'+email];
        }).catch(function(){ delete seen[name+'|'+phone+'|'+email]; });
      }catch(_e){ delete seen[name+'|'+phone+'|'+email]; }
    } else if(email){ goal('form_subscribe'); } // футерная подписка: телефона нет, заявку не заводим
  }

  // Обычный путь: форма отдаёт DOM-событие submit.
  document.addEventListener('submit',function(e){
    try{
      var f=e.target; if(!f||f.tagName!=='FORM')return;
      var phone=val(f,['Phone','phone','tel','Телефон']);
      if(!phone||phone.replace(/\D/g,'').length<7)return; // только формы-заявки с телефоном
      report(val(f,['Name','name','Имя','ФИО']),phone,val(f,['Email','email','E-mail']),'submit:'+(f.id||f.name||'form'));
    }catch(_){}
  },true);

  /* Второй путь — главный. Формы прежнего экспорта (js-form-proccess) отправляются XHR-ом на
     forms.tildaapi.com/procces/ и НЕ дают события submit: слушатель выше их не видел вовсе.
     Улика (живой прогон 02.08.2026, форма 639747257 на /teambuilding/vse-programmy/formula-1/):
     событий submit — ноль, XHR POST с Phone — есть; в Метрике цель form_proposal 0 достижений
     при 1252 визитах за 15 дней. Поэтому ловим саму отправку данных. */
  function fields(body){
    var o={};
    if(body&&typeof body.forEach==='function'&&typeof body.append==='function'){ // FormData
      try{ body.forEach(function(v,k){ if(!(k in o)&&v) o[k]=String(v); }); }catch(_e){}
      return o;
    }
    String(body||'').split('&').forEach(function(p){
      var i=p.indexOf('='); if(i<0)return;
      try{
        var k=decodeURIComponent(p.slice(0,i).replace(/\+/g,' '));
        var v=decodeURIComponent(p.slice(i+1).replace(/\+/g,' '));
        if(!(k in o)&&v) o[k]=v; // первое непустое значение поля
      }catch(_e){}
    });
    return o;
  }
  function pick(o,names){
    for(var i=0;i<names.length;i++){ for(var k in o){ if(k.toLowerCase()===names[i].toLowerCase()&&o[k]) return String(o[k]).trim(); } }
    return '';
  }
  function sniff(url,body){
    if(!/\/procces\/?(\?|$)/.test(String(url))) return; // приёмник форм прежнего экспорта
    var o=fields(body);
    report(pick(o,['Name','Имя','ФИО']),pick(o,['Phone','tel','Телефон']),pick(o,['Email','E-mail']),'xhr:'+(o['tildaspec-formid']||'form'));
  }
  try{
    var xopen=XMLHttpRequest.prototype.open, xsend=XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open=function(m,u){ this.__leadPost=(String(m||'').toUpperCase()==='POST')?String(u||''):''; return xopen.apply(this,arguments); };
    XMLHttpRequest.prototype.send=function(b){ try{ if(this.__leadPost) sniff(this.__leadPost,b); }catch(_e){} return xsend.apply(this,arguments); };
    var nfetch=window.fetch;
    if(typeof nfetch==='function'){
      window.fetch=function(u,o){
        try{ if(o&&String(o.method||'').toUpperCase()==='POST') sniff((u&&u.url)||u,o.body); }catch(_e){}
        var args=arguments;
        try{
          var target=new URL((u&&u.url)||u,location.href);
          if(target.origin===location.origin && /^\/api\/lead\/?$/.test(target.pathname) && o && String(o.method||'').toUpperCase()==='POST' && typeof o.body==='string'){
            var payload=JSON.parse(o.body);
            if(payload && typeof payload==='object' && !Array.isArray(payload)){
              o=Object.assign({},o,{body:JSON.stringify(enrichLead(payload))});
              return nfetch.call(this,u,o);
            }
          }
        }catch(e){}
        return nfetch.apply(this,args);
      };
    }
  }catch(_){}
})();

/* === Онлайн-консультант Каталист (чат-виджет с ИИ Haiku) ===
   Один загрузчик на всех страницах (этот файл подключён везде). Монтирует новый плавающий
   виджет и переводит старые CTA «Рассчитать стоимость» (a[href="#catalyst-chatbot"]) на него,
   не трогая 1600+ инлайн-копий старого попапа (они остаются, но их модалка больше не открывается). */
(function(){
  if (window.__ccWidgetLoaded) return; window.__ccWidgetLoaded = true;
  // 06.10.2026: страница программы. На ней свой мягкий автопоп-ап про программу (chat/contact-popup.js),
  // Telegram-поп-ап (chat/tg-popup.js) там не показывается. Флаг ставим до подгрузки обоих скриптов.
  window.__ccIsProg = /^\/teambuilding\/vse-programmy\/(?!c\/)[^/]+\/?$|^\/startap_business_game\/?$|^\/programmy\/ecoferma\/?$/.test(location.pathname);
  // Правка Маши 09.07 (чат 33): старые плавающие TG/Max-кружки (Tilda t898) убираем ВЕЗДЕ,
  // где монтируется бот-консультант — он их заменяет («чат-бот должен быть, как везде»).
  var killOld = function(){ document.querySelectorAll('.t898').forEach(function(el){ el.style.display='none'; }); };
  killOld(); document.addEventListener('DOMContentLoaded', killOld);
  function inject(){
    // прячем старую плавающую кнопку-мессенджер Tilda (t898, Telegram+Max в углу) —
    // её заменил чат-бот; зелёный лаунчер бота остаётся единственным в правом нижнем углу
    if (!document.getElementById('cc-hide-t898')) {
      var st = document.createElement('style');
      st.id = 'cc-hide-t898';
      st.textContent = '.t898,.t898__btn,[class*="t898"]{display:none!important;visibility:hidden!important;}';
      document.head.appendChild(st);
    }
    if (!document.querySelector('link[data-ccmf]')) {
      var mf = document.createElement('link');
      mf.rel = 'stylesheet'; mf.href = '/mobile-fixes.css?v=00bb4940'; mf.setAttribute('data-ccmf','1');
      document.head.appendChild(mf);
    }
  }
  // 07.10.2026 скорость (ТЗ маркетолога 07.10, п. 3): поп-ап «Связаться» и лента отзывов грузятся после первого действия
  // (касание, прокрутка, клавиша, мышь) или через 4 с простоя после загрузки, а не вместе со страницей: на телефоне их
  // разбор и стили стоили до 3 с работы процессора до первого касания. Нажатие CTA раньше этого само зовёт late().
  var lateDone = false;
  function late(){
    if (lateDone) return; lateDone = true;
    // Маша 28.07: чат-бота ПОКА убрали (переусложнили). Вместо него — простой контакт-поп-ап
    // (плавающая кнопка «Связаться» → форма телефон/Telegram → /api/lead/). consultant.js НЕ грузим.
    if (!document.querySelector('script[data-ccc]')) {
      var s = document.createElement('script');
      s.src = '/catalyst-home-archive-2026-10-22/chat/contact-popup.js?v=07a7e853'; s.setAttribute('data-ccc','1'); s.defer = true;
      document.body.appendChild(s);
    }
    // поп-ап «Подпишись на Telegram» V1 (Маша 28.07). 07.10.2026 (Маша): на уход с сайта теперь «Не нашли вариант? Давайте мы
    // вам позвоним» (chat/contact-popup.js), Telegram-поп-ап сам не показывается: грузим его только для просмотра по ?tg=1
    if (/[?&](tg|telegram)=1(?:&|$)/.test(location.search) && !document.querySelector('script[data-cctg]')) {
      var tg = document.createElement('script');
      tg.src = '/catalyst-home-archive-2026-10-22/chat/tg-popup.js?v=8e93e6fb'; tg.setAttribute('data-cctg','1'); tg.defer = true;
      document.body.appendChild(tg);
    }
    // exit-попап «Футболка» ОТКЛЮЧЁН (Маша 28.07: везде только Telegram-поп-ап)
    // Единый блок отзывов (Маша 27.07): reviews.js унифицирует старый Tilda-слайдер и otzyv-галерею
    if (!document.querySelector('script[data-crv]')) {
      var rv = document.createElement('script');
      rv.src = '/reviews.js?v=c9e9635a'; rv.setAttribute('data-crv','1'); rv.defer = true;
      document.body.appendChild(rv);
    }
  }
  window.__ccLate = late;
  var LATE_EV = ['pointerdown','touchstart','keydown','scroll','wheel','mousemove'];
  function onAct(){ LATE_EV.forEach(function(n){ window.removeEventListener(n, onAct, true); }); late(); }
  LATE_EV.forEach(function(n){ window.addEventListener(n, onAct, {capture: true, passive: true}); });
  function idleLate(){ setTimeout(function(){ (window.requestIdleCallback || setTimeout)(late, {timeout: 3000}); }, 4000); }
  if (document.readyState === 'complete') idleLate(); else window.addEventListener('load', idleLate);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();


  // 06.10.2026: время последнего нажатия кнопки, открывающей поп-ап. chat/contact-popup.js по нему
  // отличает нажатие (поп-ап сразу) от автопоказа (мягко: один за визит, в паузе прокрутки).
  if (typeof window.__ccCtaAt !== 'number') window.__ccCtaAt = 0;
  // Маша 30.07: чат-бот убран, но по сайту остались кнопки onclick="window.ccOpen&&ccOpen('calc')".
  // Определяем ccOpen как мост к контакт-поп-апу — все такие кнопки начинают работать разом.
  window.ccOpen = function(){
    window.__ccCtaAt = Date.now();
    function go(){ if (window.CatalystContact && window.CatalystContact.open){ window.CatalystContact.open({kind:'calc'}); return true; } return false; }
    if (go()) return;
    if (window.__ccLate) window.__ccLate(); // поп-ап ещё не загружен (грузится после первого действия)
    var t = setInterval(function(){ if (go()) clearInterval(t); }, 120);
    setTimeout(function(){ clearInterval(t); }, 12000);
  };
  // Перехват CTA в БОТ (не квиз, правка Маши 08.07): «Рассчитать стоимость/смету» → расчёт;
  // «Получить/Заказать КП» → сценарий заявки на КП; старый #catalyst-chatbot → расчёт.
  // Квиз Маше не нравится. Capture + stopImmediatePropagation гасят старый попап и _cta.js (загрузчик раньше _cta.js).
  var CALC_TXT = /рассчита(ть|йте|й|ем)\s*(стоимост|смет|кп|цен)|узнать\s*за\s*\d+\s*минут|сколько\s*стоит/i;
  var KP_TXT   = /(получить|получи|получите|заказать|запросить)\s*(кп|коммерческ)|кп\s*за\s*\d+|получить\s*предложени/i;
  var LEAD_TXT = /остав(ить|ьте)\s*заявк|заказать\s*звонок|отправить\s*заявк/i;
  document.addEventListener('click', function(e){
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('.cc-root')) return; // клики ВНУТРИ самого бота не трогаем
    var el = e.target.closest('a[href="#catalyst-chatbot"], [data-catalyst-chatbot], a[href="#kviz"], a, button, [role="button"], .t-btn, [class*="btn"]');
    if (!el) return;
    // 04.10.2026: кнопка со своим поп-апом (data-cc-title) открывает его при любом тексте («Удивите нас»)
    var isChatAnchor = el.matches && el.matches('a[href="#catalyst-chatbot"], [data-catalyst-chatbot], [data-cc-title], [data-cc-preset]');
    var isKvizAnchor = el.matches && el.matches('a[href="#kviz"]'); // 08.07н: квиз УБРАН СОВСЕМ, все входы в него → бот
    var txt = (el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
    var isKP = KP_TXT.test(txt);
    var isLead = LEAD_TXT.test(txt);
    var isCalc = isChatAnchor || CALC_TXT.test(txt);
    if (!isKP && !isCalc && !isLead && !isKvizAnchor) return; // прочие клики не трогаем
    e.preventDefault(); e.stopImmediatePropagation();
    // Маша 28.07: чат убран — CTA-кнопки («Рассчитать», «Получить КП») открывают контакт-поп-ап.
    // 04.10.2026: кнопка может передать свой заголовок и тему (data-cc-title/text/btn/topic)
    var ds = el.dataset || {};
    // 06.10.2026: у кнопки без data-cc-* передаём её тип и надпись: поп-ап соберёт свой заголовок и тему
    var opts = ds.ccPreset ? {preset: ds.ccPreset} : (ds.ccTitle || ds.ccTopic) ? {title: ds.ccTitle, text: ds.ccText, btn: ds.ccBtn, topic: ds.ccTopic}
      : {kind: isKP ? 'kp' : (isLead && !isCalc) ? 'lead' : 'calc', src: txt.slice(0, 60)};
    window.__ccCtaAt = Date.now();
    function go(){ if (window.CatalystContact && window.CatalystContact.open){ window.CatalystContact.open(opts); return true; } return false; }
    if (go()) return;
    if (window.__ccLate) window.__ccLate();
    var t = setInterval(function(){ if (go()) clearInterval(t); }, 120);
    setTimeout(function(){ clearInterval(t); }, 12000); // виджет ещё грузится, подождём (на медленной сети дольше 4 с)
  }, true);
})();
