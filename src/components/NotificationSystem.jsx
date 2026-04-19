import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';

// Ссылка на звук уведомления
const NOTIF_SOUND = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

export default function NotificationSystem({ currentUser }) {
  const [activeNotif, setActiveNotif] = useState(null); 
  const audioRef = useRef(new Audio(NOTIF_SOUND));

  // ЗАПРАШИВАЕМ РАЗРЕШЕНИЕ НА ПУШИ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const checkNotifs = async () => {
      try {
        const res = await fetch("https://api.goodfaceteam.ru/check_notifications.php", { credentials: 'include' });
        const data = await res.json();
        
        if (data.success && data.notifications.length > 0) {
          const notif = data.notifications[0];
          showToast(notif);
        }
      } catch (e) { console.error("Ошибка опроса уведомлений", e); }
    };

    const showToast = (notif) => {
      const prefs = JSON.parse(localStorage.getItem('gudex_notifs') || '{"popups":true,"sound":true}');
      const currentPath = window.location.pathname; 
      const isCurrentChat = currentPath.includes(`@${notif.sender_handle}`);
      
      // ИГРАЕМ ЗВУК
      if (prefs.sound) {
        audioRef.current.play().catch(e => console.log("Нужен клик по экрану для звука"));
      }

      if (notif.type === 'message' && isCurrentChat) return;
      
      if (prefs.popups) {
        let message = "";
        if (notif.type === 'like') message = `${notif.sender_name} поставил(а) лайк на ваш пост`;
        if (notif.type === 'follow') message = `${notif.sender_name} подписался(ась) на вас`;
        if (notif.type === 'follow_request') message = `${notif.sender_name} хочет подписаться на вас`;
        if (notif.type === 'message') message = `${notif.sender_name} прислал(а) сообщение`;

        if (!message) message = `Новое событие от ${notif.sender_name}`;

        // ПОКАЗЫВАЕМ ВНУТРИСАЙТОВУЮ ВСПЛЫВАШКУ
        setActiveNotif({
          id: notif.id,
          type: notif.type,
          sender_id: notif.sender_id,
          message: message
        });

        // ==========================================
        // НОВОЕ: СИСТЕМНЫЙ БРАУЗЕРНЫЙ ПУШ (ДЛЯ ОС)
        // ==========================================
        if ("Notification" in window && Notification.permission === "granted") {
          // Проверяем, свернута ли вкладка
          if (document.hidden) {
            const sysNotif = new Notification("gudex.", {
              body: message,
              // icon: '/favicon.ico' // Раскомментируй и укажи путь к логотипу, если хочешь красивую иконку
            });
            
            // При клике на пуш - переходим обратно на вкладку
            sysNotif.onclick = function() {
              window.focus();
              this.close();
            };
          }
        }

        setTimeout(() => setActiveNotif(null), 8000); 
      }
    };

    const interval = setInterval(checkNotifs, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRequest = async (notifId, senderId, action) => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/handle_follow_request.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: action,
          follower_id: senderId,
          notif_id: notifId
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setActiveNotif(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeNotif) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[10000] animate-in slide-in-from-left-full duration-500">
      <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 border border-zinc-800 dark:border-zinc-200 min-w-[320px]">
        
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
          <Bell size={20} />
        </div>
        
        <div className="flex-1">
          <p className="font-bold text-sm">Новое событие</p>
          <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{activeNotif.message}</p>
          
          {activeNotif.type === 'follow_request' && (
            <div className="flex gap-2 mt-3 mb-1">
              <button 
                onClick={() => handleRequest(activeNotif.id, activeNotif.sender_id, 'accept')}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Принять
              </button>
              <button 
                onClick={() => handleRequest(activeNotif.id, activeNotif.sender_id, 'reject')}
                className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 dark:bg-zinc-200 dark:hover:bg-zinc-300 text-white dark:text-zinc-800 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Отклонить
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setActiveNotif(null)} className="ml-2 opacity-50 hover:opacity-100 p-1">
          <X size={16} />
        </button>
        
      </div>
    </div>
  );
}