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

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  memberId?: string;
  recurring: boolean;
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

export function useHarmonyData() {
  const [data, setData] = useState<HarmonyData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as HarmonyData;
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
