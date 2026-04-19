import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Star, Trophy, Loader2, Bomb, Zap, Flame } from 'lucide-react';

export default function CosmicGame({ onClose, onGameEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [targets, setTargets] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]); // Для всплывающих очков
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reward, setReward] = useState(null);

  const playSound = (type) => {
    // В идеале сюда добавить локальные звуки, но пока можно оставить заглушки
    // const audio = new Audio(url); audio.volume = 0.2; audio.play().catch(() => {});
  };

  // Функция для всплывающего текста (очков)
  const addFloatingText = (x, y, text, colorClass) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingTexts(prev => [...prev, { id, x, y, text, colorClass }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  // ИГРОВОЙ ЦИКЛ: Спавн целей с динамической сложностью
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    // Чем меньше времени, тем быстрее появляются цели (от 800мс до 400мс)
    const spawnRate = Math.max(400, 800 - ((30 - timeLeft) * 15));

    const spawnInterval = setInterval(() => {
      const rand = Math.random();
      let type = 'normal'; // 65% шанс
      let lifeTime = 1500;
      let size = Math.floor(Math.random() * 20) + 45;

      if (rand > 0.85) {
        type = 'bomb'; // 15% шанс
        lifeTime = 2000;
        size = 55;
      } else if (rand > 0.65) {
        type = 'bonus'; // 20% шанс
        lifeTime = 900; // Исчезают очень быстро
        size = 40;
      }

      const newTarget = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: Math.floor(Math.random() * 75) + 10, 
        y: Math.floor(Math.random() * 65) + 15,
        size,
        expiresAt: Date.now() + lifeTime
      };

      setTargets(prev => [...prev, newTarget]);
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, timeLeft]);

  // Очистка протухших целей и сброс комбо при промахе
  useEffect(() => {
    if (!isPlaying) return;
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTargets(prev => {
        let missedGoodTarget = false;
        const keptTargets = prev.filter(t => {
          if (t.expiresAt <= now) {
            // Если пропала хорошая цель (не бомба), сбрасываем комбо
            if (t.type !== 'bomb') missedGoodTarget = true;
            return false;
          }
          return true;
        });

        if (missedGoodTarget) {
          setCombo(1); // Сброс комбо за промах
        }
        return keptTargets;
      });
    }, 100);
    return () => clearInterval(cleanup);
  }, [isPlaying]);

  // Таймер
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleGameOver();
    }
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setCombo(1);
    setTimeLeft(30);
    setTargets([]);
    setFloatingTexts([]);
    setIsGameOver(false);
    setReward(null);
    setIsPlaying(true);
  };

  const handleHit = (target, e) => {
    e.stopPropagation();
    e.preventDefault();

    // Удаляем объект
    setTargets(prev => prev.filter(t => t.id !== target.id));

    if (target.type === 'bomb') {
      playSound('bomb');
      setScore(prev => Math.max(0, prev - 20));
      setCombo(1); // Бомба сбрасывает комбо
      addFloatingText(target.x, target.y, '-20', 'text-red-500 font-black text-2xl');
      
      // Красный всплеск на экране (можно реализовать через стейт, но пока обойдемся текстом)
    } else {
      playSound('hit');
      const basePoints = target.type === 'bonus' ? 30 : 10;
      const earned = basePoints * combo;
      
      setScore(prev => prev + earned);
      
      // Увеличиваем комбо (максимум x5)
      setCombo(prev => {
        const newCombo = Math.min(prev + 1, 5);
        if (newCombo > prev && newCombo > 1) {
           addFloatingText(target.x, target.y - 10, `Combo x${newCombo}!`, 'text-orange-400 font-black text-xl');
        }
        return newCombo;
      });

      addFloatingText(target.x, target.y, `+${earned}`, target.type === 'bonus' ? 'text-yellow-400 font-black text-3xl' : 'text-emerald-400 font-black text-2xl');
    }
  };

  const handleGameOver = async () => {
    setIsPlaying(false);
    setIsGameOver(true);
    setTargets([]);
    setFloatingTexts([]);

    if (score >= 50) {
      setIsSaving(true);
      try {
        const res = await fetch("https://api.goodfaceteam.ru/reward_game.php", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ score: score })
        });
        const data = await res.json();
        if (data.success) {
          setReward(data.reward);
          if (onGameEnd) onGameEnd(); 
        }
      } catch (e) {
        console.error("Ошибка сохранения результата", e);
      }
      setIsSaving(false);
    }
  };

  // Рендер визуального стиля цели
  const renderTargetIcon = (target) => {
    if (target.type === 'bomb') return <Bomb size={target.size / 2} className="text-red-100" strokeWidth={2.5} />;
    if (target.type === 'bonus') return <Zap size={target.size / 2} className="text-yellow-100" fill="currentColor" strokeWidth={2} />;
    return <Star size={target.size / 2.2} className="text-white" fill="currentColor" />;
  };

  const getTargetStyle = (target) => {
    if (target.type === 'bomb') return 'bg-gradient-to-br from-red-600 to-black shadow-[0_0_30px_rgba(220,38,38,0.8),inset_0_0_15px_rgba(0,0,0,0.8)] border border-red-500/50';
    if (target.type === 'bonus') return 'bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_30px_rgba(234,179,8,0.8),inset_0_0_15px_rgba(255,255,255,0.5)] border border-yellow-200/50';
    return 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_0_10px_rgba(255,255,255,0.3)] border border-white/20';
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#070514]/90 backdrop-blur-xl overflow-hidden font-sans select-none">
      
      {/* ФОН: Глубокий космос (Glassmorphism + Неон) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.5), rgba(0,0,0,0))', backgroundSize: '150px 150px' }} />
      </div>

      <button onClick={onClose} className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 shadow-xl">
        <X size={20} />
      </button>

      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col justify-center items-center p-4">
        
        {/* --- ЭКРАН СТАРТА --- */}
        {!isPlaying && !isGameOver && (
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="text-center z-10 bg-black/40 p-8 md:p-12 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] max-w-lg w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
            
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
               <Rocket size={48} className="text-purple-400" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-6 tracking-tight">Ловец Звезд</h2>
            
            <div className="space-y-4 mb-10 text-left bg-black/30 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3">
                <Star className="text-blue-400" size={20} fill="currentColor" />
                <p className="text-sm text-zinc-300 font-medium">Кликай по звездам <span className="text-emerald-400 font-bold">+10</span></p>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="text-yellow-400" size={20} fill="currentColor" />
                <p className="text-sm text-zinc-300 font-medium">Лови кометы <span className="text-yellow-400 font-bold">+30</span></p>
              </div>
              <div className="flex items-center gap-3">
                <Bomb className="text-red-500" size={20} />
                <p className="text-sm text-zinc-300 font-medium">Не трогай черные дыры <span className="text-red-500 font-bold">-20</span></p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <Flame className="text-orange-500" size={20} />
                <p className="text-sm text-zinc-300 font-medium">Не пропускай звезды, чтобы копить <span className="text-orange-400 font-bold">Комбо (до x5)</span></p>
              </div>
            </div>

            <button onClick={startGame} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-lg py-5 rounded-[24px] shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_10px_40px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all">
              НАЧАТЬ ЗАРАБОТОК
            </button>
          </motion.div>
        )}

        {/* --- ИГРОВОЙ ИНТЕРФЕЙС (HUD) --- */}
        {isPlaying && (
          <>
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col md:flex-row gap-3 w-[calc(100%-80px)] md:w-auto">
              
              {/* Очки */}
              <div className="bg-black/40 border border-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center justify-between md:justify-start gap-6 shadow-xl">
                <div>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">Твой счет</span>
                  <span className="text-white font-black text-2xl leading-none">{score}</span>
                </div>
                
                {/* Индикатор Комбо */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${combo > 1 ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/5 border-white/10'}`}>
                  <Flame size={14} className={combo > 1 ? 'text-orange-400' : 'text-zinc-500'} />
                  <span className={`font-black text-sm ${combo > 1 ? 'text-orange-400' : 'text-zinc-500'}`}>x{combo}</span>
                </div>
              </div>

              {/* Таймер */}
              <div className={`bg-black/40 border backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl transition-colors ${timeLeft <= 5 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
                <div>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">До конца</span>
                  <span className={`font-black text-2xl leading-none ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
                    0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* --- ИГРОВОЕ ПОЛЕ --- */}
            <div className="absolute inset-0 top-[120px] bottom-[20px] z-10" onClick={() => setCombo(1)}> 
              {/* Клик мимо цели сбрасывает комбо */}
              <AnimatePresence>
                {targets.map(target => (
                  <motion.button
                    key={target.id}
                    initial={{ scale: 0, opacity: 0, rotate: -30 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, filter: 'blur(10px)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={(e) => handleHit(target, e)}
                    className={`absolute cursor-crosshair focus:outline-none rounded-full flex items-center justify-center active:scale-75 ${getTargetStyle(target)}`}
                    style={{
                      left: `${target.x}%`,
                      top: `${target.y}%`,
                      width: target.size,
                      height: target.size,
                    }}
                  >
                    {renderTargetIcon(target)}
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Всплывающие тексты (очки) */}
              <AnimatePresence>
                {floatingTexts.map(ft => (
                  <motion.div
                    key={ft.id}
                    initial={{ opacity: 1, y: 0, scale: 0.5 }}
                    animate={{ opacity: 0, y: -60, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute pointer-events-none ${ft.colorClass} drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]`}
                    style={{ left: `calc(${ft.x}% + 20px)`, top: `calc(${ft.y}% - 20px)` }}
                  >
                    {ft.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* --- ЭКРАН КОНЦА ИГРЫ --- */}
        {isGameOver && (
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="text-center z-20 bg-black/60 p-8 md:p-12 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            
            {score >= 50 && <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />}
            
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 shadow-inner relative z-10">
              <Trophy size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-1 relative z-10">Орбита зачищена!</h2>
            <p className="text-zinc-400 mb-8 font-medium">Собрано звездной пыли: <span className="text-white font-black text-xl ml-1">{score}</span></p>

            {isSaving ? (
              <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-3xl border border-white/5 mb-8">
                <Loader2 size={32} className="animate-spin text-purple-500 mb-3" />
                <p className="text-sm font-bold text-zinc-400 animate-pulse">Синхронизация с базой...</p>
              </div>
            ) : score >= 50 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] p-6 mb-8 relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-[100px] h-[100px] bg-emerald-500/20 blur-[40px] rounded-full" />
                <p className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-3">Космическая добыча</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-black text-white">+{reward?.amount || 1}</span>
                  <span className="text-xl font-bold text-emerald-300 uppercase">{reward?.currency || 'Mercury'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[28px] p-6 mb-8">
                <p className="text-red-400 font-bold mb-1 text-lg">Не хватило очков!</p>
                <p className="text-sm text-zinc-500 font-medium">Собери минимум 50, чтобы получить планеты.</p>
              </div>
            )}

            <div className="space-y-3 relative z-10">
              <button onClick={startGame} className="w-full bg-white text-black hover:bg-zinc-200 font-black text-[15px] py-4 rounded-2xl transition-colors active:scale-95 shadow-lg">
                ИГРАТЬ СНОВА
              </button>
              <button onClick={onClose} className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white font-bold text-[15px] py-4 rounded-2xl transition-colors active:scale-95">
                ЗАКРЫТЬ
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}