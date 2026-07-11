import React, { useState } from "react";
import { DSANode, DSAStackItem, BFSGridNode } from "../types";
import { 
  GitCommit, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Layers, 
  RefreshCw, 
  Search, 
  Map, 
  Network,
  Droplet,
  Grid,
  CheckCircle,
  Play
} from "lucide-react";

interface DsaSandboxProps {
  darkMode: boolean;
}

export default function DsaSandbox({ darkMode }: DsaSandboxProps) {
  const [activeTab, setActiveTab] = useState<"linkedlist" | "stack" | "bfs">("linkedlist");

  // --- Linked List State ---
  const [listHead, setListHead] = useState<DSANode[]>([
    { id: "node-1", value: "Sensor Pod A", next: "node-2" },
    { id: "node-2", value: "Solenoid Valve B", next: "node-3" },
    { id: "node-3", value: "Nutrient Injector C", next: null }
  ]);
  const [listInputValue, setListInputValue] = useState("");

  const handleAppendLinkedList = () => {
    if (!listInputValue.trim()) return;
    const newId = `node-${Date.now()}`;
    const newNode: DSANode = {
      id: newId,
      value: listInputValue.trim(),
      next: null
    };

    setListHead(prev => {
      if (prev.length === 0) return [newNode];
      const updated = [...prev];
      // Set previous tail's next to the new ID
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        next: newId
      };
      return [...updated, newNode];
    });
    setListInputValue("");
  };

  const handlePrependLinkedList = () => {
    if (!listInputValue.trim()) return;
    const newId = `node-${Date.now()}`;
    const newNode: DSANode = {
      id: newId,
      value: listInputValue.trim(),
      next: listHead.length > 0 ? listHead[0].id : null
    };

    setListHead(prev => [newNode, ...prev]);
    setListInputValue("");
  };

  const handleDeleteNode = (id: string) => {
    setListHead(prev => {
      const filtered = prev.filter(n => n.id !== id);
      // Re-stitch pointers
      const restitched = filtered.map((node, idx) => {
        const nextNode = filtered[idx + 1];
        return {
          ...node,
          next: nextNode ? nextNode.id : null
        };
      });
      return restitched;
    });
  };

  // --- Stack State (LIFO Agronomy Undo actions) ---
  const [stack, setStack] = useState<DSAStackItem[]>([
    { id: "st-1", action: "Calibrate Sensor Pod A", timestamp: "10:15" },
    { id: "st-2", action: "Toggle Zone B LED Solenoid", timestamp: "10:28" },
    { id: "st-3", action: "Trigger Flushing Cycle Zone C", timestamp: "10:45" }
  ]);
  const [stackInputValue, setStackInputValue] = useState("");

  const handlePushStack = () => {
    if (!stackInputValue.trim()) return;
    const newItem: DSAStackItem = {
      id: `st-${Date.now()}`,
      action: stackInputValue.trim(),
      timestamp: new Date().toTimeString().slice(0, 5)
    };
    setStack(prev => [...prev, newItem]);
    setStackInputValue("");
  };

  const handlePopStack = () => {
    if (stack.length === 0) return;
    setStack(prev => prev.slice(0, prev.length - 1));
  };


  // --- BFS Pathfinding State ---
  // Create 5x5 shelf grid
  const initialGrid = (): BFSGridNode[][] => {
    const grid: BFSGridNode[][] = [];
    for (let r = 0; r < 5; r++) {
      const row: BFSGridNode[] = [];
      for (let c = 0; c < 5; c++) {
        row.push({
          row: r,
          col: c,
          isObstacle: (r === 1 && c === 1) || (r === 2 && c === 3) || (r === 3 && c === 1),
          isWaterSource: r === 0 && c === 0,
          isTargetCrop: r === 4 && c === 4,
          isVisited: false,
          isPath: false
        });
      }
      grid.push(row);
    }
    return grid;
  };

  const [bfsGrid, setBfsGrid] = useState<BFSGridNode[][]>(initialGrid());
  const [bfsRunning, setBfsRunning] = useState(false);
  const [bfsLog, setBfsLog] = useState<string[]>([]);

  const handleToggleCell = (row: number, col: number) => {
    if (bfsRunning) return;
    setBfsGrid(prev => {
      const nextG = prev.map(r => r.map(c => ({ ...c })));
      const cell = nextG[row][col];
      if (cell.isWaterSource || cell.isTargetCrop) return prev; // Don't toggle sources
      cell.isObstacle = !cell.isObstacle;
      return nextG;
    });
  };

  const handleResetBfs = () => {
    setBfsGrid(initialGrid());
    setBfsLog([]);
    setBfsRunning(false);
  };

  // Perform Breadth-First Search (BFS) shortest path visualizer
  const handleRunBfs = async () => {
    setBfsRunning(true);
    setBfsLog(["Initializing BFS traversal on 5x5 vertical hydroponic node grid...", "Root Water Source Node [0,0] pushed to queue."]);
    
    // Create copy of grid
    const grid = bfsGrid.map(r => r.map(c => ({ ...c, isVisited: false, isPath: false, distance: undefined })));
    setBfsGrid(grid);

    // Queue for BFS
    const queue: [number, number][] = [];
    queue.push([0, 0]);
    grid[0][0].isVisited = true;
    grid[0][0].distance = 0;

    // Parent mapping for path reconstruction
    const parents: { [key: string]: string } = {};

    let targetFound = false;
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      
      // Delay for visual animation step
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setBfsGrid([...grid]);
      setBfsLog(prev => [...prev, `Visiting Node [${r},${c}] (Queue size: ${queue.length})`]);

      if (r === 4 && c === 4) {
        targetFound = true;
        setBfsLog(prev => [...prev, "SUCCESS: Target Hydroponic Crop [4,4] reached! Calculating shortest irrigation path."]);
        break;
      }

      // Check neighbors
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
          const neighbor = grid[nr][nc];
          if (!neighbor.isVisited && !neighbor.isObstacle) {
            neighbor.isVisited = true;
            neighbor.distance = (grid[r][c].distance || 0) + 1;
            parents[`${nr},${nc}`] = `${r},${c}`;
            queue.push([nr, nc]);
          }
        }
      }
    }

    if (targetFound) {
      // Reconstruct Path
      let curr = "4,4";
      while (curr) {
        const [r, c] = curr.split(",").map(Number);
        grid[r][c].isPath = true;
        curr = parents[curr];
        if (curr === "0,0") {
          grid[0][0].isPath = true;
          break;
        }
      }
      setBfsGrid([...grid]);
      setBfsLog(prev => [...prev, `Pathfound! Shortest distance: ${grid[4][4].distance} hops. Optimal nutrient pipeline locked.`]);
    } else {
      setBfsLog(prev => [...prev, "FAILURE: No possible irrigation path to Target Crop due to hydroponic infrastructure obstructions."]);
    }
    setBfsRunning(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 gap-6 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("linkedlist")}
          className={`pb-3 font-semibold transition-all relative cursor-pointer ${activeTab === "linkedlist" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "linkedlist" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          <span className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" /> Ported Linked List
          </span>
        </button>

        <button
          onClick={() => setActiveTab("stack")}
          className={`pb-3 font-semibold transition-all relative cursor-pointer ${activeTab === "stack" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "stack" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Ported Stack LIFO
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bfs")}
          className={`pb-3 font-semibold transition-all relative cursor-pointer ${activeTab === "bfs" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {activeTab === "bfs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          <span className="flex items-center gap-2">
            <Network className="h-4 w-4" /> Irrigation BFS Finder
          </span>
        </button>
      </div>

      {/* Linked List Visualizer */}
      {activeTab === "linkedlist" && (
        <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Hydroponic Sensor Singly Linked List
            </h2>
            <p className="text-xs text-zinc-400">
              Visualizes telemetry components linked sequentially using custom `next` memory pointers ported from our Java DSA models.
            </p>
          </div>

          {/* Linked List chain render */}
          <div className="flex flex-wrap items-center gap-3 p-5 bg-slate-950/40 rounded-xl min-h-24 border border-slate-850 overflow-x-auto">
            {listHead.length === 0 ? (
              <span className="text-zinc-500 font-mono text-xs text-center w-full">Singly LinkedList Empty [Head = null]</span>
            ) : (
              listHead.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div className="flex items-center">
                    {/* Node block */}
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono relative min-w-[130px] shadow-sm">
                      <button 
                        onClick={() => handleDeleteNode(node.id)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600/80 hover:bg-red-500 p-1 rounded text-white cursor-pointer transition-colors"
                        title="Delete element"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="text-emerald-400 font-bold mb-1">Node {index}</div>
                      <div className="text-slate-200 truncate font-semibold">{node.value}</div>
                      <div className="border-t border-slate-900 mt-2.5 pt-1.5 text-[9px] text-zinc-500 flex justify-between">
                        <span>next_ptr:</span>
                        <span className="text-blue-400">{node.next ? "0x" + node.next.slice(-4) : "NULL"}</span>
                      </div>
                    </div>

                    {/* Arrow to next */}
                    {index < listHead.length - 1 && (
                      <ArrowRight className="h-5 w-5 mx-2 text-zinc-600 shrink-0" />
                    )}
                  </div>
                </React.Fragment>
              ))
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter node component name (e.g., pH Probe v2)..."
              value={listInputValue}
              onChange={(e) => setListInputValue(e.target.value)}
              className={`flex-1 p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 focus:outline-hidden" : "bg-white border-zinc-300 text-zinc-900"}`}
            />
            <div className="flex gap-2">
              <button
                onClick={handlePrependLinkedList}
                className="bg-slate-900 hover:bg-slate-850 text-zinc-200 border border-slate-800 text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold transition-all"
              >
                <Plus className="h-4 w-4 text-emerald-400" /> Prepend Head
              </button>
              <button
                onClick={handleAppendLinkedList}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-md hover:shadow-emerald-950/20"
              >
                <Plus className="h-4 w-4" /> Append Tail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stack LIFO Visualizer */}
      {activeTab === "stack" && (
        <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              LIFO Action History Stack
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Simulates a Java-style <code>Stack&lt;String&gt;</code> capturing the latest automated actions deployed on active vertical farming hardware units. LIFO allows for instant undoing/popping!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Action history stack list visual */}
            <div className="flex flex-col-reverse justify-end gap-2 p-4 bg-slate-950/40 rounded-xl min-h-64 border border-slate-850">
              {stack.length === 0 ? (
                <div className="text-center text-zinc-500 font-mono text-xs my-auto">Stack is Empty [Size = 0]</div>
              ) : (
                stack.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-3.5 rounded-xl border font-mono text-xs flex justify-between items-center transition-all ${index === stack.length - 1 ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-slate-950 border-slate-850 text-zinc-400"}`}
                  >
                    <div>
                      <span className="text-zinc-600 text-[10px] mr-2">[{index}]</span>
                      <span>{item.action}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <span>{item.timestamp}</span>
                      {index === stack.length - 1 && (
                        <span className="bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">TOP</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stack control form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Simulate Deployed Operations (Push to Stack)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Purge Zone A lines..."
                    value={stackInputValue}
                    onChange={(e) => setStackInputValue(e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg border text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500 focus:outline-hidden" : "bg-white border-zinc-300 text-zinc-950"}`}
                  />
                  <button
                    onClick={handlePushStack}
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-950 font-mono px-5 rounded-lg text-xs font-bold cursor-pointer uppercase transition-all shadow-md"
                  >
                    PUSH
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 space-y-2.5">
                <h4 className="text-xs uppercase font-mono font-bold text-zinc-400 tracking-wider">LIFO operations explanation</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Calling <code className="text-indigo-400">pop()</code> returns and removes the element at the top of the stack (the most recently deployed action).
                </p>
                <button
                  onClick={handlePopStack}
                  disabled={stack.length === 0}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-zinc-200 text-xs py-2.5 rounded-lg font-bold cursor-pointer disabled:opacity-40 transition-all font-mono uppercase"
                >
                  POP (Undo Action / Remove Top)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* BFS Irrigation Pathway Visualizer */}
      {activeTab === "bfs" && (
        <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel border-slate-800 text-white" : "bg-white border-zinc-200 text-zinc-900"} transition-all shadow-md space-y-4`}>
          <div>
            <h2 className="text-slate-100 font-bold flex items-center gap-2 text-base">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
              Drone Irrigation Pathfinding (BFS shortest path)
            </h2>
            <p className="text-xs text-zinc-400">
              Simulates a Breadth-First Search (BFS) pathfinding algorithm on a 2D farming shelf. Finding the shortest path from the core water source to isolated dry crops around structural steel obstacles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Grid display */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-850">
              <div className="grid grid-cols-5 gap-2 max-w-sm w-full aspect-square">
                {bfsGrid.map((row, rIdx) => 
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleToggleCell(rIdx, cIdx)}
                      className={`
                        aspect-square rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer select-none
                        ${cell.isWaterSource 
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                          : cell.isTargetCrop 
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                          : cell.isObstacle 
                          ? "bg-slate-900 border-slate-800 text-slate-600" 
                          : cell.isPath 
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 animate-pulse" 
                          : cell.isVisited 
                          ? "bg-indigo-950/30 border-indigo-900/40 text-indigo-400" 
                          : "bg-slate-950 border-slate-850 text-slate-600 hover:border-slate-700"}
                      `}
                    >
                      {cell.isWaterSource ? (
                        <Droplet className="h-5 w-5 text-blue-400 animate-bounce" />
                      ) : cell.isTargetCrop ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : cell.isObstacle ? (
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">STEEL</span>
                      ) : (
                        <div className="flex flex-col items-center font-mono text-[10px]">
                          <span>{rIdx},{cIdx}</span>
                          {cell.distance !== undefined && (
                            <span className="text-[8px] opacity-80 mt-0.5 text-indigo-400">d={cell.distance}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600/30 border border-blue-500 rounded" /> WATER SOURCE</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-600/30 border border-emerald-500 rounded" /> TARGET BASIL</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded" /> STEEL WALL</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500/30 border border-indigo-500 rounded" /> PIPELINE</span>
              </div>
            </div>

            {/* Algorithm stats & actions */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleRunBfs}
                  disabled={bfsRunning}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer font-mono uppercase"
                >
                  <Play className="h-3.5 w-3.5" /> Start Search
                </button>
                <button
                  onClick={handleResetBfs}
                  disabled={bfsRunning}
                  className="bg-slate-900 hover:bg-slate-850 text-zinc-200 text-xs px-4 py-2.5 rounded-lg border border-slate-800 font-semibold cursor-pointer font-mono uppercase"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider font-bold">Traversal Trace Log</span>
                <div className="h-44 overflow-y-auto bg-slate-950/80 text-emerald-400 font-mono text-[11px] p-3 rounded-xl border border-slate-900 space-y-1.5 shadow-inner">
                  {bfsLog.length === 0 ? (
                    <span className="text-zinc-600 italic">Click "Start Search" to execute BFS shortest path search...</span>
                  ) : (
                    bfsLog.map((log, idx) => <div key={idx}>&gt; {log}</div>)
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
