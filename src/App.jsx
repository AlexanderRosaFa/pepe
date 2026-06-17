import { useState, useEffect, useRef } from "react";

// ── Tokens ────────────────────────────────────────────────────
const T = {
  navy:      "#1B2B4B",
  ink:       "#0D1B2A",
  chalk:     "#F7F4EE",
  parchment: "#EDE8DC",
  amber:     "#F5A623",
  amberSoft: "#FDE9B8",
  mint:      "#4DB89E",
  mintSoft:  "#C7EDDE",
  coral:     "#F26D5B",
  coralSoft: "#FDDCD8",
  lavender:  "#9B8FD4",
  lavSoft:   "#E8E4F7",
  blue:      "#4A90D9",
  blueSoft:  "#D6E8F7",
  slate:     "#6B7A8D",
  white:     "#FFFFFF",
};

const PALETTE = [
  { color: T.amber,    soft: T.amberSoft },
  { color: T.mint,     soft: T.mintSoft  },
  { color: T.coral,    soft: T.coralSoft },
  { color: T.lavender, soft: T.lavSoft   },
  { color: T.blue,     soft: T.blueSoft  },
  { color: "#E91E8C",  soft: "#FCDCEE"   },
];

const ICONS_SUBJECT = ["📐","🔬","📖","🏛️","🎨","🎵","💻","🌍","⚽","🏋️"];
const ICONS_HABIT   = ["📱","🎮","📚","🏃","🧘","💧","🎯","✏️","🎸","🌱"];
const DAYS_SHORT    = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// ── Storage helpers ───────────────────────────────────────────
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Time helpers ──────────────────────────────────────────────
const t2m = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const DAY_START = 8*60, DAY_END = 19*60, PPM = 1.85;
const mpx = (m) => m * PPM;
const todayKey = () => new Date().toISOString().slice(0,10);
const todayIdx = () => { const d = new Date().getDay(); return d===0?6:d-1; };

// ── Default data ──────────────────────────────────────────────
const DEF_SUBJECTS = [
  { id:"s1", name:"Matemáticas", icon:"📐", color:T.amber,    soft:T.amberSoft, teacher:"Prof. García", topics:["Fracciones","Álgebra","Geometría","Estadística"], progress:65 },
  { id:"s2", name:"Ciencias",    icon:"🔬", color:T.mint,     soft:T.mintSoft,  teacher:"Prof. Ramos",  topics:["Células","Ecosistemas","Energía","Física"],       progress:48 },
  { id:"s3", name:"Lengua",      icon:"📖", color:T.lavender, soft:T.lavSoft,   teacher:"Prof. Luna",   topics:["Gramática","Redacción","Literatura","Ortografía"], progress:80 },
];
const DEF_GOALS = [
  { id:"g1", text:"Aprobar examen de fracciones", subjectId:"s1", done:false, due:"Jun 20" },
  { id:"g2", text:"Entregar proyecto de Ciencias", subjectId:"s2", done:false, due:"Jun 25" },
  { id:"g3", text:"Jugar afuera 1h", subjectId:null, done:false, due:"Diario" },
];
const DEF_SCHEDULE = {
  0:[{id:"e1",time:"08:00",duration:90,subjectId:"s1",label:"",type:"class",room:"Aula 3A"},{id:"e2",time:"10:00",duration:60,subjectId:"s2",label:"",type:"class",room:"Lab"},{id:"e3",time:"15:00",duration:60,subjectId:null,label:"Tiempo libre 🎮",type:"free",room:""}],
  1:[{id:"e4",time:"09:00",duration:90,subjectId:"s3",label:"",type:"class",room:"Aula 3A"},{id:"e5",time:"16:00",duration:90,subjectId:null,label:"Deporte 🏃",type:"free",room:""}],
  2:[{id:"e6",time:"08:00",duration:60,subjectId:"s1",label:"",type:"class",room:"Aula 3A"},{id:"e7",time:"14:00",duration:120,subjectId:null,label:"Tarde libre 🎨",type:"free",room:""}],
  3:[{id:"e8",time:"08:00",duration:90,subjectId:"s3",label:"",type:"class",room:"Aula 3A"}],
  4:[{id:"e9",time:"09:00",duration:60,subjectId:"s1",label:"",type:"class",room:"Aula 3A"},{id:"e10",time:"16:00",duration:120,subjectId:null,label:"Fin de semana 🏖️",type:"free",room:""}],
};
const DEF_HABITS = [
  { id:"h1", name:"Duolingo", icon:"📱", color:T.mint, soft:T.mintSoft, goal:7, checks:{} },
  { id:"h2", name:"Leer 20 min", icon:"📚", color:T.lavender, soft:T.lavSoft, goal:5, checks:{} },
];

