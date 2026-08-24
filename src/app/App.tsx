import { useState, useCallback, useRef, useEffect } from "react";
import {
  LayoutDashboard, Upload, Eye, FileText, Settings, Menu, X,
  Bell, ChevronRight, TrendingUp, TrendingDown, Activity,
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, Download,
  LogOut, User, Search, Filter, Plus, Layers, Cpu,
  Shield, Clock, BarChart2, RefreshCw, Send
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { toast, Toaster } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "login" | "dashboard" | "upload" | "review" | "reports" | "settings";
type ReviewStatus = "unreviewed" | "verified" | "rejected" | "uncertain";
type DetectionClass = "Mine" | "Cable" | "UXO" | "Wreck" | "Unknown";

interface Detection {
  id: string;
  class: DetectionClass;
  confidence: number;
  depth: number;
  lat: number;
  lon: number;
  x: number; y: number; w: number; h: number;
  status: ReviewStatus;
  comment?: string;
}

interface Job {
  id: string;
  mission: string;
  location: string;
  lat: number; lon: number;
  depth: number;
  sonarType: string;
  operator: string;
  date: string;
  status: "processing" | "ready" | "reviewed" | "exported";
  detections: Detection[];
  filename: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-2024-0892", mission: "Gulf Survey Alpha", location: "Gulf of Mexico",
    lat: 28.31, lon: -89.12, depth: 184, sonarType: "Klein 5000", operator: "M. Okonkwo",
    date: "2024-11-14", status: "ready", filename: "gulf_alpha_pass3.tiff",
    detections: [
      { id: "D001", class: "Mine", confidence: 0.94, depth: 184, lat: 28.311, lon: -89.119, x: 112, y: 88, w: 44, h: 38, status: "unreviewed" },
      { id: "D002", class: "Cable", confidence: 0.87, depth: 182, lat: 28.312, lon: -89.121, x: 220, y: 155, w: 80, h: 14, status: "verified" },
      { id: "D003", class: "Unknown", confidence: 0.61, depth: 185, lat: 28.309, lon: -89.118, x: 340, y: 210, w: 36, h: 36, status: "uncertain" },
      { id: "D004", class: "UXO", confidence: 0.78, depth: 183, lat: 28.314, lon: -89.123, x: 460, y: 80, w: 28, h: 52, status: "unreviewed" },
      { id: "D005", class: "Wreck", confidence: 0.92, depth: 186, lat: 28.308, lon: -89.116, x: 88, y: 290, w: 120, h: 68, status: "rejected" },
    ],
  },
  {
    id: "JOB-2024-0891", mission: "North Sea Inspection", location: "North Sea",
    lat: 57.84, lon: 2.31, depth: 94, sonarType: "EdgeTech 4200", operator: "L. Svensson",
    date: "2024-11-13", status: "reviewed", filename: "north_sea_route7.png",
    detections: [
      { id: "D006", class: "Cable", confidence: 0.96, depth: 93, lat: 57.841, lon: 2.312, x: 150, y: 120, w: 120, h: 12, status: "verified" },
      { id: "D007", class: "Unknown", confidence: 0.55, depth: 95, lat: 57.839, lon: 2.308, x: 300, y: 200, w: 32, h: 32, status: "verified" },
      { id: "D008", class: "Mine", confidence: 0.71, depth: 94, lat: 57.843, lon: 2.315, x: 420, y: 160, w: 38, h: 38, status: "rejected" },
    ],
  },
  {
    id: "JOB-2024-0890", mission: "Baltic Corridor B2", location: "Baltic Sea",
    lat: 55.12, lon: 18.44, depth: 62, sonarType: "Imagenex 837B", operator: "A. Petrov",
    date: "2024-11-12", status: "exported", filename: "baltic_b2_final.tiff",
    detections: [
      { id: "D009", class: "UXO", confidence: 0.89, depth: 61, lat: 55.121, lon: 18.441, x: 200, y: 100, w: 30, h: 55, status: "verified" },
      { id: "D010", class: "Wreck", confidence: 0.95, depth: 63, lat: 55.119, lon: 18.439, x: 330, y: 220, w: 100, h: 60, status: "verified" },
      { id: "D011", class: "Cable", confidence: 0.82, depth: 62, lat: 55.123, lon: 18.443, x: 100, y: 280, w: 90, h: 10, status: "verified" },
      { id: "D012", class: "Unknown", confidence: 0.49, depth: 64, lat: 55.117, lon: 18.437, x: 440, y: 310, w: 28, h: 28, status: "rejected" },
    ],
  },
  {
    id: "JOB-2024-0889", mission: "Adriatic Sweep S4", location: "Adriatic Sea",
    lat: 42.65, lon: 16.22, depth: 145, sonarType: "Tritech StarFish", operator: "F. Romano",
    date: "2024-11-10", status: "processing", filename: "adriatic_s4_raw.png",
    detections: [],
  },
  {
    id: "JOB-2024-0888", mission: "South China Grid", location: "South China Sea",
    lat: 11.34, lon: 114.22, depth: 312, sonarType: "Klein 5000", operator: "W. Chen",
    date: "2024-11-08", status: "ready", filename: "scs_grid_p9.tiff",
    detections: [
      { id: "D013", class: "Wreck", confidence: 0.97, depth: 310, lat: 11.341, lon: 114.221, x: 180, y: 90, w: 140, h: 80, status: "unreviewed" },
      { id: "D014", class: "Mine", confidence: 0.83, depth: 312, lat: 11.339, lon: 114.219, x: 360, y: 180, w: 40, h: 40, status: "unreviewed" },
      { id: "D015", class: "Unknown", confidence: 0.67, depth: 314, lat: 11.343, lon: 114.223, x: 490, y: 260, w: 34, h: 34, status: "unreviewed" },
    ],
  },
];

const TREND_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2024-10-15");
  d.setDate(d.getDate() + i);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    detections: [14, 9, 18, 12, 7, 22, 16, 11, 19, 8, 24, 13, 17, 6, 21, 15, 10, 23, 14, 9, 18, 12, 20, 7, 16, 11, 25, 13, 19, 15][i],
    anomalies: [4, 2, 6, 3, 1, 7, 5, 3, 6, 2, 8, 4, 5, 2, 7, 4, 3, 7, 4, 2, 6, 3, 7, 2, 5, 3, 8, 4, 6, 5][i],
  };
});

