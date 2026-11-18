# TRUST Business Simulator (V1.0 - Etapas 1 a 4 Completas)

Plataforma adaptativa de simulación empresarial con arquitectura de **N-Capas**, principios **SOLID**, escalabilidad para **MYPEs, Pymes, Startups y Corporaciones**, sincronización con **datos macroeconómicos reales de Internet**, **Red de 3 Cerebros de IA con Grafo Causal y Base de Datos Vectorial ($k$-NN)**, **motor operativo/financiero estilo TOPSIM** y **Panel Docente de Calificación Universitaria**.

---

## 1. Arquitectura de N-Capas y Principios SOLID (< 300 líneas por archivo)

```
simulador-economico/
├── src/
│   ├── domain/               # CAPA 1: DOMINIO Y CATÁLOGOS
│   │   ├── industry_catalog.js   # 10 industrias con elasticidades competitivas
│   │   ├── scale_archetypes.js   # 5 escalas empresariales (SOLID - OCP)
│   │   ├── country_catalog.js    # 25+ países + constructor de país personalizado
│   │   ├── scenario_presets.js   # Niveles de complejidad, presets y eventos
│   │   ├── entities.js           # Entidades: Team, TeamDecision, MacroParameters, Weights
│   │   ├── simulation_models.js  # Modelos: SimulationConfig, TeamRoundResult, RoundSummary
│   │   ├── constants.js          # Barril de exportación de catálogos
│   │   ├── models.js             # Barril de exportación de modelos
│   │   └── validators.js         # Reglas de validación de dominio
│   │
│   ├── business/             # CAPA 2: LÓGICA DE NEGOCIO Y MOTORES (ETAPAS 1 A 4)
│   │   ├── ai/                   # RED DE 3 CEREBROS DE IA (GRAFO CAUSAL + VECTORES)
│   │   │   ├── economic_causal_graph.js   # Grafo dirigido causal (propagación BFS y ruta)
│   │   │   ├── world_brain_ai.js          # Cerebro 1: Generador dinámico del mundo
│   │   │   ├── strategist_brain_ai.js     # Cerebro 2: Calculador de frontera óptima
│   │   │   ├── evaluator_coach_brain_ai.js# Cerebro 3: Coach socrático y búsqueda vectorial
│   │   │   └── ai_brain_orchestrator.js   # Malla de intercomunicación entre los 3 cerebros
│   │   ├── macro_data_provider.js         # Conector Internet (World Bank + REST Countries)
│   │   ├── demand_engine.js               # Demanda agregada escalada por tamaño y macro
│   │   ├── attraction_engine.js           # Modelo competitivo MCI
│   │   ├── segment_engine.js              # Segmentos: Económico, Masivo y Premium
│   │   ├── inventory_engine.js            # Stock entre rondas, bodegaje y quiebre de stock
│   │   ├── accounting_engine.js           # Costos fijos/variables y tasas según escala
│   │   ├── finance_engine.js              # Flujo de caja, Balance y Crédito de Emergencia
│   │   ├── evaluation_engine.js           # Balanced Scorecard (5 dimensiones)
│   │   ├── academic_analytics_service.js  # Calificaciones (0-20 / 0-100) y curva de aprendizaje
│   │   ├── report_exporter_service.js     # Exportación docente a CSV (Excel) y JSON IA
│   │   ├── coach_service.js               # Diagnóstico pedagógico base
│   │   └── simulation_service.js          # Orquestador central de rondas
│   │
│   ├── persistence/          # CAPA 3: PERSISTENCIA Y BASE VECTORIAL
│   │   ├── storage_adapter.js        # LocalStorageAdapter / InMemoryStorageAdapter (LSP)
│   │   ├── vector_memory_store.js    # Base de Datos Vectorial con Similitud Coseno (k-NN)
│   │   └── simulation_repository.js  # Persistencia de configuración e historial
│   │
│   ├── presentation/         # CAPA 4: PRESENTACIÓN Y UI ADAPTATIVA MULTI-DISPOSITIVO
│   │   ├── wizard_step_renderer.js            # Renderizador del configurador (SRP)
│   │   ├── setup_wizard_controller.js         # Controlador del configurador docente
│   │   ├── dashboard_renderer.js              # Renderizador de tablas y gráficos (SRP)
│   │   ├── teacher_analytics_renderer.js      # Renderizador del Panel Docente e IA (Etapa 4)
│   │   ├── simulation_dashboard_controller.js # Controlador del tablero de simulación
│   │   └── ui_feedback_view.js                # Notificaciones Toast no intrusivas
│   │
│   └── utils/                # CAPA TRANSVERSAL
│       └── logger.js         # Trazabilidad estructurada (DEBUG, INFO, WARN, ERROR)
│
├── tests/
│   ├── unit/                 # PRUEBAS UNITARIAS (16 suites)
│   └── user/                 # PRUEBAS DE USUARIO / USER JOURNEYS (10 suites)
```

---

## 2. Resumen de Funcionalidades Principales

* **Sistema de Autenticación con Roles de Profesor y Alumno:**
  * **👨‍🏫 Profesor (Control Total):** Configuración visual de mercado, avance y cierre de rondas, visualización de todos los competidores, acta de calificaciones universitarias (0-20 y 0-100) y descarga de reportes oficiales en Excel.
  * **🎓 Alumno / Estudiante:** Acceso exclusivo y privado a las decisiones operativas y balance financiero de su empresa, protegiendo su estrategia frente a los demás competidores.
  * Selector modal moderno accesible desde la cabecera en cualquier momento.
* **Lenguaje Pedagógico Ejecutivo (Sin jerga técnica en la UI):**
  * Todos los diagnósticos del Coach Pedagógico, actas de notas y tablas se presentan en español ejecutivo y de negocios (estrategias competitivas de Porter, balance de mercado, alertas de solvencia y preguntas socráticas para debate en clase).
* **Etapa 1 (Adaptabilidad y Economía Real):** 5 escalas empresariales (`Micro / MYPE`, `Pequeña`, `Mediana`, `Grande`, `Startup`), catálogo global de países + modo personalizado y sincronización en vivo con APIs internacionales (World Bank y REST Countries).
* **Etapa 2 (Malla de Inteligencia Económica):**
  * Motor interno de 3 cerebros (Generador del Entorno, Optimizador de Frontera y Evaluador de Desempeño) con memoria de casos de éxito y análisis de impacto en cadena.
* **Etapa 3 (Operaciones y Finanzas Estilo TOPSIM):** Arrastre de inventarios entre trimestres, costo de bodegaje (12%), quiebres de stock, Flujo de Caja, Balance General y **Crédito de Emergencia Bancario** por iliquidez.
* **Etapa 4 (Acta Universitaria y Reportes Oficiales):** Cálculo automatizado de calificaciones universitarias (0-20 y 0-100), ponderación por curva de aprendizaje y exportación con un clic en **Excel (.xls)** y **CSV**.

---

## 3. Ejecución y Pruebas

* **Iniciar servidor local:** `npm start` (`http://localhost:3000`)
* **Ejecutar las 54 pruebas automatizadas:** `npm test`
