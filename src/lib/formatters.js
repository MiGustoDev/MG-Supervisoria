export const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoneyInput(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

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

export function formatThousands(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  const clean = String(raw).replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseMoney(raw) {
  let s = String(raw || '').replace(/[\s$]/g, '');
  if (!s) return NaN;
<<<<<<< HEAD

  // Caso 1: Tiene puntos y comas (ej: "1.669.515,41" o "1,669,515.41")
  if (s.includes('.') && s.includes(',')) {
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Estilo argentino/europeo: puntos miles, coma decimal -> 1.669.515,41
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Estilo anglosajón: comas miles, punto decimal -> 1,669,515.41
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Caso 2: Solo tiene coma(s).
    // Si tiene una sola coma y 1 o 2 dígitos al final (o más), actúa como separador decimal.
    // Ej: "1669515,41" -> 1669515.41
    const commaCount = (s.match(/,/g) || []).length;
    if (commaCount === 1) {
      s = s.replace(',', '.');
    } else {
      // Múltiples comas como separador de miles
      s = s.replace(/,/g, '');
    }
  } else if (s.includes('.')) {
    // Caso 3: Solo tiene punto(s).
    // Si tiene un único punto y 1 o 2 decimales al final (ej: "1669515.41"), es decimal.
    // Si tiene patrón de miles "1.669.515" o múltiples puntos, son miles.
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length !== 3) {
      // Probablemente decimal (ej: "50000.5" o "1500.50")
      // s se mantiene con su punto
    } else {
      // Puntos de miles (ej: "1.669.515" o "50.000")
      s = s.replace(/\./g, '');
    }
  }

  const num = Number(s);
  return !isNaN(num) && num >= 0 ? num : NaN;
=======
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/\./g, '');
  }
  return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s) : NaN;
>>>>>>> 33129ebfaa43e3cfcbd000f23c780876d2600188
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
