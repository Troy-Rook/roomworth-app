import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────
const Logo = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M12 52 L50 14 L88 52" stroke="#1B3A6B" strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M20 46 L20 84 L52 84 L52 46" stroke="#1B3A6B" strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M36 84 L36 64 L52 64 L52 84" stroke="#1B3A6B" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="68" cy="70" r="22" fill="#4AABBF"/>
    <circle cx="68" cy="70" r="22" stroke="#1B3A6B" strokeWidth="4" fill="none"/>
    <text x="68" y="77" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Georgia, serif">£</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BROKER_CODES = {
  "HOWDEN26":    { broker: "Howden Insurance",   color: "#1B3A6B", accent: "#4AABBF" },
  "STANHOPE26":  { broker: "Stanhope Cooper",    color: "#0f4c35", accent: "#22c55e" },
  "ROOMWORTH26": { broker: "Room Worth Direct",  color: "#4AABBF", accent: "#1B3A6B" },
  "PREMIER26":   { broker: "Premier Insurance",  color: "#7c3aed", accent: "#a78bfa" },
};

const PROPERTY_TYPES = ["Detached House","Semi-Detached","Terraced House","Flat / Apartment","Bungalow","Cottage","Townhouse","Penthouse","Other"];

// Specialist item detection - from Airtable formula
const SPECIALIST_KEYWORDS = ["rolex","omega","patek","patek philippe","audemars","audemars piguet","breitling","cartier","tag heuer","tudor","hublot","iwc","jaeger","luxury watch","mechanical watch","vintage watch","jewellery","jewelry","diamond","bracelet","necklace","ring","earrings","pendant","brooch","painting","artwork","wall art","fine art","canvas","sculpture","statue","antique","antiques","collectible","collectibles","collection","china","porcelain","silverware","coin","coins","stamp","stamps","vase","bronze","fur","persian rug","oriental rug","tapestry"];

const isSpecialistItem = (name) => {
  const lower = (name || "").toLowerCase();
  return SPECIALIST_KEYWORDS.some(kw => {
    const re = new RegExp("(^|\\s|-|/)" + kw.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(\\s|-|/|$)");
    return re.test(lower);
  });
};

// Missing key items per room - from Airtable formula
const MISSING_ITEMS_MAP = {
  "Principal Bedroom": "Bed",
  "Bedroom 2": "Bed",
  "Bedroom 3": "Bed",
  "Bedroom": "Bed",
  "Kitchen": "Kettle",
  "Kitchen Diner": "Kettle",
  "Living Room": "Sofa",
  "Lounge": "Sofa",
  "Dining Room": "Dining Table",
};

const getMissingKeyItem = (roomName, items) => {
  const expected = MISSING_ITEMS_MAP[roomName];
  if (!expected) return null;
  const hasItem = items.some(i => (i.name || "").toLowerCase().includes(expected.toLowerCase()));
  return hasItem ? null : expected;
};

const DEFAULT_ROOMS = [
  { type:"living_room",       name:"Living Room",       color:"#4AABBF" },
  { type:"kitchen",           name:"Kitchen",           color:"#0891b2" },
  { type:"principal_bedroom", name:"Principal Bedroom", color:"#1B3A6B" },
  { type:"study",             name:"Study",             color:"#2563ab" },
  { type:"bedroom_2",         name:"Bedroom 2",         color:"#3b82f6" },
  { type:"bedroom_3",         name:"Bedroom 3",         color:"#60a5fa" },
  { type:"garage",            name:"Garage",            color:"#475569" },
  { type:"bathroom",          name:"Bathroom",          color:"#0e7490" },
  { type:"utility",           name:"Utility Room",      color:"#0369a1" },
  { type:"garden",            name:"Garden",            color:"#059669" },
  { type:"hallway",           name:"Hallway",           color:"#7c3aed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => "£" + Number(n).toLocaleString();
const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const confColor = (s) => s >= 75 ? "#059669" : s >= 45 ? "#f59e0b" : "#ef4444";
const confLabel = (s) => s >= 75 ? "High" : s >= 45 ? "Medium" : "Low";
const progressColor = (pct) => pct >= 100 ? "#059669" : pct >= 60 ? "#4AABBF" : pct >= 30 ? "#f59e0b" : "#ef4444";

// ─────────────────────────────────────────────────────────────────────────────
// ROOM ICONS
// ─────────────────────────────────────────────────────────────────────────────
const RoomIcon = ({ type, size = 28 }) => {
  const s = { stroke:"currentColor", strokeWidth:"2.5", fill:"none", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    living_room: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="20" rx="4" {...s}/><path d="M4 28 Q4 20 12 20" {...s}/><path d="M44 28 Q44 20 36 20" {...s}/><rect x="14" y="20" width="20" height="8" rx="2" {...s}/><path d="M16 40 L16 44 M32 40 L32 44" {...s}/></svg>,
    kitchen: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="6" y="28" width="36" height="14" rx="3" {...s}/><circle cx="16" cy="14" r="5" {...s}/><circle cx="32" cy="14" r="5" {...s}/><path d="M6 32 L42 32" {...s}/></svg>,
    principal_bedroom: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="4" y="28" width="40" height="14" rx="3" {...s}/><rect x="8" y="18" width="32" height="14" rx="3" {...s}/><path d="M24 18 L24 32" {...s}/><path d="M8 18 L8 10 M40 18 L40 10" {...s}/></svg>,
    study: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="6" y="30" width="36" height="12" rx="3" {...s}/><path d="M14 30 L14 10 M34 30 L34 10" {...s}/><path d="M10 10 L38 10" {...s}/><rect x="16" y="14" width="16" height="12" rx="2" {...s}/></svg>,
    bedroom_2: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="4" y="28" width="40" height="14" rx="3" {...s}/><rect x="8" y="18" width="32" height="14" rx="3" {...s}/><rect x="12" y="20" width="24" height="9" rx="2" {...s}/><path d="M8 18 L8 10 M40 18 L40 10" {...s}/></svg>,
    bedroom_3: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="4" y="28" width="40" height="14" rx="3" {...s}/><rect x="8" y="18" width="32" height="14" rx="3" {...s}/><rect x="12" y="20" width="24" height="9" rx="2" {...s}/><path d="M8 18 L8 10 M40 18 L40 10" {...s}/></svg>,
    garage: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M6 22 L24 8 L42 22 L42 42 L6 42 Z" {...s}/><rect x="10" y="28" width="28" height="14" rx="2" {...s}/><path d="M10 32 L38 32 M10 36 L38 36" {...s}/></svg>,
    bathroom: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="6" y="22" width="36" height="18" rx="8" {...s}/><path d="M14 22 L14 12 Q14 8 18 8" {...s}/><circle cx="20" cy="10" r="2.5" {...s}/><path d="M6 32 L42 32" {...s}/></svg>,
    utility: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="32" rx="4" {...s}/><circle cx="24" cy="26" r="10" {...s}/><circle cx="24" cy="26" r="4" {...s}/><path d="M14 15 L18 15" {...s}/></svg>,
    garden: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M24 38 L24 20" {...s}/><path d="M24 20 Q24 10 14 8 Q14 18 24 20" {...s}/><path d="M24 26 Q24 16 34 14 Q34 24 24 26" {...s}/><path d="M6 38 L42 38" {...s}/></svg>,
    hallway: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M8 42 L8 6 L40 6 L40 42" {...s}/><path d="M4 42 L44 42" {...s}/><rect x="19" y="26" width="10" height="16" rx="2" {...s}/></svg>,
    custom: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" rx="6" {...s}/><path d="M24 16 L24 32 M16 24 L32 24" {...s}/></svg>,
  };
  return icons[type] || icons.custom;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background:"white", borderRadius:20, padding:"20px", marginBottom:14, border:"1px solid #e8eef5", boxShadow:"0 2px 12px rgba(27,58,107,0.06)", ...style }}>{children}</div>
);

const PrimaryBtn = ({ onClick, disabled, loading, children, style={} }) => (
  <button onClick={onClick} disabled={disabled || loading} style={{
    width:"100%", border:"none", borderRadius:14, padding:"16px",
    background: disabled||loading ? "#e2e8f0" : "linear-gradient(135deg,#1B3A6B,#2563ab)",
    color: disabled||loading ? "#94a3b8" : "white",
    fontSize:15, fontWeight:800, cursor: disabled||loading ? "not-allowed":"pointer",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    boxShadow: !disabled&&!loading ? "0 6px 20px rgba(27,58,107,0.25)" : "none",
    transition:"all 0.2s", ...style
  }}>
    {loading ? <><span style={{display:"inline-block",animation:"spin 0.8s linear infinite"}}>⟳</span> Please wait...</> : children}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type="text", multiline=false }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={2}
          style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 15px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"none" }} />
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 15px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
    }
  </div>
);

const AppHeader = ({ title, subtitle, onBack, right }) => (
  <div style={{ background:"white", borderBottom:"1px solid #e8eef5", padding:"13px 18px", display:"flex", alignItems:"center", gap:11, position:"sticky", top:0, zIndex:20, boxShadow:"0 2px 10px rgba(27,58,107,0.06)" }}>
    {onBack && <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", color:"#1B3A6B", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>←</button>}
    {!onBack && <Logo size={38} />}
    <div style={{ flex:1 }}>
      <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:16, letterSpacing:"-0.3px" }}>{title}</div>
      {subtitle && <div style={{ color:"#4AABBF", fontSize:11, fontWeight:600 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

const NavIcon = ({ id, active }) => {
  const c = active ? "#1B3A6B" : "#94a3b8";
  const icons = {
    properties: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3L21 12"/>
        <path d="M5 10V20C5 20.6 5.4 21 6 21H9V16H15V21H18C18.6 21 19 20.6 19 20V10"/>
      </svg>
    ),
    scanner: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21L16.65 16.65"/>
        <path d="M11 8V14M8 11H14"/>
      </svg>
    ),
    reports: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <path d="M8 7H16M8 11H16M8 15H12"/>
      </svg>
    ),
    account: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"/>
      </svg>
    ),
  };
  return icons[id] || null;
};

