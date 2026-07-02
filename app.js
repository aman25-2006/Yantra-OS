const app = document.getElementById('app');
const favicon = document.getElementById('favicon');

const state = {
  authenticated: false,
  page: 'dashboard',
  theme: 'light',
  typedQuestions: [],
  loadingDone: false,
};

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'copilot', label: 'AI Copilot', icon: 'sparkles' },
  { id: 'machines', label: 'Machines', icon: 'cpu' },
  { id: 'production', label: 'Production', icon: 'factory' },
  { id: 'energy', label: 'Energy', icon: 'bolt' },
  { id: 'maintenance', label: 'Maintenance', icon: 'wrench' },
  { id: 'inventory', label: 'Inventory', icon: 'boxes' },
  { id: 'orders', label: 'Orders', icon: 'package' },
  { id: 'reports', label: 'Reports', icon: 'file-text' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-column' },
  { id: 'compliance', label: 'Compliance', icon: 'shield-check' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'help', label: 'Help Center', icon: 'life-buoy' },
];

const machineRows = [
  ['M-01', 'CNC Cutter', 'Running', '98%', 'Normal'],
  ['M-02', 'Injection Molder', 'Maintenance', '74%', 'Bearing check due'],
  ['M-03', 'Boiler Unit', 'Idle', '61%', 'Awaiting batch'],
  ['M-04', 'Packaging Line', 'Fault', '52%', 'Overheat alert'],
  ['M-05', 'Laser Machine', 'Running', '95%', 'Stable'],
  ['M-06', 'Air Compressor', 'Running', '88%', 'Energy optimized'],
  ['M-07', 'Press Machine', 'Maintenance', '69%', '72 hours left'],
];

const alertItems = [
  { title: 'Machine vibration exceeded threshold.', detail: 'M-07 shows a 14% rise in vibration above the baseline. Inspect coupling and bearings.', type: 'warning' },
  { title: 'Boiler temperature is high.', detail: 'The boiler temperature has crossed the preferred operating band for 18 minutes.', type: 'danger' },
  { title: 'Inventory below minimum level.', detail: 'Steel sheets and packaging tape need replenishment before the next shift.', type: 'warning' },
  { title: 'Production line stopped.', detail: 'Line 2 paused for a 12-minute buffer change. No delivery impact expected yet.', type: 'danger' },
  { title: 'Maintenance overdue.', detail: 'Lubrication cycle for M-02 was missed by one shift. Auto-created task queued.', type: 'warning' },
];

const aiAnswers = {
  default: 'I am tracking production, machine health, energy, inventory and orders in real time. Ask about any factory metric and I will turn it into an action plan.',
  'Which machine needs maintenance?': 'Machine M-07 is the highest priority. Vibration and temperature drift indicate maintenance should be scheduled within 72 hours to avoid an unplanned stop.',
  'Generate today\'s report.': 'Today\'s report is ready. Production is on target, energy usage is up by 4%, and one critical maintenance task has been flagged for action.',
  'Why did energy usage increase?': 'Energy usage increased mainly because the press line ran 32 minutes longer than planned and the compressor cycled more frequently during peak load.',
  'Predict tomorrow\'s production.': 'Based on current throughput and order flow, tomorrow\'s output is projected at 1,620 units, with a possible 2% swing depending on raw material availability.',
  'Show inventory status.': 'Steel sheets, fasteners and packaging tape are below the preferred threshold. All other critical items are within safe limits.',
  'Optimize factory efficiency': 'The best near-term actions are to shift non-urgent loads outside peak hours, schedule M-07 maintenance, and reorder low inventory before the next production cycle.',
};

const reportCards = [
  ['Production Report', '1,540 units completed today, with 96.4% order alignment and no major line stoppage.'],
  ['Maintenance Report', '2 preventive jobs completed, 1 predictive alert active, and 94% equipment readiness.'],
  ['Energy Report', 'Peak usage dropped 6% after load balancing, saving an estimated ₹2,350 monthly.'],
  ['Inventory Report', '6 raw materials at healthy levels; steel sheets and packaging tape need replenishment.'],
  ['Compliance Report', 'All statutory licenses valid, with fire safety renewal due in 19 days.'],
  ['Financial Summary', 'Monthly operational efficiency improved by 8.2%, driven by lower downtime and energy control.'],
];

const helpTopics = [
  ['Getting Started', 'Learn how to connect machines, import samples and switch between factory modules.'],
  ['AI Copilot', 'Ask natural-language questions about production, downtime, maintenance and energy.'],
  ['Integrations', 'Designed to connect future IoT feeds, ERP exports and FastAPI dashboards without redesign.'],
];

