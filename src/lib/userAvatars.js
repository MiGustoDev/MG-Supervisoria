/**
 * Helper to resolve user/supervisor avatar pictures stored in /public/users/
 * Respects Vite's base path (import.meta.env.BASE_URL)
 */
const BASE = import.meta.env.BASE_URL || '/';
const cleanBase = BASE.endsWith('/') ? BASE : `${BASE}/`;

export function getUserAvatarUrl(userOrName) {
  if (!userOrName) return null;
  const str =
    typeof userOrName === 'object'
      ? `${userOrName.name || ''} ${userOrName.email || ''} ${userOrName.id || ''} ${userOrName.supId || ''}`
      : String(userOrName);

  const normalized = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let filename = null;
  if (normalized.includes('admin')) filename = 'admin.png';
  else if (normalized.includes('damaris')) filename = 'damaris.png';
  else if (normalized.includes('elizabeth')) filename = 'elizabeth.png';
  else if (normalized.includes('evelyn')) filename = 'evelyn.png';
  else if (normalized.includes('lidya') || normalized.includes('lydia')) filename = 'lydia.png';
  else if (normalized.includes('maria') || normalized.includes('salazar')) filename = 'maria.png';
  else if (normalized.includes('martin') || normalized.includes('sastre')) filename = 'martin.png';
  else if (normalized.includes('sasha') || normalized.includes('alfini')) filename = 'sasha.png';
  else if (normalized.includes('selene') || normalized.includes('hernandez')) filename = 'selene.png';
  else if (normalized.includes('wanda') || normalized.includes('ruiz')) filename = 'wanda.png';

  if (!filename) return null;
  return `${cleanBase}users/${filename}`;
}
