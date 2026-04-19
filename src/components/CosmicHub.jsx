import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Cpu, RefreshCw, Star, Zap, ChevronRight, ChevronLeft, Loader2, Pickaxe } from 'lucide-react';
import CosmicGame from './CosmicGame'; 

// Настройки уровней видеокарт (Майнинг фермы)
const GPU_STATS = {
  1: { name: "GTX 1050 Ti (Retro)", clickPower: 1, autoPower: 0, nextCost: 500, color: "from-zinc-500 to-zinc-700" },
  2: { name: "RTX 2060 Super", clickPower: 3, autoPower: 1, nextCost: 2500, color: "from-green-500 to-emerald-700" },
  3: { name: "RTX 3080 Ti", clickPower: 10, autoPower: 5, nextCost: 10000, color: "from-blue-500 to-indigo-700" },
  4: { name: "RTX 4090", clickPower: 25, autoPower: 20, nextCost: 50000, color: "from-purple-500 to-purple-800" },
  5: { name: "Gudex Quantum Miner", clickPower: 100, autoPower: 150, nextCost: null, color: "from-yellow-400 to-orange-600" } 
};

export default function CosmicHub({ onClose, onBalanceUpdate }) {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'miner', 'catcher'
  const [isLoading, setIsLoading] = useState(true);
  
  // Данные майнинга
  const [stars, setStars] = useState(0);
  const [gpuLevel, setGpuLevel] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exchangeStatus, setExchangeStatus] = useState(null);

  const starsRef = useRef(stars);
  starsRef.current = stars; 

  // 1. ЗАГРУЗКА ДАННЫХ ПРИ ОТКРЫТИИ
  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        const res = await fetch("https://api.goodfaceteam.ru/mining_sync.php", {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setStars(data.stars);
          setGpuLevel(data.gpu_level);
        }
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    fetchMiningData();
  }, []);

  // 2. ПАССИВНЫЙ МАЙНИНГ
  useEffect(() => {
    if (isLoading || GPU_STATS[gpuLevel].autoPower === 0) return;
    const interval = setInterval(() => {
      setStars(prev => prev + GPU_STATS[gpuLevel].autoPower);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, gpuLevel]);

  // 3. СИНХРОНИЗАЦИЯ С СЕРВЕРОМ
  useEffect(() => {
    if (isLoading) return;
    const syncInterval = setInterval(() => {
      syncWithServer(starsRef.current, gpuLevel);
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [isLoading, gpuLevel]);

  const syncWithServer = async (currentStars, currentLevel) => {
    fetch("https://api.goodfaceteam.ru/mining_sync.php", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      body: JSON.stringify({ stars: currentStars, gpu_level: currentLevel })
    }).catch(console.error);
  };

  const handleMineClick = (e) => {
    const power = GPU_STATS[gpuLevel].clickPower;
    setStars(prev => prev + power);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleUpgrade = async () => {
    const cost = GPU_STATS[gpuLevel].nextCost;
    if (stars >= cost && cost !== null) {
      const newStars = stars - cost;
      const newLevel = gpuLevel + 1;
      setStars(newStars);
      setGpuLevel(newLevel);
      await syncWithServer(newStars, newLevel);
    }
  };

  const handleExchange = async () => {
    if (stars < 1000) return;
    setIsSyncing(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/exchange_stars.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ amount: 1000 }) 
      });
      const data = await res.json();
      if (data.success) {
        setStars(prev => prev - 1000);
        setExchangeStatus(`Успех! Вы получили 1 ${data.reward_planet.toUpperCase()}`);
        if (onBalanceUpdate) onBalanceUpdate();
        setTimeout(() => setExchangeStatus(null), 3000);
      }
    } catch (e) { console.error(e); }
    setIsSyncing(false);
  };

  const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#070514]/90 backdrop-blur-xl">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  if (activeView === 'catcher') {
    return (
      <CosmicGame 
        onClose={() => setActiveView('hub')} 
        onGameEnd={() => {
          if (onBalanceUpdate) onBalanceUpdate();
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#070514]/90 backdrop-blur-xl font-sans select-none overflow-hidden">
      
      {/* ФОН */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0))', backgroundSize: '100px 100px' }} />
      </div>

      {/* ОГРАНИЧИВАЮЩИЙ КОНТЕЙНЕР (ВАЖНО ДЛЯ МОБИЛОК h-[100dvh]) */}
      <div className="relative w-full max-w-5xl h-[100dvh] md:h-[90vh] flex flex-col mx-auto">
        
        {/* --- ШАПКА --- */}
        <div className="flex-none p-4 md:p-8 pb-2 md:pb-6">
          <div className="flex items-center justify-between bg-black/50 border border-white/10 backdrop-blur-2xl rounded-3xl p-3 md:p-4 shadow-xl">
            
            {/* Левая часть: Иконка + Текст */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl items-center justify-center shadow-inner shrink-0">
                <Rocket className="text-white" size={24} />
              </div>
              <div className="flex sm:hidden w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl items-center justify-center shadow-inner shrink-0">
                <Rocket className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-white font-black text-[15px] sm:text-lg md:text-xl leading-tight">Космический Хаб</h2>
                <p className="text-blue-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hidden sm:block">Орбитальная станция Gudex</p>
              </div>
            </div>
            
            {/* Правая часть: Баланс + Кнопка закрытия */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-end">
                <span className="text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">Звездная пыль</span>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl">
                  <Star size={14} className="text-yellow-400 sm:w-4 sm:h-4" fill="currentColor" />
                  <span className="text-yellow-400 font-black text-sm sm:text-xl">{formatNumber(stars)}</span>
                </div>
              </div>
              
              {/* КНОПКА ЗАКРЫТИЯ (теперь в шапке, не наезжает на элементы) */}
              <button 
                onClick={() => { syncWithServer(stars, gpuLevel); onClose(); }} 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* --- СКРОЛЛИРУЕМЫЙ КОНТЕНТ (Важно для адаптива) --- */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 md:px-8 pb-8">
          
          {/* === ГЛАВНЫЙ ЭКРАН ХАБА === */}
          {activeView === 'hub' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-full md:h-auto content-start">
              
              {/* Карточка 1: МАЙНИНГ ФЕРМА */}
              <div onClick={() => setActiveView('miner')} className="cursor-pointer text-left w-full bg-black/40 border border-white/10 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 flex flex-col relative overflow-hidden group hover:border-emerald-500/50 transition-all active:scale-[0.98] sm:active:scale-100">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                  <Cpu size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 shrink-0">Крипто-отсек</h3>
                <p className="text-zinc-400 text-[13px] sm:text-sm mb-4 sm:mb-6 flex-1">Добывай звездную пыль с помощью видеокарт. Кликай или прокачивай оборудование для пассивного дохода.</p>
                
                <div className="bg-black/50 rounded-xl p-3 sm:mb-6 flex items-center justify-between border border-white/5 shrink-0">
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase">Скорость</span>
                  <span className="text-emerald-400 font-black text-[13px] sm:text-sm">+{formatNumber(GPU_STATS[gpuLevel].autoPower)} зв/сек</span>
                </div>

                {/* Эта кнопка теперь видна только на ПК (hidden sm:flex) */}
                <div className="hidden sm:flex w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all items-center justify-center gap-2 text-sm sm:text-base mt-auto shrink-0">
                  ВОЙТИ В ОТСЕК <ChevronRight size={18} />
                </div>
              </div>

              {/* Карточка 2: ЛОВЕЦ МЕТЕОРИТОВ */}
              <div onClick={() => setActiveView('catcher')} className="cursor-pointer text-left w-full bg-black/40 border border-white/10 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 flex flex-col relative overflow-hidden group hover:border-purple-500/50 transition-all active:scale-[0.98] sm:active:scale-100">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                  <Pickaxe size={28} className="text-purple-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 shrink-0">Ловец Звезд</h3>
                <p className="text-zinc-400 text-[13px] sm:text-sm mb-0 sm:mb-6 flex-1">Отправляйся в открытый космос, лови кометы и избегай черных дыр. Быстрый способ заработать планеты напрямую!</p>

                {/* Эта кнопка теперь видна только на ПК (hidden sm:flex) */}
                <div className="hidden sm:flex w-full mt-auto bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all items-center justify-center gap-2 text-sm sm:text-base shrink-0">
                  ИГРАТЬ <ChevronRight size={18} />
                </div>
              </div>

              {/* Карточка 3: ОБМЕННИК */}
              <button 
                onClick={handleExchange}
                disabled={stars < 1000 || isSyncing}
                className="text-left w-full bg-black/40 border border-white/10 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/50 transition-all active:scale-[0.98] sm:active:scale-100 disabled:opacity-60 disabled:grayscale lg:col-span-1 md:col-span-2 outline-none"
              >
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 border border-blue-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                  <RefreshCw size={28} className="text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 shrink-0">Обменник</h3>
                <p className="text-zinc-400 text-[13px] sm:text-sm mb-4 sm:mb-6 flex-1">Синтезируй звездную пыль в полноценные планеты для Магазина Подарков.</p>
                
                <div className="bg-black/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-500/20 mb-0 sm:mb-6 relative w-full shrink-0">
                  <div className="flex justify-between items-center mb-1 sm:mb-3">
                    <span className="text-white font-bold flex items-center gap-1.5 text-sm sm:text-base"><Star size={14} className="text-yellow-400"/> 1 000</span>
                    <ChevronRight className="text-zinc-600 w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-blue-400 font-bold text-sm sm:text-base">1 Планета</span>
                  </div>
                  {exchangeStatus && (
                    <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xs sm:text-sm z-10 animate-in fade-in zoom-in text-center px-2">
                      {exchangeStatus}
                    </div>
                  )}
                </div>

                {/* Эта кнопка теперь видна только на ПК (hidden sm:flex) */}
                <div className="hidden sm:flex w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all items-center justify-center gap-2 shadow-[0_10px_30px_rgba(37,99,235,0.3)] text-sm sm:text-base shrink-0">
                  {isSyncing ? <Loader2 size={20} className="animate-spin"/> : 'СИНТЕЗИРОВАТЬ'}
                </div>
              </button>

            </motion.div>
          )}

          {/* === ЭКРАН МАЙНИНГА === */}
          {activeView === 'miner' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-4 md:gap-6 relative h-full md:h-auto">
              
              {/* Кнопка "Назад" для мобилок */}
              <div className="md:hidden flex mb-2 shrink-0">
                <button onClick={() => setActiveView('hub')} className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-1">
                  <ChevronLeft size={16} /> В Хаб
                </button>
              </div>

              {/* Левая часть: Кликер */}
              <div className="flex-1 bg-black/40 border border-white/10 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-6 flex flex-col items-center justify-center relative min-h-[300px] shrink-0">
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 text-center">{GPU_STATS[gpuLevel].name}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm mb-6 sm:mb-10 text-center">Уровень {gpuLevel} • Добыча: {GPU_STATS[gpuLevel].clickPower} за клик</p>
                
                {/* Огромная кнопка-ферма */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMineClick}
                  className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-[32px] md:rounded-[40px] bg-gradient-to-br ${GPU_STATS[gpuLevel].color} shadow-2xl flex items-center justify-center border-4 border-white/20 outline-none mb-6`}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-[28px] md:rounded-[36px] shadow-inner" />
                  <Cpu size={60} className="text-white/80 relative z-10 sm:w-[80px] sm:h-[80px]" strokeWidth={1} />
                  {/* Анимация вентиляторов */}
                  <Loader2 size={100} className="absolute text-white/10 animate-spin-slow pointer-events-none sm:w-[120px] sm:h-[120px]" />
                </motion.button>
                
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-[11px] animate-pulse text-center">Тапай по ферме для добычи</p>
              </div>

              {/* Правая часть: Апгрейды */}
              <div className="w-full lg:w-[350px] flex flex-col gap-4 shrink-0">
                <button onClick={() => setActiveView('hub')} className="hidden md:flex bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-2xl transition-colors items-center justify-center gap-2">
                  <ChevronLeft size={18} /> ВЕРНУТЬСЯ В ХАБ
                </button>

                <div className="flex-1 bg-black/40 border border-white/10 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 flex flex-col">
                  <h3 className="text-lg sm:text-xl font-black text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Модернизация
                  </h3>
                  
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 border border-white/5">
                      <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Текущая мощность</p>
                      <p className="text-white font-black text-base sm:text-lg">+{GPU_STATS[gpuLevel].clickPower} <span className="text-[11px] sm:text-sm font-medium text-zinc-400">клик</span></p>
                      <p className="text-emerald-400 font-black text-base sm:text-lg">+{GPU_STATS[gpuLevel].autoPower} <span className="text-[11px] sm:text-sm font-medium text-emerald-500/50">сек (авто)</span></p>
                    </div>

                    {GPU_STATS[gpuLevel].nextCost ? (
                      <div className="bg-blue-500/10 rounded-xl sm:rounded-2xl p-4 border border-blue-500/30 mt-auto">
                        <p className="text-blue-400 text-[10px] sm:text-xs font-bold uppercase mb-2">Следующий уровень</p>
                        <h4 className="text-white font-bold text-sm sm:text-base mb-3">{GPU_STATS[gpuLevel + 1].name}</h4>
                        
                        <button 
                          onClick={handleUpgrade}
                          disabled={stars < GPU_STATS[gpuLevel].nextCost}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-between px-4 text-xs sm:text-sm"
                        >
                          <span>АПГРЕЙД</span>
                          <span className="flex items-center gap-1"><Star size={12} sm:size={14}/> {formatNumber(GPU_STATS[gpuLevel].nextCost)}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-orange-500/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-orange-500/30 mt-auto text-center">
                        <h4 className="text-orange-400 font-black text-base sm:text-lg mb-1">МАКС. УРОВЕНЬ</h4>
                        <p className="text-xs sm:text-sm text-zinc-400">У вас топовая ферма!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}