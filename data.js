// ============================================================
// EPSA — GESTIÓN DE NUEVOS PRODUCTOS ALIMENTARIOS
// data.js — Capa de datos, constantes y datos demo
// ============================================================

const EPSA_DATA = {

  // ── CONSTANTES ──────────────────────────────────────────────
  USERS: [
    { id: 'comercial',   name: 'Ana García',       role: 'Comercial',          password: '1234', initials: 'AG' },
    { id: 'director_un', name: 'Carlos Martínez',  role: 'Director/a UN',      password: '1234', initials: 'CM' },
    { id: 'directora_id',name: 'Laura Sánchez',    role: 'Directora I+D',      password: '1234', initials: 'LS' },
    { id: 'admin',       name: 'Admin EPSA',        role: 'Administrador',      password: '1234', initials: 'AD' }
  ],

  ROLE_STEPS: {
    'Comercial':     [1, 2, 3],
    'Director/a UN': [1, 2, 3, 4],
    'Directora I+D': [1, 2, 3, 4, 5],
    'Administrador': [1, 2, 3, 4, 5]
  },

  ROLE_CAN_ADVANCE_TO: {
    'Comercial':     ['Pendiente UN'],
    'Director/a UN': ['Pendiente I+D', 'Rechazado'],
    'Directora I+D': ['Aprobado', 'Rechazado'],
    'Administrador': ['Pendiente Comercial', 'Pendiente UN', 'Pendiente I+D', 'Aprobado', 'Rechazado']
  },

  STATES: [
    { key: 'Pendiente Comercial', label: 'Pendiente Comercial', color: '#548235', bg: '#E2EFDA', badge: 'badge-comercial' },
    { key: 'Pendiente UN',        label: 'Pendiente UN',        color: '#BF8F00', bg: '#FFF2CC', badge: 'badge-un' },
    { key: 'Pendiente I+D',       label: 'Pendiente I+D',       color: '#2F5496', bg: '#D6E4F0', badge: 'badge-id' },
    { key: 'Aprobado',            label: 'Aprobado',             color: '#006100', bg: '#C6EFCE', badge: 'badge-aprobado' },
    { key: 'Rechazado',           label: 'Rechazado',            color: '#9C0006', bg: '#FFC7CE', badge: 'badge-rechazado' }
  ],

  STANDARDS: ['IFS', 'Halal', 'Kosher', 'Bio', 'Feed', 'Técnico'],

  ALLERGENS: [
    'Gluten (trigo, centeno, cebada, avena, espelta)',
    'Crustáceos y derivados',
    'Huevos y derivados',
    'Pescado y derivados',
    'Cacahuetes y derivados',
    'Soja y derivados',
    'Leche y derivados (incl. lactosa)',
    'Frutos de cáscara',
    'Apio y derivados',
    'Mostaza y derivados',
    'Sésamo y derivados',
    'Dióxido de azufre y sulfitos (>10mg/kg)',
    'Altramuces y derivados',
    'Moluscos y derivados'
  ],

  DIRECTED_TO_OPTIONS: [
    'Distribución a mayoristas',
    'Venta consumidor final',
    'Fabricante prod. alimentarios',
    'Fabricantes otros productos'
  ],

  PRODUCT_TYPES: ['Sólido', 'Líquido', 'Polvo'],

  // ── DATOS DEMO ──────────────────────────────────────────────
  DEMO_PROJECTS: [
    {
      id: 'PRY-001',
      estado: 'Aprobado',
      createdAt: '2024-10-15T09:00:00',
      updatedAt: '2024-11-20T16:30:00',

      // PASO 1 — Datos Generales
      fechaSolicitud: '2024-10-15',
      nDesarrollo: 'DES-2024-001',
      nReferenciaEPSA: 'REF-EPSA-0045',
      tipoSolicitud: 'Desarrollo',
      dirigidoA: ['Fabricante prod. alimentarios'],
      tipoProducto: 'Polvo',

      // PASO 2 — Cliente y Proyecto
      razonSocial: 'Nutricare Solutions S.L.',
      idCliente: 'CLI-0234',
      sector: 'Nutrición deportiva',
      responsableComercialEPSA: 'Ana García',
      responsableTecnicoCliente: 'Dr. Pablo Ruiz',
      paisesDestino: 'España, Portugal, Francia',
      consumoEstimado: '5.000 kg/año',
      cantidadMuestra: '2 kg',
      competidor: 'PowderTech GmbH',
      referenciaCompetidor: 'PT-WHEY-X300',
      precioCompetidor: '8,50 €/kg',
      descripcionProyecto: 'Desarrollo de una mezcla proteica en polvo a base de proteína de guisante y arroz con perfil aminoacídico completo, libre de alérgenos comunes, apta para deportistas veganos. Se busca una textura fina, buena dispersabilidad en agua fría y sabor neutro que permita su combinación con otros ingredientes funcionales.',
      necesidadDetectada: 'Crecimiento sostenido del segmento vegan protein en el mercado europeo. El cliente detecta una laguna en el mercado de proteínas vegetales de alta calidad con certificación limpia y perfil completo de aminoácidos esenciales.',
      aplicacion: 'Suplementación proteica post-entrenamiento',
      metodoAplicacion: 'Disolución en agua, leche vegetal o smoothies (20g/300ml)',

      // PASO 3 — Calidad, Alérgenos, Documentación
      estandaresRequeridos: ['IFS', 'Bio'],
      otroEstandar: '',
      etiquetadoLibreAlergenos: true,
      etiquetadoSinGluten: true,
      otroClaimEtiquetado: 'Vegan, Non-GMO',
      vidaUtilMinima: '24 meses',
      tipoEnvase: 'Bolsa kraft con cierre zip (1kg)',
      alergenosCliente: {
        'Gluten (trigo, centeno, cebada, avena, espelta)': { valor: 'No admitido', obs: 'Certificación Sin Gluten requerida' },
        'Crustáceos y derivados':                          { valor: 'No admitido', obs: '' },
        'Huevos y derivados':                              { valor: 'No admitido', obs: 'Producto vegano' },
        'Pescado y derivados':                             { valor: 'No admitido', obs: 'Producto vegano' },
        'Cacahuetes y derivados':                          { valor: 'No admitido', obs: '' },
        'Soja y derivados':                                { valor: 'Traza',       obs: 'Traza admitida por línea compartida' },
        'Leche y derivados (incl. lactosa)':               { valor: 'No admitido', obs: 'Producto vegano' },
        'Frutos de cáscara':                               { valor: 'Traza',       obs: 'Traza admitida' },
        'Apio y derivados':                                { valor: 'No admitido', obs: '' },
        'Mostaza y derivados':                             { valor: 'No admitido', obs: '' },
        'Sésamo y derivados':                              { valor: 'No admitido', obs: '' },
        'Dióxido de azufre y sulfitos (>10mg/kg)':         { valor: 'No admitido', obs: '' },
        'Altramuces y derivados':                          { valor: 'No admitido', obs: '' },
        'Moluscos y derivados':                            { valor: 'No admitido', obs: '' }
      },
      documentosAporta: { especificacion: true, productDataSheet: true, coa: true, muestra: true, necesidadRefrigeracion: false, otros: '' },

      // PASO 4 — Viabilidad Comercial
      precioObjetivoVenta: '9,20',
      margenObjetivo: '28',
      costeEstimadoMP: '5,80',
      costeEstimadoProduccion: '0,90',
      volumenMinimoProduccion: '500',
      capacidadProductivaDisponible: 'Sí, línea polvo L3 disponible T1 2025',
      inversionInicialNecesaria: '15.000',
      roiEstimado: '18 meses',
      observacionesComerciales: 'Precio competidor un 8% superior al nuestro objetivo. Margen positivo con volumen mínimo. Cliente con potencial de crecimiento alto. Recomendable reservar capacidad en Q1 2025.',
      goNoGoComercial: 'GO',

      // PASO 5 — Viabilidad Técnica
      esTecnicamenteFactible: 'Sí',
      tiempoEstimadoDesarrollo: '3 meses',
      normativaAlimentariaAplicable: 'Reglamento UE 1169/2011, UE 2015/2283 (nuevos alimentos), Reglamento CE 178/2002',
      procesoProductivoRequerido: 'Mezcla en seco en mezclador de cintas (500L). Tamizado 200 micras. Micronizado proteína de guisante a <100 micras para mejor dispersabilidad. Control de actividad de agua Aw <0,4. Envasado en atmósfera modificada (N2).',
      condicionesAlmacenamiento: 'Lugar fresco y seco, <25°C, HR<60%',
      estabilidadProducto: '24 meses en envase cerrado. 3 meses tras apertura.',
      cleanLabel: 'Sí',
      equipamientoNecesario: 'Mezclador cintas 500L, micronizador, tamizadora vibratoria, envasadora vertical',
      formulacionPreliminar: 'Proteína de guisante aislada (60%), Proteína de arroz (35%), Lecitina de girasol (2%), Aroma natural vainilla (1,5%), Sucralosa (0,3%), Silicato de calcio (flujo) (0,7%), Sal marina (0,5%)',
      observacionesTecnicas: 'Producto factible con tecnología disponible. Requiere validación de perfil aminoacídico por laboratorio externo. Pruebas de dispersabilidad en 3 matrices diferentes. Estudio de estabilidad acelerada (40°C/75%HR, 3 meses).',
      componenteEspecificoRequerido: 'Proteína de guisante aislada >80% proteína',
      fabricanteConcreto: 'Roquette (Nutralys® S85F) o equivalente',
      ingredientesFuncionales: 'BCAA naturales del guisante, perfil aminoacídico completo',
      infoNutricionalOrientativa: 'Por 20g: Energía 75kcal, Proteína 15g, HC 2g, Grasas 1g',
      planHACCP: 'Aplicable procedimiento HACCP-L3-Polvos',
      puntosCriticos: 'Contaminación cruzada alérgenos (limpieza entre producción), actividad de agua final',
      analisisMicrobiologico: 'Aerobios mesófilos, Enterobacterias, Salmonella, E.coli, Listeria',
      limitesMigracion: 'No aplica',
      controlAlergenos: 'Protocolo limpieza validado, análisis ELISA Gluten post-limpieza <5ppm',
      alergenosID: {
        'Gluten (trigo, centeno, cebada, avena, espelta)': { valor: 'No presente', obs: 'Línea libre de gluten validada' },
        'Crustáceos y derivados':                          { valor: 'No presente', obs: '' },
        'Huevos y derivados':                              { valor: 'No presente', obs: '' },
        'Pescado y derivados':                             { valor: 'No presente', obs: '' },
        'Cacahuetes y derivados':                          { valor: 'No presente', obs: '' },
        'Soja y derivados':                                { valor: 'Traza',       obs: 'Posible traza por lecitina de girasol en línea compartida' },
        'Leche y derivados (incl. lactosa)':               { valor: 'No presente', obs: '' },
        'Frutos de cáscara':                               { valor: 'Traza',       obs: 'Traza posible línea compartida' },
        'Apio y derivados':                                { valor: 'No presente', obs: '' },
        'Mostaza y derivados':                             { valor: 'No presente', obs: '' },
        'Sésamo y derivados':                              { valor: 'No presente', obs: '' },
        'Dióxido de azufre y sulfitos (>10mg/kg)':         { valor: 'No presente', obs: '' },
        'Altramuces y derivados':                          { valor: 'No presente', obs: '' },
        'Moluscos y derivados':                            { valor: 'No presente', obs: '' }
      },
      validacionCertificaciones: { IFS: true, Halal: false, Kosher: false, Bio: true, Feed: false, Tecnico: false },
      goNoGoTecnico: 'GO',
      decisionFinal: 'Aprobado',
      motivoRechazo: ''
    },

    {
      id: 'PRY-002',
      estado: 'Pendiente I+D',
      createdAt: '2024-11-05T11:00:00',
      updatedAt: '2024-11-22T10:15:00',

      fechaSolicitud: '2024-11-05',
      nDesarrollo: 'DES-2024-002',
      nReferenciaEPSA: 'REF-EPSA-0051',
      tipoSolicitud: 'Contratipo',
      dirigidoA: ['Distribución a mayoristas'],
      tipoProducto: 'Líquido',

      razonSocial: 'Distribuciones Alimentarias del Sur S.A.',
      idCliente: 'CLI-0189',
      sector: 'Distribución alimentaria',
      responsableComercialEPSA: 'Ana García',
      responsableTecnicoCliente: 'Marta López',
      paisesDestino: 'España',
      consumoEstimado: '12.000 kg/año',
      cantidadMuestra: '5 litros',
      competidor: 'SaborNatural S.L.',
      referenciaCompetidor: 'SN-VINAGRETA-02',
      precioCompetidor: '3,20 €/kg',
      descripcionProyecto: 'Desarrollo de vinagreta premium con aceite de oliva virgen extra, vinagre de Jerez, hierbas aromáticas mediterráneas y un toque de miel. Formato botella vidrio 250ml para lineales gourmet.',
      necesidadDetectada: 'El cliente detecta demanda creciente en el canal gourmet de vinagretas de alta gama con ingredientes de origen trazable y packaging premium.',
      aplicacion: 'Aliño para ensaladas y marinados',
      metodoAplicacion: 'Aplicación directa. Agitar antes de usar.',

      estandaresRequeridos: ['IFS', 'Halal'],
      otroEstandar: '',
      etiquetadoLibreAlergenos: false,
      etiquetadoSinGluten: false,
      otroClaimEtiquetado: 'Producción local, sin conservantes',
      vidaUtilMinima: '18 meses',
      tipoEnvase: 'Botella vidrio 250ml con tapón flip-top',
      alergenosCliente: {
        'Gluten (trigo, centeno, cebada, avena, espelta)': { valor: 'Traza',       obs: '' },
        'Crustáceos y derivados':                          { valor: 'No admitido', obs: '' },
        'Huevos y derivados':                              { valor: 'No admitido', obs: '' },
        'Pescado y derivados':                             { valor: 'No admitido', obs: '' },
        'Cacahuetes y derivados':                          { valor: 'No admitido', obs: '' },
        'Soja y derivados':                                { valor: 'No admitido', obs: '' },
        'Leche y derivados (incl. lactosa)':               { valor: 'No admitido', obs: '' },
        'Frutos de cáscara':                               { valor: 'No admitido', obs: '' },
        'Apio y derivados':                                { valor: 'Ingrediente', obs: 'Puede estar presente como hierba' },
        'Mostaza y derivados':                             { valor: 'Traza',       obs: '' },
        'Sésamo y derivados':                              { valor: 'No admitido', obs: '' },
        'Dióxido de azufre y sulfitos (>10mg/kg)':         { valor: 'Ingrediente', obs: 'Presente en vinagre de Jerez' },
        'Altramuces y derivados':                          { valor: 'No admitido', obs: '' },
        'Moluscos y derivados':                            { valor: 'No admitido', obs: '' }
      },
      documentosAporta: { especificacion: true, productDataSheet: false, coa: false, muestra: true, necesidadRefrigeracion: false, otros: 'Botella de referencia del competidor' },

      precioObjetivoVenta: '3,80',
      margenObjetivo: '32',
      costeEstimadoMP: '2,10',
      costeEstimadoProduccion: '0,45',
      volumenMinimoProduccion: '1.000',
      capacidadProductivaDisponible: 'Sí, línea líquidos L1',
      inversionInicialNecesaria: '5.000',
      roiEstimado: '10 meses',
      observacionesComerciales: 'Proyecto atractivo. Volumen suficiente para ser rentable desde primer lote. Cliente consolidado con buen historial de pagos.',
      goNoGoComercial: 'GO',

      // Sin datos I+D aún
      esTecnicamenteFactible: '', tiempoEstimadoDesarrollo: '', normativaAlimentariaAplicable: '',
      procesoProductivoRequerido: '', condicionesAlmacenamiento: '', estabilidadProducto: '',
      cleanLabel: '', equipamientoNecesario: '', formulacionPreliminar: '', observacionesTecnicas: '',
      componenteEspecificoRequerido: '', fabricanteConcreto: '', ingredientesFuncionales: '',
      infoNutricionalOrientativa: '', planHACCP: '', puntosCriticos: '', analisisMicrobiologico: '',
      limitesMigracion: '', controlAlergenos: '',
      alergenosID: {},
      validacionCertificaciones: { IFS: false, Halal: false, Kosher: false, Bio: false, Feed: false, Tecnico: false },
      goNoGoTecnico: '', decisionFinal: '', motivoRechazo: ''
    },

    {
      id: 'PRY-003',
      estado: 'Pendiente UN',
      createdAt: '2024-11-28T08:30:00',
      updatedAt: '2024-11-28T08:30:00',

      fechaSolicitud: '2024-11-28',
      nDesarrollo: 'DES-2024-003',
      nReferenciaEPSA: 'REF-EPSA-0058',
      tipoSolicitud: 'Desarrollo',
      dirigidoA: ['Venta consumidor final'],
      tipoProducto: 'Sólido',

      razonSocial: 'SuperMarket Iberia Group',
      idCliente: 'CLI-0312',
      sector: 'Gran distribución',
      responsableComercialEPSA: 'Ana García',
      responsableTecnicoCliente: 'Josep Ferrer',
      paisesDestino: 'España, Andorra',
      consumoEstimado: '30.000 kg/año',
      cantidadMuestra: '10 kg',
      competidor: 'CookieMax International',
      referenciaCompetidor: 'CM-CHOCO-COOKIE-500',
      precioCompetidor: '2,90 €/kg',
      descripcionProyecto: 'Galleta de chocolate negro 70% cacao con trozos de avellana y sal marina. Formato 150g para MDD. Receta premium bajo en azúcar (-30% respecto a receta estándar).',
      necesidadDetectada: 'Creciente demanda de productos de indulgencia reformulados con menos azúcar. Canal retailer busca diferenciar su MDD con producto premium accesible.',
      aplicacion: 'Snack y repostería',
      metodoAplicacion: 'Consumo directo',

      estandaresRequeridos: ['IFS'],
      otroEstandar: '',
      etiquetadoLibreAlergenos: false,
      etiquetadoSinGluten: false,
      otroClaimEtiquetado: '-30% azúcar',
      vidaUtilMinima: '12 meses',
      tipoEnvase: 'Flow-pack individual + caja display 12 unidades',
      alergenosCliente: {
        'Gluten (trigo, centeno, cebada, avena, espelta)': { valor: 'Ingrediente',  obs: 'La galleta contiene harina de trigo' },
        'Crustáceos y derivados':                          { valor: 'No admitido', obs: '' },
        'Huevos y derivados':                              { valor: 'Ingrediente',  obs: '' },
        'Pescado y derivados':                             { valor: 'No admitido', obs: '' },
        'Cacahuetes y derivados':                          { valor: 'No admitido', obs: '' },
        'Soja y derivados':                                { valor: 'Traza',       obs: '' },
        'Leche y derivados (incl. lactosa)':               { valor: 'Ingrediente',  obs: 'Mantequilla en receta' },
        'Frutos de cáscara':                               { valor: 'Ingrediente',  obs: 'Avellana como ingrediente declarado' },
        'Apio y derivados':                                { valor: 'No admitido', obs: '' },
        'Mostaza y derivados':                             { valor: 'No admitido', obs: '' },
        'Sésamo y derivados':                              { valor: 'No admitido', obs: '' },
        'Dióxido de azufre y sulfitos (>10mg/kg)':         { valor: 'No admitido', obs: '' },
        'Altramuces y derivados':                          { valor: 'No admitido', obs: '' },
        'Moluscos y derivados':                            { valor: 'No admitido', obs: '' }
      },
      documentosAporta: { especificacion: false, productDataSheet: false, coa: false, muestra: true, necesidadRefrigeracion: false, otros: '' },

      // Sin datos UN ni I+D
      precioObjetivoVenta: '', margenObjetivo: '', costeEstimadoMP: '', costeEstimadoProduccion: '',
      volumenMinimoProduccion: '', capacidadProductivaDisponible: '', inversionInicialNecesaria: '',
      roiEstimado: '', observacionesComerciales: '', goNoGoComercial: '',
      esTecnicamenteFactible: '', tiempoEstimadoDesarrollo: '', normativaAlimentariaAplicable: '',
      procesoProductivoRequerido: '', condicionesAlmacenamiento: '', estabilidadProducto: '',
      cleanLabel: '', equipamientoNecesario: '', formulacionPreliminar: '', observacionesTecnicas: '',
      componenteEspecificoRequerido: '', fabricanteConcreto: '', ingredientesFuncionales: '',
      infoNutricionalOrientativa: '', planHACCP: '', puntosCriticos: '', analisisMicrobiologico: '',
      limitesMigracion: '', controlAlergenos: '',
      alergenosID: {},
      validacionCertificaciones: { IFS: false, Halal: false, Kosher: false, Bio: false, Feed: false, Tecnico: false },
      goNoGoTecnico: '', decisionFinal: '', motivoRechazo: ''
    },

    {
      id: 'PRY-004',
      estado: 'Pendiente Comercial',
      createdAt: '2024-12-02T14:00:00',
      updatedAt: '2024-12-02T14:00:00',

      fechaSolicitud: '2024-12-02',
      nDesarrollo: '',
      nReferenciaEPSA: '',
      tipoSolicitud: 'Contratipo',
      dirigidoA: ['Fabricantes otros productos'],
      tipoProducto: 'Polvo',

      razonSocial: 'Cosmética Natural Bio S.L.',
      idCliente: '',
      sector: 'Cosmética natural',
      responsableComercialEPSA: '',
      responsableTecnicoCliente: '',
      paisesDestino: 'Europa',
      consumoEstimado: '',
      cantidadMuestra: '',
      competidor: '',
      referenciaCompetidor: '',
      precioCompetidor: '',
      descripcionProyecto: 'Extracto de aloe vera en polvo atomizado para uso como ingrediente cosmético funcional.',
      necesidadDetectada: 'Proveedor actual no cumple especificaciones de pureza mínimas.',
      aplicacion: '',
      metodoAplicacion: '',

      estandaresRequeridos: ['IFS'],
      otroEstandar: '',
      etiquetadoLibreAlergenos: false,
      etiquetadoSinGluten: false,
      otroClaimEtiquetado: '',
      vidaUtilMinima: '',
      tipoEnvase: '',
      alergenosCliente: {},
      documentosAporta: { especificacion: false, productDataSheet: false, coa: false, muestra: false, necesidadRefrigeracion: false, otros: '' },

      precioObjetivoVenta: '', margenObjetivo: '', costeEstimadoMP: '', costeEstimadoProduccion: '',
      volumenMinimoProduccion: '', capacidadProductivaDisponible: '', inversionInicialNecesaria: '',
      roiEstimado: '', observacionesComerciales: '', goNoGoComercial: '',
      esTecnicamenteFactible: '', tiempoEstimadoDesarrollo: '', normativaAlimentariaAplicable: '',
      procesoProductivoRequerido: '', condicionesAlmacenamiento: '', estabilidadProducto: '',
      cleanLabel: '', equipamientoNecesario: '', formulacionPreliminar: '', observacionesTecnicas: '',
      componenteEspecificoRequerido: '', fabricanteConcreto: '', ingredientesFuncionales: '',
      infoNutricionalOrientativa: '', planHACCP: '', puntosCriticos: '', analisisMicrobiologico: '',
      limitesMigracion: '', controlAlergenos: '',
      alergenosID: {},
      validacionCertificaciones: { IFS: false, Halal: false, Kosher: false, Bio: false, Feed: false, Tecnico: false },
      goNoGoTecnico: '', decisionFinal: '', motivoRechazo: ''
    }
  ],

  DEMO_ACTIVITY: [
    { id: 'ACT-001', projectId: 'PRY-001', action: 'Solicitud creada', user: 'Ana García (Comercial)', timestamp: '2024-10-15T09:00:00', icon: 'plus', color: '#548235' },
    { id: 'ACT-002', projectId: 'PRY-001', action: 'Estado cambiado a Pendiente UN', user: 'Ana García (Comercial)', timestamp: '2024-10-15T09:45:00', icon: 'arrow-right', color: '#BF8F00' },
    { id: 'ACT-003', projectId: 'PRY-001', action: 'Viabilidad comercial completada — Decisión: GO Comercial', user: 'Carlos Martínez (Dir. UN)', timestamp: '2024-10-22T11:30:00', icon: 'check', color: '#BF8F00' },
    { id: 'ACT-004', projectId: 'PRY-001', action: 'Estado cambiado a Pendiente I+D', user: 'Carlos Martínez (Dir. UN)', timestamp: '2024-10-22T11:31:00', icon: 'arrow-right', color: '#2F5496' },
    { id: 'ACT-005', projectId: 'PRY-001', action: 'Viabilidad técnica completada — Decisión: GO Técnico', user: 'Laura Sánchez (Dir. I+D)', timestamp: '2024-11-20T16:00:00', icon: 'flask', color: '#2F5496' },
    { id: 'ACT-006', projectId: 'PRY-001', action: 'DECISIÓN FINAL: APROBADO', user: 'Laura Sánchez (Dir. I+D)', timestamp: '2024-11-20T16:30:00', icon: 'star', color: '#006100' },
    { id: 'ACT-007', projectId: 'PRY-002', action: 'Solicitud creada', user: 'Ana García (Comercial)', timestamp: '2024-11-05T11:00:00', icon: 'plus', color: '#548235' },
    { id: 'ACT-008', projectId: 'PRY-002', action: 'Estado cambiado a Pendiente UN', user: 'Ana García (Comercial)', timestamp: '2024-11-05T11:30:00', icon: 'arrow-right', color: '#BF8F00' },
    { id: 'ACT-009', projectId: 'PRY-002', action: 'Viabilidad comercial completada — Decisión: GO Comercial', user: 'Carlos Martínez (Dir. UN)', timestamp: '2024-11-22T10:00:00', icon: 'check', color: '#BF8F00' },
    { id: 'ACT-010', projectId: 'PRY-002', action: 'Estado cambiado a Pendiente I+D', user: 'Carlos Martínez (Dir. UN)', timestamp: '2024-11-22T10:15:00', icon: 'arrow-right', color: '#2F5496' },
    { id: 'ACT-011', projectId: 'PRY-003', action: 'Solicitud creada', user: 'Ana García (Comercial)', timestamp: '2024-11-28T08:30:00', icon: 'plus', color: '#548235' },
    { id: 'ACT-012', projectId: 'PRY-003', action: 'Estado cambiado a Pendiente UN', user: 'Ana García (Comercial)', timestamp: '2024-11-28T09:00:00', icon: 'arrow-right', color: '#BF8F00' },
    { id: 'ACT-013', projectId: 'PRY-004', action: 'Solicitud creada (borrador)', user: 'Ana García (Comercial)', timestamp: '2024-12-02T14:00:00', icon: 'plus', color: '#548235' }
  ],

  // ── UTILIDADES ──────────────────────────────────────────────

  getNextProjectId(projects) {
    if (!projects || projects.length === 0) return 'PRY-001';
    const nums = projects.map(p => parseInt(p.id.replace('PRY-', ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PRY-${String(max + 1).padStart(3, '0')}`;
  },

  getStateConfig(stateKey) {
    return this.STATES.find(s => s.key === stateKey) || this.STATES[0];
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

// ── CAPA DE PERSISTENCIA ─────────────────────────────────────

const Storage = {
  KEYS: {
    PROJECTS:  'epsa_projects',
    ACTIVITY:  'epsa_activity',
    USER:      'epsa_current_user',
    NEXT_ID:   'epsa_next_id'
  },

  init() {
    if (!localStorage.getItem(this.KEYS.PROJECTS)) {
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(EPSA_DATA.DEMO_PROJECTS));
    }
    if (!localStorage.getItem(this.KEYS.ACTIVITY)) {
      localStorage.setItem(this.KEYS.ACTIVITY, JSON.stringify(EPSA_DATA.DEMO_ACTIVITY));
    }
  },

  reset() {
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(EPSA_DATA.DEMO_PROJECTS));
    localStorage.setItem(this.KEYS.ACTIVITY, JSON.stringify(EPSA_DATA.DEMO_ACTIVITY));
    localStorage.removeItem(this.KEYS.USER);
  },

  getProjects() {
    return JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || '[]');
  },

  saveProjects(projects) {
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
  },

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },

  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project);
    }
    this.saveProjects(projects);
  },

  getActivity() {
    return JSON.parse(localStorage.getItem(this.KEYS.ACTIVITY) || '[]');
  },

  addActivity(projectId, action, user) {
    const activities = this.getActivity();
    const iconMap = {
      'creada': 'plus', 'creado': 'plus',
      'Pendiente UN': 'arrow-right', 'Pendiente I+D': 'arrow-right', 'Pendiente Comercial': 'undo',
      'GO Comercial': 'check', 'GO Técnico': 'check',
      'NO GO': 'times',
      'APROBADO': 'star', 'RECHAZADO': 'ban',
      'actualizado': 'edit'
    };
    let icon = 'info';
    let color = '#666';
    for (const [key, val] of Object.entries(iconMap)) {
      if (action.includes(key)) { icon = val; break; }
    }
    if (action.includes('APROBADO')) color = '#006100';
    else if (action.includes('RECHAZADO') || action.includes('NO GO')) color = '#9C0006';
    else if (action.includes('I+D')) color = '#2F5496';
    else if (action.includes('UN') || action.includes('comercial')) color = '#BF8F00';
    else if (action.includes('creada') || action.includes('creado')) color = '#548235';

    const newId = `ACT-${String(activities.length + 1).padStart(3, '0')}`;
    activities.unshift({ id: newId, projectId, action, user, timestamp: new Date().toISOString(), icon, color });
    localStorage.setItem(this.KEYS.ACTIVITY, JSON.stringify(activities));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(this.KEYS.USER) || 'null');
  },

  setCurrentUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.KEYS.USER);
  }
};
