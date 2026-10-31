export type DimStatus = "verified" | "approximate" | "assumed";

export type EqItem = {
  tag: string;
  name: string;
  service: string;
  unit: string;
  type: string;
  diameter?: number;
  height?: number;
  volume?: number;
  emptyWt?: number;
  status: string;
  dimStatus: DimStatus;
  source: string;
  notes?: string;
  pos: [number, number, number];
  kind: "settling" | "column" | "tank" | "pit" | "silo" | "kiln" | "exchanger";
};

export const EQUIPMENT: EqItem[] = [
  {
    tag: "PIT-01",
    name: "Receiving pits",
    service: "Raw feed & wash water",
    unit: "Reception",
    type: "Concrete pits with yellow handrail",
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    notes: "Left pit solids / right pit clear water",
    pos: [-18, 0, 8],
    kind: "pit",
  },
  {
    tag: "T-21",
    name: "Settling tank T-21",
    service: "Primary settling",
    unit: "Process",
    type: "Vertical cone-bottom stainless",
    diameter: 3.2,
    height: 5.8,
    volume: 28,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [-2, 0, -2],
    kind: "settling",
  },
  {
    tag: "T-22",
    name: "Settling tank T-22",
    service: "Primary settling",
    unit: "Process",
    type: "Vertical cone-bottom stainless",
    diameter: 3.2,
    height: 5.8,
    volume: 28,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [3.5, 0, -2],
    kind: "settling",
  },
  {
    tag: "T-24A",
    name: "Settling tank T-24",
    service: "Secondary settling",
    unit: "Process",
    type: "Vertical cone-bottom stainless",
    diameter: 3.2,
    height: 5.8,
    volume: 28,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [9, 0, -2],
    kind: "settling",
  },
  {
    tag: "T-24B",
    name: "Settling tank T-24",
    service: "Secondary settling",
    unit: "Process",
    type: "Vertical cone-bottom stainless",
    diameter: 3.2,
    height: 5.8,
    volume: 28,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [14.5, 0, -2],
    kind: "settling",
  },
  {
    tag: "C-01",
    name: "Process column",
    service: "Main distillation / scrubber",
    unit: "Process",
    type: "Tall vertical column with platforms",
    diameter: 2.4,
    height: 18,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [8, 0, 12],
    kind: "column",
  },
  {
    tag: "T-6.001",
    name: "Storage tank T-6.001",
    service: "Product / intermediate storage",
    unit: "Storage",
    type: "Large atmospheric vertical tank",
    diameter: 6.5,
    height: 10,
    volume: 280,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [32, 0, 6],
    kind: "tank",
  },
  {
    tag: "T-K.002",
    name: "Storage tank T-K.002",
    service: "Product / intermediate storage",
    unit: "Storage",
    type: "Large atmospheric vertical tank",
    diameter: 6.5,
    height: 10,
    volume: 280,
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [41, 0, 6],
    kind: "tank",
  },
  {
    tag: "SILO",
    name: "Cement Silo",
    service: "Bulk solids storage",
    unit: "Utilities",
    type: "Vertical silo",
    diameter: 3.2,
    height: 9,
    status: "CURRENT",
    dimStatus: "assumed",
    source: "Reference render",
    pos: [48, 0, 10],
    kind: "silo",
  },
  {
    tag: "KILN",
    name: "Rotary dryer / kiln",
    service: "Thermal drying",
    unit: "Process",
    type: "Horizontal rotary unit with blue blower",
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [38, 0, -8],
    kind: "kiln",
  },
  {
    tag: "HX-01",
    name: "Heat exchanger",
    service: "Process heat recovery",
    unit: "Process",
    type: "Shell & tube",
    status: "CURRENT",
    dimStatus: "approximate",
    source: "Reference render",
    pos: [22, 0, -8],
    kind: "exchanger",
  },
];

export const VIEWS = {
  overview: {
    label: "Site overview",
    sub: "Full plant from high angle",
    pos: [12, 28, 42] as const,
    target: [15, 2, 2] as const,
  },
  reception: {
    label: "Tanker & pits",
    sub: "Unloading and receiving pits",
    pos: [-22, 8, 18] as const,
    target: [-14, 0, 6] as const,
  },
  settling: {
    label: "Settling train",
    sub: "T-21 · T-22 · T-24",
    pos: [6, 9, 18] as const,
    target: [6, 3, -2] as const,
  },
  column: {
    label: "Process column",
    sub: "Main column C-01",
    pos: [18, 12, 28] as const,
    target: [8, 8, 12] as const,
  },
  storage: {
    label: "Storage area",
    sub: "T-6.001 · T-K.002 · Cement Silo",
    pos: [45, 14, 28] as const,
    target: [38, 4, 6] as const,
  },
  kiln: {
    label: "Kiln & exchanger",
    sub: "Rotary unit and HX-01",
    pos: [30, 8, -22] as const,
    target: [30, 2, -6] as const,
  },
};

export type ViewId = keyof typeof VIEWS;
