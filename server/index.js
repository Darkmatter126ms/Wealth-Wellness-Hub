
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createTransport } from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname_patch = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// EMAIL REPORT TRANSLATIONS
// Server-side mirror of the client locale files.
// Keyed by the same lang codes i18next uses (en/zh/hi/es/fr).
// Each entry covers every hardcoded string in the email template.
// ──────────────────────────────────────────────
const EMAIL_TR = {
  en: {
    subject:           'WealthWell Monthly Report — {date}',
    reportTitle:       'WealthWell Monthly Report',
    totalNetWorth:     'TOTAL NET WORTH',
    wellnessScore:     'WELLNESS SCORE',
    monthlyChange:     '▲ +1.6% this month',
    excellent:         'Excellent',
    good:              'Good',
    needsAttention:    'Needs Attention',
    wellnessBreakdown: 'Wellness Breakdown',
    assetAllocation:   'Asset Allocation',
    colType:           'Type',
    colValue:          'Value',
    colWeight:         'Weight',
    colRisk:           'Risk',
    keyInsights:       'Key Insights',
    disclaimer:        'This report is for informational purposes only and does not constitute financial advice.',
    assetTypes: { Cash:'Cash', Retirement:'Retirement', Equities:'Equities', REITs:'REITs', 'Fixed Income':'Fixed Income', Crypto:'Crypto', Property:'Property', Vehicle:'Vehicle' },
    riskLevel:  { 'Very Low':'Very Low', 'Low':'Low', 'Low-Medium':'Low-Medium', 'Medium':'Medium', 'Medium-High':'Medium-High', 'High':'High', 'Very High':'Very High', 'Depreciating':'Depreciating', 'Unknown':'Unknown' },
    metrics:    { 'Diversification':'Diversification', 'Liquidity':'Liquidity', 'Growth':'Growth', 'Risk Mgmt':'Risk Mgmt', 'Tax Efficiency':'Tax Efficiency', 'Emergency Fund':'Emergency Fund', 'Behavioral Resilience':'Behavioral Resilience' },
    insightCards: {
      ins_crypto:   { title: 'Crypto Volatility Exposure',           summary: 'Your crypto allocation ({cryptoPct}%) carries high volatility. A 50% drawdown would reduce your net worth by ${drawdown}.' },
      ins_srs:      { title: 'SRS Top-Up Tax Savings Available',      summary: "You're ${gap} below the SRS contribution cap. Topping up could save you up to ${taxSaving} in taxes (at 7% marginal rate)." },
      ins_emergency:{ title: 'Strong Emergency Fund',                 summary: 'Your cash holdings cover {months} months of estimated expenses, exceeding the recommended 6-month buffer by ${excess}.' },
      ins_vehicle:  { title: 'Vehicle Depreciation Impact',           summary: 'Your car is depreciating at ~{pct}% annually, reducing net wealth by ~${annualLoss}/year.' },
      ins_equity:   { title: 'Rebalance Equity Allocation',           summary: 'Your Singapore equities ({stiPct}%) have underperformed relative to US equities (+{spPct}%). Consider geographic diversification.' },
      ins_cpf:      { title: 'CPF Balances On Track',                 summary: 'Your combined CPF balance of ${cpfTotal} is growing steadily. At current contribution rates, you are projected to meet the Basic Retirement Sum by age 55.' },
      ins_property: { title: 'High Property Concentration',           summary: 'Property makes up {propertyPct}% of your net worth. While common in Singapore, this creates concentration risk if the property market corrects.' },
    }
  },
  zh: {
    subject:           'WealthWell 月度报告 — {date}',
    reportTitle:       'WealthWell 月度报告',
    totalNetWorth:     '总净资产',
    wellnessScore:     '健康评分',
    monthlyChange:     '▲ 本月 +1.6%',
    excellent:         '优秀',
    good:              '良好',
    needsAttention:    '需要关注',
    wellnessBreakdown: '健康状况细分',
    assetAllocation:   '资产配置',
    colType:           '类型',
    colValue:          '价值',
    colWeight:         '占比',
    colRisk:           '风险',
    keyInsights:       '关键洞察',
    disclaimer:        '本报告仅供参考，不构成任何财务建议。',
    assetTypes: { Cash:'现金', Retirement:'退休金', Equities:'股票', REITs:'房地产信托', 'Fixed Income':'固定收益', Crypto:'加密货币', Property:'房产', Vehicle:'车辆' },
    riskLevel:  { 'Very Low':'极低', 'Low':'低', 'Low-Medium':'中低', 'Medium':'中等', 'Medium-High':'中高', 'High':'高', 'Very High':'极高', 'Depreciating':'贬値中', 'Unknown':'未知' },
    metrics:    { 'Diversification':'多样性', 'Liquidity':'流动性', 'Growth':'增长', 'Risk Mgmt':'风险管理', 'Tax Efficiency':'税务效率', 'Emergency Fund':'应急资金', 'Behavioral Resilience':'行为韧性' },
    insightCards: {
      ins_crypto:   { title: '加密货币波动风险',     summary: '您的加密货币配置（{cryptoPct}%）波动性极高。50%的跌幅将使净资产减少${drawdown}。' },
      ins_srs:      { title: '可补足SRS供款节税',     summary: '您距SRS供款上限还差${gap}。补足后可节省最多${taxSaving}的税款（按7%边际税率）。' },
      ins_emergency:{ title: '应急基金充足',          summary: '您的现金储备可覆盖{months}个月的预计支出，超出建议的6个月缓冲额${excess}。' },
      ins_vehicle:  { title: '车辆折旧影响',          summary: '您的汽车每年折旧约{pct}%，每年净资产减少约${annualLoss}。' },
      ins_equity:   { title: '重新平衡股票配置',      summary: '您的新加坡股票（{stiPct}%）表现落后于美国股票（+{spPct}%）。建议考虑地理分散投资。' },
      ins_cpf:      { title: '公积金余额步入正轨',    summary: '您的公积金总余额${cpfTotal}持续稳定增长。按目前缴款率，预计您将在55岁前达到基本退休存款。' },
      ins_property: { title: '房产集中度偏高',        summary: '房产占您净资产的{propertyPct}%。这在新加坡较为普遍，但若房产市场调整，将产生集中度风险。' },
    }
  },
  hi: {
    subject:           'WealthWell मासिक रिपोर्ट — {date}',
    reportTitle:       'WealthWell मासिक रिपोर्ट',
    totalNetWorth:     'कुल नेट वर्थ',
    wellnessScore:     'वेलनेस स्कोर',
    monthlyChange:     '▲ इस माह +1.6%',
    excellent:         'उत्कृष्ट',
    good:              'अच्छा',
    needsAttention:    'ध्यान आवश्यक',
    wellnessBreakdown: 'वेलनेस विवरण',
    assetAllocation:   'परिसंपत्ति आवंटन',
    colType:           'प्रकार',
    colValue:          'मूल्य',
    colWeight:         'भार',
    colRisk:           'जोखिम',
    keyInsights:       'मुख्य अंतर्दृष्टि',
    disclaimer:        'यह रिपोर्ट केवल सूचनात्मक उद्देश्यों के लिए है और वित्तीय सलाह नहीं है।',
    assetTypes: { Cash:'नकद', Retirement:'सेवानिवृत्ति', Equities:'इक्विटी', REITs:'REITs', 'Fixed Income':'निश्चित आय', Crypto:'क्रिप्टो', Property:'संपत्ति', Vehicle:'वाहन' },
    riskLevel:  { 'Very Low':'बहुत कम', 'Low':'कम', 'Low-Medium':'कम-मध्यम', 'Medium':'मध्यम', 'Medium-High':'मध्यम-अधिक', 'High':'अधिक', 'Very High':'बहुत अधिक', 'Depreciating':'मूल्यह्रास', 'Unknown':'अज्ञात' },
    metrics:    { 'Diversification':'विविधीकरण', 'Liquidity':'तरलता', 'Growth':'वृद्धि', 'Risk Mgmt':'जोखिम प्रबंधन', 'Tax Efficiency':'कर दक्षता', 'Emergency Fund':'आपातकालीन निधि', 'Behavioral Resilience':'व्यवहार लचीलापन' },
    insightCards: {
      ins_crypto:   { title: 'क्रिप्टो अस्थिरता जोखिम',         summary: 'आपका क्रिप्टो आवंटन ({cryptoPct}%) अत्यधिक अस्थिर है। 50% की गिरावट आपकी नेट वर्थ को ${drawdown} कम कर देगी।' },
      ins_srs:      { title: 'SRS टॉप-अप से कर बचत उपलब्ध',     summary: 'आप SRS योगदान सीमा से ${gap} कम हैं। टॉप-अप करने पर 7% सीमांत दर पर ${taxSaving} तक की कर बचत हो सकती है।' },
      ins_emergency:{ title: 'मजबूत आपातकालीन निधि',             summary: 'आपकी नकद बचत {months} महीने के खर्च को कवर करती है, जो अनुशंसित 6 माह की सीमा से ${excess} अधिक है।' },
      ins_vehicle:  { title: 'वाहन मूल्यह्रास प्रभाव',            summary: 'आपकी कार सालाना ~{pct}% घट रही है, जिससे नेट वर्थ ~${annualLoss}/वर्ष कम हो रही है।' },
      ins_equity:   { title: 'इक्विटी आवंटन पुनर्संतुलन',        summary: 'आपके सिंगापुर इक्विटी ({stiPct}%) का प्रदर्शन अमेरिकी इक्विटी (+{spPct}%) से कमज़ोर रहा है। भौगोलिक विविधीकरण पर विचार करें।' },
      ins_cpf:      { title: 'CPF बैलेंस सही रास्ते पर',          summary: 'आपका संयुक्त CPF बैलेंस ${cpfTotal} स्थिर गति से बढ़ रहा है। वर्तमान योगदान दर पर, आप 55 वर्ष की आयु तक बेसिक रिटायरमेंट सम पूरा करने की राह पर हैं।' },
      ins_property: { title: 'संपत्ति में अत्यधिक केंद्रण',       summary: 'संपत्ति आपकी नेट वर्थ का {propertyPct}% है। सिंगापुर में यह सामान्य है, लेकिन बाजार सुधार की स्थिति में केंद्रण जोखिम उत्पन्न होता है।' },
    }
  },
  es: {
    subject:           'Informe Mensual de WealthWell — {date}',
    reportTitle:       'Informe Mensual de WealthWell',
    totalNetWorth:     'PATRIMONIO NETO TOTAL',
    wellnessScore:     'PUNTUACIÓN DE BIENESTAR',
    monthlyChange:     '▲ +1.6% este mes',
    excellent:         'Excelente',
    good:              'Bueno',
    needsAttention:    'Necesita Atención',
    wellnessBreakdown: 'Desglose de Bienestar',
    assetAllocation:   'Asignación de Activos',
    colType:           'Tipo',
    colValue:          'Valor',
    colWeight:         'Peso',
    colRisk:           'Riesgo',
    keyInsights:       'Perspectivas Clave',
    disclaimer:        'Este informe es solo informativo y no constituye asesoramiento financiero.',
    assetTypes: { Cash:'Efectivo', Retirement:'Jubilación', Equities:'Renta Variable', REITs:'REITs', 'Fixed Income':'Renta Fija', Crypto:'Cripto', Property:'Inmuebles', Vehicle:'Vehículo' },
    riskLevel:  { 'Very Low':'Muy Bajo', 'Low':'Bajo', 'Low-Medium':'Bajo-Medio', 'Medium':'Medio', 'Medium-High':'Medio-Alto', 'High':'Alto', 'Very High':'Muy Alto', 'Depreciating':'En Depreciación', 'Unknown':'Desconocido' },
    metrics:    { 'Diversification':'Diversificación', 'Liquidity':'Liquidez', 'Growth':'Crecimiento', 'Risk Mgmt':'Gestión de Riesgo', 'Tax Efficiency':'Eficiencia Fiscal', 'Emergency Fund':'Fondo de Emergencia', 'Behavioral Resilience':'Resiliencia Conductual' },
    insightCards: {
      ins_crypto:   { title: 'Exposición a la Volatilidad de Criptomonedas', summary: 'Su asignación a criptomonedas ({cryptoPct}%) conlleva alta volatilidad. Una caída del 50% reduciría su patrimonio neto en ${drawdown}.' },
      ins_srs:      { title: 'Ahorro Fiscal Disponible con Aportación SRS',   summary: 'Le faltan ${gap} para alcanzar el límite de aportación SRS. Completarlo podría ahorrarle hasta ${taxSaving} en impuestos (tasa marginal del 7%).' },
      ins_emergency:{ title: 'Fondo de Emergencia Sólido',                    summary: 'Sus ahorros en efectivo cubren {months} meses de gastos estimados, superando el colchón recomendado de 6 meses en ${excess}.' },
      ins_vehicle:  { title: 'Impacto de la Depreciación del Vehículo',       summary: 'Su vehículo se deprecia a ~{pct}% anual, reduciendo el patrimonio neto en ~${annualLoss}/año.' },
      ins_equity:   { title: 'Reequilibrar Asignación de Renta Variable',     summary: 'Sus acciones de Singapur ({stiPct}%) han tenido un rendimiento inferior al de las acciones estadounidenses (+{spPct}%). Considere diversificar geográficamente.' },
      ins_cpf:      { title: 'Saldos CPF en Buen Camino',                     summary: 'Su saldo CPF combinado de ${cpfTotal} crece de forma constante. Con las tasas de aportación actuales, está en camino de alcanzar la Suma Básica de Jubilación a los 55 años.' },
      ins_property: { title: 'Alta Concentración en Propiedades',              summary: 'Las propiedades representan el {propertyPct}% de su patrimonio neto. Aunque es común en Singapur, esto genera riesgo de concentración si el mercado inmobiliario corrige.' },
    }
  },
  fr: {
    subject:           'Rapport Mensuel WealthWell — {date}',
    reportTitle:       'Rapport Mensuel WealthWell',
    totalNetWorth:     'PATRIMOINE NET TOTAL',
    wellnessScore:     'SCORE DE BIEN-ÊRE',
    monthlyChange:     '▲ +1,6% ce mois',
    excellent:         'Excellent',
    good:              'Bien',
    needsAttention:    'Attention Requise',
    wellnessBreakdown: 'Détail du Bien-être',
    assetAllocation:   "Allocation d'Actifs",
    colType:           'Type',
    colValue:          'Valeur',
    colWeight:         'Poids',
    colRisk:           'Risque',
    keyInsights:       'Perspectives Clés',
    disclaimer:        "Ce rapport est fourni à titre informatif uniquement et ne constitue pas un conseil financier.",
    assetTypes: { Cash:'Liquidités', Retirement:'Retraite', Equities:'Actions', REITs:'REITs', 'Fixed Income':'Revenu Fixe', Crypto:'Crypto', Property:'Immobilier', Vehicle:'Véhicule' },
    riskLevel:  { 'Very Low':'Très Faible', 'Low':'Faible', 'Low-Medium':'Faible-Moyen', 'Medium':'Moyen', 'Medium-High':'Moyen-Élevé', 'High':'Élevé', 'Very High':'Très Élevé', 'Depreciating':'En Dépréciation', 'Unknown':'Inconnu' },
    metrics:    { 'Diversification':'Diversification', 'Liquidity':'Liquidité', 'Growth':'Croissance', 'Risk Mgmt':'Gestion des Risques', 'Tax Efficiency':'Efficacité Fiscale', 'Emergency Fund':"Fonds d'Urgence", 'Behavioral Resilience':'Résilience Comportementale' },
    insightCards: {
      ins_crypto:   { title: 'Exposition à la Volatilité des Cryptos',  summary: 'Votre allocation en cryptomonnaies ({cryptoPct}%) est très volatile. Une baisse de 50% réduirait votre patrimoine net de ${drawdown}.' },
      ins_srs:      { title: 'Économies Fiscales Disponibles via SRS',   summary: "Il vous manque ${gap} pour atteindre le plafond de cotisation SRS. Compléter pourrait vous faire économiser jusqu'à ${taxSaving} d'impôts (taux marginal de 7%)." },
      ins_emergency:{ title: "Fonds d'Urgence Solide",                   summary: 'Vos liquidités couvrent {months} mois de dépenses estimées, dépassant le tampon recommandé de 6 mois de ${excess}.' },
      ins_vehicle:  { title: 'Impact de la Dépréciation du Véhicule',    summary: 'Votre voiture se déprécie d environ {pct}% par an, réduisant votre patrimoine net d environ ${annualLoss}/an.' },
      ins_equity:   { title: "Rééquilibrer l'Allocation Actions",         summary: 'Vos actions singapouriennes ({stiPct}%) ont sous-performé par rapport aux actions américaines (+{spPct}%). Envisagez une diversification géographique.' },
      ins_cpf:      { title: 'Soldes CPF en Bonne Voie',                  summary: 'Votre solde CPF combiné de ${cpfTotal} croît régulièrement. Aux taux de cotisation actuels, vous êtes en bonne voie pour atteindre la Somme de Retraite de Base à 55 ans.' },
      ins_property: { title: 'Forte Concentration en Immobilier',         summary: "L'immobilier représente {propertyPct}% de votre patrimoine net. Bien que courant à Singapour, cela crée un risque de concentration si le marché immobilier se corrige." },
    }
  },
};

