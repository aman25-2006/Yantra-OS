const app = document.getElementById('app');
const favicon = document.getElementById('favicon');

const state = {
  authenticated: false,
  page: 'dashboard',
  theme: 'dark',
  selectedMachine: 'MX-07',
  searchQuery: '',
  lastPrompt: 'Why did production decrease today?',
  loadingDone: false,
  copilotMessages: [
    {
      role: 'assistant',
      text: 'I am connected to production, machines, energy, inventory, quality and safety. Ask me a factory question and I will turn it into a recommendation.',
    },
  ],
};

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'copilot', label: 'AI Copilot', icon: 'sparkles' },
  { id: 'twin', label: 'Digital Twin', icon: 'layers-3' },
  { id: 'machines', label: 'Machines', icon: 'cpu' },
  { id: 'production', label: 'Production', icon: 'factory' },
  { id: 'maintenance', label: 'Maintenance', icon: 'wrench' },
  { id: 'quality', label: 'Quality Inspection', icon: 'scan-search' },
  { id: 'inventory', label: 'Inventory', icon: 'boxes' },
  { id: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
  { id: 'orders', label: 'Orders', icon: 'package' },
  { id: 'supply-chain', label: 'Supply Chain', icon: 'truck' },
  { id: 'energy', label: 'Energy', icon: 'bolt' },
  { id: 'workers', label: 'Workers', icon: 'users' },
  { id: 'safety', label: 'Safety', icon: 'shield-alert' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-column' },
  { id: 'reports', label: 'Reports', icon: 'file-text' },
  { id: 'compliance', label: 'Compliance', icon: 'shield-check' },
  { id: 'settings', label: 'Settings', icon: 'settings-2' },
];

const kpis = [
  { title: 'Production Today', value: '1,540', suffix: ' units', delta: '+6.2%', trend: 'up', tone: 'cyan', icon: 'factory', spark: [58, 62, 61, 67, 72, 76, 80] },
  { title: 'Machine Health', value: '94', suffix: '%', delta: '+2.1%', trend: 'up', tone: 'green', icon: 'shield-check', spark: [86, 87, 89, 90, 93, 94, 94] },
  { title: 'OEE', value: '87.4', suffix: '%', delta: '+1.8%', trend: 'up', tone: 'blue', icon: 'chart-column', spark: [78, 80, 81, 84, 85, 86, 87] },
  { title: 'Energy Consumption', value: '4.8', suffix: ' MWh', delta: '+4.0%', trend: 'up', tone: 'amber', icon: 'bolt', spark: [42, 45, 48, 46, 49, 51, 50] },
  { title: 'Today\'s Output', value: '1,540', suffix: ' units', delta: '+8.4%', trend: 'up', tone: 'cyan', icon: 'badge-indian-rupee', spark: [49, 52, 55, 59, 60, 63, 67] },
  { title: 'Defect Rate', value: '1.7', suffix: '%', delta: '-0.4%', trend: 'down', tone: 'red', icon: 'scan-search', spark: [12, 10, 9, 8, 7, 6, 5] },
  { title: 'Inventory Health', value: '92', suffix: '%', delta: '+1.5%', trend: 'up', tone: 'green', icon: 'boxes', spark: [82, 83, 84, 85, 88, 90, 92] },
  { title: 'Worker Safety', value: '99.2', suffix: '%', delta: '+0.6%', trend: 'up', tone: 'green', icon: 'shield-alert', spark: [96, 96, 97, 97, 98, 99, 99] },
  { title: 'Maintenance Status', value: '3', suffix: ' due', delta: '2 urgent', trend: 'flat', tone: 'amber', icon: 'wrench', spark: [7, 8, 8, 6, 5, 4, 3] },
  { title: 'Revenue Impact', value: '₹24.8', suffix: 'L', delta: '+7.1%', trend: 'up', tone: 'blue', icon: 'trending-up', spark: [18, 19, 20, 21, 22, 23, 25] },
  { title: 'Machine Utilization', value: '89', suffix: '%', delta: '+3.0%', trend: 'up', tone: 'cyan', icon: 'activity', spark: [74, 76, 78, 80, 82, 85, 89] },
  { title: 'Downtime', value: '1.8', suffix: ' hrs', delta: '-0.7', trend: 'down', tone: 'red', icon: 'clock-3', spark: [6, 5, 5, 4, 3, 2, 2] },
];

const machines = [
  { id: 'MX-01', name: 'Laser Cutter 01', line: 'Line A', status: 'Running', temperature: 61, vibration: 1.8, pressure: 2.4, rpm: 4_800, power: 18.6, health: 97, lastMaintenance: '2 days ago', failure: 4, color: 'healthy' },
  { id: 'MX-02', name: 'CNC Press 02', line: 'Line A', status: 'Running', temperature: 68, vibration: 2.1, pressure: 2.8, rpm: 3_920, power: 21.4, health: 94, lastMaintenance: '5 days ago', failure: 9, color: 'healthy' },
  { id: 'MX-03', name: 'Injection Molder 03', line: 'Line B', status: 'Idle', temperature: 54, vibration: 1.0, pressure: 1.6, rpm: 0, power: 7.8, health: 88, lastMaintenance: '11 days ago', failure: 14, color: 'warning' },
  { id: 'MX-04', name: 'Packaging Robot 04', line: 'Line C', status: 'Fault', temperature: 92, vibration: 4.7, pressure: 3.8, rpm: 2_100, power: 24.2, health: 52, lastMaintenance: '18 days ago', failure: 81, color: 'critical' },
  { id: 'MX-05', name: 'Boiler Unit 05', line: 'Utilities', status: 'Running', temperature: 79, vibration: 2.0, pressure: 4.2, rpm: 1_100, power: 16.1, health: 91, lastMaintenance: '8 days ago', failure: 12, color: 'healthy' },
  { id: 'MX-06', name: 'Air Compressor 06', line: 'Utilities', status: 'Maintenance', temperature: 73, vibration: 3.6, pressure: 2.2, rpm: 2_800, power: 13.2, health: 76, lastMaintenance: '1 day ago', failure: 28, color: 'warning' },
  { id: 'MX-07', name: 'Press Line 07', line: 'Line D', status: 'Running', temperature: 84, vibration: 4.2, pressure: 3.4, rpm: 3_300, power: 19.8, health: 82, lastMaintenance: '9 days ago', failure: 64, color: 'warning' },
  { id: 'MX-08', name: 'Inspection Arm 08', line: 'Quality Bay', status: 'Running', temperature: 57, vibration: 1.2, pressure: 1.8, rpm: 1_900, power: 9.3, health: 95, lastMaintenance: '4 days ago', failure: 6, color: 'healthy' },
];

const twinNodes = [
  { id: 'MX-01', label: 'Laser Cutter', x: 14, y: 18, line: 'Line A' },
  { id: 'MX-02', label: 'CNC Press', x: 30, y: 22, line: 'Line A' },
  { id: 'MX-03', label: 'Molder', x: 54, y: 20, line: 'Line B' },
  { id: 'MX-04', label: 'Pack Robot', x: 77, y: 24, line: 'Line C' },
  { id: 'MX-05', label: 'Boiler', x: 20, y: 64, line: 'Utilities' },
  { id: 'MX-06', label: 'Compressor', x: 43, y: 66, line: 'Utilities' },
  { id: 'MX-07', label: 'Press Line', x: 66, y: 64, line: 'Line D' },
  { id: 'MX-08', label: 'Inspection', x: 86, y: 66, line: 'Quality' },
];

const alerts = [
  { severity: 'critical', title: 'Machine 4 overheating', time: '08:42', action: 'Dispatch technician and pause the cell until temperatures normalize.' },
  { severity: 'warning', title: 'Inventory low: Steel Sheets', time: '09:18', action: 'Reorder 3 pallets before next shift starts.' },
  { severity: 'warning', title: 'Quality defect spike', time: '10:05', action: 'Inspect alignment on Line C and review vision thresholds.' },
  { severity: 'critical', title: 'Worker entered restricted zone', time: '10:41', action: 'Trigger safety alert and review camera playback.' },
  { severity: 'info', title: 'Energy peak detected', time: '11:12', action: 'Shift non-urgent load outside peak tariff window.' },
];

const prompts = [
  'Why did production decrease today?',
  'Which machine may fail next?',
  'How can we reduce electricity consumption?',
  'Show maintenance due this week.',
  'Generate today\'s production report.',
  'Predict inventory shortage.',
  'Suggest production optimization.',
  'Analyze quality defects.',
];

const aiResponses = {
  'why did production decrease today?': {
    summary: 'Production dipped because Line C lost 42 minutes to a packaging robot fault, while Line D ran slower during a product changeover. Throughput recovered after 11:15.',
    risk: 68,
    actions: ['Inspect MX-04 packaging robot cooling path', 'Reduce changeover time on Line D', 'Rebalance operators to Line C for the next shift'],
    chart: [82, 80, 77, 74, 79, 81, 84],
  },
  'which machine may fail next?': {
    summary: 'MX-07 Press Line has the highest failure probability. Vibration drift and rising temperature suggest a likely failure window inside 72 hours.',
    risk: 86,
    actions: ['Schedule maintenance for MX-07 within the next 24 hours', 'Check shaft alignment and lubrication', 'Prepare a fallback machine for the same production route'],
    chart: [42, 51, 58, 66, 72, 78, 86],
  },
  'how can we reduce electricity consumption?': {
    summary: 'The biggest savings will come from shifting air compressor cycles out of peak tariff periods and lowering idle load on two machines that are waiting for input.',
    risk: 34,
    actions: ['Move non-critical loads to the off-peak window', 'Auto-sleep idle machines after 12 minutes', 'Cut compressor cycling with pressure band tuning'],
    chart: [4.9, 4.8, 4.5, 4.3, 4.1, 3.9, 3.8],
  },
  'show maintenance due this week.': {
    summary: 'Three assets are due this week: MX-07 press line, MX-06 compressor inspection, and MX-04 packaging robot calibration.',
    risk: 72,
    actions: ['Create maintenance tickets automatically', 'Assign MX-07 to the highest priority technician', 'Confirm spare parts availability before shift two'],
    chart: [1, 2, 2, 3, 3, 3, 3],
  },
  'generate today\'s production report.': {
    summary: 'Today\'s report is ready. Output is 1,540 units, OEE is 87.4%, defect rate is 1.7%, and all major delays were tied to one fault event.',
    risk: 22,
    actions: ['Export PDF to management', 'Share Excel to planning', 'Attach AI summary to the daily stand-up'],
    chart: [1460, 1490, 1505, 1512, 1528, 1538, 1540],
  },
  'predict inventory shortage.': {
    summary: 'Steel Sheets and packaging tape will hit the reorder threshold inside five days if the current dispatch rate stays constant.',
    risk: 74,
    actions: ['Raise a purchase request today', 'Reserve safety stock for Line C', 'Link supply intake to the production forecast'],
    chart: [92, 86, 79, 72, 65, 58, 51],
  },
  'suggest production optimization.': {
    summary: 'Best gains are available by moving inspection tasks earlier, running batch sizes larger on Line A, and re-sequencing packaging around the robotic fault window.',
    risk: 39,
    actions: ['Move inspection earlier in the flow', 'Batch similar jobs on Line A', 'Load-balance operators during changeovers'],
    chart: [72, 76, 79, 81, 84, 86, 89],
  },
  'analyze quality defects.': {
    summary: 'Vision systems flagged a rise in misalignment and surface scratches. Most rejects came from Line C after the packaging robot fault event.',
    risk: 61,
    actions: ['Tune the camera threshold on Line C', 'Inspect gripper alignment', 'Quarantine the last rejected batch'],
    chart: [8, 10, 13, 11, 14, 17, 15],
  },
};

const searchIndex = [
  { label: 'MX-07 Press Line', page: 'machines', description: 'Failure probability 64%', machineId: 'MX-07' },
  { label: 'MX-04 Packaging Robot', page: 'machines', description: 'Critical fault state', machineId: 'MX-04' },
  { label: 'Steel Sheets', page: 'inventory', description: 'Low stock item' },
  { label: 'Packaging Tape', page: 'inventory', description: 'Reorder required' },
  { label: 'ORD-1842', page: 'orders', description: 'Dispatch today' },
  { label: 'Line C Quality Defects', page: 'quality', description: 'Surface defect spike' },
  { label: 'Restricted Zone Alert', page: 'safety', description: 'Immediate response needed' },
  { label: 'M-07 Maintenance Ticket', page: 'maintenance', description: 'Scheduled within 72 hours' },
  { label: 'Plant Manager Aman', page: 'workers', description: 'Shift lead and owner profile' },
  { label: 'Energy Peak Window', page: 'energy', description: 'Tariff optimization opportunity' },
  { label: 'Supplier Orion Metals', page: 'supply-chain', description: 'Lead time 3 days' },
  { label: 'Weekly Production Report', page: 'reports', description: 'PDF, Excel and AI summary' },
];

const reportCards = [
  { title: 'Daily Production', text: 'Production, OEE, downtime and dispatch performance packaged for operations reviews.' },
  { title: 'Predictive Maintenance', text: 'Asset risk, failure probability and auto-generated work orders for engineering.' },
  { title: 'Energy Intelligence', text: 'Peak demand, savings and load-shifting recommendations for finance teams.' },
  { title: 'Quality Summary', text: 'Rejected batches, defect categories and vision-based root-cause notes.' },
  { title: 'Inventory Snapshot', text: 'Low-stock alerts, stock-out forecasts and procurement priorities.' },
  { title: 'AI Executive Brief', text: 'A board-ready summary that explains what changed and what to do next.' },
];

const roles = [
  ['Factory Owner', 'Full access to every module and executive summaries.'],
  ['Plant Manager', 'Oversight across production, inventory, maintenance and safety.'],
  ['Supervisor', 'Shift coordination, alerts, line performance and labor tracking.'],
  ['Maintenance Engineer', 'Predictive maintenance, tickets, diagnostics and spares.'],
  ['Quality Inspector', 'Vision defects, rejected products and batch traceability.'],
  ['Inventory Manager', 'Stock health, shortages, warehouses and supplier ordering.'],
  ['Operator', 'Line controls, machine status and shift feedback.'],
  ['Administrator', 'Users, policies, notifications, security and deployment.'],
];

const deploymentOptions = [
  ['Cloud SaaS', 'Scale across multiple factories with centralized AI and reporting.'],
  ['On-Premise', 'Run inside the plant network for sensitive and air-gapped environments.'],
];

const charts = {};

function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

function statusTone(status) {
  const key = normalize(status);
  if (key.includes('run')) return 'running';
  if (key.includes('maint')) return 'maintenance';
  if (key.includes('idle')) return 'idle';
  if (key.includes('fault') || key.includes('crit')) return 'critical';
  if (key.includes('warn')) return 'warning';
  return 'running';
}

function machineStatusTone(machine) {
  return machine.color === 'critical' ? 'critical' : machine.color === 'warning' ? 'warning' : 'running';
}

function svgBrand() {
  return `
    <svg class="brand-mark" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="yantra-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#57d7ff" />
          <stop offset="100%" stop-color="#2f74ff" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#07131f" />
      <path d="M24 31h17l19 27 19-27h17L67 69v22H53V69L24 31Z" fill="url(#yantra-gradient)" />
      <path d="M80 32h14c8 0 14 6 14 14v28c0 8-6 14-14 14H80V72h11c2 0 4-2 4-4V52c0-2-2-4-4-4H80V32Z" fill="#8ff7ff" />
      <path d="M30 92h60" stroke="#57d7ff" stroke-width="5" stroke-linecap="round" />
      <circle cx="58" cy="18" r="4" fill="#8ff7ff" />
      <circle cx="48" cy="28" r="4" fill="#57d7ff" />
      <circle cx="67" cy="24" r="4" fill="#57d7ff" />
      <circle cx="76" cy="29" r="4" fill="#8ff7ff" />
      <path d="M58 18v12M48 28v9M67 24v10M76 29v8" stroke="#57d7ff" stroke-width="3" stroke-linecap="round" />
    </svg>`;
}

function svgAvatar(label, tone = 'cyan') {
  const initials = label
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return `<span class="avatar avatar-${tone}">${initials}</span>`;
}

function sparkline(values, stroke = '#57d7ff') {
  const width = 120;
  const height = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / spread) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / spread) * (height - 4) - 2;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill-${stroke.replace(/[^a-z0-9]/gi, '')}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${stroke}" stop-opacity="0.38" />
          <stop offset="100%" stop-color="${stroke}" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      <path d="${path} L120 34 L0 34 Z" fill="url(#spark-fill-${stroke.replace(/[^a-z0-9]/gi, '')})" opacity="0.9" />
    </svg>`;
}

function kpiCard(kpi) {
  return `
    <article class="kpi-card tone-${kpi.tone}">
      <div class="kpi-top">
        <div class="kpi-icon"><i data-lucide="${kpi.icon}"></i></div>
        <span class="kpi-delta ${kpi.trend}">${kpi.delta}</span>
      </div>
      <div class="kpi-label">${kpi.title}</div>
      <div class="kpi-value counter" data-target="${kpi.value}" data-display="${kpi.value}${kpi.suffix}">${kpi.value}${kpi.suffix}</div>
      <div class="kpi-note">AI monitored</div>
      <div class="kpi-spark">${sparkline(kpi.spark, kpi.tone === 'amber' ? '#ffb04d' : kpi.tone === 'green' ? '#66e8b4' : '#57d7ff')}</div>
    </article>`;
}

function machineCard(machine) {
  return `
    <button class="machine-card ${machine.id === state.selectedMachine ? 'selected' : ''}" data-machine-id="${machine.id}">
      <div class="machine-head">
        <div>
          <div class="machine-name">${machine.name}</div>
          <div class="machine-line">${machine.line}</div>
        </div>
        <span class="status-pill ${machineStatusTone(machine)}">${machine.status}</span>
      </div>
      <div class="machine-grid">
        <div><span>Temp</span><strong>${machine.temperature}°C</strong></div>
        <div><span>Vibration</span><strong>${machine.vibration.toFixed(1)} g</strong></div>
        <div><span>Power</span><strong>${machine.power.toFixed(1)} kW</strong></div>
        <div><span>Health</span><strong>${machine.health}%</strong></div>
      </div>
      <div class="machine-progress">
        <span style="width:${machine.health}%"></span>
      </div>
      <div class="machine-foot">
        <span>Failure probability</span>
        <strong>${machine.failure}%</strong>
      </div>
    </button>`;
}

function alertCard(alert) {
  return `
    <div class="alert-card ${alert.severity}">
      <div class="alert-marker"></div>
      <div>
        <div class="alert-head">
          <strong>${alert.title}</strong>
          <span>${alert.time}</span>
        </div>
        <p>${alert.action}</p>
      </div>
    </div>`;
}

function actionButton(label, question, primary = false) {
  return `<button class="${primary ? 'primary-btn' : 'secondary-btn'} quick-action" data-question="${question}">${label}</button>`;
}

function modulePage(title, description, inner, actions = '') {
  return renderShell(`
    <section class="page shell-page">
      <div class="hero hero-inline">
        <div>
          <div class="eyebrow">Yantra OS module</div>
          <h1>${title}</h1>
          <p>${description}</p>
        </div>
        <div class="hero-actions compact">${actions}</div>
      </div>
      ${inner}
    </section>`);
}

function selectedMachine() {
  return machines.find((machine) => machine.id === state.selectedMachine) || machines[0];
}

function machineDiagnostics(machine) {
  return `
    <div class="diagnostic-card">
      <div class="diagnostic-top">
        <div>
          <div class="eyebrow">Selected asset</div>
          <h3>${machine.name}</h3>
          <p>${machine.line} · Last maintenance ${machine.lastMaintenance}</p>
        </div>
        <span class="status-pill ${machineStatusTone(machine)}">${machine.status}</span>
      </div>
      <div class="diagnostic-grid">
        <div><span>Temperature</span><strong>${machine.temperature}°C</strong></div>
        <div><span>Vibration</span><strong>${machine.vibration.toFixed(1)} g</strong></div>
        <div><span>Pressure</span><strong>${machine.pressure.toFixed(1)} bar</strong></div>
        <div><span>RPM</span><strong>${machine.rpm.toLocaleString()}</strong></div>
        <div><span>Power</span><strong>${machine.power.toFixed(1)} kW</strong></div>
        <div><span>Health</span><strong>${machine.health}%</strong></div>
      </div>
      <div class="diagnostic-bar">
        <span style="width:${machine.failure}%"></span>
      </div>
      <div class="diagnostic-bottom">
        <span>Estimated failure probability</span>
        <strong>${machine.failure}%</strong>
      </div>
      <div class="recommendation-list">
        <div>• Inspect bearings and cooling path</div>
        <div>• Schedule preventive maintenance within 72 hours</div>
        <div>• Keep a spare unit on standby for this line</div>
      </div>
    </div>`;
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-screen">
      <div class="login-hero">
        <div class="brand-lockup large">
          ${svgBrand()}
          <div class="brand-stack">
            <div class="brand-name">Yantra<span>OS</span></div>
            <div class="brand-tag">AI Smart Factory Operating System</div>
          </div>
        </div>
        <div class="login-copy">
          <div class="eyebrow">Industry 4.0 command center</div>
          <h1>The operating system for intelligent factories.</h1>
          <p>Yantra OS unifies machines, IoT sensors, PLCs, cameras, ERP, inventory, maintenance, quality, energy and workforce intelligence into one premium enterprise platform.</p>
        </div>
        <div class="login-metrics">
          <div class="stat-chip"><strong>94%</strong><span>Factory health visibility</span></div>
          <div class="stat-chip"><strong>72 hrs</strong><span>Predictive maintenance lead time</span></div>
          <div class="stat-chip"><strong>₹24.8L</strong><span>Estimated monthly revenue impact</span></div>
        </div>
      </div>
      <div class="login-panel">
        <div class="login-card glass-card">
          <div class="login-badge"><i data-lucide="shield-check"></i> Secure enterprise access</div>
          <h2>Welcome to Yantra OS</h2>
          <p>Sign in to the smart factory brain. Demo credentials are prefilled for the live prototype.</p>
          <form id="loginForm" class="login-form">
            <label>
              <span>Email</span>
              <input class="input" id="email" type="email" value="owner@yantraos.com" placeholder="factory.owner@company.com" />
            </label>
            <label>
              <span>Password</span>
              <input class="input" id="password" type="password" value="yantra123" placeholder="Enter password" />
            </label>
            <div class="login-row">
              <label class="checkbox"><input type="checkbox" checked /> Remember me</label>
              <a class="text-link" href="#">Forgot password?</a>
            </div>
            <button class="primary-btn login-submit" type="submit">Enter Yantra OS</button>
          </form>
          <div class="login-footer">
            <span>Cloud SaaS + On-premise ready</span>
            <span>Fortune 500-style manufacturing UX</span>
          </div>
        </div>
      </div>
    </section>`;

  document.getElementById('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.authenticated = true;
    renderApp();
    showNotification('Signed in', 'Yantra OS factory intelligence is ready.');
  });
}

