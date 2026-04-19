import React from 'react';
import emoji from 'react-easy-emoji';

export const EmojiText = ({ text, className = "" }) => {
  if (!text) return null;

  // Второй аргумент — это наша собственная функция отрисовки.
  // code - это тот самый hex-код (например, 1f602), string - сам символ, key - уникальный ключ для React
  const parsedText = emoji(text, (code, string, key) => (
    <img
      key={key}
      alt={string}
      draggable="false"
      className="inline-block w-[1.25em] h-[1.25em] align-[-0.25em] mx-[0.05em]"
      src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${code}.png`}
    />
  ));

  return <span className={className}>{parsedText}</span>;
};