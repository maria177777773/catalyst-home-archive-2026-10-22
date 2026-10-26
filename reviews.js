/* выкатка 06.10.2026: рамка телефона серая, подпись «компания, имя, программа, участники» без дат */
/* Каталист · ЕДИНЫЙ источник отзывов (Маша 27.07.2026 — унификация 3 блоков в один).
   Новый отзыв = 1 правка: объект в массив CATALYST_REVIEWS ниже: s = скриншот, c = компания, n = имя (если есть),
   p = программа, u = число участников (числом), t = текст отзыва, если распознан. Дату и месяц не пишем
   (Маша 06.10.2026: «чтобы не было видно, что отзывы старые»). Потом:
       node _shared/build_reviews_static.mjs     (карточки и стили в общий блок _shared/reviews.html)
       python3 _shared/sync_reviews.py           (общий блок на все страницы)
   В браузере скрипт только оживляет готовую ленту: автопрокрутка влево, пауза, стрелки.
   Если на странице блока нет (старый слайдер #rec1350793681, otzyv-галерея, пустой #rvMount), строит ленту сам.
   05.10.2026: 109 отзывов (было 51): добавлены все скриншоты со страницы /reviews/ с её подписями.
   06.10.2026: подписи разложены по полям (компания, имя, программа, участники), даты из данных убраны. */
