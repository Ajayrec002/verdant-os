import React, { useState } from "react";
import { BusinessOrder, InventoryItem } from "../types";
import { 
  ShoppingBag, 
  Truck, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  FileText,
  Building,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";

interface StoreFrontProps {
  orders: BusinessOrder[];
  inventory: InventoryItem[];
  onAddOrder: (order: BusinessOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: BusinessOrder["status"]) => void;
  darkMode: boolean;
}

export default function StoreFront({
  orders,
  inventory,
  onAddOrder,
  onUpdateOrderStatus,
  darkMode
}: StoreFrontProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "schedule">("catalog");
  const [showOrderModal, setShowOrderModal] = useState<InventoryItem | null>(null);
  
  // New Order Form state
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOrderModal || !customerName || !companyName) return;

    const price = showOrderModal.price * quantity;
    const deliveryOffsetDays = 7 + Math.floor(Math.random() * 10);
    const deliveryDate = new Date(Date.now() + deliveryOffsetDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newOrder: BusinessOrder = {
      id: `ord-${Date.now()}`,
      customerName,
      companyName,
      productName: showOrderModal.name,
      quantity,
      totalPrice: price,
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate,
      status: "Pending",
      notes: notes || undefined
    };

    onAddOrder(newOrder);
    
    // Reset Form
    setCustomerName("");
    setCompanyName("");
    setQuantity(1);
    setNotes("");
    setShowOrderModal(null);
    setActiveTab("orders");
  };

  const catalogProducts = inventory.filter(i => i.category === "Farming Setup" || i.category === "Sensors");

  const getStatusColor = (status: BusinessOrder["status"]) => {
    switch(status) {
      case "Pending": return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30";
      case "Scheduled": return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      case "In Transit": return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30";
      case "Delivered": return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 text-sm font-semibold transition-all relative uppercase tracking-wider font-mono ${activeTab === "catalog" ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "catalog" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />}
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> B2B Catalog
          </span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-semibold transition-all relative uppercase tracking-wider font-mono ${activeTab === "orders" ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "orders" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />}
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Orders ({orders.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 text-sm font-semibold transition-all relative uppercase tracking-wider font-mono ${activeTab === "schedule" ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "schedule" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />}
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Logistics Timeline
          </span>
        </button>
      </div>

      {/* Catalog View */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Commercial Vertical Farming Systems
              </h2>
              <p className="text-xs text-zinc-400">Deploy modular, high-yield hydroponic and climate-integrated hardware setups for automated commercial farming.</p>
            </div>
            <div className={`p-2.5 rounded-lg border ${darkMode ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"} text-xs flex items-center gap-2`}>
              <ShieldCheck className="h-4 w-4" />
              <span>Full 3-Year Enterprise Warranty & Installation included</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogProducts.map(product => (
              <div 
                key={product.id} 
                className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "glass-panel border-slate-800 hover:border-slate-700" : "bg-white border-zinc-200 hover:border-zinc-300"} transition-all shadow-md group`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${product.category === "Farming Setup" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                      {product.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">SKU: {product.sku}</span>
                  </div>
                  <h3 className="text-base font-bold mb-1 text-slate-200 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                  <p className="text-xs text-zinc-400 mb-4">Located in {product.rackLocation}. Available in warehouse stock: <span className="font-semibold text-zinc-200">{product.quantity}</span>.</p>
                  
                  {/* Dynamic description mock details */}
                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Integration Protocol</span>
                      <span className="font-semibold text-zinc-300">Modbus/Zigbee</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Telemetry Enabled</span>
                      <span className="font-semibold text-emerald-400">Yes (Real-time)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/10 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Enterprise Price</span>
                    <span className="text-lg font-bold text-emerald-500 font-mono">${product.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(product)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Configure Order <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Management View */}
      {activeTab === "orders" && (
        <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
          <div className="mb-6">
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              Active Enterprise Business Orders
            </h2>
            <p className="text-xs text-zinc-400">Review corporate contracts, alter delivery milestones, and dispatch setup equipment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`border-b ${darkMode ? "border-slate-850 text-slate-400 font-mono text-[10px] tracking-wider uppercase" : "border-zinc-200 text-zinc-600 font-semibold text-xs"}`}>
                  <th className="py-3 px-2">Contract ID</th>
                  <th className="py-3 px-2">Business / Company</th>
                  <th className="py-3 px-2">Ordered Product</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Delivery Target</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/10 dark:divide-slate-850/50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                      No active commercial orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-900/40 transition-all text-xs">
                      <td className="py-3.5 px-2 font-mono text-zinc-500">{order.id}</td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-200">{order.companyName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono uppercase">{order.customerName}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-medium text-slate-200">{order.productName}</div>
                        <div className="text-[10px] text-zinc-400">Qty: {order.quantity} units</div>
                      </td>
                      <td className="py-3.5 px-2 font-mono font-black text-emerald-400">${order.totalPrice.toLocaleString()}</td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-1 font-mono text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{order.deliveryDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as BusinessOrder["status"])}
                          className={`p-1.5 text-[10px] font-semibold font-mono rounded-lg border ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logistics Schedule & Calendar Timeline View */}
      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
            <div className="mb-6">
              <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                Logistics Dispatch Roadmaps
              </h2>
              <p className="text-xs text-zinc-400">Real-time scheduling showing dispatch roadmap for current system build deployments</p>
            </div>

            {/* Simulated Gantt / Logistics Roadmap */}
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className={`p-5 rounded-xl border ${darkMode ? "bg-slate-950/40 border-slate-900" : "bg-zinc-50 border-zinc-200"} relative`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <div>
                      <div className="text-xs font-mono text-zinc-500">{order.id} • {order.companyName}</div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{order.productName}</div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Visual Logistics Pipeline */}
                  <div className="relative mt-2 mb-2">
                    <div className="h-1 bg-slate-900 rounded-full w-full absolute top-1/2 -translate-y-1/2" />
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${order.status === "Pending" || order.status === "Scheduled" || order.status === "In Transit" || order.status === "Delivered" ? "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-900 text-slate-500"}`}>1</div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">Pending</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${order.status === "Scheduled" || order.status === "In Transit" || order.status === "Delivered" ? "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-900 text-slate-500"}`}>2</div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">Scheduled</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${order.status === "In Transit" || order.status === "Delivered" ? "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-900 text-slate-500"}`}>3</div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">Transit</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${order.status === "Delivered" ? "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-900 text-slate-500"}`}>4</div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">Arrived</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-slate-900 pt-3">
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Target Delivery: <strong className={darkMode ? "text-slate-100" : "text-zinc-900"}>{order.deliveryDate}</strong></span>
                    </div>
                    {order.notes && (
                      <div className="flex items-center gap-1 italic text-[11px] text-zinc-500">
                        <span>"{order.notes}"</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5 text-indigo-400 uppercase tracking-wider font-mono">
                <Clock className="h-4 w-4" /> Logistics KPI
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono uppercase text-slate-400">
                    <span>On-Time Delivery Rate</span>
                    <span className="font-semibold text-emerald-400">98.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" style={{ width: "98.5%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono uppercase text-slate-400">
                    <span>Transit Utilization</span>
                    <span className="font-semibold text-indigo-400">82.1%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" style={{ width: "82.1%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md`}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-emerald-400 uppercase tracking-wider font-mono">
                <MapPin className="h-4 w-4" /> Assembly Hubs
              </h3>
              <p className="text-xs text-zinc-400 mb-4">Enterprise systems are pre-assembled at primary regional micro-factories:</p>
              <ul className="text-xs space-y-2.5 text-zinc-300 font-mono">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Austin Micro-Assembly</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Rotterdam Agritech Center</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Tokyo Urban Farm Base</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Modal / Checkout Form */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} shadow-xl space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Enterprise Checkout</span>
                <h3 className="text-lg font-bold">{showOrderModal.name}</h3>
              </div>
              <button 
                onClick={() => setShowOrderModal(null)} 
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Company / Enterprise Name</label>
                <div className="relative">
                  <Building className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. GreenFoods LLC"
                    className={`w-full pl-9 p-2 rounded border text-xs ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Authorized Contact Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`w-full pl-9 p-2 rounded border text-xs ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className={`w-full p-2 rounded border text-xs ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Unit Price</label>
                  <div className={`w-full p-2 rounded border text-xs font-mono font-bold ${darkMode ? "bg-zinc-950/40 border-zinc-850" : "bg-zinc-100/50 border-zinc-200"}`}>
                    ${showOrderModal.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Special Deployment Instructions / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Rack must fit 2.4m height limit..."
                  className={`w-full p-2 rounded border text-xs h-16 resize-none ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-300 text-zinc-900"}`}
                />
              </div>

              <div className={`p-3 rounded-lg border ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono">${(showOrderModal.price * quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                  <span>Shipping & Assembly</span>
                  <span className="text-emerald-500 uppercase font-bold">FREE (B2B Promo)</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-zinc-800/10 dark:border-zinc-800 mt-2 pt-2">
                  <span>Total Enterprise Contract</span>
                  <span className="font-mono text-emerald-500">${(showOrderModal.price * quantity).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(null)}
                  className={`px-4 py-2 rounded font-medium border ${darkMode ? "border-zinc-700 hover:bg-zinc-850 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-600"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
                >
                  Confirm Contract Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
