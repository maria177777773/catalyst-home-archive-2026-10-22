/* Каталист · поп-ап «Подпишись на Telegram» V1 (Маша 28.07.2026, выбрала V1 «Лента постов»).
   07.10.2026 (Маша): на уход с сайта теперь окно «Не нашли вариант? Давайте мы вам позвоним» (chat/contact-popup.js,
   exitContent), поэтому этот поп-ап сам больше не показывается. Остался для просмотра по ?tg=1 (/catalyst-home-archive-2026-10-22/_lead.js грузит файл
   только с этим параметром). Подписка на канал живёт в подвале, мобильном меню и карточке «Контакты» («Telegram-канал»).
   Прежние автотриггеры (уход курсором к верху окна на компьютере, 45 секунд на телефоне): git show 7f8adfd3:chat/tg-popup.js
   Разведён с поп-апом «Футболка» (window.__ccExitShown) — одновременно не показываются.
   Контент статичный (реальные фото + названия программ, без выдуманных офферов) — XSS невозможен. */
(function () {
  'use strict';
  if (window.__ccTgLoaded) return; window.__ccTgLoaded = true;

  var SS_KEY = 'ccTgShown', LS_KEY = 'ccTgClosedAt';
  var FORCE = /[?&](tg|telegram)=1(?:&|$)/.test(location.search);
  if (!FORCE) return; // 07.10.2026: сам не показывается, только просмотр по ?tg=1

  var CH = 'https://t.me/catalyst_agency';
  var IMG = '/catalyst-home-archive-2026-10-22/slides/';
  var POSTS = [
    { img: 'foodtrucks-hover.webp', t: '🎪 Фестиваль Фудтраков' },
    { img: 'bashnya-1.webp',        t: '🆕 WOW Башня, новинка' },
    { img: 'lm-formula-1.webp',     t: '🏁 Гонки Формула 1' }
  ];

  var K = 1.5; // ×1.5 (Маша 28.07, размер S2). Поменять размер = поменять это число.
  var css = ''
    + '.cctg-ov{position:fixed;inset:0;z-index:99990;background:rgba(10,10,10,.6);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s}'
    + '.cctg-ov.on{opacity:1}'
    + '.cctg{--k:' + K + ';position:relative;width:calc(440px*var(--k));max-width:96vw;background:#fff;border-radius:calc(24px*var(--k));box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden;font-family:Roboto,Arial,sans-serif}'
    + '.cctg-x{position:absolute;top:calc(12px*var(--k));right:calc(14px*var(--k));width:calc(34px*var(--k));height:calc(34px*var(--k));border:0;border-radius:50%;background:rgba(255,255,255,.9);font-size:calc(15px*var(--k));color:#0a0a0a;cursor:pointer;z-index:3}'
    + '.cctg-hd{display:flex;align-items:center;gap:calc(11px*var(--k));padding:calc(22px*var(--k)) calc(24px*var(--k)) calc(4px*var(--k))}'
    + '.cctg-lg{width:calc(46px*var(--k));height:calc(46px*var(--k));border-radius:50%;background:#229ED9;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.cctg-lg svg{width:calc(27px*var(--k));height:calc(27px*var(--k));fill:#fff}'
    + ".cctg-ch{font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:800;font-size:calc(18px*var(--k));color:#0a0a0a;line-height:1.1}"
    + '.cctg-ch small{display:block;font-family:Roboto;font-weight:400;font-size:calc(12px*var(--k));color:#8a9099;margin-top:calc(2px*var(--k))}'
    + ".cctg-h{font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:800;font-size:calc(24px*var(--k));line-height:1.16;color:#0a0a0a;padding:calc(15px*var(--k)) calc(24px*var(--k)) calc(4px*var(--k))}.cctg-h .g{color:#0aba59}"
    + '.cctg-s{font-size:calc(14px*var(--k));color:#5f6368;line-height:1.45;padding:calc(6px*var(--k)) calc(24px*var(--k)) calc(14px*var(--k))}'
    + '.cctg-row{display:flex;gap:calc(10px*var(--k));padding:0 calc(24px*var(--k)) calc(4px*var(--k))}'
    + '.cctg-c{flex:1;border:1px solid #eceff3;border-radius:calc(12px*var(--k));overflow:hidden;min-width:0}'
    + '.cctg-c img{width:100%;height:calc(82px*var(--k));object-fit:cover;display:block}'
    + '.cctg-c .t{font-size:calc(11px*var(--k));color:#0a0a0a;padding:calc(7px*var(--k)) calc(8px*var(--k));line-height:1.25;font-weight:500}'
    + ".cctg-btn{display:block;text-align:center;background:#229ED9;color:#fff;text-decoration:none;font-family:'TTCommonsPro',Roboto,sans-serif;font-weight:700;font-size:calc(16px*var(--k));padding:calc(15px*var(--k));border-radius:calc(14px*var(--k));margin:calc(14px*var(--k)) calc(24px*var(--k)) calc(20px*var(--k))}"
    + '.cctg-btn:hover{background:#1b8dc4}'
    + '@media(max-width:760px){.cctg{--k:1}}';

  function show() {
    try { sessionStorage.setItem(SS_KEY, '1'); } catch (e) {}
    window.__ccExitShown = true; // футболка уступит
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var svg = '<svg viewBox="0 0 24 24"><path d="M9.8 15.6l-.4 4c.5 0 .7-.2 1-.5l2.4-2.3 5 3.6c.9.5 1.6.3 1.8-.8l3.3-15.4c.3-1.3-.5-1.9-1.4-1.6L1.6 9.9c-1.3.5-1.3 1.2-.2 1.5l4.9 1.5L18 5.4c.5-.3 1-.2.6.2"/></svg>';
    var posts = POSTS.map(function (p) { return '<div class="cctg-c"><img src="' + IMG + p.img + '" alt=""><div class="t">' + p.t + '</div></div>'; }).join('');
    var ov = document.createElement('div'); ov.className = 'cctg-ov';
    ov.innerHTML = '<div class="cctg"><button class="cctg-x" aria-label="Закрыть">✕</button>'
      + '<div class="cctg-hd"><div class="cctg-lg">' + svg + '</div><div class="cctg-ch">Каталист<small>@catalyst_agency · Telegram-канал</small></div></div>'
      + '<div class="cctg-h">Всё самое <span class="g">интересное</span> читайте в нашем Telegram</div>'
      + '<div class="cctg-s">Спецпредложения, скидки, новинки и закулисье наших ивентов.</div>'
      + '<div class="cctg-row">' + posts + '</div>'
      + '<a class="cctg-btn" href="' + CH + '" target="_blank" rel="noopener">Перейти в канал</a></div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });
    function close() { try { localStorage.setItem(LS_KEY, Date.now()); } catch (e) {} ov.classList.remove('on'); setTimeout(function () { ov.remove(); }, 250); }
    ov.querySelector('.cctg-x').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.cctg-btn').addEventListener('click', function () { setTimeout(close, 100); });
  }

  window.__ccExitShown = true; show();
})();
