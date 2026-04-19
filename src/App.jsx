import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useParams, Link, useOutletContext,
  useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Home, Search, Bell, User, LogOut, Settings, 
  Moon, Sun, Image as ImageIcon, Smile, Palette, BarChart2,
  Heart, MessageCircle, Edit2, X, Shield, Lock, BellRing, Monitor, Camera, Loader2, CheckCircle2, UserX, Share2, ArrowLeft, Trash2,
  MoreVertical, Ban, Eraser, Check, Reply, Forward, Bookmark, AlertTriangle, Calendar, RefreshCw, BadgeCheck, Plus, Users, Megaphone, Globe, Hash, Send, Mic, Square, Paperclip, CheckCheck,
  ChevronLeft, ChevronRight, FileText, Cookie, Type, Info, Gift, Pin, Phone, GripVertical, Archive, Circle, Sticker, Film, ChevronDown, Play, Pause, PhoneOff, Cake, EyeOff, Coins, Eye, Keyboard, BellOff, CalendarClock, Clock, Ghost,
  Flame, Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Auth from './components/Auth';
import Cookies from 'js-cookie';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import NotificationSystem from './components/NotificationSystem';
import { UserName } from './components/UserName';
import { ReportModal } from './components/ReportModal';
import AdminPage from './components/AdminPage';
import { EmojiText } from './components/EmojiText';
import CallScreen from './components/CallScreen';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import CosmicGame from './components/CosmicGame';
import CosmicHub from './components/CosmicHub';

// --- Моковые данные ---
const MOCK_USER = { name: 'FriendlyFox', handle: '@friendlyfox', avatar: '🦊' };
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Александр лайкнул ваш пост', time: '5 мин назад', read: false },
  { id: 2, text: 'Good Face Team подписался на вас', time: '1 час назад', read: true },
];