// ──────────────────────────────────────────────
// ASSET RISK CLASSIFICATION DATABASE
// ──────────────────────────────────────────────

const RISK_DATABASE = {
  // By asset type (default fallback)
  _typeDefaults: {
    'Cash': { riskLevel: 'Very Low', riskScore: 1, color: '#10B981', description: 'Capital guaranteed, minimal volatility' },
    'Fixed Income': { riskLevel: 'Low', riskScore: 2, color: '#14B8A6', description: 'Steady returns, low default risk for government bonds' },
    'Retirement': { riskLevel: 'Low', riskScore: 2, color: '#6366F1', description: 'Government-backed, guaranteed interest rates' },
    'REITs': { riskLevel: 'Medium', riskScore: 3, color: '#F59E0B', description: 'Income-generating but sensitive to interest rates' },
    'Equities': { riskLevel: 'Medium-High', riskScore: 4, color: '#F97316', description: 'Market-dependent, suitable for long-term growth' },
    'Property': { riskLevel: 'Medium', riskScore: 3, color: '#D946EF', description: 'Illiquid but generally stable in Singapore' },
    'Crypto': { riskLevel: 'Very High', riskScore: 5, color: '#EF4444', description: 'Extreme volatility, speculative asset class' },
    'Vehicle': { riskLevel: 'Depreciating', riskScore: 0, color: '#78716C', description: 'Not an investment — depreciates over time' },
  },
  // Override by specific asset name (more granular)
  _assetOverrides: {
    'DBS Savings': { riskLevel: 'Very Low', riskScore: 1, description: 'SDIC insured up to $100K' },
    'OCBC 360': { riskLevel: 'Very Low', riskScore: 1, description: 'SDIC insured up to $100K' },
    'CPF OA': { riskLevel: 'Very Low', riskScore: 1, description: 'Government guaranteed 2.5% p.a.' },
    'CPF SA': { riskLevel: 'Very Low', riskScore: 1, description: 'Government guaranteed 4% p.a.' },
    'SRS Account': { riskLevel: 'Low', riskScore: 2, description: 'Tax-advantaged, depends on underlying investments' },
    'STI ETF': { riskLevel: 'Medium', riskScore: 3, description: 'Broad SG market exposure, moderate volatility' },
    'S&P 500 ETF': { riskLevel: 'Medium', riskScore: 3, description: 'Broad US market, strong historical returns, FX risk' },
    'Syfe REIT+': { riskLevel: 'Medium', riskScore: 3, description: 'Diversified REIT portfolio, interest rate sensitive' },
    'Endowus CashSmart': { riskLevel: 'Low', riskScore: 2, description: 'Money market fund, low volatility' },
    'Bitcoin': { riskLevel: 'Very High', riskScore: 5, description: 'Crypto — 50%+ drawdowns are historically normal' },
    'Ethereum': { riskLevel: 'Very High', riskScore: 5, description: 'Crypto — high volatility, smart contract platform' },
    'Singapore Savings Bond': { riskLevel: 'Very Low', riskScore: 1, description: 'Government-backed, fully redeemable' },
    'HDB Property': { riskLevel: 'Low-Medium', riskScore: 2, description: 'Historically stable, but illiquid and tied to lease' },
    'Car (Toyota)': { riskLevel: 'Depreciating', riskScore: 0, description: 'Depreciates ~15%/year, COE adds risk' },
  },
};

function getAssetRisk(asset) {
  const override = RISK_DATABASE._assetOverrides[asset.name];
  const typeDefault = RISK_DATABASE._typeDefaults[asset.type] || { riskLevel: 'Unknown', riskScore: 3, color: '#64748B', description: '' };
  return {
    riskLevel: override?.riskLevel || typeDefault.riskLevel,
    riskScore: override?.riskScore ?? typeDefault.riskScore,
    riskColor: typeDefault.color,
    riskDescription: override?.description || typeDefault.description,
  };
}

// ──────────────────────────────────────────────
// In-memory data store (replace with DB in prod)
// ──────────────────────────────────────────────

