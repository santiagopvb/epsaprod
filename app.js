// ============================================================
// EPSA — GESTIÓN DE NUEVOS PRODUCTOS ALIMENTARIOS
// app.js — Lógica principal de la aplicación
// ============================================================

// ── ESTADO GLOBAL ────────────────────────────────────────────
const App = {
  currentUser: null,
  currentPage: 'dashboard',
  wizardStep: 1,
  editingProject: null,    // proyecto que estamos editando
  formData: {},            // datos del wizard en memoria
  charts: {},              // instancias Chart.js

  init() {
    Storage.init();
    this.currentUser = Storage.getCurrentUser();
    if (this.currentUser) {
      this.showApp();
    } else {
      this.showAuth();
    }
    this.bindGlobalEvents();
  },

  // ── AUTH ─────────────────────────────────────────────────
  showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  },

  showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.renderSidebar();
    this.navigateTo('dashboard');
  },

  login() {
    const roleSelect = document.getElementById('login-role');
    const passInput  = document.getElementById('login-password');
    const roleId     = roleSelect.value;
    if (!roleId) { Toast.show('Selecciona un rol', 'warning'); return; }
    const user = EPSA_DATA.USERS.find(u => u.id === roleId);
    if (!user) { Toast.show('Usuario no encontrado', 'error'); return; }
    Storage.setCurrentUser(user);
    this.currentUser = user;
    this.showApp();
    Toast.show(`Bienvenido/a, ${user.name}`, 'success');
  },

  logout() {
    Storage.logout();
    this.currentUser = null;
    this.editingProject = null;
    this.formData = {};
    // destroy charts
    Object.values(this.charts).forEach(c => { try { c.destroy(); } catch(e){} });
    this.charts = {};
    this.showAuth();
  },

  // ── SIDEBAR ──────────────────────────────────────────────
  renderSidebar() {
    if (!this.currentUser) return;
    const u = this.currentUser;
    // Avatar color
    const colors = {
      'Comercial': '#548235', 'Director/a UN': '#BF8F00',
      'Directora I+D': '#2F5496', 'Administrador': '#7030A0'
    };
    const roleColor = colors[u.role] || '#404040';
    document.getElementById('sidebar-avatar').style.background = roleColor;
    document.getElementById('sidebar-avatar').textContent = u.initials;
    document.getElementById('sidebar-user-name').textContent = u.name;
    const roleEl = document.getElementById('sidebar-user-role');
    roleEl.textContent = u.role;
    roleEl.style.background = roleColor + '22';
    roleEl.style.color = roleColor;
  },

  // ── NAVIGATION ───────────────────────────────────────────
  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'projects':  this.renderProjectsList(); break;
      case 'history':   this.renderHistory(); break;
      case 'new':       this.startNewWizard(); break;
    }
    window.scrollTo(0, 0);
  },

  // ── DASHBOARD ────────────────────────────────────────────
  renderDashboard() {
    const projects = Storage.getProjects();
    const counts = {};
    EPSA_DATA.STATES.forEach(s => { counts[s.key] = 0; });
    projects.forEach(p => { if (counts[p.estado] !== undefined) counts[p.estado]++; });

    const ids = ['stat-total','stat-pc','stat-un','stat-id','stat-aprobado','stat-rechazado'];
    const scIds = ['sc-total','sc-pc','sc-un','sc-id','sc-aprobado','sc-rechazado'];
    const vals = [
      projects.length,
      counts['Pendiente Comercial'],
      counts['Pendiente UN'],
      counts['Pendiente I+D'],
      counts['Aprobado'],
      counts['Rechazado']
    ];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = vals[i];
      const sc = document.getElementById(scIds[i]);
      if (sc) sc.setAttribute('data-val', vals[i]);
    });

    this.renderDoughnutChart(counts);
    this.renderBarChart(projects);
    this.renderRecentProjects(projects);
  },

  renderDoughnutChart(counts) {
    const ctx = document.getElementById('chart-doughnut');
    if (!ctx) return;
    if (this.charts.doughnut) { this.charts.doughnut.destroy(); }
    this.charts.doughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pdte. Comercial','Pdte. UN','Pdte. I+D','Aprobado','Rechazado'],
        datasets: [{
          data: [
            counts['Pendiente Comercial'],
            counts['Pendiente UN'],
            counts['Pendiente I+D'],
            counts['Aprobado'],
            counts['Rechazado']
          ],
          backgroundColor: ['#548235','#BF8F00','#2F5496','#006100','#9C0006'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11, family: 'DM Sans' }, padding: 12, boxWidth: 12 } }
        },
        cutout: '65%'
      }
    });
  },

  renderBarChart(projects) {
    const ctx = document.getElementById('chart-bar');
    if (!ctx) return;
    if (this.charts.bar) { this.charts.bar.destroy(); }

    // Group by month (last 6 months)
    const now = new Date();
    const months = [];
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
      labels.push(d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }));
    }
    const monthCounts = months.map(m =>
      projects.filter(p => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length
    );

    this.charts.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Solicitudes',
          data: monthCounts,
          backgroundColor: 'rgba(47,84,150,.7)',
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f0f0f0' } },
          x: { ticks: { font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  },

  renderRecentProjects(projects) {
    const container = document.getElementById('recent-projects');
    if (!container) return;
    const recent = [...projects].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No hay proyectos</p></div>';
      return;
    }
    container.innerHTML = recent.map(p => {
      const sc = EPSA_DATA.getStateConfig(p.estado);
      return `
        <div class="recent-item" onclick="App.openDetail('${p.id}')">
          <span class="recent-item-id">${p.id}</span>
          <span class="recent-item-name">${p.razonSocial || '—'}</span>
          <span class="badge ${sc.badge}">${p.estado}</span>
          <span class="recent-item-date">${EPSA_DATA.formatDate(p.updatedAt)}</span>
        </div>`;
    }).join('');
  },

  // ── PROJECTS LIST ─────────────────────────────────────────
  renderProjectsList(filter = '', search = '') {
    const projects = Storage.getProjects();
    let filtered = projects;
    if (filter) filtered = filtered.filter(p => p.estado === filter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.id || '').toLowerCase().includes(q) ||
        (p.razonSocial || '').toLowerCase().includes(q) ||
        (p.descripcionProyecto || '').toLowerCase().includes(q) ||
        (p.nDesarrollo || '').toLowerCase().includes(q)
      );
    }

    const tbody = document.getElementById('projects-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No se encontraron proyectos</h3>
          <p>Prueba con otros filtros o crea una nueva solicitud</p>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const sc  = EPSA_DATA.getStateConfig(p.estado);
      const goC = p.goNoGoComercial ? `<span class="badge ${p.goNoGoComercial==='GO' ? 'badge-go':'badge-nogo'}">${p.goNoGoComercial}</span>` : '<span class="badge badge-empty">—</span>';
      const goT = p.goNoGoTecnico   ? `<span class="badge ${p.goNoGoTecnico==='GO'   ? 'badge-go':'badge-nogo'}">${p.goNoGoTecnico}</span>` : '<span class="badge badge-empty">—</span>';
      const desc = (p.descripcionProyecto || '—').substring(0, 60) + (p.descripcionProyecto && p.descripcionProyecto.length > 60 ? '…' : '');
      return `
        <tr>
          <td><span class="project-id">${p.id}</span></td>
          <td>${EPSA_DATA.formatDate(p.fechaSolicitud)}</td>
          <td style="font-weight:500">${p.razonSocial || '—'}</td>
          <td><span class="project-desc" title="${p.descripcionProyecto || ''}">${desc}</span></td>
          <td><span class="badge ${sc.badge}">${p.estado}</span></td>
          <td>${goC}</td>
          <td>${goT}</td>
          <td>
            <div class="flex gap-8">
              <button class="btn btn-secondary btn-sm btn-icon" onclick="App.openDetail('${p.id}')" title="Ver detalle">👁</button>
              <button class="btn btn-outline btn-sm btn-icon" onclick="App.editProject('${p.id}')" title="Editar">✏️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  // ── WIZARD ───────────────────────────────────────────────
  startNewWizard() {
    this.editingProject = null;
    this.formData = {
      id: EPSA_DATA.getNextProjectId(Storage.getProjects()),
      estado: 'Pendiente Comercial',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fechaSolicitud: new Date().toISOString().split('T')[0],
      nDesarrollo: '', nReferenciaEPSA: '',
      tipoSolicitud: '', dirigidoA: [], tipoProducto: '',
      razonSocial: '', idCliente: '', sector: '',
      responsableComercialEPSA: this.currentUser ? this.currentUser.name : '',
      responsableTecnicoCliente: '', paisesDestino: '',
      consumoEstimado: '', cantidadMuestra: '',
      competidor: '', referenciaCompetidor: '', precioCompetidor: '',
      descripcionProyecto: '', necesidadDetectada: '', aplicacion: '', metodoAplicacion: '',
      estandaresRequeridos: ['IFS'], otroEstandar: '',
      etiquetadoLibreAlergenos: false, etiquetadoSinGluten: false, otroClaimEtiquetado: '',
      vidaUtilMinima: '', tipoEnvase: '',
      alergenosCliente: {}, documentosAporta: {},
      precioObjetivoVenta: '', margenObjetivo: '',
      costeEstimadoMP: '', costeEstimadoProduccion: '',
      volumenMinimoProduccion: '', capacidadProductivaDisponible: '',
      inversionInicialNecesaria: '', roiEstimado: '', observacionesComerciales: '',
      goNoGoComercial: '',
      esTecnicamenteFactible: '', tiempoEstimadoDesarrollo: '', normativaAlimentariaAplicable: '',
      procesoProductivoRequerido: '', condicionesAlmacenamiento: '', estabilidadProducto: '',
      cleanLabel: '', equipamientoNecesario: '', formulacionPreliminar: '', observacionesTecnicas: '',
      componenteEspecificoRequerido: '', fabricanteConcreto: '', ingredientesFuncionales: '',
      infoNutricionalOrientativa: '', planHACCP: '', puntosCriticos: '', analisisMicrobiologico: '',
      limitesMigracion: '', controlAlergenos: '',
      alergenosID: {},
      validacionCertificaciones: { IFS: false, Halal: false, Kosher: false, Bio: false, Feed: false, Tecnico: false },
      goNoGoTecnico: '', decisionFinal: '', motivoRechazo: ''
    };
    this.wizardStep = this.getAllowedSteps()[0];
    this.renderWizard();
  },

  editProject(id) {
    const project = Storage.getProjectById(id);
    if (!project) { Toast.show('Proyecto no encontrado', 'error'); return; }
    this.editingProject = id;
    this.formData = JSON.parse(JSON.stringify(project)); // deep copy
    this.wizardStep = this.getAllowedSteps()[0];
    this.navigateTo('new');
    // Re-render because navigateTo('new') calls startNewWizard
  },

  getAllowedSteps() {
    return EPSA_DATA.ROLE_STEPS[this.currentUser?.role] || [1];
  },

  renderWizard() {
    const allowed = this.getAllowedSteps();
    const isNew   = !this.editingProject;

    // Update header
    const wizardTitle = document.getElementById('wizard-title');
    if (wizardTitle) {
      wizardTitle.innerHTML = isNew
        ? `<h2>Nueva Solicitud <span class="badge badge-comercial">${this.formData.id}</span></h2>`
        : `<h2>Editar Proyecto <span class="badge badge-comercial">${this.formData.id}</span></h2>`;
    }

    // Update step indicators
    this.renderStepIndicators(allowed);

    // Render step content
    this.renderStepContent(this.wizardStep, allowed);

    // Update nav buttons
    this.renderWizardNav(allowed);
  },

  renderStepIndicators(allowed) {
    const container = document.getElementById('wizard-step-indicators');
    if (!container) return;
    const steps = [
      { n:1, label:'Datos Generales',   cls:'s1' },
      { n:2, label:'Cliente/Proyecto',  cls:'s2' },
      { n:3, label:'Calidad/Alérgenos', cls:'s3' },
      { n:4, label:'Viabilidad Com.',   cls:'s4' },
      { n:5, label:'Viabilidad Téc.',   cls:'s5' }
    ];
    container.innerHTML = steps.map((s, idx) => {
      const isAllowed   = allowed.includes(s.n);
      const isActive    = s.n === this.wizardStep;
      const isCompleted = s.n < this.wizardStep && isAllowed;
      let cls = `step-item ${s.cls}`;
      if (isActive)    cls += ' active';
      if (isCompleted) cls += ' completed';
      if (!isAllowed)  cls += ' locked';
      const arrow = idx < steps.length - 1 ? '<span class="step-arrow">›</span>' : '';
      return `
        <div class="wizard-step-indicator">
          <div class="${cls}" onclick="App.goToStep(${s.n})" title="${!isAllowed ? 'Acceso restringido para tu rol' : ''}">
            ${isCompleted ? '✓' : s.n}. ${s.label}
          </div>
          ${arrow}
        </div>`;
    }).join('');
  },

  goToStep(n) {
    const allowed = this.getAllowedSteps();
    if (!allowed.includes(n)) {
      Toast.show('Este paso está restringido para tu rol', 'warning');
      return;
    }
    // save current step data before switching
    this.collectStepData(this.wizardStep);
    this.wizardStep = n;
    this.renderWizard();
  },

  renderStepContent(step, allowed) {
    const container = document.getElementById('wizard-step-content');
    if (!container) return;

    if (!allowed.includes(step)) {
      container.innerHTML = this.renderLockedStep(step);
      return;
    }

    switch (step) {
      case 1: container.innerHTML = this.renderStep1(); break;
      case 2: container.innerHTML = this.renderStep2(); break;
      case 3: container.innerHTML = this.renderStep3(); break;
      case 4: container.innerHTML = this.renderStep4(); break;
      case 5: container.innerHTML = this.renderStep5(); break;
    }
    this.bindStepEvents(step);
  },

  renderLockedStep(step) {
    const roleNames = {4:'Director/a Unidad de Negocio', 5:'Directora I+D'};
    const stepNames = {4:'Viabilidad Comercial', 5:'Viabilidad Técnica y Formulación'};
    return `
      <div class="step-locked-overlay">
        <div class="lock-icon">🔒</div>
        <h3>Acceso restringido — Paso ${step}: ${stepNames[step] || ''}</h3>
        <p>Este paso sólo puede ser completado por el rol <strong>${roleNames[step] || ''}</strong>.</p>
      </div>`;
  },

  renderStep1() {
    const d = this.formData;
    return `
      <div class="section-card">
        <div class="section-header section-header-comercial">📋 Paso 1 — Datos Generales</div>
        <div class="section-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Fecha de Solicitud <span class="required">*</span></label>
              <input type="date" class="form-control" id="f-fechaSolicitud" value="${d.fechaSolicitud||''}">
            </div>
            <div class="form-group">
              <label>Nº Desarrollo</label>
              <input type="text" class="form-control" id="f-nDesarrollo" value="${d.nDesarrollo||''}" placeholder="DES-2024-XXX">
            </div>
            <div class="form-group">
              <label>Nº Referencia EPSA</label>
              <input type="text" class="form-control" id="f-nReferenciaEPSA" value="${d.nReferenciaEPSA||''}" placeholder="REF-EPSA-XXXX">
            </div>
            <div class="form-group">
              <label>Nº Proyecto</label>
              <div class="form-control-static" style="background:#f9fafb;font-family:var(--font-mono);font-weight:600;color:var(--color-id)">${d.id}</div>
            </div>
          </div>
          <hr class="section-divider">
          <div class="form-grid cols-1">
            <div class="form-group">
              <label>Tipo de Solicitud <span class="required">*</span></label>
              <div class="radio-group">
                <label class="radio-item"><input type="radio" name="tipoSolicitud" value="Contratipo" ${d.tipoSolicitud==='Contratipo'?'checked':''}> Contratipo</label>
                <label class="radio-item"><input type="radio" name="tipoSolicitud" value="Desarrollo" ${d.tipoSolicitud==='Desarrollo'?'checked':''}> Desarrollo</label>
              </div>
            </div>
            <div class="form-group">
              <label>Dirigido a <span class="required">*</span></label>
              <div class="checkbox-group">
                ${EPSA_DATA.DIRECTED_TO_OPTIONS.map(opt => `
                  <label class="checkbox-item">
                    <input type="checkbox" name="dirigidoA" value="${opt}" ${(d.dirigidoA||[]).includes(opt)?'checked':''}> ${opt}
                  </label>`).join('')}
              </div>
            </div>
            <div class="form-group">
              <label>Tipo de Producto</label>
              <div class="radio-group">
                ${EPSA_DATA.PRODUCT_TYPES.map(t => `
                  <label class="radio-item"><input type="radio" name="tipoProducto" value="${t}" ${d.tipoProducto===t?'checked':''}> ${t}</label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  renderStep2() {
    const d = this.formData;
    const v = (f) => d[f] || '';
    return `
      <div class="section-card">
        <div class="section-header section-header-comercial">👥 Paso 2 — Cliente y Proyecto</div>
        <div class="section-body">
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Razón Social <span class="required">*</span></label>
              <input type="text" class="form-control" id="f-razonSocial" value="${v('razonSocial')}" placeholder="Nombre de la empresa cliente">
            </div>
            <div class="form-group">
              <label>ID Cliente</label>
              <input type="text" class="form-control" id="f-idCliente" value="${v('idCliente')}" placeholder="CLI-XXXX">
            </div>
            <div class="form-group">
              <label>Sector</label>
              <input type="text" class="form-control" id="f-sector" value="${v('sector')}" placeholder="p.ej. Gran distribución">
            </div>
            <div class="form-group">
              <label>Responsable Comercial EPSA</label>
              <input type="text" class="form-control" id="f-responsableComercialEPSA" value="${v('responsableComercialEPSA')}">
            </div>
            <div class="form-group">
              <label>Responsable Técnico Cliente</label>
              <input type="text" class="form-control" id="f-responsableTecnicoCliente" value="${v('responsableTecnicoCliente')}">
            </div>
            <div class="form-group span-2">
              <label>País/es de Destino</label>
              <input type="text" class="form-control" id="f-paisesDestino" value="${v('paisesDestino')}" placeholder="España, Francia...">
            </div>
            <div class="form-group">
              <label>Consumo Estimado / Año</label>
              <input type="text" class="form-control" id="f-consumoEstimado" value="${v('consumoEstimado')}" placeholder="5.000 kg/año">
            </div>
            <div class="form-group">
              <label>Cantidad Muestra Necesaria</label>
              <input type="text" class="form-control" id="f-cantidadMuestra" value="${v('cantidadMuestra')}" placeholder="2 kg">
            </div>
            <div class="form-group">
              <label>Competidor</label>
              <input type="text" class="form-control" id="f-competidor" value="${v('competidor')}">
            </div>
            <div class="form-group">
              <label>Referencia Competidor</label>
              <input type="text" class="form-control" id="f-referenciaCompetidor" value="${v('referenciaCompetidor')}">
            </div>
            <div class="form-group span-2">
              <label>Precio Competidor</label>
              <input type="text" class="form-control" id="f-precioCompetidor" value="${v('precioCompetidor')}" placeholder="p.ej. 8,50 €/kg">
            </div>
          </div>
          <hr class="section-divider">
          <div class="form-grid cols-1">
            <div class="form-group">
              <label>Descripción del Proyecto <span class="required">*</span></label>
              <textarea class="form-control" id="f-descripcionProyecto" rows="4" placeholder="Descripción detallada del producto a desarrollar...">${v('descripcionProyecto')}</textarea>
            </div>
            <div class="form-group">
              <label>Necesidad Detectada</label>
              <textarea class="form-control" id="f-necesidadDetectada" rows="3" placeholder="Oportunidad o problema que justifica el desarrollo...">${v('necesidadDetectada')}</textarea>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Aplicación</label>
              <input type="text" class="form-control" id="f-aplicacion" value="${v('aplicacion')}" placeholder="p.ej. Suplementación post-entrenamiento">
            </div>
            <div class="form-group">
              <label>Método de Aplicación</label>
              <input type="text" class="form-control" id="f-metodoAplicacion" value="${v('metodoAplicacion')}" placeholder="p.ej. Disolver en agua">
            </div>
          </div>
        </div>
      </div>`;
  },

  renderStep3() {
    const d = this.formData;
    const v = (f) => d[f] || '';
    const estandares = d.estandaresRequeridos || ['IFS'];
    const docs = d.documentosAporta || {};
    const alergenosC = d.alergenosCliente || {};

    const standardsHtml = EPSA_DATA.STANDARDS.map(s => {
      const isIFS = s === 'IFS';
      const checked = estandares.includes(s) || isIFS;
      return `
        <label class="standard-check ${isIFS ? 'ifs-locked' : ''}">
          <input type="checkbox" name="estandar" value="${s}" ${checked?'checked':''} ${isIFS?'disabled':''}> ${s} ${isIFS ? '✔' : ''}
        </label>`;
    }).join('');

    const allergenRowsC = EPSA_DATA.ALLERGENS.map((a, i) => {
      const current = alergenosC[a] || { valor: '', obs: '' };
      return `
        <tr>
          <td>${i+1}. ${a}</td>
          <td><input type="radio" name="alg-c-${i}" value="Ingrediente" ${current.valor==='Ingrediente'?'checked':''}></td>
          <td><input type="radio" name="alg-c-${i}" value="Traza" ${current.valor==='Traza'?'checked':''}></td>
          <td><input type="radio" name="alg-c-${i}" value="No admitido" ${current.valor==='No admitido'?'checked':''}></td>
          <td><input type="text" class="obs-input" data-alg="${i}" data-src="c" placeholder="Observaciones..." value="${(current.obs||'').replace(/"/g,'&quot;')}"></td>
        </tr>`;
    }).join('');

    const docsHtml = [
      ['especificacion','Especificación'],
      ['productDataSheet','Product Data Sheet'],
      ['coa','COA'],
      ['muestra','Muestra'],
      ['necesidadRefrigeracion','Necesidad refrigeración']
    ].map(([key, label]) => `
      <label class="doc-check">
        <input type="checkbox" name="doc" value="${key}" ${docs[key]?'checked':''}> ${label}
      </label>`).join('');

    return `
      <div class="section-card">
        <div class="section-header section-header-comercial">🏷️ Paso 3 — Calidad, Alérgenos y Documentación</div>
        <div class="section-body">
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Estándares Requeridos (IFS siempre incluido)</label>
              <div class="standards-grid">${standardsHtml}</div>
            </div>
            <div class="form-group span-2">
              <label>Otro Estándar (especificar)</label>
              <input type="text" class="form-control" id="f-otroEstandar" value="${v('otroEstandar')}" placeholder="Especificar si aplica...">
            </div>
          </div>
          <hr class="section-divider">
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Etiquetado Específico</label>
              <div class="checkbox-group">
                <label class="checkbox-item"><input type="checkbox" id="f-etiquetadoLibreAlergenos" ${d.etiquetadoLibreAlergenos?'checked':''}> Libre de alérgenos</label>
                <label class="checkbox-item"><input type="checkbox" id="f-etiquetadoSinGluten" ${d.etiquetadoSinGluten?'checked':''}> Sin Gluten</label>
              </div>
            </div>
            <div class="form-group span-2">
              <label>Otro Claim (especificar)</label>
              <input type="text" class="form-control" id="f-otroClaimEtiquetado" value="${v('otroClaimEtiquetado')}">
            </div>
            <div class="form-group">
              <label>Tipo de Producto</label>
              <div class="radio-group">
                ${EPSA_DATA.PRODUCT_TYPES.map(t => `<label class="radio-item"><input type="radio" name="tipoProducto2" value="${t}" ${d.tipoProducto===t?'checked':''}> ${t}</label>`).join('')}
              </div>
            </div>
            <div class="form-group">
              <label>Vida Útil Mínima Requerida</label>
              <input type="text" class="form-control" id="f-vidaUtilMinima" value="${v('vidaUtilMinima')}" placeholder="p.ej. 18 meses">
            </div>
            <div class="form-group span-2">
              <label>Tipo de Envase</label>
              <input type="text" class="form-control" id="f-tipoEnvase" value="${v('tipoEnvase')}" placeholder="p.ej. Botella vidrio 250ml">
            </div>
          </div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Alérgenos y Trazas Admitidos por el Cliente</strong></div>
          <p class="text-muted text-small mb-8">Indicar si el cliente ADMITE la presencia del alérgeno como ingrediente, traza, o no lo admite.</p>
          <div class="allergen-table-wrapper">
            <table class="allergen-table">
              <thead>
                <tr>
                  <th>Alérgeno (Rto. UE 1169/2011)</th>
                  <th>Ingrediente</th>
                  <th>Traza</th>
                  <th>No Admitido</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>${allergenRowsC}</tbody>
            </table>
          </div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Documentos que Aporta el Cliente</strong></div>
          <div class="docs-grid">${docsHtml}</div>
          <div class="form-group mt-16">
            <label>Otros documentos</label>
            <input type="text" class="form-control" id="f-docsOtros" value="${docs.otros||''}" placeholder="Especificar otros documentos...">
          </div>
        </div>
      </div>`;
  },

  renderStep4() {
    const d = this.formData;
    const v = (f) => d[f] || '';
    return `
      <div class="section-card">
        <div class="section-header section-header-un">💼 Paso 4 — Viabilidad Comercial y Operativa</div>
        <div class="section-body">
          <p class="text-muted text-small mb-16">Sección a completar por el/la Director/a de Unidad de Negocio</p>
          <div class="form-grid">
            <div class="form-group">
              <label>Precio Objetivo de Venta (€/kg)</label>
              <input type="text" class="form-control" id="f-precioObjetivoVenta" value="${v('precioObjetivoVenta')}" placeholder="0,00">
            </div>
            <div class="form-group">
              <label>Margen Objetivo (%)</label>
              <input type="text" class="form-control" id="f-margenObjetivo" value="${v('margenObjetivo')}" placeholder="0">
            </div>
            <div class="form-group">
              <label>Coste Estimado Materias Primas (€/kg)</label>
              <input type="text" class="form-control" id="f-costeEstimadoMP" value="${v('costeEstimadoMP')}" placeholder="0,00">
            </div>
            <div class="form-group">
              <label>Coste Estimado Producción (€/kg)</label>
              <input type="text" class="form-control" id="f-costeEstimadoProduccion" value="${v('costeEstimadoProduccion')}" placeholder="0,00">
            </div>
            <div class="form-group">
              <label>Volumen Mínimo de Producción (kg)</label>
              <input type="text" class="form-control" id="f-volumenMinimoProduccion" value="${v('volumenMinimoProduccion')}" placeholder="500">
            </div>
            <div class="form-group">
              <label>Capacidad Productiva Disponible</label>
              <input type="text" class="form-control" id="f-capacidadProductivaDisponible" value="${v('capacidadProductivaDisponible')}" placeholder="Sí / No / Parcial">
            </div>
            <div class="form-group">
              <label>Inversión Inicial Necesaria (€)</label>
              <input type="text" class="form-control" id="f-inversionInicialNecesaria" value="${v('inversionInicialNecesaria')}" placeholder="0">
            </div>
            <div class="form-group">
              <label>ROI Estimado / Plazo Retorno</label>
              <input type="text" class="form-control" id="f-roiEstimado" value="${v('roiEstimado')}" placeholder="p.ej. 18 meses">
            </div>
            <div class="form-group span-2">
              <label>Observaciones Comerciales</label>
              <textarea class="form-control" id="f-observacionesComerciales" rows="3">${v('observacionesComerciales')}</textarea>
            </div>
          </div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Decisión GO / NO GO Comercial</strong></div>
          <div class="go-nogo-group">
            <div class="go-nogo-option go">
              <input type="radio" id="gnc-go" name="goNoGoComercial" value="GO" ${d.goNoGoComercial==='GO'?'checked':''}>
              <label for="gnc-go">✅ GO</label>
            </div>
            <div class="go-nogo-option nogo">
              <input type="radio" id="gnc-nogo" name="goNoGoComercial" value="NO GO" ${d.goNoGoComercial==='NO GO'?'checked':''}>
              <label for="gnc-nogo">❌ NO GO</label>
            </div>
          </div>
        </div>
      </div>`;
  },

  renderStep5() {
    const d = this.formData;
    const v = (f) => d[f] || '';
    const alergenosID = d.alergenosID || {};
    const vc = d.validacionCertificaciones || {};

    const allergenRowsID = EPSA_DATA.ALLERGENS.map((a, i) => {
      const cur = alergenosID[a] || { valor: '', obs: '' };
      return `
        <tr>
          <td>${i+1}. ${a}</td>
          <td><input type="radio" name="alg-id-${i}" value="Ingrediente" ${cur.valor==='Ingrediente'?'checked':''}></td>
          <td><input type="radio" name="alg-id-${i}" value="Traza" ${cur.valor==='Traza'?'checked':''}></td>
          <td><input type="radio" name="alg-id-${i}" value="No presente" ${cur.valor==='No presente'?'checked':''}></td>
          <td><input type="text" class="obs-input" data-alg="${i}" data-src="id" placeholder="Observaciones..." value="${(cur.obs||'').replace(/"/g,'&quot;')}"></td>
        </tr>`;
    }).join('');

    const certHtml = EPSA_DATA.STANDARDS.map(s => {
      const key = s === 'Técnico' ? 'Tecnico' : s;
      const checked = vc[key];
      const isIFS = s === 'IFS';
      return `
        <label class="standard-check ${isIFS ? 'ifs-locked' : ''}">
          <input type="checkbox" name="cert" value="${key}" ${checked||isIFS?'checked':''} ${isIFS?'disabled':''}> ${s} ${isIFS ? '✔' : ''}
        </label>`;
    }).join('');

    return `
      <div class="section-card">
        <div class="section-header section-header-id">🔬 Paso 5 — Viabilidad Técnica y Formulación</div>
        <div class="section-body">
          <p class="text-muted text-small mb-16">Sección a completar por la Directora de I+D</p>
          <div class="form-grid">
            <div class="form-group">
              <label>¿Es factible técnicamente?</label>
              <div class="radio-group">
                <label class="radio-item"><input type="radio" name="esTecnicamenteFactible" value="Sí" ${d.esTecnicamenteFactible==='Sí'?'checked':''}> Sí</label>
                <label class="radio-item"><input type="radio" name="esTecnicamenteFactible" value="No" ${d.esTecnicamenteFactible==='No'?'checked':''}> No</label>
                <label class="radio-item"><input type="radio" name="esTecnicamenteFactible" value="Con condiciones" ${d.esTecnicamenteFactible==='Con condiciones'?'checked':''}> Con condiciones</label>
              </div>
            </div>
            <div class="form-group">
              <label>Tiempo Estimado de Desarrollo</label>
              <input type="text" class="form-control" id="f-tiempoEstimadoDesarrollo" value="${v('tiempoEstimadoDesarrollo')}" placeholder="p.ej. 3 meses">
            </div>
            <div class="form-group span-2">
              <label>Normativa Alimentaria Aplicable</label>
              <input type="text" class="form-control" id="f-normativaAlimentariaAplicable" value="${v('normativaAlimentariaAplicable')}" placeholder="Reglamento UE 1169/2011...">
            </div>
            <div class="form-group span-2">
              <label>Proceso Productivo Requerido</label>
              <textarea class="form-control" id="f-procesoProductivoRequerido" rows="3">${v('procesoProductivoRequerido')}</textarea>
            </div>
            <div class="form-group">
              <label>Condiciones de Almacenamiento</label>
              <input type="text" class="form-control" id="f-condicionesAlmacenamiento" value="${v('condicionesAlmacenamiento')}">
            </div>
            <div class="form-group">
              <label>Estabilidad del Producto</label>
              <input type="text" class="form-control" id="f-estabilidadProducto" value="${v('estabilidadProducto')}">
            </div>
            <div class="form-group">
              <label>Clean Label</label>
              <div class="radio-group">
                <label class="radio-item"><input type="radio" name="cleanLabel" value="Sí" ${d.cleanLabel==='Sí'?'checked':''}> Sí</label>
                <label class="radio-item"><input type="radio" name="cleanLabel" value="No" ${d.cleanLabel==='No'?'checked':''}> No</label>
              </div>
            </div>
            <div class="form-group">
              <label>Equipamiento Necesario</label>
              <input type="text" class="form-control" id="f-equipamientoNecesario" value="${v('equipamientoNecesario')}">
            </div>
          </div>
          <hr class="section-divider">
          <div class="card-title mb-8">Formulación y Componentes</div>
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Formulación Preliminar</label>
              <textarea class="form-control" id="f-formulacionPreliminar" rows="4" placeholder="Ingredientes con porcentajes...">${v('formulacionPreliminar')}</textarea>
            </div>
            <div class="form-group">
              <label>Componente Específico Requerido</label>
              <input type="text" class="form-control" id="f-componenteEspecificoRequerido" value="${v('componenteEspecificoRequerido')}">
            </div>
            <div class="form-group">
              <label>Fabricante Concreto</label>
              <input type="text" class="form-control" id="f-fabricanteConcreto" value="${v('fabricanteConcreto')}">
            </div>
            <div class="form-group">
              <label>Ingredientes Funcionales</label>
              <input type="text" class="form-control" id="f-ingredientesFuncionales" value="${v('ingredientesFuncionales')}">
            </div>
            <div class="form-group">
              <label>Info. Nutricional Orientativa</label>
              <input type="text" class="form-control" id="f-infoNutricionalOrientativa" value="${v('infoNutricionalOrientativa')}">
            </div>
          </div>
          <hr class="section-divider">
          <div class="card-title mb-8">Seguridad Alimentaria y Calidad</div>
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Plan HACCP Aplicable</label>
              <input type="text" class="form-control" id="f-planHACCP" value="${v('planHACCP')}">
            </div>
            <div class="form-group span-2">
              <label>Puntos Críticos de Control</label>
              <input type="text" class="form-control" id="f-puntosCriticos" value="${v('puntosCriticos')}">
            </div>
            <div class="form-group span-2">
              <label>Análisis Microbiológico Requerido</label>
              <input type="text" class="form-control" id="f-analisisMicrobiologico" value="${v('analisisMicrobiologico')}">
            </div>
            <div class="form-group">
              <label>Límites de Migración (si aplica)</label>
              <input type="text" class="form-control" id="f-limitesMigracion" value="${v('limitesMigracion')}">
            </div>
            <div class="form-group">
              <label>Control de Alérgenos Detallado</label>
              <input type="text" class="form-control" id="f-controlAlergenos" value="${v('controlAlergenos')}">
            </div>
            <div class="form-group span-2">
              <label>Observaciones Técnicas</label>
              <textarea class="form-control" id="f-observacionesTecnicas" rows="3">${v('observacionesTecnicas')}</textarea>
            </div>
          </div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Alérgenos y Trazas Propuestos por I+D en la Formulación</strong></div>
          <p class="text-muted text-small mb-8">Indicar si la formulación propuesta CONTIENE el alérgeno como ingrediente o genera trazas.</p>
          <div class="allergen-table-wrapper">
            <table class="allergen-table">
              <thead>
                <tr>
                  <th>Alérgeno (Rto. UE 1169/2011)</th>
                  <th>Ingrediente</th>
                  <th>Traza</th>
                  <th>No Presente</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>${allergenRowsID}</tbody>
            </table>
          </div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Validación de Certificaciones</strong></div>
          <div class="standards-grid">${certHtml}</div>
          <hr class="section-divider">
          <div class="mb-8"><strong>Decisión GO / NO GO Técnica</strong></div>
          <div class="go-nogo-group">
            <div class="go-nogo-option go">
              <input type="radio" id="gnt-go" name="goNoGoTecnico" value="GO" ${d.goNoGoTecnico==='GO'?'checked':''}>
              <label for="gnt-go">✅ GO</label>
            </div>
            <div class="go-nogo-option nogo">
              <input type="radio" id="gnt-nogo" name="goNoGoTecnico" value="NO GO" ${d.goNoGoTecnico==='NO GO'?'checked':''}>
              <label for="gnt-nogo">❌ NO GO</label>
            </div>
          </div>
          <hr class="section-divider">
          <div class="section-card" style="border:3px solid var(--color-aprobacion);margin-top:16px">
            <div class="section-header section-header-aprobacion">🏁 DECISIÓN FINAL</div>
            <div class="section-body">
              <div class="final-decision-group mb-16">
                <div class="final-decision-option aprobado">
                  <input type="radio" id="df-aprobado" name="decisionFinal" value="Aprobado" ${d.decisionFinal==='Aprobado'?'checked':''}>
                  <label for="df-aprobado">✅ APROBADO</label>
                </div>
                <div class="final-decision-option rechazado">
                  <input type="radio" id="df-rechazado" name="decisionFinal" value="Rechazado" ${d.decisionFinal==='Rechazado'?'checked':''}>
                  <label for="df-rechazado">❌ RECHAZADO</label>
                </div>
              </div>
              <div class="form-group">
                <label>Motivo de Rechazo (si aplica)</label>
                <textarea class="form-control" id="f-motivoRechazo" rows="2">${v('motivoRechazo')}</textarea>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  bindStepEvents(step) {
    // Bind allergen table observations
    document.querySelectorAll('.obs-input').forEach(inp => {
      inp.addEventListener('change', () => this.collectAllergenData());
      inp.addEventListener('blur',   () => this.collectAllergenData());
    });
    // No special bindings needed for other inputs (collected on nav)
  },

  collectAllergenData() {
    // Collect allergen client
    const alergenosC = {};
    EPSA_DATA.ALLERGENS.forEach((a, i) => {
      const radios = document.querySelectorAll(`input[name="alg-c-${i}"]`);
      let valor = '';
      radios.forEach(r => { if (r.checked) valor = r.value; });
      const obsEl = document.querySelector(`.obs-input[data-alg="${i}"][data-src="c"]`);
      const obs = obsEl ? obsEl.value : '';
      if (valor || obs) alergenosC[a] = { valor, obs };
    });
    this.formData.alergenosCliente = alergenosC;

    // Collect allergen I+D
    const alergenosID = {};
    EPSA_DATA.ALLERGENS.forEach((a, i) => {
      const radios = document.querySelectorAll(`input[name="alg-id-${i}"]`);
      let valor = '';
      radios.forEach(r => { if (r.checked) valor = r.value; });
      const obsEl = document.querySelector(`.obs-input[data-alg="${i}"][data-src="id"]`);
      const obs = obsEl ? obsEl.value : '';
      if (valor || obs) alergenosID[a] = { valor, obs };
    });
    this.formData.alergenosID = alergenosID;
  },

  collectStepData(step) {
    const get = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const getChecked = (name) => {
      const els = document.querySelectorAll(`input[name="${name}"]`);
      let v = '';
      els.forEach(e => { if (e.checked) v = e.value; });
      return v;
    };
    const getMultiCheck = (name) => {
      const result = [];
      document.querySelectorAll(`input[name="${name}"]:checked`).forEach(e => result.push(e.value));
      return result;
    };

    switch (step) {
      case 1:
        this.formData.fechaSolicitud  = get('f-fechaSolicitud');
        this.formData.nDesarrollo     = get('f-nDesarrollo');
        this.formData.nReferenciaEPSA = get('f-nReferenciaEPSA');
        this.formData.tipoSolicitud   = getChecked('tipoSolicitud');
        this.formData.dirigidoA       = getMultiCheck('dirigidoA');
        this.formData.tipoProducto    = getChecked('tipoProducto');
        break;
      case 2:
        this.formData.razonSocial               = get('f-razonSocial');
        this.formData.idCliente                 = get('f-idCliente');
        this.formData.sector                    = get('f-sector');
        this.formData.responsableComercialEPSA  = get('f-responsableComercialEPSA');
        this.formData.responsableTecnicoCliente = get('f-responsableTecnicoCliente');
        this.formData.paisesDestino             = get('f-paisesDestino');
        this.formData.consumoEstimado           = get('f-consumoEstimado');
        this.formData.cantidadMuestra           = get('f-cantidadMuestra');
        this.formData.competidor                = get('f-competidor');
        this.formData.referenciaCompetidor      = get('f-referenciaCompetidor');
        this.formData.precioCompetidor          = get('f-precioCompetidor');
        this.formData.descripcionProyecto       = get('f-descripcionProyecto');
        this.formData.necesidadDetectada        = get('f-necesidadDetectada');
        this.formData.aplicacion                = get('f-aplicacion');
        this.formData.metodoAplicacion          = get('f-metodoAplicacion');
        break;
      case 3:
        const estandares = getMultiCheck('estandar');
        if (!estandares.includes('IFS')) estandares.push('IFS');
        this.formData.estandaresRequeridos = estandares;
        this.formData.otroEstandar         = get('f-otroEstandar');
        const libAl = document.getElementById('f-etiquetadoLibreAlergenos');
        const sinG  = document.getElementById('f-etiquetadoSinGluten');
        this.formData.etiquetadoLibreAlergenos = libAl ? libAl.checked : false;
        this.formData.etiquetadoSinGluten      = sinG  ? sinG.checked  : false;
        this.formData.otroClaimEtiquetado      = get('f-otroClaimEtiquetado');
        const tp2 = getChecked('tipoProducto2');
        if (tp2) this.formData.tipoProducto = tp2;
        this.formData.vidaUtilMinima = get('f-vidaUtilMinima');
        this.formData.tipoEnvase     = get('f-tipoEnvase');
        // Docs
        const docKeys = ['especificacion','productDataSheet','coa','muestra','necesidadRefrigeracion'];
        const docs = {};
        docKeys.forEach(k => {
          const el = document.querySelector(`input[name="doc"][value="${k}"]`);
          docs[k] = el ? el.checked : false;
        });
        docs.otros = get('f-docsOtros');
        this.formData.documentosAporta = docs;
        this.collectAllergenData();
        break;
      case 4:
        this.formData.precioObjetivoVenta            = get('f-precioObjetivoVenta');
        this.formData.margenObjetivo                 = get('f-margenObjetivo');
        this.formData.costeEstimadoMP                = get('f-costeEstimadoMP');
        this.formData.costeEstimadoProduccion        = get('f-costeEstimadoProduccion');
        this.formData.volumenMinimoProduccion        = get('f-volumenMinimoProduccion');
        this.formData.capacidadProductivaDisponible  = get('f-capacidadProductivaDisponible');
        this.formData.inversionInicialNecesaria      = get('f-inversionInicialNecesaria');
        this.formData.roiEstimado                    = get('f-roiEstimado');
        this.formData.observacionesComerciales       = get('f-observacionesComerciales');
        this.formData.goNoGoComercial                = getChecked('goNoGoComercial');
        break;
      case 5:
        this.formData.esTecnicamenteFactible      = getChecked('esTecnicamenteFactible');
        this.formData.tiempoEstimadoDesarrollo    = get('f-tiempoEstimadoDesarrollo');
        this.formData.normativaAlimentariaAplicable = get('f-normativaAlimentariaAplicable');
        this.formData.procesoProductivoRequerido  = get('f-procesoProductivoRequerido');
        this.formData.condicionesAlmacenamiento   = get('f-condicionesAlmacenamiento');
        this.formData.estabilidadProducto         = get('f-estabilidadProducto');
        this.formData.cleanLabel                  = getChecked('cleanLabel');
        this.formData.equipamientoNecesario       = get('f-equipamientoNecesario');
        this.formData.formulacionPreliminar       = get('f-formulacionPreliminar');
        this.formData.componenteEspecificoRequerido = get('f-componenteEspecificoRequerido');
        this.formData.fabricanteConcreto          = get('f-fabricanteConcreto');
        this.formData.ingredientesFuncionales     = get('f-ingredientesFuncionales');
        this.formData.infoNutricionalOrientativa  = get('f-infoNutricionalOrientativa');
        this.formData.planHACCP                   = get('f-planHACCP');
        this.formData.puntosCriticos              = get('f-puntosCriticos');
        this.formData.analisisMicrobiologico      = get('f-analisisMicrobiologico');
        this.formData.limitesMigracion            = get('f-limitesMigracion');
        this.formData.controlAlergenos            = get('f-controlAlergenos');
        this.formData.observacionesTecnicas       = get('f-observacionesTecnicas');
        this.collectAllergenData();
        // Certifications
        const certKeys = getMultiCheck('cert');
        const vc = { IFS:true, Halal:false, Kosher:false, Bio:false, Feed:false, Tecnico:false };
        certKeys.forEach(k => { vc[k] = true; });
        this.formData.validacionCertificaciones = vc;
        this.formData.goNoGoTecnico  = getChecked('goNoGoTecnico');
        this.formData.decisionFinal  = getChecked('decisionFinal');
        this.formData.motivoRechazo  = get('f-motivoRechazo');
        break;
    }
  },

  renderWizardNav(allowed) {
    const container = document.getElementById('wizard-nav');
    if (!container) return;
    const steps   = allowed;
    const current = this.wizardStep;
    const idx     = steps.indexOf(current);
    const hasPrev = idx > 0;
    const hasNext = idx < steps.length - 1;
    const isLast  = !hasNext;

    let saveLabel = 'Guardar borrador';
    let nextLabel = 'Siguiente ›';
    let saveClass = 'btn btn-secondary';

    if (isLast) {
      saveLabel = '💾 Guardar y Finalizar';
      saveClass = 'btn btn-success';
    }

    container.innerHTML = `
      <div class="flex gap-8">
        <button class="btn btn-secondary" onclick="App.cancelWizard()">✕ Cancelar</button>
        ${hasPrev ? `<button class="btn btn-outline" onclick="App.prevStep()">‹ Anterior</button>` : ''}
      </div>
      <div class="flex gap-8">
        <button class="${saveClass}" onclick="App.saveProject(false)">${saveLabel}</button>
        ${hasNext ? `<button class="btn btn-primary" onclick="App.nextStep()">${nextLabel}</button>` : ''}
      </div>`;
  },

  prevStep() {
    const allowed = this.getAllowedSteps();
    const idx = allowed.indexOf(this.wizardStep);
    if (idx > 0) {
      this.collectStepData(this.wizardStep);
      this.wizardStep = allowed[idx - 1];
      this.renderWizard();
    }
  },

  nextStep() {
    const allowed = this.getAllowedSteps();
    const idx = allowed.indexOf(this.wizardStep);
    this.collectStepData(this.wizardStep);
    if (idx < allowed.length - 1) {
      this.wizardStep = allowed[idx + 1];
      this.renderWizard();
    }
  },

  saveProject(finalize = false) {
    this.collectStepData(this.wizardStep);
    const p = this.formData;
    p.updatedAt = new Date().toISOString();

    // Auto-advance state based on role and decisions
    const role = this.currentUser?.role;
    const isNew = !this.editingProject;

    if (finalize || true) {
      const allowed = this.getAllowedSteps();
      const lastStep = allowed[allowed.length - 1];
      const currentIsLast = this.wizardStep === lastStep;

      if (role === 'Comercial' && p.estado === 'Pendiente Comercial' && p.razonSocial) {
        p.estado = 'Pendiente UN';
      } else if (role === 'Director/a UN' && p.goNoGoComercial) {
        p.estado = p.goNoGoComercial === 'NO GO' ? 'Rechazado' : 'Pendiente I+D';
      } else if ((role === 'Directora I+D' || role === 'Administrador') && p.decisionFinal) {
        p.estado = p.decisionFinal === 'Aprobado' ? 'Aprobado' : 'Rechazado';
      } else if ((role === 'Directora I+D' || role === 'Administrador') && p.goNoGoTecnico === 'NO GO') {
        p.estado = 'Rechazado';
      }
    }

    Storage.saveProject(p);

    // Activity log
    const action = isNew ? `Solicitud creada` : `Proyecto actualizado — Estado: ${p.estado}`;
    Storage.addActivity(p.id, action, `${this.currentUser?.name} (${this.currentUser?.role})`);

    if (p.goNoGoComercial && !this.editingProject) {
      Storage.addActivity(p.id, `Decisión comercial: ${p.goNoGoComercial}`, `${this.currentUser?.name}`);
    }
    if (p.decisionFinal) {
      Storage.addActivity(p.id, `DECISIÓN FINAL: ${p.decisionFinal.toUpperCase()}`, `${this.currentUser?.name}`);
    }

    this.editingProject = p.id;
    Toast.show(`Proyecto ${p.id} guardado correctamente`, 'success');
    this.navigateTo('projects');
  },

  cancelWizard() {
    if (confirm('¿Descartar cambios y volver?')) {
      this.editingProject = null;
      this.formData = {};
      this.navigateTo('projects');
    }
  },

  // ── DETAIL MODAL ──────────────────────────────────────────
  openDetail(id) {
    const p = Storage.getProjectById(id);
    if (!p) return;
    const modal   = document.getElementById('modal-detail');
    const title   = document.getElementById('modal-detail-title');
    const body    = document.getElementById('modal-detail-body');
    const editBtn = document.getElementById('modal-edit-btn');

    title.innerHTML = `${p.id} — ${p.razonSocial || 'Sin nombre'} &nbsp;<span class="badge ${EPSA_DATA.getStateConfig(p.estado).badge}">${p.estado}</span>`;
    body.innerHTML  = this.renderDetailContent(p);
    editBtn.onclick = () => { this.closeModal('modal-detail'); this.editProject(id); };
    modal.classList.add('open');
  },

  closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  },

  renderDetailContent(p) {
    const f = (v) => v || '—';
    const allergenRow = (a, data, emptyLabel) => {
      const d = data[a] || {};
      return `<tr><td>${a}</td><td>${f(d.valor)}</td><td>${f(d.obs)}</td></tr>`;
    };

    const alergenosClienteRows = EPSA_DATA.ALLERGENS.map(a => allergenRow(a, p.alergenosCliente || {})).join('');
    const alergenosIDRows      = EPSA_DATA.ALLERGENS.map(a => allergenRow(a, p.alergenosID || {})).join('');

    const certChecks = EPSA_DATA.STANDARDS.map(s => {
      const key = s === 'Técnico' ? 'Tecnico' : s;
      const ok  = (p.validacionCertificaciones || {})[key];
      return `<span class="badge ${ok ? 'badge-go' : 'badge-empty'}">${s} ${ok ? '✔' : '—'}</span>`;
    }).join(' ');

    const docsChecks = (() => {
      const d = p.documentosAporta || {};
      const labels = { especificacion:'Especificación', productDataSheet:'Product Data Sheet', coa:'COA', muestra:'Muestra', necesidadRefrigeracion:'Necesidad refrigeración' };
      return Object.entries(labels).map(([k, v]) =>
        `<span class="badge ${d[k] ? 'badge-go' : 'badge-empty'}">${v}</span>`
      ).join(' ');
    })();

    // Decisions
    const gcls  = p.goNoGoComercial === 'GO' ? 'go' : (p.goNoGoComercial === 'NO GO' ? 'nogo' : 'pending');
    const gtcls = p.goNoGoTecnico   === 'GO' ? 'go' : (p.goNoGoTecnico   === 'NO GO' ? 'nogo' : 'pending');
    const dfcls = p.decisionFinal   === 'Aprobado' ? 'final-aprobado' : (p.decisionFinal === 'Rechazado' ? 'final-rechazado' : 'pending');

    return `
      <!-- SECCIÓN 1 — COMERCIAL -->
      <div class="detail-section">
        <div class="detail-section-title comercial">📋 Sección 1 — Datos Generales y Comercial</div>
        <div class="detail-grid">
          <div class="detail-field"><label>Fecha Solicitud</label><span>${EPSA_DATA.formatDate(p.fechaSolicitud)}</span></div>
          <div class="detail-field"><label>Nº Proyecto</label><span style="font-family:var(--font-mono);font-weight:700;color:var(--color-id)">${p.id}</span></div>
          <div class="detail-field"><label>Nº Desarrollo</label><span>${f(p.nDesarrollo)}</span></div>
          <div class="detail-field"><label>Nº Referencia EPSA</label><span>${f(p.nReferenciaEPSA)}</span></div>
          <div class="detail-field"><label>Tipo de Solicitud</label><span>${f(p.tipoSolicitud)}</span></div>
          <div class="detail-field"><label>Tipo de Producto</label><span>${f(p.tipoProducto)}</span></div>
          <div class="detail-field span-2"><label>Dirigido a</label><span>${(p.dirigidoA||[]).join(', ') || '—'}</span></div>
          <div class="detail-field span-2"><label>Razón Social</label><span style="font-weight:600">${f(p.razonSocial)}</span></div>
          <div class="detail-field"><label>ID Cliente</label><span>${f(p.idCliente)}</span></div>
          <div class="detail-field"><label>Sector</label><span>${f(p.sector)}</span></div>
          <div class="detail-field"><label>Responsable Comercial EPSA</label><span>${f(p.responsableComercialEPSA)}</span></div>
          <div class="detail-field"><label>Responsable Técnico Cliente</label><span>${f(p.responsableTecnicoCliente)}</span></div>
          <div class="detail-field"><label>Países de Destino</label><span>${f(p.paisesDestino)}</span></div>
          <div class="detail-field"><label>Consumo Estimado / Año</label><span>${f(p.consumoEstimado)}</span></div>
          <div class="detail-field"><label>Cantidad Muestra</label><span>${f(p.cantidadMuestra)}</span></div>
          <div class="detail-field"><label>Competidor</label><span>${f(p.competidor)}</span></div>
          <div class="detail-field"><label>Ref. Competidor</label><span>${f(p.referenciaCompetidor)}</span></div>
          <div class="detail-field"><label>Precio Competidor</label><span>${f(p.precioCompetidor)}</span></div>
          <div class="detail-field span-2"><label>Descripción del Proyecto</label><span>${f(p.descripcionProyecto)}</span></div>
          <div class="detail-field span-2"><label>Necesidad Detectada</label><span>${f(p.necesidadDetectada)}</span></div>
          <div class="detail-field"><label>Aplicación</label><span>${f(p.aplicacion)}</span></div>
          <div class="detail-field"><label>Método de Aplicación</label><span>${f(p.metodoAplicacion)}</span></div>
          <div class="detail-field"><label>Estándares Requeridos</label><span>${(p.estandaresRequeridos||[]).join(', ') || 'IFS'}</span></div>
          <div class="detail-field"><label>Etiquetado</label><span>${[p.etiquetadoLibreAlergenos?'Libre alérgenos':'', p.etiquetadoSinGluten?'Sin Gluten':'', p.otroClaimEtiquetado].filter(Boolean).join(', ') || '—'}</span></div>
          <div class="detail-field"><label>Vida Útil Mínima</label><span>${f(p.vidaUtilMinima)}</span></div>
          <div class="detail-field"><label>Tipo de Envase</label><span>${f(p.tipoEnvase)}</span></div>
          <div class="detail-field span-2"><label>Documentos Aportados</label><span>${docsChecks}</span></div>
        </div>
        <div class="mt-16 mb-8"><strong>Alérgenos admitidos por el cliente</strong></div>
        <table class="detail-allergen-table">
          <thead><tr><th>Alérgeno</th><th>Admisión</th><th>Observaciones</th></tr></thead>
          <tbody>${alergenosClienteRows}</tbody>
        </table>
      </div>

      <!-- SECCIÓN 2 — UN -->
      <div class="detail-section">
        <div class="detail-section-title un">💼 Sección 2 — Viabilidad Comercial (Dir. UN)</div>
        <div class="detail-grid">
          <div class="detail-field"><label>Precio Objetivo Venta (€/kg)</label><span>${f(p.precioObjetivoVenta)}</span></div>
          <div class="detail-field"><label>Margen Objetivo (%)</label><span>${f(p.margenObjetivo)}</span></div>
          <div class="detail-field"><label>Coste Est. Materias Primas (€/kg)</label><span>${f(p.costeEstimadoMP)}</span></div>
          <div class="detail-field"><label>Coste Est. Producción (€/kg)</label><span>${f(p.costeEstimadoProduccion)}</span></div>
          <div class="detail-field"><label>Volumen Mínimo Producción (kg)</label><span>${f(p.volumenMinimoProduccion)}</span></div>
          <div class="detail-field"><label>Capacidad Productiva</label><span>${f(p.capacidadProductivaDisponible)}</span></div>
          <div class="detail-field"><label>Inversión Inicial (€)</label><span>${f(p.inversionInicialNecesaria)}</span></div>
          <div class="detail-field"><label>ROI / Plazo Retorno</label><span>${f(p.roiEstimado)}</span></div>
          <div class="detail-field span-2"><label>Observaciones Comerciales</label><span>${f(p.observacionesComerciales)}</span></div>
        </div>
      </div>

      <!-- SECCIÓN 3 — I+D -->
      <div class="detail-section">
        <div class="detail-section-title id">🔬 Sección 3 — Viabilidad Técnica (Dir. I+D)</div>
        <div class="detail-grid">
          <div class="detail-field"><label>¿Factible técnicamente?</label><span>${f(p.esTecnicamenteFactible)}</span></div>
          <div class="detail-field"><label>Tiempo Est. Desarrollo</label><span>${f(p.tiempoEstimadoDesarrollo)}</span></div>
          <div class="detail-field span-2"><label>Normativa Aplicable</label><span>${f(p.normativaAlimentariaAplicable)}</span></div>
          <div class="detail-field span-2"><label>Proceso Productivo</label><span>${f(p.procesoProductivoRequerido)}</span></div>
          <div class="detail-field"><label>Condiciones Almacenamiento</label><span>${f(p.condicionesAlmacenamiento)}</span></div>
          <div class="detail-field"><label>Estabilidad del Producto</label><span>${f(p.estabilidadProducto)}</span></div>
          <div class="detail-field"><label>Clean Label</label><span>${f(p.cleanLabel)}</span></div>
          <div class="detail-field"><label>Equipamiento Necesario</label><span>${f(p.equipamientoNecesario)}</span></div>
          <div class="detail-field span-2"><label>Formulación Preliminar</label><span>${f(p.formulacionPreliminar)}</span></div>
          <div class="detail-field"><label>Componente Específico</label><span>${f(p.componenteEspecificoRequerido)}</span></div>
          <div class="detail-field"><label>Fabricante Concreto</label><span>${f(p.fabricanteConcreto)}</span></div>
          <div class="detail-field"><label>Ingredientes Funcionales</label><span>${f(p.ingredientesFuncionales)}</span></div>
          <div class="detail-field"><label>Info. Nutricional Orientativa</label><span>${f(p.infoNutricionalOrientativa)}</span></div>
          <div class="detail-field span-2"><label>Observaciones Técnicas</label><span>${f(p.observacionesTecnicas)}</span></div>
          <div class="detail-field span-2"><label>Validación Certificaciones</label><span>${certChecks}</span></div>
        </div>
        <div class="mt-16 mb-8"><strong>Alérgenos en la formulación propuesta por I+D</strong></div>
        <table class="detail-allergen-table">
          <thead><tr><th>Alérgeno</th><th>Presencia</th><th>Observaciones</th></tr></thead>
          <tbody>${alergenosIDRows}</tbody>
        </table>
      </div>

      <!-- DECISIONES FINALES -->
      <div class="detail-section">
        <div class="detail-section-title aprobacion">🏁 Resumen de Decisiones y Cierre</div>
        <div class="decision-summary">
          <div class="decision-card ${gcls}">
            <div class="dc-label">Decisión Comercial (UN)</div>
            <div class="dc-value">${p.goNoGoComercial || '—'}</div>
          </div>
          <div class="decision-card ${gtcls}">
            <div class="dc-label">Decisión Técnica (I+D)</div>
            <div class="dc-value">${p.goNoGoTecnico || '—'}</div>
          </div>
          <div class="decision-card ${dfcls}">
            <div class="dc-label">Decisión Final</div>
            <div class="dc-value">${p.decisionFinal || '—'}</div>
          </div>
        </div>
        ${p.motivoRechazo ? `<div class="detail-field mt-16"><label>Motivo de Rechazo</label><span>${p.motivoRechazo}</span></div>` : ''}
      </div>`;
  },

  // ── HISTORY ───────────────────────────────────────────────
  renderHistory() {
    const activities = Storage.getActivity();
    const container  = document.getElementById('activity-feed');
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><h3>Sin actividad registrada</h3></div>';
      return;
    }

    const iconMap = {
      'plus':        '➕',
      'arrow-right': '→',
      'check':       '✅',
      'flask':       '🔬',
      'star':        '⭐',
      'times':       '❌',
      'ban':         '🚫',
      'undo':        '↩',
      'edit':        '✏️',
      'info':        'ℹ️'
    };

    container.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon" style="background:${a.color||'#666'}">${iconMap[a.icon]||'•'}</div>
        <div class="activity-content">
          <div class="activity-project">${a.projectId}</div>
          <div class="activity-action">${a.action}</div>
          <div class="activity-meta">${a.user} · ${EPSA_DATA.formatDateTime(a.timestamp)}</div>
        </div>
      </div>`).join('');
  },

  // ── GLOBAL EVENTS ─────────────────────────────────────────
  bindGlobalEvents() {
    // Auth
    document.getElementById('btn-login')?.addEventListener('click', () => this.login());
    document.getElementById('login-password')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.login();
    });

    // Nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const page = el.dataset.page;
        if (page) this.navigateTo(page);
      });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) this.logout();
    });

    // Projects filters
    document.getElementById('filter-state')?.addEventListener('change', () => this.applyProjectsFilter());
    document.getElementById('filter-search')?.addEventListener('input',  () => this.applyProjectsFilter());

    // Reset demo data
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('¿Restaurar datos de demostración? Se perderán todos los cambios.')) {
        Storage.reset();
        Toast.show('Datos de demo restaurados', 'info');
        this.navigateTo('dashboard');
      }
    });

    // Modal close
    document.getElementById('modal-detail-close')?.addEventListener('click', () => this.closeModal('modal-detail'));
    document.getElementById('modal-detail-close-btn')?.addEventListener('click', () => this.closeModal('modal-detail'));
    document.getElementById('modal-detail')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) this.closeModal('modal-detail');
    });
  },

  applyProjectsFilter() {
    const filter = document.getElementById('filter-state')?.value || '';
    const search = document.getElementById('filter-search')?.value || '';
    this.renderProjectsList(filter, search);
  }
};

// ── TOAST ─────────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type]||''} ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut .3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