function renderShell(contentHtml) {
  return `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-lockup compact">
            ${svgBrand()}
            <div class="brand-stack">
              <div class="brand-name">Yantra<span>OS</span></div>
              <div class="brand-tag">The brain of the factory</div>
            </div>
          </div>
        </div>
        <nav class="nav-group" aria-label="Primary navigation">
          ${sidebarItems
            .map(
              (item) => `
                <button class="nav-link ${state.page === item.id ? 'active' : ''}" data-page="${item.id}">
                  <span class="nav-main"><i data-lucide="${item.icon}" class="nav-icon"></i><span>${item.label}</span></span>
                  <i data-lucide="chevron-right" class="nav-icon nav-chevron"></i>
                </button>`
            )
            .join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="profile-card">
            ${svgAvatar('Shree Metal Works', 'cyan')}
            <div>
              <strong>Factory Profile</strong>
              <span>Shree Metal Works</span>
            </div>
          </div>
          <div class="profile-card">
            ${svgAvatar('Aman Patel', 'blue')}
            <div>
              <strong>User Profile</strong>
              <span>Aman, Factory Owner</span>
            </div>
          </div>
          <button class="logout-btn" id="logoutBtn">Logout</button>
        </div>
      </aside>

      <div class="workspace">
        <header class="topbar">
          <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation"><i data-lucide="menu"></i></button>
          <div class="search-shell">
            <div class="search-pill">
              <i data-lucide="search"></i>
              <input id="globalSearch" type="search" placeholder="Search machines, workers, orders, inventory, maintenance" autocomplete="off" />
              <button class="search-action" id="searchAction" type="button">AI Search</button>
            </div>
            <div class="search-results" id="searchResults" hidden></div>
          </div>
          <div class="topbar-actions">
            <span class="mode-pill">Cloud SaaS · On-premise</span>
            <button class="icon-btn" aria-label="Notifications"><i data-lucide="bell"></i><span class="badge-dot"></span></button>
            <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"><i data-lucide="moon-star"></i></button>
            <button class="icon-btn" aria-label="Quick settings"><i data-lucide="settings-2"></i></button>
            ${svgAvatar('Aman Patel', 'cyan')}
          </div>
        </header>
        ${contentHtml}
      </div>
    </div>
    <div class="notification" id="notification" role="status" aria-live="polite"></div>`;
}