const users = {
  'sarah@wealthwell.com': {
    id: 'usr_001',
    name: 'Sarah Chen',
    email: 'sarah@wealthwell.com',
    passwordHash: hashPassword('demo1234'),
    plan: 'pro',
    twoFASecret: 'MOCK_SECRET_KEY',
    twoFAEnabled: true,
    createdAt: '2024-08-15',
  }
};

const sessions = {};

const userBehavior = {
  'usr_001': { deletions: 0, additions: 3, loginCount: 12 },
};

// Stores risk profile per user. Cleared on server restart (= first-time experience)
const userProfiles = {};

// ── Profile definitions ──────────────────────────────────────────────────────
// Labels, descriptions, and metric weights per profile.
// Weights must sum to 1.00 and are used for the weighted overall wellness score.
const RISK_PROFILES = {
  conservative: {
    label: 'Conservative',
    subtitle: 'Capital Preserver',
    description: 'You prioritise stability and capital protection. Your score rewards strong emergency buffers and low volatility over high growth.',
    color: '#10B981', // green
    weights: {
      'Emergency Fund':       0.25,
      'Liquidity':            0.20,
      'Risk Mgmt':            0.20,
      'Diversification':      0.15,
      'Tax Efficiency':       0.10,
      'Behavioral Resilience':0.05,
      'Growth':               0.05,
    },
    // Metric score modifiers applied AFTER raw calculation (clamped 0-100)
    modifiers: {
      'Emergency Fund': +10,
      'Liquidity':       +5,
      'Risk Mgmt':       +5,
      'Growth':         -10,  // under-weighting growth is fine for this profile
    },
  },
  balanced: {
    label: 'Balanced',
    subtitle: 'Steady Builder',
    description: 'You seek sustainable long-term growth with manageable risk. Your score is calculated with equal emphasis across all dimensions.',
    color: '#0EA5E9', // blue
    weights: {
      'Diversification':      0.18,
      'Growth':               0.15,
      'Liquidity':            0.15,
      'Emergency Fund':       0.15,
      'Risk Mgmt':            0.15,
      'Tax Efficiency':       0.12,
      'Behavioral Resilience':0.10,
    },
    modifiers: {}, // no adjustments — balanced is the baseline
  },
  growth: {
    label: 'Growth',
    subtitle: 'High-Growth Investor',
    description: 'You embrace volatility in pursuit of long-term capital appreciation. Your score rewards equity exposure, diversification, and behavioural discipline.',
    color: '#8B5CF6', // purple
    weights: {
      'Growth':               0.25,
      'Diversification':      0.20,
      'Behavioral Resilience':0.15,
      'Risk Mgmt':            0.15,
      'Tax Efficiency':       0.10,
      'Liquidity':            0.10,
      'Emergency Fund':       0.05,
    },
    modifiers: {
      'Growth':          +15,  // reward equity-heavy portfolios
      'Emergency Fund':  -10,  // excess cash is an opportunity cost
      'Liquidity':        -5,
      'Behavioral Resilience': +5, // discipline especially important for volatile portfolios
    },
  },
};

// Score answers to determine risk profile
function computeRiskProfile(answers) {
  // answers is an array of { questionId, value, score } from the client
  const total = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
  // Max possible score across all 7 questions = 4+3+3+3+2+2+3 = 20
  const profile = total <= 6 ? 'conservative' : total <= 13 ? 'balanced' : 'growth';
  return { riskScore: total, riskProfile: profile };
}

const portfolios = {
  'usr_001': {
    assets: [
      { id: 'a1', name: 'DBS Savings', type: 'Cash', institution: 'DBS Bank', value: 45000, change: 0.02, icon: 'bank', color: '#0A8F96' },
      { id: 'a2', name: 'OCBC 360', type: 'Cash', institution: 'OCBC Bank', value: 28000, change: 0.015, icon: 'bank', color: '#10B981' },
      { id: 'a3', name: 'CPF OA', type: 'Retirement', institution: 'CPF Board', value: 62000, change: 0.025, icon: 'landmark', color: '#6366F1' },
      { id: 'a4', name: 'CPF SA', type: 'Retirement', institution: 'CPF Board', value: 38000, change: 0.04, icon: 'landmark', color: '#8B5CF6' },
      { id: 'a5', name: 'SRS Account', type: 'Retirement', institution: 'UOB', value: 15000, change: 0.03, icon: 'landmark', color: '#A78BFA' },
      { id: 'a6', name: 'STI ETF', type: 'Equities', institution: 'FSMOne', value: 35000, change: -0.018, icon: 'trending', color: '#F59E0B' },
      { id: 'a7', name: 'S&P 500 ETF', type: 'Equities', institution: 'Interactive Brokers', value: 52000, change: 0.045, icon: 'trending', color: '#EAB308' },
      { id: 'a8', name: 'Syfe REIT+', type: 'REITs', institution: 'Syfe', value: 18000, change: -0.008, icon: 'building', color: '#EC4899' },
      { id: 'a9', name: 'Endowus CashSmart', type: 'Fixed Income', institution: 'Endowus', value: 25000, change: 0.035, icon: 'shield', color: '#14B8A6' },
      { id: 'a10', name: 'Bitcoin', type: 'Crypto', institution: 'Coinhako', value: 8500, change: 0.12, icon: 'bitcoin', color: '#F97316' },
      { id: 'a11', name: 'Ethereum', type: 'Crypto', institution: 'Coinhako', value: 4200, change: 0.08, icon: 'bitcoin', color: '#3B82F6' },
      { id: 'a12', name: 'Singapore Savings Bond', type: 'Fixed Income', institution: 'MAS', value: 20000, change: 0.032, icon: 'shield', color: '#06B6D4' },
      { id: 'a13', name: 'HDB Property', type: 'Property', institution: 'HDB', value: 580000, change: 0.02, icon: 'home', color: '#D946EF' },
      { id: 'a14', name: 'Car (Toyota)', type: 'Vehicle', institution: 'Personal', value: 45000, change: -0.15, icon: 'car', color: '#78716C' },
    ],
    wealthHistory: (() => {
      // Generate ~10 years of monthly data ending Mar 2026.
      // Strategy: anchor the last 7 known months, then extrapolate backward
      // using ~9 % annualised growth + seeded deterministic noise so the
      // history looks realistic but is reproducible across server restarts.
      const known = [
        { year: 2026, month: 2, value: 975700 }, // Mar 2026 (month index 0-based = 2)
        { year: 2026, month: 1, value: 968000 },
        { year: 2026, month: 0, value: 955000 },
        { year: 2025, month: 11, value: 960000 },
        { year: 2025, month: 10, value: 948000 },
        { year: 2025, month: 9, value: 935000 },
        { year: 2025, month: 8, value: 920000 },
      ];
      // Build a lookup for known months
      const knownMap = {};
      for (const k of known) knownMap[`${k.year}-${k.month}`] = k.value;

      // Simple seeded pseudo-random for deterministic noise
      let seed = 42;
      const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

      const monthlyGrowth = Math.pow(1.09, 1 / 12); // ~0.72 % / month
      const endDate = new Date(2026, 2, 1);          // Mar 2026
      const MONTHS_BACK = 120;                       // 10 years

      const result = [];
      for (let i = MONTHS_BACK; i >= 0; i--) {
        const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        let value;
        if (knownMap[key] !== undefined) {
          value = knownMap[key];
        } else {
          // Extrapolate backward from 920 000 (Sep 2025, i = ~6 months from end)
          const monthsFromStart = MONTHS_BACK - i;
          const base = 420000 * Math.pow(monthlyGrowth, monthsFromStart);
          // ±2 % deterministic noise
          const noise = 1 + (rand() - 0.5) * 0.04;
          value = Math.round(base * noise);
        }
        result.push({ month: d.toISOString().slice(0, 7), value });
      }
      return result;
    })(),
  }
};

// ──────────────────────────────────────────────
// Daily history generator (called per-request so it always uses today's date)
// ──────────────────────────────────────────────

/**
 * Generates daily wealth values from the start of the previous calendar month
 * up to and including today, by linearly interpolating between the surrounding
 * monthly anchors in `monthlyHistory` and adding small deterministic per-day noise.
 *
 * @param {Array<{month: string, value: number}>} monthlyHistory  - e.g. [{month:'2026-03', value:975700}, ...]
 * @returns {Array<{date: string, value: number}>}                - e.g. [{date:'2026-02-01', value:...}, ...]
 */
function generateDailyHistory(monthlyHistory) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Window: first day of previous calendar month → today
  const windowStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Build a quick O(1) lookup: 'YYYY-MM' → value
  const monthMap = {};
  for (const h of monthlyHistory) monthMap[h.month] = h.value;

  // Deterministic per-day noise (seed chosen to differ from monthly generator)
  let seed = 137;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const result = [];

  // Iterate day by day from windowStart to today (inclusive)
  for (let cur = new Date(windowStart); cur <= today; cur.setDate(cur.getDate() + 1)) {
    const year  = cur.getFullYear();
    const month = cur.getMonth();   // 0-based
    const day   = cur.getDate();

    // Formatted month keys
    const thisKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const nextYear  = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;

    const v0 = monthMap[thisKey];
    if (v0 === undefined) continue; // no anchor — skip (shouldn't happen for recent months)

    const v1 = monthMap[nextKey] ?? v0; // if next month unknown, hold flat
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // t = 0 at day-1, t = 1 at day-(daysInMonth+1) so end-of-month → v1
    const t     = (day - 1) / daysInMonth;
    const base  = v0 + (v1 - v0) * t;

    // ±0.3 % noise so the line has realistic micro-fluctuation
    const noise = 1 + (rand() - 0.5) * 0.006;
    const value = Math.round(base * noise);

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    result.push({ date: dateStr, value });
  }

  return result;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = sessions[token].userId;
  req.user = Object.values(users).find(u => u.id === req.userId);
  next();
}

function computeWellnessScore(assets, userId) {
  const total = assets.reduce((s, a) => s + a.value, 0);
  const types = {};
  assets.forEach(a => { types[a.type] = (types[a.type] || 0) + a.value; });
  const typeCount = Object.keys(types).length;

  // Retrieve user's risk profile (may be null if not yet profiled)
  const profile = userProfiles[userId] || null;
  const profileKey = profile?.riskProfile || 'balanced'; // default to balanced weights
  const profileDef = RISK_PROFILES[profileKey];

  // ── Raw metric scores (profile-aware thresholds) ────────────────────────────

  const diversification = Math.min(100, typeCount * 13);

  // Liquidity: conservatives rewarded for higher cash buffers
  const cashRatio = ((types['Cash'] || 0) / total) * 100;
  let liquidity;
  if (profileKey === 'conservative') {
    liquidity = cashRatio > 25 ? 95 : cashRatio > 15 ? 80 : cashRatio > 8 ? 60 + cashRatio : 30 + cashRatio * 2;
  } else if (profileKey === 'growth') {
    // Growth: 5-15% cash is ideal; excess cash = opportunity cost
    liquidity = cashRatio > 20 ? Math.max(40, 70 - (cashRatio - 20)) : cashRatio > 5 ? 65 + cashRatio : 30 + cashRatio * 2;
  } else {
    liquidity = cashRatio > 15 ? 90 : cashRatio > 8 ? 65 + cashRatio : 30 + cashRatio * 2;
  }

  // Growth: growth investors rewarded more for equity allocation
  const growthAlloc = ((types['Equities'] || 0) + (types['Crypto'] || 0)) / total * 100;
  let growth;
  if (profileKey === 'growth') {
    growth = growthAlloc > 40 ? 95 : growthAlloc > 25 ? 75 + growthAlloc * 0.5 : growthAlloc > 10 ? 60 + growthAlloc : 40 + growthAlloc;
    growth = Math.min(100, growth);
  } else if (profileKey === 'conservative') {
    // Conservative: modest equity = fine; high equity is a yellow flag (cap at 75)
    growth = growthAlloc > 20 ? Math.min(75, 60 + growthAlloc * 0.5) : growthAlloc > 10 ? 55 + growthAlloc : 40 + growthAlloc;
  } else {
    growth = growthAlloc > 20 ? 85 : growthAlloc > 10 ? 60 + growthAlloc : 40 + growthAlloc;
  }

  // Risk Mgmt: conservatives rewarded more for safe allocation
  const safeAlloc = ((types['Cash'] || 0) + (types['Fixed Income'] || 0) + (types['Retirement'] || 0)) / total * 100;
  let riskMgmt;
  if (profileKey === 'conservative') {
    riskMgmt = safeAlloc > 50 ? 90 : safeAlloc > 30 ? 65 + safeAlloc * 0.5 : safeAlloc > 15 ? 45 + safeAlloc : 30 + safeAlloc;
  } else if (profileKey === 'growth') {
    // Growth: too much safe allocation means under-deployment (cap at 80)
    riskMgmt = safeAlloc > 40 ? Math.min(80, 60 + safeAlloc * 0.3) : safeAlloc > 15 ? 50 + safeAlloc : 30 + safeAlloc;
  } else {
    riskMgmt = safeAlloc > 30 ? 75 : safeAlloc > 15 ? 45 + safeAlloc : 30 + safeAlloc;
  }

  const srsBalance = assets.find(a => a.name.includes('SRS'))?.value || 0;
  const taxEfficiency = srsBalance >= 15300 ? 80 : Math.round((srsBalance / 15300) * 60);

  // Emergency Fund: conservatives get rewarded for bigger buffers; growth = 3-6mo is ideal
  const cashTotal = types['Cash'] || 0;
  const monthsCoverage = cashTotal / 9000;
  let emergencyFund;
  if (profileKey === 'conservative') {
    emergencyFund = monthsCoverage >= 9 ? 100 : monthsCoverage >= 6 ? 90 : monthsCoverage >= 3 ? 70 : Math.round(monthsCoverage * 23);
  } else if (profileKey === 'growth') {
    // 3-6 months is ideal; more = opportunity cost (cap at 75)
    emergencyFund = monthsCoverage >= 6 ? Math.min(75, 60 + monthsCoverage) : monthsCoverage >= 3 ? 70 : Math.round(monthsCoverage * 20);
  } else {
    emergencyFund = monthsCoverage >= 6 ? 85 : Math.round(monthsCoverage * 14);
  }

  // Behavioral Resilience (unchanged — discipline matters for all profiles)
  const behavior = userBehavior[userId] || { deletions: 0, additions: 0, loginCount: 0 };
  let behaviorScore = 70;
  const churnRate = assets.length > 0 ? behavior.deletions / (assets.length + behavior.deletions) : 0;
  if (churnRate > 0.3) behaviorScore -= 25;
  else if (churnRate > 0.15) behaviorScore -= 10;
  if (behavior.loginCount >= 10) behaviorScore += 10;
  else if (behavior.loginCount >= 5) behaviorScore += 5;
  const longTermPct = ((types['Retirement'] || 0) + (types['Property'] || 0)) / total * 100;
  if (longTermPct > 40) behaviorScore += 10;
  else if (longTermPct > 20) behaviorScore += 5;
  const cryptoPct = ((types['Crypto'] || 0) / total) * 100;
  if (cryptoPct > 20) behaviorScore -= 15;
  else if (cryptoPct > 10) behaviorScore -= 5;
  behaviorScore = Math.max(0, Math.min(100, behaviorScore));

  // ── Apply profile modifiers (clamped 0–100) ────────────────────────────────
  const rawScores = {
    'Diversification':       Math.round(diversification),
    'Liquidity':             Math.round(liquidity),
    'Growth':                Math.round(growth),
    'Risk Mgmt':             Math.round(riskMgmt),
    'Tax Efficiency':        Math.round(taxEfficiency),
    'Emergency Fund':        Math.round(emergencyFund),
    'Behavioral Resilience': Math.round(behaviorScore),
  };
  const mods = profileDef.modifiers;
  const metrics = Object.entries(rawScores).map(([metric, raw]) => ({
    metric,
    score: Math.max(0, Math.min(100, raw + (mods[metric] || 0))),
  }));

  // ── Weighted overall score ─────────────────────────────────────────────────
  const weights = profileDef.weights;
  const overall = Math.round(
    metrics.reduce((sum, m) => sum + m.score * (weights[m.metric] || 0), 0)
  );

  return { overall, metrics, riskProfile: profileKey };
}

function generateInsights(assets) {
  const total = assets.reduce((s, a) => s + a.value, 0);
  const types = {};
  assets.forEach(a => { types[a.type] = (types[a.type] || 0) + a.value; });

  const insights = [];

  // Crypto risk check
  const cryptoVal = types['Crypto'] || 0;
  if (cryptoVal > 0) {
    const cryptoPct = ((cryptoVal / total) * 100).toFixed(1);
    const drawdown = Math.round(cryptoVal * 0.5);
    insights.push({
      id: 'ins_1', type: 'warning', priority: 'high', category: 'Risk',
      titleKey: 'insights.cards.ins_crypto.title',
      summaryKey: 'insights.cards.ins_crypto.summary',
      summaryParams: { cryptoPct, drawdown: drawdown.toLocaleString() },
      actionKey: 'insights.cards.ins_crypto.action',
      actionParams: {},
      title: 'Crypto Volatility Exposure',
      summary: `Your crypto allocation (${cryptoPct}%) carries high volatility. A 50% drawdown would reduce your net worth by $${drawdown.toLocaleString()}.`,
      action: 'Consider setting a mental stop-loss level or rebalancing 30% of crypto holdings into fixed income instruments like SSBs or T-bills.',
    });
  }

  // SRS tax optimization
  const srsAsset = assets.find(a => a.name.includes('SRS'));
  if (srsAsset && srsAsset.value < 15300) {
    const gap = 15300 - srsAsset.value;
    const taxSaving = Math.round(gap * 0.07);
    insights.push({
      id: 'ins_2', type: 'opportunity', priority: 'high', category: 'Tax',
      titleKey: 'insights.cards.ins_srs.title',
      summaryKey: 'insights.cards.ins_srs.summary',
      summaryParams: { gap: gap.toLocaleString(), taxSaving: taxSaving.toLocaleString() },
      actionKey: 'insights.cards.ins_srs.action',
      actionParams: { gap: gap.toLocaleString() },
      title: 'SRS Top-Up Tax Savings Available',
      summary: `You're $${gap.toLocaleString()} below the SRS contribution cap. Topping up could save you up to $${taxSaving.toLocaleString()} in taxes (at 7% marginal rate).`,
      action: `Transfer $${gap.toLocaleString()} to your SRS account before December 31st to maximize tax relief.`,
    });
  }

  // Emergency fund check
  const cashTotal = types['Cash'] || 0;
  const monthsCoverage = cashTotal / 9000;
  if (monthsCoverage > 6) {
    const excess = Math.round(cashTotal - 54000);
    insights.push({
      id: 'ins_3', type: 'positive', priority: 'medium', category: 'Liquidity',
      titleKey: 'insights.cards.ins_emergency.title',
      summaryKey: 'insights.cards.ins_emergency.summary',
      summaryParams: { months: monthsCoverage.toFixed(1), excess: excess.toLocaleString() },
      actionKey: 'insights.cards.ins_emergency.action',
      actionParams: { excess: excess.toLocaleString() },
      title: 'Strong Emergency Fund',
      summary: `Your cash holdings cover ${monthsCoverage.toFixed(1)} months of estimated expenses, exceeding the recommended 6-month buffer by $${excess.toLocaleString()}.`,
      action: `Consider redirecting the excess $${excess.toLocaleString()} into higher-yield instruments like T-bills (3.5%+) or Singapore Savings Bonds.`,
    });
  }

  // Vehicle depreciation
  const vehicle = assets.find(a => a.type === 'Vehicle');
  if (vehicle && vehicle.change < 0) {
    const annualLoss = Math.round(vehicle.value * Math.abs(vehicle.change));
    const pct = (Math.abs(vehicle.change) * 100).toFixed(0);
    insights.push({
      id: 'ins_4', type: 'warning', priority: 'medium', category: 'Planning',
      titleKey: 'insights.cards.ins_vehicle.title',
      summaryKey: 'insights.cards.ins_vehicle.summary',
      summaryParams: { pct, annualLoss: annualLoss.toLocaleString() },
      actionKey: 'insights.cards.ins_vehicle.action',
      actionParams: {},
      title: 'Vehicle Depreciation Impact',
      summary: `Your car is depreciating at ~${pct}% annually, reducing net wealth by ~$${annualLoss.toLocaleString()}/year.`,
      action: 'Factor COE renewal timeline into your financial plan. Consider if replacement vs public transport is more cost-effective long-term.',
    });
  }

  // Geographic diversification
  const stiAsset = assets.find(a => a.name.includes('STI'));
  const spAsset = assets.find(a => a.name.includes('S&P'));
  if (stiAsset && spAsset && stiAsset.change < 0 && spAsset.change > 0) {
    const stiPct = (stiAsset.change * 100).toFixed(1);
    const spPct = (spAsset.change * 100).toFixed(1);
    insights.push({
      id: 'ins_5', type: 'opportunity', priority: 'medium', category: 'Growth',
      titleKey: 'insights.cards.ins_equity.title',
      summaryKey: 'insights.cards.ins_equity.summary',
      summaryParams: { stiPct, spPct },
      actionKey: 'insights.cards.ins_equity.action',
      actionParams: {},
      title: 'Rebalance Equity Allocation',
      summary: `Your Singapore equities (${stiPct}%) have underperformed relative to US equities (+${spPct}%). Consider geographic diversification.`,
      action: 'Review adding a global emerging markets ETF or increasing allocation to outperforming regions to reduce single-market risk.',
    });
  }

  // CPF projection
  const cpfOA = assets.find(a => a.name === 'CPF OA');
  const cpfSA = assets.find(a => a.name === 'CPF SA');
  if (cpfOA && cpfSA) {
    const cpfTotal = cpfOA.value + cpfSA.value;
    insights.push({
      id: 'ins_6', type: 'positive', priority: 'low', category: 'Retirement',
      titleKey: 'insights.cards.ins_cpf.title',
      summaryKey: 'insights.cards.ins_cpf.summary',
      summaryParams: { cpfTotal: cpfTotal.toLocaleString() },
      actionKey: 'insights.cards.ins_cpf.action',
      actionParams: {},
      title: 'CPF Balances On Track',
      summary: `Your combined CPF balance of $${cpfTotal.toLocaleString()} is growing steadily. At current contribution rates, you're projected to meet the Basic Retirement Sum by age 55.`,
      action: 'Continue current contributions. Consider voluntary top-ups to SA for guaranteed 4% returns — one of the best risk-free rates available.',
    });
  }

  // Property concentration warning
  const propertyVal = types['Property'] || 0;
  const propertyPct = (propertyVal / total) * 100;
  if (propertyPct > 50) {
    insights.push({
      id: 'ins_7', type: 'warning', priority: 'low', category: 'Diversification',
      titleKey: 'insights.cards.ins_property.title',
      summaryKey: 'insights.cards.ins_property.summary',
      summaryParams: { propertyPct: propertyPct.toFixed(1) },
      actionKey: 'insights.cards.ins_property.action',
      actionParams: {},
      title: 'High Property Concentration',
      summary: `Property makes up ${propertyPct.toFixed(1)}% of your net worth. While common in Singapore, this creates concentration risk if the property market corrects.`,
      action: 'No immediate action needed, but gradually build up financial assets (equities, bonds) to reduce property concentration over time.',
    });
  }

  return insights;
}

// ──────────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users[email];
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.twoFAEnabled) {
    // Return a temporary token that requires 2FA completion
    const tempToken = generateToken();
    sessions[tempToken] = { userId: user.id, twoFAVerified: false, createdAt: Date.now() };
    return res.json({
      requires2FA: true,
      tempToken,
      message: 'Please enter your authenticator code',
    });
  }

  const token = generateToken();
  sessions[token] = { userId: user.id, twoFAVerified: true, createdAt: Date.now() };

  // Increment login counter and decide whether to prompt rating
  if (!userBehavior[user.id]) userBehavior[user.id] = { deletions: 0, additions: 0, loginCount: 0, lastRatingPromptAt: 0 };
  userBehavior[user.id].loginCount += 1;
  const lc = userBehavior[user.id].loginCount;
  const lastPrompt = userBehavior[user.id].lastRatingPromptAt || 0;
  // Show on first ever login, then every 10 logins since last prompt
  const shouldPromptRating = lc === 1 || (lc - lastPrompt) >= 10;
  if (shouldPromptRating) userBehavior[user.id].lastRatingPromptAt = lc;

  const hasCompletedProfile = !!userProfiles[user.id];
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan }, shouldPromptRating, hasCompletedProfile });
});

app.post('/api/auth/verify-2fa', (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ error: 'Token and code required' });
  }

  const session = sessions[tempToken];
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // In production: verify TOTP code against user's secret using a library like speakeasy
  // For demo: accept any 6-digit code
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code format. Enter 6 digits.' });
  }

  // Upgrade session to fully authenticated
  session.twoFAVerified = true;
  const user = Object.values(users).find(u => u.id === session.userId);

  // Increment login counter for 2FA logins too
  if (!userBehavior[user.id]) userBehavior[user.id] = { deletions: 0, additions: 0, loginCount: 0, lastRatingPromptAt: 0 };
  userBehavior[user.id].loginCount += 1;
  const lc2fa = userBehavior[user.id].loginCount;
  const lastPrompt2fa = userBehavior[user.id].lastRatingPromptAt || 0;
  const shouldPromptRating2fa = lc2fa === 1 || (lc2fa - lastPrompt2fa) >= 10;
  if (shouldPromptRating2fa) userBehavior[user.id].lastRatingPromptAt = lc2fa;

  const hasCompletedProfile2fa = !!userProfiles[user.id];
  res.json({
    token: tempToken,
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    shouldPromptRating: shouldPromptRating2fa,
    hasCompletedProfile: hasCompletedProfile2fa,
  });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete sessions[token];
  res.json({ message: 'Logged out' });
});

// ──────────────────────────────────────────────
// PORTFOLIO ROUTES
// ──────────────────────────────────────────────

app.get('/api/portfolio', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const liquidAssets = portfolio.assets
    .filter(a => !['Property', 'Vehicle'].includes(a.type))
    .reduce((s, a) => s + a.value, 0);

  // Compute allocation breakdown
  const allocation = {};
  portfolio.assets.forEach(a => {
    if (!allocation[a.type]) allocation[a.type] = { name: a.type, value: 0, color: a.color };
    allocation[a.type].value += a.value;
  });

  // Enrich assets with risk classification
  const enrichedAssets = portfolio.assets.map(a => ({
    ...a,
    ...getAssetRisk(a),
  }));

  // Compute weighted portfolio risk score (0-5)
  const weightedRisk = enrichedAssets.reduce((sum, a) => sum + (a.riskScore * a.value), 0) / totalWealth;

  res.json({
    assets: enrichedAssets,
    totalWealth,
    liquidAssets,
    allocation: Object.values(allocation),
    wealthHistory: portfolio.wealthHistory,
    dailyHistory: generateDailyHistory(portfolio.wealthHistory),
    monthlyChange: { amount: 15700, percent: 1.6 },
    portfolioRisk: { score: Math.round(weightedRisk * 10) / 10, label: weightedRisk < 1.5 ? 'Conservative' : weightedRisk < 2.5 ? 'Moderate' : weightedRisk < 3.5 ? 'Growth' : 'Aggressive' },
  });
});

app.post('/api/portfolio/assets', authenticate, (req, res) => {
  const { name, type, institution, value } = req.body;
  if (!name || !type || !value) {
    return res.status(400).json({ error: 'Name, type, and value are required' });
  }

  const portfolio = portfolios[req.userId];
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  const newAsset = {
    id: `a${Date.now()}`,
    name,
    type,
    institution: institution || 'Manual',
    value: parseFloat(value),
    change: 0,
    icon: type === 'Cash' ? 'bank' : type === 'Equities' ? 'trending' : 'shield',
    color: '#0EA5E9',
  };

  portfolio.assets.push(newAsset);
  if (!userBehavior[req.userId]) userBehavior[req.userId] = { deletions: 0, additions: 0, loginCount: 0 };
  userBehavior[req.userId].additions++;
  res.status(201).json(newAsset);
});

app.delete('/api/portfolio/assets/:assetId', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const idx = portfolio.assets.findIndex(a => a.id === req.params.assetId);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' });

  portfolio.assets.splice(idx, 1);
  if (!userBehavior[req.userId]) userBehavior[req.userId] = { deletions: 0, additions: 0, loginCount: 0 };
  userBehavior[req.userId].deletions++;
  res.json({ message: 'Asset deleted' });
});

// ──────────────────────────────────────────────
// WELLNESS & ANALYTICS ROUTES
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// RISK PROFILE ENDPOINTS
// ──────────────────────────────────────────────

app.post('/api/profile/risk', authenticate, (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers array required' });
  }
  const { riskScore, riskProfile } = computeRiskProfile(answers);
  userProfiles[req.userId] = {
    riskProfile,
    riskScore,
    answers,
    completedAt: new Date().toISOString(),
  };
  console.log(`[Profile] ${req.user?.name} scored ${riskScore}/20 → ${riskProfile}`);
  res.json({ riskProfile, riskScore, completedAt: userProfiles[req.userId].completedAt });
});

app.get('/api/profile/risk', authenticate, (req, res) => {
  const profile = userProfiles[req.userId];
  if (!profile) return res.status(404).json({ error: 'No profile found' });
  res.json(profile);
});

app.get('/api/wellness', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const score = computeWellnessScore(portfolio.assets, req.userId);
  res.json(score);
});

app.get('/api/insights', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const insights = generateInsights(portfolio.assets);
  res.json({ insights, generatedAt: new Date().toISOString() });
});

// ──────────────────────────────────────────────
// AI COACH ROUTE (Claude API Integration)
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// LIVE FX RATES (exchangerate.host, base = SGD)
// ──────────────────────────────────────────────

// Fallback rates used on startup or if fetch fails.
// Structure: 1 SGD = N units of each currency.
const FX_RATES_FALLBACK = { SGD: 1, USD: 0.746, MYR: 3.333, GBP: 0.581, EUR: 0.680 };

const fxCache = {
  rates: { ...FX_RATES_FALLBACK },
  lastUpdated: null,
  ttlMs: 60 * 60 * 1000,  // refresh every hour
};

// Helper: fetch with a manual timeout (compatible with all Node versions)
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// Try multiple free, no-key FX APIs in order. Returns normalised { SGD:1, USD:x, ... } or null.
async function tryFetchRates() {
  const supported = Object.keys(FX_RATES_FALLBACK).filter(c => c !== 'SGD');

  // --- Provider 1: open.er-api.com (free, no key, reliable) ---
  try {
    const res = await fetchWithTimeout(`https://open.er-api.com/v6/latest/SGD`);
    if (res.ok) {
      const data = await res.json();
      if (data.result === 'success' && data.rates) {
        const rates = { SGD: 1 };
        for (const code of supported) {
          if (data.rates[code]) rates[code] = data.rates[code];
        }
        console.log('[FX] Fetched from open.er-api.com');
        return rates;
      }
    }
  } catch (e) { console.warn('[FX] open.er-api.com failed:', e.message); }

  // --- Provider 2: frankfurter.app (free, no key, ECB data) ---
  // Note: frankfurter doesn't support SGD as base; fetch USD base and cross-rate via SGD
  try {
    const res = await fetchWithTimeout(`https://api.frankfurter.app/latest?from=SGD&to=${supported.join(',')}`);
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        const rates = { SGD: 1, ...data.rates };
        console.log('[FX] Fetched from frankfurter.app');
        return rates;
      }
    }
  } catch (e) { console.warn('[FX] frankfurter.app failed:', e.message); }

  return null; // all providers failed
}

async function fetchLiveFxRates() {
  const result = await tryFetchRates();
  if (result) {
    // Only update currencies we actually support — don't replace missing ones
    const updated = { SGD: 1 };
    for (const code of Object.keys(FX_RATES_FALLBACK)) {
      if (code === 'SGD') continue;
      updated[code] = result[code] ?? fxCache.rates[code] ?? FX_RATES_FALLBACK[code];
    }
    fxCache.rates = updated;
    fxCache.lastUpdated = new Date().toISOString();
    console.log(`[FX] Cache updated at ${fxCache.lastUpdated}:`, updated);
  } else {
    console.warn('[FX] All providers failed — keeping existing cache/fallback rates');
    // Keep last good cache; only use hardcoded fallback if we have never succeeded
    if (!fxCache.lastUpdated) fxCache.rates = { ...FX_RATES_FALLBACK };
  }
}

// Fetch on startup, then refresh hourly
fetchLiveFxRates();
setInterval(fetchLiveFxRates, fxCache.ttlMs);

// Expose live rates to authenticated clients
app.get('/api/fx-rates', authenticate, (req, res) => {
  res.json({
    base: 'SGD',
    rates: fxCache.rates,        // { SGD:1, USD:0.746, MYR:3.333, ... }
    lastUpdated: fxCache.lastUpdated,
    isLive: !!fxCache.lastUpdated,
  });
});

// ──────────────────────────────────────────────
// Store conversation history per user session for multi-turn context
const chatHistories = {};

app.post('/api/ai/chat', authenticate, async (req, res) => {
  const { message, displayCurrency, fxRate } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  // Currency helpers — use server-side live rates, not client-supplied value.
  // Client still sends displayCurrency for currency-switch detection; fxRate is ignored here.
  const activeCurrency = displayCurrency || 'SGD';
  // fxCache.rates[activeCurrency] = how many units of activeCurrency equal 1 SGD
  const rate = fxCache.rates[activeCurrency] ?? FX_RATES_FALLBACK[activeCurrency] ?? 1;
  const isNonSGD = activeCurrency !== 'SGD';

  // Convert a SGD value to the user's display currency using live rates
  const toDisplay = (sgdValue) => Math.round(sgdValue * rate);
  // Currency symbol map (mirrors client-side CURRENCIES)
  const CURRENCY_SYMBOLS = { SGD: 'S$', USD: 'US$', MYR: 'RM', GBP: '£', EUR: '€' };
  const sym = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;
  // Format: symbol + number + code, e.g. "RM 3,252,333 MYR" — double-labelled so LLM never drops the unit
  const fmt = (sgdValue) => `${sym}${toDisplay(sgdValue).toLocaleString()} ${activeCurrency}`;

  // Build portfolio context for the LLM
  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const liquidAssets = portfolio.assets
    .filter(a => !['Property', 'Vehicle'].includes(a.type))
    .reduce((s, a) => s + a.value, 0);
  const types = {};
  portfolio.assets.forEach(a => { types[a.type] = (types[a.type] || 0) + a.value; });
  const wellnessScore = computeWellnessScore(portfolio.assets, req.userId);
  const insights = generateInsights(portfolio.assets);

  const portfolioContext = `
USER PORTFOLIO SUMMARY (as of ${new Date().toISOString().split('T')[0]}):
- Total Net Worth: ${fmt(totalWealth)}${isNonSGD ? ` (${totalWealth.toLocaleString()} SGD at 1 ${activeCurrency} = ${(1/rate).toFixed(4)} SGD)` : ''}
- Liquid Assets (excl. property & vehicle): ${fmt(liquidAssets)}
- Wellness Score: ${wellnessScore.overall}/100

ASSET BREAKDOWN BY TYPE:
${Object.entries(types).map(([type, val]) => `- ${type}: ${fmt(val)} (${((val/totalWealth)*100).toFixed(1)}%)`).join('\n')}

INDIVIDUAL ASSETS:
${portfolio.assets.map(a => `- ${a.name} (${a.type}, ${a.institution}): ${fmt(a.value)} [${a.change >= 0 ? '+' : ''}${(a.change*100).toFixed(1)}% change]`).join('\n')}

WELLNESS METRICS:
${wellnessScore.metrics.map(m => `- ${m.metric}: ${m.score}/100`).join('\n')}

KEY INSIGHTS DETECTED:
${insights.map(i => `- [${i.type.toUpperCase()}] ${i.title}: ${i.summary}`).join('\n')}

SINGAPORE-SPECIFIC CONTEXT:
- CPF OA interest rate: 2.5% p.a., CPF SA: 4% p.a.
- SRS annual contribution cap: ${fmt(15300)}
- Estimated monthly expenses: ${fmt(9000)}
- Emergency fund recommendation: 6 months of expenses (${fmt(54000)})
`;

  const systemPrompt = `You are WealthWell AI Coach, a friendly and knowledgeable personal financial advisor built into a wealth management app for Singapore residents.

ROLE & PERSONALITY:
- You are warm, encouraging, and educational — like a knowledgeable friend who happens to be great with money
- You explain financial concepts in plain English without jargon
- You always reference the user's ACTUAL portfolio data (provided below) — never make up numbers
- You give specific, actionable advice tailored to their situation
- You are aware of Singapore-specific financial products: CPF (OA/SA/MA), SRS, HDB, COE, SSBs, T-bills, STI ETF
- You keep responses concise (2-4 paragraphs max) unless the user asks for detail
- CURRENCY RULE (non-negotiable): The user's display currency is ${activeCurrency}. You MUST label every single monetary figure with the currency code ${activeCurrency}. Always write amounts as "${sym}<number> ${activeCurrency}" (e.g. "${sym}975,700 ${activeCurrency}"). Never omit the currency label, never use a different currency.${isNonSGD ? `\n- Exchange rate used: 1 SGD = ${rate.toFixed(4)} ${activeCurrency} (indicative)` : ''}

IMPORTANT GUIDELINES:
- Always base your answers on the real portfolio data below (already converted to ${activeCurrency})
- If asked about something outside your knowledge, say so honestly
- Never recommend specific stock picks or guarantee returns
- Remind users that this is educational guidance, not licensed financial advice, if they ask about making big financial decisions
- Be proactive — if you notice something concerning in their portfolio, mention it even if they didn't ask

${portfolioContext}`;

  // Initialize or retrieve chat history for this user
  if (!chatHistories[req.userId]) {
    chatHistories[req.userId] = { messages: [], currency: activeCurrency };
  }

  // If the user switched currency, wipe the old history — stale SGD numbers
  // in the conversation would override the system prompt and confuse the LLM
  if (chatHistories[req.userId].currency !== activeCurrency) {
    chatHistories[req.userId] = { messages: [], currency: activeCurrency };
  }

  // Wrap the user message with a hard currency reminder on every turn.
  // Llama 3.3 tends to anchor to numbers it has already said; repeating the
  // instruction in the human turn reliably overrides that behaviour.
  // Always inject a reminder — even for SGD, ensures the LLM labels every number
  const wrappedMessage = `[CURRENCY REMINDER: Label every monetary figure as "${sym}<amount> ${activeCurrency}".]\n\n${message}`;

  chatHistories[req.userId].messages.push({ role: 'user', content: wrappedMessage });

  // Keep only last 20 messages to manage token usage
  if (chatHistories[req.userId].messages.length > 20) {
    chatHistories[req.userId].messages = chatHistories[req.userId].messages.slice(-20);
  }

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      // Fallback to keyword-based responses if no API key is set
      const reply = getFallbackReply(message, portfolio, totalWealth, types);
      return res.json({ reply, timestamp: new Date().toISOString(), source: 'fallback' });
    }

    // Groq uses OpenAI-compatible API format
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistories[req.userId].messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      // Fallback on API error
      const reply = getFallbackReply(message, portfolio, totalWealth, types);
      return res.json({ reply, timestamp: new Date().toISOString(), source: 'fallback' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Store assistant reply in history for multi-turn conversation
    chatHistories[req.userId].messages.push({ role: 'assistant', content: reply });

    res.json({ reply, timestamp: new Date().toISOString(), source: 'claude' });

  } catch (err) {
    console.error('AI Coach error:', err.message);
    // Fallback on network/other errors
    const reply = getFallbackReply(message, portfolio, totalWealth, types);
    res.json({ reply, timestamp: new Date().toISOString(), source: 'fallback' });
  }
});

// Fallback keyword-based responses (used when no API key or API fails)
function getFallbackReply(message, portfolio, totalWealth, types) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('saving') || lowerMsg.includes('enough')) {
    const cashPct = ((types['Cash'] || 0) / totalWealth * 100).toFixed(1);
    return `Your cash savings represent ${cashPct}% of your net worth ($${(types['Cash'] || 0).toLocaleString()}), covering about ${((types['Cash'] || 0) / 9000).toFixed(1)} months of estimated expenses. The general recommendation is 6 months — you're in good shape! However, consider if some excess cash could earn higher returns in T-bills or money market funds.`;
  } else if (lowerMsg.includes('tax') || lowerMsg.includes('srs')) {
    const srs = portfolio.assets.find(a => a.name.includes('SRS'));
    const gap = srs ? 15300 - srs.value : 15300;
    return `Great question! The most immediate tax optimization is topping up your SRS account. You're $${gap.toLocaleString()} below the annual cap. At a 7% marginal tax rate, that's about $${Math.round(gap * 0.07).toLocaleString()} in tax savings.`;
  } else if (lowerMsg.includes('risk') || lowerMsg.includes('risky')) {
    const equityPct = (((types['Equities'] || 0) + (types['Crypto'] || 0)) / totalWealth * 100).toFixed(1);
    return `Your growth-oriented assets (equities + crypto) make up ${equityPct}% of your net worth. Your main risk is concentration — property alone is ${((types['Property'] || 0) / totalWealth * 100).toFixed(1)}% of your wealth.`;
  } else if (lowerMsg.includes('cpf') || lowerMsg.includes('retire')) {
    const cpfTotal = portfolio.assets.filter(a => a.institution === 'CPF Board').reduce((s, a) => s + a.value, 0);
    return `Your CPF balances total $${cpfTotal.toLocaleString()}. OA earns 2.5% and SA earns 4% — both risk-free. Consider voluntary SA top-ups for guaranteed 4% returns and tax relief.`;
  } else {
    return `Based on your portfolio of $${totalWealth.toLocaleString()} across ${portfolio.assets.length} assets: your emergency fund is solid, growth assets are performing well, but there are opportunities in tax optimization (SRS top-ups) and reducing property concentration. What would you like to dive deeper into?`;
  }
}

// ──────────────────────────────────────────────
// SCENARIO SIMULATOR ROUTE
// ──────────────────────────────────────────────

app.post('/api/scenarios/simulate', authenticate, (req, res) => {
  const { equityChange, cryptoChange, propertyChange, cashChange } = req.body;
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const assetTypeMultipliers = {
    'Equities': equityChange || 0,
    'REITs': (equityChange || 0) * 0.5,
    'Crypto': cryptoChange || 0,
    'Property': propertyChange || 0,
    'Cash': cashChange || 0,
    'Retirement': (cashChange || 0) * 0.5,
    'Fixed Income': cashChange || 0,
    'Vehicle': 0,
  };

  const currentTotal = portfolio.assets.reduce((s, a) => s + a.value, 0);
  let projectedTotal = 0;

  const breakdown = [];
  const typeAgg = {};

  portfolio.assets.forEach(a => {
    const mult = assetTypeMultipliers[a.type] || 0;
    const newVal = a.value * (1 + mult);
    projectedTotal += newVal;

    if (!typeAgg[a.type]) typeAgg[a.type] = { name: a.type, currentValue: 0, projectedValue: 0, color: a.color };
    typeAgg[a.type].currentValue += a.value;
    typeAgg[a.type].projectedValue += newVal;
  });

  Object.values(typeAgg).forEach(t => {
    t.change = t.projectedValue - t.currentValue;
    breakdown.push(t);
  });

  res.json({
    currentTotal,
    projectedTotal,
    change: projectedTotal - currentTotal,
    changePercent: ((projectedTotal - currentTotal) / currentTotal) * 100,
    breakdown,
  });
});

// ──────────────────────────────────────────────
// STRIPE PAYMENT ROUTES (mock for demo)
// ──────────────────────────────────────────────

app.post('/api/payments/create-checkout', authenticate, (req, res) => {
  const { plan } = req.body; // 'pro' or 'family'

  // In production: use Stripe SDK
  // const session = await stripe.checkout.sessions.create({...})

  const prices = { pro: 990, family: 1990 }; // cents
  const priceAmount = prices[plan];

  if (!priceAmount) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // Mock Stripe checkout session
  res.json({
    checkoutUrl: `https://checkout.stripe.com/mock/${plan}?amount=${priceAmount}`,
    sessionId: `cs_mock_${Date.now()}`,
    plan,
    amount: priceAmount / 100,
    currency: 'SGD',
    message: 'In production, this would redirect to Stripe Checkout',
  });
});

app.get('/api/payments/subscription', authenticate, (req, res) => {
  res.json({
    plan: req.user.plan,
    status: 'active',
    currentPeriodEnd: '2026-04-04',
    cancelAtPeriodEnd: false,
  });
});

// ──────────────────────────────────────────────
// USER PROFILE ROUTES
// ──────────────────────────────────────────────

app.get('/api/user/profile', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    plan: req.user.plan,
    twoFAEnabled: req.user.twoFAEnabled,
    createdAt: req.user.createdAt,
  });
});

app.put('/api/user/profile', authenticate, (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  
  if (name) req.user.name = name;
  if (email) {
    const oldEmail = req.user.email;
    req.user.email = email;
    if (oldEmail !== email) {
      users[email] = req.user;
      delete users[oldEmail];
    }
  }
  if (newPassword) {
    if (!currentPassword || req.user.passwordHash !== hashPassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    req.user.passwordHash = hashPassword(newPassword);
  }
  
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, plan: req.user.plan });
});

// ──────────────────────────────────────────────
// GOALS ROUTES
// ──────────────────────────────────────────────

const goals = {
  'usr_001': [
    {
      id: 'goal_1',
      titleKey: 'goal_emergency_fund',
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses',
      targetAmount: 54000,
      currentAmount: 73000,
      deadline: '2026-06-30',
      category: 'safety',
      createdAt: '2025-01-15',
    },
    {
      id: 'goal_2',
      titleKey: 'goal_max_srs',
      title: 'Max Out SRS',
      description: 'Contribute full $15,300 to SRS for tax savings',
      targetAmount: 15300,
      currentAmount: 15000,
      deadline: '2026-12-31',
      category: 'tax',
      createdAt: '2025-02-01',
    },
    {
      id: 'goal_3',
      titleKey: 'goal_investment_200k',
      title: 'Investment Portfolio $200K',
      description: 'Grow liquid investments to $200K',
      targetAmount: 200000,
      currentAmount: 130000,
      deadline: '2027-12-31',
      category: 'growth',
      createdAt: '2025-03-01',
    },
  ]
};

app.get('/api/goals', authenticate, (req, res) => {
  const userGoals = goals[req.userId] || [];
  // Enrich goals with computed progress
  const enriched = userGoals.map(g => ({
    ...g,
    progress: Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)),
    remaining: Math.max(0, g.targetAmount - g.currentAmount),
    daysLeft: Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))),
    isComplete: g.currentAmount >= g.targetAmount,
  }));
  res.json({ goals: enriched });
});

app.post('/api/goals', authenticate, (req, res) => {
  const { title, description, targetAmount, deadline, category } = req.body;
  if (!title || !targetAmount) {
    return res.status(400).json({ error: 'Title and target amount are required' });
  }
  if (!goals[req.userId]) goals[req.userId] = [];

  const newGoal = {
    id: `goal_${Date.now()}`,
    title,
    description: description || '',
    targetAmount: parseFloat(targetAmount),
    currentAmount: 0,
    deadline: deadline || null,
    category: category || 'general',
    createdAt: new Date().toISOString().split('T')[0],
  };
  goals[req.userId].push(newGoal);
  res.status(201).json(newGoal);
});

app.put('/api/goals/:goalId', authenticate, (req, res) => {
  const userGoals = goals[req.userId] || [];
  const goal = userGoals.find(g => g.id === req.params.goalId);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const { title, description, targetAmount, currentAmount, deadline, category } = req.body;
  if (title !== undefined) goal.title = title;
  if (description !== undefined) goal.description = description;
  if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount);
  if (currentAmount !== undefined) goal.currentAmount = parseFloat(currentAmount);
  if (deadline !== undefined) goal.deadline = deadline;
  if (category !== undefined) goal.category = category;

  res.json(goal);
});

app.delete('/api/goals/:goalId', authenticate, (req, res) => {
  if (!goals[req.userId]) return res.status(404).json({ error: 'Goal not found' });
  const idx = goals[req.userId].findIndex(g => g.id === req.params.goalId);
  if (idx === -1) return res.status(404).json({ error: 'Goal not found' });
  goals[req.userId].splice(idx, 1);
  res.json({ message: 'Goal deleted' });
});

// ──────────────────────────────────────────────
// EXPORT ROUTES
// ──────────────────────────────────────────────

