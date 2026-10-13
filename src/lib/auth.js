// Official credentials and supervisor profiles for Mi Gusto
export const SUPERVISOR_ACCOUNTS = [
  {
    email: 'admin@migusto.com.ar',
    password: 'MiGusto123.',
    supId: '__all',
    name: 'Administración Mi Gusto',
    role: 'Administrador General',
    avatarColor: 'from-amber-400 to-yellow-600',
  },
  {
    email: 'selenehernandez@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_selene',
    name: 'Selene Hernández',
    role: 'Supervisora Tienda Propia',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    email: 'sashaalfini@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_sasha',
    name: 'Sasha Alfini',
    role: 'Supervisora Tienda Propia',
    avatarColor: 'from-purple-500 to-violet-600',
  },
  {
    email: 'martinsastre@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_martin',
    name: 'Martín Sastre',
    role: 'Supervisor Tienda Propia',
    avatarColor: 'from-blue-500 to-cyan-600',
  },
  {
    email: 'damarisburgos@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_damaris',
    name: 'Damaris Burgos',
    role: 'Supervisora de Tiendas',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    email: 'lidyatello@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_lidya',
    name: 'Lidya Tello',
    role: 'Supervisora de Tiendas',
    avatarColor: 'from-sky-500 to-indigo-600',
  },
  {
    email: 'wandaruiz@migusto.com.ar',
    password: 'MiGusto123.',
    supId: 'sup_wanda',
    name: 'Wanda Ruiz',
    role: 'Supervisora de Tiendas',
    avatarColor: 'from-amber-500 to-orange-600',
  },
];

const LS_AUTH_KEY = 'mg_supervisor_session';

export function getStoredSession() {
  const raw = localStorage.getItem(LS_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(LS_AUTH_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(LS_AUTH_KEY);
}

export function authenticateSupervisor(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  const found = SUPERVISOR_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPassword
  );

  if (found) {
    const sessionUser = {
      email: found.email,
      supId: found.supId,
      name: found.name,
      role: found.role,
      avatarColor: found.avatarColor,
      loggedInAt: new Date().toISOString(),
    };
    saveSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  return {
    success: false,
    error: 'Correo o contraseña incorrectos. Verificá los datos.',
  };
}
