import { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval, format, parseISO } from 'date-fns';
import './index.css';

const CATS = [
  { id:'housing',  label:'Housing',       icon:'🏠', color:'#6366f1' },
  { id:'food',     label:'Food & Dining', icon:'🍽', color:'#f59e0b' },
  { id:'transport',label:'Transport',     icon:'🚗', color:'#10b981' },
  { id:'entertain',label:'Entertainment', icon:'🎬', color:'#ec4899' },
  { id:'health',   label:'Health',        icon:'💊', color:'#ef4444' },
  { id:'shopping', label:'Shopping',      icon:'🛍', color:'#8b5cf6' },
  { id:'utilities',label:'Utilities',     icon:'⚡', color:'#14b8a6' },
  { id:'salary',   label:'Salary',        icon:'💼', color:'#22c55e' },
  { id:'freelance',label:'Freelance',     icon:'💻', color:'#3b82f6' },
  { id:'invest',   label:'Investment',    icon:'📈', color:'#a78bfa' },
];
const MERCHANTS = {
  housing:['City Apartments','Rent Payment'],food:['Zomato','Swiggy','Big Bazaar','Starbucks'],
  transport:['Uber','Ola','Metro Card','Petrol Pump'],entertain:['Netflix','Spotify','BookMyShow'],
  health:['Apollo Pharmacy','Max Hospital','Gym Membership'],shopping:['Amazon','Flipkart','Myntra'],
  utilities:['Tata Power','Jio Fiber'],salary:['Acme Corp — Salary'],
  freelance:['Client Payment','Upwork','Toptal'],invest:['Zerodha','Groww','SIP Return'],
};
let _id=1;
function mkTxn(daysAgo,catId,type,amount,m){
  const cat=CATS.find(c=>c.id===catId);
  const ml=MERCHANTS[catId];
  return {id:`t${_id++}`,date:format(subDays(new Date(),daysAgo),'yyyy-MM-dd'),
    merchant:m||ml[Math.floor(Math.random()*ml.length)],
    category:catId,categoryLabel:cat.label,categoryIcon:cat.icon,categoryColor:cat.color,type,amount,note:''};
}
const SEED=[
  mkTxn(1,'salary','income',85000,'Acme Corp — Salary'),mkTxn(2,'food','expense',450),
  mkTxn(3,'transport','expense',220),mkTxn(4,'entertain','expense',799,'Netflix'),
  mkTxn(4,'entertain','expense',199,'Spotify'),mkTxn(5,'food','expense',1250),
  mkTxn(6,'shopping','expense',3200,'Amazon'),mkTxn(7,'health','expense',580),
  mkTxn(8,'utilities','expense',1400,'Tata Power'),mkTxn(9,'food','expense',680),
  mkTxn(10,'transport','expense',550,'Petrol Pump'),mkTxn(11,'freelance','income',22000,'Client Payment'),
  mkTxn(12,'food','expense',340),mkTxn(13,'shopping','expense',1800,'Myntra'),
  mkTxn(14,'invest','income',4200,'Zerodha'),mkTxn(15,'housing','expense',18000,'Rent Payment'),
  mkTxn(16,'food','expense',920),mkTxn(17,'entertain','expense',600,'BookMyShow'),
  mkTxn(18,'transport','expense',380,'Uber'),mkTxn(19,'utilities','expense',899,'Jio Fiber'),
  mkTxn(20,'health','expense',1200,'Gym Membership'),mkTxn(22,'shopping','expense',5500,'Flipkart'),
  mkTxn(23,'transport','expense',180,'Metro Card'),mkTxn(24,'invest','income',2800,'SIP Return'),
  mkTxn(32,'salary','income',85000,'Acme Corp — Salary'),mkTxn(33,'housing','expense',18000,'Rent Payment'),
  mkTxn(34,'food','expense',520),mkTxn(35,'utilities','expense',1350,'Tata Power'),
  mkTxn(36,'shopping','expense',2400,'Amazon'),mkTxn(37,'food','expense',380),
  mkTxn(38,'entertain','expense',799,'Netflix'),mkTxn(39,'entertain','expense',199,'Spotify'),
  mkTxn(40,'transport','expense',640,'Petrol Pump'),mkTxn(41,'freelance','income',18000,'Upwork'),
  mkTxn(42,'health','expense',450),mkTxn(43,'food','expense',720),
  mkTxn(44,'shopping','expense',3100,'Myntra'),mkTxn(46,'utilities','expense',899,'Jio Fiber'),
  mkTxn(47,'invest','income',5100,'Dividend Credit'),mkTxn(48,'food','expense',650),
  mkTxn(49,'health','expense',1200,'Gym Membership'),
  mkTxn(62,'salary','income',85000,'Acme Corp — Salary'),mkTxn(63,'housing','expense',18000,'Rent Payment'),
  mkTxn(64,'utilities','expense',1280,'Tata Power'),mkTxn(65,'food','expense',580),
  mkTxn(66,'shopping','expense',4200,'Flipkart'),mkTxn(67,'transport','expense',720),
  mkTxn(68,'entertain','expense',799,'Netflix'),mkTxn(69,'entertain','expense',199,'Spotify'),
  mkTxn(70,'freelance','income',25000,'Toptal'),mkTxn(71,'health','expense',890),
  mkTxn(73,'invest','income',3600,'Zerodha'),mkTxn(74,'shopping','expense',1500,'Myntra'),
  mkTxn(76,'utilities','expense',899,'Jio Fiber'),mkTxn(78,'health','expense',1200,'Gym Membership'),
];

