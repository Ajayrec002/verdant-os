import React, { useState } from "react";
import { CropCycle, SensorTelemetry } from "../types";
import { 
  Sprout, 
  Calendar, 
  Heart, 
  Thermometer, 
  Droplets, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle,
  TrendingUp,
  BarChart3,
  LineChart,
  Grid
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface GrowthDashboardProps {
  crops: CropCycle[];
  sensors: SensorTelemetry[];
  onUpdateCrop: (crop: CropCycle) => void;
  onDeleteCrop: (id: string) => void;
  darkMode: boolean;
}

export default function GrowthDashboard({ 
  crops, 
  sensors, 
  onUpdateCrop, 
  onDeleteCrop, 
  darkMode 
}: GrowthDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropCycle | null>(null);
  const [viewMode, setViewMode] = useState<"towers" | "table">("towers");

  // Form State
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [stage, setStage] = useState<CropCycle["stage"]>("Germination");
  const [growthProgress, setGrowthProgress] = useState(10);
  const [healthScore, setHealthScore] = useState(95);
  const [targetTemp, setTargetTemp] = useState(21);
  const [targetHumidity, setTargetHumidity] = useState(65);
  const [yieldPrediction, setYieldPrediction] = useState(3.5);

  const resetForm = () => {
    setName("");
    setVariety("");
    setStage("Germination");
    setGrowthProgress(10);
    setHealthScore(95);
    setTargetTemp(21);
    setTargetHumidity(65);
    setYieldPrediction(3.5);
    setEditingCrop(null);
    setShowAddForm(false);
  };

  const handleSaveCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !variety) return;

    const cropData: CropCycle = {
      id: editingCrop ? editingCrop.id : `crop-${Date.now()}`,
      name,
      variety,
      stage,
      growthProgress: Number(growthProgress),
      plantedDate: editingCrop ? editingCrop.plantedDate : new Date().toISOString().split("T")[0],
      expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      healthScore: Number(healthScore),
      targetTemp: Number(targetTemp),
      currentTemp: editingCrop ? editingCrop.currentTemp : Number(targetTemp) + (Math.random() - 0.5),
      targetHumidity: Number(targetHumidity),
      currentHumidity: editingCrop ? editingCrop.currentHumidity : Number(targetHumidity) + (Math.random() * 4 - 2),
      waterLevel: editingCrop ? editingCrop.waterLevel : 90,
      irrigationFrequency: "4 hours",
      yieldPrediction: Number(yieldPrediction)
    };

    onUpdateCrop(cropData);
    resetForm();
  };

  const handleStartEdit = (crop: CropCycle) => {
    setEditingCrop(crop);
    setName(crop.name);
    setVariety(crop.variety);
    setStage(crop.stage);
    setGrowthProgress(crop.growthProgress);
    setHealthScore(crop.healthScore);
    setTargetTemp(crop.targetTemp);
    setTargetHumidity(crop.targetHumidity);
    setYieldPrediction(crop.yieldPrediction);
    setShowAddForm(true);
  };

  // Pre-formatted chart data
  const chartData = crops.map(c => ({
    name: c.name.split(" ").slice(-1)[0], // Get last word of name for clean display
    "Current Progress": c.growthProgress,
    "Health Rating": c.healthScore,
    "Expected Yield (kg)": c.yieldPrediction
  }));

  const stageColor = (s: CropCycle["stage"]) => {
    switch(s) {
      case "Germination": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Seeding": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "Vegetative": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Flowering": return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      case "Harvest Ready": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">Active Crop Beds</span>
            <Sprout className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black mt-2 text-white">{crops.length}</p>
          <p className="text-[10px] text-zinc-400 font-mono">MULTI-TIER VERTICAL STACKS</p>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">Avg Health Index</span>
            <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black mt-2 text-white">
            {(crops.reduce((acc, c) => acc + c.healthScore, 0) / (crops.length || 1)).toFixed(1)}%
          </p>
          <p className="text-[10px] text-emerald-400 font-mono">OPTIMAL CHLOROPHYLL PROFILES</p>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">Est. Yield Potential</span>
            <TrendingUp className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black mt-2 text-white">
            {crops.reduce((acc, c) => acc + c.yieldPrediction, 0).toFixed(1)} kg
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">READY FOR AUTOMATED DELIVERY</p>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">Irrigation Cycles</span>
            <Droplets className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black mt-2 text-white">24 / Day</p>
          <p className="text-[10px] text-emerald-400 font-mono">SENSOR-ADJUSTED FREQUENCY</p>
        </div>
      </div>

      {/* Main Grid: Crop Listing & Realtime Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crop Stacks Listing */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800" : "bg-white border-zinc-200"} transition-all shadow-md flex flex-col`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Active Growth Cycles
              </h2>
              <p className="text-xs text-zinc-400">Manage hydroponic growth stages and target climate profiles</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setViewMode("towers")}
                  className={`px-2.5 py-1 rounded-md transition-all ${viewMode === "towers" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  Towers
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 rounded-md transition-all ${viewMode === "table" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  List
                </button>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                New Planting
              </button>
            </div>
          </div>

          {/* Add / Edit Crop Stack Form */}
          {showAddForm && (
            <form onSubmit={handleSaveCrop} className={`p-4 rounded-xl mb-6 border ${darkMode ? "bg-slate-950/80 border-slate-800" : "bg-zinc-50 border-zinc-200"} space-y-3`}>
              <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-emerald-400">
                {editingCrop ? "Modify Crop Cycle Parameters" : "Provision New Hydroponic Stack"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Crop Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tuscan Sweet Basil"
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Crop Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Genovese Heirloom"
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Growth Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as CropCycle["stage"])}
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                  >
                    <option value="Germination">Germination</option>
                    <option value="Seeding">Seeding</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Growth Progress ({growthProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={growthProgress}
                    onChange={(e) => setGrowthProgress(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Target Temp (°C)</label>
                  <input
                    type="number"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-zinc-300"}`}
                    min="10"
                    max="35"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Target Humidity (%)</label>
                  <input
                    type="number"
                    value={targetHumidity}
                    onChange={(e) => setTargetHumidity(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-zinc-300"}`}
                    min="30"
                    max="95"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Predicted Yield (kg/rack)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={yieldPrediction}
                    onChange={(e) => setYieldPrediction(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-zinc-300"}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">Health Score ({healthScore}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={healthScore}
                    onChange={(e) => setHealthScore(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${darkMode ? "border-slate-800 hover:bg-slate-900 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-600"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg transition-colors"
                >
                  {editingCrop ? "Save Changes" : "Deploy Stack"}
                </button>
              </div>
            </form>
          )}

          {/* Render Active View Modes */}
          {viewMode === "towers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 flex-1">
              {crops.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-zinc-500 text-xs">
                  No active vertical growth towers online. Setup a crop above to begin.
                </div>
              ) : (
                crops.map((crop, index) => (
                  <div 
                    key={crop.id} 
                    className="growth-tower border border-emerald-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider">TOWER_A{index + 1}</h3>
                        <p className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-tight">{crop.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{crop.variety}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${stageColor(crop.stage)} font-mono`}>
                        {crop.stage}
                      </span>
                    </div>

                    {/* Quick Telemetry status in card */}
                    <div className="my-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-md border border-slate-900">
                        <Thermometer className="h-3 w-3 text-red-400" />
                        {crop.currentTemp.toFixed(1)}°C
                      </span>
                      <span className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-md border border-slate-900">
                        <Droplets className="h-3 w-3 text-blue-400" />
                        {crop.currentHumidity.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-1 font-mono">
                        <span>Harvest Progress</span>
                        <span>{crop.growthProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all"
                          style={{ width: `${crop.growthProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Hover controls overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleStartEdit(crop)}
                        title="Edit parameters"
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCrop(crop.id)}
                        title="Decommission tower"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {viewMode === "table" && (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className={`border-b ${darkMode ? "border-slate-850 text-slate-400" : "border-zinc-200 text-zinc-600"} text-[10px] uppercase tracking-wider font-mono`}>
                    <th className="py-3 px-2">Crop Setup</th>
                    <th className="py-3 px-2">Stage</th>
                    <th className="py-3 px-2">Growth Rate</th>
                    <th className="py-3 px-2">Health Index</th>
                    <th className="py-3 px-2">Target Climate</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/20 dark:divide-slate-850/50">
                  {crops.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-400 text-xs">
                        No active growth cycles. Setup a crop to begin.
                      </td>
                    </tr>
                  ) : (
                    crops.map(crop => (
                      <tr key={crop.id} className={`hover:${darkMode ? "bg-slate-900/40" : "bg-zinc-50"} transition-all group`}>
                        <td className="py-3 px-2">
                          <div className="font-bold text-xs md:text-sm text-slate-200">{crop.name}</div>
                          <div className="text-[10px] text-zinc-400">{crop.variety} • Planted {crop.plantedDate}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${stageColor(crop.stage)}`}>
                            {crop.stage}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="w-24 md:w-32">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                              <span>{crop.growthProgress}%</span>
                              <span className="font-mono">Harvest: {crop.expectedHarvestDate.slice(5)}</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full ${darkMode ? "bg-slate-950 border border-slate-900" : "bg-zinc-200"} overflow-hidden`}>
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all" 
                                style={{ width: `${crop.growthProgress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${crop.healthScore >= 95 ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : crop.healthScore >= 88 ? "bg-amber-500" : "bg-red-500"}`} />
                            <span className="font-semibold text-xs">{crop.healthScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                            <span className="flex items-center gap-0.5">
                              <Thermometer className="h-3 w-3 text-red-450" />
                              {crop.currentTemp.toFixed(1)}°C <span className="text-[9px] text-slate-500">({crop.targetTemp})</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Droplets className="h-3 w-3 text-blue-400" />
                              {crop.currentHumidity.toFixed(0)}% <span className="text-[9px] text-slate-500">({crop.targetHumidity})</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleStartEdit(crop)}
                              title="Edit parameters"
                              className={`p-1 rounded ${darkMode ? "hover:bg-slate-800 text-zinc-400 hover:text-zinc-200" : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950"}`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteCrop(crop.id)}
                              title="Decommission stack"
                              className={`p-1 rounded ${darkMode ? "hover:bg-rose-950/20 text-zinc-400 hover:text-rose-400" : "hover:bg-red-100 text-zinc-600 hover:text-red-600"}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time Growth Analytics Card */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md flex flex-col justify-between`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 mb-1 text-base">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              Analytics Control
            </h2>
            <p className="text-xs text-zinc-400 mb-4">Real-time parameters comparison across active crop cultivars</p>
          </div>

          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e4e4e7"} />
                <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#71717a"} fontSize={10} />
                <YAxis stroke={darkMode ? "#94a3b8" : "#71717a"} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                    borderColor: darkMode ? "#334155" : "#e4e4e7",
                    color: darkMode ? "#ffffff" : "#000000"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Current Progress" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expected Yield (kg)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`mt-4 pt-4 border-t ${darkMode ? "border-slate-800" : "border-zinc-200"} space-y-2`}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Optimal Temp Compliance
              </span>
              <span className="font-mono font-semibold">97.4%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Photo-period Lighting Uniformity
              </span>
              <span className="font-mono font-semibold">100%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400 animate-pulse" /> Nutrient E.C. Stability
              </span>
              <span className="font-mono font-semibold text-amber-400">91.8%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Forecast or Yield Simulation Area Chart */}
      <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
        <div className="mb-4">
          <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
            Performance Trends & ML Projections
          </h2>
          <p className="text-xs text-zinc-400">Weekly cumulative yields comparing actual harvest to multi-rack ML target projections</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { week: "Week 1", "Actual Harvest": 12, "Projections": 10, "E.C. Stability": 88 },
                { week: "Week 2", "Actual Harvest": 15, "Projections": 14, "E.C. Stability": 90 },
                { week: "Week 3", "Actual Harvest": 18, "Projections": 17, "E.C. Stability": 92 },
                { week: "Week 4", "Actual Harvest": 24, "Projections": 21, "E.C. Stability": 95 },
                { week: "Week 5", "Actual Harvest": 29, "Projections": 28, "E.C. Stability": 94 },
                { week: "Week 6", "Actual Harvest": 35, "Projections": 34, "E.C. Stability": 98 }
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e4e4e7"} />
              <XAxis dataKey="week" stroke={darkMode ? "#94a3b8" : "#71717a"} fontSize={10} />
              <YAxis stroke={darkMode ? "#94a3b8" : "#71717a"} fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                  borderColor: darkMode ? "#334155" : "#e4e4e7",
                  color: darkMode ? "#ffffff" : "#000000"
                }} 
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="Actual Harvest" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
              <Area type="monotone" dataKey="Projections" stroke="#6366f1" fillOpacity={1} fill="url(#colorProj)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
