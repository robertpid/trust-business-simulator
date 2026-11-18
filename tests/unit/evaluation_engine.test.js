/**
 * TRUST Business Simulator - Pruebas Unitarias: Motor de Evaluación y Ranking
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { EvaluationEngine } from '../../src/business/evaluation_engine.js';
import { EvaluationWeights } from '../../src/domain/models.js';

describe('Capa de Negocio: EvaluationEngine', () => {
  it('Debe calcular las 5 dimensiones en el rango acotado [0, 1]', () => {
    const scores = EvaluationEngine.compute_dimension_scores({
      margin: 0.20,
      market_share: 0.35,
      sales: 10000,
      capacity: 10000,
      people: 50,
      quality: 80,
      innovation: 70
    });

    assert.ok(scores.finance >= 0 && scores.finance <= 1.0);
    assert.ok(scores.marketing >= 0 && scores.marketing <= 1.0);
    assert.ok(scores.operations >= 0 && scores.operations <= 1.0);
    assert.ok(scores.people >= 0 && scores.people <= 1.0);
    assert.ok(scores.strategy >= 0 && scores.strategy <= 1.0);

    // Con utilización al 100%, operaciones debe ser 1.0
    assert.equal(scores.operations, 1.0);
  });

  it('Debe ponderar correctamente según la configuración docente', () => {
    const dimension_scores = {
      finance: 1.0,
      marketing: 0.5,
      operations: 0.8,
      people: 0.6,
      strategy: 0.7
    };

    const weights = new EvaluationWeights({
      finance: 40,
      marketing: 20,
      operations: 20,
      people: 10,
      strategy: 10
    });

    // 1.0*40 + 0.5*20 + 0.8*20 + 0.6*10 + 0.7*10 = 40 + 10 + 16 + 6 + 7 = 79
    const total_score = EvaluationEngine.compute_overall_score(dimension_scores, weights);
    assert.equal(total_score, 79);
  });

  it('Debe ordenar equipos por score descendente y asignar ranking correlativo', () => {
    const unranked = [
      { team_name: 'Empresa B', score: 65.5 },
      { team_name: 'Empresa A', score: 88.0 },
      { team_name: 'Empresa C', score: 42.1 }
    ];

    const ranked = EvaluationEngine.rank_team_results(unranked);

    assert.equal(ranked[0].team_name, 'Empresa A');
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[1].team_name, 'Empresa B');
    assert.equal(ranked[1].rank, 2);
    assert.equal(ranked[2].team_name, 'Empresa C');
    assert.equal(ranked[2].rank, 3);
  });
});
