// Карточки игры. Формат описан в cards_format.md, читаемый список — cards_review.md.
// Всё, что ниже строки «window.CARDS =», — обычный JSON-массив: дописывай карточки по образцу.
window.CARDS = [
  {
    "id": "boss_weekend",
    "who": "Начальник", "face": "👔",
    "text": "Возьмёшь проект на выходных? Заплачу сверху.",
    "left":  { "label": "Нет, у меня жизнь", "fx": { "work": -16, "love": 10 } },
    "right": { "label": "Да, давай", "fx": { "money": 20, "health": -8, "love": -16, "work": 12 } }
  },
  {
    "id": "boss_raise_talk",
    "who": "Начальник", "face": "👔",
    "text": "Повышение? Давай вернёмся к этому разговору через квартал.",
    "once": true,
    "left": {
      "label": "Ладно, подожду",
      "fx": { "work": 6 },
      "then": { "card": "boss_raise_quarter", "in": 12 }
    },
    "right": { "label": "Сейчас или ухожу", "fx": { "work": -12, "money": 16, "health": -4 } }
  },
  {
    "id": "boss_raise_quarter",
    "who": "Начальник", "face": "👔",
    "text": "Квартал прошёл, помню-помню. Но сейчас не лучшее время, сам понимаешь. Бюджеты.",
    "chainOnly": true,
    "left":  { "label": "Понимаю", "fx": { "work": -8, "health": -6 } },
    "right": { "label": "Пишу заявление", "fx": { "work": -24, "health": 12, "love": 6 } }
  },
  {
    "id": "boss_corporate",
    "who": "Начальник", "face": "👔",
    "text": "В пятницу корпоратив! Явка обязательна, будут конкурсы.",
    "left":  { "label": "Заболею", "fx": { "work": -10, "health": 6 } },
    "right": { "label": "Иду", "fx": { "love": 10, "health": -10, "work": 8 } }
  },
  {
    "id": "boss_night",
    "who": "Начальник", "face": "👔",
    "text": "Срочно нужна презентация к утру. Ты же всё равно не спишь?",
    "left":  { "label": "Сплю", "fx": { "work": -14 } },
    "right": { "label": "Не сплю", "fx": { "work": 12, "health": -12 } }
  },
  {
    "id": "boss_office",
    "who": "Начальник", "face": "👔",
    "text": "С понедельника все в офисе. Удалёнка кончилась.",
    "left":  { "label": "Ищу другую работу", "fx": { "work": -12, "love": 4 } },
    "right": { "label": "Ладно", "fx": { "health": -8, "money": -1, "work": 6 } }
  },
  {
    "id": "boss_promote",
    "who": "Начальник", "face": "👔",
    "text": "Хочу сделать тебя руководителем отдела. Правда, жить придётся на работе.",
    "if": { "work": [80, 100] },
    "weight": 2,
    "left":  { "label": "Мне и так хватает", "fx": { "work": -16, "health": 8 } },
    "right": { "label": "Согласен", "fx": { "work": 20, "money": 16, "health": -12, "love": -16 } }
  },
  {
    "id": "boss_layoff",
    "who": "Начальник", "face": "👔",
    "text": "Нам надо поговорить. У нас сокращения, и твоя фамилия в списке.",
    "if": { "work": [0, 25] },
    "weight": 2,
    "left":  { "label": "Ну и пусть", "fx": { "work": -12, "health": 6 } },
    "right": { "label": "Умолять остаться", "fx": { "work": 16, "health": -8, "money": -3 } }
  },

  {
    "id": "mom_sunday",
    "who": "Мама", "face": "👵",
    "text": "Ты когда последний раз ел нормальную еду? Приезжай в воскресенье.",
    "left":  { "label": "Не могу, дела", "fx": { "love": -20, "work": 6 } },
    "right": { "label": "Приеду", "fx": { "love": 20, "health": 10, "money": -3 } }
  },
  {
    "id": "mom_grandkids",
    "who": "Мама", "face": "👵",
    "text": "Ну когда уже внуки? Я не молодею.",
    "if": { "flags": ["partner"] },
    "left":  { "label": "Мам, не начинай", "fx": { "love": -12 } },
    "right": { "label": "Скоро, мам", "fx": { "love": 12, "health": -4 } }
  },
  {
    "id": "mom_matchmaker",
    "who": "Мама", "face": "👵",
    "text": "Тётя Люба сына женила. А ты? У неё, кстати, есть племянница.",
    "if": { "notFlags": ["partner"] },
    "left":  { "label": "Мам!", "fx": { "love": -10 } },
    "right": { "label": "Ну познакомь", "fx": { "love": 10, "health": -4, "money": -1 } }
  },
  {
    "id": "mom_jars",
    "who": "Мама", "face": "👵",
    "text": "Забери банки с огурцами. Пятьдесят штук. Не выкидывать!",
    "left":  { "label": "Не повезу", "fx": { "love": -12 } },
    "right": { "label": "Заберу", "fx": { "love": 10, "health": -4, "money": 4 } }
  },
  {
    "id": "mom_roof",
    "who": "Мама", "face": "👵",
    "text": "У нас крыша протекла. Поможешь? Отец говорит, сам починит, но ты же его знаешь.",
    "if": { "money": [55, 100] },
    "left":  { "label": "Сейчас туго", "fx": { "love": -16 } },
    "right": { "label": "Конечно", "fx": { "money": -9, "love": 12 } }
  },
  {
    "id": "mom_tv",
    "who": "Мама", "face": "👵",
    "text": "По телевизору сказали: лук лечит от всего. Я тебе мешок купила.",
    "left":  { "label": "Мам, это чушь", "fx": { "love": -8, "health": -2 } },
    "right": { "label": "Буду есть лук", "fx": { "love": 8, "health": 4 } }
  },
  {
    "id": "mom_dacha",
    "who": "Мама", "face": "👵",
    "text": "Все выходные на дачу, картошку копать. Отец спину сорвал.",
    "left":  { "label": "Не могу", "fx": { "love": -14, "work": 4 } },
    "right": { "label": "Еду", "fx": { "love": 12, "health": -6, "work": -4 } }
  },

  {
    "id": "friend_friday",
    "who": "Друг", "face": "🍻",
    "text": "Пятница! Бар, потом караоке, потом как пойдёт.",
    "left":  { "label": "Я спать", "fx": { "love": -12, "health": 8 } },
    "right": { "label": "Погнали", "fx": { "love": 16, "health": -16, "money": -6 } }
  },
  {
    "id": "friend_loan",
    "who": "Друг", "face": "🍻",
    "text": "Займи 50 000 до зарплаты. Честно-честно верну!",
    "left":  { "label": "Нет денег", "fx": { "love": -12 } },
    "right": {
      "label": "Держи",
      "fx": { "money": -6, "love": 8 },
      "then": { "card": ["friend_loan_back", "friend_loan_gone"], "in": 8 }
    }
  },
  {
    "id": "friend_loan_back",
    "who": "Друг", "face": "🍻",
    "text": "Вот, как обещал — 50 000. И пиво сверху!",
    "chainOnly": true,
    "left":  { "label": "Спасибо", "fx": { "money": 10, "love": 10, "health": -4 } },
    "right": { "label": "Пиво оставь себе", "fx": { "money": 10, "love": 4 } }
  },
  {
    "id": "friend_loan_gone",
    "who": "Друг", "face": "🍻",
    "text": "Слушай, с деньгами пока никак… Но я помню! Честно.",
    "chainOnly": true,
    "left":  { "label": "Ладно, забей", "fx": { "love": 6, "health": -4 } },
    "right": { "label": "Верни сейчас", "fx": { "love": -20, "money": 6 } }
  },
  {
    "id": "friend_shawarma",
    "who": "Друг", "face": "🍻",
    "text": "Открываем шаурмичную! Вложишься? Триста тысяч — через год миллион.",
    "once": true,
    "left":  { "label": "Не верю", "fx": { "love": -8 } },
    "right": {
      "label": "Вкладываюсь",
      "fx": { "money": -9, "love": 8, "work": 6 },
      "then": { "card": ["shawarma_win", "shawarma_fail"], "in": 15 }
    }
  },
  {
    "id": "shawarma_win",
    "who": "Друг", "face": "🌯",
    "text": "Шаурмичная выстрелила! Очередь до метро. Вот твоя доля.",
    "chainOnly": true,
    "left":  { "label": "Забрать", "fx": { "money": 28, "love": 8 } },
    "right": { "label": "Открываем вторую", "fx": { "money": 12, "work": 12, "health": -6 } }
  },
  {
    "id": "shawarma_fail",
    "who": "Друг", "face": "🌯",
    "text": "Шаурмичную закрыла санэпидемстанция. Денег нет, зато шаурма бесплатно. Пожизненно.",
    "chainOnly": true,
    "left":  { "label": "Я так и знал", "fx": { "love": -12 } },
    "right": { "label": "Давай шаурму", "fx": { "love": 6, "health": -10 } }
  },
  {
    "id": "friend_fishing",
    "who": "Друг", "face": "🎣",
    "text": "Едем на рыбалку на три дня! Без телефонов и без жён.",
    "left":  { "label": "Работа", "fx": { "love": -10, "work": 6 } },
    "right": { "label": "Едем", "fx": { "love": 12, "health": 8, "work": -12 } }
  },
  {
    "id": "friend_wedding",
    "who": "Друг", "face": "🍻",
    "text": "Я женюсь! Будешь свидетелем? С тебя мальчишник.",
    "once": true,
    "left":  { "label": "Не потяну", "fx": { "love": -16 } },
    "right": { "label": "Конечно!", "fx": { "love": 16, "money": -6, "health": -8 } }
  },
  {
    "id": "friend_gym",
    "who": "Друг", "face": "💪",
    "text": "Пошли со мной в зал! Абонемент на год со скидкой.",
    "left":  { "label": "Лень", "fx": { "health": -4, "love": -4 } },
    "right": { "label": "Пошли", "fx": { "health": 16, "money": -4, "love": 4 } }
  },
  {
    "id": "friend_boring",
    "who": "Друг", "face": "🍻",
    "text": "Ты стал скучный со своим ЗОЖем. Хоть пива выпей с нами, а?",
    "if": { "health": [80, 100] },
    "weight": 2,
    "left":  { "label": "Не пью", "fx": { "love": -12, "health": 4 } },
    "right": { "label": "Ладно, одну", "fx": { "health": -12, "love": 10 } }
  },

  {
    "id": "dating_app",
    "who": "Приложение", "face": "📱",
    "text": "У вас мэтч! Аня, 27 лет, любит котиков и походы.",
    "if": { "notFlags": ["partner"] },
    "left":  { "label": "Не сейчас", "fx": { "love": -8 } },
    "right": { "label": "Написать", "fx": { "love": 16, "money": -4 }, "set": ["partner"] }
  },
  {
    "id": "partner_dinner",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Давай сходим в тот новый ресторан? Говорят, там готовят из шишек.",
    "if": { "flags": ["partner"] },
    "left":  { "label": "Давай дома", "fx": { "love": -10, "money": 4 } },
    "right": { "label": "Пошли", "fx": { "love": 16, "money": -6 } }
  },
  {
    "id": "partner_move_in",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Слушай… может, съедемся?",
    "if": { "flags": ["partner"] },
    "once": true,
    "left":  { "label": "Рано", "fx": { "love": -20 }, "unset": ["partner"] },
    "right": {
      "label": "Давай",
      "fx": { "love": 20, "money": -6 },
      "then": { "card": "partner_ikea", "in": 3 }
    }
  },
  {
    "id": "partner_ikea",
    "who": "Аня", "face": "🛋️",
    "text": "Поездка за мебелью. Ссора у стеллажа: «беленый дуб» или «дуб беленый»?",
    "chainOnly": true,
    "left":  { "label": "Уступить", "fx": { "love": 10, "health": -4 } },
    "right": { "label": "Стоять на своём", "fx": { "love": -24, "health": 4 } }
  },
  {
    "id": "partner_sea",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Хочу на море. В Турцию. На две недели. Всё включено.",
    "if": { "flags": ["partner"] },
    "left":  { "label": "Давай на дачу", "fx": { "love": -16, "money": 4 } },
    "right": { "label": "Летим", "fx": { "love": 20, "money": -10, "work": -6 } }
  },
  {
    "id": "partner_cat",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Давай заведём кота? Смотри, какой рыжий!",
    "if": { "flags": ["partner"] },
    "once": true,
    "left":  { "label": "У меня аллергия", "fx": { "love": -12 } },
    "right": {
      "label": "Давай",
      "fx": { "love": 12, "money": -3 },
      "set": ["cat"],
      "then": { "card": "cat_vase", "in": 6 }
    }
  },
  {
    "id": "cat_vase",
    "who": "Кот", "face": "🐈",
    "text": "Кот разбил мамину вазу, наблевал в тапок и смотрит на тебя без раскаяния.",
    "chainOnly": true,
    "left":  { "label": "Отдать кота", "fx": { "love": -20, "health": 4 }, "unset": ["cat"] },
    "right": { "label": "Он же котик", "fx": { "love": 10, "health": -4 } }
  },
  {
    "id": "partner_jealous",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Кто такая Света из бухгалтерии? Почему она лайкает твои фотки?",
    "if": { "flags": ["partner"] },
    "left":  { "label": "Да никто", "fx": { "love": -12, "health": -4 } },
    "right": { "label": "Удалю её", "fx": { "love": 8, "work": -10 } }
  },
  {
    "id": "partner_proposal",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Мы уже давно вместе… Ты ничего не хочешь мне сказать?",
    "if": { "flags": ["partner"], "love": [70, 100] },
    "once": true,
    "weight": 2,
    "left":  { "label": "Пока нет", "fx": { "love": -24 } },
    "right": { "label": "Выходи за меня", "fx": { "love": 24, "money": -10 }, "set": ["married"] }
  },
  {
    "id": "partner_breakup",
    "who": "Аня", "face": "💁‍♀️",
    "text": "Нам надо поговорить. Мне кажется, мы стали чужими.",
    "if": { "flags": ["partner"], "love": [0, 25] },
    "weight": 3,
    "left":  { "label": "Давай расстанемся", "fx": { "love": -20, "health": 8 }, "unset": ["partner", "married"] },
    "right": { "label": "Давай всё исправим", "fx": { "love": 16, "money": -6, "work": -8 } }
  },

  {
    "id": "bank_deposit",
    "who": "Банк", "face": "🏦",
    "text": "Вклад под 21% годовых. Положите свободные деньги?",
    "left":  { "label": "Пусть лежат", "fx": { "money": -1 } },
    "right": { "label": "Положить", "fx": { "money": 8 } }
  },
  {
    "id": "bank_credit",
    "who": "Банк", "face": "💳",
    "text": "Вам одобрена кредитная карта с лимитом 300 000 ₽! Сто дней без процентов.",
    "if": { "notFlags": ["credit"] },
    "left":  { "label": "Спасибо, нет", "fx": { "love": -4 } },
    "right": {
      "label": "Оформить",
      "fx": { "love": 10, "health": 6 },
      "set": ["credit"],
      "then": { "card": "bank_payment", "in": 10 }
    }
  },
  {
    "id": "bank_payment",
    "who": "Банк", "face": "💳",
    "text": "Платёж по кредитке. Минимальный — 15 000 ₽, весь долг — 120 000 ₽.",
    "chainOnly": true,
    "left": {
      "label": "Минималку",
      "fx": { "money": -3, "health": -4 },
      "then": { "card": "bank_payment", "in": 8 }
    },
    "right": {
      "label": "Закрыть весь",
      "fx": { "money": -7, "health": 8 },
      "unset": ["credit"]
    }
  },
  {
    "id": "bank_scam",
    "who": "«Служба безопасности банка»", "face": "☎️",
    "text": "С вашей карты попытка списания! Срочно назовите код из СМС, мы всё отменим.",
    "left":  { "label": "Положить трубку", "fx": { "health": -4 } },
    "right": { "label": "Назвать код", "fx": { "money": -12, "health": -10 } }
  },
  {
    "id": "bank_premium",
    "who": "Банк", "face": "🏦",
    "text": "Подключите премиум: кешбэк 10% на всё! Всего 990 ₽ в месяц, первый месяц бесплатно.",
    "left":  { "label": "Нет", "fx": { "health": 2 } },
    "right": { "label": "Подключить", "fx": { "money": -3, "love": 4 } }
  },
  {
    "id": "bank_rate",
    "who": "Новости", "face": "📺",
    "text": "ЦБ поднял ключевую ставку до 25%! Вклады — огонь, ипотека — боль.",
    "weight": 0.5,
    "left":  { "label": "Не верю банкам", "fx": { "money": -3 } },
    "right": { "label": "Всё на вклад", "fx": { "money": 10, "love": -4 } }
  },

  {
    "id": "doctor_checkup",
    "who": "Врач", "face": "🩺",
    "text": "Пора бы провериться. Анализы — 8 000 ₽.",
    "left":  { "label": "Само пройдёт", "fx": { "health": -12 } },
    "right": { "label": "Сдам", "fx": { "health": 20, "money": -6 } }
  },
  {
    "id": "doctor_urgent",
    "who": "Врач", "face": "🚑",
    "text": "Ты ужасно выглядишь. Ложись на обследование, это не шутки.",
    "if": { "health": [0, 30] },
    "weight": 3,
    "left":  { "label": "Некогда", "fx": { "health": -8, "work": 6 } },
    "right": { "label": "Лягу", "fx": { "health": 30, "money": -9, "work": -12 } }
  },
  {
    "id": "doctor_teeth",
    "who": "Стоматолог", "face": "🦷",
    "text": "Зуб надо лечить. Каналы, коронка — 45 000. Или удаляем за 3 000.",
    "left":  { "label": "Удаляйте", "fx": { "health": -10, "love": -6, "money": -1 } },
    "right": { "label": "Лечить", "fx": { "health": 12, "money": -6 } }
  },
  {
    "id": "doctor_pills",
    "who": "Врач", "face": "🩺",
    "text": "Выпишу вам витамины. Новые, дорогие, но очень эффективные!",
    "left":  { "label": "Обойдусь", "fx": { "health": -4 } },
    "right": {
      "label": "Беру",
      "fx": { "money": -4, "health": 6 },
      "then": { "card": ["pills_ok", "pills_side"], "in": 5 }
    }
  },
  {
    "id": "pills_ok",
    "who": "Врач", "face": "🩺",
    "text": "Витамины помогли! Ну или это весна. Повторим курс?",
    "chainOnly": true,
    "left":  { "label": "Повторить", "fx": { "money": -3, "health": 8 } },
    "right": { "label": "Хватит", "fx": { "health": 4 } }
  },
  {
    "id": "pills_side",
    "who": "Врач", "face": "🩺",
    "text": "Побочка от витаминов: чешешься и слышишь цвета. Это нормально. Наверное.",
    "chainOnly": true,
    "left":  { "label": "Бросить", "fx": { "health": -4 } },
    "right": { "label": "Терпеть", "fx": { "health": -10, "love": -8 } }
  },
  {
    "id": "doctor_burnout",
    "who": "Врач", "face": "🩺",
    "text": "Вы на грани выгорания. Нужен отпуск. Настоящий, без ноутбука.",
    "if": { "work": [75, 100] },
    "weight": 2,
    "left":  { "label": "Потом", "fx": { "health": -12, "work": 8 } },
    "right": { "label": "В отпуск", "fx": { "health": 20, "work": -16, "money": -3 } }
  },
  {
    "id": "doctor_running",
    "who": "Врач", "face": "🩺",
    "text": "Сидячий образ жизни убьёт вас быстрее курения. Начните бегать.",
    "left":  { "label": "Не начну", "fx": { "health": -6 } },
    "right": { "label": "Начну", "fx": { "health": 12, "love": -6, "work": -4 } }
  },

  {
    "id": "broker_stocks",
    "who": "Брокер", "face": "📈",
    "text": "Акции растут третий месяц подряд! Заходите, пока не поздно.",
    "left":  { "label": "Не играю", "fx": { "health": 4 } },
    "right": {
      "label": "Купить",
      "fx": { "money": -6 },
      "then": { "card": ["stocks_up", "stocks_down"], "in": 10 }
    }
  },
  {
    "id": "stocks_up",
    "who": "Брокер", "face": "📈",
    "text": "Ваши акции +40%! Фиксируем прибыль или держим?",
    "chainOnly": true,
    "left":  { "label": "Держать", "fx": { "money": 14, "health": -4 } },
    "right": { "label": "Продать", "fx": { "money": 20 } }
  },
  {
    "id": "stocks_down",
    "who": "Брокер", "face": "📉",
    "text": "Рынок упал. Ваши акции −40%. Усредняемся?",
    "chainOnly": true,
    "left":  { "label": "Продать всё", "fx": { "money": 4, "health": -6 } },
    "right": { "label": "Докупить", "fx": { "money": -4, "health": -10 } }
  },
  {
    "id": "broker_crypto",
    "who": "Брокер", "face": "🪙",
    "text": "Новая монета ШАЛУН-коин. Иксы гарантированы, команда — бывшие сотрудники NASA.",
    "weight": 0.5,
    "once": true,
    "left":  { "label": "Нет уж", "fx": { "health": 2 } },
    "right": {
      "label": "На все!",
      "fx": { "money": -10, "health": -4 },
      "then": { "card": ["crypto_moon", "crypto_rug"], "in": 6 }
    }
  },
  {
    "id": "crypto_moon",
    "who": "Брокер", "face": "🚀",
    "text": "ШАЛУН-коин сделал икс десять! Ты гений инвестиций.",
    "chainOnly": true,
    "left":  { "label": "Продать", "fx": { "money": 36, "health": 6 } },
    "right": { "label": "Держать до луны", "fx": { "money": 8, "health": -8 } }
  },
  {
    "id": "crypto_rug",
    "who": "Брокер", "face": "🏝️",
    "text": "Создатели ШАЛУН-коина улетели на Бали. Деньги улетели вместе с ними.",
    "chainOnly": true,
    "left":  { "label": "Ну и ладно", "fx": { "health": -6 } },
    "right": { "label": "Писать в полицию", "fx": { "health": -10, "work": -6 } }
  },
  {
    "id": "broker_iis",
    "who": "Брокер", "face": "📈",
    "text": "Откройте ИИС: налоговый вычет и спокойные долгосрочные инвестиции.",
    "left":  { "label": "Сложно", "fx": { "work": -2, "money": -1 } },
    "right": { "label": "Открыть", "fx": { "money": 8, "work": 4, "health": -4 } }
  },

  {
    "id": "neighbor_drill",
    "who": "Сосед", "face": "🧓",
    "text": "Сосед сверху сверлит по воскресеньям в восемь утра. Третью неделю.",
    "left":  { "label": "Терпеть", "fx": { "health": -8 } },
    "right": { "label": "Пойти поговорить", "fx": { "love": -8, "health": 6 } }
  },
  {
    "id": "neighbor_flood",
    "who": "Сосед", "face": "🧓",
    "text": "Вы меня затопили! Потолок, обои, люстра. Ремонт за ваш счёт!",
    "if": { "flags": ["has_flat"] },
    "left":  { "label": "Это не я", "fx": { "love": -12, "health": -4 } },
    "right": { "label": "Заплачу", "fx": { "money": -7, "love": 6 } }
  },
  {
    "id": "neighbor_salt",
    "who": "Сосед", "face": "🧓",
    "text": "Соли не будет? И сахару. И яиц. И денег до пятницы.",
    "left":  { "label": "Нет", "fx": { "love": -8 } },
    "right": { "label": "Держи", "fx": { "money": -1, "love": 10 } }
  },
  {
    "id": "neighbor_meeting",
    "who": "Сосед", "face": "🧓",
    "text": "Собрание жильцов в среду! Решаем, ставить ли шлагбаум. Третий год решаем.",
    "left":  { "label": "Не пойду", "fx": { "love": -6 } },
    "right": { "label": "Пойду", "fx": { "love": 6, "health": -6 } }
  },

  {
    "id": "zhkh_bill",
    "who": "ЖКХ", "face": "🧾",
    "text": "Квитанция за отопление: 9 800 ₽. Батареи, правда, еле тёплые.",
    "if": { "flags": ["has_flat"] },
    "left":  { "label": "Потом", "fx": { "health": -6 } },
    "right": { "label": "Оплатить", "fx": { "money": -4 } }
  },
  {
    "id": "landlord_raise",
    "who": "Хозяйка", "face": "👩‍🦳",
    "text": "С нового месяца аренда дороже на 5 000. Сами понимаете, всё дорожает.",
    "if": { "notFlags": ["has_flat"] },
    "weight": 2,
    "left":  { "label": "Съеду", "fx": { "money": -4, "health": -4, "love": -6 } },
    "right": { "label": "Ладно", "fx": { "money": -6 } }
  },
  {
    "id": "landlord_visit",
    "who": "Хозяйка", "face": "👩‍🦳",
    "text": "Зайду завтра проверить счётчики. И цветы полить. И посмотреть, как вы живёте.",
    "if": { "notFlags": ["has_flat"] },
    "left":  { "label": "Я на работе", "fx": { "love": -6, "health": -4 } },
    "right": { "label": "Конечно", "fx": { "health": -6, "love": 4 } }
  },

  {
    "id": "work_bonus",
    "who": "Бухгалтерия", "face": "🧮",
    "text": "Премия по итогам квартала! Возьмёте деньгами или отгулами?",
    "if": { "work": [45, 100] },
    "left":  { "label": "Деньгами", "fx": { "money": 16, "health": -4 } },
    "right": { "label": "Отгулами", "fx": { "health": 12, "love": 6 } }
  },
  {
    "id": "freelance_gig",
    "who": "Знакомый", "face": "💻",
    "text": "Есть халтурка на выходные: сайт для автосервиса. Шестьдесят тысяч, нал.",
    "left":  { "label": "Я отдыхаю", "fx": { "health": 6 } },
    "right": { "label": "Берусь", "fx": { "money": 14, "health": -8, "love": -6 } }
  },
  {
    "id": "salary_index",
    "who": "Бухгалтерия", "face": "🧮",
    "text": "Индексация зарплаты на 5%! Инфляция, правда, 9%, но всё равно поздравляем.",
    "weight": 0.7,
    "left":  { "label": "Отложить разницу", "fx": { "money": 10 } },
    "right": { "label": "Жить чуть лучше", "fx": { "money": 4, "love": 4, "health": 4 } }
  },
  {
    "id": "taxi_evenings",
    "who": "Знакомый", "face": "🚕",
    "text": "Покатаешься вечерами в такси? Машина моя, выручку пополам.",
    "left":  { "label": "Не моё", "fx": { "work": 4, "money": -1 } },
    "right": { "label": "Покатаюсь", "fx": { "money": 12, "work": -8, "health": -4 } }
  },
  {
    "id": "avito_sale",
    "who": "Авито", "face": "📦",
    "text": "Старый велосипед и приставка пылятся на балконе. Покупатели уже пишут «ещё актуально?»",
    "left":  { "label": "Пусть стоят", "fx": { "love": -2, "health": -2 } },
    "right": { "label": "Продать", "fx": { "money": 8, "health": -4 } }
  },
  {
    "id": "tax_refund",
    "who": "Госуслуги", "face": "🏛️",
    "text": "Вам одобрен налоговый вычет! 52 000 ₽ придут на карту в течение месяца.",
    "weight": 0.5,
    "once": true,
    "left":  { "label": "Отложить", "fx": { "money": 12 } },
    "right": { "label": "Отметить", "fx": { "money": 6, "love": 8, "health": -4 } }
  },

  {
    "id": "school_course",
    "who": "Онлайн-школа", "face": "🎓",
    "text": "Курс «Аналитик за 3 месяца». Рассрочка, первый месяц бесплатно!",
    "once": true,
    "left":  { "label": "Знаем мы вас", "fx": { "work": -4 } },
    "right": { "label": "Записаться", "fx": { "money": -10, "work": 24, "health": -4 } }
  },
  {
    "id": "headhunter",
    "who": "Хантер", "face": "🕴️",
    "text": "Зовём в стартап. Зарплата на 30% меньше, зато опцион и пуфики!",
    "if": { "work": [65, 100] },
    "left":  { "label": "Мне и тут ок", "fx": { "work": -6 } },
    "right": { "label": "Иду", "fx": { "money": -9, "work": 20, "health": -6 } }
  },
  {
    "id": "job_center",
    "who": "Центр занятости", "face": "🏢",
    "text": "Есть вакансия курьера. График 6/1, велосипед свой.",
    "if": { "work": [0, 25] },
    "weight": 2,
    "left":  { "label": "Не пойду", "fx": { "money": -4, "work": -4 } },
    "right": { "label": "Пойду", "fx": { "work": 16, "health": -6, "money": 6 } }
  },
  {
    "id": "collector",
    "who": "Коллектор", "face": "📞",
    "text": "Добрый день. Это по поводу должка. Вы же не хотите, чтобы мы позвонили маме?",
    "if": { "money": [0, 20] },
    "weight": 3,
    "left":  { "label": "Сбросить", "fx": { "health": -10, "love": -8 } },
    "right": { "label": "Отдам часть", "fx": { "money": -3, "health": 8 } }
  },
  {
    "id": "tax_audit",
    "who": "Налоговая", "face": "🏛️",
    "text": "Нас заинтересовали ваши доходы. Приходите с документами за три года.",
    "if": { "money": [80, 100] },
    "weight": 2,
    "left":  { "label": "Всё чисто", "fx": { "health": -8, "money": -6 } },
    "right": { "label": "Нанять юриста", "fx": { "money": -12, "health": 4 } }
  },
  {
    "id": "wedding_season",
    "who": "Приглашение", "face": "💌",
    "text": "Тебя зовут на третью свадьбу за месяц. Конверт, костюм, тамада.",
    "if": { "love": [80, 100] },
    "weight": 2,
    "left":  { "label": "Не пойду", "fx": { "love": -16, "health": 4 } },
    "right": { "label": "Иду", "fx": { "money": -6, "health": -6, "love": 6 } }
  },
  {
    "id": "inner_voice",
    "who": "Внутренний голос", "face": "🧠",
    "text": "Ты давно ни с кем не разговаривал по-настоящему. Может, к психологу?",
    "if": { "love": [0, 20] },
    "weight": 2,
    "left":  { "label": "Справлюсь", "fx": { "health": -6, "love": -4 } },
    "right": { "label": "Запишусь", "fx": { "money": -6, "love": 12, "health": 6 } }
  },

  {
    "id": "rare_goose",
    "who": "Гусь", "face": "🪿",
    "text": "Гусь у пруда смотрит на тебя. Очень пристально. Кажется, он что-то знает.",
    "weight": 0.3,
    "once": true,
    "left":  { "label": "Медленно уйти", "fx": { "health": -2, "love": -2 } },
    "right": { "label": "Дать хлеба", "fx": { "health": -12, "love": 8 } }
  },
  {
    "id": "rare_lottery",
    "who": "Почта России", "face": "📬",
    "text": "Вы выиграли в лотерею! 100 рублей. Получить можно в отделении в Саранске.",
    "weight": 0.3,
    "once": true,
    "left":  { "label": "Да ну", "fx": { "health": 2 } },
    "right": { "label": "Еду в Саранск", "fx": { "money": -4, "health": -4, "love": 8 } }
  },
  {
    "id": "rare_fortune",
    "who": "Гадалка", "face": "🔮",
    "text": "Позолоти ручку — всю правду про тебя расскажу. И про квартиру, и про любовь.",
    "weight": 0.3,
    "left":  { "label": "Мимо", "fx": { "love": -2 } },
    "right": { "label": "Позолочу", "fx": { "money": -3, "love": 6, "health": 2 } }
  },
  {
    "id": "rare_pizza",
    "who": "Курьер", "face": "🍕",
    "text": "Ваша пицца! Ой, это не вам. Но заказчик не отвечает. Будете?",
    "weight": 0.3,
    "left":  { "label": "Не моё", "fx": { "love": 2 } },
    "right": { "label": "Буду", "fx": { "health": -4, "love": 6 } }
  }
];
