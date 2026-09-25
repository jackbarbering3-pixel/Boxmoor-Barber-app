import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = { bg:'#07120E', panel:'#0E1C16', panel2:'#13241C', cream:'#E6D6B0', text:'#F7F3E9', muted:'#A9B0A9', line:'#24372D', green:'#173A2A' };
const services = [
  {id:'cut', name:'Haircut', duration:'30 min', price:'£25'},
  {id:'fade', name:'Skin Fade', duration:'40 min', price:'£28'},
  {id:'combo', name:'Haircut + Beard', duration:'45 min', price:'£35'},
  {id:'beard', name:'Beard Trim', duration:'20 min', price:'£15'},
];
const barbers = ['Jack','Barber 2','No preference'];
const times = ['09:00','10:30','12:00','14:30','16:00','17:30'];

function Header({title, sub}) { return <View style={s.header}><Text style={s.brand}>BOXMOOR</Text><Text style={s.brand2}>BARBERS</Text>{title ? <Text style={s.title}>{title}</Text>:null}{sub ? <Text style={s.sub}>{sub}</Text>:null}</View> }
function Card({children, style}) { return <View style={[s.card, style]}>{children}</View> }
function Pill({children, active, onPress}) { return <TouchableOpacity onPress={onPress} style={[s.pill, active&&s.pillActive]}><Text style={[s.pillText, active&&s.pillTextActive]}>{children}</Text></TouchableOpacity> }

