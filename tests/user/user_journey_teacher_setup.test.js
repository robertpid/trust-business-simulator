/**
 * TRUST Business Simulator - Pruebas de Usuario: Flujo del Docente (Configuración del Mercado)
 * 
 * Simula el recorrido de un docente parametrizando una simulación académica:
 * 1. Selección de industria y país
 * 2. Selección de nivel de complejidad y tiempo
 * 3. Configuración y personalización de equipos de estudiantes
 * 4. Ajuste de variables macroeconómicas
 * 5. Configuración de eventos de incertidumbre
 * 6. Definición del perfil de evaluación y validación de ponderaciones
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { INDUSTRIES, COUNTRIES, MACRO_PRESETS, EVALUATION_PRESETS } from '../../src/domain/constants.js';
import { SimulationConfig, Team, MacroParameters, EvaluationWeights } from '../../src/domain/models.js';
import { validate_simulation_config, validate_evaluation_weights } from '../../src/domain/validators.js';

describe('Pruebas de Usuario (User Journey): Configuración Docente', () => {
  it('Usuario Docente: Debe configurar exitosamente una simulación de Alimentos Procesados en Colombia', () => {
    // Paso 1: Industria y País
    const selected_industry = INDUSTRIES.food;
    const selected_country = COUNTRIES.CO;
    assert.equal(selected_industry.sector, 'Manufactura / Alimentos');
    assert.equal(selected_country.currency, 'COP — Peso colombiano ($)');

    // Paso 2: Complejidad y Tiempo
    const complexity_level = 2;
    const round_duration = '1 trimestre';
    const total_rounds = 4;
    const practice_rounds = 1;

    // Paso 3: Equipos Competidores
    const teams = [
      new Team('team_1', 'NutriFood S.A.', 'EST-101'),
      new Team('team_2', 'Alimentos del Valle', 'EST-102'),
      new Team('team_3', 'BioSnacks Corp', 'EST-103'),
      new Team('team_4', 'Sabor Real Ltda', 'EST-104')
    ];
    assert.equal(teams.length, 4);

    // Paso 4: Entorno Macroeconómico (Preset Crecimiento)
    const macro_scenario = new MacroParameters(MACRO_PRESETS.Crecimiento);
    assert.equal(macro_scenario.inflation, 4.0);
    assert.equal(macro_scenario.gdp, 5.5);

    // Paso 5: Eventos
    const events_enabled = true;
    const surprise_events = true;

    // Paso 6: Perfil de Evaluación (Preset Finanzas)
    const weights = new EvaluationWeights(EVALUATION_PRESETS.Finanzas);
    const weights_validation = validate_evaluation_weights(weights);
    assert.equal(weights_validation.valid, true);
    assert.equal(weights.finance, 45); // Foco financiero

    // Construcción de la Configuración Final
    const config = new SimulationConfig({
      id: 'sim_docente_test_01',
      name: 'Simulación Finanzas Corporativas 2026',
      industry: selected_industry.id,
      country: selected_country.id,
      currency: selected_country.currency,
      currency_symbol: selected_country.symbol,
      size: 'Mediana',
      complexity: complexity_level,
      round_duration,
      total_rounds,
      practice_rounds,
      macro: macro_scenario,
      events_enabled,
      surprise_events,
      weights,
      weights_visible: true,
      teams
    });

    // Validación formal de dominio
    assert.doesNotThrow(() => {
      validate_simulation_config(config);
    });

    assert.equal(config.teams.length, 4);
    assert.equal(config.industry, 'food');
  });

  it('Usuario Docente: Debe recibir alerta clara si las ponderaciones de evaluación no suman 100%', () => {
    const invalid_weights = new EvaluationWeights({
      finance: 50,
      marketing: 20,
      operations: 10,
      people: 10,
      strategy: 5 // Suma 95%
    });

    const validation = validate_evaluation_weights(invalid_weights);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /suman 95%/);
  });
});