const content = {
  dashboard: renderDashboardPage,
  copilot: renderCopilotPage,
  machines: () => renderGenericPage('Machines', 'Monitor machine status, running hours, vibration, temperature and maintenance readiness in one place.', renderMachinesContent()),
  production: () => renderGenericPage('Production', 'Track output, efficiency, downtime and line performance using live-style operational cards.', renderProductionContent()),
  energy: () => renderGenericPage('Energy', 'See electricity consumption, peak demand, solar generation and cost-saving opportunities.', renderEnergyContent()),
  maintenance: () => renderGenericPage('Maintenance', 'Prioritize preventive actions, risk scores and estimated time to failure.', renderMaintenanceContent()),
  inventory: () => renderGenericPage('Inventory', 'Watch stock levels, supplier coverage and replenishment risk before a line goes idle.', renderInventoryContent()),
  orders: () => renderGenericPage('Orders', 'Follow active orders, dispatch timing and delivery predictions.', renderOrdersContent()),
  reports: renderReportsPage,
  analytics: renderAnalyticsPage,
  compliance: () => renderGenericPage('Compliance', 'Manage licenses, audits, labour requirements and renewal reminders with one view.', renderComplianceContent()),
  settings: renderSettingsPage,
  help: renderHelpPage,
};

const dashboardCharts = {};
const analyticsCharts = {};

function svgBrand() {
  return `
    <svg class="brand-mark" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="120" height="120" rx="24" fill="white" opacity="0"/>
      <path d="M28 34h20l12 26 12-26h20L67 70v22H53V70L28 34Z" fill="#0d3b66"/>
      <path d="M78 34h16c8 0 14 6 14 14v24c0 8-6 14-14 14H78V72h15c2 0 4-2 4-4V52c0-2-2-4-4-4H78V34Z" fill="#ff8f1f"/>
      <path d="M30 92h60" stroke="#0d3b66" stroke-width="5" stroke-linecap="round"/>
      <path d="M56 16v25M48 26v15M64 22v19M72 26v15M80 31v11" stroke="#1f8ad2" stroke-width="4" stroke-linecap="round"/>
      <circle cx="56" cy="16" r="4" fill="#1f8ad2"/>
      <circle cx="48" cy="26" r="4" fill="#1f8ad2"/>
      <circle cx="64" cy="22" r="4" fill="#1f8ad2"/>
      <circle cx="72" cy="26" r="4" fill="#1f8ad2"/>
      <circle cx="80" cy="31" r="4" fill="#1f8ad2"/>
    </svg>`;
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-screen">
      <div class="login-visual">
        <div class="login-visual-copy">
          <div class="brand-lockup">
            ${svgBrand()}
            <div class="brand-name">Yantra<span>OS</span></div>
          </div>
          <h1>The AI Operating System for Smart Manufacturing</h1>
          <p>Built for MSMEs that want enterprise-grade manufacturing intelligence without enterprise complexity. YantraOS unifies production, energy, maintenance, inventory and AI decision support inside one polished command center.</p>
        </div>
        <div class="login-stats">
          <div class="stat-chip"><strong>94%</strong><span>Factory health visibility</span></div>
          <div class="stat-chip"><strong>₹2,350</strong><span>Estimated monthly savings</span></div>
          <div class="stat-chip"><strong>72 hrs</strong><span>Maintenance lead time</span></div>
        </div>
      </div>
      <div class="login-panel">
        <div class="login-card">
          <div class="eyebrow"><i data-lucide="shield-check" class="nav-icon"></i> Secure Enterprise Access</div>
          <h2>Welcome to YantraOS</h2>
          <p>The AI Operating System for Smart Manufacturing</p>
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input class="form-field" id="email" type="email" placeholder="factory.owner@company.com" value="owner@yantraos.com" />
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input class="form-field" id="password" type="password" placeholder="Enter password" value="yantra123" />
            </div>
            <div class="form-row">
              <label class="checkbox"><input type="checkbox" checked /> Remember Me</label>
              <a class="text-link" href="#">Forgot Password?</a>
            </div>
            <button class="primary-btn" type="submit">Sign In</button>
          </form>
          <div class="login-footer">
            <span>Demo mode enabled</span>
            <span>MSME Hackathon Prototype</span>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.authenticated = true;
    renderApp();
    showNotification('Signed in to YantraOS', 'Factory intelligence dashboard is ready.');
  });
}