function CommentNode({ comment, replies, postAuthorHandle, onReply, currentUser, onDelete }) {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const isAuthor = comment.author_handle === postAuthorHandle;

  const canDelete = currentUser?.handle === comment.author_handle || currentUser?.handle === postAuthorHandle;
  
  // Логика сворачивания: если ответов > 5, показываем только первые 2 и кнопку "Показать еще"
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);
  const hiddenCount = replies.length - visibleReplies.length;

  // Вспомогательная функция, которая защищает от ошибки, если дата пришла строкой
  const parseAvatar = (data) => typeof data === 'string' ? JSON.parse(data) : data;

  return (
    <div className="flex gap-3 mb-4 group animate-in fade-in">
      {/* Аватар главного комментария */}
      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white shrink-0 mt-1 overflow-hidden">
        {comment.author_avatar_data || comment.author_avatar?.data ? (
          <GraphicRenderer 
            target="avatar_small" 
            mode={comment.author_avatar_mode || comment.author_avatar?.mode} 
            data={parseAvatar(comment.author_avatar_data || comment.author_avatar?.data)} 
          />
        ) : (
          comment.author_name[0]
        )}
      </div>

      <div className="flex-1">
        <div className="bg-zinc-100 dark:bg-[#121212] rounded-2xl rounded-tl-none px-4 py-3 relative border border-transparent dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">{comment.author_name}</span>
            {isAuthor && (
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">Автор</span>
            )}
            <span className="text-xs text-zinc-400 ml-auto">
              {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            {canDelete && (
                <button onClick={() => onDelete(comment.id)} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              )}
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">{comment.text}</p>
        </div>
        
        <button onClick={() => onReply(comment.id, comment.author_name)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-1.5 ml-2 transition">
          Ответить
        </button>

        {/* Ветка ответов на этот комментарий */}
        {replies.length > 0 && (
          <div className="mt-3 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
            {visibleReplies.map(reply => {
              const canDeleteReply = currentUser?.handle === reply.author_handle || currentUser?.handle === postAuthorHandle;
              
              return (
              <div key={reply.id} className="group/reply flex gap-3 mb-3">
                {/* Аватар ответа */}
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-900 dark:text-white shrink-0 mt-1 overflow-hidden">
                  {reply.author_avatar_data || reply.author_avatar?.data ? (
                    <GraphicRenderer 
                      target="avatar_small" 
                      mode={reply.author_avatar_mode || reply.author_avatar?.mode} 
                      data={parseAvatar(reply.author_avatar_data || reply.author_avatar?.data)} 
                    />
                  ) : (
                    reply.author_name[0]
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{reply.author_name}</span>
                    {reply.author_handle === postAuthorHandle && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[8px] font-bold uppercase tracking-wider">Автор</span>
                    )}
                    {canDeleteReply && (
                      <button onClick={() => onDelete(reply.id)} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/reply:opacity-100 transition-all ml-auto">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-300 mt-0.5">{reply.text}</p>
                </div>
              </div>
            )})}
            
            {!showAllReplies && hiddenCount > 0 && (
              <button onClick={() => setShowAllReplies(true)} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-2">
                Показать еще {hiddenCount} ответов
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PostItem({ post, onLike, currentUser, onEdit, onDelete, onPin, onReport }) { 
  // Инициализируем стейт данными с сервера
  const [votedId, setVotedId] = useState(post.voted_option_id !== undefined ? post.voted_option_id : null);
  const [pollData, setPollData] = useState(post.graphic_data);
  const [confirmLink, setConfirmLink] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [isSaving, setIsSaving] = useState(false);

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [repostsCount, setRepostsCount] = useState(post.reposts || 0);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id: 1, name: "Andrew" }
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMyPost = currentUser?.handle === post.handle;

  // Автоматический подсчет просмотров при появлении поста
  useEffect(() => {
    const viewed = sessionStorage.getItem(`viewed_${post.id}`);
    if (!viewed) {
      sessionStorage.setItem(`viewed_${post.id}`, 'true'); // Запоминаем, чтобы не крутить при каждом скролле
      fetch("https://api.goodfaceteam.ru/view_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ post_id: post.id })
      });
    }
  }, [post.id]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Удалить комментарий?")) return;
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/delete_comment.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ comment_id: commentId })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
        setCommentsCount(prev => prev - 1);
      }
    } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/post/${post.id}`;
    
    try {
      // Логика копирования
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // НОВОЕ: Отправляем запрос на сервер для учета репоста
      if (currentUser) {
        const res = await fetch("https://api.goodfaceteam.ru/repost.php", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          credentials: 'include',
          body: JSON.stringify({ post_id: post.id })
        });
        const data = await res.json();
        
        // Если сервер ответил incremented: true (человек поделился впервые) — плюсуем счетчик в интерфейсе
        if (data.incremented) {
          setRepostsCount(prev => prev + 1);
        }
      }
      
    } catch (err) {
      console.error('Не удалось скопировать ссылку: ', err);
      alert('Не удалось скопировать ссылку. Ваш браузер блокирует буфер обмена.');
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) return;
    // Оптимистичное обновление UI
    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikesCount(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch("https://api.goodfaceteam.ru/toggle_like.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ post_id: post.id })
      });
      const data = await res.json();
      if (!data.success) throw new Error();
    } catch (error) {
      // Откат при ошибке
      setIsLiked(originalIsLiked);
      setLikesCount(prev => originalIsLiked ? prev + 1 : prev - 1);
    }
  };

  // --- КОММЕНТАРИИ ---
  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`https://api.goodfaceteam.ru/get_comments.php?post_id=${post.id}`, { credentials: 'include', headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }, });
      const data = await res.json();
      if (data.success) setComments(data.comments);
    } catch (e) { console.error(e); }
    setIsLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments(); // Грузим комменты только при открытии
    setShowComments(!showComments);
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !currentUser) return;
    const textToSend = commentInput;
    setCommentInput(""); // Сразу чистим
    setCommentsCount(prev => prev + 1); // Увеличиваем счетчик
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/add_comment.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          post_id: post.id, 
          text: textToSend,
          parent_id: replyingTo ? replyingTo.id : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplyingTo(null);
        loadComments(); // Перезагружаем список, чтобы увидеть свой коммент
      }
    } catch (e) { console.error(e); }
  };

  // Подготовка дерева комментариев (Разделяем на главные и ответы)
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  const handleVote = async (optionId) => {
    if (votedId !== null || !currentUser) return; // Если уже голосовал - выходим

    // 1. Оптимистичное обновление UI (чтобы было моментально без задержек)
    setVotedId(optionId);
    if (pollData && pollData.type === 'poll') {
      const newData = { ...pollData };
      newData.options = newData.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      setPollData(newData);
    }

    // 2. Отправляем на сервер
    try {
      await fetch("https://api.goodfaceteam.ru/vote_poll.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: post.id,
          option_id: optionId
        })
      });
    } catch (error) {
      console.error("Ошибка при голосовании", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setIsSaving(true);
    await onEdit(post.id, editText);
    setIsSaving(false);
    setIsEditing(false);
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Ищем: ссылки (http/https), хэштеги (#слово) и упоминания (@ник)
    const regex = /(https?:\/\/[^\s]+|#[a-zA-Z0-9_а-яА-ЯёЁ]+|@[a-zA-Z0-9_]+)/g;
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      // 1. Если это ссылка
      if (part.match(/^https?:\/\/[^\s]+$/)) {
        return (
          <span 
            key={i} 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmLink(part); }} 
            className="text-blue-500 hover:underline cursor-pointer break-all"
          >
            {part}
          </span>
        );
      }
      // 2. Если это хэштег
      if (part.match(/^#[a-zA-Z0-9_а-яА-ЯёЁ]+$/)) {
        return (
          <Link 
            key={i} 
            to={`/search?q=${encodeURIComponent(part)}`} 
            onClick={(e) => e.stopPropagation()} 
            className="text-blue-500 hover:underline"
          >
            {part}
          </Link>
        );
      }
      // 3. Если это упоминание
      if (part.match(/^@[a-zA-Z0-9_]+$/)) {
        return (
          <Link 
            key={i} 
            to={`/${part}`} // или to={`/@${part.substring(1)}`} в зависимости от роутинга
            onClick={(e) => e.stopPropagation()} 
            className="text-blue-500 hover:underline"
          >
            {part}
          </Link>
        );
      }
      
      // Обычный текст (Если у тебя есть компонент EmojiText, можешь обернуть part в него: <EmojiText text={part} />)
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-4 sm:p-5 mb-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
      
      {/* Шапка поста */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {/* 1. АВАТАРКА (Отдельная ссылка, строго круг 44px) */}
          <Link 
            to={`/@${post.handle}`} 
            className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold text-lg mr-3 shrink-0 overflow-hidden hover:opacity-80 transition-opacity border border-zinc-200/50 dark:border-zinc-700/50"
          >
            {post.author_avatar?.data ? (
              <GraphicRenderer 
                mode={post.author_avatar.mode} 
                data={post.author_avatar.data} 
                target="avatar_small"
              />
            ) : (
              post.author ? post.author[0] : 'U'
            )}
          </Link>

          {/* 2. ИМЯ, ТЕГ И ДАТА (Отдельный блок справа) */}
          <div className="min-w-0"> {/* min-w-0 нужен, чтобы длинный текст не ломал верстку */}
            <div className="flex flex-col justify-center">
              
              {/* Ссылка только для имени и тега (без жестких размеров) */}
              <Link to={`/@${post.handle}`} className="group flex items-baseline gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                <UserName 
                  user={{ name: post.author, is_verified: post.is_verified }} 
                  className_name="text-[15px] sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors truncate" 
                />
                <span className="text-[13px] sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  @{post.handle}
                </span>
              </Link>
              
              {/* Дата и статус закрепа */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  {post.time}
                </span>
                {post.is_pinned && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                    <div className="flex items-center gap-1 text-blue-500">
                      <Pin size={12} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Закреп</span>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
        
        {/* Кнопка редактирования */}
        {!isEditing && (
          <div className="relative z-20">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full active:scale-95"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                {/* Невидимый оверлей, чтобы меню закрывалось по клику в любое место экрана */}
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {isMyPost ? (
                    <>
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }} 
                        className="w-full px-4 py-3 flex items-center gap-3 text-[14px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <Edit2 size={16} /> Редактировать
                      </button>
                      <button 
                        onClick={() => { onPin(post.id); setShowMenu(false); }} 
                        className="w-full px-4 py-3 flex items-center gap-3 text-[14px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                      >
                        <Pin size={16} className={post.is_pinned ? "text-blue-500" : ""} /> 
                        <span>{post.is_pinned ? "Открепить" : "Закрепить"}</span>
                      </button>
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                      <button 
                        onClick={() => { onDelete(post.id); setShowMenu(false); }} 
                        className="w-full px-4 py-3 flex items-center gap-3 text-[14px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} /> Удалить
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { 
                        if (typeof onReport === 'function') onReport(); 
                        setShowMenu(false); 
                      }} 
                      className="w-full px-4 py-3 flex items-center gap-3 text-[14px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <AlertTriangle size={16} /> Пожаловаться
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Текст или Поле редактирования */}
      {isEditing ? (
        <div className="mb-5 animate-in fade-in duration-200">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-900 dark:text-zinc-100 resize-none mb-3 text-[15px]"
            rows="3"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => { setIsEditing(false); setEditText(post.text); }} 
              disabled={isSaving}
              className="cursor-pointer px-4 py-2 text-[14px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={isSaving || !editText.trim()}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        post.text && (
          <p className="text-zinc-800 dark:text-zinc-200 mb-5 whitespace-pre-wrap leading-relaxed text-[15px] sm:text-[16px] break-words">
            {renderFormattedText(post.text)}
          </p>
        )
      )}

      {/* Вывод графики (Рисунок) */}
      {pollData && pollData.mode && (
        <div className={`mb-5 rounded-[20px] overflow-hidden border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121212] flex justify-center ${pollData.mode === 'media' ? 'py-0' : 'py-8 pointer-events-none'}`}>
          <GraphicRenderer mode={pollData.mode} data={pollData.payload} target="post" />
        </div>
      )}

      {/* Опрос */}
      {pollData && pollData.type === 'poll' && (
        <div className="mb-5 p-4 sm:p-5 rounded-[24px] border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#121212] space-y-2.5">
          {pollData.options.map((opt) => {
            const isVoted = votedId === opt.id;
            const totalVotes = pollData.options.reduce((sum, o) => sum + o.votes, 0);
            const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={votedId !== null}
                className={`cursor-pointer relative w-full text-left px-4 py-3.5 rounded-xl sm:rounded-2xl border transition-all overflow-hidden block ${isVoted ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-[#18181b] hover:bg-zinc-50 dark:hover:bg-[#202024]'}`}
              >
                {votedId !== null && (
                  <div className="absolute left-0 top-0 bottom-0 bg-blue-100/60 dark:bg-blue-900/40 transition-all duration-700 ease-out" style={{ width: `${percent}%` }}></div>
                )}
                <div className="relative z-10 flex justify-between items-center gap-4">
                  <span className={`font-semibold text-[14px] sm:text-[15px] ${isVoted ? 'text-blue-900 dark:text-blue-100' : 'text-zinc-800 dark:text-zinc-200'}`}>{opt.text}</span>
                  {votedId !== null && <span className="text-[14px] font-bold text-blue-600 dark:text-blue-400 shrink-0">{percent}%</span>}
                </div>
              </button>
            );
          })}
          <div className="text-[13px] font-medium text-zinc-400 pt-2 flex justify-between px-1">
            <span>{votedId !== null ? 'Ваш голос учтён' : 'Выберите вариант'}</span>
            <span>{pollData.options.reduce((sum, o) => sum + o.votes, 0)} голосов</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-2">
        {/* Лайки и Комменты */}
        <div className="flex items-center gap-4">
          <button onClick={handleToggleLike} className={`cursor-pointer flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-xl transition-all active:scale-90 ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'}`}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} className={isLiked ? "animate-in zoom-in" : ""} />
            <span className="font-bold text-[14px] pr-1">{likesCount > 0 ? likesCount : ''}</span>
          </button>
          
          <button onClick={toggleComments} className={`cursor-pointer flex items-center gap-1.5 p-1.5 rounded-xl transition-all active:scale-95 ${showComments ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}>
            <MessageCircle size={20} strokeWidth={2} />
            <span className="font-bold text-[14px] pr-1">{commentsCount > 0 ? commentsCount : ''}</span>
          </button>
        </div>

        {/* Просмотры и Поделиться (Репосты) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1.5 text-zinc-400" title="Просмотры">
            <BarChart2 size={18} strokeWidth={2} />
            <span className="font-bold text-[13px]">{post.views || 0}</span>
          </div>
          
          <button onClick={handleShare} className={`cursor-pointer flex items-center gap-1.5 p-1.5 -mr-1.5 rounded-xl transition-all active:scale-90 ${copied ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-zinc-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}>
            {copied ? <CheckCircle2 size={18} strokeWidth={2} className="animate-in zoom-in" /> : <Share2 size={18} strokeWidth={2} />}
            {repostsCount > 0 && <span className="font-bold text-[14px] pr-1">{repostsCount}</span>}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 animate-in slide-in-from-top-2">
          
          {/* Поле ввода комментария */}
          <div className="mb-6 flex flex-col bg-zinc-50 dark:bg-[#121212] rounded-3xl border border-zinc-200 dark:border-zinc-800 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all overflow-hidden">
            {replyingTo && (
              <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[12px] text-zinc-500 font-medium bg-zinc-100/50 dark:bg-zinc-800/30">
                <span>В ответ <span className="text-blue-500 font-bold">{replyingTo.name}</span></span>
                <button onClick={() => setReplyingTo(null)} className="hover:text-red-500 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><X size={14}/></button>
              </div>
            )}
            <div className="flex gap-2 items-end p-1.5 pl-4">
              <textarea 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 bg-transparent resize-none outline-none text-[15px] py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 max-h-32 self-center"
                rows="1"
              />
              <button 
                onClick={handleSendComment}
                disabled={!commentInput.trim()}
                className="cursor-pointer bg-blue-600 text-white px-5 py-2.5 rounded-full text-[14px] font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-95 m-0.5"
              >
                Отправить
              </button>
            </div>
          </div>

          {/* Список комментариев */}
          {isLoadingComments ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
          ) : topLevelComments.length > 0 ? (
            <div className="space-y-4 sm:space-y-5">
              {topLevelComments.map(comment => (
                <CommentNode 
                  key={comment.id} 
                  comment={comment} 
                  replies={getReplies(comment.id)} 
                  postAuthorHandle={post.handle}
                  onReply={(id, name) => setReplyingTo({ id, name })}
                  currentUser={currentUser}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-[14px] text-zinc-500 font-medium">Пока нет комментариев. Будьте первым!</p>
            </div>
          )}

        </div>
      )}
      {/* МОДАЛЬНОЕ ОКНО ПЕРЕХОДА ПО ССЫЛКЕ */}
      <AnimatePresence>
        {confirmLink && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 cursor-default" onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800" 
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-[18px] font-bold text-center text-black dark:text-white mb-2">Переход по ссылке</h3>
              <p className="text-[14px] text-center text-[#8e8e93] mb-6 break-words">
                Вы покидаете Gudex и переходите на внешний ресурс:<br/><br/>
                <span className="text-[#007aff] font-medium">{confirmLink}</span>
              </p>
              <div className="flex flex-col gap-2">
                <a 
                  href={confirmLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }} 
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007aff] hover:bg-blue-600 transition-colors flex items-center justify-center text-center"
                >
                  Перейти
                </a>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }} 
                  className="w-full py-3.5 rounded-xl font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- СТРАНИЦЫ (Pages) ---

function FeedPage({ currentUser }) {
  const { openReportModal } = useOutletContext() || {};
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postGraphic, setPostGraphic] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const observer = React.useRef();
  const isDark = document.documentElement.classList.contains('dark');

  // Загрузка общей ленты
  const loadFeed = React.useCallback(async (pageNum, isReset = false) => {
    setIsLoading(true);
    const limit = 10;
    const offset = (pageNum - 1) * limit;
    
    try {
      const res = await fetch(`https://api.goodfaceteam.ru/get_feed.php?limit=${limit}&offset=${offset}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }, });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => isReset ? data.posts : [...prev, ...data.posts]);
        setHasMore(data.posts.length === limit);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentUser?.id]);

  useEffect(() => { loadFeed(1, true); }, [loadFeed]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setPostGraphic(null); // Сбрасываем рисовалку, если выбрали фото
      setPollOptions([]);   // Сбрасываем опрос
    }
  };

  // Бесконечный скролл
  const lastPostRef = React.useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const next = prev + 1;
          loadFeed(next);
          return next;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadFeed]);

  // Логика публикации (копируем из ProfilePage)
  const handlePublish = async () => {
    const validPoll = pollOptions.filter(o => o.trim() !== '');
    if (!postText.trim() && !postGraphic && !mediaFile && validPoll.length < 2) return;
    
    setIsPublishing(true);
    
    let graphicData = postGraphic; // Если это рисунок или ASCII
    
    // ЕСЛИ ЕСТЬ МЕДИАФАЙЛ -> грузим его первым
    if (mediaFile) {
      const formData = new FormData();
      formData.append('media', mediaFile);
      
      try {
        const uploadRes = await fetch("https://api.goodfaceteam.ru/upload_media.php", {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
          graphicData = {
            mode: 'media', 
            payload: { 
              type: mediaFile.type.startsWith('video/') ? 'video' : 'image', 
              url: uploadData.url 
            }
          };
        } else {
          alert("Ошибка загрузки файла: " + uploadData.message);
          setIsPublishing(false);
          return; // Тормозим публикацию
        }
      } catch (e) {
        alert("Ошибка соединения при загрузке медиа");
        setIsPublishing(false);
        return;
      }
    } 
    // ЕСЛИ ОПРОС
    else if (validPoll.length >= 2) {
      graphicData = { mode: 'poll', type: 'poll', options: validPoll.map((t, i) => ({ id: i, text: t, votes: 0 })) };
    }

    // СТАНДАРТНАЯ ПУБЛИКАЦИЯ
    try {
      const res = await fetch("https://api.goodfaceteam.ru/create_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ text: postText, graphic_data: graphicData }) // user_id убрали
      });
      const result = await res.json();
      if (result.success) {
        setPostText(""); setPostGraphic(null); setPollOptions([]); setShowEmojiPicker(false);
        setMediaFile(null); setMediaPreview(null); // Чистим медиа
        setPage(1); loadFeed(1, true);
      }
    } catch (e) { alert("Ошибка сервера"); }
    finally { setIsPublishing(false); }
  };

  const togglePoll = () => pollOptions.length > 0 ? setPollOptions([]) : setPollOptions(['', '']);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.")) return;
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/delete_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include', // <-- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
        body: JSON.stringify({ post_id: postId }) // <-- user_id УБРАЛИ
      });
      const data = await res.json();
      if (data.success) {
        // Убираем пост из ленты моментально
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Главная</h2>
      
      {/* Блок создания поста */}
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl flex flex-col focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors shadow-sm mb-8">
        <textarea 
          value={postText}
          onChange={(e) => {
            setPostText(e.target.value);
            // Автоматическое растягивание по высоте
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className="w-full bg-transparent resize-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-h-[80px] max-h-[300px] overflow-y-auto" 
          placeholder="Что нового, творец?"
          rows="1"
        />

        {postGraphic && (
          <div className="mt-4 relative bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex justify-center py-4">
            <GraphicRenderer mode={postGraphic.mode} data={postGraphic.payload} target="post" />
            <button onClick={() => setPostGraphic(null)} className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full"><X size={16} /></button>
          </div>
        )}

        {mediaPreview && (
          <div className="mt-4 relative bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex justify-center py-4">
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} controls className="max-h-[300px] rounded-lg" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="max-h-[300px] rounded-lg object-contain" />
            )}
            <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full">
              <X size={16} />
            </button>
          </div>
        )}

        {pollOptions.length > 0 && (
          <div className="mt-4 p-4 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
            {pollOptions.map((opt, i) => (
              <input key={i} value={opt} onChange={(e) => {
                const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n);
              }} placeholder={`Вариант ${i+1}`} className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl text-sm outline-none focus:border-blue-500" />
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 relative">
          <div className="flex gap-1 text-zinc-400 dark:text-zinc-500">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*,video/mp4,video/webm" 
              className="hidden" 
            />
            <button onClick={() => fileInputRef.current.click()} className="cursor-pointer p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
              <ImageIcon size={20}/>
            </button>
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition p-2 rounded-full ${showEmojiPicker ? 'cursor-pointer bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><Smile size={20}/></button>
              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-50 shadow-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b]">
                  <EmojiPicker emojiStyle="apple" onEmojiClick={(e) => { setPostText(prev => prev + e.emoji); setShowEmojiPicker(false); }} theme={isDark ? 'dark' : 'light'} previewConfig={{ showPreview: false }} width={300} height={400} />
                </div>
              )}
            </div>
            <button onClick={() => { setEditTarget('post_graphic'); setPollOptions([]); }} disabled={pollOptions.length > 0} className="cursor-pointer hover:text-zinc-900 dark:hover:text-white transition p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"><Palette size={20}/></button>
            <button onClick={togglePoll} disabled={postGraphic !== null} className={`cursor-pointer transition p-2 rounded-full disabled:opacity-30 ${pollOptions.length > 0 ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><BarChart2 size={20}/></button>
          </div>

          <button onClick={handlePublish} disabled={(!postText.trim() && !postGraphic && !mediaFile && pollOptions.filter(o => o.trim() !== '').length < 2) || isPublishing} className="cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2">
            {isPublishing && <Loader2 size={16} className="animate-spin" />}
            Опубликовать
          </button>
        </div>
      </div>

      {/* Список постов */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
            <PostItem post={post} currentUser={currentUser} onDelete={handleDeletePost} onReport={() => openReportModal('post', post.id)} onEdit={async (id, text) => {
              await fetch("https://api.goodfaceteam.ru/update_post.php", {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                credentials: 'include',
                body: JSON.stringify({ post_id: id, text }) // user_id убрали
              });
              setPosts(posts.map(p => p.id === id ? { ...p, text } : p));
            }} />
          </div>
        ))}
        {isLoading && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-zinc-400" /></div>}
      </div>

      {/* Модалка рисования для главной */}
      {editTarget && (
        <DrawingModal 
          target="post" 
          onClose={() => setEditTarget(null)} 
          user={{ ...currentUser, isPostGraphic: true, onSaveData: (d) => setPostGraphic(d) }} 
        />
      )}
    </div>
  );
}

function SearchPage({ currentUser }) {
  const { openReportModal } = useOutletContext() || {};
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Автоматический поиск при вводе текста (с задержкой)
  useEffect(() => {
    // Не ищем, если введено меньше 2 букв
    if (query.trim().length < 2) {
      setResults({ users: [], posts: [] });
      setHasSearched(false);
      return;
    }

    // Запускаем таймер на 500мс
    const timer = setTimeout(() => {
      performSearch(query);
    }, 500);

    // Если юзер ввел новую букву до истечения 500мс, старый таймер удаляется
    return () => clearTimeout(timer);
  }, [query, currentUser?.id]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`https://api.goodfaceteam.ru/search.php?q=${encodeURIComponent(searchQuery)}`, { credentials: 'include', headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }, });
      const data = await res.json();
      if (data.success) {
        setResults({ users: data.users, posts: data.posts });
      }
    } catch (e) {
      console.error("Ошибка поиска", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.")) return;
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/delete_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include', // <-- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
        body: JSON.stringify({ post_id: postId }) // <-- user_id УБРАЛИ
      });
      const data = await res.json();
      if (data.success) {
        // Убираем пост из ленты моментально
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Поиск</h2>
      
      {/* Строка поиска */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти пользователей, посты, теги..." 
          className="w-full bg-zinc-100 dark:bg-[#18181b] border border-transparent dark:border-zinc-800 px-12 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" size={20} />
        )}
      </div>

      {/* РЕЗУЛЬТАТЫ */}
      {!hasSearched ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-600 flex flex-col items-center">
          <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
          <p>Начните вводить текст для поиска</p>
        </div>
      ) : results.users.length === 0 && results.posts.length === 0 && !isLoading ? (
        <div className="text-center py-12 text-zinc-500">
          <p>По запросу «{query}» ничего не найдено 😔</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Блок пользователей */}
          {results.users.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 px-2">Люди</h3>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                {results.users.map((u, i) => (
                  <Link 
                    key={u.id} 
                    to={`/@${u.handle}`} 
                    className={`flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition ${i !== results.users.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}`}
                  >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white font-bold text-lg overflow-hidden shrink-0">
                      {u.avatar_data ? (
                        <GraphicRenderer target="avatar_small" mode={u.avatar_mode} data={u.avatar_data} />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <UserName user={u} className_name="text-base" />
                      <span className="text-sm text-zinc-500">@{u.handle}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Блок постов */}
          {results.posts.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 px-2">Посты</h3>
              <div className="space-y-4">
                {results.posts.map(post => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser} 
                    onLike={() => {}} 
                    onEdit={() => {}} 
                    onDelete={handleDeletePost}
                    onReport={() => openReportModal('post', post.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoading(true);
    fetch(`https://api.goodfaceteam.ru/get_all_notifications.php`, { credentials: 'include', headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }, })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      })
      .catch(err => console.error("Ошибка загрузки уведомлений", err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  // --- ДОБАВЛЕНА ФУНКЦИЯ ОБРАБОТКИ ЗАЯВОК ---
  const handleRequest = async (e, notifId, senderId, action) => {
    e.preventDefault(); // Блокируем переход по ссылке <Link> при клике на кнопку
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/handle_follow_request.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ action: action, follower_id: senderId, notif_id: notifId })
      });
      const data = await res.json();
      
      if (data.success) {
        if (action === 'reject') {
          // Выкидываем уведомление из списка
          setNotifications(prev => prev.filter(n => n.id !== notifId));
        } else {
          // Меняем тип на обычный 'follow', чтобы кнопки пропали
          setNotifications(prev => prev.map(n => 
            n.id === notifId 
              ? { ...n, type: 'follow', text: n.text.replace('хочет подписаться на вас', 'теперь ваш подписчик') } 
              : n
          ));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Уведомления</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-600 flex flex-col items-center">
          <Bell size={48} strokeWidth={1} className="mb-4 opacity-50" />
          <p className="font-medium">У вас пока нет уведомлений</p>
          <p className="text-sm mt-1">Здесь появятся лайки и новые подписчики</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <Link 
              key={notif.id} 
              to={`/@${notif.handle}`}
              className={`p-4 rounded-2xl flex items-start gap-4 transition block ${notif.read ? 'bg-transparent hover:bg-zinc-50 dark:hover:bg-[#18181b]' : 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30'}`}
            >
              {/* --- ДОБАВЛЕНА ИКОНКА ЗАМОЧКА ДЛЯ ЗАЯВОК --- */}
              <div className={`p-2 rounded-full shrink-0 mt-0.5 ${notif.type === 'like' ? 'bg-red-100 text-red-500 dark:bg-red-500/20' : notif.type === 'follow_request' ? 'bg-orange-100 text-orange-500 dark:bg-orange-500/20' : 'bg-blue-100 text-blue-500 dark:bg-blue-500/20'}`}>
                {notif.type === 'like' ? <Heart size={18} fill="currentColor" /> : notif.type === 'follow_request' ? <Lock size={18} /> : <User size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-zinc-900 dark:text-zinc-100 font-medium text-[15px]">{notif.text}</p>
                <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                
                {/* --- ДОБАВЛЕНЫ КНОПКИ ПРИНЯТЬ/ОТКЛОНИТЬ --- */}
                {notif.type === 'follow_request' && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={(e) => handleRequest(e, notif.id, notif.sender_id, 'accept')}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Принять
                    </button>
                    <button 
                      onClick={(e) => handleRequest(e, notif.id, notif.sender_id, 'reject')}
                      className="cursor-pointer bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                )}

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// --- МОДАЛКА РИСОВАНИЯ (Avatar/Banner) ---
function DrawingModal({ target, onClose, user }) {
  const [mode, setMode] = useState('painter'); // 'painter', 'pixelart', 'emoji'
  const [color, setColor] = useState('#3b82f6');
  const [emoji, setEmoji] = useState('🦊');
  const [loading, setLoading] = useState(false);
  const [asciiText, setAsciiText] = useState('');
  
  // Состояния для Художника
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  
  // Состояние для Пиксель-арта
  const [pixels, setPixels] = useState({});
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  const canvasRef = React.useRef(null);
  const PIXEL_GRID_SIZE = 20;

  // Отрисовка на холсте
  useEffect(() => {
    if (mode === 'emoji' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 'painter') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      const drawStroke = (stroke) => {
        if (stroke.points.length === 0) return;
        ctx.strokeStyle = stroke.color;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      };
      strokes.forEach(drawStroke);
      if (currentStroke) drawStroke(currentStroke);
    } 
    else if (mode === 'pixelart') {
      const cellSize = canvas.width / PIXEL_GRID_SIZE;
      
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += cellSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 0; j <= canvas.height; j += cellSize) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }

      Object.keys(pixels).forEach(key => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = pixels[key];
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    }
  }, [strokes, currentStroke, pixels, mode]);

  const paintPixel = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const cellSize = canvas.width / PIXEL_GRID_SIZE;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    setPixels(prev => ({ ...prev, [`${gridX},${gridY}`]: color }));
  };

  const handlePointerDown = (e) => {
    setIsMouseDown(true);
    if (mode === 'painter') {
      const rect = canvasRef.current.getBoundingClientRect();
      setCurrentStroke({ color, points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }] });
    } else if (mode === 'pixelart') {
      paintPixel(e.clientX, e.clientY);
    }
  };

  const handlePointerMove = (e) => {
    if (!isMouseDown) return;
    if (mode === 'painter' && currentStroke) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCurrentStroke({ ...currentStroke, points: [...currentStroke.points, { x: e.clientX - rect.left, y: e.clientY - rect.top }] });
    } else if (mode === 'pixelart') {
      paintPixel(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
    if (mode === 'painter' && currentStroke) {
      setStrokes([...strokes, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const clearCanvas = () => {
    setStrokes([]);
    setPixels({});
  };

  const handleSave = async () => {
    setLoading(true);
    
    let graphicData;
    if (mode === 'emoji') {
      graphicData = { type: 'emoji', value: emoji };
    } else if (mode === 'pixelart') {
      graphicData = { type: 'pixelart', gridSize: PIXEL_GRID_SIZE, pixels: pixels };
    } else if (mode === 'ascii') {
      // СОХРАНЯЕМ ASCII
      graphicData = { type: 'ascii', text: asciiText }; 
    } else {
      // Обновляем ширину здесь:
      graphicData = { type: 'strokes', canvasWidth: target === 'banner' ? 600 : 400, canvasHeight: target === 'banner' ? 200 : 400, lines: strokes };
    }

    // ЕСЛИ ЭТО ПОСТ: отдаем данные наружу и закрываем (без запроса на сервер профиля)
    if (user && user.isPostGraphic) {
      user.onSaveData({ mode: mode, payload: graphicData });
      setLoading(false);
      onClose();
      return;
    }

    // ИНАЧЕ: сохраняем как аватар/шапку
    const payload = { target, mode, graphic_data: graphicData };

    try {
      const response = await fetch("https://api.goodfaceteam.ru/update_graphics.php", { method: 'POST', headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }, credentials: 'include', body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.success) {
        onClose();
        setTimeout(() => window.location.reload(), 300);
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[90vh] max-h-[900px] animate-in zoom-in-95">
        
        {/* Шапка модалки */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0 bg-white dark:bg-[#18181b] z-10">
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            Изменить {target === 'avatar' ? 'аватарку' : 'шапку'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
            <X size={18}/>
          </button>
        </div>

        {/* Панель инструментов (Переключатели) */}
        <div className="p-4 bg-zinc-50 dark:bg-[#121212] flex flex-wrap gap-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-10">
          <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl">
            <button onClick={() => setMode('painter')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'painter' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Художник</button>
            <button onClick={() => setMode('pixelart')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'pixelart' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Пиксели</button>
            <button onClick={() => setMode('emoji')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'emoji' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Эмодзи</button>
            <button onClick={() => setMode('ascii')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'ascii' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>ASCII</button>
          </div>
          
          {mode !== 'emoji' && (
            <div className="ml-auto flex items-center gap-3 bg-white dark:bg-[#18181b] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Цвет</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-md cursor-pointer border-0 p-0" />
            </div>
          )}
        </div>

        {/* Рабочая область */}
        <div className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-[#09090b] p-6 relative">
          {mode === 'emoji' ? (
            <div className="w-full h-full flex flex-col md:flex-row gap-6 max-w-4xl mx-auto animate-in fade-in duration-300">
              
              {/* Левая панель: Крупное превью */}
              <div className="md:w-1/3 flex flex-col items-center justify-center bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 text-center">Превью профиля</p>
                <div className={`flex items-center justify-center bg-zinc-50 dark:bg-[#121212] shadow-inner border border-zinc-100 dark:border-zinc-800/80 ${target === 'banner' ? 'w-full aspect-[2/1] rounded-2xl text-8xl' : 'w-40 h-40 rounded-full text-7xl'}`}>
                  {emoji}
                </div>
                <p className="text-xs text-zinc-500 font-medium text-center mt-6 leading-relaxed">
                  Выберите эмодзи справа. <br/> Он моментально применится к вашему профилю.
                </p>
              </div>

              {/* Правая панель: Пикер */}
              <div className="md:w-2/3 flex-1 h-[400px] md:h-auto rounded-3xl overflow-hidden bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                <EmojiPicker 
                  emojiStyle="apple"
                  onEmojiClick={(emojiObject) => setEmoji(emojiObject.emoji)}
                  width="100%"
                  height="100%"
                  theme={isDark ? 'dark' : 'light'}
                  searchPlaceHolder="Найти эмодзи..."
                  previewConfig={{ showPreview: false }} // Отключаем нижнюю плашку пикера
                  skinTonesDisabled // Убираем выбор цвета кожи для минимализма
                  style={{
                    border: 'none',
                    borderRadius: '1.5rem',
                    backgroundColor: 'transparent',
                    // CSS-переменные для идеального слияния пикера с твоей темой
                    '--epr-bg-color': 'transparent', 
                    '--epr-category-label-bg-color': isDark ? '#18181b' : '#ffffff',
                    '--epr-search-input-bg-color': isDark ? '#121212' : '#f4f4f5',
                    '--epr-search-border-color': isDark ? '#27272a' : '#e4e4e7',
                  }}
                />
              </div>

            </div>
          ) : mode === 'ascii' ? (
            <div className="flex items-center justify-center h-full w-full max-w-4xl mx-auto animate-in fade-in duration-300">
              <textarea
                value={asciiText}
                onChange={(e) => setAsciiText(e.target.value)}
                placeholder="Вставь свой ASCII-арт сюда..."
                spellCheck="false"
                className={`bg-zinc-900 text-green-400 font-mono text-[10px] leading-tight p-4 rounded-2xl border border-zinc-700 shadow-inner outline-none resize-none hide-scrollbar whitespace-pre overflow-auto ${target === 'banner' ? 'w-[600px] h-[200px]' : 'w-[400px] h-[400px]'}`}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <canvas 
                ref={canvasRef}
                width={target === 'banner' ? 600 : 400} // Делаем холст шире для шапки
                height={target === 'banner' ? 200 : 400}
                style={{ display: 'block' }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseOut={handlePointerUp}
                // Добавили max-w-full и object-contain, чтобы холст не вылазил за пределы экрана на узких мониторах
                className="bg-white dark:bg-[#18181b] shadow-md rounded-2xl cursor-crosshair border border-zinc-200 dark:border-zinc-800 max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0 bg-white dark:bg-[#18181b] z-10">
          <button onClick={clearCanvas} className="text-sm text-zinc-500 font-bold hover:text-red-500 transition px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
            {mode === 'emoji' ? 'Сбросить' : 'Очистить холст'}
          </button>
          <button disabled={loading} onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Сохранить изменения
          </button>
        </div>
        
      </div>
    </div>
  );
}

// --- РЕНДЕРЕР ГРАФИКИ ИЗ JSON ---
function GraphicRenderer({ mode, data, target }) {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if ((mode !== 'painter' && mode !== 'pixelart') || !data || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 'painter' && data.lines) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      data.lines.forEach(stroke => {
        if (!stroke.points || stroke.points.length === 0) return;
        ctx.strokeStyle = stroke.color;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      });
    } else if (mode === 'pixelart' && data.pixels) {
      const gridSize = data.gridSize || 20;
      const cellSize = canvas.width / gridSize;
      
      Object.keys(data.pixels).forEach(key => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = data.pixels[key];
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    }
  }, [mode, data]);

  if (!data) return null;

  if (mode === 'emoji') {
    return (
      <div className={`flex items-center justify-center w-full h-full ${target === 'banner' ? 'bg-zinc-100 dark:bg-zinc-800 text-[100px]' : target === 'post' ? 'text-[120px] py-4' : 'text-5xl'}`}>
        {data.value}
      </div>
    );
  }

  // ДОБАВЛЯЕМ ОБРАБОТКУ ASCII ЗДЕСЬ
  if (mode === 'ascii') {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-zinc-900 text-green-400 overflow-hidden ${target === 'banner' ? 'rounded-2xl' : target === 'avatar_small' ? '' : 'rounded-full'}`}>
        <pre className={`font-mono leading-none m-0 p-2 pointer-events-none select-none flex items-center justify-center ${
          target === 'avatar_small' ? 'text-[4px]' : 
          target === 'banner' ? 'text-[8px] sm:text-[10px]' : 
          'text-[6px] sm:text-[8px]'
        }`}>
          {data.text}
        </pre>
      </div>
    );
  }

  if (mode === 'media' && data) {
    if (data.type === 'video') {
      return (
        <video 
          src={data.url} 
          controls 
          className={`w-full h-auto rounded-xl shadow-sm ${target === 'post' ? 'max-h-[500px] object-contain bg-black/5' : ''}`}
        />
      );
    }
    return (
      <img 
        src={data.url} 
        alt="Post media" 
        className={`w-full h-auto rounded-xl shadow-sm ${target === 'post' ? 'max-h-[500px] object-contain bg-black/5' : ''}`}
        loading="lazy"
      />
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={target === 'banner' ? 600 : 400}   // <-- Динамическая ширина
      height={target === 'banner' ? 200 : 400}  // <-- Динамическая высота
      className={`${
        target === 'avatar_small' 
          ? 'w-full h-full object-cover' 
          : target === 'post' 
            ? 'w-full max-w-[300px] h-auto mx-auto' 
            : target === 'banner'
              ? 'w-full h-full object-cover'    // <-- Убирает искажение пропорций
              : 'w-full h-full'
      }`} 
    />
  );
}

const tailwindHex = {
  // Существующие
  'amber-400': '#fbbf24', 'orange-500': '#f97316', 'rose-400': '#fb7185',
  'red-500': '#ef4444', 'pink-500': '#ec4899', 'indigo-500': '#6366f1',
  'blue-500': '#3b82f6', 'emerald-500': '#10b981', 'purple-500': '#a855f7',
  // Новые космические и неоновые
  'cyan-400': '#22d3ee', 'sky-500': '#0ea5e9', 'violet-600': '#7c3aed',
  'fuchsia-500': '#d946ef', 'lime-400': '#a3e635', 'slate-500': '#64748b',
  'yellow-400': '#facc15', 'teal-500': '#14b8a6', 'blue-600': '#2563eb'
};

function ProfilePage({ user: currentUser }) {
  const params = useParams(); 
  const { openSettings, openReportModal } = useOutletContext() || {};
  
  // 1. Получаем то, что написано в адресной строке после слэша
  const rawHandle = params.handle || "";
  
  // 2. Если ссылка начинается с "@" (например @endryu) — отрезаем её. 
  // Теперь в переменной handle всегда лежит чистый тег "endryu" для БД.
  const handle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

  // 3. Проверяем: это МОЙ профиль или ЧУЖОЙ?
  const isMyProfile = currentUser?.handle === handle;
  
  // Пока что делаем заглушку для чужого профиля
  const [profileUser, setProfileUser] = useState(null);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [profileTab, setProfileTab] = useState('posts'); 
  const [gifts, setGifsList] = useState([]);
  const [isGiftsLoading, setIsGiftsLoading] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftActionModal, setGiftActionModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [customGraphics, setCustomGraphics] = useState(null);

  const [giftsList, setGiftsList] = useState([]); // Полученные подарки
  const [catalog, setCatalog] = useState([]); // Каталог магазина
  const [myPlanets, setMyPlanets] = useState(null); // Мой баланс
  const [selectedCatalogGift, setSelectedCatalogGift] = useState(null); // Выбранный подарок для отправки
  const [giftMessage, setGiftMessage] = useState(''); // Сообщение к подарку
  const [isSendingGift, setIsSendingGift] = useState(false);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const [postText, setPostText] = useState("");
  const [postGraphic, setPostGraphic] = useState(null); 
  const [posts, setPosts] = useState([]); 
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pollOptions, setPollOptions] = useState([]); 

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [targetUserId, setTargetUserId] = useState(null); // ID пользователя, чей профиль открыт
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // --- НОВЫЕ СОСТОЯНИЯ ДЛЯ БЕСКОНЕЧНОЙ ЛЕНТЫ ---
  const [page, setPage] = useState(1);
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const [followStatus, setFollowStatus] = useState('none'); // 'none', 'pending', 'approved'
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    hideFollowers: false,
    hideFollowing: false,
    messages: 'all',
    calls: 'all',
    gifts: 'all',
    birthday: 'all'
  });
  const [createdAt, setCreatedAt] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const POSTS_PER_PAGE = 10;

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const observer = React.useRef(); // Реф для отслеживания скролла
  const isDark = document.documentElement.classList.contains('dark');

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [modalUsersType, setModalUsersType] = useState('followers'); // 'followers' или 'following'
  const [modalUsersList, setModalUsersList] = useState([]);
  const [isModalUsersLoading, setIsModalUsersLoading] = useState(false);

  // Стейт для заявки на верификацию
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);

  // Функция загрузки списка пользователей
  const fetchUsersList = async (type) => {
    if (!targetUserId) return;
    setIsModalUsersLoading(true);
    setModalUsersType(type);
    setShowUsersModal(true);
    
    try {
      const res = await fetch(`https://api.goodfaceteam.ru/get_user_connections.php?user_id=${targetUserId}&type=${type}`, { headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setModalUsersList(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalUsersLoading(false);
    }
  };

  // Функция запроса галочки
  const handleRequestVerification = async () => {
    setIsVerificationLoading(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/request_verification.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setIsVerificationRequested(true);
        setShowVerificationModal(false); // Закрываем модалку при успехе
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setPostGraphic(null); // Сбрасываем рисовалку, если выбрали фото
      setPollOptions([]);   // Сбрасываем опрос
    }
  };

  useEffect(() => {
    if (!handle || !targetUserId) return;
    fetch(`https://api.goodfaceteam.ru/get_profile_stats.php?handle=${handle}`, { credentials: 'include', headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFollowersCount(data.followers);
          setFollowingCount(data.following);
          setFollowStatus(data.follow_status); // Записываем 'none', 'pending' или 'approved'
          setIsPrivate(data.is_private);
        }
      });
  }, [handle, targetUserId, currentUser?.id]);

  const handleToggleBlock = async () => {
    if (!currentUser || !targetUserId || isBlockLoading) return;
    setIsBlockLoading(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/toggle_block.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ blocked_id: targetUserId })
      });
      const data = await res.json();
      if (data.success) {
        setIsBlocked(data.is_blocked);
        setShowProfileMenu(false);
        // Если заблокировали, можно принудительно отписаться на фронте (опционально)
        if (data.is_blocked) setFollowStatus('none');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBlockLoading(false);
    }
  };

  // Функция подписки / отписки / отмены заявки
  const handleToggleFollow = async () => {
    console.log("ОТПРАВКА ЗАПРОСА:", { follower: currentUser?.id, followed: targetUserId });

    if (!currentUser || !targetUserId || isFollowLoading) {
      console.warn("Клик заблокирован: нет данных или загрузка");
      return;
    }
    
    setIsFollowLoading(true);

    // 1. Запоминаем старые данные для отката, если сервер выдаст ошибку
    const previousStatus = followStatus;
    const previousFollowersCount = followersCount;

    // 2. Моментально (Оптимистично) меняем UI в зависимости от текущего статуса
    let newStatus = 'none';
    
    if (previousStatus === 'none') {
      // Если подписываемся:
      newStatus = isPrivate ? 'pending' : 'approved';
      if (!isPrivate) setFollowersCount(prev => prev + 1);
    } else if (previousStatus === 'pending') {
      // Если отменяем заявку (ОТЗЫВАЕМ):
      newStatus = 'none'; // Кнопка сразу станет "Подписаться"
    } else if (previousStatus === 'approved') {
      // Если отписываемся:
      newStatus = 'none';
      setFollowersCount(prev => prev - 1);
    }

    setFollowStatus(newStatus); // Мгновенно обновляем кнопку!

    // 3. Отправляем запрос на сервер
    try {
      const res = await fetch("https://api.goodfaceteam.ru/toggle_follow.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ followed_id: targetUserId })
      });
      const data = await res.json();
      
      if (!data.success) {
        // Если сервер вернул ошибку - незаметно откатываем кнопку назад
        setFollowStatus(previousStatus);
        setFollowersCount(previousFollowersCount);
        console.error(data.message);
      }
    } catch (e) {
      setFollowStatus(previousStatus);
      setFollowersCount(previousFollowersCount);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const loadPosts = React.useCallback(async (pageNum, isReset = false) => {
    if (!handle) return;
    setIsLoadingPosts(true);
    const offset = (pageNum - 1) * POSTS_PER_PAGE;
    
    try {
      const res = await fetch(`https://api.goodfaceteam.ru/get_posts.php?handle=${handle}&limit=${POSTS_PER_PAGE}&offset=${offset}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } })
      const data = await res.json();
      
      if (data.success) {
        setPosts(prev => isReset ? data.posts : [...prev, ...data.posts]);
        setHasMore(data.posts.length === POSTS_PER_PAGE);
      }
    } catch (err) {
      console.error("Ошибка загрузки постов", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [handle, currentUser?.id]);

  // Вызываем fetchPosts при загрузке профиля (или когда меняется handle)
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [handle]);

  useEffect(() => {
    if (!handle) return;
    fetch(`https://api.goodfaceteam.ru/get_user_gifts.php?handle=${handle}`, {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setGiftsList(data.gifts);
      })
      .catch(e => console.error("Ошибка загрузки подарков", e));
  }, [handle, profileTab]); // Обновляем, когда юзер переключает табы

  const handleOpenGiftStore = async () => {
    setShowGiftModal(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/get_gifts_catalog.php", {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCatalog(data.catalog);
        setMyPlanets(data.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendGift = async () => {
    if (!selectedCatalogGift || isSendingGift) return;
    setIsSendingGift(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/send_gift.php", {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
        },
        body: JSON.stringify({
          receiver_id: targetUserId,
          gift_id: selectedCatalogGift.id,
          message: giftMessage
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setShowGiftModal(false);
        setSelectedCatalogGift(null);
        setGiftMessage('');
        alert("Подарок успешно отправлен! 🎉");
        // Обновляем список подарков, если мы смотрим свой же профиль или профиль получателя
        setProfileTab('posts'); // Сбросим таб для перезагрузки
        setTimeout(() => setProfileTab('gifts'), 100); 
      } else {
        alert(data.message || "Ошибка отправки");
      }
    } catch (e) {
      alert("Ошибка соединения");
    } finally {
      setIsSendingGift(false);
    }
  };

  // Загружаем графику (для своего или чужого профиля)
  useEffect(() => {
    if (!handle) return;
    
    // Сбрасываем старые данные перед загрузкой нового профиля
    setProfileUser(null);
    setCustomGraphics(null);
    setIsUserNotFound(false);

    // Загружаем всю инфу о профиле (имя, ID, графика) по handle
    fetch(`https://api.goodfaceteam.ru/get_user_profile.php?handle=${handle}`, { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }, credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfileUser(data.user);
          setIsVerificationRequested(data.user.verification_status === 'pending');
          setCustomGraphics({
            avatar_mode: data.user.avatar_mode,
            avatar_data: data.user.avatar_data,
            banner_mode: data.user.banner_mode,
            banner_data: data.user.banner_data
          });
          
          setTargetUserId(data.user.id);
          setIsBlocked(data.user.is_blocked);
          
          // НОВОЕ: Сохраняем дату регистрации и настройки приватности
          setCreatedAt(data.user.created_at);
          setPrivacySettings({
            hideFollowers: data.user.hide_followers,
            hideFollowing: data.user.hide_following,
            messages: data.user.privacy_messages,
            calls: data.user.privacy_calls,
            gifts: data.user.privacy_gifts,
            birthday: data.user.privacy_birthday
          });
          // Если мы уже подписаны, обновляем followStatus (сервер нам его тоже отдает)
          if (data.user.is_following) setFollowStatus('approved');
        } else {
          setIsUserNotFound(true); // Юзер не найден!
        }
      })
      .catch(err => console.error("Ошибка загрузки профиля", err));
  }, [handle]);

  // Обновляем локальный стейт имени для режима редактирования
  useEffect(() => {
    if (profileUser?.name) {
      setName(profileUser.name);
    }
  }, [profileUser]);

  const lastPostRef = React.useCallback(node => {
    if (isLoadingPosts) return;
    if (observer.current) observer.current.disconnect(); // Сбрасываем старого наблюдателя
    
    observer.current = new IntersectionObserver(entries => {
      // Если элемент появился на экране и еще есть посты для загрузки
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const next = prev + 1;
          loadPosts(next, false);
          return next;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingPosts, hasMore, handle]);

  const togglePoll = () => {
    if (pollOptions.length > 0) {
      setPollOptions([]); // Отключаем опрос
    } else {
      setPollOptions(['', '']); // Включаем опрос (2 пустых варианта)
      setPostGraphic(null); // Рисунок и опрос одновременно делать нельзя
    }
  };

  const updatePollOption = (index, value) => {
    const newOpts = [...pollOptions];
    newOpts[index] = value;
    setPollOptions(newOpts);
  };

  const handleEditPost = async (postId, newText) => {
    try {
      const response = await fetch("https://api.goodfaceteam.ru/update_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          post_id: postId, 
          user_id: currentUser.id, 
          text: newText 
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Если всё успешно, обновляем текст поста локально (чтобы не перезагружать всю ленту)
        setPosts(posts.map(p => p.id === postId ? { ...p, text: newText } : p));
      } else {
        alert("Ошибка редактирования: " + result.message);
      }
    } catch (error) {
      alert("Ошибка соединения с сервером");
    }
  };

  const handlePublishPost = async () => {
    // Отфильтруем пустые варианты опроса
    const validPollOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (!postText.trim() && !postGraphic && !mediaFile && validPollOptions.length === 0) return;
    if (pollOptions.length > 0 && validPollOptions.length < 2) {
      alert("Для опроса нужно минимум 2 варианта ответа!");
      return;
    }

    setIsPublishing(true);
    
    let finalGraphicData = postGraphic;

    // ЕСЛИ ЕСТЬ МЕДИАФАЙЛ -> грузим его первым
    if (mediaFile) {
      const formData = new FormData();
      formData.append('media', mediaFile);
      
      try {
        const uploadRes = await fetch("https://api.goodfaceteam.ru/upload_media.php", {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
          finalGraphicData = {
            mode: 'media', 
            payload: { 
              type: mediaFile.type.startsWith('video/') ? 'video' : 'image', 
              url: uploadData.url 
            }
          };
        } else {
          alert("Ошибка загрузки файла: " + uploadData.message);
          setIsPublishing(false);
          return;
        }
      } catch (e) {
        alert("Ошибка соединения при загрузке медиа");
        setIsPublishing(false);
        return;
      }
    } else if (validPollOptions.length >= 2) {
      finalGraphicData = {
        type: 'poll',
        options: validPollOptions.map((text, i) => ({ id: i, text: text, votes: 0 }))
      };
    }
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/create_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ text: postText, graphic_data: finalGraphicData }) // user_id убрали
      });
      const result = await res.json();
      if (result.success) {
        setPostText(""); 
        setPostGraphic(null);
        setPollOptions([]);
        setShowEmojiPicker(false);
        setMediaFile(null); // Очищаем файл
        setMediaPreview(null); // Очищаем превью
        setPage(1);
        loadPosts(1, true);
      } else {
        alert("Ошибка публикации: " + result.message);
      }
    } catch (error) {
      alert("Ошибка соединения с сервером");
    } finally {
      setIsPublishing(false);
    }
  };
  const [showSettings, setShowSettings] = useState(false);

  const handlePinPost = async (postId) => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/pin_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId })
      });
      const data = await res.json();
      
      if (data.success) {
        // Обновляем локальный стейт постов
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            return { ...p, is_pinned: data.is_pinned }; // Ставим новый статус выбранному
          } else if (data.is_pinned) {
            return { ...p, is_pinned: false }; // Снимаем закреп с остальных (если мы закрепили этот)
          }
          return p;
        }));
      } else {
        alert("Ошибка: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.")) return;
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/delete_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include', // <-- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
        body: JSON.stringify({ post_id: postId }) // <-- user_id УБРАЛИ
      });
      const data = await res.json();
      if (data.success) {
        // Убираем пост из ленты моментально
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim() || !isMyProfile) return;
    setLoading(true);
    setStatus({ text: '', type: '' });

    try {
      const response = await fetch("https://api.goodfaceteam.ru/update_name.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: name })
      });

      const result = await response.json();

      if (result.success) {
        const updatedUser = { ...currentUser, name: name };
        Cookies.set('auth_session', JSON.stringify(updatedUser), { expires: 7 });
        setStatus({ text: "Изменения сохранены!", type: 'success' });
        setTimeout(() => window.location.reload(), 1000); 
      } else {
        setStatus({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setStatus({ text: "Ошибка связи с сервером", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const canSeeInfo = (privacyType) => {
    if (isMyProfile) return true; // Себе можно все
    const setting = privacySettings[privacyType];
    if (setting === 'all') return true;
    if (setting === 'nobody') return false;
    if (setting === 'followers' && followStatus === 'approved') return true;
    return false;
  };

  const canMessage = canSeeInfo('messages');
  const canSeeGifts = canSeeInfo('gifts');
  const canSeeBirthday = canSeeInfo('birthday');

  const checkIsBirthday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  // Эффект фейерверка при заходе на профиль именинника
  useEffect(() => {
    if (profileUser && checkIsBirthday(profileUser.birthday) && canSeeBirthday) {
      confetti({ 
        particleCount: 150, 
        spread: 80, 
        origin: { y: 0.6 }, 
        colors: ['#ff2a6d', '#05d5ff', '#34c759', '#ff9500'],
        zIndex: 999999 
      });
    }
  }, [profileUser]);

  const handleToggleHideGift = async (giftId) => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/manage_gift.php", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ user_gift_id: giftId, action: 'toggle_hide' })
      });
      const data = await res.json();
      if (data.success) {
        // Обновляем состояние подарка локально
        setGiftsList(prev => prev.map(g => g.user_gift_id === giftId ? { ...g, is_hidden: !g.is_hidden } : g));
        setGiftActionModal(null);
      }
    } catch (e) { console.error(e); }
  };

  // Функция для продажи
  const handleSellGift = async (giftId) => {
    if (!window.confirm("Вы уверены, что хотите продать этот подарок?")) return;
    try {
      const res = await fetch("https://api.goodfaceteam.ru/manage_gift.php", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ user_gift_id: giftId, action: 'sell' })
      });
      const data = await res.json();
      if (data.success) {
        setGiftsList(prev => prev.filter(g => g.user_gift_id !== giftId));
        setGiftActionModal(null);
        alert(`Подарок продан! Вы получили ${data.refund} ${data.currency}`);
      }
    } catch (e) { console.error(e); }
  };

  const getDynamicGradient = (bgString) => {
    if (!bgString || !bgString.includes('from-')) return {};

    const parts = bgString.split(' ');
    const fromColor = parts.find(p => p.startsWith('from-'))?.replace('from-', '');
    const toColor = parts.find(p => p.startsWith('to-'))?.replace('to-', '');

    const fromHex = tailwindHex[fromColor] || '#ccc'; // Цвет по умолчанию, если не нашли в карте
    const toHex = tailwindHex[toColor] || '#999';

    return {
      background: `linear-gradient(to bottom, ${fromHex}, ${toHex})`
    };
  };

  const planetStyles = {
    mercury: 'bg-gradient-to-br from-stone-400 to-stone-600 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    venus: 'bg-gradient-to-br from-orange-300 to-yellow-600 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    earth: 'bg-gradient-to-br from-blue-400 to-emerald-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    mars: 'bg-gradient-to-br from-red-500 to-orange-700 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    jupiter: 'bg-gradient-to-br from-orange-400 to-stone-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    saturn: 'bg-gradient-to-br from-yellow-200 to-yellow-600 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)] ring-[2px] ring-yellow-400/50',
    uranus: 'bg-gradient-to-br from-cyan-300 to-blue-400 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    neptune: 'bg-gradient-to-br from-blue-600 to-indigo-800 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    default: 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]'
  };

  if (isUserNotFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-zinc-400 dark:text-zinc-600 animate-in fade-in zoom-in-95 duration-500">
        <UserX size={80} strokeWidth={1} className="mb-6 opacity-50" />
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Пользователь не найден</h2>
        <p className="text-zinc-500 font-medium text-center">
          Возможно, вы ошиблись в ссылке (@{handle}), <br/> или этот аккаунт был удален.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-16">
        
        {/* Шапка (кликабельна только если это мой профиль) */}
        <div 
          onClick={() => isMyProfile && setEditTarget('banner')}
          className={`group h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative ${isMyProfile ? 'cursor-pointer' : ''}`}
        >
          {customGraphics?.banner_data ? (
            <GraphicRenderer target="banner" mode={customGraphics.banner_mode} data={customGraphics.banner_data} />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900"></div>
          )}
          
          {isMyProfile && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <Camera size={32} /> <span className="ml-2 font-bold">Изменить фон</span>
            </div>
          )}
        </div>

        <div className="absolute -bottom-12 left-6 flex items-end justify-between w-[calc(100%-48px)]">
          
          {/* Аватар (кликабелен только если это мой профиль) */}
          <div 
            onClick={() => isMyProfile && setEditTarget('avatar')}
            className={`relative group w-24 h-24 bg-white dark:bg-[#121212] rounded-full p-1 flex-shrink-0 ${isMyProfile ? 'cursor-pointer' : ''}`}
          >
            <div className="w-full h-full bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center text-white dark:text-zinc-900 text-3xl font-black uppercase overflow-hidden relative">
              
              {customGraphics?.avatar_data ? (
                <GraphicRenderer target="avatar" mode={customGraphics.avatar_mode} data={customGraphics.avatar_data} />
              ) : (
                profileUser?.name ? profileUser.name.charAt(0) : '?'
              )}

              {isMyProfile && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera size={24} />
                </div>
              )}
            </div>
          </div>

          {/* Кнопка редактирования (показываем только себе) */}
          {isMyProfile ? (
            <button 
              onClick={openSettings}
              className="cursor-pointer bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Редактировать
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleToggleFollow}
                disabled={isFollowLoading}
                className={`group cursor-pointer px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm w-[160px] flex justify-center items-center
                  ${followStatus === 'approved'
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-white dark:hover:bg-red-900/20 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700' 
                    : followStatus === 'pending'
                      ? 'bg-zinc-200 text-zinc-700 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 border border-zinc-300 dark:border-zinc-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
              >
                {followStatus === 'approved' ? (
                  <>
                    <span className="block group-hover:hidden">Вы подписаны</span>
                    <span className="hidden group-hover:block">Отписаться</span>
                  </>
                ) : followStatus === 'pending' ? (
                  <>
                    <span className="block group-hover:hidden whitespace-nowrap">Запрос отправлен</span>
                    <span className="hidden group-hover:block whitespace-nowrap text-red-500">Отменить</span>
                  </>
                ) : (
                  'Подписаться'
                )}
              </button>
              {canMessage && !isBlocked && (
                <Link 
                  to={`/chat/@${handle}`} 
                  className="hidden md:flex cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm"
                >
                  <MessageCircle size={18} />
                </Link>
              )}
              
              <div className="relative flex">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
                  className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm"
                >
                  <MoreVertical size={18} />
                </button>

                {showProfileMenu && (
                  <>
                    {/* Оверлей: z-[10000] перекроет нижнее меню */}
                    <div className="fixed inset-0 z-[10000] bg-black/20 dark:bg-black/60 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none transition-all" onClick={() => setShowProfileMenu(false)}></div>
                    
                    {/* Само меню: z-[10001] и добавили pb-8 для телефонов (отступ от системной полоски) */}
                    <div className="fixed md:absolute bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-0 md:top-full mt-0 md:mt-2 w-full md:w-56 bg-white dark:bg-[#18181b] border-t md:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl overflow-hidden pt-4 pb-8 md:py-1 z-[10001] animate-in slide-in-from-bottom-full md:slide-in-from-top-2 md:zoom-in-95 duration-200">
                      
                      {/* Индикатор свайпа (пилюля) для телефонов */}
                      <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 md:hidden"></div>

                      {/* Пункт "Написать сообщение" (Только для телефонов) */}
                      {canMessage && !isBlocked && (
                        <>
                          <Link 
                            to={`/chat/@${handle}`} 
                            className="md:hidden w-full px-5 py-3.5 flex items-center gap-3 text-[15px] font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <MessageCircle size={20} className="text-blue-500" /> Написать сообщение
                          </Link>
                          <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-1 md:hidden"></div>
                        </>
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleBlock(); }} 
                        className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <Ban size={20} /> {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          openReportModal('user', targetUserId);
                          setShowProfileMenu(false);
                        }} 
                        className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <AlertTriangle size={20} /> Пожаловаться
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- БАННЕР ДНЯ РОЖДЕНИЯ --- */}
      {profileUser && checkIsBirthday(profileUser.birthday) && canSeeBirthday && profileUser.is_followed_by && followStatus === 'approved' && !isMyProfile && (
        <div className="mb-4 mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 p-2 rounded-full shrink-0"><Cake size={24} /></div>
            <div className="min-w-0">
              <p className="font-bold text-[15px] truncate">{profileUser.name} празднует день рождения!</p>
              <p className="text-[13px] text-white/80 truncate">Поздравьте в сообщениях 🎉</p>
            </div>
          </div>
          <Link to={`/chat/@${handle}`} className="bg-white text-purple-600 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-sm ml-2">
            Поздравить
          </Link>
        </div>
      )}

      <div className="mb-6">
        {profileUser ? (
          <UserName 
            user={profileUser} 
            className_name="text-3xl font-black tracking-tight" 
            className_icon="size-7" 
          />
        ) : (
          <h2 className="text-2xl font-black text-zinc-400 animate-pulse">Загрузка...</h2>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 mb-3">@{handle}</p>
        
        {/* Вывод Описания */}
        {profileUser?.bio && (
          <p className="text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap max-w-2xl">
            {profileUser.bio}
          </p>
        )}
      </div>
        
        {/* ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЗАБЛОКИРОВАН */}
      {isBlocked ? (
        <div className="mt-8 text-center py-20 bg-zinc-50 dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Ban size={36} />
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Вы заблокировали этого пользователя</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">
            Его посты и сообщения больше не будут вам отображаться.
          </p>
          <button 
            onClick={handleToggleBlock}
            disabled={isBlockLoading}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            {isBlockLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Разблокировать'}
          </button>
        </div>
      ) : (
        /* ЕСЛИ НЕ ЗАБЛОКИРОВАН -> РЕНДЕРИМ СТАТИСТИКУ И ПОСТЫ */
        <>
          {/* Вывод количества подписчиков */}
          <div className="flex gap-4 mt-3 text-sm">
            <button 
              onClick={() => followingCount !== null && fetchUsersList('following')} 
              disabled={followingCount === null}
              className="flex items-center gap-1.5 hover:underline decoration-zinc-400 disabled:no-underline cursor-pointer disabled:cursor-default"
            >
              {followingCount === null ? (
                <Lock size={14} className="text-zinc-400 opacity-60" />
              ) : (
                <span className="font-bold text-zinc-900 dark:text-white">{followingCount}</span>
              )}
              <span className="text-zinc-500">Подписок</span>
            </button>
            
            <button 
              onClick={() => followersCount !== null && fetchUsersList('followers')} 
              disabled={followersCount === null}
              className="flex items-center gap-1.5 hover:underline decoration-zinc-400 disabled:no-underline cursor-pointer disabled:cursor-default"
            >
              {followersCount === null ? (
                <Lock size={14} className="text-zinc-400 opacity-60" />
              ) : (
                <span className="font-bold text-zinc-900 dark:text-white">{followersCount}</span>
              )}
              <span className="text-zinc-500">Подписчиков</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 pt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>
                  Регистрация: {new Date(createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}

            {canSeeBirthday && profileUser?.birthday && (
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Cake size={15} className="text-pink-500 dark:text-pink-400" />
                <span className="font-semibold">
                   День рождения: {new Date(profileUser.birthday).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              </div>
            )}
            
            {/* Кнопка запроса верификации (показываем только владельцу, если еще нет галочки) */}
            {isMyProfile && !profileUser?.is_verified && (
              <button 
                onClick={() => isVerificationRequested ? null : setShowVerificationModal(true)}
                disabled={isVerificationRequested}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isVerificationRequested ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 opacity-80 cursor-default' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95'}`}
              >
                {isVerificationRequested ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} className="text-blue-500" />}
                {isVerificationRequested ? 'Заявка на рассмотрении' : 'Получить галочку'}
              </button>
            )}
          </div>

          {/* Обновленные вкладки */}
          <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6 mt-6">
            <button onClick={() => setProfileTab('posts')} className={`cursor-pointer pb-3 font-bold transition-colors ${profileTab === 'posts' ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>Посты</button>
            
            {/* Показываем вкладку подарков, только если они не скрыты настройками (или если это наш профиль) */}
            {(canSeeGifts || isMyProfile) && (
              <button 
                onClick={() => setProfileTab('gifts')} 
                className={`cursor-pointer pb-3 font-bold transition-colors flex items-center gap-2 ${
                  profileTab === 'gifts' 
                    ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white' 
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                Подарки
                
                {/* Динамический счетчик */}
                {giftsList.length > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full leading-none animate-in zoom-in duration-300">
                    {giftsList.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Контент вкладок */}
          {profileTab === 'posts' ? (
            <div className="space-y-6">
              
              {isMyProfile && (
                <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl flex flex-col focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors shadow-sm relative z-10">
                  <textarea 
                    value={postText}
                    onChange={(e) => {
                      setPostText(e.target.value);
                      // Автоматическое растягивание по высоте
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    className="w-full bg-transparent resize-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-h-[80px] max-h-[300px] overflow-y-auto" 
                    placeholder="Что нового, творец?"
                    rows="1"
                  />

                  {postGraphic && (
                    <div className="mt-4 relative bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex justify-center py-4">
                      <GraphicRenderer mode={postGraphic.mode} data={postGraphic.payload} target="post" />
                      <button onClick={() => setPostGraphic(null)} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition"><X size={16} /></button>
                    </div>
                  )}

                  {mediaPreview && (
                    <div className="mt-4 relative bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex justify-center py-4">
                      {mediaFile?.type.startsWith('video/') ? (
                        <video src={mediaPreview} controls className="max-h-[300px] rounded-lg" />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="max-h-[300px] rounded-lg object-contain" />
                      )}
                      <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {pollOptions.length > 0 && (
                    <div className="mt-4 p-4 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Опрос</span>
                        <button onClick={togglePoll} className="text-zinc-400 hover:text-red-500 transition"><X size={16}/></button>
                      </div>
                      {pollOptions.map((opt, index) => (
                        <input 
                          key={index}
                          type="text" 
                          value={opt}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          placeholder={`Вариант ответа ${index + 1}`}
                          className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                        />
                      ))}
                      {pollOptions.length < 5 && (
                        <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-sm font-bold text-blue-500 hover:text-blue-600 transition p-2">
                          + Добавить вариант
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 relative">
                    <div className="flex gap-1 text-zinc-400 dark:text-zinc-500">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*,video/mp4,video/webm" 
                        className="hidden" 
                      />
                      <button onClick={() => fileInputRef.current.click()} className="cursor-pointer p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                        <ImageIcon size={20}/>
                      </button>
                      <div className="relative">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition p-2 rounded-full ${showEmojiPicker ? 'cursor-pointer bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><Smile size={20}/></button>
                        {showEmojiPicker && (
                          <div className="absolute top-12 left-0 z-50 shadow-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b]">
                            <EmojiPicker emojiStyle="apple" onEmojiClick={(e) => { setPostText(prev => prev + e.emoji); setShowEmojiPicker(false); }} theme={isDark ? 'dark' : 'light'} previewConfig={{ showPreview: false }} width={300} height={400} />
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setEditTarget('post_graphic'); setPollOptions([]); }} disabled={pollOptions.length > 0} className="cursor-pointer hover:text-zinc-900 dark:hover:text-white transition p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"><Palette size={20}/></button>
                      <button onClick={togglePoll} disabled={postGraphic !== null} className={`cursor-pointer transition p-2 rounded-full disabled:opacity-30 ${pollOptions.length > 0 ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><BarChart2 size={20}/></button>
                    </div>

                    <button onClick={handlePublishPost} disabled={(!postText.trim() && !postGraphic && !mediaFile && pollOptions.filter(o => o.trim() !== '').length < 2) || isPublishing} className="cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2">
                      {isPublishing && <Loader2 size={16} className="animate-spin" />}
                      Опубликовать
                    </button>
                  </div>
                </div>
              )}

              {isPrivate && followStatus !== 'approved' && !isMyProfile ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400 dark:text-zinc-500">
                    <Lock size={36} />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Этот аккаунт закрыт</h3>
                  <p className="text-sm text-zinc-500 font-medium">Подпишитесь, чтобы видеть посты и графику этого пользователя.</p>
                </div>
              ) : posts.length > 0 ? (
                <>
                  {posts.map((post, index) => {
                    if (posts.length === index + 1) {
                      return (
                        <div ref={lastPostRef} key={post.id}>
                          <PostItem post={post} currentUser={currentUser} onEdit={handleEditPost} onDelete={handleDeletePost} onPin={handlePinPost} onLike={() => {}} onReport={() => openReportModal('post', post.id)} />
                        </div>
                      );
                    } else {
                      return <PostItem key={post.id} post={post} currentUser={currentUser} onEdit={handleEditPost} onDelete={handleDeletePost} onPin={handlePinPost} onLike={() => {}} onReport={() => openReportModal('post', post.id)} />;
                    }
                  })}
                  
                  {/* Крутилка загрузки при скролле */}
                  {isLoadingPosts && (
                    <div className="py-6 flex justify-center text-zinc-400">
                      <Loader2 className="animate-spin" size={24} />
                    </div>
                  )}
                </>
              ) : (
                !isLoadingPosts && (
                  <div className="text-center py-16 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[#18181b] rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="font-bold text-lg text-zinc-700 dark:text-zinc-300 mb-2">Здесь пока пусто</p>
                    <p className="text-sm">Напишите свой первый пост, чтобы им поделиться!</p>
                  </div>
                )
              )}
            </div>
          ) : null}
          {profileTab === 'gifts' && (
            <div className="animate-in fade-in duration-300">
              
              {/* Кнопка "Подарить" (если чужой профиль) */}
              {!isMyProfile && !isBlocked && (
                <button 
                  onClick={handleOpenGiftStore}
                  className="w-full mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-[15px] py-4 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Gift size={20} /> Отправить подарок
                </button>
              )}

              {/* Условие: если подарки есть — выводим сетку, если нет — заглушку */}
              {giftsList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {giftsList.map((gift) => {
                    const isRare = gift.background_css && gift.background_css.includes('from-');
                    // Генерируем стиль на лету
                    const gradientStyle = isRare ? getDynamicGradient(gift.background_css) : {};

                    return (
                      <div 
                        key={gift.user_gift_id}
                        onClick={() => isMyProfile && setGiftActionModal(gift)}
                        style={gradientStyle} // ПРИМЕНЯЕМ СТИЛЬ ЗДЕСЬ
                        className={`
                          relative rounded-[24px] p-4 flex flex-col items-center justify-center overflow-hidden group transition-all duration-300
                          ${isMyProfile ? 'cursor-pointer hover:shadow-lg active:scale-95' : ''} 
                          ${gift.is_hidden ? 'opacity-50 grayscale' : 'shadow-md'}
                          ${isRare 
                            ? 'border-transparent' // Убрали bg-gradient из классов
                            : 'bg-zinc-50 dark:bg-[#1c1c1e] border border-zinc-200 dark:border-zinc-800/50'
                          }
                        `}
                      >
                        {/* Иконка скрытия для владельца */}
                        {isMyProfile && gift.is_hidden && (
                          <div className="absolute top-3 left-3 bg-black/40 text-white p-1 rounded-full z-20">
                            <EyeOff size={12}/>
                          </div>
                        )}

                        {/* Эффект блика (только для редких подарков) */}
                        {isRare && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full"></div>
                        )}
                        
                        <img 
                          src={gift.emoji_url} 
                          alt={gift.gift_name} 
                          className={`w-20 h-20 md:w-24 md:h-24 z-10 transition-transform duration-500 ${isRare ? 'drop-shadow-2xl group-hover:scale-110' : 'drop-shadow-md group-hover:scale-105'}`}
                        />
                        
                        <div className={`mt-3 text-center px-3 py-2 rounded-xl w-full z-10 backdrop-blur-md ${isRare ? 'bg-black/20' : 'bg-zinc-100/50 dark:bg-black/20'}`}>
                          <p className={`font-bold text-[13px] truncate ${isRare ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {gift.gift_name}
                          </p>
                          <p className={`text-[10px] font-medium truncate ${isRare ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            от {gift.sender_name}
                          </p>
                        </div>

                        {/* Иконка сообщения (если есть текст) */}
                        {gift.message && (
                          <div className={`
                            absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-20
                            ${isRare ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300'}
                          `}>
                            <MessageCircle size={13} fill="currentColor" fillOpacity={0.2} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ЗАГЛУШКА: показываем только если не идет загрузка */
                !isGiftsLoading && (
                  <div className="text-center py-20 bg-white dark:bg-[#18181b] rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift size={40} className="text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
                    </div>
                    <p className="font-bold text-lg text-zinc-700 dark:text-zinc-300 mb-1">Подарков пока нет</p>
                    <p className="text-sm text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                      {isMyProfile 
                        ? "Здесь будут отображаться подарки, которые вам подарят." 
                        : "Станьте первым, кто порадует пользователя подарком!"}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {showUsersModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowUsersModal(false)}></div>
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[60vh] max-h-[600px] relative z-10 animate-in zoom-in-95">
            
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                {modalUsersType === 'followers' ? 'Подписчики' : 'Подписки'}
              </h2>
              <button onClick={() => setShowUsersModal(false)} className="text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isModalUsersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
              ) : modalUsersList.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Список пуст</div>
              ) : (
                <div className="space-y-1">
                  {modalUsersList.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition">
                      <Link to={`/@${u.handle}`} onClick={() => setShowUsersModal(false)} className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-900 dark:text-white shrink-0 overflow-hidden">
                          {u.avatar_data ? <GraphicRenderer target="avatar_small" mode={u.avatar_mode} data={typeof u.avatar_data === 'string' ? JSON.parse(u.avatar_data) : u.avatar_data} /> : u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <UserName user={u} className_name="text-sm" />
                          <p className="text-xs text-zinc-500 truncate">@{u.handle}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !isVerificationLoading && setShowVerificationModal(false)}></div>
          
          <div className="bg-white dark:bg-[#18181b] w-full max-w-sm rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 relative z-10 animate-in zoom-in-95 duration-300 p-8 text-center">
            
            {/* Блестящая иконка */}
            <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full animate-ping duration-1000"></div>
              <div className="absolute inset-2 bg-blue-500/20 dark:bg-blue-500/20 rounded-full animate-pulse"></div>
              <BadgeCheck size={64} className="text-blue-500 relative z-10 drop-shadow-lg" fill="white" />
            </div>

            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
              Официальный аккаунт
            </h2>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
              Получите синюю галочку рядом с вашим именем. Она подтверждает, что ваш профиль подлинный, повышает доверие аудитории и выделяет вас среди других творцов.
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleRequestVerification}
                disabled={isVerificationLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[14px] uppercase tracking-widest py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerificationLoading ? <Loader2 size={18} className="animate-spin" /> : 'Отправить заявку'}
              </button>
              
              <button 
                onClick={() => setShowVerificationModal(false)}
                disabled={isVerificationLoading}
                className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-[14px] py-4 rounded-full transition-all active:scale-95"
              >
                Отмена
              </button>
            </div>

          </div>
        </div>
      )}

      {editTarget && isMyProfile && (
        <DrawingModal 
          target={editTarget === 'post_graphic' ? 'post' : editTarget} 
          onClose={() => setEditTarget(null)} 
          user={editTarget === 'post_graphic' ? { ...currentUser, isPostGraphic: true, onSaveData: (data) => setPostGraphic(data) } : currentUser} 
        />
      )}

      {/* --- МОДАЛКА: УПРАВЛЕНИЕ ПОДАРКОМ --- */}
      <AnimatePresence>
        {giftActionModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setGiftActionModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setGiftActionModal(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500"><X size={18}/></button>
              
              {/* Динамический градиент и эмодзи */}
              <div className={`bg-gradient-to-b ${giftActionModal.background_css} w-32 h-32 mx-auto rounded-3xl flex items-center justify-center shadow-lg mb-6`}>
                 <img src={giftActionModal.emoji_url} alt="gift" className="w-24 h-24 drop-shadow-xl animate-bounce" />
              </div>
              
              <h3 className="text-xl font-black text-center text-zinc-900 dark:text-white mb-1">{giftActionModal.gift_name}</h3>
              <p className="text-sm text-center text-zinc-500 mb-6">Отправитель: <span className="font-bold text-[#007aff]">@{giftActionModal.sender_handle}</span></p>

              {/* Сообщение */}
              <div className="bg-zinc-50 dark:bg-black/20 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-6">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                  {giftActionModal.message ? `"${giftActionModal.message}"` : "Без пожелания"}
                </p>
              </div>

              {/* Кнопки действий */}
              <div className="space-y-3">
                <button 
                  onClick={() => handleToggleHideGift(giftActionModal.user_gift_id)}
                  className="w-full py-3.5 rounded-2xl font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                >
                  {giftActionModal.is_hidden ? <><Eye size={18} /> Показать в профиле</> : <><EyeOff size={18} /> Скрыть из профиля</>}
                </button>
                
                <button 
                  onClick={() => handleSellGift(giftActionModal.user_gift_id)}
                  className="w-full py-3.5 rounded-2xl font-bold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                >
                  <Coins size={18} /> 
                  Продать за {Math.floor(giftActionModal.price_amount * 0.5)} {giftActionModal.price_currency}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- МОДАЛКА: МАГАЗИН ПОДАРКОВ --- */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl"
          >
            {/* --- ОСНОВНОЙ КОНТЕЙНЕР МАГАЗИНА --- */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full md:h-[85vh] md:max-w-4xl md:rounded-[40px] bg-slate-50 dark:bg-[#0d0d12] border-t md:border border-slate-200 dark:border-white/10 shadow-[0_-20px_80px_-20px_rgba(139,92,246,0.15)] dark:shadow-[0_-20px_80px_-20px_rgba(139,92,246,0.3)] overflow-hidden flex flex-col"
            >
              
              {/* ФОНОВЫЕ ЭФФЕКТЫ (КОСМОС) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] dark:blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-600/10 blur-[80px] dark:blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-10 dark:opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px', color: 'gray' }} />
              </div>

              {/* ХЕДЕР */}
              <div className="relative z-10 flex justify-between items-center px-6 py-6 shrink-0 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-sm">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-500 bg-clip-text text-transparent">Магазин</span> 
                    <span className="text-slate-400 dark:text-white/40 font-light">Подарков</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">Gudex Galactic Store</p>
                </div>
                <button 
                  onClick={() => { setShowGiftModal(false); setSelectedCatalogGift(null); }} 
                  className="w-10 h-10 bg-slate-200/50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full flex items-center justify-center text-slate-700 dark:text-white transition-all active:scale-90 border border-slate-300/50 dark:border-white/10"
                >
                  <X size={20}/>
                </button>
              </div>

              {/* ОСНОВНОЙ КОНТЕНТ */}
              {!selectedCatalogGift ? (
                /* --- ВИТРИНА ПОДАРКОВ --- */
                <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar p-6">
                  
                  {/* БАЛАНС ПЛАНЕТ (КРАСИВЫЙ ПИЛЛ В СТИЛЕ TELEGRAM) */}
                  {myPlanets && (
                    <div className="mb-8 flex flex-wrap gap-2 items-center p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-none">
                      <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-full mb-2 ml-1">Ваша звездная система</p>
                      {Object.entries(myPlanets).filter(([_, v]) => v > 0 || _ === 'saturn').map(([k, v]) => (
                        <div key={k} className="bg-slate-50 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 hover:border-purple-500/50 transition-colors shadow-sm dark:shadow-none">
                          {/* 3D ПЛАНЕТА */}
                          <div className={`w-3 h-3 rounded-full ${planetStyles[k.toLowerCase()] || planetStyles.default}`} />
                          <span className="text-[13px] font-black text-slate-800 dark:text-white">{v} <span className="text-slate-400 dark:text-zinc-500 uppercase text-[10px] ml-1">{k}</span></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {catalog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
                      <p className="text-slate-500 dark:text-zinc-500 font-bold animate-pulse">Синхронизация с орбитой...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10">
                      {catalog.map(item => {
                        const canAfford = myPlanets && myPlanets[item.price_currency] >= item.price_amount;
                        return (
                          <motion.div 
                            whileHover={canAfford ? { y: -5, scale: 1.02 } : {}}
                            whileTap={{ scale: 0.95 }}
                            key={item.id} 
                            onClick={() => canAfford && setSelectedCatalogGift(item)}
                            className={`
                              relative group p-5 rounded-[32px] border transition-all duration-300 flex flex-col items-center
                              ${canAfford 
                                ? 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/5 shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)]' 
                                : 'opacity-50 dark:opacity-40 grayscale cursor-not-allowed border-transparent bg-slate-100 dark:bg-white/[0.01]'
                              }
                            `}
                          >
                            <div className="relative mb-4">
                              <div className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full bg-gradient-to-b ${item.background_css}`} />
                              <img src={item.emoji_url} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10" />
                            </div>
                            
                            <span className="text-[14px] font-black text-slate-800 dark:text-white mb-2 text-center">{item.name}</span>
                            
                            {/* ЦЕННИК */}
                            <div className={`
                              flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter
                              ${canAfford ? 'bg-purple-100 text-purple-600 dark:bg-white/10 dark:text-purple-400' : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500'}
                            `}>
                              <div className={`w-2 h-2 rounded-full ${planetStyles[item.price_currency.toLowerCase()] || planetStyles.default}`} />
                              {item.price_amount} {item.price_currency}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* --- ЭКРАН ОТПРАВКИ (КОНФИРМАЦИЯ) --- */
                <div className="relative z-10 flex-1 flex flex-col overflow-y-auto hide-scrollbar">
                  <div className="p-8 flex flex-col items-center">
                    <button 
                      onClick={() => setSelectedCatalogGift(null)} 
                      className="self-start text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-white text-[11px] font-black uppercase tracking-widest mb-10 flex items-center gap-2 transition-colors"
                    >
                      <ChevronLeft size={16}/> Назад в галактику
                    </button>
                    
                    <div className="relative mb-8">
                      <div className={`absolute inset-0 blur-[40px] dark:blur-[60px] opacity-30 dark:opacity-40 rounded-full bg-gradient-to-b ${selectedCatalogGift.background_css}`} />
                      <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`relative z-10 bg-gradient-to-b ${selectedCatalogGift.background_css} w-40 h-40 md:w-56 md:h-56 rounded-[50px] flex items-center justify-center shadow-xl dark:shadow-2xl`}
                      >
                        <img src={selectedCatalogGift.emoji_url} alt="gift" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
                      </motion.div>
                    </div>

                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedCatalogGift.name}</h4>
                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-slate-500 dark:text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px]">Стоимость:</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${planetStyles[selectedCatalogGift.price_currency.toLowerCase()] || planetStyles.default}`} />
                      <span className="text-slate-700 dark:text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px]">{selectedCatalogGift.price_amount} {selectedCatalogGift.price_currency}</span>
                    </div>

                    <div className="w-full max-w-sm">
                      <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Ваше послание</label>
                      <textarea 
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        maxLength={100}
                        placeholder="Напишите что-то приятное..."
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-5 text-[15px] text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:bg-white/[0.08] transition-all resize-none mb-6 shadow-sm dark:shadow-inner"
                        rows="3"
                      />

                      <button 
                        onClick={handleSendGift}
                        disabled={isSendingGift}
                        className="w-full group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-5 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(124,58,237,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                      >
                        {isSendingGift ? (
                          <Loader2 size={24} className="animate-spin"/>
                        ) : (
                          <>
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                            ОТПРАВИТЬ ПОДАРОК
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* НИЖНИЙ БАР */}
              <div className="relative z-10 px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-100/80 dark:bg-black/20 backdrop-blur-md flex justify-center">
                <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Безопасная транзакция через сеть Good Face</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800">
      <div className="pr-4">
        <p className="font-bold text-zinc-900 dark:text-white text-sm">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SinglePostPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openReportModal } = useOutletContext() || {};
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.goodfaceteam.ru/get_post.php?post_id=${id}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPost(data.post);
        }
      })
      .catch(err => console.error("Ошибка загрузки поста", err))
      .finally(() => setIsLoading(false));
  }, [id, currentUser]);

  const handleEditPost = async (postId, newText) => {
    // Та же логика редактирования, что и в профиле
    await fetch("https://api.goodfaceteam.ru/update_post.php", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ post_id: postId, user_id: currentUser.id, text: newText }),
    });
    setPost({ ...post, text: newText });
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.")) return;
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/delete_post.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include', // <-- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
        body: JSON.stringify({ post_id: postId }) // <-- user_id УБРАЛИ
      });
      const data = await res.json();
      if (data.success) {
        // Убираем пост из ленты моментально
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>;
  }

  if (!post) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <X size={24} />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Пост не найден</h2>
        <p className="text-zinc-500">Возможно, он был удален или вы перешли по неверной ссылке.</p>
        <button onClick={() => navigate('/')} className="mt-6 text-blue-500 font-bold hover:underline">Вернуться в ленту</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <button onClick={() => navigate('/')} className="cursor-pointer mb-6 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
      </button>
      
      {/* Рендерим пост как обычно */}
      <PostItem post={post} currentUser={currentUser} onEdit={handleEditPost} onDelete={handleDeletePost} onLike={() => {}} onReport={() => openReportModal('post', post.id)} />
    </div>
  );
}

function SavedMessagesPage({ currentUser }) {
  const navigate = useNavigate();
  // Получаем дизайн чатов из контекста (те же обои и шрифты)
  const { chatDesign } = useOutletContext() || {};
  const safeDesign = chatDesign || { fontSize: 'medium', wallpaper: 'default', bubbleColor: 'blue' };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Состояния для пересылки
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [myChatsList, setMyChatsList] = useState([]);

  const messagesEndRef = useRef(null);

  // Загрузка данных при входе
  useEffect(() => { 
    fetchSavedMessages(); 
  }, []);

  const fetchSavedMessages = async () => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/get_saved_messages.php", {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (e) { 
      console.error("Ошибка загрузки избранного", e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  // Автопрокрутка вниз
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { 
    if (!isLoading) scrollToBottom(); 
  }, [messages, isLoading, selectedTag]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 150);
  };

  // Сохранение новой заметки
  const handleSaveNote = async () => {
    if (!inputText.trim() || isPublishing) return;
    setIsPublishing(true);

    // Парсим теги из текста
    const tagsFound = inputText.match(/#(\w+|[а-яА-Я0-9_]+)/g);
    const cleanTags = tagsFound ? tagsFound.map(t => t.slice(1)).join(',') : null;
    const textToSend = inputText;
    const replyId = replyingTo?.id;

    try {
      const res = await fetch("https://api.goodfaceteam.ru/save_to_saved.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          content: textToSend, 
          message_type: 'text',
          tags: cleanTags,
          reply_to_id: replyId
        })
      });
      const data = await res.json();
      if (data.success) {
        // Сервер должен вернуть созданный объект
        setMessages(prev => [...prev, data.message]);
        setInputText("");
        setReplyingTo(null);
        setShowEmojiPicker(false);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsPublishing(false); 
    }
  };

  // Удаление из избранного
  const handleDeleteSaved = async (messageId) => {
    // Оптимистично удаляем из UI
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    try {
      await fetch("https://api.goodfaceteam.ru/delete_saved_message.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ message_id: messageId })
      });
    } catch (e) {
      console.error("Ошибка при удалении", e);
    }
  };

  // Логика пересылки
  const loadChatsForForward = () => {
    fetch(`https://api.goodfaceteam.ru/get_chats.php`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) { 
        setMyChatsList(data.chats); 
        setShowForwardModal(true); 
      }
    });
  };

  const confirmForward = async (chat) => {
    if (!forwardMsg) return;

    // Если пересылаем В избранное (самому себе)
    if (chat.is_saved_archive) {
      handleSaveNoteFromForward(forwardMsg);
      return;
    }

    // Если пересылаем В другой чат
    try {
      const res = await fetch("https://api.goodfaceteam.ru/send_message.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          receiver_id: chat.is_group ? null : chat.contact_id,
          chat_id: chat.is_group ? chat.contact_id : null,
          message: forwardMsg.content || forwardMsg.message,
          message_type: forwardMsg.message_type || 'text',
          forward_from_id: currentUser.id
        })
      });
      if (res.ok) {
        setShowForwardModal(false);
        setForwardMsg(null);
        alert("Переслано!");
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveNoteFromForward = async (msg) => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/save_to_saved.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          content: msg.content || msg.message, 
          message_type: msg.message_type || 'text'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setShowForwardModal(false);
        setForwardMsg(null);
      }
    } catch (e) { console.error(e); }
  };

  // --- БЕЗОПАСНАЯ РАБОТА С ТЕГАМИ (ФИКС ОШИБКИ SPLIT) ---
  const allTags = [...new Set(messages.flatMap(m => 
    (m && m.tags && typeof m.tags === 'string') 
      ? m.tags.split(',').filter(t => t.trim() !== "") 
      : []
  ))];

  const filteredMessages = selectedTag 
    ? messages.filter(m => 
        m && typeof m.tags === 'string' && m.tags.split(',').includes(selectedTag)
      )
    : messages;

  if (isLoading) return (
    <div className="flex justify-center py-20 h-[100dvh] items-center">
      <Loader2 className="animate-spin text-zinc-400" size={32} />
    </div>
  );

  const wallpaperStyle = safeDesign.wallpaper !== 'default' 
    ? { backgroundImage: `url(${safeDesign.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  return (
    <div className="flex flex-col h-[100dvh] -mx-6 -my-6 bg-[#ebf0f5] dark:bg-[#0e1621] relative overflow-hidden animate-in fade-in">
      
      {/* Фон чата */}
      <div 
        className={`absolute inset-0 z-0 ${safeDesign.wallpaper === 'default' ? 'telegram-bg dark:opacity-30' : ''}`} 
        style={wallpaperStyle} 
      />

      {/* ШАПКА (Стилизация под ChatWindowPage) */}
      <div className="px-2 py-1.5 bg-white/70 dark:bg-[#1c1c1d]/70 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 z-30 relative min-h-[52px]">
        <div className="flex items-center z-10">
          <button onClick={() => navigate('/chats')} className="text-[#007aff] dark:text-[#32ade6] p-2 hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft size={28} strokeWidth={1.5} />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-[60%] pointer-events-none z-0 mt-0.5">
          <h3 className="font-semibold text-[17px] text-black dark:text-white leading-tight">Избранное</h3>
          <p className="text-[13px] text-[#8e8e93]">Личное хранилище</p>
        </div>

        <div className="flex items-center shrink-0 z-10 pr-1">
          <div className="w-[38px] h-[38px] rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-sm">
            <Bookmark size={20} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ ТЕГОВ (Если они есть) */}
      {allTags.length > 0 && (
        <div className="relative z-20 flex gap-2 overflow-x-auto px-4 py-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border-b border-black/5 hide-scrollbar shrink-0">
          <button 
            onClick={() => setSelectedTag(null)} 
            className={`px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-tight transition-all ${!selectedTag ? 'bg-[#007aff] text-white shadow-md' : 'bg-white/50 dark:bg-zinc-800 text-zinc-500'}`}
          >
            Все
          </button>
          {allTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} 
              className={`px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-tight transition-all ${selectedTag === tag ? 'bg-[#007aff] text-white shadow-md' : 'bg-white/50 dark:bg-zinc-800 text-zinc-500'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* СПИСОК СООБЩЕНИЙ */}
      <div 
        onScroll={handleScroll} 
        className="flex-1 p-4 space-y-1 overflow-y-auto chat-scroll relative z-10"
        style={{ paddingBottom: '100px' }}
      >
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-end gap-1 mb-2 animate-in fade-in slide-in-from-bottom-2">
            <MessageBubble 
              msg={{
                ...msg, 
                message: msg.content,
                reply_message: msg.reply_message,      
                reply_sender_name: msg.reply_sender_name,
                sender_name: currentUser.name, 
                avatar_data: currentUser.avatar_data
              }} 
              isMe={true} 
              isLastInGroup={true}
              isSaved={true} // Передаем флаг, чтобы убрать "Удалить у всех"
              currentUser={currentUser}
              chatDesign={safeDesign}
              onReply={(m) => setReplyingTo(m)}
              onDelete={(id) => handleDeleteSaved(id)}
              onForward={(m) => { setForwardMsg(m); loadChatsForForward(); }}
              onEdit={() => {}} // Заглушка
              onPin={() => {}}  // Заглушка
              onReact={() => {}}
            />
            
            {/* Теги под сообщением */}
            {msg?.tags && typeof msg.tags === 'string' && (
              <div className="flex flex-wrap gap-1 pr-2 mt-[-4px]">
                {msg.tags.split(',').filter(t => t.trim() !== "").map(t => (
                  <span key={t} className="text-[10px] font-black text-[#007aff] dark:text-[#32ade6] uppercase tracking-tighter">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* КНОПКА СКРОЛЛА ВНИЗ */}
      <AnimatePresence>
        {showScrollDown && (
          <div className="absolute bottom-[100px] right-6 z-40">
            <button 
              onClick={scrollToBottom} 
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl flex items-center justify-center text-zinc-500 border border-black/5 shadow-md active:scale-95 transition-transform"
            >
              <ChevronDown size={26} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* ПАНЕЛЬ ВВОДА */}
      <div className="shrink-0 relative z-30 pb-safe w-full">
        {/* ПРЕВЬЮ ОТВЕТА */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: 10 }} 
              animate={{ height: 'auto', opacity: 1, y: 0 }} 
              exit={{ height: 0, opacity: 0, y: 10 }} 
              className="max-w-4xl mx-auto px-[25px] mb-2"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1c1c1e] rounded-[18px] shadow-sm border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-[3px] h-8 bg-[#007aff] rounded-full"></div>
                  <div className="min-w-0 flex flex-col">
                    <p className="text-[13px] font-bold text-[#007aff] leading-tight mb-0.5">{replyingTo.sender_name}</p>
                    <p className="text-[14px] text-zinc-500 dark:text-[#8e8e93] truncate leading-tight">{replyingTo.message}</p>
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-[#8e8e93] p-1.5 bg-black/5 dark:bg-white/5 rounded-full ml-2">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ГЛАВНЫЙ ИНПУТ */}
        <div className="flex items-end gap-1.5 max-w-4xl mx-auto w-full px-[25px] pb-[25px]">
           <button className="w-[38px] h-[38px] mb-[1px] shrink-0 rounded-full bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-zinc-500 shadow-sm transition-colors active:bg-zinc-100">
             <Paperclip size={22} strokeWidth={1.5} className="-rotate-45" />
           </button>
           
           <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-[20px] flex items-end shadow-sm overflow-hidden border border-black/5 dark:border-white/5">
             <textarea 
               value={inputText} 
               onChange={(e) => setInputText(e.target.value)} 
               onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveNote(); } }} 
               placeholder="Заметка или #тег..." 
               className="flex-1 bg-transparent resize-none outline-none text-[16px] pl-4 pr-1 py-[9px] text-black dark:text-white max-h-32 hide-scrollbar" 
               rows="1" 
             />
             <button 
               onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
               className="p-2 mb-[1px] text-zinc-400 hover:text-[#007aff] transition-colors"
             >
               {showEmojiPicker ? <Keyboard size={24} strokeWidth={1.5} /> : <Sticker size={24} strokeWidth={1.5} />}
             </button>
           </div>

           <button 
             onClick={handleSaveNote} 
             disabled={!inputText.trim() || isPublishing} 
             className={`w-[38px] h-[38px] mb-[1px] rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${inputText.trim() ? 'bg-[#007aff] text-white' : 'bg-white dark:bg-[#1c1c1e] text-zinc-500'}`}
           >
             {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px] translate-y-[1px]" />}
           </button>
        </div>

        {/* ЭМОДЗИ ПАНЕЛЬ */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: 350 }} 
              exit={{ height: 0 }} 
              className="bg-white dark:bg-[#1c1c1d] border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <EmojiPicker 
                emojiStyle="apple" 
                onEmojiClick={(e) => setInputText(p => p + e.emoji)}
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                width="100%" height="100%"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* МОДАЛКА ПЕРЕСЫЛКИ */}
      <AnimatePresence>
        {showForwardModal && (
          <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1c1c1d] w-full max-w-sm rounded-[24px] flex flex-col max-h-[80vh] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-black dark:text-white">Переслать сообщение</h3>
                <button onClick={() => setShowForwardModal(false)}><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
                {/* Пункт Избранное в списке пересылки */}
                <div 
                  onClick={() => confirmForward({ is_saved_archive: true })} 
                  className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors border-b border-black/5 dark:border-white/5 mb-1"
                >
                  <div className="w-12 h-12 bg-[#007aff] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Bookmark size={24} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black dark:text-white">Избранное</p>
                    <p className="text-xs text-[#007aff] font-medium">Ваше личное облако</p>
                  </div>
                </div>

                {myChatsList.map(chat => (
                  <div 
                    key={chat.contact_id} 
                    onClick={() => confirmForward(chat)} 
                    className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {chat.avatar_data ? (
                         <GraphicRenderer target="avatar_small" data={typeof chat.avatar_data === 'string' ? JSON.parse(chat.avatar_data) : chat.avatar_data} />
                      ) : chat.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black dark:text-white truncate">{chat.name}</p>
                      <p className="text-xs text-zinc-500">{chat.is_group ? 'Группа' : 'Личный чат'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ChatsListPage({ currentUser }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- СТЕЙТЫ ДЛЯ ГРУПП И ПОИСКА ---
  const [searchMode, setSearchMode] = useState('local'); // 'local' (Мои чаты) или 'global' (Глобальный поиск)
  const [globalResults, setGlobalResults] = useState([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);

  // Стейты для создания чата/канала
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ type: 'group', name: '', description: '', isPrivate: false });
  const [isCreating, setIsCreating] = useState(false);

  const [activeFolder, setActiveFolder] = useState('all');

  const folders = [
    { id: 'all', label: 'Все' },
    { id: 'personal', label: 'Личные' },
    { id: 'groups', label: 'Группы' },
    { id: 'archive', label: 'Архив', icon: Archive }, 
  ];

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [orderedChats, setOrderedChats] = useState([]);

  const checkIsBirthday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  // Фильтруем чаты, чтобы найти сегодняшних именинников (с учетом приватности и взаимной подписки)
  const birthdayChats = chats.filter(chat => {
    if (chat.is_group || !chat.partner_birthday) return false;
    if (!checkIsBirthday(chat.partner_birthday)) return false;
    
    const priv = chat.partner_privacy_birthday;
    if (priv === 'nobody') return false;
    // Если "только подписчики", а мы не подписаны - пропускаем
    // (предполагаем, что у вас в объекте чата есть флаги подписки. Если их нет, можно упростить проверку).
    
    return true; 
  });

  // 1. При загрузке чатов — сортируем их согласно сохраненному порядку
  useEffect(() => {
    if (chats.length > 0) {
      const currentFiltered = chats.filter(chat => {
        if (activeFolder === 'archive') return chat.is_archived;
        if (chat.is_archived) return false;
        if (activeFolder === 'personal' && chat.is_group) return false;
        if (activeFolder === 'groups' && !chat.is_group) return false;
        return chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               (chat.handle && chat.handle.toLowerCase().includes(searchQuery.toLowerCase()));
      });

      const savedOrder = localStorage.getItem('gudex_chats_order');
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);
        const finalSorted = [...currentFiltered].sort((a, b) => {
          // 1. АБСОЛЮТНЫЙ ПРИОРИТЕТ ЗАКРЕПОВ
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;

          // 2. ЗАТЕМ ПРОВЕРЯЕМ РУЧНУЮ СОРТИРОВКУ
          const indexA = orderIds.indexOf(a.contact_id);
          const indexB = orderIds.indexOf(b.contact_id);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          // 3. ЕСЛИ НЕТ В СОХРАНЕНИЯХ - ПО ДАТЕ
          return new Date(b.last_time) - new Date(a.last_time);
        });
        setOrderedChats(finalSorted);
      } else {
        const defaultSorted = [...currentFiltered].sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.last_time) - new Date(a.last_time);
        });
        setOrderedChats(defaultSorted);
      }
    } else {
      setOrderedChats([]);
    }
  }, [chats, activeFolder, searchQuery]);

  // 2. При изменении порядка вручную — сохраняем в LocalStorage
  const handleReorder = (newOrder) => {
    setOrderedChats(newOrder);
    const orderIds = newOrder.map(c => c.contact_id);
    localStorage.setItem('gudex_chats_order', JSON.stringify(orderIds));
  };

  // --- МАССОВЫЕ ДЕЙСТВИЯ (РЕЖИМ ВЫДЕЛЕНИЯ) ---
  const toggleSelection = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleMultiArchive = () => {
    const updatedChats = chats.map(c => selectedChats.includes(c.contact_id) ? { ...c, is_archived: true, is_pinned: false } : c);
    setChats(updatedChats);
    saveLocalState(updatedChats);
    setIsSelectMode(false);
    setSelectedChats([]);
  };

  const handleMultiDelete = async () => {
    setIsActionLoading(true);
    try {
      const chatsToDelete = selectedChats.map(id => {
        const chat = chats.find(c => c.contact_id === id);
        return { partner_id: chat.is_group ? null : chat.contact_id, room_id: chat.is_group ? chat.contact_id : null };
      });

      const res = await fetch("https://api.goodfaceteam.ru/clear_chat.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ chats: chatsToDelete, for_everyone: deleteForBoth ? 1 : 0 })
      });
      const data = await res.json();

      if (data.success) {
        const remainingChats = chats.filter(c => !selectedChats.includes(c.contact_id));
        setChats(remainingChats);
        saveLocalState(remainingChats);
        setIsSelectMode(false);
        setSelectedChats([]);
        setShowMultiDeleteModal(false);
      } else {
        alert(data.message);
      }
    } catch (e) { console.error(e); } finally { setIsActionLoading(false); }
  };

  // --- СТЕЙТЫ ДЛЯ КОНТЕКСТНОГО МЕНЮ (ПК) ---
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chat: null });

  // --- СТЕЙТЫ ДЛЯ СВАЙПА (Мобилки) ---
  const [swipedChatId, setSwipedChatId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  const saveLocalState = (updatedChats) => {
    const pinnedIds = updatedChats.filter(c => c.is_pinned).map(c => c.contact_id);
    const archivedIds = updatedChats.filter(c => c.is_archived).map(c => c.contact_id);
    localStorage.setItem('gudex_pinned_chats', JSON.stringify(pinnedIds));
    localStorage.setItem('gudex_archived_chats', JSON.stringify(archivedIds));
  };

  const unescapeHtml = (safe) => {
    if (!safe) return "";
    return safe
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  // Загрузка моих чатов
  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.goodfaceteam.ru/get_chats.php`, { 
          credentials: 'include', 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } 
        });
        const data = await res.json();
        
        if (data.success) {
          const pinsStore = localStorage.getItem('gudex_pinned_chats');
          const archivesStore = localStorage.getItem('gudex_archived_chats');
          const savedPins = pinsStore ? JSON.parse(pinsStore) : [];
          const savedArchives = archivesStore ? JSON.parse(archivesStore) : [];

          const processedChats = data.chats.map(chat => {
            let displayMsg = unescapeHtml(chat.last_message);
            let msgType = chat.message_type || 'text'; // Если бэкенд уже отдает этот параметр
            
            if (displayMsg && displayMsg.startsWith('{"content":')) {
              displayMsg = "🔐 Зашифрованное сообщение";
              msgType = 'encrypted';
            } else if (displayMsg && displayMsg.startsWith('http') && msgType === 'text') {
              if (displayMsg.match(/\.(webp)$/i)) msgType = 'sticker';
              else if (displayMsg.match(/\.(gif|mp4)$/i)) msgType = 'gif';
              else if (displayMsg.match(/\.(jpeg|jpg|png|svg)$/i) || displayMsg.includes('ibb.co')) msgType = 'image';
              else if (displayMsg.includes('cloudinary.com')) msgType = 'voice'; // ДОБАВИЛИ ГОЛОСОВЫЕ
            } else if (['missed', 'declined', 'ended'].includes(displayMsg) || msgType === 'call') {
              msgType = 'call'; // ДОБАВИЛИ ЗВОНКИ
            }
            
            return { 
              ...chat, 
              last_message: displayMsg,
              message_type: msgType, // Сохраняем тип сообщения для рендера
              is_archived: archivesStore ? savedArchives.includes(chat.contact_id) : (chat.is_archived || false),
              is_pinned: pinsStore ? savedPins.includes(chat.contact_id) : (chat.is_pinned || false)
            };
          });

          setChats(processedChats.filter(chat => chat.contact_id !== currentUser.id));
        }
      } catch (err) {
        console.error("Ошибка загрузки чатов", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [currentUser]);

  // Закрытие контекстного меню при клике
  useEffect(() => {
    const closeMenu = () => setContextMenu({ visible: false, x: 0, y: 0, chat: null });
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Глобальный поиск
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsGlobalSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.goodfaceteam.ru/search_global_chats.php?q=${encodeURIComponent(searchQuery)}`, { 
            credentials: 'include', 
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            } 
          });
          const data = await res.json();
          if (data.success) setGlobalResults(data.results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGlobalSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setGlobalResults([]);
    }
  }, [searchQuery]);

  // --- ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ---
  const filteredChats = chats.filter(chat => {
    if (activeFolder === 'archive') {
      if (!chat.is_archived) return false;
    } else {
      if (chat.is_archived) return false; 
    }

    if (activeFolder === 'personal' && chat.is_group) return false;
    if (activeFolder === 'groups' && !chat.is_group) return false;

    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (chat.handle && chat.handle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_time) - new Date(a.last_time);
  });

  const showSavedMessages = searchMode === 'local' && activeFolder !== 'archive' && (searchQuery === '' || "избранное".includes(searchQuery.toLowerCase()));

  // --- ФУНКЦИИ ДЕЙСТВИЙ (Архив, Закреп, Прочитано) ---
  const handleToggleArchive = (chatId) => {
    const updatedChats = chats.map(c => c.contact_id === chatId ? { ...c, is_archived: !c.is_archived, is_pinned: false } : c);
    setChats(updatedChats);
    saveLocalState(updatedChats);
    setSwipedChatId(null);
  };

  const handleTogglePin = (chatId) => {
    const targetChat = chats.find(c => c.contact_id === chatId);
    
    // Проверка лимита в 4 закрепленных чата
    if (targetChat && !targetChat.is_pinned) {
      const currentPinnedCount = chats.filter(c => c.is_pinned).length;
      if (currentPinnedCount >= 4) {
        alert("Вы не можете закрепить больше 4 чатов.");
        setSwipedChatId(null);
        return;
      }
    }

    const updatedChats = chats.map(c => c.contact_id === chatId ? { ...c, is_pinned: !c.is_pinned } : c);
    setChats(updatedChats);
    saveLocalState(updatedChats);
    setSwipedChatId(null);
  };

  const handleMarkRead = (chatId) => {
    setChats(chats.map(c => c.contact_id === chatId ? { ...c, unread_count: 0 } : c));
    setSwipedChatId(null);
  };

  // --- ОБРАБОТЧИКИ СВАЙПА (ТОЛЬКО ДЛЯ TOUCH) ---
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e, chatId) => {
    if (!touchStartX) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;

    if (diff > 40) {
      setSwipedChatId(chatId);
    } else if (diff < -40 && swipedChatId === chatId) {
      setSwipedChatId(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  // --- ОБРАБОТЧИК ПРАВОЙ КНОПКИ МЫШИ (ПК) ---
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    let x = e.pageX;
    let y = e.pageY;
    if (window.innerWidth - x < 200) x -= 200; 
    
    setContextMenu({ visible: true, x, y, chat });
    setSwipedChatId(null); 
  };

  const handleCreateRoom = async () => {
    if (!createData.name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/create_chat_room.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ ...createData })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateData({ type: 'group', name: '', description: '', isPrivate: false });
        navigate(`/chat/room_${data.room_id}`);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  // Функция для формата времени как в ТГ (например: 15:05 или пн, ср)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
      const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      return days[date.getDay()];
    }
  };

  const pinnedChats = orderedChats.filter(c => c.is_pinned);
  const unpinnedChats = orderedChats.filter(c => !c.is_pinned);

  const renderChatItem = (chat) => {
    const isSelected = selectedChats.includes(chat.contact_id);
    const isSwiped = swipedChatId === chat.contact_id;
    
    return (
      <Reorder.Item 
        key={chat.contact_id} 
        value={chat}
        dragListener={isSelectMode} 
        className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 touch-none"
      >
        <div className="absolute inset-0 flex items-center justify-end z-0">
          <button onClick={() => { setSelectedChats([chat.contact_id]); setShowMultiDeleteModal(true); setSwipedChatId(null); }} className="w-[74px] h-full bg-[#ff3b30] flex flex-col items-center justify-center text-white active:opacity-80 transition-opacity">
            <Trash2 size={26} className="mb-1" />
            <span className="text-[11px] font-medium">Удалить</span>
          </button>
          <button onClick={() => handleTogglePin(chat.contact_id)} className="w-[74px] h-full bg-[#ff9500] flex flex-col items-center justify-center text-white active:opacity-80 transition-opacity">
            <Pin size={26} className="mb-1" />
            <span className="text-[11px] font-medium">{chat.is_pinned ? 'Открепить' : 'Закрепить'}</span>
          </button>
          <button onClick={() => handleToggleArchive(chat.contact_id)} className="w-[74px] h-full bg-[#007aff] flex flex-col items-center justify-center text-white active:opacity-80 transition-opacity">
            <Archive size={26} className="mb-1" />
            <span className="text-[11px] font-medium">{chat.is_archived ? 'Вернуть' : 'В архив'}</span>
          </button>
        </div>

        <motion.div
          className={`relative w-full bg-white dark:bg-[#121212] z-10 flex items-center min-h-[72px] ${chat.is_pinned && !isSelectMode ? '!bg-zinc-50 dark:!bg-[#161618]' : ''}`}
          animate={{ x: isSwiped ? -222 : 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onContextMenu={(e) => handleContextMenu(e, chat)}
        >
          <div 
            className="w-full flex items-center border-b border-zinc-100 dark:border-zinc-800/60 gap-3 p-2 px-4 select-none cursor-pointer relative overflow-hidden hover:bg-zinc-50 dark:hover:bg-[#1c1c1e] transition-colors"
            onClick={() => isSelectMode ? toggleSelection(chat.contact_id) : navigate(`/chat/@${chat.handle}`)}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e, chat.contact_id)}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => handleContextMenu(e, chat)}
          >
            <motion.div className="flex items-center flex-1 min-w-0 gap-3" animate={{ x: isSelectMode ? 44 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="absolute left-[-44px] w-10 flex items-center justify-center h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(chat.contact_id); }}>
                {isSelected ? <CheckCircle2 size={22} className="text-[#007aff]" fill="currentColor" stroke="white" /> : <Circle size={22} className="text-zinc-300 dark:text-zinc-600" />}
              </div>

              <div className="w-[54px] h-[54px] bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                {chat.avatar_data ? (
                  <GraphicRenderer target="avatar_small" mode={chat.avatar_mode} data={typeof chat.avatar_data === 'string' ? JSON.parse(chat.avatar_data) : chat.avatar_data} />
                ) : chat.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-baseline mb-[2px]">
                  <h4 className="font-semibold text-[16px] text-black dark:text-white truncate pr-10">
                    {chat.name}
                    {chat.is_group && <Users size={12} className="text-zinc-400 ml-1 inline" />}
                  </h4>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-[15px] text-[#8e8e93] truncate leading-tight pr-10 flex items-center gap-1">
                    {chat.sender_id === currentUser.id && <span className="text-black dark:text-white shrink-0">Вы: </span>}
                    
                    {chat.message_type === 'sticker' ? (
                      <span className="flex items-center gap-1 text-[#007aff] font-medium"><Sticker size={15} /> Стикер</span>
                    ) : chat.message_type === 'gif' ? (
                      <span className="flex items-center gap-1 text-[#007aff] font-medium"><Film size={15} /> GIF</span>
                    ) : chat.message_type === 'image' ? (
                      <span className="flex items-center gap-1 text-[#007aff] font-medium"><Camera size={15} /> Фото</span>
                    ) : chat.message_type === 'voice' ? (
                      <span className="flex items-center gap-1 text-[#007aff] font-medium"><Mic size={15} /> Голосовое</span>
                    ) : chat.message_type === 'call' ? (
                      <span className={`flex items-center gap-1 font-medium ${chat.last_message === 'missed' && chat.sender_id !== currentUser.id ? 'text-[#ff3b30]' : 'text-[#8e8e93]'}`}>
                        {(chat.last_message === 'missed' || chat.last_message === 'declined') ? <PhoneOff size={15} /> : <Phone size={15} />}
                        {chat.last_message === 'missed' ? 'Пропущенный звонок' : chat.last_message === 'declined' ? 'Отклоненный звонок' : 'Звонок'}
                      </span>
                    ) : (
                      <span className="truncate">{chat.last_message}</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1 z-20">
              <AnimatePresence mode="wait">
                {isSelectMode ? (
                  <motion.div key="drag" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <GripVertical size={20} className="text-zinc-400" />
                  </motion.div>
                ) : (
                  <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {chat.sender_id === currentUser.id && (
                        chat.status === 'scheduled' ? (
                          <Clock size={14} className="text-[#8e8e93]" />
                        ) : chat.unread_count === 0 ? (
                          <CheckCheck size={14} className="text-[#32ade6]" />
                        ) : (
                          <Check size={14} className="text-[#8e8e93]" />
                        )
                      )}
                      <span className="text-[13px] text-[#8e8e93]">{formatTime(chat.last_time)}</span>
                    </div>
                    {chat.unread_count > 0 ? (
                      <div className={`text-white text-[12px] font-bold px-[6px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center ${chat.is_muted ? 'bg-[#8e8e93]' : 'bg-[#007aff] dark:bg-[#32ade6]'}`}>
                        {chat.unread_count}
                      </div>
                    ) : chat.is_pinned && (
                      <Pin size={16} className="text-[#8e8e93] rotate-45" fill="currentColor" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Reorder.Item>
    );
  };

  return (
    // ИСПРАВЛЕНИЕ ОТСТУПОВ: Для мобилок растягиваем на весь экран (-mx-6 -my-6), для ПК возвращаем дефолтные отступы
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col h-[calc(100vh)] -mx-6 -my-6">
      
      {/* Шапка для ПК */}
      <div className="hidden md:flex justify-between items-center mb-6 pt-4 px-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {isSelectMode ? `Выбрано: ${selectedChats.length}` : 'Чаты'}
        </h2>
        <button 
          onClick={() => { setIsSelectMode(!isSelectMode); setSelectedChats([]); }} 
          className="text-[15px] text-blue-500 font-medium hover:underline cursor-pointer"
        >
          {isSelectMode ? 'Отмена' : 'Выбрать'}
        </button>
      </div>
      
      {/* Шапка для мобилки (в стиле ТГ: Кнопки сверху) */}
      <div className="md:hidden flex justify-between items-center px-4 pt-4 pb-2 bg-white dark:bg-[#121212] sticky top-0 z-40 shrink-0">
        <button 
          onClick={() => { setIsSelectMode(!isSelectMode); setSelectedChats([]); }} 
          className="text-[17px] text-blue-500 font-medium transition-opacity active:opacity-70"
        >
          {isSelectMode ? 'Отмена' : 'Изм.'}
        </button>
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 rounded-lg p-0.5">
           <div className="bg-white dark:bg-[#313131] shadow-sm rounded-md px-4 py-1 text-[13px] font-semibold text-black dark:text-white">
             {isSelectMode ? `Выбрано: ${selectedChats.length}` : 'Чаты'}
           </div>
        </div>
        <div className="flex items-center gap-4 text-blue-500">
           {!isSelectMode && <Edit2 size={20} strokeWidth={1.5} onClick={() => setShowCreateMenu(!showCreateMenu)} />}
        </div>
      </div>

      {/* Строка поиска (Скрываем при выделении) */}
      <div className="px-4 mb-2 mt-2 md:mb-6 md:px-6 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск" 
            className="w-full bg-zinc-100 dark:bg-[#1c1c1e] border-none px-10 py-2 rounded-[10px] text-[16px] focus:ring-0 outline-none text-zinc-900 dark:text-white transition-all placeholder:text-zinc-500"
          />
          {isGlobalSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" size={18} />}
        </div>
      </div>

      {/* --- БАННЕРЫ ДНЕЙ РОЖДЕНИЯ --- */}
      {birthdayChats.length > 0 && searchQuery === '' && (
        <div className="px-4 md:px-6 mb-2 flex flex-col gap-2 shrink-0">
          {birthdayChats.map(chat => (
            <div key={`bday-${chat.contact_id}`} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-white/20 p-2 rounded-full shrink-0"><Cake size={24} /></div>
                <div className="min-w-0">
                  <p className="font-bold text-[15px] truncate">{chat.name} празднует день рождения!</p>
                </div>
              </div>
              <Link to={`/chat/@${chat.handle}`} className="bg-white text-purple-600 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-sm ml-2">
                Поздравить
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* --- СПИСОК ЧАТОВ --- */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar bg-white dark:bg-[#121212] relative flex flex-col w-full ${isSelectMode ? 'pb-[140px]' : 'pb-[100px] md:pb-0'}`}>
        
        {isLoading ? ( 
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" size={32} /></div> 
        ) : chats.length === 0 && searchQuery === '' ? (
          <div className="text-center py-16 text-zinc-400">
            <MessageCircle size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">У вас пока нет диалогов</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#121212] md:dark:bg-transparent w-full flex flex-col h-full">
            
            {/* ПАПКИ (Скрываем при поиске) */}
            {searchQuery === '' && (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-6 mb-2 bg-white dark:bg-[#121212] md:dark:bg-transparent border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
                {folders.map(f => {
                  const unreadInFolder = chats.filter(c => {
                    if (f.id === 'archive' && c.is_archived && c.unread_count > 0) return true;
                    if (f.id !== 'archive' && !c.is_archived) {
                      if (f.id === 'all' && c.unread_count > 0) return true;
                      if (f.id === 'personal' && !c.is_group && c.unread_count > 0) return true;
                      if (f.id === 'groups' && c.is_group && c.unread_count > 0) return true;
                    }
                    return false;
                  }).length;

                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFolder(f.id)}
                      className={`cursor-pointer flex items-center gap-1.5 pb-2 pt-1 text-[15px] font-medium whitespace-nowrap transition-colors relative ${
                        activeFolder === f.id 
                          ? 'text-blue-500' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {f.label}
                      {unreadInFolder > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeFolder === f.id ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                          {unreadInFolder}
                        </span>
                      )}
                      {activeFolder === f.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ЛОКАЛЬНЫЕ ЧАТЫ */}
            {sortedChats.length === 0 && !showSavedMessages ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#8e8e93] text-[15px]">
                <p>{searchQuery !== '' ? 'В ваших чатах ничего не найдено' : 'В этой папке пусто'}</p>
              </div>
            ) : (
              <div className="overflow-hidden w-full pb-4">
                {/* ИЗБРАННОЕ */}
                {showSavedMessages && (
                  <div className="relative w-full">
                    <div className="absolute left-[76px] right-0 bottom-0 border-b border-zinc-100 dark:border-zinc-800/60 pointer-events-none"></div>
                    {/* Теперь ведем на специальный роут /saved */}
                    <Link to="/saved" className="flex items-center gap-3 p-2 px-4 hover:bg-zinc-50 dark:hover:bg-[#1c1c1e] transition-colors w-full">
                      <div className="w-[54px] h-[54px] bg-[#007aff] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Bookmark size={26} fill="currentColor" strokeWidth={1} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-[16px] text-black dark:text-white truncate">Избранное</h4>
                        </div>
                        <p className="text-[15px] text-[#8e8e93] truncate">Облачное хранилище</p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* ГРУППА 1: ЗАКРЕПЛЕННЫЕ ЧАТЫ */}
                {pinnedChats.length > 0 && (
                  <Reorder.Group 
                    axis="y" 
                    values={pinnedChats} 
                    onReorder={(newPinned) => {
                      const newOrder = [...newPinned, ...unpinnedChats];
                      setOrderedChats(newOrder);
                      localStorage.setItem('gudex_chats_order', JSON.stringify(newOrder.map(c => c.contact_id)));
                    }}
                    className="w-full"
                  >
                    {pinnedChats.map(renderChatItem)}
                  </Reorder.Group>
                )}

                {/* ГРУППА 2: ОБЫЧНЫЕ ЧАТЫ */}
                {unpinnedChats.length > 0 && (
                  <Reorder.Group 
                    axis="y" 
                    values={unpinnedChats} 
                    onReorder={(newUnpinned) => {
                      const newOrder = [...pinnedChats, ...newUnpinned];
                      setOrderedChats(newOrder);
                      localStorage.setItem('gudex_chats_order', JSON.stringify(newOrder.map(c => c.contact_id)));
                    }}
                    className="w-full"
                  >
                    {unpinnedChats.map(renderChatItem)}
                  </Reorder.Group>
                )}
              </div>
            )}

            {/* ГЛОБАЛЬНЫЙ ПОИСК (Только если есть текст в поиске) */}
            {searchQuery.trim().length > 1 && (
              <div className="pb-8 pt-2">
                <h3 className="px-4 md:px-6 text-[12px] font-bold text-[#8e8e93] uppercase tracking-widest mb-2">Глобальный поиск</h3>
                {isGlobalSearching ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-zinc-400" /></div>
                ) : globalResults.length === 0 ? (
                  <div className="text-center py-4 text-[#8e8e93] text-[14px]">В глобальном поиске ничего не найдено</div>
                ) : (
                  globalResults.map((room) => (
                    <div key={room.id} className="relative w-full">
                      <div className="absolute left-[76px] right-0 bottom-0 border-b border-zinc-100 dark:border-zinc-800/60 pointer-events-none"></div>
                      <Link to={`/chat/room_${room.id}`} className="w-full flex items-center gap-3 p-2 px-4 hover:bg-zinc-50 dark:hover:bg-[#1c1c1e] transition-colors">
                        <div className="w-[54px] h-[54px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center font-bold shrink-0">
                          {room.type === 'channel' ? <Megaphone size={24} /> : <Users size={24} />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="font-semibold text-[16px] text-black dark:text-white truncate flex items-center gap-1.5 mb-[2px]">
                            {room.name}
                            {room.is_private === 1 && <Lock size={12} className="text-[#8e8e93]" />}
                          </h4>
                          <p className="text-[15px] text-[#8e8e93] truncate">{room.type === 'channel' ? 'Канал' : 'Группа'} • {room.members_count} участников</p>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* --- КНОПКА ПЛЮСИК (FAB) И МЕНЮ СОЗДАНИЯ --- */}
      <div className="fixed bottom-[90px] right-4 md:absolute md:bottom-6 md:right-6 z-40">
        <AnimatePresence>
          {showCreateMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-4 w-56 bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden py-1 origin-bottom-right"
            >
              <button onClick={() => { setCreateData({ type: 'group', isPrivate: false, name: '', description: '' }); setShowCreateModal(true); setShowCreateMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer">
                <Users size={20} className="text-blue-500" /> Создать группу
              </button>
              <button onClick={() => { setCreateData({ type: 'group', isPrivate: true, name: '', description: '' }); setShowCreateModal(true); setShowCreateMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer">
                <Lock size={20} className="text-orange-500" /> Частная группа
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className={`w-[54px] h-[54px] bg-[#007aff] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 cursor-pointer ${showCreateMenu ? 'rotate-45 bg-zinc-800' : ''}`}
        >
          {showCreateMenu ? <Plus size={28} /> : <Edit2 size={24} />}
        </button>
      </div>

      {/* --- МОДАЛКА СОЗДАНИЯ --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"><X size={20}/></button>
            
            <h3 className="text-xl font-bold text-black dark:text-white leading-tight mb-4">
              {createData.isPrivate ? 'Частная группа' : 'Новая группа'}
            </h3>

            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={createData.name}
                  onChange={(e) => setCreateData({...createData, name: e.target.value})}
                  placeholder="Название группы" 
                  className="w-full bg-zinc-100 dark:bg-[#121212] border border-transparent dark:border-zinc-800 px-4 py-3.5 rounded-xl text-[16px] text-black dark:text-white outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
              <div>
                <textarea 
                  value={createData.description}
                  onChange={(e) => setCreateData({...createData, description: e.target.value})}
                  placeholder="Описание (необязательно)" 
                  className="w-full bg-zinc-100 dark:bg-[#121212] border border-transparent dark:border-zinc-800 px-4 py-3.5 rounded-xl text-[16px] text-black dark:text-white outline-none focus:border-[#007aff] transition-colors resize-none"
                  rows="2"
                />
              </div>

              <button 
                onClick={handleCreateRoom}
                disabled={isCreating || !createData.name.trim()}
                className="cursor-pointer w-full mt-2 bg-[#007aff] text-white font-semibold text-[16px] py-3.5 rounded-xl transition-all active:opacity-80 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={20} className="animate-spin" /> : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- КОНТЕКСТНОЕ МЕНЮ (ДЛЯ ПК) --- */}
      {contextMenu.visible && contextMenu.chat && (
        <div 
          className="fixed z-[100000] w-56 bg-white/95 dark:bg-[#212121]/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800/80 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 mb-1">
            <p className="font-semibold text-[14px] text-black dark:text-white truncate">{contextMenu.chat.name}</p>
          </div>

          <button onClick={() => { setIsSelectMode(true); setSelectedChats([contextMenu.chat.contact_id]); setContextMenu({visible: false}); }} className="w-full px-4 py-2.5 flex items-center gap-4 text-[15px] font-medium text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left">
            <CheckCircle2 size={18} className="text-zinc-400" /> Выбрать
          </button>
          
          <button 
            onClick={() => { handleMarkRead(contextMenu.chat.contact_id); setContextMenu({visible: false}); }}
            className="w-full px-4 py-2.5 flex items-center gap-4 text-[15px] font-medium text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
          >
            <CheckCheck size={18} className="text-[#007aff]" /> Отметить прочитанным
          </button>

          <button 
            onClick={() => { handleTogglePin(contextMenu.chat.contact_id); setContextMenu({visible: false}); }}
            className="w-full px-4 py-2.5 flex items-center gap-4 text-[15px] font-medium text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
          >
            <Pin size={18} className="text-[#34c759]" /> {contextMenu.chat.is_pinned ? 'Открепить' : 'Закрепить'}
          </button>

          <button 
            onClick={() => { handleToggleArchive(contextMenu.chat.contact_id); setContextMenu({visible: false}); }}
            className="w-full px-4 py-2.5 flex items-center gap-4 text-[15px] font-medium text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-left"
          >
            <Archive size={18} className="text-[#ff3b30]" /> {contextMenu.chat.is_archived ? 'Вернуть из архива' : 'Убрать в архив'}
          </button>
        </div>
      )}
          <AnimatePresence>
        {isSelectMode && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-[80px] md:bottom-0 left-0 right-0 md:left-6 md:right-6 z-50 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <button onClick={handleMultiArchive} disabled={selectedChats.length === 0} className="flex flex-col items-center gap-1 disabled:opacity-50 text-black dark:text-white transition-opacity active:opacity-70">
              <Archive size={24} className="text-[#007aff]" />
              <span className="text-[12px] font-medium">В архив</span>
            </button>
            <button onClick={() => setShowMultiDeleteModal(true)} disabled={selectedChats.length === 0} className="flex flex-col items-center gap-1 disabled:opacity-50 text-[#ff3b30] transition-opacity active:opacity-70">
              <Trash2 size={24} />
              <span className="text-[12px] font-medium">Удалить</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- МОДАЛКА УДАЛЕНИЯ ВЫБРАННЫХ ЧАТОВ --- */}
      <AnimatePresence>
        {showMultiDeleteModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[18px] font-bold text-center text-black dark:text-white mb-2">Удалить {selectedChats.length} чат(ов)?</h3>
              <p className="text-[14px] text-center text-[#8e8e93] mb-6">История сообщений будет очищена. Это действие нельзя отменить.</p>
              
              {selectedChats.some(id => !chats.find(c => c.contact_id === id)?.is_group) && (
                <label className="flex items-center gap-3 mb-6 cursor-pointer bg-zinc-50 dark:bg-[#121212] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <input type="checkbox" checked={deleteForBoth} onChange={e => setDeleteForBoth(e.target.checked)} className="w-5 h-5 rounded border-zinc-300 text-red-500 focus:ring-red-500 dark:border-zinc-600 dark:bg-[#121212]" />
                  <span className="text-[14px] font-medium text-black dark:text-white">Также удалить для собеседников</span>
                </label>
              )}
              
              <div className="flex flex-col gap-2">
                <button onClick={handleMultiDelete} disabled={isActionLoading} className="w-full py-3.5 rounded-xl font-bold text-white bg-[#ff3b30] hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  {isActionLoading && <Loader2 size={16} className="animate-spin" />} Удалить
                </button>
                <button onClick={() => setShowMultiDeleteModal(false)} disabled={isActionLoading} className="w-full py-3.5 rounded-xl font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VoicePlayer({ url, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio(url));

  // Генерируем "волну" (waveform) из 25 столбцов. 
  // useMemo сохранит форму волны для этого сообщения, чтобы она не прыгала при рендере.
  const waveform = React.useMemo(() => {
    return Array.from({ length: 25 }, () => Math.floor(Math.random() * 60) + 20); // Высота столбцов от 20% до 80%
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);

    // Подстраховка для браузеров, которые загружают метаданные моментально
    if (audio.readyState >= 1) setAudioData();

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [url]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    if (audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
      setProgress(newProgress * 100);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Стилизация кнопок и волны под Telegram (свои и чужие сообщения)
  const playBtnClass = isMe 
    ? 'bg-white text-[#007aff] dark:text-[#2b5278]' // Для своих сообщений кнопка белая, а значок цвета фона
    : 'bg-[#007aff] text-white'; // Для чужих сообщений кнопка синяя, значок белый

  const playedBarClass = isMe ? 'bg-white' : 'bg-[#007aff]';
  const unplayedBarClass = isMe ? 'bg-white/30' : 'bg-black/15 dark:bg-white/20';

  return (
    <div className="flex items-center gap-3 py-1.5 px-1 min-w-[240px]">
      
      {/* Кнопка Play / Pause */}
      <button 
        onClick={togglePlay} 
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 shadow-sm ${playBtnClass}`}
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" className="text-current" />
        ) : (
          <Play size={20} fill="currentColor" className="translate-x-[2px] text-current" />
        )}
      </button>
      
      {/* Эквалайзер и Таймер */}
      <div className="flex flex-col flex-1 gap-1.5 justify-center mt-1">
        
        {/* Волна (Waveform) */}
        <div 
          className="flex items-end gap-[2px] h-[22px] w-full cursor-pointer" 
          onClick={handleSeek}
        >
          {waveform.map((height, i) => {
            const isPlayed = (i / waveform.length) * 100 <= progress;
            return (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-colors duration-75 ${isPlayed ? playedBarClass : unplayedBarClass}`}
                style={{ height: `${height}%`, minWidth: '3px' }}
              />
            );
          })}
        </div>
        
        {/* Время */}
        <div className={`text-[12px] font-medium tracking-wide ${isMe ? 'text-white/80' : 'text-[#8e8e93]'}`}>
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </div>
        
      </div>
    </div>
  );
}

function LinkPreview({ url, isMe, setConfirmLink }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPreview = async () => {
      try {
        // Стучимся к СВОЕМУ скрипту, а не к мусорному allorigins
        const res = await fetch(`https://api.goodfaceteam.ru/get_link_meta.php?url=${encodeURIComponent(url)}`);
        
        if (!res.ok) return; // Если сервер ответил ошибкой, просто молчим

        const text = await res.text(); // Сначала берем как текст, чтобы не было SyntaxError
        
        try {
          const data = JSON.parse(text);
          if (isMounted && data.title) {
            setPreview({
              title: data.title,
              desc: data.description,
              img: data.image,
              domain: data.domain
            });
          }
        } catch (jsonErr) {
          // Если там не JSON (например, "Oops"), мы просто проигнорируем это
        }
      } catch (e) {
        // Ошибка сети — не выводим её красным, чтобы не засирать консоль
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPreview();
    return () => { isMounted = false; };
  }, [url]);

  if (loading || !preview) return null;

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); setConfirmLink(url); }}
      className={`mt-2 mb-1 flex flex-col overflow-hidden rounded-[14px] border cursor-pointer ${isMe ? 'border-white/20 bg-black/10 hover:bg-black/20' : 'border-black/10 dark:border-white/10 bg-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'} transition-colors`}
    >
      {preview.img && (
        <div className="w-full h-32 md:h-40 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <img src={preview.img} alt="preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3 flex flex-col gap-0.5">
        <span className={`text-[14px] font-bold truncate leading-tight ${isMe ? 'text-white' : 'text-[#007aff] dark:text-[#32ade6]'}`}>{preview.domain}</span>
        <span className={`text-[14px] font-semibold truncate leading-tight ${isMe ? 'text-white' : 'text-black dark:text-white'}`}>{preview.title}</span>
        {preview.desc && <span className={`text-[13px] line-clamp-2 leading-snug mt-0.5 ${isMe ? 'text-white/80' : 'text-zinc-600 dark:text-zinc-400'}`}>{preview.desc}</span>}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMe, isFirstInGroup, isLastInGroup, onReply, onEdit, onDelete, onForward, onReact, currentUser, isSaved, chatDesign, onPin }) {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmLink, setConfirmLink] = useState(null);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const pressTimer = useRef(null);
  const lastTapTime = useRef(0);
  const isMobile = window.innerWidth <= 768;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [oneTimeOpen, setOneTimeOpen] = useState(false);

  const [transcription, setTranscription] = useState(msg.voice_transcription || null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    if (transcription || isTranscribing) return;
    setIsTranscribing(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/transcribe_voice.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ message_id: msg.id })
      });
      const data = await res.json();
      if (data.success) {
        setTranscription(data.text);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);

    pressTimer.current = setTimeout(() => {
      if (isMobile) setShowMenu(true);
    }, 400); 
  };

  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) clearTimeout(pressTimer.current);

    if (dx < 0 && Math.abs(dx) > Math.abs(dy)) {
      setOffset(Math.max(dx, -60));
    }
  };

  const handleTouchEnd = () => {
    if (offset <= -40) {
      const replyData = { ...msg, sender_name: isMe ? currentUser.name : (msg.sender_name || "Собеседник") };
      onReply(replyData);
    }
    setOffset(0);
    setIsDragging(false);
    clearTimeout(pressTimer.current);
  };

  const handleClick = (e) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      const defaultReaction = localStorage.getItem('default_reaction') || '❤️';
      onReact(msg.id, defaultReaction);
      clearTimeout(pressTimer.current);
    }
    lastTapTime.current = now;
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!isMobile) {
      const menuWidth = 220; 
      const menuHeight = 320; 
      
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
      if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

      setMenuPos({ x, y });
      setShowMenu(true);
    }
  };

  const handleBurnMedia = async (msgId) => {
    // Если это моё сообщение, просто закрываем и НЕ отправляем запрос на удаление
    if (isMe) return; 
    
    // Отправляем запрос на Soft Delete (сработает только у получателя)
    await fetch("https://api.goodfaceteam.ru/burn_media.php", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      credentials: 'include',
      body: JSON.stringify({ message_id: msgId })
    });
  };

  const reactions = msg.reactions ? (typeof msg.reactions === 'string' ? JSON.parse(msg.reactions) : msg.reactions) : {};

  // Размеры шрифта
  const fontSizeClass = chatDesign.fontSize === 'small' ? 'text-[14px]' : chatDesign.fontSize === 'large' ? 'text-[18px]' : 'text-[16px]';
  const timeSizeClass = chatDesign.fontSize === 'small' ? 'text-[10px]' : chatDesign.fontSize === 'large' ? 'text-[12px]' : 'text-[11px]';

  // Проверяем, является ли сообщение медиа-элементом (стикер или гифка)
  const isSticker = msg.message_type === 'sticker' || msg.message_type === 'gif' || 
    (msg.message && msg.message.startsWith('http') && (msg.message.endsWith('.webp') || msg.message.endsWith('.gif') || msg.message.includes('tenor.com')));

  // Проверяем, является ли сообщение картинкой (отправленной через скрепку)
  const isImage = msg.message_type === 'image';
  const isVoice = msg.message_type === 'voice';

  // --- РЕНДЕР КРАСИВОГО СООБЩЕНИЯ О ЗВОНКЕ ---
  if (msg.message_type === 'call') {
    const isMe = msg.sender_id === currentUser.id;
    
    // Определяем статус и иконку
    let statusText = "";
    let CallIcon = Phone;
    let iconBgColor = "bg-[#007aff]/10";
    let iconColor = "text-[#007aff]";

    if (msg.message === 'missed') {
      statusText = isMe ? "Отмененный звонок" : "Пропущенный звонок";
      CallIcon = PhoneOff;
      // Если пропущенный у нас — красим в красный
      if (!isMe) {
        iconBgColor = "bg-red-500/10";
        iconColor = "text-red-500";
      }
    } else if (msg.message === 'declined') {
      statusText = isMe ? "Отклоненный звонок" : "Входящий (отклонен)";
      CallIcon = PhoneOff;
      iconColor = "text-zinc-500";
      iconBgColor = "bg-zinc-500/10";
    } else {
      statusText = isMe ? "Исходящий звонок" : "Входящий звонок";
    }

    return (
      <div className="flex justify-center my-4 w-full animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white/80 dark:bg-[#1c1c1d]/80 backdrop-blur-md px-5 py-3 rounded-[22px] border border-black/5 dark:border-white/5 shadow-sm flex items-center gap-4 min-w-[220px]">
          
          {/* Иконка в кружке */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor} shrink-0`}>
            <CallIcon size={20} className={iconColor} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-black dark:text-white leading-tight">
              Аудиозвонок
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[13px] font-medium ${msg.message === 'missed' && !isMe ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {statusText}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Цвета (Telegram Dark/Light по умолчанию)
  let myBubbleClass = 'bg-[#effdde] text-black dark:bg-[#2b5278] dark:text-white shadow-sm'; 
  if (chatDesign.bubbleColor === 'blue') myBubbleClass = 'bg-[#007aff] text-white shadow-sm';
  else if (chatDesign.bubbleColor === 'green') myBubbleClass = 'bg-[#34c759] text-white shadow-sm';
  else if (chatDesign.bubbleColor === 'purple') myBubbleClass = 'bg-[#af52de] text-white shadow-sm';

  let otherBubbleClass = 'bg-white text-black dark:bg-[#18222d] dark:text-white shadow-sm';

  // Убираем фон, если это стикер
  if (isSticker) {
    myBubbleClass = 'bg-transparent shadow-none';
    otherBubbleClass = 'bg-transparent shadow-none';
  }

  // Логика хвостиков (не применяется к стикерам)
  let radiusClass = isSticker ? '' : 'rounded-[18px]';
  if (!isSticker) {
    if (isMe) {
      if (isLastInGroup) radiusClass += ' rounded-br-sm';
    } else {
      if (isLastInGroup) radiusClass += ' rounded-bl-sm';
    }
  }

  // Рендер простого текста как эмодзи компонента
  const EmojiText = ({ text }) => <span>{text}</span>; // Если у тебя есть свой компонент для парсинга, используй его

  return (
    <div className={`flex relative ${isMe ? 'justify-end' : 'justify-start'} w-full group`}>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200" style={{ opacity: offset < -20 ? 1 : 0 }}>
        <div className="bg-black/20 p-2 rounded-full text-white"><Reply size={16} /></div>
      </div>

      <motion.div 
        animate={{ x: offset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }} // <-- ВОТ ЭТА СТРОЧКА ОТКЛЮЧИТ ВЫДЕЛЕНИЕ НА IOS
        className={`relative max-w-[85%] md:max-w-[70%] ${isSticker ? 'p-0' : 'px-3 pt-2 pb-2'} cursor-pointer select-none ${isMe ? myBubbleClass : otherBubbleClass} ${radiusClass}`}
      >
        {msg.forward_from_id && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (msg.forward_sender_handle) {
                navigate(`/chat/@${msg.forward_sender_handle}`);
              }
            }}
            className={`flex items-center gap-1.5 mb-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer ${isMe ? 'text-white' : 'text-[#007aff] dark:text-[#32ade6]'}`}
          >
            <Forward size={14} strokeWidth={2.5} className="rotate-0" />
            <div className="flex flex-col">
              <span className="text-[11px] leading-none uppercase font-bold tracking-wider">Переслано от</span>
              <span className="text-[14px] font-semibold leading-tight">{msg.forward_sender_name || 'Пользователь'}</span>
            </div>
          </div>
        )}
        {msg.reply_message && (
          <div className={`mb-1.5 pl-2 border-l-2 text-sm cursor-pointer py-0.5 rounded-r-md ${isMe ? 'border-white/50 bg-white/10' : 'border-[#007aff] bg-[#007aff]/10'}`}>
            <p className={`text-[13px] font-semibold leading-tight ${isMe ? 'text-white' : 'text-[#007aff]'}`}>{msg.reply_sender_name}</p>
            <p className="truncate text-[14px] opacity-80 leading-tight">{msg.reply_message}</p>
          </div>
        )}

        {/* Контент сообщения */}
        <div className="relative">
          {isSticker ? (
            <img src={msg.message} alt="Sticker" className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-md" />
          ) : isImage ? (
            <div className="relative mt-1 mb-2 overflow-hidden rounded-[12px] cursor-pointer">
              {msg.is_one_time ? (
                // --- ОДНОРАЗОВОЕ ФОТО (ПРЕВЬЮ) ---
                <div 
                  className="relative w-48 h-48 md:w-64 md:h-64 bg-zinc-900 flex flex-col items-center justify-center text-white"
                  onClick={() => setOneTimeOpen(true)}
                >
                  <Flame size={40} className="mb-2 text-red-500 animate-pulse" />
                  <span className="text-[13px] font-semibold tracking-wide">Одноразовое фото</span>
                  <img src={msg.message} className="absolute inset-0 w-full h-full object-cover blur-[20px] opacity-40 pointer-events-none" alt="hidden" loading="lazy" />
                </div>
              ) : (
                // --- ОБЫЧНОЕ ФОТО ---
                <img 
                  src={msg.message} 
                  alt="Attachment" 
                  onClick={() => setLightboxOpen(true)} // Открываем новую библиотеку
                  className="max-w-[240px] md:max-w-[320px] max-h-[300px] object-cover hover:opacity-90 transition-opacity" 
                  loading="lazy" 
                />
              )}
            </div>
          ) : isVoice ? (
            <div className="flex flex-col gap-1.5 min-w-[220px]">
              <div className="flex items-center gap-2">
                <VoicePlayer url={msg.message} isMe={isMe} />
                
                {/* Кнопка расшифровки */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleTranscribe(); }}
                  disabled={isTranscribing}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    transcription 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title="Расшифровать в текст"
                >
                  {isTranscribing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="text-[12px] font-bold leading-none">A</span>
                  )}
                </button>
              </div>

              {/* Появление текста расшифровки */}
              <AnimatePresence>
                {transcription && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[13.5px] leading-relaxed px-1 py-1 rounded-lg ${
                      isMe ? 'text-white/90 font-medium' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="border-t border-black/5 dark:border-white/10 pt-1.5">
                      {transcription}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`${fontSizeClass} leading-[1.3] break-words whitespace-pre-wrap`}>
              {/* Парсим текст и ищем ссылки */}
              {msg.message.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                part.match(/(https?:\/\/[^\s]+)/) ? (
                  <a 
                    key={i} 
                    href={part} 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmLink(part); }} 
                    className={`underline underline-offset-2 transition-colors ${isMe ? 'text-white hover:text-white/80' : 'text-[#007aff] dark:text-[#32ade6] hover:opacity-80'}`}
                  >
                    {part}
                  </a>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
              
              {/* Если в сообщении есть ссылка — показываем красивую карточку-превью */}
              {msg.message.match(/(https?:\/\/[^\s]+)/) && (
                <LinkPreview url={msg.message.match(/(https?:\/\/[^\s]+)/)[0]} isMe={isMe} setConfirmLink={setConfirmLink} />
              )}
            </div>
          )}
          
          {/* Интегрированное время (если картинка или стикер - время накладывается поверх с красивым фоном) */}
          <span className={`flex items-center gap-[3px] z-10 ${(isSticker || isImage) ? 'absolute bottom-1 right-2 bg-black/40 backdrop-blur-md text-white px-1.5 py-0.5 rounded-full text-[10px]' : `float-right ml-3 mt-[6px] relative top-[2px] ${timeSizeClass} ${isMe ? 'text-white/70' : 'text-zinc-400 dark:text-[#687a8a]'}`}`}>
            {msg.is_edited && <span className="italic">изм.</span>}
            <span className="font-medium leading-none tracking-wide">
              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            
            {isMe && (
              <span className="ml-[1px]">
                {/* ПРОВЕРКА СТАТУСА: ЧАСИКИ ИЛИ ГАЛОЧКИ */}
                {msg.status === 'scheduled' ? (
                  <Clock size={14} className={(isSticker || isImage) ? 'text-white' : 'text-white/70'} />
                ) : (
                  msg.is_read ? 
                    <CheckCheck size={14} className="text-[#32ade6] dark:text-[#52b7db]" /> : 
                    <Check size={14} className="text-white/70" />
                )}
              </span>
            )}
          </span>
          {/* Пустой элемент для сброса float */}
          <div className="clear-both"></div>
        </div>

        {/* Реакции */}
        {Object.keys(reactions).length > 0 && (
          <div className={`absolute ${isMe ? '-bottom-3 right-2' : '-bottom-3 left-2'} flex gap-1 z-10`}>
            {Object.entries(reactions).map(([emoji, users]) => (
              <div key={emoji} onClick={(e) => { e.stopPropagation(); onReact(msg.id, emoji); }} className="bg-white dark:bg-[#1c242d] border border-zinc-200/50 dark:border-black/20 rounded-full px-2 py-0.5 text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                <span>{emoji}</span> <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{users.length}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Меню сообщения */}
      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-[100] flex justify-center" onContextMenu={(e) => {e.preventDefault(); setShowMenu(false);}} onClick={() => setShowMenu(false)}>
            <div className="absolute inset-0 bg-transparent" />
            <motion.div 
              initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} 
              style={Object.assign(
                { WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }, 
                !isMobile ? { top: menuPos.y, left: menuPos.x } : {}
              )}
              className={`absolute ${isMobile ? 'bottom-[90px] left-0 right-0 pb-safe px-2' : 'w-[260px]'} flex flex-col items-center gap-2 z-50`}
            >
              
              {/* РЕАКЦИИ */}
              <div className={`bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-3xl px-4 py-2.5 shadow-lg border border-black/5 dark:border-white/5 flex gap-3 overflow-x-auto hide-scrollbar ${isMobile ? 'w-full rounded-[24px]' : 'w-full rounded-full'}`}>
                {['👍', '❤️', '😂', '🔥', '👏', '😢'].map(emoji => (
                  <button key={emoji} onClick={() => { onReact(msg.id, emoji); setShowMenu(false); }} className="hover:scale-125 transition-transform text-3xl shrink-0">{emoji}</button>
                ))}
              </div>

              {/* ОСНОВНОЕ МЕНЮ */}
              <div className={`bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-3xl border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col ${isMobile ? 'w-full rounded-[24px] mb-2' : 'w-full rounded-[24px]'}`}>
                
                {/* Инфо о времени */}
                <div className="flex items-center gap-4 px-4 py-3">
                  <CheckCheck size={20} className="text-zinc-500" />
                  <span className="text-[14px] text-black dark:text-white">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div className="h-[0.5px] bg-black/10 dark:bg-white/10 mx-4"></div>

                {/* Кнопка Ответить */}
                <button onClick={() => { onReply({...msg, sender_name: isMe ? currentUser.name : (msg.sender_name || "Собеседник")}); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-black dark:text-white hover:bg-black/5 transition">
                  <Reply size={22} className="text-zinc-500"/> Ответить
                </button>

                {/* Кнопка Переслать */}
                <button onClick={() => { onForward(msg); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-black dark:text-white hover:bg-black/5 transition">
                  <Forward size={22} className="text-zinc-500"/> Переслать
                </button>

                {/* Кнопки, которых НЕ должно быть в Избранном */}
                {!isSaved && (
                  <>
                    {isMe && (
                      <button onClick={() => { onEdit(msg); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-black dark:text-white hover:bg-black/5 transition">
                        <Edit2 size={22} className="text-zinc-500"/> Изменить
                      </button>
                    )}
                    <button onClick={() => { onPin(msg); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-black dark:text-white hover:bg-black/5 transition">
                      <Pin size={22} className="text-zinc-500"/> {msg.is_pinned ? 'Открепить' : 'Закрепить'}
                    </button>
                  </>
                )}
                
                <div className="h-[0.5px] bg-black/10 dark:bg-white/10 mx-4"></div>
                
                {/* БЛОК УДАЛЕНИЯ */}
                {isSaved ? (
                  /* В ИЗБРАННОМ: Только одна кнопка */
                  <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-[#ff3b30] hover:bg-[#ff3b30]/10 transition">
                    <Trash2 size={22} /> Удалить
                  </button>
                ) : (
                  /* В ОБЫЧНОМ ЧАТЕ: Логика как раньше */
                  <>
                    <button onClick={() => { onDelete(msg.id, false); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-[#ff3b30] hover:bg-[#ff3b30]/10 transition">
                      <Trash2 size={22} /> {isMe ? 'Удалить у себя' : 'Удалить сообщение'}
                    </button>
                    
                    {isMe && (
                      <button onClick={() => { onDelete(msg.id, true); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-4 text-[16px] text-[#ff3b30] hover:bg-[#ff3b30]/10 transition">
                        <Trash2 size={22} /> Удалить у всех
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- МОДАЛКА ПЕРЕХОДА ПО ССЫЛКЕ --- */}
      <AnimatePresence>
        {confirmLink && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 cursor-default" onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800" 
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-[18px] font-bold text-center text-black dark:text-white mb-2">Переход по ссылке</h3>
              <p className="text-[14px] text-center text-[#8e8e93] mb-6 break-words">
                Вы покидаете Gudex и переходите на внешний ресурс:<br/><br/>
                <span className="text-[#007aff] font-medium">{confirmLink}</span>
              </p>
              <div className="flex flex-col gap-2">
                <a 
                  href={confirmLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }} 
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007aff] hover:bg-blue-600 transition-colors flex items-center justify-center text-center"
                >
                  Перейти
                </a>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfirmLink(null); }} 
                  className="w-full py-3.5 rounded-xl font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: msg.message }]}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        className="z-[999999]"
        render={{
          buttonPrev: () => null, // Убираем стрелки, так как смотрим по одному фото
          buttonNext: () => null,
        }}
        zoom={{
          maxZoomPixelRatio: 3, // Максимальное приближение
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true, // Зум колесиком мыши на ПК
        }}
      />

      {/* --- МОДАЛКА ПРОСМОТРА ОДНОРАЗОВОГО ФОТО (Оставляем нашу кастомную со сгоранием) --- */}
      <Lightbox
        open={oneTimeOpen}
        close={() => {
          setOneTimeOpen(false);
          handleBurnMedia(msg.id); // Здесь сработает проверка на isMe, которую мы написали выше
        }}
        slides={[{ src: msg.message }]}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          scrollToZoom: true,
        }}
      />

      {/* --- ПЛАШКА С ПРЕДУПРЕЖДЕНИЕМ ПОВЕРХ LIGHTBOX --- */}
      <AnimatePresence>
        {oneTimeOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-0 w-full flex justify-center pointer-events-none z-[9999999]"
          >
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white shadow-xl">
              <Flame size={18} className="text-red-500 animate-pulse"/>
              <span className="text-[13px] font-medium tracking-wide">
                {isMe ? 'Вы отправили одноразовое фото' : 'Закройте, чтобы удалить навсегда'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomSettingsModal({ room, currentUser, onClose }) {
  const [members, setMembers] = useState([]);
  const [inviteHash, setInviteHash] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const amIOwner = room.role === 'owner';
  const amIAdmin = room.role === 'admin' || amIOwner;

  useEffect(() => {
    fetch(`https://api.goodfaceteam.ru/get_room_settings.php?room_id=${room.id}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.members);
          setInviteHash(data.invite_hash);
        }
        setIsLoading(false);
      });
  }, [room.id, currentUser.id]);

  const handleMemberAction = async (targetUserId, action) => {
    if (action === 'kick' && !window.confirm("Исключить пользователя из чата?")) return;
    try {
      const res = await fetch("https://api.goodfaceteam.ru/manage_room_member.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ room_id: room.id, target_user_id: targetUserId, action })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'kick') setMembers(members.filter(m => m.id !== targetUserId));
        if (action === 'promote') setMembers(members.map(m => m.id === targetUserId ? { ...m, role: 'admin' } : m));
        if (action === 'demote') setMembers(members.map(m => m.id === targetUserId ? { ...m, role: 'member' } : m));
      } else { alert(data.message); }
    } catch (e) { console.error(e); }
  };

  const handleGenerateLink = async () => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/generate_invite_link.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ room_id: room.id })
      });
      const data = await res.json();
      if (data.success) setInviteHash(data.invite_hash);
    } catch (e) { console.error(e); }
  };

  const inviteLinkFull = inviteHash ? `${window.location.origin}/join/${inviteHash}` : '';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1c1c1d] w-full max-w-md rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-white/10 h-[70vh] max-h-[700px]">
        <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold text-black dark:text-white">Настройки {room.type === 'channel' ? 'канала' : 'группы'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="flex px-4 pt-4 gap-4 border-b border-zinc-200 dark:border-white/10 shrink-0">
          <button onClick={() => setActiveTab('members')} className={`pb-3 text-[15px] font-medium transition-colors border-b-2 ${activeTab === 'members' ? 'border-[#007aff] text-[#007aff]' : 'border-transparent text-zinc-500'}`}>Участники</button>
          {room.is_private === 1 && amIAdmin && (
            <button onClick={() => setActiveTab('links')} className={`pb-3 text-[15px] font-medium transition-colors border-b-2 ${activeTab === 'links' ? 'border-[#007aff] text-[#007aff]' : 'border-transparent text-zinc-500'}`}>Приглашения</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {isLoading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" /></div> ) 
          : activeTab === 'members' ? (
            <div className="space-y-1">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#007aff] rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
                      {m.avatar_data ? <GraphicRenderer target="avatar_small" data={typeof m.avatar_data === 'string' ? JSON.parse(m.avatar_data) : m.avatar_data} /> : m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[16px] text-black dark:text-white flex items-center gap-1.5">
                        {m.name} 
                        {m.role === 'owner' && <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] px-1.5 py-0.5 rounded uppercase font-bold">Создатель</span>}
                        {m.role === 'admin' && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-bold">Админ</span>}
                      </p>
                      <p className="text-[14px] text-zinc-500 dark:text-[#8e8e93]">@{m.handle}</p>
                    </div>
                  </div>
                  {amIAdmin && m.role !== 'owner' && m.id !== currentUser.id && (
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white rounded-full transition">
                        <MoreVertical size={20} />
                      </button>
                      {activeMenuId === m.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1c1c1d] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                            {amIOwner && m.role === 'member' && ( <button onClick={() => { handleMemberAction(m.id, 'promote'); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-medium hover:bg-black/5 dark:hover:bg-white/5">Сделать админом</button> )}
                            {amIOwner && m.role === 'admin' && ( <button onClick={() => { handleMemberAction(m.id, 'demote'); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-medium hover:bg-black/5 dark:hover:bg-white/5">Снять права</button> )}
                            <button onClick={() => { handleMemberAction(m.id, 'kick'); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-medium text-[#ff3b30] hover:bg-[#ff3b30]/10">Исключить</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in space-y-4 pt-2">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#007aff]/10 text-[#007aff] rounded-full flex items-center justify-center mx-auto mb-4"><Users size={28} /></div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Пригласительная ссылка</h4>
                <p className="text-[14px] text-zinc-500 dark:text-[#8e8e93]">Любой, у кого есть эта ссылка, сможет вступить в чат.</p>
              </div>
              {inviteHash ? (
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-2xl">
                  <input type="text" readOnly value={inviteLinkFull} className="flex-1 bg-transparent text-[14px] outline-none px-2 text-black dark:text-white" />
                  <button onClick={() => navigator.clipboard.writeText(inviteLinkFull)} className="bg-[#007aff] text-white p-2 rounded-xl transition active:scale-95"><Check size={18} /></button>
                </div>
              ) : <p className="text-[14px] font-medium text-[#ff3b30] text-center">Ссылка еще не создана</p>}
              <button onClick={handleGenerateLink} className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-[15px] active:scale-95 transition-transform mt-4">
                {inviteHash ? 'Сбросить и создать новую' : 'Сгенерировать ссылку'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatWindowPage({ currentUser }) {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { openReportModal, chatDesign, initiateCall } = useOutletContext() || {};
  const safeDesign = chatDesign || { fontSize: 'medium', wallpaper: 'default', bubbleColor: 'blue' };
  
  const rawHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  const isRoom = rawHandle.startsWith('room_');
  const roomId = isRoom ? rawHandle.replace('room_', '') : null;

  const [targetUser, setTargetUser] = useState(null); 
  const [roomInfo, setRoomInfo] = useState(null);     
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSecretChat, setIsSecretChat] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaTab, setMediaTab] = useState('stickers'); 
  
  const [stickerPacks, setStickerPacks] = useState([]);
  const [activeStickerPack, setActiveStickerPack] = useState(null);
  const [gifs, setGifs] = useState([]); 
  const [showScrollDown, setShowScrollDown] = useState(false);

  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);

  const [errorToast, setErrorToast] = useState(null);
  const [forceHideInputs, setForceHideInputs] = useState(false);

  // Вычисляем массив всех закрепленных сообщений
  const pinnedMessagesList = messages.filter(m => m.is_pinned == 1);
  const activePinnedMsg = pinnedMessagesList[currentPinnedIndex] || pinnedMessagesList[0];

  const [showSendMenu, setShowSendMenu] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const pressTimer = useRef(null);

  const [isOneTimeMedia, setIsOneTimeMedia] = useState(false);
  const [viewingOneTimeMsgId, setViewingOneTimeMsgId] = useState(null);

  const [isGhostMode, setIsGhostMode] = useState(
    localStorage.getItem('ghost_mode') === 'true'
  );

  const toggleGhostMode = () => {
    const newState = !isGhostMode;
    setIsGhostMode(newState);
    localStorage.setItem('ghost_mode', newState);
  };

  // Обработчики долгого нажатия для телефона
  const handlePressStart = (e) => {
    // Если сообщение пустое, меню не показываем
    if (!inputText.trim()) return; 
    pressTimer.current = setTimeout(() => {
      setShowSendMenu(true);
      // Сбрасываем возможные ложные срабатывания микрофона
      cancelRecording(); 
    }, 500); // 500мс = долгое нажатие
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Если мы отмотали наверх больше чем на 150 пикселей от самого низа — показываем кнопку
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollDown(isScrolledUp);
  };

  const checkIsBirthday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  useEffect(() => {
    if (!isRoom && targetUser?.birthday && checkIsBirthday(targetUser.birthday) && canSeeInfo('privacy_birthday')) {
       confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 999999 });
    }
  }, [targetUser, isRoom]);

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);
      // Убираем подсветку через 2 секунды
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  };

  const handlePinMessage = async (msg) => {
    // Оптимистично обновляем UI
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_pinned: m.is_pinned ? 0 : 1 } : m));
    
    try {
      await fetch("https://api.goodfaceteam.ru/pin_message.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ message_id: msg.id })
      });
    } catch (e) { console.error("Ошибка закрепления", e); }
  };

  useEffect(() => {
    if (mediaTab === 'gifs' && gifs.length === 0) {
      fetch("https://g.tenor.com/v1/trending?key=LIVDSRZULELA&limit=30")
        .then(res => res.json())
        .then(data => setGifs(data.results))
        .catch(e => console.error("Ошибка загрузки GIF", e));
    }
  }, [mediaTab]);

  useEffect(() => {
    fetch("https://api.goodfaceteam.ru/get_stickers.php", {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.packs.length > 0) {
        setStickerPacks(data.packs);
        setActiveStickerPack(data.packs[0].id); 
      }
    })
    .catch(err => console.error("Ошибка загрузки стикеров", err));
  }, []);
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearForBoth, setClearForBoth] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); 
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [myChatsList, setMyChatsList] = useState([]);

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const messagesEndRef = useRef(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- УЛУЧШЕННЫЕ СТЕЙТЫ И ЛОГИКА ДЛЯ ГОЛОСОВЫХ ---
  const [recordState, setRecordState] = useState('idle'); 
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const shouldSaveVoiceRef = useRef(false);

  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      shouldSaveVoiceRef.current = true; 

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        if (shouldSaveVoiceRef.current && audioChunksRef.current.length > 0) {
          // Берем родной тип браузера для максимальной совместимости на iOS
          const mimeType = mediaRecorderRef.current.mimeType;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          uploadAudioToCloudinary(audioBlob);
        }
        audioChunksRef.current = [];
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start(200); // Собираем чанки каждые 200мс для надежности
      setRecordState('pressing');
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (err) { 
      alert('Микрофон недоступен'); 
      setRecordState('idle');
    }
  };

  const handlePointerDown = (e) => {
    if (inputText.trim() || isUploading) return;
    e.preventDefault();
    setStartY(e.clientY);
    setStartX(e.clientX);
    startRecording();
  };

  const handlePointerMove = (e) => {
    if (recordState !== 'pressing') return;
    const diffY = startY - e.clientY;
    const diffX = startX - e.clientX;

    if (diffY > 60) setRecordState('locked');
    if (diffX > 60) cancelRecording();
  };

  const handlePointerUp = () => {
    if (recordState === 'pressing') {
      stopAndSend();
    }
  };

  const stopAndSend = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Защита от пустых записей (меньше 1 секунды)
      if (recordingDuration < 1) {
        cancelRecording();
        return;
      }
      shouldSaveVoiceRef.current = true; 
      try { mediaRecorderRef.current.requestData(); } catch(e) {} // Форсируем последние данные
      mediaRecorderRef.current.stop();
    }
    setRecordState('idle');
    clearInterval(timerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      shouldSaveVoiceRef.current = false; 
      mediaRecorderRef.current.stop();
    }
    setRecordState('idle');
    clearInterval(timerRef.current);
    audioChunksRef.current = [];
  };

  const uploadAudioToCloudinary = async (audioBlob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('upload_preset', 'GudexMedia'); 
    const cloudName = 'dtwjm2645'; 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.secure_url) {
        handleSendMedia(data.secure_url, 'voice');
      }
    } catch (error) {
      console.error("Ошибка загрузки аудио:", error);
      alert('Не удалось отправить голосовое сообщение.');
    } finally {
      setIsUploading(false);
    }
  };

  const unescapeHtml = (safe) => {
    if (!safe) return "";
    return safe
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    if (isRoom || !targetUser || isGhostMode) return;

    const markAsRead = async () => {
      try {
        await fetch("https://api.goodfaceteam.ru/mark_as_read.php", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          credentials: 'include',
          body: JSON.stringify({ partner_id: targetUser.id })
        });
      } catch (e) {
        console.error("Не удалось пометить сообщения прочитанными", e);
      }
    };
    markAsRead();
  }, [targetUser, roomInfo, roomId, isRoom, messages, isGhostMode]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
      setShowChatMenu(false);
      setShowSendMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside); 
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, []);

  const loadChatsForForward = () => {
    fetch(`https://api.goodfaceteam.ru/get_chats.php`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyChatsList(data.chats);
          setShowForwardModal(true);
        }
      });
  };

  const confirmForward = async (chat) => {
    if (!forwardMsg) return;

    if (chat.is_saved_archive) {
      try {
        const res = await fetch("https://api.goodfaceteam.ru/save_to_saved.php", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ 
            content: forwardMsg.message, 
            message_type: forwardMsg.message_type || 'text'
            // Тут можно добавить поле tags, если хочешь, чтобы при пересылке 
            // они сразу подхватывались из текста сообщения
          })
        });

        const data = await res.json();
        if (data.success) {
          setShowForwardModal(false);
          setForwardMsg(null);
          alert("Сообщение сохранено в Избранное! 🔖");
        }
      } catch (e) {
        console.error("Ошибка сохранения в избранное", e);
      }
      return; // Выходим, чтобы не шел код для обычных чатов
    }

    const targetId = chat.contact_id;
    const isTargetRoom = chat.is_group || !!chat.chat_id;

    try {
      const res = await fetch("https://api.goodfaceteam.ru/send_message.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          receiver_id: isTargetRoom ? null : targetId,
          chat_id: isTargetRoom ? targetId : null,
          message: forwardMsg.message,
          message_type: forwardMsg.message_type || 'text', // Передаем тип оригинала!
          forward_from_id: forwardMsg.sender_id // Передаем автора
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowForwardModal(false);
        setForwardMsg(null);
        // Если ты переслал в ТОТ ЖЕ чат, где сидишь — можно добавить в стейт вручную
        if ((!isTargetRoom && targetId === targetUser?.id) || (isTargetRoom && targetId === roomId)) {
            setMessages(prev => [...prev, data.message_data]);
        }
        alert("Сообщение переслано");
      }
    } catch (e) {
      console.error("Ошибка пересылки", e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const processMessages = (msgs) => {
      return msgs.map(m => {
        if (!m.message) return m;
        let unescaped = unescapeHtml(m.message);
        if (unescaped.startsWith('{"content":')) {
          unescaped = "🔐 [Зашифрованное сообщение]";
        }
        return { ...m, message: unescaped };
      });
    };

    if (isRoom) {
      fetch(`https://api.goodfaceteam.ru/get_room.php?room_id=${roomId}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } })
        .then(res => res.json())
        .then((data) => {
          if (data.success) {
            setRoomInfo(data.room);
            setMessages(processMessages(data.messages));
          } else {
            alert(data.message);
            navigate('/chats');
          }
        }).finally(() => setIsLoading(false));
    } else {
      fetch(`https://api.goodfaceteam.ru/get_user_profile.php?handle=${rawHandle}`, { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }, credentials: 'include' })
        .then(res => res.json())
        .then(async (data) => {
          if (data.success) {
            setTargetUser(data.user);
            setIsBlocked(data.user.is_blocked);
            const msgRes = await fetch(`https://api.goodfaceteam.ru/get_messages.php?user2_id=${data.user.id}`, { credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } });
            const msgData = await msgRes.json();
            if (msgData.success) {
              setMessages(processMessages(msgData.messages));
            }
          }
          setIsLoading(false);
        });
    }
  }, [rawHandle, isRoom, roomId, currentUser.id, navigate]);

  useEffect(() => {
    if (!targetUser && !roomInfo) return;
    const pusher = new Pusher('28ce5463a647fcf817b0', { cluster: 'eu' });
    
    // Канал чата
    let channelName = isRoom ? `room_${roomId}` : `chat_${[Number(currentUser.id), Number(targetUser?.id)].sort((a, b) => a - b).join('_')}`;
    const channel = pusher.subscribe(channelName);

    // Личный канал пользователя (для звонков)
    const userChannel = pusher.subscribe(`user_${currentUser.id}`);

    channel.bind('new_message', (data) => {
      let displayMessage = unescapeHtml(data.message);
      let msgType = data.message_type || 'text';

      // Автоматически определяем тип медиа, если сервер его не прислал
      if (displayMessage.startsWith('{"content":')) {
        displayMessage = "🔐 [Зашифрованное сообщение]";
        msgType = 'encrypted';
      } else if (displayMessage.startsWith('http') && msgType === 'text') {
        if (displayMessage.match(/\.(webp)$/i)) msgType = 'sticker';
        else if (displayMessage.match(/\.(gif|mp4)$/i)) msgType = 'gif';
        else if (displayMessage.match(/\.(jpeg|jpg|png|svg)$/i) || displayMessage.includes('ibb.co')) msgType = 'image';
        else if (displayMessage.includes('cloudinary.com')) msgType = 'voice';
      }

      setMessages(prev => {
        // Ищем, есть ли уже это сообщение (например, отправленное нами tempMessage)
        const existingIndex = prev.findIndex(m => m.id == data.id || (data.temp_id && m.temp_id == data.temp_id));
        if (existingIndex !== -1) {
          const newArray = [...prev];
          // Обновляем временное сообщение реальными данными, сохраняя правильный тип
          newArray[existingIndex] = { ...newArray[existingIndex], ...data, message: displayMessage, message_type: msgType };
          return newArray;
        }
        return [...prev, { ...data, message: displayMessage, message_type: msgType }];
      });

      // РЕШЕНИЕ: Сразу отправляем на сервер "прочитано", если сообщение от собеседника и мы находимся в чате
      if (data.sender_id !== currentUser.id && !isRoom) {
        fetch("https://api.goodfaceteam.ru/mark_as_read.php", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
          credentials: 'include',
          body: JSON.stringify({ partner_id: data.sender_id })
        });
      }
    });

    channel.bind('message_edited', (data) => {
      let editedText = unescapeHtml(data.new_text);
      if (editedText.startsWith('{"content":')) editedText = "🔐 [Зашифрованное сообщение]";
      setMessages(prev => prev.map(m => m.id == data.message_id ? { ...m, message: editedText, is_edited: 1 } : m));
    });

    channel.bind('message_deleted', (data) => {
      if (data.clear_all) setMessages([]);
      else setMessages(prev => prev.filter(m => m.id != data.message_id));
    });
    channel.bind('message_reacted', (data) => setMessages(prev => prev.map(m => m.id == data.message_id ? { ...m, reactions: data.reactions } : m)));
    channel.bind('typing', (data) => { if (data.user_id !== currentUser.id && !isRoom) setIsPartnerTyping(data.is_typing); });
    channel.bind('messages_read', (data) => {
      if (data.reader_id !== currentUser.id) {
        setMessages(prev => prev.map(m => {
          if (m.sender_id === currentUser.id && (!m.is_read || m.is_read === 0)) return { ...m, is_read: 1 };
          return m;
        }));
      }
    });
    channel.bind('message_pinned', (data) => {
      setMessages(prev => prev.map(m => m.id == data.message_id ? { ...m, is_pinned: data.is_pinned } : m));
    });

    return () => { 
      channel.unbind_all(); 
      channel.unsubscribe(); 
      userChannel.unbind_all();
      userChannel.unsubscribe();
      setTimeout(() => pusher.disconnect(), 500); 
    };
  }, [targetUser, roomInfo, currentUser.id, isRoom, roomId]);

  const handleToggleBlock = async () => {
    if (!currentUser || !targetUser || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/toggle_block.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ blocked_id: targetUser.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsBlocked(data.is_blocked);
        setShowChatMenu(false);
      }
    } catch (e) { console.error(e); } finally { setIsActionLoading(false); }
  };

  const handleClearHistory = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/clear_chat.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ 
          partner_id: isRoom ? null : targetUser.id,
          room_id: roomId,
          for_everyone: clearForBoth ? 1 : 0 
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([]); 
        setShowClearModal(false);
        setShowChatMenu(false);
      }
    } catch (e) { console.error(e); } finally { setIsActionLoading(false); }
  };

  const handleJoinRoom = async () => {
    try {
      await fetch("https://api.goodfaceteam.ru/join_room.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ room_id: roomId })
      });
      setRoomInfo({ ...roomInfo, role: 'member', members_count: Number(roomInfo.members_count) + 1 });
    } catch (e) { console.error(e); }
  };

  const handleLeaveRoom = async () => {
    if (!window.confirm("Уверены, что хотите покинуть чат?")) return;
    try {
      await fetch("https://api.goodfaceteam.ru/leave_room.php", {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
        body: JSON.stringify({ room_id: roomId })
      });
      navigate('/chats');
    } catch (e) { console.error(e); }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm("Удалить этот канал/группу навсегда? Это действие необратимо!")) return;
    try {
      await fetch("https://api.goodfaceteam.ru/delete_room.php", {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ user_id: currentUser.id, room_id: roomId })
      });
      navigate('/chats');
    } catch (e) { console.error(e); }
  };

  const handleReact = async (messageId, emoji) => {
    fetch("https://api.goodfaceteam.ru/react_message.php", { 
      method: 'POST', credentials: 'include', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, 
      body: JSON.stringify({ message_id: messageId, emoji }) 
    });
  };

  const handleInputChange = (e) => { setInputText(e.target.value); };

  const handleSendOrEdit = async (isSilent = false, scheduledAt = null) => {
    if (!inputText.trim() || (!targetUser && !isRoom)) return;
    const textToSend = inputText;

    // --- ЛОГИКА АВТОЗАМЕНЫ: Эмодзи -> Стикер ---
    // Проверяем, состоит ли сообщение только из эмодзи (регулярка покрывает большинство эмодзи)
    const isEmojiOnly = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+$/u.test(textToSend);

    if (isEmojiOnly && !editingMessage) {
      let matchedStickerUrl = null;
      
      // Ищем стикер с таким же эмодзи в загруженных паках
      for (const pack of stickerPacks) {
        const found = pack.stickers.find(s => s.emoji === textToSend);
        if (found) {
          matchedStickerUrl = found.url;
          break;
        }
      }

      // Если стикер найден — отправляем его и прерываем обычную отправку текста
      if (matchedStickerUrl) {
        setInputText("");
        setShowEmojiPicker(false);
        handleSendMedia(matchedStickerUrl, 'sticker');
        return; 
      }
    }
    
    setInputText(""); 
    setShowEmojiPicker(false); 
    setShowSendMenu(false); // Закрываем меню отправки
    setShowScheduleModal(false); // Закрываем модалку расписания
    setScheduleDateTime('');

    if (editingMessage) {
      const msgId = editingMessage.id;
      setEditingMessage(null);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: textToSend, is_edited: 1 } : m));
      
      fetch("https://api.goodfaceteam.ru/edit_message.php", { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include', 
        body: JSON.stringify({ message_id: msgId, new_text: textToSend })
      });
      
    } else {
      const tempId = "temp_" + Date.now();
      const replyId = replyingTo?.id; 
      
      // 1. УБРАЛИ if (!scheduledAt). Добавляем сообщение ВСЕГДА!
      const tempMessage = { 
        id: tempId, 
        temp_id: tempId, 
        sender_id: currentUser.id, 
        message: textToSend, 
        // Если есть scheduledAt (отложка), ставим его, иначе текущее время
        created_at: scheduledAt || new Date().toISOString(), 
        // Ставим статус 'scheduled' для отложки, чтобы нарисовались часики
        status: scheduledAt ? 'scheduled' : 'sent',
        reply_message: replyingTo?.message, 
        reply_sender_name: replyingTo?.sender_name,
        sender_name: currentUser.name 
      };
      
      // Сразу выводим сообщение на экран
      setMessages(prev => [...prev, tempMessage]);
      setReplyingTo(null);

      const res = await fetch("https://api.goodfaceteam.ru/send_message.php", {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include', 
        body: JSON.stringify({ 
          receiver_id: isRoom ? null : targetUser.id, 
          chat_id: isRoom ? roomId : null, 
          message: textToSend, 
          temp_id: tempId, 
          reply_to_id: replyId,
          is_secret: typeof isSecretChat !== 'undefined' && isSecretChat ? 1 : 0,
          is_silent: isSilent ? 1 : 0,
          scheduled_at: scheduledAt 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // 2. ОЧЕНЬ ВАЖНО: обновляем сообщение реальными данными из БД!
        // Без этого Pusher потом не сможет найти это сообщение, чтобы поменять часики на галочки
        setMessages(prev => prev.map(m => m.temp_id === tempId ? { ...m, ...data.message_data } : m));
      } else {
        // Удаляем временное сообщение, так как оно не отправилось
        setMessages(prev => prev.filter(m => m.temp_id !== tempId));
        setErrorToast(data.message);
        setTimeout(() => setErrorToast(null), 3000);
        if (data.error_type === 'privacy' || data.error_type === 'blocked') {
           setForceHideInputs(true);
        }
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой! Максимум 10 МБ.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "ebac1772b08b6eda18a0d67619e88194"); 

    try {
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        handleSendMedia(data.data.url, 'image'); 
      } else {
        alert('Ошибка загрузки в облако');
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert('Не удалось загрузить файл. Проверьте интернет.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMedia = async (mediaUrl, type = 'sticker') => {
    setShowEmojiPicker(false);
    if (!targetUser && !isRoom) return;

    const tempId = "temp_" + Date.now();
    
    const tempMessage = { 
      id: tempId, 
      temp_id: tempId, 
      sender_id: currentUser.id, 
      message: mediaUrl, 
      message_type: type, 
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
      is_one_time: isOneTimeMedia ? 1 : 0
    };
    
    setMessages(prev => [...prev, tempMessage]);

    fetch("https://api.goodfaceteam.ru/send_message.php", {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      credentials: 'include', 
      body: JSON.stringify({ 
        receiver_id: isRoom ? null : targetUser.id, 
        chat_id: isRoom ? roomId : null, 
        message: mediaUrl, 
        message_type: type, 
        temp_id: tempId, 
        is_secret: typeof isSecretChat !== 'undefined' && isSecretChat ? 1 : 0,
        is_one_time: isOneTimeMedia ? 1 : 0
      })
    });

    setIsOneTimeMedia(false);
  };

  const handleDeleteMessage = async (messageId, forEveryone = false) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    fetch("https://api.goodfaceteam.ru/delete_message.php", { 
      method: 'POST', credentials: 'include', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, 
      body: JSON.stringify({ message_id: messageId, for_everyone: forEveryone ? 1 : 0 }) 
    });
  };

  const canSeeInfo = (privacyType) => {
    if (isRoom || !targetUser) return true; // В группах звонки отключены, так что не важно. А сообщения разруливаются ниже через canWrite.
    const setting = targetUser[privacyType];
    if (!setting || setting === 'all') return true;
    if (setting === 'nobody') return false;
    if (setting === 'followers' && targetUser.is_following) return true;
    return false;
  };

  const canCall = canSeeInfo('privacy_calls');
  const canMessageUser = canSeeInfo('privacy_messages');

  if (isLoading) return <div className="flex justify-center py-20 h-[100dvh] items-center"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>;
  if (!targetUser && !roomInfo) return <div className="text-center py-20 h-[100dvh]">Чат не найден</div>;

  const isMember = isRoom && roomInfo?.role; 
  // Учитываем forceHideInputs, чтобы спрятать поле ввода моментально после неудачной отправки
  const canWrite = isRoom ? isMember : (canMessageUser && !isBlocked && !forceHideInputs);

  const wallpaperStyle = safeDesign.wallpaper !== 'default' 
    ? { backgroundImage: `url(${safeDesign.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  return (
    <div className="flex flex-col h-[100dvh] -mx-6 -my-6 bg-[#ebf0f5] dark:bg-[#0e1621] relative overflow-hidden animate-in fade-in">
      
      <div 
        className={`absolute inset-0 z-0 opacity-100 transition-all duration-300 ${safeDesign.wallpaper === 'default' ? 'telegram-bg dark:opacity-30' : ''}`} 
        style={wallpaperStyle}
      ></div>

      {/* --- ОБНОВЛЕННАЯ ШАПКА --- */}
      <div className="px-2 py-1.5 bg-white/70 dark:bg-[#1c1c1d]/70 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 z-30 relative min-h-[52px]">
        
        {/* Левая часть: Стрелка назад */}
        <div className="flex items-center z-10">
          <button onClick={() => navigate('/chats')} className="text-[#007aff] dark:text-[#32ade6] p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex items-center shrink-0">
            <ArrowLeft size={28} strokeWidth={1.5} />
          </button>
        </div>

        {/* Центральная часть: Имя и статус (Абсолютное позиционирование для идеального центра) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-[60%] pointer-events-none z-0 mt-0.5">
          <h3 className="font-semibold text-[17px] text-black dark:text-white leading-tight flex items-center justify-center gap-1 w-full truncate">
            {isRoom ? roomInfo.name : targetUser.name}
            {isRoom && roomInfo.is_private == 1 && <Lock size={12} className="text-zinc-400 shrink-0"/>}
            {isSecretChat && <Lock size={12} className="text-[#34c759] shrink-0" />}
            
            {/* ИКОНКА ТОРТИКА */}
            {!isRoom && targetUser?.birthday && checkIsBirthday(targetUser.birthday) && canSeeInfo('privacy_birthday') && (
              <Cake size={16} className="text-pink-500 ml-0.5 shrink-0 animate-bounce" />
            )}
          </h3>
          
          {isRoom ? (
            <p className="text-[13px] text-[#8e8e93] truncate">{roomInfo.members_count} участников</p>
          ) : isPartnerTyping ? (
            <p className="text-[13px] text-[#007aff] dark:text-[#32ade6] font-medium animate-pulse truncate">печатает...</p>
          ) : (
            <p className="text-[13px] text-[#8e8e93] truncate">
              {(new Date() - new Date(targetUser.last_seen)) < 300000 ? 'в сети' : 'был(а) недавно'}
            </p>
          )}
        </div>

        {/* Правая часть: Аватарка (она же кнопка меню) */}
        {/* Правая часть: Кнопка звонка + Аватарка */}
        <div className="flex items-center shrink-0 z-10 relative pr-1 gap-2">
          
          {/* Кнопка звонка (только для личных чатов) */}
          {!isRoom && canCall && !isBlocked && (
            <button 
              onClick={() => initiateCall(targetUser)} // <-- ТЕПЕРЬ ПЕРЕДАЕМ targetUser
              className="text-[#007aff] dark:text-[#32ade6] p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex items-center justify-center shrink-0"
            >
              <Phone size={26} strokeWidth={1.5} />
            </button>
          )}

          {/* Аватарка (она же кнопка меню) */}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowChatMenu(!showChatMenu); setActiveMenuId(null); }} 
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white active:scale-95 transition-transform shadow-sm"
          >
            {isRoom ? <Users size={18}/> : (targetUser?.avatar_data ? <GraphicRenderer target="avatar_small" mode={targetUser.avatar_mode} data={targetUser.avatar_data} /> : targetUser?.name.charAt(0))}
          </button>
          
          {/* Меню шапки */}
          <AnimatePresence>
            {showChatMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden py-1 z-50"
              >
                {isRoom ? (
                  <>
                    {['owner', 'admin'].includes(roomInfo.role) && (
                      <button onClick={() => { setShowChatMenu(false); setShowRoomSettings(true); }} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-black/5 transition">
                        <Settings size={18} className="text-[#8e8e93]" /> Настройки
                      </button>
                    )}
                    <button onClick={handleLeaveRoom} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-[#ff3b30] hover:bg-red-50 dark:hover:bg-[#ff3b30]/10 transition">
                      <LogOut size={18} /> Покинуть группу
                    </button>
                    {roomInfo.role === 'owner' && (
                      <button onClick={handleDeleteRoom} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-[#ff3b30] hover:bg-red-50 dark:hover:bg-[#ff3b30]/10 transition">
                        <Trash2 size={18} /> Удалить группу
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => { setShowClearModal(true); setShowChatMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-black/5 transition">
                      <Eraser size={18} className="text-[#8e8e93]" /> Очистить историю
                    </button>
                    <div className="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                    <button onClick={handleToggleBlock} className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-[#ff3b30] hover:bg-red-50 dark:hover:bg-[#ff3b30]/10 transition">
                      <Ban size={18} /> {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isSecretChat && (
        <div className="flex justify-center mt-2 z-10 animate-in fade-in">
          <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl max-w-sm text-center text-[13px] font-medium shadow-sm">
            Секретный чат. Сообщения защищены.
          </div>
        </div>
      )}

      <AnimatePresence>
        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-16 left-1/2 z-[1000] bg-red-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-red-500/20 font-medium text-[14px] whitespace-nowrap flex items-center gap-2"
          >
            <AlertTriangle size={18} />
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ИСТОРИЯ СООБЩЕНИЙ --- */}
      <div 
        onScroll={handleScroll}
        className="flex-1 p-4 space-y-1 overflow-y-auto chat-scroll relative z-10" 
        style={{ position: 'absolute', width: '100%', height: '100%', paddingBottom: '90px', paddingTop: '70px',
                WebkitUserSelect: 'none', WebkitTouchCallout: 'none' 
              }}
      >
        {pinnedMessagesList.length > 0 && (
          <div 
            className="sticky top-0 z-30 bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl border-b border-zinc-200/50 dark:border-black/20 flex items-center p-2 px-4 gap-3 mb-4 shadow-sm cursor-pointer animate-in slide-in-from-top-4 overflow-hidden"
            onClick={() => scrollToMessage(activePinnedMsg.id)}
          >
            {/* Индикаторы количества закрепов сбоку (как в ТГ) */}
            <div className="flex gap-0.5">
              <div className="w-[3px] h-9 bg-[#007aff] rounded-full"></div>
              {pinnedMessagesList.length > 1 && (
                <div className="w-[3px] h-9 bg-[#007aff]/30 rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#007aff]">Закреплённое сообщение</p>
              <p className="text-[14px] text-zinc-600 dark:text-zinc-300 truncate">
                {activePinnedMsg.message_type === 'image' ? '📸 Фотография' 
                 : activePinnedMsg.message_type === 'voice' ? '🎤 Голосовое сообщение' 
                 : activePinnedMsg.message}
              </p>
            </div>

            {/* Если закрепов много, правая сторона переключает их */}
            {pinnedMessagesList.length > 1 ? (
              <div 
                className="pl-3 py-2 border-l border-black/5 dark:border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPinnedIndex((prev) => (prev + 1) % pinnedMessagesList.length);
                }}
              >
                <div className="text-[12px] font-medium text-zinc-400 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full">
                  {currentPinnedIndex + 1}/{pinnedMessagesList.length}
                </div>
              </div>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); handlePinMessage(activePinnedMsg); }} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];
          const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
          const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

          return (
            <div 
              key={msg.id} 
              id={`msg-${msg.id}`} // <--- ВОТ ЗДЕСЬ МЫ ПРИСВОИЛИ ID ДЛЯ СКРОЛЛА
              className={`flex flex-col ${isFirstInGroup ? 'mt-3' : 'mt-0.5'} transition-colors duration-500 rounded-xl ${highlightedMsgId === msg.id ? 'bg-black/10 dark:bg-white/10 shadow-[0_0_10px_rgba(0,122,255,0.2)]' : ''}`}
            >
              {isRoom && isFirstInGroup && msg.sender_id !== currentUser.id && (
                <div className="text-[13px] font-semibold text-[#007aff] mb-1 ml-14">
                  {msg.sender_name || 'Пользователь'}
                </div>
              )}
              <MessageBubble 
                msg={msg} 
                isMe={msg.sender_id === currentUser.id}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                currentUser={currentUser}
                onReply={(m) => { setReplyingTo(m); setEditingMessage(null); }}
                onEdit={(m) => { setEditingMessage(m); setInputText(m.message); }}
                onDelete={handleDeleteMessage}
                onForward={(m) => { 
                  setForwardMsg(m); 
                  loadChatsForForward(); 
                }}
                onPin={handlePinMessage}
                onReact={handleReact}
                chatDesign={safeDesign}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[70px] bg-gradient-to-t from-[#ebf0f5] dark:from-[#0e1621] to-transparent pointer-events-none z-20" />

      {/* --- ОБНОВЛЕННАЯ ПАНЕЛЬ ВВОДА (IOS TELEGRAM STYLE) --- */}
      {isBlocked && !isRoom ? (
        <div className="bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl px-4 py-4 flex flex-col items-center shrink-0 z-20 border-t border-zinc-200/50 dark:border-black/20">
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-2">Пользователь заблокирован</p>
          <button onClick={handleToggleBlock} disabled={isActionLoading} className="text-[#007aff] font-semibold text-[15px]">Разблокировать</button>
        </div>
      ) : isRoom && !isMember ? (
        <div className="bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl p-4 flex justify-center shrink-0 z-20">
          <button onClick={handleJoinRoom} className="w-full max-w-md bg-[#007aff] text-white font-semibold py-3 rounded-2xl">
            {roomInfo.type === 'channel' ? 'Подписаться' : 'Вступить'}
          </button>
        </div>
      ) : canWrite ? (
        <div className="shrink-0 relative z-30 pb-safe" style={{ position: 'absolute', bottom: 0, width: '100%' }}>

          {/* --- КНОПКА ПРОКРУТКИ ВНИЗ --- */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
                className="z-40 flex justify-end w-full pointer-events-none"
                style={{ padding: '25px 25px 10px' }}
              >
                <button
                  onClick={scrollToBottom}
                  className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl flex items-center justify-center text-zinc-500 dark:text-[#8e8e93] hover:text-[#007aff] transition-colors border border-black/5 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:scale-95 pointer-events-auto"
                >
                  <ChevronDown size={26} strokeWidth={1.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {replyingTo && (
              <motion.div 
                initial={{ height: 0, opacity: 0, y: 10 }} 
                animate={{ height: 'auto', opacity: 1, y: 0 }} 
                exit={{ height: 0, opacity: 0, y: 10 }} 
                className="overflow-hidden w-full max-w-4xl mx-auto px-[25px]" // Отступы синхронизированы с полем ввода
              >
                {/* Скругленный плавающий блок ответа */}
                <div className="flex items-center justify-between px-3 py-2 mb-2 bg-white dark:bg-[#1c1c1e] rounded-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Синяя полоска слева */}
                    <div className="w-[3px] h-9 bg-[#007aff] rounded-full"></div>
                    
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-[13px] font-semibold text-[#007aff] leading-tight mb-0.5">
                        {replyingTo.sender_name}
                      </p>
                      <p className="text-[14px] text-zinc-500 dark:text-[#8e8e93] truncate leading-tight">
                        {replyingTo.message}
                      </p>
                    </div>
                  </div>
                  
                  {/* Кнопка закрытия (крестик) */}
                  <button 
                    onClick={() => setReplyingTo(null)} 
                    className="text-[#8e8e93] hover:text-black dark:hover:text-white p-1.5 transition-colors bg-black/5 dark:bg-white/5 rounded-full ml-2 shrink-0"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-1.5 max-w-4xl mx-auto w-full select-none" style={{ padding: '5px 25px 25px 25px' }}>
            <button 
              onClick={() => setIsOneTimeMedia(!isOneTimeMedia)}
              className={`w-[38px] h-[38px] mb-[1px] shrink-0 rounded-full flex items-center justify-center transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${isOneTimeMedia ? 'bg-red-500 text-white' : 'bg-white dark:bg-[#1c1c1e] text-zinc-500 dark:text-[#8e8e93]'}`}
            >
              {/* Можешь использовать иконку Flame из lucide-react */}
              <Flame size={20} strokeWidth={2} /> 
            </button>

            {/* 1. СКРЕПКА (ОТДЕЛЬНЫЙ КРУГ) */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading || recordState !== 'idle'}
              className="w-[38px] h-[38px] mb-[1px] shrink-0 rounded-full bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-zinc-500 dark:text-[#8e8e93] disabled:opacity-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              {isUploading ? <Loader2 size={22} className="animate-spin text-[#007aff]" /> : <Paperclip size={22} strokeWidth={1.5} className="transform -rotate-45" />}
            </button>

            {/* 2. ПОЛЕ ВВОДА (СКРУГЛЕННЫЙ ОСТРОВОК) */}
            <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-[20px] flex items-end relative min-h-[40px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
              {recordState !== 'idle' ? (
                <div className="flex-1 flex items-center justify-between px-3 py-[10px] w-full bg-white dark:bg-[#1c1c1e] z-50 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#ff3b30] rounded-full animate-pulse"></div>
                    <span className="font-mono text-[#ff3b30] font-semibold text-[15px]">{formatDuration(recordingDuration)}</span>
                    {recordState === 'pressing' && (
                      <span className="text-[#8e8e93] text-[13px] animate-pulse whitespace-nowrap ml-1">← Отмена</span>
                    )}
                    {recordState === 'locked' && (
                      <span className="text-[#007aff] text-[13px] font-semibold ml-1">ЗАПИСЬ</span>
                    )}
                  </div>
                  <button onClick={cancelRecording} className="text-[#8e8e93] hover:text-[#ff3b30] transition-colors p-0.5">
                    <X size={18} strokeWidth={2}/>
                  </button>
                </div>
              ) : (
                <>
                  <textarea 
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendOrEdit(); } }}
                    placeholder="Сообщение"
                    className="flex-1 bg-transparent resize-none outline-none text-[16px] pl-4 pr-1 py-[9px] text-black dark:text-white placeholder:text-[#8e8e93] max-h-32 hide-scrollbar"
                    rows="1"
                  />
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className="p-2 mb-[1px] mr-[2px] text-zinc-400 dark:text-[#8e8e93] hover:text-[#007aff] transition-colors shrink-0 relative flex items-center justify-center w-10 h-10"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showEmojiPicker ? (
                        <motion.div
                          key="keyboard"
                          initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                          transition={{ duration: 0.15 }}
                          className="absolute"
                        >
                          <Keyboard size={24} strokeWidth={1.5} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="sticker"
                          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.15 }}
                          className="absolute"
                        >
                          <Sticker size={24} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </>
              )}
            </div>

            {/* 3. КНОПКА МИКРОФОНА / ОТПРАВКИ (ОТДЕЛЬНЫЙ КРУГ) */}
            <div 
              className="relative shrink-0 flex items-center justify-center w-[38px] h-[38px] mb-[1px] select-none touch-none"
              style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
            >
              {/* 1. АНИМАЦИЯ МИКРОФОНА (твой старый код) */}
              <AnimatePresence>
                {recordState !== 'idle' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.4, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 bg-[#007aff]/20 rounded-full z-0 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* 2. НОВОЕ ВСПЛЫВАЮЩЕЕ МЕНЮ ОТПРАВКИ */}
              <AnimatePresence>
                {showSendMenu && inputText.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-3 w-56 bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden py-1 z-50 origin-bottom-right"
                  >
                    <button 
                      onClick={() => handleSendOrEdit(true, null)} 
                      className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-black/5 transition cursor-pointer"
                    >
                      <BellOff size={18} className="text-[#8e8e93]" /> Отправить без звука
                    </button>
                    <button 
                      onClick={() => { setShowSendMenu(false); setShowScheduleModal(true); }} 
                      className="w-full px-4 py-3 flex items-center gap-3 text-[15px] font-medium text-black dark:text-white hover:bg-black/5 transition cursor-pointer"
                    >
                      <CalendarClock size={18} className="text-[#007aff]" /> Отправить позже
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. КНОПКА ОТПРАВКИ/МИКРОФОНА (с новыми обработчиками) */}
              <button 
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (inputText.trim()) setShowSendMenu(true);
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={cancelRecording} 
                onPointerLeave={recordState === 'pressing' ? handlePointerUp : null}
                onClick={(e) => {
                  if (showSendMenu) return; // Игнорируем обычный клик, если открыто меню
                  if (inputText.trim() || editingMessage) handleSendOrEdit(false, null);
                  else if (recordState === 'locked') stopAndSend();
                }}
                disabled={isUploading}
                className={`z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-300 outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                  (recordState !== 'idle' || inputText.trim() || editingMessage) 
                    ? 'bg-[#007aff] text-white' 
                    : 'bg-white dark:bg-[#1c1c1e] text-zinc-500 dark:text-[#8e8e93] hover:text-[#007aff]'
                } ${recordState !== 'idle' ? 'scale-110 shadow-md' : ''}`}
              >
                {(inputText.trim() || editingMessage || recordState === 'locked') ? (
                  <Send size={18} className="translate-x-[1px] translate-y-[1px]" strokeWidth={2} />
                ) : (
                  <Mic size={22} strokeWidth={1.5} className={recordState !== 'idle' ? 'animate-pulse text-white' : ''} />
                )}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ y: 20, opacity: 0, height: 0 }} 
                animate={{ y: 0, opacity: 1, height: window.innerWidth < 768 ? '45vh' : 350 }} 
                exit={{ y: 20, opacity: 0, height: 0 }} 
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="w-full border-t border-zinc-200/50 dark:border-black/20 overflow-hidden flex flex-col bg-[#ebf0f5] dark:bg-[#0e1621]"
              >
                {/* Навигация (Стикеры, Гифки, Эмодзи) */}
                <div className="flex justify-center gap-6 px-4 py-2 border-b border-zinc-200/50 dark:border-white/5 bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl shrink-0">
                  <button onClick={() => setMediaTab('gifs')} className={`text-[13px] font-bold uppercase transition-colors px-2 py-1 ${mediaTab === 'gifs' ? 'text-[#007aff] border-b-2 border-[#007aff]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'}`}>GIF</button>
                  <button onClick={() => setMediaTab('stickers')} className={`text-[13px] font-bold uppercase transition-colors px-2 py-1 ${mediaTab === 'stickers' ? 'text-[#007aff] border-b-2 border-[#007aff]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'}`}>Стикеры</button>
                  <button onClick={() => setMediaTab('emoji')} className={`text-[13px] font-bold uppercase transition-colors px-2 py-1 ${mediaTab === 'emoji' ? 'text-[#007aff] border-b-2 border-[#007aff]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'}`}>Эмодзи</button>
                </div>

                {/* Поиск */}
                <div className="px-3 py-2 shrink-0 bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl">
                  <div className="bg-zinc-100 dark:bg-black/30 rounded-[10px] flex items-center px-3 py-1.5 border border-transparent dark:border-white/5">
                    <Search size={18} className="text-zinc-400 mr-2" />
                    <input type="text" placeholder="Поиск..." className="bg-transparent text-[15px] outline-none w-full text-black dark:text-white placeholder:text-zinc-500" />
                  </div>
                </div>

                {/* Контент вкладок */}
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-2 relative bg-white dark:bg-[#1c1c1d]">
                  {mediaTab === 'emoji' && (
                    <div className="absolute inset-0">
                      <style>{`.EmojiPickerReact .epr-search-container { display: none !important; }`}</style>
                      <EmojiPicker 
                        emojiStyle="apple"
                        onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                        width="100%" height="100%"
                        searchDisabled={true}
                        skinTonesDisabled={true}
                      />
                    </div>
                  )}

                  {mediaTab === 'stickers' && (
                    <div className="flex flex-col h-full">
                      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-2 border-b border-zinc-100 dark:border-white/5 shrink-0 sticky top-0 bg-white dark:bg-[#1c1c1d] z-10 pt-1">
                        {stickerPacks.map(pack => (
                          <button 
                            key={pack.id} 
                            onClick={() => setActiveStickerPack(pack.id)}
                            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all ${activeStickerPack === pack.id ? 'bg-[#007aff]/10 border border-[#007aff]/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                          >
                            <img src={pack.cover_url} alt={pack.title} className="w-8 h-8 object-contain drop-shadow-sm" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto hide-scrollbar">
                        {stickerPacks.map(pack => (
                          <div key={pack.id} className={activeStickerPack === pack.id ? 'block' : 'hidden'}>
                            <p className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mb-2 px-1">{pack.title}</p>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pb-4">
                              {pack.stickers.map(sticker => (
                                <button 
                                  key={sticker.id} 
                                  onClick={() => handleSendMedia(sticker.url, 'sticker')}
                                  className="aspect-square p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                                >
                                  <img src={sticker.url} alt={sticker.emoji} loading="lazy" decoding="async" className="w-full h-full object-contain hover:scale-110 transition-transform" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mediaTab === 'gifs' && (
                    <div className="h-full overflow-y-auto hide-scrollbar pb-4">
                      {gifs.length === 0 ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" /></div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1">
                          {gifs.map(gif => (
                            <button 
                              key={gif.id} 
                              onClick={() => handleSendMedia(gif.media[0].gif.url, 'gif')}
                              className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative cursor-pointer group overflow-hidden"
                            >
                              <img src={gif.media[0].tinygif.url} alt="gif" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white/85 dark:bg-[#1c1c1d]/85 backdrop-blur-xl px-4 py-4 text-center text-[15px] text-zinc-500 dark:text-[#8e8e93] shrink-0 z-30 border-t border-zinc-200/50 dark:border-black/20">
          {isRoom ? 'Только администраторы могут писать сообщения' : 'Пользователь ограничил круг лиц, которые могут отправлять ему сообщения'}
        </div>
      )}

      {showForwardModal && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1c1c1d] w-full max-w-sm rounded-[24px] flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-black dark:text-white">Переслать сообщение</h3>
              <button onClick={() => setShowForwardModal(false)}><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div 
                onClick={() => confirmForward({ is_saved_archive: true })} 
                className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors border-b border-black/5 dark:border-white/5 mb-1"
              >
                <div className="w-12 h-12 bg-[#007aff] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Bookmark size={24} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black dark:text-white">Избранное</p>
                  <p className="text-xs text-[#007aff] font-medium">Ваше личное облако</p>
                </div>
              </div>

              {myChatsList.map(chat => (
                <div 
                  key={chat.contact_id} 
                  // ВОТ ТУТ МЫ ВЫЗЫВАЕМ confirmForward ПРИ КЛИКЕ НА ЧАТ
                  onClick={() => confirmForward(chat)} 
                  className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold shrink-0">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black dark:text-white truncate">{chat.name}</p>
                    <p className="text-xs text-zinc-500">{chat.is_group ? 'Группа' : 'Личный чат'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1c1c1d] w-full max-w-sm rounded-[24px] p-6 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-center text-black dark:text-white mb-2">Отправить позже</h3>
              <p className="text-[14px] text-center text-zinc-500 dark:text-[#8e8e93] mb-6">Выберите дату и время отправки сообщения.</p>
              
              <input 
                type="datetime-local" 
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)} // Нельзя выбрать прошлое
                className="w-full bg-zinc-100 dark:bg-black/30 text-black dark:text-white px-4 py-3 rounded-xl mb-6 outline-none border border-transparent focus:border-[#007aff]"
              />
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleSendOrEdit(false, scheduleDateTime)} 
                  disabled={!scheduleDateTime}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-[#007aff] hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Запланировать отправку
                </button>
                <button 
                  onClick={() => { setShowScheduleModal(false); setScheduleDateTime(''); }} 
                  className="w-full py-3.5 rounded-xl font-semibold text-black dark:text-white bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* МОДАЛКА ОЧИСТКИ */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1c1c1d] w-full max-w-sm rounded-[24px] p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-center text-black dark:text-white mb-2">Очистить историю?</h3>
              <p className="text-[14px] text-center text-zinc-500 dark:text-[#8e8e93] mb-6">Все сообщения в этом чате будут удалены навсегда.</p>
              
              {!isRoom && (
                <label className="flex items-center gap-3 mb-6 cursor-pointer bg-zinc-50 dark:bg-black/20 p-3 rounded-xl">
                  <input type="checkbox" checked={clearForBoth} onChange={e => setClearForBoth(e.target.checked)} className="w-5 h-5 rounded border-zinc-300 text-[#ff3b30] focus:ring-[#ff3b30] dark:bg-black" />
                  <span className="text-[15px] font-medium text-black dark:text-white">Также удалить для {targetUser?.name}</span>
                </label>
              )}
              
              <div className="flex flex-col gap-2">
                <button onClick={handleClearHistory} disabled={isActionLoading} className="w-full py-3.5 rounded-xl font-semibold text-white bg-[#ff3b30] hover:bg-red-600 flex items-center justify-center gap-2">
                  {isActionLoading && <Loader2 size={16} className="animate-spin" />} Очистить
                </button>
                <button onClick={() => setShowClearModal(false)} className="w-full py-3.5 rounded-xl font-semibold text-black dark:text-white bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20">
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showRoomSettings && isRoom && (
        <RoomSettingsModal room={roomInfo} currentUser={currentUser} onClose={() => setShowRoomSettings(false)} />
      )}
    </div>
  );
}

function MobileNav({ user, openSettings, closeSettings, isSettingsOpen }) {
  // Базовые стили для кнопок навигации
  const itemClass = "flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer transition-colors";
  
  // Функция для стилизации (активный / неактивный)
  const getStyles = (isActive) => {
    // Если открыты настройки, визуально "гасим" остальные вкладки
    const actuallyActive = isActive && !isSettingsOpen;
    return {
      icon: actuallyActive ? "text-blue-500 dark:text-white" : "text-zinc-400 dark:text-zinc-500",
      text: `text-[11px] font-medium tracking-tight ${actuallyActive ? "text-blue-500 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`
    };
  };

  // Стили специально для кнопки настроек
  const settingsStyles = {
    icon: isSettingsOpen ? "text-blue-500 dark:text-white" : "text-zinc-400 dark:text-zinc-500",
    text: `text-[11px] font-medium tracking-tight ${isSettingsOpen ? "text-blue-500 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/85 dark:bg-[#1a1a1c]/85 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-800/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[64px] px-1 pt-1">
        
        <NavLink to="/" onClick={closeSettings} className={itemClass}>
          {({ isActive }) => {
            const styles = getStyles(isActive);
            return (
              <>
                <Home size={26} className={styles.icon} strokeWidth={isActive && !isSettingsOpen ? 2.5 : 2} />
                <span className={styles.text}>Лента</span>
              </>
            );
          }}
        </NavLink>

        <NavLink to="/chats" onClick={closeSettings} className={itemClass}>
          {({ isActive }) => {
            const styles = getStyles(isActive);
            return (
              <>
                <MessageCircle size={26} className={styles.icon} strokeWidth={isActive && !isSettingsOpen ? 2.5 : 2} />
                <span className={styles.text}>Чаты</span>
              </>
            );
          }}
        </NavLink>

        <NavLink to="/search" onClick={closeSettings} className={itemClass}>
          {({ isActive }) => {
            const styles = getStyles(isActive);
            return (
              <>
                <Search size={26} className={styles.icon} strokeWidth={isActive && !isSettingsOpen ? 2.5 : 2} />
                <span className={styles.text}>Поиск</span>
              </>
            );
          }}
        </NavLink>

        <NavLink to={`/@${user?.handle}`} onClick={closeSettings} className={itemClass}>
          {({ isActive }) => {
            const styles = getStyles(isActive);
            return (
              <>
                <User size={26} className={styles.icon} strokeWidth={isActive && !isSettingsOpen ? 2.5 : 2} />
                <span className={styles.text}>Профиль</span>
              </>
            );
          }}
        </NavLink>

        <button onClick={openSettings} className={itemClass}>
          <Settings size={26} className={settingsStyles.icon} strokeWidth={isSettingsOpen ? 2.5 : 2} />
          <span className={settingsStyles.text}>Настройки</span>
        </button>

      </div>
    </nav>
  );
}

function JoinRoomPage({ currentUser }) {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://api.goodfaceteam.ru/get_invite_info.php?hash=${hash}`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }, })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRoom(data.room);
        } else {
          setError("Эта ссылка устарела или недействительна.");
        }
      })
      .catch(() => setError("Ошибка соединения с сервером."))
      .finally(() => setIsLoading(false));
  }, [hash]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await fetch("https://api.goodfaceteam.ru/join_by_hash.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ hash: hash })
      });
      const data = await res.json();
      if (data.success) {
        // Успешно вступили! Кидаем пользователя в сам чат
        navigate(`/chat/room_${data.room_id}`);
      } else {
        alert(data.message);
        setIsJoining(false);
      }
    } catch (e) {
      alert("Ошибка при вступлении.");
      setIsJoining(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20 h-screen items-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in-95">
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4"><X size={24} /></div>
      <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Приглашение не найдено</h2>
      <p className="text-zinc-500 mb-6">{error}</p>
      <button onClick={() => navigate('/')} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">На главную</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-[32px] shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full text-center">
        <div className="w-20 h-20 mx-auto bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-bold mb-4">
          <Users size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1 leading-tight">{room.name}</h2>
        <p className="text-sm text-zinc-500 mb-8 font-medium">{room.members_count} участников</p>
        
        <button 
          onClick={handleJoin} 
          disabled={isJoining}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[15px] py-4 rounded-2xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
        >
          {isJoining ? <Loader2 size={20} className="animate-spin" /> : 'Вступить в группу'}
        </button>
        <button onClick={() => navigate('/')} className="w-full mt-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold text-sm py-2 transition">Отмена</button>
      </div>
    </div>
  );
}

