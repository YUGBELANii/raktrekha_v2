import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing. Add them to .env before running the app.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'missing-publishable-key',
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

type CompatUser = {
  uid: string;
  id: string;
  email?: string;
  providerData: { providerId: string }[];
};

const asUser = (user: any): CompatUser | null =>
  user ? { ...user, uid: user.id, id: user.id, providerData: [{ providerId: 'password' }] } : null;

export const auth: { currentUser: CompatUser | null } = { currentUser: null };

let currentUser: CompatUser | null = null;
supabase.auth.getSession().then(({ data }: { data: { session: { user: any } | null } }) => { currentUser = asUser(data.session?.user); });
supabase.auth.onAuthStateChange((_event: any, session: any) => { currentUser = asUser(session?.user); });
Object.defineProperty(auth, 'currentUser', { get: () => currentUser });

export const getAuth = () => auth;
export const getFirestore = () => db;

export async function signInWithEmailAndPassword(_auth: unknown, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = asUser(data.user);
  return { user: currentUser };
}

export async function createUserWithEmailAndPassword(_auth: unknown, email: string, password: string, metadata?: Record<string, unknown>) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata || {} } });
  if (error) throw error;
  if (!data.user) throw new Error('Supabase did not return a user after sign up.');
  currentUser = asUser(data.user);
  if (!data.session) {
    currentUser = null;
    throw new Error('Your account and profile were created. Please verify your email, then sign in.');
  }
  return { user: currentUser };
}

export async function signOut(_auth?: unknown) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
}

export function onAuthStateChanged(_auth: unknown, callback: (user: CompatUser | null) => void) {
  supabase.auth.getSession().then(({ data }: { data: { session: { user: any } | null } }) => callback(asUser(data.session?.user)));
  const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => callback(asUser(session?.user)));
  return () => data.subscription.unsubscribe();
}

export const EmailAuthProvider = {
  credential: (email: string, password: string) => ({ email, password }),
};

export async function reauthenticateWithCredential(_user: unknown, credential: { email: string; password: string }) {
  const { error } = await supabase.auth.signInWithPassword(credential);
  if (error) throw error;
}

