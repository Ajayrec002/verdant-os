import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { CropCycle, BusinessOrder, InventoryItem, SensorTelemetry, SystemNotification } from "./src/types";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data.json");

app.use(express.json());

// --- Helper: Read / Write Local File Database ---
interface DbState {
  crops: CropCycle[];
  orders: BusinessOrder[];
  inventory: InventoryItem[];
  sensors: SensorTelemetry[];
  notifications: SystemNotification[];
  actionLogs: { id: string; action: string; timestamp: string }[];
}

const DEFAULT_STATE: DbState = {
  crops: [
    {
      id: "crop-1",
      name: "Tuscan Sweet Basil",
      variety: "Basilico Genovese",
      stage: "Vegetative",
      growthProgress: 65,
      plantedDate: "2026-06-10",
      expectedHarvestDate: "2026-07-20",
      healthScore: 98,
      targetTemp: 23,
      currentTemp: 22.8,
      targetHumidity: 65,
      currentHumidity: 64.2,
      waterLevel: 88,
      irrigationFrequency: "4 hours",
      yieldPrediction: 4.2
    },
    {
      id: "crop-2",
      name: "Crisp Butterhead Lettuce",
      variety: "Butterhead",
      stage: "Flowering",
      growthProgress: 88,
      plantedDate: "2026-05-25",
      expectedHarvestDate: "2026-07-12",
      healthScore: 94,
      targetTemp: 19,
      currentTemp: 19.5,
      targetHumidity: 60,
      currentHumidity: 59.8,
      waterLevel: 92,
      irrigationFrequency: "6 hours",
      yieldPrediction: 5.8
    },
    {
      id: "crop-3",
      name: "Alpine Sweet Strawberries",
      variety: "Everlasting Alpine",
      stage: "Seeding",
      growthProgress: 20,
      plantedDate: "2026-06-28",
      expectedHarvestDate: "2026-08-15",
      healthScore: 100,
      targetTemp: 21,
      currentTemp: 20.8,
      targetHumidity: 70,
      currentHumidity: 71.5,
      waterLevel: 95,
      irrigationFrequency: "3 hours",
      yieldPrediction: 2.1
    },
    {
      id: "crop-4",
      name: "Superfood Baby Spinach",
      variety: "Smooth Leaf",
      stage: "Germination",
      growthProgress: 8,
      plantedDate: "2026-07-05",
      expectedHarvestDate: "2026-08-01",
      healthScore: 92,
      targetTemp: 18,
      currentTemp: 18.2,
      targetHumidity: 65,
      currentHumidity: 64.9,
      waterLevel: 90,
      irrigationFrequency: "5 hours",
      yieldPrediction: 3.5
    }
  ],
  orders: [
    {
      id: "ord-1",
      customerName: "Alice Miller",
      companyName: "FreshGro Restaurants Inc.",
      productName: "Verdant LED Stack System v3",
      quantity: 2,
      totalPrice: 4800,
      orderDate: "2026-07-01",
      deliveryDate: "2026-07-15",
      status: "Scheduled",
      notes: "Requires expert setup assistance on-site."
    },
    {
      id: "ord-2",
      customerName: "Marcus Vance",
      companyName: "Urban Agritech Co.",
      productName: "HydroDose Master Injector v2",
      quantity: 1,
      totalPrice: 1850,
      orderDate: "2026-07-05",
      deliveryDate: "2026-07-12",
      status: "In Transit",
      notes: "Deliver to loading bay 4."
    },
    {
      id: "ord-3",
      customerName: "Sarah Jenkins",
      companyName: "GreenFuture Farms",
      productName: "Verdant ClimatePod Alpha",
      quantity: 1,
      totalPrice: 12500,
      orderDate: "2026-07-08",
      deliveryDate: "2026-07-28",
      status: "Pending",
      notes: "Awaiting final site blueprint approval."
    }
  ],
  inventory: [
    {
      id: "inv-1",
      sku: "SETUP-LED-V3",
      name: "Verdant LED Stack System v3",
      category: "Farming Setup",
      quantity: 8,
      minQuantity: 3,
      price: 2400,
      unit: "Units",
      rackLocation: "Aisle A-4"
    },
    {
      id: "inv-2",
      sku: "SETUP-HYD-DOSE",
      name: "HydroDose Master Injector v2",
      category: "Farming Setup",
      quantity: 5,
      minQuantity: 2,
      price: 1850,
      unit: "Units",
      rackLocation: "Aisle B-2"
    },
    {
      id: "inv-3",
      sku: "SETUP-CLIM-POD",
      name: "Verdant ClimatePod Alpha",
      category: "Farming Setup",
      quantity: 3,
      minQuantity: 1,
      price: 12500,
      unit: "Units",
      rackLocation: "Aisle F-1"
    },
    {
      id: "inv-4",
      sku: "NUT-GROW-A",
      name: "Nitrogen Boost Hydro-Liquid A",
      category: "Nutrients",
      quantity: 120,
      minQuantity: 40,
      price: 45,
      unit: "Liters",
      rackLocation: "Zone N-1"
    },
    {
      id: "inv-5",
      sku: "NUT-BLOOM-B",
      name: "Potassium Flower Formula B",
      category: "Nutrients",
      quantity: 95,
      minQuantity: 30,
      price: 52,
      unit: "Liters",
      rackLocation: "Zone N-2"
    },
    {
      id: "inv-6",
      sku: "SEED-BASIL-I",
      name: "Genovese Basil Heirloom Seeds",
      category: "Seeds",
      quantity: 10000,
      minQuantity: 2000,
      price: 0.15,
      unit: "Grams",
      rackLocation: "Vault S-1"
    },
    {
      id: "inv-7",
      sku: "SEED-STRAW-P",
      name: "Alpine Strawberry Seeds",
      category: "Seeds",
      quantity: 4500,
      minQuantity: 1000,
      price: 0.45,
      unit: "Grams",
      rackLocation: "Vault S-2"
    },
    {
      id: "inv-8",
      sku: "SENS-TEMP-H",
      name: "Smart Humid/Temp Sensor Pro",
      category: "Sensors",
      quantity: 24,
      minQuantity: 10,
      price: 120,
      unit: "Units",
      rackLocation: "Zone S-4"
    }
  ],
  sensors: [
    {
      id: "sensor-1",
      name: "Zone A Core Probe",
      zone: "Zone A (Leafy Greens)",
      temperature: 22.8,
      humidity: 64.2,
      co2: 850,
      waterPh: 6.2,
      lightIntensity: 12500,
      status: "Healthy",
      lastUpdated: "Just now"
    },
    {
      id: "sensor-2",
      name: "Zone B Berry Sensor",
      zone: "Zone B (Strawberries)",
      temperature: 20.8,
      humidity: 71.5,
      co2: 900,
      waterPh: 5.8,
      lightIntensity: 18000,
      status: "Healthy",
      lastUpdated: "Just now"
    },
    {
      id: "sensor-3",
      name: "Zone C Seedling Bed",
      zone: "Zone C (Propagation)",
      temperature: 24.5,
      humidity: 82.1,
      co2: 650,
      waterPh: 6.5,
      lightIntensity: 8000,
      status: "Healthy",
      lastUpdated: "Just now"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      type: "weather",
      severity: "warning",
      title: "Sudden Ambient Humidity Shift",
      message: "External micro-climate humidity drop of 15% detected. Recommended irrigation adjustments scheduled for Zone B.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false
    },
    {
      id: "notif-2",
      type: "pest",
      severity: "critical",
      title: "Potential Fungus Gnat Vector Detected",
      message: "Yellow sticky traps in Zone C report anomalous flying insect counts. Automated bio-treatment dispatch advised.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: false
    }
  ],
  actionLogs: [
    {
      id: "log-1",
      action: "System Initialized",
      timestamp: new Date().toISOString()
    }
  ]
};

