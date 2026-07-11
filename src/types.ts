export interface CropCycle {
  id: string;
  name: string;
  variety: string;
  stage: 'Germination' | 'Seeding' | 'Vegetative' | 'Flowering' | 'Harvest Ready';
  growthProgress: number; // 0 to 100
  plantedDate: string;
  expectedHarvestDate: string;
  healthScore: number; // 0 to 100
  targetTemp: number; // °C
  currentTemp: number;
  targetHumidity: number; // %
  currentHumidity: number;
  waterLevel: number; // %
  irrigationFrequency: string; // hours
  yieldPrediction: number; // kg per rack
}

export interface BusinessOrder {
  id: string;
  customerName: string;
  companyName: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Scheduled' | 'In Transit' | 'Delivered';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Farming Setup' | 'Nutrients' | 'Seeds' | 'Sensors';
  quantity: number;
  minQuantity: number;
  price: number;
  unit: string;
  rackLocation: string;
}

export interface SensorTelemetry {
  id: string;
  name: string;
  zone: string;
  temperature: number; // °C
  humidity: number; // %
  co2: number; // ppm
  waterPh: number; // pH scale
  lightIntensity: number; // lux
  status: 'Healthy' | 'Warning' | 'Critical';
  lastUpdated: string;
}

export interface SystemNotification {
  id: string;
  type: 'pest' | 'weather' | 'system' | 'sync' | 'info';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// Java Port DSA Types
export interface DSANode {
  id: string;
  value: string;
  next?: string | null;
  x?: number;
  y?: number;
}

export interface DSAStackItem {
  id: string;
  action: string;
  timestamp: string;
}

export interface BFSGridNode {
  row: number;
  col: number;
  isObstacle: boolean;
  isWaterSource: boolean;
  isTargetCrop: boolean;
  distance?: number;
  isVisited: boolean;
  isPath: boolean;
}
