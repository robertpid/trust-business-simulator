/**
 * TRUST Business Simulator - Pruebas Unitarias Etapa 4:
 * Analíticas Académicas, Calificaciones (0-20 / 0-100), Filtro de Eventos y Exportación Excel
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { AcademicAnalyticsService } from '../../src/business/academic_analytics_service.js';
import { ReportExporterService } from '../../src/business/report_exporter_service.js';
import { WorldBrainAI } from '../../src/business/ai/world_brain_ai.js';
import { EvaluatorCoachBrainAI } from '../../src/business/ai/evaluator_coach_brain_ai.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

function create_played_simulation() {
  const config = new SimulationConfig({
    name: 'Evaluación Final Curso Estrategia',
    industry: 'textile',
    country: 'PE',
    size: 'Mediana',
    total_rounds: 3,
    teams: [
      new Team('t1', 'Empresa Excelencia', 'UNI-01'),
      new Team('t2', 'Empresa Progreso', 'UNI-02')
    ]
  });

  const sim = new SimulationService(config);

  sim.execute_round([
    new TeamDecision({ team_id: 't1', price: 84, marketing: 15000, quality: 82, service: 80, capacity: 60000 }),
    new TeamDecision({ team_id: 't2', price: 98, marketing: 6000, quality: 55, service: 55, capacity: 45000 })
  ]);

  sim.execute_round([
    new TeamDecision({ team_id: 't1', price: 84, marketing: 15000, quality: 82, service: 80, capacity: 62000 }),
    new TeamDecision({ team_id: 't2', price: 85, marketing: 14000, quality: 78, service: 75, capacity: 58000 })
  ]);

  return sim;
}

describe('Etapa 4 - AcademicAnalyticsService: Calificación Universitaria', () => {
  it('Debe calcular promedios, tendencia de aprendizaje, solvencia y notas en escala 0-20 y 0-100', () => {
    const sim = create_played_simulation();
    const grades = AcademicAnalyticsService.compute_academic_grades(sim.config, sim.history);

    assert.equal(grades.length, 2);
    assert.equal(grades[0].rank, 1);
    assert.ok(grades[0].grade_20 > 0 && grades[0].grade_20 <= 20);
    assert.ok(grades[0].grade_100 >= 40 && grades[0].grade_100 <= 100);

    const t2_grade = grades.find(g => g.team_id === 't2');
    assert.ok(t2_grade.score_trend > 0, 'Empresa Progreso debe registrar tendencia de aprendizaje positiva');
    assert.ok(t2_grade.vector_similarity_pct > 0, 'Debe incluir el porcentaje de similitud coseno vectorial');
    assert.match(t2_grade.causal_chain, /──►/);
  });
});

describe('Etapa 4 - ReportExporterService: Exportación Excel y Selección de Eventos', () => {
  it('Debe generar un CSV válido con BOM UTF-8 y todas las columnas académicas', () => {
    const sim = create_played_simulation();
    const csv = ReportExporterService.generate_academic_csv(sim.config, sim.history);

    assert.ok(csv.startsWith('\uFEFF'), 'Debe iniciar con BOM UTF-8 para compatibilidad con Excel');
    assert.match(csv, /Nota_Vigesimal_20/);
    assert.match(csv, /"UNI-01"/);
    assert.match(csv, /"Empresa Excelencia"/);
  });

  it('Debe generar una hoja de cálculo Excel (.xls) y respetar los eventos seleccionados por el profesor', () => {
    const sim = create_played_simulation();
    const xls = ReportExporterService.generate_excel_sheet(sim.config, sim.history);

    assert.match(xls, /urn:schemas-microsoft-com:office:excel/);
    assert.match(xls, /Acta de Calificaciones/);
    assert.match(xls, /Empresa Excelencia/);

    const custom_config = new SimulationConfig({
      name: 'Solo Expansión',
      industry: 'textile',
      events_enabled: true,
      selected_event_ids: ['event_demand_expansion'],
      teams: [new Team('t1', 'A', '1'), new Team('t2', 'B', '2')]
    });
    const allowed = WorldBrainAI.get_allowed_events(custom_config);
    assert.ok(allowed.every(e => e.id === 'event_demand_expansion' || e.id === 'event_baseline'));

    const label_es = EvaluatorCoachBrainAI.translate_signal('challenge_high_margins');
    assert.doesNotMatch(label_es, /challenge_high_margins/);
    assert.match(label_es, /costos/);
  });
});
