import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Phone, ChevronDown } from 'lucide-react';

export default function CallScreen({ 
  isOpen, 
  onClose, 
  partner, 
  callStatus, 
  handleAccept, 
  handleDecline,
  remoteAudioStream,
  isMinimized,   
  onMinimize
}) {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isMobile = window.innerWidth <= 768;

  const getEndType = () => {
    if (callStatus === 'connected') return 'ended';
    if (callStatus === 'incoming') return 'declined';
    return 'missed'; // Я звонил и сбросил трубку до того, как подняли
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statusLabels = { connecting: 'Соединение...', calling: 'Звоним...', ringing: 'Звоним...', incoming: 'Входящий звонок', connected: formatDuration(duration), ended: 'Звонок завершен' };

  // Жесткий захват аудио-потока для обхода блокировок Safari/Mobile
  useEffect(() => {
    if (remoteAudioRef.current && remoteAudioStream) {
      remoteAudioRef.current.srcObject = remoteAudioStream;
      const playPromise = remoteAudioRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
  }, [remoteAudioStream]);

  // Разблокировка контекста по клику
  const unlockAudioContext = () => {
    if (remoteAudioRef.current) remoteAudioRef.current.play().catch(() => {});
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
  };

  const onAcceptClick = () => {
    unlockAudioContext();
    handleAccept();
  };

  useEffect(() => {
    if (window.localStream) window.localStream.getAudioTracks().forEach(track => track.enabled = !isMicMuted);
  }, [isMicMuted]);

  useEffect(() => {
    if (remoteAudioRef.current) remoteAudioRef.current.muted = isSpeakerMuted;
  }, [isSpeakerMuted]);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected') interval = setInterval(() => setDuration(d => d + 1), 1000);
    else setDuration(0);
    return () => clearInterval(interval);
  }, [callStatus]);

  // Эквалайзер
  useEffect(() => {
    if (callStatus === 'connected' && remoteAudioStream && !isSpeakerMuted) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          audioContextRef.current.createMediaStreamSource(remoteAudioStream).connect(analyserRef.current);
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
          setAudioLevel(avg / 256); 
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (e) {}
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [callStatus, remoteAudioStream, isSpeakerMuted]);

  if (!isOpen) return null;

  const containerVariants = isMobile 
    ? { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } }
    : { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

  return (
    <>
      {/* АУДИО ТЕГ ВСЕГДА В DOM: Это критически важно, чтобы звук не обрывался при сворачивании окна */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} muted={isSpeakerMuted} />

      {/* Оборачиваем в AnimatePresence и проверяем !isMinimized */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden" 
            onClick={unlockAudioContext}
          >
            {/* ГЛУБОКИЙ БЛЮР на заднем фоне (работает везде, прозрачный) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />

            <motion.div
              variants={containerVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              // Стеклянный эффект самого окошка (Glassmorphism)
              className={`${isMobile ? 'w-full h-full rounded-none' : 'w-[380px] h-[600px] rounded-[36px] border border-white/20'} bg-black/30 dark:bg-white/5 backdrop-blur-3xl shadow-2xl flex flex-col relative overflow-hidden`}
            >
              {/* КНОПКА СВЕРНУТЬ */}
              <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="absolute top-6 left-6 text-white/50 hover:text-white transition p-2 cursor-pointer z-50">
                <ChevronDown size={28} />
              </button>

              <div className="pt-16 pb-4 flex flex-col items-center shrink-0 z-10">
                <h2 className="text-white text-3xl font-semibold tracking-tight">{partner?.name || 'Собеседник'}</h2>
                <p className={`text-[15px] mt-2 transition-colors ${callStatus === 'connected' ? 'text-[#34c759]' : 'text-white/60'}`}>
                  {statusLabels[callStatus] || 'Звонок'}
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-white/10 pointer-events-none transition-transform duration-75" style={{ transform: `scale(${1 + audioLevel * 1.8})` }} />
                  <div className="absolute inset-0 rounded-full bg-white/20 pointer-events-none transition-transform duration-75 delay-75" style={{ transform: `scale(${1 + audioLevel * 1.2})` }} />
                  <div className="w-36 h-36 bg-gradient-to-br from-[#007aff] to-[#0056b3] rounded-full z-10 flex items-center justify-center text-5xl text-white font-bold overflow-hidden shadow-2xl border-4 border-white/10">
                    {partner?.avatar_data ? <img src={partner.avatar_data} alt={partner.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </div>

              <div className="pb-16 px-8 w-full z-10 mt-auto">
                {callStatus === 'incoming' ? (
                  <div className="flex justify-between items-center px-6">
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => handleDecline('declined')} className="w-[75px] h-[75px] rounded-full bg-[#ff3b30] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] active:scale-95 transition-transform"><PhoneOff size={32} /></button>
                      <span className="text-white/70 text-sm">Отклонить</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={onAcceptClick} className="w-[75px] h-[75px] rounded-full bg-[#34c759] flex items-center justify-center text-white shadow-[0_0_20px_rgba(52,199,89,0.4)] active:scale-95 transition-transform animate-pulse"><Phone size={32} /></button>
                      <span className="text-white/70 text-sm">Принять</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center max-w-[280px] mx-auto">
                    <button onClick={() => setIsMicMuted(!isMicMuted)} className={`w-[65px] h-[65px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 backdrop-blur-md ${isMicMuted ? 'bg-white text-black shadow-lg' : 'bg-white/20 text-white hover:bg-white/30 border border-white/10'}`}>
                      {isMicMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    <button onClick={() => handleDecline(getEndType())} className="w-[75px] h-[75px] rounded-full bg-[#ff3b30] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] active:scale-95 transition-transform">
                      <PhoneOff size={32} />
                    </button>

                    {isMobile ? <div className="w-[65px]" /> : (
                      <button onClick={() => setIsSpeakerMuted(!isSpeakerMuted)} className={`w-[65px] h-[65px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 backdrop-blur-md ${isSpeakerMuted ? 'bg-white text-black shadow-lg' : 'bg-white/20 text-white hover:bg-white/30 border border-white/10'}`}>
                        {isSpeakerMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}