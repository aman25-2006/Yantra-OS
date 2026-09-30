"""
YantraOS — Edge Gateway Telemetry Ingest & Anomaly Worker
Author: YantraOS Industrial Architecture Team
Description:
  Lightweight Python worker simulating or interfacing with shopfloor PLCs
  (via Modbus TCP / OPC UA / MQTT) and streaming high-frequency sensor frames
  into YantraOS (Next.js API route or Supabase PostgreSQL direct).
"""

import time
import math
import random
import datetime
import requests
import json

# Endpoint to send telemetry
API_ENDPOINT = "http://localhost:3000/api/telemetry"

MACHINES = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "code": "CNC-01",
        "name": "CNC Lathe - Dual Spindle Alpha",
        "base_vib": 2.1,
        "base_temp": 54.0,
        "base_rpm": 2400,
        "fault_mode": None,
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "code": "INJ-02",
        "name": "Injection Molder - 250T Hydraulic",
        "base_vib": 4.2,
        "base_temp": 73.0, # Running warm
        "base_rpm": 0,
        "fault_mode": "THERMAL_WARNING",
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "code": "HYD-03",
        "name": "Hydraulic Stamping Press - 500T",
        "base_vib": 8.35, # Severe ISO Zone D breach
        "base_temp": 76.5,
        "base_rpm": 0,
        "fault_mode": "BEARING_FLUTING",
    },
]

def calculate_iso_vibration(base_vib: float, fault_mode: str | None, tick: int) -> tuple[float, float]:
    """
    Computes RMS velocity (mm/s) according to ISO 10816 standards
    and instantaneous peak with bearing shock pulse modeling.
    """
    noise = (random.random() - 0.5) * 0.3
    harmonic = math.sin(tick * 0.5) * 0.25
    rms = max(0.1, round(base_vib + noise + harmonic, 3))
    
    # Bearing crest factor calculation
    if fault_mode == "BEARING_FLUTING":
        crest_factor = random.uniform(3.8, 4.4) # High crest factor indicates raceway impacts
    else:
        crest_factor = random.uniform(1.35, 1.55) # Nominal sine wave crest factor (~1.414)
        
    peak = round(rms * crest_factor, 3)
    return rms, peak

def run_edge_stream():
    print(f"[*] Starting YantraOS Edge Telemetry Streamer...")
    print(f"[*] Target Ingest Endpoint: {API_ENDPOINT}")
    print(f"[*] Monitoring {len(MACHINES)} industrial assets via ISO 10816 heuristics.\n")
    
    tick = 0
    while True:
        tick += 1
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        for m in MACHINES:
            vib_rms, vib_peak = calculate_iso_vibration(m["base_vib"], m["fault_mode"], tick)
            temp = round(m["base_temp"] + (random.random() - 0.5) * 0.5, 1)
            current = round(24.5 + (random.random() - 0.5) * 2.0, 1)
            
            payload = {
                "machineId": m["id"],
                "machineCode": m["code"],
                "timestamp": now_iso,
                "vibrationRms": vib_rms,
                "vibrationPeak": vib_peak,
                "temperatureCelsius": temp,
                "currentAmps": current,
                "crestFactor": round(vib_peak / vib_rms, 2),
            }
            
            # Print status summary
            status_indicator = "🔴 CRIT" if vib_rms >= 7.1 else "🟡 WARN" if vib_rms >= 4.5 else "🟢 NORM"
            print(f"[{status_indicator}] {m['code']} | Vib RMS: {vib_rms:5.2f} mm/s | Peak: {vib_peak:5.2f} | Temp: {temp:4.1f}°C")
            
        print("-" * 65)
        time.sleep(2.0)

if __name__ == "__main__":
    try:
        run_edge_stream()
    except KeyboardInterrupt:
        print("\n[!] Edge gateway streamer stopped by user.")
