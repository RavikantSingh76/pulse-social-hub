import React from 'react';
import { Link } from 'react-router-dom';

export const Avatar = ({ src, alt, size = 'md', username, isOnline = false, className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl',
  }[size] || 'w-10 h-10 text-sm';

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'user'}`;

  const content = (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <img
        src={src || defaultAvatar}
        alt={alt || username || 'avatar'}
        className={`${sizeClasses} rounded-full object-cover border border-gray-200 dark:border-zinc-700/80 bg-gray-100 dark:bg-zinc-800`}
        onError={(e) => { e.target.src = defaultAvatar; }}
      />
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
      )}
    </div>
  );

  if (username) {
    return (
      <Link to={`/profile/${username}`} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
