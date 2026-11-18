/**
 * TRUST Business Simulator - Generador de Guía Ejecutiva PDF para Economistas y Clientes
 * 
 * Utiliza PDFKit para generar un documento de alta calidad editorial con
 * tipografía ejecutiva, cajas de resalte, tablas y fundamentos microeconómicos.
 */

import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const PDF_OUTPUT_PATH = path.resolve('TRUST_Simulador_Economico_Guia_Ejecutiva.pdf');

function create_executive_pdf() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    bufferPages: true
  });

  const write_stream = fs.createWriteStream(PDF_OUTPUT_PATH);
  doc.pipe(write_stream);

  // Paleta de colores ejecutiva
  const C_DARK = '#141714';
  const C_GREEN = '#6b7d00';
  const C_MUTED = '#555c52';
  const C_BG_CARD = '#f5f7f2';
  const C_LINE = '#d6dbce';

  // --- CABECERA ---
  doc.rect(45, 40, doc.page.width - 90, 3).fill(C_GREEN);
  doc.moveDown(0.8);

  doc.fontSize(20).fillColor(C_DARK).font('Helvetica-Bold')
     .text('TRUST Business Simulator', { continued: true })
     .fillColor(C_GREEN).text(' | Guía Ejecutiva');

  doc.fontSize(10.5).fillColor(C_MUTED).font('Helvetica')
     .text('Documento Técnico: Fundamentos Microeconómicos, Operativos y Pedagógicos');

  doc.fontSize(8.5).fillColor(C_MUTED)
     .text('Audiencia: Economistas, Docentes Universitarios y Consultores Estratégicos · Versión 1.0', { align: 'right' });

  doc.moveDown(0.6);
  doc.moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).strokeColor(C_LINE).lineWidth(0.8).stroke();
  doc.moveDown(0.8);

  // --- RESUMEN EJECUTIVO (CALLOUT) ---
  const callout_y = doc.y;
  doc.roundedRect(45, callout_y, doc.page.width - 90, 62, 6).fill(C_BG_CARD);
  doc.fillColor(C_DARK).font('Helvetica-Bold').fontSize(10)
     .text('SÍNTESIS EJECUTIVA DEL MODELO', 55, callout_y + 10);
  doc.font('Helvetica').fontSize(8.5).fillColor('#2d332a')
     .text('TRUST es una plataforma de simulación microeconómica en tiempo real que modela la competencia simultánea entre empresas bajo supuestos de competencia imperfecta (diferenciación de producto), rendimientos de escala, restricciones físicas de inventario y disciplina financiera estricta con penalización de iliquidez estilo TOPSIM. Diseñado para contrastar hipótesis estratégicas contra la realidad del mercado.', 55, callout_y + 24, { width: doc.page.width - 110, align: 'justify' });

  doc.y = callout_y + 72;

  // Helper para secciones
  function add_section_header(title) {
    doc.moveDown(0.8);
    const y = doc.y;
    doc.rect(45, y + 2, 3, 14).fill(C_GREEN);
    doc.fontSize(12).fillColor(C_DARK).font('Helvetica-Bold').text(`  ${title}`, 50, y);
    doc.moveDown(0.4);
  }

  // --- SECCIÓN 1: MICROECONOMÍA ---
  add_section_header('1. Fundamentos Microeconómicos de la Demanda y Atractivo');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('A diferencia de simuladores basados en hojas de cálculo estáticas, TRUST modela un mercado oligopólico dinámico donde la demanda total y la participación de cada firma emergen de decisiones simultáneas:', { align: 'justify' });
  doc.moveDown(0.4);

  doc.font('Helvetica-Bold').text('• Demanda Agregada Sensible al Ciclo Macroeconómico: ')
     .font('Helvetica').text('La demanda del sector no es fija. Crece o se contrae endógenamente según el crecimiento del PIB real, la inflación y la tasa de referencia del país seleccionado, permitiendo simular expansiones o choques recesivos.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Modelo de Atractivo Comercial Multiplicativo (MCI): ')
     .font('Helvetica').text('La cuota de mercado de cada firma se calcula ponderando el precio relativo frente a la industria (elasticidad-precio), la inversión publicitaria (con rendimientos marginales decrecientes), la calidad del producto y el nivel de servicio al cliente. Precios predatorios sin respaldo de costos derivan en pérdidas operativas.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Segmentación Heterogénea de Clientes: ')
     .font('Helvetica').text('La demanda total se reparte en 3 segmentos con curvas de indiferencia distintas: (1) Segmento Económico (40%, alta elasticidad-precio), (2) Segmento Masivo (40%, pondera balance precio-marca) y (3) Segmento Premium (20%, inelástico al precio, exige alta calidad y servicio).');

  // --- SECCIÓN 2: COSTOS Y TOPSIM ---
  add_section_header('2. Estructura de Costos, Operaciones y Gestión de Inventarios');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('El simulador incorpora restricciones operativas y funciones de producción neoclásicas:', { align: 'justify' });
  doc.moveDown(0.4);

  doc.font('Helvetica-Bold').text('• 5 Arquetipos de Escala Empresarial: ')
     .font('Helvetica').text('Soporta desde Micro/MYPE hasta Grandes Corporaciones y Startups. Cada escala parametriza costos fijos de estructura, costos variables por unidad y capacidad productiva máxima.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Restricción Física de Capacidad y Quiebre de Stock: ')
     .font('Helvetica').text('Una firma no puede vender más de lo que tiene físicamente disponible (Inventario Inicial + Producción de la ronda). Si su demanda excede su capacidad disponible, sufre quiebre de stock: clientes desatendidos migran a los rivales y se pierden ingresos.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Costo de Almacenamiento Inter-Ronda (Holding Cost): ')
     .font('Helvetica').text('El stock no vendido se traslada a la siguiente ronda devengando un costo de bodegaje del 12% por periodo. Esto penaliza severamente la sobreproducción y el capital de trabajo ocioso.');

  // --- SECCIÓN 3: FINANZAS Y CRÉDITO DE EMERGENCIA ---
  add_section_header('3. Rigurosidad Financiera y Rescate Bancario por Iliquidez');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('En cada periodo se generan automáticamente tres estados financieros auditados: (1) Estado de Resultados (P&L), (2) Flujo de Caja Operativo y (3) Balance General.');
  doc.moveDown(0.3);

  const fin_box_y = doc.y;
  doc.roundedRect(45, fin_box_y, doc.page.width - 90, 48, 5).fill('#fbf4ef');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#8f2f00')
     .text('🚨 REGLA ESTRICTA DE LIQUIDEZ (CRÉDITO DE EMERGENCIA BANCARIO):', 55, fin_box_y + 8);
  doc.font('Helvetica').fillColor('#422000').fontSize(8)
     .text('Si las salidas de caja (costos fijos, insumos, marketing) superan las cobranzas y agotan las reservas de efectivo, el sistema gatilla un sobregiro bancario forzoso con tasa punitiva (+12% anual). Esta penalización modela el costo real de distress financiero y enseña a los estudiantes la primacía del flujo de caja sobre la utilidad contable.', 55, fin_box_y + 20, { width: doc.page.width - 110, align: 'justify' });

  doc.y = fin_box_y + 56;

  // --- NUEVA PÁGINA: SECCIÓN 4, 5 Y 6 ---
  doc.addPage();

  // --- SECCIÓN 4: MACROECONOMÍA VIVA ---
  add_section_header('4. Sincronización Macroeconómica Global en Tiempo Real');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('El simulador no inventa datos económicos ficticios. Cuenta con conectores en vivo a fuentes multilaterales oficiales:', { align: 'justify' });
  doc.moveDown(0.4);

  doc.font('Helvetica-Bold').text('• Banco Mundial (World Bank Open Data API): ')
     .font('Helvetica').text('Extrae la tasa de inflación real (que ajusta los costos marginales de materias primas), el crecimiento del PIB del país y la tasa de política monetaria.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Cobertura Multipaís y Divisas Locales: ')
     .font('Helvetica').text('Permite seleccionar más de 25 economías o diseñar un país a medida con su propia moneda (Soles, Dólares, Pesos, Euros, etc.), facilitando comparar decisiones en entornos de baja o alta inflación.');

  // --- SECCIÓN 5: INTELIGENCIA ADAPTATIVA Y ROLES ---
  add_section_header('5. Malla de Inteligencia Económica y Separación de Roles');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('Para garantizar una experiencia ejecutiva y pedagógica intuitiva, el sistema resuelve la interacción entre usuarios de manera formal:');
  doc.moveDown(0.4);

  doc.font('Helvetica-Bold').text('• Acceso Profesor (Control y Dirección): ')
     .font('Helvetica').text('Permite al docente configurar el mercado, activar eventos de shock, avanzar las rondas, supervisar las decisiones de todos los equipos y exportar el acta de notas oficial.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Acceso Alumno (Privacidad y Confidencialidad): ')
     .font('Helvetica').text('Cada equipo ingresa a su empresa de manera exclusiva. Las decisiones operativas y los estados financieros privados no son visibles para los competidores, replicando el entorno de mercado real.');
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('• Orientación Estratégica sin Jerga Informática: ')
     .font('Helvetica').text('El asistente analiza el mercado y ofrece al docente diagnósticos cualitativos en términos de Michael Porter (Liderazgo en Costos, Diferenciación o Enfoque), formulando preguntas socráticas para el debate en clase.');

  // --- SECCIÓN 6: CALIFICACIÓN UNIVERSITARIA ---
  add_section_header('6. Evaluación Académica y Exportación a Excel');

  doc.fontSize(9).font('Helvetica').fillColor(C_DARK);
  doc.text('El sistema genera de forma transparente la calificación de cada grupo según estándares universitarios:');
  doc.moveDown(0.4);

  // Tabla explicativa
  const table_top = doc.y;
  const col1 = 50, col2 = 140, col3 = 310;
  
  doc.rect(45, table_top, doc.page.width - 90, 16).fill('#eaeee5');
  doc.fillColor(C_DARK).font('Helvetica-Bold').fontSize(8)
     .text('Dimensión Evaluada', col1, table_top + 4)
     .text('Criterio Técnico Microeconómico', col2, table_top + 4)
     .text('Impacto en Nota Final (0-20)', col3, table_top + 4);

  const rows = [
    ['Desempeño Global', 'Score ponderado de rentabilidad, cuota, solvencia y calidad', 'Base de la nota (0 - 20 pts)'],
    ['Curva de Aprendizaje', 'Evolución positiva del rendimiento entre la ronda inicial y final', 'Bonificación de hasta +1.0 pt'],
    ['Solvencia y Liquidez', 'Porcentaje de rondas operadas sin rescate de crédito forzoso', 'Penaliza rescates bancarios'],
    ['Exportación a Excel', 'Acta formal con fórmulas, notas (0-20 / 0-100) y balances', 'Descarga directa (.xls / .csv)']
  ];

  let current_y = table_top + 16;
  rows.forEach((r, idx) => {
    const row_bg = idx % 2 === 0 ? '#ffffff' : '#f8faf6';
    doc.rect(45, current_y, doc.page.width - 90, 18).fill(row_bg);
    doc.fillColor(C_DARK).font('Helvetica-Bold').fontSize(8).text(r[0], col1, current_y + 5);
    doc.font('Helvetica').fontSize(8).text(r[1], col2, current_y + 5, { width: 160 });
    doc.text(r[2], col3, current_y + 5, { width: 180 });
    current_y += 18;
  });

  doc.y = current_y + 12;

  // --- PIE DE PÁGINA Y CONCLUSIÓN ---
  const conclusion_y = doc.y;
  doc.roundedRect(45, conclusion_y, doc.page.width - 90, 48, 6).fill(C_BG_CARD);
  doc.fillColor(C_DARK).font('Helvetica-Bold').fontSize(8.5)
     .text('CONCLUSIÓN PARA EL CLIENTE / DIRECTOR ACADÉMICO:', 55, conclusion_y + 8);
  doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
     .text('TRUST Business Simulator combina el rigor analítico de la microeconomía y las finanzas corporativas con una interfaz ágil, moderna y lista para utilizarse en aulas universitarias o programas corporativos. Es una herramienta diseñada por y para la toma de decisiones estratégicas fundamentadas.', 55, conclusion_y + 20, { width: doc.page.width - 110, align: 'justify' });

  // Numeración de páginas
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(C_MUTED)
       .text(`Página ${i + 1} de ${range.count} · TRUST Business Simulator V1.0`, 45, doc.page.height - 30, {
         align: 'center',
         width: doc.page.width - 90
       });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    write_stream.on('finish', () => resolve(PDF_OUTPUT_PATH));
    write_stream.on('error', reject);
  });
}

create_executive_pdf()
  .then((file_path) => {
    console.log(`[PDF SUCCESS] Generado exitosamente en: ${file_path}`);
  })
  .catch((err) => {
    console.error('[PDF ERROR]', err);
    process.exit(1);
  });
