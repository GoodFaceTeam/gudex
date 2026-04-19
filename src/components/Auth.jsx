import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Eye, EyeOff, Loader2, X, Shield, Check, Lock, BellRing, Monitor, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Turnstile } from '@marsidev/react-turnstile';

// Генерация уникального ID устройства
export const getDeviceId = () => {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('device_id', id);
  }
  return id;
};

// Определение устройства
export const getDeviceName = () => {
  const ua = navigator.userAgent;
  let browser = "Неизвестный браузер";
  let os = "Неизвестная ОС";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "MacOS";
  else if (ua.includes("X11")) os = "UNIX";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} на ${os}`;
};

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  // Состояния для капчи
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  // Оборачиваем в try-catch на случай, если Router не настроен
  let navigate = () => {};
  try { navigate = useNavigate(); } catch(e) {}

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    code: '',
    device_id: getDeviceId(),
    device_name: getDeviceName()
  });

  const API_BASE = "https://api.goodfaceteam.ru"; 
  const bgImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  useEffect(() => {
    const session = Cookies.get('auth_session');
    if (session && onLoginSuccess) {
        onLoginSuccess(JSON.parse(session));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ (вызывает капчу)
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!formData.email || (mode !== 'forgot' && mode !== 'reset_verify' && !formData.password)) {
      setMessage({ text: 'Заполните необходимые поля', type: 'error' });
      return;
    }

    setShowCaptcha(true);
  };

  // 2. РЕАЛЬНАЯ ОТПРАВКА НА СЕРВЕР
  const executeAuth = async (token) => {
    setLoading(true);
    setShowCaptcha(false);

    let endpoint = "/login.php";
    if (mode === 'register') endpoint = "/register.php";
    if (mode === 'forgot') endpoint = "/forgot_password.php"; 
    if (mode === 'reset_verify') endpoint = "/reset_password.php";

    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, captcha_token: token }),
      });

      const result = await response.json();

      if (result.success) {
        // 1. ПЕРВОЕ ДЕЛО: Сохраняем токен (если пришел)
        const authToken = result.token || result.jwt; // Проверяем оба варианта ключа
        if (authToken) {
          localStorage.setItem('auth_token', authToken);
        }

        // 2. ОБРАБОТКА ВХОДА И РЕГИСТРАЦИИ (Авторизация)
        if (mode === 'login' || mode === 'register') {
          // Сохраняем сессию в куки и localStorage
          Cookies.set('auth_session', JSON.stringify(result.user), { expires: 7 });
          localStorage.setItem('user', JSON.stringify(result.user));

          // ТОЛЬКО ПОСЛЕ ВСЕГО ЭТОГО вызываем успех (смена страницы)
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          } else {
            navigate('/');
          }

        } else {
          // ЛОГИКА ВОССТАНОВЛЕНИЯ ПАРОЛЯ
          if (mode === 'forgot') {
            setMode('reset_verify');
          }
          if (mode === 'reset_verify') {
            setMessage({ text: "Пароль успешно изменен!", type: 'success' });
            setTimeout(() => setMode('login'), 2000);
          }
        }

      } else {
        setMessage({ text: result.message || "Ошибка", type: 'error' });
      }

    } catch (error) {
      console.error("Критическая ошибка авторизации:", error);
      setMessage({ text: "Не удалось связаться с сервером", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden font-sans fixed inset-0 z-[9999]">
      
      {/* Левая часть (Картинка и брендинг gudex) */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="gudex creative space" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-900/20 to-transparent" />
        
        <div className="absolute top-12 left-16">
            <h1 className="text-4xl font-black text-white tracking-tighter">gudex.</h1>
        </div>

        <div className="absolute bottom-16 left-16 max-w-lg animate-in fade-in slide-in-from-left-10 duration-1000">
          <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">
            Творите <br /> по своим <br /> правилам.
          </h2>
          <p className="text-white/80 text-xl font-medium leading-relaxed max-w-sm">
            Пространство для идей, скетчей и вдохновения от Good Face Team.
          </p>
        </div>
      </div>

      {/* Правая часть (Форма) */}
      <div className="w-full lg:w-[45%] flex flex-col bg-white relative">
        
        <div className="lg:hidden absolute top-8 left-8">
            <h1 className="text-2xl font-black text-blue-600 tracking-tighter">gudex.</h1>
        </div>

        <div className="flex-grow flex flex-col justify-center px-8 sm:px-12 md:px-24 py-12">
          <div className="max-w-[360px] w-full mx-auto text-left">
            <div className="mb-10">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
                {mode === 'login' && 'Войти'}
                {mode === 'register' && 'Регистрация'}
                {mode === 'forgot' && 'Сброс пароля'}
                {mode === 'reset_verify' && 'Новый пароль'}
              </h1>
              
              {message.text && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-bold animate-in fade-in zoom-in-95 ${
                  message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {message.text}
                </div>
              )}
              
              <p className="text-sm text-slate-500 font-medium">
                {mode === 'login' && (
                  <>Новый пользователь? <button type="button" onClick={() => { setMode('register'); setMessage({text:'', type:''}); }} className="text-blue-600 font-bold hover:underline">Создать аккаунт</button></>
                )}
                {mode === 'register' && (
                  <>Уже есть аккаунт? <button type="button" onClick={() => { setMode('login'); setMessage({text:'', type:''}); }} className="text-blue-600 font-bold hover:underline">Войти</button></>
                )}
                {(mode === 'forgot' || mode === 'reset_verify') && (
                  <button type="button" onClick={() => { setMode('login'); setMessage({text:'', type:''}); }} className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                    <ArrowLeft size={14} /> Вспомнили пароль?
                  </button>
                )}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handlePreSubmit}>
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Имя</label>
                  <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Александр" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-left" required={mode === 'register'} />
                </div>
              )}
              
              {mode !== 'reset_verify' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Эл. почта</label>
                  <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    type="email" 
                    placeholder="creator@gudex.com" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-left" 
                    required 
                  />
                </div>
              )}

              {mode === 'reset_verify' && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Код отправлен на</p>
                  <p className="text-sm font-bold text-blue-900">
                    {formData.email || 'Ошибка: почта не найдена'}
                  </p>
                </div>
              )}

              {mode === 'reset_verify' && (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Код из письма</label>
                  <input 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    type="text" 
                    placeholder="123456" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-bold tracking-widest text-center text-lg" 
                    required={mode === 'reset_verify'} 
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-1 relative animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {mode === 'reset_verify' ? 'Новый пароль' : 'Пароль'}
                    </label>
                    {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-blue-600 hover:underline">Забыли?</button>}
                  </div>
                  <div className="relative">
                    <input 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-left" 
                      required={mode !== 'forgot'} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-2 px-1 mt-2 animate-in slide-in-from-top-2">
                  <input 
                    type="checkbox" 
                    id="legal-agree"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                  />
                  <label htmlFor="legal-agree" className="text-[10px] text-slate-500 font-medium leading-relaxed select-none">
                    Я принимаю условия{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); setActiveLegalModal('terms'); }} className="text-blue-600 font-bold hover:underline">Пользовательского соглашения</button>,{' '}
                    даю согласие на обработку персональных данных согласно{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); setActiveLegalModal('privacy'); }} className="text-blue-600 font-bold hover:underline">Политике конфиденциальности</button>
                    {' '}и соглашаюсь с{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); setActiveLegalModal('cookies'); }} className="text-blue-600 font-bold hover:underline">Политикой Cookie</button>.
                  </label>
                </div>
              )}
              
              <button disabled={loading || showCaptcha || (mode === 'register' && !isAgreed)} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl mt-4 flex justify-center items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 
                  (mode === 'login' ? 'Войти' : 
                   mode === 'register' ? 'Создать аккаунт' : 
                   mode === 'forgot' ? 'Отправить код' : 
                   'Сохранить новый пароль')
                }
              </button>
            </form>
          </div>
        </div>

        <div className="p-8 flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          <a href="mailto:admin@goodfaceteam.ru" className="hover:text-blue-600 transition-colors">Support</a>
          <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-blue-600 transition-colors cursor-pointer">Privacy</button>
          <button onClick={() => setActiveLegalModal('terms')} className="hover:text-blue-600 transition-colors cursor-pointer">Terms</button>
        </div>
      </div>

      {/* МИНИ-ОКОШКО КАПЧИ */}
      {showCaptcha && (
        <div className="fixed inset-0 z-[100001] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCaptcha(false)}></div>
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-[350px] rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-4 border-b border-slate-50 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Безопасность</span>
              <button onClick={() => setShowCaptcha(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="mb-4 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Подтвердите, что вы человек</p>
                <p className="text-[11px] text-slate-400">Это защищает Gudex от спама</p>
              </div>
              <Turnstile
                siteKey="0x4AAAAAAC6MDPDoqX7B6NQf"
                onSuccess={(token) => executeAuth(token)}
                onError={() => {
                  setMessage({ text: 'Ошибка капчи. Попробуйте снова.', type: 'error' });
                  setShowCaptcha(false);
                }}
                options={{ theme: 'light', size: 'normal' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКИ ПОЛИТИК */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          {/* Клик по фону закрывает модалку */}
          <div className="absolute inset-0" onClick={() => setActiveLegalModal(null)}></div>
          
          <div className="bg-white dark:bg-[#18181b] w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[80vh] max-h-[800px] relative z-10 animate-in zoom-in-95">
            
            {/* Шапка модалки */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0 bg-white dark:bg-[#18181b] z-10">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                {activeLegalModal === 'terms' && 'Условия использования'}
                {activeLegalModal === 'privacy' && 'Политика конфиденциальности'}
                {activeLegalModal === 'cookies' && 'Использование Cookies'}
              </h2>
              <button onClick={() => setActiveLegalModal(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Контент модалки */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed space-y-8">
              
              {/* ======================= TERMS ======================= */}
              {activeLegalModal === 'terms' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">Пользовательское соглашение (Оферта)</h2>
                  <p className="italic text-zinc-500">Редакция от 12 апреля 2026 года</p>
                  
                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">1. Общие положения и Акцепт</h3>
                    <p>Настоящее Соглашение является публичной офертой в соответствии со ст. 407 Гражданского кодекса Республики Беларусь. Оно регулирует отношения между Администратором (гражданином РБ Климовым В.Е.) и пользователями сервиса Gudex.</p>
                    <p><b>Полным и безоговорочным акцептом (принятием)</b> условий настоящего Соглашения является факт регистрации Пользователя и/или успешный вход в Единый аккаунт (ст. 408 ГК РБ). С этого момента Пользователь становится стороной по настоящему Соглашению.</p>
                    <p>Администратор оставляет за собой право в одностороннем порядке вносить изменения в Соглашение. Новая редакция вступает в силу с момента ее публикации на сайте, если иное не предусмотрено самой редакцией.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">2. Единый аккаунт Good и Безопасность</h3>
                    <p>Для доступа к сервису Gudex используется централизованная система авторизации — <b>Единый аккаунт Good</b> (домен <code>account.goodfaceteam.ru</code>). Создавая аккаунт, Пользователь получает единый профиль для доступа ко всей экосистеме проектов Good Face Team.</p>
                    <p>Регистрация и использование Сервиса разрешены <b>исключительно лицам старше 16 лет</b>.</p>
                    <p>Пользователь несет полную единоличную ответственность за сохранность своих учетных данных. <b>Администратор не несет ответственности и не возмещает убытки</b>, возникшие по причине несанкционированного использования аккаунта Пользователя третьими лицами.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">3. Права на контент</h3>
                    <p>Пользователь сохраняет авторские права на публикуемые материалы. Размещая контент на Gudex, Пользователь предоставляет Администратору безвозмездную, всемирную лицензию на хранение, отображение, адаптацию (например, сжатие) и распространение контента в рамках функционала Сервиса (ст. 984, 985 ГК РБ).</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">4. Правила размещения контента и ограничения</h3>
                    <p>Платформа строго соблюдает законодательство. Пользователю <b>категорически запрещается</b> использовать сервисы Gudex для размещения, хранения, передачи и распространения информации, которая:</p>
                    
                    <div className="space-y-4 mt-2">
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">4.1. Угрожает государственной и общественной безопасности:</h4>
                        <ul className="list-disc pl-6 space-y-1 text-xs">
                          <li>Содержит призывы к насильственному захвату государственной власти, изменению конституционного строя или изменению границ Республики Беларусь.</li>
                          <li>Включена в Республиканский список экстремистских материалов, а также содержит экстремистскую или нацистскую символику, атрибутику, аббревиатуры и лозунги.</li>
                          <li>Направлена на разжигание расовой, национальной, религиозной либо иной социальной вражды или розни.</li>
                          <li>Содержит призывы к организации или участию в несанкционированных массовых мероприятиях, митингах, забастовках и пикетировании.</li>
                          <li>Содержит оскорбление Президента Республики Беларусь, представителей власти, государственных служащих, судей, а также клевету в их отношении.</li>
                          <li>Направлена на дискредитацию Республики Беларусь, ее государственных органов и символов (надругательство над флагом, гербом, гимном).</li>
                          <li>Содержит пропаганду войны, терроризма или инструкции по финансированию террористической/экстремистской деятельности.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">4.2. Нарушает нормы морали, здоровья и безопасности:</h4>
                        <ul className="list-disc pl-6 space-y-1 text-xs">
                          <li>Содержит пропаганду потребления наркотических средств, психотропных веществ, их аналогов, токсических веществ, а также информацию о способах их изготовления, использования и местах приобретения.</li>
                          <li>Является порнографией (в том числе детской порнографией), а также ссылками на ресурсы, содержащие подобные материалы.</li>
                          <li>Пропагандирует суицид, содержит описание способов самоубийства или любые призывы к его совершению.</li>
                          <li>Содержит инструкции по изготовлению взрывчатых веществ, самодельного оружия или иных опасных предметов.</li>
                          <li>Демонстрирует сцены чрезмерной жестокости, насилия в отношении людей или животных (шок-контент).</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">4.3. Нарушает права личности:</h4>
                        <ul className="list-disc pl-6 space-y-1 text-xs">
                          <li>Содержит персональные данные третьих лиц (адреса, номера телефонов, паспортные данные, личные переписки), опубликованные без их явного предварительного согласия (запрет на «доксинг»).</li>
                          <li>Представляет собой кибербуллинг (травлю), прямые или косвенные угрозы физической расправой, шантаж, вымогательство.</li>
                          <li>Оскорбляет честь, достоинство или деловую репутацию других пользователей или третьих лиц.</li>
                          <li>Нарушает авторские, смежные, патентные права, права на товарные знаки или иную интеллектуальную собственность третьих лиц.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">4.4. Связана с киберпреступлениями и спамом:</h4>
                        <ul className="list-disc pl-6 space-y-1 text-xs">
                          <li>Содержит вредоносное программное обеспечение (вирусы, трояны), фишинговые ссылки или скрипты, направленные на несанкционированный сбор данных (парсинг) сервиса или пользователей.</li>
                          <li>Представляет собой спам, массовую рассылку нежелательных сообщений.</li>
                          <li>Рекламирует финансовые пирамиды, нелегальные онлайн-казино, букмекерские конторы, не имеющие лицензии в РБ, а также любые мошеннические схемы отъема денежных средств.</li>
                          <li>Содержит предложения о продаже поддельных документов, краденых вещей или незаконном обмене валют.</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">5. Ограничение ответственности и Предоставление сервисов</h3>
                    <p>Сервис предоставляется на условиях «как есть» (as is). Пользователь соглашается с тем, что перечень сервисов и функционал платформы Gudex может изменяться Администратором в любое время без предварительного уведомления.</p>
                    <p>В соответствии с законодательством, <b>Администратор выступает исключительно в роли информационного посредника</b>. Администратор не инициирует размещение контента и не влияет на целостность передаваемых пользователями данных.</p>
                    <p><b>Ни при каких обстоятельствах Администратор не несет ответственности за прямой или косвенный ущерб</b> (включая упущенную выгоду), причиненный Пользователю в результате использования или невозможности использования сервисов Gudex, а также в результате перебоев в работе инфраструктурных партнеров (Cloudflare Inc., ООО «Бегет», Pusher Ltd., hoster.by).</p>
                    <p>В случае получения жалоб или мотивированного требования от правоохранительных органов, Администратор имеет безусловное право без уведомления удалять контент, приостанавливать действие аккаунтов и передавать технические данные в компетентные органы.</p>
                  </section>

                  <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">6. Контакты для связи и жалоб</h3>
                    <p>По всем вопросам, связанным с работой сервиса или для сообщения о противоправном контенте, просьба использовать встроенную систему жалоб или обращаться по электронной почте:</p>
                    <p className="font-mono text-blue-500 font-bold">admin@goodfaceteam.ru</p>
                  </section>
                </div>
              )}

              {/* ======================= PRIVACY ======================= */}
              {activeLegalModal === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white pb-2">Политика в отношении обработки персональных данных</h2>
                    <p className="italic text-zinc-500 text-xs">Редакция от 12 апреля 2026 года</p>
                  </div>
                  
                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 1. Общие положения</h3>
                    <p>1.1. Настоящая Политика разработана в соответствии с требованиями Закона Республики Беларусь от 07.05.2021 № 99-З «О защите персональных данных» (далее — Закон о защите ПД).</p>
                    <p>1.2. Оператором персональных данных выступает гражданин Республики Беларусь <b>Климов Владислав Евгеньевич</b> (далее — Оператор).</p>
                    <p>1.3. Политика действует в отношении всей информации, которую Оператор может получить о субъектах персональных данных (далее — Пользователях) во время использования ими любых веб-сайтов, сервисов, программ и продуктов, входящих в экосистему <b>Good Creative Hub</b> (включая платформу Gudex, Good Expert и централизованную систему Единый аккаунт Good).</p>
                    <p>1.4. Использование сервисов экосистемы означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 2. Права субъекта персональных данных</h3>
                    <p>В соответствии с Законом о защите ПД, Пользователь имеет следующие права:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><b>2.1. Право на получение информации, касающейся обработки ПД:</b> Пользователь вправе знать, какие данные обрабатываются, правовые основания, цели обработки и сроки хранения. Оператор обязан предоставить эту информацию в течение <b>5 рабочих дней</b> с момента получения заявления.</li>
                      <li><b>2.2. Право на внесение изменений в ПД:</b> Пользователь вправе требовать от Оператора внесения изменений в свои ПД, если они являются неполными, устаревшими или неточными. Оператор вносит изменения в течение <b>15 дней</b>.</li>
                      <li><b>2.3. Право на получение информации о предоставлении ПД третьим лицам:</b> Пользователь вправе один раз в календарный год бесплатно получать информацию о том, кому передавались его данные. Срок ответа Оператора — <b>15 дней</b>.</li>
                      <li><b>2.4. Право требовать прекращения обработки ПД и их удаления:</b> Пользователь имеет право на «забвение». Оператор обязан прекратить обработку и удалить данные в течение <b>15 дней</b> (при отсутствии иных законных оснований для хранения).</li>
                      <li><b>2.5. Право на отзыв согласия:</b> Пользователь вправе в любое время отозвать свое согласие на обработку ПД. Оператор прекращает обработку в течение <b>15 дней</b>.</li>
                      <li><b>2.6. Право на обжалование:</b> Пользователь вправе обжаловать действия (бездействие) Оператора в Национальном центре защиты персональных данных Республики Беларусь (НЦЗПД) или в судебном порядке.</li>
                    </ul>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 mt-4">
                      <p className="font-bold mb-2">Порядок подачи заявления:</p>
                      <p className="text-xs">Для реализации своих прав Пользователь должен направить заявление на электронную почту <span className="font-mono text-blue-500">admin@goodfaceteam.ru</span>. Заявление должно содержать: ФИО (если указывалось), адрес электронной почты, привязанный к аккаунту, псевдоним (@handle) и суть требования.</p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 3. Обязанности Оператора</h3>
                    <p>Оператор обязан:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>3.1. Разъяснять субъекту ПД его права, связанные с обработкой ПД.</li>
                      <li>3.2. Получать согласие на обработку ПД, за исключением случаев, предусмотренных законодательством.</li>
                      <li>3.3. Обеспечивать защиту ПД в процессе их обработки.</li>
                      <li>3.4. Принимать правовые, организационные и технические меры по обеспечению защиты ПД от несанкционированного или случайного доступа к ним, изменения, блокирования, копирования, предоставления, распространения ПД.</li>
                      <li>3.5. Незамедлительно, но не позднее 3 рабочих дней, уведомлять НЦЗПД о нарушениях систем защиты ПД.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 4. Цели, категории данных и сроки хранения</h3>
                    <p>Оператор осуществляет обработку ПД в следующих целях:</p>
                    
                    <div className="space-y-4 mt-4">
                      <div className="p-4 border-l-2 border-blue-500 bg-zinc-50 dark:bg-zinc-800/30">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Цель 1: Регистрация и функционирование Единого аккаунта</h4>
                        <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                          <li><b>Категории данных:</b> Имя пользователя, псевдоним (@handle), адрес электронной почты, хэш-сумма пароля.</li>
                          <li><b>Правовое основание:</b> Договор (Пользовательское соглашение), ст. 6 абз. 15 Закона о защите ПД.</li>
                          <li><b>Срок хранения:</b> До момента удаления аккаунта Пользователем.</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-2 border-emerald-500 bg-zinc-50 dark:bg-zinc-800/30">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Цель 2: Обеспечение безопасности и анти-спам защита</h4>
                        <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                          <li><b>Категории данных:</b> IP-адрес, данные User-Agent (тип браузера), уникальный идентификатор устройства (device_id), время последнего входа (last_seen), токены сессий.</li>
                          <li><b>Правовое основание:</b> Законный интерес Оператора, обеспечение целостности систем.</li>
                          <li><b>Срок хранения:</b> 1 год с момента последней активности сессии.</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-2 border-purple-500 bg-zinc-50 dark:bg-zinc-800/30">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Цель 3: Доставка контента и коммуникация (Чаты, посты)</h4>
                        <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                          <li><b>Категории данных:</b> Содержимое текстовых сообщений, медиафайлы, метаданные соединений Pusher.</li>
                          <li><b>Правовое основание:</b> Согласие пользователя (ст. 5 Закона о защите ПД), Договор.</li>
                          <li><b>Срок хранения:</b> До удаления контента самим Пользователем или Администратором.</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-2 border-red-500 bg-zinc-50 dark:bg-zinc-800/30">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Цель 4: Модерация и соблюдение законодательства РБ</h4>
                        <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                          <li><b>Категории данных:</b> Технические копии (снапшоты) удаленного или отредактированного контента, логи действий по жалобам (репортам).</li>
                          <li><b>Правовое основание:</b> Выполнение обязанностей, предусмотренных законодательными актами (предотвращение распространения противоправной информации).</li>
                          <li><b>Срок хранения:</b> 3 года с момента создания снапшота для передачи по запросам правоохранительных органов.</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 5. Уполномоченные лица</h3>
                    <p>Для обеспечения бесперебойной работы сервисов Good Creative Hub, Оператор привлекает уполномоченных лиц, которые осуществляют техническую обработку данных по поручению Оператора на основании заключенных договоров (оферт):</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><b>ООО «Бегет» (Российская Федерация):</b> Предоставление услуг виртуального хостинга и физическое размещение баз данных SQL.</li>
                      <li><b>Cloudflare Inc. (США / ЕС):</b> Маршрутизация трафика, кэширование статических данных, защита от DDoS-атак и облачное хранилище (R2) для загружаемых медиафайлов.</li>
                      <li><b>Pusher Ltd. (Великобритания):</b> Обеспечение инфраструктуры WebSockets для мгновенной доставки сообщений в чатах и уведомлений.</li>
                    </ul>
                    <p className="text-xs text-zinc-500">Оператор гарантирует, что договоры с уполномоченными лицами содержат обязательства по соблюдению конфиденциальности ПД.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 6. Трансграничная передача данных</h3>
                    <p>6.1. Оператор осуществляет трансграничную передачу ПД на серверы уполномоченных лиц, расположенные за пределами Республики Беларусь.</p>
                    <p>6.2. Передача ПД на территорию Российской Федерации (ООО «Бегет») осуществляется в штатном режиме, так как данное государство включено НЦЗПД в перечень стран, обеспечивающих надлежащий уровень защиты прав субъектов ПД.</p>
                    <p className="text-red-600 dark:text-red-400 font-medium">6.3. ВАЖНО: В соответствии со статьей 9 Закона № 99-З, Пользователь проинформирован о том, что часть серверов инфраструктуры (Cloudflare, Pusher) может находиться в иностранных государствах (США, Великобритания), на территории которых НЕ обеспечивается надлежащий уровень защиты прав субъектов ПД.</p>
                    <p>6.4. Возможные риски для Пользователя в связи с пунктом 6.3 включают отсутствие в этих странах независимого надзорного органа по защите данных (аналога НЦЗПД) и ограниченные механизмы судебной защиты ПД. Регистрация аккаунта является явным информированным согласием Пользователя на такую передачу.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg uppercase tracking-wider text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Глава 7. Меры по обеспечению безопасности</h3>
                    <p>Оператор реализует следующие требования к защите ПД:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Использование криптографических протоколов (HTTPS/TLS/SSL) при передаче данных между клиентом и сервером.</li>
                      <li>Необратимое хэширование паролей пользователей (с использованием современных алгоритмов криптографии) перед сохранением в базу данных. Оператор принципиально не хранит пароли в открытом виде.</li>
                      <li>Логическое разделение баз данных и ограничение доступа к серверам по выделенным IP-адресам и SSH-ключам.</li>
                      <li>Регулярное резервное копирование (бэкапы) для предотвращения потери данных.</li>
                    </ul>
                  </section>
                  
                </div>
              )}

              {/* ======================= COOKIES ======================= */}
              {activeLegalModal === 'cookies' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">Политика Cookie и Локального хранилища</h2>
                  
                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Что мы используем?</h3>
                    <p>Для работы сервиса Gudex мы используем файлы Cookie, а также технологию Local Storage (Локальное хранилище браузера), которая позволяет сохранять настройки прямо на вашем устройстве.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Типы данных</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                        <p className="font-bold underline mb-1">Технические (строго необходимые):</p>
                        <ul className="text-xs list-disc pl-4 space-y-1">
                          <li><code>auth_session</code> — междоменные cookie, устанавливаемые сервисом <code>account.goodfaceteam.ru</code> для поддержания вашей сквозной авторизации.</li>
                          <li><b>Файлы безопасности Cloudflare</b> (<code>__cf_bm</code>, <code>CF_VERIFIED_DEVICE</code>) — для защиты от ботов.</li>
                          <li><code>device_id</code> (Local Storage) — уникальный идентификатор устройства.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                        <p className="font-bold underline mb-1">Функциональные (Local Storage):</p>
                        <ul className="text-xs list-disc pl-4 space-y-1">
                          <li><code>app-theme</code> — запоминает вашу тему (светлая/темная).</li>
                          <li><code>preferredLanguage</code> — языковые предпочтения.</li>
                          <li><code>gudex_notifs</code> — настройки уведомлений.</li>
                          <li><code>user_data</code> — кэш данных профиля.</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Как отозвать согласие?</h3>
                    <p>Вы можете очистить файлы cookie в настройках браузера. Однако после удаления <code>auth_session</code> потребуется повторная авторизация.</p>
                  </section>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}