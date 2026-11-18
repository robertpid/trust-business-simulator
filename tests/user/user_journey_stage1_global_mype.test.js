/**
 * TRUST Business Simulator - Pruebas de Usuario Etapa 1:
 * Simulación de Microempresas (MYPE) con Economía Real de País Sincronizada
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { MacroEconomicService, WorldBankLiveProvider, CuratedFallbackMacroProvider } from '../../src/business/macro_data_provider.js';
import { resolve_country_profile } from '../../src/domain/constants.js';
import { SimulationConfig, Team, TeamDecision, EvaluationWeights } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey Etapa 1): Simulación MYPE con Datos Macro de Internet', () => {
  it('Docente configura taller de Cafeterías MYPE en Costa Rica con datos del Banco Mundial y ejecuta ronda', async () => {
    // 1. El docente selecciona Costa Rica (CR) y sincroniza la economía desde Internet
    const mock_internet_fetch = async (url) => {
      if (url.includes('FP.CPI.TOTL.ZG')) return { ok: true, json: async () => [{}, [{ value: 1.9, date: '2025' }]] };
      if (url.includes('NY.GDP.MKTP.KD.ZG')) return { ok: true, json: async () => [{}, [{ value: 4.5, date: '2025' }]] };
      if (url.includes('FR.INR.LEND')) return { ok: true, json: async () => [{}, [{ value: 6.2, date: '2025' }]] };
      return { ok: false };
    };

    const macro_service = new MacroEconomicService([
      new WorldBankLiveProvider(mock_internet_fetch),
      new CuratedFallbackMacroProvider()
    ]);

    const country_profile = resolve_country_profile('CR');
    const live_macro = await macro_service.get_country_macro('CR');

    assert.equal(country_profile.name, 'Costa Rica');
    assert.equal(country_profile.symbol, '₡');
    assert.equal(live_macro.inflation, 1.9);
    assert.equal(live_macro.gdp, 4.5);

    // 2. El docente elige escala 'Micro / MYPE' para 3 cafeterías locales
    const config = new SimulationConfig({
      name: 'Programa Emprendimiento Cafeterías MYPE',
      industry: 'cafe',
      country: country_profile.id,
      country_name: country_profile.name,
      currency: country_profile.currency,
      currency_symbol: country_profile.symbol,
      size: 'Micro / MYPE',
      complexity: 1,
      total_rounds: 4,
      macro: live_macro,
      weights: new EvaluationWeights({ finance: 30, marketing: 25, operations: 20, people: 15, strategy: 10 }),
      teams: [
        new Team('mype_1', 'Café Tico Artesanal', 'MYPE-01'),
        new Team('mype_2', 'Expreso San José', 'MYPE-02'),
        new Team('mype_3', 'Aroma del Valle', 'MYPE-03')
      ]
    });

    const sim = new SimulationService(config);

    // Verificar que las decisiones sugeridas están adaptadas a bolsillo MYPE
    const defaults_mype = sim.generate_default_decision(0);
    assert.equal(defaults_mype.marketing, 1500, 'El presupuesto comercial base para MYPE debe ser 1500');
    assert.ok(defaults_mype.capacity < 3000, 'La capacidad de una cafetería MYPE debe ser a escala micro');

    // 3. Los 3 equipos MYPE envían sus decisiones
    const decisions = [
      new TeamDecision({
        team_id: 'mype_1',
        price: 16.5,
        marketing: 2200,
        quality: 85,
        service: 85,
        capacity: 2400,
        people: 60,
        reason: 'Café de especialidad con excelente atención en barra.'
      }),
      new TeamDecision({
        team_id: 'mype_2',
        price: 14.5,
        marketing: 1500,
        quality: 65,
        service: 65,
        capacity: 2600,
        people: 50,
        reason: 'Precios competitivos para alto tráfico de oficinas.'
      }),
      new TeamDecision({
        team_id: 'mype_3',
        price: 18.0,
        marketing: 800,
        quality: 55,
        service: 50,
        capacity: 1800,
        people: 40,
        reason: ' Ahorro de costos general.'
      })
    ];

    const summary = sim.execute_round(decisions);

    // Demanda total para cafetería MYPE: 50,000 * 0.15 = 7,500 unidades
    assert.ok(summary.total_market_demand >= 6500 && summary.total_market_demand <= 8500);
    assert.equal(summary.results.length, 3);
    assert.equal(summary.results[0].fixed_cost, 10800, 'El costo fijo de MYPE es 10,800 en lugar de 180,000');
    assert.ok(summary.results[0].profit > 0, 'La MYPE bien gestionada logra utilidad positiva con su escala');
  });
});
