import React from 'react';
import { BadgeCheck } from 'lucide-react'; // Импортируем иконку галочки

// Компонент UserName
// Принимает: user (объект пользователя с полем name и is_verified)
// className_name (дополнительные классы для размера текста имени, например 'text-base' или 'text-2xl')
// className_icon (дополнительные классы для размера иконки, например 'size-4' или 'size-6')
export function UserName({ user, className_name = "text-base", className_icon = "size-4" }) {
  if (!user) return null;

  const isVerified = user.is_verified == 1; // Приводим к булеву типу на всякий случай

  // Базовые классы для имени (жирный)
  let nameClasses = `font-bold ${className_name} `;

  // Если верифицирован -> добавляем градиент
  if (isVerified) {
    nameClasses += "bg-gradient-to-r from-zinc-500 to-blue-400 text-transparent bg-clip-text";
  } else {
    // Если нет -> обычный цвет текста для лайт/дарк темы
    nameClasses += "text-zinc-900 dark:text-white";
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <h4 className={nameClasses + " truncate leading-tight"}>
        {user.name}
      </h4>
      {isVerified && (
        <BadgeCheck 
          className={`${className_icon} text-blue-500 shrink-0 animate-in zoom-in`} 
          strokeWidth={2.5} // Делаем линии иконки чуть толще, как в ТГ
        />
      )}
    </div>
  );
}