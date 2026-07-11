# VerdantOS: High-Yield Vertical Farming Operations Suite

VerdantOS is a full-stack agronomic operations platform engineered specifically for modern vertical farming setups. It addresses everything from commercial B2B sales of farming hardware stacks and automated delivery scheduling, to real-time telemetry monitoring, AI agronomy consultations, offline field fieldwork, and dynamic data-structures analysis.

## 🌟 Core Features

1. **Active Crop Cycles Dashboard (`GrowthDashboard.tsx`)**
   - Real-time tracking of vertical hydroponic stacks (stages: Germination, Seeding, Vegetative, Flowering, Harvest Ready).
   - High-contrast health meters, target climate versus actual readings, and yield projections.
   - Comprehensive dynamic charts built with Recharts visualizing actual vs target performance.

2. **Enterprise B2B Hardware Catalog & Delivery Scheduling (`StoreFront.tsx`)**
   - Browse and buy vertical farming components (e.g., LED Stacks, ClimatePods, automated mineral dosing controllers).
   - Enterprise contract and order logs tracking total sales.
   - Visualized delivery logistics schedule showing multi-stage automated dispatch paths.

3. **Modbus Telemetry & AI Agronomist (`SensorPanel.tsx`)**
   - Live telemetry monitoring for Temperature, Relative Humidity, CO2 (ppm), and Water pH level.
   - Micro-climate simulator to test automated threshold adjustments (e.g., thermal spike cooling triggers).
   - Intelligent agronomy advice powered by **Gemini 3.5 Flash** (via `@google/genai` SDK on Express), providing custom-tailored stress analysis and photoperiod guides.

4. **Secure Field CLI Terminal (`TerminalCrud.tsx`)**
   - Retro command-line terminal executing robust CRUD operations on crops and inventory.
   - Supports commands like `help`, `list crops`, `add crop [name] [variety]`, and `delete crop [id]`.
   - Replicates fully-featured offline console mechanics.

5. **Visual DSA Sandbox (`DsaSandbox.tsx`)**
   - Visualizes core algorithms and structures ported from Java models.
   - **Linked List Visualizer**: Singly linked chain of sensory nodes mapping the `next` node pointer.
   - **Stack Visualizer (LIFO)**: Emulates a hardware action undo buffer supporting `PUSH` and `POP`.
   - **BFS Shortest Path Finder**: Pathfinds optimal irrigation pipeline routings through vertical shelf obstacles, tracking distances step-by-step.

6. **Admin Control Panel & Exports (`AdminPanel.tsx`)**
   - Secure authenticated admin dashboard (using password verification).
   - Simulated offline canopy mode switcher to cache operations.
   - Instant data exports to **CSV Spreadsheet** and **JSON Telemetry Packets** for stakeholder reporting.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (v19) + Vite, styled with **Tailwind CSS**. Designed mobile-responsive with a primary high-contrast dark theme preferred by field technicians.
- **Backend**: **Express (Node.js)** server executing secure local database file-based persistence (`data.json`) and secure API routing.
- **AI Engine**: **Gemini 3.5 Flash** model utilizing the `@google/genai` SDK with lazy-initialization to secure API keys on the server.
- **Visuals**: **Lucide React** icons and **Recharts** interactive data area and bar graphics.

---

## 💾 Offline Support & Real-Time Sync Schema

Field technicians in remote farming canopies often experience network dropouts. VerdantOS implements a resilient **Offline-First Synchronization Engine**:
1. When **Offline Mode** is triggered (manually or via network loss):
   - All write operations (add crops, place orders, update sensors) update the client state immediately for an active, responsive interface.
   - Writes are converted into operations and queued inside an `offlineQueue` in browser `localStorage`.
2. When the connection is **Restored**:
   - The system initiates a synchronization handshake, POSTing the queue array to the server's `/api/sync` endpoint.
   - The server replays the actions in sequence, merges them with the master database (`data.json`), and broadcasts an updated state package.
   - This ensures zero data loss during canopy connectivity dropouts.

---

## 📦 Run & Deploy

To launch the app locally in development mode:
```bash
npm run dev
```

To compile the production build:
```bash
npm run build
```
This compiles the React bundle into static files, and uses `esbuild` to compile the Express `server.ts` into a fast, standalone `dist/server.cjs` file bypassing Node's strict ESM requirements.

To run the production-ready build:
```bash
npm run start
```
