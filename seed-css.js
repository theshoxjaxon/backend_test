// Junior CSS basics test at /css. Usage: node --env-file=.env seed-css.js [--dry]
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
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const questions = Q.map(([text, ...o]) => { const opts = shuffle(o.map((t, k) => ({ t, ok: !k }))); return { text, options: opts.map(x => x.t), answer: opts.findIndex(x => x.ok) }; });
console.log(`${questions.length} questions`);
if (process.argv.includes('--dry')) process.exit();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data: t, error } = await db.from('tests').upsert({ slug: 'css', title: 'CSS Basics (Junior)' }, { onConflict: 'slug' }).select().single();
if (error) throw error;
await db.from('questions').delete().eq('test_id', t.id);
const r = await db.from('questions').insert(questions.map(q => ({ ...q, test_id: t.id })));
if (r.error) throw r.error;
console.log('done: /css');
