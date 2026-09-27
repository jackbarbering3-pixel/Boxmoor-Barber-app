import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = { bg: '#07120E', panel: '#102018', panel2: '#172A20', cream: '#E6D6B0', text: '#F7F3E9', muted: '#A9B0A9', line: '#294034' };
const services = [
  { id: 'cut', name: 'Haircut', minutes: 30, price: 25, eligible: true },
  { id: 'fade', name: 'Skin Fade', minutes: 40, price: 28, eligible: true },
  { id: 'combo', name: 'Haircut + Beard', minutes: 45, price: 35, eligible: true },
  { id: 'beard', name: 'Beard Trim', minutes: 20, price: 15, eligible: false },
];
const barbers = ['Jack', 'Barber 2', 'Any barber'];
const times = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30'];
const storageKey = 'boxmoor-demo-v2';
const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const futureDays = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i + 1); return d; });
const prettyDate = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); };
const initialData = { allowance: 2, openingUsed: 1, bookings: [] };

function Button({ children, onPress, secondary, disabled }) {
  return <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && s.disabled]}><Text style={[s.buttonText, secondary && s.secondaryText]}>{children}</Text></TouchableOpacity>;
}
function Card({ children, selected }) { return <View style={[s.card, selected && s.selected]}>{children}</View>; }
function Heading({ eyebrow, title }) { return <View style={s.heading}><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.title}>{title}</Text></View>; }