export async function updatePassword(_user: unknown, password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export class Timestamp {
  constructor(private readonly date: Date) {}
  toDate() { return this.date; }
  static now() { return new Timestamp(new Date()); }
}

export const serverTimestamp = () => new Date().toISOString();

type Ref = { table: string; id?: string; nested?: string[] };
type Filter = { field: string; op: string; value: any };
type QuerySpec = { ref: Ref; filters: Filter[]; order?: { field: string; direction: 'asc' | 'desc' }; max?: number };

const tableName = (name: string) => name === 'users' ? 'profiles' : name === 'requests' ? 'blood_requests' : name === 'bloodCamps' ? 'blood_camps' : name;
const fieldName = (name: string) => ({
  uid: 'id', patientId: 'patient_id', acceptedBy: 'accepted_by', requestId: 'request_id',
  bloodGroup: 'blood_group', createdAt: 'created_at', updatedAt: 'updated_at',
  completedAt: 'completed_at', preferredHospital: 'preferred_hospital',
  emergencyContact: 'emergency_contact', fullName: 'name', hostedBy: 'hosted_by',
}[name] || name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`));

function mapProfile(data: any) {
  const { number, phone, emergencyContact, email, uid, createdAt, ...rest } = data || {};
  const mapped: any = {};
  Object.entries(rest).forEach(([key, value]) => { mapped[fieldName(key)] = value; });
  if (mapped.age !== undefined && mapped.age !== null) mapped.age = Number(mapped.age);
  return {
    profile: mapped,
    contacts: { phone: number ?? phone },
    emergency: emergencyContact,
  };
}
function fromDb(row: any) {
  const out: any = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    const camel = key.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
    out[camel] = value;
  });
  out.uid = row?.id;
  out.fullName = out.name;
  for (const key of ['createdAt', 'updatedAt', 'completedAt']) {
    if (typeof out[key] === 'string') out[key] = new Timestamp(new Date(out[key]));
  }
  return out;
}
function refData(ref: Ref) { return { id: ref.id, table: ref.table }; }

export const db = {};
export function collection(_db: unknown, name: string): Ref { return { table: tableName(name) }; }
export function doc(_db: unknown, name: string, id: string, ...nested: string[]): Ref {
  return { table: tableName(name), id, nested };
}
export function where(field: string, op: string, value: any): Filter { return { field: fieldName(field), op, value }; }
export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') { return { field: fieldName(field), direction }; }
export function limit(max: number) { return { max }; }
export function query(ref: Ref, ...parts: any[]): QuerySpec {
  return { ref, filters: parts.filter((p) => p?.field && p?.op), order: parts.find((p) => p?.direction), max: parts.find((p) => p?.max)?.max };
}

async function selectOne(ref: Ref) {
  if (ref.nested?.[0] === 'privacy') {
    const { data, error } = await supabase.from('user_settings').select('settings').eq('user_id', ref.id).eq('key', ref.nested[1]).maybeSingle();
    if (error) throw error;
    return data?.settings || null;
  }
  const { data, error } = await supabase.from(ref.table).select('*').eq(ref.table === 'profiles' ? 'id' : 'id', ref.id).maybeSingle();
  if (error) throw error;
  if (ref.table === 'profiles' && data) {
    const { data: contact } = await supabase.from('profile_contacts').select('phone').eq('user_id', ref.id).maybeSingle();
    let emergencyContact = '';
    const viewerId = currentUser?.uid || (await supabase.auth.getSession()).data.session?.user?.id;
    if (viewerId && ref.id === viewerId) {
      const { data: emergency } = await supabase.from('profile_emergency_contacts').select('emergency_contact').eq('user_id', ref.id).maybeSingle();
      emergencyContact = emergency?.emergency_contact || '';
    }
    return { ...fromDb(data), number: contact?.phone || '', phone: contact?.phone || '', emergencyContact };
  }
  return ref.table === 'blood_requests' ? fromDb(data) : data ? fromDb(data) : null;
}
export async function getDoc(ref: Ref) {
  const data = await selectOne(ref);
  return { id: ref.id, exists: () => data !== null, data: () => data };
}
export async function setDoc(ref: Ref, value: any, options?: { merge?: boolean }) {
  if (ref.nested?.[0] === 'privacy') {
    let settings = value;
    if (options?.merge) {
      const { data: existing, error: readError } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', ref.id)
        .eq('key', ref.nested[1])
        .maybeSingle();
      if (readError) throw readError;
      settings = { ...(existing?.settings || {}), ...(value || {}) };
    }
    const { error } = await supabase.from('user_settings').upsert({ user_id: ref.id, key: ref.nested[1], settings }, { onConflict: 'user_id,key' });
    if (error) throw error;
    return;
  }
  if (ref.table === 'profiles') {
    const { profile, contacts, emergency } = mapProfile(value);
    if (Object.keys(profile).length > 0) {
      const { error } = await supabase.from('profiles').upsert({ id: ref.id, ...profile }, { onConflict: 'id' });
      if (error) throw error;
    }
    if (contacts.phone !== undefined) {
      const { error } = await supabase.from('profile_contacts').upsert({ user_id: ref.id, phone: contacts.phone }, { onConflict: 'user_id' });
      if (error) throw error;
    }
    if (emergency !== undefined) {
      const { error } = await supabase.from('profile_emergency_contacts').upsert({ user_id: ref.id, emergency_contact: emergency }, { onConflict: 'user_id' });
      if (error) throw error;
    }
    return;
  }
  const { error } = await supabase.from(ref.table).upsert({ id: ref.id, ...value });
  if (error) throw error;
}
export async function addDoc(ref: Ref, value: any) {
  const mapped: any = {};
  Object.entries(value).forEach(([key, val]) => {
    mapped[fieldName(key)] = val instanceof Timestamp ? val.toDate().toISOString() : val instanceof Date ? val.toISOString() : val;
  });
  if (mapped.units !== undefined) mapped.units = Number(mapped.units);
  const { data, error } = await supabase.from(ref.table).insert(mapped).select('id').single();
  if (error) throw error;
  return { id: data.id };
}
export async function updateDoc(ref: Ref, value: any) {
  const mapped: any = {};
  Object.entries(value).forEach(([key, val]) => {
    const v = val instanceof Timestamp ? val.toDate().toISOString() : val instanceof Date ? val.toISOString() : val;
    mapped[fieldName(key)] = key === 'acceptedBy' && v === '' ? null : v;
  });
  if (ref.table === 'profiles') {
    const { profile, contacts, emergency } = mapProfile(value);
    if (Object.keys(profile).length > 0) {
      const { error } = await supabase.from('profiles').update(profile).eq('id', ref.id);
      if (error) throw error;
    }
    if (contacts.phone !== undefined) {
      const { error: contactError } = await supabase.from('profile_contacts').upsert({ user_id: ref.id, phone: contacts.phone }, { onConflict: 'user_id' });
      if (contactError) throw contactError;
    }
    if (emergency !== undefined) {
      const { error: emergencyError } = await supabase.from('profile_emergency_contacts').upsert({ user_id: ref.id, emergency_contact: emergency }, { onConflict: 'user_id' });
      if (emergencyError) throw emergencyError;
    }
    return;
  }
  const { error } = await supabase.from(ref.table).update(mapped).eq('id', ref.id);
  if (error) throw error;
}
async function runQuery(spec: QuerySpec) {
  if (spec.ref.nested?.[0] === 'privacy') {
    const data = await selectOne(spec.ref);
    const docs = data ? [{ id: spec.ref.id, data: () => data }] : [];
    return { docs, empty: docs.length === 0, size: docs.length };
  }
  let request = supabase.from(spec.ref.table).select('*');
  if (spec.ref.id) request = request.eq('id', spec.ref.id);
  for (const filter of spec.filters) {
    if (filter.op === '==') request = request.eq(filter.field, filter.value);
    else if (filter.op === 'in') request = request.in(filter.field, filter.value);
    else if (filter.op === '!=') request = request.neq(filter.field, filter.value);
  }
  if (spec.order) request = request.order(spec.order.field, { ascending: spec.order.direction === 'asc' });
  if (spec.max) request = request.limit(spec.max);
  const { data, error } = await request;
  if (error) throw error;
  const rows = data || [];
  const viewerId = currentUser?.uid || (await supabase.auth.getSession()).data.session?.user?.id;
  const docs = await Promise.all(rows.map(async (row: any) => {
    let item = fromDb(row);
    if (spec.ref.table === 'profiles') {
      const { data: contact } = await supabase.from('profile_contacts').select('phone').eq('user_id', row.id).maybeSingle();
      let emergencyContact = '';
      if (viewerId && row.id === viewerId) {
        const { data: emergency } = await supabase.from('profile_emergency_contacts').select('emergency_contact').eq('user_id', row.id).maybeSingle();
        emergencyContact = emergency?.emergency_contact || '';
      }
      item = { ...item, number: contact?.phone || '', phone: contact?.phone || '', emergencyContact };
    }
    if (spec.ref.table === 'blood_requests') {
      const isCounterparty = viewerId && row.status === 'accepted' && (row.patient_id === viewerId || row.accepted_by === viewerId);
      if (isCounterparty) {
        const { data: contact } = await supabase.from('profile_contacts').select('phone').eq('user_id', row.patient_id).maybeSingle();
        item = { ...item, number: contact?.phone || '' };
      }
    }
    return { id: row.id, data: () => item };
  }));
  return { docs, empty: docs.length === 0, size: docs.length };
}
export async function getDocs(input: Ref | QuerySpec) {
  return runQuery('ref' in input ? input as QuerySpec : { ref: input as Ref, filters: [] });
}
export function onSnapshot(input: Ref | QuerySpec, callback: (snapshot: any) => void, onError?: (error: any) => void) {
  const spec = 'ref' in input ? input as QuerySpec : { ref: input as Ref, filters: [] };
  let active = true;
  const refresh = () => {
    runQuery(spec).then((result) => {
      if (!active) return;
      if (spec.ref.id) {
        const row = result.docs[0];
        callback({ exists: () => Boolean(row), data: () => row?.data() });
      } else {
        callback(result);
      }
    }).catch((error) => onError?.(error));
  };
  refresh();
  const channelName = `compat-${spec.ref.table}-${Math.random().toString(36).slice(2)}`;
  let channel = supabase.channel(channelName);
  if (spec.ref.nested?.[0] === 'privacy') {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings' }, refresh);
  } else {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: spec.ref.table }, refresh);
    if (spec.ref.table === 'profiles') {
      channel = channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_contacts' }, refresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_emergency_contacts' }, refresh);
    }
    if (spec.ref.table === 'blood_requests') {
      // Counterparty phone is attached from profile_contacts for authorized viewers.
      channel = channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_contacts' }, refresh);
    }
  }
  channel.subscribe();
  return () => { active = false; supabase.removeChannel(channel); };
}