function renderDashboardPage() {
  const machine = selectedMachine();
  return renderShell(`
    <section class="page page-dashboard">
      <div class="hero hero-dashboard">
        <div class="hero-copy">
          <div class="eyebrow">Factory intelligence at a glance</div>
          <h1>Yantra OS is the brain of the smart factory.</h1>
          <p>Continuous AI orchestration across production, machines, inventory, energy, safety and quality. Designed for manufacturing teams that need decision support, not just dashboards.</p>
          <div class="hero-actions">
            ${actionButton('Ask Copilot', 'Why did production decrease today?', true)}
            ${actionButton('Generate report', "Generate today's production report.")}
            ${actionButton('Find risk', 'Which machine may fail next?')}
          </div>
        </div>
        <div class="hero-aside glass-card">
          <div class="hero-status">
            <span class="status-dot good"></span>
            <span>Factory health 94% · Excellent performance</span>
          </div>
          <div class="hero-tiles">
            <div><strong>31</strong><span>Connected assets</span></div>
            <div><strong>12</strong><span>Production orders</span></div>
            <div><strong>3</strong><span>Maintenance due</span></div>
            <div><strong>5</strong><span>Active alerts</span></div>
          </div>
          <div class="hero-cta-card">
            <span>Executive summary</span>
            <strong>Predictive maintenance, peak-load reduction and quality stabilization are the biggest wins this week.</strong>
          </div>
        </div>
      </div>

      <div class="kpi-grid">${kpis.map(kpiCard).join('')}</div>

      <div class="dashboard-grid">
        <div class="stack">
          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>AI Daily Briefing</h3>
                <p>What matters right now</p>
              </div>
              <span class="glass-tag">Proactive insights</span>
            </div>
            <div class="brief-grid">
              <div class="brief-item good"><strong>Production is on track</strong><span>Output is 6.2% ahead of yesterday.</span></div>
              <div class="brief-item warn"><strong>MX-07 needs attention</strong><span>Failure probability is at 64%.</span></div>
              <div class="brief-item info"><strong>Energy can be optimized</strong><span>Idle compressor cycles are costing peak power.</span></div>
              <div class="brief-item alert"><strong>Inventory low on two items</strong><span>Steel sheets and packaging tape need reorder.</span></div>
            </div>
          </section>

          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Live Factory Status</h3>
                <p>Machine health, operating state and predictive signals</p>
              </div>
            </div>
            <div class="machine-list machine-list-grid">
              ${machines.slice(0, 6).map(machineCard).join('')}
            </div>
          </section>

          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Digital Twin Preview</h3>
                <p>Interactive 2D factory layout</p>
              </div>
              <span class="glass-tag">Click a machine</span>
            </div>
            <div class="twin-preview">
              <div class="twin-map compact">
                ${twinNodes
                  .map((node) => {
                    const machineData = machines.find((item) => item.id === node.id) || machines[0];
                    return `
                      <button class="twin-node ${machineStatusTone(machineData)} ${machineData.id === machine.id ? 'selected' : ''}" data-machine-id="${machineData.id}" style="--x:${node.x}%; --y:${node.y}%">
                        <span>${node.label}</span>
                        <small>${machineData.status}</small>
                      </button>`;
                  })
                  .join('')}
                <div class="twin-aisle twin-aisle-a"></div>
                <div class="twin-aisle twin-aisle-b"></div>
              </div>
              ${machineDiagnostics(machine)}
            </div>
          </section>
        </div>

        <div class="stack">
          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Risk Center</h3>
                <p>Alerts that require attention now</p>
              </div>
            </div>
            <div class="alert-list">
              ${alerts.map(alertCard).join('')}
            </div>
          </section>

          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Maintenance Radar</h3>
                <p>Failure probability and task priority</p>
              </div>
            </div>
            <div class="maintenance-radar">
              ${machines
                .map((machineItem) => `
                  <div class="radar-row">
                    <div>
                      <strong>${machineItem.id}</strong>
                      <span>${machineItem.name}</span>
                    </div>
                    <div class="radar-bar"><span style="width:${machineItem.failure}%"></span></div>
                    <strong>${machineItem.failure}%</strong>
                  </div>`)
                .join('')}
            </div>
          </section>

          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Operational Timeline</h3>
                <p>Realtime-style activity log</p>
              </div>
            </div>
            <div class="timeline">
              <div class="timeline-item"><strong>08:12</strong><p>Shift 1 started with 99.1% line readiness.</p></div>
              <div class="timeline-item"><strong>09:40</strong><p>AI flagged lubrication for MX-06 and auto-created a maintenance draft.</p></div>
              <div class="timeline-item"><strong>11:05</strong><p>Order batch ORD-1842 entered the dispatch queue.</p></div>
              <div class="timeline-item"><strong>12:30</strong><p>Energy peak detected and load balancing recommendations were issued.</p></div>
            </div>
          </section>
        </div>
      </div>

      <div class="chart-grid dashboard-charts">
        <section class="panel-card chart-card">
          <div class="section-head">
            <div>
              <h3>Production Trend</h3>
              <p>Hourly throughput against the target line</p>
            </div>
          </div>
          <canvas id="dashboardProductionChart"></canvas>
        </section>
        <section class="panel-card chart-card">
          <div class="section-head">
            <div>
              <h3>Machine Health Mix</h3>
              <p>Running, warning and critical distribution</p>
            </div>
          </div>
          <canvas id="dashboardHealthChart"></canvas>
        </section>
        <section class="panel-card chart-card">
          <div class="section-head">
            <div>
              <h3>Energy Load</h3>
              <p>Peak demand and off-peak optimization</p>
            </div>
          </div>
          <canvas id="dashboardEnergyChart"></canvas>
        </section>
        <section class="panel-card chart-card">
          <div class="section-head">
            <div>
              <h3>Downtime Drivers</h3>
              <p>Root causes over the last 7 days</p>
            </div>
          </div>
          <canvas id="dashboardDowntimeChart"></canvas>
        </section>
      </div>
    </section>`);
}

