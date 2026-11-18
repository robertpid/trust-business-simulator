/**
 * TRUST Business Simulator - Pruebas Unitarias: Motor de Atracción Competitiva
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { AttractionEngine } from '../../src/business/attraction_engine.js';
import { TeamDecision } from '../../src/domain/models.js';
import { INDUSTRIES } from '../../src/domain/constants.js';

describe('Capa de Negocio: AttractionEngine', () => {
  it('Debe calcular el precio promedio correctamente', () => {
    const decisions = [
      new TeamDecision({ team_id: 't1', price: 80, marketing: 1000, quality: 60, service: 60, capacity: 10000 }),
      new TeamDecision({ team_id: 't2', price: 100, marketing: 1000, quality: 60, service: 60, capacity: 10000 }),
      new TeamDecision({ team_id: 't3', price: 120, marketing: 1000, quality: 60, service: 60, capacity: 10000 })
    ];

    const avg = AttractionEngine.calculate_average_price(decisions);
    assert.equal(avg, 100);
  });

  it('La suma de las cuotas de mercado (market shares) debe ser exactamente 1.0 (100%)', () => {
    const decisions = [
      new TeamDecision({ team_id: 't1', price: 75, marketing: 15000, quality: 80, service: 70, capacity: 35000 }),
      new TeamDecision({ team_id: 't2', price: 90, marketing: 8000, quality: 60, service: 50, capacity: 25000 }),
      new TeamDecision({ team_id: 't3', price: 85, marketing: 12000, quality: 70, service: 65, capacity: 30000 }),
      new TeamDecision({ team_id: 't4', price: 110, marketing: 5000, quality: 90, service: 80, capacity: 20000 })
    ];

    const weights = INDUSTRIES.textile.weights;
    const shares = AttractionEngine.calculate_market_shares(decisions, 120000, weights, 2);

    assert.equal(shares.length, 4);
    const sum_shares = shares.reduce((acc, s) => acc + s.market_share, 0);
    assert.ok(Math.abs(sum_shares - 1.0) < 0.0001, `Las cuotas deben sumar 1.0, pero sumaron ${sum_shares}`);
  });

  it('A igualdad de otros factores, un menor precio debe generar mayor cuota de mercado', () => {
    const d_cheap = new TeamDecision({ team_id: 'cheap', price: 70, marketing: 10000, quality: 60, service: 60, capacity: 30000 });
    const d_expensive = new TeamDecision({ team_id: 'expensive', price: 100, marketing: 10000, quality: 60, service: 60, capacity: 30000 });

    const weights = INDUSTRIES.textile.weights;
    const shares = AttractionEngine.calculate_market_shares([d_cheap, d_expensive], 60000, weights, 2);

    const share_cheap = shares.find(s => s.team_id === 'cheap').market_share;
    const share_expensive = shares.find(s => s.team_id === 'expensive').market_share;

    assert.ok(share_cheap > share_expensive, 'El competidor con menor precio debe tener mayor cuota');
  });

  it('A igualdad de precio, mayor inversión en calidad y marketing debe otorgar ventaja', () => {
    const d_premium = new TeamDecision({ team_id: 'prem', price: 85, marketing: 25000, quality: 90, service: 85, capacity: 30000 });
    const d_basic = new TeamDecision({ team_id: 'basic', price: 85, marketing: 5000, quality: 50, service: 50, capacity: 30000 });

    const weights = INDUSTRIES.textile.weights;
    const shares = AttractionEngine.calculate_market_shares([d_premium, d_basic], 60000, weights, 2);

    const share_prem = shares.find(s => s.team_id === 'prem').market_share;
    const share_basic = shares.find(s => s.team_id === 'basic').market_share;

    assert.ok(share_prem > share_basic, 'El competidor premium con mayor marketing y calidad debe ganar mayor cuota');
  });
});