const fc=a=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(a);
const fk=a=>a>=100000?`₹${(a/100000).toFixed(1)}L`:a>=1000?`₹${(a/1000).toFixed(1)}K`:`₹${a}`;

function summary(t){
  const income=t.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const expenses=t.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  return{income,expenses,balance:income-expenses};
}
function monthlyData(t){
  return Array.from({length:6},(_,i)=>{
    const d=subMonths(new Date(),5-i);
    const start=startOfMonth(d),end=endOfMonth(d);
    const m=t.filter(x=>isWithinInterval(parseISO(x.date),{start,end}));
    const income=m.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
    const expenses=m.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
    return{month:format(d,'MMM'),income,expenses,balance:income-expenses};
  });
}
function catBreakdown(t){
  const exp=t.filter(x=>x.type==='expense');
  const total=exp.reduce((s,x)=>s+x.amount,0);
  const map={};
  exp.forEach(x=>{
    if(!map[x.category])map[x.category]={name:x.categoryLabel,icon:x.categoryIcon,color:x.categoryColor,amount:0,count:0};
    map[x.category].amount+=x.amount;map[x.category].count+=1;
  });
  return Object.values(map).map(c=>({...c,pct:total>0?(c.amount/total)*100:0})).sort((a,b)=>b.amount-a.amount);
}
function applyFilters(t,f){
  let r=[...t];
  if(f.dateRange!=='all'){const c=subDays(new Date(),+f.dateRange);r=r.filter(x=>parseISO(x.date)>=c);}
  if(f.type!=='all')r=r.filter(x=>x.type===f.type);
  if(f.category!=='all')r=r.filter(x=>x.category===f.category);
  if(f.search){const q=f.search.toLowerCase();r=r.filter(x=>x.merchant.toLowerCase().includes(q)||x.categoryLabel.toLowerCase().includes(q));}
  r.sort((a,b)=>{
    let c=0;
    if(f.sortBy==='date')c=a.date.localeCompare(b.date);
    if(f.sortBy==='amount')c=a.amount-b.amount;
    if(f.sortBy==='merchant')c=a.merchant.localeCompare(b.merchant);
    return f.sortDir==='desc'?-c:c;
  });
  return r;
}

const Ctx=createContext(null);
const init={transactions:[],role:'admin',darkMode:true,view:'dashboard',
  filters:{search:'',type:'all',category:'all',dateRange:'30',sortBy:'date',sortDir:'desc'}};
