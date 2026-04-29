export type BillStatus = 'not_paid' | 'paid' | 'partial' | 'waiting' | 'late';
export type BillCategory = 'rent' | 'utilities' | 'insurance' | 'phone' | 'subscriptions' | 'food' | 'medical' | 'loan' | 'kids' | 'other';

export interface Bill {
  id: string;
  name: string;
  amount_due: number;
  due_date: string;
  status: BillStatus;
  category: BillCategory;
  notes: string;
  recurring: boolean;
  recurrence_day: number | null;
  is_subscription: boolean;
  emoji: string;
  created_date: string;
  updated_date: string;
}

export type ChoreFrequency = 'daily' | 'weekly' | 'monthly' | 'as_needed';
export type ChoreCategory = 'cleaning' | 'laundry' | 'kitchen' | 'yard' | 'errands' | 'kids' | 'pets' | 'other';

export interface Chore {
  id: string;
  title: string;
  frequency: ChoreFrequency;
  assigned_to: string;
  day_of_week: string;
  completed: boolean;
  completed_date: string;
  notes: string;
  category: ChoreCategory;
  created_date: string;
  updated_date: string;
}

export type EventCategory = 'appointment' | 'birthday' | 'school' | 'family' | 'holiday' | 'other';

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  end_time: string;
  category: EventCategory;
  assigned_to: string;
  notes: string;
  color: string;
  source?: 'google';
  created_date: string;
  updated_date: string;
}

export type ListType = 'grocery' | 'todo' | 'reminder' | 'braindump';
export type Priority = 'low' | 'medium' | 'high';

export interface ListItem {
  id: string;
  text: string;
  list_type: ListType;
  completed: boolean;
  priority: Priority;
  due_date: string;
  assigned_to: string;
  category: string;
  quantity: string;
  created_date: string;
  updated_date: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  emoji: string;
  pin: string;
  role: 'admin' | 'member';
  created_date: string;
}
