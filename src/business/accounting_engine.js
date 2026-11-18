/**
 * TRUST Business Simulator - Capa de Negocio: Motor Contable y Costos
 * 
 * Aplica el Principio Abierto/Cerrado (SOLID - OCP) delegando los factores
 * de escala en el registro de arquetipos empresariales (COMPANY_SCALES) e
 * integrando el flujo físico de inventarios (InventoryEngine).
 */

import { get_scale_archetype } from '../domain/scale_archetypes.js';
import { InventoryEngine } from './inventory_engine.js';

export class AccountingEngine {
  /**
   * Obtiene el costo fijo base según el arquetipo de tamaño empresarial (SOLID - OCP).
   * @param {string} company_size - 'Micro / MYPE', 'Pequeña', 'Mediana', 'Grande', 'Startup'
   * @returns {number}
   */
  static get_fixed_cost_by_size(company_size) {
    const base_fixed = 180000;
    const archetype = get_scale_archetype(company_size);
    return base_fixed * archetype.fixed_cost_multiplier;
  }

  /**
   * Calcula la tasa de interés efectiva de financiamiento según riesgo de escala.
   * @param {number} base_interest_rate - Tasa de referencia del Banco Central (%)
   * @param {string} company_size
   * @returns {number}
   */
  static get_effective_interest_rate(base_interest_rate, company_size = 'Mediana') {
    const archetype = get_scale_archetype(company_size);
    return Math.max(0.5, Number(base_interest_rate) + archetype.credit_spread_percent);
  }

  /**
   * Calcula el costo variable unitario ajustado por inflación trimestralizada y eventos.
   * @param {number} base_variable_cost
   * @param {number} annual_inflation_percent
   * @param {number} event_cost_multiplier
   * @returns {number}
   */
  static calculate_effective_variable_cost(
    base_variable_cost,
    annual_inflation_percent = 0,
    event_cost_multiplier = 1.0
  ) {
    const quarterly_inflation_adjustment = 1 + (annual_inflation_percent / 100) / 4;
    return base_variable_cost * event_cost_multiplier * quarterly_inflation_adjustment;
  }

  /**
   * Calcula el desglose completo de costos operativos y de inversión adaptado a la escala.
   */
  static calculate_cost_breakdown({
    decision,
    sales_units,
    unit_variable_cost,
    company_size = 'Mediana',
    complexity_level = 2
  }) {
    const archetype = get_scale_archetype(company_size);
    const fixed_cost = this.get_fixed_cost_by_size(company_size);
    const variable_cost = sales_units * unit_variable_cost;
    const marketing_cost = decision.marketing;
    const quality_cost = Math.pow(decision.quality, 2) * 2.2 * archetype.fixed_cost_multiplier;
    const people_cost = decision.people * archetype.people_cost_unit;
    const innovation_cost =
      complexity_level === 3 ? decision.innovation * 700 * archetype.fixed_cost_multiplier : 0;

    const total_cost =
      fixed_cost +
      variable_cost +
      marketing_cost +
      quality_cost +
      people_cost +
      innovation_cost;

    return {
      fixed_cost,
      variable_cost,
      marketing_cost,
      quality_cost,
      people_cost,
      innovation_cost,
      total_cost
    };
  }

  /**
   * Genera el estado de resultados operativo, flujo de inventario y KPIs para un equipo.
   */
  static compute_team_statement({
    decision,
    potential_demand,
    base_variable_cost,
    annual_inflation_percent,
    event_cost_multiplier,
    company_size = 'Mediana',
    complexity_level = 2,
    initial_inventory = 0
  }) {
    const unit_var_cost = this.calculate_effective_variable_cost(
      base_variable_cost,
      annual_inflation_percent,
      event_cost_multiplier
    );

    const inventory = InventoryEngine.compute_inventory_flow({
      initial_inventory,
      production_capacity: decision.capacity,
      potential_demand,
      unit_variable_cost: unit_var_cost
    });

    const sales_units = inventory.sales_units;
    const revenue = sales_units * decision.price;

    const costs = this.calculate_cost_breakdown({
      decision,
      sales_units,
      unit_variable_cost: unit_var_cost,
      company_size,
      complexity_level
    });

    const profit = revenue - costs.total_cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    const capacity_utilization =
      decision.capacity > 0 ? Math.min(1.0, sales_units / decision.capacity) : 0;

    return {
      sales: sales_units,
      revenue,
      costs,
      profit,
      margin,
      capacity_utilization,
      unit_variable_cost: unit_var_cost,
      inventory
    };
  }
}