export default function App(){
 const [tab,setTab]=useState('book');
 const [service,setService]=useState(services[0]);
 const [barber,setBarber]=useState(barbers[0]);
 const [time,setTime]=useState(times[2]);
 const [booked,setBooked]=useState(false);
 const date=useMemo(()=>new Date(Date.now()+86400000).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),[]);
 return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><View style={s.app}>
   <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
    {tab==='book' && <>
      <Header sub="Traditional standards. Modern booking."/>
      {booked ? <Card style={s.confirm}><Text style={s.eyebrow}>APPOINTMENT CONFIRMED</Text><Text style={s.big}>{service.name}</Text><Text style={s.meta}>{date} · {time}</Text><Text style={s.meta}>{barber}</Text><TouchableOpacity style={s.secondary} onPress={()=>setBooked(false)}><Text style={s.secondaryText}>BOOK ANOTHER</Text></TouchableOpacity></Card> : <>
      <Text style={s.section}>CHOOSE A SERVICE</Text>
      {services.map(x=><TouchableOpacity key={x.id} onPress={()=>setService(x)}><Card style={service.id===x.id?s.selected:null}><View style={s.row}><View><Text style={s.cardTitle}>{x.name}</Text><Text style={s.meta}>{x.duration}</Text></View><Text style={s.price}>{x.price}</Text></View></Card></TouchableOpacity>)}
      <Text style={s.section}>BARBER</Text><View style={s.wrap}>{barbers.map(x=><Pill key={x} active={barber===x} onPress={()=>setBarber(x)}>{x}</Pill>)}</View>
      <Text style={s.section}>TOMORROW · {date.toUpperCase()}</Text><View style={s.wrap}>{times.map(x=><Pill key={x} active={time===x} onPress={()=>setTime(x)}>{x}</Pill>)}</View>
      <TouchableOpacity style={s.primary} onPress={()=>setBooked(true)}><Text style={s.primaryText}>CONFIRM BOOKING · {service.price}</Text></TouchableOpacity></>}
    </>}
    {tab==='membership' && <><Header title="Membership" sub="Your cuts, tracked automatically."/><Card style={s.member}><Text style={s.eyebrow}>BOXMOOR MONTHLY</Text><Text style={s.remaining}>1</Text><Text style={s.big}>haircut remaining</Text><Text style={s.meta}>1 of 2 haircuts used · renews monthly</Text><View style={s.progress}><View style={s.progressHalf}/></View></Card><Card><Text style={s.cardTitle}>£50 / month</Text><Text style={s.copy}>Two standard haircuts included each month. Your allowance updates after each eligible booking.</Text></Card><TouchableOpacity style={s.primary} onPress={()=>setTab('book')}><Text style={s.primaryText}>USE MY REMAINING CUT</Text></TouchableOpacity></>}
    {tab==='account' && <><Header title="Your account"/><Card><Text style={s.eyebrow}>CUSTOMER</Text><Text style={s.big}>Welcome to Boxmoor</Text><Text style={s.copy}>Manage upcoming appointments, membership and contact details here.</Text></Card><Card><Text style={s.cardTitle}>Upcoming appointment</Text><Text style={s.meta}>No live appointment connected yet</Text></Card><Card><Text style={s.cardTitle}>Membership</Text><Text style={s.meta}>Boxmoor Monthly · Active</Text></Card></>}
   </ScrollView>
   <View style={s.nav}>{[['book','BOOK'],['membership','MEMBERSHIP'],['account','ACCOUNT']].map(([k,l])=><TouchableOpacity key={k} onPress={()=>setTab(k)} style={s.navItem}><Text style={[s.navText,tab===k&&s.navActive]}>{l}</Text></TouchableOpacity>)}</View>
 </View></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},app:{flex:1,backgroundColor:C.bg},scroll:{padding:22,paddingBottom:110},header:{paddingTop:18,paddingBottom:28},brand:{color:C.cream,fontSize:34,fontWeight:'800',letterSpacing:5},brand2:{color:C.text,fontSize:13,fontWeight:'700',letterSpacing:9,marginTop:2},title:{color:C.text,fontSize:30,fontWeight:'700',marginTop:30},sub:{color:C.muted,fontSize:15,marginTop:12,lineHeight:22},section:{color:C.cream,fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:20,marginBottom:10},card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:18,padding:18,marginBottom:10},selected:{borderColor:C.cream,backgroundColor:C.panel2},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},cardTitle:{color:C.text,fontSize:17,fontWeight:'700'},meta:{color:C.muted,fontSize:13,marginTop:5},price:{color:C.cream,fontSize:18,fontWeight:'800'},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},pill:{paddingVertical:11,paddingHorizontal:15,borderRadius:999,borderWidth:1,borderColor:C.line,backgroundColor:C.panel},pillActive:{backgroundColor:C.cream,borderColor:C.cream},pillText:{color:C.text,fontWeight:'600'},pillTextActive:{color:C.bg},primary:{backgroundColor:C.cream,padding:18,borderRadius:16,alignItems:'center',marginTop:24},primaryText:{color:C.bg,fontWeight:'900',fontSize:13,letterSpacing:1},secondary:{borderWidth:1,borderColor:C.cream,padding:15,borderRadius:14,alignItems:'center',marginTop:22},secondaryText:{color:C.cream,fontWeight:'800'},confirm:{marginTop:20,paddingVertical:28},eyebrow:{color:C.cream,fontSize:10,fontWeight:'900',letterSpacing:2,marginBottom:12},big:{color:C.text,fontSize:24,fontWeight:'700'},member:{paddingVertical:25},remaining:{color:C.cream,fontSize:68,fontWeight:'800',lineHeight:72},progress:{height:6,backgroundColor:C.line,borderRadius:9,marginTop:22,overflow:'hidden'},progressHalf:{height:'100%',width:'50%',backgroundColor:C.cream},copy:{color:C.muted,fontSize:14,lineHeight:22,marginTop:10},nav:{position:'absolute',left:0,right:0,bottom:0,height:82,backgroundColor:'#091610',borderTopWidth:1,borderTopColor:C.line,flexDirection:'row',paddingBottom:12},navItem:{flex:1,alignItems:'center',justifyContent:'center'},navText:{color:'#6F7A73',fontSize:10,fontWeight:'800',letterSpacing:1},navActive:{color:C.cream}});
