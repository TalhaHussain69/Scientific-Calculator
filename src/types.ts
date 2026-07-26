export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export type AngleMode = 'DEG' | 'RAD';

export interface CalculatorState {
  expression: string;
  result: string;
  livePreview: string;
  error: string | null;
  angleMode: AngleMode;
  isSecondMode: boolean;
  ans: number;
  memory: number;
  hasMemory: boolean;
  soundEnabled: boolean;
}
