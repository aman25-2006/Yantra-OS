-- ============================================================================
-- YantraOS Core Database Schema
-- Optimized for Supabase (PostgreSQL 15+), Timeseries Telemetry & Realtime
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Define Industrial Domain Types & Enums
DO $$ BEGIN
    CREATE TYPE machine_status_enum AS ENUM ('RUNNING', 'IDLE', 'WARNING', 'CRITICAL', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE anomaly_severity_enum AS ENUM ('LOW', 'MEDIUM', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE anomaly_type_enum AS ENUM (
        'VIBRATION_SPIKE',
        'BEARING_WEAR',
        'THERMAL_RUNAWAY',
        'OVERHEATING',
        'MOTOR_OVERLOAD',
        'PRESSURE_DROP',
        'CAVITATION',
        'MISALIGNMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Factories (Tenant Partitioning for MSMEs)
CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plant_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Machines (Shop Floor Assets)
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    machine_type VARCHAR(100) NOT NULL, -- e.g. CNC Lathe, Injection Molder
    bay VARCHAR(100) NOT NULL,          -- e.g. Bay 1 - CNC Shop
    status machine_status_enum DEFAULT 'IDLE',
    health_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (health_score BETWEEN 0 AND 100),
    runtime_hours NUMERIC(10, 2) DEFAULT 0.00,
    current_load_pct NUMERIC(5, 2) DEFAULT 0.00,
    
    -- ISO 10816 and Thermal Threshold Configurations
    vibration_warn_threshold NUMERIC(6, 3) DEFAULT 4.500, -- mm/s RMS (ISO Zone C limit)
    vibration_crit_threshold NUMERIC(6, 3) DEFAULT 7.100, -- mm/s RMS (ISO Zone D limit)
    temp_warn_threshold NUMERIC(6, 2) DEFAULT 65.00,      -- °C
    temp_crit_threshold NUMERIC(6, 2) DEFAULT 80.00,      -- °C
    current_warn_threshold NUMERIC(6, 2) DEFAULT 32.00,   -- Amps
    current_crit_threshold NUMERIC(6, 2) DEFAULT 40.00,   -- Amps
    pressure_min_threshold NUMERIC(6, 2),                 -- Bar
    pressure_max_threshold NUMERIC(6, 2),                 -- Bar

    -- OEE Benchmark Cache
    oee_overall NUMERIC(5, 2) DEFAULT 75.00,
    oee_availability NUMERIC(5, 2) DEFAULT 88.00,
    oee_performance NUMERIC(5, 2) DEFAULT 89.00,
    oee_quality NUMERIC(5, 2) DEFAULT 96.00,

    last_maintenance_date TIMESTAMPTZ,
    next_service_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (factory_id, code)
);

-- 5. Sensor Telemetry (High-Volume Timeseries Table)
-- Designed for sub-second writes and continuous window reads
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id BIGSERIAL,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vibration_rms NUMERIC(8, 4) NOT NULL,       -- Velocity RMS in mm/s (ISO 10816)
    vibration_peak NUMERIC(8, 4) NOT NULL,      -- Peak acceleration/velocity
    temperature_celsius NUMERIC(6, 2) NOT NULL, -- Bearing/stator temperature
    current_amps NUMERIC(6, 2) NOT NULL,        -- Three-phase motor draw
    pressure_bar NUMERIC(6, 2),                 -- Fluid/hydraulic pressure
    spindle_rpm NUMERIC(8, 2),                  -- Motor or chuck speed
    noise_db NUMERIC(5, 2),                     -- Acoustic emission sensor
    is_anomaly BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (machine_id, recorded_at, id)
);

-- Optimization: Composite index for ultra-fast sliding window queries
CREATE INDEX IF NOT EXISTS idx_telemetry_machine_recent 
ON sensor_telemetry (machine_id, recorded_at DESC);

-- BRIN Index for cost-effective range scans across historical blocks
CREATE INDEX IF NOT EXISTS idx_telemetry_brin_time 
ON sensor_telemetry USING BRIN (recorded_at);

-- 6. Anomalies (Physics-Detected Deviations & ML Scoring)
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL, -- 'vibration_rms', 'temperature_celsius', etc.
    observed_value NUMERIC(10, 4) NOT NULL,
    threshold_value NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,        -- 'mm/s', '°C', 'A', 'Bar'
    severity anomaly_severity_enum NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    anomaly_type anomaly_type_enum NOT NULL,
    root_cause_analysis TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_anomalies_machine_active 
ON anomalies (machine_id, status, severity);

-- 7. Alerts (Actionable Maintenance Tickets & SOPs)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    severity anomaly_severity_enum NOT NULL,
    status alert_status_enum DEFAULT 'NEW',
    root_cause TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    assigned_technician VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status_severity 
ON alerts (status, severity, created_at DESC);

-- 8. Maintenance Logs (Audit Trail & MTBF Tracker)
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    action_taken TEXT NOT NULL,
    parts_replaced VARCHAR(255)[],
    downtime_minutes INT DEFAULT 0,
    technician_name VARCHAR(100) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. Realtime Publication Setup
-- Enable Supabase Realtime subscriptions for live dashboard feeds
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE machines;
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- ============================================================================
-- 10. Row Level Security (RLS) Setup
-- Enforces multi-tenant isolation
-- ============================================================================
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated factory users (or anon for prototype dev)
CREATE POLICY "Public read access for machines in prototype mode" 
ON machines FOR SELECT USING (true);

CREATE POLICY "Public read access for telemetry in prototype mode" 
ON sensor_telemetry FOR SELECT USING (true);

CREATE POLICY "Public insert access for telemetry in prototype mode" 
ON sensor_telemetry FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for anomalies in prototype mode" 
ON anomalies FOR ALL USING (true);

CREATE POLICY "Public read access for alerts in prototype mode" 
ON alerts FOR ALL USING (true);

-- ============================================================================
-- 11. Initial Industrial Seed Data for MSME Manufacturing Prototype
-- ============================================================================
INSERT INTO factories (id, name, plant_code, location)
VALUES ('00000000-0000-0000-0000-000000000001', 'Yantra Precision Engineering Works', 'PUNE-PLANT-01', 'Bhosari MIDC, Pune')
ON CONFLICT (plant_code) DO NOTHING;

-- Machine 1: CNC Lathe-01 (Normal Operating)
INSERT INTO machines (
    id, factory_id, code, name, machine_type, bay, status, health_score, runtime_hours, current_load_pct,
    vibration_warn_threshold, vibration_crit_threshold, temp_warn_threshold, temp_crit_threshold,
    oee_overall, oee_availability, oee_performance, oee_quality, last_maintenance_date, next_service_due
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'CNC-01',
    'CNC Lathe - Dual Spindle Alpha',
    'CNC Turning Center',
    'Bay 1 - Precision Turning',
    'RUNNING',
    94.50,
    1420.50,
    78.00,
    4.500, 7.100, 65.00, 80.00,
    88.50, 95.00, 96.00, 97.00,
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '16 days'
) ON CONFLICT DO NOTHING;

-- Machine 2: Injection Molder-02 (Warning - Thermal & Lubrication)
INSERT INTO machines (
    id, factory_id, code, name, machine_type, bay, status, health_score, runtime_hours, current_load_pct,
    vibration_warn_threshold, vibration_crit_threshold, temp_warn_threshold, temp_crit_threshold,
    oee_overall, oee_availability, oee_performance, oee_quality, last_maintenance_date, next_service_due
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'INJ-02',
    'Injection Molder - 250T Hydraulic',
    'Plastic Injection Press',
    'Bay 2 - Polymers & Molding',
    'WARNING',
    68.20,
    2840.10,
    84.00,
    4.500, 7.100, 65.00, 80.00,
    71.40, 82.00, 91.00, 95.50,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '2 days'
) ON CONFLICT DO NOTHING;

-- Machine 3: Hydraulic Press-03 (Critical - Vibration Bearing Fluting)
INSERT INTO machines (
    id, factory_id, code, name, machine_type, bay, status, health_score, runtime_hours, current_load_pct,
    vibration_warn_threshold, vibration_crit_threshold, temp_warn_threshold, temp_crit_threshold,
    oee_overall, oee_availability, oee_performance, oee_quality, last_maintenance_date, next_service_due
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'HYD-03',
    'Hydraulic Stamping Press - 500T',
    'Heavy Forging Press',
    'Bay 3 - Stamping & Forging',
    'CRITICAL',
    42.80,
    4190.00,
    91.50,
    4.500, 7.100, 65.00, 80.00,
    52.10, 61.00, 92.00, 93.00,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '10 days'
) ON CONFLICT DO NOTHING;

-- Machine 4: Air Compressor-04 (Idle / Standby)
INSERT INTO machines (
    id, factory_id, code, name, machine_type, bay, status, health_score, runtime_hours, current_load_pct,
    vibration_warn_threshold, vibration_crit_threshold, temp_warn_threshold, temp_crit_threshold,
    oee_overall, oee_availability, oee_performance, oee_quality, last_maintenance_date, next_service_due
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000001',
    'CMP-04',
    'Rotary Screw Air Compressor - 75kW',
    'Utility Compressor',
    'Utility Yard - Plant Pneumatics',
    'IDLE',
    91.00,
    890.30,
    15.00,
    3.800, 6.200, 70.00, 85.00,
    89.00, 98.00, 92.00, 99.00,
    NOW() - INTERVAL '20 days',
    NOW() + INTERVAL '40 days'
) ON CONFLICT DO NOTHING;

-- Seed Critical Anomaly for Machine 3
INSERT INTO anomalies (
    id, machine_id, metric_name, observed_value, threshold_value, unit, severity,
    confidence_score, anomaly_type, root_cause_analysis, recommended_action, status, detected_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'vibration_rms',
    8.4200,
    7.1000,
    'mm/s',
    'CRITICAL',
    0.965,
    'BEARING_WEAR',
    'Harmonic frequency peak detected at 3.2x shaft speed with high crest factor. Indicates outer race spalling on Main Hydraulic Pump Drive Bearing.',
    'Execute controlled stop. Inspect drive coupling alignment, verify ISO VG 46 hydraulic oil viscosity, and replace spherical roller bearing assembly.',
    'ACTIVE',
    NOW() - INTERVAL '18 minutes'
) ON CONFLICT DO NOTHING;

-- Seed Warning Anomaly for Machine 2
INSERT INTO anomalies (
    id, machine_id, metric_name, observed_value, threshold_value, unit, severity,
    confidence_score, anomaly_type, root_cause_analysis, recommended_action, status, detected_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'temperature_celsius',
    73.80,
    65.00,
    '°C',
    'MEDIUM',
    0.890,
    'OVERHEATING',
    'Cooling circuit flow restriction detected. Temperature rose +8.2°C over the last 45 minutes under standard duty cycle.',
    'Check chiller coolant return valve and clean heat exchanger intake mesh. Do not exceed 80°C threshold.',
    'ACTIVE',
    NOW() - INTERVAL '42 minutes'
) ON CONFLICT DO NOTHING;

-- Seed Alerts matching the anomalies
INSERT INTO alerts (
    id, machine_id, anomaly_id, title, severity, status, root_cause, recommended_action, assigned_technician, created_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'CRITICAL: Excessive Vibration on Hydraulic Press-03',
    'CRITICAL',
    'NEW',
    'Severe bearing outer race degradation on 500T hydraulic pump motor. RMS vibration (8.42 mm/s) breached ISO 10816 Zone D.',
    'Immediate inspection of pump shaft bearing, check lubrication grease contamination, lock out machine if noise exceeds 92 dB.',
    'Senior Fitter - Ramesh Sharma',
    NOW() - INTERVAL '18 minutes'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'WARNING: Thermal Excursion on Injection Molder-02',
    'MEDIUM',
    'ACKNOWLEDGED',
    'Chiller heat exchange delta reduced; temperature holding at 73.8°C against 65.0°C warning threshold.',
    'Inspect cooling line water pressure, flush sediment filter on heat exchanger.',
    'Duty Electrician - Anil Patil',
    NOW() - INTERVAL '42 minutes'
) ON CONFLICT DO NOTHING;
