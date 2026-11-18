/**
 * TRUST Business Simulator - Pruebas Unitarias: Motor de Demanda Agregada
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DemandEngine } from '../../src/business/demand_engine.js';

describe('Capa de Negocio: DemandEngine', () => {
  it('Debe devolver la demanda base en la ronda 1 con multiplicador neutro', () => {
    const base = 100000;
    const growth = 5; // 5%
    const demand = DemandEngine.calculate_total_market_demand(base, growth, 1, 1.0);
    assert.equal(demand, 100000);
  });

  it('Debe aplicar crecimiento compuesto en rondas subsiguientes', () => {
    const base = 100000;
    const growth = 10; // 10%
    // En ronda 2: 100000 * 1.10^1 = 110000
    const demand_r2 = DemandEngine.calculate_total_market_demand(base, growth, 2, 1.0);
    assert.equal(demand_r2, 110000);

    // En ronda 3: 100000 * 1.10^2 = 121000
    const demand_r3 = DemandEngine.calculate_total_market_demand(base, growth, 3, 1.0);
    assert.equal(demand_r3, 121000);
  });

  it('Debe aplicar multiplicador de evento de shock correctamente', () => {
    const base = 100000;
    const growth = 0;
    // Shock de expansión (+15%): multiplicador 1.15
    const demand_expansion = DemandEngine.calculate_total_market_demand(base, growth, 1, 1.15);
    assert.equal(demand_expansion, 115000);

    // Shock de contracción (-12%): multiplicador 0.88
    const demand_contraction = DemandEngine.calculate_total_market_demand(base, growth, 1, 0.88);
    assert.equal(demand_contraction, 88000);
  });

  it('Debe manejar valores negativos o ceros sin romper el cálculo', () => {
    const demand = DemandEngine.calculate_total_market_demand(0, 5, 1, 1.0);
    assert.ok(demand > 0, 'Debe aplicar valor de fallback seguro');
  });
});
