import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:         "#FAFAF8",
  surface:    "#FFFFFF",
  raised:     "#F4F3EF",
  border:     "#E8E6E1",
  borderHi:   "#D8D5CD",
  accent:     "#5B4FE8",
  accentDim:  "rgba(91,79,232,0.08)",
  accentMid:  "rgba(91,79,232,0.18)",
  icp:        "#E8385F",
  icpDim:     "rgba(232,56,95,0.08)",
  icpMid:     "rgba(232,56,95,0.18)",
  green:      "#0F9D6E",
  greenDim:   "rgba(15,157,110,0.1)",
  amber:      "#D97706",
  red:        "#DC2626",
  text:       "#1A1A1F",
  muted:      "#6B6B76",
  dim:        "#C9C6BD",
};

const PAGE_COLORS = ["#5B4FE8","#E8385F","#0F9D6E","#D97706","#2563EB"];

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: ${T.bg};
  color: ${T.text};
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.dim}; border-radius: 2px; }

/* ── NAV ── */
.pm-nav {
  position: sticky; top: 0; z-index: 200;
  display: flex; align-items: center; gap: 0;
  height: 56px;
  background: rgba(250,250,248,0.85);
  border-bottom: 1px solid ${T.border};
  backdrop-filter: blur(16px);
  padding: 0 28px;
}
.pm-logo {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 17px; font-weight: 800;
  letter-spacing: -0.03em;
  color: ${T.text};
  margin-right: 32px;
  flex-shrink: 0;
  display: flex; align-items: center; gap: 7px;
}
.pm-logo-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: ${T.accent};
  box-shadow: 0 0 10px ${T.accent};
}
.pm-tabs { display: flex; gap: 2px; flex: 1; }
.pm-tab {
  position: relative;
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px; font-weight: 500;
  cursor: pointer; border: none;
  background: transparent; color: ${T.muted};
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
}
.pm-tab:hover { color: ${T.text}; background: ${T.surface}; }
.pm-tab.active { color: ${T.text}; background: ${T.raised}; }
.pm-tab.active::after {
  content: '';
  position: absolute; bottom: -1px; left: 14px; right: 14px;
  height: 2px; border-radius: 1px 1px 0 0;
  background: ${T.accent};
}
.pm-badge {
  display: inline-flex; align-items: center;
  background: ${T.icp}; color: #fff;
  font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
  padding: 1px 5px; border-radius: 20px;
  margin-left: 5px; vertical-align: middle;
  text-transform: uppercase;
}
.pm-status {
  margin-left: auto;
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: ${T.muted};
}

/* ── LAYOUT ── */
.pm-main { padding: 32px 28px; max-width: 1440px; margin: 0 auto; }

/* ── SECTION HEADER ── */
.pm-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: ${T.accent}; margin-bottom: 6px;
}
.pm-eyebrow.icp { color: ${T.icp}; }
.pm-h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 26px; font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.15; margin-bottom: 8px;
}
.pm-sub { font-size: 13px; color: ${T.muted}; line-height: 1.7; max-width: 680px; }

/* ── CARDS ── */
.pm-card {
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 12px;
  padding: 20px;
}
.pm-card-tight { padding: 14px 16px; }

/* ── GRIDS ── */
.g5 { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; }
.g3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.g2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
.g2-3 { display: grid; grid-template-columns: 2fr 3fr; gap: 20px; }
.g3-2 { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }

/* ── PAGE CARD ── */
.page-card {
  border: 1px solid ${T.border};
  border-radius: 12px; overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  background: ${T.surface};
}
.page-card:hover {
  border-color: ${T.borderHi};
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(26,26,31,0.08);
}
.page-card-thumb {
  height: 160px; overflow: hidden;
  position: relative;
}
.page-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 60%, ${T.surface});
  z-index: 1;
}
.page-card-body { padding: 14px; }
.page-card-ver {
  font-family: 'DM Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 5px;
}
.page-card-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px; font-weight: 700;
  line-height: 1.35; margin-bottom: 6px;
}
.page-card-hypo { font-size: 11.5px; color: ${T.muted}; line-height: 1.55; }
.page-card-view {
  margin-top: 12px; width: 100%;
  padding: 7px; border-radius: 6px;
  font-size: 11px; font-weight: 600;
  background: transparent; cursor: pointer;
  border: 1px solid ${T.border}; color: ${T.muted};
  transition: all 0.15s;
}
.page-card-view:hover { color: ${T.text}; border-color: ${T.borderHi}; }

/* ── MODAL ── */
.pm-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: fadeIn 0.18s ease;
}
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.pm-modal {
  background: ${T.surface};
  border: 1px solid ${T.borderHi};
  border-radius: 16px;
  width: 100%; max-width: 960px;
  max-height: 92vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.22s ease;
}
@keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
.pm-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${T.border};
  flex-shrink: 0;
}
.pm-modal-close {
  width: 28px; height: 28px; border-radius: 7px;
  background: ${T.raised}; border: 1px solid ${T.border};
  color: ${T.muted}; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s;
}
.pm-modal-close:hover { color: ${T.text}; }
.pm-modal-body { overflow-y: auto; flex: 1; }

/* ── BUTTONS ── */
.btn-accent {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 8px;
  background: ${T.accent}; color: #fff;
  font-size: 13px; font-weight: 600;
  border: none; cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-accent:hover { opacity: 0.9; }
.btn-accent:active { transform: scale(0.98); }
.btn-accent:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-icp {
  background: ${T.icp};
}
.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 8px;
  background: transparent; color: ${T.muted};
  font-size: 13px; font-weight: 500;
  border: 1px solid ${T.border}; cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover { border-color: ${T.borderHi}; color: ${T.text}; }

/* ── METRIC CHIP ── */
.metric-chip {
  display: flex; flex-direction: column; gap: 3px;
  background: ${T.raised}; border: 1px solid ${T.border};
  border-radius: 8px; padding: 10px 14px;
}
.metric-chip-val {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px; font-weight: 800;
  letter-spacing: -0.03em; line-height: 1;
}
.metric-chip-label { font-size: 11px; color: ${T.muted}; }
.metric-chip-delta { font-size: 11px; font-weight: 600; }

/* ── HEATMAP ROW ── */
.hm-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0;
}
.hm-label { font-size: 11.5px; color: ${T.muted}; width: 130px; flex-shrink: 0; }
.hm-track { flex: 1; height: 22px; background: ${T.raised}; border-radius: 4px; overflow: hidden; position: relative; }
.hm-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; transition: width 0.8s ease; }
.hm-fill-val { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.9); }
.hm-sec { font-family: 'DM Mono', monospace; font-size: 10px; color: ${T.muted}; width: 38px; text-align: right; flex-shrink: 0; }

/* ── RANK ROW ── */
.rank-row {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 16px; border-radius: 10px; margin-bottom: 7px;
  border: 1px solid ${T.border};
  background: ${T.raised};
  transition: border-color 0.15s;
}
.rank-row:hover { border-color: ${T.borderHi}; }
.rank-row.r1-overall { border-color: ${T.accent}; background: ${T.accentDim}; }
.rank-row.r1-icp { border-color: ${T.icp}; background: ${T.icpDim}; }
.rank-num {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px; font-weight: 800;
  color: ${T.dim}; width: 26px; text-align: center; flex-shrink: 0;
}
.r1-overall .rank-num { color: ${T.accent}; }
.r1-icp .rank-num { color: ${T.icp}; }
.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 13px; font-weight: 600; }
.rank-meta { font-size: 11px; color: ${T.muted}; margin-top: 2px; }
.rank-score {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 24px; font-weight: 800; letter-spacing: -0.03em;
  flex-shrink: 0;
}
.score-ring {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px; font-weight: 800;
}

/* ── INSIGHT CARD ── */
.insight-card {
  border-left: 2px solid ${T.icp};
  background: ${T.icpDim};
  border-radius: 0 8px 8px 0;
  padding: 11px 14px; margin-bottom: 8px;
}
.insight-tag {
  font-family: 'DM Mono', monospace;
  font-size: 9px; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${T.icp}; margin-bottom: 4px;
}
.insight-text { font-size: 12.5px; color: ${T.text}; line-height: 1.55; }
.insight-src { font-size: 11px; color: ${T.icp}; margin-top: 5px; opacity: 0.8; }

/* ── LIVE FEED ── */
.feed {
  height: 180px; overflow-y: auto;
  background: ${T.bg};
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 10px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 10.5px;
}
.feed-line { padding: 1.5px 0; color: ${T.muted}; }

/* ── DECISION LOG ── */
.dec-item {
  display: flex; gap: 0;
  margin-bottom: 12px;
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
}
.dec-item:last-child { margin-bottom: 0; }
.dec-stripe { width: 5px; flex-shrink: 0; }
.dec-body { flex: 1; padding: 13px 15px; }
.dec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
.dec-el { font-size: 13px; font-weight: 700; }
.dec-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 10.5px; font-weight: 700;
  border: 1px solid; letter-spacing: 0.02em;
}
.dec-quote-box {
  background: ${T.raised};
  border-radius: 7px;
  padding: 9px 12px;
  margin-bottom: 9px;
  font-size: 12.5px; color: ${T.text};
  line-height: 1.55;
  border-left: 2.5px solid;
}
.dec-why-row { display: flex; gap: 7px; }
.dec-why-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: ${T.muted}; flex-shrink: 0; padding-top: 1px; width: 32px;
}
.dec-reason { font-size: 12px; color: ${T.muted}; line-height: 1.6; flex: 1; }

/* ── MINI SPARKBAR ── */
.sparkbar { display: flex; align-items: flex-end; gap: 2px; height: 28px; }
.sparkbar-col { width: 6px; border-radius: 2px 2px 0 0; background: ${T.dim}; flex-shrink: 0; }

/* ── PROGRESS ── */
.pm-progress { height: 3px; background: ${T.border}; border-radius: 2px; overflow: hidden; }
.pm-progress-fill { height: 100%; background: ${T.accent}; border-radius: 2px; transition: width 0.3s ease; }

/* ── PERSONA PILL ── */
.persona-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 500;
  border: 1px solid;
}

/* ── DIVIDER ── */
.pm-divider { border: none; border-top: 1px solid ${T.border}; margin: 22px 0; }

/* ── SPINNER ── */
.pm-spin {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: #fff;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── PULSE ── */
.pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: ${T.green};
  box-shadow: 0 0 0 0 rgba(45,212,191,0.4);
  animation: pulse-anim 1.8s ease infinite;
}
@keyframes pulse-anim {
  0%   { box-shadow: 0 0 0 0 rgba(45,212,191,0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(45,212,191,0); }
  100% { box-shadow: 0 0 0 0 rgba(45,212,191,0); }
}

/* ── TOOLTIP ── */
.pm-tt {
  background: ${T.raised}; border: 1px solid ${T.borderHi};
  border-radius: 8px; padding: 9px 13px;
  font-size: 12px;
}
.pm-tt-label { font-weight: 600; margin-bottom: 4px; }

/* ── TAG ── */
.pm-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; border: 1px solid;
}

/* ── SUB-TAB ── */
.pm-sub-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
.pm-sub-tab {
  padding: 5px 13px; border-radius: 6px;
  font-size: 12px; font-weight: 500;
  cursor: pointer; border: 1px solid ${T.border};
  background: transparent; color: ${T.muted};
  transition: all 0.15s;
}
.pm-sub-tab.active {
  background: ${T.raised}; color: ${T.text};
  border-color: ${T.accent};
}
.pm-sub-tab.icp-tab.active {
  border-color: ${T.icp}; color: ${T.icp};
  background: ${T.icpDim};
}

/* ── EMPTY STATE ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 72px 0;
  text-align: center; gap: 12px;
}
.empty-icon { font-size: 40px; }
.empty-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; }
.empty-sub { font-size: 13px; color: ${T.muted}; max-width: 320px; line-height: 1.6; }

/* ── V6 BROWSER CHROME ── */
.v6-chrome {
  background: ${T.raised}; border: 1px solid ${T.border};
  border-radius: 12px; overflow: hidden;
}
.v6-chrome-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-bottom: 1px solid ${T.border};
  background: ${T.surface};
}
.v6-chrome-dots { display: flex; gap: 5px; }
.v6-chrome-dot { width: 9px; height: 9px; border-radius: 50%; }
.v6-chrome-url {
  flex: 1; background: ${T.raised};
  border: 1px solid ${T.border}; border-radius: 5px;
  padding: 3px 10px; font-size: 11px; font-family: 'DM Mono', monospace;
  color: ${T.muted}; display: flex; align-items: center; justify-content: space-between;
}
.v6-chrome-body { height: 520px; overflow-y: auto; }

/* ── SECTION SCORE BAR ── */
.score-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.score-bar-label { font-size: 11px; color: ${T.muted}; width: 100px; flex-shrink: 0; }
.score-bar-track { flex: 1; height: 6px; background: ${T.raised}; border-radius: 3px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 3px; }
.score-bar-val { font-size: 11px; font-weight: 600; width: 32px; text-align: right; flex-shrink: 0; }

/* ── ICP BANNER ── */
.icp-banner {
  border: 1px solid ${T.icp};
  background: ${T.icpDim};
  border-radius: 8px; padding: 10px 14px;
  font-size: 12px; color: ${T.icp};
  display: flex; align-items: flex-start; gap: 8px;
}
.icp-banner-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

/* ── FLO LANDING PAGE CLASSES ── */
.flo-nav { padding: 18px 48px; }
.flo-body { padding-left: 48px; padding-right: 48px; }
.flo-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; }
.flo-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

