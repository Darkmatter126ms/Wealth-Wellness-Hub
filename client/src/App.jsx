import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import {
  Shield, Lock, Eye, EyeOff, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, Brain, Settings,
  Bell, LogOut, Plus, ArrowRight, ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertTriangle, Info, Star, Zap, Crown, CreditCard, Globe, Building2,
  Bitcoin, Landmark, Car, Home, Gem, DollarSign, Target, Activity,
  ShieldCheck, Sparkles, X, Menu, User, HelpCircle, RefreshCw, Download,
  Filter, Search, Smartphone, Key, ChevronLeft, FileText, MessageSquare,
  Lightbulb, AlertCircle, Clock, Trash2
} from "lucide-react";
import {
  PieChart as RPieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";

/* ─────────── API HELPER ─────────── */
const api = {
  token: null,
  async request(method, path, body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (this.token) opts.headers['Authorization'] = `Bearer ${this.token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  login(email, password) { return this.request('POST', '/auth/login', { email, password }); },
  verify2FA(tempToken, code) { return this.request('POST', '/auth/verify-2fa', { tempToken, code }); },
  logout() { return this.request('POST', '/auth/logout'); },
  getPortfolio() { return this.request('GET', '/portfolio'); },
  addAsset(asset) { return this.request('POST', '/portfolio/assets', asset); },
  deleteAsset(id) { return this.request('DELETE', `/portfolio/assets/${id}`); },
  getWellness() { return this.request('GET', '/wellness'); },
  getInsights(lang = 'en') { return this.request('GET', `/insights?lang=${lang}`); },
  chat(message, displayCurrency = 'SGD', fxRate = 1) { return this.request('POST', '/ai/chat', { message, displayCurrency, fxRate }); },
  simulate(params) { return this.request('POST', '/scenarios/simulate', params); },
  createCheckout(plan) { return this.request('POST', '/payments/create-checkout', { plan }); },
  getSubscription() { return this.request('GET', '/payments/subscription'); },
  getProfile() { return this.request('GET', '/user/profile'); },
  updateProfile(data) { return this.request('PUT', '/user/profile', data); },
  getGoals() { return this.request('GET', '/goals'); },
  createGoal(goal) { return this.request('POST', '/goals', goal); },
  updateGoal(id, data) { return this.request('PUT', '/goals/' + id, data); },
  deleteGoal(id) { return this.request('DELETE', '/goals/' + id); },
  getEmailPrefs() { return this.request('GET', '/email-preferences'); },
  updateEmailPrefs(data) { return this.request('PUT', '/email-preferences', data); },
  sendReport(email, lang = 'en', displayCurrency = 'SGD') { return this.request('POST', '/email-preferences/send-now', { email, lang, displayCurrency }); },
  submitFeedback(data) { return this.request('POST', '/feedback', data); },
  submitRating(stars, comment) { return this.request('POST', '/rating', { stars, comment }); },
  dismissRating() { return this.request('POST', '/rating/dismiss'); },
  saveRiskProfile(answers) { return this.request('POST', '/profile/risk', { answers }); },
  getRiskProfile() { return this.request('GET', '/profile/risk'); },
  getWellnessHistory() { return this.request('GET', '/wellness/history'); },
};

/* ─────────── FONTS + STYLES ─────────── */
const FONTS_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&display=swap";
const CSS = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-primary: #0B1120; --bg-secondary: #111827; --bg-card: #1A2332;
  --bg-card-hover: #1E293B; --bg-elevated: #243044; --text-primary: #F1F5F9;
  --text-secondary: #94A3B8; --text-muted: #64748B; --accent-teal: #0EA5E9;
  --accent-gold: #F59E0B; --accent-green: #10B981; --accent-red: #EF4444;
  --accent-purple: #8B5CF6; --border: rgba(148, 163, 184, 0.1);
  --border-hover: rgba(148, 163, 184, 0.2); --shadow: 0 4px 24px rgba(0,0,0,0.3);
  --radius: 16px; --radius-sm: 10px; --radius-xs: 6px;
}
body { font-family: 'DM Sans', sans-serif; background: var(--bg-primary); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
.font-display { font-family: 'Fraunces', serif; }
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); transition: all 0.25s ease; }
.card:hover { border-color: var(--border-hover); box-shadow: var(--shadow); }
.btn-primary { background: linear-gradient(135deg, #0EA5E9, #6366F1); color: white; border: none; padding: 12px 28px; border-radius: var(--radius-sm); font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(14,165,233,0.3); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-secondary { background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border); padding: 10px 24px; border-radius: var(--radius-sm); font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
.btn-secondary:hover { border-color: var(--border-hover); background: var(--bg-card-hover); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: none; padding: 8px 16px; border-radius: var(--radius-xs); cursor: pointer; transition: all 0.15s ease; font-family: 'DM Sans', sans-serif; font-size: 14px; }
.btn-ghost:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
.input { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--text-primary); font-size: 15px; font-family: 'DM Sans', sans-serif; width: 100%; outline: none; transition: border-color 0.2s; }
.input:focus { border-color: var(--accent-teal); }
.input::placeholder { color: var(--text-muted); }
.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; gap: 4px; }
.progress-ring { transform: rotate(-90deg); }
.animate-in { animation: fadeIn 0.5s ease forwards; }
.animate-in-delay-1 { animation: fadeIn 0.5s ease 0.1s forwards; opacity: 0; }
.animate-in-delay-2 { animation: fadeIn 0.5s ease 0.2s forwards; opacity: 0; }
.animate-in-delay-3 { animation: fadeIn 0.5s ease 0.3s forwards; opacity: 0; }
.sidebar-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; color: var(--text-secondary); font-size: 14px; font-weight: 500; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
.sidebar-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.sidebar-item.active { background: rgba(14,165,233,0.12); color: var(--accent-teal); }
.tooltip-custom { background: var(--bg-elevated) !important; border: 1px solid var(--border) !important; border-radius: var(--radius-xs) !important; color: var(--text-primary) !important; font-family: 'DM Sans', sans-serif !important; box-shadow: var(--shadow) !important; }
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 2px; }
.tab-btn { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; font-family: 'DM Sans', sans-serif; background: transparent; color: var(--text-muted); }
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn.active { background: var(--accent-teal); color: white; }
.insight-card { border-left: 3px solid; padding: 16px 20px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; background: var(--bg-card); transition: all 0.2s; cursor: pointer; }
.insight-card:hover { background: var(--bg-card-hover); }
.insight-card.warning { border-left-color: var(--accent-gold); }
.insight-card.opportunity { border-left-color: var(--accent-teal); }
.insight-card.positive { border-left-color: var(--accent-green); }
.tier-card { border: 2px solid var(--border); border-radius: var(--radius); padding: 32px 24px; transition: all 0.3s; position: relative; overflow: hidden; }
.tier-card.recommended { border-color: var(--accent-teal); background: linear-gradient(180deg, rgba(14,165,233,0.08) 0%, transparent 40%); }
.tier-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
.mesh-gradient { background: radial-gradient(at 20% 80%, rgba(14,165,233,0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 50%); }
.error-msg { color: var(--accent-red); font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 6px; }
.loading-spinner { animation: spinSlow 1s linear infinite; }
.currency-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; z-index: 200; min-width: 210px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.currency-option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left; transition: background 0.15s; }
.currency-option:hover { background: rgba(255,255,255,0.05); }
.currency-option.active { background: rgba(14,165,233,0.12); color: var(--accent-teal); }
body { transition: background 0.25s ease, color 0.25s ease; }
`;

/* ─────────── LIGHT THEME OVERRIDES ─────────── */
const CSS_LIGHT = `
[data-theme="light"] {
  --bg-primary: #F0F4F8;
  --bg-secondary: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-card-hover: #F8FAFC;
  --bg-elevated: #EEF2F7;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --border: rgba(15, 23, 42, 0.08);
  --border-hover: rgba(15, 23, 42, 0.15);
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
}
[data-theme="light"] body { background: var(--bg-primary); color: var(--text-primary); }
[data-theme="light"] .sidebar-item:hover { background: rgba(0,0,0,0.04); }
[data-theme="light"] .sidebar-item.active { background: rgba(14,165,233,0.1); }
[data-theme="light"] .btn-ghost:hover { background: rgba(0,0,0,0.05); }
[data-theme="light"] .currency-option:hover { background: rgba(0,0,0,0.04); }
[data-theme="light"] .tab-btn:hover { color: var(--text-primary); }
[data-theme="light"] .insight-card { background: var(--bg-card); }
[data-theme="light"] .insight-card:hover { background: var(--bg-card-hover); }
[data-theme="light"] .mesh-gradient {
  background: radial-gradient(at 20% 80%, rgba(14,165,233,0.08) 0%, transparent 50%),
              radial-gradient(at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
              radial-gradient(at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 50%);
}
[data-theme="light"] .currency-dropdown { box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
[data-theme="light"] .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
`;

/* ─────────── CURRENCY CONFIG ─────────── */
const CURRENCIES = {
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  USD: { symbol: 'US$', name: 'US Dollar',        flag: '🇺🇸' },
  MYR: { symbol: 'RM',  name: 'Malaysian Ringgit', flag: '🇲🇾' },
  GBP: { symbol: '£',   name: 'British Pound',     flag: '🇬🇧' },
  EUR: { symbol: '€',   name: 'Euro',              flag: '🇪🇺' },
};

// How many SGD does 1 unit of each currency buy?
// Populated with hardcoded fallbacks; overwritten with live data after login.
const FX_TO_SGD = { SGD: 1, USD: 1.34, MYR: 0.30, GBP: 1.72, EUR: 1.47 };

// Fetch live rates from the server (which pulls from exchangerate.host)
// and update FX_TO_SGD in-place so all components pick up live values.
let fxRatesLastUpdated = null;
async function refreshFxRates() {
  if (!api.token) {
    console.warn('[FX] Skipping rate refresh — no auth token yet');
    return;
  }
  try {
    const res = await fetch('/api/fx-rates', {
      headers: { 'Authorization': `Bearer ${api.token}` },
    });
    if (!res.ok) {
      console.warn(`[FX] /api/fx-rates returned ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!data.rates) return;
    // data.rates is base=SGD: { USD: 0.746, MYR: 3.333, ... }
    // FX_TO_SGD stores inverse: 1 unit of X costs N SGD → FX_TO_SGD[X] = 1 / data.rates[X]
    for (const [code, sgdUnitsPerOne] of Object.entries(data.rates)) {
      if (code === 'SGD') { FX_TO_SGD['SGD'] = 1; continue; }
      if (sgdUnitsPerOne > 0) FX_TO_SGD[code] = +(1 / sgdUnitsPerOne).toFixed(6);
    }
    fxRatesLastUpdated = data.lastUpdated;
    console.log('[FX] Client rates updated:', { ...FX_TO_SGD });
  } catch (err) {
    console.warn('[FX] Client rate refresh failed, using fallback:', err.message);
  }
}

const convertCurrency = (value, from = 'SGD', to = 'SGD') => {
  if (from === to) return value;
  const sgd = value * (FX_TO_SGD[from] ?? 1);
  return sgd / (FX_TO_SGD[to] ?? 1);
};

// Full formatted value e.g. "S$45,000" or "-US$1,200"
const formatFullCurrency = (v, currency = 'SGD') => {
  const cur = CURRENCIES[currency] ?? CURRENCIES.SGD;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  return `${sign}${cur.symbol}${Math.round(abs).toLocaleString('en-SG')}`;
};

// Compact e.g. "S$975.7K" or "US$1.20M"
const formatCurrency = (v, currency = 'SGD') => {
  const cur = CURRENCIES[currency] ?? CURRENCIES.SGD;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}${cur.symbol}${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000)    return `${sign}${cur.symbol}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${cur.symbol}${abs.toFixed(0)}`;
};

// Replace dollar amounts in server-generated text with display currency equivalent
const convertInsightText = (text, displayCurrency) => {
  if (displayCurrency === 'SGD') return text;
  const cur = CURRENCIES[displayCurrency] ?? CURRENCIES.SGD;
  return text.replace(/\$([0-9,]+(?:\.[0-9]+)?)/g, (_, numStr) => {
    const value = parseFloat(numStr.replace(/,/g, ''));
    const converted = convertCurrency(value, 'SGD', displayCurrency);
    return `${cur.symbol}${Math.round(converted).toLocaleString('en-SG')}`;
  });
};

// Resolves an insight field (title / summary / action) using the i18n key + params
// the server attached, falling back to the English string the server always includes.
// Dollar amounts in translated text are still run through convertInsightText so
// display-currency conversion works the same way across all languages.
const useInsightText = (ins, field, t, displayCurrency) => {
  const keyMap    = { title: 'titleKey',   summary: 'summaryKey',   action: 'actionKey'   };
  const paramMap  = { title: 'titleParams', summary: 'summaryParams', action: 'actionParams' };
  const key    = ins[keyMap[field]];
  const params = ins[paramMap[field]] || {};
  const raw    = key ? t(key, params) : ins[field];
  return field === 'title' ? raw : convertInsightText(raw, displayCurrency);
};

/* ─────────── LANGUAGES (display names stay in their own script) ─────────── */
const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

/* ─────────── CURRENCY SELECTOR (header dropdown) ─────────── */
const CurrencySelector = ({ displayCurrency, setDisplayCurrency, fxLastUpdated }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = CURRENCIES[displayCurrency] ?? CURRENCIES.SGD;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title={t('settings.displayCurrencyLabel')}
        style={{
          background: open ? 'rgba(14,165,233,0.1)' : 'var(--bg-elevated)',
          border: `1px solid ${open ? 'var(--accent-teal)' : 'var(--border)'}`,
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: open ? 'var(--accent-teal)' : 'var(--text-primary)',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 15 }}>{cur.flag}</span>
        <span>{displayCurrency}</span>
        <ChevronDown size={11} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="currency-dropdown animate-in">
          <div style={{ padding: '4px 10px 6px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
            {t('settings.displayCurrencyLabel')}
          </div>
          {Object.entries(CURRENCIES).map(([code, c]) => (
            <button
              key={code}
              className={`currency-option ${displayCurrency === code ? 'active' : ''}`}
              style={{ color: displayCurrency === code ? 'var(--accent-teal)' : 'var(--text-primary)' }}
              onClick={() => { setDisplayCurrency(code); setOpen(false); }}
            >
              <span style={{ fontSize: 18 }}>{c.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{code}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{t(`currencies.${code}`)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {code !== 'SGD' ? `1 ${code} = S$${(FX_TO_SGD[code] ?? 1).toFixed(4)}` : t('settings.baseCurrency')}
                </div>
              </div>
              {displayCurrency === code && <CheckCircle size={14} color="var(--accent-teal)" />}
            </button>
          ))}
          <div style={{ margin: '4px 10px 2px', paddingTop: 6, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: fxLastUpdated ? 'var(--accent-green)' : 'var(--accent-gold)', flexShrink: 0 }} />
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {fxLastUpdated
                ? t('settings.liveRatesFooter', { time: new Date(fxLastUpdated).toLocaleTimeString() })
                : t('settings.fallbackRatesFooter')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────── ASSET CURRENCY BADGE (per-asset in wallet) ─────────── */
const AssetCurrencyBadge = ({ assetId, currency = 'SGD', onChangeCurrency }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = CURRENCIES[currency] ?? CURRENCIES.SGD;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="Change asset currency"
        style={{
          background: open ? 'rgba(14,165,233,0.12)' : 'rgba(148,163,184,0.08)',
          border: `1px solid ${open ? 'rgba(14,165,233,0.3)' : 'transparent'}`,
          borderRadius: 5, padding: '2px 7px', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, color: open ? 'var(--accent-teal)' : 'var(--text-muted)',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 11 }}>{cur.flag}</span>
        <span>{currency}</span>
        <ChevronDown size={9} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 4, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: 170,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ padding: '3px 8px 5px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
            Asset Currency
          </div>
          {Object.entries(CURRENCIES).map(([code, c]) => (
            <button
              key={code}
              onClick={() => { onChangeCurrency(assetId, code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 10px', borderRadius: 5, border: 'none',
                background: currency === code ? 'rgba(14,165,233,0.1)' : 'transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                color: currency === code ? 'var(--accent-teal)' : 'var(--text-primary)',
                fontSize: 12, fontWeight: 500,
              }}
            >
              <span style={{ fontSize: 14 }}>{c.flag}</span>
              <span style={{ fontWeight: 600 }}>{code}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.symbol}</span>
              {currency === code && <CheckCircle size={12} color="var(--accent-teal)" style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────── FEEDBACK MODAL ─────────── */
const FeedbackModal = ({ onClose }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try { await api.submitFeedback({ category, subject, message }); setSent(true); setTimeout(onClose, 2000); } catch(e) { console.error(e); }
    setSending(false);
  };
  const categories = [
    { k: "suggestion", l: t("feedback.suggestion") },
    { k: "bug",        l: t("feedback.bugReport") },
    { k: "feature",    l: t("feedback.featureRequest") },
    { k: "general",    l: t("feedback.general") },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div className="animate-in card" style={{ padding: 28, maxWidth: 480, width: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <CheckCircle size={40} color="var(--accent-green)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{t("common.thankYou")}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("feedback.submitted")}</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{t("feedback.title")}</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {categories.map(c => (
                <button key={c.k} className="tab-btn" onClick={() => setCategory(c.k)} style={category === c.k ? { background: "var(--accent-teal)", color: "white" } : {}}>{c.l}</button>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("feedback.subjectLabel")}</label>
              <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t("feedback.subjectPlaceholder")} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("feedback.messageLabel")} *</label>
              <textarea className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder={t("feedback.messagePlaceholder")} rows={4} style={{ resize: "vertical", minHeight: 80, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={sending || !message.trim()}>{sending ? t("common.sending") : t("common.submit")}</button>
              <button className="btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────── RATING POPUP ─────────── */
// ══════════════════════════════════════════════════════════════════════════════
// RISK PROFILER — questions, scoring, and modal
// ══════════════════════════════════════════════════════════════════════════════

const getProfilerQuestions = (t) => [
  {
    id: 'age',
    question: t('risk.ageQuestion'),
    subtitle: t('risk.ageSubtitle'),
    icon: '🎂',
    options: [
      { label: t('risk.ageUnder25'),  score: 4 },
      { label: t('risk.age25_34'),    score: 3 },
      { label: t('risk.age35_44'),    score: 2 },
      { label: t('risk.age45_54'),    score: 1 },
      { label: t('risk.age55over'),   score: 0 },
    ],
  },
  {
    id: 'income',
    question: t('risk.incomeQuestion'),
    subtitle: t('risk.incomeSubtitle'),
    icon: '💼',
    options: [
      { label: t('risk.incomeBelow50k'),    score: 0 },
      { label: t('risk.income50_100k'),     score: 1 },
      { label: t('risk.income100_200k'),    score: 2 },
      { label: t('risk.incomeAbove200k'),   score: 3 },
    ],
  },
  {
    id: 'horizon',
    question: t('risk.horizonQuestion'),
    subtitle: t('risk.horizonSubtitle'),
    icon: '📅',
    options: [
      { label: t('risk.horizonWithin2'),  score: 0 },
      { label: t('risk.horizon2_5'),      score: 1 },
      { label: t('risk.horizon5_10'),     score: 2 },
      { label: t('risk.horizon10plus'),   score: 3 },
    ],
  },
  {
    id: 'reaction',
    question: t('risk.reactionQuestion'),
    subtitle: t('risk.reactionSubtitle'),
    icon: '📉',
    options: [
      { label: t('risk.reactionSell'),    score: 0 },
      { label: t('risk.reactionReduce'),  score: 1 },
      { label: t('risk.reactionHold'),    score: 2 },
      { label: t('risk.reactionBuy'),     score: 3 },
    ],
  },
  {
    id: 'goal',
    question: t('risk.goalQuestion'),
    subtitle: t('risk.goalSubtitle'),
    icon: '🎯',
    options: [
      { label: t('risk.goalProtect'),   score: 0 },
      { label: t('risk.goalSteady'),    score: 1 },
      { label: t('risk.goalMaximise'),  score: 2 },
    ],
  },
  {
    id: 'knowledge',
    question: t('risk.knowledgeQuestion'),
    subtitle: t('risk.knowledgeSubtitle'),
    icon: '📚',
    options: [
      { label: t('risk.knowledgeBeginner'),     score: 0 },
      { label: t('risk.knowledgeIntermediate'), score: 1 },
      { label: t('risk.knowledgeAdvanced'),     score: 2 },
    ],
  },
  {
    id: 'savings_rate',
    question: t('risk.savingsQuestion'),
    subtitle: t('risk.savingsSubtitle'),
    icon: '💰',
    options: [
      { label: t('risk.savingsLess5'),    score: 0 },
      { label: t('risk.savings5_15'),     score: 1 },
      { label: t('risk.savings15_30'),    score: 2 },
      { label: t('risk.savingsMore30'),   score: 3 },
    ],
  },
];

// Max possible score = 4+3+3+3+2+2+3 = 20
const scoreToProfile = (total) => total <= 6 ? 'conservative' : total <= 13 ? 'balanced' : 'growth';

const PROFILE_META = {
  conservative: { labelKey: 'profile.conservative', subtitleKey: 'profile.conservativeSubtitle', color: '#10B981', emoji: '🛡️', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  balanced:     { labelKey: 'profile.balanced',     subtitleKey: 'profile.balancedSubtitle',     color: '#0EA5E9', emoji: '⚖️', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.25)' },
  growth:       { labelKey: 'profile.growth',       subtitleKey: 'profile.growthSubtitle',       color: '#8B5CF6', emoji: '🚀', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)' },
};

/* ─────────── RISK PROFILER MODAL ─────────── */
const RiskProfilerModal = ({ onComplete, onSkip, isRetake = false }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);           // 0..QUESTIONS-1 = questions, last = result
  const [answers, setAnswers] = useState({});    // { questionId: { label, score } }
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);    // { riskProfile, riskScore }

  const PROFILER_QUESTIONS = getProfilerQuestions(t);
  const q = PROFILER_QUESTIONS[step];
  const totalSteps = PROFILER_QUESTIONS.length;
  const isLastQuestion = step === totalSteps - 1;
  const isResultStep = step === totalSteps;
  const progressPct = Math.round((step / totalSteps) * 100);

  const handleAnswer = async (option) => {
    const newAnswers = { ...answers, [q.id]: { label: option.label, score: option.score } };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Compute result and submit
      setSaving(true);
      const answerArray = PROFILER_QUESTIONS.map(pq => ({
        questionId: pq.id,
        label: newAnswers[pq.id]?.label ?? '',
        score: newAnswers[pq.id]?.score ?? 0,
      }));
      const totalScore = answerArray.reduce((s, a) => s + a.score, 0);
      const riskProfile = scoreToProfile(totalScore);
      try {
        await api.saveRiskProfile(answerArray);
        setResult({ riskProfile, riskScore: totalScore, answers: newAnswers });
        setStep(totalSteps); // go to result step
      } catch (e) { console.error(e); }
      setSaving(false);
    } else {
      setStep(s => s + 1);
    }
  };

  const meta = result ? PROFILE_META[result.riskProfile] : null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, backdropFilter:'blur(4px)' }}>
      <div className="animate-in card" style={{ padding:'32px 28px', maxWidth:520, width:'92%', position:'relative' }}>

        {/* Skip / close button — only on question steps, not result */}
        {!isResultStep && (
          <button onClick={onSkip} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:20, lineHeight:1, padding:4 }}>×</button>
        )}

        {/* Header */}
        {!isResultStep ? (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.8 }}>
                  {isRetake ? t('risk.retakeAssessment') : t('risk.profileSetup')} · {step + 1}/{totalSteps}
                </span>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>{progressPct}%</span>
              </div>
              <div style={{ height:4, borderRadius:2, background:'rgba(148,163,184,0.15)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:2, background:'var(--accent-teal)', width:`${progressPct}%`, transition:'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>{q.icon}</div>
              <h3 style={{ fontSize:17, fontWeight:700, lineHeight:1.4, marginBottom:6 }}>{q.question}</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>{q.subtitle}</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {q.options.map((opt, i) => (
                <button key={i}
                  onClick={() => !saving && handleAnswer(opt)}
                  disabled={saving}
                  style={{
                    textAlign:'left', padding:'14px 18px', borderRadius:10, cursor:'pointer',
                    background: answers[q.id]?.label === opt.label ? 'rgba(14,165,233,0.12)' : 'var(--bg-secondary)',
                    border: `1px solid ${answers[q.id]?.label === opt.label ? 'var(--accent-teal)' : 'var(--border)'}`,
                    color:'var(--text-primary)', fontSize:14, fontFamily:'inherit',
                    transition:'all 0.15s', display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                  <span>{opt.label}</span>
                  {answers[q.id]?.label === opt.label && <CheckCircle size={16} color="var(--accent-teal)" />}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ marginTop:16, fontSize:13 }}>
                ← {t("risk.back")}
              </button>
            )}
            {saving && <div style={{ textAlign:'center', marginTop:12, color:'var(--text-muted)', fontSize:13 }}>{t('risk.savingProfile')}</div>}
          </>
        ) : (
          /* Result step */
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{meta.emoji}</div>
            <div style={{ display:'inline-block', padding:'6px 18px', borderRadius:20, background:meta.bg, border:`1px solid ${meta.border}`, color:meta.color, fontWeight:700, fontSize:13, marginBottom:16 }}>
              {t(meta.labelKey)} · {t(meta.subtitleKey)}
            </div>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:10 }}>{t('risk.yourRiskProfile')}: {t(meta.labelKey)}</h3>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:24, maxWidth:400, margin:'0 auto 24px' }}>
              {t(`profile.${result.riskProfile}Desc`)}
            </p>
            <div style={{ background:'var(--bg-secondary)', borderRadius:10, padding:'14px 18px', marginBottom:24, textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:10 }}>{t('risk.yourAnswers')}</div>
              {PROFILER_QUESTIONS.map(pq => {
                const ans = result.answers[pq.id];
                const translatedLabel = pq.options.find(opt => opt.score === ans?.score)?.label ?? ans?.label ?? '—';
                return (
                  <div key={pq.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text-muted)' }}>{pq.question.replace('?','')}</span>
                    <span style={{ fontWeight:500 }}>{translatedLabel}</span>
                  </div>
                );
              })}
            </div>
            <button className="btn-primary" onClick={() => onComplete(result)} style={{ padding:'12px 36px', fontSize:15 }}>
              {t('risk.viewDashboard')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const RatingPopup = ({ onClose }) => {
  const { t } = useTranslation();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStarClick = (i) => {
    setStars(i);
    // After picking a star, reveal the optional feedback area with a slight delay
    setTimeout(() => setShowFeedback(true), 200);
  };

  const handleSubmit = async () => {
    if (stars === 0 || loading) return;
    setLoading(true);
    try { await api.submitRating(stars, comment.trim()); setSubmitted(true); setTimeout(onClose, 2000); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDismiss = async () => {
    try { await api.dismissRating(); } catch(e) {}
    onClose();
  };

  const active = hover || stars;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
      <div className="animate-in card" style={{ padding: "32px 28px", maxWidth: 400, width: "90%", textAlign: "center" }}>
        {submitted ? (
          <div style={{ padding: "8px 0" }}>
            <CheckCircle size={44} color="var(--accent-green)" style={{ marginBottom: 14 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{t("rating.thankYou")}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("rating.thankYouMessage")}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 6, fontSize: 22 }}>⭐</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t("rating.title")}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{t("rating.subtitle")}</p>

            {/* Stars */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i}
                  onClick={() => handleStarClick(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 36,
                    transition: "transform 0.12s", transform: active >= i ? "scale(1.2)" : "scale(1)",
                    color: active >= i ? "#F59E0B" : "var(--text-muted)", lineHeight: 1 }}>
                  {active >= i ? "★" : "☆"}
                </button>
              ))}
            </div>

            {/* Star label */}
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-teal)", height: 18, marginBottom: 16, transition: "opacity 0.2s", opacity: active ? 1 : 0 }}>
              {STAR_LABELS[active]}
            </div>

            {/* Optional feedback textarea — slides in after rating */}
            {showFeedback && (
              <div className="animate-in" style={{ marginBottom: 20, textAlign: "left" }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 6 }}>
                  {t("rating.leaveComment")} <span style={{ fontWeight: 400, textTransform: "none" }}>{t("rating.commentOptional")}</span>
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t("rating.commentPlaceholder")}
                  rows={3}
                  style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13,
                    fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {stars > 0 && (
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                  style={{ padding: "10px 28px", display: "flex", alignItems: "center", gap: 6 }}>
                  {loading ? <RefreshCw size={14} className="loading-spinner" /> : null}
                  {t("rating.submitRating")}
                </button>
              )}
              <button className="btn-ghost" onClick={handleDismiss} style={{ fontSize: 13, padding: "10px 16px" }}>
                {t("rating.maybeLater")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────── UTILITY COMPONENTS ─────────── */
const WealthScore = ({ score, size = 160 }) => {
  const { t } = useTranslation();
  const sw = 10, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={c - (score/100)*c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: size*0.28, fontWeight: 700, color }}>{score}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: -2 }}>{t("analytics.wellnessScore")}</div>
      </div>
    </div>
  );
};

const AssetIcon = ({ type, size = 18 }) => {
  const p = { size, strokeWidth: 1.8 };
  const icons = { bank: Landmark, landmark: Landmark, trending: TrendingUp, building: Building2, bitcoin: Bitcoin, shield: ShieldCheck, home: Home, car: Car };
  const Icon = icons[type] || DollarSign;
  return <Icon {...p} />;
};

const makeChartTooltip = (displayCurrency) => ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom" style={{ padding: "10px 14px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color || "var(--text-primary)" }}>
          {formatFullCurrency(p.value, displayCurrency)}
        </div>
      ))}
    </div>
  );
};

const Loader = ({ text = t("loading.general") }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12 }}>
    <RefreshCw size={24} color="var(--accent-teal)" className="loading-spinner" />
    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{text}</span>
  </div>
);


/* ─────────── NOTIFICATION ENGINE ─────────── */

// Derive intelligent notifications from live portfolio + wellness data
// Each notification carries a `fingerprint` that encodes the data value driving it.
// A dismissed notification is only suppressed if its fingerprint still matches the
// stored value — so a profile change or asset mutation that crosses a threshold will
// automatically re-surface the alert even if the same ID was previously dismissed.
const buildNotifications = (portfolio, wellness, goals, t) => {
  if (!portfolio || !wellness) return [];
  const notes = [];
  const push = (id, type, category, icon, title, body, action = null, fingerprint = '') =>
    notes.push({ id, type, category, icon, title, body, action, fingerprint, ts: Date.now() });

  // ── WELLNESS SCORE ──
  const score = wellness.overall ?? wellness.overallScore ?? 0;
  if (score < 40) push('ws_critical', 'critical', 'wellness', '📉',
    t('notif.wsLowTitle'), t('notif.wsLowBody', { score }), { view: 'analytics' }, `score:${score}`);
  else if (score < 60) push('ws_warn', 'warning', 'wellness', '⚠️',
    t('notif.wsMedTitle'), t('notif.wsMedBody', { score }), { view: 'analytics' }, `score:${score}`);

  // ── PER-METRIC ALERTS ──
  if (wellness.metrics) {
    wellness.metrics.forEach(m => {
      if (m.score < 35) {
        const METRIC_KEYS = { "Diversification":"analytics.metricDiversification","Liquidity":"analytics.metricLiquidity","Growth":"analytics.metricGrowth","Risk Mgmt":"analytics.metricRiskMgmt","Tax Efficiency":"analytics.metricTaxEfficiency","Emergency Fund":"analytics.metricEmergencyFund","Behavioral Resilience":"analytics.metricBehavioralResilience" };
        const mLabel = METRIC_KEYS[m.metric] ? t(METRIC_KEYS[m.metric]) : m.metric;
        push(`metric_${m.metric}`, 'warning', 'wellness', '🔍',
          t('notif.metricLowTitle', { metric: mLabel }),
          t('notif.metricLowBody', { metric: mLabel, score: m.score }),
          { view: 'analytics' }, `score:${m.score}`);
      }
    });
  }

  // ── EMERGENCY FUND (cash < 3 months of non-cash spending proxy) ──
  const cash = portfolio.assets.filter(a => a.type === 'Cash').reduce((s, a) => s + a.value, 0);
  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const cashPct = totalWealth > 0 ? (cash / totalWealth) * 100 : 0;
  if (cashPct < 5) push('cash_critical', 'critical', 'portfolio', '🆘',
    t('notif.cashLowTitle'), t('notif.cashLowBody', { pct: cashPct.toFixed(1) }), { view: 'wallet' }, `cash:${cashPct.toFixed(0)}`);
  else if (cashPct < 10) push('cash_warn', 'warning', 'portfolio', '💧',
    t('notif.cashWarnTitle'), t('notif.cashWarnBody', { pct: cashPct.toFixed(1) }), { view: 'wallet' }, `cash:${cashPct.toFixed(0)}`);

  // ── PORTFOLIO CONCENTRATION ──
  const byType = {};
  portfolio.assets.forEach(a => { byType[a.type] = (byType[a.type] || 0) + a.value; });
  const dominant = Object.entries(byType).sort((a,b) => b[1]-a[1])[0];
  if (dominant && totalWealth > 0) {
    const domPct = (dominant[1] / totalWealth * 100);
    if (domPct > 60) push('concentration', 'warning', 'portfolio', '⚖️',
      t('notif.concentrationTitle'),
      t('notif.concentrationBody', { type: dominant[0], pct: domPct.toFixed(0) }),
      { view: 'analytics' }, `conc:${dominant[0]}:${domPct.toFixed(0)}`);
  }

  // ── GOALS ──
  if (Array.isArray(goals)) {
    goals.forEach(g => {
      if (g.isComplete) push(`goal_done_${g.id}`, 'positive', 'goals', '🏆',
        t('notif.goalCompleteTitle'), t('notif.goalCompleteBody', { title: g.title }), { view: 'goals' });
      else if (g.progress >= 90) push(`goal_near_${g.id}`, 'positive', 'goals', '🎯',
        t('notif.goalNearTitle'), t('notif.goalNearBody', { title: g.title, pct: g.progress }), { view: 'goals' });
      else if (g.daysLeft > 0 && g.daysLeft <= 30 && g.progress < 80) push(`goal_deadline_${g.id}`, 'warning', 'goals', '⏰',
        t('notif.goalDeadlineTitle'), t('notif.goalDeadlineBody', { title: g.title, days: g.daysLeft }), { view: 'goals' });
    });
  }

  // ── AI INSIGHT AVAILABLE ──
  push('ai_insight', 'insight', 'ai', '🤖',
    t('notif.aiInsightTitle'), t('notif.aiInsightBody'), { view: 'insights' });

  // ── POSITIVE: DIVERSIFICATION ──
  const typeCount = Object.keys(byType).length;
  if (typeCount >= 4) push('diversified', 'positive', 'portfolio', '✨',
    t('notif.diversifiedTitle'), t('notif.diversifiedBody', { count: typeCount }), { view: 'analytics' }, `types:${typeCount}`);

  return notes;
};

const NOTIF_STYLES = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: '#EF4444' },
  warning:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' },
  positive: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', dot: '#10B981' },
  insight:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', dot: '#8B5CF6' },
};

// CATEGORY_LABELS and timeAgo moved inside NotificationPanel to use t()

const NotificationPanel = ({ portfolio, wellness, goals, onNavigate, onClose }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  // dismissed: Map of { [id]: fingerprint } — an alert is only suppressed if its
  // current fingerprint matches the one stored at dismiss time.
  // This means a changed wellness score or portfolio composition automatically
  // re-surfaces the notification even if the same ID was previously dismissed.
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ww_notif_dismissed') || '{}'); }
    catch { return {}; }
  });
  const [filter, setFilter] = useState('all');

  // Category badge labels via t()
  const categoryLabels = {
    wellness: t('notif.catWellness'),
    portfolio: t('notif.catPortfolio'),
    goals: t('notif.catGoals'),
    ai: t('notif.catAI'),
    security: t('notif.catSecurity'),
  };

  // Relative time via t()
  const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return t('notif.timeJustNow');
    if (s < 3600) return t('notif.timeMinutes', { n: Math.floor(s / 60) });
    return t('notif.timeHours', { n: Math.floor(s / 3600) });
  };

  const allNotifs = buildNotifications(portfolio, wellness, goals, t);
  // An alert is hidden only if its current fingerprint matches the dismissed snapshot
  const visible = allNotifs.filter(n => !(n.id in dismissed && dismissed[n.id] === n.fingerprint));
  const filtered = filter === 'all' ? visible : visible.filter(n => n.type === filter);

  const dismiss = (id, e) => {
    e.stopPropagation();
    const n = allNotifs.find(x => x.id === id);
    const next = { ...dismissed, [id]: n?.fingerprint ?? '' };
    setDismissed(next);
    try { sessionStorage.setItem('ww_notif_dismissed', JSON.stringify(next)); } catch {}
  };

  const dismissAll = () => {
    const next = { ...dismissed };
    visible.forEach(n => { next[n.id] = n.fingerprint ?? ''; });
    setDismissed(next);
    try { sessionStorage.setItem('ww_notif_dismissed', JSON.stringify(next)); } catch {}
  };

  const handleClick = (n) => {
    if (n.action?.view) { onNavigate(n.action.view); onClose(); }
  };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const counts = {
    all:      visible.length,
    critical: visible.filter(n=>n.type==='critical').length,
    warning:  visible.filter(n=>n.type==='warning').length,
    positive: visible.filter(n=>n.type==='positive').length,
    insight:  visible.filter(n=>n.type==='insight').length,
  };
  const filterTabs = [
    { key: 'all',      label: `${t('notif.filterAll')} (${counts.all})` },
    { key: 'critical', label: `🔴 ${t('notif.filterCritical')} (${counts.critical})` },
    { key: 'warning',  label: `🟡 ${t('notif.filterAction')} (${counts.warning})` },
    { key: 'positive', label: `🟢 ${t('notif.filterGood')} (${counts.positive})` },
    { key: 'insight',  label: `💡 ${t('notif.filterInsight')} (${counts.insight})` },
  ];

  return (
    <div ref={ref} className="animate-in" style={{
      position:'absolute', top:'calc(100% + 10px)', right:0,
      width:380, maxHeight:540,
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', boxShadow:'0 16px 48px rgba(0,0,0,0.5)',
      display:'flex', flexDirection:'column', zIndex:500, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Bell size={16} color="var(--accent-teal)" />
            <span style={{ fontSize:14, fontWeight:700 }}>{t('notif.panelTitle')}</span>
            {visible.length > 0 && (
              <span style={{ background:'var(--accent-red)', color:'white', fontSize:10, fontWeight:700,
                padding:'2px 6px', borderRadius:10 }}>{visible.length}</span>
            )}
          </div>
          {visible.length > 0 && (
            <button onClick={dismissAll} style={{ background:'none', border:'none', cursor:'pointer',
              fontSize:12, color:'var(--text-muted)', fontFamily:'inherit', padding:'2px 6px',
              borderRadius:4, transition:'color 0.15s' }}
              onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
              onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>
              {t('notif.clearAll')}
            </button>
          )}
        </div>
        {/* Filter tabs */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {filterTabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              background: filter===tab.key ? 'var(--accent-teal)' : 'var(--bg-elevated)',
              color: filter===tab.key ? 'white' : 'var(--text-muted)',
              border:'none', borderRadius:6, padding:'3px 8px', fontSize:11,
              fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="scrollbar-thin" style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'36px 24px' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{t('notif.allClearTitle')}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t('notif.allClearBody')}</div>
          </div>
        ) : (
          filtered.map(n => {
            const s = NOTIF_STYLES[n.type];
            return (
              <div key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display:'flex', gap:10, padding:'12px 16px',
                  cursor: n.action ? 'pointer' : 'default',
                  borderBottom:'1px solid var(--border)',
                  transition:'background 0.15s',
                  background:'transparent',
                }}
                onMouseEnter={e => { if (n.action) e.currentTarget.style.background='var(--bg-card-hover)'; }}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                {/* Severity dot */}
                <div style={{ width:7, height:7, borderRadius:'50%', background:s.dot,
                  flexShrink:0, marginTop:5, boxShadow:`0 0 6px ${s.dot}` }} />
                {/* Icon + content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:3 }}>
                    <span style={{ fontSize:14, lineHeight:1, flexShrink:0 }}>{n.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.4, marginTop:3 }}>
                        {n.body}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:10, padding:'1px 6px', borderRadius:4,
                        background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontWeight:600 }}>
                        {categoryLabels[n.category] || n.category}
                      </span>
                      {n.action && (
                        <span style={{ fontSize:10, color:'var(--accent-teal)', fontWeight:500 }}>
                          → {t('notif.viewDetails')}
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, color:'var(--text-muted)' }}>{timeAgo(n.ts)}</span>
                      <button onClick={(e) => dismiss(n.id, e)} style={{
                        background:'none', border:'none', cursor:'pointer',
                        color:'var(--text-muted)', fontSize:14, lineHeight:1,
                        padding:'0 2px', fontFamily:'inherit', display:'flex', alignItems:'center',
                      }}
                        onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', flexShrink:0,
        display:'flex', justifyContent:'center' }}>
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>{t('notif.footer')}</span>
      </div>
    </div>
  );
};


/* ─────────── WALKTHROUGH OVERLAY ─────────── */
const TOUR_STEPS = [
  { id: 'welcome',       target: null,                 titleKey: 'tour.welcomeTitle',       bodyKey: 'tour.welcomeBody',       view: null,       pos: 'center' },
  { id: 'sidebar',       target: '[data-tour="sidebar-nav"]',  titleKey: 'tour.sidebarTitle',  bodyKey: 'tour.sidebarBody',  view: null,       pos: 'right'  },
  { id: 'notifications', target: '[data-tour="notifications"]',titleKey: 'tour.notifTitle',    bodyKey: 'tour.notifBody',    view: null,       pos: 'bottom' },
  { id: 'currency',      target: '[data-tour="currency"]',     titleKey: 'tour.currencyTitle', bodyKey: 'tour.currencyBody', view: null,       pos: 'bottom' },
  { id: 'feedback',      target: '[data-tour="feedback"]',     titleKey: 'tour.feedbackTitle', bodyKey: 'tour.feedbackBody', view: null,       pos: 'bottom' },
  { id: 'chatcoach',     target: '[data-tour="chat-coach"]',   titleKey: 'tour.coachTitle',    bodyKey: 'tour.coachBody',    view: 'insights', pos: 'bottom' },
  { id: 'settings',      target: '[data-tour="settings-tabs"]',titleKey: 'tour.settingsTitle', bodyKey: 'tour.settingsBody', view: 'settings', pos: 'bottom' },
  { id: 'done',          target: '[data-tour="help-btn"]', titleKey: 'tour.doneTitle', bodyKey: 'tour.doneBody', view: null, pos: 'bottom' },
];

const TOOLTIP_W = 300;
const TOOLTIP_H = 180; // estimated

const getTooltipStyle = (rect, pos) => {
  if (!rect || pos === 'center') return {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: TOOLTIP_W,
  };
  const gap = 16;
  const vw = window.innerWidth, vh = window.innerHeight;
  let style = { position: 'fixed', width: TOOLTIP_W };
  if (pos === 'bottom') {
    style.top = Math.min(rect.bottom + gap, vh - TOOLTIP_H - 12);
    style.left = Math.max(12, Math.min(rect.left + rect.width/2 - TOOLTIP_W/2, vw - TOOLTIP_W - 12));
  } else if (pos === 'top') {
    style.top = Math.max(12, rect.top - TOOLTIP_H - gap);
    style.left = Math.max(12, Math.min(rect.left + rect.width/2 - TOOLTIP_W/2, vw - TOOLTIP_W - 12));
  } else if (pos === 'right') {
    style.top = Math.max(12, Math.min(rect.top + rect.height/2 - TOOLTIP_H/2, vh - TOOLTIP_H - 12));
    style.left = Math.min(rect.right + gap, vw - TOOLTIP_W - 12);
  } else if (pos === 'left') {
    style.top = Math.max(12, Math.min(rect.top + rect.height/2 - TOOLTIP_H/2, vh - TOOLTIP_H - 12));
    style.left = Math.max(12, rect.left - TOOLTIP_W - gap);
  }
  return style;
};

const getSpotlightStyle = (rect) => {
  if (!rect) return { display: 'none' };
  const pad = 8;
  return {
    position: 'fixed',
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    borderRadius: 12,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
    pointerEvents: 'none',
    zIndex: 9001,
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    outline: '2px solid rgba(14,165,233,0.7)',
    outlineOffset: 2,
  };
};

const WalkthroughOverlay = ({ onComplete, onNavigate, currentView }) => {
  const { t } = useTranslation();
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const step = TOUR_STEPS[stepIdx];
  const total = TOUR_STEPS.length;
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === total - 1;

  // Find target element and track its position
  useEffect(() => {
    if (!step.target) { setTargetRect(null); return; }
    const measure = () => {
      const el = document.querySelector(step.target);
      if (el) setTargetRect(el.getBoundingClientRect());
      else setTargetRect(null);
    };
    // Retry a few times to handle view transition renders
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure); };
  }, [stepIdx, step.target, currentView]);

  const advance = () => {
    if (isLast) { finish(); return; }
    const next = TOUR_STEPS[stepIdx + 1];
    if (next.view && next.view !== currentView) onNavigate(next.view);
    setStepIdx(s => s + 1);
  };

  const back = () => {
    if (isFirst) return;
    const prev = TOUR_STEPS[stepIdx - 1];
    if (prev.view && prev.view !== currentView) onNavigate(prev.view);
    setStepIdx(s => s - 1);
  };

  const finish = () => {
    try { sessionStorage.setItem('ww_tour_done', '1'); } catch {}
    onComplete();
  };

  const tooltipStyle = getTooltipStyle(targetRect, step.pos);
  const spotlightStyle = step.target ? getSpotlightStyle(targetRect) : null;

  // Dot indicators
  const dots = TOUR_STEPS.map((_, i) => (
    <div key={i} style={{
      width: i === stepIdx ? 18 : 6, height: 6, borderRadius: 3,
      background: i === stepIdx ? 'var(--accent-teal)' : 'rgba(255,255,255,0.25)',
      transition: 'all 0.3s ease', cursor: 'pointer',
    }} onClick={() => setStepIdx(i)} />
  ));

  return (
    <>
      {/* Backdrop — blocks all clicks on the app */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, cursor: 'default' }} />

      {/* Spotlight cutout (non-center steps only) */}
      {spotlightStyle && <div style={spotlightStyle} />}

      {/* Tooltip card */}
      <div style={{
        ...tooltipStyle,
        zIndex: 9002,
        background: 'var(--bg-card)',
        border: '1px solid rgba(14,165,233,0.35)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease',
      }}>
        {/* Step icon / emoji */}
        <div style={{ fontSize: 28, marginBottom: 10 }}>
          {['👋','🧭','🔔','💱','💬','🤖','⚙️','🎉'][stepIdx]}
        </div>

        {/* Step counter */}
        {!isFirst && !isLast && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {t('tour.stepOf', { current: stepIdx, total: total - 2 })}
          </div>
        )}

        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
          {t(step.titleKey)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          {t(step.bodyKey)}
        </div>

        {/* Dot progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 18 }}>
          {dots}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button onClick={finish} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
            color: 'var(--text-muted)', fontFamily: 'inherit', padding: '4px 8px',
            borderRadius: 6, transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            {t('tour.skip')}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {!isFirst && (
              <button onClick={back} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                {t('tour.prev')}
              </button>
            )}
            <button onClick={advance} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
              {isLast ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────── LOGIN PAGE ─────────── */
const LoginPage = ({ onLogin }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("sarah@wealthwell.com");
  const [password, setPassword] = useState("demo1234");
  const [showPass, setShowPass] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const data = await api.login(email, password);
      if (data.requires2FA) { setTempToken(data.tempToken); setStep("2fa"); }
      else { api.token = data.token; onLogin(data.user, data.shouldPromptRating, data.hasCompletedProfile); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true); setError("");
    try { const data = await api.verify2FA(tempToken, code); api.token = data.token; onLogin(data.user, data.shouldPromptRating, data.hasCompletedProfile); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} className="mesh-gradient">
      <div className="animate-in" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #0EA5E9, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Wallet size={26} color="white" strokeWidth={1.8} /></div>
            <span className="font-display" style={{ fontSize: 28, fontWeight: 600 }}>WealthWell</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{t("login.tagline")}</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {step === "login" ? (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{t("login.welcomeBack")}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>{t("login.signInToWallet")}</p>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t("login.emailLabel")}</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div>
              <div style={{ marginBottom: 24 }}><label style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t("login.passwordLabel")}</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <div className="error-msg"><AlertCircle size={14} /> {error}</div>}
              <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: error ? 12 : 0 }} onClick={handleLogin} disabled={loading}>{loading ? <RefreshCw size={18} className="loading-spinner" /> : <><Lock size={16} /> {t("login.signIn")}</>}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "var(--text-muted)" }}><div style={{ flex: 1, height: 1, background: "var(--border)" }} /><span style={{ fontSize: 12 }}>or</span><div style={{ flex: 1, height: 1, background: "var(--border)" }} /></div>
              <button className="btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}><Smartphone size={16} /> {t("login.signInSingPass")}</button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>{t("login.noAccount")} <span style={{ color: "var(--accent-teal)", cursor: "pointer", fontWeight: 500 }}>{t("login.getStartedFree")}</span></p>
            </>
          ) : (
            <div className="animate-in">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", background: "rgba(14,165,233,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={28} color="var(--accent-teal)" /></div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{t("login.twoFactorAuth")}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("login.enterCode")}</p>
              </div>
              <div style={{ marginBottom: 24 }}><input className="input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} onKeyDown={e => e.key === "Enter" && handleVerify()} style={{ textAlign: "center", fontSize: 28, letterSpacing: 12, fontWeight: 600 }} /></div>
              {error && <div className="error-msg" style={{ marginBottom: 12 }}><AlertCircle size={14} /> {error}</div>}
              <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleVerify} disabled={loading || code.length < 6}>{loading ? <RefreshCw size={18} className="loading-spinner" /> : <><ShieldCheck size={16} /> {t("login.verifyAndContinue")}</>}</button>
              <button className="btn-ghost" style={{ width: "100%", marginTop: 12, fontSize: 13 }} onClick={() => { setStep("login"); setError(""); }}><ChevronLeft size={14} style={{ marginRight: 4 }} /> {t("login.backToLogin")}</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          {[{ icon: <Lock size={14} />, text: t("login.bankEncryption") }, { icon: <ShieldCheck size={14} />, text: t("login.masRegulated") }, { icon: <Eye size={14} />, text: t("login.readOnlyAccess")}].map((badge, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>{badge.icon} {badge.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────── ONBOARDING ─────────── */
const OnboardingPage = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <Wallet size={32} color="var(--accent-teal)" />, title: t("onboarding.step1Title"), desc: t("onboarding.step1Desc") },
    { icon: <Shield size={32} color="var(--accent-green)" />, title: t("onboarding.step2Title"), desc: t("onboarding.step2Desc") },
    { icon: <Brain size={32} color="var(--accent-purple)" />, title: t("onboarding.step3Title"), desc: t("onboarding.step3Desc") },
    { icon: <Target size={32} color="var(--accent-gold)" />, title: t("onboarding.step4Title"), desc: t("onboarding.step4Desc") },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} className="mesh-gradient">
      <div className="animate-in" style={{ width: "100%", maxWidth: 480 }}>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 36 }}>
            {steps.map((_, i) => (<div key={i} style={{ width: i === step ? 32 : 8, height: 8, borderRadius: 4, background: i <= step ? "var(--accent-teal)" : "var(--border)", transition: "all 0.3s ease" }} />))}
          </div>
          <div key={step} className="animate-in">
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 24px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>{steps[step].icon}</div>
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>{steps[step].title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>{steps[step].desc}</p>
          </div>
          {step === 3 && (
            <div className="animate-in" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {[{ name: "Bank Accounts (DBS, OCBC, UOB)", connected: true }, { name: "CPF & SRS", connected: true }, { name: "Brokerage (FSMOne, IBKR)", connected: true }, { name: "Robo-Advisors (Syfe, Endowus)", connected: true }, { name: "Crypto (Coinhako)", connected: false }].map((acc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)", textAlign: "left" }}>
                  <span style={{ fontSize: 14 }}>{acc.name}</span>
                  {acc.connected ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-green)", fontSize: 13, fontWeight: 500 }}><CheckCircle size={14} /> {t("onboarding.connected")}</span> : <button className="btn-ghost" style={{ fontSize: 13, color: "var(--accent-teal)", fontWeight: 500, padding: "4px 12px" }}><Plus size={14} style={{ marginRight: 4 }} /> {t("onboarding.connect")}</button>}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>{t("common.back")}</button>}
            <button className="btn-primary" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} style={{ display: "flex", alignItems: "center", gap: 8 }}>{step === steps.length - 1 ? t("onboarding.launchDashboard") : t("common.continue")} <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── DASHBOARD VIEW ─────────── */
/* ─────────── LOCALE MAP for Intl.DateTimeFormat ─────────── */
const LOCALE_MAP = { en: 'en-SG', zh: 'zh-CN', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR' };

/* ─────────── DASHBOARD VIEW ─────────── */
const DashboardView = ({ portfolio, wellness, insights, onNavigate, user, displayCurrency, assetCurrencies }) => {
  const { t, i18n } = useTranslation();
  const [trendRange, setTrendRange] = useState('1y');
  if (!portfolio || !wellness) return <Loader text={t("loading.dashboard")} />;
  const locale = LOCALE_MAP[i18n.language] || 'en-SG';

  // Recalculate totals in display currency using per-asset currencies
  const totalWealth = portfolio.assets.reduce((sum, a) => {
    const ac = assetCurrencies[a.id] || 'SGD';
    return sum + convertCurrency(a.value, ac, displayCurrency);
  }, 0);
  const liquidAssets = portfolio.assets
    .filter(a => ['Cash', 'Fixed Income'].includes(a.type))
    .reduce((sum, a) => {
      const ac = assetCurrencies[a.id] || 'SGD';
      return sum + convertCurrency(a.value, ac, displayCurrency);
    }, 0);
  const monthlyChangeAmount = convertCurrency(portfolio.monthlyChange.amount, 'SGD', displayCurrency);

  // ── Parse ISO strings without UTC-offset drift (always local midnight) ──────
  // 'YYYY-MM'    → 1st of that month, local time
  // 'YYYY-MM-DD' → that day, local time
  const parseLocal = (iso) => {
    const parts = iso.split('-').map(Number);
    return parts.length === 3
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(parts[0], parts[1] - 1, 1);
  };

  // ── Today at local midnight (reference for all range math) ───────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // ── Choose daily vs monthly source depending on range ────────────────────
  // '1m' uses per-day data from the server; all other ranges use monthly data.
  const RANGE_OPTS = ['1m', 'ytd', '1y', '5y', 'max'];
  const is1m = trendRange === '1m';

  const sourceHistory = is1m
    ? (portfolio.dailyHistory || [])
    : portfolio.wealthHistory;

  // ── Convert to display currency ───────────────────────────────────────────
  const displayHistory = sourceHistory.map(h => ({
    ...h,
    value: convertCurrency(h.value, 'SGD', displayCurrency),
  }));

  // ── Range filtering ───────────────────────────────────────────────────────
  const filteredHistory = displayHistory.filter(h => {
    const d = parseLocal(is1m ? h.date : h.month);
    switch (trendRange) {
      // Start of previous calendar month → today (daily granularity)
      case '1m':  return d >= new Date(today.getFullYear(), today.getMonth() - 1, 1) && d <= today;
      // Jan 1 of current year → today
      case 'ytd': return d >= new Date(today.getFullYear(), 0, 1) && d <= today;
      // Same month 1 year ago → today
      case '1y':  return d >= new Date(today.getFullYear() - 1, today.getMonth(), 1) && d <= today;
      // Same month 5 years ago → today
      case '5y':  return d >= new Date(today.getFullYear() - 5, today.getMonth(), 1) && d <= today;
      default:    return true; // 'max'
    }
  });

  // ── X-axis tick formatter (locale-aware via Intl, no UTC drift) ───────────
  const formatTick = (iso) => {
    const d = parseLocal(iso);
    if (is1m)
      // e.g. "1 Feb", "15 Mar" — day + short month in active locale
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d);
    if (trendRange === 'ytd')
      return new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
    return new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(d);
  };

  // ── Build final chart data (unified `label` field drives XAxis + tooltip) ─
  const isoKey = is1m ? 'date' : 'month';
  const chartData = filteredHistory.map(h => ({ ...h, label: formatTick(h[isoKey]) }));

  // ── Tick interval: keep axis readable without crowding ────────────────────
  const n = chartData.length;
  const tickInterval = is1m
    ? Math.max(0, Math.round(n / 9) - 1)   // ~9 ticks across ~60 days
    : n <= 13 ? 0 : n <= 24 ? 1 : n <= 60 ? 5 : 11;

  const ChartTooltip = makeChartTooltip(displayCurrency);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 20 }}>
        <div className="card" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)", borderRadius: "0 0 0 100%" }} />
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>{(() => { const h = new Date().getHours(); return h >= 6 && h < 12 ? t("time.goodMorning") : h >= 12 && h < 18 ? t("time.goodAfternoon") : t("time.goodEvening"); })()}</div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>{user?.name ? user.name.split(" ")[0] : "there"} <span style={{ fontSize: 20 }}>👋</span></h1>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{t("dashboard.totalNetWorth")}</div>
              <div className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>{formatFullCurrency(totalWealth, displayCurrency)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 13, color: "var(--accent-green)" }}>
                <ArrowUpRight size={14} /> +{portfolio.monthlyChange.percent}% {t("dashboard.thisMonth")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{t("dashboard.liquidAssets")}</div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{formatFullCurrency(liquidAssets, displayCurrency)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{t("dashboard.exclPropertyVehicle")}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <WealthScore score={wellness.overall} size={130} />
          <button className="btn-ghost" style={{ marginTop: 8, fontSize: 12, color: "var(--accent-teal)" }} onClick={() => onNavigate("analytics")}>{t("common.viewDetails")}</button>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t("dashboard.wealthTrend")}</h3>
            <span className="badge" style={{ background: "rgba(14,165,233,0.1)", color: "var(--accent-teal)", fontSize: 10 }}>{displayCurrency}</span>
          </div>
          {/* Range selector */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {RANGE_OPTS.map(r => (
              <button
                key={r}
                onClick={() => setTrendRange(r)}
                style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: "1px solid", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                  background: trendRange === r ? "var(--accent-teal)" : "transparent",
                  borderColor: trendRange === r ? "var(--accent-teal)" : "var(--border)",
                  color: trendRange === r ? "white" : "var(--text-muted)",
                }}
              >
                {t(`dashboard.trend_${r}`)}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, displayCurrency)} domain={['dataMin - 20000', 'dataMax + 10000']} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#wg)" dot={chartData.length <= 24 ? { fill: "#0EA5E9", r: 3, strokeWidth: 0 } : false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t("dashboard.assetAllocation")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RPieChart>
              <Pie data={portfolio.allocation} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {portfolio.allocation.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="tooltip-custom" style={{ padding: "8px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{payload[0].name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {formatFullCurrency(convertCurrency(payload[0].value, 'SGD', displayCurrency), displayCurrency)} ({((payload[0].value / portfolio.totalWealth) * 100).toFixed(1)}%)
                  </div>
                </div>
              ) : null} />
            </RPieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {portfolio.allocation.slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} /> {a.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {insights && insights.length > 0 && (
        <div className="animate-in-delay-2 card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(14,165,233,0.2))", display: "flex", alignItems: "center", justifyContent: "center" }}><Brain size={17} color="var(--accent-purple)" /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t("dashboard.aiInsights")}</h3>
              <span className="badge" style={{ background: "rgba(14,165,233,0.12)", color: "var(--accent-teal)", fontSize: 11 }}><Sparkles size={11} /> {t("dashboard.newCount", { count: insights.length })}</span>
            </div>
            <button className="btn-ghost" style={{ fontSize: 13, color: "var(--accent-teal)" }} onClick={() => onNavigate("insights")}>{t("common.viewAll")}</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.slice(0, 3).map(ins => (
              <div key={ins.id} className={`insight-card ${ins.type}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {ins.type === "warning" ? <AlertTriangle size={15} color="var(--accent-gold)" /> : ins.type === "opportunity" ? <Lightbulb size={15} color="var(--accent-teal)" /> : <CheckCircle size={15} color="var(--accent-green)" />}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{useInsightText(ins, 'title', t, displayCurrency)}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{useInsightText(ins, 'summary', t, displayCurrency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-in-delay-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { icon: <Plus size={18} />, label: t("dashboard.addAsset"), color: "var(--accent-teal)", action: () => onNavigate("wallet") },
          { icon: <Target size={18} />, label: t("dashboard.setGoal"), color: "var(--accent-gold)", action: () => onNavigate("goals") },
          { icon: <Activity size={18} />, label: t("dashboard.runScenario"), color: "var(--accent-purple)", action: () => onNavigate("scenarios") },
          { icon: <Download size={18} />, label: t("dashboard.exportReport"), color: "var(--accent-green)", action: () => onNavigate("export") },
        ].map((a, i) => (
          <button key={i} className="card" onClick={a.action} style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color }}>{a.icon}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────── WALLET VIEW ─────────── */
const WalletView = ({ portfolio, refreshPortfolio, displayCurrency, assetCurrencies, updateAssetCurrency }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", type: "Cash", institution: "", value: "", currency: "SGD" });
  const [saving, setSaving] = useState(false);

  if (!portfolio) return <Loader />;

  // Recalculate totals in display currency using per-asset currencies
  const totalInDisplay = portfolio.assets.reduce((sum, a) => {
    const ac = assetCurrencies[a.id] || 'SGD';
    return sum + convertCurrency(a.value, ac, displayCurrency);
  }, 0);
  const monthlyChangeInDisplay = convertCurrency(portfolio.monthlyChange.amount, 'SGD', displayCurrency);

  const types = ["All", ...new Set(portfolio.assets.map(a => a.type))];
  const filtered = portfolio.assets
    .filter(a => filter === "All" || a.type === filter)
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.institution.toLowerCase().includes(search.toLowerCase()));
  const ASSET_TYPE_KEYS = {
    'All': 'assetTypes.all', 'Cash': 'assetTypes.cash', 'Retirement': 'assetTypes.retirement',
    'Equities': 'assetTypes.equities', 'REITs': 'assetTypes.reits', 'Fixed Income': 'assetTypes.fixedIncome',
    'Crypto': 'assetTypes.crypto', 'Property': 'assetTypes.property', 'Vehicle': 'assetTypes.vehicle',
  };
  // Maps every riskLevel string the server emits to its i18n key
  const RISK_LEVEL_KEYS = {
    'Very Low':     'riskLevel.veryLow',
    'Low':          'riskLevel.low',
    'Low-Medium':   'riskLevel.lowMedium',
    'Medium':       'riskLevel.medium',
    'Medium-High':  'riskLevel.mediumHigh',
    'High':         'riskLevel.high',
    'Very High':    'riskLevel.veryHigh',
    'Depreciating': 'riskLevel.depreciating',
    'Unknown':      'riskLevel.unknown',
  };

  const handleAdd = async () => {
    if (!newAsset.name || !newAsset.value) return;
    setSaving(true);
    try {
      const created = await api.addAsset({ name: newAsset.name, type: newAsset.type, institution: newAsset.institution, value: newAsset.value });
      // Persist the chosen currency for this new asset
      if (created?.id && newAsset.currency) {
        updateAssetCurrency(created.id, newAsset.currency);
      }
      await refreshPortfolio();
      setShowAdd(false);
      setNewAsset({ name: "", type: "Cash", institution: "", value: "", currency: "SGD" });
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await api.deleteAsset(id); await refreshPortfolio(); } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("wallet.title")}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("wallet.subtitle")}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 14 }}>
          <Plus size={16} /> {t("wallet.addAsset")}
        </button>
      </div>

      {/* Add Asset Form */}
      {showAdd && (
        <div className="animate-in card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t("wallet.addNewAsset")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 120px auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("common.name")} *</label>
              <input className="input" placeholder={t("wallet.namePlaceholder")} value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("wallet.type")}</label>
              <select className="input" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
                {[["Cash","assetTypes.cash"],["Equities","assetTypes.equities"],["Fixed Income","assetTypes.fixedIncome"],["Crypto","assetTypes.crypto"],["REITs","assetTypes.reits"],["Retirement","assetTypes.retirement"],["Property","assetTypes.property"],["Vehicle","assetTypes.vehicle"]].map(([val, key]) => <option key={val} value={val}>{t(key)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("wallet.institution")}</label>
              <input className="input" placeholder={t("wallet.institutionPlaceholder")} value={newAsset.institution} onChange={e => setNewAsset({...newAsset, institution: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("wallet.value")} *</label>
              <input className="input" type="number" placeholder="50000" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("common.currency")}</label>
              <select className="input" value={newAsset.currency} onChange={e => setNewAsset({...newAsset, currency: e.target.value})} style={{ padding: "12px 10px" }}>
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ padding: "12px 20px" }}>
              {saving ? <RefreshCw size={16} className="loading-spinner" /> : t("common.add")}
            </button>
          </div>
          {newAsset.currency !== 'SGD' && newAsset.value && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(14,165,233,0.06)", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={12} color="var(--accent-teal)" />
              {CURRENCIES[newAsset.currency]?.symbol}{parseFloat(newAsset.value || 0).toLocaleString()} {newAsset.currency} ≈ {formatFullCurrency(convertCurrency(parseFloat(newAsset.value || 0), newAsset.currency, 'SGD'), 'SGD')} · shown as {formatFullCurrency(convertCurrency(parseFloat(newAsset.value || 0), newAsset.currency, displayCurrency), displayCurrency)} in {displayCurrency}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: t("dashboard.totalNetWorth"), value: formatFullCurrency(totalInDisplay, displayCurrency), icon: <Wallet size={18} />, color: "var(--accent-teal)" },
          { label: t("wallet.monthlyChange"), value: `+${formatFullCurrency(monthlyChangeInDisplay, displayCurrency)}`, icon: <TrendingUp size={18} />, color: "var(--accent-green)", sub: `+${portfolio.monthlyChange.percent}%` },
          { label: t("wallet.assetsTracked"), value: portfolio.assets.length, icon: <PieChart size={18} />, color: "var(--accent-purple)", sub: t("common.acrossInstitutions", { count: new Set(portfolio.assets.map(a => a.institution)).size }) },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ color: c.color }}>{c.icon}</div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 }}>{c.label}</span>
              {i < 2 && <span className="badge" style={{ background: "rgba(148,163,184,0.08)", color: "var(--text-muted)", fontSize: 10, marginLeft: "auto" }}>{displayCurrency}</span>}
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="animate-in-delay-1" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("wallet.searchPlaceholder")} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {types.map(typeLabel => <button key={typeLabel} className="tab-btn" onClick={() => setFilter(typeLabel)} style={filter === typeLabel ? { background: "var(--accent-teal)", color: "white" } : {}}>{ASSET_TYPE_KEYS[typeLabel] ? t(ASSET_TYPE_KEYS[typeLabel]) : typeLabel}</button>)}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Globe size={12} /> {t("wallet.clickCurrencyBadge")}
        </div>
      </div>

      {/* Asset List */}
      <div className="animate-in-delay-2" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(asset => {
          const assetCurrency = assetCurrencies[asset.id] || 'SGD';
          const valueInAssetCurrency = asset.value; // original value is in assetCurrency
          const valueInDisplay = convertCurrency(asset.value, assetCurrency, displayCurrency);
          const showDual = assetCurrency !== displayCurrency;
          return (
            <div key={asset.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${asset.color}18`, color: asset.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AssetIcon type={asset.icon} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{asset.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {asset.institution} · {ASSET_TYPE_KEYS[asset.type] ? t(ASSET_TYPE_KEYS[asset.type]) : asset.type}
                    {asset.riskLevel && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: asset.riskScore >= 4 ? "rgba(239,68,68,0.15)" : asset.riskScore >= 3 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: asset.riskScore >= 4 ? "var(--accent-red)" : asset.riskScore >= 3 ? "var(--accent-gold)" : "var(--accent-green)", fontWeight: 600 }}>
                        {RISK_LEVEL_KEYS[asset.riskLevel] ? t(RISK_LEVEL_KEYS[asset.riskLevel]) : asset.riskLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Currency badge */}
                <AssetCurrencyBadge assetId={asset.id} currency={assetCurrency} onChangeCurrency={updateAssetCurrency} />
                <div style={{ textAlign: "right" }}>
                  {/* Primary: value in display currency */}
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{formatFullCurrency(valueInDisplay, displayCurrency)}</div>
                  {/* Secondary: original asset currency (if different from display) */}
                  {showDual && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                      {formatFullCurrency(valueInAssetCurrency, assetCurrency)}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 500, color: asset.change >= 0 ? "var(--accent-green)" : "var(--accent-red)", display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end", marginTop: showDual ? 0 : 2 }}>
                    {asset.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{(Math.abs(asset.change) * 100).toFixed(1)}%
                  </div>
                </div>
                <button onClick={() => handleDelete(asset.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }} title="Delete asset">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── ANALYTICS VIEW ─────────── */
const AnalyticsView = ({ wellness, portfolio, displayCurrency, userRiskProfile, onRetakeAssessment }) => {
  const { t } = useTranslation();
  if (!wellness || !portfolio) return <Loader />;
  const tipKeys = {
    "Diversification": "analytics.tipDiversification",
    "Liquidity": "analytics.tipLiquidity",
    "Growth": "analytics.tipGrowth",
    "Risk Mgmt": "analytics.tipRiskMgmt",
    "Tax Efficiency": "analytics.tipTaxEfficiency",
    "Emergency Fund": "analytics.tipEmergencyFund",
    "Behavioral Resilience": "analytics.tipBehavioralResilience",
  };
  // Map server metric keys → translation keys for display labels
  const metricLabelKeys = {
    "Diversification": "analytics.metricDiversification",
    "Liquidity": "analytics.metricLiquidity",
    "Growth": "analytics.metricGrowth",
    "Risk Mgmt": "analytics.metricRiskMgmt",
    "Tax Efficiency": "analytics.metricTaxEfficiency",
    "Emergency Fund": "analytics.metricEmergencyFund",
    "Behavioral Resilience": "analytics.metricBehavioralResilience",
  };
  const metricLabel = (key) => metricLabelKeys[key] ? t(metricLabelKeys[key]) : key;
  // Use translated labels as radar subjects so the chart axis labels are translated too
  const radarData = wellness.metrics.map(m => ({ subject: metricLabel(m.metric), A: m.score, fullMark: 100 }));
  const profileKey = userRiskProfile?.riskProfile ?? wellness.riskProfile ?? 'balanced';
  const meta = PROFILE_META[profileKey] || PROFILE_META.balanced;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("analytics.title")}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("analytics.subtitle")}</p>
        </div>
      </div>

      {/* Risk Profile Banner */}
      <div className="animate-in card" style={{ padding:"20px 24px", background:meta.bg, border:`1px solid ${meta.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:32 }}>{meta.emoji}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:16, fontWeight:700, color:meta.color }}>{t(meta.labelKey)}</span>
              <span style={{ fontSize:12, color:meta.color, opacity:0.8 }}>· {t(meta.subtitleKey)}</span>
            </div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", maxWidth:460 }}>{t(`profile.${profileKey}Desc`)}</p>
          </div>
        </div>
        <button onClick={onRetakeAssessment} className="btn-ghost" style={{ fontSize:13, whiteSpace:"nowrap", borderColor:meta.color, color:meta.color }}>
          {t("analytics.retakeAssessment")}
        </button>
      </div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <WealthScore score={wellness.overall} size={180} />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: wellness.overall >= 75 ? "var(--accent-green)" : "var(--accent-gold)" }}>{wellness.overall >= 75 ? t("common.excellent") : wellness.overall >= 50 ? t("common.goodRoomToImprove") : t("common.needsAttention")}</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, maxWidth: 240 }}>{t("analytics.focusMessage")}</p>
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{t("analytics.wellnessBreakdown")}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(148,163,184,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="A" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="animate-in-delay-1 card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t("analytics.detailedMetrics")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {wellness.metrics.map((m, i) => {
            const color = m.score >= 75 ? "var(--accent-green)" : m.score >= 50 ? "var(--accent-gold)" : "var(--accent-red)";
            const status = m.score >= 75 ? t("common.excellent") : m.score >= 50 ? t("common.fair") : t("common.needsWork");
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{metricLabel(m.metric)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge" style={{ background: `${color}18`, color, fontSize: 11 }}>{status}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{m.score}/100</span>
                  </div>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", marginBottom: 6 }}>
                  <div style={{ width: `${m.score}%`, height: "100%", borderRadius: 3, background: color, transition: "width 1s ease" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{tipKeys[m.metric] ? t(tipKeys[m.metric]) : ""}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────── AI INSIGHTS VIEW ─────────── */
// WELCOME_MSG is now built inline using t() so it picks up the active language.
// See InsightsView for usage.

const InsightsView = ({ insights, displayCurrency }) => {
  const { t } = useTranslation();
  const makeWelcome = (currency) => ({ role: "assistant", text: t("insights.aiWelcome", { currency }) });
  const [expandedId, setExpandedId] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => [makeWelcome(displayCurrency)]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // When the display currency changes, reset the chat UI to match the server-side history reset
  const prevCurrencyRef = useRef(displayCurrency);
  useEffect(() => {
    if (prevCurrencyRef.current !== displayCurrency) {
      prevCurrencyRef.current = displayCurrency;
      setChatMessages([makeWelcome(displayCurrency)]);
      setChatInput("");
    }
  }, [displayCurrency]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatMessages(prev => [...prev, { role: "user", text: q }]);
    setChatInput(""); setChatLoading(true);
    // fxRate = how many displayCurrency units equal 1 SGD (SGD->displayCurrency multiplier)
    // FX_TO_SGD stores 1 unit of X = N SGD, so invert: 1 SGD = 1/N units of X
    const fxRate = 1 / (FX_TO_SGD[displayCurrency] ?? 1);
    try { const data = await api.chat(q, displayCurrency, fxRate); setChatMessages(prev => [...prev, { role: "assistant", text: data.reply }]); }
    catch (err) { setChatMessages(prev => [...prev, { role: "assistant", text: t("insights.chatError") }]); }
    setChatLoading(false);
  };
  const cur = CURRENCIES[displayCurrency] ?? CURRENCIES.SGD;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("insights.title")}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("insights.subtitle")}</p>
        </div>
        <button data-tour="chat-coach" className="btn-primary" onClick={() => setAiChatOpen(!aiChatOpen)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "10px 20px" }}>
          <MessageSquare size={16} /> {aiChatOpen ? t("insights.closeChat") : t("insights.chatWithCoach")}
        </button>
      </div>

      {aiChatOpen && (
        <div className="animate-in card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(14,165,233,0.12))", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <Brain size={18} color="var(--accent-purple)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>{t("insights.aiFinancialCoach")}</span>
            <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-green)", fontSize: 10, marginLeft: "auto" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} /> {t("common.online")}
            </span>
          </div>
          <div className="scrollbar-thin" style={{ height: 280, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.6, background: msg.role === "user" ? "var(--accent-teal)" : "var(--bg-elevated)", color: msg.role === "user" ? "white" : "var(--text-primary)", borderBottomRightRadius: msg.role === "user" ? 4 : 14, borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14 }}>{msg.text}</div>
              </div>
            ))}
            {chatLoading && (<div style={{ display: "flex", gap: 6, padding: "12px 16px" }}>{[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1s ease ${i * 0.2}s infinite` }} />)}</div>)}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
            <input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t("insights.askPlaceholder")} style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && sendChat()} />
            <button className="btn-primary" onClick={sendChat} style={{ padding: "10px 18px" }}><ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      <div className="animate-in" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[t("insights.q1"), t("insights.q2"), t("insights.q3"), t("insights.q4")].map((q, i) => (
          <button key={i} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => { setAiChatOpen(true); setChatInput(q); }}>{q}</button>
        ))}
      </div>

      {/* Currency context banner */}
      {displayCurrency !== 'SGD' && (
        <div style={{ padding: "10px 16px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <Globe size={14} color="var(--accent-teal)" />
          {t("insights.currencyNote", { currency: displayCurrency, symbol: cur.symbol, rateType: fxRatesLastUpdated ? t("insights.liveRates") : t("insights.indicativeRates"), rate: (FX_TO_SGD[displayCurrency] ?? 1).toFixed(4) })}
        </div>
      )}

      {insights && (
        <div className="animate-in-delay-1" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>{t("insights.portfolioAnalysis")}</h3>
          {insights.map(ins => (
            <div key={ins.id} className={`insight-card ${ins.type}`} onClick={() => setExpandedId(expandedId === ins.id ? null : ins.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {ins.type === "warning" ? <AlertTriangle size={15} color="var(--accent-gold)" /> : ins.type === "opportunity" ? <Lightbulb size={15} color="var(--accent-teal)" /> : <CheckCircle size={15} color="var(--accent-green)" />}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{useInsightText(ins, 'title', t, displayCurrency)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge" style={{ background: "rgba(148,163,184,0.1)", color: "var(--text-muted)", fontSize: 10 }}>
                    {({"Risk": t("insights.catRisk"), "Tax": t("insights.catTax"), "Liquidity": t("insights.catLiquidity"), "Planning": t("insights.catPlanning"), "Growth": t("insights.catGrowth"), "Retirement": t("insights.catRetirement"), "Diversification": t("insights.catDiversification")})[ins.category] || ins.category}
                  </span>
                  {expandedId === ins.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {useInsightText(ins, 'summary', t, displayCurrency)}
              </p>
              {expandedId === ins.id && (
                <div className="animate-in" style={{ marginTop: 12, padding: "12px 16px", background: "rgba(14,165,233,0.06)", borderRadius: "var(--radius-xs)", border: "1px solid rgba(14,165,233,0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Zap size={13} color="var(--accent-teal)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: 0.5 }}>{t("insights.suggestedAction")}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
                    {useInsightText(ins, 'action', t, displayCurrency)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────── SCENARIO VIEW ─────────── */
const ScenarioView = ({ displayCurrency }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState({ equity: 0, crypto: 0, property: 0, cash: 0 });
  const [result, setResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const presets = [
    { nameKey: "scenarios.marketCrash", eq: -0.3, cr: -0.5, pr: -0.1, ca: 0 },
    { nameKey: "scenarios.rateHike", eq: -0.1, cr: -0.15, pr: -0.05, ca: 0.02 },
    { nameKey: "scenarios.bullMarket", eq: 0.2, cr: 0.4, pr: 0.05, ca: 0.01 },
    { nameKey: "scenarios.recession", eq: -0.2, cr: -0.35, pr: -0.08, ca: 0 },
  ];
  const runSimulation = async (params) => {
    setSimulating(true);
    try { const data = await api.simulate(params); setResult(data); } catch (err) { console.error(err); }
    setSimulating(false);
  };
  useEffect(() => {
    const params = selected !== null
      ? { equityChange: presets[selected].eq, cryptoChange: presets[selected].cr, propertyChange: presets[selected].pr, cashChange: presets[selected].ca }
      : { equityChange: custom.equity / 100, cryptoChange: custom.crypto / 100, propertyChange: custom.property / 100, cashChange: custom.cash / 100 };
    runSimulation(params);
  }, [selected, custom]);

  // Convert server results (SGD) to display currency
  const displayTotal = result ? convertCurrency(result.projectedTotal, 'SGD', displayCurrency) : 0;
  const displayChange = result ? convertCurrency(result.change, 'SGD', displayCurrency) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in">
        <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("scenarios.title")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("scenarios.subtitle")}</p>
      </div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {presets.map((s, i) => (
          <button key={i} onClick={() => setSelected(selected === i ? null : i)} className="card" style={{ padding: 16, cursor: "pointer", textAlign: "center", borderColor: selected === i ? "var(--accent-teal)" : "var(--border)", background: selected === i ? "rgba(14,165,233,0.06)" : "var(--bg-card)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{t(s.nameKey)}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("scenarios.equityLabel")}: {s.eq > 0 ? "+" : ""}{(s.eq * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>
      <div className="animate-in-delay-1 card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t("scenarios.customScenario")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[{ labelKey: "scenarios.equities", key: "equity" }, { labelKey: "scenarios.crypto", key: "crypto" }, { labelKey: "scenarios.property", key: "property" }, { labelKey: "scenarios.cashBonds", key: "cash" }].map(s => (
            <div key={s.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t(s.labelKey)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: custom[s.key] >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{custom[s.key] > 0 ? "+" : ""}{custom[s.key]}%</span>
              </div>
              <input type="range" min={-50} max={50} value={custom[s.key]} onChange={e => { setSelected(null); setCustom(prev => ({ ...prev, [s.key]: parseInt(e.target.value) })); }} style={{ width: "100%", accentColor: "var(--accent-teal)" }} />
            </div>
          ))}
        </div>
      </div>
      {result && (
        <div className="animate-in-delay-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>{t("scenarios.impactSummary")}</h3>
              <span className="badge" style={{ background: "rgba(148,163,184,0.08)", color: "var(--text-muted)", fontSize: 10 }}>{displayCurrency}</span>
            </div>
            {simulating ? <Loader text={t("scenarios.simulating")} /> : (
              <>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{t("scenarios.projectedNetWorth")}</div>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>{formatFullCurrency(displayTotal, displayCurrency)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, color: displayChange >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {displayChange >= 0 ? "+" : ""}{formatFullCurrency(displayChange, displayCurrency)} ({result.changePercent.toFixed(1)}%)
                </div>
              </>
            )}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t("scenarios.assetImpactBreakdown")}</h3>
            <div className="scrollbar-thin" style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {result.breakdown.filter(a => a.change !== 0).map((a, i) => {
                const changeInDisplay = convertCurrency(a.change, 'SGD', displayCurrency);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} /><span>{a.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: changeInDisplay >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {changeInDisplay >= 0 ? "+" : ""}{formatFullCurrency(changeInDisplay, displayCurrency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────── SECURITY SETTINGS ─────────── */
const SecuritySettings = () => {
  const { t } = useTranslation();
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChangePassword = async () => {
    setMsg(""); setErr("");
    if (!curPw || !newPw) { setErr(t("settings.fillBothFields")); return; }
    if (newPw !== confirmPw) { setErr(t("settings.passwordsNoMatch")); return; }
    if (newPw.length < 8) { setErr(t("settings.minChars")); return; }
    setSaving(true);
    try {
      await api.updateProfile({ currentPassword: curPw, newPassword: newPw });
      setMsg(t("settings.passwordUpdated"));
      setCurPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) { setErr(e.message || t("settings.failedUpdatePassword")); }
    setSaving(false);
  };

  const securityItems = [
    { icon: <ShieldCheck size={20} color="var(--accent-green)" />, title: t("login.twoFactorAuth"), sub: t("settings.twoFactorAuthDesc"), btn: t("settings.configure") },
    { icon: <Eye size={20} color="var(--accent-purple)" />, title: t("settings.dataAccess"), sub: t("settings.dataAccessDesc"), btn: t("settings.viewAuditLog") },
    { icon: <Smartphone size={20} color="var(--accent-gold)" />, title: t("settings.activeSessions"), sub: t("settings.activeSessionsDesc"), btn: t("settings.manage") },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Security items */}
      <div className="animate-in card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{t("settings.securityTitle")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {securityItems.map((item, i) => (
            <div key={i} style={{ padding: 16, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.icon}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</div>
                </div>
              </div>
              <button className="btn-secondary" style={{ fontSize: 13 }}>{item.btn}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="animate-in card" style={{ padding: 28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <Key size={18} color="var(--accent-teal)" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t("settings.changePassword")}</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn:"1 / -1" }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("settings.currentPassword")}</label>
            <input className="input" type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder={t("settings.currentPasswordPlaceholder")} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("settings.newPassword")}</label>
            <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t("settings.newPasswordPlaceholder")} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("settings.confirmNewPassword")}</label>
            <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder={t("settings.confirmPasswordPlaceholder")} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleChangePassword} disabled={saving} style={{ padding: "10px 24px", fontSize: 14 }}>
            {saving ? t("common.updating") : t("settings.updatePassword")}
          </button>
          {msg && <span style={{ fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {msg}</span>}
          {err && <span style={{ fontSize: 13, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={14} /> {err}</span>}
        </div>
      </div>
    </div>
  );
};

/* ─────────── ACCOUNT SETTINGS ─────────── */
const AccountSettings = ({ setUser, userRiskProfile, onRetakeAssessment }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { api.getProfile().then(p => { setName(p.name); setEmail(p.email); }).catch(() => {}); }, []);
  const handleSave = async () => {
    setSaving(true); setMsg(""); setErr("");
    try {
      const updated = await api.updateProfile({ name, email });
      setMsg(t("settings.profileUpdated")); if (setUser) setUser(updated);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };
  const profileKey = userRiskProfile?.riskProfile ?? 'balanced';
  const meta = PROFILE_META[profileKey] || PROFILE_META.balanced;
  const answers = userRiskProfile?.answers ?? null;
  // Map questionId to question text for display
  const profilerQs = getProfilerQuestions(t);
  const qMap = Object.fromEntries(profilerQs.map(q => [q.id, q.question]));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Basic info */}
      <div className="animate-in card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{t("settings.accountInformation")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t("common.name")}</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t("common.email")}</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", fontSize: 14 }}>{saving ? t("common.saving") : t("settings.saveChanges")}</button>
          {msg && <span style={{ fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {msg}</span>}
          {err && <span style={{ fontSize: 13, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={14} /> {err}</span>}
        </div>
      </div>

      {/* Risk profile section */}
      <div className="animate-in card" style={{ padding: 24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:600, marginBottom:2 }}>{t("settings.riskProfile")}</h3>
            <p style={{ fontSize:13, color:"var(--text-muted)" }}>{t("settings.riskProfileDesc")}</p>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:20, background:meta.bg, border:`1px solid ${meta.border}` }}>
            <span style={{ fontSize:18 }}>{meta.emoji}</span>
            <span style={{ fontSize:14, fontWeight:700, color:meta.color }}>{t(meta.labelKey)}</span>
          </div>
        </div>

        {answers ? (
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
            {profilerQs.map(q => {
              const ans = (Array.isArray(answers) ? answers.find(a => a.questionId === q.id) : answers[q.id]);
              // Match by score so the label always renders in the active language
              const translatedLabel = q.options.find(opt => opt.score === ans?.score)?.label ?? ans?.label ?? '—';
              return (
                <div key={q.id} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"8px 12px", borderRadius:8, background:"var(--bg-secondary)" }}>
                  <span style={{ color:"var(--text-muted)" }}>{q.icon} {q.question.replace('?','')}</span>
                  <span style={{ fontWeight:500 }}>{translatedLabel}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:"16px", borderRadius:8, background:"var(--bg-secondary)", marginBottom:20, fontSize:13, color:"var(--text-muted)", textAlign:"center" }}>
            {t("settings.noProfileRecord")}
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="btn-secondary" onClick={onRetakeAssessment} style={{ fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
            <RefreshCw size={14} /> {t("settings.retakeAssessment")}
          </button>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{t("settings.wellnessRecalculated")}</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────── GOALS VIEW ─────────── */
const GoalsView = ({ displayCurrency }) => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", targetAmount: "", deadline: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const loadGoals = async () => { try { const data = await api.getGoals(); setGoals(data.goals || []); } catch (e) { console.error(e); } setLoading(false); };
  useEffect(() => { loadGoals(); }, []);
  const handleAdd = async () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    setSaving(true);
    try { await api.createGoal(newGoal); await loadGoals(); setShowAdd(false); setNewGoal({ title: "", description: "", targetAmount: "", deadline: "", category: "general" }); } catch (e) { console.error(e); }
    setSaving(false);
  };
  const handleDelete = async (id) => { try { await api.deleteGoal(id); await loadGoals(); } catch (e) { console.error(e); } };
  const catColors = { safety: "var(--accent-green)", tax: "var(--accent-teal)", growth: "var(--accent-purple)", general: "var(--accent-gold)" };
  const catIcons = { safety: <ShieldCheck size={18} />, tax: <DollarSign size={18} />, growth: <TrendingUp size={18} />, general: <Target size={18} /> };
  if (loading) return <Loader text={t("goals.loading")} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("goals.pageTitle")}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("goals.pageSubtitle")}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 14 }}><Plus size={16} /> {t("goals.newGoal")}</button>
      </div>
      {showAdd && (
        <div className="animate-in card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t("goals.createNewGoal")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("goals.goalTitleLabel")} *</label><input className="input" placeholder={t("goals.titlePlaceholder")} value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("goals.targetAmountLabel")} (SGD) *</label><input className="input" type="number" placeholder="50000" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("goals.categoryLabel")}</label><select className="input" value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})}><option value="safety">{t("goals.catSafety")}</option><option value="tax">{t("goals.catTax")}</option><option value="growth">{t("goals.catGrowth")}</option><option value="general">{t("goals.catGeneral")}</option></select></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("goals.deadlineLabel")}</label><input className="input" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("goals.descriptionLabel")}</label><input className="input" placeholder={t("goals.descriptionPlaceholder")} value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}><button className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? t("common.saving") : t("goals.addGoal")}</button><button className="btn-secondary" onClick={() => setShowAdd(false)}>{t("common.cancel")}</button></div>
        </div>
      )}
      {goals.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}><Target size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} /><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("goals.noGoalsYet")}</h3><p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("goals.startTracking")}</p></div>
      ) : (
        <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.map(g => {
            const color = catColors[g.category] || "var(--accent-gold)";
            const currentInDisplay = convertCurrency(g.currentAmount, 'SGD', displayCurrency);
            const targetInDisplay = convertCurrency(g.targetAmount, 'SGD', displayCurrency);
            const remainingInDisplay = convertCurrency(g.remaining, 'SGD', displayCurrency);
            return (
              <div key={g.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", color, display: "flex", alignItems: "center", justifyContent: "center" }}>{catIcons[g.category] || <Target size={18} />}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
                        {g.titleKey ? t(`goals.preset.${g.titleKey}.title`) : g.title}
                      </div>
                      {g.description && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                          {g.titleKey ? t(`goals.preset.${g.titleKey}.desc`) : g.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {g.isComplete && <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-green)", fontSize: 11 }}><CheckCircle size={11} /> {t("common.complete")}</span>}
                    {g.daysLeft > 0 && !g.isComplete && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("common.daysLeft", { count: g.daysLeft })}</span>}
                    <button onClick={() => handleDelete(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{formatFullCurrency(currentInDisplay, displayCurrency)} {t("goals.of")} {formatFullCurrency(targetInDisplay, displayCurrency)}</span>
                  <span style={{ fontWeight: 600, color }}>{g.progress}%</span>
                </div>
                <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(148,163,184,0.1)" }}><div style={{ width: g.progress + "%", height: "100%", borderRadius: 4, background: g.isComplete ? "var(--accent-green)" : color, transition: "width 0.8s ease" }} /></div>
                {g.remaining > 0 && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{formatFullCurrency(remainingInDisplay, displayCurrency)} {t("common.remaining")}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────── EXPORT VIEW ─────────── */
const ExportView = ({ displayCurrency = 'SGD' }) => {
  const { t, i18n } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  useEffect(() => { api.getEmailPrefs().then(p => { setEmailPrefs(p); setCustomEmail(p.email || ""); setLoadingPrefs(false); }).catch(() => setLoadingPrefs(false)); }, []);
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const url = "/api/export/" + format;
      const res = await fetch(url, { headers: { "Authorization": "Bearer " + api.token } });
      const blob = await res.blob();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "wealthwell-report." + (format === "json" ? "json" : "csv");
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    } catch (e) { console.error(e); }
    setExporting(false);
  };
  const handleFreqChange = async (freq) => { try { const updated = await api.updateEmailPrefs({ reportFrequency: freq }); setEmailPrefs(updated); } catch (e) { console.error(e); } };
  const handleSendNow = async () => {
    if (!customEmail) return; setSending(true); setSentMsg("");
    try { await api.sendReport(customEmail, i18n.language || 'en', displayCurrency); setSentMsg(t('export.reportSent', { email: customEmail })); const updated = await api.getEmailPrefs(); setEmailPrefs(updated); }
    catch (e) { setSentMsg(t('export.reportFailed')); }
    setSending(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in"><h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("export.title")}</h2><p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{t("export.subtitle")}</p></div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><FileText size={24} color="var(--accent-green)" /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("export.exportCSV")}</h3><p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("export.csvDesc")}</p>
          <button className="btn-primary" onClick={() => handleExport("csv")} disabled={exporting} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14 }}>{exporting ? t("common.exporting") : t("export.downloadCSV")}</button>
        </div>
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(14,165,233,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Download size={24} color="var(--accent-teal)" /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("export.exportJSON")}</h3><p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("export.jsonDesc")}</p>
          <button className="btn-secondary" onClick={() => handleExport("json")} disabled={exporting} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14 }}>{exporting ? "Exporting..." : t("export.downloadJSON")}</button>
        </div>
      </div>
      <div className="animate-in-delay-1 card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("export.emailReports")}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>{t("export.emailReportsDesc")}</p>
        {loadingPrefs ? <Loader text="Loading..." /> : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{ key: "monthly", label: t("common.monthly") }, { key: "yearly", label: t("common.yearly") }, { key: "off", label: t("common.off") }].map(opt => (
                <button key={opt.key} className="tab-btn" onClick={() => handleFreqChange(opt.key)} style={emailPrefs?.reportFrequency === opt.key ? { background: "var(--accent-teal)", color: "white" } : {}}>{opt.label}</button>
              ))}
            </div>
            {emailPrefs?.reportFrequency !== "off" && (
              <div style={{ padding: 16, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>{t("common.frequency")}</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs?.reportFrequency}</span></div>
                {emailPrefs?.nextScheduled && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}><span style={{ color: "var(--text-muted)" }}>{t("common.nextReport")}</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs.nextScheduled}</span></div>}
                {emailPrefs?.lastSent && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}><span style={{ color: "var(--text-muted)" }}>{t("common.lastSent")}</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs.lastSent}</span></div>}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{t("export.sendReportTo")}</label><input className="input" value={customEmail} onChange={e => setCustomEmail(e.target.value)} placeholder={t("export.emailPlaceholder")} style={{ fontSize: 13 }} /></div>
              <button className="btn-primary" onClick={handleSendNow} disabled={sending || !customEmail} style={{ padding: "12px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>{sending ? <RefreshCw size={16} className="loading-spinner" /> : <Bell size={16} />} {t("export.sendNow")}</button>
            </div>
            {sentMsg && <div style={{ marginTop: 10, fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {sentMsg}</div>}
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────── SETTINGS VIEW ─────────── */
const SettingsView = ({ user, setUser, displayCurrency, setDisplayCurrency, fxLastUpdated, userRiskProfile, onRetakeAssessment, theme, setTheme }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");
  const [upgrading, setUpgrading] = useState(false);
  const handleUpgrade = async (plan) => {
    setUpgrading(true);
    try { const data = await api.createCheckout(plan); alert(`Stripe Checkout: ${data.message}\n\nPlan: ${plan}\nAmount: $${data.amount} SGD/month\nSession: ${data.sessionId}`); }
    catch (err) { console.error(err); }
    setUpgrading(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in"><h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{t("settings.title")}</h2></div>
      <div data-tour="settings-tabs" className="animate-in" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[{ key: "account", label: t("settings.account") }, { key: "security", label: t("settings.security") }, { key: "plan", label: t("settings.subscription") }, { key: "currency", label: t("settings.currency") }, { key: "language", label: t("settings.language") }, { key: "appearance", label: t("settings.appearance") }].map(tab => (
          <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={activeTab === tab.key ? { background: "var(--accent-teal)", color: "white" } : {}}>{tab.label}</button>
        ))}
      </div>

      {activeTab === "account" && <AccountSettings setUser={setUser} userRiskProfile={userRiskProfile} onRetakeAssessment={onRetakeAssessment} />}

      {activeTab === "security" && <SecuritySettings />}

      {activeTab === "plan" && (
        <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="tier-card" style={{ background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t("settings.planLite")}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{t("settings.liteTagline")}</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$0<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>{t("common.perMonth")}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {t("plans.liteFeatures", { returnObjects: true }).map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-green)" /> {f}</div>)}
              {t("plans.liteRestricted", { returnObjects: true }).map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}><X size={14} /> {f}</div>)}
            </div>
            <button className="btn-secondary" style={{ width: "100%" }}>{t("settings.freePlan")}</button>
          </div>
          <div className="tier-card recommended">
            <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 20, background: "linear-gradient(135deg, #0EA5E9, #6366F1)", fontSize: 11, fontWeight: 600, color: "white" }}>{t("common.recommended")}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t("settings.planPro")}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{t("settings.proTagline")}</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$9.90<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>{t("common.perMonth")}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {t("plans.proFeatures", { returnObjects: true }).map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-teal)" /> {f}</div>)}
            </div>
            <button className="btn-primary" onClick={() => handleUpgrade('pro')} disabled={upgrading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CreditCard size={16} /> {t("settings.upgradePro")}</button>
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{t("settings.poweredByStripe")}</p>
          </div>
          <div className="tier-card" style={{ background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t("settings.planFamily")}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{t("settings.familyTagline")}</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$19.90<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>{t("common.perMonth")}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {t("plans.familyFeatures", { returnObjects: true }).map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-purple)" /> {f}</div>)}
            </div>
            <button className="btn-secondary" onClick={() => handleUpgrade('family')} disabled={upgrading} style={{ width: "100%" }}>{t("settings.chooseFamily")}</button>
          </div>
        </div>
      )}

      {/* ── CURRENCY SETTINGS TAB ── */}
      {activeTab === "currency" && (
        <div className="animate-in card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("settings.currencySettingsTitle")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{t("settings.currencyChooseDesc")}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <button
                key={code}
                onClick={() => setDisplayCurrency(code)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: displayCurrency === code ? "rgba(14,165,233,0.08)" : "var(--bg-secondary)",
                  border: displayCurrency === code ? "1px solid rgba(14,165,233,0.4)" : "1px solid var(--border)",
                  cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 26 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: displayCurrency === code ? "var(--accent-teal)" : "var(--text-primary)" }}>
                    {code} — {t(`currencies.${code}`)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {t("settings.symbolLabel")}: {c.symbol} &nbsp;·&nbsp;
                    {code !== 'SGD' ? `1 ${code} = S$${(FX_TO_SGD[code] ?? 1).toFixed(4)} ${fxLastUpdated ? t('settings.currencyLive') : t('settings.currencyFallback')}` : t('settings.baseCurrency')}
                  </div>
                </div>
                {displayCurrency === code && <CheckCircle size={18} color="var(--accent-teal)" />}
              </button>
            ))}
          </div>

          <div style={{ padding: "14px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 10 }}>
            <AlertTriangle size={15} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{fxLastUpdated ? t('settings.fxLiveDisclaimer', { date: new Date(fxLastUpdated).toLocaleString() }) : t('settings.fxFallbackDisclaimer')}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t("settings.exchangeRatesRef")}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(FX_TO_SGD).filter(([k]) => k !== 'SGD').map(([code, rate]) => (
                <div key={code} style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>1 {code}</span>
                  <span style={{ fontWeight: 600 }}>= S$ {rate.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "language" && (
        <div className="animate-in card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("settings.language")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>{t("settings.chooseLanguage")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => i18n.changeLanguage(l.code)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: "var(--radius-sm)", background: i18n.language === l.code ? "rgba(14,165,233,0.12)" : "var(--bg-secondary)", border: i18n.language === l.code ? "1px solid var(--accent-teal)" : "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{l.flag}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{l.label}</span>
                {i18n.language === l.code && <CheckCircle size={16} color="var(--accent-teal)" style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>{t("settings.languageRollingOut")}</p>
        </div>
      )}

      {/* ── APPEARANCE TAB ── */}
      {activeTab === "appearance" && (
        <div className="animate-in card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("settings.appearance")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{t("settings.appearanceDesc")}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { key: "dark",   icon: "🌙", label: t("settings.themeDark"),   preview: ["#0B1120","#1A2332","#F1F5F9"] },
              { key: "light",  icon: "☀️", label: t("settings.themeLight"),  preview: ["#F0F4F8","#FFFFFF","#0F172A"] },
              { key: "system", icon: "💻", label: t("settings.themeSystem"), preview: ["#6366F1","#0EA5E9","#10B981"] },
            ].map(opt => {
              const active = theme === opt.key;
              return (
                <button key={opt.key} onClick={() => setTheme(opt.key)} style={{
                  background: active ? "rgba(14,165,233,0.08)" : "var(--bg-secondary)",
                  border: `2px solid ${active ? "var(--accent-teal)" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)", padding: "20px 16px",
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  transition: "all 0.2s", position: "relative",
                }}>
                  {/* Mini preview window */}
                  <div style={{
                    width: "100%", height: 64, borderRadius: 8,
                    background: opt.preview[0], border: "1px solid rgba(0,0,0,0.1)",
                    overflow: "hidden", display: "flex",
                  }}>
                    <div style={{ width: 18, height: "100%", background: opt.preview[1], borderRight: "1px solid rgba(0,0,0,0.08)" }} />
                    <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ height: 6, width: "60%", borderRadius: 3, background: opt.preview[2], opacity: 0.7 }} />
                      <div style={{ height: 4, width: "80%", borderRadius: 3, background: opt.preview[2], opacity: 0.3 }} />
                      <div style={{ height: 4, width: "50%", borderRadius: 3, background: opt.preview[2], opacity: 0.3 }} />
                      <div style={{ marginTop: 4, height: 16, borderRadius: 4, background: "#0EA5E9", opacity: 0.6 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--accent-teal)" : "var(--text-primary)" }}>{opt.label}</div>
                  </div>
                  {active && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: "var(--accent-teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>ℹ️</span>
            <span>{t("settings.appearanceNote")}</span>
          </div>
        </div>
      )}

    </div>
  );
};

