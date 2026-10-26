/* Каталист · поп-ап «Связаться» + чат «Менеджер онлайн» (05.10.2026, вариант V6 «окно над кнопкой»).
   Кнопка справа внизу открывает чат: посетитель пишет здесь, сообщение сразу уходит менеджеру
   в Telegram, ответ менеджера появляется в этом окне (POST/GET /api/chat-live/). На простые вопросы
   сразу отвечает ИИ-помощник по базе сайта, менеджер видит и его ответ.
   Кнопки страницы («Рассчитать стоимость», data-cc-*, «Наши акции») открывают прежний поп-ап с формой
   телефона без изменений, внизу добавлена строка «Есть вопрос? Задайте его в чате».
   Все тексты сообщений вставляются через textContent: разметку из сообщений браузер не исполнит.
   Прежняя версия без чата: git show HEAD~1:chat/contact-popup.js (коммит до 05.10.2026).
   Выкатка: 06.10.2026 01:00 МСК.
   06.10.2026 (Маша): поп-ап заявки оформлен как поп-ап Telegram-канала (chat/tg-popup.js): по центру,
   шапка с менеджером, крупный заголовок с зелёным акцентом, карточки хитов с фото (/catalyst-home-archive-2026-10-22/chat/img/hits/),
   потом мессенджеры и телефон. Свои заголовок, текст, кнопка и тема у каждой кнопки сохраняются.
   Автопоп-ап (вызов без нажатия кнопки, например «30 секунд в подборках» блока «Новый год 2027»)
   теперь мягкий: один авто-поп-ап за визит вместе с Telegram, ждёт паузы в прокрутке, не лезет
   поверх открытого меню, другого окна и набора текста.
   07.10.2026 (Маша): на уход с сайта вместо поп-апа Telegram-канала окно «Не нашли вариант? Давайте мы вам
   позвоним» (режим .ccl-exit: крупное поле телефона, «Перезвоните мне», ниже Telegram и Max), см. exitContent. */
