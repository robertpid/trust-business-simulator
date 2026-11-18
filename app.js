/**
 * TRUST Business Simulator - Entry Point de la Aplicación
 * 
 * Re-exporta e inicializa la arquitectura modular de N-capas (Etapas 1, 2, 3 y 4
 * con Motor de Grafos Causales, Base de Datos Vectorial y Analíticas Docentes).
 */

import './src/main.js';

export * from './src/domain/constants.js';
export * from './src/domain/models.js';
export * from './src/domain/validators.js';
export * from './src/business/macro_data_provider.js';
export * from './src/business/demand_engine.js';
export * from './src/business/attraction_engine.js';
export * from './src/business/segment_engine.js';
export * from './src/business/inventory_engine.js';
export * from './src/business/accounting_engine.js';
export * from './src/business/finance_engine.js';
export * from './src/business/evaluation_engine.js';
export * from './src/business/coach_service.js';
export * from './src/business/ai/economic_causal_graph.js';
export * from './src/business/ai/world_brain_ai.js';
export * from './src/business/ai/strategist_brain_ai.js';
export * from './src/business/ai/evaluator_coach_brain_ai.js';
export * from './src/business/ai/ai_brain_orchestrator.js';
export * from './src/business/academic_analytics_service.js';
export * from './src/business/report_exporter_service.js';
export * from './src/business/simulation_service.js';
export * from './src/persistence/storage_adapter.js';
export * from './src/persistence/vector_memory_store.js';
export * from './src/persistence/simulation_repository.js';