(function () {
  'use strict';
  if (window.__catalystReviewsDone) return; window.__catalystReviewsDone = true;
  var CATALYST_REVIEWS = [
    {s:'/catalyst-home-archive-2026-10-22/img/reviews/otzyv-18.webp',c:'F6',n:'Наталья',p:'Формула 1',u:350,t:'Спасибо ещё раз большое за ивент и крутой тимбилдинг, вышло очень здорово и на самом высшем уровне!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/1ff75d938b3e5547.webp',c:'Аэроклуб',n:'Людмила',p:'Гонки ракет',u:230,t:'Прошло всё отлично, была высокая вовлечённость от клиента, ведущий топ, на площадке всего хватало, и внимания, и материалов, заезды были с азартом по словам коллег.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/7fc40b017b80eb8e.webp',c:'Агентство «GCS»',n:'Дарья',p:'Мегаполис',u:150,t:'Спасибо большое всей команде за супер комфорт на всех этапах подготовки и реализации проекта. У меня не болела за тимбилдинг голова, я была спокойна за то, что всё пройдёт круто.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/c4576a50337c06f8.webp',c:'Агентство «Континент Экспресс»',p:'Мегаполис',u:100,t:'Всё как всегда было супер.'},
    {s:'/catalyst-home-archive-2026-10-22/img/reviews/otzyv-19.webp',c:'F6',n:'Наталья',p:'Формула 1',u:350},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/b52e708db71558d7.webp',c:'Агентство «GCS»',n:'Дарья',p:'Мегаполис',u:150,t:'Эдуард, спасибо большое за крутой тимбилдинг! Все в восторге.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/9b9f6d2296e8b53a.webp',c:'Компания «Элдис»',p:'Корпоратив',u:400,t:'Всё замечательно! Только положительная обратная связь от коллег. Ведущий очень понравился. Безмерно благодарны, вы и ваша команда большие молодцы! Приятно было работать, обязательно вернёмся к вам.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/e5a8043044f386d2.webp',c:'Компания ABLE',p:'Мегаполис',u:50,t:'Спасибо большое! Нам тоже с вами очень понравилось работать.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/fcdb6edd9695874e.webp',c:'Мастерская управления Сенеж',p:'WOW Пицца',u:200,t:'Спасибо большое! Всё получилось круто!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/1a036511a01f9879.webp',c:'ПАО «Совкомбанк»',p:'Новогодний корпоратив',u:600,t:'Спасибо всем огромное! Вы большие молодцы! Не сомневалась в вашем профессионализме, всё прошло на ура!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/6641c5bc66f81fdf.webp',c:'MGC GROUP',p:'Мегаполис',u:150,t:'Всё было безупречно. Вы лучшие! Спасибо вам огромное!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/5f2778e1448c17b9.webp',c:'Mice Mate',n:'Эльгина',p:'Мегаполис',u:200,t:'Валерий, спасибо вам огромное! Ваша команда отработала отлично.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/eb8d43d01e0afeee.webp',c:'Metiz',n:'Ирина',p:'Машина Голдберга',u:100,t:'Всё отлично, очень много позитивных отзывов, всё понравилось.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/207ef07b2f8f8ce2.webp',c:'Элевел',n:'Екатерина',p:'Фестиваль Фудтраков',u:150,t:'Спасибо огромное вашим ребятам за подход к работе, помощь в поиске наилучшего решения, вообще за всё. Мой руководитель тоже очень доволен.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/003f3cfc7e432569.webp',c:'Global Russia',n:'Юлия',p:'Мегаполис',u:130,t:'Спасибо вам всем большое! Вы крутые. Боюсь представить даже, что было бы, если бы не вы.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/aeaf2bb5dfa3a42a.webp',c:'Агентство Ом',n:'Ольга',p:'Мегаполис + Картина',u:160,t:'Какие же у тебя классные позитивные ребята, спасибо тебе большое за работу!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/0e83a72d287fb579.webp',c:'Metiz',n:'Светлана',p:'Машина Голдберга',u:100,t:'Всё прошло отлично. Спасибо вам и ребятам за работу, коллегам тоже всё понравилось, особенно, конечно, тимбилдинг.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/03ad489e34ad06a8.webp',c:'Агентство Мы',n:'Михаил',p:'Мегаполис',u:50,t:'Вы прекрасны! Только радость и восторг.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/8fc0784b0aa2e6e2.webp',c:'Metiz',n:'Ирина',p:'Мегаполис',u:100,t:'Всё отлично, очень много позитивных отзывов, всё понравилось.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/3892998468db5e4d.webp',c:'Аэроклуб',n:'Марина',p:'Art&Fun&Sport',u:160,t:'Хочу выразить благодарность вам, всем ребятам. Работать на площадке было сложно, спасибо за отзывчивость и терпение на всех этапах подготовки заезда, за готовность провести это всё в другом городе.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/0699872e7ce2d041.webp',c:'Аэроклуб',n:'Марина',p:'Нейрогалерея',u:130,t:'Всё прошло отлично! Клиенту формат нейрогалереи очень понравился, их приглашённые гости были в восторге! Будем предлагать теперь эту программу чаще. Ребята молодцы, готовность в срок, оперативное реагирование.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/b950f4d40f7084d2.webp',c:'Северсталь',n:'Алина',p:'WOW Пицца',u:130,t:'Хочу выразить огромную благодарность всей вашей команде за отлично проведённый тимбилдинг. Всё прошло чётко, слаженно и профессионально. Участники остались в полном восторге, формат оказался действительно ярким и вовлекающим.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/4ba8abfee939a38c.webp',c:'Интеррос',n:'Екатерина',p:'Мегаполис',u:100,t:'У вас очень хорошие приятные люди! Получил удовольствие от общения! Спасибо вам за проект! Спасибо большое за организацию и игру! Всё было классно, легко и атмосферно! Коллегам очень понравилось!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/9438087e2b987665.webp',c:'Mice Tours',n:'Максим',p:'Каннский фестиваль',u:150,t:'Всё огонь, всем понравилось.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/350bbb1237e2f9e5.webp',c:'Континент Экспресс',n:'Ирина',p:'Мегаполис',u:230,t:'Валерий просто потрясающий, всё проконтролировал, везде подстроился. Было видно, что народ был заинтересован. Спасибо большое, всё чётко, красиво.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/34cbef493b9d0b58.webp',c:'Аэроклуб',n:'Александр',p:'Нейрогалерея',u:100,t:'Им очень понравилось. При том какие они были въедливые, на самой программе все были в восторге.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/68fa8b571f64d121.webp',c:'Режиссерская версия',n:'Дарья',p:'Стартап',u:300,t:'Всё прекрасно, гости довольны остались.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/c4263b856c832e7a.webp',c:'ББО СВ',n:'Дарья',p:'Формула 1',u:100,t:'Вы какие-то волшебники, спасибо большое! Очень приятно работать с такой командой. Обязательно до новых встреч!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/f70ee94f2e431d9e.webp',c:'WhyNotEvent',n:'Надежда',p:'Мегаполис',u:350,t:'Наше мнение, что с вашей стороны всё было профессионально организовано. Я видела, что большинство людей вовлечены в процесс.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/6cf2e846c683356f.webp',c:'Совкомбанк',n:'Ольга',p:'Новогодний корпоратив',u:600,t:'Ребятушки, спасибо большое ещё раз! Вы большие молодцы! Очень рада сотрудничеству!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/3821114397850b90.webp',c:'Mice Tours',n:'Максим',p:'Машина Голдберга',u:100,t:'Да всё огонь! Задержали по вине заказчиков, но всё успели! Всё хорошо! Спасибо тебе большое!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/34eeb7ff03b82d15.webp',c:'Частный организатор',n:'Анастасия',p:'Стартап',u:60,t:'Всё отлично прошло. Гости в большом восторге.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/11f027373ca6f150.webp',c:'ВКонтакте',n:'Анастасия',p:'Нейрокалендарь',u:60,t:'Да, всё хорошо, все остались довольны.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/6ed6b95abef28284.webp',c:'Pepsico',n:'Светлана',p:'Стартап',u:30,t:'Спасибо вам большое за поддержку с проектом! Всё базово хорошо прошло.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/02b098bc846346d5.webp',c:'Аэроглобус',n:'Фрейя',p:'WOW Пицца',u:120,t:'Ваши ребята чудесно отработали. Респект. Пицца очень вкусная.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/2abfc09c7f750171.webp',c:'Utrace',n:'Мария',p:'Машина Голдберга',u:100,t:'Мероприятие прошло отлично, от коллег самая позитивная обратная связь, да и по моему опыту у вас уникальные квесты, супер что нашла ваше агентство.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/b8dc9da0f47460c4.webp',c:'Частный организатор',n:'Михаил',p:'Мегаполис',u:100,t:'Ребята ваши молодцы, приветливые, оперативные. Приятно было работать. Поступил отзыв от клиента: все счастливы. Спасибо вам за работу.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/f46d8e3a82a9b186.webp',c:'Экопси',n:'Алина',p:'Машина Голдберга',u:200,t:'С моей точки зрения замечаний нет, все остались довольны несмотря на погоду.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/3efa5280e2069b1c.webp',c:'ПКФ Регион',n:'Екатерина',p:'Цепная реакция',u:250,t:'Спасибо огромное вам и вашей команде. Всё прошло замечательно! Надеюсь, что ещё посотрудничаем, буду вас рекомендовать.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/3f51dce47acd5f41.webp',c:'Радиоприборснаб',n:'Анастасия',p:'Машина Голдберга',u:150,t:'Вчера было совещание по итогам тимбилдинга. Руководитель выразил благодарность. Всё понравилось и руководству, и коллективу. Действительно, получилась сплачивающая игра. Благодарим вашу команду за профессиональную организацию, хорошее настроение. Планируем дальнейшее сотрудничество.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/efc1efe2ea0244c1.webp',c:'Аэроклуб',n:'Георгий',p:'Машина Голдберга и Корпоративная картина',u:60,t:'Всё было супер! Спасибо тебе и твоей команде! Клиент доволен, все счастливы!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/881522ead572ab19.webp',c:'НПФ Беркут',n:'Дарья',p:'Формула 1',u:140,t:'Погода была отличная конечно! И от гонок мы все в приятном шоке. Чудесная программа, спасибо вам за праздник.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/5d1e1c5123d634d0.webp',c:'Газпром',n:'Снежана',p:'Корпоративная картина',u:400,t:'Комментариев никаких, организация безупречная. А вот отзывов много про тимбилдинг: кажется, он может поконкурировать с хэдлайнером за звание главного события.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/342bf468b76f96b0.webp',c:'Агентство Brooke',n:'Алина',p:'WOW Пицца',u:150,t:'У вас потрясающая команда. Я была очень спокойна за блок пиццы, когда увидела вашу работу. Это очень дорого стоит, когда на тебе блок активностей на фестивале в 2 500 человек.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/e0fc6c51fd2296aa.webp',c:'Конфест',n:'Мария',p:'Мегаполис + Мосты',u:400,t:'Всё отлично! Спасибо огромное! С вами было супер комфортно, минимум вопросов, максимум результата!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/c1b842d84ab4f4f6.webp',c:'Сравни.ру',n:'Анастасия',p:'Фестиваль Фудтраков',u:300,t:'Оценка мероприятия положительная от коллег. Мне понравилось с организационной стороны, как вы всё чётко сделали, спасибо вам! Со стороны смотрелось очень эпично и весело.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/1fd129d9b29622ed.webp',c:'Mice Tours',n:'Александр',p:'Мегаполис',u:200,t:'Да, всё отлично! Всем понравилось! Мне тоже, Валера молодец, очень внимательный и ответственный человек.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/a05d32267dbc5943.webp',c:'АО «НПК «Криптонит»',n:'Валерия',p:'Формула 1',u:400,t:'Обратная связь очень положительная. Всем, кто участвовал, очень понравилось. Отличный фидбек на тимбилдинг, несмотря на жару. Понравилась идея того, что обо всём надо догадаться самостоятельно.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/3a38a539c2c44a11.webp',c:'АО «НПК «Криптонит»',n:'Валерия',p:'Формула 1',u:400,t:'Ваша забота: организация зоны для охлаждения и работа с участниками в целом. Со стороны организатора отмечаю вашу чёткость, структурированность и гибкость. Были настойчивы там, где это требовалось, но всегда шли навстречу.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/f0fbcae305b1853a.webp',c:'АО «НПК «Криптонит»',n:'Валерия',p:'Формула 1',u:400,t:'Мне очень понравилось работать с вами. Ещё раз благодарю вас и всю команду за такую отточенную работу!'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/07dcdca7fe3ca627.webp',c:'Агентство Brooke',n:'Алина',p:'WOW Пицца',u:200,t:'Всё супер, клиенту очень нравилось, восторг! Без вас бы не было так круто и красочно.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/31af4826c67a54a0.webp',c:'Агентство 5 звезд',n:'Анна',p:'Фестиваль Фудтраков',u:90,t:'Спасибо огромное за проект! Всё сложилось и с погодой, и с клиентом, но с вами и не могло быть по-другому. Ребята все мега отзывчивые, понимающие и дружелюбные, за это отдельный респект.'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/29e7bafa6cb21975.webp',c:'ООО «ЭкспоТех»',n:'Настя',p:'Гонки на плотах',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/777f76c42bd708ba.webp',c:'Волмакс',n:'Валерия',p:'Мегаполис',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/02b37f7fcc090a48.webp',c:'ВТБ банк',n:'Анна',p:'WOW Пицца',u:150},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/d67808e7ee91a115.webp',c:'Event Expert',n:'Никита',p:'Мегаполис',u:300},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/5b53d1afe43567f3.webp',c:'Отель Les Art Resort',n:'Анна',p:'WOW Пицца, день рождения отеля',u:150},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/dfb9d71d4adc0ff9.webp',c:'H2H Agency',n:'Дарья',p:'Новые миры',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/cccd69d8a6fe2be9.webp',c:'Агентство «Marketing Division»',n:'Наталья',p:'Новые миры',u:80},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/8406543c0e9bcd5f.webp',c:'Агентство «Redday»',n:'Даниил',p:'Формула 1 на трассе в Сочи',u:340},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/b4ec0644915a5e23.webp',c:'Промстройконтракт',n:'Светлана',p:'Мегаполис с мостами',u:120},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/ddb9b7214a8dcd15.webp',c:'ООО «АИС»',n:'Юлия',p:'Нейрогалерея',u:150},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/7f7d0ce2d845a756.webp',c:'Бюро трансформаций бизнеса Т. Спурновой',p:'Мегаполис',u:30},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/29ce1d2150e4532d.webp',c:'Частный организатор',n:'Юлия',p:'Мегаполис',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/879765d1ac88c045.webp',c:'Агентство Лира',n:'Женя',p:'Мегаполис',u:200},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/563832cd677696d7.webp',c:'Агентство Worlds',p:'Машина Голдберга',u:150},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/56454d70c07d342b.webp',c:'Агентство Лира',n:'Женя',p:'Мегаполис',u:200},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/dba59a02da44581d.webp',c:'Агентство Изюм',n:'Женя',p:'Нейрогалерея',u:125},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/d005fb1810938773.webp',c:'ООО Мишн Фудс',n:'Любовь',p:'Сыроварня',u:50},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/46721ede66097184.webp',c:'ООО Бостик',n:'Полина',p:'Мегаполис',u:50},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/5fc391dd48321a5b.webp',c:'Континент Экспресс',n:'Юлия',p:'Мегаполис',u:85},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/16894f4eb1976607.webp',c:'Qevent',n:'Виктория',p:'Машина Голдберга',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/49c455f9882d0f16.webp',c:'ИПФМ',n:'Светлана',p:'Мегаполис',u:110},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/1510c2b86d834f0b.webp',c:'Red Agency',n:'Елизавета',p:'Нейрогалерея',u:35},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/1194b3fca0ec9af1.webp',c:'MySky',n:'Виктория',p:'Корпоративная картина',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/9aaca9e38397491d.webp',c:'Red Agency',n:'Елизавета',p:'Мегаполис и Квиз',u:65},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/277d77b4f34b17cc.webp',c:'Совкомбанк',p:'Новогодний тимбилдинг',u:600},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/6a34ac8e56f8088b.webp',c:'НТЦ СТЭК оператор',n:'Мария',p:'Мегаполис',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/80f2517976d9ae11.webp',c:'Иннопрактика',n:'Зарина',p:'Нейрогалерея',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/d6c04fe831f28b78.webp',c:'Салым Петролеум',p:'Новогодний тимбилдинг',u:500},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/d3030d570f6bdb3f.webp',c:'Фармпредикт',n:'Полина',p:'Программа ТВ Шоу',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/0a6650c686f6398f.webp',c:'Северсталь',n:'Динара'},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/8ab9d0b1543e5257.webp',c:'ООО «Легалтэк»',p:'Машина Голдберга',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/aa26ef1791ff2a2d.webp',c:'Сбер Университет',n:'Лусинэ',p:'Мегаполис',u:50},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/52508f3573309fcd.webp',c:'ArtBox',n:'Мария',p:'Фестиваль Фудтраков',u:85},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/4462ca5673ca9c3d.webp',c:'ADA-Symposium',n:'Карина',p:'Нейросети',u:110},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/ee3e16cf2aa074e0.webp',c:'Додо Пицца',n:'Алина',p:'WOW Пицца',u:110},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/54457f8a56e1bfb3.webp',c:'Аэроклуб',n:'Валерия',p:'Формула 1',u:150},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/5eed52de52965e39.webp',c:'Элевел',n:'Екатерина',p:'Мегаполис',u:140},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/fbfade1095d4ca2e.webp',c:'Континент Экспресс',n:'Мария',p:'WOW Пицца',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/439d1dff6e8fd044.webp',c:'Redday',n:'Людмила',p:'Мегаполис + Мосты',u:200},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/7bdbcd87970a1153.webp',c:'Аэроклуб',n:'Валерия',p:'Формула 1',u:160},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/0a418b4b3f3f3c6b.webp',c:'ФКС центр',n:'Нина',p:'Корпоративная картина',u:200},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/66d77989c87dad85.webp',c:'Континент Экспресс',n:'Дмитрий',p:'Фестиваль Фудтраков',u:300},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/f03bbbe3056137ba.webp',c:'Ent Services',n:'Александра',p:'Гонки Чаплина',u:55},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/38f221c6da44b534.webp',c:'X5 Group',p:'Мегаполис',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/ba30851dfab6b526.webp',c:'Why not Event',n:'Анна',p:'Цепная реакция',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/59519306dcf47b3c.webp',c:'Only People',n:'Ксения',p:'Фестиваль Фудтраков',u:50},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/601f3869746a82b3.webp',c:'Профсоюз Татарстана',n:'Альбина',p:'Формула 1',u:1400},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/4afa60d66d08d3bb.webp',c:'ВкусВилл',n:'Евгения',p:'Гонки на машинах Чаплина',u:60},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/bfc76da871804036.webp',c:'Johnson & Johnson',n:'Яна',p:'Корпоративная картина',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/8d655961913e3f4d.webp',c:'Аэроклуб',n:'Александр',p:'Мегаполис + Мосты',u:200},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/01fc1a3e3077ea9c.webp',c:'НСПК',n:'Альфия',p:'Мегаполис',u:120},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/d1a83e05e636a01c.webp',c:'ООО Продамус',p:'Мегаполис',u:85},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/8bb5ae58ab0a39a2.webp',c:'Campari',n:'Анастасия',p:'Корпоративная картина',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/df654572e7481120.webp',c:'Gymkids',n:'Алена',p:'Машина Голдберга',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/67a987160f3b7c50.webp',c:'SmartDeal',n:'Евгения',p:'Фестиваль Фудтраков',u:100},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/b6cdd491bfbeb425.webp',c:'Novaroll',n:'Татьяна',p:'Серия мероприятий',u:400},
    {s:'/catalyst-home-archive-2026-10-22/cdnasset/img/f3d4f170da2f1cf0.webp',c:'Агентство Мандариновая лиса',n:'Катерина',p:'Цепная реакция',u:150}
  ];

  /* Стили блока: короб 1400, лента, карточка-телефон, подпись «от кого».
     Этот же CSS сборщик _shared/build_reviews_static.mjs впечатывает в общий блок _shared/reviews.html
     (<style id="catalyst-rv-css">), поэтому здесь он нужен только страницам, где блока нет в HTML.
     Классы новые (rvp-*): старые правила .rv-card/.rv-track с !important на страницах их не задевают.
     05.10.2026, Маша: скриншоты в рамке телефона (обрезанный низ читается как край экрана),
     карточки крупнее (4 целиком на компьютере), подпись под каждым.
     06.10.2026, Маша: «очень контрастно сделал рамку чёрной, сделай серенькой, чуть сгладь»: корпус светло-серый
     с тонкой обводкой, скругления мягче; подпись: «компания, имя» и «программа · участники», без даты. */
  function injectCSS() {
    if (document.getElementById('catalyst-rv-css')) return;
    var css = ''
      + '.rvp-sec{padding:0;margin:0}'
      + '.rvp-sec .rv-wrap{position:relative;box-sizing:border-box;margin:0;padding-left:max(16px,calc((100% - 1400px)/2));padding-right:max(16px,calc((100% - 1400px)/2))}'
      + '.rvp-sec .rv-wrap .rv-wrap{padding-left:0;padding-right:0}'
      + '.rvp-track{display:flex;gap:24px;margin:0;padding:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;scroll-behavior:auto;overscroll-behavior-x:contain}'
      + '.rvp-track::-webkit-scrollbar{display:none}'
      /* карточка: 4 целиком в коробе 1400 (3 зазора по 24) */
      + '.rvp{flex:0 0 calc((100% - 72px)/4);min-width:0;margin:0;display:flex;flex-direction:column}'
      /* корпус телефона: светло-серый с тонкой обводкой, снизу «подбородок» с полоской «домой» */
      + '.rvp-phone{position:relative;display:block;margin:0;background:#eceef1;border:1px solid #dfe2e6;border-radius:44px;padding:10px 10px 34px;box-sizing:border-box}'
      + '.rvp-shot{display:block;width:100%;height:auto;aspect-ratio:9/16.5;object-fit:cover;object-position:top center;border-radius:34px;background:#f7f8fa}'
      + '.rvp-home{position:absolute;left:35%;right:35%;bottom:14px;height:5px;border-radius:3px;background:#c4c8ce}'
      /* подпись: компания, имя, программа и участники; высота подписи одна у всех карточек (три строки), чтобы низ ленты
         и отступ до следующего блока не зависели от того, какие карточки сейчас на экране */
      + ".rvp-cap{padding:16px 4px 0;min-height:88px;box-sizing:border-box;font-family:'Roboto',Arial,sans-serif}"
      /* первая строка: компания жирным и имя через запятую (две строки подписи, как было: высота ленты и отступы те же) */
      + '.rvp-who{font-size:18px;line-height:1.3;color:#0a0a0a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
      + '.rvp-co{font-weight:700}.rvp-nm{font-weight:400;color:#333}'
      + '.rvp-meta{font-weight:400;font-size:16px;line-height:1.35;color:#5f6368;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
      + '.rvp-meta b{font-weight:700;color:#0aba59;white-space:nowrap}'
      + '@media(max-width:1199px){.rvp{flex-basis:calc((100% - 48px)/3)}}'
      + '@media(max-width:900px){.rvp-track{gap:16px}.rvp{flex-basis:calc((100% - 16px)/2.3)}}'
      + '@media(max-width:640px){.rvp{flex-basis:78%}.rvp-phone{border-radius:38px;padding:8px 8px 28px}.rvp-shot{border-radius:30px}.rvp-home{bottom:11px}.rvp-who{font-size:17px}}'
      /* страницы без общего блока: контейнер старого слайдера ужимаем под ленту */
      + '#rec1350793681,#rec1350793681 .t396__artboard,#rec1350793681 .t396__filter,#rec1350793681 .t396__carrier{height:auto!important;min-height:0!important}'
      + '#rec1350793681 .t396__elem{display:none!important}';
    var st = document.createElement('style'); st.id = 'catalyst-rv-css'; st.textContent = css; document.head.appendChild(st);
  }

  function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }

  /* «350 участников»: число с неразрывным пробелом по разрядам и согласованием */
  function people(u) {
    var n = +u, a = n % 10, b = n % 100;
    var w = a === 1 && b !== 11 ? 'участник' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'участника' : 'участников';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0' + w;
  }

  /* Разметка одной карточки. Сборщик _shared/build_reviews_static.mjs повторяет её один в один
     (кроме width/height картинки: он берёт настоящие размеры файла).
     Автор: человек из компании (Person + worksFor) или сама компания (Organization). */
  function cardHTML(r) {
    var who = r.n ? r.c + ', ' + r.n : r.c;
    var meta = [r.p ? esc(r.p) : '', r.u ? '<b>' + people(r.u) + '</b>' : ''].filter(Boolean).join(' · ');
    var author = r.n
      ? '<div class="rvp-who" itemprop="author" itemscope itemtype="https://schema.org/Person">'
        + '<span class="rvp-co" itemprop="worksFor" itemscope itemtype="https://schema.org/Organization"><span itemprop="name">' + esc(r.c) + '</span></span>, '
        + '<span class="rvp-nm" itemprop="name">' + esc(r.n) + '</span></div>'
      : '<div class="rvp-who" itemprop="author" itemscope itemtype="https://schema.org/Organization">'
        + '<span class="rvp-co" itemprop="name">' + esc(r.c) + '</span></div>';
    return '<div class="rvp" itemscope itemtype="https://schema.org/Review">'
      + '<div class="rvp-phone"><img class="rvp-shot" src="' + esc(r.s) + '" alt="Отзыв: ' + esc(who) + '" loading="lazy" decoding="async" width="732" height="1340" data-vert-ok="review-screenshot">'
      + '<span class="rvp-home" aria-hidden="true"></span></div>'
      + '<div class="rvp-cap">' + author
      + (meta ? '<div class="rvp-meta">' + meta + '</div>' : '')
      + '</div></div>';
  }

  /* 07.10.2026 скорость (главная на телефоне 11 МБ до первого касания, из них 7 МБ — отзывы): копия карточки через
     cloneNode(true) в Chrome сразу начинает грузить свою картинку, хотя у неё loading="lazy" (замер: 109 скриншотов в первые
     секунды на каждой странице с лентой). Поэтому у копий и у карточек, собранных скриптом, адрес картинки лежит в data-rvsrc
     и ставится, когда карточка подъезжает к видимой части ленты (наблюдатель с корнем-лентой, запас в ширину ленты); дальше
     браузер грузит её сам лениво, когда лента близко к экрану. */
  function wake(track, byView) {
    var ims = Array.prototype.slice.call(track.querySelectorAll('img[data-rvsrc]'));
    function put(im) { var s = im.getAttribute('data-rvsrc'); if (s) { im.removeAttribute('data-rvsrc'); im.setAttribute('src', s); } }
    if (!byView || !('IntersectionObserver' in window)) { ims.forEach(put); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); put(e.target); } });
    }, { root: track, rootMargin: '0px 100% 0px 100%' });
    ims.forEach(function (im) { io.observe(im); });
  }

  function buildTrack() {
    var track = document.createElement('div'); track.className = 'rvp-track'; track.id = 'rvTrack'; track.dataset.auto = '1';
    track.innerHTML = CATALYST_REVIEWS.map(cardHTML).join('').replace(/<img class="rvp-shot" src=/g, '<img class="rvp-shot" data-rvsrc=');
    var wrap = document.createElement('div'); wrap.className = 'rv-wrap rv-mounted'; wrap.appendChild(track);
    return wrap;
  }

  /* Автопрокрутка: лента сама медленно едет влево, бесконечно и без рывка назад.
     05.10.2026, Маша: «сами немножечко крутятся влево». Стоит, пока на ленту навели мышь, её листают
     пальцем или по ней ходят с клавиатуры, пока блок вне экрана, и всегда при prefers-reduced-motion.
     Бесконечность: в конец ленты добавлена копия карточек; дойдя до копии, позиция незаметно
     отматывается ровно на длину одного круга (замер по реальному смещению копии, а не scrollWidth/2,
     иначе каждый круг давал скачок на ползазора). */
  function autoScroll(wrap) {
    var track = wrap.querySelector('.rvp-track');
    var kids = Array.prototype.slice.call(track.children);
    if (!kids.length) return null;
    kids.forEach(function (k) {
      // не cloneNode(true): копия <img loading="lazy"> в Chrome сразу начинает грузиться (109 скриншотов, 7 МБ при загрузке)
      var c = k.cloneNode(false);
      c.innerHTML = k.innerHTML.replace(/(<img\b[^>]*?)\ssrc=/g, '$1 data-rvsrc=');
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('itemscope'); c.removeAttribute('itemtype');
      Array.prototype.forEach.call(c.querySelectorAll('[itemprop],[itemscope]'), function (n) {
        n.removeAttribute('itemprop'); n.removeAttribute('itemscope'); n.removeAttribute('itemtype');
      });
      track.appendChild(c);
    });
    wake(track, true);
    // страничные правила (scroll-behavior:smooth, scroll-snap) мешают покадровой прокрутке
    track.style.scrollBehavior = 'auto'; track.style.scrollSnapType = 'none';
    var SPEED = 24;                 // пикселей в секунду: «немножечко»
    var first = kids[0], copy = track.children[kids.length];
    function period() { return copy.offsetLeft - first.offsetLeft || 1; }
    var pos = 0, last = 0, set = -1, anim = null;
    var hover = false, touch = false, focus = false, visible = false, holdUntil = 0;
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    // только настоящая мышь: на телефоне касание шлёт «наведение» без «ухода», и лента вставала навсегда
    wrap.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    wrap.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = false; });
    track.addEventListener('touchstart', function () { touch = true; }, { passive: true });
    track.addEventListener('touchend', function () { touch = false; holdUntil = Date.now() + 2500; }, { passive: true });
    track.addEventListener('touchcancel', function () { touch = false; holdUntil = Date.now() + 2500; }, { passive: true });
    wrap.addEventListener('focusin', function () { focus = true; });
    wrap.addEventListener('focusout', function () { focus = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.15 }).observe(track);
    } else { visible = true; }
    function wrapPos() { var p = period(); while (pos >= p) pos -= p; while (pos < 0) pos += p; }
    function apply() { track.scrollLeft = pos; set = track.scrollLeft; }
    function frame(t) {
      var dt = last ? Math.min(t - last, 100) : 0; last = t;
      // ленту сдвинули руками (палец, колесо, тачпад): продолжаем с того места, а не дёргаем назад
      if (set >= 0 && Math.abs(track.scrollLeft - set) > 2) { pos = track.scrollLeft; set = track.scrollLeft; anim = null; }
      if (anim) {
        var k = Math.min(1, (t - anim.t0) / anim.d), e = 1 - Math.pow(1 - k, 3);
        pos = anim.from + (anim.to - anim.from) * e;
        if (k >= 1) anim = null;
        var p = period(); if (pos >= p) { pos -= p; if (anim) { anim.from -= p; anim.to -= p; } }
        apply();
      } else if (visible && !hover && !touch && !focus && !mq.matches && Date.now() > holdUntil && dt) {
        pos += SPEED * dt / 1000; wrapPos(); apply();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // стрелки: плавный сдвиг на видимую ширину ленты от текущей позиции автопрокрутки
    return {
      go: function (dir) {
        var card = track.querySelector('.rvp');
        var w = card ? card.getBoundingClientRect().width : 300;
        var g = parseFloat(getComputedStyle(track).columnGap) || 0;
        var step = Math.max(1, Math.floor((track.clientWidth + g) / (w + g))) * (w + g);
        pos = track.scrollLeft; set = pos;
        if (dir < 0 && pos - step < 0) pos += period();
        anim = { from: pos, to: pos + dir * step, t0: performance.now(), d: 450 };
        holdUntil = Date.now() + 2500;
      }
    };
  }

  function mount() {
    // приоритет цели: явный маунт (общий блок _shared/reviews.html) → старый слайдер → otzyv-галерея
    var host = document.getElementById('rvMount');
    var mode = 'mount';
    if (!host) {
      var sld = document.getElementById('rec1350793681');
      if (sld) { host = sld; mode = 'slider'; }
    }
    if (!host) {
      var otzImg = document.querySelector('img[src*="/catalyst-home-archive-2026-10-22/img/reviews/otzyv-"]:not(.rvp-shot)');
      if (otzImg) {
        var cont = otzImg.closest('.rv-track') || otzImg.closest('.rv-wrap') || otzImg.closest('[class*="rv-"]');
        if (cont) { host = cont; mode = 'otzyv'; }
      }
    }
    if (!host) return;
    injectCSS();
    // карточки уже впечатаны в HTML сборщиком (нужно поисковику): не строим заново, только оживляем
    var pre = host.querySelector && host.querySelector('.rv-wrap.rv-mounted > .rvp-track');
    var wrap;
    if (pre && pre.children.length) {
      wrap = pre.parentNode;
    } else {
      wrap = buildTrack();
      if (mode === 'otzyv') host.parentNode.replaceChild(wrap, host);
      else { host.innerHTML = ''; host.appendChild(wrap); }
      wake(wrap.querySelector('.rvp-track'), false);
    }
    bindArrows(wrap, autoScroll(wrap));
    fitGaps(wrap);
  }

  /* Стрелки: в шапке общего блока (data-rvx, их обработчик зовёт window.__rvGo) и в старом
     заголовке #rec1350793661 на страницах, где общего блока ещё нет. */
  function bindArrows(wrap, api) {
    var track = wrap.querySelector('.rvp-track');
    if (!track) return;
    function go(dir) {
      if (api) { api.go(dir); return; }
      var card = track.querySelector('.rvp');
      track.scrollBy({ left: dir * (card ? card.getBoundingClientRect().width + 24 : 300), behavior: 'smooth' });
    }
    window.__rvGo = go;
    var host = document.getElementById('rec1350793661');
    if (!host) return;
    var left = host.querySelectorAll('.arrow-left, [class*="arrow-left"]');
    var right = host.querySelectorAll('.arrow-right, [class*="arrow-right"]');
    // классов arrow-left/arrow-right нет: берём картинки-стрелки и различаем их по положению
    if (!left.length && !right.length) {
      var cand = Array.prototype.slice.call(host.querySelectorAll('img'))
        .filter(function (im) { var r = im.getBoundingClientRect(); return r.width > 20 && r.width < 120; })
        .sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
      if (cand.length >= 2) { left = [cand[cand.length - 2]]; right = [cand[cand.length - 1]]; }
    }
    Array.prototype.forEach.call(left, function (el) {
      var t = el.closest('a, div') || el; t.style.cursor = 'pointer';
      t.addEventListener('click', function (e) { e.preventDefault(); go(-1); });
    });
    Array.prototype.forEach.call(right, function (el) {
      var t = el.closest('a, div') || el; t.style.cursor = 'pointer';
      t.addEventListener('click', function (e) { e.preventDefault(); go(1); });
    });
  }

  /* Канон секций: 140 px от визуального низа соседнего блока до заголовка «Более 500…» и от низа подписей
     ленты до следующего блока (на компьютере, от 1200 px). Общий блок стоит на 160+ страницах после очень
     разных блоков (карточки каталога, видео, текст фабрики), у которых низ контента не совпадает с краем
     контейнера, поэтому одной CSS-величиной канон не держится: меряем видимый контент соседей и
     доводим поля самого блока. Поправка больше 220 px считается ошибкой замера и не применяется. */
  var GAP = 140;
  function contentEdge(root, wantBottom) {
    var best = wantBottom ? -Infinity : Infinity;
    function take(r) {
      if (r.width < 4 || r.height < 4) return;
      best = wantBottom ? Math.max(best, r.bottom) : Math.min(best, r.top);
    }
    // обход с отсечением поддеревьев: скрытое, прозрачное и закреплённое на экране (кнопка «наверх»,
    // плавающие мессенджеры) в счёт не идёт вместе со всем содержимым
    (function walk(e) {
      var tag = e.tagName;
      if (/^(SCRIPT|STYLE|NOSCRIPT|META|LINK|BR|TEMPLATE)$/.test(tag)) return;
      var cs = getComputedStyle(e);
      if (cs.display === 'none' || +cs.opacity < 0.05 || cs.position === 'fixed' || cs.position === 'sticky') return;
      var r = e.getBoundingClientRect();
      if (cs.visibility !== 'hidden' && r.width && r.height) {
        var media = /^(IMG|SVG|VIDEO|IFRAME|BUTTON|INPUT|CANVAS|svg)$/.test(tag);
        var bg = (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'rgb(255, 255, 255)') || cs.backgroundImage !== 'none';
        var bd = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)';
        if (media || bg || bd) take(r);
        for (var k = e.firstChild; k; k = k.nextSibling) {
          if (k.nodeType === 3 && k.textContent.trim()) {
            var rg = document.createRange(); rg.selectNodeContents(k);
            var rs = rg.getClientRects(); for (var j = 0; j < rs.length; j++) take(rs[j]);
          }
        }
      }
      for (var c = e.firstElementChild; c; c = c.nextElementSibling) walk(c);
    })(root);
    return best;
  }
  // ближайший сосед с видимым содержимым (если соседей нет, поднимаемся к родителю)
  function neighbourEdge(el, before) {
    for (var node = el, hops = 0; node && node !== document.body && hops < 12; hops++) {
      var sib = before ? node.previousElementSibling : node.nextElementSibling;
      while (sib) {
        var edge = contentEdge(sib, before);
        if (isFinite(edge)) return edge;
        sib = before ? sib.previousElementSibling : sib.nextElementSibling;
      }
      node = node.parentElement;
    }
    return NaN;
  }
  function fitGaps(wrap) {
    var head = document.querySelector('#otzyvy.rvx'), h2 = head && head.querySelector('.rvx-h2');
    var sec = wrap.closest('.rvp-sec'), track = wrap.querySelector('.rvp-track');
    if (!head || !h2 || !sec || !track) return;
    function run() {
      head.style.marginTop = ''; sec.style.paddingBottom = '';
      if (window.innerWidth < 1200) return;
      var above = neighbourEdge(head, true);
      if (isFinite(above)) {
        var d1 = GAP - (h2.getBoundingClientRect().top - above);
        if (Math.abs(d1) > 2 && Math.abs(d1) < 220) head.style.marginTop = d1 + 'px';
      }
      var tr = track.getBoundingClientRect(), low = -Infinity;
      Array.prototype.forEach.call(track.querySelectorAll('.rvp-phone,.rvp-cap'), function (e) {
        var r = e.getBoundingClientRect(); if (r.right > tr.left && r.left < tr.right) low = Math.max(low, r.bottom);
      });
      var below = neighbourEdge(sec, false);
      if (isFinite(below) && isFinite(low)) {
        var d2 = GAP - (below - low);
        var pb = parseFloat(getComputedStyle(sec).paddingBottom) || 0;
        if (Math.abs(d2) > 2 && Math.abs(d2) < 220 && pb + d2 >= 0) sec.style.paddingBottom = (pb + d2) + 'px';
      }
    }
    var timer;
    function later() { clearTimeout(timer); timer = setTimeout(run, 250); }
    run();
    window.addEventListener('load', later);
    window.addEventListener('resize', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    setTimeout(run, 2500);
    // ленивые картинки выше и ниже догружаются, когда до них доходит прокрутка, и сдвигают соседей:
    // пересчитываем при любом изменении высоты страницы (после своей правки высота та же, цикла нет)
    if ('ResizeObserver' in window) new ResizeObserver(later).observe(document.body);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