export default function App() {
  const [tab, setTab] = useState('home');
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState(dayKey(futureDays()[0]));
  const [time, setTime] = useState(null);
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => { let mounted = true; AsyncStorage.getItem(storageKey)
    .then(raw => { if (mounted && raw) { const saved = JSON.parse(raw); if (Array.isArray(saved.bookings) && Number.isInteger(saved.allowance)) setData(saved); } })
    .catch(() => {})
    .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => {}); }, [data, ready]);

  const remaining = Math.max(0, data.allowance - (data.openingUsed || 0) - data.bookings.filter(b => b.usedCredit).length);
  const upcoming = useMemo(() => data.bookings.filter(b => `${b.date}T${b.time}` >= `${dayKey(new Date())}T${new Date().toTimeString().slice(0, 5)}`).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [data.bookings]);
  const navigate = next => { setTab(next); if (next === 'book') { setStep(0); setService(null); setBarber(null); setTime(null); } };
  const confirm = () => {
    if (!service || !barber || !date || !time) return;
    const usedCredit = service.eligible && remaining > 0;
    const booking = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, serviceId: service.id, serviceName: service.name, barber, date, time, price: usedCredit ? 0 : service.price, usedCredit };
    setData(previous => ({ ...previous, bookings: [...previous.bookings, booking] }));
    setStep(4);
  };
  const cancel = id => setData(previous => ({ ...previous, bookings: previous.bookings.filter(b => b.id !== id) }));
  const dates = futureDays();

  if (!ready) return <SafeAreaView style={s.safe}><ActivityIndicator color={colors.cream} style={{ flex: 1 }} /></SafeAreaView>;
  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" /><View style={s.app}>
    <View style={s.brandArea}><Text style={s.brand}>BOXMOOR</Text><Text style={s.brandSmall}>BARBERS</Text></View>
    <ScrollView key={`${tab}-${step}`} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {tab === 'home' && <><Heading eyebrow="WELCOME TO BOXMOOR" title="Looking sharp starts here." /><Button onPress={() => navigate('book')}>BOOK AN APPOINTMENT  →</Button><View style={s.space} /><MembershipCard remaining={remaining} allowance={data.allowance} /><Text style={s.section}>NEXT APPOINTMENT</Text>{upcoming.length ? <BookingCard booking={upcoming[0]} /> : <Card><Text style={s.meta}>No upcoming bookings yet.</Text></Card>}</>}

      {tab === 'book' && step === 0 && <><Heading eyebrow="STEP 1 OF 4" title="Choose a service" />{services.map(item => <TouchableOpacity key={item.id} onPress={() => { setService(item); setStep(1); }}><Card><View style={s.row}><View style={s.flex}><Text style={s.cardTitle}>{item.name}</Text><Text style={s.meta}>{item.minutes} min{item.eligible && remaining > 0 ? '  ·  Membership eligible' : ''}</Text></View><Text style={s.price}>£{item.price}  ›</Text></View></Card></TouchableOpacity>)}</>}
      {tab === 'book' && step === 1 && <><Heading eyebrow="STEP 2 OF 4" title="Choose your barber" />{barbers.map(item => <TouchableOpacity key={item} onPress={() => { setBarber(item); setStep(2); }}><Card><Text style={s.cardTitle}>{item}  ›</Text></Card></TouchableOpacity>)}<Button secondary onPress={() => setStep(0)}>← BACK</Button></>}
      {tab === 'book' && step === 2 && <><Heading eyebrow="STEP 3 OF 4" title="Pick a time" /><ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayScroll}>{dates.map(item => { const key = dayKey(item); return <TouchableOpacity key={key} onPress={() => { setDate(key); setTime(null); }} style={[s.day, date === key && s.dayActive]}><Text style={[s.dayText, date === key && s.dayTextActive]}>{item.toLocaleDateString('en-GB', { weekday: 'short' })}</Text><Text style={[s.dayNumber, date === key && s.dayTextActive]}>{item.getDate()}</Text></TouchableOpacity>; })}</ScrollView><Text style={s.section}>{prettyDate(date).toUpperCase()}</Text><View style={s.times}>{times.map(slot => <TouchableOpacity key={slot} onPress={() => setTime(slot)} style={[s.slot, time === slot && s.slotActive]}><Text style={[s.slotText, time === slot && s.slotTextActive]}>{slot}</Text></TouchableOpacity>)}</View><Text style={s.note}>Times are examples until the barber calendar is connected.</Text><Button disabled={!time} onPress={() => setStep(3)}>CONTINUE  →</Button><Button secondary onPress={() => setStep(1)}>← BACK</Button></>}
      {tab === 'book' && step === 3 && <><Heading eyebrow="STEP 4 OF 4" title="Review booking" /><Card><Text style={s.cardTitle}>{service?.name}</Text><Text style={s.meta}>{barber} · {prettyDate(date)} · {time}</Text><Text style={s.price}>{service?.eligible && remaining > 0 ? '1 membership cut' : `£${service?.price}`}</Text></Card><Text style={s.note}>Demo booking only. No appointment is sent to the shop.</Text><Button onPress={confirm}>CONFIRM DEMO BOOKING</Button><Button secondary onPress={() => setStep(2)}>← CHANGE TIME</Button></>}
      {tab === 'book' && step === 4 && <><Heading eyebrow="DEMO BOOKING SAVED" title="You're booked in this preview." /><Card><Text style={s.cardTitle}>{service?.name}</Text><Text style={s.meta}>{barber} · {prettyDate(date)} at {time}</Text><Text style={s.meta}>Membership cuts remaining: {remaining}</Text></Card><Button onPress={() => navigate('bookings')}>VIEW BOOKINGS</Button><Button secondary onPress={() => navigate('book')}>BOOK ANOTHER</Button></>}

      {tab === 'bookings' && <><Heading eyebrow="APPOINTMENTS" title="Your bookings" />{upcoming.length ? upcoming.map(booking => <View key={booking.id}><BookingCard booking={booking} /><Button secondary onPress={() => cancel(booking.id)}>CANCEL DEMO BOOKING</Button><View style={s.space} /></View>) : <Card><Text style={s.meta}>No upcoming bookings. Your new bookings will appear here.</Text></Card>}</>}
      {tab === 'membership' && <><Heading eyebrow="BOXMOOR MONTHLY · DEMO" title="Your membership" /><MembershipCard remaining={remaining} allowance={data.allowance} /><Card><Text style={s.cardTitle}>£50 / month · 2 cuts</Text><Text style={s.meta}>This preview starts with one cut available. Eligible bookings use a cut and cancellation restores it.</Text></Card><Text style={s.note}>Payments and monthly renewal are not connected yet.</Text><Button onPress={() => navigate('book')}>BOOK A HAIRCUT  →</Button></>}
      {tab === 'account' && <><Heading eyebrow="ACCOUNT" title="Your profile" /><Card><Text style={s.cardTitle}>Customer account</Text><Text style={s.meta}>Sign in and personal details will connect here.</Text></Card><Card><Text style={s.cardTitle}>Preview on this device</Text><Text style={s.meta}>Demo bookings and haircut balance are stored on this device only.</Text></Card></>}
    </ScrollView>
    <View style={s.nav}>{[['home','HOME'],['book','BOOK'],['bookings','BOOKINGS'],['membership','MEMBERSHIP'],['account','ACCOUNT']].map(([key, label]) => <TouchableOpacity key={key} onPress={() => navigate(key)} style={s.navItem}><Text style={[s.navText, tab === key && s.navActive]}>{label}</Text></TouchableOpacity>)}</View>
  </View></SafeAreaView>;
}

