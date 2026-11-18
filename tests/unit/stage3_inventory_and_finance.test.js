/**
 * TRUST Business Simulator - Pruebas Unitarias Etapa 3:
 * Inventarios, Bodegaje, Quiebre de Stock, Flujo de Caja, Crédito de Emergencia y Segmentos
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { InventoryEngine } from '../../src/business/inventory_engine.js';
import { FinanceEngine } from '../../src/business/finance_engine.js';
import { SegmentEngine } from '../../src/business/segment_engine.js';
import { TeamDecision } from '../../src/domain/models.js';
import { INDUSTRIES } from '../../src/domain/constants.js';

describe('Etapa 3 - InventoryEngine: Bodegaje y Quiebres de Stock', () => {
  it('Debe acumular inventario final y cobrar bodegaje cuando hay sobreproducción', () => {
    const flow = InventoryEngine.compute_inventory_flow({
      initial_inventory: 2000,
      production_capacity: 15000,
      potential_demand: 12000,
      unit_variable_cost: 40,
      holding_cost_rate: 0.10
    });

    assert.equal(flow.available_units, 17000);
    assert.equal(flow.sales_units, 12000);
    assert.equal(flow.ending_inventory, 5000);
    assert.equal(flow.stockout_units, 0);
    // Bodegaje: 5000 uds * $40 * 10% = $20,000
    assert.equal(flow.holding_cost, 20000);
    // Valor en activo corriente: 5000 * $40 = $200,000
    assert.equal(flow.inventory_value, 200000);
  });

  it('Debe registrar quiebre de stock (unidades perdidas) cuando la demanda supera la disponibilidad', () => {
    const flow = InventoryEngine.compute_inventory_flow({
      initial_inventory: 1000,
      production_capacity: 10000,
      potential_demand: 14500,
      unit_variable_cost: 30
    });

    assert.equal(flow.available_units, 11000);
    assert.equal(flow.sales_units, 11000);
    assert.equal(flow.ending_inventory, 0);
    assert.equal(flow.stockout_units, 3500);
    assert.equal(flow.holding_cost, 0);
  });
});

describe('Etapa 3 - FinanceEngine: Flujo de Caja, Balance y Crédito de Emergencia TOPSIM', () => {
  it('Debe mantener la ecuación patrimonial (Activos = Pasivos + Patrimonio) en operación sana', () => {
    const initial = FinanceEngine.create_initial_financial_state('Mediana');
    assert.equal(initial.cash + initial.fixed_assets, initial.bank_debt + initial.equity);

    const statement = FinanceEngine.compute_financial_statement({
      previous_state: initial,
      operating_profit: 85000,
      inventory_value: 20000,
      holding_cost: 2400,
      base_interest_rate: 8.0,
      company_size: 'Mediana'
    });

    assert.equal(statement.triggered_emergency_loan, false);
    assert.equal(statement.emergency_loan, 0);
    assert.ok(statement.cash > 0);
    assert.equal(statement.total_assets, statement.total_debt + statement.equity);
  });

  it('Debe activar Crédito de Emergencia Bancario automáticamente cuando la empresa cae en iliquidez', () => {
    const initial = FinanceEngine.create_initial_financial_state('Mediana'); // cash = 120,000

    // Pérdida operativa severa (-150,000) + capital atrapado en inventario no vendido (60,000)
    const crisis = FinanceEngine.compute_financial_statement({
      previous_state: initial,
      operating_profit: -150000,
      inventory_value: 60000,
      holding_cost: 7200,
      base_interest_rate: 10.0,
      company_size: 'Mediana'
    });

    assert.equal(crisis.triggered_emergency_loan, true);
    assert.ok(crisis.emergency_loan > 90000, 'El banco debe cubrir exactamente el déficit de caja');
    assert.equal(crisis.cash, 0, 'La caja queda en 0 tras el rescate de sobregiro');
    assert.equal(crisis.total_assets, crisis.total_debt + crisis.equity, 'El Balance General sigue cuadrando');
  });
});

describe('Etapa 3 - SegmentEngine: Segmentación de Clientes', () => {
  it('Debe identificar el segmento dominante según posicionamiento en Precio vs Calidad', () => {
    const decisions = [
      new TeamDecision({ team_id: 'low_cost', price: 60, marketing: 8000, quality: 50, service: 50, capacity: 40000 }),
      new TeamDecision({ team_id: 'premium', price: 110, marketing: 25000, quality: 98, service: 95, capacity: 40000 })
    ];

    const seg_map = SegmentEngine.evaluate_segments(decisions, 100000, INDUSTRIES.textile.weights, 2);
    const low_cost_seg = seg_map.get('low_cost');
    const premium_seg = seg_map.get('premium');

    assert.equal(low_cost_seg.dominant_segment, 'Económico / Precio');
    assert.equal(premium_seg.dominant_segment, 'Premium / Calidad');
  });
});
