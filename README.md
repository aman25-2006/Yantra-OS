# YantraOS — AI Industrial Copilot & Predictive Monitoring Platform

An enterprise-grade Industrial IoT (IIoT) and Predictive Maintenance platform engineered specifically for manufacturing MSMEs (Micro, Small, and Medium Enterprises). 

YantraOS turns raw high-frequency sensor telemetry into actionable operational intelligence, physics-informed anomaly detection (ISO 10816 standards), and automated maintenance runbook execution (SOPs) to prevent catastrophic machine breakdowns.

---

## 🏭 Core Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, React 18, Tailwind CSS, Lucide Icons)
- **Industrial Data Visualization**: Recharts with real-time sliding windows, dual-axis telemetry streams, and ISO 10816 severity boundary lines
- **Database & Realtime Pub/Sub**: Supabase (PostgreSQL 15 with BRIN timeseries indexing, Row Level Security, and Realtime websocket publications)
- **Physics Engine**: ISO 10816-3 Vibration Severity classification (Zone A/B/C/D), Crest Factor peak analysis, and thermal gradient detection
- **AI Industrial Copilot**: Google Gemini API / OpenAI API integration with domain prompt grounding and offline diagnostic fallback engine
- **Edge Telemetry Simulator**: In-memory telemetry engine + Python Modbus/OPC UA edge gateway streamer (`workers/edge_gateway.py`)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🗄️ Supabase Database Migration

The complete PostgreSQL migration script with tables, indices, RLS policies, Realtime publications, and realistic shopfloor seed data is located at:
`supabase/migrations/20260930000001_yantra_core_schema.sql`

To apply this to your Supabase project:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase/migrations/20260930000001_yantra_core_schema.sql`.
3. Click **Run**.
4. Copy your `Project URL` and `anon key` into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🤖 AI Copilot Configuration (Gemini or OpenAI)

To enable live LLM generation for the Industrial Copilot:
Add your API key to `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
# or
OPENAI_API_KEY=your_openai_api_key_here
```

*(Note: If no API key is provided, YantraOS automatically uses its built-in physics-grounded diagnostic engine to answer questions like "Which machine showed abnormal vibration today?", "Why did Machine 03 trigger a warning at 14:30?", and "What maintenance action should I take next?")*

---

## 📡 Python Edge Telemetry Gateway Simulator

To simulate an edge PLC bridge streaming telemetry via Python:
```bash
python workers/edge_gateway.py
```

---

## 📁 Repository Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── copilot/chat/route.ts  # Grounded AI Copilot API route
│   │   │   ├── machines/route.ts      # Fleet inventory & metrics API
│   │   │   └── telemetry/route.ts     # Telemetry ingest & fault injector
│   │   ├── globals.css                # Industrial theme & custom scrollbars
│   │   ├── layout.tsx                 # Root layout & dark mode
│   │   └── page.tsx                   # Master Command Center Dashboard
│   ├── components/
│   │   ├── alerts/
│   │   │   └── AnomalyAlertCenter.tsx # Anomaly log table & SOP recommendations
│   │   ├── charts/
│   │   │   └── RealtimeTelemetryChart.tsx # Recharts real-time dual-axis streams
│   │   ├── copilot/
│   │   │   └── IndustrialCopilotChat.tsx  # Natural language shopfloor copilot
│   │   ├── dashboard/
│   │   │   └── FactoryOverview.tsx    # Executive summary & live machine grid
│   │   └── layout/
│   │       ├── Header.tsx             # Plant identity, stream status, fault trigger
│   │       └── Sidebar.tsx            # Navigation & edge protocol metrics
│   ├── lib/
│   │   ├── anomaly-detector.ts        # ISO 10816 physics & thermal heuristics
│   │   ├── copilot-knowledge.ts       # Domain prompt grounding & diagnostic logic
│   │   ├── supabase.ts                # Supabase client & fallback wrapper
│   │   ├── telemetry-simulator.ts     # Multi-machine wave simulator & fault injector
│   │   └── utils.ts                   # Unit formatters & ISO zone classifiers
│   └── types/
│       └── industrial.ts              # Strongly-typed schemas (Machine, Anomaly, etc.)
├── supabase/
│   └── migrations/
│       └── 20260930000001_yantra_core_schema.sql # Production PostgreSQL migration
├── workers/
│   └── edge_gateway.py                # Python Modbus/OPC UA edge ingestion streamer
├── legacy/                            # Preserved static mockup files (HTML/CSS/JS)
└── package.json
```