const BottomNav = ({ active, onNavigate }) => {
  const tabs = [
    { id:"properties", label:"Properties" },
    { id:"scanner",    label:"Scan Item"  },
    { id:"reports",    label:"Reports"    },
    { id:"account",    label:"Account"    },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #e8eef5", padding:"10px 0 22px", display:"flex", justifyContent:"space-around", boxShadow:"0 -4px 20px rgba(27,58,107,0.08)", zIndex:15 }}>
      {tabs.map(({ id, label }) => (
        <button key={id} onClick={() => onNavigate(id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, color: active===id ? "#1B3A6B" : "#94a3b8", padding:"0 14px", transition:"all 0.15s" }}>
          <NavIcon id={id} active={active===id} />
          <span style={{ fontSize:10, fontWeight: active===id ? 700:500, letterSpacing:"0.2px" }}>{label}</span>
          {active===id && <div style={{ width:20, height:2.5, borderRadius:99, background:"linear-gradient(90deg,#4AABBF,#1B3A6B)", marginTop:-2 }} />}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICON SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const SvgIcon = ({ name, size=20, color="currentColor" }) => {
  const s = { stroke:color, strokeWidth:"1.8", fill:"none", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    home:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M3 12L12 3L21 12"/><path d="M5 10V20C5 20.6 5.4 21 6 21H9V16H15V21H18C18.6 21 19 20.6 19 20V10" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    camera:   <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="14" r="3" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 7L9.5 4H14.5L16 7" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    scan:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" fill="none"/><path d="M21 21L16.65 16.65" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M8 11H14M11 8V14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    report:   <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 7H16M8 11H16M8 15H12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    user:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill="none"/><path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    plus:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M12 5V19M5 12H19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M3 6H21M8 6V4H16V6M19 6L18 20H6L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    edit:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M11 4H4C3.4 4 3 4.4 3 5V20C3 20.6 3.4 21 4 21H19C19.6 21 20 20.6 20 20V13" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="1.8" fill="none"/></svg>,
    arrow_r:  <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M5 12H19M13 6L19 12L13 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    arrow_l:  <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M19 12H5M11 18L5 12L11 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    star:     <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...s}><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color}/></svg>,
    alert:    <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M10.29 3.86L1.82 18C1.64 18.3 1.64 18.7 1.82 19C2 19.3 2.32 19.5 2.68 19.5H21.32C21.68 19.5 22 19.3 22.18 19C22.36 18.7 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.22 3.37 12.87 3.37C12.52 3.37 12.21 3.56 12 3.86H10.29Z" stroke={color} strokeWidth="1.8" fill="none"/><path d="M12 9V13M12 17H12.01" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    list:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    building: <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M3 9H21M9 21V9M15 21V9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    key:      <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="8" cy="15" r="4" stroke={color} strokeWidth="1.8" fill="none"/><path d="M11.5 11.5L20 3M18 5L20 7M15 8L17 10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    broker:   <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke={color} strokeWidth="1.8" fill="none"/><path d="M12 12V16M10 14H14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    pdf:      <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke={color} strokeWidth="1.8" fill="none"/><path d="M14 2V7H19" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 13H16M8 17H13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    rooms:    <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/><rect x="13" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/><rect x="3" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/><rect x="13" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M7 10L12 15L17 10M12 15V3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/><path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    privacy:  <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M7 11V7C7 4.8 9.2 3 12 3C14.8 3 17 4.8 17 7V11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill={color}/></svg>,
    help:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill="none"/><path d="M9.09 9C9.32 8.33 9.78 7.76 10.4 7.38C11.01 7 11.74 6.85 12.46 6.97C13.18 7.08 13.84 7.44 14.33 7.99C14.82 8.53 15.09 9.23 15.09 9.95C15.09 12 12 13 12 13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill={color} stroke={color}/></svg>,
    terms:    <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 7H16M8 11H16M8 15H12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    bell:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke={color} strokeWidth="1.8" fill="none"/><path d="M13.73 21C13.55 21.3 13.28 21.55 12.95 21.72C12.63 21.88 12.27 22 12 22C11.73 22 11.37 21.88 11.05 21.72C10.72 21.55 10.45 21.3 10.27 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    chevron_r:<svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M9 18L15 12L9 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    signout:  <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M9 21H5C4.4 21 4 20.6 4 20V4C4 3.4 4.4 3 5 3H9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M16 17L21 12L16 7M21 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    view:     <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/></svg>,
    inventory:<svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 21H16M12 17V21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M6 8H10M6 11H14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  };
  return icons[name] || <svg width={size} height={size} viewBox="0 0 24 24"/>;
};

// ── Scan Override Component ──────────────────────────────────────────────────
function ScanOverride({ result, quantity, onOverride }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const isOverridden = !!result._overridden;
  const fmt = (n) => "£" + Number(n).toLocaleString();

  if (!editing && !isOverridden) return (
    <div style={{ textAlign:"center", marginBottom:10 }}>
      <button onClick={()=>{ setVal(String(result.mid_value)); setEditing(true); }}
        style={{ background:"none", border:"1px solid #cbd5e1", borderRadius:10, padding:"6px 14px", color:"#64748b", fontSize:12, fontWeight:600, cursor:"pointer" }}>
        Override estimated value
      </button>
    </div>
  );

  if (editing) return (
    <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:14, padding:"14px", marginBottom:10 }}>
      <div style={{ color:"#0369a1", fontSize:12, fontWeight:700, marginBottom:8 }}>Enter your override value</div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ color:"#1B3A6B", fontWeight:700, fontSize:16 }}>£</span>
        <input type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder={String(result.mid_value)}
          style={{ flex:1, background:"white", border:"1.5px solid #4AABBF", borderRadius:10, padding:"10px 12px", fontSize:16, fontWeight:800, color:"#1B3A6B", outline:"none" }} autoFocus />
        <button onClick={()=>{ const n=Number(val.replace(/[^0-9.]/g,"")); if(n>0){onOverride(n);} setEditing(false); }}
          style={{ background:"#1B3A6B", border:"none", borderRadius:10, padding:"10px 16px", color:"white", fontWeight:700, cursor:"pointer" }}>Save</button>
        <button onClick={()=>setEditing(false)}
          style={{ background:"#f1f5f9", border:"none", borderRadius:10, padding:"10px 12px", color:"#64748b", fontSize:12, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ color:"#64748b", fontSize:11, marginTop:6 }}>AI estimated: {fmt(result.mid_value)} · Both values will be stored</div>
    </div>
  );

  return (
    <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:14, padding:"12px 14px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <div style={{ color:"#0369a1", fontSize:12, fontWeight:700 }}>Value overridden ✓</div>
        <div style={{ color:"#94a3b8", fontSize:11 }}>AI estimate: {fmt(result._ai_value||result.mid_value)}</div>
      </div>
      <button onClick={()=>{ setVal(String(result.mid_value)); setEditing(true); }}
        style={{ background:"#e0f2fe", border:"none", borderRadius:8, padding:"5px 10px", color:"#0369a1", fontSize:11, fontWeight:700, cursor:"pointer" }}>Edit</button>
    </div>
  );
}

