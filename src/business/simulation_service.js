/**
 * TRUST Business Simulator - Capa de Negocio: Servicio Orquestador de Simulación
 * 
 * Orquesta la ejecución de rondas competitivas integrando:
 * - Red de 3 Cerebros de IA Intercomunicados (AIBrainOrchestrator - Etapa 2)
 * - Demanda agregada escalada por arquetipo empresarial (DemandEngine - Etapa 1)
 * - Modelo de atracción y cuotas (AttractionEngine)
 * - Segmentación de clientes (SegmentEngine - Etapa 3)
 * - Contabilidad, inventarios y bodegaje (AccountingEngine + InventoryEngine - Etapa 3)
 * - Flujo de caja, balance y rescate bancario (FinanceEngine - Etapa 3)
 * - Balanced Scorecard y ranking (EvaluationEngine)
 */

import { INDUSTRIES, DEFAULT_NEUTRAL_EVENT, get_scale_archetype } from '../domain/constants.js';
import { SimulationConfig, RoundSummary, TeamRoundResult } from '../domain/models.js';
import { validate_simulation_config, validate_team_decision, DomainValidationError } from '../domain/validators.js';
import { DemandEngine } from './demand_engine.js';
import { AttractionEngine } from './attraction_engine.js';
import { SegmentEngine } from './segment_engine.js';
import { AccountingEngine } from './accounting_engine.js';
import { FinanceEngine } from './finance_engine.js';
import { EvaluationEngine } from './evaluation_engine.js';
import { AIBrainOrchestrator } from './ai/ai_brain_orchestrator.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SimulationService');

export class SimulationService {
  constructor(config) {
    this.ai_orchestrator = new AIBrainOrchestrator();
    if (config) {
      this.init(config);
    } else {
      this.config = null;
      this.current_round = 1;
      this.history = [];
      this.last_summary = null;
      this.active_event = DEFAULT_NEUTRAL_EVENT;
      this.team_states = new Map();
    }
  }

  init(config_data) {
    const config = config_data instanceof SimulationConfig
      ? config_data
      : SimulationConfig.fromJSON(config_data);

    validate_simulation_config(config);

    this.config = config;
    this.current_round = 1;
    this.history = [];
    this.last_summary = null;
    this.ai_orchestrator = new AIBrainOrchestrator();
    this.active_event = this.ai_orchestrator.prepare_world_event(config, 1);
    this.team_states = new Map();

    for (const team of config.teams) {
      this.team_states.set(team.id, {
        ending_inventory: 0,
        finance: FinanceEngine.create_initial_financial_state(config.size)
      });
    }

    logger.info(`Simulación inicializada: "${config.name}" (Industria: ${config.industry}, Escala: ${config.size})`);
  }

  restore_history(saved_history) {
    if (!Array.isArray(saved_history) || saved_history.length === 0) return;
    this.history = saved_history;
    this.current_round = saved_history.length + 1;
    this.last_summary = saved_history[saved_history.length - 1];
    if (this.last_summary.ai_mesh?.next_world_signal) {
      this.ai_orchestrator.last_coach_signal = this.last_summary.ai_mesh.next_world_signal;
    }
    this.active_event = this.ai_orchestrator.prepare_world_event(this.config, this.current_round);

    for (const r of this.last_summary.results || []) {
      const prev = this.team_states.get(r.team_id) || {
        ending_inventory: 0,
        finance: FinanceEngine.create_initial_financial_state(this.config.size)
      };
      this.team_states.set(r.team_id, {
        ending_inventory: r.ending_inventory || 0,
        finance: {
          ...prev.finance,
          cash: r.cash ?? prev.finance.cash,
          emergency_loan: r.emergency_loan ?? 0,
          equity: r.equity ?? prev.finance.equity
        }
      });
    }
  }

  get_current_industry() {
    if (!this.config) return INDUSTRIES.textile;
    return INDUSTRIES[this.config.industry] || INDUSTRIES.textile;
  }

  get_team_initial_inventory(team_id) {
    return this.team_states.get(team_id)?.ending_inventory || 0;
  }

  generate_default_decision(team_index = 0) {
    const industry = this.get_current_industry();
    const archetype = get_scale_archetype(this.config ? this.config.size : 'Mediana');
    const team_count = Math.max(1, this.config ? this.config.teams.length : 4);
    const suggested_price = Number((industry.base_price * (0.95 + team_index * 0.03)).toFixed(2));
    const target_capacity = Math.ceil(((industry.base_demand * archetype.demand_scale_factor) / team_count) * 1.15);

    return {
      price: suggested_price,
      marketing: archetype.default_marketing_budget,
      quality: 65,
      service: 65,
      capacity: target_capacity,
      people: 50,
      innovation: 55,
      reason: ''
    };
  }

