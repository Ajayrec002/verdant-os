import React, { useState, useEffect, useCallback } from "react";
import { 
  Sprout, 
  ShoppingBag, 
  Activity, 
  Terminal as TerminalIcon, 
  Network, 
  Shield, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  Bell, 
  AlertTriangle,
  RefreshCw,
  X,
  Heart,
  Droplet
} from "lucide-react";
import { CropCycle, BusinessOrder, InventoryItem, SensorTelemetry, SystemNotification } from "./types";
import GrowthDashboard from "./components/GrowthDashboard";
import StoreFront from "./components/StoreFront";
import SensorPanel from "./components/SensorPanel";
import TerminalCrud from "./components/TerminalCrud";
import DsaSandbox from "./components/DsaSandbox";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Global View / Navigation State
  const [activeTab, setActiveTab] = useState<"growth" | "store" | "sensors" | "terminal" | "dsa" | "admin">("growth");
  
  // Dark Mode is enabled by default for field technicians (eye-safe & high contrast)
  const [darkMode, setDarkMode] = useState(true);

  // Connection & Offline Support State
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<{ type: string; payload: any }[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Core Database States (Hydrated initially from server)
  const [crops, setCrops] = useState<CropCycle[]>([]);
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sensors, setSensors] = useState<SensorTelemetry[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [actionLogs, setActionLogs] = useState<{ id: string; action: string; timestamp: string }[]>([]);

  // Administrative auth
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Real-time Push Notification Toasts
  const [toasts, setToasts] = useState<SystemNotification[]>([]);

  // --- Core State Hydration ---
  const fetchStateFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Failed to contact API server");
      const data = await res.json();
      
      setCrops(data.crops || []);
      setOrders(data.orders || []);
      setInventory(data.inventory || []);
      setSensors(data.sensors || []);
      setNotifications(data.notifications || []);
      setActionLogs(data.actionLogs || []);
    } catch (error) {
      console.warn("Server unavailable. Operating in local-only offline sandbox", error);
      // Fallback to local storage or defaults if initial server fetch fails
    }
  }, []);

  // Fetch initial state on load
  useEffect(() => {
    fetchStateFromServer();
  }, [fetchStateFromServer]);

  // Toast auto-clear
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Trigger push notification toast
  const triggerToast = (notif: SystemNotification) => {
    setToasts(prev => [...prev, notif]);
  };

  // --- Real-time Data Sync Engine ---
  const performSync = async (queueToSync = offlineQueue) => {
    if (queueToSync.length === 0) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue: queueToSync })
      });
      
      if (!res.ok) throw new Error("Synchronization handshake failed");
      const data = await res.json();
      
      // Update our local state with synchronized server state
      if (data.success && data.state) {
        setCrops(data.state.crops || []);
        setOrders(data.state.orders || []);
        setInventory(data.state.inventory || []);
        setSensors(data.state.sensors || []);
        setNotifications(data.state.notifications || []);
        setActionLogs(data.state.actionLogs || []);
        
        // Clear queue on success
        setOfflineQueue([]);
        localStorage.removeItem("verdant_offline_queue");

        triggerToast({
          id: `toast-sync-${Date.now()}`,
          type: "sync",
          severity: "info",
          title: "Synchronization Complete",
          message: `Successfully synchronized ${data.synchronizedCount} queued offline operations with corporate servers.`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    } catch (err) {
      console.error("Data sync failed", err);
      triggerToast({
        id: `toast-sync-fail-${Date.now()}`,
        type: "sync",
        severity: "warning",
        title: "Sync Delayed",
        message: "Remote network unstable. Kept queued operations locally for safety.",
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    } finally {
      setSyncing(false);
    }
  };

  // Toggle connection status
  const handleToggleConnection = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);

    if (nextStatus) {
      // Transitioning to online - trigger auto-sync
      triggerToast({
        id: `toast-online-${Date.now()}`,
        type: "sync",
        severity: "info",
        title: "Network Pipe Restored",
        message: "Established secure connection. Initiating real-time data sync...",
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
      performSync();
    } else {
      triggerToast({
        id: `toast-offline-${Date.now()}`,
        type: "sync",
        severity: "warning",
        title: "Remote Mode Activated",
        message: "Offline support initialized. All agricultural data changes will be cached locally.",
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }
  };

  // Helper to push offline action or execute API directly
  const executeAction = async (type: string, payload: any, fallbackUpdateState: () => void) => {
    if (!isOnline) {
      // Queue action offline
      const nextQueue = [...offlineQueue, { type, payload }];
      setOfflineQueue(nextQueue);
      localStorage.setItem("verdant_offline_queue", JSON.stringify(nextQueue));
      
      // Execute local UI state update immediately to keep app fully responsive
      fallbackUpdateState();

      triggerToast({
        id: `toast-cache-${Date.now()}`,
        type: "sync",
        severity: "info",
        title: "Operation Buffered Offline",
        message: "Action queued in memory. Will auto-sync when network is restored.",
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    } else {
      // Execute directly on server
      fallbackUpdateState(); // Optimistic local update
      try {
        let endpoint = "";
        if (type === "crop_update" || type === "crop_create") endpoint = "/api/crops";
        else if (type === "order_create" || type === "order_update") endpoint = "/api/orders";
        else if (type === "inventory_update" || type === "inventory_create") endpoint = "/api/inventory";
        else if (type === "sensor_update") endpoint = "/api/sensors";
        else if (type === "notif_ack") endpoint = `/api/notifications/${payload.id}/acknowledge`;

        if (endpoint) {
          const method = type === "notif_ack" ? "POST" : "POST";
          const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: type === "notif_ack" ? undefined : JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.state) {
              setCrops(data.state.crops || []);
              setOrders(data.state.orders || []);
              setInventory(data.state.inventory || []);
              setSensors(data.state.sensors || []);
              setNotifications(data.state.notifications || []);
              setActionLogs(data.state.actionLogs || []);
            }
          }
        }
      } catch (err) {
        console.warn("Direct write failed, caching offline", err);
      }
    }
  };

  // --- Mutators ---

  const handleUpdateCrop = (crop: CropCycle) => {
    executeAction("crop_update", crop, () => {
      setCrops(prev => {
        const index = prev.findIndex(c => c.id === crop.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = crop;
          return next;
        }
        return [...prev, crop];
      });
    });
  };

  const handleDeleteCrop = async (id: string) => {
    // Delete crop
    setCrops(prev => prev.filter(c => c.id !== id));
    if (isOnline) {
      try {
        await fetch(`/api/crops/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Failed direct delete crop", err);
      }
    }
  };

  const handleAddOrder = (order: BusinessOrder) => {
    executeAction("order_create", order, () => {
      setOrders(prev => [order, ...prev]);
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: BusinessOrder["status"]) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const updated = { ...targetOrder, status };
    executeAction("order_update", updated, () => {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    });
  };

  const handleUpdateSensor = (sensor: SensorTelemetry) => {
    executeAction("sensor_update", sensor, () => {
      setSensors(prev => prev.map(s => s.id === sensor.id ? sensor : s));
    });
  };

  const handleTriggerNotification = (notifData: Partial<SystemNotification>) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      type: notifData.type || "system",
      severity: notifData.severity || "info",
      title: notifData.title || "Custom Alert",
      message: notifData.message || "",
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast(newNotif);

    if (isOnline) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotif)
      }).catch(err => console.warn("Failed direct notification creation", err));
    }
  };

  const handleAcknowledgeNotification = (id: string) => {
    executeAction("notif_ack", { id }, () => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n));
    });
  };

  const handleAddInventory = (item: InventoryItem) => {
    executeAction("inventory_create", item, () => {
      setInventory(prev => [...prev, item]);
    });
  };

  const handleDeleteInventory = async (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    if (isOnline) {
      try {
        await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Failed direct delete inventory", err);
      }
    }
  };

  const activeAlarms = notifications.filter(n => !n.acknowledged && (n.severity === "critical" || n.severity === "warning"));

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "bg-[#05070a] text-slate-300" : "bg-zinc-50 text-zinc-900"} transition-colors flex flex-col`}>
      
      {/* Real-time Push Notification Toast Area */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-2xl border text-xs pointer-events-auto flex justify-between items-start animate-fade-in ${
              toast.severity === "critical" 
                ? "bg-rose-950/90 border-rose-800 text-rose-200" 
                : "bg-slate-900/90 border-slate-700/80 text-slate-100"
            } glass-panel`}
          >
            <div className="space-y-1">
              <span className="font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5">
                <AlertTriangle className={`h-3.5 w-3.5 ${toast.severity === "critical" ? "text-rose-400" : "text-emerald-400"}`} />
                {toast.type ? `${toast.type.toUpperCase()} STATUS UPDATE` : "SYSTEM UPDATE"}
              </span>
              <h4 className="font-bold text-sm text-white">{toast.title}</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-white ml-2 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Facility Navigation Header Bar */}
      <header className={`border-b ${darkMode ? "bg-[#05070a]/80 border-slate-800" : "bg-white/95 border-zinc-200"} sticky top-0 backdrop-blur-md z-40 px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-emerald-500/20">
            V
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5 text-slate-100">
              VerdantOS <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-normal">v2.4</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Central Operations Control</p>
          </div>
        </div>

        {/* Global Controls & Telemetry Status Indicators */}
        <div className="flex items-center gap-4">
          
          {/* Active Alarms indicator */}
          {activeAlarms.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>{activeAlarms.length} CRITICAL ALERTS</span>
            </div>
          )}

          {/* Connection status control */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full status-pulse ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`}></div>
            <button
              onClick={handleToggleConnection}
              title={isOnline ? "Simulate connection drop" : "Simulate connection restoration"}
              className={`font-mono text-xs cursor-pointer transition-all ${isOnline ? "text-emerald-500" : "text-rose-500"}`}
            >
              {isOnline ? "OFFLINE SYNC ACTIVE" : "REMOTE CANOPY MODE"}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          {/* Dynamic Live micro-climate sensor status */}
          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-mono">
            <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
            </svg>
            <span>
              {sensors.find(s => s.type === "temperature")?.value || "24.2"}°C |{" "}
              {sensors.find(s => s.type === "humidity")?.value || "62"}% RH
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Local Buffer indicator / Sync Button */}
          {offlineQueue.length > 0 && (
            <button
              onClick={() => performSync()}
              disabled={syncing || !isOnline}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span>Sync ({offlineQueue.length})</span>
            </button>
          )}

          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-lg border cursor-pointer ${darkMode ? "bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300" : "bg-zinc-100 border-zinc-200 text-indigo-900 hover:bg-zinc-200"}`}
            title={darkMode ? "Switch to Day Mode" : "Switch to Technician Night Mode"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Sub-Header Area showing System Notifications if present */}
      {notifications.filter(n => !n.acknowledged).length > 0 && (
        <div className="bg-amber-950/15 border-b border-amber-900/20 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
            <span className="font-semibold">Facility Operational Alert:</span>
            <span className="text-zinc-400 truncate max-w-lg md:max-w-2xl">
              {notifications.filter(n => !n.acknowledged)[0].title} — {notifications.filter(n => !n.acknowledged)[0].message}
            </span>
          </div>
          <button
            onClick={() => handleAcknowledgeNotification(notifications.filter(n => !n.acknowledged)[0].id)}
            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold underline shrink-0 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main layout frame */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className={`lg:w-64 border-r ${darkMode ? "bg-[#020408] border-slate-800" : "bg-white border-zinc-200"} px-4 py-6 space-y-1 shrink-0`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-3">Facility Hub</span>
          
          <button
            onClick={() => setActiveTab("growth")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "growth" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <Sprout className="h-4 w-4" /> Growth Cycles Tracker
          </button>

          <button
            onClick={() => setActiveTab("store")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "store" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> B2B Store & Orders
          </button>

          <button
            onClick={() => setActiveTab("sensors")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "sensors" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <Activity className="h-4 w-4" /> Sensors & AI Advisor
          </button>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block pt-4 mb-3">Advanced Tools</span>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "terminal" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <TerminalIcon className="h-4 w-4" /> Field Terminal (CRUD)
          </button>

          <button
            onClick={() => setActiveTab("dsa")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "dsa" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <Network className="h-4 w-4" /> DSA Diagnostic Sandbox
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "admin" 
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : `text-slate-400 ${darkMode ? "hover:bg-slate-900/50 hover:text-slate-200" : "hover:bg-zinc-100 hover:text-zinc-900"}`
            }`}
          >
            <Shield className="h-4 w-4" /> Admin Control Panel
          </button>
        </aside>

        {/* Dynamic Display Panel */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "growth" && (
            <GrowthDashboard
              crops={crops}
              sensors={sensors}
              onUpdateCrop={handleUpdateCrop}
              onDeleteCrop={handleDeleteCrop}
              darkMode={darkMode}
            />
          )}

          {activeTab === "store" && (
            <StoreFront
              orders={orders}
              inventory={inventory}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              darkMode={darkMode}
            />
          )}

          {activeTab === "sensors" && (
            <SensorPanel
              sensors={sensors}
              crops={crops}
              notifications={notifications}
              onUpdateSensor={handleUpdateSensor}
              onSimulateThreat={handleTriggerNotification}
              darkMode={darkMode}
            />
          )}

          {activeTab === "terminal" && (
            <TerminalCrud
              crops={crops}
              inventory={inventory}
              onAddCrop={handleUpdateCrop}
              onDeleteCrop={handleDeleteCrop}
              onAddInventory={handleAddInventory}
              onDeleteInventory={handleDeleteInventory}
              darkMode={darkMode}
            />
          )}

          {activeTab === "dsa" && (
            <DsaSandbox
              darkMode={darkMode}
            />
          )}

          {activeTab === "admin" && (
            <AdminPanel
              orders={orders}
              crops={crops}
              inventory={inventory}
              notifications={notifications}
              onTriggerNotification={handleTriggerNotification}
              isAdminAuthenticated={isAdminAuthenticated}
              onAuthenticateAdmin={setIsAdminAuthenticated}
              darkMode={darkMode}
              isOnline={isOnline}
              onToggleConnection={handleToggleConnection}
              onForceSync={performSync}
              pendingSyncCount={offlineQueue.length}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className={`border-t px-6 py-3 text-[10px] text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-2 ${darkMode ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"}`}>
        <span>VerdantOS Agronomy System Suite • Built for high-yield vertical farms.</span>
        <span className="flex items-center gap-1.5">
          <Heart className="h-3 w-3 text-red-500 animate-pulse" /> Keep it green, keep it vertical.
        </span>
      </footer>

    </div>
  );
}
