import { useState, useEffect } from 'react';

export const C = {
  gold:   '#FFD600',
  blue:   '#1A33FF',
  pink:   '#FF0090',
  cream:  '#F0ECD8',
  navy:   '#0D0D3A',
  white:  '#FFFFF0',
  green:  '#00CC44',
  red:    '#FF2200',
  orange: '#FF8800',
  bg:     '#C8C8B8',
};

export type FamilyMember = {
  id: string;
  name: string;
  color: string;
};

export type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  color: string;
  memberId?: string;
  source?: 'google' | 'local';
  googleId?: string;
  hidden?: boolean;
  allDay?: boolean;
};

export type Chore = {
  id: string;
  title: string;
  memberId: string;
  dueDate: string;
  done: boolean;
};

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
  qty?: string;
};

export type NamedList = {
  id: string;
  name: string;
  items: ListItem[];
};

export type BillCategory = 'Housing' | 'Utilities' | 'Subscriptions' | 'Insurance' | 'Debt' | 'Other';
export type BillFrequency = 'One-time' | 'Monthly' | 'Quarterly' | 'Annual';

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  memberId?: string;
  recurring: boolean;
  // Extended fields
  category: BillCategory;
  account: string;
  frequency: BillFrequency;
  autopay: boolean;
  notes: string;
};

export type HarmonyData = {
  members: FamilyMember[];
  events: Event[];
  chores: Chore[];
  lists: NamedList[];
  bills: Bill[];
};

const DEFAULT_DATA: HarmonyData = {
  members: [
    { id: '1', name: 'ALEX', color: C.blue },
    { id: '2', name: 'MOM', color: C.pink },
    { id: '3', name: 'DAD', color: C.green },
    { id: '4', name: 'KID', color: C.orange },
  ],
  events: [],
  chores: [],
  lists: [
    { id: 'l1', name: 'GROCERIES', items: [] }
  ],
  bills: [],
};

const STORAGE_KEY = 'harmony-hub-data';

function migrateBill(b: any): Bill {
  return {
    id: b.id ?? Math.random().toString(36).substring(7),
    name: b.name ?? '',
    amount: typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0,
    dueDate: b.dueDate ?? '',
    status: b.status ?? 'DUE',
    memberId: b.memberId,
    recurring: b.recurring ?? false,
    category: b.category ?? 'Other',
    account: b.account ?? '',
    frequency: b.frequency ?? (b.recurring ? 'Monthly' : 'One-time'),
    autopay: b.autopay ?? false,
    notes: b.notes ?? '',
  };
}

function applyOverdueFlags(bills: Bill[]): Bill[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bills.map(b => {
    if (b.status === 'DUE' && b.dueDate) {
      const due = new Date(b.dueDate + 'T00:00:00');
      if (due < today) return { ...b, status: 'OVERDUE' };
    }
    return b;
  });
}

export function advanceRecurringBill(bill: Bill): Bill {
  if (!bill.dueDate) return bill;
  const d = new Date(bill.dueDate + 'T00:00:00');
  switch (bill.frequency) {
    case 'Monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'Quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'Annual':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      return bill;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return {
    ...bill,
    id: Math.random().toString(36).substring(7),
    dueDate: `${yyyy}-${mm}-${dd}`,
    status: 'DUE',
  };
}

export function useHarmonyData() {
  const [data, setData] = useState<HarmonyData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HarmonyData;
        const migrated: HarmonyData = {
          ...parsed,
          bills: applyOverdueFlags((parsed.bills ?? []).map(migrateBill)),
        };
        return migrated;
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (updater: (prev: HarmonyData) => HarmonyData) => {
    setData(prev => updater(prev));
  };

  return { data, updateData };
}
