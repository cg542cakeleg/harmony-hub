import { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { seedBills } from './data/seedData';
import { DEFAULT_MEMBERS } from './data/defaultMembers';
import ProfileSelector from './components/ProfileSelector';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BillsView from './components/BillsView';
import ChoresView from './components/ChoresView';
import EventsView from './components/EventsView';
import ListsView from './components/ListsView';
import type { Bill, Chore, FamilyEvent, ListItem, FamilyMember } from './types';

type Tab = 'home' | 'bills' | 'chores' | 'events' | 'lists';

export default function App() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('harmony_members', DEFAULT_MEMBERS);
  const [bills, setBills] = useLocalStorage<Bill[]>('harmony_bills', seedBills);
  const [chores, setChores] = useLocalStorage<Chore[]>('harmony_chores', []);
  const [events, setEvents] = useLocalStorage<FamilyEvent[]>('harmony_events', []);
  const [listItems, setListItems] = useLocalStorage<ListItem[]>('harmony_lists', []);
  const [tab, setTab] = useState<Tab>('home');
  const [showProfileManager, setShowProfileManager] = useState(false);

  const activeUser = members.find(m => m.id === activeUserId) ?? null;

  if (!activeUser || showProfileManager) {
    return (
      <ProfileSelector
        members={members}
        onLogin={(m) => { setActiveUserId(m.id); setShowProfileManager(false); }}
        onUpdateMembers={setMembers}
      />
    );
  }

  return (
    <Layout
      tab={tab}
      onTab={setTab}
      user={activeUser}
      onLogout={() => setActiveUserId(null)}
      onManageProfiles={() => setShowProfileManager(true)}
    >
      {tab === 'home' && (
        <Dashboard
          bills={bills}
          chores={chores}
          events={events}
          listItems={listItems}
          user={activeUser}
          onNavigate={(t) => setTab(t)}
        />
      )}
      {tab === 'bills' && (
        <BillsView bills={bills} onChange={setBills} user={activeUser} />
      )}
      {tab === 'chores' && (
        <ChoresView chores={chores} onChange={setChores} user={activeUser} members={members} />
      )}
      {tab === 'events' && (
        <EventsView events={events} onChange={setEvents} user={activeUser} members={members} />
      )}
      {tab === 'lists' && (
        <ListsView items={listItems} onChange={setListItems} user={activeUser} members={members} />
      )}
    </Layout>
  );
}