// ── uid ───────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,8);

// ── Modal wrapper ─────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(13,27,42,.55)",zIndex:100,display:"flex",alignItems:"flex-end" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.white,borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxHeight:"90svh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <span style={{ fontWeight:700,fontSize:17,color:T.ink }}>{title}</span>
          <button onClick={onClose} style={{ background:T.parchment,border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12,fontWeight:700,color:T.slate,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em" }}>{label}</div>
      {children}
    </div>
  );
}
const inp = { width:"100%",border:`1.5px solid ${T.parchment}`,borderRadius:10,padding:"10px 12px",fontSize:14,color:T.ink,background:T.chalk,boxSizing:"border-box",fontFamily:"inherit",outline:"none" };
const btn = (bg,color="#fff") => ({ background:bg,color,border:"none",borderRadius:12,padding:"12px 0",width:"100%",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:6 });

// ════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]           = useState("semana");
  const [activeDay, setDay]     = useState(todayIdx() < 5 ? todayIdx() : 0);
  const [subjects, setSubjects] = useState(() => load("subjects", DEF_SUBJECTS));
  const [goals, setGoals]       = useState(() => load("goals",    DEF_GOALS));
  const [schedule, setSchedule] = useState(() => load("schedule", DEF_SCHEDULE));
  const [habits, setHabits]     = useState(() => load("habits",   DEF_HABITS));
  const [expanded, setExpanded] = useState(null);

  // Modal states
  const [modal, setModal] = useState(null); // "subject"|"goal"|"event"|"habit"
  const [editing, setEditing] = useState(null);

  // Persist
  useEffect(() => save("subjects", subjects), [subjects]);
  useEffect(() => save("goals",    goals),    [goals]);
  useEffect(() => save("schedule", schedule), [schedule]);
  useEffect(() => save("habits",   habits),   [habits]);

  const subjOf = id => subjects.find(s=>s.id===id);

  // ── CRUD helpers ─────────────────────────────────────────
  function saveSubject(data) {
    if (data.id) setSubjects(s => s.map(x => x.id===data.id ? data : x));
    else         setSubjects(s => [...s, { ...data, id:"s"+uid() }]);
    setModal(null); setEditing(null);
  }
  function deleteSubject(id) {
    setSubjects(s => s.filter(x=>x.id!==id));
    setGoals(g => g.filter(x=>x.subjectId!==id));
    setSchedule(sc => {
      const n={};
      Object.keys(sc).forEach(d=>{ n[d]=sc[d].filter(e=>e.subjectId!==id); });
      return n;
    });
    setModal(null); setEditing(null);
  }
  function saveGoal(data) {
    if (data.id) setGoals(g => g.map(x => x.id===data.id ? data : x));
    else         setGoals(g => [...g, { ...data, id:"g"+uid(), done:false }]);
    setModal(null); setEditing(null);
  }
  function deleteGoal(id) { setGoals(g=>g.filter(x=>x.id!==id)); setModal(null); setEditing(null); }
  function toggleGoal(id)  { setGoals(g=>g.map(x=>x.id===id?{...x,done:!x.done}:x)); }

  function saveEvent(data, day) {
    setSchedule(sc => {
      const n = {...sc};
      const dayArr = n[day] ? [...n[day]] : [];
      if (data.id) { const i=dayArr.findIndex(e=>e.id===data.id); if(i>=0) dayArr[i]=data; }
      else dayArr.push({...data,id:"e"+uid()});
      n[day] = dayArr.sort((a,b)=>t2m(a.time)-t2m(b.time));
      return n;
    });
    setModal(null); setEditing(null);
  }
  function deleteEvent(id, day) {
    setSchedule(sc=>({...sc,[day]:sc[day].filter(e=>e.id!==id)}));
    setModal(null); setEditing(null);
  }

  function saveHabit(data) {
    if (data.id) setHabits(h=>h.map(x=>x.id===data.id?data:x));
    else         setHabits(h=>[...h,{...data,id:"h"+uid(),checks:{}}]);
    setModal(null); setEditing(null);
  }
  function deleteHabit(id) { setHabits(h=>h.filter(x=>x.id!==id)); setModal(null); setEditing(null); }
  function toggleHabit(id) {
    const key = todayKey();
    setHabits(h=>h.map(x=>x.id===id?{...x,checks:{...x.checks,[key]:!x.checks?.[key]}}:x));
  }

  // ── Streak calc ───────────────────────────────────────────
  function streak(checks={}) {
    let count=0, d=new Date();
    while(true) {
      const k=d.toISOString().slice(0,10);
      if(checks[k]) { count++; d.setDate(d.getDate()-1); }
      else break;
    }
    return count;
  }
  function weekChecks(checks={}) {
    const days=[]; const now=new Date();
    for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d.toISOString().slice(0,10));}
    return days.map(k=>!!checks[k]);
  }

  const dayEvents = (schedule[activeDay]||[]).slice().sort((a,b)=>t2m(a.time)-t2m(b.time));

  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif",background:T.chalk,minHeight:"100svh",color:T.ink }}>

      {/* Header */}
      <header style={{ background:T.navy,padding:"16px 20px 0",position:"sticky",top:0,zIndex:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:T.amber,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>📅</div>
          <div>
            <div style={{ color:T.chalk,fontWeight:700,fontSize:17,letterSpacing:"-0.3px" }}>Mi Calendario</div>
            <div style={{ color:"#8BA0BE",fontSize:12 }}>{new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:2 }}>
          {[["semana","📆"],["materias","📚"],["objetivos","🎯"],["rachas","🔥"]].map(([k,ic])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1,padding:"9px 4px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",
              fontWeight:600,fontSize:11,
              background:tab===k?T.chalk:"transparent",
              color:tab===k?T.navy:"#8BA0BE",transition:"all .15s",
            }}>{ic} {k.charAt(0).toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
      </header>

      <main style={{ padding:"18px 16px 80px",maxWidth:520,margin:"0 auto" }}>

        {/* ══ SEMANA ══ */}
        {tab==="semana" && <>
          {/* Day strip */}
          <div style={{ display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:2 }}>
            {DAYS_SHORT.map((d,i)=>(
              <button key={i} onClick={()=>setDay(i)} style={{
                flexShrink:0,width:52,padding:"10px 0",borderRadius:14,border:"2px solid",
                borderColor:activeDay===i?T.amber:T.parchment,
                background:activeDay===i?T.navy:T.white,
                color:activeDay===i?T.white:T.ink,
                fontWeight:700,fontSize:13,cursor:"pointer",position:"relative",
              }}>
                {d}
                {schedule[i]?.length>0 && <div style={{ position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",width:5,height:5,borderRadius:"50%",background:activeDay===i?T.amber:T.mint }} />}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ background:T.white,borderRadius:18,padding:"16px 12px 16px 48px",boxShadow:"0 2px 16px rgba(27,43,75,.07)",position:"relative",minHeight:mpx(DAY_END-DAY_START)+32 }}>
            {/* Hour lines */}
            {Array.from({length:(DAY_END-DAY_START)/60+1},(_,i)=>(
              <div key={i} style={{ position:"absolute",left:0,top:mpx(i*60)+16,right:0 }}>
                <span style={{ position:"absolute",left:4,fontSize:10,color:T.slate,transform:"translateY(-50%)",fontVariantNumeric:"tabular-nums" }}>{String(DAY_START/60+i).padStart(2,"0")}:00</span>
                <div style={{ position:"absolute",left:44,right:10,height:1,background:T.parchment,top:0 }} />
              </div>
            ))}

            {dayEvents.length===0 && (
              <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",color:T.slate }}>
                <div style={{ fontSize:32,marginBottom:8 }}>😴</div>
                <div style={{ fontWeight:600 }}>Día libre</div>
                <div style={{ fontSize:13 }}>Toca + para agregar algo</div>
              </div>
            )}

            {dayEvents.map(ev=>{
              const top    = mpx(t2m(ev.time)-DAY_START);
              const height = Math.max(mpx(ev.duration)-4,28);
              const subj   = ev.subjectId ? subjOf(ev.subjectId) : null;
              const color  = subj ? subj.color : T.coral;
              const soft   = subj ? subj.soft  : T.coralSoft;
              const label  = subj ? subj.name  : ev.label;
              const icon   = subj ? subj.icon  : "🎮";
              return (
                <div key={ev.id} onClick={()=>{setEditing({...ev,_day:activeDay});setModal("event");}} style={{
                  position:"absolute",top:top+16,left:44,right:10,height,
                  borderRadius:12,background:soft,borderLeft:`4px solid ${color}`,
                  padding:"6px 10px",overflow:"hidden",cursor:"pointer",
                }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:13 }}>{icon}</span>
                    <span style={{ fontWeight:700,fontSize:13,color:T.ink }}>{label}</span>
                  </div>
                  {height>38 && <div style={{ fontSize:11,color:T.slate,marginTop:2 }}>{ev.time} · {ev.duration} min{ev.room?` · ${ev.room}`:""}</div>}
                </div>
              );
            })}
          </div>

          {/* Add event button */}
          <button onClick={()=>{setEditing(null);setModal("event");}} style={{ ...btn(T.navy),marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <span style={{ fontSize:18 }}>+</span> Agregar al {DAYS_SHORT[activeDay]}
          </button>
        </>}

        {/* ══ MATERIAS ══ */}
        {tab==="materias" && <>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {subjects.map(s=>(
              <div key={s.id} style={{ background:T.white,borderRadius:18,overflow:"hidden",boxShadow:"0 2px 14px rgba(27,43,75,.06)" }}>
                <button onClick={()=>setExpanded(expanded===s.id?null:s.id)} style={{ width:"100%",background:"none",border:"none",padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",textAlign:"left" }}>
                  <div style={{ width:46,height:46,borderRadius:14,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:15,color:T.ink }}>{s.name}</div>
                    <div style={{ fontSize:12,color:T.slate }}>{s.teacher}</div>
                    <div style={{ marginTop:8,height:5,borderRadius:3,background:T.parchment,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${s.progress}%`,background:s.color,borderRadius:3,transition:"width .4s" }} />
                    </div>
                    <div style={{ fontSize:11,color:T.slate,marginTop:3 }}>Temario: {s.progress}% completado</div>
                  </div>
                  <span style={{ fontSize:18,color:T.slate,display:"inline-block",transform:expanded===s.id?"rotate(180deg)":"none",transition:"transform .2s" }}>▾</span>
                </button>
                {expanded===s.id && (
                  <div style={{ borderTop:`1px solid ${T.parchment}`,padding:"14px 18px 18px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                      <div style={{ fontWeight:700,fontSize:11,color:T.slate,letterSpacing:".08em",textTransform:"uppercase" }}>Temario</div>
                      <button onClick={()=>{setEditing(s);setModal("subject");}} style={{ fontSize:12,color:T.navy,fontWeight:600,background:"none",border:"none",cursor:"pointer" }}>✏️ Editar</button>
                    </div>
                    {(s.topics||[]).map((topic,idx)=>{
                      const done=idx/Math.max(s.topics.length,1)<s.progress/100;
                      return (
                        <div key={idx} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:idx<s.topics.length-1?`1px solid ${T.parchment}`:"none" }}>
                          <div style={{ width:22,height:22,borderRadius:6,background:done?s.color:T.parchment,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:T.white }}>{done?"✓":""}</div>
                          <span style={{ fontSize:14,color:done?T.ink:T.slate,fontWeight:done?500:400 }}>{topic}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={()=>{setEditing(null);setModal("subject");}} style={{ ...btn(T.navy),marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <span style={{ fontSize:18 }}>+</span> Nueva materia
          </button>
        </>}

        {/* ══ OBJETIVOS ══ */}
        {tab==="objetivos" && <>
          {/* Summary */}
          <div style={{ background:T.navy,borderRadius:18,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:20 }}>
            <div>
              <div style={{ color:T.amber,fontWeight:800,fontSize:36,lineHeight:1 }}>
                {goals.filter(g=>g.done).length}<span style={{ fontSize:20,color:"#8BA0BE" }}>/{goals.length}</span>
              </div>
              <div style={{ color:"#8BA0BE",fontSize:13,marginTop:4 }}>completados</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ height:8,borderRadius:4,background:"#263854",overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:4,background:T.amber,width:`${goals.length?goals.filter(g=>g.done).length/goals.length*100:0}%`,transition:"width .4s" }} />
              </div>
              <div style={{ color:"#8BA0BE",fontSize:12,marginTop:6 }}>{goals.length?Math.round(goals.filter(g=>g.done).length/goals.length*100):0}% del total</div>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {goals.map(g=>{
              const subj=g.subjectId?subjOf(g.subjectId):null;
              return (
                <div key={g.id} style={{ background:g.done?T.mintSoft:T.white,border:`2px solid ${g.done?T.mint:T.parchment}`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,transition:"all .15s" }}>
                  <button onClick={()=>toggleGoal(g.id)} style={{ width:26,height:26,borderRadius:8,flexShrink:0,border:`2.5px solid ${g.done?T.mint:T.parchment}`,background:g.done?T.mint:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.white,cursor:"pointer" }}>{g.done?"✓":""}</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,fontSize:14,color:T.ink,textDecoration:g.done?"line-through":"none",opacity:g.done?.6:1 }}>{g.text}</div>
                    <div style={{ display:"flex",gap:8,marginTop:5,flexWrap:"wrap" }}>
                      {subj?<span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:subj.color+"22",color:T.ink }}>{subj.icon} {subj.name}</span>
                           :<span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:T.coralSoft,color:T.ink }}>🎯 Personal</span>}
                      <span style={{ fontSize:11,color:T.slate }}>📅 {g.due}</span>
                    </div>
                  </div>
                  <button onClick={()=>{setEditing(g);setModal("goal");}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.slate }}>✏️</button>
                </div>
              );
            })}
          </div>
          <button onClick={()=>{setEditing(null);setModal("goal");}} style={{ ...btn(T.navy),marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <span style={{ fontSize:18 }}>+</span> Nuevo objetivo
          </button>
        </>}

        {/* ══ RACHAS ══ */}
        {tab==="rachas" && <>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {habits.map(h=>{
              const s = streak(h.checks);
              const wk = weekChecks(h.checks);
              const checkedToday = !!h.checks?.[todayKey()];
              return (
                <div key={h.id} style={{ background:T.white,borderRadius:18,padding:"18px 18px 14px",boxShadow:"0 2px 14px rgba(27,43,75,.06)" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14 }}>
                    <div style={{ width:46,height:46,borderRadius:14,background:h.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{h.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:15,color:T.ink }}>{h.name}</div>
                      <div style={{ fontSize:12,color:T.slate }}>Meta: {h.goal} días/semana</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontWeight:800,fontSize:28,color:s>0?T.amber:T.slate,lineHeight:1 }}>{s}</div>
                      <div style={{ fontSize:10,color:T.slate }}>🔥 racha</div>
                    </div>
                    <button onClick={()=>{setEditing(h);setModal("habit");}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.slate }}>✏️</button>
                  </div>

                  {/* Week dots */}
                  <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                    {["L","M","M","J","V","S","D"].map((d,i)=>(
                      <div key={i} style={{ flex:1,textAlign:"center" }}>
                        <div style={{ fontSize:10,color:T.slate,marginBottom:4 }}>{d}</div>
                        <div style={{ width:"100%",aspectRatio:"1",borderRadius:8,background:wk[i]?h.color:T.parchment,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.white }}>
                          {wk[i]?"✓":""}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Check today */}
                  <button onClick={()=>toggleHabit(h.id)} style={{
                    width:"100%",padding:"11px",borderRadius:12,border:`2px solid ${checkedToday?h.color:T.parchment}`,
                    background:checkedToday?h.soft:"transparent",
                    fontWeight:700,fontSize:14,color:checkedToday?T.ink:T.slate,cursor:"pointer",transition:"all .2s",
                  }}>
                    {checkedToday?"✅ Hecho hoy":"Marcar como hecho hoy"}
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={()=>{setEditing(null);setModal("habit");}} style={{ ...btn(T.navy),marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <span style={{ fontSize:18 }}>+</span> Nuevo hábito / racha
          </button>
        </>}
      </main>

      {/* ══ MODALS ══ */}

      {/* Subject modal */}
      <SubjectModal
        open={modal==="subject"} data={editing}
        onSave={saveSubject} onDelete={deleteSubject} onClose={()=>{setModal(null);setEditing(null);}}
      />

      {/* Goal modal */}
      <GoalModal
        open={modal==="goal"} data={editing} subjects={subjects}
        onSave={saveGoal} onDelete={deleteGoal} onClose={()=>{setModal(null);setEditing(null);}}
      />

      {/* Event modal */}
      <EventModal
        open={modal==="event"} data={editing} subjects={subjects} day={activeDay} dayLabel={DAYS_SHORT[activeDay]}
        onSave={saveEvent} onDelete={deleteEvent} onClose={()=>{setModal(null);setEditing(null);}}
      />

      {/* Habit modal */}
      <HabitModal
        open={modal==="habit"} data={editing}
        onSave={saveHabit} onDelete={deleteHabit} onClose={()=>{setModal(null);setEditing(null);}}
      />
    </div>
  );
}

// ════════════ SUBJECT MODAL ════════════
function SubjectModal({ open, data, onSave, onDelete, onClose }) {
  const blank = { name:"", icon:"📐", color:T.amber, soft:T.amberSoft, teacher:"", topics:[""], progress:0 };
  const [f, setF] = useState(blank);
  useEffect(()=>{ setF(data ? {...data, topics:[...(data.topics||[]),""].filter((_,i,a)=>i<a.length)||[""]} : blank); },[open,data]);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const setTopic = (i,v) => { const t=[...f.topics]; t[i]=v; setF(p=>({...p,topics:t})); };
  const addTopic = () => setF(p=>({...p,topics:[...p.topics,""]}));
  const removeTopic = i => setF(p=>({...p,topics:p.topics.filter((_,j)=>j!==i)}));
  const submit = () => {
    if(!f.name.trim()) return;
    onSave({ ...f, topics: f.topics.filter(t=>t.trim()) });
  };
  return (
    <Modal open={open} onClose={onClose} title={data?"Editar materia":"Nueva materia"}>
      <Field label="Nombre"><input style={inp} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Matemáticas" /></Field>
      <Field label="Profesor / descripción"><input style={inp} value={f.teacher} onChange={e=>set("teacher",e.target.value)} placeholder="Prof. García" /></Field>
      <Field label="Ícono">
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {ICONS_SUBJECT.map(ic=><button key={ic} onClick={()=>set("icon",ic)} style={{ fontSize:22,background:f.icon===ic?T.parchment:"none",border:`2px solid ${f.icon===ic?T.amber:T.parchment}`,borderRadius:10,padding:6,cursor:"pointer" }}>{ic}</button>)}
        </div>
      </Field>
      <Field label="Color">
        <div style={{ display:"flex",gap:8 }}>
          {PALETTE.map(p=><button key={p.color} onClick={()=>set("color",p.color)||set("soft",p.soft)} style={{ width:32,height:32,borderRadius:10,background:p.color,border:`3px solid ${f.color===p.color?T.ink:p.color}`,cursor:"pointer" }} />)}
        </div>
      </Field>
      <Field label="Progreso del temario">
        <input type="range" min={0} max={100} value={f.progress} onChange={e=>set("progress",Number(e.target.value))} style={{ width:"100%",accentColor:f.color }} />
        <div style={{ fontSize:12,color:T.slate,marginTop:4 }}>{f.progress}% completado</div>
      </Field>
      <Field label="Temas del temario">
        {f.topics.map((t,i)=>(
          <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
            <input style={{...inp,flex:1}} value={t} onChange={e=>setTopic(i,e.target.value)} placeholder={`Tema ${i+1}`} />
            <button onClick={()=>removeTopic(i)} style={{ background:T.coralSoft,border:"none",borderRadius:8,width:36,cursor:"pointer",color:T.coral,fontWeight:700 }}>✕</button>
          </div>
        ))}
        <button onClick={addTopic} style={{ fontSize:13,color:T.navy,fontWeight:600,background:"none",border:`1.5px dashed ${T.parchment}`,borderRadius:10,padding:"8px 0",width:"100%",cursor:"pointer",marginTop:2 }}>+ Agregar tema</button>
      </Field>
      <button onClick={submit} style={btn(T.navy)}>Guardar materia</button>
      {data && <button onClick={()=>onDelete(data.id)} style={btn(T.coral)}>Eliminar materia</button>}
    </Modal>
  );
}

// ════════════ GOAL MODAL ════════════
function GoalModal({ open, data, subjects, onSave, onDelete, onClose }) {
  const blank = { text:"", subjectId:null, due:"" };
  const [f, setF] = useState(blank);
  useEffect(()=>{ setF(data ? {...data} : blank); },[open,data]);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const submit = () => { if(!f.text.trim()) return; onSave(f); };
  return (
    <Modal open={open} onClose={onClose} title={data?"Editar objetivo":"Nuevo objetivo"}>
      <Field label="¿Qué querés lograr?"><input style={inp} value={f.text} onChange={e=>set("text",e.target.value)} placeholder="Entregar el proyecto de Ciencias" /></Field>
      <Field label="Fecha límite"><input style={inp} type="text" value={f.due} onChange={e=>set("due",e.target.value)} placeholder="Jun 20 · o 'Diario'" /></Field>
      <Field label="Materia (opcional)">
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          <button onClick={()=>set("subjectId",null)} style={{ padding:"6px 12px",borderRadius:10,border:`2px solid ${!f.subjectId?T.amber:T.parchment}`,background:!f.subjectId?T.amberSoft:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>🎯 Personal</button>
          {subjects.map(s=>(
            <button key={s.id} onClick={()=>set("subjectId",s.id)} style={{ padding:"6px 12px",borderRadius:10,border:`2px solid ${f.subjectId===s.id?s.color:T.parchment}`,background:f.subjectId===s.id?s.soft:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>{s.icon} {s.name}</button>
          ))}
        </div>
      </Field>
      <button onClick={submit} style={btn(T.navy)}>Guardar objetivo</button>
      {data && <button onClick={()=>onDelete(data.id)} style={btn(T.coral)}>Eliminar objetivo</button>}
    </Modal>
  );
}

// ════════════ EVENT MODAL ════════════
function EventModal({ open, data, subjects, day, dayLabel, onSave, onDelete, onClose }) {
  const blank = { time:"08:00", duration:60, type:"class", subjectId:null, label:"", room:"" };
  const [f, setF] = useState(blank);
  useEffect(()=>{ setF(data ? {...data} : blank); },[open,data]);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const submit = () => {
    const d = data?._day ?? day;
    onSave(f, d);
  };
  return (
    <Modal open={open} onClose={onClose} title={data?"Editar bloque":`Agregar al ${dayLabel}`}>
      <Field label="Tipo">
        <div style={{ display:"flex",gap:8 }}>
          {[["class","📚 Clase"],["free","🎮 Libre"],["other","📌 Otro"]].map(([k,l])=>(
            <button key={k} onClick={()=>set("type",k)} style={{ flex:1,padding:"8px 4px",borderRadius:10,border:`2px solid ${f.type===k?T.amber:T.parchment}`,background:f.type===k?T.amberSoft:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}>{l}</button>
          ))}
        </div>
      </Field>
      {f.type==="class" && (
        <Field label="Materia">
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {subjects.map(s=>(
              <button key={s.id} onClick={()=>set("subjectId",s.id)} style={{ padding:"6px 12px",borderRadius:10,border:`2px solid ${f.subjectId===s.id?s.color:T.parchment}`,background:f.subjectId===s.id?s.soft:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>{s.icon} {s.name}</button>
            ))}
          </div>
        </Field>
      )}
      {f.type!=="class" && (
        <Field label="Etiqueta"><input style={inp} value={f.label} onChange={e=>set("label",e.target.value)} placeholder="Tiempo libre 🎮" /></Field>
      )}
      <div style={{ display:"flex",gap:12 }}>
        <Field label="Hora inicio" ><input style={{...inp}} type="time" value={f.time}     onChange={e=>set("time",e.target.value)} /></Field>
        <Field label="Duración (min)"><input style={{...inp}} type="number" min={5} step={5} value={f.duration} onChange={e=>set("duration",Number(e.target.value))} /></Field>
      </div>
      <Field label="Aula / lugar (opcional)"><input style={inp} value={f.room} onChange={e=>set("room",e.target.value)} placeholder="Aula 3A" /></Field>
      <button onClick={submit} style={btn(T.navy)}>Guardar bloque</button>
      {data?.id && <button onClick={()=>onDelete(data.id, data._day??day)} style={btn(T.coral)}>Eliminar bloque</button>}
    </Modal>
  );
}

// ════════════ HABIT MODAL ════════════
function HabitModal({ open, data, onSave, onDelete, onClose }) {
  const blank = { name:"", icon:"📱", color:T.mint, soft:T.mintSoft, goal:5 };
  const [f, setF] = useState(blank);
  useEffect(()=>{ setF(data ? {...data} : blank); },[open,data]);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const submit = () => { if(!f.name.trim()) return; onSave(f); };
  return (
    <Modal open={open} onClose={onClose} title={data?"Editar hábito":"Nuevo hábito / racha"}>
      <Field label="Nombre"><input style={inp} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Duolingo, Leer, Ejercicio..." /></Field>
      <Field label="Ícono">
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {ICONS_HABIT.map(ic=><button key={ic} onClick={()=>set("icon",ic)} style={{ fontSize:22,background:f.icon===ic?T.parchment:"none",border:`2px solid ${f.icon===ic?T.amber:T.parchment}`,borderRadius:10,padding:6,cursor:"pointer" }}>{ic}</button>)}
        </div>
      </Field>
      <Field label="Color">
        <div style={{ display:"flex",gap:8 }}>
          {PALETTE.map(p=><button key={p.color} onClick={()=>{set("color",p.color);set("soft",p.soft);}} style={{ width:32,height:32,borderRadius:10,background:p.color,border:`3px solid ${f.color===p.color?T.ink:p.color}`,cursor:"pointer" }} />)}
        </div>
      </Field>
      <Field label="Meta de días por semana">
        <div style={{ display:"flex",gap:8 }}>
          {[1,2,3,4,5,6,7].map(n=>(
            <button key={n} onClick={()=>set("goal",n)} style={{ flex:1,padding:"8px 0",borderRadius:10,border:`2px solid ${f.goal===n?T.amber:T.parchment}`,background:f.goal===n?T.amberSoft:"none",cursor:"pointer",fontWeight:700,fontSize:14 }}>{n}</button>
          ))}
        </div>
      </Field>
      <button onClick={submit} style={btn(T.navy)}>Guardar hábito</button>
      {data && <button onClick={()=>onDelete(data.id)} style={btn(T.coral)}>Eliminar hábito</button>}
    </Modal>
  );
}
