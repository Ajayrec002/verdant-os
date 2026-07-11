import React, { useState } from "react";
import { SensorTelemetry, CropCycle, SystemNotification } from "../types";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Activity, 
  AlertTriangle, 
  Wrench, 
  RefreshCw, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Send,
  CheckCircle2,
  CalendarCheck
} from "lucide-react";

interface SensorPanelProps {
  sensors: SensorTelemetry[];
  crops: CropCycle[];
  notifications: SystemNotification[];
  onUpdateSensor: (sensor: SensorTelemetry) => void;
  onSimulateThreat: (notif: Partial<SystemNotification>) => void;
  darkMode: boolean;
}

export default function SensorPanel({
  sensors,
  crops,
  notifications,
  onUpdateSensor,
  onSimulateThreat,
  darkMode
}: SensorPanelProps) {
  const [selectedSensor, setSelectedSensor] = useState<SensorTelemetry | null>(sensors[0] || null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Sensor Simulation sliders
  const [simTemp, setSimTemp] = useState(22.8);
  const [simHum, setSimHum] = useState(64.2);
  const [simCo2, setSimCo2] = useState(850);
  const [simPh, setSimPh] = useState(6.2);

  const handleSelectSensor = (sensor: SensorTelemetry) => {
    setSelectedSensor(sensor);
    setSimTemp(sensor.temperature);
    setSimHum(sensor.humidity);
    setSimCo2(sensor.co2);
    setSimPh(sensor.waterPh);
  };

  const handleApplySimulation = () => {
    if (!selectedSensor) return;
    
    const updated: SensorTelemetry = {
      ...selectedSensor,
      temperature: Number(simTemp),
      humidity: Number(simHum),
      co2: Number(simCo2),
      waterPh: Number(simPh),
      lastUpdated: "Just now"
    };

    onUpdateSensor(updated);
    setSelectedSensor(updated);

    // If limits crossed, trigger alerts
    if (simTemp > 28) {
      onSimulateThreat({
        type: "system",
        severity: "critical",
        title: `Thermal Threshold Violated in ${selectedSensor.zone}`,
        message: `High ambient heat (${simTemp}°C) detected. Extreme leaf respiration risk. Activating secondary coolant loops.`
      });
    } else if (simHum < 45) {
      onSimulateThreat({
        type: "weather",
        severity: "warning",
        title: `Rapid Humidity Drop in ${selectedSensor.zone}`,
        message: `Ambient humidity fallen to ${simHum}%. Adjusting water dosers for high-vaporization compensation.`
      });
    }
  };

  const handleSimulatePestThreat = () => {
    onSimulateThreat({
      type: "pest",
      severity: "critical",
      title: "Aphid Cluster Bio-Alert",
      message: "Anomalous chlorophyll spectral feedback in upper rack layer of Zone A suggests minor Aphid localized nesting. Initiating focused UV-C bio-neutralization."
    });
  };

  const handleSimulateWeatherAlert = () => {
    onSimulateThreat({
      type: "weather",
      severity: "warning",
      title: "Regional Heatwave Alert",
      message: "External meteorological API reports ambient outdoor temperatures to exceed 38°C. Recommend switching vertical HVAC chillers to maximum pre-cooling mode."
    });
  };

  // Automated irrigation adjustments calculations based on sensor levels
  const calculateIrrigationRecom = (sensor: SensorTelemetry) => {
    if (sensor.temperature > 25 && sensor.humidity < 55) {
      return {
        action: "EMERGENCY HIGH-MIST VENTING",
        frequency: "Every 2.5 Hours",
        flowRate: "+20% Nutrient Fluid Flow",
        reason: "Excessive VPD (Vapor Pressure Deficit) caused by heat spike."
      };
    } else if (sensor.waterPh < 5.6) {
      return {
        action: "ALKALINE BUFFER INJECTION",
        frequency: "Continuous Recirculation",
        flowRate: "Standard Flow Rate",
        reason: "Acidic hydroponic reservoir. Buffering with KOH advised immediately."
      };
    } else if (sensor.co2 < 700) {
      return {
        action: "CARBON DIOXIDE INFUSION BOOST",
        frequency: "During Photoperiod (12 hours)",
        flowRate: "800 ppm Target Infusion",
        reason: "CO2 levels depleted by heavy vegetative growth phase."
      };
    } else {
      return {
        action: "STANDARD OPTIMIZED DISPATCH",
        frequency: "Every 4 Hours",
        flowRate: "Balanced Dosing Profile",
        reason: "Sensor telemetry remains well within standard biological limits."
      };
    }
  };

  const runAiAdvisor = async (customPrompt?: string) => {
    setAiLoading(true);
    setAiResponse("");
    try {
      const promptToSend = customPrompt || aiPrompt || "Provide an operational agronomy optimization briefing based on current stats.";
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          sensors,
          crops
        })
      });
      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else {
        setAiResponse("Advisor was unable to formulate analysis. Check console.");
      }
    } catch (err: any) {
      setAiResponse(`Failed to contact AI advisor: ${err.message || err}`);
    } finally {
      setAiLoading(false);
    }
  };

  const activePestThreats = notifications.filter(n => n.type === "pest" && !n.acknowledged);
  const activeWeatherAlerts = notifications.filter(n => n.type === "weather" && !n.acknowledged);

  return (
    <div className="space-y-6">
      
      {/* Simulation & Real-time Integration Alert Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pest threat warning banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${activePestThreats.length > 0 ? "bg-red-950/20 border-red-900/50 text-red-400" : "bg-zinc-900/40 border-zinc-800 text-zinc-400"} transition-all`}>
          <div className="flex items-center gap-3">
            <ShieldAlert className={`h-5 w-5 ${activePestThreats.length > 0 ? "text-red-500 animate-bounce" : "text-zinc-500"}`} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Pest Threat Monitor</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {activePestThreats.length > 0 
                  ? `${activePestThreats.length} unresolved bio-security risks detected!` 
                  : "All biome grids secure. Traps normal."}
              </p>
            </div>
          </div>
          {activePestThreats.length === 0 && (
            <button 
              onClick={handleSimulatePestThreat} 
              className="bg-red-900/40 hover:bg-red-800/60 border border-red-800/40 text-[10px] text-red-400 font-bold px-2 py-1 rounded transition-all cursor-pointer"
            >
              Simulate Pest
            </button>
          )}
        </div>

        {/* Weather Alerts banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${activeWeatherAlerts.length > 0 ? "bg-amber-950/20 border-amber-900/50 text-amber-400" : "bg-zinc-900/40 border-zinc-800 text-zinc-400"} transition-all`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${activeWeatherAlerts.length > 0 ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Meteorological Alerts</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {activeWeatherAlerts.length > 0 
                  ? "Extreme external weather alerts active." 
                  : "External micro-climates normal."}
              </p>
            </div>
          </div>
          {activeWeatherAlerts.length === 0 && (
            <button 
              onClick={handleSimulateWeatherAlert} 
              className="bg-amber-900/40 hover:bg-amber-800/60 border border-amber-800/40 text-[10px] text-amber-400 font-bold px-2 py-1 rounded transition-all cursor-pointer"
            >
              Simulate Weather
            </button>
          )}
        </div>

        {/* Irrigation Loop Status */}
        <div className={`p-4 rounded-xl border bg-zinc-900/40 border-zinc-800 text-zinc-400 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Irrigation Feed Pump</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Automatic data-driven adjustment loop online.</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded uppercase">
            Normal Loop
          </span>
        </div>
      </div>      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Telemetry Sensor List & Select */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Sensor Telemetry
            </h2>
            <p className="text-xs text-zinc-400">Integrated Modbus sensory pods. Select a zone core probe below:</p>
          </div>

          <div className="space-y-3">
            {sensors.map(sensor => (
              <div
                key={sensor.id}
                onClick={() => handleSelectSensor(sensor)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedSensor?.id === sensor.id ? "bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]" : `${darkMode ? "bg-slate-950/40 border-slate-850 hover:border-slate-700" : "bg-zinc-50 border-zinc-200 hover:border-zinc-350"}`}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-200">{sensor.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${sensor.status === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"}`}>
                    {sensor.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Thermometer className="h-3 w-3 text-red-400" /> {sensor.temperature}°C
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Droplets className="h-3 w-3 text-blue-400" /> {sensor.humidity}%
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Wind className="h-3 w-3 text-emerald-400" /> {sensor.co2} ppm
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Sun className="h-3 w-3 text-amber-400" /> {sensor.waterPh} pH
                  </span>
                </div>
                <div className="text-[9px] text-zinc-500 text-right mt-1.5 font-mono uppercase">Updated: {sensor.lastUpdated}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Sensor Simulation & Data-driven adjust */}
        {selectedSensor && (
          <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
            <div>
              <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                Telemetry Simulation
              </h2>
              <p className="text-xs text-zinc-400">Simulate field sensor micro-fluctuations to test automatic irrigation rules</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-zinc-400">
                  <span>Temperature Profile</span>
                  <span className="font-bold text-zinc-200">{simTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="0.1"
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-zinc-400">
                  <span>Relative Humidity</span>
                  <span className="font-bold text-zinc-200">{simHum}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="95"
                  value={simHum}
                  onChange={(e) => setSimHum(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-zinc-400">
                  <span>Carbon Dioxide Level</span>
                  <span className="font-bold text-zinc-200">{simCo2} ppm</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="10"
                  value={simCo2}
                  onChange={(e) => setSimCo2(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-zinc-400">
                  <span>Water Nutrient pH</span>
                  <span className="font-bold text-zinc-200">{simPh} pH</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="7.5"
                  step="0.1"
                  value={simPh}
                  onChange={(e) => setSimPh(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <button
                onClick={handleApplySimulation}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Apply Telemetry Simulation
              </button>
            </div>

            {/* Micro-Controller Response Output */}
            <div className={`p-3.5 rounded-xl border text-xs ${darkMode ? "bg-slate-950/40 border-slate-850" : "bg-zinc-50 border-zinc-200"} space-y-2`}>
              <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">
                Micro-Controller Adjustment
              </div>
              {(() => {
                const rec = calculateIrrigationRecom(selectedSensor);
                return (
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {rec.action}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      <strong>Interval:</strong> {rec.frequency} • {rec.flowRate}
                    </div>
                    <div className="text-[10px] text-zinc-500 italic border-l border-slate-800 pl-2 mt-1">
                      "{rec.reason}"
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Gemini AI Agtech Assistant Portal */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-emerald-400" /> Agronomy AI Advisor
            </h2>
            <p className="text-xs text-zinc-400">Leverage Gemini model logic to optimize yields, analyze stress indicators, and balance nutrition cycles</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => runAiAdvisor("Draft an ideal photoperiod schedule for Genovese Basil.")}
                className={`p-1.5 rounded-lg border text-[10px] hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left ${darkMode ? "bg-slate-950/40 border-slate-850 text-slate-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}
              >
                Basil Schedule 💡
              </button>
              <button
                onClick={() => runAiAdvisor("What are high stress indicators for strawberries in vertical towers?")}
                className={`p-1.5 rounded-lg border text-[10px] hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left ${darkMode ? "bg-slate-950/40 border-slate-850 text-slate-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}
              >
                Strawberry Stress 🍓
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Ask agronomy bot (e.g. ideal E.C for spinach)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAiAdvisor()}
                className={`w-full p-2.5 pr-8 rounded-lg border text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-zinc-300 text-zinc-950"}`}
              />
              <button
                onClick={() => runAiAdvisor()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 cursor-pointer animate-pulse"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs ${darkMode ? "bg-slate-950/40 border-slate-850" : "bg-zinc-50 border-zinc-200"} h-48 overflow-y-auto font-mono text-[11px]`}>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                  <span>Generating intelligence...</span>
                </div>
              ) : aiResponse ? (
                <div className="whitespace-pre-wrap text-zinc-300">{aiResponse}</div>
              ) : (
                <div className="text-zinc-500 flex flex-col justify-center h-full items-center text-center">
                  <Sparkles className="h-6 w-6 text-emerald-500/30 mb-2" />
                  <span>Click a prompt idea or enter custom question above to query server-side Gemini.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
