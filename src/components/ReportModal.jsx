import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REPORT_REASONS = [
  "Спам или нежелательный контент",
  "Насилие или опасные действия",
  "Ненависть или травля",
  "Контент для взрослых (18+)",
  "Дезинформация или обман",
  "Другое"
];

export function ReportModal({ isOpen, onClose, targetType, targetId, currentUserId }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("https://api.goodfaceteam.ru/submit_report.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason: selectedReason,
          details: details
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        // Закрываем модалку через 2 секунды после успеха
        setTimeout(() => {
          onClose();
          // Сбрасываем стейты для следующего открытия
          setTimeout(() => {
            setSelectedReason("");
            setDetails("");
            setStatus(null);
          }, 300);
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage("Ошибка соединения с сервером. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Клик по фону для закрытия */}
      <div className="absolute inset-0" onClick={() => !isSubmitting && status !== 'success' && onClose()}></div>
      
      <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800">
        
        {/* Шапка модалки */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-[#121212]/50">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={20} strokeWidth={2.5} />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">Пожаловаться</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting || status === 'success'}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Жалоба отправлена</h3>
              <p className="text-zinc-500 text-sm">Спасибо, что помогаете делать Gudex безопаснее.</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                  {errorMessage}
                </div>
              )}

              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Выберите причину
              </p>
              
              <div className="space-y-2 mb-6">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                      selectedReason === reason
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#18181b] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {/* Кастомный радио-баттон */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedReason === reason ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
                    }`}>
                      {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                    {reason}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Опишите подробнее (необязательно)..."
                  rows="3"
                  maxLength="1000"
                  className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
                ></textarea>
                <div className="text-right mt-1 text-xs text-zinc-400 font-medium">
                  {details.length}/1000
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-full font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 py-3.5 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Отправить
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}