// --- ГЛАВНЫЙ LAYOUT (Сайдбары и Модалка настроек) ---
function AppLayout({ user, onLogout, theme, setTheme }) {
  const location = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [settingsTab, setSettingsTab] = useState(() => {
    // Проверяем, что код выполняется в браузере (защита для Next.js/SSR)
    if (typeof window !== 'undefined') {
      // Если ширина экрана >= 768px (ПК и планшеты) — открываем вкладку по умолчанию
      if (window.innerWidth >= 768) {
        return 'account';
      }
    }
    // Для телефонов (ширина < 768px) возвращаем null
    return null;
  });

  const [editName, setEditName] = useState(user?.name || '');
  const [editHandle, setEditHandle] = useState(user?.handle || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editBirthday, setEditBirthday] = useState(user?.birthday || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  const isFullHeight = location.pathname.includes('/chat/') || location.pathname.includes('/saved');

  const [reportData, setReportData] = useState({
    isOpen: false,
    targetType: null, // 'post' или 'user'
    targetId: null
  });

  const openReportModal = (type, id) => {
    setReportData({ isOpen: true, targetType: type, targetId: id });
  };

  const [appLang, setAppLang] = useState(localStorage.getItem('gudex_lang') || 'ru');
  const [chatDesign, setChatDesign] = useState(() => {
    const saved = localStorage.getItem('gudex_chatDesign');
    return saved ? JSON.parse(saved) : { 
      fontSize: 'medium', // small, medium, large
      wallpaper: 'default', // default, dark, pattern
      bubbleColor: 'blue', // blue, green, purple, pink
      appIcon: 'default' // default, dark, neon
    };
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  // --- ГЛОБАЛЬНЫЕ СТЕЙТЫ ЗВОНКОВ ---
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); 
  const [activeCallData, setActiveCallData] = useState(null);
  const [currentCallPartner, setCurrentCallPartner] = useState(null); // НОВОЕ: собеседник

  const iceCandidatesQueue = useRef([]);
  const pendingAccept = useRef(false);
  const callSavedRef = useRef(false);
  const [isBlacklistLoading, setIsBlacklistLoading] = useState(false);

  const sendSignal = (type, targetId, signalData = null) => {
    fetch("https://api.goodfaceteam.ru/call_signal.php", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      body: JSON.stringify({ target_id: targetId, type, data: signalData })
    });
  };

  const processQueuedCandidates = async () => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
    }
  };

  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch("https://api.goodfaceteam.ru/system_status.php");
        const data = await res.json();
        if (data.success) setIsMaintenance(data.maintenance);
      } catch(e){}
    };
    
    checkMaintenance();
    // Проверяем каждые 30 секунд в фоне, чтобы юзера выкинуло, если админ включит рубильник
    const int = setInterval(checkMaintenance, 30000); 
    return () => clearInterval(int);
  }, []);

  const startWebRTC = async (isCaller, partnerId, remoteOffer = null) => {
    if (pcRef.current) return;

    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      window.localStream = stream; // Сохраняем глобально для CallScreen (управление микрофоном)

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignal('candidate', partnerId, e.candidate);
      };

      pc.ontrack = (e) => {
        const incomingStream = e.streams[0] || new MediaStream([e.track]);
        setRemoteStream(incomingStream);
      };

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('offer', partnerId, offer);
      } else {
        const offerToUse = remoteOffer || activeCallData?.data;
        if (!offerToUse) return;
        await pc.setRemoteDescription(new RTCSessionDescription(offerToUse));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', partnerId, answer);
        processQueuedCandidates();
      }
    } catch (err) {
      console.error("[WebRTC] Ошибка:", err);
      stopWebRTC();
    }
  };

  const stopWebRTC = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setRemoteStream(null);
  };

  const [callErrorToast, setCallErrorToast] = useState(null); // Стейт для красивой ошибки

  const initiateCall = async (partner) => {
    setCurrentCallPartner(partner); 
    callSavedRef.current = false;
    setCallStatus('connecting');
    setIsCallOpen(true); // Временно открываем UI звонка
    
    try {
      const res = await fetch("https://api.goodfaceteam.ru/initiate_call.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ target_id: partner.id })
      });
      const data = await res.json();
      
      if (!data.success) {
        // Если сервер запретил звонок (приватность или блокировка)
        setIsCallOpen(false); // Прячем окно звонка
        setCallStatus('idle');
        setCurrentCallPartner(null);
        
        // Показываем красивый Popup на 3 секунды
        setCallErrorToast(data.message);
        setTimeout(() => setCallErrorToast(null), 3000);
      }
    } catch (e) { 
      console.error(e); 
      setIsCallOpen(false);
    }
  };

  const handleEndCallLocally = async (resultType) => {
    stopWebRTC();
    setIsCallOpen(false);
    setIsCallMinimized(false); // Сбрасываем сворачивание
    setCallStatus('idle');

    if (callSavedRef.current) return;
    callSavedRef.current = true;

    const amICaller = !activeCallData; 
    const partnerId = amICaller ? currentCallPartner?.id : activeCallData?.caller_id;
    
    if (amICaller && partnerId) {
      fetch("https://api.goodfaceteam.ru/send_message.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ receiver_id: partnerId, message: resultType, message_type: 'call' })
      });
    }
    
    setActiveCallData(null);
    setCurrentCallPartner(null);
  };

  useEffect(() => {
    if (!user) return;
    const pusher = new Pusher('28ce5463a647fcf817b0', { cluster: 'eu' });
    const userChannel = pusher.subscribe(`user_${user.id}`);

    userChannel.bind('incoming_call', (data) => {
      setActiveCallData(data);
      setIsCallOpen(true);
      setCallStatus('incoming');
      sendSignal('ping_back', data.caller_id);
    });

    userChannel.bind('call_response', async (data) => {
      if (data.type === 'ping_back') setCallStatus('ringing');
      else if (data.type === 'accept') {
        if (pcRef.current) return;
        setCallStatus('connected');
        startWebRTC(true, data.from_id);
      } 
      // НОВОЕ: ТОЧНАЯ ОБРАБОТКА СТАТУСОВ СБРОСА
      else if (['declined', 'missed', 'ended'].includes(data.type)) {
        handleEndCallLocally(data.type);
      }
      else if (data.type === 'offer') {
        setActiveCallData(prev => ({ ...prev, data: data.data }));
        if (pendingAccept.current) {
          pendingAccept.current = false;
          startWebRTC(false, data.from_id, data.data);
        }
      } 
      else if (data.type === 'answer') {
        if (pcRef.current && pcRef.current.signalingState === "have-local-offer") {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.data));
          processQueuedCandidates();
        }
      } 
      else if (data.type === 'candidate') {
        if (pcRef.current && pcRef.current.remoteDescription) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(data.data)).catch(() => {});
        } else {
          iceCandidatesQueue.current.push(data.data);
        }
      }
    });

    return () => {
      userChannel.unbind_all();
      userChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (settingsTab === 'blacklist') {
      const loadBlacklist = async () => {
        setIsBlacklistLoading(true);
        try {
          const res = await fetch("https://api.goodfaceteam.ru/get_blocked_users.php", {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success) setBlockedUsers(data.users);
        } catch (e) {
          console.error(e);
        } finally {
          setIsBlacklistLoading(false);
        }
      };
      loadBlacklist();
    }
  }, [settingsTab]);

  // Функция разблокировки (прямо из настроек)
  const handleUnblockUser = async (blockedId) => {
    try {
      const res = await fetch("https://api.goodfaceteam.ru/toggle_block.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ blocked_id: blockedId })
      });
      const data = await res.json();
      
      if (data.success && data.is_blocked === false) {
        // Моментально удаляем пользователя из списка в UI
        setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Авто-сохранение при изменениях
  useEffect(() => {
    localStorage.setItem('gudex_lang', appLang);
    localStorage.setItem('gudex_chatDesign', JSON.stringify(chatDesign));
  }, [appLang, chatDesign]);

  useEffect(() => {
    setShowSettings(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user || !user.id) return;

    // Берем device_id из localStorage (если ты его там сохраняешь при входе) 
    // или из самого объекта user (зависит от того, как ты устроил логин)
    const currentDevice = localStorage.getItem('device_id') || user.device_id;

    const checkGlobalSession = async () => {
      try {
        const response = await fetch(`https://api.goodfaceteam.ru/get_sessions.php`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({}), credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          // Проверяем, есть ли наш текущий девайс в списке активных сессий
          const mySessionStillAlive = data.sessions.some(s => s.device_id === currentDevice);
          
          // Если нас выкинули
          if (!mySessionStillAlive) {
            Cookies.remove('auth_session');
            localStorage.removeItem('user');
            setSessionTerminated(true); // Вызываем блокирующий попап
          }
        }
      } catch (error) {
        console.error("Ошибка проверки сессии:", error);
      }
    };

    checkGlobalSession(); // Проверка при старте
    const interval = setInterval(checkGlobalSession, 5000); // И каждые 5 сек

    return () => clearInterval(interval);
  }, [user]);

  const [privacy, setPrivacy] = useState({
    isPrivate: user?.is_private == 1,
    hideFollowers: user?.hide_followers == 1,
    hideFollowing: user?.hide_following == 1,
    ghostMode: localStorage.getItem('ghost_mode') === 'true',
    about: user?.privacy_about || 'all',
    gifts: user?.privacy_gifts || 'all',
    birthday: user?.privacy_birthday || 'all',
    messages: user?.privacy_messages || 'all',
    calls: user?.privacy_calls || 'followers',
  });

  const handlePrivacyToggle = async (settingKey, newValue) => {
    // 1. Сразу меняем UI, чтобы не было задержек
    const newPrivacyState = { ...privacy, [settingKey]: newValue };
    setPrivacy(newPrivacyState);

    if (settingKey === 'ghostMode') {
      localStorage.setItem('ghost_mode', newValue);
      return;
    }

    // 2. Отправляем на сервер ВСЕ поля
    try {
      await fetch("https://api.goodfaceteam.ru/update_privacy.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          is_private: newPrivacyState.isPrivate,
          hide_followers: newPrivacyState.hideFollowers,
          hide_following: newPrivacyState.hideFollowing,
          about: newPrivacyState.about,
          gifts: newPrivacyState.gifts,
          birthday: newPrivacyState.birthday,
          messages: newPrivacyState.messages,
          calls: newPrivacyState.calls
        })
      });
      
      // Обновляем куки для старых полей (новые пока можно не писать в куки, они придут с БД при рефреше)
      const updatedUser = { 
        ...user, 
        is_private: newPrivacyState.isPrivate, 
        hide_followers: newPrivacyState.hideFollowers, 
        hide_following: newPrivacyState.hideFollowing 
      };
      Cookies.set('auth_session', JSON.stringify(updatedUser), { expires: 7 });

    } catch (e) {
      console.error("Ошибка сохранения приватности", e);
      // Если ошибка - откатываем тумблер назад
      setPrivacy({ ...privacy, [settingKey]: !newValue });
    }
  };

  // Уведомления (храним в браузере, чтобы юзер мог отключить звук на конкретном ПК)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('gudex_notifs');
    return saved ? JSON.parse(saved) : { popups: true, sound: true };
  });

  useEffect(() => {
    localStorage.setItem('gudex_notifs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  const [sysNotifPermission, setSysNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleRequestSysNotif = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Ваш браузер не поддерживает фоновые уведомления. На iOS сайт нужно добавить на главный экран (Поделиться -> На экран Домой).");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setSysNotifPermission(permission);

      if (permission === 'granted') {
        // 1. Регистрируем Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');

        await navigator.serviceWorker.ready;
        
        // ВСТАВЬ СЮДА СВОЙ PUBLIC VAPID KEY (из Шага 2)
        const publicVapidKey = 'BCrC55s8vr6BCWh3FvrFA1QlcWj3wvDXP9WjsMQenC_vQu_YVt0ZyI7G8O0i3CD327jHKTBInnMqIr3YUIwkhCQ'; 
        
        // 2. Получаем подписку от браузера/ОС
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        // 3. Отправляем данные на бэкенд
        const subData = subscription.toJSON();

        if (!subData.keys || !subData.keys.p256dh) {
          alert("Критическая ошибка: Браузер не выдал ключи шифрования. Попробуйте переустановить PWA.");
          return;
        }
        
        const response = await fetch("https://api.goodfaceteam.ru/save_push_subscription.php", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            endpoint: subData.endpoint,
            p256dh: subData.keys.p256dh,
            auth: subData.keys.auth
          }),
          credentials: 'include'
        });

        const result = await response.text(); 
        alert("🚀 Ответ сервера: " + result);

        if (response.ok) {
          alert("🎉 Всё круто! Проверяй базу.");
        } else {
          alert("❌ Сервер вернул ошибку: " + response.status);
        }

      } else {
        alert("Вы отклонили запрос. Разрешите уведомления в настройках браузера.");
      }
    } catch (error) {
      // Дебаг-алерт №3: Если код упал
      alert("🚨 КРИТИЧЕСКАЯ ОШИБКА: " + error.message);
      console.error(error);
    }
  };

  // Функция сохранения аккаунта
  const handleSaveAccount = async () => {
    if (!editName.trim() || !editHandle.trim()) return;
    setIsSavingAccount(true);
    setAccountStatus(null);

    try {
      const res = await fetch("https://api.goodfaceteam.ru/update_account.php", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: editName, handle: editHandle, bio: editBio, birthday: editBirthday }) // Добавили birthday
      });
      const data = await res.json();
      
      if (data.success) {
        setAccountStatus({ type: 'success', text: 'Успешно сохранено!' });
        const updatedUser = { ...user, name: editName, handle: editHandle, bio: editBio, birthday: editBirthday }; // Обновили куки
        Cookies.set('auth_session', JSON.stringify(updatedUser), { expires: 7 });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setAccountStatus({ type: 'error', text: data.message });
      }
    } catch (e) {
      setAccountStatus({ type: 'error', text: 'Ошибка соединения' });
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Функция для стилизации активной ссылки
  const navLinkClass = ({ isActive }) => 
    `w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
      isActive 
        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' 
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#18181b]'
    }`;

  if (isMaintenance && user?.is_admin !== 1) {
    return (
      <div className="fixed inset-0 z-[9999999] bg-[#070514] flex items-center justify-center p-6 text-center selection:bg-transparent font-sans">
        
        {/* Фоновые свечения */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-red-600/20 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
            {/* Если нет иконки Server, замени на Settings или AlertTriangle */}
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse">
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>
            </svg>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Ведутся тех. работы</h1>
          <p className="text-zinc-400 text-[15px] mb-10 leading-relaxed font-medium">
            Платформа Gudex временно недоступна в связи с обновлением инфраструктуры и серверов. Мы скоро вернемся, спасибо за ожидание!
          </p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-white text-black font-black text-[15px] py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] outline-none"
          >
            ПОВТОРИТЬ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      <AnimatePresence>
        {callErrorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-16 left-1/2 z-[999999] bg-red-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-red-500/20 font-medium text-[14px] whitespace-nowrap flex items-center gap-2"
          >
            <AlertTriangle size={18} />
            {callErrorToast}
          </motion.div>
        )}
      </AnimatePresence>
      
      <NotificationSystem currentUser={user} />
      <div className="max-w-[1200px] mx-auto flex h-full">
        
        {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
        <aside className="w-[280px] p-6 hidden md:flex flex-col">
          <div className="relative mb-10 w-fit">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
              gudex.
            </h1>
            <span className="absolute -top-1.5 -right-7 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 opacity-70 selection:bg-transparent">
              beta
            </span>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavLink to="/" className={navLinkClass}>
              <Home size={22} /> <span className="text-lg">Лента</span>
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              <Search size={22} /> <span className="text-lg">Поиск</span>
            </NavLink>
            <NavLink to="/chats" className={navLinkClass}>
              <MessageCircle size={22} /> <span className="text-lg">Чаты</span>
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              <Bell size={22} /> <span className="text-lg">Уведомления</span>
            </NavLink>
            <NavLink to={`/@${user?.handle}`} className={navLinkClass}>
              <User size={22} /> <span className="text-lg">Профиль</span>
            </NavLink>
            {user?.is_admin === 1 && (
              <NavLink to="/admin" className={navLinkClass}>
                <Shield size={22} className="text-red-500" /> <span className="text-lg font-bold text-red-500">Админ-панель</span>
              </NavLink>
            )}
          </nav>

          <div className="space-y-1 mt-auto">
            <button onClick={() => setShowSettings(true)} className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#18181b] transition-all">
              <Settings size={20} /> Настройки
            </button>
            <button onClick={onLogout} className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </aside>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ (Здесь рендерятся страницы через Outlet) */}
        <main className="flex-1 h-full overflow-y-auto hide-scrollbar border-x border-zinc-100 dark:border-zinc-800/60">
          <div className={`max-w-[600px] mx-auto p-6 ${isFullHeight ? 'pb-6' : 'pb-28 md:pb-6'} min-h-full`}>
            <Outlet context={{ openSettings: () => setShowSettings(true), openReportModal, chatDesign, initiateCall }} />
          </div>
        </main>

        {/* ПРАВОЕ МЕНЮ */}
        <aside className="w-[320px] p-6 hidden lg:block">
          <div className="bg-zinc-50 dark:bg-[#18181b] rounded-3xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">Добро пожаловать!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Платформа для креативных людей. Ничего лишнего, только контент.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400 dark:text-zinc-600 font-medium px-2">
            <button onClick={() => setActiveLegalModal('terms')} className="hover:text-zinc-900 dark:hover:text-zinc-300 transition cursor-pointer">Условия</button>
            <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-zinc-900 dark:hover:text-zinc-300 transition cursor-pointer">Конфиденциальность</button>
            <button onClick={() => setActiveLegalModal('cookies')} className="hover:text-zinc-900 dark:hover:text-zinc-300 transition cursor-pointer">Cookies</button>
            <span>© 2026 gudex.</span>
          </div>
        </aside>

        {!isFullHeight && (
          <MobileNav 
            user={user} 
            openSettings={() => setShowSettings(!showSettings)} 
            closeSettings={() => setShowSettings(false)}
            isSettingsOpen={showSettings} 
          />
        )}
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО НАСТРОЕК --- */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowSettings(false)}></div>
          
          {/* ======================= ВЕРСИЯ ДЛЯ ПК (ТВОЙ ОРИГИНАЛЬНЫЙ КОД БЕЗ ИЗМЕНЕНИЙ) ======================= */}
          {/* Добавлено hidden md:flex, чтобы этот блок скрывался на мобилках */}
          <div className="hidden md:flex bg-white dark:bg-[#121212] w-full h-full md:h-[600px] md:max-w-3xl rounded-none md:rounded-3xl shadow-2xl relative z-10 flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 border-none md:border md:border-zinc-200 md:dark:border-zinc-800">
            
            {/* Меню настроек */}
            <div className={`w-full md:w-1/3 bg-zinc-50/50 dark:bg-[#18181b]/50 p-6 border-r border-zinc-100 dark:border-zinc-800/60 ${settingsTab && 'hidden md:block'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Настройки</h2>
                {/* Кнопка закрытия для мобилки в меню */}
                <button onClick={() => setShowSettings(false)} className="md:hidden p-2 text-zinc-400">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'account', icon: User, label: 'Аккаунт' },
                  { id: 'appearance', icon: Monitor, label: 'Оформление' },
                  { id: 'language', icon: Globe, label: 'Язык' },
                  { id: 'security', icon: Lock, label: 'Безопасность' },
                  { id: 'privacy', icon: Shield, label: 'Приватность' },
                  { id: 'notifications', icon: BellRing, label: 'Уведомления' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                      settingsTab === tab.id 
                        ? 'bg-white dark:bg-[#1c1c1e] shadow-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800/80'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </nav>
              {/* КНОПКА ВЫХОДА ТОЛЬКО ДЛЯ ТЕЛЕФОНОВ */}
              <div className="mt-auto pt-4 md:hidden">
                <button 
                  onClick={() => {
                    onLogout(); // Вызываем переданную функцию логаута
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-red-500 bg-red-50 dark:bg-red-500/10 transition-all active:scale-95 shadow-sm"
                >
                  <LogOut size={20} /> Выйти из аккаунта
                </button>
                {user?.is_admin === 1 && (
                <NavLink to="/admin" className={navLinkClass}>
                  <Shield size={22} className="text-red-500" /> <span className="text-lg font-bold text-red-500">Админ-панель</span>
                </NavLink>
                )}
            </div>
            </div>

            {/* КОНТЕНТ: на мобилке скрывается, если таб НЕ выбран */}
            <div className={`w-full md:w-2/3 p-8 relative overflow-y-auto hide-scrollbar bg-white dark:bg-[#121212] ${!settingsTab && 'hidden md:block'}`}>
              
              {/* Кнопка НАЗАД для мобилки */}
              {settingsTab && (
                <button onClick={() => setSettingsTab(null)} className="md:hidden flex items-center gap-2 text-blue-500 font-bold mb-6">
                  <ArrowLeft size={18} /> Назад
                </button>
              )}

              <button onClick={() => setShowSettings(false)} className="cursor-pointer absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition bg-zinc-100 dark:bg-zinc-800 rounded-full p-2">
                <X size={18} />
              </button>

              <div className="animate-in fade-in slide-in-from-right-4">
                
                {/* --- ВКЛАДКА: АККАУНТ --- */}
                {settingsTab === 'account' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Аккаунт</h3>
                    <div className="space-y-6">
                      
                      {accountStatus && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${accountStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                          {accountStatus.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                          {accountStatus.text}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Имя пользователя</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                        />
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          Ваше отображаемое имя. Его увидят другие пользователи в ленте и профиле. Можно менять сколько угодно раз (например, Александр или FriendlyFox).
                        </p>
                      </div>

                      <div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">О себе</label>
                          <textarea 
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            maxLength={160}
                            placeholder="Расскажите немного о себе..."
                            className="w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm resize-none min-h-[100px]" 
                          />
                          <div className="flex justify-end mt-1">
                            <span className={`text-[10px] font-bold ${editBio.length >= 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                              {editBio.length}/160
                            </span>
                          </div>
                        </div>

                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Тег</label>
                        <div className="relative mt-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                          <input 
                            type="text" 
                            value={editHandle}
                            onChange={(e) => setEditHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} // Запрещаем пробелы и спецсимволы
                            className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 pl-9 pr-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          Уникальный идентификатор профиля. Используется для ссылки на вашу страницу и упоминаний. Допускаются только латинские буквы, цифры и нижнее подчеркивание.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">День рождения</label>
                        <input 
                          type="date" 
                          value={editBirthday}
                          onChange={(e) => setEditBirthday(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                          style={{ colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }}
                        />
                      </div>

                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                        <button 
                          onClick={handleSaveAccount}
                          disabled={isSavingAccount || (editName === user.name && editHandle === user.handle && editBio === (user.bio || '') && editBirthday === (user.birthday || '')) || !editName || !editHandle}
                          className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                        >
                          {isSavingAccount && <Loader2 size={16} className="animate-spin" />}
                          Сохранить изменения
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* --- ВКЛАДКА: ОФОРМЛЕНИЕ --- */}
                {settingsTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Оформление</h3>

                    {/* 1. Тема приложения */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                      <div className="mb-4">
                        <p className="font-bold text-zinc-900 dark:text-white">Тема приложения</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {[
                          { id: 'light', label: 'Светлая', icon: Sun },
                          { id: 'dark', label: 'Темная', icon: Moon },
                          { id: 'system', label: 'Системная', icon: Monitor },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button" 
                            onClick={() => setTheme(item.id)} 
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                              theme === item.id
                                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent'
                            }`}
                          >
                            <item.icon size={18} />
                            <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Цвет сообщений (пузырей) */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                      <div className="mb-4">
                        <p className="font-bold text-zinc-900 dark:text-white">Цвет ваших сообщений</p>
                      </div>
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                        {[
                          { id: 'blue', color: 'bg-blue-500' },
                          { id: 'green', color: 'bg-emerald-500' },
                          { id: 'purple', color: 'bg-purple-500' },
                          { id: 'pink', color: 'bg-pink-500' },
                          { id: 'orange', color: 'bg-orange-500' },
                        ].map(c => (
                          <button 
                            key={c.id}
                            onClick={() => setChatDesign({...chatDesign, bubbleColor: c.id})}
                            className={`cursor-pointer w-12 h-12 rounded-full shrink-0 ${c.color} flex items-center justify-center transition-transform active:scale-90 shadow-md ${chatDesign.bubbleColor === c.id ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-[#18181b] ring-blue-500/50' : ''}`}
                          >
                            {chatDesign.bubbleColor === c.id && <Check size={20} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Размер текста */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                      <div className="mb-4">
                        <p className="font-bold text-zinc-900 dark:text-white">Размер шрифта чата</p>
                      </div>
                      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-[#121212] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Type size={16} className="text-zinc-400 shrink-0 ml-2" />
                        <input 
                          type="range" 
                          min="0" max="2" step="1" 
                          value={chatDesign.fontSize === 'small' ? 0 : chatDesign.fontSize === 'medium' ? 1 : 2}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChatDesign({...chatDesign, fontSize: val == 0 ? 'small' : val == 1 ? 'medium' : 'large'})
                          }}
                          className="flex-1 accent-blue-500 cursor-pointer" 
                        />
                        <Type size={24} className="text-zinc-400 shrink-0 mr-2" />
                      </div>
                      <div className="flex justify-between px-3 mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>Мелкий</span>
                        <span>Стандарт</span>
                        <span>Крупный</span>
                      </div>
                    </div>

                    {/* 4. Обои и Иконки */}
                    <div className="space-y-2">
                      <button className="cursor-pointer w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-100 text-pink-500 dark:bg-pink-500/20 rounded-xl"><ImageIcon size={20}/></div>
                          <span className="font-bold text-zinc-900 dark:text-white">Обои для чатов</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">По умолчанию</span>
                          <ChevronRight size={20} className="text-zinc-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* --- ВКЛАДКА: ЯЗЫК (ПК) --- */}
                {settingsTab === 'language' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Язык</h3>
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      {[
                        { id: 'ru', name: 'Русский', native: 'Русский' },
                        { id: 'en', name: 'Английский', native: 'English' },
                        { id: 'es', name: 'Испанский', native: 'Español' },
                      ].map((lang, index, arr) => (
                        <button 
                          key={lang.id}
                          onClick={() => setAppLang(lang.id)}
                          className={`cursor-pointer w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index !== arr.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}`}
                        >
                          <div className="text-left">
                            <p className="font-bold text-zinc-900 dark:text-white">{lang.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{lang.native}</p>
                          </div>
                          {appLang === lang.id && <Check className="text-blue-500" size={20} />}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-4 text-center px-4 leading-relaxed">
                      Смена языка переведет интерфейс платформы. Контент пользователей останется на языке оригинала.
                    </p>
                  </div>
                )}

                {settingsTab === 'wallpapers' && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white hidden md:block">Обои для чатов</h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'default', name: 'Классика', class: 'bg-[#e5ddd5] dark:bg-[#0f0f0f]' }, // Стандартный ТГ
                          { id: 'bg-zinc-900', name: 'Темный', class: 'bg-zinc-900' },
                          { id: 'bg-blue-50 dark:bg-blue-950', name: 'Небо', class: 'bg-blue-50 dark:bg-blue-950' },
                          { id: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950', name: 'Градиент', class: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950' },
                          { id: 'bg-emerald-50 dark:bg-emerald-950', name: 'Мята', class: 'bg-emerald-50 dark:bg-emerald-950' },
                          { id: 'bg-gradient-to-tr from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950', name: 'Персик', class: 'bg-gradient-to-tr from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950' },
                        ].map(wp => (
                          <button 
                            key={wp.id}
                            onClick={() => setChatDesign({...chatDesign, wallpaper: wp.id})}
                            className={`cursor-pointer relative aspect-[9/16] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-transform active:scale-95 border-2 ${chatDesign.wallpaper === wp.id ? 'border-blue-500' : 'border-transparent'}`}
                          >
                            {/* Сам фон превью */}
                            <div className={`absolute inset-0 ${wp.class} ${wp.id === 'default' ? 'telegram-bg' : ''}`}></div>
                            
                            {/* Галочка, если выбрано */}
                            {chatDesign.wallpaper === wp.id && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="bg-blue-500 rounded-full p-2">
                                  <Check size={24} className="text-white" />
                                </div>
                              </div>
                            )}

                            {/* Название */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30 backdrop-blur-sm">
                              <p className="text-white text-xs font-bold text-center">{wp.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                )}

                {/* --- ВКЛАДКА: БЕЗОПАСНОСТЬ --- */}
                {settingsTab === 'security' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Безопасность</h3>
                    <div className="bg-zinc-50 dark:bg-[#18181b] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Shield size={32} />
                      </div>
                      <h4 className="font-black text-lg text-zinc-900 dark:text-white mb-2">Настройки безопасности в Good Account</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[250px]">
                        Управление паролями, активными сессиями и защитой аккаунта происходит в едином центре.
                      </p>
                      <a 
                        href="https://account.goodfaceteam.ru" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                      >
                        Перейти в Good Account
                      </a>
                    </div>
                  </div>
                )}

                {/* --- ВКЛАДКА: ПРИВАТНОСТЬ --- */}
                {settingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white hidden md:block">Приватность</h3>

                    {/* Блок 1: Видимость профиля (Тумблеры) */}
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      <ToggleSwitch 
                        label="Режим призрака" 
                        description="Собеседники не увидят, что вы прочитали их сообщения."
                        checked={privacy.ghostMode} 
                        onChange={(v) => handlePrivacyToggle('ghostMode', v)} 
                      />
                      <ToggleSwitch 
                        label="Закрытый профиль" 
                        description="Только ваши подписчики смогут видеть ваши посты."
                        checked={privacy.isPrivate} 
                        onChange={(v) => handlePrivacyToggle('isPrivate', v)} 
                      />
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-4"></div>
                      <ToggleSwitch 
                        label="Скрыть подписчиков" 
                        description="Другие пользователи не увидят, сколько людей на вас подписано."
                        checked={privacy.hideFollowers} 
                        onChange={(v) => handlePrivacyToggle('hideFollowers', v)} 
                      />
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-4"></div>
                      <ToggleSwitch 
                        label="Скрыть подписки" 
                        description="Никто не сможет узнать, на кого вы подписаны."
                        checked={privacy.hideFollowing} 
                        onChange={(v) => handlePrivacyToggle('hideFollowing', v)} 
                      />
                    </div>

                    {/* Блок 2: Кто видит мою информацию */}
                    <div>
                      <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest ml-4 mb-2">Кто видит мою информацию</p>
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* О себе */}
                        <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-3">
                            <Info size={20} className="text-zinc-500" />
                            <span className="text-[17px] text-zinc-900 dark:text-white">О себе</span>
                          </div>
                          <div className="relative flex items-center">
                            <select value={privacy.about} onChange={(e) => handlePrivacyToggle('about', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                              <option value="all" className="text-black dark:text-white">Все</option>
                              <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                              <option value="nobody" className="text-black dark:text-white">Никто</option>
                            </select>
                            <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                          </div>
                        </div>

                        {/* Подарки */}
                        <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-3">
                            <Gift size={20} className="text-zinc-500" />
                            <span className="text-[17px] text-zinc-900 dark:text-white">Подарки</span>
                          </div>
                          <div className="relative flex items-center">
                            <select value={privacy.gifts} onChange={(e) => handlePrivacyToggle('gifts', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                              <option value="all" className="text-black dark:text-white">Все</option>
                              <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                              <option value="nobody" className="text-black dark:text-white">Никто</option>
                            </select>
                            <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                          </div>
                        </div>

                        {/* День рождения */}
                        <div className="w-full flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-zinc-500" />
                            <span className="text-[17px] text-zinc-900 dark:text-white">День рождения</span>
                          </div>
                          <div className="relative flex items-center">
                            <select value={privacy.birthday} onChange={(e) => handlePrivacyToggle('birthday', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                              <option value="all" className="text-black dark:text-white">Все</option>
                              <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                              <option value="nobody" className="text-black dark:text-white">Никто</option>
                            </select>
                            <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Блок 3: Кто может со мной связаться */}
                    <div>
                      <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest ml-4 mb-2">Кто может со мной связаться</p>
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Сообщения */}
                        <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-3">
                            <MessageCircle size={20} className="text-zinc-500" />
                            <span className="text-[17px] text-zinc-900 dark:text-white">Сообщения</span>
                          </div>
                          <div className="relative flex items-center">
                            <select value={privacy.messages} onChange={(e) => handlePrivacyToggle('messages', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                              <option value="all" className="text-black dark:text-white">Все</option>
                              <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                            </select>
                            <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                          </div>
                        </div>

                        {/* Звонки */}
                        <div className="w-full flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Phone size={20} className="text-zinc-500" />
                            <span className="text-[17px] text-zinc-900 dark:text-white">Звонки</span>
                          </div>
                          <div className="relative flex items-center">
                            <select value={privacy.calls} onChange={(e) => handlePrivacyToggle('calls', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                              <option value="all" className="text-black dark:text-white">Все</option>
                              <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                              <option value="nobody" className="text-black dark:text-white">Никто</option>
                            </select>
                            <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Блок 4: Черный список */}
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm mt-4">
                      <button onClick={() => setSettingsTab('blacklist')} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg">
                            <Ban size={18} className="text-red-500" />
                          </div>
                          <span className="text-[17px] font-medium text-zinc-900 dark:text-white">Черный список</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[15px] text-zinc-500">Показать</span>
                          <ChevronRight size={18} className="text-zinc-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* --- ВКЛАДКА: ЧЕРНЫЙ СПИСОК --- */}
                {settingsTab === 'blacklist' && (
                  <div className="flex flex-col h-full min-h-0">
                    
                    <div className="flex items-center gap-3 mb-6 hidden md:flex">
                      <button onClick={() => setSettingsTab('privacy')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Черный список</h3>
                    </div>

                    {isBlacklistLoading ? (
                      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
                    ) : blockedUsers.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in">
                        <Ban size={48} strokeWidth={1} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                        <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Нет заблокированных</h4>
                        <p className="text-sm text-zinc-500 max-w-[250px] mx-auto leading-relaxed">
                          Заблокированные пользователи не смогут писать вам сообщения и просматривать ваш профиль.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                        {blockedUsers.map((u, index) => (
                          <div key={u.id} className={`flex items-center justify-between p-3 pl-4 ${index !== blockedUsers.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}`}>
                            
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-900 dark:text-white shrink-0 overflow-hidden">
                                {u.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <div className="flex items-center gap-1">
                                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white truncate">{u.name}</p>
                                  {u.is_verified == 1 && <BadgeCheck size={14} className="text-blue-500" />}
                                </div>
                                <p className="text-xs text-zinc-500 truncate">@{u.handle}</p>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleUnblockUser(u.id)}
                              className="cursor-pointer ml-3 px-4 py-1.5 bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-xs font-bold transition-colors shrink-0"
                            >
                              Разблокировать
                            </button>
                            
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- ВКЛАДКА: УВЕДОМЛЕНИЯ --- */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white hidden md:block">Уведомления</h3>
                    
                    {/* НОВЫЙ БЛОК: Системные пуши */}
                    <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <BellRing className={sysNotifPermission === 'granted' ? 'text-emerald-500' : 'text-blue-500'} size={24} />
                        <h4 className="font-bold text-zinc-900 dark:text-white">Системные уведомления</h4>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        Получайте уведомления в фоновом режиме, даже если вы переключились на другую вкладку.
                      </p>
                      
                      {sysNotifPermission === 'granted' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-bold text-sm rounded-lg">
                          <CheckCircle2 size={16} /> Включено
                        </div>
                      ) : (
                        <button 
                          onClick={handleRequestSysNotif}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 w-full md:w-auto"
                        >
                          Включить в браузере
                        </button>
                      )}
                      
                      {sysNotifPermission === 'denied' && (
                        <p className="text-xs text-red-500 mt-3 font-medium">
                          Браузер блокирует уведомления. Разрешите их в настройках сайта (иконка 🔒 в адресной строке).
                        </p>
                      )}
                    </div>

                    {/* Старые внутренние настройки */}
                    <div className="space-y-3">
                      <ToggleSwitch 
                        label="Всплывающие окна на сайте" 
                        description="Показывать окошко в углу экрана, когда кто-то ставит лайк или подписывается на вас."
                        checked={notifPrefs.popups} 
                        onChange={(v) => setNotifPrefs({...notifPrefs, popups: v})} 
                      />
                      <ToggleSwitch 
                        label="Звук уведомлений" 
                        description="Проигрывать короткий звуковой сигнал при появлении нового события."
                        checked={notifPrefs.sound} 
                        onChange={(v) => setNotifPrefs({...notifPrefs, sound: v})} 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold text-center mt-6">
                      Эти настройки применяются только к текущему устройству
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>


          {/* ======================= ВЕРСИЯ ДЛЯ ТЕЛЕФОНА (IOS STYLE + FIX) ======================= */}
          {/* Добавлено flex md:hidden, чтобы этот блок показывался ТОЛЬКО на мобилках */}
          <div className="flex md:hidden w-full h-full bg-[#f2f2f7] dark:bg-[#121212] rounded-none shadow-2xl relative z-10 flex-col overflow-hidden animate-in slide-in-from-bottom-full mt-auto">
            
            {/* 1. ГЛАВНОЕ МЕНЮ (Показывается, если таб не выбран) */}
            {!settingsTab && (
              <div className="flex flex-col h-full w-full">
                {/* Шапка iOS */}
                <div className="flex justify-center items-center p-4 bg-[#f2f2f7] dark:bg-[#121212] sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <h2 className="text-[17px] font-semibold text-black dark:text-white">Настройки</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
                  {/* Группа 1: Профиль */}
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm">
                    <button onClick={() => setSettingsTab('account')} className="w-full flex items-center justify-between p-2 pl-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-blue-500 shadow-sm">
                          <User size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Аккаунт</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>
                  </div>

                  {/* Группа 2: Настройки */}
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm">
                    <button onClick={() => setSettingsTab('notifications')} className="w-full flex items-center justify-between p-2 pl-3 border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-red-500 shadow-sm">
                          <BellRing size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Уведомления и звуки</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>
                    
                    <button onClick={() => setSettingsTab('privacy')} className="w-full flex items-center justify-between p-2 pl-3 border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-slate-500 shadow-sm">
                          <Shield size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Конфиденциальность</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>

                    <button onClick={() => setSettingsTab('security')} className="w-full flex items-center justify-between p-2 pl-3 border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-green-500 shadow-sm">
                          <Lock size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Данные и память</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>

                    <button onClick={() => setSettingsTab('appearance')} className="w-full flex items-center justify-between p-2 pl-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-cyan-500 shadow-sm">
                          <Monitor size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Оформление</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>

                    <button onClick={() => setSettingsTab('language')} className="w-full flex items-center justify-between p-2 pl-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-indigo-500 shadow-sm">
                          <Globe size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Язык</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[15px] text-zinc-500">{appLang === 'ru' ? 'Русский' : 'English'}</span>
                        <ChevronRight size={20} className="text-zinc-400" />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm">
                    <button onClick={() => setActiveLegalModal('terms')} className="w-full flex items-center justify-between p-2 pl-3 border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-blue-500 shadow-sm">
                          <FileText size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Условия использования</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>

                    <button onClick={() => setActiveLegalModal('privacy')} className="w-full flex items-center justify-between p-2 pl-3 border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-slate-500 shadow-sm">
                          <Shield size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Конфиденциальность</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>

                    <button onClick={() => setActiveLegalModal('cookies')} className="w-full flex items-center justify-between p-2 pl-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-orange-500 shadow-sm">
                          <Cookie size={18} />
                        </div>
                        <span className="text-[17px] text-black dark:text-white">Использование Cookies</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-400" />
                    </button>
                  </div>

                  {/* --- Группа 2.5: Мини-игра (Мобилка) --- */}
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm border border-purple-500/20">
                    <button 
                      onClick={() => { setShowGame(true); setShowSettings(false); }} 
                      className="w-full flex items-center justify-between p-2 pl-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:bg-purple-100 dark:active:bg-purple-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white bg-gradient-to-tr from-purple-500 to-blue-500 shadow-sm">
                          <Gamepad2 size={18} />
                        </div>
                        <span className="text-[17px] font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                          Заработать планеты
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-purple-400" />
                    </button>
                  </div>

                  {/* Группа 3: Выход */}
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => { onLogout(); setShowSettings(false); }} 
                      className="w-full flex items-center justify-center p-3 text-[17px] font-medium text-red-500 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors"
                    >
                      Выйти из аккаунта
                    </button>
                  </div>

                  {/* Админка */}
                  {user?.is_admin === 1 && (
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[10px] mb-6 overflow-hidden shadow-sm">
                      <NavLink to="/admin" className="w-full flex items-center justify-center p-3 text-[17px] font-medium text-red-500 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors gap-2">
                        <Shield size={18} /> Админ-панель
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. КОНТЕНТ ВКЛАДКИ (Показывается, если таб выбран) */}
            {settingsTab && (
              <div className="flex flex-col h-full w-full bg-white dark:bg-[#121212] min-h-0">
                {/* Шапка контента */}
                <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                  <button 
                    onClick={() => settingsTab === 'blacklist' ? setSettingsTab('privacy') : setSettingsTab(null)} 
                    className="flex items-center text-blue-500 text-[17px] active:opacity-70 transition-opacity"
                  >
                    <ChevronLeft size={24} className="-ml-1.5" />
                    <span>Назад</span>
                  </button>
                  <h2 className="font-semibold text-[17px] text-black dark:text-white absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    {settingsTab === 'account' && 'Аккаунт'}
                    {settingsTab === 'appearance' && 'Оформление'}
                    {settingsTab === 'security' && 'Безопасность'}
                    {settingsTab === 'privacy' && 'Приватность'}
                    {settingsTab === 'notifications' && 'Уведомления'}
                    {settingsTab === 'language' && 'Язык'}
                    {settingsTab === 'wallpapers' && 'Обои чата'}
                    {settingsTab === 'blacklist' && 'Черный список'}
                  </h2>
                  <div className="w-20"></div>
                </div>

                {/* ДОБАВЛЕН pb-24 для удобного скролла до самого низа */}
                <div className="flex-1 overflow-y-auto p-6 pb-24 hide-scrollbar animate-in slide-in-from-right-4">
                  
                  {/* --- АККАУНТ (МОБИЛКА) --- */}
                  {settingsTab === 'account' && (
                    <div className="space-y-6">
                      {accountStatus && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${accountStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                          {accountStatus.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                          {accountStatus.text}
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Имя пользователя</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                        />
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          Ваше отображаемое имя. Его увидят другие пользователи в ленте и профиле. Можно менять сколько угодно раз (например, Александр или FriendlyFox).
                        </p>
                      </div>
                      <div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">О себе</label>
                          <textarea 
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            maxLength={160}
                            placeholder="Расскажите немного о себе..."
                            className="w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm resize-none min-h-[100px]" 
                          />
                          <div className="flex justify-end mt-1">
                            <span className={`text-[10px] font-bold ${editBio.length >= 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                              {editBio.length}/160
                            </span>
                          </div>
                        </div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Тег</label>
                        <div className="relative mt-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                          <input 
                            type="text" 
                            value={editHandle}
                            onChange={(e) => setEditHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                            className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 pl-9 pr-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          Уникальный идентификатор профиля. Используется для ссылки на вашу страницу и упоминаний. Допускаются только латинские буквы, цифры и нижнее подчеркивание.
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">День рождения</label>
                        <input 
                          type="date" 
                          value={editBirthday}
                          onChange={(e) => setEditBirthday(e.target.value)}
                          className="block box-border w-full mt-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                          style={{ colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }}
                        />
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          Ваша дата рождения. Вы можете скрыть её в настройках приватности.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                        <button 
                          onClick={handleSaveAccount}
                          disabled={isSavingAccount || (editName === user.name && editHandle === user.handle && editBio === (user.bio || '') && editBirthday === (user.birthday || '')) || !editName || !editHandle}
                          className="cursor-pointer w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                          {isSavingAccount && <Loader2 size={16} className="animate-spin" />}
                          Сохранить изменения
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- ОФОРМЛЕНИЕ (МОБИЛКА) --- */}
                  {settingsTab === 'appearance' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white hidden md:block">Оформление</h3>

                      {/* 1. Тема приложения */}
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                        <div className="mb-4">
                          <p className="font-bold text-zinc-900 dark:text-white">Тема приложения</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          {[
                            { id: 'light', label: 'Светлая', icon: Sun },
                            { id: 'dark', label: 'Темная', icon: Moon },
                            { id: 'system', label: 'Системная', icon: Monitor },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button" 
                              onClick={() => setTheme(item.id)} 
                              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                                theme === item.id
                                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent'
                              }`}
                            >
                              <item.icon size={18} />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Цвет сообщений (пузырей) */}
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                        <div className="mb-4">
                          <p className="font-bold text-zinc-900 dark:text-white">Цвет ваших сообщений</p>
                        </div>
                        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                          {[
                            { id: 'blue', color: 'bg-blue-500' },
                            { id: 'green', color: 'bg-emerald-500' },
                            { id: 'purple', color: 'bg-purple-500' },
                            { id: 'pink', color: 'bg-pink-500' },
                            { id: 'orange', color: 'bg-orange-500' },
                          ].map(c => (
                            <button 
                              key={c.id}
                              onClick={() => setChatDesign({...chatDesign, bubbleColor: c.id})}
                              className={`w-12 h-12 rounded-full shrink-0 ${c.color} flex items-center justify-center transition-transform active:scale-90 shadow-md ${chatDesign.bubbleColor === c.id ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-[#18181b] ring-blue-500/50' : ''}`}
                            >
                              {chatDesign.bubbleColor === c.id && <Check size={20} className="text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Размер текста */}
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                        <div className="mb-4">
                          <p className="font-bold text-zinc-900 dark:text-white">Размер шрифта чата</p>
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-[#121212] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <Type size={16} className="text-zinc-400 shrink-0 ml-2" />
                          <input 
                            type="range" 
                            min="0" max="2" step="1" 
                            value={chatDesign.fontSize === 'small' ? 0 : chatDesign.fontSize === 'medium' ? 1 : 2}
                            onChange={(e) => {
                              const val = e.target.value;
                              setChatDesign({...chatDesign, fontSize: val == 0 ? 'small' : val == 1 ? 'medium' : 'large'})
                            }}
                            className="flex-1 accent-blue-500 cursor-pointer" 
                          />
                          <Type size={24} className="text-zinc-400 shrink-0 mr-2" />
                        </div>
                        <div className="flex justify-between px-3 mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <span>Мелкий</span>
                          <span>Стандарт</span>
                          <span>Крупный</span>
                        </div>
                      </div>

                      {/* 4. Обои и Иконки (Переходы) */}
                      <div className="space-y-2">
                        <button onClick={() => setSettingsTab('wallpapers')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-100 text-pink-500 dark:bg-pink-500/20 rounded-xl"><ImageIcon size={20}/></div>
                            <span className="font-bold text-zinc-900 dark:text-white">Обои для чатов</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-400">По умолчанию</span>
                            <ChevronRight size={20} className="text-zinc-400" />
                          </div>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* --- ВКЛАДКА: ЯЗЫК --- */}
                  {settingsTab === 'language' && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white hidden md:block">Язык</h3>
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        {[
                          { id: 'ru', name: 'Русский', native: 'Русский' },
                          { id: 'en', name: 'Английский', native: 'English' },
                          { id: 'es', name: 'Испанский', native: 'Español' },
                        ].map((lang, index, arr) => (
                          <button 
                            key={lang.id}
                            onClick={() => setAppLang(lang.id)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index !== arr.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}`}
                          >
                            <div className="text-left">
                              <p className="font-bold text-zinc-900 dark:text-white">{lang.name}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{lang.native}</p>
                            </div>
                            {appLang === lang.id && <Check className="text-blue-500" size={20} />}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-4 text-center px-4 leading-relaxed">
                        Смена языка переведет интерфейс платформы. Контент пользователей останется на языке оригинала.
                      </p>
                    </div>
                  )}

                  {settingsTab === 'wallpapers' && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white hidden md:block">Обои для чатов</h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'default', name: 'Классика', class: 'bg-[#e5ddd5] dark:bg-[#0f0f0f]' }, // Стандартный ТГ
                          { id: 'bg-zinc-900', name: 'Темный', class: 'bg-zinc-900' },
                          { id: 'bg-blue-50 dark:bg-blue-950', name: 'Небо', class: 'bg-blue-50 dark:bg-blue-950' },
                          { id: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950', name: 'Градиент', class: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950' },
                          { id: 'bg-emerald-50 dark:bg-emerald-950', name: 'Мята', class: 'bg-emerald-50 dark:bg-emerald-950' },
                          { id: 'bg-gradient-to-tr from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950', name: 'Персик', class: 'bg-gradient-to-tr from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950' },
                        ].map(wp => (
                          <button 
                            key={wp.id}
                            onClick={() => setChatDesign({...chatDesign, wallpaper: wp.id})}
                            className={`cursor-pointer relative aspect-[9/16] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-transform active:scale-95 border-2 ${chatDesign.wallpaper === wp.id ? 'border-blue-500' : 'border-transparent'}`}
                          >
                            {/* Сам фон превью */}
                            <div className={`absolute inset-0 ${wp.class} ${wp.id === 'default' ? 'telegram-bg' : ''}`}></div>
                            
                            {/* Галочка, если выбрано */}
                            {chatDesign.wallpaper === wp.id && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="bg-blue-500 rounded-full p-2">
                                  <Check size={24} className="text-white" />
                                </div>
                              </div>
                            )}

                            {/* Название */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30 backdrop-blur-sm">
                              <p className="text-white text-xs font-bold text-center">{wp.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- БЕЗОПАСНОСТЬ (МОБИЛКА) --- */}
                  {settingsTab === 'security' && (
                    <div className="bg-zinc-50 dark:bg-[#18181b] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Shield size={32} />
                      </div>
                      <h4 className="font-black text-lg text-zinc-900 dark:text-white mb-2">Настройки безопасности</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[250px]">
                        Управление паролями, активными сессиями и защитой аккаунта происходит в едином центре.
                      </p>
                      <a 
                        href="https://account.goodfaceteam.ru" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                      >
                        Перейти в Good Account
                      </a>
                    </div>
                  )}

                  {/* --- ПРИВАТНОСТЬ (МОБИЛКА) --- */}
                  {settingsTab === 'privacy' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white hidden md:block">Приватность</h3>

                      {/* Блок 1: Видимость профиля (Тумблеры) */}
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        <ToggleSwitch 
                          label="Режим призрака" 
                          description="Собеседники не увидят, что вы прочитали их сообщения."
                          checked={privacy.ghostMode} 
                          onChange={(v) => handlePrivacyToggle('ghostMode', v)} 
                        />
                        <ToggleSwitch 
                          label="Закрытый профиль" 
                          description="Только ваши подписчики смогут видеть ваши посты."
                          checked={privacy.isPrivate} 
                          onChange={(v) => handlePrivacyToggle('isPrivate', v)} 
                        />
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-4"></div>
                        <ToggleSwitch 
                          label="Скрыть подписчиков" 
                          description="Другие пользователи не увидят, сколько людей на вас подписано."
                          checked={privacy.hideFollowers} 
                          onChange={(v) => handlePrivacyToggle('hideFollowers', v)} 
                        />
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-4"></div>
                        <ToggleSwitch 
                          label="Скрыть подписки" 
                          description="Никто не сможет узнать, на кого вы подписаны."
                          checked={privacy.hideFollowing} 
                          onChange={(v) => handlePrivacyToggle('hideFollowing', v)} 
                        />
                      </div>

                      {/* Блок 2: Кто видит мою информацию */}
                      <div>
                        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest ml-4 mb-2">Кто видит мою информацию</p>
                        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                          
                          {/* О себе */}
                          <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center gap-3">
                              <Info size={20} className="text-zinc-500" />
                              <span className="text-[17px] text-zinc-900 dark:text-white">О себе</span>
                            </div>
                            <div className="relative flex items-center">
                              <select value={privacy.about} onChange={(e) => handlePrivacyToggle('about', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                                <option value="all" className="text-black dark:text-white">Все</option>
                                <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                                <option value="nobody" className="text-black dark:text-white">Никто</option>
                              </select>
                              <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                            </div>
                          </div>

                          {/* Подарки */}
                          <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center gap-3">
                              <Gift size={20} className="text-zinc-500" />
                              <span className="text-[17px] text-zinc-900 dark:text-white">Подарки</span>
                            </div>
                            <div className="relative flex items-center">
                              <select value={privacy.gifts} onChange={(e) => handlePrivacyToggle('gifts', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                                <option value="all" className="text-black dark:text-white">Все</option>
                                <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                                <option value="nobody" className="text-black dark:text-white">Никто</option>
                              </select>
                              <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                            </div>
                          </div>

                          {/* День рождения */}
                          <div className="w-full flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <Calendar size={20} className="text-zinc-500" />
                              <span className="text-[17px] text-zinc-900 dark:text-white">День рождения</span>
                            </div>
                            <div className="relative flex items-center">
                              <select value={privacy.birthday} onChange={(e) => handlePrivacyToggle('birthday', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                                <option value="all" className="text-black dark:text-white">Все</option>
                                <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                                <option value="nobody" className="text-black dark:text-white">Никто</option>
                              </select>
                              <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Блок 3: Кто может со мной связаться */}
                      <div>
                        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest ml-4 mb-2">Кто может со мной связаться</p>
                        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                          
                          {/* Сообщения */}
                          <div className="w-full flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center gap-3">
                              <MessageCircle size={20} className="text-zinc-500" />
                              <span className="text-[17px] text-zinc-900 dark:text-white">Сообщения</span>
                            </div>
                            <div className="relative flex items-center">
                              <select value={privacy.messages} onChange={(e) => handlePrivacyToggle('messages', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                                <option value="all" className="text-black dark:text-white">Все</option>
                                <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                              </select>
                              <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                            </div>
                          </div>

                          {/* Звонки */}
                          <div className="w-full flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <Phone size={20} className="text-zinc-500" />
                              <span className="text-[17px] text-zinc-900 dark:text-white">Звонки</span>
                            </div>
                            <div className="relative flex items-center">
                              <select value={privacy.calls} onChange={(e) => handlePrivacyToggle('calls', e.target.value)} className="appearance-none bg-transparent text-[15px] text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer pr-6 text-right focus:text-blue-500" dir="rtl">
                                <option value="all" className="text-black dark:text-white">Все</option>
                                <option value="followers" className="text-black dark:text-white">Мои подписчики</option>
                                <option value="nobody" className="text-black dark:text-white">Никто</option>
                              </select>
                              <ChevronRight size={18} className="text-zinc-400 absolute right-0 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Блок 4: Черный список */}
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm mt-4">
                        <button onClick={() => setSettingsTab('blacklist')} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg">
                              <Ban size={18} className="text-red-500" />
                            </div>
                            <span className="text-[17px] font-medium text-zinc-900 dark:text-white">Черный список</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[15px] text-zinc-500">Показать</span>
                            <ChevronRight size={18} className="text-zinc-400" />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- ВКЛАДКА: ЧЕРНЫЙ СПИСОК --- */}
                  {settingsTab === 'blacklist' && (
                    <div>
                      <div className="flex items-center gap-3 mb-6 hidden md:flex">
                        <button onClick={() => setSettingsTab('privacy')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                          <ArrowLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Черный список</h3>
                      </div>

                      <div className="text-center py-16 bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-800">
                        <Ban size={48} strokeWidth={1} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                        <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Нет заблокированных</h4>
                        <p className="text-sm text-zinc-500 max-w-[250px] mx-auto leading-relaxed">
                          Заблокированные пользователи не смогут писать вам сообщения и просматривать ваш профиль.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* --- УВЕДОМЛЕНИЯ (МОБИЛКА) --- */}
                  {settingsTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white hidden md:block">Уведомления</h3>
                      
                      {/* НОВЫЙ БЛОК: Системные пуши */}
                      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <BellRing className={sysNotifPermission === 'granted' ? 'text-emerald-500' : 'text-blue-500'} size={24} />
                          <h4 className="font-bold text-zinc-900 dark:text-white">Системные уведомления</h4>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                          Получайте уведомления в фоновом режиме, даже если вы переключились на другую вкладку.
                        </p>
                        
                        {sysNotifPermission === 'granted' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-bold text-sm rounded-lg">
                            <CheckCircle2 size={16} /> Включено
                          </div>
                        ) : (
                          <button 
                            onClick={handleRequestSysNotif}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 w-full md:w-auto"
                          >
                            Включить в браузере
                          </button>
                        )}
                        
                        {sysNotifPermission === 'denied' && (
                          <p className="text-xs text-red-500 mt-3 font-medium">
                            Браузер блокирует уведомления. Разрешите их в настройках сайта (иконка 🔒 в адресной строке).
                          </p>
                        )}
                      </div>

                      {/* Старые внутренние настройки */}
                      <div className="space-y-3">
                        <ToggleSwitch 
                          label="Всплывающие окна на сайте" 
                          description="Показывать окошко в углу экрана, когда кто-то ставит лайк или подписывается на вас."
                          checked={notifPrefs.popups} 
                          onChange={(v) => setNotifPrefs({...notifPrefs, popups: v})} 
                        />
                        <ToggleSwitch 
                          label="Звук уведомлений" 
                          description="Проигрывать короткий звуковой сигнал при появлении нового события."
                          checked={notifPrefs.sound} 
                          onChange={(v) => setNotifPrefs({...notifPrefs, sound: v})} 
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold text-center mt-6">
                        Эти настройки применяются только к текущему устройству
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ReportModal 
        isOpen={reportData.isOpen}
        onClose={() => setReportData({ ...reportData, isOpen: false })}
        targetType={reportData.targetType}
        targetId={reportData.targetId}
        currentUserId={user?.id}
      />

      {/* CSS для скрытия скроллбара */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* --- НОВОЕ: Всплывающее окно о завершении сессии --- */}
      {sessionTerminated && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 max-w-[340px] w-full shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Сессия завершена</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">
              Вы вышли из системы. Владелец аккаунта завершил данный сеанс с другого устройства.
            </p>
            <button
              onClick={() => {
                setSessionTerminated(false);
                onLogout(); // Дергаем функцию выхода из родителя
                window.location.href = '/'; // Перекидываем на авторизацию
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] uppercase tracking-widest py-4 rounded-full transition-all active:scale-95 shadow-md"
            >
              Перезайти
            </button>
          </div>
        </div>
      )}
      {activeLegalModal && (
        <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-white dark:bg-[#121212] md:bg-black/40 md:dark:bg-black/60 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200 slide-in-from-right-full md:slide-in-from-left-0">
          
          {/* Клик по фону закрывает модалку ТОЛЬКО НА ПК */}
          <div className="hidden md:block absolute inset-0" onClick={() => setActiveLegalModal(null)}></div>
          
          <div className="bg-white dark:bg-[#121212] w-full h-full md:h-[80vh] md:max-h-[800px] md:max-w-3xl rounded-none md:rounded-3xl shadow-none md:shadow-2xl flex flex-col overflow-hidden md:border border-zinc-200 dark:border-zinc-800 relative z-10">
            
            {/* --- Шапка для мобилок (iOS Style) --- */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setActiveLegalModal(null)} className="flex items-center text-blue-500 text-[17px] active:opacity-70 transition-opacity">
                <ChevronLeft size={24} className="-ml-1.5" />
                <span>Назад</span>
              </button>
              <h2 className="font-semibold text-[17px] text-black dark:text-white absolute left-1/2 -translate-x-1/2 pointer-events-none">
                {activeLegalModal === 'terms' && 'Условия'}
                {activeLegalModal === 'privacy' && 'Приватность'}
                {activeLegalModal === 'cookies' && 'Cookies'}
              </h2>
              <div className="w-20"></div> {/* Пустой блок для выравнивания */}
            </div>

            {/* --- Шапка для ПК --- */}
            <div className="hidden md:flex p-6 border-b border-zinc-200 dark:border-zinc-800 justify-between items-center shrink-0 bg-white dark:bg-[#18181b] z-10">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                {activeLegalModal === 'terms' && 'Условия использования'}
                {activeLegalModal === 'privacy' && 'Политика конфиденциальности'}
                {activeLegalModal === 'cookies' && 'Использование Cookies'}
              </h2>
              <button onClick={() => setActiveLegalModal(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* --- Контент политик --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed space-y-8 bg-white dark:bg-[#121212]">
              
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

      <AnimatePresence>
        {isCallOpen && isCallMinimized && (
          <>
            {/* МОБИЛКА: Зеленая полоса сверху */}
            <motion.div 
              initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
              onClick={() => setIsCallMinimized(false)}
              className="md:hidden fixed top-0 left-0 right-0 h-[48px] bg-[#34c759]/95 backdrop-blur-md z-[99999] flex items-center justify-between px-4 shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white">
                <Phone size={18} className="animate-pulse" />
                <span className="font-semibold text-[15px]">
                  {callStatus === 'connected' ? 'Разговор...' : 'Звонок...'}
                </span>
              </div>
              <span className="text-white font-medium text-[15px] truncate max-w-[140px]">
                {callStatus === 'incoming' ? activeCallData?.caller_name : currentCallPartner?.name}
              </span>
            </motion.div>

            {/* ПК: Плавающее окно справа снизу (ТЕПЕРЬ С БЛЮРОМ!) */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={() => setIsCallMinimized(false)}
              className="hidden md:flex fixed bottom-6 right-6 w-[280px] bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-2xl rounded-2xl border border-black/5 dark:border-white/10 z-[99999] p-4 items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
            >
               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner">
                 {(callStatus === 'incoming' ? activeCallData?.caller_name : currentCallPartner?.name)?.charAt(0)}
               </div>
               <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-[15px] truncate text-black dark:text-white">
                   {callStatus === 'incoming' ? activeCallData?.caller_name : currentCallPartner?.name}
                 </h4>
                 <p className={`text-[13px] font-medium ${callStatus === 'connected' ? 'text-[#34c759]' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {callStatus === 'connected' ? 'Разговор...' : 'Соединение...'}
                 </p>
               </div>
               <button 
                 onClick={(e) => { 
                   e.stopPropagation(); 
                   const type = callStatus === 'connected' ? 'ended' : (callStatus === 'incoming' ? 'declined' : 'missed');
                   const targetId = callStatus === 'incoming' ? activeCallData.caller_id : currentCallPartner?.id;
                   sendSignal(type, targetId);
                   handleEndCallLocally(type);
                 }} 
                 className="w-10 h-10 bg-[#ff3b30] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-red-600 transition-colors shadow-md"
               >
                 <PhoneOff size={18} />
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- ГЛОБАЛЬНЫЙ ЭКРАН ЗВОНКА (ПОЛНОЭКРАННЫЙ) --- */}
      <AnimatePresence>
        {isCallOpen && (
          <CallScreen 
            key={currentCallPartner?.id || activeCallData?.caller_id || 'call-screen'}
            isOpen={isCallOpen} 
            isMinimized={isCallMinimized}
            onMinimize={() => setIsCallMinimized(true)}
            partner={callStatus === 'incoming' ? { name: activeCallData?.caller_name, avatar_data: activeCallData?.caller_avatar } : currentCallPartner} 
            callStatus={callStatus}
            remoteAudioStream={remoteStream}
            onClose={() => { setIsCallOpen(false); setIsCallMinimized(false); }}
            
            handleAccept={() => {
              if (callStatus === 'connected') return;
              setCallStatus('connected');
              sendSignal('accept', activeCallData.caller_id);
              if (activeCallData?.data) {
                startWebRTC(false, activeCallData.caller_id, activeCallData.data);
              } else {
                pendingAccept.current = true; 
              }
            }}

            handleDecline={(type) => {
              const targetId = callStatus === 'incoming' ? activeCallData.caller_id : currentCallPartner?.id;
              sendSignal(type, targetId);
              handleEndCallLocally(type);
            }}
          />
        )}
      </AnimatePresence>

      {/* --- КНОПКА ИГРЫ ДЛЯ ПК --- */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block animate-in zoom-in slide-in-from-bottom-10">
        <button
          onClick={() => setShowGame(true)}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full shadow-[0_10px_30px_rgba(139,92,246,0.4)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <Gamepad2 className="text-white" size={24} />
          <span className="absolute right-full mr-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Заработать планеты
          </span>
        </button>
      </div>

      {/* --- РЕНДЕР САМОЙ ИГРЫ --- */}
      <AnimatePresence>
        {showGame && (
          <CosmicHub
            onClose={() => setShowGame(false)}
            onBalanceUpdate={() => {
               // Здесь вызов обновления магазина, если нужно
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- КОРНЕВОЙ КОМПОНЕНТ (Роутер и глобальные стейты) ---
export default function App() {
  // Ищем сессию в куках при первом запуске
  const [user, setUser] = useState(() => {
    const savedSession = Cookies.get('auth_session');
    return savedSession ? JSON.parse(savedSession) : null;
  }); 

  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'system');

  // 1. ИСПРАВЛЕННАЯ ЛОГИКА ВЫХОДА
  const handleLogout = React.useCallback(() => {
    setUser(null);
    Cookies.remove('auth_session');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token'); // ОБЯЗАТЕЛЬНО удаляем мертвый токен!
    window.location.href = '/'; // Жесткая перезагрузка очистит все стейты и отключит сокеты Pusher
  }, []);

  // 2. ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ФЕЧЕЙ (Ловим ошибки токена повсюду)
  useEffect(() => {
    if (!user) return; // Нет смысла перехватывать, если мы и так не авторизованы

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Проверка А: Если твой PHP скрипт возвращает правильный HTTP-статус (401 Unauthorized)
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return response;
      }

      // Проверка Б: Если твой PHP скрипт возвращает 200 OK, но внутри JSON отдает ошибку
      try {
        const clone = response.clone(); // Обязательно клонируем, чтобы не "съесть" данные для твоего кода
        const data = await clone.json();

        // ВНИМАНИЕ: Замени тексты ошибок на те, которые реально отдает твой PHP!
        // Например, если он отдает { success: false, message: "Invalid token" }
        if (
          data && 
          data.success === false && 
          (data.message === "Invalid token" || 
           data.message === "Token expired" || 
           data.message === "Неверный токен авторизации") // Подставь свою фразу
        ) {
          handleLogout();
        }
      } catch (e) {
        // Игнорируем, если ответ пришел не в JSON (например картинка)
      }

      return response;
    };

    // Очищаем перехватчик, если App вдруг размонтируется
    return () => {
      window.fetch = originalFetch;
    };
  }, [user, handleLogout]);

  useEffect(() => {
    if (!user) return;
    const updateOnline = () => fetch(`https://api.goodfaceteam.ru/update_online.php`, { credentials: 'include', headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } });
    updateOnline();
    const interval = setInterval(updateOnline, 60000); // Раз в минуту
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    let currentActiveTheme = theme;
    
    // 1. Убираем старые классы
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // 2. Если системная — проверяем настройки браузера
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentActiveTheme = isDark ? 'dark' : 'light';
    }
    
    // 3. Ставим нужный класс
    root.classList.add(currentActiveTheme);
    
    // Сохраняем выбор
    localStorage.setItem('app-theme', theme);

    // --- ИСПРАВЛЕНИЕ ФОНА НА МОБИЛЬНЫХ УСТРОЙСТВАХ ---
    // Определяем нужный цвет (#121212 для темной, #ffffff для светлой)
    const bgColor = currentActiveTheme === 'dark' ? '#121212' : '#ffffff';

    // Меняем цвет статус-бара телефона (верхней полоски со связью/батареей)
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', bgColor);

    // Красим сам тег body, чтобы при оттяжке (overscroll) не было белых дыр
    document.body.style.backgroundColor = bgColor;

  }, [theme]);
  
  // Если пользователя нет, показываем экран авторизации
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className='dark:bg-[#121212]'>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminPage currentUser={user} onLogout={handleLogout} />} />
          
          <Route path="/" element={<AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} />}>
            <Route index element={<FeedPage currentUser={user} />} />
            <Route path="search" element={<SearchPage currentUser={user} />} />
            <Route path="notifications" element={<NotificationsPage currentUser={user} />} />
            <Route path="/:handle" element={<ProfilePage user={user} />} />
            <Route path="/post/:id" element={<SinglePostPage currentUser={user} />} />
            <Route path="chats" element={<ChatsListPage currentUser={user} />} />
            <Route path="chat/:handle" element={<ChatWindowPage currentUser={user} />} />
            <Route path="join/:hash" element={<JoinRoomPage currentUser={user} />} />
            <Route path="/saved" element={<SavedMessagesPage currentUser={user} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Запрет масштабирования через колесико мыши + Ctrl (ПК)
document.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Запрет масштабирования через клавиатуру (Ctrl + "+" / Ctrl + "-")
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) {
    e.preventDefault();
  }
});

// Запрет мультитач-зума (pinch-to-zoom) на трекпадах и экранах
document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });