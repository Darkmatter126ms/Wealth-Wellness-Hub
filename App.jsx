import { useState, useEffect, useCallback, useRef } from "react";
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
  getInsights() { return this.request('GET', '/insights'); },
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
  sendReport(email) { return this.request('POST', '/email-preferences/send-now', { email }); },
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

/* ─────────── INTERNATIONALIZATION ─────────── */
const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'zh', label: '简体中文',    flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
];
const TRANSLATIONS = {
  en: { dashboard: 'Dashboard', wallet: 'Wealth Wallet', analytics: 'Analytics', insights: 'AI Insights', goals: 'Goals', scenarios: 'Scenarios', export: 'Export', settings: 'Settings', totalNetWorth: 'Total Net Worth', liquidAssets: 'Liquid Assets', wellnessScore: 'Wellness Score', wealthTrend: 'Wealth Trend', assetAllocation: 'Asset Allocation', viewDetails: 'View details', addAsset: 'Add Asset', setGoal: 'Set Goal', runScenario: 'Run Scenario', exportReport: 'Export Report', search: 'Search assets...', signIn: 'Sign In', signOut: 'Log Out', welcomeBack: 'Welcome back', feedback: 'Feedback', submit: 'Submit', cancel: 'Cancel', save: 'Save Changes', language: 'Language', account: 'Account', security: 'Security', subscription: 'Subscription', goodMorning: 'Good morning,', goodAfternoon: 'Good afternoon,', goodEvening: 'Good evening,', monthlyChange: 'Monthly Change', assetsTracked: 'Assets Tracked', rateExperience: 'Rate your experience', howAreWeDoingQ: 'How are we doing?', thankYou: 'Thank you!', sendFeedback: 'Send Feedback', behavioralResilience: 'Behavioral Resilience', currency: 'Currency' },
  zh: { dashboard: '仪表板', wallet: '财富钱包', analytics: '分析', insights: 'AI 洞察', goals: '目标', scenarios: '情景模拟', export: '导出', settings: '设置', totalNetWorth: '总净资产', liquidAssets: '流动资产', wellnessScore: '健康评分', wealthTrend: '财富趋势', assetAllocation: '资产配置', viewDetails: '查看详情', addAsset: '添加资产', setGoal: '设定目标', runScenario: '运行情景', exportReport: '导出报告', search: '搜索资产...', signIn: '登录', signOut: '退出', welcomeBack: '欢迎回来', feedback: '反馈', submit: '提交', cancel: '取消', save: '保存更改', language: '语言', account: '账户', security: '安全', subscription: '订阅', goodMorning: '早上好，', goodAfternoon: '下午好，', goodEvening: '晚上好，', monthlyChange: '月度变化', assetsTracked: '跟踪资产', rateExperience: '评价体验', howAreWeDoingQ: '您的体验如何？', thankYou: '谢谢！', sendFeedback: '发送反馈', behavioralResilience: '行为韧性', currency: '货币' },
  hi: { dashboard: 'डैशबोर्ड', wallet: 'वेल्थ वॉलेट', analytics: 'विश्लेषण', insights: 'AI अंतर्दृष्टि', goals: 'लक्ष्य', scenarios: 'परिदृश्य', export: 'निर्यात', settings: 'सेटिंग्स', totalNetWorth: 'कुल निवल मूल्य', liquidAssets: 'तरल संपत्ति', wellnessScore: 'स्वास्थ्य स्कोर', wealthTrend: 'धन प्रवृत्ति', assetAllocation: 'संपत्ति आवंटन', viewDetails: 'विवरण देखें', addAsset: 'संपत्ति जोड़ें', setGoal: 'लक्ष्य निर्धारित करें', runScenario: 'परिदृश्य चलाएं', exportReport: 'रिपोर्ट निर्यात', search: 'संपत्ति खोजें...', signIn: 'साइन इन', signOut: 'लॉग आउट', welcomeBack: 'वापसी पर स्वागत है', feedback: 'प्रतिक्रिया', submit: 'जमा करें', cancel: 'रद्द करें', save: 'परिवर्तन सहेजें', language: 'भाषा', account: 'खाता', security: 'सुरक्षा', subscription: 'सदस्यता', goodMorning: 'सुप्रभात,', goodAfternoon: 'नमस्कार,', goodEvening: 'शुभ संध्या,', monthlyChange: 'मासिक परिवर्तन', assetsTracked: 'ट्रैक की गई संपत्ति', rateExperience: 'अनुभव रेट करें', howAreWeDoingQ: 'हम कैसा कर रहे हैं?', thankYou: 'धन्यवाद!', sendFeedback: 'प्रतिक्रिया भेजें', behavioralResilience: 'व्यवहारिक लचीलापन', currency: 'मुद्रा' },
  es: { dashboard: 'Panel', wallet: 'Billetera', analytics: 'Análisis', insights: 'IA Perspectivas', goals: 'Metas', scenarios: 'Escenarios', export: 'Exportar', settings: 'Configuración', totalNetWorth: 'Patrimonio Neto Total', liquidAssets: 'Activos Líquidos', wellnessScore: 'Puntuación de Salud', wealthTrend: 'Tendencia de Riqueza', assetAllocation: 'Asignación de Activos', viewDetails: 'Ver detalles', addAsset: 'Agregar Activo', setGoal: 'Establecer Meta', runScenario: 'Ejecutar Escenario', exportReport: 'Exportar Informe', search: 'Buscar activos...', signIn: 'Iniciar Sesión', signOut: 'Cerrar Sesión', welcomeBack: 'Bienvenido de nuevo', feedback: 'Comentarios', submit: 'Enviar', cancel: 'Cancelar', save: 'Guardar Cambios', language: 'Idioma', account: 'Cuenta', security: 'Seguridad', subscription: 'Suscripción', goodMorning: 'Buenos días,', goodAfternoon: 'Buenas tardes,', goodEvening: 'Buenas noches,', monthlyChange: 'Cambio Mensual', assetsTracked: 'Activos Rastreados', rateExperience: 'Califica tu experiencia', howAreWeDoingQ: '¿Cómo lo estamos haciendo?', thankYou: '¡Gracias!', sendFeedback: 'Enviar Comentarios', behavioralResilience: 'Resiliencia Conductual', currency: 'Moneda' },
  fr: { dashboard: 'Tableau de bord', wallet: 'Portefeuille', analytics: 'Analytique', insights: 'IA Perspectives', goals: 'Objectifs', scenarios: 'Scénarios', export: 'Exporter', settings: 'Paramètres', totalNetWorth: 'Patrimoine Net Total', liquidAssets: 'Actifs Liquides', wellnessScore: 'Score de Santé', wealthTrend: 'Tendance de Richesse', assetAllocation: "Allocation d'Actifs", viewDetails: 'Voir détails', addAsset: 'Ajouter un Actif', setGoal: 'Définir un Objectif', runScenario: 'Lancer un Scénario', exportReport: 'Exporter le Rapport', search: 'Rechercher des actifs...', signIn: 'Se Connecter', signOut: 'Se Déconnecter', welcomeBack: 'Content de vous revoir', feedback: 'Commentaires', submit: 'Soumettre', cancel: 'Annuler', save: 'Enregistrer', language: 'Langue', account: 'Compte', security: 'Sécurité', subscription: 'Abonnement', goodMorning: 'Bonjour,', goodAfternoon: 'Bon après-midi,', goodEvening: 'Bonsoir,', monthlyChange: 'Changement Mensuel', assetsTracked: 'Actifs Suivis', rateExperience: 'Évaluez votre expérience', howAreWeDoingQ: "Comment trouvez-vous l'app ?", thankYou: 'Merci !', sendFeedback: 'Envoyer des Commentaires', behavioralResilience: 'Résilience Comportementale', currency: 'Devise' },
};
const useLang = () => {
  const [lang, setLang] = useState(() => { try { return window.__wealthwell_lang || 'en'; } catch(e) { return 'en'; } });
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  const changeLang = (code) => { setLang(code); window.__wealthwell_lang = code; };
  return { lang, t, changeLang, languages: LANGUAGES };
};

/* ─────────── CURRENCY SELECTOR (header dropdown) ─────────── */
const CurrencySelector = ({ displayCurrency, setDisplayCurrency, fxLastUpdated }) => {
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
        title="Display currency"
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
            Display Currency
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
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{c.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {code !== 'SGD' ? `1 ${code} = S$${(FX_TO_SGD[code] ?? 1).toFixed(4)}` : 'Base'}
                </div>
              </div>
              {displayCurrency === code && <CheckCircle size={14} color="var(--accent-teal)" />}
            </button>
          ))}
          <div style={{ margin: '4px 10px 2px', paddingTop: 6, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: fxLastUpdated ? 'var(--accent-green)' : 'var(--accent-gold)', flexShrink: 0 }} />
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {fxLastUpdated ? `Live rates · ${new Date(fxLastUpdated).toLocaleTimeString()}` : 'Fallback rates · not yet refreshed'}
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
const FeedbackModal = ({ onClose, t }) => {
  const [category, setCategory] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try { await api.submitFeedback({ category, subject, message, urgency }); setSent(true); setTimeout(onClose, 2000); } catch(e) { console.error(e); }
    setSending(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div className="animate-in card" style={{ padding: 28, maxWidth: 480, width: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: "center", padding: 20 }}><CheckCircle size={40} color="var(--accent-green)" style={{ marginBottom: 12 }} /><h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{t("thankYou")}</h3><p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your feedback has been submitted.</p></div>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{t("sendFeedback")}</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{k:"suggestion",l:"Suggestion"},{k:"bug",l:"Bug Report"},{k:"feature",l:"Feature Request"},{k:"general",l:"General"}].map(c => (
                <button key={c.k} className="tab-btn" onClick={() => setCategory(c.k)} style={category === c.k ? { background: "var(--accent-teal)", color: "white" } : {}}>{c.l}</button>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Subject</label><input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary" /></div>
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Message *</label><textarea className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what you think..." rows={4} style={{ resize: "vertical", minHeight: 80, fontFamily: "inherit" }} /></div>
            <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Priority</label><div style={{ display: "flex", gap: 8 }}>{[{k:"low",l:"Low",c:"var(--accent-green)"},{k:"normal",l:"Normal",c:"var(--accent-gold)"},{k:"high",l:"High",c:"var(--accent-red)"}].map(u => (<button key={u.k} onClick={() => setUrgency(u.k)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: urgency === u.k ? "2px solid " + u.c : "1px solid var(--border)", background: urgency === u.k ? u.c + "18" : "transparent", color: urgency === u.k ? u.c : "var(--text-muted)", fontFamily: "inherit" }}>{u.l}</button>))}</div></div>
            <div style={{ display: "flex", gap: 10 }}><button className="btn-primary" onClick={handleSubmit} disabled={sending || !message.trim()}>{sending ? "Sending..." : t("submit")}</button><button className="btn-secondary" onClick={onClose}>{t("cancel")}</button></div>
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

const PROFILER_QUESTIONS = [
  {
    id: 'age',
    question: 'What is your age range?',
    subtitle: 'Your time horizon is one of the biggest factors in risk capacity.',
    icon: '🎂',
    options: [
      { label: 'Under 25',  score: 4 },
      { label: '25 – 34',   score: 3 },
      { label: '35 – 44',   score: 2 },
      { label: '45 – 54',   score: 1 },
      { label: '55 or over',score: 0 },
    ],
  },
  {
    id: 'income',
    question: 'What is your approximate annual household income?',
    subtitle: 'Higher income generally means a larger buffer to absorb investment losses.',
    icon: '💼',
    options: [
      { label: 'Below S$50,000',      score: 0 },
      { label: 'S$50,000 – S$100,000',score: 1 },
      { label: 'S$100,000 – S$200,000',score: 2 },
      { label: 'Above S$200,000',     score: 3 },
    ],
  },
  {
    id: 'horizon',
    question: 'When do you expect to need most of this money?',
    subtitle: 'Longer horizons allow you to ride out market cycles.',
    icon: '📅',
    options: [
      { label: 'Within 2 years',  score: 0 },
      { label: '2 – 5 years',     score: 1 },
      { label: '5 – 10 years',    score: 2 },
      { label: '10+ years',       score: 3 },
    ],
  },
  {
    id: 'reaction',
    question: 'Your portfolio drops 25% in a single month. What do you do?',
    subtitle: 'Your emotional reaction to losses reveals your true risk tolerance.',
    icon: '📉',
    options: [
      { label: 'Sell everything: I cannot stomach further losses', score: 0 },
      { label: 'Reduce exposure and move to safer assets',           score: 1 },
      { label: 'Hold steady and wait for recovery',                  score: 2 },
      { label: 'Buy more: I see it as a buying opportunity',        score: 3 },
    ],
  },
  {
    id: 'goal',
    question: 'What best describes your primary financial goal?',
    subtitle: 'Knowing your goal helps us align your wellness score to what matters most.',
    icon: '🎯',
    options: [
      { label: 'Protect what I have, capital preservation first', score: 0 },
      { label: 'Steady long-term growth with manageable risk',      score: 1 },
      { label: 'Maximise returns, I accept significant volatility',score: 2 },
    ],
  },
  {
    id: 'knowledge',
    question: 'How would you describe your investing experience?',
    subtitle: 'Experience tends to reduce panic during market swings.',
    icon: '📚',
    options: [
      { label: 'Beginner: I mainly use savings accounts or FDs',           score: 0 },
      { label: 'Intermediate: I invest in stocks, ETFs, or unit trusts',   score: 1 },
      { label: 'Advanced: I use options, leverage, or manage crypto actively', score: 2 },
    ],
  },
  {
    id: 'savings_rate',
    question: 'What percentage of your monthly income goes towards long-term investments?',
    subtitle: 'This excludes emergency fund savings.',
    icon: '💰',
    options: [
      { label: 'Less than 5%',    score: 0 },
      { label: '5% – 15%',        score: 1 },
      { label: '15% – 30%',       score: 2 },
      { label: 'More than 30%',   score: 3 },
    ],
  },
];

// Max possible score = 4+3+3+3+2+2+3 = 20
const scoreToProfile = (total) => total <= 6 ? 'conservative' : total <= 13 ? 'balanced' : 'growth';

const PROFILE_META = {
  conservative: { label: 'Conservative', subtitle: 'Capital Preserver',   color: '#10B981', emoji: '🛡️', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  balanced:     { label: 'Balanced',     subtitle: 'Steady Builder',      color: '#0EA5E9', emoji: '⚖️', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.25)' },
  growth:       { label: 'Growth',       subtitle: 'High-Growth Investor', color: '#8B5CF6', emoji: '🚀', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)' },
};

const PROFILE_DESCRIPTIONS = {
  conservative: 'You prioritise stability and capital preservation. Your wellness score gives extra weight to emergency buffers, liquidity, and risk management — rewarding portfolios that stay safe in turbulent markets.',
  balanced:     'You seek sustainable long-term growth with manageable risk. Your wellness score balances all dimensions equally, rewarding diversification, steady contributions, and tax optimisation.',
  growth:       'You embrace volatility to maximise long-term capital appreciation. Your wellness score puts the most weight on growth allocation, diversification, and behavioural discipline — the hallmarks of a high-conviction investor.',
};

/* ─────────── RISK PROFILER MODAL ─────────── */
const RiskProfilerModal = ({ onComplete, onSkip, isRetake = false }) => {
  const [step, setStep] = useState(0);           // 0..QUESTIONS-1 = questions, last = result
  const [answers, setAnswers] = useState({});    // { questionId: { label, score } }
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);    // { riskProfile, riskScore }

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
                  {isRetake ? 'Retake Assessment' : 'Risk Profile Setup'} · {step + 1}/{totalSteps}
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
                ← Back
              </button>
            )}
            {saving && <div style={{ textAlign:'center', marginTop:12, color:'var(--text-muted)', fontSize:13 }}>Saving your profile…</div>}
          </>
        ) : (
          /* Result step */
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{meta.emoji}</div>
            <div style={{ display:'inline-block', padding:'6px 18px', borderRadius:20, background:meta.bg, border:`1px solid ${meta.border}`, color:meta.color, fontWeight:700, fontSize:13, marginBottom:16 }}>
              {meta.label} · {meta.subtitle}
            </div>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:10 }}>Your Risk Profile: {meta.label}</h3>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:24, maxWidth:400, margin:'0 auto 24px' }}>
              {PROFILE_DESCRIPTIONS[result.riskProfile]}
            </p>
            <div style={{ background:'var(--bg-secondary)', borderRadius:10, padding:'14px 18px', marginBottom:24, textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:10 }}>Your Answers</div>
              {PROFILER_QUESTIONS.map(pq => (
                <div key={pq.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-muted)' }}>{pq.question.replace('?','')}</span>
                  <span style={{ fontWeight:500 }}>{result.answers[pq.id]?.label ?? '—'}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => onComplete(result)} style={{ padding:'12px 36px', fontSize:15 }}>
              View My Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const RatingPopup = ({ onClose }) => {
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
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Thank you!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your feedback helps us improve WealthWell.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 6, fontSize: 22 }}>⭐</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>How are we doing?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>Rate your WealthWell experience — takes 10 seconds</p>

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
                  Leave a comment <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us what you love or what we can improve…"
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
                  Submit rating
                </button>
              )}
              <button className="btn-ghost" onClick={handleDismiss} style={{ fontSize: 13, padding: "10px 16px" }}>
                Maybe later
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
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: -2 }}>Wellness Score</div>
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

