/**
 * TRUST Business Simulator - Capa de Persistencia e IA: Base de Datos Vectorial Ligera
 * 
 * Implementa un motor vectorial embebido de alta velocidad (< 1ms) con:
 * - Búsqueda k-NN por Similitud del Coseno (Cosine Similarity)
 * - Codificación de estados económicos y decisiones en vectores de 8 dimensiones
 * - Vectores semilla de Arquetipos Académicos Universitarios (Porter, Bertrand, Liquidez)
 * - Memoria Episódica continua (aprende de las mejores jugadas de cada ronda)
 */

export const ACADEMIC_ARCHETYPE_VECTORS = Object.freeze([
  {
    id: 'arch_porter_differentiation',
    type: 'academic_archetype',
    title: 'Diferenciación Premium (Michael Porter)',
    vector: [0.68, 0.90, 0.88, 0.80, 0.88, 0.08, 1.00, 0.85],
    theory_note: 'Creación de alto valor percibido mediante calidad y servicio superiores que sostienen márgenes elevados.',
    detected_bias: 'Alineación con Diferenciación de Porter',
    socratic_question: '¿Cómo protegerán su ventaja de marca y calidad si un competidor imita sus atributos con menor precio?'
  },
  {
    id: 'arch_porter_cost_leadership',
    type: 'academic_archetype',
    title: 'Liderazgo en Costos y Escala (Michael Porter)',
    vector: [0.42, 0.65, 0.65, 0.60, 0.98, 0.04, 0.95, 0.78],
    theory_note: 'Precio competitivo respaldado por máxima utilización de capacidad instalada y mínima merma de inventario.',
    detected_bias: 'Alineación con Liderazgo en Costos',
    socratic_question: 'Al operar casi al 100% de capacidad con precios ajustados, ¿cómo absorberán un eventual shock inflacionario de insumos?'
  },
  {
    id: 'arch_bertrand_price_war',
    type: 'academic_archetype',
    title: 'Trampa de Guerra de Precios de Bertrand',
    vector: [0.22, 0.50, 0.50, 0.75, 0.95, 0.05, 0.15, 0.10],
    theory_note: 'Destrucción de valor por fijar precios bajo el costo total medio intentando capturar volumen sin estructura de costos baja.',
    detected_bias: 'Guerra de precios destructiva (Paradoja de Bertrand)',
    socratic_question: '¿El volumen adicional que ganaron bajando el precio compensó la destrucción del margen unitario y la pérdida operativa?'
  },
  {
    id: 'arch_working_capital_trap',
    type: 'academic_archetype',
    title: 'Crisis de Capital de Trabajo por Sobreproducción',
    vector: [0.78, 0.55, 0.55, 0.65, 0.45, 0.75, 0.10, 0.25],
    theory_note: 'Inmovilización severa de efectivo en inventario no vendido que drena el flujo de caja y fuerza sobregiro bancario.',
    detected_bias: 'Sobreproducción y capital atrapado en bodega',
    socratic_question: 'Con alto stock inmovilizado en almacén, ¿cuánto deben recortar la producción nueva en la próxima ronda para liberar caja?'
  },
  {
    id: 'arch_stockout_bottleneck',
    type: 'academic_archetype',
    title: 'Cuello de Botella Operativo (Quiebre de Stock)',
    vector: [0.45, 0.75, 0.75, 0.70, 1.00, 0.00, 0.80, 0.60],
    theory_note: 'Pérdida de costo de oportunidad por generar demanda superior a la capacidad física de abastecimiento.',
    detected_bias: 'Quiebre de stock (Demanda insatisfecha)',
    socratic_question: 'Dejaron clientes sin atender por falta de unidades disponibles. ¿Conviene ampliar capacidad o subir el precio para capturar mayor margen?'
  },
  {
    id: 'arch_price_value_disconnect',
    type: 'academic_archetype',
    title: 'Desconexión Precio-Valor (Sobreprecio sin Atributos)',
    vector: [0.92, 0.35, 0.35, 0.20, 0.35, 0.60, 0.40, 0.30],
    theory_note: 'Fijación de precios altos sin respaldo en calidad, servicio ni posicionamiento comercial.',
    detected_bias: 'Desconexión entre precio alto y valor percibido',
    socratic_question: 'Si cobran un precio superior al promedio del mercado, ¿sus niveles actuales de calidad y servicio justifican ese precio ante el cliente?'
  }
]);

