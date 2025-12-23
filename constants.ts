import { PayaCycle } from './types';

export const PAYA_CYCLES: PayaCycle[] = [
  { 
    id: 1, 
    label: 'چرخه اول', 
    hour: 3, 
    minute: 45, 
    description: 'تسویه دستور پرداخت‌های ثبت شده تا قبل از این ساعت.' 
  },
  { 
    id: 2, 
    label: 'چرخه دوم', 
    hour: 9, 
    minute: 45, 
    description: 'مناسب برای حواله‌های اول وقت اداری.' 
  },
  { 
    id: 3, 
    label: 'چرخه سوم', 
    hour: 12, 
    minute: 45, 
    description: 'تسویه حواله‌های میانه روز.' 
  },
  { 
    id: 4, 
    label: 'چرخه چهارم', 
    hour: 18, 
    minute: 45, 
    description: 'آخرین چرخه تسویه در روز کاری.' 
  }
];

export const SATNA_HOURS = {
  start: { hour: 8, minute: 0 },
  end: { hour: 14, minute: 30 },
  thursdayEnd: { hour: 12, minute: 30 }
};

export const CHAKAVAK_HOURS = {
  cutoff: { hour: 10, minute: 0 },
  settlement: { hour: 13, minute: 30 }
};