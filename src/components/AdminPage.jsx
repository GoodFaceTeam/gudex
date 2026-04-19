import React, { useState, useEffect } from 'react';
import { Shield, BarChart2, Flag, LogOut, Ban, Trash2, CheckCircle2, UserX, AlertCircle, FileText, Search, ArrowLeft, Loader2, Archive, ClipboardList, Download, Briefcase, Database, Printer, BadgeCheck, X, Users, MonitorSmartphone, Eraser,
  Coins, TrendingUp, Wallet, Server, Activity, Megaphone, Radio
 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0, likes: 0, verifications: 0 });
  const [reports, setReports] = useState([]);

  // --- Для заявок на верификацию ---
  const [verifications, setVerifications] = useState([]);
  const [isVerificationsLoading, setIsVerificationsLoading] = useState(false);

  // --- Для User CRM ---
  const [crmSearch, setCrmSearch] = useState('');
  const [crmData, setCrmData] = useState(null); // { user: {}, sessions: [] }
  const [isCrmLoading, setIsCrmLoading] = useState(false);

  // --- Для Мониторинга и Рассылок ---
  const [healthStats, setHealthStats] = useState(null);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info', active: false });
  const [isAlertSaving, setIsAlertSaving] = useState(false);

  // --- Для массовой рассылки ---
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', type: 'system_alert' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // --- Для Экономики ---
  const [ecoStats, setEcoStats] = useState(null);
  const [ecoSearch, setEcoSearch] = useState('');
  const [ecoData, setEcoData] = useState(null);
  const [isEcoLoading, setIsEcoLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundCurrency, setFundCurrency] = useState('stars');
  
  // Состояния для постов и архива
  const [allPosts, setAllPosts] = useState([]);
  const [postSearch, setPostSearch] = useState('');
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const [archive, setArchive] = useState({ posts: [], users: [] });
  const [logs, setLogs] = useState([]);
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);

  // Модерация пользователей
  const [banHandle, setBanHandle] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');

  // --- Для спец. запросов (Досье) ---
  const [extractQuery, setExtractQuery] = useState('');
  const [extractType, setExtractType] = useState('user'); // 'user' или 'chat'
  const [isExtracting, setIsExtracting] = useState(false);

  const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    return fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      credentials: 'include'
    });
  };

  useEffect(() => {
    if (!currentUser || currentUser.is_admin !== 1) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=stats', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setStats(data.stats));
    } else if (activeTab === 'reports') {
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=reports', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setReports(data.reports));
    } else if (activeTab === 'posts') {
      loadAllPosts('');
    } else if (activeTab === 'archive') {
      setIsLoadingExtra(true);
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=archive', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setArchive(data.archive))
        .finally(() => setIsLoadingExtra(false));
    } else if (activeTab === 'logs') {
      setIsLoadingExtra(true);
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=logs', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setLogs(data.logs))
        .finally(() => setIsLoadingExtra(false));
    } else if (activeTab === 'verification') {
      setIsVerificationsLoading(true);
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=verifications', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setVerifications(data.verifications))
        .finally(() => setIsVerificationsLoading(false));
    } else if (activeTab === 'economy') {
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=eco_stats', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setEcoStats(data.stats));
    } else if (activeTab === 'health') {
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=server_health', { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setHealthStats(data.health));
    } else if (activeTab === 'broadcasts') {
      fetchWithToken('https://api.goodfaceteam.ru/admin_api.php?action=get_alert', { credentials: 'include' })
        .then(res => res.json())
        .then(data => { if (data.success && data.alert) setAlertData(data.alert); });
    }
  }, [activeTab]);

  const loadAllPosts = async (query) => {
    setIsPostsLoading(true);
    try {
      const res = await fetchWithToken(`https://api.goodfaceteam.ru/admin_api.php?action=all_posts&search=${encodeURIComponent(query)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAllPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const handlePostSearch = (e) => {
    e.preventDefault();
    loadAllPosts(postSearch);
  };

  const handleBanUser = async () => {
    if (!banHandle) return alert("Введите тег пользователя");
    if (!window.confirm(`Заблокировать @${banHandle}?`)) return;

    const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=ban_user", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ handle: banHandle, duration: banDuration })
    });
    const data = await res.json();
    if (data.success) {
      alert("Пользователь заблокирован.");
      setBanHandle('');
    } else {
      alert(data.message);
    }
  };

  const handleAdminDeletePost = async (postId) => {
    if (!window.confirm("Скрыть и пометить пост как удаленный?")) return;
    
    const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=delete_post", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ post_id: postId })
    });
    const data = await res.json();
    if (data.success) {
      setReports(reports.filter(r => r.target_id !== postId));
      setAllPosts(allPosts.filter(p => p.id !== postId));
    }
  };

  const handleRejectReports = async (targetType, targetId) => {
    if (!window.confirm("Оправдать этот материал? (Жалобы будут очищены)")) return;
    
    const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=resolve_reports", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ target_type: targetType, target_id: targetId })
    });
    const data = await res.json();
    if (data.success) {
      setReports(reports.filter(r => r.target_id !== targetId));
    }
  };

  const exportToPDF = (post) => {
    let mediaHtml = '';
    
    if (post.graphic_data) {
      try {
        const gfx = typeof post.graphic_data === 'string' ? JSON.parse(post.graphic_data) : post.graphic_data;
        if (gfx.mode === 'media') {
          mediaHtml = gfx.payload.type === 'video' 
            ? `<p><em>[Прикреплено видео: ${gfx.payload.url}]</em></p>`
            : `<img src="${gfx.payload.url}" style="max-width: 100%; max-height: 400px; border-radius: 8px; margin-top: 10px;" />`;
        }
      } catch(e) {}
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Отчет по контенту ID: ${post.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { border-bottom: 2px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #dc2626; font-size: 24px; }
            .meta { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
            .meta p { margin: 5px 0; }
            .content { border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; }
            .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Gudex — Выписка из реестра удаленного контента</h1>
          </div>
          <div class="meta">
            <p><strong>ID Поста:</strong> ${post.id}</p>
            <p><strong>Автор:</strong> ${post.name} (@${post.handle})</p>
            <p><strong>Дата создания:</strong> ${post.created_at}</p>
            <p><strong>Статус:</strong> Удален / Скрыт модератором</p>
            <p><strong>Дата формирования выписки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          </div>
          <div class="content">
            <h3>Содержимое:</h3>
            <p style="white-space: pre-wrap;">${post.text || "<em>Текст отсутствует</em>"}</p>
            ${mediaHtml}
          </div>
          <div class="footer">
            Сгенерировано автоматически системой модерации Good Creative Hub.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const groupedReports = reports.reduce((acc, report) => {
    const key = `${report.target_type}_${report.target_id}`;
    if (!acc[key]) {
      acc[key] = { ...report, count: 0, all_reasons: [] };
    }
    acc[key].count += 1;
    acc[key].all_reasons.push(report.reason);
    return acc;
  }, {});

  if (!currentUser || currentUser.is_admin !== 1) return null;

  const handleVerifyAction = async (requestId, userId, actionType) => {
    const actionName = actionType === 'approve' ? 'одобрить заявку и выдать галочку' : 'отклонить заявку';
    if (!window.confirm(`Вы уверены, что хотите ${actionName}?`)) return;

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=verify_action", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId, user_id: userId, type: actionType })
      });
      const data = await res.json();
      
      if (data.success) {
        // Убираем заявку из списка
        setVerifications(verifications.filter(v => v.id !== requestId));
        // Уменьшаем счетчик в меню
        setStats(prev => ({ ...prev, verifications: Math.max(0, prev.verifications - 1) }));
      } else {
        alert("Ошибка: " + (data.message || "Не удалось обработать заявку"));
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    }
  };

  const TABS = [
    { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
    { id: 'reports', label: 'Жалобы', icon: Flag, count: Object.keys(groupedReports).length },
    { id: 'verification', label: 'Верификация', icon: BadgeCheck, count: stats.verifications || 0 },
    { id: 'crm', label: 'CRM (Юзеры)', icon: Users },
    { id: 'economy', label: 'Экономика', icon: Coins },
    { id: 'broadcasts', label: 'Оповещения', icon: Megaphone },
    { id: 'health', label: 'Сервер', icon: Server },
    { id: 'posts', label: 'Посты', icon: FileText },
    { id: 'moderation', label: 'Блокировки', icon: UserX },
    { id: 'law_enforcement', label: 'Спец. запросы', icon: Briefcase },
    { id: 'archive', label: 'Архив', icon: Archive },
    { id: 'logs', label: 'Логи', icon: ClipboardList }
  ];

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) return alert("Заполните заголовок и текст!");
    if (!window.confirm("Отправить это уведомление ВСЕМ пользователям платформы? Это действие нельзя отменить.")) return;

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=send_broadcast", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(broadcastData)
      });
      const data = await res.json();
      
      if (data.success) {
        setBroadcastResult({ type: 'success', text: `Рассылка завершена! Отправлено: ${data.sent_count} чел.` });
        setBroadcastData({ title: '', message: '', type: 'system_alert' }); // Очищаем форму
      } else {
        setBroadcastResult({ type: 'error', text: data.message || 'Ошибка рассылки' });
      }
    } catch (e) {
      console.error(e);
      setBroadcastResult({ type: 'error', text: 'Ошибка соединения с сервером' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSaveAlert = async (e, isActive) => {
    e.preventDefault();
    if (isActive && (!alertData.title || !alertData.message)) return alert("Заполните заголовок и текст!");
    
    setIsAlertSaving(true);
    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=set_alert", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...alertData, active: isActive })
      });
      const data = await res.json();
      if (data.success) {
        setAlertData(prev => ({ ...prev, active: isActive }));
        alert(isActive ? "Оповещение успешно включено для всех пользователей!" : "Оповещение отключено.");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    } finally {
      setIsAlertSaving(false);
    }
  };

  const handleEcoSearchSubmit = async (e) => {
    e.preventDefault();
    if (!ecoSearch.trim()) return;
    setIsEcoLoading(true);
    try {
      const res = await fetchWithToken(`https://api.goodfaceteam.ru/admin_api.php?action=eco_search&query=${encodeURIComponent(ecoSearch)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setEcoData(data.data);
      } else {
        alert(data.message || "Пользователь не найден");
        setEcoData(null);
      }
    } catch (e) { console.error(e); }
    setIsEcoLoading(false);
  };

  const handleFundUser = async (e) => {
    e.preventDefault();
    if (!fundAmount || isNaN(fundAmount)) return;
    
    const actionName = Number(fundAmount) > 0 ? 'Начислить' : 'Списать';
    if (!window.confirm(`${actionName} ${Math.abs(fundAmount)} [${fundCurrency}] пользователю @${ecoData.user.handle}?`)) return;

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=eco_fund", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_id: ecoData.user.id, amount: parseInt(fundAmount), currency: fundCurrency })
      });
      const data = await res.json();
      if (data.success) {
        alert("Транзакция успешно выполнена!");
        setFundAmount('');
        // Обновляем баланс в UI
        handleEcoSearchSubmit({ preventDefault: () => {} });
      }
    } catch (e) { console.error(e); }
  };

  const handleCrmSearchSubmit = async (e) => {
    e.preventDefault();
    if (!crmSearch.trim()) return;
    setIsCrmLoading(true);
    try {
      const res = await fetchWithToken(`https://api.goodfaceteam.ru/admin_api.php?action=crm_search&query=${encodeURIComponent(crmSearch)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCrmData(data.data);
      } else {
        alert(data.message || "Пользователь не найден");
        setCrmData(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCrmLoading(false);
    }
  };

  const handleAdminTerminateSession = async (targetId, deviceId = null) => {
    const msg = deviceId ? "Завершить этот сеанс?" : "Завершить ВСЕ сеансы этого пользователя?";
    if (!window.confirm(msg)) return;

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=crm_terminate_session", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_id: targetId, device_id: deviceId })
      });
      const data = await res.json();
      if (data.success) {
        // Обновляем список сессий в UI
        setCrmData(prev => ({
          ...prev,
          sessions: deviceId ? prev.sessions.filter(s => s.device_id !== deviceId) : []
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminClearProfile = async (targetId, type) => {
    const typeName = type === 'avatar' ? 'аватарку' : 'раздел "О себе"';
    if (!window.confirm(`Принудительно удалить ${typeName} пользователя?`)) return;

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=crm_clear_profile", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_id: targetId, type })
      });
      const data = await res.json();
      if (data.success) {
        alert("Успешно очищено");
        if (type === 'bio') setCrmData(prev => ({ ...prev, user: { ...prev.user, bio: null } }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateDossier = async (e) => {
    e.preventDefault();
    if (!extractQuery.trim()) return alert("Введите тег пользователя или ID чата");
    
    setIsExtracting(true);
    try {
      const res = await fetchWithToken(`https://api.goodfaceteam.ru/admin_api.php?action=law_enforcement_dump&type=${extractType}&query=${encodeURIComponent(extractQuery)}`, { 
        credentials: 'include' 
      });
      const data = await res.json();
      
      if (data.success) {
        generateDossierPDF(data.dossier, extractType, extractQuery);
      } else {
        alert(data.message || "Данные не найдены");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при формировании выписки");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleMaintenance = async (currentState) => {
    const newState = !currentState;
    if (newState && !window.confirm("ВНИМАНИЕ! Вы закрываете сайт для всех обычных пользователей. Продолжить?")) return;

    try {
      const res = await fetchWithToken("https://api.goodfaceteam.ru/admin_api.php?action=toggle_maintenance", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: newState })
      });
      const data = await res.json();
      if (data.success) {
        setHealthStats(prev => ({ ...prev, maintenance: newState }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateDossierPDF = (dossier, type, query) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleString('ru-RU');
    
    let contentHtml = '';

    if (type === 'user') {
      const u = dossier.user;
      contentHtml += `
        <div class="meta">
          <h3>Данные субъекта</h3>
          <p><strong>ID:</strong> ${u.id} | <strong>Имя:</strong> ${u.name} | <strong>Тег:</strong> @${u.handle}</p>
          <p><strong>Email:</strong> ${u.email || 'Не указан'}</p>
          <p><strong>Статус:</strong> ${u.is_banned ? 'Заблокирован' : 'Активен'} | <strong>Приватный профиль:</strong> ${u.is_private ? 'Да' : 'Нет'}</p>
        </div>
        
        <h3>Личные сообщения (вкл. удаленные)</h3>
        <table>
          <tr><th>Дата</th><th>От кого</th><th>Кому</th><th>Текст / Тип</th><th>Статус</th></tr>
          ${dossier.messages.map(m => `
            <tr style="${m.is_deleted ? 'background:#fee2e2;' : ''}">
              <td>${m.created_at}</td>
              <td>ID: ${m.sender_id}</td>
              <td>ID: ${m.receiver_id}</td>
              <td>${m.message || m.message_type} ${m.voice_transcription ? '<br><i>Транскрипция: ' + m.voice_transcription + '</i>' : ''}</td>
              <td>${m.is_deleted ? 'Удалено' : 'Активно'}</td>
            </tr>
          `).join('')}
        </table>

        <h3>Сохраненные сообщения (Избранное)</h3>
        <table>
          <tr><th>Дата</th><th>Ориг. Отправитель</th><th>Контент</th></tr>
          ${dossier.saved.map(s => `
            <tr>
              <td>${s.created_at}</td>
              <td>ID: ${s.original_sender_id || 'Сам себе'}</td>
              <td>${s.content || s.message_type}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else {
      const c = dossier.chat;
      contentHtml += `
        <div class="meta">
          <h3>Данные чата/комнаты</h3>
          <p><strong>ID:</strong> ${c.id} | <strong>Название:</strong> ${c.name} | <strong>Тип:</strong> ${c.type}</p>
          <p><strong>Владелец (ID):</strong> ${c.owner_id} | <strong>Приватный:</strong> ${c.is_private ? 'Да' : 'Нет'}</p>
          <p><strong>Хэш приглашения:</strong> ${c.invite_hash || 'Нет'}</p>
        </div>
        
        <h3>История сообщений</h3>
        <table>
          <tr><th>Дата</th><th>Отправитель (ID)</th><th>Текст / Тип</th><th>Статус</th></tr>
          ${dossier.messages.map(m => `
            <tr style="${m.is_deleted ? 'background:#fee2e2;' : ''}">
              <td>${m.created_at}</td>
              <td>${m.sender_id}</td>
              <td>${m.message || m.message_type}</td>
              <td>${m.is_deleted ? 'Удалено' : 'Активно'}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Выписка - Внутренний документ</title>
          <style>
            body { font-family: 'Times New Roman', serif; color: #000; line-height: 1.5; padding: 40px; font-size: 12px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
            .meta { border: 1px solid #000; padding: 15px; margin-bottom: 20px; }
            .meta h3 { margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; }
            .warning { color: #dc2626; font-weight: bold; border: 2px solid #dc2626; padding: 10px; text-align: center; margin-bottom: 20px; text-transform: uppercase;}
            .footer { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; text-align: right; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="warning">Конфиденциально. Для предоставления по запросу уполномоченных органов.</div>
          <div class="header">
            <h1>Выписка из базы данных экосистемы Gudex</h1>
            <p>Сформирована: ${dateStr}</p>
          </div>
          ${contentHtml}
          <div class="footer">
            Выписка сформирована администратором системы (ID: ${currentUser.id}).<br>
            Все действия залогированы.
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-zinc-50 dark:bg-[#09090b] overflow-hidden selection:bg-red-500/30">
      
      {/* МОБИЛЬНАЯ ШАПКА И НАВИГАЦИЯ (Только для телефонов/планшетов) */}
      <div className="lg:hidden bg-white dark:bg-[#18181b] border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-20">
        <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2 text-red-500">
            <Shield size={24} strokeWidth={2.5} />
            <h1 className="text-xl font-black tracking-tight">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <button onClick={() => { onLogout(); navigate('/'); }} className="text-red-500 p-1">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        {/* Скроллируемые табы для мобилки */}
        <div className="flex overflow-x-auto hide-scrollbar px-2 py-2 gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ЛЕВОЕ МЕНЮ (Сайдбар - Только для ПК) */}
      <aside className="hidden lg:flex w-[280px] bg-white dark:bg-[#18181b] border-r border-zinc-200 dark:border-zinc-800 flex-col z-20 shrink-0">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-red-500 mb-6">
            <Shield size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight">Admin</h1>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition">
            <ArrowLeft size={16} /> Вернуться в Gudex
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={20} />
                {tab.label}
              </div>
              {tab.count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <button 
            onClick={() => { onLogout(); navigate('/'); }}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            <LogOut size={20} /> Выйти
          </button>
        </div>
      </aside>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 h-full overflow-y-auto p-4 lg:p-12 pb-10">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* АНАЛИТИКА */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-6 lg:mb-8">Общая статистика</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Пользователи', val: stats.users, color: 'text-blue-500' },
                  { label: 'Всего постов', val: stats.posts, color: 'text-emerald-500' },
                  { label: 'Комментарии', val: stats.comments, color: 'text-orange-500' },
                  { label: 'Всего лайков', val: stats.likes, color: 'text-red-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl text-center shadow-sm">
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ЖАЛОБЫ */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-6 lg:mb-8">Жалобы ({Object.keys(groupedReports).length})</h2>
              <div className="space-y-4">
                {Object.values(groupedReports).length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500 opacity-50" />
                    <p className="font-bold text-xl text-zinc-900 dark:text-white mb-1">Всё чисто!</p>
                    <p className="text-zinc-500 text-sm">Нет активных жалоб на проверку.</p>
                  </div>
                ) : (
                  Object.values(groupedReports).map(report => (
                    <div key={`${report.target_type}_${report.target_id}`} className="bg-white dark:bg-[#18181b] border-2 border-red-100 dark:border-red-900/30 p-4 lg:p-6 rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1">
                            <AlertCircle size={12} />
                            {report.count >= 3 ? 'АВТОСКРЫТО' : 'НА ПРОВЕРКЕ'} ({report.count})
                          </span>
                          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                            {report.target_type === 'post' ? 'Пост' : 'Юзер'} ID: {report.target_id}
                          </span>
                        </div>
                        
                        <div className="bg-zinc-50 dark:bg-[#121212] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-4">
                          <span className="font-bold text-sm block mb-2 text-zinc-900 dark:text-white">Причины жалоб:</span>
                          <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 mb-4 space-y-1">
                            {[...new Set(report.all_reasons)].map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                          {report.target_content && (
                            <div className="border-l-4 border-red-500 pl-4 py-1 italic text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#18181b] p-3 rounded-r-xl break-words">
                              "{report.target_content}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full lg:w-auto flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                        <button onClick={() => handleRejectReports(report.target_type, report.target_id)} className="cursor-pointer w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-2xl font-bold text-sm transition">
                          <CheckCircle2 size={18} /> Оправдать
                        </button>
                        <button onClick={() => { if (report.target_type === 'post') handleAdminDeletePost(report.target_id); if (report.target_type === 'user') setActiveTab('moderation'); }} className="cursor-pointer w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition shadow-md">
                          <Trash2 size={18} /> Удалить
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CRM УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ */}
          {activeTab === 'crm' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <div className="mb-4 lg:mb-6 shrink-0 border-b border-indigo-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                  <Users size={28} /> User CRM
                </h2>
                <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
                  Глубокое управление профилями: очистка запрещенных аватарок/описаний и принудительное управление активными сессиями (разлогин).
                </p>
              </div>

              <form onSubmit={handleCrmSearchSubmit} className="mb-6 relative shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  value={crmSearch} 
                  onChange={(e) => setCrmSearch(e.target.value)} 
                  placeholder="ID или тег (например: friendlyfox)" 
                  className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 pl-12 pr-24 py-3.5 rounded-2xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white shadow-sm transition-colors" 
                />
                <button type="submit" disabled={isCrmLoading} className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition disabled:opacity-50">
                  {isCrmLoading ? <Loader2 size={16} className="animate-spin"/> : 'Найти'}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
                {crmData && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* БЛОК ПРОФИЛЯ */}
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{crmData.user.name}</h3>
                            {crmData.user.is_verified === 1 && <BadgeCheck size={20} className="text-blue-500" />}
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold px-2 py-1 rounded-lg">ID: {crmData.user.id}</span>
                          </div>
                          <p className="text-indigo-500 font-medium mb-3">@{crmData.user.handle}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl bg-zinc-50 dark:bg-[#121212] p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                            <span className="font-bold block mb-1">О себе:</span>
                            {crmData.user.bio || <span className="italic opacity-50">Пусто</span>}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                          <button onClick={() => handleAdminClearProfile(crmData.user.id, 'bio')} className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-5 py-2.5 rounded-xl font-bold text-sm transition">
                            <Eraser size={16} /> Очистить "О себе"
                          </button>
                          <button onClick={() => handleAdminClearProfile(crmData.user.id, 'avatar')} className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-5 py-2.5 rounded-xl font-bold text-sm transition">
                            <UserX size={16} /> Сбросить аватар
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* БЛОК СЕССИЙ */}
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <MonitorSmartphone size={24} className="text-indigo-500"/> Активные сессии ({crmData.sessions.length})
                        </h3>
                        {crmData.sessions.length > 0 && (
                          <button onClick={() => handleAdminTerminateSession(crmData.user.id, null)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md">
                            <LogOut size={16} /> Разлогинить со всех
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {crmData.sessions.length === 0 ? (
                          <p className="text-zinc-500 text-sm">Нет активных сессий.</p>
                        ) : (
                          crmData.sessions.map(session => (
                            <div key={session.device_id} className="border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl flex flex-col justify-between bg-zinc-50/50 dark:bg-[#121212]/50">
                              <div className="mb-4">
                                <p className="font-bold text-zinc-900 dark:text-white text-sm mb-1 line-clamp-2" title={session.device_name}>
                                  {session.device_name || 'Неизвестное устройство'}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono break-all">{session.device_id}</p>
                                <p className="text-[11px] text-emerald-500 font-bold mt-2">Вход: {session.login_time}</p>
                              </div>
                              <button onClick={() => handleAdminTerminateSession(crmData.user.id, session.device_id)} className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                                Завершить сеанс
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ЭКОНОМИКА (GUDEX ECONOMY) */}
          {activeTab === 'economy' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <div className="mb-4 lg:mb-6 shrink-0 border-b border-amber-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-500 flex items-center gap-3">
                  <TrendingUp size={28} /> Макроэкономика
                </h2>
                <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
                  Мониторинг общей эмиссии валют на платформе и ручное управление балансами пользователей (награды, штрафы, баунти).
                </p>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
                {/* ОБЩАЯ СТАТИСТИКА ЭМИССИИ */}
                {ecoStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-sm col-span-2 md:col-span-4">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Всего звездной пыли на руках</p>
                      <p className="text-3xl font-black text-yellow-500">{new Intl.NumberFormat('ru-RU').format(ecoStats.stars)}</p>
                    </div>
                    {Object.entries(ecoStats.planets || {}).map(([planet, count]) => (
                      count !== null && (
                        <div key={planet} className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{planet}</p>
                          <p className="text-xl font-black text-zinc-900 dark:text-white">{new Intl.NumberFormat('ru-RU').format(count)}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* ПОИСК КОШЕЛЬКА ПОЛЬЗОВАТЕЛЯ */}
                <form onSubmit={handleEcoSearchSubmit} className="mb-6 relative shrink-0 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input 
                    type="text" 
                    value={ecoSearch} 
                    onChange={(e) => setEcoSearch(e.target.value)} 
                    placeholder="ID или тег (поиск кошелька)" 
                    className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 pl-12 pr-24 py-3.5 rounded-2xl outline-none focus:border-amber-500 text-zinc-900 dark:text-white shadow-sm transition-colors" 
                  />
                  <button type="submit" disabled={isEcoLoading} className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50">
                    {isEcoLoading ? <Loader2 size={16} className="animate-spin"/> : 'Найти'}
                  </button>
                </form>

                {/* УПРАВЛЕНИЕ БАЛАНСОМ */}
                {ecoData && (
                  <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center font-black text-xl">
                        {ecoData.user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">{ecoData.user.name}</h3>
                        <p className="text-zinc-500 font-medium">@{ecoData.user.handle} <span className="ml-2 text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">ID: {ecoData.user.id}</span></p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Текущий баланс</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 px-3 py-2 rounded-xl flex items-center gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">Звезды:</span>
                          <span className="text-yellow-700 dark:text-yellow-500 font-black">{new Intl.NumberFormat('ru-RU').format(ecoData.stars)}</span>
                        </div>
                        {Object.entries(ecoData.planets || {}).filter(([_, v]) => v > 0 || _ === 'mercury').map(([k, v]) => (
                          <div key={k} className="bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl flex items-center gap-2">
                            <span className="text-zinc-500 font-bold text-sm uppercase">{k}:</span>
                            <span className="text-zinc-900 dark:text-white font-black">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleFundUser} className="bg-zinc-50 dark:bg-[#121212] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Транзакция (можно с минусом для штрафа)</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          value={fundCurrency} 
                          onChange={(e) => setFundCurrency(e.target.value)}
                          className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-xl outline-none text-zinc-900 dark:text-white cursor-pointer"
                        >
                          <option value="stars">Звездная пыль (Stars)</option>
                          <option value="mercury">Меркурий (Mercury)</option>
                          <option value="venus">Венера (Venus)</option>
                          <option value="earth">Земля (Earth)</option>
                          <option value="mars">Марс (Mars)</option>
                          <option value="jupiter">Юпитер (Jupiter)</option>
                          <option value="saturn">Сатурн (Saturn)</option>
                          <option value="uranus">Уран (Uranus)</option>
                          <option value="neptune">Нептун (Neptune)</option>
                        </select>
                        <input 
                          type="number" 
                          value={fundAmount} 
                          onChange={(e) => setFundAmount(e.target.value)} 
                          placeholder="Сумма (напр. 500 или -100)" 
                          className="flex-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-xl outline-none focus:border-amber-500 text-zinc-900 dark:text-white"
                          required
                        />
                        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap">
                          Выполнить
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ГЛОБАЛЬНЫЕ ОПОВЕЩЕНИЯ */}
          {activeTab === 'broadcasts' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <div className="mb-4 lg:mb-6 shrink-0 border-b border-purple-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-500 flex items-center gap-3">
                  <Megaphone size={28} /> Центр оповещений
                </h2>
                <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
                  Управление глобальными уведомлениями для всех пользователей платформы.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar pb-10 animate-in fade-in slide-in-from-bottom-4 space-y-6">
                
                {/* 1. Глобальная плашка на сайте (КОД ИЗ ПРОШЛОГО ШАГА ОСТАЕТСЯ ЗДЕСЬ) */}
                <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm max-w-2xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <Radio size={20} className="text-blue-500"/> Информационная плашка (Сверху сайта)
                  </h3>
                  
                  {/* Предпросмотр алерта */}
                  <div className="mb-8">
                    <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                      alertData.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' :
                      alertData.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400' :
                      'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400'
                    }`}>
                      <AlertCircle className="shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-sm">{alertData.title || 'Заголовок оповещения'}</h4>
                        <p className="text-sm mt-0.5 opacity-90">{alertData.message || 'Текст сообщения будет выглядеть так...'}</p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Тип плашки</label>
                        <select 
                          value={alertData.type} 
                          onChange={(e) => setAlertData({...alertData, type: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none text-zinc-900 dark:text-white cursor-pointer"
                        >
                          <option value="info">Информация (Синий)</option>
                          <option value="warning">Предупреждение (Оранжевый)</option>
                          <option value="error">Тех. работы / Ошибка (Красный)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Заголовок</label>
                        <input 
                          type="text" 
                          value={alertData.title} 
                          onChange={(e) => setAlertData({...alertData, title: e.target.value})} 
                          placeholder="Внимание!" 
                          className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none focus:border-purple-500 text-zinc-900 dark:text-white" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Текст сообщения</label>
                      <textarea 
                        value={alertData.message} 
                        onChange={(e) => setAlertData({...alertData, message: e.target.value})} 
                        placeholder="Краткое описание события..." 
                        rows="2"
                        className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none focus:border-purple-500 text-zinc-900 dark:text-white resize-none" 
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                      {alertData.active ? (
                        <button onClick={(e) => handleSaveAlert(e, false)} disabled={isAlertSaving} className="cursor-pointer flex-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3.5 rounded-2xl transition">
                          Отключить плашку
                        </button>
                      ) : (
                        <button onClick={(e) => handleSaveAlert(e, true)} disabled={isAlertSaving} className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-purple-500/20">
                          Включить для всех
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* 2. НОВЫЙ БЛОК: Массовая рассылка Push и Уведомлений */}
                <div className="bg-white dark:bg-[#18181b] border-2 border-purple-100 dark:border-purple-900/30 p-6 rounded-3xl shadow-sm max-w-2xl relative overflow-hidden">
                  <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-zinc-900 dark:text-white">
                    <Megaphone size={20} className="text-purple-500"/> Массовая рассылка (Broadcast)
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6">
                    Отправка уведомления в колокольчик 🔔 всем пользователям. Если у пользователя разрешены фоновые уведомления, он также получит WebPush на телефон/ПК.
                  </p>

                  {broadcastResult && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 mb-4 ${broadcastResult.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                      {broadcastResult.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                      {broadcastResult.text}
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-4 relative z-10">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Заголовок (Push)</label>
                      <input 
                        type="text" 
                        value={broadcastData.title} 
                        onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})} 
                        placeholder="Например: Вышло обновление!" 
                        className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none focus:border-purple-500 text-zinc-900 dark:text-white transition" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Текст уведомления</label>
                      <textarea 
                        value={broadcastData.message} 
                        onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})} 
                        placeholder="Мы добавили новую мини-игру в Космическом Хабе. Заходи и фарми пыль!" 
                        rows="3"
                        className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none focus:border-purple-500 text-zinc-900 dark:text-white resize-none transition" 
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isBroadcasting} 
                      className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20 active:scale-95"
                    >
                      {isBroadcasting ? <Loader2 size={20} className="animate-spin" /> : <Megaphone size={20} />}
                      Отправить рассылку
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* МОНИТОРИНГ СЕРВЕРА */}
          {activeTab === 'health' && (
            <div>
              <div className="mb-6 lg:mb-8 border-b border-emerald-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-500 flex items-center gap-3">
                  <Activity size={28} /> Состояние сервера
                </h2>
              </div>

              {healthStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Активных сессий</p>
                    <p className="text-3xl font-black text-emerald-500">{healthStats.sessions}</p>
                    <p className="text-[10px] text-zinc-400 mt-2">Авторизованных устройств в базе</p>
                  </div>
                  <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Онлайн за час</p>
                    <p className="text-3xl font-black text-blue-500">{healthStats.online}</p>
                    <p className="text-[10px] text-zinc-400 mt-2">Уникальных юзеров</p>
                  </div>
                  <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Вес базы данных</p>
                    <p className="text-3xl font-black text-purple-500">{healthStats.db_size} <span className="text-lg">МБ</span></p>
                    <p className="text-[10px] text-zinc-400 mt-2">MySQL Storage</p>
                  </div>
                  <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Версия PHP</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{healthStats.php_version}</p>
                    <p className="text-[10px] text-zinc-400 mt-2">Движок бэкенда</p>
                  </div>
                  {/* РУБИЛЬНИК ТЕХ. РАБОТ */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white dark:bg-[#18181b] border-2 border-red-100 dark:border-red-900/30 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-1">Режим технического обслуживания</h3>
                      <p className="text-sm text-zinc-500">Закрывает платформу заглушкой для всех, кроме администраторов.</p>
                    </div>
                    <button
                      onClick={() => handleToggleMaintenance(healthStats.maintenance)}
                      className={`cursor-pointer w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black transition-all shadow-md active:scale-95 ${healthStats.maintenance ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/30' : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200'}`}
                    >
                      {healthStats.maintenance ? 'ОТКЛЮЧИТЬ ТЕХ. РАБОТЫ' : 'ВКЛЮЧИТЬ ЗАГЛУШКУ'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
              )}
            </div>
          )}

          {/* ЗАЯВКИ НА ВЕРИФИКАЦИЮ */}
          {activeTab === 'verification' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <div className="mb-4 lg:mb-6 shrink-0 border-b border-blue-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-500 flex items-center gap-3">
                  <BadgeCheck size={28} /> Запросы на галочку
                </h2>
                <p className="text-zinc-500 mt-2 text-sm">
                  Рассмотрение заявок от пользователей на получение статуса официального аккаунта.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-4">
                {isVerificationsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
                ) : verifications.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <BadgeCheck size={48} className="mx-auto mb-4 text-blue-500 opacity-50" />
                    <p className="font-bold text-xl text-zinc-900 dark:text-white mb-1">Нет новых заявок</p>
                    <p className="text-zinc-500 text-sm">Все запросы на верификацию обработаны.</p>
                  </div>
                ) : (
                  verifications.map(req => (
                    <div key={req.id} className="bg-white dark:bg-[#18181b] border-2 border-blue-50 dark:border-blue-900/20 p-4 lg:p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                            Заявка №{req.id}
                          </span>
                          <span className="text-xs text-zinc-400">{req.created_at}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-xl text-zinc-500 shrink-0">
                            {req.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white truncate">{req.name}</h3>
                            <a href={`/@${req.handle}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                              @{req.handle} <ArrowLeft className="rotate-135" size={12} /> {/* Имитация иконки внешней ссылки */}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full lg:w-auto flex-col sm:flex-row gap-2 shrink-0">
                        <button 
                          onClick={() => handleVerifyAction(req.id, req.user_id, 'approve')} 
                          className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition shadow-md"
                        >
                          <CheckCircle2 size={18} /> Одобрить
                        </button>
                        <button 
                          onClick={() => handleVerifyAction(req.id, req.user_id, 'reject')} 
                          className="cursor-pointer w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-6 py-3 rounded-2xl font-bold text-sm transition"
                        >
                          <X size={18} /> Отклонить
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ВСЕ ПОСТЫ */}
          {activeTab === 'posts' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-4 lg:mb-6 shrink-0">База постов</h2>
              <form onSubmit={handlePostSearch} className="mb-4 lg:mb-6 relative shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input type="text" value={postSearch} onChange={(e) => setPostSearch(e.target.value)} placeholder="Поиск по ID, тегу или тексту..." className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 pl-12 pr-24 py-3 lg:py-4 rounded-2xl outline-none focus:border-red-500 text-zinc-900 dark:text-white shadow-sm transition-colors text-sm lg:text-base" />
                <button type="submit" className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-xs lg:text-sm font-bold hover:bg-red-600 transition">Найти</button>
              </form>
              <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-4">
                {isPostsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
                ) : allPosts.length === 0 ? (
                  <p className="text-center text-zinc-500 py-10">Ничего не найдено</p>
                ) : (
                  allPosts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 w-full">
                        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black px-2 py-1 rounded-lg shrink-0 w-fit">ID: {post.id}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate"><span className="text-blue-500 mr-2">@{post.handle}</span>{post.text || "<Медиа-контент>"}</p>
                          <p className="text-xs text-zinc-500 mt-1">{post.created_at}</p>
                        </div>
                      </div>
                      <button onClick={() => handleAdminDeletePost(post.id)} className="cursor-pointer p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* БЛОКИРОВКИ */}
          {activeTab === 'moderation' && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-6 lg:mb-8">Ручная блокировка</h2>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 rounded-3xl shadow-sm max-w-2xl mx-auto lg:mx-0">
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Тег нарушителя</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                      <input type="text" value={banHandle} onChange={(e) => setBanHandle(e.target.value)} placeholder="friendlyfox" className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 pl-9 pr-4 py-3.5 rounded-2xl outline-none focus:border-red-500 text-zinc-900 dark:text-white transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Срок блокировки</label>
                    <select value={banDuration} onChange={(e) => setBanDuration(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none text-zinc-900 dark:text-white cursor-pointer transition-colors focus:border-red-500">
                      <option value="7days">На 7 дней</option>
                      <option value="30days">На 30 дней</option>
                      <option value="permanent">Навсегда</option>
                    </select>
                  </div>
                  <button onClick={handleBanUser} className="cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/20 active:scale-95 mt-2">
                    <Ban size={20} /> Заблокировать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* СПЕЦ. ЗАПРОСЫ (ДОСЬЕ) */}
          {activeTab === 'law_enforcement' && (
            <div>
              <div className="mb-6 lg:mb-8 border-b border-red-500/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-red-600 dark:text-red-500 flex items-center gap-3">
                  <Database size={28} /> Извлечение данных (СОРМ)
                </h2>
                <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
                  Формирование полных выписок пользователей или чатов для передачи по официальным запросам правоохранительных органов. <strong className="text-red-500">Извлекаются все скрытые и удаленные сообщения. Все действия логируются.</strong>
                </p>
              </div>

              <div className="bg-white dark:bg-[#18181b] border-2 border-red-100 dark:border-red-900/30 p-6 lg:p-8 rounded-3xl shadow-sm max-w-2xl">
                <form onSubmit={handleGenerateDossier} className="flex flex-col gap-6">
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Тип объекта</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="extractType" value="user" checked={extractType === 'user'} onChange={() => setExtractType('user')} className="accent-red-500 w-4 h-4" />
                        <span className="font-bold text-zinc-900 dark:text-white">Пользователь</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="extractType" value="chat" checked={extractType === 'chat'} onChange={() => setExtractType('chat')} className="accent-red-500 w-4 h-4" />
                        <span className="font-bold text-zinc-900 dark:text-white">Группа / Чат</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                      {extractType === 'user' ? 'Тег пользователя (без @)' : 'ID чата'}
                    </label>
                    <input 
                      type="text" 
                      value={extractQuery} 
                      onChange={(e) => setExtractQuery(e.target.value)} 
                      placeholder={extractType === 'user' ? 'friendlyfox' : '12345'} 
                      className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 px-4 py-3.5 rounded-2xl outline-none focus:border-red-500 text-zinc-900 dark:text-white transition-colors" 
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isExtracting}
                    className="cursor-pointer w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/20 active:scale-95 mt-2"
                  >
                    {isExtracting ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
                    Сформировать PDF-выписку
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* АРХИВ (УДАЛЕННОЕ) */}
          {activeTab === 'archive' && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-6 lg:mb-8">Архив и доказательства</h2>
              {isLoadingExtra ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
              ) : (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Удаленный контент (Посты)</h3>
                    {archive.posts.length === 0 ? <p className="text-sm text-zinc-500">Архив постов пуст.</p> : (
                      <div className="space-y-3">
                        {archive.posts.map(post => (
                          <div key={post.id} className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-4 lg:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="min-w-0 w-full">
                              <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">ID: {post.id} • @{post.handle}</p>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{post.text || "Специфичный контент (Медиа/Опрос)"}</p>
                              <p className="text-[11px] text-red-500 mt-1">Удален: {post.created_at}</p>
                            </div>
                            <button onClick={() => exportToPDF(post)} className="cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-4 py-2.5 rounded-xl text-sm font-bold transition shrink-0">
                              <Download size={16} /> PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Заблокированные пользователи</h3>
                    {archive.users.length === 0 ? <p className="text-sm text-zinc-500">Нет заблокированных пользователей.</p> : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {archive.users.map(u => (
                          <div key={u.id} className="bg-white dark:bg-[#18181b] border border-red-200 dark:border-red-900/30 p-4 rounded-2xl">
                            <p className="font-bold text-zinc-900 dark:text-white truncate">{u.name} <span className="text-zinc-500 font-normal">@{u.handle}</span></p>
                            <p className="text-xs text-zinc-500 mt-1 truncate">{u.email}</p>
                            <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 inline-block px-2 py-1 rounded">Бан до: {u.ban_until || 'Навсегда'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ЛОГИ */}
          {activeTab === 'logs' && (
            <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
              <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white mb-4 lg:mb-6 shrink-0">Журнал действий</h2>
              {isLoadingExtra ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
              ) : logs.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">Логи пусты.</p>
              ) : (
                <div className="flex-1 overflow-x-auto overflow-y-auto hide-scrollbar bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-2 shadow-sm">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-[#121212] sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl whitespace-nowrap">Дата и время</th>
                        <th className="px-4 py-3">Администратор</th>
                        <th className="px-4 py-3">Действие</th>
                        <th className="px-4 py-3">ID объекта</th>
                        <th className="px-4 py-3 rounded-tr-xl">Детали</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {logs.map(log => (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                          <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{log.created_at}</td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                            {log.admin_name} <span className="text-zinc-400 font-normal">@{log.admin_handle}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                              log.action_type === 'delete_post' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                              log.action_type === 'ban_user' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {log.action_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">{log.target_type}:{log.target_id}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 max-w-[200px] lg:max-w-xs truncate" title={log.details}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}