const CLASS_DATA = [
  { class: "Mine", count: 6 },
  { class: "Cable", count: 9 },
  { class: "UXO", count: 4 },
  { class: "Wreck", count: 5 },
  { class: "Unknown", count: 7 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  unreviewed: "text-[#6a9db5] border-[#6a9db5]/40 bg-[#6a9db5]/10",
  verified: "text-[#00e5c4] border-[#00e5c4]/40 bg-[#00e5c4]/10",
  rejected: "text-[#ff3b3b] border-[#ff3b3b]/40 bg-[#ff3b3b]/10",
  uncertain: "text-[#ff8c00] border-[#ff8c00]/40 bg-[#ff8c00]/10",
  processing: "text-[#ff8c00] border-[#ff8c00]/40 bg-[#ff8c00]/10",
  ready: "text-[#00e5c4] border-[#00e5c4]/40 bg-[#00e5c4]/10",
  reviewed: "text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10",
  exported: "text-[#6a9db5] border-[#6a9db5]/40 bg-[#6a9db5]/10",
};

const CLASS_COLOR: Record<DetectionClass, string> = {
  Mine: "#ff3b3b",
  Cable: "#00e5c4",
  UXO: "#ff8c00",
  Wreck: "#a855f7",
  Unknown: "#6a9db5",
};

const CLASS_BAR_COLOR: Record<string, string> = {
  Mine: "#ff3b3b", Cable: "#00e5c4", UXO: "#ff8c00", Wreck: "#a855f7", Unknown: "#6a9db5",
};

function Badge({ label }: { label: string }) {
  const statusKey = label.toLowerCase();
  const colorMap: Record<string, { color: string; bg: string; border: string }> = {
    unreviewed: { color: "var(--sx-cyan)", bg: "rgba(103, 232, 249, 0.1)", border: "rgba(103, 232, 249, 0.3)" },
    verified: { color: "var(--sx-teal)", bg: "rgba(45, 212, 191, 0.1)", border: "rgba(45, 212, 191, 0.3)" },
    rejected: { color: "var(--sx-red)", bg: "rgba(232, 97, 90, 0.1)", border: "rgba(232, 97, 90, 0.3)" },
    uncertain: { color: "var(--sx-amber)", bg: "rgba(240, 180, 41, 0.1)", border: "rgba(240, 180, 41, 0.3)" },
    processing: { color: "var(--sx-amber)", bg: "rgba(240, 180, 41, 0.1)", border: "rgba(240, 180, 41, 0.3)" },
    ready: { color: "var(--sx-teal)", bg: "rgba(45, 212, 191, 0.1)", border: "rgba(45, 212, 191, 0.3)" },
    reviewed: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)" },
    exported: { color: "var(--sx-muted)", bg: "rgba(125, 151, 168, 0.1)", border: "rgba(125, 151, 168, 0.3)" },
  };
  const style = colorMap[statusKey] ?? { color: "var(--sx-text)", bg: "rgba(13, 36, 52, 0.5)", border: "var(--sx-border)" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 border text-[10px] font-mono uppercase tracking-widest rounded-[1px] transition-all hover:border-opacity-100"
      style={{
        color: style.color,
        backgroundColor: style.bg,
        borderColor: style.border,
      }}>
      {label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#00e5c4" : pct >= 60 ? "#ff8c00" : "#ff3b3b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-background">
        <div style={{ width: `${pct}%`, background: color }} className="h-1 transition-all duration-300" />
      </div>
      <span className="font-mono text-xs tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ─── Sonar Viewer ─────────────────────────────────────────────────────────────

function SonarViewer({ detections, selectedId, onSelect }: {
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const W = 620; const H = 380;
  const patches = [
    { cx: 55, cy: 42, rx: 48, ry: 18, op: 0.07 },
    { cx: 180, cy: 310, rx: 62, ry: 22, op: 0.06 },
    { cx: 280, cy: 90, rx: 35, ry: 14, op: 0.09 },
    { cx: 420, cy: 180, rx: 55, ry: 20, op: 0.05 },
    { cx: 530, cy: 330, rx: 44, ry: 16, op: 0.08 },
    { cx: 100, cy: 200, rx: 30, ry: 12, op: 0.06 },
    { cx: 370, cy: 50, rx: 40, ry: 15, op: 0.07 },
    { cx: 490, cy: 130, rx: 28, ry: 11, op: 0.09 },
    { cx: 60, cy: 340, rx: 50, ry: 19, op: 0.05 },
    { cx: 240, cy: 260, rx: 38, ry: 14, op: 0.08 },
  ];

  return (
    <div className="relative w-full bg-black border border-border overflow-hidden" style={{ aspectRatio: "620/380" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sgBase" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1c2e2e" />
            <stop offset="60%" stopColor="#0d1c1c" />
            <stop offset="100%" stopColor="#050e0e" />
          </radialGradient>
          <linearGradient id="portSwath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#101e1e" />
            <stop offset="80%" stopColor="#0d1a1a" />
            <stop offset="100%" stopColor="#1a2e2e" />
          </linearGradient>
          <linearGradient id="stbdSwath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a2e2e" />
            <stop offset="20%" stopColor="#0d1a1a" />
            <stop offset="100%" stopColor="#081212" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#sgBase)" />
        <rect x={0} y={0} width={W / 2} height={H} fill="url(#portSwath)" opacity={0.8} />
        <rect x={W / 2} y={0} width={W / 2} height={H} fill="url(#stbdSwath)" opacity={0.8} />

        {/* Texture */}
        {patches.map((p, i) => (
          <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#b0d0c8" opacity={p.op} />
        ))}

        {/* Horizontal scan lines */}
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={0} y1={i * (H / 24)} x2={W} y2={i * (H / 24)}
            stroke="#00e5c4" strokeWidth={0.25} opacity={0.05} />
        ))}

        {/* Nadir shadow */}
        <rect x={W / 2 - 6} y={0} width={12} height={H} fill="#050e0e" opacity={0.6} />
        {/* Nadir line */}
        <rect x={W / 2 - 1} y={0} width={2} height={H} fill="#00e5c4" opacity={0.2} />

        {/* Range markers */}
        {[70, 150, 230, 305].map((r, i) => (
          <g key={i}>
            <line x1={W / 2 - r} y1={0} x2={W / 2 - r} y2={H}
              stroke="#00e5c4" strokeWidth={0.5} strokeDasharray="3 9" opacity={0.1} />
            <line x1={W / 2 + r} y1={0} x2={W / 2 + r} y2={H}
              stroke="#00e5c4" strokeWidth={0.5} strokeDasharray="3 9" opacity={0.1} />
            <text x={W / 2 + r + 3} y={12} fontSize={7} fill="#00e5c4" opacity={0.3}
              fontFamily="JetBrains Mono, monospace">{(r / 305 * 250).toFixed(0)}m</text>
          </g>
        ))}

        {/* Detections */}
        {detections.map((d) => {
          const color = CLASS_COLOR[d.class];
          const sel = d.id === selectedId;
          return (
            <g key={d.id} onClick={() => onSelect(d.id)} style={{ cursor: "pointer" }}>
              <rect x={d.x} y={d.y} width={d.w} height={d.h}
                fill={color} fillOpacity={sel ? 0.22 : 0.08}
                stroke={color} strokeWidth={sel ? 1.8 : 1}
                strokeDasharray={d.status === "unreviewed" ? "4 3" : undefined} />
              {/* Label bg */}
              <rect x={d.x} y={d.y - 15} width={d.class.length * 6.5 + 26} height={14}
                fill={color} opacity={0.88} />
              <text x={d.x + 4} y={d.y - 4} fontSize={7.5} fill="#050a0e"
                fontFamily="JetBrains Mono, monospace" fontWeight="700">
                {d.class.toUpperCase()} · {Math.round(d.confidence * 100)}%
              </text>
              {/* Corner brackets when selected */}
              {sel && (
                <>
                  {[
                    [d.x, d.y, d.x + 10, d.y], [d.x, d.y, d.x, d.y + 10],
                    [d.x + d.w - 10, d.y, d.x + d.w, d.y], [d.x + d.w, d.y, d.x + d.w, d.y + 10],
                    [d.x, d.y + d.h - 10, d.x, d.y + d.h], [d.x, d.y + d.h, d.x + 10, d.y + d.h],
                    [d.x + d.w - 10, d.y + d.h, d.x + d.w, d.y + d.h], [d.x + d.w, d.y + d.h - 10, d.x + d.w, d.y + d.h],
                  ].map(([x1, y1, x2, y2], i2) => (
                    <line key={i2} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
                  ))}
                </>
              )}
            </g>
          );
        })}

        {/* HUD */}
        <text x={8} y={15} fontSize={8} fill="#00e5c4" opacity={0.4} fontFamily="JetBrains Mono, monospace">
          SONARIX · SSS · 100kHz / 500kHz
        </text>
        <text x={8} y={H - 6} fontSize={7} fill="#6a9db5" opacity={0.5} fontFamily="JetBrains Mono, monospace">
          PORT ← NADIR → STBD
        </text>
        <text x={W - 8} y={H - 6} fontSize={7} fill="#6a9db5" opacity={0.5}
          fontFamily="JetBrains Mono, monospace" textAnchor="end">
          SWATH: 250m
        </text>
      </svg>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const PAGE_LABELS: Record<Page, string> = {
  login: "Login", dashboard: "Dashboard", upload: "Upload",
  review: "Detection Review", reports: "Reports", settings: "Settings",
};

function Navbar({ page, onMenuToggle }: { page: Page; onMenuToggle: () => void }) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0 z-30">
      <button onClick={onMenuToggle}
        className="lg:hidden p-1.5 text-muted-foreground hover:text-primary transition-colors">
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 bg-primary flex items-center justify-center">
          <Activity size={14} className="text-background" />
        </div>
        <span className="font-mono font-bold text-sm text-primary tracking-widest uppercase">SONARIX</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
        <ChevronRight size={13} />
        <span className="font-mono text-xs text-foreground/60">{PAGE_LABELS[page]}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-1.5 text-muted-foreground hover:text-primary transition-colors">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ff3b3b] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 bg-secondary border border-border flex items-center justify-center">
            <User size={13} className="text-muted-foreground" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-foreground leading-none">M. Okonkwo</div>
            <div className="text-[10px] font-mono text-muted-foreground leading-none mt-0.5">Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { page: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { page: "upload" as Page, label: "Upload", icon: Upload },
  { page: "review" as Page, label: "Review", icon: Eye },
  { page: "reports" as Page, label: "Reports", icon: FileText },
  { page: "settings" as Page, label: "Settings", icon: Settings },
];

function Sidebar({ currentPage, onNavigate, isOpen, onClose }: {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:static top-0 left-0 h-full w-56 bg-background border-r border-border
        flex flex-col z-50 transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Activity size={11} className="text-background" />
            </div>
            <span className="font-mono font-bold text-xs text-primary tracking-widest uppercase">SONARIX</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page;
            return (
              <button key={page}
                onClick={() => { onNavigate(page); onClose(); }}
                style={{
                  borderLeftColor: active ? "var(--sx-teal)" : "transparent",
                  backgroundColor: active ? "rgba(45, 212, 191, 0.05)" : "transparent",
                  color: active ? "var(--sx-teal)" : "var(--sx-muted)",
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all border-l-2 hover:bg-secondary/30`}>
                <Icon size={15} />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">v0.9.4-beta · secure</div>
          <button className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("analyst@sonarix.io");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("All fields required."); return; }
    setLoading(true); setError("");
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div style={{
      background: "radial-gradient(ellipse 120% 90% at 50% -10%, #0c2436 0%, #040a12 55%), #040a12",
      color: "#e7f2f4",
      fontFamily: "'Inter', sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Grid Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(to right, rgba(103,232,249,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(103,232,249,0.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 20%, transparent 75%)",
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }} />

      {/* Depth Rails */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 18,
        bottom: 0,
        width: 64,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 0",
        pointerEvents: "none",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.5px",
        color: "#4d6373",
      }}>
        {["0M", "250M", "500M", "750M", "1000M"].map((label, i) => (
          <span key={i} style={{ opacity: 0.75, position: "relative", display: "block" }}>
            {label}
            <div style={{
              content: '""',
              position: "absolute",
              top: "50%",
              right: "-16px",
              width: "10px",
              height: "1px",
              background: "#4d6373",
              opacity: 0.5,
            }} />
          </span>
        ))}
      </div>

      <div style={{
        position: "absolute",
        top: 0,
        right: 18,
        bottom: 0,
        width: 64,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 0",
        pointerEvents: "none",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.5px",
        color: "#4d6373",
        textAlign: "right",
      }}>
        {["N 12°04'", "W 61°37'", "SCAN 04", "RNG 500M", "ARRAY OK"].map((label, i) => (
          <span key={i} style={{ opacity: 0.75, position: "relative", display: "block" }}>
            {label}
            <div style={{
              content: '""',
              position: "absolute",
              top: "50%",
              left: "-16px",
              width: "10px",
              height: "1px",
              background: "#4d6373",
              opacity: 0.5,
            }} />
          </span>
        ))}
      </div>

      {/* Sonar Sweep */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: "900px",
        height: "900px",
        pointerEvents: "none",
        opacity: 0.55,
      }}>
        <svg viewBox="0 0 900 900" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <linearGradient id="sweepGrad" x1="450" y1="450" x2="900" y2="450" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
            <clipPath id="sweepClip">
              <circle cx="450" cy="450" r="420" />
            </clipPath>
          </defs>
          <circle cx="450" cy="450" r="120" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.35" />
          <circle cx="450" cy="450" r="220" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.28" />
          <circle cx="450" cy="450" r="320" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.20" />
          <circle cx="450" cy="450" r="420" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.12" />
          <g style={{ transformOrigin: "450px 450px", animation: "rotate 6s linear infinite" }}>
            <g clipPath="url(#sweepClip)">
              <path d="M450,450 L450,30 A420,420 0 0,1 597,79 Z" fill="url(#sweepGrad)" />
            </g>
            <line x1="450" y1="450" x2="450" y2="30" stroke="#67e8f9" strokeWidth="1.5" opacity="0.8" />
          </g>
          <circle cx="610" cy="340" r="4" fill="#f0b429" style={{ animation: "blip-pulse 3.4s ease-in-out infinite 0.2s" }} />
          <circle cx="320" cy="560" r="3.5" fill="#2dd4bf" style={{ animation: "blip-pulse 3.4s ease-in-out infinite 1.6s" }} />
          <circle cx="560" cy="600" r="3" fill="#67e8f9" style={{ animation: "blip-pulse 3.4s ease-in-out infinite 2.8s" }} />
          <circle cx="290" cy="330" r="3" fill="#2dd4bf" style={{ animation: "blip-pulse 3.4s ease-in-out infinite 4s" }} />
        </svg>
      </div>

      <style>{`
        @keyframes rotate { to { transform: rotate(360deg); } }
        @keyframes blip-pulse {
          0%, 100% { opacity: 0; }
          8% { opacity: 1; }
          28% { opacity: 0.15; }
          45% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* Stage / Card Container */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "404px",
        padding: "0 20px",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "34px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "10px",
          }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "26px", height: "26px", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10.5" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.5" />
              <circle cx="12" cy="12" r="6.5" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.75" />
              <circle cx="12" cy="12" r="1.8" fill="#67e8f9" />
              <line x1="12" y1="12" x2="12" y2="2" stroke="#67e8f9" strokeWidth="1.2" />
            </svg>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              fontSize: "24px",
              letterSpacing: "4px",
              color: "#e7f2f4",
            }}>
              SONAR<span style={{ color: "#2dd4bf" }}>IX</span>
            </span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "1.6px",
            color: "#7d97a8",
            textTransform: "uppercase",
            marginTop: "9px",
          }}>
            Sonar Navigation &amp; Recovery Intelligence eXplorer
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            marginTop: "14px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "1px",
            color: "#1d9e88",
            textTransform: "uppercase",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#2dd4bf",
              boxShadow: "0 0 6px 1px #2dd4bf",
              animation: "dot-pulse 2s ease-in-out infinite",
            }} />
            Array online — awaiting operator
          </div>
        </div>

        {/* Panel */}
        <div style={{
          background: "linear-gradient(180deg, #0b1f30 0%, #081826 100%)",
          border: "1px solid rgba(45,212,191,0.16)",
          borderRadius: "3px",
          padding: "32px 30px 28px",
          position: "relative",
        }}>
          <div style={{
            content: '""',
            position: "absolute",
            top: "-1px",
            left: "-1px",
            right: "-1px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #2dd4bf, transparent)",
            opacity: 0.7,
          }} />

          {/* Corners */}
          {[
            { top: 8, left: 8, borderRight: "none", borderBottom: "none" },
            { top: 8, right: 8, borderLeft: "none", borderBottom: "none" },
            { bottom: 8, left: 8, borderRight: "none", borderTop: "none" },
            { bottom: 8, right: 8, borderLeft: "none", borderTop: "none" },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "14px",
                height: "14px",
                border: "1px solid rgba(45,212,191,0.32)",
                ...pos,
              } as any}
            />
          ))}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "19px" }}>
              <label style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10.5px",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "#7d97a8",
                marginBottom: "8px",
              }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="you@fleet.org"
                  style={{
                    width: "100%",
                    background: "#0d2434",
                    border: "1px solid rgba(45,212,191,0.16)",
                    borderRadius: "2px",
                    padding: "12px 40px 12px 13px",
                    color: "#e7f2f4",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color .15s ease, box-shadow .15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2dd4bf";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,212,191,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(45,212,191,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    color: "#4d6373",
                    pointerEvents: "none",
                  }}
                >
                  <path d="M3 6l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "19px" }}>
              <label style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10.5px",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "#7d97a8",
                marginBottom: "8px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  style={{
                    width: "100%",
                    background: "#0d2434",
                    border: "1px solid rgba(45,212,191,0.16)",
                    borderRadius: "2px",
                    padding: "12px 40px 12px 13px",
                    color: "#e7f2f4",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color .15s ease, box-shadow .15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2dd4bf";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,212,191,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(45,212,191,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    color: "#4d6373",
                    pointerEvents: "none",
                  }}
                >
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "2px 0 22px",
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    accentColor: "#2dd4bf",
                    width: "14px",
                    height: "14px",
                  }}
                />
                <span style={{ fontSize: "12.5px", color: "#7d97a8" }}>
                  Remember this device
                </span>
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: "12.5px",
                  color: "#1d9e88",
                  textDecoration: "none",
                  borderBottom: "1px solid transparent",
                  cursor: "pointer",
                  transition: "color .15s ease, border-bottom-color .15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#2dd4bf";
                  e.currentTarget.style.borderBottomColor = "#2dd4bf";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1d9e88";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <p style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#e8615a",
                marginBottom: "12px",
              }}>
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12.5px",
                border: "1px solid #2dd4bf",
                background: loading ? "rgba(45,212,191,0.06)" : "rgba(45,212,191,0.08)",
                color: "#2dd4bf",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                borderRadius: "2px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                transition: "background .15s ease, color .15s ease",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#2dd4bf";
                  e.currentTarget.style.color = "#081826";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(45,212,191,0.08)";
                  e.currentTarget.style.color = "#2dd4bf";
                }
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Authenticating…
                </>
              ) : (
                <>
                  Access console
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "22px 0 18px",
              color: "#4d6373",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(45,212,191,0.16)" }} />
              Or
              <div style={{ flex: 1, height: "1px", background: "rgba(45,212,191,0.16)" }} />
            </div>

            <div style={{ textAlign: "center", fontSize: "12.5px", color: "#7d97a8" }}>
              Cleared for a new fleet?{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: "#1d9e88",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1d9e88")}
              >
                Request access
              </a>
            </div>
          </form>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "22px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          letterSpacing: "1.2px",
          color: "#4d6373",
          textTransform: "uppercase",
        }}>
          SONARIX v2.4 — Secure oceanic uplink
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, delta, deltaUp, color = "#00e5c4" }: {
  icon: React.ElementType; label: string; value: string;
  delta?: string; deltaUp?: boolean; color?: string;
}) {
  return (
    <div className="sonarix-panel p-4 flex flex-col gap-3 relative"
      style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 border border-opacity-40 flex items-center justify-center transition-all hover:border-opacity-100"
          style={{ borderColor: `${color}99`, backgroundColor: `${color}15` }}>
          <Icon size={14} style={{ color, strokeWidth: 1.6 }} />
        </div>
      </div>
      <div className="font-mono font-bold text-2xl text-foreground tabular-nums leading-none">{value}</div>
      {delta && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {deltaUp
            ? <TrendingUp size={10} className="text-[#00e5c4]" />
            : <TrendingDown size={10} className="text-[#ff3b3b]" />}
          <span className={deltaUp ? "text-[#00e5c4]" : "text-[#ff3b3b]"}>{delta}</span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1a1a] border border-border px-3 py-2 text-[11px] font-mono">
      <div className="text-muted-foreground mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2" style={{ color: p.color }}>
          <span>{p.name}:</span><span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function DashboardPage({ jobs, onNavigate }: { jobs: Job[]; onNavigate: (p: Page, id?: string) => void }) {
  const totalDetections = jobs.reduce((s, j) => s + j.detections.length, 0);
  const anomalies = jobs.reduce((s, j) => s + j.detections.filter(d => d.class === "Mine" || d.class === "UXO").length, 0);
  const pending = jobs.reduce((s, j) => s + j.detections.filter(d => d.status === "unreviewed").length, 0);
  const activeJobs = jobs.filter(j => j.status === "processing" || j.status === "ready").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Layers} label="Total Uploads" value={String(jobs.length)} delta="+2 jobs" deltaUp />
        <StatCard icon={Cpu} label="Active Jobs" value={String(activeJobs)} color="#ff8c00" />
        <StatCard icon={BarChart2} label="Detections" value={String(totalDetections)} delta="+12 today" deltaUp />
        <StatCard icon={AlertTriangle} label="Anomalies" value={String(anomalies)} color="#ff3b3b" delta="+3" deltaUp={false} />
        <StatCard icon={Clock} label="Pending Review" value={String(pending)} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 sonarix-panel primary-panel p-4">
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">Detection Trend · 30 Days</h3>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground"><span><i className="inline-block w-2 h-2 mr-1 bg-primary" />Detections</span><span><i className="inline-block w-2 h-2 mr-1" style={{ background: "var(--sx-red)" }} />Anomalies</span></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5c4" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#00e5c4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,196,0.07)" />
              <XAxis dataKey="date" label={{ value: "Survey date", position: "insideBottom", offset: -2, fill: "#7d97a8", fontSize: 9, fontFamily: "JetBrains Mono" }} tick={{ fill: "#6a9db5", fontSize: 9, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false} interval={7} />
              <YAxis label={{ value: "detections", angle: -90, position: "insideLeft", fill: "#7d97a8", fontSize: 9, fontFamily: "JetBrains Mono" }} tick={{ fill: "#6a9db5", fontSize: 9, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="detections" name="Detections" stroke="#00e5c4" strokeWidth={1.5}
                fill="url(#dGrad)" dot={false} activeDot={{ r: 3, fill: "#00e5c4" }} />
              <Area type="monotone" dataKey="anomalies" name="Anomalies" stroke="#ff3b3b" strokeWidth={1.5}
                fill="url(#aGrad)" dot={false} activeDot={{ r: 3, fill: "#ff3b3b" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sonarix-panel p-4"
          style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">By Class</h3>
            <div className="flex gap-4 text-[10px] font-mono">
              {Object.entries(CLASS_BAR_COLOR).map(([cls, col]) => (
                <div key={cls} className="flex items-center gap-1.5">
                  <div className="w-2 h-2" style={{ backgroundColor: col }} />
                  <span className="text-muted-foreground">{cls}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CLASS_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,196,0.07)" horizontal={true} vertical={false} />
              <XAxis dataKey="class" tick={{ fill: "#6a9db5", fontSize: 9, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6a9db5", fontSize: 9, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Count" radius={[2, 2, 0, 0]}>
                {CLASS_DATA.map((entry, i) => (
                  <Cell key={i} fill={CLASS_BAR_COLOR[entry.class] ?? "#00e5c4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="sonarix-panel primary-panel">
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-wrap gap-2">
          <h3 className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">Recent Jobs</h3>
          <div className="flex gap-2">
            <button onClick={() => onNavigate("upload")}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 bg-primary/10 border border-primary/30
                text-primary hover:bg-primary/20 transition-colors">
              <Plus size={11} /> New Upload
            </button>
            <button onClick={() => onNavigate("reports")}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border border-border
                text-muted-foreground hover:text-foreground transition-colors">
              <FileText size={11} /> Reports
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["Job ID", "Mission", "Location", "Date", "Detections", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-muted-foreground/50 uppercase tracking-widest font-normal text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-border/40 hover:bg-background/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary text-[11px]">{job.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{job.mission}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{job.location}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{job.date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{job.detections.length}</td>
                  <td className="px-4 py-3"><Badge label={job.status} /></td>
                  <td className="px-4 py-3">
                    {(job.status === "ready" || job.status === "reviewed") && (
                      <button onClick={() => onNavigate("review", job.id)}
                        className="flex items-center gap-1 text-[11px] font-mono text-primary hover:text-primary/70 transition-colors">
                        <Eye size={11} /> Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Page ──────────────────────────────────────────────────────────────

function UploadPage({ onNavigate, onJobCreated }: {
  onNavigate: (p: Page, id?: string) => void;
  onJobCreated: (job: Job) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ mission: "", lat: "", lon: "", depth: "", sonarType: "Klein 5000", operator: "", notes: "" });

  const ALLOWED = [".png", ".jpg", ".jpeg", ".tiff", ".tif"];

  const handleFile = useCallback((f: File) => {
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    if (!ALLOWED.includes(ext)) { toast.error("Invalid file type. Use PNG, JPG, or TIFF."); return; }
    setFile(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!file) e.file = "Sonar file required.";
    if (!form.mission.trim()) e.mission = "Mission ID required.";
    if (!form.lat || isNaN(+form.lat) || +form.lat < -90 || +form.lat > 90) e.lat = "Valid latitude (−90 to 90).";
    if (!form.lon || isNaN(+form.lon) || +form.lon < -180 || +form.lon > 180) e.lon = "Valid longitude (−180 to 180).";
    if (!form.depth || isNaN(+form.depth) || +form.depth <= 0) e.depth = "Positive depth required.";
    if (!form.operator.trim()) e.operator = "Operator name required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const newJob: Job = {
        id: `JOB-2024-0${893 + Math.floor(Math.random() * 10)}`,
        mission: form.mission, location: `${(+form.lat).toFixed(2)}°N ${(+form.lon).toFixed(2)}°E`,
        lat: +form.lat, lon: +form.lon, depth: +form.depth,
        sonarType: form.sonarType, operator: form.operator,
        date: new Date().toISOString().slice(0, 10), status: "ready", filename: file!.name,
        detections: [
          { id: "NEW-D1", class: "Unknown", confidence: 0.71, depth: +form.depth, lat: +form.lat, lon: +form.lon, x: 200, y: 140, w: 42, h: 42, status: "unreviewed" },
          { id: "NEW-D2", class: "Cable", confidence: 0.88, depth: +form.depth + 2, lat: +form.lat + 0.001, lon: +form.lon + 0.001, x: 330, y: 200, w: 100, h: 12, status: "unreviewed" },
        ],
      };
      onJobCreated(newJob);
      setLoading(false);
      toast.success(`${newJob.id} created — ${newJob.detections.length} detections found.`);
      setTimeout(() => onNavigate("review", newJob.id), 500);
    }, 1800);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-mono text-xl font-bold text-foreground uppercase tracking-widest">Upload Sonar Image</h2>
        <p className="text-sm text-muted-foreground mt-1">Submit a new sonar scan for AI anomaly detection.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 rounded-[2px]
            ${dragOver 
              ? "border-teal-400 bg-teal-950/30 shadow-lg" 
              : file 
                ? "border-teal-700 bg-teal-950/10" 
                : errors.file 
                  ? "border-red-600 bg-red-950/10" 
                  : "border-gray-700 hover:border-teal-800 hover:bg-teal-950/5"}`}
          style={{
            borderColor: dragOver ? "var(--sx-teal)" : file ? "#1d9e88" : errors.file ? "var(--sx-red)" : "var(--sx-border)",
            backgroundColor: dragOver ? "rgba(45, 212, 191, 0.08)" : file ? "rgba(45, 212, 191, 0.04)" : errors.file ? "rgba(232, 97, 90, 0.05)" : undefined,
          }}>
          <input ref={fileRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.tiff,.tif"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          {file ? (
            <>
              <CheckCircle2 size={32} style={{ color: "var(--sx-teal)" }} className="mx-auto mb-3" />
              <p className="font-mono text-sm" style={{ color: "var(--sx-teal)" }}>{file.name}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-2 text-[11px] font-mono text-muted-foreground hover:text-red-500 transition-colors">
                Remove
              </button>
            </>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-3" style={{ color: dragOver ? "var(--sx-teal)" : "var(--sx-muted-dim)" }} />
              <p className="text-sm font-medium text-foreground">Drop sonar file here or click to browse</p>
              <p className="text-xs font-mono text-muted-foreground mt-1.5">PNG · JPG · TIFF — max 2 GB</p>
            </>
          )}
        </div>
        {errors.file && <p className="text-[11px] font-mono" style={{ color: "var(--sx-red)" }}>⚠ {errors.file}</p>}

        <div className="sonarix-panel p-5 space-y-4"
          style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
          <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest">Mission Metadata</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "mission", label: "Mission ID", placeholder: "Gulf Survey Alpha", key: "mission" },
              { id: "operator", label: "Operator", placeholder: "M. Okonkwo", key: "operator" },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-[10px] font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">{f.label}</label>
                <input value={form[f.key as keyof typeof form]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`w-full bg-background border text-foreground text-sm px-3 py-2 font-mono
                    focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30
                    ${errors[f.key] ? "border-[#ff3b3b]" : "border-border"}`} />
                {errors[f.key] && <p className="text-[10px] font-mono text-[#ff3b3b] mt-1">{errors[f.key]}</p>}
              </div>
            ))}
            {[
              { id: "lat", label: "Latitude (°)", placeholder: "28.31", key: "lat", type: "number" },
              { id: "lon", label: "Longitude (°)", placeholder: "-89.12", key: "lon", type: "number" },
              { id: "depth", label: "Depth (m)", placeholder: "184", key: "depth", type: "number" },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-[10px] font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`w-full bg-background border text-foreground text-sm px-3 py-2 font-mono
                    focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30
                    ${errors[f.key] ? "border-[#ff3b3b]" : "border-border"}`} />
                {errors[f.key] && <p className="text-[10px] font-mono text-[#ff3b3b] mt-1">{errors[f.key]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">Sonar Type</label>
              <select value={form.sonarType} onChange={e => setForm(p => ({ ...p, sonarType: e.target.value }))}
                className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 font-mono focus:outline-none focus:border-primary transition-colors">
                {["Klein 5000", "EdgeTech 4200", "Imagenex 837B", "Tritech StarFish", "Klein 3000"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} placeholder="Survey conditions, equipment notes, known hazards…"
                className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 font-mono
                  focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30 resize-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 text-background text-sm font-bold py-3 tracking-widest uppercase
              transition-all duration-200 flex items-center justify-center gap-2 rounded-[2px] hover:-translate-y-px"
            style={{
              backgroundColor: loading ? "rgba(45, 212, 191, 0.5)" : "var(--sx-teal)",
              color: "var(--sx-deep)",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}>
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Analyzing…</> : <><Send size={13} /> Submit for Analysis</>}
          </button>
          <button type="button" onClick={() => onNavigate("dashboard")}
            className="px-5 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors font-mono rounded-[2px]"
            style={{ borderColor: "var(--sx-border)" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Review Page ──────────────────────────────────────────────────────────────

type FilterTab = "all" | ReviewStatus;

function ReviewPage({ job, onUpdateJob }: { job: Job; onUpdateJob: (j: Job) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(job.detections[0]?.id ?? null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [comment, setComment] = useState("");

  const detection = job.detections.find(d => d.id === selectedId) ?? null;
  const filtered = job.detections.filter(d => filter === "all" || d.status === filter);

  const setStatus = (id: string, status: ReviewStatus) => {
    onUpdateJob({ ...job, detections: job.detections.map(d => d.id === id ? { ...d, status } : d) });
    const next = job.detections.find(d => d.id !== id && d.status === "unreviewed");
    if (next) setSelectedId(next.id);
    toast.success(`${id} marked as ${status}.`);
  };

  const addComment = () => {
    if (!selectedId || !comment.trim()) return;
    onUpdateJob({ ...job, detections: job.detections.map(d => d.id === selectedId ? { ...d, comment } : d) });
    setComment("");
    toast.success("Comment saved.");
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${job.detections.length})` },
    { key: "unreviewed", label: `Pending (${job.detections.filter(d => d.status === "unreviewed").length})` },
    { key: "verified", label: "Verified" },
    { key: "rejected", label: "Rejected" },
    { key: "uncertain", label: "Uncertain" },
  ];

  const reviewedCount = job.detections.filter(d => d.status !== "unreviewed").length;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-mono text-lg font-bold text-foreground uppercase tracking-widest">{job.id}</h2>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {job.mission} · {job.location} · {job.depth}m depth · {job.sonarType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-primary font-bold">{reviewedCount}</span>/{job.detections.length} reviewed
          </div>
          <Badge label={job.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          {/* Detection Legend */}
          <div className="sonarix-panel p-3 flex gap-4 flex-wrap justify-between items-center text-xs font-mono"
            style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
            <span className="text-muted-foreground uppercase tracking-widest">Detection Key:</span>
            <div className="flex gap-4 flex-wrap">
              {(Object.entries(CLASS_COLOR) as Array<[DetectionClass, string]>).map(([cls, color]) => (
                <div key={cls} className="flex items-center gap-2">
                  <div className="w-3 h-3 border" style={{ backgroundColor: `${color}60`, borderColor: color }} />
                  <span className="text-muted-foreground">{cls}</span>
                </div>
              ))}
            </div>
          </div>
          <SonarViewer detections={job.detections} selectedId={selectedId} onSelect={setSelectedId} />

          {detection && (
            <div className="sonarix-panel p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-8" style={{ background: CLASS_COLOR[detection.class] }} />
                  <div>
                    <h3 className="font-mono font-bold text-sm text-foreground uppercase tracking-wider">{detection.class}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground">{detection.id}</p>
                  </div>
                </div>
                <Badge label={detection.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["Confidence", `${Math.round(detection.confidence * 100)}%`],
                  ["Depth", `${detection.depth}m`],
                  ["Lat", `${detection.lat.toFixed(4)}°`],
                  ["Lon", `${detection.lon.toFixed(4)}°`],
                ].map(([l, v]) => (
                  <div key={l} className="bg-background border border-border px-3 py-2">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{l}</div>
                    <div className="font-mono font-bold text-sm text-foreground mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <ConfidenceBar value={detection.confidence} />

              <div className="flex gap-2 flex-wrap">
                {([
                  { status: "verified" as ReviewStatus, icon: CheckCircle2, label: "Verify", hover: "#00e5c4" },
                  { status: "rejected" as ReviewStatus, icon: XCircle, label: "Reject", hover: "#ff3b3b" },
                  { status: "uncertain" as ReviewStatus, icon: HelpCircle, label: "Uncertain", hover: "#ff8c00" },
                ] as const).map(btn => (
                  <button key={btn.status} onClick={() => setStatus(detection.id, btn.status)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border transition-all
                      ${detection.status === btn.status
                        ? `bg-[${btn.hover}]/15 border-[${btn.hover}] text-[${btn.hover}]`
                        : "border-border text-muted-foreground hover:text-foreground"}`}
                    style={detection.status === btn.status
                      ? { background: `${btn.hover}18`, borderColor: btn.hover, color: btn.hover }
                      : {}}>
                    <btn.icon size={13} />
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  placeholder={detection.comment ?? "Add analysis note…"}
                  className="flex-1 bg-background border border-border text-foreground text-xs px-3 py-2 font-mono
                    focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
                <button onClick={addComment}
                  className="px-3 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detection list */}
        <div className="bg-secondary border border-border flex flex-col" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          <div className="border-b border-border overflow-x-auto shrink-0">
            <div className="flex min-w-max">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={`px-3 py-2.5 text-[10px] font-mono tracking-widest uppercase whitespace-nowrap transition-all border-b-2
                    ${filter === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-xs font-mono">No detections here.</div>
            ) : filtered.map(d => (
              <button key={d.id} onClick={() => setSelectedId(d.id)}
                className={`w-full text-left px-3 py-3 transition-all hover:bg-background/40 border-l-2
                  ${selectedId === d.id ? "bg-background/50 border-primary" : "border-transparent"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 shrink-0" style={{ background: CLASS_COLOR[d.class] }} />
                    <span className="font-mono text-[11px] font-bold text-foreground">{d.class.toUpperCase()}</span>
                  </div>
                  <Badge label={d.status} />
                </div>
                <ConfidenceBar value={d.confidence} />
                <div className="flex justify-between mt-1.5 text-[10px] font-mono text-muted-foreground/70">
                  <span>{d.id}</span><span>{d.depth}m</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────────

function ReportsPage({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (j.id.toLowerCase().includes(q) || j.mission.toLowerCase().includes(q))
      && (statusFilter === "all" || j.status === statusFilter);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold text-foreground uppercase tracking-widest">Reports & Exports</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs.length} total jobs · {jobs.filter(j => j.status === "exported").length} exported
          </p>
        </div>
        <button onClick={() => toast.success("All reports queued for export.")}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30
            text-primary text-xs font-mono hover:bg-primary/20 transition-colors tracking-wider uppercase">
          <Download size={13} /> Export All
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-secondary border border-border px-3 py-2 flex-1 min-w-44">
          <Search size={13} className="text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search job ID or mission…"
            className="bg-transparent text-foreground text-xs font-mono focus:outline-none placeholder:text-muted-foreground/30 w-full" />
        </div>
        <div className="flex items-center gap-2 bg-secondary border border-border px-3 py-2">
          <Filter size={13} className="text-muted-foreground shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-foreground text-xs font-mono focus:outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="reviewed">Reviewed</option>
            <option value="exported">Exported</option>
          </select>
        </div>
      </div>

      <div className="sonarix-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {["Job ID", "Mission", "Date", "Detections", "Reviewed", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-muted-foreground/50 uppercase tracking-widest font-normal text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border/40">
                  <td colSpan={7} className="px-4 py-3"><div className="h-4 w-full animate-pulse bg-field/70" /></td>
                </tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText size={28} className="opacity-20" />
                      <span className="font-mono text-xs">No exports yet — process a job to generate one.</span>
                      <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="px-3 py-1.5 border border-primary/30 text-primary text-[10px] font-mono uppercase">Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(job => {
                const reviewed = job.detections.filter(d => d.status !== "unreviewed").length;
                return (
                  <tr key={job.id} className="border-b border-border/40 hover:bg-background/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary text-[11px]">{job.id}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{job.mission}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{job.date}</td>
                    <td className="px-4 py-3 font-mono font-bold text-foreground">{job.detections.length}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <span className="text-primary">{reviewed}</span>
                      <span className="text-muted-foreground">/{job.detections.length}</span>
                    </td>
                    <td className="px-4 py-3"><Badge label={job.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => toast.success(`${job.id} PDF report downloaded.`)}
                          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors">
                          <Download size={10} /> PDF
                        </button>
                        <button onClick={() => toast.success(`${job.id} CSV exported.`)}
                          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors">
                          <Download size={10} /> CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  const [threshold, setThreshold] = useState(0.65);
  const [labels, setLabels] = useState<string[]>(["Mine", "Cable", "UXO", "Wreck", "Unknown"]);
  const [role, setRole] = useState("Analyst");
  const [newLabel, setNewLabel] = useState("");

  const addLabel = () => {
    if (!newLabel.trim() || labels.includes(newLabel.trim())) return;
    setLabels(l => [...l, newLabel.trim()]); setNewLabel("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-mono text-xl font-bold text-foreground uppercase tracking-widest">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Detection thresholds, class labels, and user configuration.</p>
      </div>

      <div className="sonarix-panel p-5 space-y-4"
        style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
        <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Shield size={12} style={{ color: "var(--sx-teal)" }} /> Detection Threshold
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Minimum confidence to flag a detection</span>
            <span className="font-bold tabular-nums" style={{ color: "var(--sx-teal)" }}>{Math.round(threshold * 100)}%</span>
          </div>
          {/* Slider with recommended range indicator */}
          <div className="relative pt-2">
            <input type="range" min={0} max={1} step={0.01} value={threshold}
              onChange={e => setThreshold(+e.target.value)}
              className="w-full h-1.5 appearance-none bg-gradient-to-r from-red-600 to-green-600 rounded cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  var(--sx-red) 0%, 
                  var(--sx-amber) 50%, 
                  var(--sx-teal) 80%, 
                  var(--sx-cyan) 100%)`
              }} />
            {/* Tick marks */}
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            {/* Recommended range shading - visual indicator */}
            <div className="mt-2 relative h-4 border border-dashed" style={{ borderColor: "var(--sx-border-strong)" }}>
              <div className="absolute inset-0" style={{ 
                background: "linear-gradient(to right, transparent 60%, rgba(45, 212, 191, 0.15) 60%, rgba(45, 212, 191, 0.15) 80%, transparent 80%)"
              }} />
              <span className="absolute text-[9px] font-mono text-muted-foreground/50" style={{ left: "60%", top: "-16px" }}>Recommended</span>
            </div>
          </div>
          <div className={`text-xs font-mono px-3 py-2 border rounded-[2px]`}
            style={{ 
              borderColor: threshold < 0.5 ? "rgba(240, 180, 41, 0.4)" : threshold > 0.85 ? "rgba(106, 157, 181, 0.4)" : "rgba(45, 212, 191, 0.3)",
              backgroundColor: threshold < 0.5 ? "rgba(240, 180, 41, 0.08)" : threshold > 0.85 ? "rgba(106, 157, 181, 0.08)" : "rgba(45, 212, 191, 0.08)",
              color: threshold < 0.5 ? "var(--sx-amber)" : threshold > 0.85 ? "var(--sx-cyan)" : "var(--sx-teal)"
            }}>
            {threshold < 0.5 ? "⚠ Low threshold — expect elevated false-positive rate."
              : threshold > 0.85 ? "ℹ High threshold — low-confidence detections will be suppressed."
                : "✓ Balanced threshold. Recommended range: 60–80%."}
          </div>
        </div>
      </div>

      <div className="sonarix-panel p-5 space-y-4"
        style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
        <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Layers size={12} style={{ color: "var(--sx-teal)" }} /> Detection Class Labels
        </h3>
        <div className="flex flex-wrap gap-2">
          {labels.map(l => (
            <div key={l} className="flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-mono text-foreground transition-all hover:border-opacity-100"
              style={{ 
                borderColor: CLASS_BAR_COLOR[l] ? `${CLASS_BAR_COLOR[l]}66` : "var(--sx-border)",
                backgroundColor: CLASS_BAR_COLOR[l] ? `${CLASS_BAR_COLOR[l]}15` : "var(--sx-field)",
              }}>
              <div className="w-1.5 h-1.5 shrink-0" style={{ background: CLASS_BAR_COLOR[l] ?? "#6a9db5" }} />
              {l}
              <button onClick={() => setLabels(ls => ls.filter(x => x !== l))}
                className="ml-0.5 text-muted-foreground/60 hover:text-red-500 transition-colors hover:scale-125"
                aria-label={`Remove ${l} label`}
                style={{ minWidth: "32px", minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLabel(); } }}
            placeholder="Add new class label…"
            className="flex-1 bg-background border border-border text-foreground text-xs px-3 py-2 font-mono
              focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
          <button onClick={addLabel}
            className="px-3 py-2 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="sonarix-panel p-5 space-y-4"
        style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
        <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <User size={12} style={{ color: "var(--sx-teal)" }} /> User Role
        </h3>
        <div className="flex gap-2">
          {["Analyst", "Reviewer", "Admin"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-4 py-2 text-xs font-mono border rounded-[2px] transition-all`}
              style={{
                borderColor: role === r ? "var(--sx-teal)" : "var(--sx-border)",
                backgroundColor: role === r ? "rgba(45, 212, 191, 0.15)" : "transparent",
                color: role === r ? "var(--sx-teal)" : "var(--sx-muted)",
              }}>
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          {role === "Admin" ? "✓ Full system access: configure thresholds, manage users, export all job data."
            : role === "Reviewer" ? "✓ Can verify detections, reject findings, add comments, and export reports."
              : "✓ Can upload sonar scans and view detection results for assigned jobs."}
        </p>
      </div>

      <div className="sonarix-panel p-5"
        style={{ backgroundColor: "var(--sx-panel)", borderColor: "var(--sx-border)" }}>
        <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
          <Cpu size={12} style={{ color: "var(--sx-teal)" }} /> System Information
        </h3>
        <div className="space-y-2.5">
          {[
            ["Model Version", "SONARIX v2.1.4"],
            ["AI Engine", "SonarNet-ResUNet-128"],
            ["API Endpoint", "api.sonarix.io/v2"],
            ["Last Updated", "2024-11-14 09:42 UTC"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs font-mono px-3 py-2 border-b" 
              style={{ borderColor: "var(--sx-border-strong)" }}>
              <span className="text-muted-foreground">{k}</span>
              <span className="text-foreground text-right" style={{ color: "var(--sx-cyan)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 pt-3 pb-1 bg-background/95 backdrop-blur-sm">
      <button onClick={() => toast.success("Settings saved successfully.")}
        className="w-full text-background text-sm font-bold py-3 tracking-widest uppercase
          transition-all duration-200 hover:-translate-y-px rounded-[2px]"
        style={{
          backgroundColor: "var(--sx-teal)",
          color: "var(--sx-deep)",
        }}>
        Save Settings
      </button>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  // Initialize page state based on login status and URL params
  const getInitialPage = (): Page => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page') as Page || 'dashboard';
    
    return isLoggedIn ? pageParam : 'login';
  };

  const [page, setPage] = useState<Page>(getInitialPage);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setPage('login');
    }
  }, []);

  const navigate = (p: Page, jobId?: string) => {
    setPage(p);
    if (jobId) setActiveJobId(jobId);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const updateJob = (updated: Job) =>
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));

  const activeJob = (activeJobId ? jobs.find(j => j.id === activeJobId) : null) ?? jobs[0];

  if (page === "login") {
    return (
      <>
        <Toaster theme="dark" position="top-right" toastOptions={{ style: { fontFamily: "JetBrains Mono, monospace", fontSize: "12px" } }} />
        <LoginPage onLogin={() => navigate("dashboard")} />
      </>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <style>{`
        :root {
          --sx-abyss: #040a12;
          --sx-deep: #081826;
          --sx-panel: #0b1f30;
          --sx-field: #0d2434;
          --sx-teal: #2dd4bf;
          --sx-teal-dim: #1d9e88;
          --sx-cyan: #67e8f9;
          --sx-amber: #f0b429;
          --sx-text: #e7f2f4;
          --sx-muted: #7d97a8;
          --sx-muted-dim: #4d6373;
          --sx-border: rgba(45, 212, 191, 0.16);
          --sx-border-strong: rgba(45, 212, 191, 0.32);
          --sx-red: #e8615a;
        }
        
        /* Global panel styling with hairline top gradient */
        .sonarix-panel {
          background: linear-gradient(180deg, var(--sx-panel) 0%, var(--sx-deep) 100%);
          border: 1px solid var(--sx-border);
          border-radius: 2px;
          position: relative;
        }
        
        .sonarix-panel::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--sx-teal), transparent);
          opacity: 0.7;
        }
        
        /* Corner bracket accents */
        .corner { 
          position: absolute; 
          width: 14px; 
          height: 14px; 
          border: 1px solid var(--sx-border-strong); 
        }
        .corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
        .corner.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
        .corner.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
        .corner.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }
        
        /* Interactive states */
        button, a, [role="button"] {
          transition: all 120ms ease;
        }
        
        button:hover, a:hover, [role="button"]:hover {
          border-color: var(--sx-border-strong);
        }
        
        button:focus, a:focus, [role="button"]:focus,
        input:focus, select:focus, textarea:focus {
          outline: 2px solid var(--sx-teal);
          outline-offset: 2px;
        }
        
        /* Skeleton loading state */
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
        
        /* Smooth fade transitions */
        .fade-enter {
          animation: fadeIn 100ms ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <Toaster theme="dark" position="top-right" toastOptions={{ style: { fontFamily: "JetBrains Mono, monospace", fontSize: "12px" } }} />
      <Navbar page={page} onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={page} onNavigate={navigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <DashboardPage jobs={jobs} onNavigate={navigate} />}
          {page === "upload" && <UploadPage onNavigate={navigate} onJobCreated={j => setJobs(prev => [j, ...prev])} />}
          {page === "review" && <ReviewPage job={activeJob} onUpdateJob={updateJob} />}
          {page === "reports" && <ReportsPage jobs={jobs} />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
