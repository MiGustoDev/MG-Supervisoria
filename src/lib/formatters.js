export const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const INT = new Intl.NumberFormat('es-AR');

export const DEC = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const WD = new Intl.DateTimeFormat('es-AR', { weekday: 'short' });
export const WDL = new Intl.DateTimeFormat('es-AR', { weekday: 'long' });
export const MONTHF = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });

export const pad = (n) => String(n).padStart(2, '0');

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseYmd = (s) => {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayStr = () => ymd(new Date());

export const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d);
};

export const fmtDay = (s) => {
  const d = parseYmd(s);
  return `${WD.format(d).replace('.', '')} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

export const fmtDayLong = (s) => {
  const d = parseYmd(s);
  const w = WDL.format(d);
  return `${w.charAt(0).toUpperCase() + w.slice(1)} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export function parseMoney(raw) {
  let s = String(raw || '').replace(/[\s$]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s) : NaN;
}

export function parseCount(raw) {
  const s = String(raw || '').replace(/[\s.]/g, '');
  return /^\d+$/.test(s) ? Number(s) : NaN;
}

export const newId = (prefix = 'id_') =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function exportCsv(filename, rows) {
  const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
