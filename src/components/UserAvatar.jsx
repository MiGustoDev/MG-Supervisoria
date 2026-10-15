import React, { useState } from 'react';
import { getUserAvatarUrl } from '../lib/userAvatars';

export function UserAvatar({
  user,
  name,
  className = 'w-8 h-8 rounded-xl',
  textClassName = 'text-xs sm:text-sm font-extrabold text-white',
  avatarColor,
  alt,
}) {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getUserAvatarUrl(user || name);

  const displayName = name || user?.name || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const gradient = avatarColor || user?.avatarColor || 'from-amber-500 to-orange-600';

  if (avatarUrl && !hasError) {
    return (
      <div
        className={`${className} overflow-hidden shrink-0 bg-slate-800 border border-slate-700/60 shadow-sm relative flex items-center justify-center`}
      >
        <img
          src={avatarUrl}
          alt={alt || displayName || 'Usuario'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-gradient-to-br ${gradient} flex items-center justify-center ${textClassName} shadow-sm shrink-0 select-none`}
    >
      {initial}
    </div>
  );
}