function readDb(): DbState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read database state, returning default", error);
  }
  return DEFAULT_STATE;
}

function writeDb(state: DbState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database state", error);
  }
}

// Ensure state exists initially
if (!fs.existsSync(DATA_FILE)) {
  writeDb(DEFAULT_STATE);
}

// --- Lazy Google GenAI Client ---
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiInstance;
}

// --- API Endpoints ---

// Get complete server state
app.get("/api/state", (req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

// Create/Update order
app.post("/api/orders", (req: Request, res: Response) => {
  const db = readDb();
  const newOrder: BusinessOrder = req.body;
  if (!newOrder.id) {
    newOrder.id = `ord-${Date.now()}`;
  }
  const index = db.orders.findIndex(o => o.id === newOrder.id);
  if (index !== -1) {
    db.orders[index] = newOrder;
  } else {
    db.orders.unshift(newOrder);
  }
  db.actionLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Order ${newOrder.id} (${newOrder.companyName}) updated/created`,
    timestamp: new Date().toISOString()
  });
  writeDb(db);
  res.json({ success: true, state: db });
});

// Update inventory
app.post("/api/inventory", (req: Request, res: Response) => {
  const db = readDb();
  const newItem: InventoryItem = req.body;
  if (!newItem.id) {
    newItem.id = `inv-${Date.now()}`;
  }
  const index = db.inventory.findIndex(i => i.id === newItem.id);
  if (index !== -1) {
    db.inventory[index] = newItem;
  } else {
    db.inventory.push(newItem);
  }
  db.actionLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Inventory updated for ${newItem.name} (Qty: ${newItem.quantity})`,
    timestamp: new Date().toISOString()
  });
  writeDb(db);
  res.json({ success: true, state: db });
});