(function () {
  'use strict';
  if (window.__ccContactLoaded) return; window.__ccContactLoaded = true;

  var TG = 'https://telegram.me/irek_stn';
  var MAX = 'https://max.ru/u/f9LHodD0cOK1eImavMfYexq4xuG8dMYMe072N-qyTBojv1QekVoEpM0Me9A';
  var LEAD_URL = '/api/lead/';

  /* --- чат --- */
  var LIVE_URL = '/api/chat-live/';
  var MGR = { name: 'Влад', photo: '/catalyst-home-archive-2026-10-22/img/team/manager.webp' };
  var ASK = 'Оставьте, пожалуйста, контакт, чтобы мы знали, куда ответить.';   // 06.10.2026 (Маша): контакт после первого вопроса
  var LS_SID = 'ccl_sid', LS_HIST = 'ccl_hist';

  /* Метрика (счётчик 91307646 стоит на всех страницах через tag.js).
     Цели заведены в кабинете, но до 01.08.2026 их никто не вызывал — за 3 месяца 11 133 визита
     и ровно 0 достижений, то есть заявки с сайта было нечем посчитать.
       form_popup   (541709121) — поп-ап открыт
       form_callback(541708730) — телефон отправлен, менеджер перезвонит
       lead_sent    (669491754) — то же, общая цель «заявка» вместе с формами страниц
       chat_message — первое сообщение посетителя в чате
       chat_contact — контакт, оставленный в чате (телефон или ник)
     Клики Telegram/Max в поп-апе считает общий обработчик в /catalyst-home-archive-2026-10-22/_lead.js (click_telegram, click_max).
     window.__ccGoal из /catalyst-home-archive-2026-10-22/_lead.js держит цель в очереди, пока счётчик не подгрузился. */
  function goal(name){
    try {
      if (typeof window.__ccGoal === 'function') { window.__ccGoal(name); return; }
      if (typeof window.ym === 'function') window.ym(91307646, 'reachGoal', name);
    } catch (e) {}
  }

  var css = ''
    + '.ccc-fab{position:fixed;right:22px;bottom:22px;z-index:99980;display:flex;align-items:center;gap:9px;'
    + 'background:#0aba59;color:#fff;border:0;border-radius:30px;padding:14px 22px;cursor:pointer;'
    + "font-family:'TTCommonsPro',Roboto,Arial,sans-serif;font-weight:700;font-size:18px;box-shadow:0 8px 24px rgba(10,186,89,.38)}"
    + '.ccc-fab:hover{background:#0a0a0a}.ccc-fab svg{width:20px;height:20px;fill:#fff}'
    /* 06.10.2026 (аудит адаптивности): плавающие кнопки уезжают за край экрана, когда стоят над кнопкой
       или ссылкой страницы, и возвращаются, когда место свободно (см. ccDodge ниже) */
    + '.ccc-fab,.ngk,.pkr{transition:transform .25s ease,opacity .25s ease}'
    + '.cc-dodge-r{transform:translateX(calc(100% + 40px))!important;opacity:0!important;pointer-events:none!important}'
    + '.cc-dodge-l{transform:translateX(calc(-100% - 40px))!important;opacity:0!important;pointer-events:none!important}'
    + '.cc-probe{pointer-events:none!important}.cc-noanim{transition:none!important}'
    + '.ccc-ov{position:fixed;inset:0;z-index:99981;background:rgba(10,10,10,.55);display:none;align-items:flex-end;justify-content:flex-end;padding:22px}'
    + '.ccc-ov.on{display:flex}'
    + '.ccc-box{width:min(475px,94vw);background:#fff;border-radius:27px;box-shadow:0 24px 70px rgba(0,0,0,.4);padding:30px 30px 28px;position:relative;font-family:Roboto,Arial,sans-serif}'
    + '.ccc-x{position:absolute;top:15px;right:17px;width:42px;height:42px;border:0;border-radius:50%;background:#f2f4f7;color:#0a0a0a;font-size:20px;cursor:pointer}'
    + ".ccc-t{font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:800;font-size:27px;color:#0a0a0a;line-height:1.2;margin:0 32px 8px 0}"
    + '.ccc-s{font-size:19px;color:#5f6368;line-height:1.4;margin:0 0 19px}'
    + '.ccc-f{display:flex;flex-direction:column;gap:10px}'
    + '.ccc-f input{border:1.5px solid #d9dee5;border-radius:15px;padding:16px 20px;font-family:Roboto,Arial,sans-serif;font-size:19px;outline:none}'
    + '.ccc-f input:focus{border-color:#0aba59}'
    + '.ccc-btn{background:#0aba59;color:#fff;border:0;border-radius:15px;padding:18px;font-family:"TTCommonsPro",Roboto,sans-serif;font-weight:700;font-size:20px;cursor:pointer}'
    + '.ccc-btn:hover{background:#0a0a0a}'
    + '.ccc-err{display:none;color:#e05656;font-size:16px}'
    + '.ccc-done{display:none;text-align:center;background:#eafaf2;border:1.5px solid #0aba59;border-radius:15px;padding:18px;font-weight:700;color:#0a0a0a}'
    + '.ccc-or{text-align:center;color:#9aa0a6;font-size:16px;margin:18px 0 13px}'
    + '.ccc-duo{display:flex;gap:13px}.ccc-duo a{flex:1;text-align:center;text-decoration:none;color:#fff;border-radius:15px;padding:15px;font-family:"TTCommonsPro",Roboto,sans-serif;font-weight:700;font-size:19px}'
    + '.ccc-tg{background:#229ED9}.ccc-max{background:linear-gradient(0.727turn,rgba(152,73,220,1) 0%,rgba(51,83,239,1) 51%,rgba(60,178,252,1) 100%)}'
    + '.ccc-promo{display:none}.ccc-box.pr{box-sizing:border-box;width:min(940px,94vw);max-height:94vh;overflow:auto;display:grid;grid-template-columns:1.15fr 1fr;gap:0 32px;align-content:start}'
    + '.ccc-ov.prov{align-items:center;justify-content:center}'
    + '.ccc-box.pr .ccc-t,.ccc-box.pr .ccc-s{grid-column:1/-1}.ccc-box.pr .ccc-promo{display:flex;flex-direction:column;gap:12px;grid-row:span 5}'
    + '.ccc-pi{display:flex;gap:14px;align-items:flex-start;background:#f2f4f7;border-radius:18px;padding:14px 16px}'
    + '.ccc-pi i{flex:none;width:64px;height:44px;padding:0 4px;box-sizing:border-box;border-radius:12px;background:#0aba59;color:#fff;font-style:normal;display:flex;align-items:center;justify-content:center;font-family:TTCommonsPro,Roboto,sans-serif;font-weight:800;font-size:16px;white-space:nowrap}'
    + ".ccc-pi b{display:block;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:800;font-size:20px;line-height:1.15;color:#0a0a0a;margin:0 0 4px}"
    + '.ccc-pi span{display:block;font-size:16px;line-height:1.4;color:#5f6368}'
    + '.ccc-pimg{display:none}.ccc-box.pr .ccc-pimg{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:18px;margin:0 0 16px}'
    + '@media(max-width:860px){.ccc-box.pr{display:block}.ccc-box.pr .ccc-promo{margin:0 0 18px}}'
    + '@media(max-width:600px){.ccc-fab{right:14px;bottom:14px;padding:12px 18px;font-size:15px}.ccc-ov{padding:0;align-items:flex-end;justify-content:center}.ccc-box{width:100vw;border-radius:22px 22px 0 0}}';

  /* ===== стили чата: те же шрифты, зелёный #0aba59, наведение чёрное, радиус 15 у кнопок ===== */
  css += ''
    /* кнопка справа внизу: фото менеджера с зелёной точкой + «Чат · менеджер онлайн» */
    + '.ccl-fab{padding:8px 22px 8px 8px;gap:12px}'
    + '.ccl-fava{position:relative;flex:none;width:42px;height:42px}'
    + '.ccl-fava img{width:42px;height:42px;border-radius:50%;object-fit:cover;display:block;border:2px solid #fff;box-sizing:border-box}'
    + '.ccl-dot{position:absolute;right:-1px;bottom:-1px;width:14px;height:14px;border-radius:50%;background:#0aba59;border:3px solid #fff;box-sizing:border-box}'
    + '.ccl-fab .ccl-dot{box-shadow:0 0 0 0 rgba(255,255,255,.7);animation:cclring 2.4s infinite}'
    + '.ccl-off .ccl-dot,.ccl-off.ccl-fab .ccl-dot{background:#9aa0a6;animation:none}'
    + '.ccl-fab.ccl-mini{padding-right:8px;gap:0}.ccl-fab.ccl-mini .ccl-flbl{display:none}'   /* кружок с фото менеджера на первом экране, см. textAt */
    + '@keyframes cclring{0%{box-shadow:0 0 0 0 rgba(255,255,255,.75)}70%{box-shadow:0 0 0 9px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}'
    + '.ccl-badge[hidden]{display:none!important}'
    + '.ccl-badge{position:absolute;top:-6px;right:-6px;min-width:26px;height:26px;padding:0 7px;box-sizing:border-box;border-radius:13px;background:#0a0a0a;color:#fff;border:2px solid #fff;font-family:Roboto,Arial,sans-serif;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}'
    /* режимы: чат (кнопка справа внизу) и прежний поп-ап (кнопки страницы) */
    + '.ccl-head,.ccl-tochat{display:none}'
    + '.ccl-classic .ccl-chat{display:none}.ccl-classic .ccl-alt{display:contents}.ccl-classic .ccl-or0{display:none}'
    + '.ccl-classic .ccl-tochat{display:flex;grid-column:1/-1}'
    + '.ccl-chatm .ccc-t,.ccl-chatm .ccc-s,.ccl-chatm .ccc-promo,.ccl-chatm .ccc-pimg{display:none!important}'
    /* окно над кнопкой, страница остаётся живой и не затемняется */
    + '.ccl-chatm.ccc-ov{background:transparent;pointer-events:none}'
    + '.ccl-chatm .ccc-box{pointer-events:auto;position:fixed;right:22px;bottom:96px;width:min(410px,94vw);height:min(700px,calc(100vh - 120px));height:min(700px,calc(100dvh - 120px));display:flex;flex-direction:column;padding:24px 26px 24px;box-sizing:border-box;overflow-y:auto;box-shadow:0 18px 60px rgba(0,0,0,.28)}'
    + '.ccl-chatm .ccl-head{display:flex;align-items:center;gap:14px;margin:0 52px 14px 0;flex:none}'
    + '.ccl-ava{position:relative;flex:none;width:56px;height:56px}'
    + '.ccl-ava img{width:56px;height:56px;border-radius:50%;object-fit:cover;display:block}'
    + '.ccl-ava .ccl-dot{width:17px;height:17px}'
    + ".ccl-who b{display:block;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:800;font-size:24px;line-height:1.1;color:#0a0a0a}"
    + '.ccl-st{display:flex;align-items:center;gap:8px;font-size:16px;line-height:1.3;color:#0a0a0a;margin-top:5px}'
    + '.ccl-st i{flex:none;width:10px;height:10px;border-radius:50%;background:#0aba59;animation:cclpulse 2s infinite}'
    + '.ccl-off .ccl-st i{background:#9aa0a6;animation:none}.ccl-off .ccl-st{color:#5f6368}'
    + '@keyframes cclpulse{0%{box-shadow:0 0 0 0 rgba(10,186,89,.55)}70%{box-shadow:0 0 0 8px rgba(10,186,89,0)}100%{box-shadow:0 0 0 0 rgba(10,186,89,0)}}'
    /* лента: секция не сжимается ниже ленты и поля ввода, иначе содержимое вываливается поверх нижнего блока */
    + '.ccl-chat{display:flex;flex-direction:column;flex:1 1 auto;min-height:216px}'
    + '.ccl-feed{flex:1 1 auto;min-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 2px 10px;overscroll-behavior:contain}'
    + '.ccl-m{max-width:86%;padding:12px 16px;border-radius:18px;font-size:18px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;box-sizing:border-box}'
    + '.ccl-m.mgr,.ccl-m.ai{align-self:flex-start;background:#f2f4f7;color:#0a0a0a;border-bottom-left-radius:6px}'
    + '.ccl-m.me{align-self:flex-end;background:#0aba59;color:#fff;border-bottom-right-radius:6px}'
    + '.ccl-m.fail{background:#0a0a0a}'
    + '.ccl-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:16px;line-height:1.3;color:#5f6368;margin-top:6px}'   /* 07.10: текст окна не мельче 16 px */
    + '.ccl-m.me .ccl-meta{color:rgba(255,255,255,.9);justify-content:flex-end}'
    + '.ccl-retry{border:0;background:none;color:#fff;text-decoration:underline;font:inherit;padding:0;cursor:pointer}'
    + '.ccl-sys{align-self:center;text-align:center;font-size:16px;line-height:1.4;color:#5f6368;max-width:92%}'
    + '.ccl-card{align-self:stretch;border:1.5px solid #d9dee5;border-radius:18px;padding:14px;background:#fff;box-sizing:border-box}'
    + '.ccl-card p{margin:0 0 10px;font-size:16px;line-height:1.4;color:#0a0a0a}'
    + '.ccl-card form{display:flex;gap:8px}'
    + '.ccl-card input{flex:1;min-width:0;height:52px;border:1.5px solid #d9dee5;border-radius:15px;padding:0 14px;font-family:Roboto,Arial,sans-serif;font-size:18px;outline:none;box-sizing:border-box}'
    + '.ccl-card input:focus{border-color:#0aba59}'
    + ".ccl-card button{flex:none;height:52px;padding:0 18px;border:0;border-radius:15px;background:#0aba59;color:#fff;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:700;font-size:18px;cursor:pointer}"
    + '.ccl-card button:hover{background:#0a0a0a}'
    + '.ccl-card .ccl-cerr{display:none;color:#e05656;font-size:16px;margin:8px 0 0}'
    + '.ccl-typing{align-self:flex-start;display:flex;align-items:center;gap:10px;font-size:16px;color:#5f6368}'
    + '.ccl-typing span{display:inline-flex;gap:4px;background:#f2f4f7;border-radius:14px;padding:12px 14px}'
    + '.ccl-typing i{width:7px;height:7px;border-radius:50%;background:#9aa0a6;animation:ccldot 1.2s infinite}'
    + '.ccl-typing i:nth-child(2){animation-delay:.15s}.ccl-typing i:nth-child(3){animation-delay:.3s}'
    + '@keyframes ccldot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}'
    /* быстрые вопросы живут в ленте под приветствием */
    /* поле ввода */
    + '.ccl-in{display:flex;gap:10px;align-items:flex-end;flex:none}'
    + '.ccl-in textarea{flex:1;min-width:0;resize:none;height:56px;max-height:132px;border:1.5px solid #d9dee5;border-radius:15px;padding:15px 18px;font-family:Roboto,Arial,sans-serif;font-size:18px;line-height:1.4;color:#0a0a0a;outline:none;box-sizing:border-box;overflow-y:auto}'
    + '.ccl-in textarea:focus{border-color:#0aba59}'
    + ".ccl-send{flex:none;height:56px;padding:0 18px;border:0;border-radius:15px;background:#0a0a0a;color:#fff;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:700;font-size:20px;cursor:pointer}"
    + '.ccl-send:hover{background:#0aba59}'
    + '.ccl-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}'
    + ".ccl-tochat{align-items:center;justify-content:center;gap:10px;min-height:48px;margin:10px 0 0;border:1.5px solid #d9dee5;border-radius:15px;background:#fff;color:#0a0a0a;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:700;font-size:17px;cursor:pointer;flex:none}"
    + '.ccl-tochat:hover{background:#0a0a0a;border-color:#0a0a0a;color:#fff}'
    + '.ccl-tochat{margin-top:16px;width:100%;box-sizing:border-box}.ccl-tochat i{width:10px;height:10px;border-radius:50%;background:#0aba59;flex:none}'
    + '.ccl-chatm .ccl-or0,.ccl-chatm .ccl-alt .ccc-or{display:none}'
    + '.ccl-chatm .ccc-duo a{display:flex;align-items:center;justify-content:center;padding:0 15px;box-sizing:border-box}'
    + '.ccl-open .ccl-fab{z-index:99982}'
    /* телефон 390 px: окно на всю ширину снизу */
    + '@media(max-width:600px){'
    + '.ccl-fab{padding:6px 18px 6px 6px;gap:10px}.ccl-fava,.ccl-fava img{width:38px;height:38px}.ccl-fab.ccl-mini{padding-right:6px}'
    + '.ccl-chatm.ccc-ov{padding:0;align-items:flex-end;justify-content:center}'
    + '.ccl-chatm .ccc-box{position:relative;right:auto;bottom:auto;border-radius:22px 22px 0 0}'
    + '.ccl-chatm .ccl-head{margin:0 50px 12px 0}.ccl-ava,.ccl-ava img{width:50px;height:50px}.ccl-who b{font-size:22px}'
    + '.ccl-m{font-size:17px}'
    + '.ccl-open .ccl-fab{display:none}'   /* окно на весь низ экрана: кнопка закрыла бы Telegram и Max, закрываем крестиком */
    + '}';

  /* ===== поп-ап заявки в стиле поп-апа Telegram-канала (06.10.2026). Только режим .ccl-classic:
     окно чата (.ccl-chatm) эти правила не задевают. Высота кнопок и полей одна: --cc-h. ===== */
  css += ''
    + '.ccc-hits{display:none}'
    + '.ccl-classic.ccc-ov{align-items:center;justify-content:center;padding:16px;background:rgba(10,10,10,.6);animation:cccfade .22s ease}'
    /* 06.10.2026: рамка .ccc-fr держит размер окна (зазор 16 px до краёв экрана) и крестик. Не влезло по высоте:
       прокручивается коробка внутри рамки, крестик остаётся на месте. В окне чата рамка прозрачна (display:contents). */
    + '.ccc-fr{display:contents}'
    + '.ccl-classic .ccc-fr{display:flex;flex-direction:column;position:relative;width:min(660px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);animation:cccpop .28s cubic-bezier(.2,.8,.2,1)}'
    + '.ccl-classic .ccc-box{--cc-h:54px;width:100%;max-height:none;flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box;border-radius:32px;padding:26px 34px 28px;box-shadow:0 30px 80px rgba(0,0,0,.45)}'
    + '@keyframes cccfade{from{opacity:0}to{opacity:1}}'
    + '@keyframes cccpop{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}'
    + '.ccl-classic .ccc-x{top:18px;right:18px;width:48px;height:48px;padding:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:20px;z-index:2}'
    + '.ccl-classic .ccc-x:hover{background:#0a0a0a;color:#fff}'
    + '.ccl-classic .ccc-fr-sc .ccc-x{box-shadow:0 0 0 3px #fff}'   /* окно прокручено: белое кольцо отделяет крестик от текста под ним */
    /* шапка: фото менеджера и статус, как аватар и имя канала у Telegram-поп-апа */
    + '.ccl-classic .ccl-head{display:flex;align-items:center;gap:14px;margin:0 64px 14px 0}'
    + '.ccl-classic .ccl-ava,.ccl-classic .ccl-ava img{width:52px;height:52px}'
    + '.ccl-classic .ccl-who b{font-size:22px}'
    /* заголовок и текст */
    + ".ccl-classic .ccc-t{font-size:34px;line-height:1.15;margin:0 0 10px}.ccc-t .g{color:#0aba59}"
    + '.ccl-classic .ccc-s{font-size:19px;line-height:1.45;margin:0 0 18px}'
    /* хиты с фото: три карточки в ряд */
    + '.ccl-classic .ccc-hits{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0 0 20px}'
    + '.ccl-classic .ccc-box.pr .ccc-hits{display:none}'
    + '.ccc-hit{margin:0;border:1px solid #eceff3;border-radius:18px;overflow:hidden;background:#fff;min-width:0}'
    + '.ccc-hit:nth-child(n+4){display:none}'
    + '.ccc-hit img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;background:#f2f4f7}'
    + '.ccc-hit figcaption{padding:9px 12px 11px;font-family:Roboto,Arial,sans-serif;font-weight:500;font-size:17px;line-height:1.25;color:#0a0a0a}'
    /* мессенджеры, телефон, кнопка: одна высота --cc-h */
    + '.ccl-classic .ccc-duo{gap:12px}'
    + '.ccl-classic .ccc-duo a{display:flex;align-items:center;justify-content:center;height:var(--cc-h);padding:0 16px;box-sizing:border-box;border-radius:16px;font-size:19px}'
    + '.ccl-classic .ccc-or{font-size:17px;color:#5f6368;margin:14px 0 10px}'
    + '.ccl-classic .ccc-f{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:12px}'
    + '.ccl-classic .ccc-f>.ccc-err,.ccl-classic .ccc-f>.ccc-btn,.ccl-classic .ccc-f>.ccc-done{grid-column:1/-1}'
    + '.ccl-classic .ccc-f input{height:var(--cc-h);padding:0 18px;box-sizing:border-box;border-radius:16px;font-size:19px;min-width:0}'
    + '.ccl-classic .ccc-btn{height:var(--cc-h);padding:0 18px;border-radius:16px;font-size:20px}'
    + '.ccl-classic .ccc-done{border-radius:16px}'
    + '.ccl-classic .ccl-tochat{min-height:0;height:var(--cc-h);margin-top:10px;border-radius:16px;font-size:18px}'
    /* акции: две колонки, как раньше, шапка над ними; форма в одну колонку */
    + '.ccl-classic .ccc-fr.ccc-fr-pr{width:min(960px,100%)}.ccl-classic .ccc-box.pr{width:100%;padding:26px 32px 28px}'
    + '.ccl-classic .ccc-box.pr .ccl-head{grid-column:1/-1}'
    + '.ccl-classic .ccc-box.pr .ccc-t{font-size:32px}.ccl-classic .ccc-box.pr .ccc-s{margin-bottom:16px}'
    + '.ccl-classic .ccc-box.pr .ccc-f{grid-template-columns:minmax(0,1fr)}'
    + '.ccl-classic .ccc-box.pr .ccc-pimg{aspect-ratio:2/1;margin-bottom:12px;object-fit:contain;background:#ede6d8}'   /* фон = фон фото футболки: целиком, без обрезки ворота */
    + '.ccl-classic .ccc-box.pr .ccc-pi{padding:12px 16px}.ccl-classic .ccc-box.pr .ccc-promo{gap:10px}'
    + '.ccl-classic .ccc-box.pr .ccl-tochat{grid-column:2}'
    + '@media(max-width:860px){.ccl-classic .ccc-fr.ccc-fr-pr{width:min(660px,100%)}.ccl-classic .ccc-box.pr .ccl-tochat{grid-column:auto}}'
    /* телефон: окно по центру, хиты лентой с прокруткой вбок, имя и телефон в одну строку */
    + '@media(max-width:600px){'
    + '.ccl-classic.ccc-ov{padding:16px;align-items:center;justify-content:center}'
    + '.ccl-classic .ccc-fr,.ccl-classic .ccc-fr.ccc-fr-pr{width:100%;max-width:460px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px)}'
    + '.ccl-classic .ccc-box,.ccl-classic .ccc-box.pr{--cc-h:50px;width:100%;border-radius:24px;padding:18px 18px 18px}'
    + '.ccl-classic .ccc-x{top:12px;right:12px;width:44px;height:44px;font-size:18px}'
    + '.ccl-classic .ccl-head{gap:12px;margin:0 56px 12px 0}'
    + '.ccl-classic .ccl-ava,.ccl-classic .ccl-ava img{width:46px;height:46px}.ccl-classic .ccl-ava .ccl-dot{width:15px;height:15px}'
    + '.ccl-classic .ccl-who b{font-size:20px}.ccl-classic .ccl-st{font-size:16px;margin-top:3px}'
    + '.ccl-classic .ccc-t,.ccl-classic .ccc-box.pr .ccc-t{font-size:24px;line-height:1.16;margin:0 0 8px}'
    + '.ccl-classic .ccc-s{font-size:16px;line-height:1.45;margin:0 0 14px}'
    + '.ccl-classic .ccc-hits{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 18px;margin:0 -18px 16px;padding:0 18px 2px;scrollbar-width:none;-webkit-overflow-scrolling:touch}'
    + '.ccl-classic .ccc-hits::-webkit-scrollbar{display:none}'
    + '.ccc-hit{flex:0 0 132px;scroll-snap-align:start;border-radius:16px}.ccc-hit:nth-child(n+4){display:block}'
    + '.ccc-hit figcaption{padding:7px 10px 9px;font-size:16px}'
    + '.ccl-classic .ccc-duo{gap:10px}.ccl-classic .ccc-duo a{font-size:17px;border-radius:15px}'
    + '.ccl-classic .ccc-or{font-size:16px;margin:10px 0 8px}'
    + '.ccl-classic .ccc-f{grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:10px}'
    + '.ccl-classic .ccc-f input{padding:0 14px;font-size:17px;border-radius:15px}'
    + '.ccl-classic .ccc-btn{font-size:18px;border-radius:15px}'
    + '.ccl-classic .ccl-tochat{font-size:16px;margin-top:8px;border-radius:15px}'
    + '}'
    + '@media(max-width:374px){.ccl-classic .ccc-f{grid-template-columns:minmax(0,1fr)}}'
    + '@media(prefers-reduced-motion:reduce){.ccl-classic.ccc-ov,.ccl-classic .ccc-fr,.ccl-classic .ccc-box{animation:none}}';

  /* ===== 06.10.2026, дополнение Маши: текст поп-апа смысловыми строками, главное зелёным, часы работы
     отдельной строкой; новогоднее оформление как у блока «Новый год 2027» (_shared/ng-2027.html: зелёная
     рамка 3px и гирлянда по верху); чат шире, сверху форма телефона и мессенджеры, ниже вопрос. ===== */
  css += ''
    + '.ccc-hours,.ccl-gotl{display:none}'
    + '.ccc-s .ccc-p{display:block}.ccc-s .ccc-p+.ccc-p{margin-top:6px}.ccc-s .g{color:#0aba59;font-weight:700}'
    + '.ccl-classic .ccc-hours{display:flex;align-items:center;gap:9px;font-size:17px;line-height:1.35;color:#0a0a0a;margin:-8px 0 20px}'
    + '.ccc-hours i{flex:none;width:9px;height:9px;border-radius:50%;background:#0aba59}'
    + '.ccl-classic .ccc-box.pr .ccc-hours{grid-column:1/-1;margin:-6px 0 16px}'
    /* новый год: рамка и гирлянда */
    + '.ccl-classic .ccc-box.ccc-ng{border:3px solid #0aba59;padding-top:50px}'
    + '.ccl-classic .ccc-box.ccc-ng::before{content:"";position:absolute;left:28px;right:28px;top:0;height:44px;pointer-events:none;'
    + "background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='44' viewBox='0 0 160 44'%3E%3Cpath d='M0 1 Q40 27 80 1 Q120 27 160 1' fill='none' stroke='%230a0a0a' stroke-width='1.6'/%3E%3Cline x1='40' y1='14' x2='40' y2='20' stroke='%230a0a0a' stroke-width='1.4'/%3E%3Crect x='36.5' y='19' width='7' height='4' rx='1' fill='%230a0a0a'/%3E%3Ccircle cx='40' cy='30' r='8' fill='%230aba59'/%3E%3Cline x1='120' y1='14' x2='120' y2='18' stroke='%230a0a0a' stroke-width='1.4'/%3E%3Crect x='117' y='17' width='6' height='4' rx='1' fill='%230a0a0a'/%3E%3Ccircle cx='120' cy='27' r='6' fill='%230a0a0a'/%3E%3C/svg%3E\") repeat-x left top}"
    + '.ccl-classic .ccc-fr.ccc-fr-ng .ccc-x{top:49px;right:21px}'
    /* чат 07.10.2026 (Маша): «когда это открывается, очень много всего на экране». Сверху крупная «Перезвоните мне»
       (по нажатию появляется поле телефона, вторым нажатием заявка уходит), ниже Telegram и Max, ниже поле вопроса
       и «Отправить». Без подписей про график. Лента сообщений появляется, когда есть разговор (.ccl-talk).
       Все кнопки и поля окна одной высоты: --cc-h. */
    + '.ccl-chatm .ccc-box{--cc-h:56px;width:min(480px,calc(100vw - 32px));height:auto;max-height:calc(100vh - 116px);max-height:calc(100dvh - 116px);padding:22px 24px 24px;border:2px solid #0aba59;box-shadow:0 24px 70px rgba(0,0,0,.32)}'
    + '.ccl-chatm.ccl-talk .ccc-box{height:min(780px,calc(100vh - 116px));height:min(780px,calc(100dvh - 116px))}'
    + '.ccl-chatm .ccl-head{order:0}'
    + '.ccl-chatm .ccl-alt{order:1;display:flex;flex-direction:column;gap:10px;margin:0 0 10px;flex:none}'
    + '.ccl-chatm .ccl-alt .ccc-f{display:flex;flex-direction:column;gap:10px;order:1}'
    + '.ccl-chatm .ccc-f input{display:none;height:var(--cc-h);padding:0 18px;box-sizing:border-box;border-radius:15px;font-size:19px;min-width:0;background:#fff}'
    + '.ccl-chatm.ccl-cbo .ccc-f input{display:block}'   /* поле телефона после первого нажатия «Перезвоните мне» */
    + '.ccl-chatm .ccc-btn{height:var(--cc-h);padding:0 18px;border-radius:15px;font-size:20px;white-space:nowrap}'
    + '.ccl-chatm .ccc-duo{order:2;gap:10px}.ccl-chatm .ccc-duo a{height:var(--cc-h);border-radius:15px;font-size:19px}'
    + '.ccl-chatm.ccl-gotc .ccl-alt .ccc-f{display:none}'
    + '.ccl-chatm.ccl-gotc .ccl-gotl{display:block;order:0;font-size:17px;line-height:1.4;color:#0a0a0a;font-weight:500}'
    + '.ccl-chatm .ccl-chat{order:2;flex:none;min-height:0}.ccl-chatm .ccl-feed{display:none}'
    + '.ccl-chatm.ccl-talk .ccl-chat{flex:1 1 auto;min-height:250px}.ccl-chatm.ccl-talk .ccl-feed{display:flex}'
    + '.ccl-chatm .ccl-in{flex-direction:column;align-items:stretch;gap:10px}'
    + '.ccl-chatm .ccl-in textarea{flex:none;height:88px;max-height:170px;font-size:18px}'   /* flex:none: иначе в колонке высоту задаёт flex-basis, а не height */
    + '.ccl-chatm .ccl-send{height:var(--cc-h)}'
    /* карточка «оставьте контакт» после вопроса: заметная, держится внизу ленты, пока контакта нет */
    + '.ccl-card.ask{border:2px solid #0aba59;background:#eafaf2}'
    + '.ccl-card.ask p{font-weight:500}'
    + '@media(max-width:600px){'
    + '.ccl-chatm .ccc-box{--cc-h:52px;width:100vw;height:auto;max-height:92vh;max-height:92dvh;border:0;border-top:2px solid #0aba59;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))}'
    + '.ccl-chatm.ccl-talk .ccc-box{height:92vh;height:92dvh}'
    + '.ccl-chatm .ccc-f input{font-size:18px;padding:0 14px}.ccl-chatm .ccc-btn,.ccl-chatm .ccl-send{font-size:19px}.ccl-chatm .ccc-duo a{font-size:18px}'
    + '.ccl-chatm.ccl-talk .ccl-chat{min-height:200px}'
    + '.ccl-chatm .ccl-in textarea{height:76px;font-size:17px}'
    + '.ccl-classic .ccc-hours{font-size:16px;margin:-4px 0 14px}'
    + '.ccl-classic .ccc-box.ccc-ng{padding-top:46px}.ccl-classic .ccc-box.ccc-ng::before{left:12px;right:12px}.ccl-classic .ccc-fr.ccc-fr-ng .ccc-x{top:41px;right:15px}'
    + '}'
    /* невысокий экран (телефон до 760 px по высоте, например iPhone с панелями Safari; ноутбук до 860 px):
       форма сразу под текстом, под ней «или напишите в мессенджер» с Telegram и Max, хиты ниже, чтобы кнопка
       отправки была видна без прокрутки окна */
    + '@media(max-width:600px) and (max-height:760px),(min-width:601px) and (max-height:860px){'
    + '.ccl-classic .ccc-box:not(.pr){display:flex;flex-direction:column}'
    + '.ccl-classic .ccc-box:not(.pr) .ccl-head{order:0;flex:none}.ccl-classic .ccc-box:not(.pr) .ccc-t{order:1}.ccl-classic .ccc-box:not(.pr) .ccc-s{order:2}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-hours{order:3}.ccl-classic .ccc-box:not(.pr) .ccc-f{order:4}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-or{display:none}.ccl-classic .ccc-box:not(.pr) .ccl-or0{display:block;order:5}'   /* «или напишите в мессенджер» */
    + '.ccl-classic .ccc-box:not(.pr) .ccc-duo{order:6;flex:none}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-hits{order:7;margin:16px -18px 0;flex:none}.ccl-classic .ccc-box:not(.pr) .ccl-tochat{order:8;flex:none}'
    + '}'
    + '@media(max-width:600px) and (max-height:760px){.ccl-classic .ccc-box:not(.pr) .ccc-t{font-size:23px}}'
    + '@media(min-width:601px) and (max-height:860px){.ccl-classic .ccc-box:not(.pr) .ccc-hits{margin:18px 0 0}}'
    /* 06.10.2026 (Маша): «если человек может писать вопрос, всегда видно поле, куда писать». 07.10 (Маша): поле «Имя»
       убрано, «человек вводит телефон: получить КП». Компьютер: вопрос слева на две строки формы, справа телефон и под ним
       кнопка; телефон: вопрос, телефон и кнопка друг под другом во всю ширину. В окне чата поле вопроса не нужно: там своё. */
    + '.ccc-f textarea{display:none}'
    + ".ccl-classic .ccc-f textarea{display:block;grid-row:span 2;min-width:0;height:auto;min-height:calc(var(--cc-h)*2 + 12px);resize:none;box-sizing:border-box;border:1.5px solid #d9dee5;border-radius:16px;padding:14px 18px;font-family:Roboto,Arial,sans-serif;font-size:19px;line-height:1.4;color:#0a0a0a;outline:none}"
    + '.ccl-classic .ccc-f textarea:focus{border-color:#0aba59}'
    + '.ccl-classic .ccc-f{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-f textarea{grid-column:1;grid-row:1 / span 2}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-f input[name="contact"]{grid-column:2;grid-row:1}'
    + '.ccl-classic .ccc-box:not(.pr) .ccc-f>.ccc-btn{grid-column:2;grid-row:2}'
    + '.ccl-classic .ccc-box.pr .ccc-f textarea{grid-row:auto;min-height:96px}'
    + '@media(max-width:600px){.ccl-classic .ccc-f textarea{min-height:72px;font-size:17px;padding:12px 14px;border-radius:15px}'
    +   '.ccl-classic .ccc-f,.ccl-classic .ccc-box:not(.pr) .ccc-f{grid-template-columns:minmax(0,1fr)}'
    +   '.ccl-classic .ccc-box:not(.pr) .ccc-f textarea,.ccl-classic .ccc-box:not(.pr) .ccc-f input[name="contact"],.ccl-classic .ccc-box:not(.pr) .ccc-f>.ccc-btn{grid-column:1;grid-row:auto}}'
    /* 06.10.2026 (приёмка 1440×900): окно было 899 px при 868 доступных, нижняя кнопка «Есть вопрос?» упиралась в край.
       На окнах до 960 px по высоте те же блоки плотнее: отступы, заголовок 31 px, текст 18 px, фото хитов 2:1, высота
       кнопок 52 px (телефон 48 px). Текст не мельче 16 px. Высокие экраны выглядят как раньше. */
    + '@media(min-width:601px) and (max-height:960px){'
    + '.ccl-classic .ccc-box{--cc-h:52px;padding:22px 34px 24px}.ccl-classic .ccc-box.ccc-ng{padding-top:48px}.ccl-classic .ccc-box.pr{padding:22px 32px 24px}'
    + '.ccl-classic .ccl-head{margin-bottom:10px}'
    + '.ccl-classic .ccc-t{font-size:31px;margin-bottom:8px}.ccl-classic .ccc-box.pr .ccc-t{font-size:30px}'
    + '.ccl-classic .ccc-s{font-size:18px;line-height:1.42;margin-bottom:14px}'
    + '.ccl-classic .ccc-hours{margin:-6px 0 14px}'
    + '.ccl-classic .ccc-hits{gap:12px;margin-bottom:16px}.ccc-hit img{aspect-ratio:2/1}.ccc-hit figcaption{padding:8px 12px 9px}'
    + '.ccl-classic .ccc-or{margin:10px 0 8px}'
    + '.ccl-classic .ccc-box.pr .ccc-promo{gap:8px}.ccl-classic .ccc-box.pr .ccc-pi{padding:10px 16px}'
    + '.ccl-classic .ccc-box.pr .ccc-pimg{aspect-ratio:5/2}.ccl-classic .ccc-box.pr .ccc-f textarea{min-height:84px}'   /* футболка целиком (contain), просто ниже */
    + '}'
    + '@media(max-width:600px) and (max-height:900px){'
    + '.ccl-classic .ccc-box,.ccl-classic .ccc-box.pr{--cc-h:48px}'
    + '.ccl-classic .ccl-head{margin-bottom:10px}.ccl-classic .ccc-s{margin-bottom:12px}.ccl-classic .ccc-hours{margin:-4px 0 12px}'
    + '.ccl-classic .ccc-hits{margin-bottom:14px}.ccl-classic .ccc-or{margin:8px 0 6px}'
    + '}';

  /* ===== 07.10.2026 (Маша): окно на уход с сайта «Не нашли вариант? Давайте мы вам позвоним». Режим .ccl-exit поверх
     .ccl-classic: как окно чата, минимально. Шапка с менеджером, заголовок в две строки (вторая зелёная), строка-обещание,
     крупное поле телефона и «Перезвоните мне» во всю ширину, ниже «или напишите в мессенджер» и Telegram, Max.
     Без поля вопроса, хитов, строки часов и кнопки чата. Все поля и кнопки одной высоты --cc-h. Max сплошным #3353EF,
     как в карточке «Контакты» (градиенты у нас запрещены). ===== */
  css += ''
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-fr{width:min(520px,100%)}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box{--cc-h:60px;display:flex;flex-direction:column;border:2px solid #0aba59;padding:24px 30px 28px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-head{order:0;flex:none;margin:0 64px 16px 0}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-t{order:1;font-size:34px;line-height:1.12;margin:0 0 10px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-t .g{display:block}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-s{order:2;font-size:19px;margin:0 0 20px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-f{order:3;display:flex;flex-direction:column;gap:12px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-f textarea,.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-hours,.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-hits,'
    +   '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-promo,.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-pimg,.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-or:not(.ccl-or0),'
    +   '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-tochat,.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-gotl{display:none!important}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-f input{height:var(--cc-h);padding:0 20px;font-size:22px;letter-spacing:.02em;border-radius:16px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-btn{height:var(--cc-h);font-size:21px;border-radius:16px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-or0{display:block!important;order:4;text-align:center;font-size:17px;color:#5f6368;margin:18px 0 10px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-duo{order:5;flex:none;display:flex;gap:12px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-duo a{height:var(--cc-h);font-size:19px;border-radius:16px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-max{background:#3353EF}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-duo a:hover{background:#0a0a0a}'
    + '@media(max-width:600px){'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box{--cc-h:56px;padding:18px 18px 20px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-head{margin:0 56px 12px 0}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-t{font-size:27px;line-height:1.14;margin:0 0 8px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-s{font-size:17px;margin:0 0 16px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-f{gap:10px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-f input{font-size:20px;padding:0 16px;border-radius:15px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-btn{font-size:19px;border-radius:15px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccl-or0{font-size:16px;margin:14px 0 8px}'
    + '.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-duo{gap:10px}.ccc-ov.ccl-classic.ccl-exit .ccc-box .ccc-duo a{font-size:18px;border-radius:15px}'
    + '}';

  function el(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  /* ===== состояние чата: история живёт в браузере, разговор продолжается на другой странице ===== */
  var LS = { get: function(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
             set: function(k, v){ try { localStorage.setItem(k, v); } catch (e) {} } };
  function rid(n){
    var a = new Uint8Array(n || 15); (window.crypto || window.msCrypto).getRandomValues(a);
    return btoa(String.fromCharCode.apply(null, a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  var state = { sid: '', msgs: [], next: 0, contactSent: false, online: true, unread: 0, esc: {} };
  function load(){
    try { var h = JSON.parse(LS.get(LS_HIST) || 'null');
      if (h && Array.isArray(h.msgs)) { state.msgs = h.msgs; state.next = h.next || 0; state.contactSent = !!h.contactSent; state.esc = h.esc || {}; } } catch (e) {}
    state.sid = LS.get(LS_SID) || '';
    // сообщение, которое не успело уйти до перехода на другую страницу, показываем как «не отправлено»
    state.msgs.forEach(function(m){ if (m.st === 'sending') m.st = 'fail'; });
  }
  function save(){
    state.msgs = state.msgs.slice(-60);
    LS.set(LS_HIST, JSON.stringify({ msgs: state.msgs, next: state.next, contactSent: state.contactSent, esc: state.esc }));
    if (state.sid) LS.set(LS_SID, state.sid);
  }
  function mskHour(){ return new Date(Date.now() + 3 * 3600 * 1000).getUTCHours(); }
  function bySchedule(){ var h = mskHour(); return h >= 8 && h < 22; }

  /* ===== плавающие кнопки не закрывают кнопки страницы (06.10.2026, аудит адаптивности, волна 3) =====
     Корень: на телефоне 360 px пилюля «Чат» (212×50) и кружок-видео (88 px) занимают 346 из 360 px низа экрана и
     накрывали цены, кнопки квиза «300+», CTA героя. Раз в прокрутку (и каждые 2 с) проверяем точками сетки 3×3,
     что лежит ПОД кнопкой: если это ссылка, кнопка, поле, подпись поля или раскрывашка страницы, кнопка уезжает
     за ближний край экрана; место освободилось, вернулась. Виджеты регистрируются через window.__ccDodgeAdd
     (кружок-видео _shared/ng-krug.html кладёт себя в очередь window.__ccDodgeQ, если этот файл ещё не загружен).
     07.10.2026: виджет с w.__ccAll проверяется и на компьютере, с w.__ccTxtAll ещё и на текст под ним на любой прокрутке
     (кружок с акцией на главной, _shared/promo-krug.html: он не ложится ни на текст, ни на кнопки). */
  var DODGE_SEL='a[href],button,input,select,textarea,label,summary,[role="button"],[onclick],.t-btn,.t-submit';
  var dodgeW=[];
  function ctlAt(w,x,y){                                                                    // кнопка или ссылка страницы сразу под точкой
    var st=document.elementsFromPoint ? document.elementsFromPoint(x,y) : [];
    for (var k=0;k<st.length;k++) {
      var e=st[k];
      if (e===document.documentElement||e===document.body) return false;
      if (w.contains(e) || (e.closest && e.closest('.cc-root,.ngk,.pkr,.ccc-ov'))) continue;   // свои и соседние виджеты
      var it=e.closest && e.closest(DODGE_SEL);
      if (it && getComputedStyle(it).visibility==='hidden') continue;                       // невидимая старая кнопка (остатки прежнего чат-бота)
      if (it) { var q=it.getBoundingClientRect(); if (!(q.width>innerWidth*.9 && q.height>innerHeight*.6)) return true; }   // не обёртка во весь экран
      return false;                                                                         // смотрим только то, что сразу под кнопкой
    }
    return false;
  }
  /* 06.10.2026 (приёмка 390×844): на первом экране главной пилюля «Чат · менеджер онлайн» лежала на строке «Ранняя
     бронь до 31 октября…». Пока кнопка стоит над первым экраном страницы, она не ложится и на текст: строка под пилюлей,
     кнопка сжимается до кружка с фото менеджера; кружок тоже на тексте или кнопке, уезжает за край, как от кнопок.
     Прокрутили дальше первого экрана: обычная пилюля, уезжает только от кнопок и ссылок, как раньше. Текст ищем точками
     сетки (см. dodgeBusy): символ видимого текста под точкой (caretPositionFromPoint / caretRangeFromPoint) = строка. */
  var cRg=null;
  function textAt(x,y){
    var n=null, off=0;
    try {
      if (document.caretPositionFromPoint) { var cp=document.caretPositionFromPoint(x,y); if (cp) { n=cp.offsetNode; off=cp.offset; } }
      else if (document.caretRangeFromPoint) { var cr=document.caretRangeFromPoint(x,y); if (cr) { n=cr.startContainer; off=cr.startOffset; } }
    } catch (e) { return false; }
    if (!n || n.nodeType!==3 || !/\S/.test(n.data)) return false;
    var pe=n.parentElement; if (!pe || (pe.closest && pe.closest('.cc-root,.ngk,.pkr,.ccc-ov'))) return false;
    cRg=cRg||document.createRange();
    for (var o=Math.max(0,off-1); o<=Math.min(n.length-1,off); o++) {                     // каретка стоит до или после символа под точкой
      cRg.setStart(n,o); cRg.setEnd(n,o+1);
      var rs=cRg.getClientRects();
      for (var i=0;i<rs.length;i++) { var q=rs[i]; if (q.width>0 && x>=q.left-2 && x<=q.right+2 && y>=q.top && y<=q.bottom) return true; }
    }
    return false;
  }
  function ctlTop(x,y){   // то же для режима «первый экран»: свои кнопки уже прозрачны (cc-probe), хватает верхнего элемента
    var e=document.elementFromPoint(x,y);
    if (!e || e===document.documentElement || e===document.body || (e.closest && e.closest('.cc-root,.ngk,.pkr,.ccc-ov'))) return false;
    var it=e.closest && e.closest(DODGE_SEL); if (!it || getComputedStyle(it).visibility==='hidden') return false;
    var q=it.getBoundingClientRect(); return !(q.width>innerWidth*.9 && q.height>innerHeight*.6);
  }
  function dodgeBusy(w,L,T,W,H,txt){
    /* обычный режим: сетка 3×3, только кнопки и ссылки (как было). Первый экран: ещё и текст, точки с шагом до 16 px
       (строка не ниже 16 px и видимый кусок слова шире 16 px не проскочат; шаг 26 px в WebKit пропустил «чаще всего» у края) */
    var nx=txt ? Math.max(3,Math.ceil(W/16)) : 3, ny=txt ? Math.max(3,Math.ceil(H/16)) : 3;
    for (var i=1;i<=nx;i++) for (var j=1;j<=ny;j++) {
      var x=txt ? L+2+(W-4)*(i-1)/(nx-1) : L+W*i/4, y=txt ? T+2+(H-4)*(j-1)/(ny-1) : T+H*j/4;
      if (x<0||y<0||x>=innerWidth||y>=innerHeight) continue;
      if (txt ? (ctlTop(x,y) || textAt(x,y)) : ctlAt(w,x,y)) return true;
    }
    return false;
  }
  function unionRect(w, sel, dx){   // рамка виджета вместе с потомками (или только потомков по sel), без сдвига dodge (dx)
    var els=sel ? [].slice.call(w.querySelectorAll(sel)) : [w].concat([].slice.call(w.querySelectorAll('*'))), l=1e9, t=1e9, r=-1e9, b=-1e9;
    els.forEach(function(e){ var q=e.getBoundingClientRect(); if (!q.width || !q.height) return;
      l=Math.min(l,q.left); t=Math.min(t,q.top); r=Math.max(r,q.right); b=Math.max(b,q.bottom); });
    return r<l ? {L:0,T:0,W:0,H:0} : {L:l-dx, T:t, W:r-l, H:b-t};
  }
  function dodgeCheck(){
    var mq = window.innerWidth <= 980;
    dodgeW.forEach(function(w){
      var on=false, mini=false;
      if ((mq || w.__ccAll) && !w.hidden && !document.documentElement.classList.contains('ccl-open') && !(w.closest && w.closest('.ccl-open'))) {
        if (getComputedStyle(w).position!=='fixed') return;   // стили ещё не применились (WebKit, пока грузятся CSS страницы): проверим позже
        var r=w.getBoundingClientRect(), m=getComputedStyle(w).transform, dx=0;
        if (m && m!=='none') { var mm=m.match(/matrix\(([^)]+)\)/); if (mm) dx=parseFloat(mm[1].split(',')[4])||0; }
        var L=r.left-dx, T=r.top, W=r.width, H=r.height, R=L+W;
        if (w.__ccTxt) { if (w.classList.contains('ccl-mini')) { W=w.__ccFullW||W; L=R-W; } else w.__ccFullW=W; }   // считаем по полной пилюле
        w.__ccSide = w.__ccSide || ((L + W/2) > innerWidth/2 ? 'r' : 'l');
        if (w.__ccTxtAll) {                                                                     // кружок с акцией (_shared/promo-krug.html): текст и кнопки на любой ширине и прокрутке
          /* меряем всё, что видно у виджета, вместе с частями, вынесенными за его рамку (крестик, плашка, облачко). Под
             виджетом текст или кнопка: если свободно место под главной частью (w.__ccCoreSel, кружок с крестиком), прячем
             только подпись (класс w.__ccMiniCls, подпись visibility:hidden, рамка не меняется), иначе уезжает весь */
          var u=unionRect(w, null, dx);
          dodgeW.forEach(function(x){ x.classList.add('cc-probe'); });
          if (dodgeBusy(w,u.L,u.T,u.W,u.H,true)) {
            var c=w.__ccCoreSel && w.__ccMiniCls ? unionRect(w, w.__ccCoreSel, dx) : null;
            if (c && c.W && !dodgeBusy(w,c.L,c.T,c.W,c.H,true)) mini=true; else on=true;
          }
          dodgeW.forEach(function(x){ x.classList.remove('cc-probe'); });
        } else if (w.__ccTxt && (window.scrollY||window.pageYOffset||0) + T < innerHeight) {   // кнопка над первым экраном страницы
          dodgeW.forEach(function(x){ x.classList.add('cc-probe'); });                          // свои кнопки не мешают искать текст под ними
          if (dodgeBusy(w,L,T,W,H,true)) { mini=true; if (dodgeBusy(w,R-H,T,H,H,true)) { on=true; mini=false; } }
          dodgeW.forEach(function(x){ x.classList.remove('cc-probe'); });
        } else on=dodgeBusy(w,L,T,W,H,false);
      }
      if (w.__ccTxt) w.classList.toggle('ccl-mini', mini);
      if (w.__ccMiniCls) w.classList.toggle(w.__ccMiniCls, mini);
      w.classList.toggle('cc-dodge-r', on && w.__ccSide==='r');
      w.classList.toggle('cc-dodge-l', on && w.__ccSide==='l');
    });
  }
  var dodgeT=0, dodgeRaf=0;
  function dodgeSoon(){
    if (!dodgeRaf) dodgeRaf=requestAnimationFrame(function(){ dodgeRaf=0; dodgeCheck(); });
    clearTimeout(dodgeT); dodgeT=setTimeout(dodgeCheck, 160);
  }
  function dodgeAdd(w){
    if (!w || dodgeW.indexOf(w)>=0) return;
    dodgeW.push(w);
    if (dodgeW.length===1) {
      window.addEventListener('scroll', dodgeSoon, {passive:true});
      window.addEventListener('resize', dodgeSoon);
      document.addEventListener('click', function(){ setTimeout(dodgeCheck, 350); }, true);
      setInterval(function(){ if (!document.hidden) dodgeCheck(); }, 2000);
    }
    /* 07.10.2026: кружок с акцией (__ccTxtAll) проверяется чаще: под ним едут ленты и сдвигается вёрстка, когда догружаются
       картинки выше (замер: за 2 с между проверками строка успевала заехать под плашку −15%) */
    if (w.__ccTxtAll && !w.__ccFast) {
      w.__ccFast=setInterval(function(){ if (!document.hidden && !w.hidden) dodgeCheck(); }, 700);
      document.addEventListener('load', function(e){ if (e.target && e.target.tagName==='IMG' && !w.hidden) dodgeSoon(); }, true);
    }
    /* первая проверка сразу и без анимации: кнопка не мелькает поверх текста, чтобы потом уехать */
    w.classList.add('cc-noanim'); dodgeCheck();
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ w.classList.remove('cc-noanim'); }); });
    dodgeSoon();
  }
  window.__ccDodgeAdd = dodgeAdd;
  window.__ccDodgeNow = dodgeCheck;   // 07.10.2026: виджет только что показан, проверить сразу, до первой отрисовки (кружок с акцией)

  function init(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

    var fab=el('<button class="ccc-fab ccl-fab cc-root" aria-label="Открыть чат с менеджером Каталист">'
      + '<span class="ccl-fava"><img src="' + MGR.photo + '" alt="" width="42" height="42"><i class="ccl-dot"></i></span>'
      + '<span class="ccl-flbl">Чат · менеджер онлайн</span><b class="ccl-badge" hidden>1</b></button>');
    document.body.appendChild(fab);
    fab.__ccTxt=true;   // кнопка чата бережёт и текст первого экрана (см. textAt)
    dodgeAdd(fab);
    (window.__ccDodgeQ||[]).forEach(dodgeAdd); window.__ccDodgeQ={push:dodgeAdd};   // кружок-видео и др., пришедшие раньше

    var ov=el('<div class="ccc-ov cc-root"><div class="ccc-fr"><div class="ccc-box" role="dialog" aria-label="Связаться с Каталист">'
      + '<button class="ccc-x" aria-label="Закрыть">✕</button>'
      + '<div class="ccl-head"><span class="ccl-ava"><img src="' + MGR.photo + '" alt="' + MGR.name + ', менеджер Каталист" width="56" height="56"><i class="ccl-dot"></i></span>'
      +   '<div class="ccl-who"><b>' + MGR.name + '</b><span class="ccl-st"><i></i><em class="ccl-stt" style="font-style:normal">Менеджер онлайн</em></span></div></div>'
      + '<div class="ccl-chat">'
      +   '<div class="ccl-feed" role="log" aria-live="polite"></div>'
      +   '<form class="ccl-in" autocomplete="off"><input class="ccl-hp" name="ccl_x" tabindex="-1" autocomplete="off" aria-hidden="true">'
      +   '<textarea rows="1" placeholder="Напишите вопрос менеджеру" aria-label="Сообщение менеджеру" maxlength="1000"></textarea>'
      +   '<button class="ccl-send" type="submit">Отправить</button></form></div>'
      + '<div class="ccl-alt">'
      + '<div class="ccl-gotl">Контакт у менеджера: он свяжется с вами. Вопрос можно дописать ниже.</div>'
      + '<div class="ccc-t">Посчитаем смету за 10 минут</div>'
      + '<div class="ccc-s">Напишите в мессенджер или оставьте телефон: пришлём расчёт под ваше число участников и дату. Отвечаем ежедневно с 8:00 до 22:00.</div>'
      + '<div class="ccc-hours"><i></i>Отвечаем ежедневно с 8:00 до 22:00</div>'
      + '<div class="ccc-hits"></div>'
      + '<div class="ccc-promo"></div><img class="ccc-pimg" alt="" loading="lazy">'
      + '<div class="ccc-or ccl-or0">или напишите в мессенджер</div>'
      + '<div class="ccc-duo"><a class="ccc-tg" href="'+TG+'" target="_blank" rel="noopener">Telegram</a>'
      + '<a class="ccc-max" href="'+MAX+'" target="_blank" rel="noopener">Max</a></div>'
      + '<div class="ccc-or">или оставьте вопрос и телефон</div>'
      + '<form class="ccc-f">'
      + '<textarea name="question" rows="2" maxlength="300" placeholder="Ваш вопрос или задача: дата, число гостей, формат" aria-label="Ваш вопрос или задача"></textarea>'
      + '<input name="contact" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required>'
      + '<div class="ccc-err">Проверьте телефон: нужно минимум 10 цифр</div>'
      + '<button type="submit" class="ccc-btn">Перезвоните мне</button>'
      + '<div class="ccc-done">Спасибо! Заявка у менеджера, он свяжется с вами.</div>'
      + '</form></div>'
      + '<button type="button" class="ccl-tochat"><i></i>Есть вопрос? Задайте его в чате</button>'
      + '</div></div></div>');
    document.body.appendChild(ov);

    /* 04.10.2026 (Маша): поп-ап говорит о том, с какой кнопки его открыли. Кнопка передаёт
       data-cc-title / data-cc-text / data-cc-btn / data-cc-topic (их читает _lead.js), тема уходит
       менеджеру в заявку. Без параметров остаётся общий текст «Посчитаем смету за 10 минут». */
    var tEl=ov.querySelector('.ccc-t'), sEl=ov.querySelector('.ccc-s'), bEl=ov.querySelector('.ccc-f .ccc-btn');
    var DEF={t:tEl.textContent, s:sEl.textContent, b:bEl.textContent}, topic='';
    /* 04.10.2026 (Маша): «про акции сделай отдельный поп-ап». Список акций живёт ТОЛЬКО здесь: любая кнопка
       с data-cc-preset="akcii" открывает его, текст правится в одном месте для всего сайта. */
    var PRESETS={akcii:{title:'Наши акции 🎁', btn:'Хочу акцию', topic:'Акции и спецпредложения',
      text:'Выберите, что подходит, и оставьте контакты: расскажем условия и посчитаем смету с учётом акции.',
      img:'/catalyst-home-archive-2026-10-22/img/akcii/futbolka-showrunner-600.webp', imgAlt:'Фирменная футболка агентства «Каталист» с надписью SHOWRUNNER',
      list:[['−15%','Новый год 2027 со скидкой 15%','При заказе новогоднего корпоратива в октябре. Дату держим без предоплаты.'],
            ['−50%','Второй тимбилдинг за полцены','Скидка 50% на второй тимбилдинг в течение года после первого.'],
            ['+1','Год развития команды: тимбилдинг в подарок','Заказываете «Команду 365» на год: дарим тимбилдинг и 2 клуба на выбор (книжный, беговой, театральный и другие).'],
            ['1 мес','Месяц книжного клуба в подарок','При заказе программы для руководителей: месяц книжного клуба для всей команды.'],
            ['мерч','Фирменный мерч к любому тимбилдингу','Фирменные футболки «Не ушёл рано» с надписью SHOWRUNNER для всей команды в подарок.']]}};
    var pEl=ov.querySelector('.ccc-promo'), piEl=ov.querySelector('.ccc-pimg'), boxEl=ov.querySelector('.ccc-box');
    var frEl=ov.querySelector('.ccc-fr'), xEl=ov.querySelector('.ccc-x');
    boxEl.addEventListener('scroll', function(){ frEl.classList.toggle('ccc-fr-sc', boxEl.scrollTop>4); }, {passive:true});
    function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    var isOpen=false, openedAt=0;

    /* 06.10.2026: хиты с фото, как карточки постов в поп-апе Telegram-канала. На компьютере видны
       первые три, на телефоне все лентой. Фото реальные, 480×320 WebP, грузятся при первом открытии.
       Кнопки про Новый год показывают новогодние пакеты, остальные показывают тимбилдинги-хиты. */
    var HITS={
      team:[['Фестиваль Фудтраков','festival-fudtrakov'],['WOW Башня','wow-bashnya'],['Гонки Формула 1','formula-1'],['WOW Пицца','wow-pizza'],['Мегаполис','megapolis']],
      /* 06.10.2026 (Маша): «Камерный» = торт с бенгальскими огнями, «Большой праздник» = салют. Те же файлы, что
         у этих пакетов в меню «Новый год 2027» (_shared/menu_ny.py), чтобы картинка везде была одна. */
      ng:[['Камерный Новый\u00a0год','/catalyst-home-archive-2026-10-22/img/novyj-god/ng-salym-07-w600.webp'],['Новый\u00a0год компании','ng-kompanii'],['Большой праздник','/catalyst-home-archive-2026-10-22/img/korporativ/korporativ-katalist-61-w600.webp'],['Торт с\u00a0фонтанами','ng-tort']]
    };
    var hitsEl=ov.querySelector('.ccc-hits'), hitsKey='';
    function hitsKeyOf(o){ return o.hits || (/нов(ый|ого|ому|ым)\s+год|новогодн/i.test((o.topic||'')+' '+(o.title||'')) ? 'ng' : 'team'); }
    function paintHits(o){
      var key=hitsKeyOf(o);
      if (hitsKey===key) return; hitsKey=key; hitsEl.textContent='';
      HITS[key].forEach(function(h){
        var f=document.createElement('figure'); f.className='ccc-hit';
        var i=document.createElement('img'); i.src=h[1].charAt(0)==='/' ? h[1] : '/catalyst-home-archive-2026-10-22/chat/img/hits/'+h[1]+'.webp'; i.alt=''; i.width=480; i.height=320; i.decoding='async';
        var c=document.createElement('figcaption'); c.textContent=h[0];
        f.appendChild(i); f.appendChild(c); hitsEl.appendChild(f);
      });
    }
    /* Зелёный акцент в заголовке, как «интересное» у Telegram-поп-апа: первое совпадение по списку.
       Строим узлами (textContent), разметка из data-cc-title не исполняется. */
    var ACCENT=[/за\s+\d+\s+минут[уы]?/i, /утром,?\s+до\s+\d+:\d\d/i, /«[^»]{2,60}»/, /[−-]?\d+\s?%/, /нов(?:ый|ого|ому|ым)\s+год|новогодн[а-яё]*/i,
      /\d[\d\s-]*\s+гост(?:ей|я|ь)/i, /тимбилдинг[а-яё]*/i, /корпоратив[а-яё]*/i, /акци[а-яё]*/i, /смет[а-яё]*/i];
    function paintTitle(t, green){
      tEl.textContent='';
      var gi=green ? t.indexOf(green) : -1;   // 07.10.2026: окно ухода передаёт зелёную часть сам («Давайте мы вам позвоним»)
      if (gi>=0) { var gg=document.createElement('span'); gg.className='g'; gg.textContent=green;
        tEl.appendChild(document.createTextNode(t.slice(0,gi))); tEl.appendChild(gg); tEl.appendChild(document.createTextNode(t.slice(gi+green.length))); return; }
      for (var k=0;k<ACCENT.length;k++) { var m=ACCENT[k].exec(t); if (!m) continue;
        var g=document.createElement('span'); g.className='g'; g.textContent=m[0].length<=24 ? m[0].replace(/\s+/g,'\u00a0') : m[0]; // короткий акцент не рвём: неразрывные пробелы (nowrap в WebKit мешал переносу перед ним)
        tEl.appendChild(document.createTextNode(t.slice(0,m.index))); tEl.appendChild(g); tEl.appendChild(document.createTextNode(t.slice(m.index+m[0].length)));
        return; }
      tEl.textContent=t;
    }
    /* Кнопка без своих data-cc-*: общий «Посчитаем смету за 10 минут» не показываем (правило Маши
       04.10.2026), собираем заголовок и тему из того, что нажали, и из названия страницы. */
    function pageName(){
      var p=location.pathname; if (p==='/'||p==='/index.html') return '';
      var og=document.querySelector('meta[property="og:title"]');
      var t=((og&&og.content)||document.title||'').replace(/\s*[—|·:].*$/,'').replace(/^🔥\s*/,'').trim();
      return (!t || t.length>40 || /каталист/i.test(t)) ? '' : t;
    }
    function fallback(o){
      var pg=pageName(), src=String(o.src||'').replace(/\s+/g,' ').trim().slice(0,60), tail=(src?' · кнопка «'+src+'»':'')+(pg?' · '+pg:'');
      if (o.kind==='kp') return {title:'Пришлём КП за 10 минут', btn:'Получить КП', topic:'КП за 10 минут'+tail,
        text:'Напишите задачу, дату и число гостей: пришлём коммерческое предложение с программой и сметой за 10 минут. Отвечаем ежедневно с 8:00 до 22:00.'};
      if (o.kind==='lead') return {title:'Перезвоним за 10 минут', btn:'Перезвоните мне', topic:'Заявка'+tail,
        text:'Оставьте телефон: менеджер уточнит задачу, дату и число гостей и пришлёт подборку программ со сметой.'};
      return {title:pg ? 'Рассчитаем «'+pg+'»' : 'Подберём программу и посчитаем смету', btn:'Получить смету', topic:'Расчёт сметы'+tail,
        text:'Напишите дату и число гостей: пришлём подборку программ и смету за 10 минут. Отвечаем ежедневно с 8:00 до 22:00.'};
    }

    /* 06.10.2026 (Маша): текст поп-апа смысловыми строками, главное зелёным (деньги и «за 10 минут»),
       «Отвечаем ежедневно с 8:00 до 22:00» вынесено в отдельную строку под текстом (.ccc-hours).
       Только оформление: если шаблон не совпал, текст остаётся как есть. Узлы через textContent. */
    var HOURS_RE=/\s*Отвечаем ежедневно с 8:00 до 22:00\.?/g;
    var TXT_ACCENT=/от\s+\d[\d\s]*(?:до\s+\d[\d\s]*)?₽|за\s+\d+\s+минут[уы]?|до\s+\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)|скидк[а-яё]*\s+\d+\s?%/g;
    function paintText(t){
      t=String(t||'').replace(HOURS_RE,'').trim();
      sEl.textContent='';
      var parts=t.replace(/([.!?])\s+(?=[А-ЯЁA-Z«])/g, '$1\n').split('\n');
      parts.forEach(function(line){
        line=line.trim(); if (!line) return;
        var p=document.createElement('span'); p.className='ccc-p';
        var last=0, m; TXT_ACCENT.lastIndex=0;
        while ((m=TXT_ACCENT.exec(line))) {
          p.appendChild(document.createTextNode(line.slice(last, m.index)));
          var g=document.createElement('span'); g.className='g'; var gt=m[0].trim(); g.textContent=gt.length<=24 ? gt.replace(/\s+/g,'\u00a0') : gt; p.appendChild(g);
          if (/\s$/.test(m[0])) p.appendChild(document.createTextNode(' '));
          last=m.index+m[0].length;
        }
        p.appendChild(document.createTextNode(line.slice(last)));
        sEl.appendChild(p);
      });
    }
    /* Страница программы и её название. Название берём из каталога меню (menu-search.js, url → имя,
       его собирает _shared/menu_v1.py), а не из og:title: там «Бизнес игра», «Экипаж в Москве» и т. п.
       Каталог грузится общим загрузчиком window.mvLoad только на страницах программ и только при показе. */
    var PROG_RE=/^\/teambuilding\/vse-programmy\/(?!c\/)[^/]+\/?$|^\/startap_business_game\/?$|^\/programmy\/ecoferma\/?$/;
    var IS_PROG = typeof window.__ccIsProg==='boolean' ? window.__ccIsProg : PROG_RE.test(location.pathname);
    function progLabel(cb){
      var path=location.pathname.replace(/\/?$/,'/'), fin=false, t=0;
      function done(n){ if (fin) return; fin=true; clearTimeout(t); cb(n||''); }
      function look(){ var D=window.__MV_DATA__; if (!D || !D.programs) return '';
        for (var i=0;i<D.programs.length;i++) if (D.programs[i].url===path) return D.programs[i].name; return ''; }
      var n=look(); if (n) return done(n);
      var el=document.querySelector('[data-src*="menu-search.js"]'), src=el ? el.getAttribute('data-src') : '';
      t=setTimeout(function(){ done(look()); }, 3000);
      try { if (src && typeof window.mvLoad==='function') window.mvLoad(src, function(){ done(look()); }); else done(''); } catch (e) { done(''); }
    }
    /* 06.10.2026 (Маша): автопоп-ап сильнее зовёт к действию, формула 4U: польза (расчёт и смета с ценой за
       гостя), срочность (за 30 минут, ранняя бронь до 31 октября), уникальность (под вашу команду, ваш Новый
       год, ваша программа), конкретика (цифры). Заголовок зависит от страницы. Ночью «за 30 минут» было бы
       неправдой: менеджер на связи с 8:00, поэтому «утром, до 9:00». Тексты вызова не используем. */
    /* 07.10.2026 (Маша): «Когда я пытаюсь выйти с сайта, появляется значок про Telegram, а мне надо, чтобы появлялось:
       «Не нашли вариант? Давайте мы вам позвоним»». Ночью «за 10 минут» было бы неправдой: «перезвоним утром». */
    function exitContent(){
      return {exit:true, hits:'team', title:'Не нашли вариант? Давайте мы вам позвоним', green:'Давайте мы вам позвоним',
        text: state.online ? 'Перезвоним за 10 минут и подберём программу под вашу задачу.' : 'Перезвоним утром и подберём программу под вашу задачу.',
        btn:'Перезвоните мне', topic:'Уход с сайта: «Не нашли вариант? Давайте мы вам позвоним» · ' + (location.pathname||'/')};
    }
    function autoContent(o){
      if (o.exit) return exitContent();
      var p=location.pathname.toLowerCase(), when=state.online ? 'за 30 минут' : 'утром, до 9:00';
      var base={btn:'Получить расчёт', topic:(o.topic||'Автопоп-ап') + ' · ' + (p||'/'), hits:'team'};
      var pick='Назовите дату и число гостей: подберём 3 программы из 50+ авторских и пришлём смету с ценой за гостя. Бесплатно и без обязательств.';
      if (p==='/'||p==='/index.html') return Object.assign(base, {title:'Пришлём расчёт тимбилдинга под вашу команду '+when, text:pick});
      if (/novogod|novyi-god|novyj-god|new-year|zimn/.test(p)) return Object.assign(base, {hits:'ng',
        title:'Пришлём расчёт вашего Нового года '+when,
        text:'Ранняя бронь до 31 октября: скидка 15% и дата без предоплаты. Площадка, программа, ведущий и шоу одной сметой с ценой за гостя.'});
      if (IS_PROG) return Object.assign(base, {
        title:o.prog ? 'Пришлём расчёт «'+(o.prog.length<=24 ? o.prog.replace(/\s+/g,'\u00a0') : o.prog)+'» на вашу дату '+when : 'Пришлём расчёт этой программы на вашу дату '+when,   // название не рвём
        text:'Сценарий и смета с ценой за гостя под вашу команду. Сразу проверим, свободна ли ваша дата.'});
      if (/korporativ/.test(p)) return Object.assign(base, {title:'Пришлём расчёт вашего корпоратива '+when,
        text:'Назовите дату и число гостей: подберём площадку и программу и пришлём смету с ценой за гостя. Бесплатно и без обязательств.'});
      return Object.assign(base, {title:'Пришлём расчёт вашего праздника '+when, text:pick});
    }

    /* ---- мягкий автопоп-ап. Вызов без нажатия кнопки (блок «Новый год 2027» через 30 секунд в подборках)
       раньше всплывал сразу, на телефоне посреди прокрутки, и через 15 секунд за ним выскакивал Telegram.
       Теперь: один авто-поп-ап за визит вместе с Telegram-поп-апом; не показываем, если человек уже открывал
       поп-ап сам или оставил заявку; ждём, пока он 2 секунды не листает, не печатает и не открыто меню или
       другое окно. Нажатие кнопки _lead.js отмечает в window.__ccCtaAt: такие открытия идут сразу. ---- */
    var SS={ get:function(k){ try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set:function(k,v){ try { sessionStorage.setItem(k,v); } catch (e) {} } };
    var lastMove=0, lastGesture=0;
    window.addEventListener('scroll', function(){ lastMove=Date.now(); }, {passive:true});
    window.addEventListener('touchmove', function(){ lastMove=Date.now(); }, {passive:true});
    ['pointerdown','keydown','touchend'].forEach(function(t){ document.addEventListener(t, function(){ lastGesture=Date.now(); }, true); });
    function isManual(o){
      if (o.chat===true || o.auto===false) return true;
      if (o.auto===true) return false;
      var at=window.__ccCtaAt;
      return typeof at==='number' ? Date.now()-at<6000 : Date.now()-lastGesture<1500; // старый _lead.js из кеша: по жесту
    }
    function autoDone(){ return SS.get('ccTgShown') || SS.get('ccAutoPop') || SS.get('ccManualPop') || SS.get('ccLeadSent') || hasMine(); }
    function autoBusy(){
      if (isOpen || document.hidden || document.querySelector('.cctg-ov')) return true;
      var a=document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
      try { if (getComputedStyle(document.body).overflowY==='hidden' || getComputedStyle(document.documentElement).overflowY==='hidden') return true; } catch (e) {} // открыто меню или окно
      return Date.now()-lastMove<2000;
    }
    var autoO=null, autoT=0;
    function autoTry(){
      autoT=0; if (!autoO) return;
      if (autoDone()) { autoO=null; return; }
      if (autoBusy()) { autoT=setTimeout(autoTry, 700); return; }
      var o=autoContent(autoO); autoO=null;
      SS.set('ccAutoPop','1'); window.__ccExitShown=true;
      show(o);
    }

    /* 06.10.2026 (решение Маши): на страницах программ свой мягкий автопоп-ап про программу, он заменяет там
       Telegram-поп-ап (tg-popup.js не показывается при window.__ccIsProg). Телефон: 40 секунд на странице и
       прокрутка хотя бы на 30%. Компьютер: курсор ушёл к верху окна (собрался закрыть вкладку) не раньше 10 секунд.
       Дальше те же правила мягкого показа: один за визит, пауза в прокрутке, не поверх меню и формы. */
    if (IS_PROG) (function(){
      var t0=Date.now(), deep=0, fired=false, phone=window.matchMedia && matchMedia('(max-width:760px)').matches;
      function depth(){ var h=document.documentElement.scrollHeight-window.innerHeight; return h>0 ? (window.scrollY||window.pageYOffset||0)/h : 1; }
      function go(){ if (fired) return; fired=true; clearInterval(iv);
        if (autoDone()) return;
        progLabel(function(name){ open({auto:true, prog:name, topic:'Автопоп-ап на странице программы' + (name ? ': ' + name : '')}); }); }
      window.addEventListener('scroll', function(){ var d=depth(); if (d>deep) deep=d; }, {passive:true});
      var iv=setInterval(function(){ if (phone && !document.hidden && Date.now()-t0>=40000 && deep>=0.3) go(); }, 1000);
      if (!phone) document.documentElement.addEventListener('mouseleave', function(e){ if (e.clientY<=40 && Date.now()-t0>=10000) go(); });
    })();

    /* 07.10.2026 (Маша): уход с сайта = «Не нашли вариант? Давайте мы вам позвоним» вместо поп-апа Telegram-канала
       (chat/tg-popup.js больше не показывается сам). Все страницы, кроме страниц программ (там свой поп-ап про программу).
       Компьютер (мышь): курсор ушёл к верху окна (вкладки, адрес, крестик), не раньше 5 секунд на странице. Окно сразу,
       если в эту секунду не открыто другое окно или меню и человек не печатает; иначе ждём следующего ухода.
       Телефон и планшет (ухода курсором нет): резкий жест вверх, к адресной строке (экран и больше за 0,7 с), когда
       прочитана четверть страницы и прошло 15 секунд, либо 45 секунд на странице, как раньше у Telegram-поп-апа. Окно
       по общим правилам мягкости: в паузе прокрутки, не поверх меню, окна и набора текста.
       Один авто-поп-ап за визит; не показываем после заявки и если человек сам открывал поп-ап или писал в чат. */
    if (!IS_PROG) (function(){
      var t0=Date.now(), done=false, fine=!!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
      function exitNow(){
        if (done) return;
        if (autoDone()) { done=true; return; }
        if (Date.now()-t0<5000 || isOpen || document.querySelector('.cctg-ov')) return;
        var a=document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
        try { if (getComputedStyle(document.body).overflowY==='hidden' || getComputedStyle(document.documentElement).overflowY==='hidden') return; } catch (e) {}   // открыто меню
        done=true; SS.set('ccAutoPop','1'); window.__ccExitShown=true;
        show(exitContent());
      }
      if (fine) {
        document.addEventListener('mouseout', function(e){ if (!e.relatedTarget && e.clientY<=12) exitNow(); });
        document.documentElement.addEventListener('mouseleave', function(e){ if (e.clientY<=40) exitNow(); });
        return;
      }
      var deep=0, hist=[], iv=0;
      function soft(){ if (done) return; done=true; clearInterval(iv); if (!autoDone()) open({auto:true, exit:true}); }
      window.addEventListener('scroll', function(){
        if (done) return;
        var y=window.scrollY||window.pageYOffset||0, h=document.documentElement.scrollHeight-innerHeight, now=Date.now();
        if (h>0 && y/h>deep) deep=y/h;
        hist.push([now,y]); while (hist.length && now-hist[0][0]>700) hist.shift();
        if (now-t0>=15000 && deep>=0.25 && hist[0][1]-y>=innerHeight) soft();
      }, {passive:true});
      iv=setInterval(function(){ if (!document.hidden && Date.now()-t0>=45000) soft(); }, 1000);
    })();

    function open(o){
      o=(o && typeof o==='object' && !o.target) ? o : {};
      if (!isManual(o)) { autoO=o; clearTimeout(autoT); autoTry(); return; }
      if (o.chat!==true) SS.set('ccManualPop','1');
      autoO=null; clearTimeout(autoT);
      show(o);
    }
    function show(o){
      var pr=o.preset&&PRESETS[o.preset]; if(pr){o={title:pr.title,text:pr.text,btn:pr.btn,topic:pr.topic,list:pr.list,img:pr.img,imgAlt:pr.imgAlt}}
      /* Чат открывает только кнопка справа внизу (и строка «Задайте его в чате»). Кнопки страницы
         («Рассчитать стоимость», data-cc-*, акции) открывают поп-ап заявки с формой телефона. */
      var chatMode=o.chat===true;
      if (!chatMode && !o.title) { var fb=fallback(o); o={title:fb.title, text:o.text||fb.text, btn:o.btn||fb.btn, topic:o.topic||fb.topic, hits:o.hits}; }
      ov.classList.toggle('ccl-chatm', chatMode); ov.classList.toggle('ccl-classic', !chatMode);
      ov.classList.toggle('ccl-exit', !chatMode && o.exit===true);   // 07.10.2026: окно ухода с сайта (exitContent)
      var hasList=!chatMode && !!(o.list&&o.list.length);
      boxEl.classList.toggle('pr',hasList); ov.classList.toggle('prov',hasList);
      pEl.innerHTML=hasList?o.list.map(function(x){return '<div class="ccc-pi"><i>'+esc(x[0])+'</i><div><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span></div></div>'}).join(''):'';
      if(hasList&&o.img){piEl.src=o.img;piEl.alt=o.imgAlt||''}
      if (!chatMode) { paintTitle(o.title||DEF.t, o.green); paintText(o.text||DEF.s); if (!hasList) paintHits(o); }
      else { tEl.textContent=o.title||DEF.t; sEl.textContent=o.text||DEF.s; }
      boxEl.classList.toggle('ccc-ng', !chatMode && !hasList && hitsKeyOf(o)==='ng');
      frEl.classList.toggle('ccc-fr-ng', boxEl.classList.contains('ccc-ng')); frEl.classList.toggle('ccc-fr-pr', hasList);
      if (chatMode) { if (xEl.parentNode!==boxEl) boxEl.insertBefore(xEl, boxEl.firstChild); }   // окно чата: крестик в коробке, как было
      else if (xEl.parentNode!==frEl) frEl.insertBefore(xEl, boxEl);                             // поп-ап заявки: крестик в рамке, не уезжает при прокрутке
      if(!bEl.disabled) bEl.textContent=chatMode ? 'Перезвоните мне' : (o.btn||DEF.b);
      topic=chatMode ? 'Чат: перезвоните мне' : (o.topic||'');
      boxEl.scrollTop=0; frEl.classList.remove('ccc-fr-sc');
      ov.classList.add('on'); isOpen=true; openedAt=Date.now();
      document.documentElement.classList.toggle('ccl-open', chatMode);
      goal('form_popup');
      if (chatMode) { state.unread=0; paintBadge(); render(); kick();
        if (window.matchMedia && matchMedia('(pointer:fine)').matches) setTimeout(function(){ try{ ta.focus(); }catch(e){} }, 60); }
    }
    function close(){ ov.classList.remove('on'); isOpen=false; document.documentElement.classList.remove('ccl-open'); }
    window.CatalystContact = { open: open, close: close }; // CTA-кнопки страницы открывают этот поп-ап
    fab.addEventListener('click', function(){ if (isOpen && ov.classList.contains('ccl-chatm')) close(); else open({chat:true}); });
    ov.querySelector('.ccc-x').addEventListener('click', close);
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown', function(e){ if (e.key==='Escape' && isOpen) close(); });

    var form=ov.querySelector('.ccc-f');
    /* 07.10.2026 (Маша): в окне чата сначала одна крупная кнопка «Перезвоните мне». Первое нажатие показывает поле
       телефона (обычной отправки нет: скрытое обязательное поле браузер не пропустил бы), второе отправляет номер. */
    bEl.addEventListener('click', function(e){
      if (!ov.classList.contains('ccl-chatm') || ov.classList.contains('ccl-cbo')) return;
      e.preventDefault(); ov.classList.add('ccl-cbo'); try { form.contact.focus(); } catch (e2) {}
    });

    /* Маска телефона (Маша 31.07): клиент вводит только цифры, скобки и дефисы ставим сами.
       8 в начале превращаем в 7 — люди набирают по привычке. Вставка из буфера тоже разбирается. */
    var phone=form.contact;
    function maskPhone(raw){
      var d=(raw||'').replace(/\D/g,'');
      if(!d) return '';
      if(d[0]==='8') d='7'+d.slice(1);
      else if(d[0]==='9') d='7'+d;
      else if(d[0]!=='7') d='7'+d;
      d=d.slice(0,11);
      var out='+7';
      if(d.length>1) out+=' ('+d.slice(1,4);
      if(d.length>=5) out+=') '+d.slice(4,7);
      if(d.length>=8) out+='-'+d.slice(7,9);
      if(d.length>=10) out+='-'+d.slice(9,11);
      return out;
    }
    phone.addEventListener('input', function(){
      var atEnd = phone.selectionStart === phone.value.length;
      phone.value = maskPhone(phone.value);
      if(atEnd){ var n=phone.value.length; try{ phone.setSelectionRange(n,n); }catch(e3){} }
    });
    /* префикс на фокусе НЕ подставляем: набранная следом восьмёрка вставала второй цифрой
       и «89261234567» превращалось в «+7 (892) 612-34-56» (поймано живым прогоном 31.07) */
    phone.addEventListener('blur', function(){ if(phone.value.replace(/\D/g,'').length<2) phone.value=''; });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var contact=(form.contact.value||'').trim();
      var err=form.querySelector('.ccc-err');
      if(contact.replace(/\D/g,'').length<10){ err.style.display='block'; return; } // только телефон, минимум 10 цифр
      err.style.display='none';
      /* Правка 03.08.2026: раньше «Спасибо» показывалось и цель засчитывалась СРАЗУ, не дожидаясь
         ответа приёмника. При сбое человек уходил довольным, а заявки не было, и Метрика при этом
         рисовала достижение цели — то есть данные о конверсии врали. Теперь ждём ответ. */
      var btn=form.querySelector('.ccc-btn');
      var btnText=btn.textContent;
      btn.disabled=true; btn.textContent='Отправляем…';
      if (ov.classList.contains('ccl-chatm')) {   // окно чата: телефон уходит менеджеру вместе с перепиской
        postContact(maskPhone(contact), function(okc){ btn.disabled=false; btn.textContent=btnText;
          if (okc) { goal('form_callback'); form.contact.value=''; contactDone(); } else fail(); });
        return;
      }
      function ok(duplicate){
        if(!duplicate){ goal('form_callback'); goal('lead_sent'); } SS.set('ccLeadSent','1'); // заявка есть: авто-поп-апы на этом визите не нужны
        btn.style.display='none';
        form.contact.style.display='none'; form.question.style.display='none';
        var dn=form.querySelector('.ccc-done');
        dn.textContent='Спасибо! Заявка у менеджера: ' + (state.online ? 'перезвоним в течение 10 минут.' : 'перезвоним утром, с 8:00.');
        dn.style.display='block';
      }
      function fail(){
        btn.disabled=false; btn.textContent=btnText;
        err.textContent='Не удалось отправить. Напишите нам в Telegram или Max: ответим сразу.';
        err.style.display='block';
      }
      try{
        fetch(LEAD_URL, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name:'Заявка с сайта', phone:contact,   // 07.10.2026 (Маша): поля «Имя» нет, приёмник имя не требует
            task:(form.question.value||'').trim().slice(0,300),   // 06.10.2026 (Маша): видимое поле «Ваш вопрос или задача»
            comment:'Контакт клиента: ' + contact + ' · заявка из поп-апа «Связаться»' + (topic ? ' · тема: ' + topic : ''),
            page:location.pathname, referer:location.href, title:document.title }), keepalive:true })
          .then(function(r){ return r.ok ? r.json().catch(function(){ return {ok:false}; }) : null; })
          .then(function(d){ if(d && d.ok===true) ok(d.duplicate); else fail(); })
          .catch(function(){ fail(); });
      }catch(e2){ fail(); }
    });

    /* ===================== ЧАТ ===================== */
    var feed=ov.querySelector('.ccl-feed');
    var inForm=ov.querySelector('.ccl-in'), ta=inForm.querySelector('textarea'), hp=inForm.querySelector('.ccl-hp');
    var badge=fab.querySelector('.ccl-badge'), flbl=fab.querySelector('.ccl-flbl'), stt=ov.querySelector('.ccl-stt');
    var typingEl=null;

    function hasMine(){ for (var i=0;i<state.msgs.length;i++) if (state.msgs[i].from==='me') return true; return false; }
    function setOnline(on){
      state.online=!!on;
      fab.classList.toggle('ccl-off', !on); ov.classList.toggle('ccl-off', !on);
      flbl.textContent = on ? 'Чат · менеджер онлайн' : 'Чат · ответим с 8:00';
      stt.textContent = on ? 'Менеджер онлайн' : 'Ваш менеджер';   // 07.10.2026 (Маша): без «На связи с 8:00» в окне
    }
    function paintBadge(){ badge.hidden = !state.unread; badge.textContent = String(Math.min(state.unread, 9)); }

    function hhmm(ts){ var d=new Date(ts); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
    function bubble(cls, text, meta){
      var b=document.createElement('div'); b.className='ccl-m '+cls; b.textContent=text;
      if (meta) { var m=document.createElement('span'); m.className='ccl-meta'; m.appendChild(document.createTextNode(meta)); b.appendChild(m); }
      return b;
    }
    function card(m){
      var c=document.createElement('div'); c.className=state.contactSent ? 'ccl-card' : 'ccl-card ask';
      var p=document.createElement('p'); p.textContent=m.text; c.appendChild(p);
      if (state.contactSent) { var d=document.createElement('p'); d.style.margin='0'; d.style.color='#0aba59'; d.style.fontWeight='700'; d.textContent='Контакт отправлен'; c.appendChild(d); return c; }
      var f=document.createElement('form'); f.setAttribute('autocomplete','on');
      var i=document.createElement('input'); i.name='contact'; i.type='text'; i.placeholder='Телефон или @ник'; i.autocomplete='tel'; i.setAttribute('aria-label','Телефон или ник в Telegram');
      var b=document.createElement('button'); b.type='submit'; b.textContent='Отправить';
      var er=document.createElement('div'); er.className='ccl-cerr'; er.textContent='Нужен телефон (10 цифр) или ник в Telegram через @';
      f.appendChild(i); f.appendChild(b); c.appendChild(f); c.appendChild(er);
      f.addEventListener('submit', function(e){ e.preventDefault(); sendContact(i.value, er, b); });
      return c;
    }
    function render(){
      feed.textContent='';
      var lastCard=-1; state.msgs.forEach(function(m, i){ if (m.kind==='ask_contact') lastCard=i; });
      state.msgs.forEach(function(m, i){
        if (m.from==='me') {
          var b=bubble('me'+(m.st==='fail'?' fail':''), m.text, m.st==='fail' ? (m.err || 'Не отправлено.') : (m.st==='sending' ? 'Отправляем…' : hhmm(m.ts)));
          if (m.st==='fail' && !m.err) { var r=document.createElement('button'); r.type='button'; r.className='ccl-retry'; r.textContent='Повторить';
            r.addEventListener('click', function(){ m.st='sending'; save(); render(); queue(m); }); b.lastChild.appendChild(r); }
          feed.appendChild(b);
        } else if (m.from==='mgr') feed.appendChild(bubble('mgr', m.text, (m.name||MGR.name) + ' · ' + hhmm(m.ts)));
        else if (m.from==='ai') feed.appendChild(bubble('ai', m.text, 'ИИ-помощник · ' + hhmm(m.ts)));
        else if (m.kind==='ask_contact') { if (i===lastCard && state.contactSent) feed.appendChild(card(m)); } // одна карточка контакта, последняя
        else { var s=document.createElement('div'); s.className='ccl-sys'; s.textContent=m.text; feed.appendChild(s); }
      });
      if (typingEl) feed.appendChild(typingEl);
      if (lastCard>=0 && !state.contactSent) feed.appendChild(card(state.msgs[lastCard])); // ждёт контакт: всегда под последним сообщением
      ov.classList.toggle('ccl-talk', state.msgs.length>0 || !!typingEl);   // лента видна, когда есть разговор
      ov.classList.toggle('ccl-gotc', !!state.contactSent);
      feed.scrollTop = hasMine() ? feed.scrollHeight : 0; // до первого вопроса видно приветствие
    }
    function push(m){ state.msgs.push(m); save(); if (!isOpen && m.from!=='me') { state.unread++; paintBadge(); } render(); }
    // записка «передал менеджеру» не повторяется, пока не ответил менеджер или ИИ
    function note(text){
      for (var i=state.msgs.length-1;i>=0;i--) { var m=state.msgs[i];
        if (m.from==='me') continue;
        if (m.from==='sys' && !m.kind && m.text===text) return;
        break; }
      push({ from:'sys', ts:Date.now(), text:text });
    }
    function typing(who){
      if (who) { typingEl=document.createElement('div'); typingEl.className='ccl-typing';
        var s=document.createElement('span'); s.innerHTML='<i></i><i></i><i></i>'; typingEl.appendChild(s);
        typingEl.appendChild(document.createTextNode(who + ' печатает')); }
      else typingEl=null;
      render();
    }

    /* ввод */
    function grow(){ var b=ov.classList.contains('ccl-chatm') ? (window.innerWidth<=600 ? 76 : 88) : 56;
      ta.style.height=b+'px'; ta.style.height=Math.min(Math.max(ta.scrollHeight+3, b), 170)+'px'; }
    ta.addEventListener('input', grow);
    ta.addEventListener('keydown', function(e){
      if (e.key==='Enter' && !e.shiftKey && window.matchMedia && matchMedia('(pointer:fine)').matches) { e.preventDefault(); inForm.requestSubmit ? inForm.requestSubmit() : inForm.dispatchEvent(new Event('submit')); }
    });
    inForm.addEventListener('submit', function(e){ e.preventDefault(); var t=ta.value.trim(); if (!t) return; ta.value=''; grow(); sendText(t); });
    ov.querySelector('.ccl-tochat').addEventListener('click', function(){ open({chat:true}); });

    function sendText(text){
      text=String(text).slice(0,1000);
      if (!state.sid) state.sid=rid();
      var first=!hasMine();
      var m={ id:rid(9), from:'me', text:text, ts:Date.now(), st:'sending' };
      push(m);
      if (first) goal('chat_message');
      /* 06.10.2026 (Маша): «написала „хочу Новый год“, контакт никто не взял, ушла с сайта». Сразу после вопроса
         просим телефон или ник, карточка держится внизу ленты, пока контакт не оставлен. Если контакт уже
         в самом сообщении, сервер сам заведёт сделку (d.lead) и карточка не нужна. */
      if (!state.contactSent && !hasContact(text) && !state.msgs.some(function(x){ return x.kind==='ask_contact'; }))
        push({ from:'sys', kind:'ask_contact', ts:Date.now(), text:ASK });
      queue(m);
    }
    function hasContact(t){ t=String(t||''); return t.replace(/\D/g,'').length>=10 || /(^|\s)@[A-Za-z][A-Za-z0-9_]{4,31}/.test(t) || /[\w.+-]+@[\w-]+\.[\w.-]+/.test(t); }

    /* ---------- доставка: /api/chat-live/, сообщения уходят строго по одному ---------- */
    function clientId(){ return window.__cclCid || ''; }
    try { if (typeof window.ym==='function') window.ym(91307646,'getClientID',function(id){ window.__cclCid=id||''; }); } catch (e) {}
    function utm(){ try{ var raw=localStorage.getItem('_utm_data'); if(!raw) return null; var d=JSON.parse(raw); return (d&&typeof d==='object')?d:null; }catch(e){ return null; } }
    function history(){ return state.msgs.filter(function(m){ return m.from==='me'||m.from==='mgr'||m.from==='ai'; }).slice(-30).map(function(m){ return { from:m.from, name:m.name||'', text:m.text }; }); }
    function prevOf(m){ var p=''; for (var i=0;i<state.msgs.length && state.msgs[i]!==m;i++) if (state.msgs[i].from==='me') p=state.msgs[i].text; return p.slice(0,300); }
    function api(method, body, qs){
      return fetch(LIVE_URL + (qs||''), body ? { method:method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) } : { method:method, cache:'no-store' })
        .then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
    }
    var chain=Promise.resolve();
    function queue(m){ chain=chain.then(function(){ return deliver(m); }); }
    var ERR={ rate:'Слишком часто. Подождите минуту.', limit:'Разговор слишком длинный: напишите в Telegram или Max.', long:'Слишком длинное сообщение.', spam:'Уберите ссылки из сообщения.' };
    function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
    function deliver(m){
      var prev=prevOf(m);
      var body={ a:'send', sid:state.sid, mid:m.id, text:m.text, prev:prev, page:location.pathname, ref:location.href, title:document.title,
                 hp:hp.value, ms:Date.now()-openedAt, cid:clientId(), utm:utm(), history:history() };
      /* связь сайта с сервером чата иногда рвётся на секунды: один тихий повтор, прежде чем показать
         «Не отправлено». Повтор безопасен: сервер узнаёт сообщение по mid и второй раз его не шлёт */
      return api('POST', body)
        .then(function(d){ return (d && (d.ok || ERR[d.error])) ? d : wait(1500).then(function(){ return api('POST', body); }); })
        .then(function(d){
          if (d && d.ok) {
            m.st=''; if (typeof d.online==='boolean') setOnline(d.online);
            if (d.lead && !state.contactSent) { state.contactSent=true; goal('chat_contact'); goal('lead_sent'); }
            save(); render();
            if (d.note) note(d.note);
            if (d.ai) return askAi(m, prev);
          } else { m.st='fail'; m.err=(d && ERR[d.error]) || ''; save(); render(); }
        })
        .then(function(){ kick(800); });
    }
    function askAi(m, prev){
      typing('ИИ-помощник');
      return api('POST', { a:'ai', sid:state.sid, mid:m.id, prev:prev, page:location.pathname, title:document.title }).then(function(d){
        typing(null);
        if (d && d.ok && d.msg && d.msg.seq===state.next+1) { state.next=d.msg.seq; push({ from:'ai', name:d.msg.name, text:d.msg.text, ts:d.msg.ts||Date.now() }); }
        else if (d && d.ok && d.note) note(d.note);
        kick(50);
      });
    }
    function sendContact(val, er, btn){
      val=String(val||'').trim();
      var okc = val.replace(/\D/g,'').length>=10 || /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(val) || /[\w.+-]+@[\w-]+\.[\w.-]+/.test(val);
      if (!okc) { er.style.display='block'; return; }
      er.style.display='none'; btn.disabled=true; btn.textContent='Отправляем…';
      if (/^[A-Za-z]/.test(val) && val.indexOf('@')<0) val='@'+val;
      postContact(val, function(ok){ if (ok) contactDone();
          else { btn.disabled=false; btn.textContent='Отправить'; er.textContent='Не удалось отправить. Напишите нам в Telegram или Max.'; er.style.display='block'; } });
    }
    /* Контакт из чата (карточка и верхний блок «Оставьте телефон»): сервер чата заводит сделку в AmoCRM
       вместе с перепиской. Сервер чата не ответил — шлём в приёмник заявок сайта, чтобы контакт не потерялся. */
    function postContact(val, cb){
      if (!state.sid) state.sid=rid();
      api('POST', { a:'contact', sid:state.sid, phone:val, page:location.pathname, ref:location.href, cid:clientId(), utm:utm(), hp:hp.value, history:history() })
        .then(function(d){
          if (d && d.ok) return cb(true);
          if (val.replace(/\D/g,'').length<10) return cb(false);
          var q=history().filter(function(m){ return m.from==='me'; }).map(function(m){ return m.text; }).join(' / ').slice(0,600);
          fetch(LEAD_URL, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
            body: JSON.stringify({ name:'Посетитель чата', phone:val, page:location.pathname, referer:location.href, title:document.title,
              comment:'Контакт из чата «Менеджер онлайн»: ' + val + (q ? ' · вопрос: ' + q : '') }) })
            .then(function(r){ return r.ok ? r.json().catch(function(){ return {ok:false}; }) : null; })
            .then(function(d2){ cb(!!(d2 && d2.ok!==false)); }).catch(function(){ cb(false); });
        });
    }
    function contactDone(){ state.contactSent=true; goal('chat_contact'); goal('lead_sent'); SS.set('ccLeadSent','1'); save(); render(); kick(300); }

    /* Опрос: окно открыто и вкладка видна — каждые 4 секунды; окно закрыто, но разговор был в последние
       30 минут — раз в 20 секунд (на кнопке появится «1»); иначе не опрашиваем.
       w = моё сообщение, на которое 2 минуты нет ответа менеджера: сервер один раз позовёт менеджера. */
    var pollT=null, failN=0;
    function kick(delay){ clearTimeout(pollT); pollT=setTimeout(tick, delay==null ? 50 : delay); }
    function waiting(){
      if (!state.online) return '';
      for (var i=state.msgs.length-1;i>=0;i--) { var m=state.msgs[i];
        if (m.from==='mgr') return '';
        if (m.from==='me') return (!m.st && !state.esc[m.id] && Date.now()-m.ts>=120000 && Date.now()-m.ts<3*3600000) ? m.id : ''; }
      return '';
    }
    function lastActivity(){ var t=0; state.msgs.forEach(function(m){ if (m.ts>t) t=m.ts; }); return t; }
    function tick(){
      var talking = state.sid && hasMine() && (Date.now() - lastActivity() < 30*60*1000);
      if (!isOpen && !talking) return;
      if (document.hidden) { pollT=setTimeout(tick, 15000); return; }
      var w = state.sid ? waiting() : '';
      api('GET', null, '?sid=' + encodeURIComponent(state.sid || '') + '&after=' + state.next + (w ? '&w=' + w : '')).then(function(d){
        if (d && d.ok) {
          failN=0;
          if (w) state.esc[w]=1;
          if (typeof d.online==='boolean') setOnline(d.online);
          (d.msgs||[]).forEach(function(m){ if (m.seq>state.next) { state.next=m.seq; push({ from:m.from, kind:m.kind, name:m.name, text:m.text, ts:m.ts||Date.now() }); } });
          save();
        } else failN++;
        var base = isOpen ? 4000 : 20000;
        pollT=setTimeout(tick, Math.min(base * Math.pow(2, failN), 60000));
      });
    }
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) kick(); });

    load();
    setOnline(bySchedule());
    render();
    paintBadge();
    if (state.sid && hasMine()) kick(2000); // разговор продолжается после перехода на другую страницу
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