function renderCopilotPage() {
  const analysis = getAiAnalysis(state.lastPrompt);
  return modulePage(
    'AI Copilot',
    'Conversational AI that explains trends, predicts failures, recommends actions and supports factory decisions with risk-aware insights.',
    `
      <div class="module-grid copilot-grid">
        <section class="panel-card copilot-console">
          <div class="section-head">
            <div>
              <h3>Conversation</h3>
              <p>Ask natural-language questions about operations</p>
            </div>
          </div>
          <div class="message-list" id="aiMessages">
            ${state.copilotMessages.map((message) => `<div class="message ${message.role}"><strong>${message.role === 'assistant' ? 'Yantra OS Copilot' : 'You'}</strong><div>${escapeHtml(message.text)}</div></div>`).join('')}
          </div>
          <div class="prompt-row">
            <input class="input prompt-input" id="aiPrompt" type="text" placeholder="Ask Yantra OS anything about your factory..." />
            <button class="primary-btn" id="sendPrompt" type="button">Ask AI</button>
          </div>
          <div class="prompt-tags">
            ${prompts.map((prompt) => `<button class="tag quick-action" data-question="${prompt}">${prompt}</button>`).join('')}
          </div>
        </section>

        <aside class="stack">
          <section class="panel-card insight-card">
            <div class="section-head">
              <div>
                <h3>Decision Support</h3>
                <p>Risk score and recommended actions</p>
              </div>
            </div>
            <div class="risk-ring">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="46" class="ring-track"></circle>
                <circle cx="60" cy="60" r="46" class="ring-fill" style="stroke-dasharray:${Math.round(289 * analysis.risk / 100)} 289"></circle>
              </svg>
              <div><strong>${analysis.risk}%</strong><span>Risk score</span></div>
            </div>
            <p class="insight-copy">${analysis.summary}</p>
            <div class="recommendation-list">
              ${analysis.actions.map((action) => `<div>• ${action}</div>`).join('')}
            </div>
          </section>

          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Copilot Capabilities</h3>
                <p>What the assistant can do</p>
              </div>
            </div>
            <div class="capability-list">
              <div class="capability"><strong>Predict failures</strong><span>Spot risky machines before breakdowns happen.</span></div>
              <div class="capability"><strong>Explain trends</strong><span>Translate charts into simple operational language.</span></div>
              <div class="capability"><strong>Generate reports</strong><span>Draft production, energy, maintenance and AI summaries.</span></div>
            </div>
          </section>
        </aside>
      </div>
      <div class="panel-card chart-card wide-chart">
        <div class="section-head">
          <div>
            <h3>AI Confidence Trend</h3>
            <p>Response signal for the current prompt</p>
          </div>
        </div>
        <canvas id="copilotTrendChart"></canvas>
      </div>
    `,
    ''
  );
}