function renderShell(contentHtml) {
  return `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-top">
          <div class="brand-lockup">
            ${svgBrand()}
            <div class="brand-name">Yantra<span>OS</span><small>The AI OS for Smart Manufacturing</small></div>
          </div>
        </div>
        <nav class="nav-group" aria-label="Primary navigation">
          ${sidebarItems
            .map(
              (item) => `
                <button class="nav-link ${state.page === item.id ? 'active' : ''}" data-page="${item.id}">
                  <span class="nav-main"><i data-lucide="${item.icon}" class="nav-icon"></i><span>${item.label}</span></span>
                  <i data-lucide="chevron-right" class="nav-icon chev"></i>
                </button>`
            )
            .join('')}
        </nav>
        <div class="sidebar-bottom">
          <div class="profile-card">
            <img class="avatar" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="Factory profile" />
            <div><strong>Factory Profile</strong><span>Shree Metal Works</span></div>
          </div>
          <div class="profile-card">
            <img class="avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="User profile" />
            <div><strong>User Profile</strong><span>Aman, Factory Owner</span></div>
          </div>
          <button class="logout-btn" id="logoutBtn">Logout</button>
        </div>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <button class="icon-btn" id="menuBtn" aria-label="Open navigation"><i data-lucide="menu"></i></button>
          <div class="topbar-search">
            <i data-lucide="search"></i>
            <input type="search" placeholder="Search machines, reports, alerts, orders" />
          </div>
          <div class="topbar-actions">
            <button class="icon-btn" aria-label="Notifications"><i data-lucide="bell"></i><span class="badge-dot"></span></button>
            <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"><i data-lucide="sun-moon"></i></button>
            <button class="icon-btn" aria-label="Settings quick access"><i data-lucide="settings-2"></i></button>
            <img class="avatar-pill" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80" alt="Logged in user" />
          </div>
        </header>
        ${contentHtml}
      </div>
    </div>
    <div class="notification" id="notification" role="status" aria-live="polite"></div>
  `;
}

