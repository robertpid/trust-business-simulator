/**
 * TRUST Business Simulator - Etapa 2: CEREBRO 1 - Generador del Mundo (WorldBrainAI)
 * 
 * Utiliza el Grafo Causal Económico (EconomicCausalGraph) para propagar shocks
 * multi-salto, respetando los eventos habilitados individualmente por el docente.
 */

import { MARKET_EVENTS, DEFAULT_NEUTRAL_EVENT } from '../../domain/constants.js';
import { EconomicCausalGraph } from './economic_causal_graph.js';

export class WorldBrainAI {
  /**
   * Filtra el catálogo de eventos según las opciones marcadas por el profesor.
   * @param {import('../../domain/models.js').SimulationConfig} config
   * @returns {Array<Object>}
   */
  static get_allowed_events(config) {
    if (!config || !config.events_enabled) return [DEFAULT_NEUTRAL_EVENT];
    if (Array.isArray(config.selected_event_ids)) {
      if (config.selected_event_ids.length === 0) return [DEFAULT_NEUTRAL_EVENT];
      const allowed = MARKET_EVENTS.filter(
        e => config.selected_event_ids.includes(e.id) || e.id === 'event_baseline'
      );
      return allowed.length > 0 ? allowed : [DEFAULT_NEUTRAL_EVENT];
    }
    return MARKET_EVENTS;
  }

  /**
   * Genera el evento de mercado para la ronda y propaga su onda causal en el grafo económico.
   */
  static generate_contextual_event({
    config,
    round_number,
    coach_signal = 'balanced_progression',
    causal_graph = new EconomicCausalGraph()
  }) {
    if (!config || !config.events_enabled) {
      return {
        ...DEFAULT_NEUTRAL_EVENT,
        ai_rationale: 'Eventos desactivados por el profesor.',
        triggered_by_signal: 'none',
        causal_propagation: []
      };
    }

    const allowed_pool = this.get_allowed_events(config);
    if (allowed_pool.length === 1 && allowed_pool[0].id === 'event_baseline') {
      return {
        ...DEFAULT_NEUTRAL_EVENT,
        ai_rationale: 'El profesor desmarcó todos los eventos extraordinarios; se mantiene escenario estable.',
        triggered_by_signal: 'none',
        causal_propagation: []
      };
    }

    const country = config.country_name || config.country || 'el país';
    const macro = config.macro || { inflation: 3.0, gdp: 3.0, interest: 8.0 };

    if (round_number > 1 && coach_signal !== 'balanced_progression') {
      if (coach_signal === 'challenge_high_margins') {
        const chain = causal_graph.propagate_shock('macro_inflation', 0.25, 3);
        return {
          id: 'ai_event_supply_pressure',
          name: `Presión de costos e insumos en ${country}`,
          text: `El encarecimiento logístico y de materias primas en ${country} (inflación: ${macro.inflation}%) eleva los costos variables del sector.`,
          cost_multiplier: 1.12,
          demand_multiplier: 0.98,
          ai_rationale: 'Los equipos lograron márgenes altos en la ronda previa; el mercado introduce presión de costos para evaluar su eficiencia.',
          triggered_by_signal: coach_signal,
          causal_propagation: chain
        };
      }

      if (coach_signal === 'test_inventory_discipline') {
        const chain = causal_graph.propagate_shock('macro_interest', 0.25, 3);
        return {
          id: 'ai_event_demand_contraction',
          name: `Moderación del consumo en ${country}`,
          text: `Las tasas de interés (${macro.interest}%) moderan las compras en ${country}, exigiendo cuidar la producción y vender el stock acumulado.`,
          cost_multiplier: 1.02,
          demand_multiplier: 0.89,
          ai_rationale: 'Se detectó exceso de mercadería guardada en almacén; el entorno premia a quienes controlen su producción.',
          triggered_by_signal: coach_signal,
          causal_propagation: chain
        };
      }

      if (coach_signal === 'stabilize_or_demand_stimulus') {
        const chain = causal_graph.propagate_shock('macro_gdp', 0.25, 3);
        return {
          id: 'ai_event_market_rebound',
          name: `Reactivación comercial del sector en ${country}`,
          text: `El crecimiento económico en ${country} (PIB: ${macro.gdp}%) impulsa las ventas, dando oportunidad para recuperar caja.`,
          cost_multiplier: 1.00,
          demand_multiplier: 1.15,
          ai_rationale: 'Hubo falta de efectivo en la ronda previa; el mercado abre una ventana de mayor demanda para facilitar la recuperación.',
          triggered_by_signal: coach_signal,
          causal_propagation: chain
        };
      }
    }

    const index = (round_number * 3 + config.teams.length + config.industry.length) % allowed_pool.length;
    const base_event = allowed_pool[index];
    const origin_node = base_event.cost_multiplier > 1 ? 'macro_inflation' : 'macro_gdp';
    const chain = causal_graph.propagate_shock(origin_node, 0.15, 2);

    const macro_context = base_event.name === 'Sin evento extraordinario'
      ? `Entorno económico estable en ${country} (Inflación: ${macro.inflation}%, PIB: ${macro.gdp}%).`
      : `${base_event.text} Contexto ${country}: Inflación ${macro.inflation}% · Tasa ${macro.interest}%.`;

    return {
      ...base_event,
      text: macro_context,
      ai_rationale: `Evento seleccionado dentro de las opciones habilitadas por el profesor para ${country}.`,
      triggered_by_signal: coach_signal,
      causal_propagation: chain
    };
  }
}