function MembershipCard({ remaining, allowance }) { return <Card selected><Text style={s.eyebrow}>BOXMOOR MONTHLY · DEMO</Text><Text style={s.balance}>{remaining}</Text><Text style={s.cardTitle}>{remaining === 1 ? 'haircut remaining' : 'haircuts remaining'}</Text><Text style={s.meta}>{allowance - remaining} of {allowance} cuts used</Text><View style={s.progress}><View style={[s.progressFill, { width: `${100 * (allowance - remaining) / allowance}%` }]} /></View></Card>; }
function BookingCard({ booking }) { return <Card><Text style={s.cardTitle}>{booking.serviceName}</Text><Text style={s.meta}>{booking.barber} · {prettyDate(booking.date)} · {booking.time}</Text><Text style={s.eyebrow}>{booking.usedCredit ? 'MEMBERSHIP CUT USED' : `£${booking.price}`}</Text></Card>; }

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, app: { flex: 1 }, brandArea: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.line }, brand: { color: colors.cream, fontSize: 25, fontWeight: '800', letterSpacing: 4 }, brandSmall: { color: colors.text, fontSize: 10, fontWeight: '700', letterSpacing: 7 }, scroll: { padding: 22, paddingBottom: 32, flexGrow: 1 }, heading: { marginBottom: 22 }, eyebrow: { color: colors.cream, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 }, title: { color: colors.text, fontSize: 31, fontWeight: '700', lineHeight: 38 }, section: { color: colors.cream, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 25, marginBottom: 12 }, card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 18, marginBottom: 10 }, selected: { borderColor: colors.cream, backgroundColor: colors.panel2 }, row: { flexDirection: 'row', alignItems: 'center' }, flex: { flex: 1 }, cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' }, meta: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6 }, price: { color: colors.cream, fontSize: 17, fontWeight: '800', marginTop: 12 }, note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14 }, button: { padding: 17, borderRadius: 15, backgroundColor: colors.cream, alignItems: 'center', marginTop: 12 }, buttonText: { color: colors.bg, fontSize: 12, fontWeight: '900', letterSpacing: 1 }, secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line }, secondaryText: { color: colors.cream }, disabled: { opacity: 0.4 }, balance: { color: colors.cream, fontSize: 68, fontWeight: '800', lineHeight: 75 }, progress: { backgroundColor: colors.line, height: 6, borderRadius: 6, marginTop: 18, overflow: 'hidden' }, progressFill: { backgroundColor: colors.cream, height: '100%' }, space: { height: 15 }, dayScroll: { flexGrow: 0, marginBottom: 8 }, day: { width: 64, height: 76, borderWidth: 1, borderColor: colors.line, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: colors.panel }, dayActive: { backgroundColor: colors.cream }, dayText: { color: colors.muted, fontSize: 12 }, dayNumber: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 }, dayTextActive: { color: colors.bg }, times: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, slot: { width: '31%', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, alignItems: 'center', paddingVertical: 15, borderRadius: 12, marginBottom: 10 }, slotActive: { backgroundColor: colors.cream }, slotText: { color: colors.text, fontWeight: '700' }, slotTextActive: { color: colors.bg }, nav: { height: 70, borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', backgroundColor: '#091610' }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }, navText: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.2 }, navActive: { color: colors.cream } });
