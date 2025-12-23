import { PAYA_CYCLES } from '../constants';
import { CycleCalculation, TimeState } from '../types';

export const calculateNextCycle = (): CycleCalculation => {
  const now = new Date();
  
  // Sort cycles by time just in case
  const sortedCycles = [...PAYA_CYCLES].sort((a, b) => {
    return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
  });

  let nextCycle = null;
  let targetDate = new Date();
  let isTomorrow = false;

  // Find the first cycle later than now
  for (const cycle of sortedCycles) {
    const cycleDate = new Date();
    cycleDate.setHours(cycle.hour, cycle.minute, 0, 0);

    if (cycleDate > now) {
      nextCycle = cycle;
      targetDate = cycleDate;
      break;
    }
  }

  // If no cycle found today, pick the first one tomorrow
  if (!nextCycle) {
    nextCycle = sortedCycles[0];
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(nextCycle.hour, nextCycle.minute, 0, 0);
    isTomorrow = true;
  }

  return { nextCycle, targetDate, isTomorrow };
};

export const calculateTimeRemaining = (targetDate: Date): TimeState => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { hours, minutes, seconds };
};

export const formatTwoDigits = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const calculateProgress = (targetDate: Date): number => {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  
  // We need to find the "start date" of the current wait period.
  // This is effectively the previous cycle's time.
  // Since we don't have the previous cycle object directly, we can estimate it 
  // or look it up from constants.
  
  // Quick logic: Go back in time until we hit a cycle time.
  // However, simpler approach:
  // If target is today X, previous was today Y or yesterday Z.
  
  const sortedCycles = [...PAYA_CYCLES].sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
  
  // Find which cycle the target corresponds to
  let currentCycleIndex = -1;
  // We need to match target hour/minute to a cycle
  const targetHour = targetDate.getHours();
  const targetMinute = targetDate.getMinutes();
  
  currentCycleIndex = sortedCycles.findIndex(c => c.hour === targetHour && c.minute === targetMinute);
  
  let prevDate = new Date(targetDate);
  
  if (currentCycleIndex > 0) {
    // Previous cycle was earlier today
    const prevCycle = sortedCycles[currentCycleIndex - 1];
    prevDate.setHours(prevCycle.hour, prevCycle.minute, 0, 0);
  } else if (currentCycleIndex === 0) {
    // Previous cycle was the last one of yesterday
    const prevCycle = sortedCycles[sortedCycles.length - 1];
    prevDate.setDate(prevDate.getDate() - 1);
    prevDate.setHours(prevCycle.hour, prevCycle.minute, 0, 0);
  } else {
    // Fallback (shouldn't happen often): assume 6 hours ago
    prevDate.setHours(prevDate.getHours() - 6);
  }
  
  const start = prevDate.getTime();
  const totalDuration = target - start;
  const elapsed = now - start;
  
  let percentage = (elapsed / totalDuration) * 100;
  
  // Clamp between 0 and 100
  return Math.min(Math.max(percentage, 0), 100);
};