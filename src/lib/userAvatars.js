/**
 * Helper to resolve user/supervisor avatar pictures stored in /public/users/
 * Respects Vite's base path (import.meta.env.BASE_URL) and provides fallbacks
 */
const BASE = import.meta.env.BASE_URL || '/';
const cleanBase = BASE.endsWith('/') ? BASE : `${BASE}/`;

export function getUserAvatarFilename(userOrName) {
  if (!userOrName) return null;
  const str =
    typeof userOrName === 'object'
      ? `${userOrName.name || ''} ${userOrName.email || ''} ${userOrName.id || ''} ${userOrName.supId || ''}`
      : String(userOrName);

  const normalized = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('admin')) return 'admin.png';
  if (normalized.includes('damaris')) return 'damaris.png';
  if (normalized.includes('elizabeth')) return 'elizabeth.png';
  if (normalized.includes('evelyn')) return 'evelyn.png';
  if (normalized.includes('lidya') || normalized.includes('lydia')) return 'lydia.png';
  if (normalized.includes('maria') || normalized.includes('salazar')) return 'maria.png';
  if (normalized.includes('martin') || normalized.includes('sastre')) return 'martin.png';
  if (normalized.includes('sasha') || normalized.includes('alfini')) return 'sasha.png';
  if (normalized.includes('selene') || normalized.includes('hernandez')) return 'selene.png';
  if (normalized.includes('wanda') || normalized.includes('ruiz')) return 'wanda.png';

  return null;
}

export function getUserAvatarUrl(userOrName) {
  const filename = getUserAvatarFilename(userOrName);
  if (!filename) return null;
  return `${cleanBase}users/${filename}`;
}

export function getUserAvatarCandidates(userOrName) {
  const filename = getUserAvatarFilename(userOrName);
  if (!filename) return [];

  const list = [
    `${cleanBase}users/${filename}`,
    `./users/${filename}`,
    `users/${filename}`,
    `/users/${filename}`,
  ];

  return Array.from(new Set(list));
}