const Loader = ({ text = "Loading..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12 }}>
    <RefreshCw size={24} color="var(--accent-teal)" className="loading-spinner" />
    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{text}</span>
  </div>
);

/* ─────────── LOGIN PAGE ─────────── */
const LoginPage = ({ onLogin }) => {
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
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Your financial wellness, unified.</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {step === "login" ? (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Welcome back</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>Sign in to your Wealth Wallet</p>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div>
              <div style={{ marginBottom: 24 }}><label style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <div className="error-msg"><AlertCircle size={14} /> {error}</div>}
              <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: error ? 12 : 0 }} onClick={handleLogin} disabled={loading}>{loading ? <RefreshCw size={18} className="loading-spinner" /> : <><Lock size={16} /> Sign In</>}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "var(--text-muted)" }}><div style={{ flex: 1, height: 1, background: "var(--border)" }} /><span style={{ fontSize: 12 }}>or</span><div style={{ flex: 1, height: 1, background: "var(--border)" }} /></div>
              <button className="btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}><Smartphone size={16} /> Sign in with SingPass</button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>Don't have an account? <span style={{ color: "var(--accent-teal)", cursor: "pointer", fontWeight: 500 }}>Get started free</span></p>
            </>
          ) : (
            <div className="animate-in">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", background: "rgba(14,165,233,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={28} color="var(--accent-teal)" /></div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Two-Factor Authentication</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Enter the 6-digit code from your authenticator app</p>
              </div>
              <div style={{ marginBottom: 24 }}><input className="input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} onKeyDown={e => e.key === "Enter" && handleVerify()} style={{ textAlign: "center", fontSize: 28, letterSpacing: 12, fontWeight: 600 }} /></div>
              {error && <div className="error-msg" style={{ marginBottom: 12 }}><AlertCircle size={14} /> {error}</div>}
              <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleVerify} disabled={loading || code.length < 6}>{loading ? <RefreshCw size={18} className="loading-spinner" /> : <><ShieldCheck size={16} /> Verify & Continue</>}</button>
              <button className="btn-ghost" style={{ width: "100%", marginTop: 12, fontSize: 13 }} onClick={() => { setStep("login"); setError(""); }}><ChevronLeft size={14} style={{ marginRight: 4 }} /> Back to login</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          {[{ icon: <Lock size={14} />, text: "Bank-grade encryption" }, { icon: <ShieldCheck size={14} />, text: "MAS regulated" }, { icon: <Eye size={14} />, text: "Read-only access" }].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>{t.icon} {t.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────── ONBOARDING ─────────── */
const OnboardingPage = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <Wallet size={32} color="var(--accent-teal)" />, title: "Welcome to WealthWell", desc: "We'll help you see your complete financial picture in one place. No more switching between apps." },
    { icon: <Shield size={32} color="var(--accent-green)" />, title: "Your Privacy, Our Priority", desc: "We use read-only connections. We can never move your money. All data is encrypted end-to-end with AES-256." },
    { icon: <Brain size={32} color="var(--accent-purple)" />, title: "AI-Powered Insights", desc: "Our AI coach analyzes your portfolio and gives you plain-English recommendations — no jargon, just clear next steps." },
    { icon: <Target size={32} color="var(--accent-gold)" />, title: "Connect Your Accounts", desc: "Link your bank accounts, brokerages, CPF, and crypto wallets. The more you connect, the better your wellness score." },
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
                  {acc.connected ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-green)", fontSize: 13, fontWeight: 500 }}><CheckCircle size={14} /> Connected</span> : <button className="btn-ghost" style={{ fontSize: 13, color: "var(--accent-teal)", fontWeight: 500, padding: "4px 12px" }}><Plus size={14} style={{ marginRight: 4 }} /> Connect</button>}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="btn-primary" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} style={{ display: "flex", alignItems: "center", gap: 8 }}>{step === steps.length - 1 ? "Launch Dashboard" : "Continue"} <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── DASHBOARD VIEW ─────────── */
const DashboardView = ({ portfolio, wellness, insights, onNavigate, user, displayCurrency, assetCurrencies }) => {
  if (!portfolio || !wellness) return <Loader text="Loading dashboard..." />;

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

  const displayHistory = portfolio.wealthHistory.map(h => ({
    ...h,
    value: convertCurrency(h.value, 'SGD', displayCurrency),
  }));

  const ChartTooltip = makeChartTooltip(displayCurrency);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 20 }}>
        <div className="card" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)", borderRadius: "0 0 0 100%" }} />
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>{(() => { const h = new Date().getHours(); return h >= 6 && h < 12 ? "Good morning," : h >= 12 && h < 18 ? "Good afternoon," : "Good evening,"; })()}</div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>{user?.name ? user.name.split(" ")[0] : "there"} <span style={{ fontSize: 20 }}>👋</span></h1>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Total Net Worth</div>
              <div className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>{formatFullCurrency(totalWealth, displayCurrency)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 13, color: "var(--accent-green)" }}>
                <ArrowUpRight size={14} /> +{portfolio.monthlyChange.percent}% this month
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Liquid Assets</div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>{formatFullCurrency(liquidAssets, displayCurrency)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>excl. property & vehicle</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <WealthScore score={wellness.overall} size={130} />
          <button className="btn-ghost" style={{ marginTop: 8, fontSize: 12, color: "var(--accent-teal)" }} onClick={() => onNavigate("analytics")}>View details →</button>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Wealth Trend</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 7 months</span>
              <span className="badge" style={{ background: "rgba(14,165,233,0.1)", color: "var(--accent-teal)", fontSize: 10 }}>{displayCurrency}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayHistory}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, displayCurrency)} domain={['dataMin - 20000', 'dataMax + 10000']} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#wg)" dot={{ fill: "#0EA5E9", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Asset Allocation</h3>
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
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>AI Insights</h3>
              <span className="badge" style={{ background: "rgba(14,165,233,0.12)", color: "var(--accent-teal)", fontSize: 11 }}><Sparkles size={11} /> {insights.length} new</span>
            </div>
            <button className="btn-ghost" style={{ fontSize: 13, color: "var(--accent-teal)" }} onClick={() => onNavigate("insights")}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.slice(0, 3).map(ins => (
              <div key={ins.id} className={`insight-card ${ins.type}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {ins.type === "warning" ? <AlertTriangle size={15} color="var(--accent-gold)" /> : ins.type === "opportunity" ? <Lightbulb size={15} color="var(--accent-teal)" /> : <CheckCircle size={15} color="var(--accent-green)" />}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{ins.title}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{convertInsightText(ins.summary, displayCurrency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-in-delay-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { icon: <Plus size={18} />, label: "Add Asset", color: "var(--accent-teal)", action: () => onNavigate("wallet") },
          { icon: <Target size={18} />, label: "Set Goal", color: "var(--accent-gold)", action: () => onNavigate("goals") },
          { icon: <Activity size={18} />, label: "Run Scenario", color: "var(--accent-purple)", action: () => onNavigate("scenarios") },
          { icon: <Download size={18} />, label: "Export Report", color: "var(--accent-green)", action: () => onNavigate("export") },
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
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Wealth Wallet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>All your assets in one secure view</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 14 }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Add Asset Form */}
      {showAdd && (
        <div className="animate-in card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add New Asset</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 120px auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Name *</label>
              <input className="input" placeholder="e.g. DBS Savings" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Type</label>
              <select className="input" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
                {["Cash", "Equities", "Fixed Income", "Crypto", "REITs", "Retirement", "Property", "Vehicle"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Institution</label>
              <input className="input" placeholder="e.g. DBS Bank" value={newAsset.institution} onChange={e => setNewAsset({...newAsset, institution: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Value *</label>
              <input className="input" type="number" placeholder="50000" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Currency</label>
              <select className="input" value={newAsset.currency} onChange={e => setNewAsset({...newAsset, currency: e.target.value})} style={{ padding: "12px 10px" }}>
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ padding: "12px 20px" }}>
              {saving ? <RefreshCw size={16} className="loading-spinner" /> : "Add"}
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
          { label: "Total Net Worth", value: formatFullCurrency(totalInDisplay, displayCurrency), icon: <Wallet size={18} />, color: "var(--accent-teal)" },
          { label: "Monthly Change", value: `+${formatFullCurrency(monthlyChangeInDisplay, displayCurrency)}`, icon: <TrendingUp size={18} />, color: "var(--accent-green)", sub: `+${portfolio.monthlyChange.percent}%` },
          { label: "Assets Tracked", value: portfolio.assets.length, icon: <PieChart size={18} />, color: "var(--accent-purple)", sub: `across ${new Set(portfolio.assets.map(a => a.institution)).size} institutions` },
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
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {types.map(t => <button key={t} className="tab-btn" onClick={() => setFilter(t)} style={filter === t ? { background: "var(--accent-teal)", color: "white" } : {}}>{t}</button>)}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Globe size={12} /> Click currency badge on each asset to change its denomination
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
                    {asset.institution} · {asset.type}
                    {asset.riskLevel && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: asset.riskScore >= 4 ? "rgba(239,68,68,0.15)" : asset.riskScore >= 3 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: asset.riskScore >= 4 ? "var(--accent-red)" : asset.riskScore >= 3 ? "var(--accent-gold)" : "var(--accent-green)", fontWeight: 600 }}>
                        {asset.riskLevel}
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
  if (!wellness || !portfolio) return <Loader />;
  const tips = {
    "Diversification": "Your portfolio spans multiple asset classes. Consider adding international bonds for better diversification.",
    "Liquidity": "Good liquid coverage. You could optimize by moving some excess cash to money market funds.",
    "Growth": "Strong equity exposure with good returns. Your S&P 500 ETF is your top performer.",
    "Risk Mgmt": "Consider adding more fixed-income assets to reduce overall portfolio volatility.",
    "Tax Efficiency": "You're under-utilizing SRS and CPF top-ups. Significant tax savings available.",
    "Emergency Fund": "Well-funded emergency buffer. Consider if some excess cash could work harder elsewhere.",
    "Behavioral Resilience": "Measures how consistently you manage your portfolio without impulsive decisions. Steady contributions and avoiding panic-selling improve this score.",
  };
  const radarData = wellness.metrics.map(m => ({ subject: m.metric, A: m.score, fullMark: 100 }));
  const profileKey = userRiskProfile?.riskProfile ?? wellness.riskProfile ?? 'balanced';
  const meta = PROFILE_META[profileKey] || PROFILE_META.balanced;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Financial Wellness Analytics</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>Deep dive into your financial health metrics</p>
        </div>
      </div>

      {/* Risk Profile Banner */}
      <div className="animate-in card" style={{ padding:"20px 24px", background:meta.bg, border:`1px solid ${meta.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:32 }}>{meta.emoji}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:16, fontWeight:700, color:meta.color }}>{meta.label}</span>
              <span style={{ fontSize:12, color:meta.color, opacity:0.8 }}>· {meta.subtitle}</span>
            </div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", maxWidth:460 }}>{PROFILE_DESCRIPTIONS[profileKey]}</p>
          </div>
        </div>
        <button onClick={onRetakeAssessment} className="btn-ghost" style={{ fontSize:13, whiteSpace:"nowrap", borderColor:meta.color, color:meta.color }}>
          Retake Assessment
        </button>
      </div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <WealthScore score={wellness.overall} size={180} />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: wellness.overall >= 75 ? "var(--accent-green)" : "var(--accent-gold)" }}>{wellness.overall >= 75 ? "Excellent" : wellness.overall >= 50 ? "Good – Room to Improve" : "Needs Attention"}</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, maxWidth: 240 }}>Focus on tax efficiency and risk management to improve your score.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Wellness Breakdown</h3>
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
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Detailed Metrics</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {wellness.metrics.map((m, i) => {
            const color = m.score >= 75 ? "var(--accent-green)" : m.score >= 50 ? "var(--accent-gold)" : "var(--accent-red)";
            const status = m.score >= 75 ? "Excellent" : m.score >= 50 ? "Fair" : "Needs Work";
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{m.metric}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge" style={{ background: `${color}18`, color, fontSize: 11 }}>{status}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{m.score}/100</span>
                  </div>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", marginBottom: 6 }}>
                  <div style={{ width: `${m.score}%`, height: "100%", borderRadius: 3, background: color, transition: "width 1s ease" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{tips[m.metric] || ""}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────── AI INSIGHTS VIEW ─────────── */
const WELCOME_MSG = (currency) => ({
  role: "assistant",
  text: `Hi! I'm your AI financial coach. I've analyzed your portfolio and have some observations. I'll report all figures in ${currency}. What would you like to know?`
});

const InsightsView = ({ insights, displayCurrency }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([WELCOME_MSG(displayCurrency)]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // When the display currency changes, reset the chat UI to match the server-side history reset
  const prevCurrencyRef = useRef(displayCurrency);
  useEffect(() => {
    if (prevCurrencyRef.current !== displayCurrency) {
      prevCurrencyRef.current = displayCurrency;
      setChatMessages([WELCOME_MSG(displayCurrency)]);
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
    catch (err) { setChatMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't process that. Please try again." }]); }
    setChatLoading(false);
  };
  const cur = CURRENCIES[displayCurrency] ?? CURRENCIES.SGD;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>AI Insights & Coach</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>Personalized recommendations powered by AI analysis</p>
        </div>
        <button className="btn-primary" onClick={() => setAiChatOpen(!aiChatOpen)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "10px 20px" }}>
          <MessageSquare size={16} /> {aiChatOpen ? "Close Chat" : "Chat with Coach"}
        </button>
      </div>

      {aiChatOpen && (
        <div className="animate-in card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(14,165,233,0.12))", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <Brain size={18} color="var(--accent-purple)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>AI Financial Coach</span>
            <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-green)", fontSize: 10, marginLeft: "auto" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} /> Online
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
            <input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about your finances..." style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && sendChat()} />
            <button className="btn-primary" onClick={sendChat} style={{ padding: "10px 18px" }}><ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      <div className="animate-in" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Am I saving enough?", "How to reduce tax?", "Is my portfolio too risky?", "Should I invest more in ETFs?"].map((q, i) => (
          <button key={i} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => { setAiChatOpen(true); setChatInput(q); }}>{q}</button>
        ))}
      </div>

      {/* Currency context banner */}
      {displayCurrency !== 'SGD' && (
        <div style={{ padding: "10px 16px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <Globe size={14} color="var(--accent-teal)" />
          Monetary figures below have been converted from SGD to <strong style={{ color: "var(--text-primary)" }}>{displayCurrency} ({cur.symbol})</strong> at {fxRatesLastUpdated ? "live" : "indicative"} rates (1 {displayCurrency} = S${(FX_TO_SGD[displayCurrency] ?? 1).toFixed(4)}).
        </div>
      )}

      {insights && (
        <div className="animate-in-delay-1" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>Portfolio Analysis</h3>
          {insights.map(ins => (
            <div key={ins.id} className={`insight-card ${ins.type}`} onClick={() => setExpandedId(expandedId === ins.id ? null : ins.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {ins.type === "warning" ? <AlertTriangle size={15} color="var(--accent-gold)" /> : ins.type === "opportunity" ? <Lightbulb size={15} color="var(--accent-teal)" /> : <CheckCircle size={15} color="var(--accent-green)" />}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{ins.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge" style={{ background: "rgba(148,163,184,0.1)", color: "var(--text-muted)", fontSize: 10 }}>{ins.category}</span>
                  {expandedId === ins.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {convertInsightText(ins.summary, displayCurrency)}
              </p>
              {expandedId === ins.id && (
                <div className="animate-in" style={{ marginTop: 12, padding: "12px 16px", background: "rgba(14,165,233,0.06)", borderRadius: "var(--radius-xs)", border: "1px solid rgba(14,165,233,0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Zap size={13} color="var(--accent-teal)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: 0.5 }}>Suggested Action</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
                    {convertInsightText(ins.action, displayCurrency)}
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
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState({ equity: 0, crypto: 0, property: 0, cash: 0 });
  const [result, setResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const presets = [
    { name: "Market Crash (-30%)", eq: -0.3, cr: -0.5, pr: -0.1, ca: 0 },
    { name: "Rate Hike (+2%)", eq: -0.1, cr: -0.15, pr: -0.05, ca: 0.02 },
    { name: "Bull Market (+20%)", eq: 0.2, cr: 0.4, pr: 0.05, ca: 0.01 },
    { name: "Recession", eq: -0.2, cr: -0.35, pr: -0.08, ca: 0 },
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
        <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Scenario Simulator</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>Test how market events could affect your wealth</p>
      </div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {presets.map((s, i) => (
          <button key={i} onClick={() => setSelected(selected === i ? null : i)} className="card" style={{ padding: 16, cursor: "pointer", textAlign: "center", borderColor: selected === i ? "var(--accent-teal)" : "var(--border)", background: selected === i ? "rgba(14,165,233,0.06)" : "var(--bg-card)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{s.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Equity: {s.eq > 0 ? "+" : ""}{(s.eq * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>
      <div className="animate-in-delay-1 card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Custom Scenario</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[{ label: "Equities", key: "equity" }, { label: "Crypto", key: "crypto" }, { label: "Property", key: "property" }, { label: "Cash/Bonds", key: "cash" }].map(s => (
            <div key={s.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
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
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Impact Summary</h3>
              <span className="badge" style={{ background: "rgba(148,163,184,0.08)", color: "var(--text-muted)", fontSize: 10 }}>{displayCurrency}</span>
            </div>
            {simulating ? <Loader text="Simulating..." /> : (
              <>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Projected Net Worth</div>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>{formatFullCurrency(displayTotal, displayCurrency)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, color: displayChange >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {displayChange >= 0 ? "+" : ""}{formatFullCurrency(displayChange, displayCurrency)} ({result.changePercent.toFixed(1)}%)
                </div>
              </>
            )}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Asset Impact Breakdown</h3>
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
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChangePassword = async () => {
    setMsg(""); setErr("");
    if (!curPw || !newPw) { setErr("Please fill in both password fields."); return; }
    if (newPw !== confirmPw) { setErr("New passwords do not match."); return; }
    if (newPw.length < 8) { setErr("New password must be at least 8 characters."); return; }
    setSaving(true);
    try {
      await api.updateProfile({ currentPassword: curPw, newPassword: newPw });
      setMsg("Password updated successfully.");
      setCurPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) { setErr(e.message || "Failed to update password."); }
    setSaving(false);
  };

  const securityItems = [
    { icon: <ShieldCheck size={20} color="var(--accent-green)" />, title: "Two-Factor Authentication", sub: "Enabled (Microsoft Authenticator)", btn: "Configure" },
    { icon: <Eye size={20} color="var(--accent-purple)" />, title: "Data Access", sub: "Read-only connections · AES-256 encryption", btn: "View Audit Log" },
    { icon: <Smartphone size={20} color="var(--accent-gold)" />, title: "Active Sessions", sub: "2 devices active", btn: "Manage" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Security items */}
      <div className="animate-in card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Security Settings</h3>
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
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Change Password</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn:"1 / -1" }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Current Password</label>
            <input className="input" type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Enter current password" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>New Password</label>
            <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Confirm New Password</label>
            <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleChangePassword} disabled={saving} style={{ padding: "10px 24px", fontSize: 14 }}>
            {saving ? "Updating..." : "Update Password"}
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
      setMsg("Profile updated"); if (setUser) setUser(updated);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };
  const profileKey = userRiskProfile?.riskProfile ?? 'balanced';
  const meta = PROFILE_META[profileKey] || PROFILE_META.balanced;
  const answers = userRiskProfile?.answers ?? null;
  // Map questionId to question text for display
  const qMap = Object.fromEntries(PROFILER_QUESTIONS.map(q => [q.id, q.question]));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Basic info */}
      <div className="animate-in card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Account Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", fontSize: 14 }}>{saving ? "Saving..." : "Save Changes"}</button>
          {msg && <span style={{ fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {msg}</span>}
          {err && <span style={{ fontSize: 13, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={14} /> {err}</span>}
        </div>
      </div>

      {/* Risk profile section */}
      <div className="animate-in card" style={{ padding: 24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:600, marginBottom:2 }}>Risk Profile</h3>
            <p style={{ fontSize:13, color:"var(--text-muted)" }}>Your profile shapes how your Wellness Score is calculated and weighted.</p>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:20, background:meta.bg, border:`1px solid ${meta.border}` }}>
            <span style={{ fontSize:18 }}>{meta.emoji}</span>
            <span style={{ fontSize:14, fontWeight:700, color:meta.color }}>{meta.label}</span>
          </div>
        </div>

        {answers ? (
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
            {PROFILER_QUESTIONS.map(q => {
              const ans = (Array.isArray(answers) ? answers.find(a => a.questionId === q.id) : answers[q.id]);
              const label = ans?.label ?? '—';
              return (
                <div key={q.id} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"8px 12px", borderRadius:8, background:"var(--bg-secondary)" }}>
                  <span style={{ color:"var(--text-muted)" }}>{q.icon} {q.question.replace('?','')}</span>
                  <span style={{ fontWeight:500 }}>{label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:"16px", borderRadius:8, background:"var(--bg-secondary)", marginBottom:20, fontSize:13, color:"var(--text-muted)", textAlign:"center" }}>
            No profile on record — complete the assessment to personalise your Wellness Score.
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="btn-secondary" onClick={onRetakeAssessment} style={{ fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
            <RefreshCw size={14} /> Retake Assessment
          </button>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>Your Wellness Score will be recalculated with new weights.</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────── GOALS VIEW ─────────── */
const GoalsView = ({ displayCurrency }) => {
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
  if (loading) return <Loader text="Loading goals..." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Financial Goals</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>Track progress towards your financial milestones</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 14 }}><Plus size={16} /> New Goal</button>
      </div>
      {showAdd && (
        <div className="animate-in card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Create New Goal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Goal Title *</label><input className="input" placeholder="e.g. Emergency Fund" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Target Amount (SGD) *</label><input className="input" type="number" placeholder="50000" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Category</label><select className="input" value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})}><option value="safety">Safety Net</option><option value="tax">Tax Optimization</option><option value="growth">Growth</option><option value="general">General</option></select></div>
            <div><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Target Date</label><input className="input" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Description</label><input className="input" placeholder="What is this goal about?" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}><button className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Create Goal"}</button><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button></div>
        </div>
      )}
      {goals.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}><Target size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} /><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No goals yet</h3><p style={{ color: "var(--text-muted)", fontSize: 14 }}>Set your first financial goal to start tracking</p></div>
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
                    <div><div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{g.title}</div>{g.description && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{g.description}</div>}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {g.isComplete && <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-green)", fontSize: 11 }}><CheckCircle size={11} /> Complete</span>}
                    {g.daysLeft > 0 && !g.isComplete && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{g.daysLeft}d left</span>}
                    <button onClick={() => handleDelete(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{formatFullCurrency(currentInDisplay, displayCurrency)} of {formatFullCurrency(targetInDisplay, displayCurrency)}</span>
                  <span style={{ fontWeight: 600, color }}>{g.progress}%</span>
                </div>
                <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(148,163,184,0.1)" }}><div style={{ width: g.progress + "%", height: "100%", borderRadius: 4, background: g.isComplete ? "var(--accent-green)" : color, transition: "width 0.8s ease" }} /></div>
                {g.remaining > 0 && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{formatFullCurrency(remainingInDisplay, displayCurrency)} remaining</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────── EXPORT VIEW ─────────── */
const ExportView = () => {
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
    try { const data = await api.sendReport(customEmail); setSentMsg(data.message); const updated = await api.getEmailPrefs(); setEmailPrefs(updated); }
    catch (e) { setSentMsg("Failed to send"); }
    setSending(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="animate-in"><h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Export & Reports</h2><p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>Download your data or schedule email reports</p></div>
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><FileText size={24} color="var(--accent-green)" /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Export as CSV</h3><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Open in Excel or Google Sheets</p>
          <button className="btn-primary" onClick={() => handleExport("csv")} disabled={exporting} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14 }}>{exporting ? "Exporting..." : "Download CSV"}</button>
        </div>
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(14,165,233,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Download size={24} color="var(--accent-teal)" /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Export as JSON</h3><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Full data with insights and goals</p>
          <button className="btn-secondary" onClick={() => handleExport("json")} disabled={exporting} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14 }}>{exporting ? "Exporting..." : "Download JSON"}</button>
        </div>
      </div>
      <div className="animate-in-delay-1 card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Email Reports</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Receive a summary report delivered to your inbox</p>
        {loadingPrefs ? <Loader text="Loading..." /> : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{ key: "monthly", label: "Monthly" }, { key: "yearly", label: "Yearly" }, { key: "off", label: "Off" }].map(opt => (
                <button key={opt.key} className="tab-btn" onClick={() => handleFreqChange(opt.key)} style={emailPrefs?.reportFrequency === opt.key ? { background: "var(--accent-teal)", color: "white" } : {}}>{opt.label}</button>
              ))}
            </div>
            {emailPrefs?.reportFrequency !== "off" && (
              <div style={{ padding: 16, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>Frequency</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs?.reportFrequency}</span></div>
                {emailPrefs?.nextScheduled && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}><span style={{ color: "var(--text-muted)" }}>Next report</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs.nextScheduled}</span></div>}
                {emailPrefs?.lastSent && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}><span style={{ color: "var(--text-muted)" }}>Last sent</span><span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{emailPrefs.lastSent}</span></div>}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Send report to</label><input className="input" value={customEmail} onChange={e => setCustomEmail(e.target.value)} placeholder="Enter email address" style={{ fontSize: 13 }} /></div>
              <button className="btn-primary" onClick={handleSendNow} disabled={sending || !customEmail} style={{ padding: "12px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>{sending ? <RefreshCw size={16} className="loading-spinner" /> : <Bell size={16} />} Send Now</button>
            </div>
            {sentMsg && <div style={{ marginTop: 10, fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {sentMsg}</div>}
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────── SETTINGS VIEW ─────────── */
const SettingsView = ({ user, setUser, lang, setLang, displayCurrency, setDisplayCurrency, fxLastUpdated, userRiskProfile, onRetakeAssessment }) => {
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
      <div className="animate-in"><h2 className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>Settings</h2></div>
      <div className="animate-in" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[{ key: "account", label: "Account" }, { key: "security", label: "Security" }, { key: "plan", label: "Subscription" }, { key: "currency", label: "Currency" }, { key: "language", label: "Language" }].map(t => (
          <button key={t.key} className="tab-btn" onClick={() => setActiveTab(t.key)} style={activeTab === t.key ? { background: "var(--accent-teal)", color: "white" } : {}}>{t.label}</button>
        ))}
      </div>

      {activeTab === "account" && <AccountSettings setUser={setUser} userRiskProfile={userRiskProfile} onRetakeAssessment={onRetakeAssessment} />}

      {activeTab === "security" && <SecuritySettings />}

      {activeTab === "plan" && (
        <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="tier-card" style={{ background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Lite</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Get started for free</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$0<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/month</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Up to 5 accounts", "Basic dashboard", "Monthly wellness score", "Standard encryption"].map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-green)" /> {f}</div>)}
              {["AI insights & coach", "Scenario simulator", "Export reports"].map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}><X size={14} /> {f}</div>)}
            </div>
            <button className="btn-secondary" style={{ width: "100%" }}>Free Plan</button>
          </div>
          <div className="tier-card recommended">
            <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 20, background: "linear-gradient(135deg, #0EA5E9, #6366F1)", fontSize: 11, fontWeight: 600, color: "white" }}>RECOMMENDED</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Pro</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>For serious wealth builders</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$9.90<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/month</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Unlimited accounts", "Full dashboard", "Real-time wellness score", "AI insights & coach", "Scenario simulator", "Monthly PDF reports", "Bank-grade encryption"].map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-teal)" /> {f}</div>)}
            </div>
            <button className="btn-primary" onClick={() => handleUpgrade('pro')} disabled={upgrading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CreditCard size={16} /> Upgrade to Pro</button>
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Powered by Stripe · Cancel anytime</p>
          </div>
          <div className="tier-card" style={{ background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Family</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Manage household wealth</p>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>$19.90<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/month</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Everything in Pro", "Up to 4 family members", "Household wealth view", "Joint financial goals", "Family scenario planning", "Dedicated advisor access", "Priority support"].map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}><CheckCircle size={14} color="var(--accent-purple)" /> {f}</div>)}
            </div>
            <button className="btn-secondary" onClick={() => handleUpgrade('family')} disabled={upgrading} style={{ width: "100%" }}>Choose Family</button>
          </div>
        </div>
      )}

      {/* ── CURRENCY SETTINGS TAB ── */}
      {activeTab === "currency" && (
        <div className="animate-in card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Currency Settings</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>Choose your preferred display currency. All totals and asset values will be shown in this currency.</p>

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
                    {code} — {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Symbol: {c.symbol} &nbsp;·&nbsp;
                    {code !== 'SGD' ? `1 ${code} = S$${(FX_TO_SGD[code] ?? 1).toFixed(4)} ${fxLastUpdated ? '(live)' : '(fallback)'}` : 'Base currency'}
                  </div>
                </div>
                {displayCurrency === code && <CheckCircle size={18} color="var(--accent-teal)" />}
              </button>
            ))}
          </div>

          <div style={{ padding: "14px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 10 }}>
            <AlertTriangle size={15} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{fxLastUpdated ? `Live rates sourced from exchangerate.host · Last updated ${new Date(fxLastUpdated).toLocaleString()}. ` : 'Could not reach exchangerate.host — showing fallback rates. '}Rates are for display only; financial calculations remain in SGD on the server.</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Exchange Rates Reference</h4>
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
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Language</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Choose your preferred language</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ code: "en", label: "English", flag: "🇬🇧" }, { code: "zh", label: "简体中文", flag: "🇨🇳" }, { code: "hi", label: "हिन्दी", flag: "🇮🇳" }, { code: "es", label: "Español", flag: "🇪🇸" }, { code: "fr", label: "Français", flag: "🇫🇷" }].map(l => (
              <button key={l.code} onClick={() => { window.__wealthwell_lang = l.code; setLang(l.code); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: "var(--radius-sm)", background: lang === l.code ? "rgba(14,165,233,0.12)" : "var(--bg-secondary)", border: lang === l.code ? "1px solid var(--accent-teal)" : "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{l.flag}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{l.label}</span>
                {lang === l.code && <CheckCircle size={16} color="var(--accent-teal)" style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>Language support is being progressively rolled out.</p>
        </div>
      )}
    </div>
  );
};

/* ─────────── MAIN APP ─────────── */
const App = () => {
  const [appState, setAppState] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);
  const [profilerIsRetake, setProfilerIsRetake] = useState(false);
  const [userRiskProfile, setUserRiskProfile] = useState(null);
  const [lang, setLang] = useState(window.__wealthwell_lang || "en");

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
      const [p, w, i] = await Promise.all([api.getPortfolio(), api.getWellness(), api.getInsights()]);
      setPortfolio(p); setWellness(w); setInsights(i.insights);
    } catch (err) { console.error("Failed to load data:", err); }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      const [p, w, i] = await Promise.all([api.getPortfolio(), api.getWellness(), api.getInsights()]);
      setPortfolio(p); setWellness(w); setInsights(i.insights);
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
    { key: "dashboard", label: (TRANSLATIONS[lang] || TRANSLATIONS.en).dashboard, icon: <BarChart3 size={19} /> },
    { key: "wallet",    label: (TRANSLATIONS[lang] || TRANSLATIONS.en).wallet,    icon: <Wallet size={19} /> },
    { key: "analytics", label: (TRANSLATIONS[lang] || TRANSLATIONS.en).analytics, icon: <Activity size={19} /> },
    { key: "insights",  label: (TRANSLATIONS[lang] || TRANSLATIONS.en).insights,  icon: <Brain size={19} /> },
    { key: "goals",     label: (TRANSLATIONS[lang] || TRANSLATIONS.en).goals,     icon: <Target size={19} /> },
    { key: "scenarios", label: (TRANSLATIONS[lang] || TRANSLATIONS.en).scenarios, icon: <Activity size={19} /> },
    { key: "export",    label: (TRANSLATIONS[lang] || TRANSLATIONS.en).export,    icon: <Download size={19} /> },
    { key: "settings",  label: (TRANSLATIONS[lang] || TRANSLATIONS.en).settings,  icon: <Settings size={19} /> },
  ];

  if (appState === "login") return (<><link href={FONTS_LINK} rel="stylesheet" /><style>{CSS}</style><LoginPage onLogin={handleLogin} /></>);
  if (appState === "onboarding") return (<><link href={FONTS_LINK} rel="stylesheet" /><style>{CSS}</style><OnboardingPage onComplete={handleOnboardingComplete} /></>);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":  return <DashboardView portfolio={portfolio} wellness={wellness} insights={insights} onNavigate={setCurrentView} user={user} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} />;
      case "wallet":     return <WalletView portfolio={portfolio} refreshPortfolio={refreshPortfolio} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} updateAssetCurrency={updateAssetCurrency} />;
      case "analytics":  return <AnalyticsView portfolio={portfolio} wellness={wellness} displayCurrency={displayCurrency} userRiskProfile={userRiskProfile} onRetakeAssessment={handleRetakeAssessment} />;
      case "insights":   return <InsightsView insights={insights} displayCurrency={displayCurrency} />;
      case "goals":      return <GoalsView displayCurrency={displayCurrency} />;
      case "scenarios":  return <ScenarioView displayCurrency={displayCurrency} />;
      case "export":     return <ExportView />;
      case "settings":   return <SettingsView user={user} setUser={setUser} lang={lang} setLang={setLang} displayCurrency={displayCurrency} setDisplayCurrency={handleSetDisplayCurrency} fxLastUpdated={fxLastUpdated} userRiskProfile={userRiskProfile} onRetakeAssessment={handleRetakeAssessment} />;
      default:           return <DashboardView portfolio={portfolio} wellness={wellness} insights={insights} onNavigate={setCurrentView} user={user} displayCurrency={displayCurrency} assetCurrencies={assetCurrencies} />;
    }
  };

  return (
    <>
      <link href={FONTS_LINK} rel="stylesheet" />
      <style>{CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>
        {/* Sidebar */}
        <aside style={{ width: sidebarCollapsed ? 72 : 240, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", transition: "width 0.25s ease", flexShrink: 0 }}>
          <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #0EA5E9, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Wallet size={20} color="white" strokeWidth={1.8} /></div>
            {!sidebarCollapsed && <span className="font-display" style={{ fontSize: 18, fontWeight: 600, whiteSpace: "nowrap" }}>WealthWell</span>}
          </div>
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
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
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Crown size={10} color="var(--accent-gold)" /> {user?.plan === "pro" ? "Pro" : "Lite"} Plan</div>
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
              <CurrencySelector displayCurrency={displayCurrency} setDisplayCurrency={handleSetDisplayCurrency} fxLastUpdated={fxLastUpdated} />
              <div style={{ position: "relative" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 6 }}><Bell size={18} /></button>
                <div style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--accent-red)" }} />
              </div>
              <button onClick={() => setShowFeedback(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 6 }} title="Send Feedback"><MessageSquare size={18} /></button>
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

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} t={(k) => k} />}
      {showRating && <RatingPopup onClose={() => setShowRating(false)} />}
      {showProfiler && <RiskProfilerModal onComplete={handleProfilerComplete} onSkip={() => setShowProfiler(false)} isRetake={profilerIsRetake} />}
    </>
  );
};

export default App;