// Delete inventory item (Terminal / Console CRUD support)
app.delete("/api/inventory/:id", (req: Request, res: Response) => {
  const db = readDb();
  const { id } = req.params;
  const index = db.inventory.findIndex(i => i.id === id);
  if (index !== -1) {
    const name = db.inventory[index].name;
    db.inventory.splice(index, 1);
    db.actionLogs.unshift({
      id: `log-${Date.now()}`,
      action: `Deleted Inventory Item: ${name}`,
      timestamp: new Date().toISOString()
    });
    writeDb(db);
    res.json({ success: true, state: db });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// Update crop cycle (Terminal CRUD support as well)
app.post("/api/crops", (req: Request, res: Response) => {
  const db = readDb();
  const newCrop: CropCycle = req.body;
  if (!newCrop.id) {
    newCrop.id = `crop-${Date.now()}`;
  }
  const index = db.crops.findIndex(c => c.id === newCrop.id);
  if (index !== -1) {
    db.crops[index] = newCrop;
  } else {
    db.crops.push(newCrop);
  }
  db.actionLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Crop cycle ${newCrop.name} (${newCrop.stage}) updated/created`,
    timestamp: new Date().toISOString()
  });
  writeDb(db);
  res.json({ success: true, state: db });
});

app.delete("/api/crops/:id", (req: Request, res: Response) => {
  const db = readDb();
  const { id } = req.params;
  const index = db.crops.findIndex(c => c.id === id);
  if (index !== -1) {
    const name = db.crops[index].name;
    db.crops.splice(index, 1);
    db.actionLogs.unshift({
      id: `log-${Date.now()}`,
      action: `Deleted crop: ${name}`,
      timestamp: new Date().toISOString()
    });
    writeDb(db);
    res.json({ success: true, state: db });
  } else {
    res.status(404).json({ error: "Crop not found" });
  }
});

// Trigger Notification / Threat Alert manually
app.post("/api/notifications", (req: Request, res: Response) => {
  const db = readDb();
  const newNotif: SystemNotification = req.body;
  newNotif.id = `notif-${Date.now()}`;
  db.notifications.unshift(newNotif);
  writeDb(db);
  res.json({ success: true, state: db });
});

// Acknowledge alert
app.post("/api/notifications/:id/acknowledge", (req: Request, res: Response) => {
  const db = readDb();
  const { id } = req.params;
  const index = db.notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    db.notifications[index].acknowledged = true;
    writeDb(db);
    res.json({ success: true, state: db });
  } else {
    res.status(404).json({ error: "Notification not found" });
  }
});

// Update real-time sensor metrics
app.post("/api/sensors", (req: Request, res: Response) => {
  const db = readDb();
  const sensorUpdate: SensorTelemetry = req.body;
  const index = db.sensors.findIndex(s => s.id === sensorUpdate.id);
  if (index !== -1) {
    db.sensors[index] = { ...db.sensors[index], ...sensorUpdate, lastUpdated: "Just now" };
    // Check if we need warning flags
    if (sensorUpdate.temperature > 28 || sensorUpdate.temperature < 15 || sensorUpdate.humidity > 85 || sensorUpdate.humidity < 40) {
      db.sensors[index].status = "Warning";
    } else {
      db.sensors[index].status = "Healthy";
    }
  }
  writeDb(db);
  res.json({ success: true, state: db });
});

// --- Synchronize offline queue ---
app.post("/api/sync", (req: Request, res: Response) => {
  const db = readDb();
  const { queue } = req.body; // Array of actions { type: 'crop_update' | 'order_create' | ..., payload: any }
  
  if (!queue || !Array.isArray(queue)) {
    return res.status(400).json({ error: "Invalid sync queue body" });
  }

  let syncCount = 0;
  for (const item of queue) {
    const { type, payload } = item;
    if (!payload) continue;

    if (type === "crop_update" || type === "crop_create") {
      const index = db.crops.findIndex(c => c.id === payload.id);
      if (index !== -1) {
        db.crops[index] = { ...db.crops[index], ...payload };
      } else {
        db.crops.push(payload);
      }
      syncCount++;
    } else if (type === "order_create" || type === "order_update") {
      const index = db.orders.findIndex(o => o.id === payload.id);
      if (index !== -1) {
        db.orders[index] = { ...db.orders[index], ...payload };
      } else {
        db.orders.unshift(payload);
      }
      syncCount++;
    } else if (type === "inventory_update" || type === "inventory_create") {
      const index = db.inventory.findIndex(i => i.id === payload.id);
      if (index !== -1) {
        db.inventory[index] = { ...db.inventory[index], ...payload };
      } else {
        db.inventory.push(payload);
      }
      syncCount++;
    } else if (type === "notif_ack") {
      const index = db.notifications.findIndex(n => n.id === payload.id);
      if (index !== -1) {
        db.notifications[index].acknowledged = true;
      }
      syncCount++;
    } else if (type === "sensor_update") {
      const index = db.sensors.findIndex(s => s.id === payload.id);
      if (index !== -1) {
        db.sensors[index] = { ...db.sensors[index], ...payload };
      }
      syncCount++;
    }
  }

  if (syncCount > 0) {
    db.actionLogs.unshift({
      id: `log-${Date.now()}`,
      action: `Successfully synchronized ${syncCount} offline operations`,
      timestamp: new Date().toISOString()
    });
    writeDb(db);
  }

  res.json({ success: true, state: db, synchronizedCount: syncCount });
});

// --- Gemini AI Smart Agronomy & Advisory API ---
app.post("/api/gemini/advisor", async (req: Request, res: Response) => {
  const { prompt, sensors, crops } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Return a beautiful mock agronomy response if no API key is set
    const mockResponses = [
      "Based on current telemetry, Zone A temperature matches ideal targets (22.8°C) for Genovese Basil. No irrigation modification needed. CO2 is optimal.",
      "Warning: Zone B (Strawberry Pod) humidity is currently sitting at 71.5%. To mitigate potential Botrytis or gray mold, adjust exhaust fans to 75% power and decrease irrigation interval slightly to 4 hours.",
      "Data-driven Advice: Your Superfood Baby Spinach in propagation is currently in Germination (Progress: 8%). Maintain highly consistent 82% ambient humidity to stimulate healthy root system formation. Increase light exposure to 9,000 lux gradually over the next 48 hours."
    ];
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return res.json({
      text: `[Offline Smart Adviser Fallback (Provide a valid Gemini API key in Settings > Secrets to unlock full live agronomy intelligence!)]\n\n${mockResponses[randomIndex]}`
    });
  }

  try {
    const formattedPrompt = `
      You are VerdantOS AI, a state-of-the-art agricultural analytics system for vertical farms. 
      Analyze the current vertical farming climate sensor readings and crops to provide data-driven irrigation advice, pest threat alerts, and yield optimization tips.
      
      Current Sensors:
      ${JSON.stringify(sensors, null, 2)}
      
      Current Crops in Growth Cycle:
      ${JSON.stringify(crops, null, 2)}
      
      User Specific Query:
      "${prompt || "Give me an operational optimization briefing."}"
      
      Provide a highly precise, human-readable, professional summary of action-items for field technicians. Keep it under 150 words, formatted clearly with bullet points.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to contact Gemini API." });
  }
});

// --- Vite and Production Server Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VerdantOS listening on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