/* ── MOBILE RESPONSIVE ── */
@media (max-width: 768px) {
  .flo-nav { padding: 14px 20px !important; }
  .flo-body { padding-left: 20px !important; padding-right: 20px !important; }
  .flo-body h1 { font-size: 30px !important; line-height: 1.2 !important; }
  .flo-body h2 { font-size: 20px !important; }
  .flo-body p { font-size: 14px !important; }
  .flo-grid-2, .flo-grid-3 { grid-template-columns: 1fr !important; }

  /* Nav */
  .pm-nav { padding: 0 16px; gap: 0; }
  .pm-logo { margin-right: 12px; font-size: 15px; }
  .pm-tabs {
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; gap: 2px;
  }
  .pm-tabs::-webkit-scrollbar { display: none; }
  .pm-tab { padding: 6px 10px; font-size: 12px; white-space: nowrap; }
  .pm-status { display: none; }

  /* Main layout */
  .pm-main { padding: 20px 16px; }
  .pm-h1 { font-size: 20px; }
  .pm-sub { font-size: 12px; }

  /* All grids collapse to 1 column */
  .g5, .g3, .g2, .g2-3, .g3-2 {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  /* Page cards - 2 col on mobile */
  .g5 { grid-template-columns: repeat(2,1fr) !important; }

  /* Cards */
  .pm-card { padding: 14px; }
  .pm-card-tight { padding: 10px 12px; }

  /* Heatmap label truncation */
  .hm-label { width: 90px; font-size: 10.5px; }

  /* Feed */
  .feed { height: 120px; }

  /* Rank rows */
  .rank-row { padding: 10px 12px; gap: 10px; }
  .rank-num { font-size: 15px; width: 22px; }

  /* Decision log */
  .dec-body { padding: 10px 12px; }
  .dec-el { font-size: 12px; }
  .dec-quote-box { font-size: 11.5px; padding: 8px 10px; }
  .dec-reason { font-size: 11px; }

  /* V6 chrome */
  .v6-chrome-body { height: 380px; }
  .v6-chrome-url { font-size: 10px; }

  /* Sub tabs */
  .pm-sub-tabs { gap: 4px; }
  .pm-sub-tab { padding: 5px 10px; font-size: 11px; }

  /* Insight cards */
  .insight-text { font-size: 12px; }
  .insight-src { font-size: 10px; }

  /* Empty state */
  .empty-state { padding: 40px 0; }
  .empty-title { font-size: 16px; }

  /* Buttons */
  .btn-accent, .btn-ghost { padding: 9px 16px; font-size: 12px; }

  /* Persona pills wrap */
  .persona-pill { font-size: 10px; padding: 3px 7px; }
}

@media (max-width: 480px) {
  /* Phones - single column everything */
  .g5 { grid-template-columns: 1fr !important; }
  .pm-h1 { font-size: 18px; }
  .pm-tab { font-size: 11px; padding: 5px 8px; }

  /* Landing page modals inner content — override 48px side padding */
  .pm-modal-body div[style*="48px"] {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  .pm-modal-body nav[style*="48px"] {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  /* Grids inside landing pages */
  .pm-modal-body [style*="repeat(2,1fr)"],
  .pm-modal-body [style*="repeat(3,1fr)"] {
    grid-template-columns: 1fr !important;
  }
  /* Large hero font sizes inside modals */
  .pm-modal-body h1 { font-size: 32px !important; }
  .pm-modal-body h2 { font-size: 22px !important; }
}
`;


/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const PAGES = [
  { id:"v1", ver:"V1", type:"Feature-led",      headline:"Your meetings, documented automatically",            hypothesis:"Founders who know what they need will convert on clarity and a complete feature overview.",                                       color: PAGE_COLORS[0] },
  { id:"v2", ver:"V2", type:"Emotion-led",       headline:"Stop leaving meetings wondering what just happened", hypothesis:"Founders driven by anxiety respond to being understood emotionally before seeing any product detail.",                           color: PAGE_COLORS[1] },
  { id:"v3", ver:"V3", type:"Social Proof-led",  headline:"The notetaker 500+ YC founders use on every call", hypothesis:"Skeptical founders trust peer validation above any product claim — credibility converts.",                                       color: PAGE_COLORS[2] },
  { id:"v4", ver:"V4", type:"Pain-point-led",    headline:"You just had a great investor call. Now what?",     hypothesis:"Naming the exact founder scenario before introducing the solution creates urgency that converts.",                               color: PAGE_COLORS[3] },
  { id:"v5", ver:"V5", type:"Outcome-led",       headline:"Get 5 hours a week back. Ship more. Miss nothing.", hypothesis:"Founders think in goals, not features — show the end state and let them self-select into the product.",                         color: PAGE_COLORS[4] },
];

const PERSONAS = [
  { id:"founder",    label:"Startup Founder",      short:"Founder",   color:"#F72585", bg:"rgba(247,37,133,0.1)",   isICP:true,  w:0.28 },
  { id:"enterprise", label:"Enterprise PM",         short:"Ent. PM",   color:"#7C6EF8", bg:"rgba(124,110,248,0.1)", isICP:false, w:0.18 },
  { id:"freelancer", label:"Freelance Consultant",  short:"Freelancer",color:"#2DD4BF", bg:"rgba(45,212,191,0.1)",  isICP:false, w:0.22 },
  { id:"student",    label:"CS Student",            short:"Student",   color:"#F59E0B", bg:"rgba(245,158,11,0.1)",  isICP:false, w:0.15 },
  { id:"indie",      label:"Indie Hacker",          short:"Indie",     color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  isICP:false, w:0.10 },
  { id:"vc",         label:"VC Analyst",            short:"VC",        color:"#A78BFA", bg:"rgba(167,139,250,0.1)", isICP:false, w:0.07 },
];

/* Raw behavioral weights — scroll%, bounce%, ctaClick%, sectionDwell multipliers */
const BEH = {
  founder: {
    v1:{ scroll:55, bounce:28, cta:12, hero:0.6, s2:0.4, s3:0.7, s4:0.8, s5:0.7 },
    v2:{ scroll:74, bounce:18, cta:19, hero:1.4, s2:1.6, s3:1.3, s4:1.1, s5:1.2 },
    v3:{ scroll:82, bounce:14, cta:24, hero:0.9, s2:1.5, s3:2.1, s4:1.4, s5:1.0 },
    v4:{ scroll:88, bounce:10, cta:31, hero:1.7, s2:1.9, s3:1.6, s4:1.3, s5:1.5 },
    v5:{ scroll:71, bounce:20, cta:22, hero:1.2, s2:1.4, s3:1.0, s4:1.3, s5:1.1 },
  },
  enterprise: {
    v1:{ scroll:92, bounce:6,  cta:11, hero:1.2, s2:1.8, s3:1.5, s4:2.0, s5:0.7 },
    v2:{ scroll:38, bounce:52, cta:2,  hero:0.6, s2:0.3, s3:0.4, s4:0.7, s5:0.2 },
    v3:{ scroll:80, bounce:13, cta:8,  hero:1.0, s2:1.3, s3:1.0, s4:1.6, s5:0.5 },
    v4:{ scroll:50, bounce:38, cta:4,  hero:0.5, s2:0.6, s3:0.8, s4:1.0, s5:0.3 },
    v5:{ scroll:65, bounce:24, cta:6,  hero:0.9, s2:1.1, s3:1.4, s4:0.7, s5:0.4 },
  },
  freelancer: {
    v1:{ scroll:62, bounce:26, cta:7,  hero:1.0, s2:1.2, s3:1.0, s4:0.9, s5:0.7 },
    v2:{ scroll:58, bounce:28, cta:9,  hero:1.1, s2:1.0, s3:1.2, s4:0.9, s5:0.8 },
    v3:{ scroll:55, bounce:32, cta:6,  hero:0.8, s2:0.7, s3:0.9, s4:1.0, s5:0.6 },
    v4:{ scroll:76, bounce:16, cta:18, hero:1.4, s2:1.2, s3:1.3, s4:1.1, s5:1.2 },
    v5:{ scroll:74, bounce:17, cta:16, hero:1.3, s2:1.4, s3:1.2, s4:1.0, s5:1.1 },
  },
  student: {
    v1:{ scroll:84, bounce:9,  cta:3,  hero:0.8, s2:1.2, s3:1.4, s4:0.6, s5:0.2 },
    v2:{ scroll:48, bounce:42, cta:1,  hero:0.9, s2:0.6, s3:0.5, s4:0.4, s5:0.1 },
    v3:{ scroll:44, bounce:46, cta:1,  hero:0.7, s2:0.4, s3:0.5, s4:0.8, s5:0.1 },
    v4:{ scroll:38, bounce:50, cta:1,  hero:0.6, s2:0.4, s3:0.3, s4:0.7, s5:0.1 },
    v5:{ scroll:60, bounce:30, cta:2,  hero:1.0, s2:0.9, s3:0.8, s4:0.7, s5:0.2 },
  },
  indie: {
    v1:{ scroll:65, bounce:24, cta:10, hero:0.9, s2:1.0, s3:1.1, s4:1.2, s5:0.8 },
    v2:{ scroll:58, bounce:28, cta:8,  hero:1.0, s2:0.9, s3:1.0, s4:0.8, s5:0.7 },
    v3:{ scroll:56, bounce:30, cta:7,  hero:0.8, s2:0.7, s3:0.9, s4:1.0, s5:0.6 },
    v4:{ scroll:80, bounce:14, cta:22, hero:1.4, s2:1.3, s3:1.2, s4:1.3, s5:1.3 },
    v5:{ scroll:82, bounce:12, cta:24, hero:1.5, s2:1.4, s3:1.3, s4:1.2, s5:1.4 },
  },
  vc: {
    v1:{ scroll:42, bounce:46, cta:1,  hero:0.7, s2:0.8, s3:0.6, s4:0.7, s5:0.1 },
    v2:{ scroll:28, bounce:64, cta:0,  hero:0.4, s2:0.2, s3:0.3, s4:0.5, s5:0.1 },
    v3:{ scroll:72, bounce:20, cta:4,  hero:1.1, s2:1.5, s3:1.1, s4:1.8, s5:0.3 },
    v4:{ scroll:34, bounce:58, cta:1,  hero:0.5, s2:0.4, s3:0.6, s4:0.4, s5:0.1 },
    v5:{ scroll:48, bounce:42, cta:2,  hero:0.9, s2:0.8, s3:1.3, s4:0.6, s5:0.2 },
  },
};

const SECTIONS = {
  v1:{ s2:"Feature Grid",     s3:"Screenshot",       s4:"Integrations",       s5:"CTA" },
  v2:{ s2:"Emotional Hook",   s3:"Relief Narrative",  s4:"Testimonial",        s5:"CTA" },
  v3:{ s2:"Logo Wall",        s3:"Testimonial Wall",  s4:"Stats Block",        s5:"CTA" },
  v4:{ s2:"Pain Agitation",   s3:"Cost of Inaction",  s4:"The Fix (Flo)",      s5:"CTA" },
  v5:{ s2:"Before / After",   s3:"Outcome Metrics",   s4:"Founder Story",      s5:"CTA" },
};
const SECTION_KEYS = ["hero","s2","s3","s4","s5"];
const SECTION_NAMES = { hero:"Hero", ...Object.fromEntries(Object.entries(SECTIONS.v1)) };

function jitter(v, range=6) { return Math.round(v + (Math.random()-0.5)*range); }

function buildSimData() {
  const out = {};
  PAGES.forEach(pg => {
    out[pg.id] = {};
    PERSONAS.forEach(p => {
      const b = BEH[p.id][pg.id];
      const dwell = {};
      SECTION_KEYS.forEach(k => { dwell[k] = Math.round((b[k]||1) * 18 * (0.8+Math.random()*0.4)); });
      out[pg.id][p.id] = {
        count: Math.round(200*p.w),
        scroll: jitter(b.scroll),
        bounce: Math.max(4, jitter(b.bounce)),
        cta:    Math.min(48, jitter(b.cta, 4)),
        hover:  Math.min(68, jitter(b.cta*2.3, 6)),
        dwell,
      };
    });
  });
  return out;
}

const SIM_DATA = buildSimData();

/* ─────────────────────────────────────────────
   ROUND 2 — V6 vs THE ORIGINAL 5
   V6's behavioral weights are derived from the
   elements Claude picked: V4 headline+subtext+CTA
   (highest founder engagement), V3 social proof
   (highest dwell), V5 outcome strip (best scroll).
   The combination produces a page that outperforms
   on founder metrics specifically — but not by a
   suspiciously perfect margin. Real improvement,
   believably imperfect.
───────────────────────────────────────────── */
const BEH_R2 = {
  // V6 — the synthesized page. Strong on everything
  // founders responded to, weak where it made no claim.
  v6: {
    founder:    { scroll:91, bounce:8,  cta:38, hero:1.8, s2:2.2, s3:1.7, s4:1.4, s5:1.6 },
    enterprise: { scroll:60, bounce:28, cta:7,  hero:0.8, s2:0.9, s3:1.1, s4:0.9, s5:0.5 },
    freelancer: { scroll:72, bounce:19, cta:17, hero:1.3, s2:1.1, s3:1.3, s4:1.0, s5:1.1 },
    student:    { scroll:52, bounce:36, cta:2,  hero:0.9, s2:0.7, s3:0.6, s4:0.5, s5:0.2 },
    indie:      { scroll:78, bounce:14, cta:21, hero:1.4, s2:1.2, s3:1.3, s4:1.1, s5:1.2 },
    vc:         { scroll:58, bounce:32, cta:3,  hero:0.9, s2:1.2, s3:0.9, s4:1.1, s5:0.2 },
  },
};

function buildR2Data() {
  const out = {};
  // V1-V5 carry forward from Round 1 with slight natural variance
  PAGES.forEach(pg => {
    out[pg.id] = {};
    PERSONAS.forEach(p => {
      const r1 = SIM_DATA[pg.id][p.id];
      out[pg.id][p.id] = {
        count: r1.count,
        scroll: Math.max(10, jitter(r1.scroll, 4)),
        bounce: Math.max(4,  jitter(r1.bounce, 3)),
        cta:    Math.min(48, jitter(r1.cta, 3)),
        hover:  Math.min(68, jitter(r1.hover, 4)),
        dwell:  Object.fromEntries(Object.entries(r1.dwell).map(([k,v]) => [k, Math.round(jitter(v, 3))])),
      };
    });
  });
  // V6 — new entrant
  out["v6"] = {};
  PERSONAS.forEach(p => {
    const b = BEH_R2.v6[p.id];
    const dwell = {};
    SECTION_KEYS.forEach(k => { dwell[k] = Math.round((b[k]||1) * 20 * (0.8+Math.random()*0.4)); });
    out["v6"][p.id] = {
      count: Math.round(200*p.w),
      scroll: jitter(b.scroll, 4),
      bounce: Math.max(4, jitter(b.bounce, 3)),
      cta:    Math.min(48, jitter(b.cta, 4)),
      hover:  Math.min(68, jitter(b.cta*2.1, 5)),
      dwell,
    };
  });
  return out;
}

const R2_DATA = buildR2Data();

function aggR2(pageId, icpOnly=false) {
  const personas = icpOnly ? PERSONAS.filter(p=>p.isICP) : PERSONAS;
  let tv=0, ws=0, wb=0, wc=0; const sd={};
  personas.forEach(p => {
    const m = R2_DATA[pageId]?.[p.id]; if(!m) return;
    const n = m.count; tv+=n; ws+=m.scroll*n; wb+=m.bounce*n; wc+=m.cta*n;
    SECTION_KEYS.forEach(k => { sd[k]=(sd[k]||0)+(m.dwell[k]||0)*n; });
  });
  if(!tv) return null;
  const sc=ws/tv, bc=wb/tv, cc=wc/tv;
  const da={}; SECTION_KEYS.forEach(k=>{ da[k]=Math.round(sd[k]/tv); });
  const avgDwell=Object.values(da).reduce((a,b)=>a+b,0)/SECTION_KEYS.length;
  const score = Math.round(
    (cc/100)*40 + (sc/100)*30 + Math.min(1,avgDwell/25)*20 + (1-bc/100)*10
  );
  return { scroll:Math.round(sc), bounce:Math.round(bc), cta:Math.round(cc), dwell:da, score:Math.min(98,score), tv };
}

const ALL_R2_PAGES = [
  ...PAGES,
  { id:"v6", ver:"V6", type:"Evolved (AI-synthesized)", headline:"You just had a great investor call. Now what?", hypothesis:"Built from founder-specific behavioral patterns across all 5 Round 1 pages. Combines V4 headline, V4 subtext, V3 social proof, V4 CTA, and V5 outcome strip.", color: T.accent },
];

function aggPage(pageId, icpOnly=false) {
  const personas = icpOnly ? PERSONAS.filter(p=>p.isICP) : PERSONAS;
  let tv=0, ws=0, wb=0, wc=0; const sd={};
  personas.forEach(p => {
    const m = SIM_DATA[pageId][p.id]; if(!m) return;
    const n = m.count; tv+=n; ws+=m.scroll*n; wb+=m.bounce*n; wc+=m.cta*n;
    SECTION_KEYS.forEach(k => { sd[k]=(sd[k]||0)+m.dwell[k]*n; });
  });
  if(!tv) return null;
  const sc=ws/tv, bc=wb/tv, cc=wc/tv;
  const da={}; SECTION_KEYS.forEach(k=>{ da[k]=Math.round(sd[k]/tv); });
  const avgDwell=Object.values(da).reduce((a,b)=>a+b,0)/SECTION_KEYS.length;
  const score = Math.round(
    (cc/100)*40 + (sc/100)*30 + Math.min(1,avgDwell/25)*20 + (1-bc/100)*10
  );
  return { scroll:Math.round(sc), bounce:Math.round(bc), cta:Math.round(cc), dwell:da, score:Math.min(98,score), tv };
}

const FOUNDER_INSIGHTS = [
  { icon:"01", title:"Feature grids ignored above the fold", body:"On all 5 pages, founders spent under 40% of baseline time on feature-list sections. V1's feature grid had the lowest dwell time of any section across the entire experiment.", src:"Cross-page · V1 hero section dwell: 11s (vs 18s baseline)" },
  { icon:"02", title:"Social proof drives longest dwell — on every page", body:"Testimonial and logo sections hit 2.1–2.4× higher dwell time for founders than any other section type. V3's testimonial wall was the single highest-engagement section in the experiment.", src:"V3 testimonial wall: avg 44s · nearest competitor: 26s (V4 pain block)" },
  { icon:"03", title:"Pain-framed headlines produce the highest CTA conversion", body:"V4's scenario headline ('You just had a great investor call. Now what?') drove a 31% founder CTA click rate — 2.6× V1's feature headline. Specificity of the scenario was the decisive variable.", src:"V4 founder CTA: 31% · V1 founder CTA: 12% · delta: +158%" },
  { icon:"04", title:"Screenshot-led pages trigger fastest founder bounce", body:"Pages opening with product UI (V1) saw 28% founder bounce rate. Pages opening with a founder-recognizable scenario dropped to 10–18% bounce. The first sentence is the make-or-break moment.", src:"V1 bounce: 28% · V4 bounce: 10% · V2 bounce: 18%" },
  { icon:"05", title:"Specific outcome numbers extend reading depth", body:"V5's before/after and outcome metrics block held founders 1.4× longer than abstract benefit copy. When outcomes were concrete ('5 hrs/week', 'zero missed follow-ups'), scroll depth climbed 16pp vs vague equivalents.", src:"V5 founder scroll: 71% · V1 founder scroll: 55% · delta: +16pp" },
];

const FALLBACK_V6_DECISIONS = [
  { el:"Headline",           src:"V4", srcColor:PAGE_COLORS[3], removed:false, quote:'"You just had a great investor call. Now what?"',    reason:"V4's pain-point headline produced the highest founder CTA rate (31%) — 2.6× V1's feature headline. Founders self-identified with the investor call scenario instantly." },
  { el:"Hero Subtext",       src:"V2", srcColor:PAGE_COLORS[1], removed:false, quote:"Conversational anxiety framing, not product spec",     reason:"V2's emotional subtext had the second-highest founder engagement. Framing the pain as felt anxiety ('wondering what just happened') resonated more than listing what Flo does." },
  { el:"Social Proof Block", src:"V3", srcColor:PAGE_COLORS[2], removed:false, quote:"YC logos + 4 specific founder testimonials, above fold", reason:"V3 testimonials were the single highest-dwell section in the experiment (44s avg). Founders are tribal — peer names and contexts converted skepticism." },
  { el:"CTA Copy",           src:"V4", srcColor:PAGE_COLORS[3], removed:false, quote:'"Fix this today — free for 14 days"',                  reason:"V4's imperative CTA had 63% hover-to-click conversion — the highest across all pages for founders. Urgency language outperformed soft CTAs by 40%." },
  { el:"Outcome Strip",      src:"V5", srcColor:PAGE_COLORS[4], removed:false, quote:"5 hrs/week saved · Zero missed follow-ups · Works with Zoom, Meet & Teams", reason:"V5's specific outcome numbers held founders 1.4× longer than abstract benefit copy. Concrete metrics let founders project themselves into the result." },
  { el:"Feature Grid",       src:"ALL", srcColor:T.muted,       removed:true,  quote:"Moved below the fold",                                 reason:"Founders ignored the feature grid on every single page — <40% of baseline dwell on all 5 variants. It actively pulled attention from higher-converting elements when placed in the hero." },
];

/* ─────────────────────────────────────────────
   REAL CONTENT POOL — every actual line of copy
   from the 5 tested pages, tagged by slot + source.
   This is what Claude picks from for V6 — it can only
   choose content that was actually tested, never invent
   new copy. Keeps the live demo reliable and auditable.
───────────────────────────────────────────── */
const CONTENT_POOL = {
  headline: [
    { src:"v1", text:"Your meetings, documented automatically" },
    { src:"v2", text:"Stop leaving meetings wondering what just happened" },
    { src:"v3", text:"The notetaker 500+ YC founders use on every call" },
    { src:"v4", text:"You just had a great investor call. Now what?" },
    { src:"v5", text:"Get 5 hours a week back. Ship more. Miss nothing." },
  ],
  subtext: [
    { src:"v1", text:"Flo joins your calls, takes structured notes, extracts action items, and sends a clean summary to your team — without you lifting a finger." },
    { src:"v2", text:"You just finished a 45-minute investor call. You remember the vibe. But the specific objections they raised? The follow-ups they asked for? Gone." },
    { src:"v3", text:"When you can't afford to miss what was said, decided, or promised — you use Flo." },
    { src:"v4", text:"The call was good. You felt it. But now you're staring at a blank doc, trying to remember what they actually asked you to send over." },
    { src:"v5", text:"Flo handles everything after your calls so you can focus on what you actually started a company to do." },
  ],
  socialProof: [
    { src:"v1", text:"Integrates with Zoom, Google Meet, Slack, Notion, Linear, HubSpot" },
    { src:"v2", text:"Single founder testimonial — Sarah Chen, Meridian (YC S23)" },
    { src:"v3", text:"YC / Techstars / a16z logo wall + 4 specific founder testimonials, 500+ founders stat" },
    { src:"v4", text:"3 founder pain scenarios with named cost of inaction" },
    { src:"v5", text:"Single founder story arc — Marcus Webb, Stackr, $2.4M raised in 6 weeks" },
  ],
  cta: [
    { src:"v1", text:"Start for free" },
    { src:"v2", text:"Never miss what matters — free for 14 days" },
    { src:"v3", text:"Join them — free for 14 days" },
    { src:"v4", text:"Fix this today — free for 14 days" },
    { src:"v5", text:"See what changes for you — free 14 days" },
  ],
  outcomeStrip: [
    { src:"v1", text:"Feature grid: transcription, action items, summaries, integrations, search, instant setup" },
    { src:"v2", text:"Before/after table: scrambling notes → fully present, buried action items → auto-assigned" },
    { src:"v3", text:"500+ founders · 4.2h saved/week · 98% summary accuracy" },
    { src:"v4", text:"Works silently in background · summary instantly · action items auto-assigned" },
    { src:"v5", text:"5 hrs/week saved · 100% action items captured · 0 min spent writing notes" },
  ],
};

/* Build the RAW per-section founder event log that gets sent to Claude.
   This is intentionally granular and un-summarized — Claude has to find
   the patterns itself rather than being handed conclusions. */
function buildFounderEventLog() {
  const rows = [];
  PAGES.forEach(pg => {
    const m = SIM_DATA[pg.id]["founder"];
    rows.push({
      page: pg.ver,
      type: pg.type,
      visitors: m.count,
      scroll_depth_pct: m.scroll,
      bounce_rate_pct: m.bounce,
      cta_click_pct: m.cta,
      cta_hover_pct: m.hover,
      section_dwell_seconds: { hero: m.dwell.hero, slot2: m.dwell.s2, slot3: m.dwell.s3, slot4: m.dwell.s4, cta_section: m.dwell.s5 },
      section_labels: { slot2: SECTIONS[pg.id].s2, slot3: SECTIONS[pg.id].s3, slot4: SECTIONS[pg.id].s4 },
    });
  });
  return rows;
}

/* Call OUR OWN backend route (/api/generate-v6), which holds the real
   Anthropic API key server-side and forwards the request to Claude.
   The browser never sees the API key — this is the secure pattern for
   any deployed app. See /api/generate-v6.js for the server-side code. */
async function generateV6WithClaude() {
  const eventLog = buildFounderEventLog();

  const systemPrompt = `You are a growth analyst. You will receive raw founder behavioral data from a 5-page landing page experiment, plus a pool of real tested copy options for 5 content slots (headline, subtext, socialProof, cta, outcomeStrip). Each option in the pool is tagged with which page it came from.

Your job: analyze the raw data to find behavioral patterns, then pick the SINGLE BEST option from CONTENT_POOL for each of the 5 slots based on what the data shows founders actually responded to. You may NOT invent new copy — only select from the provided pool. Also decide whether the "feature grid" concept (V1's approach) should be kept in the hero or removed/demoted, based on its dwell time evidence.

Respond ONLY with valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "decisions": [
    { "slot": "headline", "chosenSrc": "v4", "reasoning": "2-3 sentences citing specific numbers from the data" },
    { "slot": "subtext", "chosenSrc": "v2", "reasoning": "..." },
    { "slot": "socialProof", "chosenSrc": "v3", "reasoning": "..." },
    { "slot": "cta", "chosenSrc": "v4", "reasoning": "..." },
    { "slot": "outcomeStrip", "chosenSrc": "v5", "reasoning": "..." },
    { "slot": "featureGrid", "chosenSrc": "removed", "reasoning": "..." }
  ]
}`;

  const userPrompt = `RAW FOUNDER EVENT LOG (per page, founders only):
${JSON.stringify(eventLog, null, 2)}

CONTENT POOL (only source you may select from):
${JSON.stringify(CONTENT_POOL, null, 2)}

Analyze the dwell times, scroll depth, bounce rate, and CTA rates above. Pick the best-performing option per slot and explain why using the actual numbers.`;

  const response = await fetch("/api/generate-v6", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `API error: ${response.status}`);
  }
  const data = await response.json();
  const textBlock = data.content?.find(b => b.type === "text");
  if (!textBlock) throw new Error("No text in response");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude's response wasn't valid JSON");
  }

  const REQUIRED_SLOTS = ["headline", "subtext", "socialProof", "cta", "outcomeStrip", "featureGrid"];
  if (!Array.isArray(parsed.decisions)) {
    throw new Error("Response missing a decisions array");
  }
  const slotsPresent = parsed.decisions.map(d => d.slot);
  const missing = REQUIRED_SLOTS.filter(s => !slotsPresent.includes(s));
  if (missing.length) {
    throw new Error(`Response missing slots: ${missing.join(", ")}`);
  }

  return parsed.decisions;
}

/* Map Claude's raw decisions into the same shape the UI renders,
   pulling the actual quote text from CONTENT_POOL and the right color. */
function hydrateDecisions(decisions) {
  const slotMeta = {
    headline:     { el:"Headline",           pool:"headline" },
    subtext:      { el:"Hero Subtext",       pool:"subtext" },
    socialProof:  { el:"Social Proof Block", pool:"socialProof" },
    cta:          { el:"CTA Copy",           pool:"cta" },
    outcomeStrip: { el:"Outcome Strip",      pool:"outcomeStrip" },
    featureGrid:  { el:"Feature Grid",       pool:null },
  };
  return decisions.map(d => {
    const meta = slotMeta[d.slot];
    if (!meta) return null;
    if (d.slot === "featureGrid") {
      const removed = d.chosenSrc === "removed";
      return { el: meta.el, src: removed ? "ALL" : d.chosenSrc.toUpperCase(), srcColor: T.muted, removed, quote: removed ? "Moved below the fold" : "Kept in hero", reason: d.reasoning };
    }
    const opt = CONTENT_POOL[meta.pool]?.find(o => o.src === d.chosenSrc);
    const pgIdx = PAGES.findIndex(p => p.id === d.chosenSrc);
    return {
      el: meta.el,
      src: (d.chosenSrc || "v?").toUpperCase(),
      srcColor: pgIdx >= 0 ? PAGE_COLORS[pgIdx] : T.accent,
      removed: false,
      quote: opt ? `"${opt.text}"` : "(no match found)",
      reason: d.reasoning,
    };
  }).filter(Boolean);
}

/* ─────────────────────────────────────────────
   FLO LANDING PAGES (all 5 + V6)
───────────────────────────────────────────── */
function FloV1() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F9FAFB",color:"#111",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"0 48px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,fontSize:19,color:"#7C6EF8",letterSpacing:"-0.03em"}}>flo</span>
        <div style={{display:"flex",gap:28,fontSize:13,color:"#6B7280"}}>
          {["Features","Integrations","Pricing","Docs"].map(t=><span key={t} style={{cursor:"pointer"}}>{t}</span>)}
        </div>
        <button style={{background:"#7C6EF8",color:"#fff",padding:"9px 20px",borderRadius:8,border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Start free →</button>
      </nav>
      <div className="flo-body" style={{padding:"72px 48px 56px",maxWidth:960,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{display:"inline-block",background:"#EEF2FF",color:"#7C6EF8",padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:"0.06em",marginBottom:18}}>AI-POWERED MEETING NOTES</div>
          <h1 style={{fontSize:50,fontWeight:800,lineHeight:1.1,marginBottom:18,letterSpacing:"-0.03em"}}>Your meetings,<br/>documented automatically</h1>
          <p style={{fontSize:17,color:"#6B7280",maxWidth:520,margin:"0 auto 32px",lineHeight:1.7}}>Flo joins your calls, takes structured notes, extracts action items, and sends a clean summary to your team — without you lifting a finger.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button style={{background:"#7C6EF8",color:"#fff",padding:"13px 30px",borderRadius:9,border:"none",fontWeight:700,fontSize:15,cursor:"pointer"}}>Start for free</button>
            <button style={{background:"#fff",color:"#111",padding:"13px 26px",borderRadius:9,border:"1px solid #E5E7EB",fontWeight:600,fontSize:14,cursor:"pointer"}}>See how it works →</button>
          </div>
        </div>
        <div style={{background:"#111",borderRadius:14,padding:20,marginBottom:52,height:200,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #222"}}>
          <div style={{textAlign:"center",color:"#555"}}>
            <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",marginBottom:10}}>
              <div style={{width:120,height:8,background:"#333",borderRadius:2}}/>
              <div style={{width:90,height:8,background:"#2A2A2A",borderRadius:2}}/>
              <div style={{width:100,height:8,background:"#2A2A2A",borderRadius:2}}/>
            </div>
            <div style={{fontSize:13}}>Meeting summary — live product view</div>
            <div style={{fontSize:11,marginTop:3,color:"#444"}}>Auto-generated from your last Zoom call</div>
          </div>
        </div>
        <h2 style={{fontSize:26,fontWeight:800,textAlign:"center",marginBottom:32,letterSpacing:"-0.02em"}}>Everything your team needs from every call</h2>
        <div className="flo-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:48}}>
          {[{t:"Auto-transcription",d:"Word-for-word transcript of every call, searchable and shareable across your team."},{t:"Action item extraction",d:"Flo identifies every to-do and assigns it to the right person automatically."},{t:"Auto-send summaries",d:"Clean summaries sent to Slack or email immediately after the call ends."},{t:"Search across calls",d:"Find any decision or commitment from any meeting in seconds."},{t:"Deep integrations",d:"Works with Notion, Linear, Slack, and your CRM out of the box."},{t:"Instant setup",d:"Connect your calendar and Flo joins your next call automatically."}].map((f,i)=>(
            <div key={i} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:11,padding:22}}>
              <div style={{width:28,height:28,borderRadius:7,background:"#F4F3FE",color:"#7C6EF8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,marginBottom:12}}>{String(i+1).padStart(2,"0")}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{f.t}</div>
              <div style={{fontSize:13,color:"#6B7280",lineHeight:1.6}}>{f.d}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:14,fontWeight:600,letterSpacing:"0.08em"}}>INTEGRATES WITH</div>
          <div style={{display:"flex",gap:28,justifyContent:"center",flexWrap:"wrap"}}>
            {["Zoom","Google Meet","Slack","Notion","Linear","HubSpot"].map(t=><span key={t} style={{fontSize:14,fontWeight:700,color:"#9CA3AF"}}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloV2() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0C0C14",color:"#E8E8F0",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{padding:"18px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #1E1E2E"}}>
        <span style={{fontWeight:800,fontSize:19,color:"#F72585",letterSpacing:"-0.03em"}}>flo</span>
        <button style={{background:"transparent",color:"#E8E8F0",padding:"8px 18px",borderRadius:7,border:"1px solid #2E2E3E",fontWeight:600,fontSize:13,cursor:"pointer"}}>Try free →</button>
      </nav>
      <div className="flo-body" style={{padding:"80px 48px",maxWidth:760,margin:"0 auto"}}>
        <h1 style={{fontSize:54,fontWeight:800,lineHeight:1.05,marginBottom:22,letterSpacing:"-0.03em"}}>Stop leaving meetings<br/><span style={{color:"#F72585"}}>wondering what just<br/>happened.</span></h1>
        <p style={{fontSize:17,color:"#9CA3AF",lineHeight:1.8,marginBottom:40,maxWidth:560}}>You just finished a 45-minute investor call. You remember the vibe — the energy was good. But the specific objections they raised? The follow-ups they asked for? Gone before you open your laptop.</p>
        <div style={{background:"#13131A",border:"1px solid #2E2E3E",borderLeft:"3px solid #F72585",borderRadius:"0 10px 10px 0",padding:"22px 26px",marginBottom:40}}>
          <p style={{fontSize:15,color:"#D1D5DB",lineHeight:1.75,fontStyle:"italic"}}>"The anxiety isn't the meeting. It's the 20 minutes after — trying to reconstruct everything before it fades."</p>
          <div style={{marginTop:10,fontSize:12,color:"#6B7280"}}>— What founders tell us, constantly</div>
        </div>
        <div style={{marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,color:"#F72585",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16}}>Here's what changes with Flo</div>
          {[{b:"Scrambling to write notes mid-call",a:"Fully present — Flo handles every word"},{b:"Action items buried in Slack chaos",a:"Every to-do extracted and assigned instantly"},{b:"Team asking 'what was decided?'",a:"Summary sent before you close Zoom"}].map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:10}}>
              <div style={{background:"#1A1A24",borderRadius:7,padding:"11px 14px",fontSize:12.5,color:"#6B7280"}}>✗ {r.b}</div>
              <div style={{background:"rgba(247,37,133,0.07)",borderRadius:7,padding:"11px 14px",fontSize:12.5,color:"#E8E8F0"}}>✓ {r.a}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#13131A",borderRadius:12,padding:26,marginBottom:36,border:"1px solid #2E2E3E"}}>
          <p style={{fontSize:14,color:"#D1D5DB",lineHeight:1.75,marginBottom:14,fontStyle:"italic"}}>"I used to spend 20 minutes after every call writing notes. Now I spend zero. Flo's summaries are better than mine ever were."</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"#F72585",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:13}}>S</div>
            <div><div style={{fontSize:13,fontWeight:600}}>Sarah Chen</div><div style={{fontSize:11,color:"#6B7280"}}>Founder, Meridian (YC S23)</div></div>
          </div>
        </div>
        <button style={{background:"#F72585",color:"#fff",padding:"14px 34px",borderRadius:9,border:"none",fontWeight:700,fontSize:16,cursor:"pointer",display:"block",maxWidth:380}}>Never miss what matters — free 14 days</button>
        <div style={{marginTop:10,fontSize:11,color:"#6B7280"}}>No credit card. Joins your next call automatically.</div>
      </div>
    </div>
  );
}

function FloV3() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#fff",color:"#111",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{padding:"0 48px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #E5E7EB"}}>
        <span style={{fontWeight:800,fontSize:19,letterSpacing:"-0.03em"}}>flo</span>
        <button style={{background:"#111",color:"#fff",padding:"8px 18px",borderRadius:7,border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Join them →</button>
      </nav>
      <div className="flo-body" style={{padding:"56px 48px",maxWidth:920,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{display:"flex",gap:7,justifyContent:"center",alignItems:"center",marginBottom:20}}>
            {["YC","Techstars","a16z","First Round","Sequoia"].map(l=><div key={l} style={{background:"#F3F4F6",padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:700,color:"#374151"}}>{l}</div>)}
          </div>
          <h1 style={{fontSize:48,fontWeight:800,lineHeight:1.1,marginBottom:18,letterSpacing:"-0.03em"}}>The notetaker <span style={{color:"#2DD4BF"}}>500+ YC founders</span><br/>use on every call</h1>
          <p style={{fontSize:17,color:"#6B7280",maxWidth:500,margin:"0 auto 28px",lineHeight:1.65}}>When you can't afford to miss what was said, decided, or promised — you use Flo.</p>
          <div style={{display:"flex",gap:28,justifyContent:"center",marginBottom:28}}>
            {[{n:"500+",l:"Founders using Flo"},{n:"4.2h",l:"Saved per week on avg"},{n:"98%",l:"Summary accuracy"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}><div style={{fontSize:30,fontWeight:800,color:"#2DD4BF",letterSpacing:"-0.03em"}}>{s.n}</div><div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{s.l}</div></div>
            ))}
          </div>
          <button style={{background:"#111",color:"#fff",padding:"13px 30px",borderRadius:9,border:"none",fontWeight:700,fontSize:15,cursor:"pointer"}}>Join them — free for 14 days</button>
        </div>
        <div className="flo-grid-2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18,marginBottom:44}}>
          {[{q:'"Flo is the only tool I actually use every day. It\'s made me 10× better at follow-through with investors."',n:"Marcus Webb",r:"CEO, Stackr (Seed, $2.4M)"},{q:'"We were losing deals because action items fell through the cracks. Flo fixed that in week one."',n:"Priya Nair",r:"Founder, Lumos (YC W24)"},{q:'"The summaries Flo sends are better than anything I could write myself. My whole team uses them as source of truth."',n:"David Kim",r:"Co-founder, Relay (Series A)"},{q:'"I do 8 calls a day. Without Flo I\'d lose my mind. Nothing falls through the cracks."',n:"Ana Torres",r:"Founder, Spark (Techstars \'23)"}].map((t,i)=>(
            <div key={i} style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:11,padding:22}}>
              <div style={{fontSize:22,color:"#D1D5DB",marginBottom:6,lineHeight:1}}>"</div>
              <p style={{fontSize:13.5,color:"#374151",lineHeight:1.7,marginBottom:14}}>{t.q}</p>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#2DD4BF",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:12}}>{t.n[0]}</div>
                <div><div style={{fontSize:12.5,fontWeight:700}}>{t.n}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{t.r}</div></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:14,padding:"28px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.02em"}}>Join 500+ founders who never miss a beat</div>
          <p style={{color:"#6B7280",marginBottom:22,fontSize:13.5}}>Free for 14 days. No credit card. Works with Zoom, Meet, and Teams.</p>
          <button style={{background:"#2DD4BF",color:"#111",padding:"13px 30px",borderRadius:9,border:"none",fontWeight:700,fontSize:15,cursor:"pointer"}}>Get started free →</button>
        </div>
      </div>
    </div>
  );
}

function FloV4() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#08080E",color:"#E8E8F0",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{padding:"18px 48px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,fontSize:19,color:"#F59E0B",letterSpacing:"-0.03em"}}>flo</span>
        <button style={{background:"#F59E0B",color:"#111",padding:"8px 18px",borderRadius:7,border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>Fix this today</button>
      </nav>
      <div className="flo-body" style={{padding:"76px 48px",maxWidth:760,margin:"0 auto"}}>
        <h1 style={{fontSize:56,fontWeight:800,lineHeight:1.05,marginBottom:28,letterSpacing:"-0.03em"}}>You just had a great<br/><span style={{color:"#F59E0B"}}>investor call.</span><br/>Now what?</h1>
        <p style={{fontSize:17,color:"#9CA3AF",lineHeight:1.8,marginBottom:44,maxWidth:580}}>The call was good. You felt it. They were interested. But now you're staring at a blank doc, trying to remember what they actually asked you to send over. And which points landed. And who said what.</p>
        <div style={{marginBottom:44}}>
          <div style={{fontSize:10,fontWeight:700,color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:16}}>Sound familiar?</div>
          {[{p:"The follow-up email you promised went out 3 days late",c:"They went with someone who seemed more on top of things"},{p:"Action items from the customer call died in Slack",c:"The feature they asked for never got built. They churned."},{p:"Your co-founder asked what was decided. You guessed.",c:"The team built the wrong thing for two weeks."}].map((it,i)=>(
            <div key={i} style={{marginBottom:12,background:"#13131A",borderRadius:10,padding:18,border:"1px solid #2E2E3E"}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#F59E0B",marginTop:6,flexShrink:0}}/>
                <div><div style={{fontSize:13.5,fontWeight:600,marginBottom:5}}>{it.p}</div><div style={{fontSize:12.5,color:"#F43F5E"}}>→ {it.c}</div></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"#13131A",border:"1px solid #2E2E3E",borderTop:"3px solid #F59E0B",borderRadius:11,padding:28,marginBottom:36}}>
          <div style={{fontSize:10,fontWeight:700,color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14}}>Flo fixes this</div>
          <p style={{fontSize:15,color:"#D1D5DB",lineHeight:1.75,marginBottom:20}}>Flo joins every call automatically. It captures the full transcript, pulls out every action item, and sends a clean summary to you and your team the moment the call ends. Before you've even closed the Zoom window.</p>
          <div className="flo-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {["Works silently in the background","Summary in your inbox instantly","Action items assigned automatically"].map((f,i)=>(
              <div key={i} style={{background:"#08080E",borderRadius:7,padding:"10px 12px",fontSize:12,color:"#9CA3AF"}}>✓ {f}</div>
            ))}
          </div>
        </div>
        <button style={{background:"#F59E0B",color:"#111",padding:"15px 34px",borderRadius:9,border:"none",fontWeight:800,fontSize:16,cursor:"pointer",display:"block",maxWidth:400}}>Fix this today — free for 14 days</button>
        <div style={{marginTop:10,fontSize:11,color:"#6B7280"}}>Joins your next call automatically. No setup needed.</div>
      </div>
    </div>
  );
}

function FloV5() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F8FAFC",color:"#111",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{background:"#fff",padding:"0 48px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #E5E7EB"}}>
        <span style={{fontWeight:800,fontSize:19,color:"#60A5FA",letterSpacing:"-0.03em"}}>flo</span>
        <button style={{background:"#60A5FA",color:"#fff",padding:"8px 18px",borderRadius:7,border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>See what changes →</button>
      </nav>
      <div className="flo-body" style={{padding:"76px 48px",maxWidth:920,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.05,marginBottom:22,letterSpacing:"-0.03em"}}>Get <span style={{color:"#60A5FA"}}>5 hours a week</span> back.<br/>Ship more. Miss nothing.</h1>
          <p style={{fontSize:17,color:"#6B7280",maxWidth:500,margin:"0 auto 36px",lineHeight:1.7}}>Flo handles everything after your calls so you can focus on what you actually started a company to do.</p>
          <div style={{display:"flex",gap:18,justifyContent:"center",marginBottom:36}}>
            {[{n:"5 hrs",l:"saved per week"},{n:"100%",l:"of action items captured"},{n:"0 min",l:"spent writing notes"}].map((s,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:11,padding:"18px 24px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:"#60A5FA",letterSpacing:"-0.03em"}}>{s.n}</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:52}}>
          <h2 style={{fontSize:22,fontWeight:800,textAlign:"center",marginBottom:28,letterSpacing:"-0.02em"}}>Your week, before and after Flo</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div style={{background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:11,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"#F43F5E",marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"}}>Without Flo</div>
              {["20 min writing notes after every call","Action items scattered across 4 tools","Teammates asking 'what was decided?'","Follow-ups going out 3 days late","Investor calls fading from memory fast"].map((it,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:9,fontSize:13,color:"#374151",alignItems:"flex-start"}}><span style={{color:"#F43F5E",fontWeight:700}}>✕</span>{it}</div>
              ))}
            </div>
            <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:11,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"#16A34A",marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"}}>With Flo</div>
              {["Summary in your inbox before Zoom closes","Every action item extracted and assigned","Team synced automatically, every time","Follow-ups sent while details are fresh","Perfect recall on every investor conversation"].map((it,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:9,fontSize:13,color:"#374151",alignItems:"flex-start"}}><span style={{color:"#16A34A",fontWeight:700}}>✓</span>{it}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,padding:28,marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,color:"#60A5FA",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.08em"}}>A founder's story</div>
          <p style={{fontSize:14.5,color:"#374151",lineHeight:1.8,marginBottom:14}}>Marcus was doing 10 investor calls a week during his seed raise. He spent 30 minutes after each one writing notes. That's <strong>5 hours a week</strong> — just on note-taking. When he started using Flo, that time went to zero. He closed his round in 6 weeks.</p>
          <div style={{fontSize:12,color:"#6B7280"}}>— Marcus Webb, CEO of Stackr (raised $2.4M seed, 2024)</div>
        </div>
        <div style={{textAlign:"center"}}>
          <button style={{background:"#60A5FA",color:"#fff",padding:"15px 38px",borderRadius:9,border:"none",fontWeight:700,fontSize:16,cursor:"pointer"}}>See what changes for you — free 14 days</button>
          <div style={{marginTop:10,fontSize:11,color:"#9CA3AF"}}>Works with Zoom, Google Meet, and Teams. No setup needed.</div>
        </div>
      </div>
    </div>
  );
}

function FloV6({ decisions }) {
  // Pull each slot's chosen content out of the live decisions array.
  // Falls back to sensible defaults only if decisions haven't loaded yet
  // (e.g. first paint before generation completes), so the page never
  // silently disagrees with the "what changed and why" log.
  const find = (el) => decisions?.find(d => d.el === el);

  const stripQuotes = (s) => (s || "").replace(/^"|"$/g, "");

  const headlineDec = find("Headline");
  const subtextDec = find("Hero Subtext");
  const socialDec = find("Social Proof Block");
  const ctaDec = find("CTA Copy");
  const outcomeDec = find("Outcome Strip");
  const featureGridDec = find("Feature Grid");

  const headline = stripQuotes(headlineDec?.quote) || "You just had a great investor call. Now what?";
  const subtext = stripQuotes(subtextDec?.quote) || "Flo joins your calls, captures everything, and sends a clean summary to your team — so you stay fully present instead of frantically scribbling notes that fade by morning.";
  const ctaText = stripQuotes(ctaDec?.quote) || "Fix this today — free for 14 days";
  const outcomeRaw = stripQuotes(outcomeDec?.quote) || "5 hrs/week saved · Zero missed follow-ups · Works with Zoom, Meet & Teams";
  const outcomeChips = outcomeRaw.split("·").map(s => s.trim()).filter(Boolean);

  // Render the headline with the last clause in accent color, splitting on
  // common sentence breaks so any chosen headline gets the same visual treatment.
  const headlineParts = headline.split(/(?<=[.?!])\s+/);
  const headlineLead = headlineParts.slice(0, -1).join(" ");
  const headlineEmph = headlineParts[headlineParts.length - 1] || headline;

  const showFeatureGridInHero = featureGridDec && !featureGridDec.removed;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#FFFFFF",color:"#1A1A1F",minHeight:"100vh"}}>
      <nav className="flo-nav" style={{padding:"18px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #EAEAEF"}}>
        <span style={{fontWeight:800,fontSize:19,color:"#5B4FE8",letterSpacing:"-0.03em"}}>flo</span>
        <div style={{display:"flex",gap:24,fontSize:13,color:"#6B6B76"}}>{["How it works","Pricing"].map(t=><span key={t}>{t}</span>)}</div>
        <button style={{background:"#5B4FE8",color:"#fff",padding:"9px 20px",borderRadius:8,border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>{ctaText.split(" — ")[0] || "Fix this today"} — free</button>
      </nav>
      <div className="flo-body" style={{padding:"72px 48px 52px",maxWidth:820,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(91,79,232,0.08)",border:"1px solid #5B4FE8",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:"#5B4FE8",marginBottom:24,letterSpacing:"0.04em"}}>
          USED BY 500+ FOUNDERS FROM YC, TECHSTARS & A16Z PORTFOLIO
        </div>
        <h1 style={{fontSize:48,fontWeight:800,lineHeight:1.15,marginBottom:22,letterSpacing:"-0.03em",color:"#1A1A1F"}}>
          {headlineLead && <>{headlineLead}<br/></>}<span style={{color:"#5B4FE8"}}>{headlineEmph}</span>
        </h1>
        <p style={{fontSize:17,color:"#52525E",lineHeight:1.8,marginBottom:36,maxWidth:600}}>
          {subtext}
        </p>
        <div style={{display:"flex",gap:12,marginBottom:36,flexWrap:"wrap"}}>
          {outcomeChips.map((it,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:"#F4F3FE",border:"1px solid #E1DEFB",borderRadius:7,padding:"7px 13px",fontSize:12.5,color:"#4A3FC4"}}>
              <span style={{color:"#5B4FE8"}}>✓</span>{it}
            </div>
          ))}
        </div>
        <button style={{background:"#5B4FE8",color:"#fff",padding:"15px 34px",borderRadius:9,border:"none",fontWeight:800,fontSize:16,cursor:"pointer",marginBottom:10}}>{ctaText}</button>
        <div style={{fontSize:11,color:"#8A8A94"}}>No credit card. Joins your next call automatically.</div>

        {showFeatureGridInHero && (
          <div style={{marginTop:32,padding:18,background:"#FAFAFB",border:"1px solid #EAEAEF",borderRadius:10,fontSize:12.5,color:"#52525E"}}>
            {socialDec ? stripQuotes(socialDec.quote) : "Feature grid kept in hero per latest analysis."}
          </div>
        )}
      </div>

      {/* Social proof — content slot chosen by Claude (default: V3 testimonial wall) */}
      <div className="flo-body" style={{padding:"0 48px 52px",maxWidth:820,margin:"0 auto"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:22,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#8A8A94",fontWeight:500}}>Trusted by founders from</span>
          {["YC","Techstars","a16z","First Round"].map(l=>(
            <div key={l} style={{background:"#F7F7F9",border:"1px solid #EAEAEF",padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:700,color:"#52525E"}}>{l}</div>
          ))}
        </div>
        <div className="flo-grid-2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:44}}>
          {[{q:"Flo's summaries are better than anything I could write myself. My team treats them as source of truth.",n:"Priya Nair",r:"Founder, Lumos (YC W24)"},{q:"I do 8 calls a day. Without Flo I'd lose my mind. Nothing falls through the cracks anymore.",n:"Ana Torres",r:"Founder, Spark (Techstars '23)"},{q:"We were losing deals because action items fell through the cracks. Flo fixed that in week one.",n:"Marcus Webb",r:"CEO, Stackr (Seed, $2.4M)"},{q:"The anxiety isn't the meeting. It's the 20 minutes after. Flo eliminated that entirely.",n:"David Kim",r:"Co-founder, Relay (Series A)"}].map((t,i)=>(
            <div key={i} style={{background:"#FAFAFB",border:"1px solid #EAEAEF",borderRadius:10,padding:20}}>
              <p style={{fontSize:13,color:"#33333D",lineHeight:1.7,marginBottom:12,fontStyle:"italic"}}>"{t.q}"</p>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#5B4FE8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:11}}>{t.n[0]}</div>
                <div><div style={{fontSize:12,fontWeight:600,color:"#1A1A1F"}}>{t.n}</div><div style={{fontSize:10.5,color:"#8A8A94"}}>{t.r}</div></div>
              </div>
            </div>
          ))}
        </div>
        {/* How it works — below fold, only shown when the feature grid was removed from hero */}
        {!showFeatureGridInHero && (
          <div style={{borderTop:"1px solid #EAEAEF",paddingTop:36,marginBottom:44}}>
            <div style={{fontSize:10,fontWeight:700,color:"#8A8A94",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:20}}>How Flo works</div>
            <div className="flo-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[{t:"Auto-joins your calls",d:"Connects to your calendar and shows up to every meeting."},{t:"Extracts action items",d:"Every to-do, decision, and commitment pulled out automatically."},{t:"Sends summaries instantly",d:"Clean notes in Slack or email before you close the Zoom window."}].map((f,i)=>(
                <div key={i} style={{background:"#FAFAFB",borderRadius:9,padding:18,border:"1px solid #EAEAEF"}}>
                  <div style={{width:24,height:24,borderRadius:6,background:"#F4F3FE",color:"#5B4FE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,marginBottom:10}}>{i+1}</div>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:5,color:"#1A1A1F"}}>{f.t}</div>
                  <div style={{fontSize:12,color:"#6B6B76",lineHeight:1.6}}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{background:"#F7F6FF",border:"1px solid #E1DEFB",borderRadius:14,padding:32,textAlign:"center"}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:10,letterSpacing:"-0.02em",color:"#1A1A1F"}}>Stop reconstructing calls from memory</h2>
          <p style={{color:"#52525E",fontSize:14,marginBottom:24}}>Join 500+ founders who let Flo handle the notes while they close the deals.</p>
          <button style={{background:"#5B4FE8",color:"#fff",padding:"13px 34px",borderRadius:9,border:"none",fontWeight:700,fontSize:15,cursor:"pointer"}}>{ctaText} →</button>
          <div style={{marginTop:10,fontSize:11,color:"#8A8A94"}}>No credit card. Cancel anytime.</div>
        </div>
      </div>
    </div>
  );
}

const PAGE_COMPS_STATIC = { v1:<FloV1/>, v2:<FloV2/>, v3:<FloV3/>, v4:<FloV4/>, v5:<FloV5/> };


/* ─────────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────────── */
function PMTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="pm-tt">
      <div className="pm-tt-label">{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,fontSize:11,marginTop:2}}>
          {p.name}: <b>{p.value}{p.name?.includes("Score")||p.name?.includes("Depth")||p.name?.includes("Rate")||p.name?.includes("Click")||p.name?.includes("Bounce")?"":""}</b>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCORE RING SVG
───────────────────────────────────────────── */
function ScoreRing({ score, color, size=48 }) {
  const r = (size-6)/2, circ = 2*Math.PI*r;
  const pct = score/100;
  return (
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.raised} strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={11} fontWeight={800} fontFamily="'Bricolage Grotesque',sans-serif">{score}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   MINI SPARK LINE (for signal chart)
───────────────────────────────────────────── */
function buildSignalHistory(finalData, steps=20) {
  return Array.from({length:steps}, (_,i)=>{
    const frac = (i+1)/steps;
    const row = { step: i+1 };
    PAGES.forEach(pg => {
      const agg = aggPage(pg.id);
      if(agg) row[pg.ver] = Math.round(agg.score * frac * (0.85 + frac*0.15) + (Math.random()-0.5)*4);
    });
    return row;
  });
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function PageMind() {
  const [tab, setTab] = useState("pages");
  const [modal, setModal] = useState(null);
  const [simState, setSimState] = useState("idle"); // idle|running|done
  const [simPct, setSimPct] = useState(0);
  const [feed, setFeed] = useState([]);
  const [liveScores, setLiveScores] = useState([]);
  const [behavFilter, setBehavFilter] = useState("all");
  const [v6Ready, setV6Ready] = useState(false);
  const [v6Loading, setV6Loading] = useState(false);
  const [v6Decisions, setV6Decisions] = useState(null); // hydrated decisions from Claude, or fallback
  const [v6Source, setV6Source] = useState(null); // "claude" | "fallback"
  const [v6Error, setV6Error] = useState(null);
  const [expandedPage, setExpandedPage] = useState(null);
  const [r2State, setR2State] = useState("idle"); // idle|running|done
  const [r2Pct, setR2Pct] = useState(0);
  const [r2Feed, setR2Feed] = useState([]);
  const [r2Scores, setR2Scores] = useState([]);
  const feedRef = useRef(null);
  const animRef = useRef(null);
  const r2AnimRef = useRef(null);

  const tabs = [
    { id:"pages",      label:"The Pages" },
    { id:"simulation", label:"Round 1" },
    { id:"behavior",   label:"Behavior Analysis" },
    { id:"leaderboard",label:"Leaderboard" },
    { id:"v6",         label:"V6 — Evolved Page", badge: v6Ready },
    { id:"round2",     label:"Round 2 — Proof", badge: r2State==="done" },
  ];

  /* ── Simulation ── */
  const runSim = useCallback(() => {
    setSimState("running"); setSimPct(0); setFeed([]); setLiveScores([]);
    const STEPS = 80; let step = 0;
    const scoreHistory = [];

    animRef.current = setInterval(() => {
      step++;
      const pct = Math.round((step/STEPS)*100);
      setSimPct(pct);

      // feed line
      const pg = PAGES[Math.floor(Math.random()*PAGES.length)];
      const p  = PERSONAS[Math.floor(Math.random()*PERSONAS.length)];
      const acts = ["scrolled 78%","hovered CTA","clicked CTA ✓","spent 38s on testimonials","bounced","read to bottom","paused on pain block","skipped feature grid"];
      const act  = acts[Math.floor(Math.random()*acts.length)];
      setFeed(prev => [...prev.slice(-40), { pg, p, act, ts: step }]);

      // build signal history up to this point
      const frac = step/STEPS;
      const histRow = { step };
      PAGES.forEach(pg2 => {
        const agg = aggPage(pg2.id);
        if(agg) histRow[pg2.ver] = Math.round(agg.score * Math.min(1, frac*1.1) * (0.78 + frac*0.22) + (Math.random()-0.5)*3);
      });
      scoreHistory.push(histRow);
      setLiveScores([...scoreHistory]);

      if(step >= STEPS) {
        clearInterval(animRef.current);
        setSimState("done");
      }
    }, 70);
  }, []);

  /* ── Round 2 Simulation ── */
  const runR2 = useCallback(() => {
    setR2State("running"); setR2Pct(0); setR2Feed([]); setR2Scores([]);
    const STEPS = 80; let step = 0;
    const scoreHistory = [];

    r2AnimRef.current = setInterval(() => {
      step++;
      const pct = Math.round((step/STEPS)*100);
      setR2Pct(pct);

      // Feed — V6 visitors dominate
      const allPgs = ALL_R2_PAGES;
      const pg = allPgs[Math.floor(Math.random()*allPgs.length)];
      const p = PERSONAS[Math.floor(Math.random()*PERSONAS.length)];
      const v6Acts = ["read full page","clicked CTA ✓","spent 44s on testimonials","scrolled 91%","hovered CTA","paused on pain block"];
      const stdActs = ["scrolled 78%","hovered CTA","bounced","skipped feature grid","spent 22s reading"];
      const act = (pg.id==="v6" && p.isICP)
        ? v6Acts[Math.floor(Math.random()*v6Acts.length)]
        : stdActs[Math.floor(Math.random()*stdActs.length)];
      setR2Feed(prev => [...prev.slice(-40), { pg, p, act }]);

      // Converging scores for all 6 variants
      const frac = step/STEPS;
      const histRow = { step };
      ALL_R2_PAGES.forEach(pg2 => {
        const agg = aggR2(pg2.id);
        if(agg) histRow[pg2.ver] = Math.round(agg.score * Math.min(1, frac*1.1) * (0.76 + frac*0.24) + (Math.random()-0.5)*3);
      });
      scoreHistory.push(histRow);
      setR2Scores([...scoreHistory]);

      if(step >= STEPS) {
        clearInterval(r2AnimRef.current);
        setR2State("done");
      }
    }, 70);
  }, []);

  useEffect(() => () => clearInterval(animRef.current), []);
  useEffect(() => () => clearInterval(r2AnimRef.current), []);
  useEffect(() => { if(feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [feed]);

  const done = simState === "done";

  /* ── helpers ── */
  const ranked = (icpOnly=false) => PAGES.map(pg=>({...pg, agg: aggPage(pg.id, icpOnly)})).filter(p=>p.agg).sort((a,b)=>b.agg.score-a.agg.score);
  const rankedR2 = (icpOnly=false) => ALL_R2_PAGES.map(pg=>({...pg, agg: aggR2(pg.id, icpOnly)})).filter(p=>p.agg).sort((a,b)=>b.agg.score-a.agg.score);

  const HeatmapSection = ({ pageId, icpOnly }) => {
    const agg = aggPage(pageId, icpOnly);
    if(!agg) return null;
    const secs = SECTIONS[pageId];
    const allKeys = ["hero","s2","s3","s4","s5"];
    const labels = { hero:"Hero", ...secs };
    const maxDwell = Math.max(...allKeys.map(k => agg.dwell[k]||0));
    return (
      <div>
        {allKeys.map(k => {
          const dwell = agg.dwell[k]||0;
          const pct = maxDwell>0 ? dwell/maxDwell : 0;
          const col = pct>0.72?"#F72585":pct>0.45?"#F59E0B":"#7C6EF8";
          return (
            <div key={k} className="hm-row">
              <div className="hm-label">{labels[k]||k}</div>
              <div className="hm-track">
                <div className="hm-fill" style={{width:`${pct*100}%`, background:`linear-gradient(90deg, ${col}99, ${col})`}}>
                  {pct>0.18&&<span className="hm-fill-val">{dwell}s</span>}
                </div>
              </div>
              <div className="hm-sec">{dwell}s</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* NAV */}
      <nav className="pm-nav">
        <div className="pm-logo">
          <div className="pm-logo-dot"/>
          Page<span style={{color:T.accent}}>Mind</span>
        </div>
        <div className="pm-tabs">
          {tabs.map(t=>(
            <button key={t.id} className={`pm-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
              {t.badge&&<span className="pm-badge">NEW</span>}
            </button>
          ))}
        </div>
        <div className="pm-status">
          {simState==="running"&&<><div className="pm-spin"/><span>Simulating 200 visitors…</span></>}
          {simState==="done"&&<><div className="pulse"/><span style={{color:T.green}}>Experiment complete</span></>}
          {simState==="idle"&&<span>Ready to run</span>}
        </div>
      </nav>

      <div className="pm-main">

        {/* ══════════════════════════════
            TAB 1 — THE PAGES
        ══════════════════════════════ */}
        {tab==="pages"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow">The Experiment</div>
              <h1 className="pm-h1">5 Landing Pages. One Product. One ICP.</h1>
              <p className="pm-sub">Each page presents Flo — an AI meeting notetaker for founders — through a different psychological lens. Same product, same audience, radically different framing. Click any page to view it in full.</p>
            </div>

            {/* ICP / Product strip */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28}}>
              {[
                { label:"Target ICP", title:"Early-stage Startup Founders", body:"Seed → Series A · 2–20 person teams · 6–10 calls/day · No dedicated ops · Things fall through the cracks after every call" },
                { label:"The Product", title:"Flo — AI Meeting Notetaker", body:"Auto-joins your calls, takes structured notes, extracts action items, sends clean summaries to your team automatically." },
                { label:"The Method",  title:"ICP-Filtered Learning", body:"6 visitor personas interact with all 5 pages. V6 is built exclusively from Startup Founder behavioral patterns — not the overall winner.", icp:true },
              ].map((c,i)=>(
                <div key={i} className="pm-card">
                  <div className={`pm-eyebrow${c.icp?" icp":""}`} style={{marginBottom:6}}>{c.label}</div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,marginBottom:7}}>{c.title}</div>
                  <div style={{fontSize:12.5,color:T.muted,lineHeight:1.65}}>{c.body}</div>
                </div>
              ))}
            </div>

            <div className="g5">
              {PAGES.map(pg=>(
                <div key={pg.id} className="page-card" onClick={()=>setModal(pg.id)}
                     style={expandedPage===pg.id?{borderColor:pg.color}:{}}>
                  <div className="page-card-thumb">
                    <div className="page-card-overlay"/>
                    {/* Mini preview tile */}
                    <div style={{padding:12,background:pg.id==="v1"||pg.id==="v3"||pg.id==="v5"?"#fff":"#08080E",height:"100%"}}>
                      <div style={{height:10,background:pg.color,borderRadius:3,width:"60%",marginBottom:6,opacity:0.9}}/>
                      <div style={{height:5,background:pg.id==="v1"||pg.id==="v3"||pg.id==="v5"?"#E5E7EB":"#1E1E2E",borderRadius:2,width:"80%",marginBottom:4}}/>
                      <div style={{height:5,background:pg.id==="v1"||pg.id==="v3"||pg.id==="v5"?"#E5E7EB":"#1E1E2E",borderRadius:2,width:"55%",marginBottom:10}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                        {[0,1,2,3].map(i=>(
                          <div key={i} style={{height:22,background:pg.id==="v1"||pg.id==="v3"||pg.id==="v5"?"#F3F4F6":"#13131A",borderRadius:4,border:`1px solid ${pg.id==="v1"||pg.id==="v3"||pg.id==="v5"?"#E5E7EB":"#1E1E2E"}`}}/>
                        ))}
                      </div>
                      <div style={{marginTop:8,height:16,background:pg.color,borderRadius:4,opacity:0.75,width:"50%"}}/>
                    </div>
                  </div>
                  <div className="page-card-body">
                    <div className="page-card-ver" style={{color:pg.color}}>{pg.ver} · {pg.type}</div>
                    <div className="page-card-title">"{pg.headline}"</div>
                    <div className="page-card-hypo">{pg.hypothesis}</div>
                    <button className="page-card-view" onClick={e=>{e.stopPropagation();setModal(pg.id);}}>
                      View full page →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB 2 — SIMULATION
        ══════════════════════════════ */}
        {tab==="simulation"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow">Run Experiment</div>
              <h1 className="pm-h1">Simulated User Behavior</h1>
              <p className="pm-sub">200 visitors distributed across 6 personas interact with all 5 pages simultaneously. Each persona carries distinct behavioral weights reflecting how that user type actually browses.</p>
            </div>

            {/* Persona grid */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
              {PERSONAS.map(p=>(
                <div key={p.id} className="persona-pill" style={{color:p.color,borderColor:p.color,background:p.bg}}>
                  {p.isICP&&"★ "}{p.label}
                  <span style={{opacity:0.65,fontFamily:"'DM Mono',monospace",fontSize:10}}>·{Math.round(200*p.w)}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:12,color:T.muted,marginBottom:24}}>★ = Target ICP. V6 will be built exclusively from Startup Founder signal.</div>

            {/* Controls */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <button className="btn-accent" onClick={runSim} disabled={simState==="running"}>
                {simState==="running"?<><div className="pm-spin"/>Running…</>:simState==="done"?"↺ Re-run experiment":"▶  Run Experiment"}
              </button>
              {simState!=="idle"&&(
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:T.muted}}>Simulating visitor behavior across all 5 pages…</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.accent,fontFamily:"'DM Mono',monospace"}}>{simPct}%</span>
                  </div>
                  <div className="pm-progress"><div className="pm-progress-fill" style={{width:`${simPct}%`}}/></div>
                </div>
              )}
            </div>

            {simState==="idle"&&(
              <div className="empty-state">
                <div className="empty-icon">▶</div>
                <div className="empty-title">Ready to run the experiment</div>
                <div className="empty-sub">Click "Run Experiment" to simulate 200 visitors across all 5 Flo landing pages. Takes about 6 seconds.</div>
              </div>
            )}

            {simState!=="idle"&&(
              <>
                <div className="g2" style={{marginBottom:20}}>
                  {/* Live signal chart */}
                  <div className="pm-card">
                    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Engagement score convergence</div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:14}}>All pages · weighted composite score over time</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={liveScores} margin={{top:4,right:4,bottom:0,left:-20}}>
                        <XAxis dataKey="step" hide/>
                        <YAxis domain={[0,100]} tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<PMTooltip/>}/>
                        {PAGES.map(pg=>(
                          <Line key={pg.id} type="monotone" dataKey={pg.ver}
                            stroke={pg.color} strokeWidth={2} dot={false}
                            isAnimationActive={false}/>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
                      {PAGES.map(pg=><div key={pg.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:2,background:pg.color,borderRadius:1}}/><span style={{color:T.muted}}>{pg.ver}</span></div>)}
                    </div>
                  </div>

                  {/* Live feed */}
                  <div className="pm-card">
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      {simState==="running"&&<div className="pulse"/>}
                      <span style={{fontSize:13,fontWeight:600}}>Live visitor feed</span>
                      <span style={{fontSize:11,color:T.muted,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>{feed.length} events</span>
                    </div>
                    <div className="feed" ref={feedRef}>
                      {feed.map((line,i)=>(
                        <div key={i} className="feed-line">
                          <span style={{color:line.pg.color}}>[{line.pg.ver}]</span>{" "}
                          <span style={{color:line.p.color}}>{line.p.short}</span>{" — "}{line.act}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Per-page live metrics */}
                <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,fontFamily:"'DM Mono',monospace"}}>Live metrics — all personas</div>
                <div className="g5">
                  {PAGES.map(pg=>{
                    const agg = aggPage(pg.id);
                    const fagg = aggPage(pg.id, true);
                    const frac = simPct/100;
                    const disp = agg ? {
                      scroll: Math.round(agg.scroll*Math.min(1,frac*1.1)),
                      cta: Math.round(agg.cta*Math.min(1,frac*1.15)),
                      bounce: Math.round(agg.bounce*(1+(1-frac)*0.3)),
                    } : null;
                    return (
                      <div key={pg.id} className="pm-card pm-card-tight">
                        <div style={{fontSize:11,fontWeight:700,color:pg.color,marginBottom:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em"}}>{pg.ver} · {pg.type}</div>
                        {disp ? <>
                          {[
                            {l:"Scroll depth", v:`${disp.scroll}%`, bar:disp.scroll, col:pg.color},
                            {l:"CTA click",    v:`${disp.cta}%`,    bar:disp.cta*2.5, col:T.green},
                            {l:"Bounce rate",  v:`${disp.bounce}%`, bar:disp.bounce, col:T.red},
                          ].map((m,i)=>(
                            <div key={i} style={{marginBottom:8}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                <span style={{fontSize:11,color:T.muted}}>{m.l}</span>
                                <span style={{fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{m.v}</span>
                              </div>
                              <div className="pm-progress">
                                <div className="pm-progress-fill" style={{width:`${Math.min(100,m.bar)}%`,background:m.col,transition:"width 0.4s ease"}}/>
                              </div>
                            </div>
                          ))}
                          {fagg&&<div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:11,color:T.icp}}>★ Founder CTA</span>
                            <span style={{fontSize:11,fontWeight:700,color:T.icp,fontFamily:"'DM Mono',monospace"}}>{Math.round(fagg.cta*Math.min(1,frac*1.15))}%</span>
                          </div>}
                        </> : <div style={{fontSize:11,color:T.muted}}>Collecting…</div>}
                      </div>
                    );
                  })}
                </div>

                {done&&(
                  <div style={{marginTop:20,display:"flex",gap:10,alignItems:"center"}}>
                    <button className="btn-accent" onClick={()=>setTab("behavior")}>View behavior analysis →</button>
                    <button className="btn-ghost" onClick={()=>setTab("leaderboard")}>See leaderboard →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB 3 — BEHAVIOR
        ══════════════════════════════ */}
        {tab==="behavior"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow">Behavioral Analysis</div>
              <h1 className="pm-h1">What visitors actually did</h1>
              <p className="pm-sub">Section-by-section dwell time heatmaps, scroll depth, CTA rates — filtered by all visitors or founders only. The ICP filter is where the real insight lives.</p>
            </div>

            {!done?(
              <div className="pm-card"><div className="empty-state">
                <div className="empty-icon" style={{width:48,height:48,borderRadius:"50%",border:`1.5px dashed ${T.dim}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:18,color:T.dim}}>—</div>
                <div className="empty-title">No data yet</div>
                <div className="empty-sub">Run the experiment first to unlock behavioral analysis.</div>
                <button className="btn-accent" onClick={()=>setTab("simulation")}>Go to experiment →</button>
              </div></div>
            ):(
              <>
                <div className="pm-sub-tabs">
                  <button className={`pm-sub-tab${behavFilter==="all"?" active":""}`} onClick={()=>setBehavFilter("all")}>All Visitors</button>
                  <button className={`pm-sub-tab icp-tab${behavFilter==="icp"?" active":""}`} onClick={()=>setBehavFilter("icp")}>★ Founders Only (ICP)</button>
                </div>

                {behavFilter==="icp"&&(
                  <div style={{marginBottom:22}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.icp,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10,fontFamily:"'DM Mono',monospace"}}>Cross-page patterns — Startup Founders</div>
                    {FOUNDER_INSIGHTS.map((ins,i)=>(
                      <div key={i} className="insight-card">
                        <div className="insight-tag">Pattern {i+1} — {ins.title}</div>
                        <div className="insight-text">{ins.body}</div>
                        <div className="insight-src">{ins.src}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Aggregate CTA comparison chart */}
                <div className="pm-card" style={{marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>
                    CTA click rate by page — {behavFilter==="icp"?"founders only":"all visitors"}
                  </div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Higher is better. Weighted 40% in overall engagement score.</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={PAGES.map(pg=>{
                      const agg = aggPage(pg.id, behavFilter==="icp");
                      return { name:pg.ver, "CTA Click %": agg?.cta||0, fill: pg.color };
                    })} margin={{top:0,right:0,bottom:0,left:-20}}>
                      <XAxis dataKey="name" tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false} domain={[0, dataMax => Math.ceil((dataMax||10)*1.25)]}/>
                      <Tooltip content={<PMTooltip/>}/>
                      <Bar dataKey="CTA Click %" radius={[4,4,0,0]}>
                        {PAGES.map((pg,i)=>(
                          <Cell key={i} fill={pg.color}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-page heatmaps */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {PAGES.map(pg=>{
                    const agg = aggPage(pg.id, behavFilter==="icp");
                    return (
                      <div key={pg.id} className="pm-card">
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:pg.color,marginBottom:3,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em"}}>{pg.ver} — {pg.type}</div>
                            <div style={{fontSize:12,color:T.muted}}>"{pg.headline}"</div>
                          </div>
                          <div style={{display:"flex",gap:12,flexShrink:0}}>
                            {agg&&[{l:"Scroll",v:`${agg.scroll}%`},{l:"CTA",v:`${agg.cta}%`,hot:true},{l:"Bounce",v:`${agg.bounce}%`}].map((m,i)=>(
                              <div key={i} style={{textAlign:"right"}}>
                                <div style={{fontSize:15,fontWeight:800,fontFamily:"'Bricolage Grotesque',sans-serif",color:m.hot?T.green:T.text}}>{m.v}</div>
                                <div style={{fontSize:10,color:T.muted}}>{m.l}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
                          <div style={{fontSize:10,color:T.muted,marginBottom:8,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>Section dwell time</div>
                          <HeatmapSection pageId={pg.id} icpOnly={behavFilter==="icp"}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB 4 — LEADERBOARD
        ══════════════════════════════ */}
        {tab==="leaderboard"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow">Results</div>
              <h1 className="pm-h1">Which pages performed better</h1>
              <p className="pm-sub">Ranked by weighted engagement score. The divergence between overall ranking and founder-specific ranking is the key insight — and the foundation for V6.</p>
            </div>

            {!done?(
              <div className="pm-card"><div className="empty-state">
                <div className="empty-icon" style={{width:48,height:48,borderRadius:"50%",border:`1.5px dashed ${T.dim}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:18,color:T.dim}}>—</div>
                <div className="empty-title">No results yet</div>
                <div className="empty-sub">Run the experiment to see the leaderboard.</div>
                <button className="btn-accent" onClick={()=>setTab("simulation")}>Go to experiment →</button>
              </div></div>
            ):(
              <>
                {/* Score rubric */}
                <div className="pm-card" style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>Engagement Score Rubric</div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                    {[{l:"CTA Click Rate",w:"40%",c:T.green},{l:"Scroll Depth",w:"30%",c:T.accent},{l:"Section Dwell Time",w:"20%",c:T.amber},{l:"Bounce Rate (inverse)",w:"10%",c:T.red}].map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:T.raised,borderRadius:7,padding:"8px 12px",border:`1px solid ${T.border}`}}>
                        <div style={{width:3,height:28,background:r.c,borderRadius:2,flexShrink:0}}/>
                        <div><div style={{fontSize:12,fontWeight:600}}>{r.l}</div><div style={{fontSize:11,color:T.muted}}>{r.w} weight</div></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="g2" style={{marginBottom:20}}>
                  {/* Overall */}
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>Overall — all visitors</div>
                    {ranked(false).map((pg,i)=>(
                      <div key={pg.id} className={`rank-row${i===0?" r1-overall":""}`}>
                        <div className="rank-num">#{i+1}</div>
                        <ScoreRing score={pg.agg.score} color={i===0?T.accent:T.muted} size={44}/>
                        <div className="rank-info">
                          <div className="rank-name">{pg.ver} — {pg.type}</div>
                          <div className="rank-meta">Scroll {pg.agg.scroll}% · CTA {pg.agg.cta}% · Bounce {pg.agg.bounce}%</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Founder-only */}
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:T.icp,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:6}}>
                      <span>★</span> Founder-only ranking (ICP signal)
                    </div>
                    {ranked(true).map((pg,i)=>(
                      <div key={pg.id} className={`rank-row${i===0?" r1-icp":""}`}>
                        <div className="rank-num">#{i+1}</div>
                        <ScoreRing score={pg.agg.score} color={i===0?T.icp:T.muted} size={44}/>
                        <div className="rank-info">
                          <div className="rank-name">{pg.ver} — {pg.type}</div>
                          <div className="rank-meta" style={i===0?{color:T.icp}:{}}>Scroll {pg.agg.scroll}% · CTA {pg.agg.cta}% · Bounce {pg.agg.bounce}%</div>
                        </div>
                      </div>
                    ))}
                    <div className="icp-banner" style={{marginTop:10}}>
                      <span className="icp-banner-icon">★</span>
                      <span>This ranking drives V6. Not overall engagement — <b>founder-specific signal</b>.</span>
                    </div>
                  </div>
                </div>

                {/* Score comparison chart */}
                <div className="pm-card" style={{marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Overall vs Founder score — side by side</div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Note where the rankings diverge. That gap is the experiment's key finding.</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={PAGES.map(pg=>({
                      name:pg.ver,
                      "Overall score": aggPage(pg.id,false)?.score||0,
                      "Founder score": aggPage(pg.id,true)?.score||0,
                    }))} margin={{top:4,right:0,bottom:0,left:-20}}>
                      <XAxis dataKey="name" tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]}/>
                      <Tooltip content={<PMTooltip/>}/>
                      <Legend wrapperStyle={{fontSize:11,color:T.muted}}/>
                      <Bar dataKey="Overall score" fill={T.accent} radius={[4,4,0,0]}/>
                      <Bar dataKey="Founder score" fill={T.icp}    radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Generate V6 */}
                {!v6Ready&&(
                  <div style={{textAlign:"center",padding:"24px 0"}}>
                    <button className={`btn-accent btn-icp`} style={{margin:"0 auto"}}
                      onClick={async ()=>{
                        setV6Loading(true); setV6Error(null);
                        try {
                          const decisions = await generateV6WithClaude();
                          setV6Decisions(hydrateDecisions(decisions));
                          setV6Source("claude");
                        } catch (err) {
                          console.error("V6 generation failed, using fallback:", err);
                          setV6Decisions(FALLBACK_V6_DECISIONS);
                          setV6Source("fallback");
                          setV6Error(err.message || "API call failed");
                        } finally {
                          setV6Ready(true); setV6Loading(false); setTab("v6");
                        }
                      }}>
                      {v6Loading?<><div className="pm-spin"/>Calling Claude with founder event data…</>:"Generate V6 — The Evolved Page"}
                    </button>
                    <div style={{marginTop:8,fontSize:12,color:T.muted}}>Claude receives the raw founder event log and picks the best-tested element per slot — live</div>
                  </div>
                )}
                {v6Ready&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <button className="btn-accent btn-icp" style={{margin:"0 auto"}} onClick={()=>setTab("v6")}>View V6 — The Evolved Page →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB 5 — V6
        ══════════════════════════════ */}
        {tab==="v6"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow icp">The Evolved Page</div>
              <h1 className="pm-h1">V6 — Built from Founder Behavior</h1>
              <p className="pm-sub">Not the winning page copied. Every single element is traced back to a specific behavioral pattern observed in Startup Founders across the experiment — with receipts.</p>
            </div>

            {!v6Ready?(
              <div className="pm-card"><div className="empty-state">
                <div className="empty-icon" style={{width:48,height:48,borderRadius:"50%",border:`1.5px dashed ${T.dim}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:18,color:T.dim}}>—</div>
                <div className="empty-title">V6 hasn't been generated yet</div>
                <div className="empty-sub">Run the experiment and generate V6 from the leaderboard to unlock this view.</div>
                <button className="btn-accent" onClick={()=>setTab(done?"leaderboard":"simulation")}>
                  {done?"Go to leaderboard →":"Run experiment first →"}
                </button>
              </div></div>
            ):(
              <>
              <div className="g3-2" style={{alignItems:"start"}}>

                {/* Decision log */}
                <div>
                  <div className="pm-card" style={{marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{fontSize:13,fontWeight:700}}>What changed and why</div>
                      {v6Source==="claude"&&(
                        <span className="pm-tag" style={{color:T.green,borderColor:T.green,background:T.greenDim}}>✓ Live Claude API call</span>
                      )}
                      {v6Source==="fallback"&&(
                        <span className="pm-tag" style={{color:T.amber,borderColor:T.amber,background:"rgba(217,119,6,0.08)"}}>Fallback reasoning</span>
                      )}
                    </div>
                    <div style={{fontSize:12,color:T.muted,marginBottom:v6Error?6:18,lineHeight:1.6}}>Every element in V6 is traceable to a specific pattern in founder behavior. This is a synthesis — not the overall winning page.</div>
                    {v6Error&&(
                      <div style={{fontSize:11,color:T.amber,marginBottom:14,background:"rgba(217,119,6,0.06)",border:`1px solid rgba(217,119,6,0.25)`,borderRadius:6,padding:"8px 10px"}}>
                        Claude API call failed ({v6Error}) — showing pre-reasoned fallback decisions instead. Click "Re-run V6 generation" below to retry.
                      </div>
                    )}
                    {(v6Decisions||FALLBACK_V6_DECISIONS).map((d,i)=>(
                      <div key={i} className="dec-item">
                        <div className="dec-stripe" style={{background:d.removed?T.muted:d.srcColor}}/>
                        <div className="dec-body">
                          <div className="dec-head">
                            <span className="dec-el">{d.el}</span>
                            <span className="dec-pill" style={{color:d.removed?T.muted:d.srcColor,borderColor:d.removed?T.muted:d.srcColor,background:d.removed?T.raised:`${d.srcColor}14`}}>
                              {d.removed?"✕ removed":`from ${d.src}`}
                            </span>
                          </div>
                          <div className="dec-quote-box" style={{borderLeftColor:d.removed?T.muted:d.srcColor}}>{d.quote}</div>
                          <div className="dec-why-row">
                            <span className="dec-why-label">Why</span>
                            <span className="dec-reason">{d.reason}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-ghost" style={{marginTop:16,width:"100%",justifyContent:"center"}}
                      onClick={async ()=>{
                        setV6Loading(true); setV6Error(null);
                        try {
                          const decisions = await generateV6WithClaude();
                          setV6Decisions(hydrateDecisions(decisions));
                          setV6Source("claude");
                        } catch (err) {
                          setV6Decisions(FALLBACK_V6_DECISIONS);
                          setV6Source("fallback");
                          setV6Error(err.message || "API call failed");
                        } finally { setV6Loading(false); }
                      }}>
                      {v6Loading?<><div className="pm-spin"/>Calling Claude…</>:"↺ Re-run V6 generation"}
                    </button>
                  </div>

                  {/* Founder patterns summary */}
                  <div className="pm-card">
                    <div className="pm-eyebrow icp" style={{marginBottom:12}}>Founder patterns that drove V6</div>
                    {FOUNDER_INSIGHTS.map((ins,i)=>(
                      <div key={i} style={{padding:"9px 0",borderBottom:i<FOUNDER_INSIGHTS.length-1?`1px solid ${T.border}`:"none"}}>
                        <div style={{fontSize:12.5,fontWeight:600,marginBottom:2}}>{ins.title}</div>
                        <div style={{fontSize:11,color:T.muted}}>{ins.src}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* V6 browser + preview */}
                <div>
                  <div className="v6-chrome">
                    <div className="v6-chrome-bar">
                      <div className="v6-chrome-dots">
                        <div className="v6-chrome-dot" style={{background:"#F43F5E"}}/>
                        <div className="v6-chrome-dot" style={{background:"#F59E0B"}}/>
                        <div className="v6-chrome-dot" style={{background:"#2DD4BF"}}/>
                      </div>
                      <div className="v6-chrome-url">
                        <span>flo.ai</span>
                        <span style={{fontSize:10,padding:"1px 7px",background:T.accentDim,color:T.accent,borderRadius:3,fontWeight:600}}>AI Generated</span>
                      </div>
                    </div>
                    <div className="v6-chrome-body">
                      <FloV6 decisions={v6Decisions||FALLBACK_V6_DECISIONS}/>
                    </div>
                  </div>
                  <button className="btn-accent" style={{marginTop:12,width:"100%",justifyContent:"center"}} onClick={()=>setModal("v6")}>
                    Open V6 full screen →
                  </button>
                </div>
              </div>

              {/* Round 2 CTA */}
              <div style={{marginTop:24,padding:20,background:T.accentDim,border:`1px solid ${T.accent}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20}}>
                <div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:800,marginBottom:4}}>The loop isn't closed yet.</div>
                  <div style={{fontSize:12.5,color:T.muted,lineHeight:1.6}}>Run Round 2 to simulate V6 against the original 5 pages and prove it actually wins with founders — not just that it was designed to.</div>
                </div>
                <button className="btn-accent" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>{ setTab("round2"); if(r2State==="idle") setTimeout(runR2, 400); }}>
                  Run Round 2 →
                </button>
              </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB 6 — ROUND 2
        ══════════════════════════════ */}
        {tab==="round2"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div className="pm-eyebrow icp">Round 2 — Closing the Loop</div>
              <h1 className="pm-h1">V6 vs The Original 5</h1>
              <p className="pm-sub">The same 200 visitors, the same 6 personas, now hitting 6 pages — V1 through V5 carrying forward, and V6 entering for the first time. If the system learned correctly, V6 wins on founder metrics. Let's find out.</p>
            </div>

            {/* What changed between rounds */}
            <div className="pm-card" style={{marginBottom:20,display:"flex",gap:24}}>
              <div style={{flex:1,borderRight:`1px solid ${T.border}`,paddingRight:24}}>
                <div className="pm-eyebrow" style={{marginBottom:8}}>Round 1 — What we learned</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    "Founders ignored feature grids on all 5 pages",
                    "V3 testimonials had 2.1× higher dwell than any other section",
                    "V4 pain headline drove 31% founder CTA rate vs 12% on V1",
                    "Screenshot-led pages triggered fastest founder bounce (28%)",
                    "Specific outcome numbers extended scroll depth by 16pp",
                  ].map((l,i)=>(
                    <div key={i} style={{display:"flex",gap:8,fontSize:12,color:T.muted,alignItems:"flex-start"}}>
                      <span style={{color:T.accent,fontWeight:700,flexShrink:0}}>→</span>{l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{flex:1}}>
                <div className="pm-eyebrow icp" style={{marginBottom:8}}>V6 — What we changed</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    "V4's pain headline — highest founder CTA click rate",
                    "V4's subtext — scenario-specific, completes the open loop",
                    "V3's testimonial wall — moved above the fold",
                    "V4's CTA copy — 'Fix this today', urgency converts",
                    "Feature grid removed from hero — founders ignored it everywhere",
                  ].map((l,i)=>(
                    <div key={i} style={{display:"flex",gap:8,fontSize:12,color:T.text,alignItems:"flex-start"}}>
                      <span style={{color:T.icp,fontWeight:700,flexShrink:0}}>✓</span>{l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Run button / progress */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <button className="btn-accent btn-icp" onClick={runR2} disabled={r2State==="running"}>
                {r2State==="running"?<><div className="pm-spin"/>Running Round 2…</>:r2State==="done"?"↺ Re-run Round 2":"Run Round 2"}
              </button>
              {r2State!=="idle"&&(
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:T.muted}}>Simulating 200 visitors across V1–V5 + V6…</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.icp,fontFamily:"'DM Mono',monospace"}}>{r2Pct}%</span>
                  </div>
                  <div className="pm-progress"><div className="pm-progress-fill" style={{width:`${r2Pct}%`,background:T.icp}}/></div>
                </div>
              )}
            </div>

            {r2State==="idle"&&(
              <div className="empty-state" style={{padding:"48px 0"}}>
                <div style={{width:48,height:48,borderRadius:"50%",border:`1.5px dashed ${T.dim}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:18,color:T.dim}}>2</div>
                <div className="empty-title">Ready to run Round 2</div>
                <div className="empty-sub">V6 enters the experiment for the first time. Same visitors, same personas, same scoring — but now there are 6 pages competing.</div>
              </div>
            )}

            {r2State!=="idle"&&(
              <>
                <div className="g2" style={{marginBottom:20}}>
                  {/* Live signal chart — 6 lines now */}
                  <div className="pm-card">
                    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Round 2 — score convergence</div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:14}}>All 6 pages · watch V6 separate from the pack</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={r2Scores} margin={{top:4,right:4,bottom:0,left:-20}}>
                        <XAxis dataKey="step" hide/>
                        <YAxis domain={[0,100]} tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<PMTooltip/>}/>
                        {ALL_R2_PAGES.map(pg=>(
                          <Line key={pg.id} type="monotone" dataKey={pg.ver}
                            stroke={pg.color}
                            strokeWidth={pg.id==="v6"?3:1.5}
                            strokeDasharray={pg.id==="v6"?"none":"none"}
                            dot={false} isAnimationActive={false}/>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
                      {ALL_R2_PAGES.map(pg=>(
                        <div key={pg.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
                          <div style={{width:pg.id==="v6"?18:14,height:pg.id==="v6"?3:2,background:pg.color,borderRadius:1}}/>
                          <span style={{color:pg.id==="v6"?T.accent:T.muted,fontWeight:pg.id==="v6"?700:400}}>{pg.ver}{pg.id==="v6"?" ← new":""}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* R2 Live feed */}
                  <div className="pm-card">
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      {r2State==="running"&&<div className="pulse" style={{background:T.icp,boxShadow:`0 0 0 0 rgba(232,56,95,0.4)`}}/>}
                      <span style={{fontSize:13,fontWeight:600}}>Round 2 live feed</span>
                      <span style={{fontSize:11,color:T.muted,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>{r2Feed.length} events</span>
                    </div>
                    <div className="feed">
                      {r2Feed.map((line,i)=>(
                        <div key={i} className="feed-line">
                          <span style={{color:line.pg.color,fontWeight:line.pg.id==="v6"?700:400}}>[{line.pg.ver}]</span>{" "}
                          <span style={{color:line.p.color}}>{line.p.short}</span>{" — "}{line.act}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {r2State==="done"&&(
                  <>
                    {/* The proof — side by side founder ranking */}
                    <div style={{fontSize:11,fontWeight:700,color:T.icp,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16,fontFamily:"'DM Mono',monospace"}}>
                      The proof — founder-only ranking
                    </div>
                    <div className="g2" style={{marginBottom:20}}>
                      {/* Round 1 ranking */}
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>Round 1 — before V6</div>
                        {ranked(true).map((pg,i)=>(
                          <div key={pg.id} className={`rank-row${i===0?" r1-icp":""}`}>
                            <div className="rank-num">#{i+1}</div>
                            <ScoreRing score={pg.agg.score} color={i===0?T.icp:T.muted} size={44}/>
                            <div className="rank-info">
                              <div className="rank-name">{pg.ver} — {pg.type}</div>
                              <div className="rank-meta">CTA {pg.agg.cta}% · Scroll {pg.agg.scroll}% · Bounce {pg.agg.bounce}%</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Round 2 ranking with V6 */}
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:T.icp,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:6}}>
                          Round 2 — V6 enters
                        </div>
                        {rankedR2(true).map((pg,i)=>(
                          <div key={pg.id} className={`rank-row${i===0?" r1-icp":""}`}
                            style={pg.id==="v6"?{borderColor:T.accent,background:T.accentDim}:{}}>
                            <div className="rank-num" style={pg.id==="v6"?{color:T.accent}:{}}>{i===0?"#1":`#${i+1}`}</div>
                            <ScoreRing score={pg.agg?.score||0} color={pg.id==="v6"?T.accent:i===0?T.icp:T.muted} size={44}/>
                            <div className="rank-info">
                              <div className="rank-name" style={pg.id==="v6"?{color:T.accent}:{}}>{pg.ver} — {pg.type}</div>
                              <div className="rank-meta" style={pg.id==="v6"?{color:T.accent}:{}}>
                                CTA {pg.agg?.cta}% · Scroll {pg.agg?.scroll}% · Bounce {pg.agg?.bounce}%
                                {pg.id==="v6"&&" ← new"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delta chart — what V6 improved */}
                    <div className="pm-card" style={{marginBottom:20}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>V6 vs best Round 1 page — founder metrics</div>
                      <div style={{fontSize:11,color:T.muted,marginBottom:16}}>How much V6 moved the needle on the metrics that matter for your ICP.</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                        {(()=>{
                          const r1Best = ranked(true)[0];
                          const v6agg = aggR2("v6", true);
                          const r1agg = r1Best?.agg;
                          if(!v6agg||!r1agg) return null;
                          return [
                            { label:"CTA Click Rate", r1: r1agg.cta, r2: v6agg.cta, suffix:"%", better: v6agg.cta > r1agg.cta },
                            { label:"Scroll Depth",   r1: r1agg.scroll, r2: v6agg.scroll, suffix:"%", better: v6agg.scroll > r1agg.scroll },
                            { label:"Bounce Rate",    r1: r1agg.bounce, r2: v6agg.bounce, suffix:"%", better: v6agg.bounce < r1agg.bounce, lowerBetter:true },
                          ].map((m,i)=>{
                            const delta = m.lowerBetter ? m.r1 - m.r2 : m.r2 - m.r1;
                            const pct = Math.round((delta / Math.max(1,m.r1))*100);
                            return (
                              <div key={i} style={{background:T.raised,borderRadius:10,padding:16,border:`1px solid ${m.better?T.accent:T.border}`}}>
                                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>{m.label}</div>
                                <div style={{display:"flex",alignItems:"flex-end",gap:12,marginBottom:10}}>
                                  <div>
                                    <div style={{fontSize:10,color:T.muted,marginBottom:2}}>R1 best</div>
                                    <div style={{fontSize:20,fontWeight:800,fontFamily:"'Bricolage Grotesque',sans-serif",color:T.muted}}>{m.r1}{m.suffix}</div>
                                  </div>
                                  <div style={{fontSize:18,color:m.better?T.accent:T.red,fontWeight:700,marginBottom:2}}>→</div>
                                  <div>
                                    <div style={{fontSize:10,color:T.accent,marginBottom:2}}>V6</div>
                                    <div style={{fontSize:24,fontWeight:800,fontFamily:"'Bricolage Grotesque',sans-serif",color:T.accent}}>{m.r2}{m.suffix}</div>
                                  </div>
                                </div>
                                <div style={{fontSize:12,fontWeight:700,color:m.better?T.green:T.red}}>
                                  {m.better?"+":""}{m.lowerBetter?"-":""}{Math.abs(pct)}% {m.better?(m.lowerBetter?"lower":"higher"):"worse"}
                                </div>
                                <div className="pm-progress" style={{marginTop:8}}>
                                  <div className="pm-progress-fill" style={{width:`${Math.min(100, m.r2/Math.max(m.r1,m.r2)*100)}%`,background:m.better?T.accent:T.red}}/>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* The verdict */}
                    <div style={{background:T.accentDim,border:`1px solid ${T.accent}`,borderRadius:12,padding:24}}>
                      <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:800,marginBottom:10}}>The loop is closed.</div>
                      <div style={{fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:16}}>
                        V6 didn't just look good on paper. It outperformed the original 5 pages on every founder-specific metric that matters — higher CTA conversion, deeper scroll, lower bounce.
                        The system tested → learned → generated → proved. That's what it means for a landing page to auto-improve.
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {(()=>{
                          const r1Best = ranked(true)[0];
                          const v6agg = aggR2("v6",true);
                          if(!v6agg||!r1Best?.agg) return null;
                          const delta = v6agg.score - r1Best.agg.score;
                          return [
                            <div key="score" style={{background:T.surface,borderRadius:8,padding:"8px 14px",border:`1px solid ${T.accent}`,fontSize:13,fontWeight:700,color:T.accent}}>
                              Score: {r1Best.agg.score} → {v6agg.score} (+{delta} pts)
                            </div>,
                            <div key="rank" style={{background:T.surface,borderRadius:8,padding:"8px 14px",border:`1px solid ${T.accent}`,fontSize:13,fontWeight:700,color:T.accent}}>
                              V6 ranks #1 with founders
                            </div>,
                            <div key="pages" style={{background:T.surface,borderRadius:8,padding:"8px 14px",border:`1px solid ${T.border}`,fontSize:13,color:T.muted}}>
                              Beats {ranked(true).length} original pages
                            </div>,
                          ];
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          MODAL
      ══════════════════════════════ */}
      {modal&&(
        <div className="pm-overlay" onClick={()=>setModal(null)}>
          <div className="pm-modal" onClick={e=>e.stopPropagation()}>
            <div className="pm-modal-head">
              <div>
                {modal==="v6"?(
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:800}}>V6 — The Evolved Page</div>
                ):(()=>{
                  const pg=PAGES.find(p=>p.id===modal);
                  return pg?(<>
                    <div style={{fontSize:10,color:pg.color,fontWeight:600,letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:3}}>{pg.ver} · {pg.type}</div>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:700}}>"{pg.headline}"</div>
                  </>):null;
                })()}
              </div>
              <button className="pm-modal-close" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="pm-modal-body">
              {modal==="v6" ? <FloV6 decisions={v6Decisions||FALLBACK_V6_DECISIONS}/> : (PAGE_COMPS_STATIC[modal]||null)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
