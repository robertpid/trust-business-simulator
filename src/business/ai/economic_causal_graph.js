/**
 * TRUST Business Simulator - Etapa 2: Motor de Grafo Causal Económico (EconomicCausalGraph)
 * 
 * Modela la economía del simulador como un Grafo Dirigido Ponderado (Property Graph):
 * - Nodos: Variables macroeconómicas, comerciales, operativas y financieras.
 * - Aristas: Relaciones causa -> efecto con pesos de elasticidad.
 * - Algoritmos: Propagación de shocks multi-salto (BFS) y rastreo de causa raíz.
 */

export class EconomicCausalGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this._build_default_economic_graph();
  }

  add_node(id, label, category) {
    this.nodes.set(id, { id, label, category });
    if (!this.edges.has(id)) {
      this.edges.set(id, []);
    }
  }

  add_edge(source, target, weight, mechanism) {
    if (!this.edges.has(source)) this.edges.set(source, []);
    this.edges.get(source).push({ source, target, weight, mechanism });
  }

  _build_default_economic_graph() {
    this.add_node('macro_inflation', 'Inflación del País', 'macro');
    this.add_node('macro_gdp', 'Crecimiento PIB', 'macro');
    this.add_node('macro_interest', 'Tasa de Interés', 'macro');
    this.add_node('unit_var_cost', 'Costo Variable Unitario', 'operations');
    this.add_node('market_demand', 'Demanda Agregada', 'market');
    this.add_node('relative_price', 'Precio Relativo', 'commercial');
    this.add_node('value_attributes', 'Calidad y Servicio', 'commercial');
    this.add_node('market_share', 'Cuota de Mercado', 'market');
    this.add_node('sales_volume', 'Volumen de Ventas', 'operations');
    this.add_node('ending_inventory', 'Inventario en Bodega', 'operations');
    this.add_node('stockout_loss', 'Quiebre de Stock', 'operations');
    this.add_node('operating_margin', 'Margen Operativo (EBIT)', 'finance');
    this.add_node('cash_flow', 'Flujo de Caja Operativo', 'finance');
    this.add_node('emergency_overdraft', 'Crédito de Emergencia', 'finance');

    // Relaciones causales dirigidas (source -> target, elasticidad, mecanismo)
    this.add_edge('macro_inflation', 'unit_var_cost', 0.75, 'encarece insumos y logística');
    this.add_edge('unit_var_cost', 'operating_margin', -0.65, 'comprime el margen de contribución');
    this.add_edge('macro_gdp', 'market_demand', 0.85, 'expande el consumo sectorial');
    this.add_edge('macro_interest', 'market_demand', -0.45, 'enfría el consumo financiado');
    this.add_edge('macro_interest', 'cash_flow', -0.50, 'eleva el servicio de deuda bancaria');
    this.add_edge('market_demand', 'sales_volume', 0.80, 'impulsa las unidades vendidas');
    this.add_edge('relative_price', 'market_share', -0.70, 'reduce atractivo frente a competidores');
    this.add_edge('value_attributes', 'market_share', 0.65, 'fideliza segmentos de valor');
    this.add_edge('market_share', 'sales_volume', 0.90, 'determina órdenes recibidas');
    this.add_edge('sales_volume', 'ending_inventory', -0.80, 'rota el stock disponible');
    this.add_edge('ending_inventory', 'cash_flow', -0.75, 'inmoviliza capital de trabajo y bodegaje');
    this.add_edge('operating_margin', 'cash_flow', 0.85, 'genera liquidez operativa');
    this.add_edge('cash_flow', 'emergency_overdraft', -0.95, 'evita o activa rescate bancario');
  }

  /**
   * Propaga un shock económico desde un nodo origen mediante búsqueda en anchura (BFS).
   * @param {string} start_node_id - Nodo inicial ('macro_inflation', 'macro_gdp', 'macro_interest')
   * @param {number} initial_impulse - Magnitud inicial (-1.0 a +1.0)
   * @param {number} [max_hops=3]
   * @returns {Array<{hop: number, from_label: string, to_label: string, effect: number, mechanism: string}>}
   */
  propagate_shock(start_node_id, initial_impulse = 0.15, max_hops = 3) {
    if (!this.nodes.has(start_node_id)) return [];
    const queue = [{ node_id: start_node_id, impulse: initial_impulse, hop: 0 }];
    const visited = new Set([start_node_id]);
    const propagation_chain = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.hop >= max_hops) continue;

      const outgoing = this.edges.get(current.node_id) || [];
      for (const edge of outgoing) {
        const transmitted = Number((current.impulse * edge.weight).toFixed(3));
        if (Math.abs(transmitted) < 0.01) continue;

        const from_node = this.nodes.get(edge.source);
        const to_node = this.nodes.get(edge.target);

        propagation_chain.push({
          hop: current.hop + 1,
          from_node: edge.source,
          to_node: edge.target,
          from_label: from_node?.label || edge.source,
          to_label: to_node?.label || edge.target,
          effect: transmitted,
          mechanism: edge.mechanism
        });

        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push({ node_id: edge.target, impulse: transmitted, hop: current.hop + 1 });
        }
      }
    }

    return propagation_chain;
  }

  /**
   * Construye la ruta causal específica que explica el resultado de un equipo en la ronda.
   * @param {Object} team_result
   * @param {Object} optimal_benchmark
   * @returns {{ nodes_path: Array<string>, causal_chain_text: string }}
   */
  trace_team_causal_chain(team_result, optimal_benchmark) {
    const opt_price = optimal_benchmark?.optimal_price || team_result.price;
    const price_diff_pct = opt_price > 0 ? ((team_result.price - opt_price) / opt_price) * 100 : 0;
    const steps = [];

    if (price_diff_pct > 12) {
      steps.push(`Precio alto (+${price_diff_pct.toFixed(0)}% vs mercado)`);
      steps.push(`Cuota limitada (${(team_result.market_share * 100).toFixed(1)}%)`);
    } else if (price_diff_pct < -12) {
      steps.push(`Precio agresivo (${price_diff_pct.toFixed(0)}% vs óptimo)`);
      steps.push(`Alta tracción comercial (${(team_result.market_share * 100).toFixed(1)}%)`);
    } else {
      steps.push(`Precio competitivo (${(team_result.market_share * 100).toFixed(1)}% cuota)`);
    }

    if ((team_result.ending_inventory || 0) > team_result.capacity * 0.25) {
      steps.push(`Stock acumulado (${Math.round(team_result.ending_inventory).toLocaleString('es-PE')} uds)`);
      steps.push(`Costo de bodegaje y capital inmovilizado`);
    } else if ((team_result.stockout_units || 0) > 0) {
      steps.push(`Quiebre de stock (${Math.round(team_result.stockout_units).toLocaleString('es-PE')} uds perdidas)`);
    } else {
      steps.push(`Uso eficiente de capacidad (${(team_result.capacity_utilization * 100).toFixed(0)}%)`);
    }

    if ((team_result.emergency_loan || 0) > 0) {
      steps.push(`Déficit de caja`);
      steps.push(`Crédito de Emergencia Bancario`);
    } else {
      steps.push(`Margen ${(team_result.margin * 100).toFixed(1)}% con liquidez sana`);
    }

    return {
      nodes_path: steps,
      causal_chain_text: steps.join(' ──► ')
    };
  }
}