function renderDashboardPage() {
  return renderShell(`
    <section class="page active" data-page-content="dashboard">
      <div class="hero">
        <div>
          <h1>Good Morning, Aman 👋</h1>
          <p>Welcome back to YantraOS. Your factory is healthy, production is on track, and the AI has already flagged the next best actions.</p>
        </div>
        <div class="hero-meta">
          <div class="health-pill"><span class="spark"></span> Factory Health 94% - Excellent Performance</div>
          <div class="hero-buttons">
            <button class="secondary-btn quick-action" data-question="Ask AI">Ask AI</button>
            <button class="secondary-btn quick-action" data-question="Generate today's report.">Generate Report</button>
            <button class="ghost-btn quick-action" data-question="Show inventory status.">View Details</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${kpiCard('dark', 'Factory Health', '94%', 'Excellent performance', 'shield-check', 94)}
        ${kpiCard('purple', 'Running Machines', '28', 'Out of 31 active assets', 'cpu', 90)}
        ${kpiCard('blue', "Today\'s Production", '1,540', 'Units completed today', 'factory', 84)}
        ${kpiCard('green', 'Energy Consumption', '4.8 MWh', '4% above baseline', 'bolt', 76)}
        ${kpiCard('gold', 'Pending Orders', '12', '3 due for dispatch', 'package', 70)}
        ${kpiCard('dark', 'AI Cost Savings', '₹2,350', 'Estimated monthly savings', 'badge-indian-rupee', 88)}
      </div>

      <div class="grid-dashboard" style="margin-top:18px;">
        <div class="stack">
          <div class="panel-card ai-brief">
            <div class="section-title">
              <div>
                <h3>AI Daily Briefing</h3>
                <p>What matters right now</p>
              </div>
              <span class="pill"><i data-lucide="sparkles"></i> Proactive Insights</span>
            </div>
            <div class="brief-copy">
              <p>Production is running smoothly.</p>
              <p>Machine M-07 requires maintenance within 72 hours.</p>
              <p>Energy usage increased by 4%.</p>
              <p>Estimated monthly savings: ₹2,350.</p>
              <p>Inventory for steel sheets is running low.</p>
              <p>Customer deliveries remain on schedule.</p>
            </div>
            <div class="inline-actions">
              <button class="secondary-btn quick-action" data-question="Which machine needs maintenance?">Ask AI</button>
              <button class="secondary-btn quick-action" data-question="Generate today's report.">Generate Report</button>
              <button class="ghost-btn quick-action" data-question="Optimize factory efficiency">View Details</button>
            </div>
          </div>

          <div class="chart-grid">
            <div class="white-card chart-box">
              <div class="section-title">
                <div>
                  <h3>Production Trend</h3>
                  <p>Weekly output vs target</p>
                </div>
                <span class="pill">Live trend</span>
              </div>
              <canvas id="productionChart"></canvas>
            </div>
            <div class="white-card chart-box">
              <div class="section-title">
                <div>
                  <h3>Machine Health</h3>
                  <p>Risk distribution across critical assets</p>
                </div>
                <span class="pill">AI score</span>
              </div>
              <canvas id="machineHealthChart"></canvas>
            </div>
          </div>

          <div class="chart-grid">
            <div class="white-card chart-box">
              <div class="section-title">
                <div>
                  <h3>Energy Consumption</h3>
                  <p>Hourly load and peak demand</p>
                </div>
                <span class="pill">Cost control</span>
              </div>
              <canvas id="energyChart"></canvas>
            </div>
            <div class="white-card chart-box">
              <div class="section-title">
                <div>
                  <h3>Downtime Analysis</h3>
                  <p>Primary causes over the last 7 days</p>
                </div>
                <span class="pill">Efficiency</span>
              </div>
              <canvas id="downtimeChart"></canvas>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="white-card">
            <div class="section-title">
              <div>
                <h3>Live Machine Status</h3>
                <p>Current plant activity</p>
              </div>
            </div>
            <table class="machine-table">
              <thead>
                <tr><th>Machine</th><th>Status</th><th>Health</th></tr>
              </thead>
              <tbody>
                ${machineRows
                  .map(
                    ([machine, name, status, health, note]) => `
                      <tr>
                        <td><strong>${machine}</strong><br><span style="color:var(--muted)">${name}</span></td>
                        <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                        <td><strong>${health}</strong><br><span style="color:var(--muted)">${note}</span></td>
                      </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="white-card">
            <div class="section-title">
              <div>
                <h3>Critical Alerts</h3>
                <p>Priority items that need attention</p>
              </div>
            </div>
            <div class="alert-list">
              ${alertItems
                .map(
                  (item) => `
                    <div class="alert-item">
                      <span class="dot ${item.type}"></span>
                      <div>
                        <strong>${item.title}</strong>
                        <p>${item.detail}</p>
                      </div>
                    </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="white-card">
            <div class="section-title">
              <div>
                <h3>Recent Activity</h3>
                <p>Today\'s operational timeline</p>
              </div>
            </div>
            <div class="timeline">
              <div class="timeline-item"><strong>08:12 AM</strong><p>Shift one started with 99.1% line readiness.</p></div>
              <div class="timeline-item"><strong>09:40 AM</strong><p>AI flagged a scheduled lubrication task for M-02.</p></div>
              <div class="timeline-item"><strong>11:05 AM</strong><p>Order batch #ORD-1842 entered dispatch queue.</p></div>
              <div class="timeline-item"><strong>01:20 PM</strong><p>Energy spike detected and load balancing recommendation issued.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderCopilotPage() {
  return renderShell(`
    <section class="page active" data-page-content="copilot">
      <div class="hero">
        <div>
          <h1>AI Copilot</h1>
          <p>Ask YantraOS to explain factory trends, predict issues, summarize performance and recommend the next operational action.</p>
        </div>
        <div class="hero-meta">
          <div class="health-pill"><span class="spark"></span> Always on advisory mode</div>
        </div>
      </div>
      <div class="page-columns">
        <div class="white-card ai-console">
          <div class="section-title">
            <div>
              <h3>Conversation</h3>
              <p>Simulated AI responses for the hackathon demo</p>
            </div>
          </div>
          <div class="ai-messages" id="aiMessages">
            <div class="message assistant"><strong>YantraOS Copilot</strong><div>${aiAnswers.default}</div></div>
          </div>
          <div class="ai-input">
            <input id="aiPrompt" type="text" placeholder="Try: Which machine needs maintenance?" />
            <button class="primary-btn" id="sendPrompt">Ask AI</button>
          </div>
          <div class="tags">
            ${Object.keys(aiAnswers)
              .filter((question) => question !== 'default')
              .map((question) => `<button class="tag quick-action" data-question="${question}">${question}</button>`)
              .join('')}
          </div>
        </div>
        <div class="stack">
          <div class="white-card">
            <div class="section-title"><div><h3>Suggested Questions</h3><p>One-click prompts</p></div></div>
            <div class="checklist">
              <div class="check-item"><strong>Which machine needs maintenance?</strong><p>Get the highest priority maintenance recommendation.</p></div>
              <div class="check-item"><strong>Why did energy usage increase?</strong><p>Understand the reason behind the latest energy spike.</p></div>
              <div class="check-item"><strong>Predict tomorrow's production.</strong><p>See the AI forecast for the next day.</p></div>
            </div>
          </div>
          <div class="white-card">
            <div class="section-title"><div><h3>AI Capabilities</h3><p>What Copilot can do</p></div></div>
            <div class="feed-list">
              <div class="feed-item"><strong>Predict failures</strong><p>Identify risky machines before an unexpected shutdown happens.</p></div>
              <div class="feed-item"><strong>Explain trends</strong><p>Translate charts into simple business language for operators and owners.</p></div>
              <div class="feed-item"><strong>Generate reports</strong><p>Create production, energy, maintenance and compliance summaries on demand.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderMachinesContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Machine Fleet</h3><p>Status and health summary</p></div><span class="pill">31 connected</span></div>
      <table class="machine-table">
        <thead><tr><th>Machine</th><th>Status</th><th>Utilization</th><th>Health</th></tr></thead>
        <tbody>
          ${machineRows
            .map(
              ([machine, name, status, health, note]) => `
                <tr>
                  <td><strong>${machine}</strong><br><span style="color:var(--muted)">${name}</span></td>
                  <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                  <td>${Math.round(parseInt(health, 10) || 0)}%</td>
                  <td>${note}</td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="white-card">
      <div class="section-title"><div><h3>Machine Health Scores</h3><p>AI risk ranking</p></div></div>
      <canvas id="analyticsMachineChart" height="250"></canvas>
    </div>
  `;
}

function renderProductionContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Production Metrics</h3><p>Output, efficiency and downtime</p></div></div>
      <div class="mini-grid">
        ${miniStat("Today's Output", '1,540', 'Units')}
        ${miniStat('Line Efficiency', '96.1', '%')}
        ${miniStat('Downtime', '1.8', 'Hours')}
        ${miniStat('OEE', '87.4', '%')}
      </div>
    </div>
    <div class="white-card chart-box"><canvas id="analyticsProductionChart"></canvas></div>
  `;
}

function renderEnergyContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Energy Overview</h3><p>Consumption and optimization opportunities</p></div></div>
      <div class="mini-grid">
        ${miniStat('Usage Today', '4.8', 'MWh')}
        ${miniStat('Peak Demand', '128', 'kW')}
        ${miniStat('Solar Output', '1.2', 'MWh')}
        ${miniStat('Savings', '₹2,350', 'Monthly')}
      </div>
    </div>
    <div class="white-card chart-box"><canvas id="analyticsEnergyChart"></canvas></div>
  `;
}

function renderMaintenanceContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Maintenance Priorities</h3><p>Risk-based task queue</p></div></div>
      <div class="checklist">
        <div class="check-item"><strong>M-07 - Press Machine</strong><p>Schedule within 72 hours. High vibration trend detected.</p></div>
        <div class="check-item"><strong>M-02 - Injection Molder</strong><p>Bearing inspection due in next maintenance window.</p></div>
        <div class="check-item"><strong>M-04 - Packaging Line</strong><p>Temperature drift requires a quick diagnostics check.</p></div>
      </div>
    </div>
    <div class="white-card chart-box"><canvas id="analyticsMaintenanceChart"></canvas></div>
  `;
}

function renderInventoryContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Inventory Watchlist</h3><p>Stock and replenishment status</p></div></div>
      <table class="data-table">
        <thead><tr><th>Item</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Steel Sheets</td><td>Low</td><td><span class="status maintenance">Reorder</span></td></tr>
          <tr><td>Fasteners</td><td>Healthy</td><td><span class="status running">Safe</span></td></tr>
          <tr><td>Packaging Tape</td><td>Low</td><td><span class="status maintenance">Reorder</span></td></tr>
          <tr><td>Lubricant Oil</td><td>Healthy</td><td><span class="status running">Safe</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="white-card chart-box"><canvas id="analyticsInventoryChart"></canvas></div>
  `;
}

function renderOrdersContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Active Orders</h3><p>Dispatch and delivery prediction</p></div></div>
      <div class="feed-list">
        <div class="feed-item"><strong>ORD-1842</strong><p>Automotive component order. Dispatch scheduled for today at 6:30 PM.</p></div>
        <div class="feed-item"><strong>ORD-1901</strong><p>Electrical assembly order. On track for tomorrow morning.</p></div>
        <div class="feed-item"><strong>ORD-1930</strong><p>Prototype batch. AI predicts 98% on-time delivery probability.</p></div>
      </div>
    </div>
    <div class="white-card chart-box"><canvas id="analyticsOrdersChart"></canvas></div>
  `;
}

function renderReportsPage() {
  return renderShell(`
    <section class="page active" data-page-content="reports">
      <div class="hero">
        <div>
          <h1>Reports</h1>
          <p>Generate polished operational reports for production, maintenance, energy, inventory, compliance and finance.</p>
        </div>
        <div class="hero-buttons">
          <button class="secondary-btn">PDF</button>
          <button class="secondary-btn">Excel</button>
          <button class="secondary-btn">CSV</button>
          <button class="ghost-btn">Print</button>
        </div>
      </div>
      <div class="report-grid">
        ${reportCards.map(([title, detail]) => reportCard(title, detail)).join('')}
      </div>
    </section>
  `);
}

function renderAnalyticsPage() {
  return renderShell(`
    <section class="page active" data-page-content="analytics">
      <div class="hero">
        <div>
          <h1>Analytics</h1>
          <p>Visual insight into machine efficiency, factory health, OEE, downtime, forecasts, cost savings and carbon impact.</p>
        </div>
      </div>
      <div class="chart-grid">
        <div class="white-card chart-box"><div class="section-title"><div><h3>Factory Performance</h3><p>Month-to-month comparison</p></div></div><canvas id="analyticsPerformanceChart"></canvas></div>
        <div class="white-card chart-box"><div class="section-title"><div><h3>Carbon & Savings</h3><p>Sustainability and cost reduction</p></div></div><canvas id="analyticsCarbonChart"></canvas></div>
      </div>
      <div style="margin-top:18px;" class="chart-grid">
        <div class="white-card chart-box"><div class="section-title"><div><h3>Weekly Output</h3><p>Production and target bands</p></div></div><canvas id="analyticsWeeklyChart"></canvas></div>
        <div class="white-card chart-box"><div class="section-title"><div><h3>Machine Efficiency</h3><p>Asset-level comparison</p></div></div><canvas id="analyticsEfficiencyChart"></canvas></div>
      </div>
    </section>
  `);
}

function renderCompliancePage() {
  return renderShell(`
    <section class="page active" data-page-content="compliance">
      <div class="hero">
        <div>
          <h1>Compliance</h1>
          <p>Track statutory obligations, audits and renewals with a simple enterprise checklist.</p>
        </div>
      </div>
      ${renderComplianceContent()}
    </section>
  `);
}

function renderComplianceContent() {
  return `
    <div class="white-card">
      <div class="section-title"><div><h3>Compliance Checklist</h3><p>Factory-level assurance</p></div></div>
      <div class="checklist">
        <div class="check-item"><strong>GST Filing</strong><p>Next filing window opens in 11 days.</p></div>
        <div class="check-item"><strong>Fire Safety Certificate</strong><p>Renewal due in 19 days with a site inspection pending.</p></div>
        <div class="check-item"><strong>Labour Register</strong><p>Attendance records synced for this week.</p></div>
        <div class="check-item"><strong>Pollution Control</strong><p>Emission logs are within permissible range.</p></div>
      </div>
    </div>
  `;
}

function renderSettingsPage() {
  return renderShell(`
    <section class="page active" data-page-content="settings">
      <div class="hero">
        <div>
          <h1>Settings</h1>
          <p>Manage factory information, users, notifications, security, appearance and integrations.</p>
        </div>
      </div>
      <div class="settings-grid">
        ${settingCard('Factory Information', 'Update profile, plant details and operating shifts.')}
        ${settingCard('User Management', 'Add team members and assign module permissions.')}
        ${settingCard('Notifications', 'Configure alerts for downtime, stock and compliance.')}
        ${settingCard('Security', 'Passwords, sessions and access levels.')}
        ${settingCard('Appearance', 'Light or dark mode for different environments.')}
        ${settingCard('Language', 'English, Hindi and more local options coming soon.')}
        ${settingCard('Backup', 'Scheduled exports and restore points for operational continuity.')}
        ${settingCard('Integrations', 'Coming soon: IoT, ERP, SCADA and accounting links.')}
        ${settingCard('About YantraOS', 'The AI Operating System for Smart Manufacturing.')}
      </div>
    </section>
  `);
}

function renderHelpPage() {
  return renderShell(`
    <section class="page active" data-page-content="help">
      <div class="hero">
        <div>
          <h1>Help Center</h1>
          <p>Quick guidance for owners, managers and supervisors using YantraOS on the factory floor.</p>
        </div>
      </div>
      <div class="help-grid">
        ${helpTopics.map(([title, detail]) => helpCard(title, detail)).join('')}
      </div>
    </section>
  `);
}

function renderGenericPage(title, description, body) {
  return renderShell(`
    <section class="page active" data-page-content="${title.toLowerCase()}">
      <div class="hero">
        <div><h1>${title}</h1><p>${description}</p></div>
      </div>
      <div class="page-columns">
        ${body}
      </div>
    </section>
  `);
}

function kpiCard(theme, title, value, subtitle, icon, progress) {
  const numericTarget = value.match(/[₹]?\d[\d,]*(?:\.\d+)?/)?.[0] || '0';
  return `
    <div class="kpi-card ${theme}">
      <div class="kpi-head">
        <div>
          <div class="kpi-title"><i data-lucide="${icon}"></i><span>${title}</span></div>
          <div class="kpi-sub">${subtitle}</div>
        </div>
        <i data-lucide="trending-up"></i>
      </div>
      <div class="kpi-value counter" data-target="${numericTarget}" data-display="${value}">${value}</div>
      <div class="kpi-foot"><span>AI monitored</span><span>${progress}%</span></div>
      <div class="progress-bar"><span style="width:${progress}%"></span></div>
    </div>
  `;
}

function miniStat(title, value, unit) {
  return `<div class="mini-card"><span>${title}</span><strong>${value}</strong><span>${unit}</span></div>`;
}

function reportCard(title, detail) {
  return `
    <div class="report-card">
      <h4>${title}</h4>
      <p>${detail}</p>
      <div class="hero-buttons" style="margin-top:16px;">
        <button class="secondary-btn">View</button>
        <button class="ghost-btn">Export</button>
      </div>
    </div>`;
}

function settingCard(title, detail) {
  return `
    <div class="setting-card">
      <h4>${title}</h4>
      <p>${detail}</p>
      ${title === 'Appearance' ? '<div class="toggle" aria-hidden="true"></div>' : ''}
    </div>`;
}

function helpCard(title, detail) {
  return `
    <div class="help-card">
      <h4>${title}</h4>
      <p>${detail}</p>
    </div>`;
}

function initCharts(scope = 'dashboard') {
  destroyCharts(scope);

  if (scope === 'dashboard') {
    makeLineChart('productionChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [1420, 1480, 1495, 1520, 1510, 1540, 1560], '#1976d2');
    makeDoughnutChart('machineHealthChart', ['Healthy', 'Watch', 'High Risk'], [68, 22, 10], ['#11b57c', '#f0a000', '#e45757']);
    makeLineChart('energyChart', ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'], [3.8, 4.2, 4.8, 4.5, 4.9, 4.3], '#ff8a1e', false);
    makeBarChart('downtimeChart', ['Setup', 'Breakdown', 'Changeover', 'Material'], [22, 34, 18, 11], '#7d6df0');
  }

  if (scope === 'analytics') {
    makeLineChart('analyticsPerformanceChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [86, 88, 90, 92, 94, 96], '#1976d2');
    makeLineChart('analyticsCarbonChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [12.4, 11.8, 11.2, 10.6, 10.0, 9.3], '#11b57c', false);
    makeLineChart('analyticsWeeklyChart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [1460, 1490, 1520, 1530, 1540, 1555, 1568], '#ff8a1e');
    makeBarChart('analyticsEfficiencyChart', ['M-01', 'M-02', 'M-03', 'M-04', 'M-05'], [98, 74, 61, 52, 95], '#0f8d73');
  }

  ['analyticsMachineChart', 'analyticsProductionChart', 'analyticsEnergyChart', 'analyticsMaintenanceChart', 'analyticsInventoryChart', 'analyticsOrdersChart'].forEach((canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (canvasId.includes('Machine')) makeDoughnutChart(canvasId, ['Running', 'Maintenance', 'Idle'], [62, 24, 14], ['#11b57c', '#f0a000', '#4a7fff']);
    if (canvasId.includes('Production')) makeLineChart(canvasId, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [1410, 1470, 1500, 1525, 1540], '#1976d2');
    if (canvasId.includes('Energy')) makeLineChart(canvasId, ['Peak', 'Off Peak', 'Peak', 'Off Peak', 'Peak'], [4.9, 3.5, 5.1, 3.9, 4.8], '#ff8a1e');
    if (canvasId.includes('Maintenance')) makeBarChart(canvasId, ['Ready', 'Due', 'Critical'], [21, 7, 2], '#e45757');
    if (canvasId.includes('Inventory')) makeBarChart(canvasId, ['Steel', 'Tape', 'Fasteners', 'Oil'], [32, 18, 74, 91], '#7d6df0');
    if (canvasId.includes('Orders')) makeLineChart(canvasId, ['Today', 'Tomorrow', 'Day 3', 'Day 4'], [12, 15, 14, 16], '#11b57c');
  });

  Chart?.defaults?.plugins?.legend && (Chart.defaults.plugins.legend.labels.usePointStyle = true);
}

function makeLineChart(id, labels, data, color, filled = true) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  analyticsCharts[id] = dashboardCharts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 3,
        tension: 0.42,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        fill: filled,
        backgroundColor: filled ? `${color}22` : 'transparent',
      }],
    },
    options: commonChartOptions(),
  });
}

function makeBarChart(id, labels, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  const palette = [color, '#ff8a1e', '#1976d2', '#11b57c', '#f0a000'];
  const chartData = data.map((value, index) => ({ value, backgroundColor: palette[index % palette.length] }));
  analyticsCharts[id] = dashboardCharts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: chartData.map((item) => item.value),
        backgroundColor: chartData.map((item) => item.backgroundColor),
        borderRadius: 10,
        borderSkipped: false,
      }],
    },
    options: commonChartOptions({ yBeginAtZero: true }),
  });
}

function makeDoughnutChart(id, labels, data, colors) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  analyticsCharts[id] = dashboardCharts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true },
      },
    },
  });
}

function commonChartOptions({ yBeginAtZero = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 24, 38, 0.94)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#7a8795' },
      },
      y: {
        beginAtZero: yBeginAtZero,
        grid: { color: 'rgba(127, 145, 164, 0.14)' },
        ticks: { color: '#7a8795' },
      },
    },
  };
}

function destroyCharts(scope) {
  const charts = scope === 'dashboard' ? dashboardCharts : analyticsCharts;
  Object.values(charts).forEach((chart) => chart?.destroy?.());
  Object.keys(charts).forEach((key) => delete charts[key]);
}

function setActivePage(page) {
  state.page = page;
  renderApp();
}

function hydrateInteractions() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeBtn = document.getElementById('themeBtn');

  menuBtn?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  logoutBtn?.addEventListener('click', () => {
    state.authenticated = false;
    state.page = 'dashboard';
    renderApp();
    showNotification('Signed out', 'You have been returned to the login screen.');
  });

  themeBtn?.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = state.theme;
    showNotification('Theme updated', `${state.theme === 'light' ? 'Light' : 'Dark'} mode is active.`);
  });

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      setActivePage(button.dataset.page);
    });
  });

  document.querySelectorAll('.quick-action').forEach((button) => {
    button.addEventListener('click', () => {
      const question = button.dataset.question || button.textContent.trim();
      if (state.page !== 'copilot' && ['Which machine needs maintenance?', "Generate today's report.", 'Show inventory status.', 'Optimize factory efficiency'].includes(question)) {
        state.page = 'copilot';
        renderApp(() => addPrompt(question));
        return;
      }
      handleQuestion(question);
    });
  });

  const sendPrompt = document.getElementById('sendPrompt');
  const aiPrompt = document.getElementById('aiPrompt');
  sendPrompt?.addEventListener('click', () => addPrompt(aiPrompt?.value || 'Which machine needs maintenance?'));
  aiPrompt?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addPrompt(aiPrompt.value || 'Which machine needs maintenance?');
    }
  });

  const counters = document.querySelectorAll('.counter');
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    if (!target) return;
    animateCounter(counter, target);
  });

  initCharts(state.page === 'analytics' ? 'analytics' : 'dashboard');
  lucide?.createIcons?.();
  applySkeletonPulse();
}

function addPrompt(question) {
  const input = document.getElementById('aiPrompt');
  if (input) input.value = '';
  handleQuestion(question);
}

function handleQuestion(question) {
  const messageList = document.getElementById('aiMessages');
  if (!messageList) {
    showNotification('YantraOS AI', aiAnswers[question] || aiAnswers.default);
    return;
  }

  const user = document.createElement('div');
  user.className = 'message user';
  user.innerHTML = `<strong>You</strong><div>${escapeHtml(question)}</div>`;
  messageList.appendChild(user);

  const assistant = document.createElement('div');
  assistant.className = 'message assistant';
  assistant.innerHTML = `<strong>YantraOS Copilot</strong><div class="typing" aria-label="typing"><span></span><span></span><span></span></div>`;
  messageList.appendChild(assistant);
  messageList.scrollTop = messageList.scrollHeight;

  window.setTimeout(() => {
    assistant.innerHTML = `<strong>YantraOS Copilot</strong><div>${escapeHtml(aiAnswers[question] || aiAnswers.default)}</div>`;
    messageList.scrollTop = messageList.scrollHeight;
  }, 900);
}

function showNotification(title, detail) {
  const box = document.getElementById('notification');
  if (!box) return;
  box.innerHTML = `<strong>${title}</strong><div>${detail}</div>`;
  box.classList.add('show');
  window.clearTimeout(showNotification._timer);
  showNotification._timer = window.setTimeout(() => box.classList.remove('show'), 2800);
}

function animateCounter(element, target) {
  const duration = 900;
  const start = performance.now();
  const display = element.dataset.display || element.textContent;
  const numericMatch = display.match(/[₹]?\d[\d,]*(?:\.\d+)?/);
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

function applySkeletonPulse() {
  document.querySelectorAll('[data-skeleton="true"]').forEach((el) => el.classList.add('skeleton'));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderApp(afterRender) {
  document.documentElement.dataset.theme = state.theme;
  if (!state.authenticated) {
    renderLogin();
  } else {
    const pageRenderer = content[state.page] || content.dashboard;
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
      <div class="loading-card">
        <div class="loading-ring"></div>
        <div class="brand-lockup" style="justify-content:center; margin-bottom:14px;">
          ${svgBrand()}
          <div class="brand-name">Yantra<span>OS</span></div>
        </div>
        <h2 style="margin:0 0 8px;">Initializing YantraOS</h2>
        <p style="margin:0; color:var(--muted);">Loading AI copilots, charts, and manufacturing insights...</p>
      </div>
    </div>
  `;
  window.setTimeout(() => {
    state.loadingDone = true;
    renderApp();
  }, 900);
}

window.addEventListener('resize', () => {
  if (state.authenticated) {
    initCharts(state.page === 'analytics' ? 'analytics' : 'dashboard');
  }
});

if (favicon) {
  favicon.href = favicon.href;
}

setLoading();