export class VectorMemoryStore {
  constructor(initial_records = ACADEMIC_ARCHETYPE_VECTORS) {
    this.records = new Map();
    for (const item of initial_records) {
      this.records.set(item.id, { ...item });
    }
  }

  /**
   * Calcula la Similitud del Coseno entre dos vectores numéricos (rango [0, 1]).
   * @param {Array<number>} vec_a
   * @param {Array<number>} vec_b
   * @returns {number}
   */
  static cosine_similarity(vec_a, vec_b) {
    if (!vec_a || !vec_b || vec_a.length !== vec_b.length) return 0;
    let dot = 0;
    let norm_a = 0;
    let norm_b = 0;
    for (let i = 0; i < vec_a.length; i++) {
      dot += vec_a[i] * vec_b[i];
      norm_a += vec_a[i] * vec_a[i];
      norm_b += vec_b[i] * vec_b[i];
    }
    const denom = Math.sqrt(norm_a) * Math.sqrt(norm_b);
    return denom > 0 ? Number((dot / denom).toFixed(4)) : 0;
  }

  /**
   * Codifica el estado y decisión de un equipo en un vector normalizado de 8 dimensiones [0, 1].
   * Dimensiones: [precio_rel, calidad, servicio, mkt_rel, uso_capacidad, presion_stock, liquidez, rentabilidad]
   */
  static encode_team_state_vector(team_result, optimal_benchmark) {
    const opt_price = optimal_benchmark?.optimal_price || team_result.price || 1;
    const opt_mkt = optimal_benchmark?.optimal_marketing || team_result.marketing || 1;

    const d0_price = Math.max(0, Math.min(1, (team_result.price / opt_price) * 0.55));
    const d1_quality = Math.max(0, Math.min(1, (team_result.quality || 50) / 100));
    const d2_service = Math.max(0, Math.min(1, (team_result.service || 50) / 100));
    const d3_mkt = Math.max(0, Math.min(1, (team_result.marketing / Math.max(1, opt_mkt)) * 0.65));
    const d4_cap_use = Math.max(0, Math.min(1, team_result.capacity_utilization ?? 0.7));
    const d5_inv_pressure = team_result.capacity > 0
      ? Math.max(0, Math.min(1, (team_result.ending_inventory || 0) / team_result.capacity))
      : 0;
    const d6_liquidity = (team_result.emergency_loan || 0) > 0 ? 0.08 : 0.95;
    const d7_profitability = Math.max(0, Math.min(1, ((team_result.margin || 0) + 0.20) / 0.45));

    return [
      Number(d0_price.toFixed(3)),
      Number(d1_quality.toFixed(3)),
      Number(d2_service.toFixed(3)),
      Number(d3_mkt.toFixed(3)),
      Number(d4_cap_use.toFixed(3)),
      Number(d5_inv_pressure.toFixed(3)),
      Number(d6_liquidity.toFixed(3)),
      Number(d7_profitability.toFixed(3))
    ];
  }

  /**
   * Búsqueda k-NN de los k registros vectoriales más cercanos por Similitud del Coseno.
   * @param {Array<number>} query_vector
   * @param {number} [top_k=2]
   * @param {string|null} [filter_type=null] - 'academic_archetype' | 'episodic_winner'
   * @returns {Array<Object>}
   */
  query_nearest(query_vector, top_k = 2, filter_type = null) {
    const matches = [];
    for (const record of this.records.values()) {
      if (filter_type && record.type !== filter_type) continue;
      const similarity = VectorMemoryStore.cosine_similarity(query_vector, record.vector);
      matches.push({ ...record, similarity });
    }
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches.slice(0, top_k);
  }

  /**
   * Indexa un nuevo episodio de aprendizaje en la base de datos vectorial.
   */
  upsert_vector(id, vector, metadata = {}) {
    this.records.set(id, {
      id,
      vector,
      ...metadata
    });
  }
}
