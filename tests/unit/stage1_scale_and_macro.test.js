/**
 * TRUST Business Simulator - Pruebas Unitarias Etapa 1:
 * Arquetipos de Escala Empresarial, Países Globales y Proveedor Macro en Vivo (SOLID)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  COMPANY_SCALES,
  get_scale_archetype,
  COUNTRIES,
  resolve_country_profile
} from '../../src/domain/constants.js';
import { AccountingEngine } from '../../src/business/accounting_engine.js';
import { DemandEngine } from '../../src/business/demand_engine.js';
import {
  WorldBankLiveProvider,
  CuratedFallbackMacroProvider,
  MacroEconomicService
} from '../../src/business/macro_data_provider.js';

describe('Etapa 1 - SOLID OCP: Arquetipos de Escala Empresarial', () => {
  it('Debe soportar los 5 arquetipos empresariales con sus multiplicadores propios', () => {
    const scales = ['Micro / MYPE', 'Pequeña', 'Mediana', 'Grande', 'Startup'];
    for (const s of scales) {
      const arch = get_scale_archetype(s);
      assert.equal(arch.id, s);
      assert.ok(arch.demand_scale_factor > 0);
      assert.ok(arch.fixed_cost_multiplier > 0);
    }

    // Costo fijo de Micro / MYPE debe ser 6% del de una Mediana
    const fixed_mype = AccountingEngine.get_fixed_cost_by_size('Micro / MYPE');
    const fixed_mediana = AccountingEngine.get_fixed_cost_by_size('Mediana');
    assert.equal(fixed_mype, fixed_mediana * 0.06);

    // Demanda ajustada para MYPE debe escalar al 15%
    const demand_mype = DemandEngine.calculate_total_market_demand(100000, 0, 1, 1.0, 'Micro / MYPE');
    assert.equal(demand_mype, 15000);
  });

  it('Debe calcular la tasa de interés efectiva según prima de riesgo por tamaño', () => {
    const rate_mype = AccountingEngine.get_effective_interest_rate(8.0, 'Micro / MYPE');
    const rate_corp = AccountingEngine.get_effective_interest_rate(8.0, 'Grande');
    assert.ok(rate_mype > rate_corp, 'Una MYPE enfrenta mayor costo de crédito que una Gran Corporación');
  });
});

describe('Etapa 1 - Soporte Global de Países y Divisas', () => {
  it('Debe resolver países del catálogo global y países personalizados por el docente', () => {
    const bolivia = resolve_country_profile('BO');
    assert.equal(bolivia.name, 'Bolivia');
    assert.equal(bolivia.symbol, 'Bs');

    const japan = resolve_country_profile('JP');
    assert.equal(japan.name, 'Japón');
    assert.equal(japan.symbol, '¥');

    const custom_swiss = resolve_country_profile('CUSTOM', {
      custom_name: 'Suiza',
      custom_symbol: 'CHF',
      custom_currency: 'CHF — Franco suizo (CHF)',
      custom_iso: 'CHE'
    });

    assert.equal(custom_swiss.name, 'Suiza');
    assert.equal(custom_swiss.symbol, 'CHF');
    assert.equal(custom_swiss.iso3, 'CHE');
  });
});

describe('Etapa 1 - SOLID DIP/LSP: Sincronización Macroeconómica desde Internet', () => {
  it('WorldBankLiveProvider: Debe extraer inflación, PIB y tasa de interés desde API externa simulada', async () => {
    const mock_fetch = async (url) => {
      if (url.includes('FP.CPI.TOTL.ZG')) {
        return { ok: true, json: async () => [{}, [{ value: 3.42, date: '2025' }]] };
      }
      if (url.includes('NY.GDP.MKTP.KD.ZG')) {
        return { ok: true, json: async () => [{}, [{ value: 4.15, date: '2025' }]] };
      }
      if (url.includes('FR.INR.LEND')) {
        return { ok: true, json: async () => [{}, [{ value: 7.80, date: '2025' }]] };
      }
      return { ok: false };
    };

    const provider = new WorldBankLiveProvider(mock_fetch);
    const macro = await provider.fetch_macro_indicators('CR');

    assert.ok(macro);
    assert.equal(macro.inflation, 3.4);
    assert.equal(macro.gdp, 4.2);
    assert.equal(macro.interest, 7.8);
    assert.equal(macro.reference_year, '2025');
    assert.match(macro.source, /World Bank Open Data/);
  });

  it('MacroEconomicService: Debe hacer fallback transparente al catálogo si no hay conexión a Internet', async () => {
    const offline_fetch = async () => {
      throw new Error('Network unreachable');
    };

    const service = new MacroEconomicService([
      new WorldBankLiveProvider(offline_fetch),
      new CuratedFallbackMacroProvider()
    ]);

    const macro = await service.get_country_macro('UY');
    assert.ok(macro);
    assert.equal(macro.inflation, COUNTRIES.UY.baseline_macro.inflation);
    assert.match(macro.source, /Catálogo Económico Base \(Uruguay\)/);
  });
});
