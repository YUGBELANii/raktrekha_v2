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
supabase.auth.getSession().then(({ data }) => { currentUser = asUser(data.session?.user); });
supabase.auth.onAuthStateChange((_event, session) => { currentUser = asUser(session?.user); });
Object.defineProperty(auth, 'currentUser', { get: () => currentUser });

export const getAuth = () => auth;
export const getFirestore = () => db;

export async function signInWithEmailAndPassword(_auth: unknown, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = asUser(data.user);
  return { user: currentUser };
}

export async function createUserWithEmailAndPassword(_auth: unknown, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  currentUser = asUser(data.user);
  if (!data.user) throw new Error('Account created, but no user was returned. Check Supabase email confirmation settings.');
  return { user: currentUser };
}

export async function signOut(_auth?: unknown) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
}

export function onAuthStateChanged(_auth: unknown, callback: (user: CompatUser | null) => void) {
  supabase.auth.getSession().then(({ data }) => callback(asUser(data.session?.user)));
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(asUser(session?.user)));
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
  return { profile: mapped, contacts: { phone: number ?? phone, emergency_contact: emergencyContact } };
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
    const { data: contact } = await supabase.from('profile_contacts').select('phone, emergency_contact').eq('user_id', ref.id).maybeSingle();
    return { ...fromDb(data), number: contact?.phone || '', phone: contact?.phone || '', emergencyContact: contact?.emergency_contact || '' };
  }
  return ref.table === 'blood_requests' ? fromDb(data) : data ? fromDb(data) : null;
}
export async function getDoc(ref: Ref) {
  const data = await selectOne(ref);
  return { id: ref.id, exists: () => data !== null, data: () => data };
}
export async function setDoc(ref: Ref, value: any, options?: { merge?: boolean }) {
  if (ref.nested?.[0] === 'privacy') {
    const { error } = await supabase.from('user_settings').upsert({ user_id: ref.id, key: ref.nested[1], settings: value }, { onConflict: 'user_id,key' });
    if (error) throw error;
    return;
  }
  if (ref.table === 'profiles') {
    const { profile, contacts } = mapProfile(value);
    if (options?.merge) {
      const { error } = await supabase.from('profiles').upsert({ id: ref.id, ...profile }, { onConflict: 'id' });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('profiles').insert({ id: ref.id, ...profile });
      if (error) throw error;
    }
    if (contacts.phone !== undefined || contacts.emergency_contact !== undefined) {
      const { error } = await supabase.from('profile_contacts').upsert({ user_id: ref.id, ...contacts }, { onConflict: 'user_id' });
      if (error) throw error;
    }
    return;
  }
  const { error } = await supabase.from(ref.table).upsert({ id: ref.id, ...value });
  if (error) throw error;
}
export async function addDoc(ref: Ref, value: any) {
  const mapped: any = {};
  Object.entries(value).forEach(([key, val]) => { mapped[fieldName(key)] = val; });
  if (mapped.units !== undefined) mapped.units = Number(mapped.units);
  const { data, error } = await supabase.from(ref.table).insert(mapped).select('id').single();
  if (error) throw error;
  return { id: data.id };
}
export async function updateDoc(ref: Ref, value: any) {
  const mapped: any = {};
  Object.entries(value).forEach(([key, val]) => { mapped[fieldName(key)] = key === 'acceptedBy' && val === '' ? null : val; });
  if (ref.table === 'profiles') {
    const { profile, contacts } = mapProfile(value);
    const { error } = await supabase.from('profiles').update(profile).eq('id', ref.id);
    if (error) throw error;
    if (contacts.phone !== undefined || contacts.emergency_contact !== undefined) {
      const { error: contactError } = await supabase.from('profile_contacts').upsert({ user_id: ref.id, ...contacts }, { onConflict: 'user_id' });
      if (contactError) throw contactError;
    }
    return;
  }
  const { error } = await supabase.from(ref.table).update(mapped).eq('id', ref.id);
  if (error) throw error;
}
async function runQuery(spec: QuerySpec) {
  let request = supabase.from(spec.ref.table).select('*');
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
  const docs = await Promise.all(rows.map(async (row: any) => {
    let item = fromDb(row);
    if (spec.ref.table === 'profiles') {
      const { data: contact } = await supabase.from('profile_contacts').select('phone, emergency_contact').eq('user_id', row.id).maybeSingle();
      item = { ...item, number: contact?.phone || '', phone: contact?.phone || '', emergencyContact: contact?.emergency_contact || '' };
    }
    if (spec.ref.table === 'blood_requests') {
      const viewerId = currentUser?.uid;
      const isCounterparty = viewerId && (row.patient_id === viewerId || row.accepted_by === viewerId);
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
  const refresh = () => { runQuery(spec).then((result) => { if (active) callback(result); }).catch((error) => onError?.(error)); };
  refresh();
  const channel = supabase.channel(`compat-${spec.ref.table}-${Math.random()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: spec.ref.table }, refresh)
    .subscribe();
  return () => { active = false; supabase.removeChannel(channel); };
}
