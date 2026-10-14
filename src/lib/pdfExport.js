import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ARS, INT } from './formatters';

// Helper para fecha en formato DD/MM/YYYY
function formatDMY(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Carga el logo oficial desde public/LOGOcircular.png o Logo_Mi_Gusto_2025.png
 * Retorna una promesa con el base64 o null si falla.
 */
let cachedLogoBase64 = null;
async function getLogoBase64() {
  if (cachedLogoBase64) return cachedLogoBase64;
  const logoUrls = [
    `${import.meta.env.BASE_URL}LOGOcircular.png`,
    `${import.meta.env.BASE_URL}Logo_Mi_Gusto_2025.png`,
    '/LOGOcircular.png',
    '/Logo_Mi_Gusto_2025.png',
  ];

  for (const url of logoUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (base64) {
        cachedLogoBase64 = base64;
        return base64;
      }
    } catch (e) {
      // Intentar siguiente URL
    }
  }
  return null;
}

/**
 * Dibuja un encabezado blanco, limpio y optimizado para imprimir con el logo de Mi Gusto.
 */
/**
 * Dibuja un encabezado de alta gama ejecutiva, optimizado para impresión.
 * Diseño limpio: Logo a la izquierda con separación cuidada, tipografía corporativa y badge sutil de emisión.
 */
function drawPrintHeader(doc, { logoBase64, title, subtitle, dateRight, isLandscape = true }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  let currentY = 11;

  // 1. Logo corporativo de Mi Gusto
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', startX, currentY, 16, 16);
    } catch (e) {
      console.warn('No se pudo incrustar el logo en el PDF:', e);
    }
  }

  const textStartX = logoBase64 ? startX + 20 : startX;

  // 2. Marca / Compañía
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('MI GUSTO', textStartX, currentY + 5);

  const brandWidth = doc.getTextWidth('MI GUSTO');

  // Separador sutil
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('—', textStartX + brandWidth + 3, currentY + 5);

  // 'SUPERVISIÓN OPERATIVA & AUDITORÍA' en amarillo dorado corporativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 119, 6); // Dorado / Ámbar #d97706
  doc.text('SUPERVISIÓN OPERATIVA & AUDITORÍA', textStartX + brandWidth + 8, currentY + 5);

  // 3. Título del informe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title, textStartX, currentY + 10.5);

  // 4. Subtítulo / Metadata del reporte
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, textStartX, currentY + 15);
  }

  // 5. Badge o metadata a la derecha (cápsula gris suave)
  if (dateRight) {
    const badgeText = dateRight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const textWidth = doc.getTextWidth(badgeText);
    const badgeW = textWidth + 8;
    const badgeH = 6;
    const badgeX = pageWidth - 14 - badgeW;
    const badgeY = currentY + 1;

    // Fondo cápsula
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

    // Texto cápsula
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(badgeText, badgeX + 4, badgeY + 4.2);
  }

  // 6. Línea divisoria minimalista (barra sutil dorada de 1.5pt y línea slate-100)
  const lineY = currentY + 19;
  doc.setDrawColor(245, 158, 11); // ámbar corporativo
  doc.setLineWidth(0.7);
  doc.line(startX, lineY, startX + 35, lineY); // acento ámbar al inicio

  doc.setDrawColor(226, 232, 240); // slate-200 el resto
  doc.setLineWidth(0.4);
  doc.line(startX + 35, lineY, pageWidth - 14, lineY);

  return lineY + 5;
}

/**
 * Dibuja tarjetas KPI de estilo "Executive Metric Cards":
 * - Fondo suave slate-50
 * - Borde nítido slate-200 con esquinas redondeadas
 * - Acento de color superior sutil
 * - Tipografía jerárquica limpia
 */
function drawKpiCards(doc, startY, cards, pageWidth) {
  const startX = 14;
  const count = cards.length;
  const gap = 3.5;
  const totalWidth = pageWidth - 28;
  const cardW = (totalWidth - (count - 1) * gap) / count;
  const cardH = 15;

  cards.forEach((c, idx) => {
    const x = startX + idx * (cardW + gap);

    // Fondo muy claro slate-50/100 con borde fino
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, cardW, cardH, 2, 2, 'FD');

    // Barra de acento superior elegante de 1mm
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(x + 1.5, startY, cardW - 3, 0.9, 'F');

    // Label pequeño en mayúsculas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(c.label.toUpperCase(), x + 4, startY + 5.2);

    // Valor numérico destacado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(c.val, x + 4, startY + 11.5);
  });

  return startY + cardH + 5;
}