/* ─────────── MAIN APP ─────────── */
const App = () => {
  const { t } = useTranslation();
  const [appState, setAppState] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughPending, setWalkthroughPending] = useState(false);

  // ── Theme: 'dark' | 'light' | 'system' — default dark, persisted ──
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ww_theme') || 'dark'; } catch { return 'dark'; }
  });

  // Resolve effective theme (system follows OS preference)
  const effectiveTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;

  // Apply to <html> so CSS [data-theme] selector works
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  // Listen for OS theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => document.documentElement.setAttribute('data-theme',
      mq.matches ? 'light' : 'dark');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    try { localStorage.setItem('ww_theme', newTheme); } catch {}
  };
  const [showProfiler, setShowProfiler] = useState(false);
  const [profilerIsRetake, setProfilerIsRetake] = useState(false);
  const [userRiskProfile, setUserRiskProfile] = useState(null);

  // ── Currency state ──
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    try { return localStorage.getItem('ww_displayCurrency') || 'SGD'; } catch { return 'SGD'; }
  });
  const [assetCurrencies, setAssetCurrencies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ww_assetCurrencies') || '{}'); } catch { return {}; }
  });

  // Persist display currency
  const handleSetDisplayCurrency = (code) => {
    setDisplayCurrency(code);
    try { localStorage.setItem('ww_displayCurrency', code); } catch {}
  };

  // Update per-asset currency and persist
  const updateAssetCurrency = useCallback((assetId, currency) => {
    setAssetCurrencies(prev => {
      const next = { ...prev, [assetId]: currency };
      try { localStorage.setItem('ww_assetCurrencies', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const [fxLastUpdated, setFxLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      // Fetch FX rates first so all displayed values use live rates from the start
      await refreshFxRates();
      setFxLastUpdated(fxRatesLastUpdated);
      const lang = (() => { try { return i18n.language || 'en'; } catch { return 'en'; } })();
      const [p, w, i] = await Promise.all([api.getPortfolio(), api.getWellness(), api.getInsights(lang)]);
      setPortfolio(p); setWellness(w); setInsights(i.insights);
      try { const g = await api.getGoals(); setGoals(g.goals || []); } catch {}
    } catch (err) { console.error("Failed to load data:", err); }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      const lang = (() => { try { return i18n.language || 'en'; } catch { return 'en'; } })();
      const [p, w, i] = await Promise.all([api.getPortfolio(), api.getWellness(), api.getInsights(lang)]);
      setPortfolio(p); setWellness(w); setInsights(i.insights);
      // Refresh goals too — adding/removing assets can affect goal progress calculations
      try { const g = await api.getGoals(); setGoals(g.goals || []); } catch {}
    } catch (err) { console.error(err); }
  }, []);

  const handleLogin = (userData, shouldPromptRating, hasCompletedProfile) => {
    setUser(userData);
    setAppState("onboarding");
    // Store whether this user has already completed profiling (cleared on server restart = first-time UX)
    sessionStorage.setItem('ww_hasCompletedProfile', hasCompletedProfile ? '1' : '');
    if (shouldPromptRating) { setTimeout(() => setShowRating(true), 3000); }
  };
  const handleOnboardingComplete = () => {
    setAppState("app");
    loadData();
    // Show profiler on first login after server start (hasCompletedProfile is false)
    const completed = sessionStorage.getItem('ww_hasCompletedProfile');
    if (!completed) {
      setTimeout(() => { setProfilerIsRetake(false); setShowProfiler(true); }, 1500);
    } else {
      // Load existing profile for display
      api.getRiskProfile().then(p => setUserRiskProfile(p)).catch(() => {});
    }
  };
  // ── Walkthrough trigger: fires when profiler + rating are both gone ──
  useEffect(() => {
    if (!walkthroughPending) return;
    if (showRating || showProfiler) return; // wait for both to close
    const timer = setTimeout(() => {
      setWalkthroughPending(false);
      setShowWalkthrough(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [walkthroughPending, showRating, showProfiler]);

  // Refresh FX rates every hour while logged in
  useEffect(() => {
    if (appState !== 'app') return;
    const interval = setInterval(async () => {
      await refreshFxRates();
      setFxLastUpdated(fxRatesLastUpdated);
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [appState]);

  const handleProfilerComplete = (result) => {
    setUserRiskProfile(result);
    sessionStorage.setItem('ww_hasCompletedProfile', '1');
    setShowProfiler(false);
    // Reload wellness data so the new profile weights are reflected immediately
    loadData();
    // Queue walkthrough for first-time users (fires after rating also closes)
    if (!sessionStorage.getItem('ww_tour_done')) {
      setWalkthroughPending(true);
    }
  };

  const handleRetakeAssessment = () => {
    setProfilerIsRetake(true);
    setShowProfiler(true);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch (e) {}
    api.token = null; setUser(null); setPortfolio(null); setWellness(null); setInsights(null);
    setUserRiskProfile(null);
    sessionStorage.removeItem('ww_hasCompletedProfile');
    setAppState("login"); setCurrentView("login");
  };

  const navItems = [
    { key: "dashboard", label: t("nav.dashboard"), icon: <BarChart3 size={19} /> },
    { key: "wallet",    label: t("nav.wallet"),    icon: <Wallet size={19} /> },
    { key: "analytics", label: t("nav.analytics"), icon: <Activity size={19} /> },
    { key: "insights",  label: t("nav.insights"),  icon: <Brain size={19} /> },
    { key: "goals",     label: t("nav.goals"),     icon: <Target size={19} /> },
    { key: "scenarios", label: t("nav.scenarios"), icon: <Activity size={19} /> },
    { key: "export",    label: t("nav.export"),    icon: <Download size={19} /> },
    { key: "settings",  label: t("nav.settings"),  icon: <Settings size={19} /> },
  ];

  if (appState === "login") return (<><link href={FONTS_LINK} rel="stylesheet" /><style>{CSS}</style><style>{CSS_LIGHT}</style><LoginPage onLogin={handleLogin} /></>);
  if (appState === "onboarding") return (<><link href={FONTS_LINK} rel="stylesheet" /><style>{CSS}</style><style>{CSS_LIGHT}</style><OnboardingPage onComplete={handleOnboardingComplete} /></>);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":  return <DashboardView portfolio={portfolio} wellness={wellness} insights={insights} onNavigate={setCurrentView} user={user} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} />;
      case "wallet":     return <WalletView portfolio={portfolio} refreshPortfolio={refreshPortfolio} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} updateAssetCurrency={updateAssetCurrency} />;
      case "analytics":  return <AnalyticsView portfolio={portfolio} wellness={wellness} displayCurrency={displayCurrency} userRiskProfile={userRiskProfile} onRetakeAssessment={handleRetakeAssessment} />;
      case "insights":   return <InsightsView insights={insights} displayCurrency={displayCurrency} />;
      case "goals":      return <GoalsView displayCurrency={displayCurrency} />;
      case "scenarios":  return <ScenarioView displayCurrency={displayCurrency} />;
      case "export":     return <ExportView displayCurrency={displayCurrency} />;
      case "settings":   return <SettingsView user={user} setUser={setUser} displayCurrency={displayCurrency} setDisplayCurrency={handleSetDisplayCurrency} fxLastUpdated={fxLastUpdated} userRiskProfile={userRiskProfile} onRetakeAssessment={handleRetakeAssessment} theme={theme} setTheme={handleSetTheme} />;
      default:           return <DashboardView portfolio={portfolio} wellness={wellness} insights={insights} onNavigate={setCurrentView} user={user} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} />;
    }
  };

  return (
    <>
      <link href={FONTS_LINK} rel="stylesheet" />
      <style>{CSS}</style>
      <style>{CSS_LIGHT}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>
        {/* Sidebar */}
        <aside style={{ width: sidebarCollapsed ? 72 : 240, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", transition: "width 0.25s ease", flexShrink: 0 }}>
          <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #0EA5E9, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Wallet size={20} color="white" strokeWidth={1.8} /></div>
            {!sidebarCollapsed && <span className="font-display" style={{ fontSize: 18, fontWeight: 600, whiteSpace: "nowrap" }}>WealthWell</span>}
          </div>
          <nav data-tour="sidebar-nav" style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(item => (
              <button key={item.key} className={`sidebar-item ${currentView === item.key ? "active" : ""}`} onClick={() => setCurrentView(item.key)} style={sidebarCollapsed ? { justifyContent: "center", padding: "12px" } : {}}>
                {item.icon}{!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: sidebarCollapsed ? "16px 8px" : "16px 12px", borderTop: "1px solid var(--border)" }}>
            {!sidebarCollapsed ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setCurrentView("settings")}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #6366F1, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "white" }}>{user?.name?.charAt(0) || "U"}</div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Crown size={10} color="var(--accent-gold)" /> {user?.plan === "pro" ? t("nav.proPlan") : t("nav.litePlan")}</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}><LogOut size={16} /></button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "white" }}>{user?.name?.charAt(0) || "U"}</div>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <header style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}><Menu size={20} /></button>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{navItems.find(n => n.key === currentView)?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* ── Currency Selector ── */}
              <div data-tour="currency"><CurrencySelector displayCurrency={displayCurrency} setDisplayCurrency={handleSetDisplayCurrency} fxLastUpdated={fxLastUpdated} /></div>
              <div data-tour="notifications" style={{ position: "relative" }}>
                {(() => {
                  const notifCount = portfolio && wellness ? buildNotifications(portfolio, wellness, goals, t).filter(n => {
                    try {
                      const d = JSON.parse(sessionStorage.getItem('ww_notif_dismissed') || '{}');
                      return !(n.id in d && d[n.id] === n.fingerprint);
                    } catch { return true; }
                  }).length : 0;
                  return (
                    <>
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                          background: showNotifications ? 'rgba(14,165,233,0.1)' : 'none',
                          border: showNotifications ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent',
                          borderRadius: 8, cursor: "pointer",
                          color: showNotifications ? "var(--accent-teal)" : "var(--text-muted)",
                          display: "flex", padding: 6, transition: "all 0.15s",
                        }}
                        title={t('notif.panelTitle')}
                      >
                        <Bell size={18} />
                      </button>
                      {notifCount > 0 && (
                        <div style={{
                          position: "absolute", top: 2, right: 2,
                          minWidth: 16, height: 16, borderRadius: 8,
                          background: "var(--accent-red)", color: "white",
                          fontSize: 9, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "0 3px", pointerEvents: "none",
                          border: "2px solid var(--bg-secondary)",
                        }}>
                          {notifCount > 9 ? "9+" : notifCount}
                        </div>
                      )}
                      {showNotifications && (
                        <NotificationPanel
                          portfolio={portfolio}
                          wellness={wellness}
                          goals={goals}
                          onNavigate={setCurrentView}
                          onClose={() => setShowNotifications(false)}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
              <button data-tour="feedback" onClick={() => setShowFeedback(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 6 }} title={t("feedback.sendFeedbackTooltip")}><MessageSquare size={18} /></button>
              <button
                data-tour="help-btn"
                onClick={() => {
                  try { sessionStorage.removeItem('ww_tour_done'); } catch {}
                  setCurrentView('dashboard');
                  setTimeout(() => setShowWalkthrough(true), 100);
                }}
                style={{
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: 8, cursor: "pointer",
                  color: "var(--text-muted)", display: "flex",
                  alignItems: "center", gap: 5, padding: "5px 10px",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  transition: "all 0.15s",
                }}
                title={t('tour.helpButtonTitle')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-teal)'; e.currentTarget.style.color = 'var(--accent-teal)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <HelpCircle size={14} />
                {t('tour.helpButtonLabel')}
              </button>
            </div>
          </header>

          <div className="scrollbar-thin" style={{ flex: 1, overflow: "auto", padding: 28 }}>
            <div key={currentView} style={{ maxWidth: 1000 }}>
              {portfolio ? renderView() : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                  <div style={{ textAlign: "center" }}>
                    <RefreshCw size={32} color="var(--accent-teal)" className="loading-spinner" style={{ marginBottom: 16 }} />
                    <p style={{ color: "var(--text-muted)" }}>Loading your financial data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showRating && <RatingPopup onClose={() => setShowRating(false)} />}
      {showProfiler && <RiskProfilerModal onComplete={handleProfilerComplete} onSkip={() => setShowProfiler(false)} isRetake={profilerIsRetake} />}
      {showWalkthrough && (
        <WalkthroughOverlay
          onComplete={() => setShowWalkthrough(false)}
          onNavigate={setCurrentView}
          currentView={currentView}
        />
      )}
    </>
  );
};

export default App;
