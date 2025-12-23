export interface PayaCycle {
  id: number;
  label: string;
  hour: number;
  minute: number;
  description: string;
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CycleCalculation {
  nextCycle: PayaCycle;
  targetDate: Date;
  isTomorrow: boolean;
}

export type AppTab = 'paya' | 'satna' | 'chakavak' | 'crypto';

export interface SystemStatus {
  isOpen: boolean;
  message: string;
  nextEventTime?: string;
}