function reducer(s,a){
  switch(a.type){
    case'INIT':return{...s,...a.p};
    case'ROLE':return{...s,role:a.p};
    case'FILTER':return{...s,filters:{...s.filters,...a.p}};
    case'VIEW':return{...s,view:a.p};
    case'DARK':return{...s,darkMode:!s.darkMode};
    case'ADD':return{...s,transactions:[a.p,...s.transactions]};
    case'UPD':return{...s,transactions:s.transactions.map(t=>t.id===a.p.id?a.p:t)};
    case'DEL':return{...s,transactions:s.transactions.filter(t=>t.id!==a.p)};
    default:return s;
  }
}
function AppProvider({children}){
  const[s,d]=useReducer(reducer,init);
  useEffect(()=>{
    const sv=localStorage.getItem('ft4');
    if(sv){try{const p=JSON.parse(sv);d({type:'INIT',p});}catch{d({type:'INIT',p:{transactions:SEED}});}}
    else d({type:'INIT',p:{transactions:SEED}});
  },[]);
  useEffect(()=>{if(s.transactions.length)localStorage.setItem('ft4',JSON.stringify({transactions:s.transactions,role:s.role,darkMode:s.darkMode}));},[s.transactions,s.role,s.darkMode]);
  return <Ctx.Provider value={{s,d}}>{children}</Ctx.Provider>;
}
const useApp=()=>useContext(Ctx);

const card={background:'var(--card)',border:'1px solid var(--brd)',borderRadius:12,padding:20};
const inp={width:'100%',padding:'8px 12px',background:'var(--el)',border:'1px solid var(--brd)',borderRadius:8,color:'var(--tp)',fontSize:13,fontFamily:'Sora,sans-serif',outline:'none'};
const pbtn={padding:'9px 16px',background:'var(--ac)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontFamily:'Sora,sans-serif',fontWeight:600};
const gbtn={padding:'8px 14px',background:'transparent',color:'var(--ts)',border:'1px solid var(--brd)',borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:'Sora,sans-serif'};

const TTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:'var(--el)',border:'1px solid var(--brds)',borderRadius:8,padding:'10px 14px',fontSize:12}}>
      <div style={{color:'var(--tm)',marginBottom:6,fontFamily:'Space Mono',fontSize:11}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:'flex',gap:6,alignItems:'center',marginBottom:2}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:p.color,display:'inline-block'}}/>
          <span style={{color:'var(--ts)'}}>{p.name}:</span>
          <b style={{fontFamily:'Space Mono'}}>{fk(p.value)}</b>
        </div>
      ))}
    </div>
  );
};