// ── Room Selector Add (for bottom-nav scanner with no target room) ─────────
function RoomSelectorAdd({ properties, onAdd, onScanAnother }) {
  const allRooms = properties.flatMap(p => p.rooms.map(r => ({...r, propertyName: p.name, propertyId: p.id})));
  const [selectedRoom, setSelectedRoom] = useState(allRooms[0]?.id || "");
  const selRoom = allRooms.find(r => r.id === selectedRoom);

  if (allRooms.length === 0) return (
    <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:13, padding:"14px", textAlign:"center", color:"#dc2626", fontSize:13 }}>
      Add a property first before scanning items
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      <div style={{ background:"#f0f5ff", border:"1.5px solid #dbeafe", borderRadius:14, padding:"14px" }}>
        <div style={{ color:"#1B3A6B", fontSize:12, fontWeight:700, marginBottom:9 }}>Select room to add this item to:</div>
        <select value={selectedRoom} onChange={e=>setSelectedRoom(e.target.value)}
          style={{ width:"100%", background:"white", border:"1.5px solid #e2e8f0", borderRadius:11, padding:"11px 13px", fontSize:14, color:"#1e293b", outline:"none", fontFamily:"inherit", appearance:"none" }}>
          {allRooms.map(r => <option key={r.id} value={r.id}>{r.propertyName} — {r.name}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:9 }}>
        <button onClick={onScanAnother} style={{ flex:1, background:"white", border:"1.5px solid #e2e8f0", borderRadius:13, padding:"13px", color:"#1B3A6B", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <SvgIcon name="camera" size={14} color="#1B3A6B" /> Scan Another
        </button>
        <button onClick={()=>selRoom && onAdd(selRoom.id, selRoom.name)}
          disabled={!selRoom}
          style={{ flex:1, background:selRoom?"linear-gradient(135deg,#4AABBF,#0891b2)":"#e2e8f0", border:"none", borderRadius:13, padding:"13px", color:selRoom?"white":"#94a3b8", fontSize:13, fontWeight:700, cursor:selRoom?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:selRoom?"0 4px 14px rgba(74,171,191,0.35)":"none" }}>
          <SvgIcon name="home" size={14} color={selRoom?"white":"#94a3b8"} /> Add to Room
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — AUTH
// ─────────────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode]             = useState("signup");
  const [step, setStep]             = useState(1);
  const [brokerCode, setBrokerCode] = useState("");
  const [brokerInfo, setBrokerInfo] = useState(null);
  const [codeError, setCodeError]   = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);

  const switchMode = (m) => {
    setMode(m); setStep(1); setEmail(""); setPassword("");
    setFirstName(""); setLastName(""); setBrokerCode("");
    setBrokerInfo(null); setCodeError("");
  };

  const verifyCode = () => {
    const found = BROKER_CODES[brokerCode.trim().toUpperCase()];
    if (found) { setBrokerInfo({ ...found, code: brokerCode.toUpperCase() }); setCodeError(""); setTimeout(()=>setStep(2), 500); }
    else { setCodeError("Invalid broker code. Please check with your broker and try again."); setBrokerInfo(null); }
  };

  const handleSignUp = () => {
    if (!firstName.trim()||!lastName.trim()||!email.trim()||password.length<8) return;
    setLoading(true);
    setTimeout(() => {
      onLogin({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), broker: brokerInfo });
      setLoading(false);
    }, 1200);
  };

  const handleLogin = () => {
    if (!email.trim()||!password.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onLogin({ firstName: "My", lastName: "Account", email: email.trim(), broker: BROKER_CODES["ROOMWORTH26"] });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:"white", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#1B3A6B,#1e4d8c,#4AABBF)", padding:"52px 24px 72px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(74,171,191,0.15)" }} />
        <div style={{ position:"absolute", bottom:-20, left:-20, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <Logo size={60} />
          <div style={{ marginTop:14, color:"white", fontWeight:900, fontSize:26, letterSpacing:"-0.4px" }}>ROOM WORTH</div>
          <div style={{ color:"rgba(74,171,191,0.9)", fontSize:13, fontWeight:600, marginTop:3 }}>Contents Estimator</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, marginTop:10, lineHeight:1.5 }}>Estimate what your home contents are worth — powered by A.I.</div>
        </div>
      </div>

      <div style={{ flex:1, background:"white", borderRadius:"26px 26px 0 0", marginTop:-26, padding:"28px 22px 48px", boxShadow:"0 -4px 24px rgba(27,58,107,0.1)" }}>
        {mode === "login" ? (
          <>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:22, marginBottom:6 }}>Welcome Back</div>
            <div style={{ color:"#64748b", fontSize:13, marginBottom:22 }}>Sign in to your account</div>
            <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="james@email.com" />
            <div style={{ marginBottom:20 }}>
              <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 46px 13px 15px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#94a3b8" }}>{showPass?"🙈":"👁"}</button>
              </div>
            </div>
            <PrimaryBtn onClick={handleLogin} loading={loading} disabled={!email||!password}>Sign In →</PrimaryBtn>
            <div style={{ textAlign:"center", marginTop:20 }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>No account? </span>
              <button onClick={()=>switchMode("signup")} style={{ background:"none", border:"none", color:"#4AABBF", fontWeight:700, fontSize:13, cursor:"pointer" }}>Sign Up</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:22 }}>
              {[1,2].map(s=>(
                <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:step>=s?"linear-gradient(135deg,#1B3A6B,#4AABBF)":"#f1f5f9", color:step>=s?"white":"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{step>s?"✓":s}</div>
                  <span style={{ color:step===s?"#1B3A6B":"#94a3b8", fontSize:11, fontWeight:step===s?700:500 }}>{s===1?"Broker Code":"Your Details"}</span>
                  {s<2 && <div style={{ width:20, height:2, background:step>s?"#4AABBF":"#e2e8f0", borderRadius:1 }} />}
                </div>
              ))}
            </div>

            {step===1 ? (
              <>
                <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:20, marginBottom:6 }}>Enter Broker Code</div>
                <div style={{ color:"#64748b", fontSize:13, marginBottom:20 }}>Your broker will have given you an access code.</div>
                <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>Broker Code</label>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input value={brokerCode} onChange={e=>{setBrokerCode(e.target.value.toUpperCase());setBrokerInfo(null);setCodeError("");}}
                    onKeyDown={e=>e.key==="Enter"&&verifyCode()}
                    placeholder="e.g. ROOMWORTH26"
                    style={{ flex:1, background:"#f8fafc", border:`1.5px solid ${brokerInfo?"#6ee7b7":codeError?"#fca5a5":"#e2e8f0"}`, borderRadius:12, padding:"13px 15px", color:"#1e293b", fontSize:15, outline:"none", fontFamily:"monospace", fontWeight:700, letterSpacing:"2px" }} />
                  <button onClick={verifyCode} style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:12, padding:"0 18px", color:"white", fontWeight:700, fontSize:13, cursor:"pointer" }}>Verify</button>
                </div>
                {codeError && <div style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:12, padding:"11px 14px", color:"#dc2626", fontSize:12, marginBottom:12 }}>⚠️ {codeError}</div>}
                {brokerInfo && (
                  <div style={{ background:`${brokerInfo.color}10`, border:`1.5px solid ${brokerInfo.color}30`, borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10, animation:"popIn 0.3s ease" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${brokerInfo.color},${brokerInfo.accent})`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14 }}>✓</div>
                    <div><div style={{ color:brokerInfo.color, fontWeight:800, fontSize:13 }}>Code Verified!</div><div style={{ color:"#64748b", fontSize:11 }}>{brokerInfo.broker}</div></div>
                  </div>
                )}
                <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ color:"#0369a1", fontSize:12, fontWeight:600, marginBottom:3 }}>💡 No code?</div>
                  <div style={{ color:"#0369a1", fontSize:11, lineHeight:1.5 }}>Use <strong>ROOMWORTH26</strong> to sign up as a direct Room Worth client.</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:20, marginBottom:16 }}>Create Account</div>
                {brokerInfo && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f0f5ff", border:"1.5px solid #dbeafe", borderRadius:12, padding:"9px 13px", marginBottom:16 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:brokerInfo.color }} />
                    <span style={{ color:"#1B3A6B", fontSize:12, fontWeight:600 }}>{brokerInfo.broker}</span>
                    <button onClick={()=>{setStep(1);setBrokerInfo(null);setBrokerCode("");}} style={{ marginLeft:"auto", background:"none", border:"none", color:"#94a3b8", fontSize:11, cursor:"pointer", fontWeight:600 }}>Change</button>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div><label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>First Name</label>
                    <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="James" style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 13px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box" }} /></div>
                  <div><label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>Last Name</label>
                    <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Davies" style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 13px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box" }} /></div>
                </div>
                <div style={{ marginTop:10 }}><InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="james@email.com" /></div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 }}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters"
                      style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 46px 13px 15px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                    <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#94a3b8" }}>{showPass?"🙈":"👁"}</button>
                  </div>
                </div>
                <PrimaryBtn onClick={handleSignUp} loading={loading} disabled={!firstName||!lastName||!email||password.length<8}>Create Account 🚀</PrimaryBtn>
              </>
            )}
            <div style={{ textAlign:"center", marginTop:20 }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>Already have an account? </span>
              <button onClick={()=>switchMode("login")} style={{ background:"none", border:"none", color:"#4AABBF", fontWeight:700, fontSize:13, cursor:"pointer" }}>Sign In</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────
function PropertiesScreen({ user, properties, setProperties, onViewProperty, onNavigate }) {
  const [showAdd, setShowAdd]       = useState(false);
  const [editProp, setEditProp]     = useState(null);
  const [deleteProp, setDeleteProp] = useState(null);
  const [menuProp, setMenuProp]     = useState(null);

  const totalContents   = properties.reduce((s,p)=>s+p.currentContents,0);
  const totalRecommended= properties.reduce((s,p)=>s+p.recommendedContents,0);
  const totalItems      = properties.reduce((s,p)=>s+p.rooms.reduce((rs,r)=>rs+r.items.length,0),0);
  const overallPct      = totalRecommended>0 ? Math.min(100,Math.round((totalContents/totalRecommended)*100)) : 0;

  const saveProperty = (prop) => {
    setProperties(prev => prev.find(p=>p.id===prop.id) ? prev.map(p=>p.id===prop.id?prop:p) : [...prev,prop]);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom:80 }}>
      <AppHeader
        title="Room Worth" subtitle="Contents Estimator"
        right={<div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1B3A6B,#4AABBF)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:800 }}>{user.firstName[0]}{user.lastName[0]}</div>}
      />
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 15px" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>Good day 👋</div>
          <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:22, letterSpacing:"-0.4px" }}>{user.firstName}'s Properties</div>
        </div>

        {/* Summary */}
        <div style={{ background:"linear-gradient(135deg,#1B3A6B,#1e4d8c)", borderRadius:22, padding:"20px", marginBottom:18, boxShadow:"0 8px 28px rgba(27,58,107,0.2)" }}>
          <div style={{ color:"rgba(255,255,255,0.55)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>Portfolio Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {[{label:"Properties",value:properties.length,icon:"home"},{label:"Total Contents",value:fmt(totalContents),icon:"rooms"},{label:"Items Scanned",value:totalItems,icon:"scan"}].map(({label,value,icon})=>(
              <div key={label} style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:5 }}><SvgIcon name={icon} size={18} color="rgba(255,255,255,0.75)"/></div>
                <div style={{ color:"white", fontWeight:800, fontSize:14 }}>{value}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:99, height:7 }}>
            <div style={{ height:"100%", borderRadius:99, width:`${overallPct}%`, background:"linear-gradient(90deg,#4AABBF,#6ee7b7)", transition:"width 0.6s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Overall coverage</span>
            <span style={{ color:"#4AABBF", fontSize:11, fontWeight:700 }}>{overallPct}%</span>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>{properties.length} propert{properties.length===1?"y":"ies"}</div>
          <button onClick={()=>setShowAdd(true)} style={{ background:"linear-gradient(135deg,#4AABBF,#0891b2)", border:"none", borderRadius:20, padding:"8px 16px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, boxShadow:"0 4px 12px rgba(74,171,191,0.35)" }}>
            <span style={{ fontSize:16 }}>+</span> Add Property
          </button>
        </div>

        {properties.length===0 ? (
          <div style={{ textAlign:"center", padding:"44px 20px", background:"white", borderRadius:22, border:"1px solid #e8eef5" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🏡</div>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17, marginBottom:8 }}>No Properties Yet</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:22 }}>Add your first property to get started</div>
            <button onClick={()=>setShowAdd(true)} style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:14, padding:"13px 24px", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>+ Add Property</button>
          </div>
        ) : properties.map(p => {
          const contents = p.rooms.reduce((s,r)=>s+r.items.filter(i=>!i.specialist).reduce((rs,i)=>rs+i.value*i.qty,0),0);
          const pct = Math.min(100,Math.round((contents/p.recommendedContents)*100));
          const pc = progressColor(pct);
          return (
            <div key={p.id} style={{ background:"white", borderRadius:22, overflow:"hidden", boxShadow:"0 3px 18px rgba(27,58,107,0.08)", border:"1px solid #e8eef5", marginBottom:14 }}>
              <div style={{ height:120, background:"linear-gradient(135deg,#f0f5fb,#e8f1f8)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <Logo size={44} />
                  <div style={{ color:"#94a3b8", fontSize:10, fontWeight:600 }}>No photo</div>
                </div>
                <div style={{ position:"absolute", top:10, left:12, background:"rgba(27,58,107,0.8)", color:"white", borderRadius:20, padding:"4px 11px", fontSize:10, fontWeight:700 }}>{p.type}</div>
                <div style={{ position:"absolute", top:8, right:8 }}>
                  <button onClick={()=>setMenuProp(menuProp===p.id?null:p.id)} style={{ background:"rgba(255,255,255,0.9)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:16, color:"#1B3A6B", display:"flex", alignItems:"center", justifyContent:"center" }}>⋯</button>
                  {menuProp===p.id && (
                    <>
                      <div onClick={()=>setMenuProp(null)} style={{ position:"fixed", inset:0, zIndex:30 }} />
                      <div style={{ position:"absolute", top:38, right:0, zIndex:40, background:"white", borderRadius:14, boxShadow:"0 6px 24px rgba(27,58,107,0.15)", border:"1px solid #e8eef5", minWidth:150, overflow:"hidden" }}>
                        <button onClick={()=>{setMenuProp(null);setEditProp(p);}} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"12px 16px", background:"none", border:"none", cursor:"pointer", color:"#1B3A6B", fontSize:13, fontWeight:600, borderBottom:"1px solid #f1f5f9" }}>✏️ Edit</button>
                        <button onClick={()=>{setMenuProp(null);setDeleteProp(p);}} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"12px 16px", background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontSize:13, fontWeight:600 }}>🗑️ Delete</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ padding:"16px" }}>
                <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:16, marginBottom:3 }}>{p.name}</div>
                <div style={{ color:"#94a3b8", fontSize:12, marginBottom:13 }}>{p.address}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {[{label:"Contents",value:fmt(contents)},{label:"Recommended",value:fmt(p.recommendedContents)}].map(({label,value})=>(
                    <div key={label} style={{ background:"#f8fafc", borderRadius:11, padding:"9px 11px" }}>
                      <div style={{ color:"#94a3b8", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>{label}</div>
                      <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:14 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#f1f5f9", borderRadius:99, height:6, marginBottom:6 }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:`linear-gradient(90deg,${pc}99,${pc})` }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:13 }}>
                  <span style={{ color:"#94a3b8", fontSize:11 }}>{p.rooms.reduce((s,r)=>s+r.items.length,0)} items scanned</span>
                  <span style={{ color:pc, fontSize:11, fontWeight:700 }}>{pct}%</span>
                </div>
                <button onClick={()=>onViewProperty(p)} style={{ width:"100%", background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:13, padding:"13px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 14px rgba(27,58,107,0.2)" }}>
                  View Property →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(showAdd||editProp) && <PropertyModal existing={editProp} onSave={p=>{saveProperty(p);setShowAdd(false);setEditProp(null);}} onClose={()=>{setShowAdd(false);setEditProp(null);}} />}
      {deleteProp && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.6)", backdropFilter:"blur(5px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"white", borderRadius:22, padding:"28px 22px", maxWidth:300, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏡</div>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17, marginBottom:8 }}>Delete Property?</div>
            <div style={{ color:"#64748b", fontSize:13, marginBottom:6 }}>This removes <strong>{deleteProp.name}</strong> and all its data.</div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={()=>setDeleteProp(null)} style={{ flex:1, background:"#f1f5f9", border:"none", borderRadius:13, padding:"13px", color:"#1B3A6B", fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>{setProperties(prev=>prev.filter(p=>p.id!==deleteProp.id));setDeleteProp(null);}} style={{ flex:1, background:"#dc2626", border:"none", borderRadius:13, padding:"13px", color:"white", fontWeight:700, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="properties" onNavigate={onNavigate} />
    </div>
  );
}

// Property Modal
function PropertyModal({ existing, onSave, onClose }) {
  const parseAddress = (addr) => {
    if (!addr) return { line1:"", street:"", county:"", city:"", postcode:"" };
    const parts = addr.split(",").map(s=>s.trim());
    return { line1:parts[0]||"", street:parts[1]||"", county:parts[2]||"", city:parts[3]||"", postcode:parts[4]||"" };
  };
  const existingAddr = parseAddress(existing?.address);
  const [name, setName]       = useState(existing?.name||"");
  const [line1, setLine1]     = useState(existingAddr.line1);
  const [street, setStreet]   = useState(existingAddr.street);
  const [county, setCounty]   = useState(existingAddr.county);
  const [city, setCity]       = useState(existingAddr.city);
  const [postcode, setPostcode] = useState(existingAddr.postcode);
  const [type, setType]       = useState(existing?.type||PROPERTY_TYPES[0]);
  const [rebuild, setRebuild] = useState(existing?.rebuildValue||"");
  const rebuildNum = Number(String(rebuild).replace(/[^0-9]/g,""));
  const fullAddress = [line1, street, county, city, postcode].filter(Boolean).join(", ");
  const isValid = name.trim() && line1.trim() && street.trim() && postcode.trim() && rebuildNum > 0;

  const inpStyle = { width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"12px 14px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lblStyle = { color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 };

  const save = () => {
    if (!isValid) return;
    onSave({
      id: existing?.id||uid(),
      name: name.trim(), address: fullAddress, type,
      rebuildValue: rebuildNum,
      recommendedContents: Math.round(rebuildNum*0.1),
      currentContents: existing?.currentContents||0,
      rooms: existing?.rooms || DEFAULT_ROOMS.map(r=>({...r, id:uid(), items:[]})),
    });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.6)", backdropFilter:"blur(5px)", zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ background:"white", borderRadius:"24px 24px 0 0", maxHeight:"92vh", overflowY:"auto", paddingBottom:40 }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}><div style={{ width:40, height:4, borderRadius:2, background:"#e2e8f0" }} /></div>
        <div style={{ padding:"14px 20px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17 }}>{existing?"Edit Property":"Add Property"}</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"20px" }}>
          <InputField label="Property Name" value={name} onChange={setName} placeholder="e.g. Riverside Cottage" />

          {/* Structured address */}
          <div style={{ marginBottom:14 }}>
            <label style={{ ...lblStyle, marginBottom:10 }}>Property Address</label>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div>
                <label style={{ ...lblStyle, fontSize:10, marginBottom:5 }}>House Name / Number</label>
                <input value={line1} onChange={e=>setLine1(e.target.value)} placeholder="e.g. 14 Oak House" style={inpStyle} />
              </div>
              <div>
                <label style={{ ...lblStyle, fontSize:10, marginBottom:5 }}>Street Name</label>
                <input value={street} onChange={e=>setStreet(e.target.value)} placeholder="e.g. High Street" style={inpStyle} />
              </div>
              <div>
                <label style={{ ...lblStyle, fontSize:10, marginBottom:5 }}>County</label>
                <input value={county} onChange={e=>setCounty(e.target.value)} placeholder="e.g. Surrey" style={inpStyle} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div>
                  <label style={{ ...lblStyle, fontSize:10, marginBottom:5 }}>City (optional)</label>
                  <input value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. London" style={inpStyle} />
                </div>
                <div>
                  <label style={{ ...lblStyle, fontSize:10, marginBottom:5 }}>Postcode</label>
                  <input value={postcode} onChange={e=>setPostcode(e.target.value.toUpperCase())} placeholder="e.g. SW1A 1AA" style={{ ...inpStyle, textTransform:"uppercase", fontFamily:"monospace", letterSpacing:"1px" }} />
                </div>
              </div>
            </div>
            {fullAddress && <div style={{ marginTop:8, background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"8px 12px", color:"#0369a1", fontSize:11 }}>📍 {fullAddress}</div>}
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:8 }}>Property Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {PROPERTY_TYPES.map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{ background:type===t?"#f0f5ff":"#f8fafc", border:`1.5px solid ${type===t?"#1B3A6B":"#e2e8f0"}`, borderRadius:11, padding:"9px 7px", color:type===t?"#1B3A6B":"#64748b", fontSize:11, fontWeight:700, cursor:"pointer" }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:8 }}>Rebuild Value</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#64748b", fontWeight:700 }}>£</span>
              <input type="number" value={rebuild} onChange={e=>setRebuild(e.target.value)} placeholder="1850000"
                style={{ width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 13px 13px 26px", color:"#1e293b", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            {rebuildNum>0 && <div style={{ marginTop:8, background:"#f0f9ff", borderRadius:10, padding:"9px 12px", border:"1px solid #bae6fd", color:"#0369a1", fontSize:12, fontWeight:600 }}>🎯 Recommended contents: {fmt(Math.round(rebuildNum*0.1))}</div>}
          </div>
          <PrimaryBtn onClick={save} disabled={!isValid}>{existing?"Save Changes":"Add Property"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — ROOMS
// ─────────────────────────────────────────────────────────────────────────────
function RoomsScreen({ property, onUpdateProperty, onBack, onScanItem, onViewReport, onNavigate }) {
  const [openRoom, setOpenRoom]       = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [deleteRoom, setDeleteRoom]   = useState(null);
  const [miscRoom, setMiscRoom]       = useState(null);

  const totalContents = property.rooms.reduce((s,r)=>s+r.items.filter(i=>!i.specialist).reduce((rs,i)=>rs+i.value*i.qty,0),0);
  const pct = Math.min(100,Math.round((totalContents/property.recommendedContents)*100));
  const pc = progressColor(pct);

  const updateRooms = (rooms) => onUpdateProperty({...property, rooms, currentContents: rooms.reduce((s,r)=>s+r.items.filter(i=>!i.specialist).reduce((rs,i)=>rs+(i.override_value||i.value)*i.qty,0),0)});

  const addRoom = (room) => updateRooms([...property.rooms, room]);

  const handleAddMiscItem = (roomId, item) => {
    updateRooms(property.rooms.map(r => r.id===roomId ? {...r, items:[...r.items, item]} : r));
  };
  const removeRoom = (id) => { updateRooms(property.rooms.filter(r=>r.id!==id)); setDeleteRoom(null); };

  const handleOverrideItem = (roomId, itemId, overrideVal) => {
    updateRooms(property.rooms.map(r => r.id===roomId
      ? {...r, items: r.items.map(i => i.id===itemId ? {...i, override_value: overrideVal} : i)}
      : r
    ));
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom:80 }}>
      <AppHeader title={property.name} subtitle="Valuation Dashboard" onBack={onBack}
        right={<button onClick={()=>onScanItem(null)} style={{ background:"linear-gradient(135deg,#4AABBF,#0891b2)", border:"none", borderRadius:20, padding:"7px 14px", color:"white", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><SvgIcon name="scan" size={13} color="white"/> Scan</button>}
      />
      <div style={{ maxWidth:500, margin:"0 auto", padding:"18px 14px" }}>
        {/* Property summary card */}
        <div style={{ background:"linear-gradient(135deg,#1B3A6B,#1e4d8c)", borderRadius:22, padding:"20px", marginBottom:16, boxShadow:"0 8px 28px rgba(27,58,107,0.2)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:16 }}>
            {[{label:"Rebuild Value",value:fmt(property.rebuildValue),icon:"building"},{label:"Contents Est.",value:fmt(totalContents),icon:"rooms"},{label:"Recommended",value:fmt(property.recommendedContents),icon:"report"}].map(({label,value,icon})=>(
              <div key={label} style={{ background:"rgba(255,255,255,0.1)", borderRadius:11, padding:"10px 6px", textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:5 }}><SvgIcon name={icon} size={18} color="rgba(255,255,255,0.75)"/></div>
                <div style={{ color:"white", fontWeight:800, fontSize:13 }}>{value}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:600, textTransform:"uppercase", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, height:7 }}>
            <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:`linear-gradient(90deg,${pc},#6ee7b7)`, transition:"width 0.6s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Contents coverage</span>
            <span style={{ color:pct>=100?"#6ee7b7":"#fcd34d", fontSize:11, fontWeight:700 }}>{pct}%</span>
          </div>
        </div>

        {/* Report buttons */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <button onClick={()=>onViewReport("broker",property)} style={{ background:"linear-gradient(135deg,#0e7490,#0891b2)", border:"none", borderRadius:15, padding:"14px 10px", color:"white", fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(8,145,178,0.35)" }}><SvgIcon name="broker" size={16} color="white"/> Broker Report</button>
          <button onClick={()=>onViewReport("inventory",property)} style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:15, padding:"14px 10px", color:"white", fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(27,58,107,0.3)" }}><SvgIcon name="inventory" size={16} color="white"/> View Inventory</button>
        </div>

        {/* Rooms header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
          <div>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17 }}>Rooms</div>
            <div style={{ color:"#64748b", fontSize:12 }}>{property.rooms.length} rooms · {property.rooms.reduce((s,r)=>s+r.items.length,0)} items</div>
          </div>
          <button onClick={()=>setShowAddRoom(true)} style={{ background:"linear-gradient(135deg,#4AABBF,#0891b2)", border:"none", borderRadius:12, padding:"8px 15px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 10px rgba(74,171,191,0.35)" }}>
            <SvgIcon name="plus" size={14} color="white"/> Add Room
          </button>
        </div>

        {/* Room grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
          {property.rooms.map(room => {
            const roomTotal = room.items.filter(i=>!i.specialist).reduce((s,i)=>s+i.value*i.qty,0);
            return (
              <div key={room.id} style={{ background:"white", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 14px rgba(27,58,107,0.08)", border:"1px solid #e8eef5" }}>
                <div style={{ height:4, background:room.color }} />
                <div style={{ padding:"14px 12px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:9 }}>
                    <div style={{ width:44, height:44, borderRadius:13, background:`${room.color}14`, color:room.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <RoomIcon type={room.type} size={26} />
                    </div>
                    <button onClick={()=>setDeleteRoom(room)} style={{ background:"#fef2f2", border:"none", borderRadius:8, width:26, height:26, cursor:"pointer", color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑</button>
                  </div>
                  <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:13, marginBottom:2, lineHeight:1.3 }}>{room.name}</div>
                  <div style={{ color:room.color, fontWeight:700, fontSize:12, marginBottom:11 }}>{roomTotal>0?fmt(roomTotal):"No items yet"}</div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={()=>setOpenRoom(room)} style={{ flex:1, background:`${room.color}14`, border:`1px solid ${room.color}25`, borderRadius:9, padding:"7px 4px", color:room.color, fontSize:11, fontWeight:700, cursor:"pointer" }}>View</button>
                    <button onClick={()=>onScanItem(room)} style={{ flex:1, background:room.color, border:"none", borderRadius:9, padding:"7px 4px", color:"white", fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Scan</button>
                  </div>
                  <button onClick={()=>setMiscRoom(room)} style={{ width:"100%", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, padding:"6px 4px", color:"#64748b", fontSize:10, fontWeight:700, cursor:"pointer", marginTop:5, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <SvgIcon name="list" size={11} color="#64748b"/> Add Everyday Items
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {openRoom && (
        <RoomModal room={openRoom}
          onClose={()=>setOpenRoom(null)}
          onScan={()=>{ onScanItem(openRoom); setOpenRoom(null); }}
          onDeleteItem={(roomId,itemId)=>{
            updateRooms(property.rooms.map(r=>r.id===roomId?{...r,items:r.items.filter(i=>i.id!==itemId)}:r));
            setOpenRoom(prev=>prev?{...prev,items:prev.items.filter(i=>i.id!==itemId)}:null);
          }}
          onOverrideItem={(roomId,itemId,val)=>{
            handleOverrideItem(roomId,itemId,val);
            setOpenRoom(prev=>prev?{...prev,items:prev.items.map(i=>i.id===itemId?{...i,override_value:val}:i)}:null);
          }}
        />
      )}

      {showAddRoom && <AddRoomModal onAdd={r=>{addRoom(r);setShowAddRoom(false);}} onClose={()=>setShowAddRoom(false)} />}
      {miscRoom && <MiscItemModal room={miscRoom} onAdd={(item)=>handleAddMiscItem(miscRoom.id,item)} onClose={()=>setMiscRoom(null)} />}

      {deleteRoom && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.6)", backdropFilter:"blur(5px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"white", borderRadius:22, padding:"26px 20px", maxWidth:300, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:16, marginBottom:7 }}>Delete Room?</div>
            <div style={{ color:"#64748b", fontSize:13, marginBottom:20 }}>This will remove <strong>{deleteRoom.name}</strong> and all its items.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDeleteRoom(null)} style={{ flex:1, background:"#f1f5f9", border:"none", borderRadius:12, padding:"12px", color:"#1B3A6B", fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>removeRoom(deleteRoom.id)} style={{ flex:1, background:"#dc2626", border:"none", borderRadius:12, padding:"12px", color:"white", fontWeight:700, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="properties" onNavigate={onNavigate} />
    </div>
  );
}


// ── Room Item Card with value override ──────────────────────────────────────
function RoomItemCard({ item, roomId, onDelete, onOverride }) {
  const [editing, setEditing] = useState(false);
  const [overrideVal, setOverrideVal] = useState(item.override_value ? String(item.override_value) : "");

  const saveOverride = () => {
    const num = Number(overrideVal.replace(/[^0-9.]/g,""));
    if (!isNaN(num) && num > 0) {
      onOverride(roomId, item.id, num);
    } else {
      onOverride(roomId, item.id, null); // clear override
    }
    setEditing(false);
  };

  const displayValue = item.override_value ? item.override_value * item.qty : item.value * item.qty;
  const isOverridden = !!item.override_value;

  return (
    <div style={{ background:"#f8fafc", borderRadius:14, padding:"12px", marginBottom:8, border:`1px solid ${isOverridden?"#bae6fd":"#e8eef5"}` }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        {item.image && <img src={item.image} alt={item.name} style={{ width:52, height:52, borderRadius:10, objectFit:"cover", flexShrink:0, border:"1px solid #e2e8f0" }} />}
        {!item.image && <div style={{ width:52, height:52, borderRadius:10, background:"linear-gradient(135deg,#f0f5fb,#e8f1f8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📦</div>}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
            <span style={{ color:"#1B3A6B", fontWeight:700, fontSize:13 }}>{item.name}</span>
            {item.specialist && <span style={{ background:"#7c3aed", color:"white", fontSize:8, fontWeight:800, borderRadius:5, padding:"2px 5px" }}>SPEC</span>}
            {isOverridden && <span style={{ background:"#0369a1", color:"white", fontSize:8, fontWeight:800, borderRadius:5, padding:"2px 5px" }}>OVERRIDE</span>}
          </div>
          <div style={{ color:"#94a3b8", fontSize:11, marginBottom:4, lineHeight:1.3 }}>{item.description}</div>
          <div style={{ color:"#64748b", fontSize:11, marginBottom:6 }}>Qty: {item.qty} · {item.confidence}% confidence</div>

          {/* Value display */}
          {!item.specialist && (
            editing ? (
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                <span style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>£</span>
                <input
                  type="number"
                  value={overrideVal}
                  onChange={e=>setOverrideVal(e.target.value)}
                  placeholder={String(item.value)}
                  style={{ width:90, background:"white", border:"1.5px solid #4AABBF", borderRadius:8, padding:"5px 8px", fontSize:13, fontWeight:700, color:"#1B3A6B", outline:"none" }}
                  autoFocus
                />
                <button onClick={saveOverride} style={{ background:"#1B3A6B", border:"none", borderRadius:8, padding:"5px 10px", color:"white", fontSize:11, fontWeight:700, cursor:"pointer" }}>Save</button>
                <button onClick={()=>setEditing(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"5px 8px", color:"#64748b", fontSize:11, cursor:"pointer" }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#1B3A6B", fontWeight:800, fontSize:15 }}>£{displayValue.toLocaleString()}</span>
                {isOverridden && <span style={{ color:"#94a3b8", fontSize:10 }}>AI est: £{(item.value*item.qty).toLocaleString()}</span>}
                <button onClick={()=>{ setOverrideVal(item.override_value ? String(item.override_value) : ""); setEditing(true); }} style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:6, padding:"2px 8px", color:"#0369a1", fontSize:10, fontWeight:700, cursor:"pointer", marginLeft:2 }}>
                  {isOverridden?"Edit":"Override"}
                </button>
              </div>
            )
          )}
          {item.specialist && <span style={{ color:"#7c3aed", fontWeight:700, fontSize:13 }}>Specialist valuation</span>}
        </div>
        <button onClick={()=>onDelete(roomId,item.id)} style={{ background:"#fef2f2", border:"none", borderRadius:8, width:28, height:28, cursor:"pointer", color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose, onScan, onDeleteItem, onOverrideItem }) {
  const total = room.items.filter(i=>!i.specialist).reduce((s,i)=>s+i.value*i.qty,0);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.55)", backdropFilter:"blur(4px)", zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ background:"white", borderRadius:"22px 22px 0 0", maxHeight:"82vh", overflowY:"auto", paddingBottom:30 }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"11px 0 0" }}><div style={{ width:38, height:4, borderRadius:2, background:"#e2e8f0" }} /></div>
        <div style={{ padding:"14px 18px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:`${room.color}15`, color:room.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><RoomIcon type={room.type} size={28} /></div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:16 }}>{room.name}</div>
            <div style={{ color:room.color, fontWeight:700, fontSize:13 }}>{fmt(total)} total</div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px" }}>
          {room.items.length===0 ? (
            <div style={{ textAlign:"center", padding:"28px 0", color:"#94a3b8" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
              <div style={{ fontWeight:700, color:"#64748b" }}>No items yet</div>
            </div>
          ) : room.items.map(item=>(
            <RoomItemCard key={item.id} item={item} roomId={room.id} onDelete={onDeleteItem} onOverride={onOverrideItem} />
          ))}
          <button onClick={onScan} style={{ width:"100%", background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:13, padding:"14px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer", marginTop:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 16px rgba(27,58,107,0.22)" }}>
            🔍 Scan & Add Item
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Add Everyday Items Modal ─────────────────────────────────────────────────
function MiscItemModal({ room, onAdd, onClose }) {
  const [name, setName]   = useState("");
  const [value, setValue] = useState("");
  const [qty, setQty]     = useState("1");

  const isValid = name.trim() && Number(value) > 0;

  // SVG bundle icon as a data URL for misc items
  const bundleIconSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='16' fill='%23f0f5ff'/><rect x='18' y='32' width='44' height='30' rx='4' fill='%231B3A6B' opacity='0.15'/><rect x='22' y='28' width='36' height='34' rx='4' fill='none' stroke='%231B3A6B' stroke-width='2.5'/><path d='M30 28 Q30 20 40 20 Q50 20 50 28' fill='none' stroke='%231B3A6B' stroke-width='2.5' stroke-linecap='round'/><path d='M22 40 L58 40' stroke='%231B3A6B' stroke-width='2' opacity='0.4'/><path d='M33 34 L47 34' stroke='%234AABBF' stroke-width='2.5' stroke-linecap='round'/></svg>`;

  const handleAdd = () => {
    if (!isValid) return;
    const newItem = {
      id: uid(),
      name: name.trim(),
      description: `Everyday items — client estimated value`,
      qty: Math.max(1, parseInt(qty) || 1),
      value: Number(value),
      override_value: null,
      low_value: Number(value),
      high_value: Number(value),
      confidence: 100,
      specialist: false,
      specialist_reason: "",
      image: bundleIconSvg,
      isMisc: true,
    };
    onAdd(newItem);
    onClose();
  };

  const inpStyle = { width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"13px 15px", color:"#1e293b", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:7 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.6)", backdropFilter:"blur(5px)", zIndex:60, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ background:"white", borderRadius:"24px 24px 0 0", maxHeight:"88vh", overflowY:"auto", paddingBottom:40 }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#e2e8f0" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"16px 20px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:"#f0f5ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <SvgIcon name="rooms" size={22} color="#1B3A6B"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17 }}>Add Everyday Items</div>
            <div style={{ color:"#64748b", fontSize:12, marginTop:1 }}>{room.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ padding:"20px" }}>
          {/* Explanation */}
          <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:14, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ color:"#0369a1", fontSize:13, lineHeight:1.6 }}>
              For grouped items like <strong>clothing, kitchenware, bedding</strong> or <strong>books</strong> — add them as a single estimate instead of listing everything individually.
            </div>
          </div>

          {/* Item Name */}
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Item / Group Name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}
              placeholder="e.g. Men's Clothing, Kitchen Essentials"
              style={inpStyle} />
            <div style={{ color:"#94a3b8", fontSize:11, marginTop:5 }}>e.g. Women's wardrobe, Children's toys, Kitchenware set</div>
          </div>

          {/* Estimated Value */}
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Estimated Value (£)</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#64748b", fontWeight:700, fontSize:16 }}>£</span>
              <input type="number" value={value} onChange={e=>setValue(e.target.value)}
                placeholder="0"
                style={{ ...inpStyle, paddingLeft:30 }} />
            </div>
            <div style={{ color:"#94a3b8", fontSize:11, marginTop:5 }}>What would it cost to replace all of this today at UK retail prices?</div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom:24 }}>
            <label style={lbl}>Quantity</label>
            <div style={{ display:"inline-flex", alignItems:"center", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12 }}>
              <button onClick={()=>setQty(String(Math.max(1,(parseInt(qty)||1)-1)))} style={{ background:"none", border:"none", width:44, height:46, fontSize:20, color:"#1B3A6B", cursor:"pointer", fontWeight:700 }}>−</button>
              <span style={{ color:"#1B3A6B", fontWeight:800, fontSize:18, minWidth:36, textAlign:"center" }}>{qty}</span>
              <button onClick={()=>setQty(String((parseInt(qty)||1)+1))} style={{ background:"none", border:"none", width:44, height:46, fontSize:20, color:"#1B3A6B", cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
            <div style={{ color:"#94a3b8", fontSize:11, marginTop:5 }}>Usually 1 for grouped items</div>
          </div>

          {/* Preview */}
          {name.trim() && Number(value) > 0 && (
            <div style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.2s ease" }}>
              <img src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='16' fill='%23f0f5ff'/><rect x='22' y='28' width='36' height='34' rx='4' fill='none' stroke='%231B3A6B' stroke-width='2.5'/><path d='M30 28 Q30 20 40 20 Q50 20 50 28' fill='none' stroke='%231B3A6B' stroke-width='2.5' stroke-linecap='round'/><path d='M33 34 L47 34' stroke='%234AABBF' stroke-width='2.5' stroke-linecap='round'/></svg>`}
                alt="bundle" style={{ width:44, height:44, borderRadius:10, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ color:"#1B3A6B", fontWeight:700, fontSize:14 }}>{name}</div>
                <div style={{ color:"#64748b", fontSize:12 }}>Qty: {qty} · £{Number(value).toLocaleString()}</div>
              </div>
              <div style={{ background:"#4AABBF", color:"white", borderRadius:8, padding:"3px 8px", fontSize:10, fontWeight:700 }}>READY</div>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!isValid}
            style={{
              width:"100%",
              background: isValid ? "linear-gradient(135deg,#1B3A6B,#2563ab)" : "#e2e8f0",
              border:"none", borderRadius:16, padding:"17px",
              color: isValid ? "white" : "#94a3b8",
              fontSize:16, fontWeight:800,
              cursor: isValid ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: isValid ? "0 6px 20px rgba(27,58,107,0.25)" : "none",
              transition:"all 0.2s"
            }}
          >
            <SvgIcon name="plus" size={16} color={isValid?"white":"#94a3b8"}/>
            Add to {room.name}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRoomModal({ onAdd, onClose }) {
  const [name, setName]           = useState("");
  const [selectedType, setType]   = useState("custom");
  const [selectedColor, setColor] = useState("#4AABBF");
  const types = [{type:"living_room",label:"Lounge"},{type:"bedroom_2",label:"Bedroom"},{type:"bathroom",label:"Bathroom"},{type:"study",label:"Office"},{type:"garden",label:"Outdoor"},{type:"custom",label:"Other"}];
  const colors = ["#4AABBF","#1B3A6B","#059669","#7c3aed","#d97706","#dc2626","#0891b2","#475569"];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,30,60,0.6)", backdropFilter:"blur(5px)", zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ background:"white", borderRadius:"22px 22px 0 0", paddingBottom:36 }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"11px 0 0" }}><div style={{ width:38, height:4, borderRadius:2, background:"#e2e8f0" }} /></div>
        <div style={{ padding:"14px 18px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:17 }}>Add New Room</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"18px" }}>
          <InputField label="Room Name" value={name} onChange={setName} placeholder="e.g. Cinema Room" />
          <div style={{ marginBottom:16 }}>
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:9 }}>Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
              {types.map(({type,label})=>(
                <button key={type} onClick={()=>setType(type)} style={{ background:selectedType===type?"#f0f5ff":"#f8fafc", border:`2px solid ${selectedType===type?"#1B3A6B":"#e2e8f0"}`, borderRadius:11, padding:"9px 4px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, color:selectedType===type?"#1B3A6B":"#94a3b8" }}>
                  <RoomIcon type={type} size={22} /><span style={{ fontSize:10, fontWeight:600 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:9 }}>Colour</label>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
              {colors.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{ width:30, height:30, borderRadius:"50%", background:c, border:`3px solid ${selectedColor===c?"#1B3A6B":"transparent"}`, cursor:"pointer", boxShadow:selectedColor===c?`0 0 0 2px white, 0 0 0 4px ${c}`:"none" }} />
              ))}
            </div>
          </div>
          <PrimaryBtn onClick={()=>{ if(!name.trim())return; onAdd({id:uid(),type:selectedType,name:name.trim(),color:selectedColor,items:[]}); }} disabled={!name.trim()}>Add Room</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — AI SCANNER
// ─────────────────────────────────────────────────────────────────────────────
function ScannerScreen({ user, targetRoom, properties, onBack, onItemScanned, onNavigate }) {
  // API key is now handled server-side
  const [apiKey] = useState("server");
  const [showKey, setShowKey]   = useState(false);
  const [previewSrc, setPreview]= useState(null);
  const [itemName, setItemName] = useState("");
  const [quantity, setQty]      = useState(1);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [imageMime, setImageMime]= useState("image/jpeg");
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setError(null);

    const reader = new FileReader();
    reader.onerror = () => setError("Could not read file — please try again.");
    reader.onload = (e) => {
      const originalDataUrl = e.target.result;
      // Try to compress via canvas — if it fails fall back to original
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const MAX = 1024;
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            if (w > MAX || h > MAX) {
              if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
              else { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL("image/jpeg", 0.82);
            if (compressed && compressed.length > 100) {
              setImageMime("image/jpeg");
              setImageB64(compressed.split(",")[1]);
              setPreview(compressed);
            } else {
              // Canvas failed, use original
              setImageMime(file.type || "image/jpeg");
              setImageB64(originalDataUrl.split(",")[1]);
              setPreview(originalDataUrl);
            }
          } catch(canvasErr) {
            // Canvas error — use original uncompressed
            setImageMime(file.type || "image/jpeg");
            setImageB64(originalDataUrl.split(",")[1]);
            setPreview(originalDataUrl);
          }
        };
        img.onerror = () => {
          // Image load error — use original
          setImageMime(file.type || "image/jpeg");
          setImageB64(originalDataUrl.split(",")[1]);
          setPreview(originalDataUrl);
        };
        img.src = originalDataUrl;
      } catch(err) {
        // Any other error — use original
        setImageMime(file.type || "image/jpeg");
        setImageB64(originalDataUrl.split(",")[1]);
        setPreview(originalDataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!apiKey.trim()) { setError("Please enter your Claude API key."); return; }
    if (!previewSrc)    { setError("Please provide an image."); return; }
    if (!itemName.trim()){ setError("Please enter the item name."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const imageBlock = { type:"image", source:{ type:"base64", media_type:imageMime, data:imageB64 } };
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: imageMime, data: imageB64 } },
            { type: "text", text: `You are an expert UK home contents insurance valuer for a High Net Worth insurance broker.

Analyse this image. The user says this item is: "${itemName}" (quantity: ${quantity})

Estimate the UK new replacement cost. Use current UK retail prices. Multiply all values by the quantity.
Set specialist_flag to true ONLY for: jewellery, watches, fine art, antiques, rare collectibles.
confidence is an integer from 0 to 100.

YOU MUST respond with ONLY the following JSON object and absolutely nothing else:
{"name":"item name","description":"brief description","low_value":0,"mid_value":0,"high_value":0,"specialist_flag":false,"specialist_reason":"","confidence":85}` }
          ]}]
        })
      });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`API error ${res.status}`); }
      const data = await res.json();

      // Extract text from response - handle all content block types
      let raw = "";
      if (data?.content) {
        for (const block of data.content) {
          if (block.type === "text") { raw = block.text.trim(); break; }
        }
      }
      if (!raw) throw new Error("No response received from AI — please try again.");

      // Robust JSON extraction — handles markdown fences, leading text, trailing text
      let jsonStr = raw;
      // Strip markdown code fences
      jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/g, "").trim();
      // If there's text before the JSON object, extract just the JSON
      const objStart = jsonStr.indexOf("{");
      const objEnd = jsonStr.lastIndexOf("}");
      if (objStart === -1 || objEnd === -1) {
        throw new Error("AI returned an unexpected format. Raw: " + raw.substring(0, 200));
      }
      jsonStr = jsonStr.substring(objStart, objEnd + 1);

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch(parseErr) {
        throw new Error("Could not read AI response. Raw: " + raw.substring(0, 200));
      }

      // Validate we got the fields we need
      if (typeof parsed.name === "undefined") {
        throw new Error("AI response missing expected fields. Raw: " + raw.substring(0, 200));
      }

      // Normalise confidence to 0-100
      if (parsed.confidence <= 1) parsed.confidence = Math.round(parsed.confidence * 100);

      setResult(parsed);
    } catch(err) {
      const msg = err.message || "Something went wrong.";
      setError(msg.length > 400 ? msg.substring(0,400)+"..." : msg);
    }
    finally { setLoading(false); }
  };

  const [toast, setToast] = useState(null);

  const handleAddToRoom = (roomId, roomName) => {
    if (!result) return;
    const rid = roomId || (targetRoom && targetRoom.id);
    const rname = roomName || (targetRoom && targetRoom.name) || "room";
    if (!rid) return;
    const aiValue = result._ai_value || result.mid_value || 0;
    const overrideValue = result._overridden ? result.mid_value : null;
    const newItem = {
      id: uid(),
      name: result.name,
      description: result.description,
      qty: quantity,
      value: aiValue,                    // always store AI value as base value
      override_value: overrideValue,     // store client override if set
      low_value: result.low_value,
      high_value: result.high_value,
      confidence: result.confidence<=1 ? Math.round(result.confidence*100) : Math.round(result.confidence),
      specialist: result.specialist_flag,
      specialist_reason: result.specialist_reason,
      image: imageB64 ? `data:${imageMime};base64,${imageB64}` : null
    };
    onItemScanned(rid, newItem);
    // Show toast and reset for next scan
    setToast(rname);
    setTimeout(() => setToast(null), 3000);
    setResult(null); setPreview(null); setImageB64(null); setItemName(""); setQty(1); setError(null);
  };

  const confPct = result ? (result.confidence<=1?Math.round(result.confidence*100):Math.round(result.confidence)) : 0;
  const confLevel = confPct>=75?"high":confPct>=45?"medium":"low";
  const confCfg = { high:{color:"#059669",bg:"#ecfdf5",border:"#6ee7b7",label:"High Confidence",icon:"✓"}, medium:{color:"#d97706",bg:"#fffbeb",border:"#fcd34d",label:"Medium Confidence",icon:"◐"}, low:{color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",label:"Low Confidence",icon:"!"} };
  const conf = result ? confCfg[confLevel] : null;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom:80 }}>
      <AppHeader title="AI Scanner" subtitle={targetRoom?`Scanning for ${targetRoom.name}`:"Contents Estimator"} onBack={onBack} />
      <div style={{ maxWidth:500, margin:"0 auto", padding:"18px 14px" }}>

        {/* API key handled server-side - no UI needed */}

        {/* Image */}
        {!result && (
          <Card>
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:10 }}>📷 Item Photo</label>
            {!previewSrc && (
              <div onClick={()=>fileRef.current.click()}
                style={{ border:"2px dashed #cbd5e1", borderRadius:16, background:"#f8fafc", cursor:"pointer", minHeight:140, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:9, padding:20, textAlign:"center", transition:"all 0.2s" }}>
                <div style={{ fontSize:40 }}>📷</div>
                <div style={{ color:"#1B3A6B", fontWeight:700, fontSize:15 }}>Take a photo or upload</div>
                <div style={{ color:"#94a3b8", fontSize:12 }}>Tap to use your camera or choose from gallery</div>
                <div style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", color:"white", borderRadius:20, padding:"8px 20px", fontSize:12, fontWeight:700, marginTop:4 }}>📷 Open Camera / Upload</div>
              </div>
            )}
            {previewSrc && (
              <div style={{ position:"relative", borderRadius:14, overflow:"hidden" }}>
                <img src={previewSrc} alt="item" style={{ width:"100%", maxHeight:240, objectFit:"cover", display:"block" }} />
                <button onClick={()=>{setPreview(null);setImageB64(null);setResult(null);setError(null);}} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.55)", color:"white", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                <button onClick={()=>fileRef.current.click()} style={{ position:"absolute", bottom:8, right:8, background:"#4AABBF", color:"white", border:"none", borderRadius:10, padding:"6px 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Change Photo</button>
              </div>
            )}
            {previewSrc && <div style={{ color:"#059669", fontSize:12, fontWeight:600, marginTop:9, display:"flex", alignItems:"center", gap:5 }}>✓ Photo ready to scan</div>}
          </Card>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />

        {/* Item details */}
        {!result && (
          <Card>
            <InputField label="Item Name" value={itemName} onChange={setItemName} placeholder="e.g. Samsung 65 inch TV" />
            <label style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", display:"block", marginBottom:8 }}>Quantity</label>
            <div style={{ display:"inline-flex", alignItems:"center", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:11 }}>
              <button onClick={()=>setQty(Math.max(1,quantity-1))} style={{ background:"none", border:"none", width:42, height:44, fontSize:20, color:"#1B3A6B", cursor:"pointer", fontWeight:700 }}>−</button>
              <span style={{ color:"#1B3A6B", fontWeight:800, fontSize:17, minWidth:34, textAlign:"center" }}>{quantity}</span>
              <button onClick={()=>setQty(quantity+1)} style={{ background:"none", border:"none", width:42, height:44, fontSize:20, color:"#1B3A6B", cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
          </Card>
        )}

        {error && <div style={{ background:"#fff5f5", border:"1.5px solid #fca5a5", borderRadius:13, padding:"12px 14px", marginBottom:13, color:"#dc2626", fontSize:13, display:"flex", gap:8 }}><span>⚠️</span><span>{error}</span></div>}

        {!result && (
          <PrimaryBtn onClick={handleScan} disabled={!previewSrc||!itemName.trim()||!apiKey.trim()} loading={loading}>
            🔍 Scan &amp; Value Item
          </PrimaryBtn>
        )}

        {loading && <div style={{ textAlign:"center", marginTop:13, color:"#64748b", fontSize:13 }}>AI is analysing your item...<br/><span style={{ fontSize:11, color:"#94a3b8" }}>Checking UK retail prices</span></div>}

        {toast && (
          <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#1B3A6B", color:"white", borderRadius:30, padding:"12px 22px", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(27,58,107,0.35)", zIndex:100, display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", animation:"fadeUp 0.3s ease" }}>
            <SvgIcon name="check" size={16} color="#6ee7b7" />
            Added to {toast}!
          </div>
        )}

        {/* Results */}
        {result && conf && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            {previewSrc && <Card style={{ padding:0, overflow:"hidden" }}><img src={previewSrc} alt="scanned" style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }} /></Card>}
            <div style={{ background:conf.bg, border:`1.5px solid ${conf.border}`, borderRadius:18, padding:"14px 16px", marginBottom:13, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:conf.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:19, fontWeight:900 }}>{conf.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:conf.color, fontWeight:800, fontSize:14 }}>{conf.label}</div>
                <div style={{ color:"#64748b", fontSize:12 }}>Confidence: {confPct}%</div>
              </div>
              {result.specialist_flag && <div style={{ background:"#7c3aed", color:"white", borderRadius:9, padding:"4px 9px", fontSize:10, fontWeight:800 }}>⭐ SPECIALIST</div>}
            </div>
            <Card>
              <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:18, marginBottom:5 }}>{result.name}</div>
              <div style={{ color:"#64748b", fontSize:13, lineHeight:1.5, marginBottom:15 }}>{result.description}</div>
              {result.specialist_flag ? (
                <div style={{ background:"#f5f3ff", border:"1.5px solid #ddd6fe", borderRadius:12, padding:"16px", textAlign:"center" }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>⭐</div>
                  <div style={{ color:"#7c3aed", fontWeight:800, fontSize:14, marginBottom:4 }}>Specialist Valuation Required</div>
                  <div style={{ color:"#64748b", fontSize:12 }}>{result.specialist_reason||"This item requires a professional specialist valuation."}</div>
                </div>
              ) : (
                <div style={{ background:"linear-gradient(135deg,#f0f5ff,#e8f1f8)", border:"1.5px solid #1B3A6B22", borderRadius:16, padding:"20px", textAlign:"center" }}>
                  <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Estimated Replacement Value</div>
                  <div style={{ color:"#1B3A6B", fontWeight:900, fontSize:34, letterSpacing:"-0.5px", marginBottom:6 }}>{fmt(result.mid_value)}</div>
                  <div style={{ color:"#94a3b8", fontSize:12 }}>UK new replacement cost{quantity > 1 ? " · " + quantity + " items" : ""}</div>
                </div>
              )}
            </Card>
            {/* Override value on scan result */}
            {result && !result.specialist_flag && (
              <ScanOverride result={result} quantity={quantity} onOverride={(val)=>setResult(prev=>({...prev, mid_value:val, _overridden:true, _ai_value:prev._ai_value||prev.mid_value}))} />
            )}

            {/* Room selector if no target room, or add button if target room */}
            {targetRoom ? (
              <div style={{ display:"flex", gap:9 }}>
                <button onClick={()=>{setResult(null);setPreview(null);setImageB64(null);setItemName("");setQty(1);setError(null);}} style={{ flex:1, background:"white", border:"1.5px solid #e2e8f0", borderRadius:13, padding:"13px", color:"#1B3A6B", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  <SvgIcon name="camera" size={14} color="#1B3A6B" /> Scan Another
                </button>
                <button onClick={()=>handleAddToRoom(targetRoom.id, targetRoom.name)} style={{ flex:1, background:"linear-gradient(135deg,#4AABBF,#0891b2)", border:"none", borderRadius:13, padding:"13px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(74,171,191,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <SvgIcon name="home" size={14} color="white" /> Add to {targetRoom.name}
                </button>
              </div>
            ) : (
              <RoomSelectorAdd properties={properties} onAdd={handleAddToRoom} onScanAnother={()=>{setResult(null);setPreview(null);setImageB64(null);setItemName("");setQty(1);setError(null);}} />
            )}
          </div>
        )}
      </div>
      <BottomNav active="scanner" onNavigate={onNavigate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — REPORTS HUB
// ─────────────────────────────────────────────────────────────────────────────
function ReportsScreen({ properties, onViewReport, onNavigate }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom:80 }}>
      <AppHeader title="Reports" subtitle="Broker & Inventory Reports" right={<Logo size={36}/>} />
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 14px" }}>
        {properties.length===0 ? (
          <div style={{ textAlign:"center", padding:"44px 20px", background:"white", borderRadius:22, border:"1px solid #e8eef5" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
            <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:16, marginBottom:7 }}>No Properties Yet</div>
            <div style={{ color:"#94a3b8", fontSize:13 }}>Add a property to generate reports</div>
          </div>
        ) : properties.map(p => {
          const items = p.rooms.reduce((s,r)=>s+r.items.length,0);
          const contents = p.rooms.reduce((s,r)=>s+r.items.filter(i=>!i.specialist).reduce((rs,i)=>rs+i.value*i.qty,0),0);
          return (
            <Card key={p.id}>
              <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:15, marginBottom:3 }}>{p.name}</div>
              <div style={{ color:"#94a3b8", fontSize:12, marginBottom:12 }}>{p.address}</div>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <div style={{ background:"#f8fafc", borderRadius:10, padding:"8px 12px", flex:1 }}>
                  <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, textTransform:"uppercase" }}>Items</div>
                  <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:15 }}>{items}</div>
                </div>
                <div style={{ background:"#f8fafc", borderRadius:10, padding:"8px 12px", flex:1 }}>
                  <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, textTransform:"uppercase" }}>Est. Value</div>
                  <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:15 }}>{fmt(contents)}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <button onClick={()=>onViewReport("broker",p)} style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:13, padding:"13px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><SvgIcon name="broker" size={15} color="white"/> Broker Report</button>
                <button onClick={()=>onViewReport("inventory",p)} style={{ background:"linear-gradient(135deg,#4AABBF,#0891b2)", border:"none", borderRadius:13, padding:"13px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><SvgIcon name="inventory" size={15} color="white"/> Inventory</button>
              </div>
            </Card>
          );
        })}
      </div>
      <BottomNav active="reports" onNavigate={onNavigate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — REPORT VIEWER (Broker + Inventory)
// ─────────────────────────────────────────────────────────────────────────────
function ReportViewer({ type, property, onBack }) {
  const reportRef = `RW-${type==="broker"?"RPT":"INV"}-2026-${String(Math.floor(Math.random()*9000)+1000)}`;
  const date = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const allItems = property.rooms.flatMap(r=>r.items.map(i=>({...i,room:r.name,roomColor:r.color})));
  const totalContents = allItems.filter(i=>!i.specialist).reduce((s,i)=>s+(i.override_value||i.value)*i.qty,0);
  // Detect specialist items - either flagged by AI or matched by keyword
  const specialistItems = allItems.filter(i=>i.specialist || isSpecialistItem(i.name));
  // Detect missing key items per room
  const missingItemsAlerts = property.rooms
    .map(r => ({ room: r.name, missing: getMissingKeyItem(r.name, r.items) }))
    .filter(x => x.missing !== null);
  const pct = Math.min(100,Math.round((totalContents/property.recommendedContents)*100));
  const pc = progressColor(pct);
  const confColor2 = (s)=>s>=75?"#059669":s>=45?"#f59e0b":"#ef4444";
  const confLabel2 = (s)=>s>=75?"High":s>=45?"Med":"Low";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e8eef5", padding:"12px 18px", display:"flex", alignItems:"center", gap:11, position:"sticky", top:0, zIndex:20, boxShadow:"0 2px 10px rgba(27,58,107,0.06)" }}>
        <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", color:"#1B3A6B", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:15 }}>{type==="broker"?"Broker Report":"Inventory Report"}</div>
          <div style={{ color:"#94a3b8", fontSize:11 }}>Ref: {reportRef}</div>
        </div>
        <button onClick={()=>window.print()} style={{ background:"linear-gradient(135deg,#1B3A6B,#2563ab)", border:"none", borderRadius:11, padding:"9px 16px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><SvgIcon name="download" size={14} color="white"/> PDF</button>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 14px 60px" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#1B3A6B,#1e4d8c)", borderRadius:22, padding:"24px", marginBottom:14, boxShadow:"0 8px 28px rgba(27,58,107,0.2)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:150, height:150, borderRadius:"50%", background:"rgba(74,171,191,0.12)" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:18, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
              <Logo size={44} />
              <div><div style={{ color:"white", fontWeight:900, fontSize:17 }}>ROOM WORTH</div><div style={{ color:"rgba(74,171,191,0.9)", fontSize:12 }}>Contents Estimator</div></div>
              <div style={{ marginLeft:"auto", textAlign:"right" }}>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>{type==="broker"?"Broker Report":"Inventory"}</div>
                <div style={{ color:"white", fontWeight:800, fontSize:12, fontFamily:"monospace" }}>{reportRef}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginTop:2 }}>{date}</div>
              </div>
            </div>
            <div style={{ color:"white", fontWeight:800, fontSize:20, marginBottom:3 }}>{property.name}</div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginBottom:14 }}>{property.address}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
              {[{label:"Rebuild",value:fmt(property.rebuildValue),icon:"building"},{label:"Contents",value:fmt(totalContents),icon:"rooms"},{label:"Recommended",value:fmt(property.recommendedContents),icon:"report"},{label:"Coverage",value:`${pct}%`,icon:"list"}].map(({label,value,icon})=>(
                <div key={label} style={{ background:"rgba(255,255,255,0.1)", borderRadius:11, padding:"9px 5px", textAlign:"center" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}><SvgIcon name={icon} size={14} color="rgba(255,255,255,0.7)"/></div>
                  <div style={{ color:"white", fontWeight:800, fontSize:12 }}>{value}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:600, textTransform:"uppercase", marginTop:1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ color:"#1B3A6B", fontWeight:700, fontSize:13 }}>Contents Coverage</span>
            <span style={{ color:pc, fontWeight:800, fontSize:13 }}>{pct}% of recommended minimum</span>
          </div>
          <div style={{ background:"#e2e8f0", borderRadius:99, height:9, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:`linear-gradient(90deg,${pc}99,${pc})` }} />
          </div>
          {pct<100 && <div style={{ color:"#f59e0b", fontSize:12, fontWeight:600, marginTop:7 }}>⚠️ {fmt(property.recommendedContents-totalContents)} below recommended minimum</div>}
        </Card>

        {/* Specialist + Missing Items — Broker Report Only */}
        {type==="broker" && specialistItems.length>0 && (
          <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #ddd6fe", boxShadow:"0 2px 10px rgba(124,58,237,0.08)", marginBottom:14 }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", padding:"13px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>⭐</span>
              <div>
                <div style={{ color:"white", fontWeight:800, fontSize:14 }}>Specialist Items — Individual Valuation Required</div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>These items cannot be valued by AI and require a professional specialist</div>
              </div>
            </div>
            {specialistItems.map((item,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<specialistItems.length-1?"1px solid #f1f5f9":"none", background:"#faf5ff" }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0, border:"1px solid #ddd6fe" }} />}
                {!item.image && <div style={{ width:44, height:44, borderRadius:8, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⭐</div>}
                <div style={{ flex:1 }}>
                  <div style={{ color:"#4c1d95", fontWeight:700, fontSize:13 }}>{item.name}</div>
                  <div style={{ color:"#64748b", fontSize:11, marginTop:1 }}>{item.description}</div>
                  <div style={{ color:"#7c3aed", fontSize:11, marginTop:1 }}>Found in: {item.room}</div>
                </div>
                <div style={{ background:"#7c3aed", color:"white", borderRadius:8, padding:"4px 10px", fontSize:10, fontWeight:800, flexShrink:0 }}>SPECIALIST</div>
              </div>
            ))}
            <div style={{ background:"#f5f3ff", padding:"10px 16px", borderTop:"1px solid #ddd6fe" }}>
              <div style={{ color:"#6d28d9", fontSize:11, lineHeight:1.5 }}>⚠️ The estimated total above excludes these items. Please arrange specialist valuations before finalising your insurance schedule.</div>
            </div>
          </div>
        )}
        {type==="broker" && missingItemsAlerts.length>0 && (
          <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #fed7aa", boxShadow:"0 2px 10px rgba(234,88,12,0.08)", marginBottom:14 }}>
            <div style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)", padding:"13px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>📋</span>
              <div>
                <div style={{ color:"white", fontWeight:800, fontSize:14 }}>Possible Missing Key Items</div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>Common items not yet scanned in these rooms</div>
              </div>
            </div>
            {missingItemsAlerts.map((alert,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<missingItemsAlerts.length-1?"1px solid #fff7ed":"none", background:"#fff7ed" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:"#fed7aa", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏠</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#9a3412", fontWeight:700, fontSize:13 }}>{alert.room}</div>
                  <div style={{ color:"#c2410c", fontSize:11, marginTop:1 }}>No <strong>{alert.missing}</strong> scanned — please check if this item needs to be added</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {type==="broker" ? (
          /* BROKER: room by room */
          property.rooms.map(room=>{
            const roomTotal=room.items.filter(i=>!i.specialist).reduce((s,i)=>s+i.value*i.qty,0);
            if(room.items.length===0) return null;
            return (
              <div key={room.id} style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1px solid #e8eef5", boxShadow:"0 2px 10px rgba(27,58,107,0.06)", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 15px", background:"#f8fafc", borderBottom:"1px solid #e8eef5" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ color:room.color }}><RoomIcon type={room.type} size={20} /></div>
                    <span style={{ color:"#1B3A6B", fontWeight:800, fontSize:14 }}>{room.name}</span>
                  </div>
                  <span style={{ color:"#1B3A6B", fontWeight:900, fontSize:14 }}>{fmt(roomTotal)}</span>
                </div>
                {room.items.map((item,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 15px", borderBottom:i<room.items.length-1?"1px solid #f1f5f9":"none", background:item.specialist?"#fefce8":"white" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:confColor2(item.confidence), marginTop:4, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ color:"#1B3A6B", fontWeight:700, fontSize:12 }}>{item.name}</span>
                        {item.specialist && <span style={{ background:"#7c3aed", color:"white", fontSize:8, fontWeight:800, borderRadius:4, padding:"1px 5px" }}>SPEC</span>}
                        {item.qty>1 && <span style={{ color:"#94a3b8", fontSize:11 }}>×{item.qty}</span>}
                      </div>
                      <div style={{ color:"#94a3b8", fontSize:11, marginTop:1 }}>{item.description}</div>
                      <div style={{ color:"#64748b", fontSize:10, marginTop:1 }}>Confidence: {item.confidence}%</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ color:item.specialist?"#7c3aed":"#1B3A6B", fontWeight:800, fontSize:13 }}>{item.specialist?"Specialist":fmt((item.override_value||item.value)*item.qty)}</div>
                      {item.override_value && (
                        <div style={{ marginTop:4, background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:6, padding:"3px 6px", display:"inline-block" }}>
                          <div style={{ color:"#0369a1", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3px" }}>Client override</div>
                          <div style={{ color:"#64748b", fontSize:9 }}>AI: {fmt(item.value*item.qty)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          /* INVENTORY: table */
          <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1px solid #e8eef5", boxShadow:"0 2px 10px rgba(27,58,107,0.06)", marginBottom:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 50px 75px 65px", padding:"9px 14px", background:"#f8fafc", borderBottom:"2px solid #e8eef5" }}>
              {["Item","Room","Qty","Value","Conf."].map((h,i)=>(
                <div key={h} style={{ color:"#94a3b8", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", textAlign:i>=2?"center":"left" }}>{h}</div>
              ))}
            </div>
            {allItems.map((item,i)=>(
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 50px 75px 65px", padding:"11px 14px", alignItems:"center", borderBottom:i<allItems.length-1?"1px solid #f1f5f9":"none", background:item.specialist?"#fefce8":i%2===0?"white":"#fafbfc" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width:36, height:36, borderRadius:7, objectFit:"cover", flexShrink:0, border:"1px solid #e2e8f0" }} />}
                  {!item.image && <div style={{ width:36, height:36, borderRadius:7, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><SvgIcon name="rooms" size={16} color="#94a3b8"/></div>}
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ color:"#1B3A6B", fontWeight:700, fontSize:12 }}>{item.name}</span>
                      {item.specialist && <span style={{ background:"#7c3aed", color:"white", fontSize:8, fontWeight:800, borderRadius:4, padding:"1px 4px" }}>SPEC</span>}
                    </div>
                    <div style={{ color:"#94a3b8", fontSize:10, marginTop:1 }}>{item.description}</div>
                  </div>
                </div>
                <div><span style={{ background:`${item.roomColor}15`, color:item.roomColor, fontSize:9, fontWeight:700, borderRadius:5, padding:"2px 6px" }}>{item.room}</span></div>
                <div style={{ textAlign:"center", color:"#64748b", fontWeight:700, fontSize:12 }}>{item.qty}</div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ color:item.specialist?"#7c3aed":"#1B3A6B", fontWeight:800, fontSize:12 }}>{item.specialist?"Spec.":fmt((item.override_value||item.value)*item.qty)}</div>
                  {item.override_value && (
                    <div style={{ marginTop:3, background:"#f0f9ff", borderRadius:5, padding:"2px 5px", display:"inline-block" }}>
                      <div style={{ color:"#0369a1", fontSize:8, fontWeight:700 }}>Override</div>
                      <div style={{ color:"#94a3b8", fontSize:8 }}>AI: {fmt(item.value)}</div>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"center" }}><span style={{ background:`${confColor2(item.confidence)}15`, color:confColor2(item.confidence), fontSize:9, fontWeight:700, borderRadius:5, padding:"2px 5px" }}>{confLabel2(item.confidence)}</span></div>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 50px 75px 65px", padding:"11px 14px", background:"linear-gradient(135deg,#f0f5ff,#e8f1f8)", borderTop:"2px solid #e2e8f0", alignItems:"center" }}>
              <div style={{ color:"#1B3A6B", fontWeight:800, fontSize:12 }}>{allItems.length} items total</div>
              <div/><div style={{ textAlign:"center", color:"#1B3A6B", fontWeight:800, fontSize:12 }}>{allItems.reduce((s,i)=>s+i.qty,0)}</div>
              <div style={{ textAlign:"center", color:"#1B3A6B", fontWeight:900, fontSize:13 }}>{fmt(totalContents)}</div>
              <div/>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ color:"#1B3A6B", fontWeight:700, fontSize:12, marginBottom:4 }}>Important Disclaimer</div>
          <div style={{ color:"#64748b", fontSize:11, lineHeight:1.7 }}>This report has been generated using AI-assisted image analysis to provide estimated UK new replacement values. All valuations are estimates only and should be reviewed by a qualified insurance professional. Room Worth Limited accepts no liability for any under or over-insurance arising from the use of this report.</div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9, marginBottom:6 }}><Logo size={24}/><div style={{ color:"#1B3A6B", fontWeight:800, fontSize:13 }}>ROOM WORTH</div></div>
          <div style={{ color:"#94a3b8", fontSize:11, lineHeight:1.6 }}>hello@roomworth.co.uk · www.roomworth.co.uk<br/>Generated {date} · Ref: {reportRef}<br/>© {new Date().getFullYear()} Room Worth Limited</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 7 — ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────
function AccountScreen({ user, onLogout, onNavigate }) {
  const totalProps = 0;
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f5fb,#e8f1f8)", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom:80 }}>
      <AppHeader title="Account" subtitle="Your profile & settings" right={<Logo size={36}/>} />
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 14px" }}>
        <div style={{ background:"linear-gradient(135deg,#1B3A6B,#1e4d8c)", borderRadius:22, padding:"24px", marginBottom:16, textAlign:"center", boxShadow:"0 8px 28px rgba(27,58,107,0.2)" }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#4AABBF,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:26, fontWeight:800, margin:"0 auto 14px" }}>{user.firstName[0]}{user.lastName[0]}</div>
          <div style={{ color:"white", fontWeight:800, fontSize:20 }}>{user.firstName} {user.lastName}</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginTop:3 }}>{user.email||"james.davies@email.com"}</div>
          {user.broker && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", marginTop:12 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:user.broker.accent||"#4AABBF" }} />
              <span style={{ color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:600 }}>{user.broker.broker}</span>
            </div>
          )}
        </div>

        {[
          { icon:"bell",    label:"Notifications",       sub:"Manage your alerts" },
          { icon:"privacy", label:"Privacy & Security",  sub:"Password and data settings" },
          { icon:"help",    label:"Help & Support",      sub:"FAQs and contact us" },
          { icon:"terms",   label:"Terms & Privacy Policy", sub:"Legal information" },
        ].map(({icon,label,sub})=>(
          <div key={label} style={{ background:"white", borderRadius:16, padding:"14px 16px", marginBottom:9, border:"1px solid #e8eef5", boxShadow:"0 2px 8px rgba(27,58,107,0.05)", display:"flex", alignItems:"center", gap:13, cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#f0f5ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><SvgIcon name={icon} size={18} color="#1B3A6B"/></div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#1B3A6B", fontWeight:700, fontSize:14 }}>{label}</div>
              <div style={{ color:"#94a3b8", fontSize:12 }}>{sub}</div>
            </div>
            <SvgIcon name="chevron_r" size={16} color="#cbd5e1"/>
          </div>
        ))}

        <button onClick={onLogout} style={{ width:"100%", background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:16, padding:"15px", color:"#dc2626", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><SvgIcon name="signout" size={16} color="#dc2626"/> Sign Out</button>
        <div style={{ textAlign:"center", color:"#94a3b8", fontSize:11, marginTop:16 }}>Room Worth v1.0 · © {new Date().getFullYear()} Room Worth Limited</div>
      </div>
      <BottomNav active="account" onNavigate={onNavigate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP — NAVIGATION CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
export default function RoomWorthApp() {
  const [user, setUser]               = useState(null);
  const [screen, setScreen]           = useState("auth");
  const [properties, setProperties]   = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [scanTargetRoom, setScanTargetRoom] = useState(null);
  const [reportConfig, setReportConfig]     = useState(null);
  const [activeTab, setActiveTab]     = useState("properties");

  const handleLogin = (userData) => { setUser(userData); setScreen("properties"); setActiveTab("properties"); };
  const handleLogout = () => { setUser(null); setScreen("auth"); setProperties([]); setActiveProperty(null); };

  const handleViewProperty = (prop) => { setActiveProperty(prop); setScreen("rooms"); };

  const handleUpdateProperty = (updated) => {
    setProperties(prev => prev.map(p => p.id===updated.id ? updated : p));
    setActiveProperty(updated);
  };

  const handleScanItem = (room) => { setScanTargetRoom(room); setScreen("scanner"); };

  const handleItemScanned = (roomId, item) => {
    if (!activeProperty) return;
    const updatedRooms = activeProperty.rooms.map(r => r.id===roomId ? {...r, items:[...r.items, item]} : r);
    const updated = { ...activeProperty, rooms: updatedRooms, currentContents: updatedRooms.reduce((s,r)=>s+r.items.filter(i=>!i.specialist).reduce((rs,i)=>rs+i.value*i.qty,0),0) };
    handleUpdateProperty(updated);
  };

  const handleViewReport = (type, prop) => { setReportConfig({type, property:prop}); setScreen("report"); };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab==="properties") setScreen("properties");
    else if (tab==="scanner") { setScanTargetRoom(null); setScreen("scanner"); }
    else if (tab==="reports") setScreen("reports");
    else if (tab==="account") setScreen("account");
  };

  const handleBack = () => {
    if (screen==="rooms")   { setScreen("properties"); setActiveTab("properties"); }
    if (screen==="scanner") { screen==="rooms" ? setScreen("rooms") : activeProperty ? setScreen("rooms") : setScreen("properties"); }
    if (screen==="report")  { setScreen(activeProperty?"rooms":"reports"); }
    if (screen==="reports") { setScreen("properties"); setActiveTab("properties"); }
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
      {screen==="auth"       && <AuthScreen onLogin={handleLogin} />}
      {screen==="properties" && user && <PropertiesScreen user={user} properties={properties} setProperties={setProperties} onViewProperty={handleViewProperty} onNavigate={handleNavigate} />}
      {screen==="rooms"      && activeProperty && <RoomsScreen property={activeProperty} onUpdateProperty={handleUpdateProperty} onBack={()=>setScreen("properties")} onScanItem={handleScanItem} onViewReport={handleViewReport} onNavigate={handleNavigate} />}
      {screen==="scanner"    && <ScannerScreen user={user} targetRoom={scanTargetRoom} properties={properties} onBack={()=>activeProperty?setScreen("rooms"):setScreen("properties")} onItemScanned={handleItemScanned} onNavigate={handleNavigate} />}
      {screen==="reports"    && <ReportsScreen properties={properties} onViewReport={handleViewReport} onNavigate={handleNavigate} />}
      {screen==="report"     && reportConfig && <ReportViewer type={reportConfig.type} property={properties.find(p=>p.id===reportConfig.property.id)||activeProperty||reportConfig.property} onBack={()=>setScreen(activeProperty?"rooms":"reports")} />}
      {screen==="account"    && <AccountScreen user={user} onLogout={handleLogout} onNavigate={handleNavigate} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        input::placeholder,textarea::placeholder{color:#94a3b8}
        input:focus,textarea:focus{border-color:#4AABBF!important;box-shadow:0 0 0 3px rgba(74,171,191,0.12)!important;outline:none}
        button:active{transform:scale(0.97)}
        *{-webkit-tap-highlight-color:transparent}
        textarea{font-family:inherit}
        @media print{.no-print{display:none!important}}
      `}</style>
    </div>
  );
}