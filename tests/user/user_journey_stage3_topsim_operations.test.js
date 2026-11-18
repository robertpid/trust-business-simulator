/**
 * TRUST Business Simulator - Pruebas de Usuario Etapa 3:
 * Dinámica Operativa y Financiera Nivel TOPSIM (Inventarios entre rondas, Quiebre de Stock y Rescate Bancario)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey Etapa 3): Operaciones e Inventarios Multironda TOPSIM', () => {
  it('Ronda 1 a Ronda 2: Acumulación de stock, quiebre de stock, rescate bancario y liquidación en R2', () => {
    const config = new SimulationConfig({
      name: 'Simulación TOPSIM Operaciones y Finanzas',
      industry: 'retail',
      country: 'PE',
      size: 'Mediana',
      complexity: 2,
      total_rounds: 3,
      events_enabled: false,
      teams: [
        new Team('t_smart', 'Retail Eficiente', 'EQ-01'),
        new Team('t_overstock', 'Sobreproducción S.A.', 'EQ-02'),
        new Team('t_stockout', 'Sin Capacidad Ltda', 'EQ-03')
      ]
    });

    const sim = new SimulationService(config);

    // RONDA 1:
    // - t_smart: Capacidad equilibrada (35,000) y precio competitivo (54)
    // - t_overstock: Produce muchísimo (65,000) pero con precio caro (78) -> No vende todo, acumula stock y entra en iliquidez
    // - t_stockout: Precio muy atractivo (48) pero capacidad mínima (15,000) -> Sufre quiebre de stock
    const r1_summary = sim.execute_round([
      new TeamDecision({ team_id: 't_smart', price: 54, marketing: 14000, quality: 70, service: 70, capacity: 35000 }),
      new TeamDecision({ team_id: 't_overstock', price: 78, marketing: 25000, quality: 50, service: 50, capacity: 65000 }),
      new TeamDecision({ team_id: 't_stockout', price: 48, marketing: 15000, quality: 75, service: 75, capacity: 15000 })
    ]);

    const r1_overstock = r1_summary.results.find(r => r.team_id === 't_overstock');
    const r1_stockout = r1_summary.results.find(r => r.team_id === 't_stockout');

    // Verificaciones Ronda 1:
    assert.ok(r1_overstock.ending_inventory > 30000, 'Sobreproducción S.A. acumula fuerte inventario sin vender');
    assert.ok(r1_overstock.holding_cost > 0, 'Debe pagar costo de bodegaje por unidades sobrantes');
    assert.ok(r1_overstock.emergency_loan > 0, 'El exceso de stock inmovilizado activa Crédito de Emergencia Bancario');
    assert.ok(r1_stockout.stockout_units > 15000, 'Sin Capacidad Ltda sufre quiebre de stock por falta de unidades');
    assert.match(r1_summary.coach_feedback, /Crédito de Emergencia/, 'El Coach alerta sobre el rescate bancario');

    // RONDA 2:
    // - t_overstock aprovecha el inventario acumulado de la Ronda 1: reduce producción nueva a solo 5,000 uds y baja precio a 50 para liquidar stock
    const carried_stock = sim.get_team_initial_inventory('t_overstock');
    assert.equal(carried_stock, r1_overstock.ending_inventory);

    const r2_summary = sim.execute_round([
      new TeamDecision({ team_id: 't_smart', price: 54, marketing: 14000, quality: 70, service: 70, capacity: 36000 }),
      new TeamDecision({ team_id: 't_overstock', price: 50, marketing: 12000, quality: 65, service: 65, capacity: 5000 }),
      new TeamDecision({ team_id: 't_stockout', price: 52, marketing: 14000, quality: 75, service: 75, capacity: 32000 })
    ]);

    const r2_overstock = r2_summary.results.find(r => r.team_id === 't_overstock');
    assert.equal(r2_overstock.initial_inventory, carried_stock);
    assert.ok(r2_overstock.sales > 25000, 'Vende más de 25,000 uds produciendo solo 5,000 gracias al stock acumulado de R1');
    assert.ok(r2_overstock.ending_inventory < carried_stock, 'Logra reducir su inventario en bodega');
  });
});