function renderDigitalTwinPage() {
  const machine = selectedMachine();
  return modulePage(
    'Digital Twin',
    'An interactive 2D factory layout where machine color, risk and diagnostics update in real time.',
    `
      <div class="module-grid twin-page-grid">
        <section class="panel-card">
          <div class="section-head">
            <div>
              <h3>Factory Layout</h3>
              <p>Machine colors update from live status signals</p>
            </div>
            <span class="glass-tag">Healthy = green · Warning = yellow · Critical = red</span>
          </div>
          <div class="twin-map large">
            ${twinNodes
              .map((node) => {
                const machineData = machines.find((item) => item.id === node.id) || machines[0];
                return `
                  <button class="twin-node ${machineStatusTone(machineData)} ${machineData.id === machine.id ? 'selected' : ''}" data-machine-id="${machineData.id}" style="--x:${node.x}%; --y:${node.y}%">
                    <span>${node.label}</span>
                    <small>${node.line}</small>
                  </button>`;
              })
              .join('')}
            <div class="twin-aisle twin-aisle-a"></div>
            <div class="twin-aisle twin-aisle-b"></div>
            <div class="twin-hub">Factory core</div>
          </div>
        </section>
        <aside class="stack">
          ${machineDiagnostics(machine)}
          <section class="panel-card">
            <div class="section-head">
              <div>
                <h3>Line Overview</h3>
                <p>Operational state across production zones</p>
              </div>
            </div>
            <div class="line-overview">
              <div><strong>Line A</strong><span>98% uptime</span></div>
              <div><strong>Line B</strong><span>Idle transition</span></div>
              <div><strong>Line C</strong><span>Quality watch</span></div>
              <div><strong>Line D</strong><span>Maintenance risk</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderMachinesPage() {
  return modulePage(
    'Machines',
    'Fleet monitoring for every connected machine, with health scores, predictive failure probability and maintenance timing.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head">
            <div>
              <h3>Connected Machine Fleet</h3>
              <p>Tap an asset to inspect its diagnostics</p>
            </div>
          </div>
          <div class="machine-list two-up">
            ${machines.map(machineCard).join('')}
          </div>
        </section>
        <aside class="stack">
          ${machineDiagnostics(selectedMachine())}
          <section class="panel-card">
            <div class="section-head"><div><h3>Health Rank</h3><p>AI prioritization for service</p></div></div>
            <div class="maintenance-radar compact">
              ${machines
                .slice()
                .sort((a, b) => b.health - a.health)
                .map((machineItem) => `
                  <div class="radar-row">
                    <div><strong>${machineItem.id}</strong><span>${machineItem.name}</span></div>
                    <div class="radar-bar"><span style="width:${machineItem.health}%"></span></div>
                    <strong>${machineItem.health}%</strong>
                  </div>`)
                .join('')}
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderProductionPage() {
  return modulePage(
    'Production',
    'Track hourly output, shift performance, bottlenecks, utilization and forecasted throughput.',
    `
      <div class="chart-grid">
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Hourly Production</h3><p>Actual output against target</p></div></div><canvas id="productionChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Shift Performance</h3><p>Morning, afternoon and night comparisons</p></div></div><canvas id="shiftChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Machine Efficiency</h3><p>Asset-level performance spread</p></div></div><canvas id="machineEfficiencyChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Production Forecast</h3><p>Projected output for next week</p></div></div><canvas id="productionForecastChart"></canvas></section>
      </div>
      <div class="module-grid two-column-grid bottom-gap">
        <section class="panel-card">
          <div class="section-head"><div><h3>Bottlenecks</h3><p>Main sources of throughput loss</p></div></div>
          <div class="capability-list">
            <div class="capability"><strong>Changeover delays</strong><span>Line D spent 42 minutes switching formats.</span></div>
            <div class="capability"><strong>Packaging fault</strong><span>MX-04 caused a temporary queue at the end of the line.</span></div>
            <div class="capability"><strong>Material waiting</strong><span>Raw material staging can be synchronized tighter to the forecast.</span></div>
          </div>
        </section>
        <section class="panel-card">
          <div class="section-head"><div><h3>Executive Summary</h3><p>What production leadership should know</p></div></div>
          <div class="brief-grid narrow">
            <div class="brief-item good"><strong>Output is stable</strong><span>Production is 6.2% above yesterday.</span></div>
            <div class="brief-item warn"><strong>One asset is slowing flow</strong><span>MX-04 fault event reduced throughput.</span></div>
            <div class="brief-item info"><strong>Forecast is strong</strong><span>Next week is projected to keep the current trajectory.</span></div>
            <div class="brief-item alert"><strong>Optimization opportunity</strong><span>Re-sequence jobs to lower changeover loss.</span></div>
          </div>
        </section>
      </div>
    `
  );
}

function renderMaintenancePage() {
  return modulePage(
    'Predictive Maintenance',
    'AI continuously analyzes sensors, calculates failure probability, estimates remaining useful life and auto-generates tickets.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head">
            <div>
              <h3>Failure Probability</h3>
              <p>Risk-ranked maintenance queue</p>
            </div>
          </div>
          <div class="maintenance-queue">
            ${machines
              .slice()
              .sort((a, b) => b.failure - a.failure)
              .map((machineItem) => `
                <div class="queue-row">
                  <div>
                    <strong>${machineItem.id}</strong>
                    <span>${machineItem.name}</span>
                  </div>
                  <div class="queue-bar"><span style="width:${machineItem.failure}%"></span></div>
                  <strong>${machineItem.failure}%</strong>
                </div>`)
              .join('')}
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card">
            <div class="section-head"><div><h3>Recommended Actions</h3><p>Maintenance plan for the next 72 hours</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>MX-07 Press Line</strong><span>Urgent inspection due within 24 hours.</span></div>
              <div class="capability"><strong>MX-04 Packaging Robot</strong><span>Replace cooling module and re-run calibration.</span></div>
              <div class="capability"><strong>MX-06 Compressor</strong><span>Lubrication and pressure review during off-peak window.</span></div>
            </div>
          </section>
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Risk Trend</h3><p>Failure window over the week</p></div></div>
            <canvas id="maintenanceRiskChart"></canvas>
          </section>
        </aside>
      </div>
    `
  );
}

