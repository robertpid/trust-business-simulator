/**
 * TRUST Business Simulator - Pruebas Unitarias: Motor Contable y Costos
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { AccountingEngine } from '../../src/business/accounting_engine.js';
import { TeamDecision } from '../../src/domain/models.js';

describe('Capa de Negocio: AccountingEngine', () => {
  it('Debe calcular el costo fijo según el tamaño de empresa', () => {
    assert.equal(AccountingEngine.get_fixed_cost_by_size('Pequeña'), 180000 * 0.65);
    assert.equal(AccountingEngine.get_fixed_cost_by_size('Mediana'), 180000);
    assert.equal(AccountingEngine.get_fixed_cost_by_size('Grande'), 180000 * 1.60);
  });

  it('Las ventas deben estar acotadas por la capacidad disponible', () => {
    const decision = new TeamDecision({
      team_id: 't1',
      price: 100,
      marketing: 10000,
      quality: 60,
      service: 60,
      capacity: 20000, // Capacidad máxima
      people: 50,
      innovation: 50
    });

    // Caso 1: Demanda potencial de 30,000 > Capacidad de 20,000 -> Ventas = 20,000
    const res_bottleneck = AccountingEngine.compute_team_statement({
      decision,
      potential_demand: 30000,
      base_variable_cost: 40,
      annual_inflation_percent: 4,
      event_cost_multiplier: 1.0,
      company_size: 'Mediana',
      complexity_level: 2
    });

    assert.equal(res_bottleneck.sales, 20000);
    assert.equal(res_bottleneck.revenue, 20000 * 100);
    assert.equal(res_bottleneck.capacity_utilization, 1.0);

    // Caso 2: Demanda potencial de 15,000 < Capacidad de 20,000 -> Ventas = 15,000
    const res_excess_capacity = AccountingEngine.compute_team_statement({
      decision,
      potential_demand: 15000,
      base_variable_cost: 40,
      annual_inflation_percent: 4,
      event_cost_multiplier: 1.0,
      company_size: 'Mediana',
      complexity_level: 2
    });

    assert.equal(res_excess_capacity.sales, 15000);
    assert.equal(res_excess_capacity.revenue, 15000 * 100);
    assert.equal(res_excess_capacity.capacity_utilization, 0.75);
  });

  it('Debe incluir costos de calidad cuadráticos y personas en el total de costos', () => {
    const decision = new TeamDecision({
      team_id: 't1',
      price: 50,
      marketing: 8000,
      quality: 50,
      service: 50,
      capacity: 10000,
      people: 40
    });

    const breakdown = AccountingEngine.calculate_cost_breakdown({
      decision,
      sales_units: 10000,
      unit_variable_cost: 20,
      company_size: 'Mediana',
      complexity_level: 2
    });

    // Calidad: 50^2 * 2.2 = 2500 * 2.2 = 5500
    assert.equal(breakdown.quality_cost, 5500);
    // Personas: 40 * 420 = 16800
    assert.equal(breakdown.people_cost, 16800);
    // Variable: 10000 * 20 = 200000
    assert.equal(breakdown.variable_cost, 200000);
    // Fijo Mediana: 180000
    assert.equal(breakdown.fixed_cost, 180000);
    // Total
    const expected_total = 180000 + 200000 + 8000 + 5500 + 16800;
    assert.equal(breakdown.total_cost, expected_total);
  });
});
