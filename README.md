# YantraOS — The AI Operating System for Smart Manufacturing

An enterprise-grade AI-powered SaaS frontend prototype designed for Micro, Small, and Medium Enterprises (MSMEs) in the manufacturing sector.

## Product Vision

YantraOS transforms raw operational data into intelligent business insights. Factory owners can monitor machine health, track energy consumption, analyze production trends, manage inventory, and receive AI-powered recommendations—all from a single dashboard.

**Core Capabilities:**
- **AI Copilot** — Natural language assistant for factory queries
- **Dashboard** — Unified command center with KPIs, alerts, and recommendations
- **Machine Monitoring** — Real-time status, health scores, and predictive maintenance
- **Energy Management** — Consumption tracking, cost optimization, and carbon insights
- **Production Analytics** — Output trends, efficiency metrics, and downtime analysis
- **Inventory & Orders** — Stock levels, supplier tracking, and delivery predictions
- **Compliance** — License management, audit trails, and regulatory reminders

## Quick Start

### Running Locally
1. Clone the repository
2. Open `index.html` in any modern browser
3. Use demo credentials:
   - Email: `owner@yantraos.com`
   - Password: `yantra123`

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Responsive design for desktop, tablet, and mobile

## Technology Stack

- **HTML5** — Semantic markup
- **CSS3** — Modern design with variables, gradients, and animations
- **Vanilla JavaScript** — No build step required
- **Chart.js** — Interactive data visualization
- **Lucide Icons** — Clean, scalable SVG icons
- **Google Fonts** — Inter typeface for professional appearance

## Architecture

The application is a **single-file frontend** with modular JavaScript:

- `index.html` — Main entry point and shell
- `styles.css` — Design system and component styles (~1,400 lines)
- `app.js` — State management, page rendering, and interactions (~1,100 lines)

**No backend, no build tools, no dependencies beyond CDNs.** Deploy directly to GitHub Pages or any static host.

## Features

### Pages & Modules
1. **Login** — Enterprise authentication interface
2. **Dashboard** — Factory health, KPIs, AI briefing, alerts, recent activity
3. **AI Copilot** — Conversational AI assistant with simulated intelligent responses
4. **Machines** — Fleet monitoring, health scores, utilization tracking
5. **Production** — Output metrics, efficiency, OEE, downtime analysis
6. **Energy** — Consumption tracking, peak demand, solar generation, cost savings
7. **Maintenance** — Risk-based priorities, predictive analytics, health trends
8. **Inventory** — Stock levels, replenishment alerts, supplier tracking
9. **Orders** — Active orders, dispatch schedules, delivery forecasting
10. **Reports** — Production, maintenance, energy, inventory, compliance summaries
11. **Analytics** — Factory performance trends, carbon footprint, savings analysis
12. **Compliance** — License management, GST filing, safety certificates, audits
13. **Settings** — User preferences, theme switching, notification config
14. **Help Center** — Getting started guides, feature explanations

### Design System

**Color Palette:**
- Primary: `#1976d2` (Blue)
- Accent: `#ff8a1e` (Orange)
- Success: `#11b57c` (Green)
- Warning: `#f0a000` (Amber)
- Danger: `#e45757` (Red)
- Neutral: `#1d2733` (Dark Text) / `#eef2f6` (Light Background)

**Components:**
- KPI Cards — Animated counters with progress indicators
- Charts — Line, bar, and doughnut charts powered by Chart.js
- Status Badges — Color-coded machine states (Running, Maintenance, Idle, Fault)
- Data Tables — Responsive tables with status indicators
- Alerts — Priority-based warnings with contextual information
- AI Messages — Simulated conversational responses with typing animation
- Navigation — Sticky sidebar with active page highlighting

### Key Interactions

- **Smart Navigation** — Click any sidebar item to navigate instantly
- **Dark/Light Theme** — Toggle appearance on the fly
- **AI Assistant** — Ask questions like "Which machine needs maintenance?" and get intelligent responses
- **Animated Charts** — Data visualizations load with smooth animations
- **Real-time Counters** — KPI values animate from 0 to target
- **Responsive Design** — Adapts perfectly from 320px mobile to 2560px ultrawide
- **Quick Actions** — Buttons throughout allow instant access to common tasks

## Deployment to GitHub Pages

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `yantraos` (or any name)
3. Description: "The AI Operating System for Smart Manufacturing"
4. Choose **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Push Code to GitHub
```bash
cd "c:\Users\Aman\Desktop\Yantra OS"

# Add GitHub as remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/yantraos.git

# Rename branch to main if needed
git branch -M main

# Push code
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select:
   - Branch: **main**
   - Folder: **/(root)**
4. Click "Save"
5. GitHub will provide your live URL: `https://USERNAME.github.io/yantraos`

### Step 4: Access Your Live App
Wait 1–2 minutes for deployment, then visit your GitHub Pages URL. Your YantraOS dashboard will be live!

## Performance Notes

- **No build step** — Load `index.html` directly
- **Minimal CDN usage** — Only Chart.js and Lucide Icons
- **Optimized CSS** — ~35 KB minified
- **Efficient JavaScript** — ~40 KB minified
- **Fast interaction** — Vanilla JS, no framework overhead
- **Mobile-ready** — Fully responsive and touch-friendly

## Future Enhancements

The architecture is designed to integrate:
- **Real IoT data streams** — Connect actual machine sensors via WebSocket or REST
- **Backend API** — FastAPI, Django, or Node.js for live analytics
- **Database** — PostgreSQL or MongoDB for persistent data
- **User authentication** — JWT tokens, OAuth, or session management
- **Email/SMS alerts** — Integration with notification services
- **Export features** — PDF, Excel, and CSV generation with real data

**No redesign necessary** — Simply replace simulated data with live API calls.

## File Structure

```
yantraos/
├── index.html          # Main entry point (single shell)
├── styles.css          # Design system and components
├── app.js              # State management and UI logic
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── .git/               # Version control
```

## Demo Data

All charts and alerts use realistic manufacturing metrics:
- **Production**: 1,540 units/day, 96% on-time delivery
- **Energy**: 4.8 MWh/day, ₹2,350 monthly savings
- **Machines**: 28/31 running, 2 in maintenance, 1 idle
- **Factory Health**: 94% operational efficiency
- **Alerts**: 5 active items requiring attention

## Keyboard Shortcuts (Future)

Planned for next iteration:
- `?` — Help menu
- `Cmd/Ctrl + K` — Quick search
- `Cmd/Ctrl + /` — Command palette

## License

Built for the **MSME Hackathon 2026**. This prototype demonstrates innovation, scalability, and commercial viability for manufacturing intelligence software.

## Support

For questions or feedback about this prototype, refer to the **Help Center** module inside the app.

---

**Made with ❤️ for Indian MSMEs.** YantraOS: Making Industry 4.0 accessible to every factory.