  _evaluate_team_round(decision, total_demand, share_map, segment_map, industry, active_event) {
    const team = this.config.teams.find(t => t.id === decision.team_id) || { name: decision.team_id };
    const share_info = share_map.get(decision.team_id) || { market_share: 1 / this.config.teams.length };
    const potential_demand = total_demand * share_info.market_share;
    const prev_state = this.team_states.get(decision.team_id) || {
      ending_inventory: 0,
      finance: FinanceEngine.create_initial_financial_state(this.config.size)
    };

    const statement = AccountingEngine.compute_team_statement({
      decision,
      potential_demand,
      base_variable_cost: industry.variable_cost,
      annual_inflation_percent: this.config.macro.inflation,
      event_cost_multiplier: active_event.cost_multiplier,
      company_size: this.config.size,
      complexity_level: this.config.complexity,
      initial_inventory: prev_state.ending_inventory
    });

    const fin_statement = FinanceEngine.compute_financial_statement({
      previous_state: prev_state.finance,
      operating_profit: statement.profit,
      inventory_value: statement.inventory.inventory_value,
      holding_cost: statement.inventory.holding_cost,
      base_interest_rate: this.config.macro.interest,
      company_size: this.config.size
    });

    this.team_states.set(decision.team_id, {
      ending_inventory: statement.inventory.ending_inventory,
      finance: fin_statement
    });

    const dimension_scores = EvaluationEngine.compute_dimension_scores({
      margin: statement.margin,
      market_share: share_info.market_share,
      sales: statement.sales,
      capacity: decision.capacity,
      people: decision.people,
      quality: decision.quality,
      innovation: decision.innovation
    });

    const overall_score = EvaluationEngine.compute_overall_score(dimension_scores, this.config.weights);

    return new TeamRoundResult({
      team_id: decision.team_id,
      team_name: team.name,
      ...decision.toJSON(),
      market_share: share_info.market_share,
      potential_demand,
      sales: statement.sales,
      initial_inventory: statement.inventory.initial_inventory,
      ending_inventory: statement.inventory.ending_inventory,
      stockout_units: statement.inventory.stockout_units,
      holding_cost: statement.inventory.holding_cost,
      revenue: statement.revenue,
      variable_cost: statement.costs.variable_cost,
      fixed_cost: statement.costs.fixed_cost,
      quality_cost: statement.costs.quality_cost,
      people_cost: statement.costs.people_cost,
      innovation_cost: statement.costs.innovation_cost,
      total_cost: statement.costs.total_cost,
      profit: statement.profit,
      net_profit: fin_statement.net_profit,
      margin: statement.margin,
      capacity_utilization: statement.capacity_utilization,
      cash: fin_statement.cash,
      emergency_loan: fin_statement.emergency_loan,
      equity: fin_statement.equity,
      solvency_ratio: fin_statement.solvency_ratio,
      segments: segment_map.get(decision.team_id) || null,
      score_breakdown: dimension_scores,
      score: overall_score
    });
  }

  execute_round(decisions) {
    if (!this.config) throw new DomainValidationError('No hay ninguna simulación configurada para ejecutar.');
    if (this.current_round > this.config.total_rounds) {
      throw new DomainValidationError(`La simulación ya ha completado las ${this.config.total_rounds} rondas programadas.`);
    }
    if (!Array.isArray(decisions) || decisions.length !== this.config.teams.length) {
      throw new DomainValidationError(
        `Se esperaban ${this.config.teams.length} decisiones de equipos, pero se recibieron ${decisions ? decisions.length : 0}.`
      );
    }

    decisions.forEach(decision => validate_team_decision(decision));

    const industry = this.get_current_industry();
    const round_num = this.current_round;
    const active_event = this.ai_orchestrator.prepare_world_event(this.config, round_num);
    this.active_event = active_event;

    const avg_init_inventory = Array.from(this.team_states.values())
      .reduce((acc, s) => acc + (s.ending_inventory || 0), 0) / Math.max(1, this.config.teams.length);

    const total_demand = DemandEngine.calculate_total_market_demand(
      industry.base_demand,
      this.config.macro.demand_growth,
      round_num,
      active_event.demand_multiplier,
      this.config.size
    );

    const market_shares = AttractionEngine.calculate_market_shares(decisions, total_demand, industry.weights, this.config.complexity);
    const share_map = new Map(market_shares.map(s => [s.team_id, s]));
    const segment_map = SegmentEngine.evaluate_segments(decisions, total_demand, industry.weights, this.config.complexity);

    const unranked_results = decisions.map(d =>
      this._evaluate_team_round(d, total_demand, share_map, segment_map, industry, active_event)
    );

    const ranked_results = EvaluationEngine.rank_team_results(unranked_results);
    const total_sales = ranked_results.reduce((acc, r) => acc + r.sales, 0);
    const total_revenue = ranked_results.reduce((acc, r) => acc + r.revenue, 0);
    const total_profit = ranked_results.reduce((acc, r) => acc + r.profit, 0);

    const { coach_feedback, ai_mesh } = this.ai_orchestrator.run_post_round_mesh({
      config: this.config,
      industry,
      round_number: round_num,
      active_event,
      total_demand,
      total_sales,
      ranked_results,
      average_initial_inventory: avg_init_inventory
    });

    const summary = new RoundSummary({
      round_number: round_num,
      active_event,
      total_market_demand: total_demand,
      total_market_sales: total_sales,
      total_market_revenue: total_revenue,
      total_market_profit: total_profit,
      results: ranked_results,
      coach_feedback,
      ai_mesh
    });

    this.last_summary = summary;
    this.history.push(summary);
    this.current_round += 1;
    this.active_event = this.ai_orchestrator.prepare_world_event(this.config, this.current_round);

    logger.info(`Ronda ${round_num} ejecutada. Ganador: ${ranked_results[0].team_name}`);
    return summary;
  }
}