function Modal({onClose,existing}){
  const{d}=useApp();
  const[f,sf]=useState(existing||{date:format(new Date(),'yyyy-MM-dd'),merchant:'',category:'food',type:'expense',amount:'',note:''});
  const[err,se]=useState('');
  const cat=CATS.find(c=>c.id===f.category);
  const upd=(k,v)=>{sf(p=>({...p,[k]:v}));se('');};
  function submit(){
    if(!f.merchant.trim())return se('Merchant required');
    if(!f.amount||isNaN(f.amount)||+f.amount<=0)return se('Valid amount required');
    const data={...f,amount:+f.amount,categoryLabel:cat.label,categoryIcon:cat.icon,categoryColor:cat.color,id:existing?.id||`t${Date.now()}`};
    d({type:existing?'UPD':'ADD',p:data});onClose();
  }
  const lbl={display:'block',fontSize:11,color:'var(--tm)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6,fontFamily:'Space Mono'};
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="anim" style={{...card,maxWidth:460,width:'100%',boxShadow:'0 24px 80px rgba(0,0,0,.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div className="fd" style={{fontSize:16,fontWeight:700,color:'var(--al)'}}>{existing?'Edit':'New'} Transaction</div>
          <button onClick={()=>dlCSV(filtered)} style={gbtn}>↓ CSV</button>
          <button onClick={()=>{const b=new Blob([JSON.stringify(filtered,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='txns.json';a.click();}} style={gbtn}>↓ JSON</button>
        </div>
      </div>
      <div className="anim" style={{...card,marginBottom:12,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <input value={s.filters.search} onChange={e=>sf({search:e.target.value})} placeholder="🔍 Search..." style={{...inp,flex:'1 1 160px'}}/>
        <select value={s.filters.type} onChange={e=>sf({type:e.target.value})} style={{...inp,width:'auto',minWidth:120}}>
          <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select value={s.filters.category} onChange={e=>sf({category:e.target.value})} style={{...inp,width:'auto',minWidth:140}}>
          <option value="all">All Categories</option>
          {CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <select value={s.filters.dateRange} onChange={e=>sf({dateRange:e.target.value})} style={{...inp,width:'auto',minWidth:130}}>
          {[['7','Last 7 days'],['30','Last 30 days'],['60','Last 60 days'],['all','All time']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={()=>d({type:'FILTER',p:{search:'',type:'all',category:'all',dateRange:'30',sortBy:'date',sortDir:'desc'}})} style={gbtn}>Clear</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:cols,padding:'8px 14px',gap:10,borderBottom:'1px solid var(--brd)'}}>
        {[['date','Date'],['merchant','Merchant']].map(([f,l])=>{
          const active=s.filters.sortBy===f;
          return <button key={f} onClick={()=>sort(f)} style={{background:'none',border:'none',cursor:'pointer',color:active?'var(--al)':'var(--tm)',fontSize:11,fontFamily:'Space Mono',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',display:'flex',alignItems:'center',gap:3}}>
            {l}{active?(s.filters.sortDir==='desc'?' ↓':' ↑'):' ⇅'}
          </button>;
        })}
        {['Category','Type'].map(l=><span key={l} style={{fontSize:11,color:'var(--tm)',fontFamily:'Space Mono',textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</span>)}
        {(()=>{const active=s.filters.sortBy==='amount';return <button onClick={()=>sort('amount')} style={{background:'none',border:'none',cursor:'pointer',color:active?'var(--al)':'var(--tm)',fontSize:11,fontFamily:'Space Mono',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left'}}>Amount{active?(s.filters.sortDir==='desc'?' ↓':' ↑'):' ⇅'}</button>;})()}
        {isAdmin&&<span/>}
      </div>
      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--tm)'}}>
          <div style={{fontSize:38,marginBottom:10}}>◻</div>
          <div className="fd" style={{fontSize:14}}>No transactions found</div>
          <div style={{fontSize:12,marginTop:5}}>Try adjusting your filters</div>
        </div>
      ):filtered.map((t,i)=>(
        <div key={t.id} style={{display:'grid',gridTemplateColumns:cols,padding:'12px 14px',gap:10,alignItems:'center',borderBottom:'1px solid var(--brd)',background:i%2===0?'transparent':'rgba(99,102,241,.02)',transition:'background .15s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--hov)'}
          onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':'rgba(99,102,241,.02)'}>
          <div style={{fontSize:12,color:'var(--tm)',fontFamily:'Space Mono'}}>{t.date}</div>
          <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.merchant}</div>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:7,height:7,borderRadius:2,background:t.categoryColor,display:'inline-block',flexShrink:0}}/>
            <span style={{fontSize:12,color:'var(--ts)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.categoryIcon} {t.categoryLabel}</span>
          </div>
          <div><span style={{fontSize:11,padding:'3px 7px',borderRadius:4,fontFamily:'Space Mono',background:t.type==='income'?'var(--gd)':'var(--rdd)',color:t.type==='income'?'var(--gr)':'var(--rd)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{t.type==='income'?'↑':'↓'} {t.type}</span></div>
          <div className="fd" style={{fontSize:14,fontWeight:700,color:t.type==='income'?'var(--gr)':'var(--tp)'}}>{t.type==='income'?'+':'-'}{fc(t.amount)}</div>
          {isAdmin&&(
            <div style={{display:'flex',gap:3}}>
              <button onClick={()=>{setEdit(t);setModal(true);}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--tm)',fontSize:13,padding:4,borderRadius:4}} onMouseEnter={e=>e.currentTarget.style.color='var(--al)'} onMouseLeave={e=>e.currentTarget.style.color='var(--tm)'}>✎</button>
              <button onClick={()=>setDel(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--tm)',fontSize:13,padding:4,borderRadius:4}} onMouseEnter={e=>e.currentTarget.style.color='var(--rd)'} onMouseLeave={e=>e.currentTarget.style.color='var(--tm)'}>✕</button>
            </div>
          )}
        </div>
      ))}
      {del&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div className="anim" style={{...card,maxWidth:340,width:'100%',margin:16}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>Delete Transaction?</div>
            <div style={{fontSize:13,color:'var(--ts)',marginBottom:18}}>This cannot be undone.</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setDel(null)} style={{...gbtn,flex:1}}>Cancel</button>
              <button onClick={()=>{d({type:'DEL',p:del});setDel(null);}} style={{...pbtn,flex:1,background:'var(--rd)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {modal&&<Modal onClose={()=>{setModal(false);setEdit(null);}} existing={edit}/>}
    </div>
  );
}

function Insights(){
  const{s}=useApp();
  const monthly=useMemo(()=>monthlyData(s.transactions),[s.transactions]);
  const cats=useMemo(()=>{const c=subDays(new Date(),30);return catBreakdown(s.transactions.filter(t=>parseISO(t.date)>=c));},[s.transactions]);
  const sum30=useMemo(()=>{const c=subDays(new Date(),30);return summary(s.transactions.filter(t=>parseISO(t.date)>=c));},[s.transactions]);
  const last2=monthly.slice(-2);
  const momD=last2[0]?.expenses>0?((last2[1]?.expenses-last2[0]?.expenses)/last2[0]?.expenses)*100:0;
  const savRate=sum30.income>0?((sum30.income-sum30.expenses)/sum30.income)*100:0;
  const top=cats[0];
  const IC=({title,val,sub,icon,accent,dl=0})=>(
    <div className="anim" style={{...card,flex:1,minWidth:200,position:'relative',overflow:'hidden',animationDelay:`${dl*.08}s`}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${accent},transparent)`}}/>
      <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
      <div style={{fontSize:11,color:'var(--tm)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'Space Mono',marginBottom:5}}>{title}</div>
      <div className="fd" style={{fontSize:22,fontWeight:700,color:accent,letterSpacing:'-0.5px'}}>{val}</div>
      {sub&&<div style={{fontSize:12,color:'var(--ts)',marginTop:5}}>{sub}</div>}
    </div>
  );
  return(
    <div>
      <div style={{marginBottom:22}}>
        <div className="fd" style={{fontSize:22,fontWeight:700,letterSpacing:'-0.5px'}}>Insights</div>
        <div style={{fontSize:13,color:'var(--ts)',marginTop:4}}>Smart observations about your spending</div>
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:14}}>
        <IC title="Top Category" icon={top?.icon||'📊'} val={top?.name||'N/A'} sub={top?`${fk(top.amount)} · ${top.pct.toFixed(1)}% of spending`:''} accent="var(--al)" dl={1}/>
        <IC title="Month vs Last" icon={momD>0?'📈':'📉'} val={`${momD>0?'+':''}${momD.toFixed(1)}%`} sub={`Expenses ${momD>0?'up':'down'} ${fk(Math.abs((last2[1]?.expenses||0)-(last2[0]?.expenses||0)))}`} accent={momD>0?'var(--rd)':'var(--gr)'} dl={2}/>
        <IC title="Savings Rate" icon="💰" val={`${savRate.toFixed(1)}%`} sub={savRate>=30?'🏆 Excellent':savRate>=20?'✓ Healthy':'⚠ Below 20%'} accent={savRate>=20?'var(--gr)':'var(--am)'} dl={3}/>
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:14}}>
        <div className="anim" style={{...card,flex:1,minWidth:260,animationDelay:'.2s'}}>
          <div style={{fontSize:11,color:'var(--tm)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'Space Mono',marginBottom:4}}>Monthly Net Balance</div>
          <div style={{fontSize:13,color:'var(--ts)',marginBottom:12}}>Savings per month</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={monthly} margin={{top:4,right:4,bottom:0,left:0}}>
              <CartesianGrid stroke="var(--gl)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:'var(--tm)',fontSize:11,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--tm)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={fk}/>
              <Tooltip content={<TTip/>}/>
              <Bar dataKey="balance" name="Net" radius={[4,4,0,0]}>
                {monthly.map((e,i)=><Cell key={i} fill={e.balance>=0?'#10b981':'#f43f5e'} fillOpacity={.8}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="anim" style={{...card,flex:1.2,minWidth:280,animationDelay:'.25s'}}>
          <div style={{fontSize:11,color:'var(--tm)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'Space Mono',marginBottom:4}}>Category Breakdown</div>
          <div style={{fontSize:13,color:'var(--ts)',marginBottom:12}}>Last 30 days</div>
          {cats.length===0?<div style={{color:'var(--tm)',fontSize:13,textAlign:'center',padding:20}}>No expense data</div>:
            cats.map((c,i)=>(
              <div key={i} style={{marginBottom:11}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}><span>{c.icon}</span><span style={{fontSize:13}}>{c.name}</span><span style={{fontSize:11,color:'var(--tm)'}}>({c.count})</span></div>
                  <span className="fd" style={{fontSize:13,color:c.color,fontWeight:700}}>{fk(c.amount)}</span>
                </div>
                <div style={{height:4,background:'var(--el)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${c.pct}%`,background:c.color,borderRadius:2,transition:'width .6s',opacity:.8}}/>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="anim" style={{...card,animationDelay:'.3s'}}>
        <div style={{fontSize:11,color:'var(--tm)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'Space Mono',marginBottom:14}}>Monthly Summary</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr>{['Month','Income','Expenses','Net','Savings %'].map(h=>(
              <th key={h} style={{textAlign:h==='Month'?'left':'right',padding:'8px 12px',fontSize:11,color:'var(--tm)',fontFamily:'Space Mono',textTransform:'uppercase',borderBottom:'1px solid var(--brd)'}}>{h}</th>
            ))}</tr></thead>
            <tbody>{monthly.map((m,i)=>{
              const sp=m.income>0?((m.income-m.expenses)/m.income*100):0;
              return <tr key={i} style={{borderBottom:'1px solid var(--brd)',transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--hov)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'11px 12px',fontFamily:'Space Mono',fontWeight:700}}>{m.month}</td>
                <td style={{padding:'11px 12px',textAlign:'right',color:'var(--gr)'}}>{fc(m.income)}</td>
                <td style={{padding:'11px 12px',textAlign:'right',color:'var(--rd)'}}>{fc(m.expenses)}</td>
                <td style={{padding:'11px 12px',textAlign:'right',color:m.balance>=0?'var(--gr)':'var(--rd)',fontFamily:'Space Mono',fontWeight:700}}>{m.balance>=0?'+':''}{fc(m.balance)}</td>
                <td style={{padding:'11px 12px',textAlign:'right',color:sp>=20?'var(--gr)':'var(--am)'}}>{sp.toFixed(1)}%</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Sidebar(){
  const{s,d}=useApp();
  const nav=[{id:'dashboard',icon:'◈',label:'Dashboard'},{id:'transactions',icon:'⊞',label:'Transactions'},{id:'insights',icon:'◎',label:'Insights'}];
  return(
    <aside style={{width:210,minHeight:'100vh',background:'var(--surf)',borderRight:'1px solid var(--brd)',display:'flex',flexDirection:'column',padding:'22px 0',position:'sticky',top:0,flexShrink:0}}>
      <div style={{padding:'0 18px 22px',borderBottom:'1px solid var(--brd)'}}>
        <div className="fd" style={{fontSize:17,fontWeight:700,color:'var(--al)',letterSpacing:'-0.5px'}}>FINTRACE</div>
        <div style={{fontSize:10,color:'var(--tm)',marginTop:3,letterSpacing:'0.1em'}}>FINANCIAL DASHBOARD</div>
      </div>
      <div style={{padding:'14px 18px',borderBottom:'1px solid var(--brd)'}}>
        <div style={{fontSize:10,letterSpacing:'0.12em',color:'var(--tm)',marginBottom:7,textTransform:'uppercase',fontFamily:'Space Mono'}}>Role</div>
        <div style={{display:'flex',gap:6}}>
          {['admin','viewer'].map(r=>(
            <button key={r} onClick={()=>d({type:'ROLE',p:r})} style={{flex:1,padding:'6px 0',border:'1px solid',
              borderColor:s.role===r?'var(--ac)':'var(--brd)',borderRadius:6,
              background:s.role===r?'var(--ag)':'transparent',
              color:s.role===r?'var(--al)':'var(--ts)',
              fontSize:11,cursor:'pointer',fontFamily:'Space Mono',fontWeight:700,textTransform:'uppercase',transition:'all .2s'}}>
              {r}
            </button>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:10,padding:'4px 8px',borderRadius:4,textAlign:'center',background:s.role==='admin'?'var(--gd)':'var(--amd)',color:s.role==='admin'?'var(--gr)':'var(--am)'}}>
          {s.role==='admin'?'✓ Can add & edit':'👁 View only'}
        </div>
      </div>
      <nav style={{flex:1,padding:'14px 10px'}}>
        {nav.map(item=>{
          const active=s.view===item.id;
          return <button key={item.id} onClick={()=>d({type:'VIEW',p:item.id})} style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'10px 11px',border:'none',borderLeft:`2px solid ${active?'var(--ac)':'transparent'}`,borderRadius:8,borderTopLeftRadius:0,borderBottomLeftRadius:0,background:active?'var(--ag)':'transparent',color:active?'var(--al)':'var(--ts)',cursor:'pointer',fontSize:13,fontFamily:'Sora,sans-serif',fontWeight:active?600:400,transition:'all .2s',marginBottom:3,textAlign:'left'}}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background='var(--hov)';}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
            <span style={{fontSize:17}}>{item.icon}</span>{item.label}
            {active&&<span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'var(--ac)',display:'inline-block'}}/>}
          </button>;
        })}
      </nav>
      <div style={{padding:'14px 18px',borderTop:'1px solid var(--brd)'}}>
        <button onClick={()=>d({type:'DARK'})} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',border:'1px solid var(--brd)',borderRadius:8,background:'transparent',color:'var(--ts)',cursor:'pointer',fontSize:12,fontFamily:'Sora,sans-serif',transition:'all .2s'}}>
          <span>{s.darkMode?'☀':'🌙'}</span>{s.darkMode?'Light Mode':'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}

function AppContent(){
  const{s,d}=useApp();
  useEffect(()=>{document.documentElement.className=s.darkMode?'dark':'light';},[s.darkMode]);
  const views={dashboard:<Dashboard/>,transactions:<Transactions/>,insights:<Insights/>};
  const nav=[{id:'dashboard',icon:'◈',label:'Home'},{id:'transactions',icon:'⊞',label:'Txns'},{id:'insights',icon:'◎',label:'Insights'}];
  return(
    <div className="gbg" style={{display:'flex',minHeight:'100vh'}}>
      <div className="hm"><Sidebar/></div>
      <main style={{flex:1,overflowX:'hidden',minWidth:0}}>
        <div className="hd" style={{position:'sticky',top:0,zIndex:50,background:'var(--surf)',borderBottom:'1px solid var(--brd)',padding:'13px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="fd" style={{fontSize:15,fontWeight:700,color:'var(--al)'}}>FINTRACE</div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:11,color:'var(--tm)',fontFamily:'Space Mono',textTransform:'uppercase'}}>{s.role}</span>
            <button onClick={()=>d({type:'DARK'})} style={{background:'none',border:'none',cursor:'pointer',fontSize:16}}>{s.darkMode?'☀':'🌙'}</button>
          </div>
        </div>
        <div style={{padding:'26px 26px 80px',maxWidth:1200}}>{views[s.view]||<Dashboard/>}</div>
      </main>
      <div className="hd" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--surf)',borderTop:'1px solid var(--brd)',display:'flex',padding:'8px 0 12px',zIndex:100}}>
        {nav.map(item=>{
          const active=s.view===item.id;
          return <button key={item.id} onClick={()=>d({type:'VIEW',p:item.id})} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:active?'var(--al)':'var(--tm)',transition:'color .2s'}}>
            <span style={{fontSize:21}}>{item.icon}</span>
            <span style={{fontSize:10,fontFamily:'Space Mono',letterSpacing:'0.05em'}}>{item.label}</span>
          </button>;
        })}
      </div>
    </div>
  );
}

export default function App(){
  return <AppProvider><AppContent/></AppProvider>;
}
