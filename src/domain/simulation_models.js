/**
 * TRUST Business Simulator - Capa de Dominio: Modelos de Simulación y Resultados
 * 
 * Define SimulationConfig, TeamRoundResult (incluyendo métricas de Etapa 3:
 * Inventarios, Flujo de Caja, Balance General y Segmentos) y RoundSummary.
 */

import { Team, MacroParameters, EvaluationWeights } from './entities.js';

export class SimulationConfig {
  /**
   * @param {Object} params
   */
  constructor({
    id = `sim_${Date.now()}`,
    name = 'Gestión Empresarial',
    industry = 'textile',
    country = 'PE',
    country_name = 'Perú',
    currency = 'PEN — Sol peruano (S/)',
    currency_symbol = 'S/',
    size = 'Mediana',
    complexity = 2,
    round_duration = '1 trimestre',
    total_rounds = 6,
    practice_rounds = 1,
    macro = new MacroParameters(),
    events_enabled = true,
    surprise_events = true,
    selected_event_ids = null,
    weights = new EvaluationWeights(),
    weights_visible = true,
    teams = []
  } = {}) {
    this.id = String(id);
    this.name = String(name).trim();
    this.industry = String(industry);
    this.country = String(country);
    this.country_name = String(country_name || country);
    this.currency = String(currency);
    this.currency_symbol = String(currency_symbol);
    this.size = String(size);
    this.complexity = Number(complexity);
    this.round_duration = String(round_duration);
    this.total_rounds = Number(total_rounds);
    this.practice_rounds = Number(practice_rounds);
    this.macro = macro instanceof MacroParameters ? macro : new MacroParameters(macro);
    this.events_enabled = Boolean(events_enabled);
    this.surprise_events = Boolean(surprise_events);
    this.selected_event_ids = Array.isArray(selected_event_ids) ? [...selected_event_ids] : null;
    this.weights = weights instanceof EvaluationWeights ? weights : new EvaluationWeights(weights);
    this.weights_visible = Boolean(weights_visible);
    this.teams = teams.map(t => (t instanceof Team ? t : Team.fromJSON(t)));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      industry: this.industry,
      country: this.country,
      country_name: this.country_name,
      currency: this.currency,
      currency_symbol: this.currency_symbol,
      size: this.size,
      complexity: this.complexity,
      round_duration: this.round_duration,
      total_rounds: this.total_rounds,
      practice_rounds: this.practice_rounds,
      macro: this.macro.toJSON(),
      events_enabled: this.events_enabled,
      surprise_events: this.surprise_events,
      selected_event_ids: this.selected_event_ids,
      weights: this.weights.toJSON(),
      weights_visible: this.weights_visible,
      teams: this.teams.map(t => t.toJSON())
    };
  }

  static fromJSON(data) {
    return new SimulationConfig(data);
  }
}

export class TeamRoundResult {
  constructor({
    team_id,
    team_name,
    price,
    marketing,
    quality,
    service,
    capacity,
    people,
    innovation,
    reason,
    market_share,
    potential_demand,
    sales,
    initial_inventory = 0,
    ending_inventory = 0,
    stockout_units = 0,
    holding_cost = 0,
    revenue,
    variable_cost,
    fixed_cost,
    quality_cost,
    people_cost,
    innovation_cost,
    total_cost,
    profit,
    net_profit = 0,
    margin,
    capacity_utilization,
    cash = 0,
    emergency_loan = 0,
    equity = 0,
    solvency_ratio = 0,
    segments = null,
    score_breakdown,
    score,
    rank = 0
  }) {
    this.team_id = team_id;
    this.team_name = team_name;
    this.price = price;
    this.marketing = marketing;
    this.quality = quality;
    this.service = service;
    this.capacity = capacity;
    this.people = people;
    this.innovation = innovation;
    this.reason = reason;
    this.market_share = market_share;
    this.potential_demand = potential_demand;
    this.sales = sales;
    this.initial_inventory = initial_inventory;
    this.ending_inventory = ending_inventory;
    this.stockout_units = stockout_units;
    this.holding_cost = holding_cost;
    this.revenue = revenue;
    this.variable_cost = variable_cost;
    this.fixed_cost = fixed_cost;
    this.quality_cost = quality_cost;
    this.people_cost = people_cost;
    this.innovation_cost = innovation_cost;
    this.total_cost = total_cost;
    this.profit = profit;
    this.net_profit = net_profit;
    this.margin = margin;
    this.capacity_utilization = capacity_utilization;
    this.cash = cash;
    this.emergency_loan = emergency_loan;
    this.equity = equity;
    this.solvency_ratio = solvency_ratio;
    this.segments = segments;
    this.score_breakdown = score_breakdown;
    this.score = score;
    this.rank = rank;
  }
}

export class RoundSummary {
  constructor({
    round_number,
    active_event,
    total_market_demand,
    total_market_sales,
    total_market_revenue,
    total_market_profit,
    results = [],
    coach_feedback = '',
    ai_mesh = null
  }) {
    this.round_number = round_number;
    this.active_event = active_event;
    this.total_market_demand = total_market_demand;
    this.total_market_sales = total_market_sales;
    this.total_market_revenue = total_market_revenue;
    this.total_market_profit = total_market_profit;
    this.results = results;
    this.coach_feedback = coach_feedback;
    this.ai_mesh = ai_mesh;
  }
}
