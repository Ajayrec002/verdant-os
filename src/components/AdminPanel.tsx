import React, { useState } from "react";
import { BusinessOrder, CropCycle, InventoryItem, SystemNotification } from "../types";
import { 
  Shield, 
  Lock, 
  Key, 
  Download, 
  FileSpreadsheet, 
  BellRing, 
  Settings, 
  Database, 
  CheckCircle, 
  CloudOff, 
  Wifi, 
  Activity,
  UserCheck
} from "lucide-react";

interface AdminPanelProps {
  orders: BusinessOrder[];
  crops: CropCycle[];
  inventory: InventoryItem[];
  notifications: SystemNotification[];
  onTriggerNotification: (notif: Partial<SystemNotification>) => void;
  isAdminAuthenticated: boolean;
  onAuthenticateAdmin: (authStatus: boolean) => void;
  darkMode: boolean;
  isOnline: boolean;
  onToggleConnection: () => void;
  onForceSync: () => void;
  pendingSyncCount: number;
}

export default function AdminPanel({
  orders,
  crops,
  inventory,
  notifications,
  onTriggerNotification,
  isAdminAuthenticated,
  onAuthenticateAdmin,
  darkMode,
  isOnline,
  onToggleConnection,
  onForceSync,
  pendingSyncCount
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Broadcast Alert form state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<SystemNotification["type"]>("system");
  const [notifSeverity, setNotifSeverity] = useState<SystemNotification["severity"]>("info");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123" || password === "verdant2026") {
      onAuthenticateAdmin(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administrative password keys. Hint: use 'admin123'");
    }
  };

  const handleLogout = () => {
    onAuthenticateAdmin(false);
    setPassword("");
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    onTriggerNotification({
      type: notifType,
      severity: notifSeverity,
      title: notifTitle,
      message: notifMessage,
      timestamp: new Date().toISOString(),
      acknowledged: false
    });

    setNotifTitle("");
    setNotifMessage("");
  };

  const exportToJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      facility: "Austin Vertical Tower Hub 1",
      metrics: {
        activeCropsCount: crops.length,
        pendingOrdersCount: orders.filter(o => o.status === "Pending").length,
        totalInventorySkuCount: inventory.length
      },
      crops,
      orders,
      inventory
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VerdantOS-Agronomy-Report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const exportToCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,ID,Name/Details,Status/Stage,Value/Price,Planted/Ordered Date\n";
    
    crops.forEach(c => {
      csvContent += `Crop,${c.id},"${c.name} (${c.variety})",${c.stage},Health:${c.healthScore}%,${c.plantedDate}\n`;
    });

    orders.forEach(o => {
      csvContent += `Order,${o.id},"${o.productName} (${o.companyName})",${o.status},Total:$${o.totalPrice},${o.orderDate}\n`;
    });

    inventory.forEach(i => {
      csvContent += `Inventory,${i.id},"${i.name}",Qty:${i.quantity},Price:$${i.price},Location:${i.rackLocation}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `VerdantOS-Agricultural-Data-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Login Portal screen */}
      {!isAdminAuthenticated ? (
        <div className="max-w-md mx-auto my-12">
          <div className={`p-8 rounded-3xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} shadow-2xl space-y-5`}>
            <div className="text-center space-y-1.5">
              <div className="inline-block p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Shield className="h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">Admin Console Sign In</h2>
              <p className="text-xs text-zinc-400">Secure entry for field operations management & analytics export</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-mono uppercase tracking-wider">Administrative Password</label>
                <div className="relative text-xs">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="Enter admin password (hint: admin123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 p-3 rounded-lg border text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500" : "bg-white border-zinc-300 text-zinc-900"}`}
                    required
                  />
                </div>
                {authError && <p className="text-[11px] text-red-500 mt-1.5 font-mono">{authError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md uppercase font-mono tracking-wider"
              >
                <Key className="h-4 w-4" /> Authenticate Access Keys
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Admin Dashboard
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <Shield className="h-5 w-5 text-emerald-500" /> Administrative Management & Field Controls
              </h2>
              <p className="text-xs text-zinc-400">Configure global parameters, synchronize remote telemetry buffers, and download analytics reporting packets.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 bg-slate-900/50 border border-slate-850 px-3 py-1.5 rounded-xl">
                <UserCheck className="h-4 w-4 text-emerald-500" /> Auth ID: Admin
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 border border-red-500/30 hover:bg-red-950/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-mono uppercase"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Remote Farm Offline Sync Controller */}
            <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-indigo-400 border-b border-slate-850 pb-2.5 font-mono uppercase tracking-wider">
                <CloudOff className="h-4 w-4" /> Offline Sync Controller
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Field technicians in deep rural canopies operate VerdantOS with completely cut connection pipelines. Edits are buffered inside local storage blocks.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-950/40 border border-slate-850">
                  <span className="text-zinc-400 font-mono">CONNECTION_STATUS</span>
                  <button
                    onClick={onToggleConnection}
                    className={`flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer font-mono ${isOnline ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                  >
                    {isOnline ? (
                      <>
                        <Wifi className="h-3.5 w-3.5 animate-pulse" /> ONLINE
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-3.5 w-3.5" /> OFFLINE
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-950/40 border border-slate-850">
                  <span className="text-zinc-400 font-mono">BUFFERED_OPS_CACHE</span>
                  <span className={`font-mono font-bold text-xs ${pendingSyncCount > 0 ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                    {pendingSyncCount} operations
                  </span>
                </div>

                {pendingSyncCount > 0 && (
                  <button
                    onClick={onForceSync}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md font-mono uppercase"
                  >
                    <Activity className="h-3.5 w-3.5" /> Synchronize Buffers
                  </button>
                )}
              </div>
            </div>

            {/* Historical Performance Export */}
            <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-emerald-400 border-b border-slate-850 pb-2.5 font-mono uppercase tracking-wider">
                <Database className="h-4 w-4" /> Export & Analytics
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate high-fidelity, data-packed summaries to export stakeholder spreadsheets or agricultural sensor analytics sheets.
              </p>

              <div className="space-y-3">
                <button
                  onClick={exportToCsv}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/40 border border-slate-850 flex items-center justify-between text-xs transition-all cursor-pointer text-zinc-300 font-mono"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export CSV Sheet
                  </span>
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                </button>

                <button
                  onClick={exportToJson}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/40 border border-slate-850 flex items-center justify-between text-xs transition-all cursor-pointer text-zinc-300 font-mono"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-400" /> Export JSON Telemetry
                  </span>
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Alert broadcaster */}
            <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-amber-500 border-b border-slate-850 pb-2.5 font-mono uppercase tracking-wider">
                <BellRing className="h-4 w-4" /> Alarm broadcaster
              </h3>
              
              <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as SystemNotification["type"])}
                    className={`p-2 rounded-lg border text-[10px] font-mono ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                  >
                    <option value="pest">Pest Alert</option>
                    <option value="weather">Weather Alert</option>
                    <option value="system">System Health</option>
                    <option value="sync">Sync Notification</option>
                  </select>

                  <select
                    value={notifSeverity}
                    onChange={(e) => setNotifSeverity(e.target.value as SystemNotification["severity"])}
                    className={`p-2 rounded-lg border text-[10px] font-mono ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Alert Title"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500" : "bg-white border-zinc-300 text-zinc-900"}`}
                  required
                />

                <textarea
                  placeholder="Alert Description Message..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs h-16 resize-none ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500" : "bg-white border-zinc-300 text-zinc-900"}`}
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 rounded-lg text-xs transition-all cursor-pointer font-mono uppercase tracking-wider"
                >
                  Broadcast Push Notification
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
