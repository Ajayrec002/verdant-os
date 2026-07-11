import React, { useState, useRef, useEffect } from "react";
import { CropCycle, InventoryItem } from "../types";
import { Terminal, Shield, Cpu, RefreshCw } from "lucide-react";

interface TerminalCrudProps {
  crops: CropCycle[];
  inventory: InventoryItem[];
  onAddCrop: (crop: CropCycle) => void;
  onDeleteCrop: (id: string) => void;
  onAddInventory: (item: InventoryItem) => void;
  onDeleteInventory: (id: string) => void;
  darkMode: boolean;
}

export default function TerminalCrud({
  crops,
  inventory,
  onAddCrop,
  onDeleteCrop,
  onAddInventory,
  onDeleteInventory,
  darkMode
}: TerminalCrudProps) {
  const [history, setHistory] = useState<string[]>([
    "VerdantOS [Version 2.4.11]",
    "(c) 2026 Verdant Agricultural Analytics Corp. All rights reserved.",
    "",
    "Enter 'help' to view available secure CRUD commands for vertical farming stacks."
  ]);
  const [inputVal, setInputVal] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    const newHistory = [...history, `verdant-tech@field-terminal:~$ ${command}`];
    const parts = command.split(" ");
    const primary = parts[0].toLowerCase();

    switch (primary) {
      case "help":
        newHistory.push(
          "Available Secure CRUD Commands:",
          "  help                             Display this help catalog",
          "  list crops                       Renders active vertical crop cycles",
          "  list inventory                   Renders hardware & nutrient warehouse inventory",
          "  add crop [name] [variety]        Inserts new vegetative crop record (e.g. add crop Tuscan_Basil Genovese)",
          "  add inv [name] [qty] [price]     Inserts inventory part record (e.g. add inv LED_Grow_Bulb 50 120)",
          "  delete crop [id]                 Removes a crop cycle stack by ID from the db",
          "  delete inv [id]                  Removes an inventory sku from warehousing",
          "  clear                            Resets the visual console logs"
        );
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      case "list":
        const sub = parts[1]?.toLowerCase();
        if (sub === "crops") {
          newHistory.push("=== ACTIVE VERTICAL CROP CYCLES IN SYSTEM ===");
          if (crops.length === 0) {
            newHistory.push("No crop records found.");
          } else {
            crops.forEach(c => {
              newHistory.push(`[ID: ${c.id}] Name: ${c.name} | Stage: ${c.stage} | Health: ${c.healthScore}% | Progress: ${c.growthProgress}%`);
            });
          }
        } else if (sub === "inventory" || sub === "inv") {
          newHistory.push("=== WAREHOUSED INVENTORY ITEMS ===");
          if (inventory.length === 0) {
            newHistory.push("No inventory items found.");
          } else {
            inventory.forEach(i => {
              newHistory.push(`[ID: ${i.id}] SKU: ${i.sku} | Name: ${i.name} | Qty: ${i.quantity} | Price: $${i.price}`);
            });
          }
        } else {
          newHistory.push("Invalid subcommand. Try 'list crops' or 'list inventory'.");
        }
        break;

      case "add":
        const type = parts[1]?.toLowerCase();
        if (type === "crop") {
          // add crop [name] [variety]
          const cropName = parts[2]?.replace(/_/g, " ");
          const variety = parts[3]?.replace(/_/g, " ");
          if (!cropName || !variety) {
            newHistory.push("Error: Missing parameters. Usage: add crop [name] [variety]");
          } else {
            const newCrop: CropCycle = {
              id: `crop-${Date.now()}`,
              name: cropName,
              variety: variety,
              stage: "Germination",
              growthProgress: 5,
              plantedDate: new Date().toISOString().split("T")[0],
              expectedHarvestDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              healthScore: 98,
              targetTemp: 22,
              currentTemp: 21.8,
              targetHumidity: 65,
              currentHumidity: 65.4,
              waterLevel: 90,
              irrigationFrequency: "4 hours",
              yieldPrediction: 4.0
            };
            onAddCrop(newCrop);
            newHistory.push(`[Database Success] Inserted crop: ${cropName} with ID: ${newCrop.id}`);
          }
        } else if (type === "inv") {
          // add inv [name] [qty] [price]
          const invName = parts[2]?.replace(/_/g, " ");
          const qty = Number(parts[3]);
          const price = Number(parts[4]);
          if (!invName || isNaN(qty) || isNaN(price)) {
            newHistory.push("Error: Missing or invalid parameters. Usage: add inv [name] [qty] [price]");
          } else {
            const newItem: InventoryItem = {
              id: `inv-${Date.now()}`,
              sku: `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
              name: invName,
              category: "Farming Setup",
              quantity: qty,
              minQuantity: 5,
              price: price,
              unit: "Units",
              rackLocation: "Aisle C-1"
            };
            onAddInventory(newItem);
            newHistory.push(`[Database Success] Inserted inventory sku: ${newItem.sku} (${invName})`);
          }
        } else {
          newHistory.push("Invalid 'add' parameter. Try 'add crop' or 'add inv'.");
        }
        break;

      case "delete":
        const delType = parts[1]?.toLowerCase();
        const delId = parts[2];
        if (!delType || !delId) {
          newHistory.push("Error: Missing parameters. Usage: delete [crop|inv] [id]");
        } else {
          if (delType === "crop") {
            const exists = crops.some(c => c.id === delId);
            if (exists) {
              onDeleteCrop(delId);
              newHistory.push(`[Database Success] Deleted Crop Stack ID: ${delId}`);
            } else {
              newHistory.push(`Error: Crop record with ID ${delId} not found.`);
            }
          } else if (delType === "inv" || delType === "inventory") {
            const exists = inventory.some(i => i.id === delId);
            if (exists) {
              onDeleteInventory(delId);
              newHistory.push(`[Database Success] Deleted Inventory SKU ID: ${delId}`);
            } else {
              newHistory.push(`Error: Inventory record with ID ${delId} not found.`);
            }
          } else {
            newHistory.push("Invalid type. Usage: delete [crop|inv] [id]");
          }
        }
        break;

      default:
        newHistory.push(`bash: command not found: ${primary}. Enter 'help' to see authorized secure utilities.`);
        break;
    }

    setHistory(newHistory);
    setInputVal("");
  };

  return (
    <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
            VerdantOS Administrative Console
          </h2>
          <p className="text-xs text-zinc-400 font-mono text-[11px]">Direct command-line CRUD interface over vertical agronomic records</p>
        </div>
        <div className="flex gap-3 text-[10px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> SECURE_SHELL</span>
          <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-indigo-400" /> NODE_01_CONNECTED</span>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="bg-slate-950/90 text-emerald-400 font-mono text-xs p-4 rounded-xl h-80 overflow-y-auto space-y-2 shadow-inner border border-slate-900 select-text relative">
        <div className="absolute top-2 right-3 flex gap-1.5 opacity-50">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </div>
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal input form */}
      <form onSubmit={handleCommand} className="flex flex-col sm:flex-row gap-2 font-mono">
        <div className="flex-1 flex gap-2 items-center bg-slate-950 border border-slate-850 p-2 rounded-lg focus-within:border-emerald-500 transition-all">
          <span className="text-xs text-emerald-500 whitespace-nowrap pl-1">verdant-tech@admin-cli:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type 'help' to start..."
            className="flex-1 bg-transparent text-emerald-400 font-mono text-xs focus:outline-hidden"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs px-5 py-2.5 rounded-lg font-bold font-mono transition-all cursor-pointer uppercase shadow-md hover:shadow-emerald-950/30"
        >
          EXECUTE
        </button>
      </form>

      <div className="text-[10px] text-zinc-500 font-mono">
        *SYSTEM_ADVISE: Use underscores for spaced parameters (e.g., "add crop Butterhead_Lettuce Butter_Variety").
      </div>
    </div>
  );
}
