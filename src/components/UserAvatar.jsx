import React, { useState } from 'react';
import { getUserAvatarCandidates } from '../lib/userAvatars';

export function UserAvatar({
  user,
  name,
  className = 'w-8 h-8 rounded-xl',
  textClassName = 'text-xs sm:text-sm font-extrabold text-white',
  avatarColor,
  alt,
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = getUserAvatarCandidates(user || name);

  const displayName = name || user?.name || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const gradient = avatarColor || user?.avatarColor || 'from-amber-500 to-orange-600';

  const currentSrc =
    candidateIndex >= 0 && candidateIndex < candidates.length ? candidates[candidateIndex] : null;

  const handleImgError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setCandidateIndex(-1); // No more candidates, show initial
    }
  };

  if (currentSrc) {
    return (
      <div
        className={`${className} overflow-hidden shrink-0 bg-slate-800 border border-slate-700/60 shadow-sm relative flex items-center justify-center`}
      >
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt || displayName || 'Usuario'}
          onError={handleImgError}
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