/**
 * Exporta el Historial de Cargas completo o filtrado a un PDF ejecutivo de alta calidad.
 */
export async function exportHistoryPDF(filteredRecords, { totalCount, title = 'Historial General de Cargas' } = {}) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await getLogoBase64();

  const now = new Date();
  const emisionStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} hs`;

  // 1. Encabezado moderno
  const cardsStartY = drawPrintHeader(doc, {
    logoBase64,
    title,
    subtitle: `Reporte de auditoría de cargas operativas · Mostrando ${filteredRecords.length} de ${totalCount || filteredRecords.length} registros`,
    dateRight: emisionStr,
    isLandscape: true,
  });

  // 2. Totales calculados
  let totalVenta = 0, totalComandas = 0, totalUnidades = 0;
  filteredRecords.forEach((r) => {
    totalVenta += Number(r.venta) || 0;
    totalComandas += Number(r.comandas) || 0;
    totalUnidades += Number(r.unidades) || 0;
  });
  const avgTicket = totalComandas > 0 ? totalVenta / totalComandas : 0;

  // 3. Tarjetas KPI de diseño ejecutivo
  const kpis = [
    { label: 'Venta Acumulada', val: ARS.format(totalVenta), color: [16, 185, 129] },
    { label: 'Comandas Totales', val: INT.format(totalComandas), color: [2, 132, 199] },
    { label: 'Unidades (Empanadas)', val: INT.format(totalUnidades), color: [225, 29, 72] },
    { label: 'Ticket Promedio', val: ARS.format(avgTicket), color: [217, 119, 6] },
  ];

  const tableStartY = drawKpiCards(doc, cardsStartY, kpis, pageWidth);

  // 4. Filas para la tabla
  const tableRows = filteredRecords.map((r, i) => {
    const ticket = r.ticketPromedio
      ? Number(r.ticketPromedio)
      : r.comandas > 0
      ? r.venta / r.comandas
      : 0;
    const upc = r.unidadesPorComanda
      ? Number(r.unidadesPorComanda)
      : r.comandas > 0
      ? r.unidades / r.comandas
      : 0;

    return [
      String(i + 1),
      formatDMY(r.fecha),
      r.tiendaNombre || '',
      r.supervisoraNombre || 'Sin supervisora',
      INT.format(r.comandas || 0),
      ARS.format(r.venta || 0),
      INT.format(r.unidades || 0),
      ticket > 0 ? ARS.format(ticket) : '-',
      upc > 0 ? upc.toFixed(1) : '-',
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      { content: '#', styles: { halign: 'center' } },
      { content: 'FECHA', styles: { halign: 'center' } },
      { content: 'SUCURSAL', styles: { halign: 'left' } },
      { content: 'SUPERVISORA', styles: { halign: 'left' } },
      { content: 'COMANDAS', styles: { halign: 'right' } },
      { content: 'VENTA TOTAL', styles: { halign: 'right' } },
      { content: 'UNIDADES', styles: { halign: 'right' } },
      { content: 'TICKET PROM.', styles: { halign: 'right' } },
      { content: 'UNID / CMDA', styles: { halign: 'right' } },
    ]],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [51, 65, 85],     // slate-700
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 },
      lineWidth: 0.15,
      lineColor: [203, 213, 225],
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: { top: 2.4, bottom: 2.4, left: 2, right: 2 },
      lineWidth: 0.08,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, textColor: [100, 116, 139] },
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      2: { halign: 'left', fontStyle: 'bold', textColor: [15, 23, 42] },
      3: { halign: 'left', textColor: [71, 85, 105] },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 34, fontStyle: 'bold', textColor: [4, 120, 87] },
      6: { halign: 'right', cellWidth: 24 },
      7: { halign: 'right', cellWidth: 28 },
      8: { halign: 'right', cellWidth: 24 },
    },
    alternateRowStyles: {
      fillColor: [250, 252, 254], // alternancia ultrafina
    },
    margin: { left: 14, right: 14, bottom: 14 },
    didDrawPage: (data) => {
      // Pie de página institucional sobrio y nítido
      const footerY = pageHeight - 6;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(14, footerY - 2.5, pageWidth - 14, footerY - 2.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Mi Gusto · Sistema de Supervisión Operativa · Documento de Control Interno', 14, footerY + 1);

      doc.setFont('helvetica', 'bold');
      doc.text(`Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`, pageWidth - 14, footerY + 1, { align: 'right' });
    },
  });

  const fileName = `Historial_Cargas_MiGusto_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}.pdf`;
  doc.save(fileName);
}

/**
 * Exporta el Ranking y Métricas (Día o Mes) a un PDF optimizado de alta categoría.
 */
export async function exportRankingPDF({
  rankingView = 'dia',
  dateTitle = '',
  month = '',
  rankedList = [],
  kpis = {},
  storesMonthly = [],
  supervisorasMonthly = [],
}) {
  const isDia = rankingView === 'dia';
  const doc = new jsPDF(isDia ? 'portrait' : 'landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await getLogoBase64();

  const now = new Date();
  const emisionStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} hs`;

  if (isDia) {
    // --- RANKING DIARIO (PORTRAIT) ---
    const cardsStartY = drawPrintHeader(doc, {
      logoBase64,
      title: `Ranking Operativo Diario · ${dateTitle}`,
      subtitle: 'Monitoreo diario de ventas, comandas y cumplimiento de sucursales',
      dateRight: emisionStr,
      isLandscape: false,
    });

    let totVenta = 0, totCmd = 0, totUnid = 0, cargadas = 0;
    rankedList.forEach((r) => {
      if (r.isLoaded) {
        cargadas++;
        totVenta += Number(r.venta) || 0;
        totCmd += Number(r.comandas) || 0;
        totUnid += Number(r.unidades) || 0;
      }
    });

    const cards = [
      { label: 'Tiendas Cargadas', val: `${cargadas} de ${rankedList.length}`, color: [2, 132, 199] },
      { label: 'Venta Total Día', val: ARS.format(totVenta), color: [16, 185, 129] },
      { label: 'Comandas Totales', val: INT.format(totCmd), color: [14, 165, 233] },
      { label: 'Unidades Vendidas', val: INT.format(totUnid), color: [225, 29, 72] },
    ];

    const tableStartY = drawKpiCards(doc, cardsStartY, cards, pageWidth);

    const rows = rankedList.map((item, i) => [
      item.isLoaded ? String(i + 1) : '-',
      item.tiendaNombre,
      item.supervisoraNombre || 'Sin asignar',
      item.isLoaded ? INT.format(item.comandas) : '—',
      item.isLoaded ? ARS.format(item.venta) : '—',
      item.isLoaded ? INT.format(item.unidades) : '—',
      item.isLoaded && item.ticketPromedio > 0 ? ARS.format(item.ticketPromedio) : '—',
      item.isLoaded ? 'Cargada' : 'Pendiente',
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [[
        { content: '#', styles: { halign: 'center' } },
        { content: 'SUCURSAL', styles: { halign: 'left' } },
        { content: 'SUPERVISORA', styles: { halign: 'left' } },
        { content: 'COMANDAS', styles: { halign: 'right' } },
        { content: 'VENTA ($)', styles: { halign: 'right' } },
        { content: 'UNIDADES', styles: { halign: 'right' } },
        { content: 'TICKET PROM.', styles: { halign: 'right' } },
        { content: 'ESTADO', styles: { halign: 'center' } },
      ]],
      body: rows,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 },
        lineWidth: 0.15,
        lineColor: [203, 213, 225],
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: { top: 2.4, bottom: 2.4, left: 2, right: 2 },
        lineWidth: 0.08,
        lineColor: [226, 232, 240],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10, textColor: [100, 116, 139] },
        1: { halign: 'left', fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { halign: 'left', textColor: [71, 85, 105] },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 30, fontStyle: 'bold', textColor: [4, 120, 87] },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'right', cellWidth: 26 },
        7: { halign: 'center', cellWidth: 22 },
      },
      alternateRowStyles: {
        fillColor: [250, 252, 254],
      },
      margin: { left: 14, right: 14, bottom: 14 },
      didDrawPage: (data) => {
        const footerY = pageHeight - 6;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(14, footerY - 2.5, pageWidth - 14, footerY - 2.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mi Gusto · Ranking Diario · ${dateTitle}`, 14, footerY + 1);

        doc.setFont('helvetica', 'bold');
        doc.text(`Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`, pageWidth - 14, footerY + 1, { align: 'right' });
      },
    });

    const fileDate = dateTitle.replace(/[\s\/]/g, '_');
    doc.save(`Ranking_Diario_MiGusto_${fileDate}.pdf`);
  } else {
    // --- ACUMULADO DEL MES (LANDSCAPE) ---
    const cardsStartY = drawPrintHeader(doc, {
      logoBase64,
      title: `Informe Mensual Consolidado · Período ${month}`,
      subtitle: 'Rendimiento acumulado integral y detalle de cumplimiento por sucursal',
      dateRight: emisionStr,
      isLandscape: true,
    });

    const cards = [
      { label: 'Venta Total Mes', val: ARS.format(kpis.venta || 0), color: [16, 185, 129] },
      { label: 'Comandas Acumuladas', val: INT.format(kpis.comandas || 0), color: [2, 132, 199] },
      { label: 'Unidades Vendidas', val: INT.format(kpis.unidades || 0), color: [225, 29, 72] },
      { label: 'Ticket Promedio Mes', val: ARS.format(kpis.ticketPromedio || 0), color: [217, 119, 6] },
    ];

    const tableStartY = drawKpiCards(doc, cardsStartY, cards, pageWidth);

    const rows = storesMonthly.map((s, idx) => [
      String(idx + 1),
      s.name,
      s.supName || 'Sin supervisora',
      INT.format(s.comandas),
      ARS.format(s.venta),
      INT.format(s.unidades),
      s.ticketPromedio > 0 ? ARS.format(s.ticketPromedio) : '-',
      s.unidadesPorComanda > 0 ? s.unidadesPorComanda.toFixed(1) : '-',
      `${s.diasCargados} días`,
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [[
        { content: '#', styles: { halign: 'center' } },
        { content: 'SUCURSAL', styles: { halign: 'left' } },
        { content: 'SUPERVISORA', styles: { halign: 'left' } },
        { content: 'COMANDAS', styles: { halign: 'right' } },
        { content: 'VENTA ACUM. ($)', styles: { halign: 'right' } },
        { content: 'UNIDADES', styles: { halign: 'right' } },
        { content: 'TICKET PROM.', styles: { halign: 'right' } },
        { content: 'UNID / CMDA', styles: { halign: 'right' } },
        { content: 'DÍAS CARGA', styles: { halign: 'center' } },
      ]],
      body: rows,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 },
        lineWidth: 0.15,
        lineColor: [203, 213, 225],
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: { top: 2.4, bottom: 2.4, left: 2, right: 2 },
        lineWidth: 0.08,
        lineColor: [226, 232, 240],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10, textColor: [100, 116, 139] },
        1: { halign: 'left', fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { halign: 'left', textColor: [71, 85, 105] },
        3: { halign: 'right', cellWidth: 24 },
        4: { halign: 'right', cellWidth: 36, fontStyle: 'bold', textColor: [4, 120, 87] },
        5: { halign: 'right', cellWidth: 24 },
        6: { halign: 'right', cellWidth: 28 },
        7: { halign: 'right', cellWidth: 24 },
        8: { halign: 'center', cellWidth: 24 },
      },
      alternateRowStyles: {
        fillColor: [250, 252, 254],
      },
      margin: { left: 14, right: 14, bottom: 14 },
      didDrawPage: (data) => {
        const footerY = pageHeight - 6;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(14, footerY - 2.5, pageWidth - 14, footerY - 2.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mi Gusto · Métricas Mensuales · Período ${month}`, 14, footerY + 1);

        doc.setFont('helvetica', 'bold');
        doc.text(`Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`, pageWidth - 14, footerY + 1, { align: 'right' });
      },
    });

    doc.save(`Metricas_Mensuales_MiGusto_${month}.pdf`);
  }
}

