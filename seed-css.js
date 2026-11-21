// Junior CSS basics test at /css. Usage: node --env-file=.env seed-css.js [--dry | --ru-only]
// Each row: [question, correct answer, wrong, wrong, wrong]. Options get shuffled. Re-runnable (replaces questions).
import { createClient } from '@supabase/supabase-js';
const Q = [
  ['CSS nima uchun ishlatiladi?', 'Veb-sahifaning ko‘rinishini (dizayn) belgilash uchun', 'Sahifaga mantiq (logika) yozish uchun', 'Ma’lumotlar bazasi bilan ishlash uchun', 'Serverni sozlash uchun'],
  ['CSS fayli HTML ga qaysi teg orqali ulanadi?', '<link rel="stylesheet" href="style.css">', '<script src="style.css">', '<style src="style.css">', '<css href="style.css">'],
  ['CSS ni to‘g‘ridan-to‘g‘ri HTML ichiga yozish uchun qaysi teg ishlatiladi?', '<style>', '<css>', '<script>', '<design>'],
  ['<link> tegi HTML ning qaysi qismiga yoziladi?', '<head> ichiga', '<footer> ichiga', '<title> ichiga', '</html> dan keyin'],
  ['Elementga inline (tegning ichida) stil berish qaysi atribut bilan bajariladi?', 'style', 'class', 'css', 'font'],
  ['CSS qoidasi to‘g‘ri yozilgan variantni toping.', 'p { color: red; }', 'p ( color = red )', 'p: { color - red }', '<p> color: red </p>'],
  ['Class selektori qanday yoziladi?', '.box', '#box', 'box', '*box'],
  ['id selektori qanday yoziladi?', '#box', '.box', '@box', '&box'],
  ['CSS da izoh (comment) qanday yoziladi?', '/* izoh */', '// izoh', '<!-- izoh -->', '# izoh'],
  ['Matn rangini o‘zgartiradigan xossa qaysi?', 'color', 'text-color', 'font-color', 'background'],
  ['Elementning fon rangini beradigan xossa qaysi?', 'background-color', 'color', 'bg', 'fill-color'],
  ['Qaysi biri to‘g‘ri rang yozuvi EMAS?', 'rgb(300%, red, 0)', '#ff0000', 'red', 'rgb(255, 0, 0)'],
  ['#ffffff qaysi rangni bildiradi?', 'Oq', 'Qora', 'Qizil', 'Ko‘k'],
  ['Shriftning o‘lchamini o‘zgartiradigan xossa qaysi?', 'font-size', 'text-size', 'font-style', 'size'],
  ['Matnni markazga tekislash uchun qaysi xossa ishlatiladi?', 'text-align: center;', 'align: center;', 'font-align: center;', 'text-center: true;'],
  ['Qaysi element default holatda BLOCK hisoblanadi?', '<div>', '<span>', '<a>', '<strong>'],
  ['Qaysi element default holatda INLINE hisoblanadi?', '<span>', '<div>', '<p>', '<h1>'],
  ['Block elementning asosiy xususiyati nima?', 'Yangi qatordan boshlanadi va butun kenglikni egallaydi', 'Boshqa elementlar bilan bir qatorda turadi', 'Width va height qabul qilmaydi', 'Ekranda ko‘rinmaydi'],
  ['Inline element haqida qaysi gap to‘g‘ri?', 'Faqat o‘z mazmuni kengligicha joy egallaydi va qatorda turadi', 'Har doim yangi qatordan boshlanadi', 'Har doim butun kenglikni egallaydi', 'Width va height ni to‘liq qabul qiladi'],
  ['inline-block ning vazifasi nima?', 'Qatorda turadi, lekin width va height qabul qiladi', 'Elementni yashiradi', 'Elementni flex qiladi', 'Elementni yangi qatorga o‘tkazadi'],
  ['Elementni butunlay yashirish (joyi ham qolmasligi) uchun qaysi qiymat ishlatiladi?', 'display: none;', 'visibility: hidden;', 'opacity: 1;', 'display: hide;'],
  ['Box model tarkibi ichdan tashqariga qaysi tartibda?', 'content → padding → border → margin', 'content → margin → border → padding', 'margin → border → padding → content', 'content → border → margin → padding'],
  ['Padding nima?', 'Kontent va border orasidagi ichki masofa', 'Elementdan tashqaridagi masofa', 'Elementning chizig‘i', 'Elementning rangi'],
  ['Margin nima?', 'Element tashqarisidagi, boshqa elementlargacha bo‘lgan masofa', 'Kontent ichidagi masofa', 'Elementning chegara chizig‘i', 'Elementning shrifti'],
  ['Border nima?', 'Padding atrofidagi chegara chizig‘i', 'Elementdan tashqaridagi bo‘sh joy', 'Kontent ichidagi bo‘sh joy', 'Fon rasmi'],
  ['Qaysi yozuv to‘g‘ri border berishni ko‘rsatadi?', 'border: 2px solid black;', 'border: black 2 line;', 'border = 2px black;', 'border: solid-2px;'],
  ['margin: 10px 20px; yozuvida 10px va 20px nimani bildiradi?', 'Tepa/past 10px, chap/o‘ng 20px', 'Tepa/past 20px, chap/o‘ng 10px', 'Faqat tepa 10px, past 20px', 'Chap 10px, o‘ng 20px'],
  ['Block elementni gorizontal markazga qo‘yish uchun (width berilgan) nima yoziladi?', 'margin: 0 auto;', 'text-align: center;', 'padding: auto;', 'align: middle;'],
  ['box-sizing: border-box; nimani o‘zgartiradi?', 'Width ga padding va border ham kiradi', 'Width faqat kontentni o‘lchaydi', 'Elementga ramka qo‘shadi', 'Margin ni o‘chiradi'],
  ['Elementga flexbox ni yoqish uchun nima yoziladi?', 'display: flex;', 'flex: on;', 'position: flex;', 'layout: flex;'],
  ['display: flex; qaysi elementga yoziladi?', 'Parent (ota) konteynerga', 'Faqat bolalardan biriga', 'Faqat <body> ga', 'Faqat rasmga'],
  ['Flexbox da elementlar default qaysi yo‘nalishda joylashadi?', 'Gorizontal (row)', 'Vertikal (column)', 'Diagonal', 'Tasodifiy'],
  ['Flex elementlarni vertikal (ustun) qilish uchun nima yoziladi?', 'flex-direction: column;', 'flex-direction: vertical;', 'flex-flow: up;', 'direction: column;'],
  ['justify-content flexbox da nimani boshqaradi?', 'Asosiy o‘q (main axis) bo‘ylab joylashuvni', 'Ko‘ndalang o‘q bo‘ylab joylashuvni', 'Shrift o‘lchamini', 'Elementlar rangini'],
  ['align-items flexbox da nimani boshqaradi?', 'Ko‘ndalang o‘q (cross axis) bo‘ylab joylashuvni', 'Elementlar sonini', 'Matn rangini', 'Elementlar orasidagi chegarani'],
  ['Elementni flex yordamida ham gorizontal, ham vertikal markazga qo‘yish uchun?', 'justify-content: center; align-items: center;', 'text-align: center; vertical-align: center;', 'margin: center;', 'position: center;'],
  ['Flex elementlar orasiga bo‘sh joy qo‘yish uchun qaysi xossa qulay?', 'gap', 'space', 'margin-between', 'spacing'],
  ['justify-content: space-between; nima qiladi?', 'Elementlarni chetlarga qo‘yib, oralarini teng taqsimlaydi', 'Hammasini markazga to‘playdi', 'Hammasini o‘ngga suradi', 'Elementlarni yashiradi'],
  ['Flex elementlar sig‘masa keyingi qatorga o‘tishi uchun nima yoziladi?', 'flex-wrap: wrap;', 'flex-wrap: break;', 'flex-line: new;', 'wrap: true;'],
  ['Elementning kengligini belgilaydigan xossa qaysi?', 'width', 'size-x', 'length', 'wide'],
  ['px, %, rem — bular nima?', 'CSS o‘lchov birliklari', 'Rang nomlari', 'Selektor turlari', 'HTML teglar'],
  ['width: 50%; nimani bildiradi?', 'Ota elementning yarmi kengligini', 'Ekranning 50 pikselini', 'Elementning yarim shaffofligini', 'Matnning yarim o‘lchamini'],
  ['Rasmga yumaloq burchak berish uchun qaysi xossa ishlatiladi?', 'border-radius', 'corner-round', 'border-curve', 'radius'],
  ['Elementga soya berish uchun qaysi xossa ishlatiladi?', 'box-shadow', 'shadow-box', 'element-shadow', 'drop'],
  ['Fon sifatida rasm qo‘yish uchun qaysi xossa ishlatiladi?', 'background-image: url("rasm.jpg");', 'background: image("rasm.jpg");', 'img-background: rasm.jpg;', 'bg-src: rasm.jpg;'],
  ['Fon rasmi butun elementni to‘ldirib, kesilib sig‘ishi uchun qaysi qiymat?', 'background-size: cover;', 'background-size: small;', 'background-repeat: all;', 'background-fit: full;'],
  ['Hover (sichqoncha ustiga kelganda) stilini berish uchun nima ishlatiladi?', 'a:hover { }', 'a::hover { }', 'a.onhover { }', 'a#hover { }'],
  ['Bir nechta elementga bir xil stil berish uchun selektorlar qanday ajratiladi?', 'Vergul bilan: h1, p { }', 'Nuqta bilan: h1. p { }', 'Chiziqcha bilan: h1-p { }', 'Nuqtali vergul bilan: h1; p { }'],
  ['Bir nechta class va id bo‘lsa, qaysi biri kuchliroq (specificity)?', 'id', 'class', 'Teg (element) selektori', 'Hammasi teng'],
  ['Elementning oldingi stilini hamma narsadan ustun qilib belgilash uchun nima yoziladi?', '!important', '!first', '!override', '!strong'],
  ['position: absolute; element qaysiga nisbatan joylashadi?', 'Eng yaqin position berilgan ota elementga', 'Doim brauzer oynasiga', 'Doim <body> ga', 'O‘zining oldingi qo‘shnisiga'],
  ['Shriftni o‘zgartiradigan xossa qaysi?', 'font-family', 'font-type', 'text-font', 'typeface'],
];
// Russian, same order and same correct-first layout as Q.
const R = [
  ['Для чего используется CSS?', 'Для оформления внешнего вида (дизайна) веб-страницы', 'Для написания логики страницы', 'Для работы с базой данных', 'Для настройки сервера'],
  ['С помощью какого тега CSS-файл подключается к HTML?', '<link rel="stylesheet" href="style.css">', '<script src="style.css">', '<style src="style.css">', '<css href="style.css">'],
  ['Какой тег используется, чтобы писать CSS прямо внутри HTML?', '<style>', '<css>', '<script>', '<design>'],
  ['В какую часть HTML пишется тег <link>?', 'Внутрь <head>', 'Внутрь <footer>', 'Внутрь <title>', 'После </html>'],
  ['Каким атрибутом задаётся inline-стиль (внутри тега) элементу?', 'style', 'class', 'css', 'font'],
  ['Найдите правильно записанное правило CSS.', 'p { color: red; }', 'p ( color = red )', 'p: { color - red }', '<p> color: red </p>'],
  ['Как записывается селектор класса?', '.box', '#box', 'box', '*box'],
  ['Как записывается селектор id?', '#box', '.box', '@box', '&box'],
  ['Как в CSS записывается комментарий?', '/* комментарий */', '// комментарий', '<!-- комментарий -->', '# комментарий'],
  ['Какое свойство меняет цвет текста?', 'color', 'text-color', 'font-color', 'background'],
  ['Какое свойство задаёт цвет фона элемента?', 'background-color', 'color', 'bg', 'fill-color'],
  ['Какая запись цвета НЕ является правильной?', 'rgb(300%, red, 0)', '#ff0000', 'red', 'rgb(255, 0, 0)'],
  ['Какой цвет обозначает #ffffff?', 'Белый', 'Чёрный', 'Красный', 'Синий'],
  ['Какое свойство меняет размер шрифта?', 'font-size', 'text-size', 'font-style', 'size'],
  ['Какое свойство используется для выравнивания текста по центру?', 'text-align: center;', 'align: center;', 'font-align: center;', 'text-center: true;'],
  ['Какой элемент по умолчанию является BLOCK?', '<div>', '<span>', '<a>', '<strong>'],
  ['Какой элемент по умолчанию является INLINE?', '<span>', '<div>', '<p>', '<h1>'],
  ['Какова главная особенность block-элемента?', 'Начинается с новой строки и занимает всю ширину', 'Стоит в одной строке с другими элементами', 'Не принимает width и height', 'Не отображается на экране'],
  ['Какое утверждение об inline-элементе верно?', 'Занимает только ширину своего содержимого и стоит в строке', 'Всегда начинается с новой строки', 'Всегда занимает всю ширину', 'Полностью принимает width и height'],
  ['Для чего нужен inline-block?', 'Стоит в строке, но принимает width и height', 'Скрывает элемент', 'Делает элемент flex', 'Переносит элемент на новую строку'],
  ['Какое значение полностью скрывает элемент (место тоже не остаётся)?', 'display: none;', 'visibility: hidden;', 'opacity: 1;', 'display: hide;'],
  ['В каком порядке расположены части box model изнутри наружу?', 'content → padding → border → margin', 'content → margin → border → padding', 'margin → border → padding → content', 'content → border → margin → padding'],
  ['Что такое padding?', 'Внутренний отступ между содержимым и border', 'Расстояние снаружи элемента', 'Линия элемента', 'Цвет элемента'],
  ['Что такое margin?', 'Внешний отступ от элемента до других элементов', 'Расстояние внутри содержимого', 'Линия границы элемента', 'Шрифт элемента'],
  ['Что такое border?', 'Линия границы вокруг padding', 'Пустое место снаружи элемента', 'Пустое место внутри содержимого', 'Фоновое изображение'],
  ['Какая запись правильно задаёт border?', 'border: 2px solid black;', 'border: black 2 line;', 'border = 2px black;', 'border: solid-2px;'],
  ['Что означают 10px и 20px в записи margin: 10px 20px;?', 'Сверху/снизу 10px, слева/справа 20px', 'Сверху/снизу 20px, слева/справа 10px', 'Только сверху 10px, снизу 20px', 'Слева 10px, справа 20px'],
  ['Что написать, чтобы по горизонтали отцентрировать block-элемент (с заданной width)?', 'margin: 0 auto;', 'text-align: center;', 'padding: auto;', 'align: middle;'],
  ['Что меняет box-sizing: border-box;?', 'В width входят также padding и border', 'Width измеряет только содержимое', 'Добавляет элементу рамку', 'Отключает margin'],
  ['Что нужно написать, чтобы включить flexbox у элемента?', 'display: flex;', 'flex: on;', 'position: flex;', 'layout: flex;'],
  ['К какому элементу применяется display: flex;?', 'К родительскому контейнеру', 'Только к одному из дочерних', 'Только к <body>', 'Только к картинке'],
  ['В каком направлении элементы во flexbox располагаются по умолчанию?', 'По горизонтали (row)', 'По вертикали (column)', 'По диагонали', 'Случайно'],
  ['Что написать, чтобы flex-элементы шли вертикально (столбцом)?', 'flex-direction: column;', 'flex-direction: vertical;', 'flex-flow: up;', 'direction: column;'],
  ['Чем управляет justify-content во flexbox?', 'Расположением вдоль главной оси (main axis)', 'Расположением вдоль поперечной оси', 'Размером шрифта', 'Цветом элементов'],
  ['Чем управляет align-items во flexbox?', 'Расположением вдоль поперечной оси (cross axis)', 'Количеством элементов', 'Цветом текста', 'Границей между элементами'],
  ['Как с помощью flex отцентрировать элемент и по горизонтали, и по вертикали?', 'justify-content: center; align-items: center;', 'text-align: center; vertical-align: center;', 'margin: center;', 'position: center;'],
  ['Какое свойство удобно для задания промежутка между flex-элементами?', 'gap', 'space', 'margin-between', 'spacing'],
  ['Что делает justify-content: space-between;?', 'Прижимает элементы к краям и равномерно распределяет промежутки между ними', 'Собирает всех в центре', 'Сдвигает всех вправо', 'Скрывает элементы'],
  ['Что написать, чтобы flex-элементы при нехватке места переносились на следующую строку?', 'flex-wrap: wrap;', 'flex-wrap: break;', 'flex-line: new;', 'wrap: true;'],
  ['Какое свойство задаёт ширину элемента?', 'width', 'size-x', 'length', 'wide'],
  ['px, %, rem — что это?', 'Единицы измерения в CSS', 'Названия цветов', 'Типы селекторов', 'HTML-теги'],
  ['Что означает width: 50%;?', 'Половину ширины родительского элемента', '50 пикселей экрана', 'Половину прозрачности элемента', 'Половину размера текста'],
  ['Какое свойство используется, чтобы скруглить углы у картинки?', 'border-radius', 'corner-round', 'border-curve', 'radius'],
  ['Какое свойство используется, чтобы добавить элементу тень?', 'box-shadow', 'shadow-box', 'element-shadow', 'drop'],
  ['Какое свойство используется, чтобы поставить картинку в качестве фона?', 'background-image: url("rasm.jpg");', 'background: image("rasm.jpg");', 'img-background: rasm.jpg;', 'bg-src: rasm.jpg;'],
  ['Какое значение заставляет фоновую картинку заполнить весь элемент с обрезкой?', 'background-size: cover;', 'background-size: small;', 'background-repeat: all;', 'background-fit: full;'],
  ['Что используется, чтобы задать стиль при наведении мыши (hover)?', 'a:hover { }', 'a::hover { }', 'a.onhover { }', 'a#hover { }'],
  ['Как разделяются селекторы, чтобы задать один стиль нескольким элементам?', 'Запятой: h1, p { }', 'Точкой: h1. p { }', 'Дефисом: h1-p { }', 'Точкой с запятой: h1; p { }'],
  ['Если есть несколько class и id, что приоритетнее (specificity)?', 'id', 'class', 'Селектор тега (элемента)', 'Все равны'],
  ['Что написать, чтобы стиль имел приоритет над всеми остальными?', '!important', '!first', '!override', '!strong'],
  ['Относительно чего позиционируется элемент с position: absolute;?', 'Ближайшего родителя с заданным position', 'Всегда окна браузера', 'Всегда <body>', 'Своего предыдущего соседа'],
  ['Какое свойство меняет шрифт?', 'font-family', 'font-type', 'text-font', 'typeface'],
];
if (R.length !== Q.length || R.some((r, i) => r.length !== Q[i].length)) throw new Error('Q/R mismatch');
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const questions = Q.map(([text, ...o], n) => {
  const opts = shuffle(o.map((t, k) => ({ t, ru: R[n][k + 1], ok: !k })));
  return { text, text_ru: R[n][0], options: opts.map(x => x.t), options_ru: opts.map(x => x.ru), answer: opts.findIndex(x => x.ok) };
});
console.log(`${questions.length} questions`);
if (process.argv.includes('--dry')) process.exit();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
if (process.argv.includes('--ru-only')) { // live test: add Russian in place, keep ids + option order so running students aren't disturbed
  const { data: t } = await db.from('tests').select('id').eq('slug', 'css').single();
  const { data: rows } = await db.from('questions').select('id,text,options').eq('test_id', t.id);
  let n = 0;
  for (const row of rows) {
    const q = questions.find(x => x.text === row.text);
    if (!q) { console.log('no match:', row.text); continue; }
    const ru = new Map(q.options.map((o, i) => [o, q.options_ru[i]]));
    const options_ru = row.options.map(o => ru.get(o));
    if (options_ru.includes(undefined)) { console.log('option mismatch:', row.text); continue; }
    const u = await db.from('questions').update({ text_ru: q.text_ru, options_ru }).eq('id', row.id);
    if (u.error) throw u.error;
    n++;
  }
  console.log(`updated ${n}/${rows.length}`);
  process.exit();
}
const { data: t, error } = await db.from('tests').upsert({ slug: 'css', title: 'CSS Basics (Junior)' }, { onConflict: 'slug' }).select().single();
if (error) throw error;
await db.from('questions').delete().eq('test_id', t.id);
const r = await db.from('questions').insert(questions.map(q => ({ ...q, test_id: t.id })));
if (r.error) throw r.error;
console.log('done: /css');