function renderQualityPage() {
  return modulePage(
    'Quality Inspection',
    'AI vision detects surface defects, cracks, misalignment, wrong assembly and dimension mismatch.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Defect Intelligence</h3><p>Rejected products and classification trends</p></div></div>
          <div class="quality-gallery">
            <div class="quality-shot defect-a"><span>Surface defect</span></div>
            <div class="quality-shot defect-b"><span>Misalignment</span></div>
            <div class="quality-shot defect-c"><span>Crack detected</span></div>
            <div class="quality-shot defect-d"><span>Assembly mismatch</span></div>
          </div>
          <div class="brief-grid narrow">
            <div class="brief-item warn"><strong>Misalignment</strong><span>37% of rejects on Line C</span></div>
            <div class="brief-item alert"><strong>Surface defects</strong><span>25% of rejects on the paint stage</span></div>
            <div class="brief-item info"><strong>Dimension mismatch</strong><span>Recent spike in one batch</span></div>
            <div class="brief-item good"><strong>Recovered quality</strong><span>Vision threshold tuning already reduced rejections</span></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Defect Mix</h3><p>AI vision classification chart</p></div></div>
            <canvas id="qualityDefectChart"></canvas>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Inspector Notes</h3><p>Auto-generated recommendations</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Adjust camera threshold</strong><span>Improve precision on glossy surfaces.</span></div>
              <div class="capability"><strong>Check gripper alignment</strong><span>Review the robotic pick-and-place path.</span></div>
              <div class="capability"><strong>Quarantine suspect batch</strong><span>Keep the latest rejected batch out of shipping.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderInventoryPage() {
  return modulePage(
    'Inventory',
    'Monitor raw materials, finished goods, stock-out dates and AI shortage predictions.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Inventory Health</h3><p>Stock coverage and critical items</p></div></div>
          <div class="inventory-grid">
            <div class="inventory-card good"><strong>Raw Materials</strong><span>Healthy coverage for 9 days</span></div>
            <div class="inventory-card warn"><strong>Finished Goods</strong><span>Dispatch load is high this week</span></div>
            <div class="inventory-card alert"><strong>Low Stock</strong><span>Steel sheets and packaging tape</span></div>
            <div class="inventory-card critical"><strong>Critical Inventory</strong><span>2 items near stock-out threshold</span></div>
          </div>
          <table class="data-table compact-table">
            <thead><tr><th>Item</th><th>Stock</th><th>Status</th><th>Stock Out</th></tr></thead>
            <tbody>
              <tr><td>Steel Sheets</td><td>Low</td><td><span class="status-pill warning">Reorder</span></td><td>5 days</td></tr>
              <tr><td>Fasteners</td><td>Healthy</td><td><span class="status-pill running">Safe</span></td><td>18 days</td></tr>
              <tr><td>Packaging Tape</td><td>Low</td><td><span class="status-pill warning">Reorder</span></td><td>4 days</td></tr>
              <tr><td>Lubricant Oil</td><td>Healthy</td><td><span class="status-pill running">Safe</span></td><td>21 days</td></tr>
            </tbody>
          </table>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Shortage Forecast</h3><p>AI predicted inventory decline</p></div></div>
            <canvas id="inventoryForecastChart"></canvas>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Procurement Action</h3><p>What to do next</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Trigger reorder</strong><span>Create purchase requests for both low-stock items.</span></div>
              <div class="capability"><strong>Protect safety stock</strong><span>Reserve spare inventory for Line C.</span></div>
              <div class="capability"><strong>Sync forecast</strong><span>Link demand data to material planning.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderWarehousePage() {
  return modulePage(
    'Warehouse',
    'Visualize storage zones, loading docks, inbound flow and outbound readiness.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Warehouse Flow</h3><p>Dock operations and zone utilization</p></div></div>
          <div class="warehouse-layout">
            <div class="warehouse-zone dock">Inbound Dock</div>
            <div class="warehouse-zone storage-a">Raw Storage A</div>
            <div class="warehouse-zone storage-b">Raw Storage B</div>
            <div class="warehouse-zone staging">Staging</div>
            <div class="warehouse-zone finished">Finished Goods</div>
            <div class="warehouse-zone outbound">Outbound Dock</div>
          </div>
          <div class="brief-grid narrow">
            <div class="brief-item good"><strong>Inbound trucks</strong><span>2 scheduled before noon</span></div>
            <div class="brief-item warn"><strong>Packing area</strong><span>Busy during the current shift</span></div>
            <div class="brief-item info"><strong>Pickup readiness</strong><span>Outbound is on time</span></div>
            <div class="brief-item alert"><strong>Slow-moving stock</strong><span>Some material should be reclassified</span></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card">
            <div class="section-head"><div><h3>Dock Queue</h3><p>Live staging overview</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Truck 01</strong><span>Raw material inbound, ETA 20 minutes.</span></div>
              <div class="capability"><strong>Truck 02</strong><span>Finished goods pickup, ready for loading.</span></div>
              <div class="capability"><strong>Scanner sync</strong><span>Warehouse inventory synchronized every minute.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderOrdersPage() {
  return modulePage(
    'Orders',
    'Follow customer orders, dispatch timing and delivery probability.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Active Orders</h3><p>Manufacturing and dispatch pipeline</p></div></div>
          <div class="order-list">
            <div class="order-card"><strong>ORD-1842</strong><span>Automotive component order · Dispatch today 6:30 PM</span><em>96% on-time probability</em></div>
            <div class="order-card"><strong>ORD-1901</strong><span>Electrical assembly order · Ready tomorrow morning</span><em>94% on-time probability</em></div>
            <div class="order-card"><strong>ORD-1930</strong><span>Prototype batch · Engineering sign-off pending</span><em>98% on-time probability</em></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Delivery Forecast</h3><p>Probability of hitting the schedule</p></div></div>
            <canvas id="orderForecastChart"></canvas>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Dispatch Notes</h3><p>AI guidance for logistics</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Priority shipment</strong><span>Order ORD-1842 is on track to leave today.</span></div>
              <div class="capability"><strong>Batch sync</strong><span>Align packaging and shipping with production completion.</span></div>
              <div class="capability"><strong>Customer confidence</strong><span>Proactively update any late-order risk.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderSupplyChainPage() {
  return modulePage(
    'Supply Chain',
    'Supplier scorecards, lead times, risk signals and procurement visibility.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Supplier Performance</h3><p>Reliability and lead-time control</p></div></div>
          <div class="supplier-grid">
            <div class="supplier-card"><strong>Orion Metals</strong><span>Lead time 3 days · Score 97</span></div>
            <div class="supplier-card"><strong>Delta Packaging</strong><span>Lead time 4 days · Score 94</span></div>
            <div class="supplier-card"><strong>Apex Logistics</strong><span>Lead time 2 days · Score 95</span></div>
            <div class="supplier-card"><strong>Prime Electronics</strong><span>Lead time 5 days · Score 91</span></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Lead Time Trend</h3><p>Supplier cycle consistency</p></div></div>
            <canvas id="supplyChainChart"></canvas>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Risk Flags</h3><p>What AI is watching</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Material inflation</strong><span>Monitor price movement on steel and packaging.</span></div>
              <div class="capability"><strong>Transit delay</strong><span>Keep alternate carriers warm for urgent orders.</span></div>
              <div class="capability"><strong>Shortage prevention</strong><span>Link procurement to the production forecast.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderEnergyPage() {
  return modulePage(
    'Energy',
    'Track live electricity usage, machine-wise power draw and AI recommendations to cut cost.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Energy Overview</h3><p>Consumption, peak demand and savings</p></div></div>
          <div class="energy-metrics">
            <div class="energy-card"><strong>4.8 MWh</strong><span>Today's usage</span></div>
            <div class="energy-card"><strong>128 kW</strong><span>Peak demand</span></div>
            <div class="energy-card"><strong>₹2,350</strong><span>Monthly savings</span></div>
            <div class="energy-card"><strong>1.2 MWh</strong><span>Solar contribution</span></div>
          </div>
          <div class="recommendation-list energy-list">
            <div>• Turn off idle machines after the current batch</div>
            <div>• Shift non-urgent load outside the peak tariff window</div>
            <div>• Lower compressor cycling to reduce demand spikes</div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Load Profile</h3><p>Real-time usage trend</p></div></div>
            <canvas id="energyLoadChart"></canvas>
          </section>
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Energy Mix</h3><p>Grid vs solar contribution</p></div></div>
            <canvas id="energyMixChart"></canvas>
          </section>
        </aside>
      </div>
    `
  );
}

function renderWorkersPage() {
  return modulePage(
    'Workers',
    'Monitor roles, shifts, productivity and staffing balance across the factory floor.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Role Matrix</h3><p>Role-based access and floor assignments</p></div></div>
          <div class="role-grid">
            ${roles.map(([role, detail]) => `<div class="role-card"><strong>${role}</strong><span>${detail}</span></div>`).join('')}
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card chart-card">
            <div class="section-head"><div><h3>Shift Performance</h3><p>Labor output and attendance</p></div></div>
            <canvas id="workerShiftChart"></canvas>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Staffing Notes</h3><p>AI guidance for supervisors</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>Rebalance the shift</strong><span>Assign one operator to Line C during the fault window.</span></div>
              <div class="capability"><strong>Track attendance</strong><span>Attendance is synchronized with workstation login data.</span></div>
              <div class="capability"><strong>Skill coverage</strong><span>Operators are matched to the line competency grid.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderSafetyPage() {
  return modulePage(
    'Safety',
    'AI camera detections for helmets, restricted zones, smoke, fire and dangerous proximity events.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Camera Alerts</h3><p>Immediate safety events</p></div></div>
          <div class="alert-list safety-list">
            <div class="alert-card critical"><div class="alert-marker"></div><div><div class="alert-head"><strong>Helmet missing</strong><span>09:21</span></div><p>Operator entered the paint zone without PPE.</p></div></div>
            <div class="alert-card warning"><div class="alert-marker"></div><div><div class="alert-head"><strong>Restricted zone entry</strong><span>10:41</span></div><p>Worker crossed the red line near MX-04.</p></div></div>
            <div class="alert-card info"><div class="alert-marker"></div><div><div class="alert-head"><strong>Smoke detected</strong><span>11:10</span></div><p>Vision system detected unusual haze near utility bay.</p></div></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card">
            <div class="section-head"><div><h3>Safety Score</h3><p>Live operational safety posture</p></div></div>
            <div class="safety-score"><strong>99.2%</strong><span>Safety compliance score</span></div>
            <div class="brief-grid narrow">
              <div class="brief-item good"><strong>No incident escalation</strong><span>All major incidents handled.</span></div>
              <div class="brief-item warn"><strong>One zone warning</strong><span>Restricted zone access needs review.</span></div>
              <div class="brief-item info"><strong>Training coverage</strong><span>Weekly safety induction is complete.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderAnalyticsPage() {
  return modulePage(
    'Analytics',
    'Interactive charts for OEE, output, energy, quality, cost savings and forecasted throughput.',
    `
      <div class="chart-grid analytics-grid">
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Factory Performance</h3><p>Six-month improvement profile</p></div></div><canvas id="analyticsPerformanceChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Quality Trend</h3><p>Reject rate and process stability</p></div></div><canvas id="analyticsQualityChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Energy Savings</h3><p>Monthly optimization impact</p></div></div><canvas id="analyticsSavingsChart"></canvas></section>
        <section class="panel-card chart-card"><div class="section-head"><div><h3>Next Week Forecast</h3><p>Projected production capacity</p></div></div><canvas id="analyticsForecastChart"></canvas></section>
      </div>
    `
  );
}

function renderReportsPage() {
  return modulePage(
    'Reports',
    'Generate downloadable daily, weekly and monthly reports, including AI executive summaries.',
    `
      <div class="report-grid">
        ${reportCards.map((card) => `
          <article class="report-card">
            <div class="report-head"><strong>${card.title}</strong><span>Ready now</span></div>
            <p>${card.text}</p>
            <div class="report-actions">
              <button class="secondary-btn">PDF</button>
              <button class="secondary-btn">Excel</button>
              <button class="ghost-btn">AI summary</button>
            </div>
          </article>`).join('')}
      </div>
    `
  );
}

function renderCompliancePage() {
  return modulePage(
    'Compliance',
    'Track licenses, audits, labour rules, deployment posture and role-based access control.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Compliance Checklist</h3><p>Factory-level assurance and audit readiness</p></div></div>
          <div class="capability-list">
            <div class="capability"><strong>GST Filing</strong><span>Next filing window opens in 11 days.</span></div>
            <div class="capability"><strong>Fire Safety Certificate</strong><span>Renewal due in 19 days.</span></div>
            <div class="capability"><strong>Labour Register</strong><span>Attendance records synced for this week.</span></div>
            <div class="capability"><strong>Pollution Control</strong><span>Emission logs are within permissible range.</span></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card">
            <div class="section-head"><div><h3>Role-based Access</h3><p>Permissions across the operating system</p></div></div>
            <div class="role-grid compact-roles">
              ${roles.map(([role, detail]) => `<div class="role-card"><strong>${role}</strong><span>${detail}</span></div>`).join('')}
            </div>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>Deployment Options</h3><p>Cloud SaaS and On-Premise support</p></div></div>
            <div class="deployment-grid">
              ${deploymentOptions.map(([title, text]) => `<div class="deployment-card"><strong>${title}</strong><span>${text}</span></div>`).join('')}
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function renderSettingsPage() {
  return modulePage(
    'Settings',
    'Manage factory profile, users, notifications, appearance, security and integrations.',
    `
      <div class="module-grid two-column-grid">
        <section class="panel-card">
          <div class="section-head"><div><h3>Configuration</h3><p>System-wide preferences</p></div></div>
          <div class="settings-grid">
            <div class="setting-card"><strong>Factory Information</strong><span>Update plant profile, shifts and business metadata.</span></div>
            <div class="setting-card"><strong>User Management</strong><span>Add team members and assign module permissions.</span></div>
            <div class="setting-card"><strong>Notifications</strong><span>Configure alerts for downtime, stock and compliance.</span></div>
            <div class="setting-card"><strong>Security</strong><span>Passwords, sessions and access levels.</span></div>
            <div class="setting-card"><strong>Appearance</strong><span>Theme switching with dark premium mode enabled.</span></div>
            <div class="setting-card"><strong>Integrations</strong><span>IoT, ERP, SCADA and accounting links.</span></div>
          </div>
        </section>
        <aside class="stack">
          <section class="panel-card">
            <div class="section-head"><div><h3>Deployment Readiness</h3><p>Built for cloud or local factory hosting</p></div></div>
            <div class="deployment-grid">
              ${deploymentOptions.map(([title, text]) => `<div class="deployment-card"><strong>${title}</strong><span>${text}</span></div>`).join('')}
            </div>
          </section>
          <section class="panel-card">
            <div class="section-head"><div><h3>About Yantra OS</h3><p>Future operating system for manufacturing intelligence</p></div></div>
            <div class="capability-list">
              <div class="capability"><strong>AI Copilot</strong><span>Natural language control and decision support.</span></div>
              <div class="capability"><strong>Digital Twin</strong><span>Visual factory layout with machine-level diagnostics.</span></div>
              <div class="capability"><strong>Enterprise-grade UX</strong><span>Dark, modern and built for Fortune 500 manufacturing teams.</span></div>
            </div>
          </section>
        </aside>
      </div>
    `
  );
}

function getAiAnalysis(question) {
  const query = normalize(question);
  return aiResponses[query] || {
    summary: 'I am monitoring production, maintenance, inventory, quality, safety and energy together. Ask a factory question and I will turn it into an action plan.',
    risk: 25,
    actions: ['Ask about machine health, production or energy', 'Use global search to jump to a module', 'Review the dashboard for real-time alerts'],
    chart: [30, 32, 31, 33, 34, 36, 35],
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSearchResults(query) {
  const box = document.getElementById('searchResults');
  if (!box) return;
  const search = normalize(query);
  if (!search) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }

  const matches = searchIndex.filter((item) => normalize(item.label).includes(search) || normalize(item.description).includes(search)).slice(0, 6);
  if (!matches.length) {
    box.hidden = false;
    box.innerHTML = `<div class="search-empty">No direct matches. Try machine names, orders, inventory items or safety events.</div>`;
    return;
  }

  box.hidden = false;
  box.innerHTML = matches
    .map(
      (item) => `
        <button class="search-result" data-search-page="${item.page}" data-machine-id="${item.machineId || ''}">
          <strong>${item.label}</strong>
          <span>${item.description}</span>
        </button>`
    )
    .join('');
}

function navigateToPage(page) {
  state.page = page;
  renderApp();
}

function handleQuestion(question) {
  const prompt = question || 'Why did production decrease today?';
  state.lastPrompt = prompt;
  state.page = 'copilot';
  state.copilotMessages.push({ role: 'user', text: prompt });

  const analysis = getAiAnalysis(prompt);
  const assistantText = `${analysis.summary}\n\nRisk score: ${analysis.risk}%. Recommended actions: ${analysis.actions.join(' | ')}`;
  state.copilotMessages.push({ role: 'assistant', text: assistantText });
  renderApp();
  showNotification('Yantra OS Copilot', analysis.summary);
}

function showNotification(title, detail) {
  const box = document.getElementById('notification');
  if (!box) return;
  box.innerHTML = `<strong>${escapeHtml(title)}</strong><div>${escapeHtml(detail)}</div>`;
  box.classList.add('show');
  window.clearTimeout(showNotification.timer);
  showNotification.timer = window.setTimeout(() => box.classList.remove('show'), 2800);
}

function animateCounter(element, target) {
  const duration = 900;
  const start = performance.now();
  const display = element.dataset.display || element.textContent;
  const numericMatch = display.match(/[₹]?[0-9][0-9,]*(?:\.[0-9]+)?/);
  const numericText = numericMatch?.[0] || String(target);
  const suffix = display.slice(display.indexOf(numericText) + numericText.length).trim();
  const isCurrency = numericText.startsWith('₹');
  const hasDecimal = numericText.includes('.');

  function formatValue(value) {
    if (isCurrency) return `₹${Math.round(value).toLocaleString()}`;
    if (hasDecimal) return value.toFixed(1).replace(/\.0$/, '');
    return Math.round(value).toLocaleString();
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;
    if (suffix === '%') {
      element.textContent = `${Math.round(value)}%`;
    } else {
      element.textContent = `${formatValue(value)}${suffix ? ` ${suffix}` : ''}`;
    }
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function createLineChart(id, labels, data, color, filled = true) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: color,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.42,
          fill: filled,
          backgroundColor: filled ? `${color}22` : 'transparent',
          pointBackgroundColor: '#07131f',
          pointBorderColor: color,
        },
      ],
    },
    options: chartOptions(),
  });
}

function createBarChart(id, labels, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, index) => [color, '#57d7ff', '#66e8b4', '#ffb04d', '#2f74ff'][index % 5]),
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    },
    options: chartOptions({ yBeginAtZero: true }),
  });
}

function createDoughnutChart(id, labels, data, colors) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a8bfd7',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(4, 12, 22, 0.96)',
          padding: 12,
          titleColor: '#fff',
          bodyColor: '#fff',
        },
      },
    },
  });
}

function chartOptions({ yBeginAtZero = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(4, 12, 22, 0.96)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8ca4bc' },
      },
      y: {
        beginAtZero: yBeginAtZero,
        grid: { color: 'rgba(129, 151, 176, 0.12)' },
        ticks: { color: '#8ca4bc' },
      },
    },
  };
}

function destroyCharts() {
  Object.values(charts).forEach((chart) => chart?.destroy?.());
  Object.keys(charts).forEach((key) => delete charts[key]);
}

function initCharts(page) {
  destroyCharts();

  if (page === 'dashboard') {
    createLineChart('dashboardProductionChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [1420, 1460, 1485, 1510, 1535, 1540, 1560], '#57d7ff');
    createDoughnutChart('dashboardHealthChart', ['Running', 'Warning', 'Critical'], [71, 19, 10], ['#66e8b4', '#ffb04d', '#ff6b8a']);
    createLineChart('dashboardEnergyChart', ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'], [3.4, 3.8, 4.8, 4.5, 4.9, 4.2], '#2f74ff', false);
    createBarChart('dashboardDowntimeChart', ['Setup', 'Breakdown', 'Changeover', 'Material'], [22, 34, 18, 11], '#57d7ff');
  }

  if (page === 'copilot') {
    const analysis = getAiAnalysis(state.lastPrompt);
    createLineChart('copilotTrendChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], analysis.chart, '#57d7ff');
  }

  if (page === 'production') {
    createLineChart('productionChart', ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'], [180, 214, 230, 225, 238, 244, 250], '#57d7ff');
    createBarChart('shiftChart', ['Morning', 'Afternoon', 'Night'], [92, 87, 83], '#2f74ff');
    createBarChart('machineEfficiencyChart', ['MX-01', 'MX-02', 'MX-03', 'MX-04', 'MX-05'], [97, 94, 88, 52, 91], '#66e8b4');
    createLineChart('productionForecastChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [1520, 1530, 1540, 1555, 1568, 1572, 1588], '#ffb04d');
  }

  if (page === 'maintenance') {
    createBarChart('maintenanceRiskChart', ['MX-07', 'MX-04', 'MX-06', 'MX-03', 'MX-08'], [86, 81, 28, 14, 6], '#ff6b8a');
  }

  if (page === 'quality') {
    createDoughnutChart('qualityDefectChart', ['Misalignment', 'Surface', 'Crack', 'Assembly'], [37, 25, 18, 20], ['#ff6b8a', '#ffb04d', '#57d7ff', '#66e8b4']);
  }

  if (page === 'inventory') {
    createLineChart('inventoryForecastChart', ['Today', '2d', '3d', '4d', '5d', '6d', '7d'], [92, 84, 76, 69, 61, 56, 51], '#57d7ff');
  }

  if (page === 'orders') {
    createLineChart('orderForecastChart', ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'], [96, 95, 97, 98, 99], '#66e8b4');
  }

  if (page === 'supply-chain') {
    createLineChart('supplyChainChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [6.2, 5.8, 5.4, 4.8, 4.4, 4.1], '#2f74ff', false);
  }

  if (page === 'energy') {
    createLineChart('energyLoadChart', ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'], [3.4, 4.0, 4.8, 4.5, 4.9, 4.2], '#57d7ff');
    createDoughnutChart('energyMixChart', ['Grid', 'Solar'], [80, 20], ['#2f74ff', '#66e8b4']);
  }

  if (page === 'workers') {
    createBarChart('workerShiftChart', ['Shift A', 'Shift B', 'Shift C'], [94, 89, 86], '#57d7ff');
  }

  if (page === 'analytics') {
    createLineChart('analyticsPerformanceChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [84, 86, 88, 91, 93, 96], '#57d7ff');
    createLineChart('analyticsQualityChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [4.1, 3.7, 3.2, 2.8, 2.4, 1.7], '#ff6b8a', false);
    createBarChart('analyticsSavingsChart', ['Energy', 'Downtime', 'Waste', 'Labor'], [32, 27, 18, 13], '#66e8b4');
    createLineChart('analyticsForecastChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [1540, 1548, 1559, 1566, 1574, 1580, 1592], '#ffb04d');
  }
}

function hydrateInteractions() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeBtn = document.getElementById('themeBtn');
  const searchInput = document.getElementById('globalSearch');
  const searchAction = document.getElementById('searchAction');
  const searchResults = document.getElementById('searchResults');
  const sendPrompt = document.getElementById('sendPrompt');
  const aiPrompt = document.getElementById('aiPrompt');

  menuBtn?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  logoutBtn?.addEventListener('click', () => {
    state.authenticated = false;
    state.page = 'dashboard';
    renderApp();
    showNotification('Signed out', 'You were returned to the login screen.');
  });

  themeBtn?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'midnight' : 'dark';
    renderApp();
    showNotification('Theme updated', state.theme === 'dark' ? 'Deep dark mode is active.' : 'Midnight mode is active.');
  });

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      navigateToPage(button.dataset.page);
    });
  });

  document.querySelectorAll('.quick-action').forEach((button) => {
    button.addEventListener('click', () => handleQuestion(button.dataset.question || button.textContent.trim()));
  });

  document.querySelectorAll('[data-machine-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedMachine = button.dataset.machineId || state.selectedMachine;
      if (state.page === 'dashboard' || state.page === 'twin' || state.page === 'machines') {
        renderApp();
      }
    });
  });

  if (searchInput) {
    searchInput.value = state.searchQuery;
    searchInput.addEventListener('input', (event) => {
      state.searchQuery = event.target.value;
      renderSearchResults(state.searchQuery);
    });
    searchInput.addEventListener('focus', () => renderSearchResults(state.searchQuery));
    searchInput.addEventListener('blur', () => {
      window.setTimeout(() => {
        const box = document.getElementById('searchResults');
        if (box && !box.matches(':hover')) {
          box.hidden = true;
        }
      }, 150);
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const match = searchIndex.find((item) => normalize(item.label).includes(normalize(state.searchQuery)));
        if (match) {
          if (match.machineId) state.selectedMachine = match.machineId;
          navigateToPage(match.page);
          return;
        }
        showNotification('Search', 'No direct match found. Try a machine, worker, order or inventory item.');
      }
    });
  }

  searchAction?.addEventListener('click', () => {
    const match = searchIndex.find((item) => normalize(item.label).includes(normalize(state.searchQuery)));
    if (match) {
      if (match.machineId) state.selectedMachine = match.machineId;
      navigateToPage(match.page);
    } else {
      showNotification('AI Search', 'No direct match found. Try a machine, worker, order or inventory item.');
    }
  });

  searchResults?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-search-page]');
    if (!button) return;
    const page = button.dataset.searchPage;
    const machineId = button.dataset.machineId;
    if (machineId) state.selectedMachine = machineId;
    state.searchQuery = '';
    state.page = page;
    renderApp();
  });

  sendPrompt?.addEventListener('click', () => handleQuestion(aiPrompt?.value || 'Why did production decrease today?'));
  aiPrompt?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleQuestion(aiPrompt.value || 'Why did production decrease today?');
    }
  });

  document.querySelectorAll('.counter').forEach((counter) => {
    const raw = Number(String(counter.dataset.target || '').replace(/,/g, ''));
    if (!Number.isNaN(raw) && raw !== 0) animateCounter(counter, raw);
  });

  renderSearchResults(state.searchQuery);
  initCharts(state.page);
  lucide?.createIcons?.();
}

function renderApp(afterRender) {
  document.documentElement.dataset.theme = state.theme;
  if (!state.authenticated) {
    renderLogin();
  } else {
    const pageRenderers = {
      dashboard: renderDashboardPage,
      copilot: renderCopilotPage,
      twin: renderDigitalTwinPage,
      machines: renderMachinesPage,
      production: renderProductionPage,
      maintenance: renderMaintenancePage,
      quality: renderQualityPage,
      inventory: renderInventoryPage,
      warehouse: renderWarehousePage,
      orders: renderOrdersPage,
      'supply-chain': renderSupplyChainPage,
      energy: renderEnergyPage,
      workers: renderWorkersPage,
      safety: renderSafetyPage,
      analytics: renderAnalyticsPage,
      reports: renderReportsPage,
      compliance: renderCompliancePage,
      settings: renderSettingsPage,
    };
    const pageRenderer = pageRenderers[state.page] || renderDashboardPage;
    app.innerHTML = pageRenderer();
  }

  requestAnimationFrame(() => {
    hydrateInteractions();
    if (typeof afterRender === 'function') afterRender();
  });
}

function setLoading() {
  app.innerHTML = `
    <div class="loading-overlay" id="loadingOverlay">
      <div class="loading-card glass-card">
        <div class="loading-ring"></div>
        <div class="brand-lockup center">
          ${svgBrand()}
          <div class="brand-stack">
            <div class="brand-name">Yantra<span>OS</span></div>
            <div class="brand-tag">Initializing factory intelligence</div>
          </div>
        </div>
        <h2>Loading Yantra OS</h2>
        <p>Connecting AI copilots, charts, machine diagnostics and manufacturing modules.</p>
      </div>
    </div>`;

  window.setTimeout(() => {
    state.loadingDone = true;
    renderApp();
  }, 850);
}

window.addEventListener('resize', () => {
  if (state.authenticated) {
    initCharts(state.page);
  }
});

if (favicon) {
  favicon.href = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2357d7ff'/%3E%3Cstop offset='100%25' stop-color='%232f74ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' rx='28' fill='%2307131f'/%3E%3Cpath d='M24 31h17l19 27 19-27h17L67 69v22H53V69L24 31Z' fill='url(%23g)'/%3E%3Cpath d='M80 32h14c8 0 14 6 14 14v28c0 8-6 14-14 14H80V72h11c2 0 4-2 4-4V52c0-2-2-4-4-4H80V32Z' fill='%238ff7ff'/%3E%3C/svg%3E`;
}

setLoading();
