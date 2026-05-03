import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useCloudSync } from './hooks/useCloudSync';
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

// Client-side merge: item with newer updated_date wins (same logic as server mergeArrays).
// Prevents a stale pull from overwriting locally-added items that haven't pushed yet.
function mergeById<T extends { id: string; updated_date?: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of cloud) map.set(item.id, item);
  for (const item of local) {
    const c = map.get(item.id);
    if (!c || (item.updated_date ?? '') >= (c.updated_date ?? '')) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export default function App() {
  const [activeUserId,      setActiveUserId]      = useState<string | null>(null);
  const [members,           setMembers]           = useLocalStorage<FamilyMember[]>('harmony_members',  DEFAULT_MEMBERS);
  const [bills,             setBills]             = useLocalStorage<Bill[]>        ('harmony_bills',    seedBills);
  const [chores,            setChores]            = useLocalStorage<Chore[]>       ('harmony_chores',   []);
  const [events,            setEvents]            = useLocalStorage<FamilyEvent[]> ('harmony_events',   []);
  const [listItems,         setListItems]         = useLocalStorage<ListItem[]>    ('harmony_lists',    []);
  const [tab,               setTab]               = useState<Tab>('home');
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [synced,            setSynced]            = useState(false);

  const { pull, push } = useCloudSync();

  // ── One-time PIN migration ───────────────────────────────────────────────
  useEffect(() => {
    const pinMap: Record<string, string> = {};
    for (const def of DEFAULT_MEMBERS) { if (def.pin) pinMap[def.id] = def.pin; }
    const needsUpdate = members.some(m => pinMap[m.id] && !m.pin);
    if (needsUpdate) setMembers(members.map(m => (pinMap[m.id] && !m.pin ? { ...m, pin: pinMap[m.id] } : m)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pull from cloud on first load ────────────────────────────────────────
  useEffect(() => {
    pull().then(data => {
      if (!data) { setSynced(true); return; }
      // Merge cloud into local so any locally-added items that haven't pushed yet are preserved
      if (data.bills?.length)   setBills(prev   => mergeById(prev,  data.bills!));
      if (data.chores?.length)  setChores(prev  => mergeById(prev,  data.chores!));
      if (data.events?.length)  setEvents(prev  => mergeById(prev,  data.events!));
      if (data.lists?.length)   setListItems(prev => mergeById(prev, data.lists!));
      if (data.members?.length) setMembers(prev => mergeById(prev,  data.members!));
      setSynced(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-pull when user comes back to the tab ──────────────────────────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        pull().then(data => {
          if (!data) return;
          if (data.bills?.length)   setBills(prev   => mergeById(prev,  data.bills!));
          if (data.chores?.length)  setChores(prev  => mergeById(prev,  data.chores!));
          if (data.events?.length)  setEvents(prev  => mergeById(prev,  data.events!));
          if (data.lists?.length)   setListItems(prev => mergeById(prev, data.lists!));
          if (data.members?.length) setMembers(prev => mergeById(prev,  data.members!));
        });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [pull, setBills, setChores, setEvents, setListItems, setMembers]);

  // ── Push to cloud whenever data changes ──────────────────────────────────
  useEffect(() => {
    if (!synced) return;  // don't push the initial seed data before we've pulled
    push({ bills, chores, events, lists: listItems, members });
  }, [bills, chores, events, listItems, members]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wrapped setters — update local state then cloud ──────────────────────
  const handleBills    = useCallback((b: Bill[])        => setBills(b),    [setBills]);
  const handleChores   = useCallback((c: Chore[])       => setChores(c),   [setChores]);
  const handleEvents   = useCallback((e: FamilyEvent[]) => setEvents(e),   [setEvents]);
  const handleLists    = useCallback((l: ListItem[])    => setListItems(l), [setListItems]);
  const handleMembers  = useCallback((m: FamilyMember[]) => setMembers(m), [setMembers]);

  const activeUser = members.find(m => m.id === activeUserId) ?? null;

  if (!activeUser || showProfileManager) {
    return (
      <ProfileSelector
        members={members}
        onLogin={(m) => { setActiveUserId(m.id); setShowProfileManager(false); }}
        onUpdateMembers={handleMembers}
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
        <BillsView bills={bills} onChange={handleBills} user={activeUser} />
      )}
      {tab === 'chores' && (
        <ChoresView chores={chores} onChange={handleChores} user={activeUser} members={members} />
      )}
      {tab === 'events' && (
        <EventsView events={events} onChange={handleEvents} user={activeUser} members={members} />
      )}
      {tab === 'lists' && (
        <ListsView items={listItems} onChange={handleLists} user={activeUser} members={members} />
      )}
    </Layout>
  );
}