app.get('/api/export/csv', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const headers = ['Name', 'Type', 'Institution', 'Value (SGD)', 'Change (%)', 'Last Updated'];
  const rows = portfolio.assets.map(a =>
    [a.name, a.type, a.institution, a.value, (a.change * 100).toFixed(2), new Date().toISOString().split('T')[0]]
      .map(v => `"${v}"`)
      .join(',')
  );

  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const wellnessScore = computeWellnessScore(portfolio.assets, req.userId);

  // Add summary rows
  rows.push('');
  rows.push(`"SUMMARY","","","","",""`)
  rows.push(`"Total Net Worth","","","${totalWealth}","",""`)
  rows.push(`"Wellness Score","","","${wellnessScore.overall}/100","",""`)
  wellnessScore.metrics.forEach(m => {
    rows.push(`"  ${m.metric}","","","${m.score}/100","",""`);
  });

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="wealthwell-report-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

app.get('/api/export/json', authenticate, (req, res) => {
  const portfolio = portfolios[req.userId];
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const liquidAssets = portfolio.assets
    .filter(a => !['Property', 'Vehicle'].includes(a.type))
    .reduce((s, a) => s + a.value, 0);
  const wellnessScore = computeWellnessScore(portfolio.assets, req.userId);
  const insightsData = generateInsights(portfolio.assets);
  const userGoals = (goals[req.userId] || []).map(g => ({
    ...g,
    progress: Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)),
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    user: { name: req.user.name, email: req.user.email, plan: req.user.plan },
    summary: { totalWealth, liquidAssets, assetCount: portfolio.assets.length },
    wellness: wellnessScore,
    assets: portfolio.assets,
    insights: insightsData,
    goals: userGoals,
    wealthHistory: portfolio.wealthHistory,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="wealthwell-report-${new Date().toISOString().split('T')[0]}.json"`);
  res.json(report);
});

// ──────────────────────────────────────────────
// EMAIL PREFERENCES ROUTES
// ──────────────────────────────────────────────

const emailPreferences = {
  'usr_001': {
    reportFrequency: 'monthly', // 'monthly', 'yearly', 'off'
    email: 'sarah@wealthwell.com',
    lastSent: '2026-02-01',
    nextScheduled: '2026-03-01',
  }
};

app.get('/api/email-preferences', authenticate, (req, res) => {
  const prefs = emailPreferences[req.userId] || {
    reportFrequency: 'off',
    email: req.user.email,
    lastSent: null,
    nextScheduled: null,
  };
  res.json(prefs);
});

app.put('/api/email-preferences', authenticate, (req, res) => {
  const { reportFrequency, email } = req.body;
  if (!emailPreferences[req.userId]) {
    emailPreferences[req.userId] = { reportFrequency: 'off', email: req.user.email, lastSent: null, nextScheduled: null };
  }
  const prefs = emailPreferences[req.userId];
  if (reportFrequency !== undefined) {
    prefs.reportFrequency = reportFrequency;
    // Compute next scheduled date
    if (reportFrequency === 'monthly') {
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      prefs.nextScheduled = next.toISOString().split('T')[0];
    } else if (reportFrequency === 'yearly') {
      const next = new Date();
      next.setFullYear(next.getFullYear() + 1);
      next.setMonth(0);
      next.setDate(1);
      prefs.nextScheduled = next.toISOString().split('T')[0];
    } else {
      prefs.nextScheduled = null;
    }
  }
  if (email !== undefined) prefs.email = email;
  res.json(prefs);
});

app.post('/api/email-preferences/send-now', authenticate, async (req, res) => {
  const prefs = emailPreferences[req.userId] || { email: req.user.email };
  const recipientEmail = req.body.email || prefs.email;

  // Pick the language the user had active when they clicked Send — fall back to 'en'
  const lang = (req.body.lang && EMAIL_TR[req.body.lang]) ? req.body.lang : 'en';
  const tr = EMAIL_TR[lang];

  const portfolio = portfolios[req.userId];
  const totalWealth = portfolio.assets.reduce((s, a) => s + a.value, 0);
  const wellnessScore = computeWellnessScore(portfolio.assets, req.userId);
  const insightsData = generateInsights(portfolio.assets);

  // Build asset allocation summary — type names and risk levels use the translation table
  const types = {};
  portfolio.assets.forEach(a => { types[a.type] = (types[a.type] || 0) + a.value; });
  const allocationRows = Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .map(([type, value]) => {
      const pct = ((value / totalWealth) * 100).toFixed(1);
      const risk = RISK_DATABASE._typeDefaults[type] || {};
      const translatedType = tr.assetTypes[type] || type;
      const translatedRisk = (risk.riskLevel && tr.riskLevel[risk.riskLevel]) ? tr.riskLevel[risk.riskLevel] : (risk.riskLevel || 'N/A');
      return `<tr><td style="padding:10px 16px;border-bottom:1px solid #1E293B;color:#F1F5F9">${translatedType}</td><td style="padding:10px 16px;border-bottom:1px solid #1E293B;color:#F1F5F9;text-align:right">$${value.toLocaleString()}</td><td style="padding:10px 16px;border-bottom:1px solid #1E293B;color:#94A3B8;text-align:right">${pct}%</td><td style="padding:10px 16px;border-bottom:1px solid #1E293B"><span style="color:${risk.color || '#94A3B8'};font-weight:600">${translatedRisk}</span></td></tr>`;
    }).join('');

  // Build insights section — resolve title/summary from EMAIL_TR using titleKey + summaryParams
  const insightRows = insightsData.slice(0, 5).map(i => {
    const icon  = i.type === 'warning' ? '⚠️' : i.type === 'opportunity' ? '💡' : '✅';
    const color = i.type === 'warning' ? '#F59E0B' : i.type === 'opportunity' ? '#0EA5E9' : '#10B981';
    // Derive the insightCards key from titleKey (e.g. 'insights.cards.ins_crypto.title' → 'ins_crypto')
    const cardKey = i.titleKey ? i.titleKey.split('.')[2] : null;
    const card    = cardKey && tr.insightCards ? tr.insightCards[cardKey] : null;
    const title   = card ? card.title : i.title;
    // Interpolate summaryParams into the translated summary template using {param} tokens
    let summary = card ? card.summary : i.summary;
    if (card && i.summaryParams) {
      Object.entries(i.summaryParams).forEach(([k, v]) => {
        summary = summary.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return `<div style="padding:14px 16px;border-left:3px solid ${color};background:#1A2332;border-radius:0 8px 8px 0;margin-bottom:8px"><div style="font-weight:600;color:#F1F5F9;margin-bottom:4px">${icon} ${title}</div><div style="font-size:13px;color:#94A3B8;line-height:1.5">${summary}</div></div>`;
  }).join('');

  // Wellness metrics — metric names translated via tr.metrics
  const metricsRows = wellnessScore.metrics.map(m => {
    const color = m.score >= 75 ? '#10B981' : m.score >= 50 ? '#F59E0B' : '#EF4444';
    const label = tr.metrics[m.metric] || m.metric;
    return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#F1F5F9;font-size:13px">${label}</span><span style="color:${color};font-weight:700;font-size:13px">${m.score}/100</span></div><div style="width:100%;height:6px;border-radius:3px;background:#243044"><div style="width:${m.score}%;height:100%;border-radius:3px;background:${color}"></div></div></div>`;
  }).join('');

  const scoreColor = wellnessScore.overall >= 75 ? '#10B981' : wellnessScore.overall >= 50 ? '#F59E0B' : '#EF4444';
  const scoreLabel = wellnessScore.overall >= 75 ? tr.excellent : wellnessScore.overall >= 50 ? tr.good : tr.needsAttention;
  const reportDate = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-SG', { year: 'numeric', month: 'long', day: 'numeric' });
  const emailSubject = tr.subject.replace('{date}', reportDate);

  const htmlEmail = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0B1120;font-family:'Segoe UI',Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:20px">
  <!-- Header -->
  <div style="text-align:center;padding:32px 20px;background:linear-gradient(135deg,rgba(14,165,233,0.15),rgba(99,102,241,0.15));border-radius:16px 16px 0 0">
    <div style="display:inline-block;width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#0EA5E9,#6366F1);line-height:44px;text-align:center;font-size:22px;color:white;font-weight:700">W</div>
    <h1 style="color:#F1F5F9;font-size:22px;margin:12px 0 4px;font-weight:700">${tr.reportTitle}</h1>
    <p style="color:#94A3B8;font-size:14px;margin:0">${reportDate}</p>
  </div>

  <!-- Net Worth Summary -->
  <div style="background:#111827;padding:28px 24px;border-left:1px solid rgba(148,163,184,0.1);border-right:1px solid rgba(148,163,184,0.1)">
    <div style="display:flex;text-align:center">
      <div style="flex:1">
        <div style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${tr.totalNetWorth}</div>
        <div style="color:#F1F5F9;font-size:28px;font-weight:700">$${totalWealth.toLocaleString()}</div>
        <div style="color:#10B981;font-size:13px;margin-top:4px">${tr.monthlyChange}</div>
      </div>
      <div style="width:1px;background:rgba(148,163,184,0.15);margin:0 20px"></div>
      <div style="flex:1">
        <div style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${tr.wellnessScore}</div>
        <div style="color:${scoreColor};font-size:28px;font-weight:700">${wellnessScore.overall}/100</div>
        <div style="color:#94A3B8;font-size:13px;margin-top:4px">${scoreLabel}</div>
      </div>
    </div>
  </div>

  <!-- Wellness Metrics -->
  <div style="background:#111827;padding:24px;border-left:1px solid rgba(148,163,184,0.1);border-right:1px solid rgba(148,163,184,0.1)">
    <h2 style="color:#F1F5F9;font-size:16px;font-weight:600;margin:0 0 16px">${tr.wellnessBreakdown}</h2>
    ${metricsRows}
  </div>

  <!-- Asset Allocation -->
  <div style="background:#111827;padding:24px;border-left:1px solid rgba(148,163,184,0.1);border-right:1px solid rgba(148,163,184,0.1)">
    <h2 style="color:#F1F5F9;font-size:16px;font-weight:600;margin:0 0 16px">${tr.assetAllocation}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:2px solid #243044">
        <th style="padding:8px 16px;text-align:left;color:#64748B;font-weight:500">${tr.colType}</th>
        <th style="padding:8px 16px;text-align:right;color:#64748B;font-weight:500">${tr.colValue}</th>
        <th style="padding:8px 16px;text-align:right;color:#64748B;font-weight:500">${tr.colWeight}</th>
        <th style="padding:8px 16px;text-align:left;color:#64748B;font-weight:500">${tr.colRisk}</th>
      </tr></thead>
      <tbody>${allocationRows}</tbody>
    </table>
  </div>

  <!-- Insights -->
  <div style="background:#111827;padding:24px;border-left:1px solid rgba(148,163,184,0.1);border-right:1px solid rgba(148,163,184,0.1)">
    <h2 style="color:#F1F5F9;font-size:16px;font-weight:600;margin:0 0 16px">${tr.keyInsights}</h2>
    ${insightRows}
  </div>

  <!-- Footer -->
  <div style="background:#111827;padding:24px;text-align:center;border-radius:0 0 16px 16px;border:1px solid rgba(148,163,184,0.1);border-top:none">
    <p style="color:#64748B;font-size:12px;margin:0">${tr.disclaimer}</p>
    <p style="color:#64748B;font-size:12px;margin:8px 0 0">© ${new Date().getFullYear()} WealthWell · <a href="#" style="color:#0EA5E9">Manage Preferences</a></p>
  </div>
</div></body></html>`;

  // Send email
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  if (!smtpUser || !smtpPass) {
    // No SMTP configured — log the email and return success for demo
    console.log(`\n📧 EMAIL REPORT (no SMTP configured — showing preview)`);
    console.log(`   To: ${recipientEmail}`);
    console.log(`   Subject: ${emailSubject}`);
    console.log(`   Lang: ${lang} | Net Worth: $${totalWealth.toLocaleString()}, Wellness: ${wellnessScore.overall}/100\n`);

    if (emailPreferences[req.userId]) {
      emailPreferences[req.userId].lastSent = new Date().toISOString().split('T')[0];
    }
    return res.json({
      success: true,
      sentAt: new Date().toISOString(),
    });
  }

  try {
    const transporter = createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"WealthWell" <${smtpUser}>`,
      to: recipientEmail,
      subject: emailSubject,
      html: htmlEmail,
    });

    console.log(`📧 Report sent to ${recipientEmail} (${lang})`);

    if (emailPreferences[req.userId]) {
      emailPreferences[req.userId].lastSent = new Date().toISOString().split('T')[0];
    }

    res.json({
      success: true,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ error: `Failed to send email: ${err.message}` });
  }
});

// ──────────────────────────────────────────────
// FEEDBACK ROUTE
// ──────────────────────────────────────────────

const feedbackStore = [];

app.post('/api/feedback', authenticate, (req, res) => {
  const { category, subject, message, urgency } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const feedback = {
    id: `fb_${Date.now()}`,
    userId: req.userId,
    userName: req.user.name,
    userEmail: req.user.email,
    category: category || 'general',
    subject: subject || 'User Feedback',
    message,
    urgency: urgency || 'normal',
    createdAt: new Date().toISOString(),
  };
  feedbackStore.push(feedback);
  console.log(`📝 Feedback [${category}] from ${req.user.name}: ${message.substring(0, 80)}`);
  res.json({ success: true, message: 'Feedback submitted. Thank you!', id: feedback.id });
});

// ──────────────────────────────────────────────
// RATING ROUTE
// ──────────────────────────────────────────────

app.post('/api/rating', authenticate, (req, res) => {
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) return res.status(400).json({ error: 'Rating must be 1-5 stars' });
  console.log(`⭐ Rating from ${req.user.name}: ${stars}/5 ${comment ? '— ' + comment : ''}`);
  res.json({ success: true, message: 'Thank you for your rating!' });
});

app.post('/api/rating/dismiss', authenticate, (req, res) => {
  // User dismissed — reset prompt window from current login so next prompt is in 10 more logins
  if (userBehavior[req.userId]) {
    userBehavior[req.userId].lastRatingPromptAt = userBehavior[req.userId].loginCount;
  }
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ──────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname_patch, '..', 'dist');
  app.use(express.static(distPath));

  // Catch-all: serve index.html for any route not matched by the API
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
app.listen(PORT, () => {
  console.log(`\n  🟢 WealthWell API server running on http://localhost:${PORT}`);
  console.log(`  📋 Endpoints:`);
  console.log(`     POST /api/auth/login`);
  console.log(`     POST /api/auth/verify-2fa`);
  console.log(`     GET  /api/portfolio`);
  console.log(`     GET  /api/wellness`);
  console.log(`     GET  /api/insights`);
  console.log(`     POST /api/ai/chat`);
  console.log(`     POST /api/scenarios/simulate`);
  console.log(`     POST /api/payments/create-checkout`);
  console.log(`\n  Demo login: sarah@wealthwell.com / demo1234\n`);
});

