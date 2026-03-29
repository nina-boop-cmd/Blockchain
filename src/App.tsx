/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft,
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  FileText, 
  Users, 
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
  FilePlus,
  History,
  Bell,
  Settings,
  Star,
  GitCompare,
  ExternalLink,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  UserPlus,
  X,
  Plus,
  Save,
  Coins,
  Cpu,
  SearchCheck,
  FileSearch,
  Fingerprint
} from "lucide-react";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend 
} from "recharts";

type Page = "home" | "form" | "register" | "waiting" | "partners" | "dashboard" | "login" | "proposals" | "comparison" | "portfolio" | "proposal-detail" | "favorites" | "platform-values" | "security-services" | "authorizations" | "proposal-confirmation" | "workflow";

interface UserAccount {
  email: string;
  name: string;
  password: string;
}

interface Authorization {
  id: string;
  brokerName: string;
  scope: string[];
  startTime: string;
  expiryTime: string;
  status: "valid" | "revoked" | "expired";
}

interface ConsentRecord {
  id: string;
  eventType: string;
  timestamp: string;
  hash: string;
  verificationStatus: string;
}

interface ProposalVersion {
  id: string;
  proposalName: string;
  version: string;
  updateTime: string;
  summary: string;
  brokerName: string;
  userStatus: "viewed" | "pending" | "agreed";
}

interface TransactionRecord {
  id: string;
  timestamp: string;
  brokerName: string;
  proposalName: string;
  assetName: string;
  assetType: string;
  action: "buy" | "sell" | "rebalance" | "income";
  quantity: string;
  price: string;
  amount: string;
  holdingStatus: string;
  status: "completed" | "processing" | "cancelled";
  hash: string;
}

interface IncomeRecord {
  id: string;
  date: string;
  source: string;
  type: string;
  amount: string;
  status: "credited" | "pending";
  proposalName: string;
  hash: string;
}

interface ContractExecution {
  id: string;
  contractName: string;
  event: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  hash: string;
  contractId: string;
}

interface SigningRecord {
  id: string;
  timestamp: string;
  proposalName: string;
  version: string;
  purpose: string;
  credentialId: string;
  signatureHash: string;
  status: "verified" | "pending";
}

interface PortfolioProposal {
  id: string;
  brokerName: string;
  proposalName: string;
  version: string;
  signingTime: string;
  status: "executing" | "completed" | "terminated";
  performanceStatus: "up" | "down" | "flat";
  returnSummary: string;
  lastUpdated: string;
  latestNAV: string;
  cumulativeReturn: string;
  periodChange: string;
  lastTransactionTime: string;
  lastAction: "buy" | "sell" | "rebalance" | "income";
  assetAllocationSummary: string;
}

interface Proposal {
  id: string;
  brokerName: string;
  brokerIntro: string;
  proposalName: string;
  investmentGoal: string;
  targetAudience: string;
  riskLevel: string;
  duration: string;
  assetAllocation: string;
  assetAllocationData: { name: string; value: number }[];
  productType: string;
  incomeMode: string;
  liquidityLockup: string;
  feeSummary: string;
  minInvestment: string;
  liquidity: string;
  riskDisclosure: string;
  versionHistory: string;
  lastUpdated: string;
  createdAt: string;
  blockchainHash: string;
  fullStrategy: string;
  verifiedVersion: string;
}

interface RegistrationData {
  basic: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    region: string;
    isAdult: boolean;
    agreedToTerms: boolean;
  };
  audit: {
    isNotRobot: boolean;
    idName: string;
    birthday: string;
    idPhoto: string | null;
    address: string;
    jobCategory: string;
    industry: string;
    company: string;
    hasExp: boolean;
    expYears: string;
    products: string[];
  };
  credit: {
    annualIncome: string;
    investableAssets: string;
    monthlyInvestment: string;
    sourceOfFunds: string[];
    purpose: string[];
    declarationAgreed: boolean;
    auditAgreed: boolean;
    certificateAgreed: boolean;
  };
}

const initialRegistrationData: RegistrationData = {
  basic: {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    region: "",
    isAdult: false,
    agreedToTerms: false,
  },
  audit: {
    isNotRobot: false,
    idName: "",
    birthday: "",
    idPhoto: null,
    address: "",
    jobCategory: "",
    industry: "",
    company: "",
    hasExp: false,
    expYears: "",
    products: [],
  },
  credit: {
    annualIncome: "",
    investableAssets: "",
    monthlyInvestment: "",
    sourceOfFunds: [],
    purpose: [],
    declarationAgreed: false,
    auditAgreed: false,
    certificateAgreed: false,
  },
};

interface InvestmentFormData {
  amountRange: string;
  duration: string;
  riskLevel: string;
  maxLoss: string;
  liquidity: string;
  products: string[];
  periodic: boolean;
  excludedIndustries: string[];
  specialGoals: string;
  agreedToTerms: boolean;
}

const initialFormData: InvestmentFormData = {
  amountRange: "",
  duration: "",
  riskLevel: "",
  maxLoss: "",
  liquidity: "",
  products: [],
  periodic: false,
  excludedIndustries: [],
  specialGoals: "",
  agreedToTerms: false,
};

function ProposalConfirmationPage({ proposal, onBack, onConfirm }: { proposal: Proposal; onBack: () => void; onConfirm: () => void }) {
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signingTime, setSigningTime] = useState<string | null>(null);
  const [disclosures, setDisclosures] = useState({
    readRisk: false,
    noAdvice: false,
    brokerExecution: false,
    proposalOnly: false
  });

  const allChecked = Object.values(disclosures).every(v => v);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSign = () => {
    if (!allChecked) return;
    setIsSigning(true);
    // Simulate blockchain signing
    setTimeout(() => {
      const now = new Date();
      setSigningTime(now.toLocaleString('zh-TW', { hour12: false }));
      setIsSigning(false);
      setSigned(true);
      setTimeout(() => {
        onConfirm();
      }, 2500);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回方案詳情
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                方案確認與電子簽署
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {proposal.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">確認接受方案</h1>
            <p className="text-slate-500">請審閱以下方案摘要並完成電子簽署，您的簽署將記錄於區塊鏈存證中心。</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Proposal Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> 方案摘要
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">券商名稱</div>
                  <div className="text-sm font-bold text-slate-900">{proposal.brokerName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">方案名稱</div>
                  <div className="text-sm font-bold text-slate-900">{proposal.proposalName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">版本號</div>
                  <div className="text-sm font-bold text-slate-900">{proposal.verifiedVersion}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">風險等級</div>
                  <div className="text-sm font-bold text-slate-900">風險等級 {proposal.riskLevel}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">收益模式</div>
                  <div className="text-sm font-bold text-slate-900">{proposal.incomeMode}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">流動性／鎖定期</div>
                  <div className="text-sm font-bold text-slate-900">{proposal.liquidityLockup}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">資產配置摘要</div>
                  <div className="text-sm font-medium text-slate-700 leading-relaxed">{proposal.assetAllocation}</div>
                </div>
              </div>
            </div>

            {/* Important Disclosures */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" /> 重要揭露再次確認
              </h3>
              <div className="space-y-3 bg-amber-50/30 p-6 rounded-2xl border border-amber-100">
                {[
                  { id: 'readRisk', label: '我已閱讀風險揭露' },
                  { id: 'noAdvice', label: '我了解本平台不直接提供投資建議' },
                  { id: 'brokerExecution', label: '我了解後續執行由券商處理' },
                  { id: 'proposalOnly', label: '我了解我簽署的是方案確認，不是平台代操授權' }
                ].map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox"
                        checked={disclosures[item.id as keyof typeof disclosures]}
                        onChange={(e) => setDisclosures(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                      />
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Signing Summary */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-300">
                <SearchCheck className="w-5 h-5 text-blue-400" /> 簽署內容摘要
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">簽署目的</span>
                  <span className="text-sm font-medium">確認接受此投資方案</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">簽署版本</span>
                  <span className="text-sm font-medium">{proposal.verifiedVersion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">簽署後狀態</span>
                  <span className="text-sm font-medium text-blue-400">將送交券商進行後續流程</span>
                </div>
              </div>
            </div>

            {/* Signing Area */}
            <div className="pt-8 border-t border-slate-100">
              {signed ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">已完成簽署</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-emerald-700 text-sm">簽署時間：{signingTime}</p>
                    <p className="text-emerald-800 font-bold text-sm">方案狀態已更新為「已簽署接受」</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-emerald-100 inline-block text-left">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Signature Hash / Tx Hash</div>
                    <div className="text-[10px] font-mono text-emerald-700 break-all">
                      0x{Math.random().toString(16).slice(2, 10)}{Math.random().toString(16).slice(2, 10)}{Math.random().toString(16).slice(2, 10)}{Math.random().toString(16).slice(2, 10)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className={`w-full max-w-md bg-slate-50 border-2 border-dashed rounded-2xl p-10 mb-6 flex flex-col items-center justify-center group transition-all ${
                    allChecked ? "border-blue-200 bg-blue-50/30" : "border-slate-200"
                  }`}>
                    <Lock className={`w-8 h-8 mb-4 transition-colors ${
                      allChecked ? "text-blue-500" : "text-slate-300"
                    }`} />
                    <p className={`text-sm font-medium transition-colors ${
                      allChecked ? "text-blue-600" : "text-slate-400"
                    }`}>
                      {allChecked ? "準備就緒，請點擊下方按鈕簽署" : "請勾選上方所有確認事項以進行簽署"}
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleSign}
                    disabled={isSigning || !allChecked}
                    className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                      isSigning || !allChecked
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                    }`}
                  >
                    {isSigning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        區塊鏈簽署中...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" /> 使用私鑰簽名確認
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 採用 256-bit 加密技術保護您的簽署安全
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);
  const [regData, setRegData] = useState<RegistrationData>(initialRegistrationData);
  const [regStep, setRegStep] = useState(1);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [issuingStep, setIssuingStep] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [hasSubmittedRequirement, setHasSubmittedRequirement] = useState(false);
  const [acceptedProposal, setAcceptedProposal] = useState<Proposal | null>(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("investmatch_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setHasCertificate(true);
    }
  }, []);

  const issuingSteps = [
    "資料已提交",
    "資格資料審核中",
    "身分與條件驗證中",
    "平台憑證生成中",
    "憑證已核發"
  ];

  useEffect(() => {
    if (currentPage === "waiting" && issuingStep < issuingSteps.length) {
      const timer = setTimeout(() => {
        setIssuingStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPage, issuingStep]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleStart = () => {
    if (!hasCertificate) {
      setCurrentPage("register");
    } else {
      setCurrentPage("dashboard");
    }
  };
  
  const handleRegister = () => setCurrentPage("register");
  const handleBack = () => {
    if (hasCertificate) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("home");
    }
    setRegStep(1);
  };

  const completeRegistration = () => {
    setCurrentPage("waiting");
    setIssuingStep(0);
  };

  const finishIssuance = () => {
    const newUser: UserAccount = {
      email: regData.basic.email,
      name: regData.basic.name,
      password: regData.basic.password,
    };
    localStorage.setItem("investmatch_user", JSON.stringify(newUser));
    setCurrentUser(newUser);
    setHasCertificate(true);
    setCurrentPage("dashboard");
  };

  const handleLogin = (user: UserAccount) => {
    localStorage.setItem("investmatch_user", JSON.stringify(user));
    setCurrentUser(user);
    setHasCertificate(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("investmatch_user");
    setCurrentUser(null);
    setHasCertificate(false);
    setCurrentPage("home");
  };

  const updateField = (field: keyof InvestmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleProduct = (product: string) => {
    setFormData(prev => {
      const products = prev.products.includes(product)
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product];
      return { ...prev, products };
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const viewDetail = (id: string) => {
    setSelectedProposalId(id);
    setCurrentPage("proposal-detail");
  };

  const handleAcceptProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setCurrentPage("proposal-confirmation");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setCurrentPage("home")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">InvestMatch</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => setCurrentPage("platform-values")} className="hover:text-blue-600 transition-colors">平台價值</button>
            <button onClick={() => setCurrentPage("workflow")} className="hover:text-blue-600 transition-colors">使用流程</button>
            <button onClick={() => setCurrentPage("partners")} className="hover:text-blue-600 transition-colors">合作券商</button>
            {hasCertificate ? (
              <>
                <button onClick={() => setCurrentPage("dashboard")} className="hover:text-blue-600 transition-colors">個人中心</button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <button 
                onClick={() => setCurrentPage("login")}
                className="hover:text-blue-600 transition-colors"
              >
                登入
              </button>
            )}
            {currentPage === "home" && !hasCertificate && (
              <button 
                onClick={handleStart}
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                立即開始
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {currentPage === "home" ? (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomePage 
              onStart={handleStart} 
              onRegister={handleRegister} 
              hasCertificate={hasCertificate}
              onDashboard={() => setCurrentPage("dashboard")}
              onLogin={() => setCurrentPage("login")}
              onViewValues={() => setCurrentPage("platform-values")}
              onViewSecurity={() => setCurrentPage("security-services")}
              onViewWorkflow={() => setCurrentPage("workflow")}
            />
          </motion.div>
        ) : currentPage === "platform-values" ? (
          <motion.div key="platform-values" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlatformValuesPage onBack={() => setCurrentPage("home")} />
          </motion.div>
        ) : currentPage === "security-services" ? (
          <motion.div key="security-services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SecurityServicesPage onBack={() => setCurrentPage("home")} />
          </motion.div>
        ) : currentPage === "workflow" ? (
          <motion.div key="workflow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WorkflowPage onBack={() => setCurrentPage("home")} onStart={handleStart} />
          </motion.div>
        ) : currentPage === "login" ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginPage 
              onBack={() => setCurrentPage("home")}
              onLogin={handleLogin}
              onRegister={() => setCurrentPage("register")}
            />
          </motion.div>
        ) : currentPage === "register" ? (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RegisterPage 
              onBack={handleBack}
              regData={regData}
              setRegData={setRegData}
              regStep={regStep}
              setRegStep={setRegStep}
              onComplete={completeRegistration}
            />
          </motion.div>
        ) : currentPage === "waiting" ? (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WaitingPage 
              issuingStep={issuingStep}
              issuingSteps={issuingSteps}
              onComplete={finishIssuance}
            />
          </motion.div>
        ) : currentPage === "partners" ? (
          <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PartnersPage onBack={handleBack} />
          </motion.div>
        ) : currentPage === "dashboard" ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DashboardPage 
              onNewRequirement={() => setCurrentPage("form")}
              regData={regData}
              onViewProposals={() => setCurrentPage("proposals")}
              onViewComparison={() => setCurrentPage("comparison")}
              onViewFavorites={() => setCurrentPage("favorites")}
              onViewDetail={viewDetail}
              onViewAuthorizations={() => setCurrentPage("authorizations")}
              onViewPortfolio={() => setCurrentPage("portfolio")}
              hasSubmittedRequirement={hasSubmittedRequirement}
              acceptedProposal={acceptedProposal}
              favoriteIds={favoriteIds}
            />
          </motion.div>
        ) : currentPage === "portfolio" ? (
          <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PortfolioPage 
              onBack={() => setCurrentPage("dashboard")} 
              acceptedProposal={acceptedProposal}
            />
          </motion.div>
        ) : currentPage === "authorizations" ? (
          <motion.div key="authorizations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthorizationsPage 
              onBack={() => setCurrentPage("dashboard")} 
              acceptedProposal={acceptedProposal}
            />
          </motion.div>
        ) : currentPage === "proposals" ? (
          <motion.div key="proposals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProposalListPage 
              onBack={() => setCurrentPage("dashboard")}
              onViewDetail={viewDetail}
              onAccept={handleAcceptProposal}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          </motion.div>
        ) : currentPage === "favorites" ? (
          <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProposalListPage 
              onBack={() => setCurrentPage("dashboard")}
              onViewDetail={viewDetail}
              onAccept={handleAcceptProposal}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              isFavoritesOnly={true}
            />
          </motion.div>
        ) : currentPage === "proposal-detail" && selectedProposalId ? (
          <motion.div key="proposal-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProposalDetailPage 
              proposal={mockProposals.find(p => p.id === selectedProposalId)!}
              onBack={() => setCurrentPage("proposals")}
              isFavorite={favoriteIds.includes(selectedProposalId)}
              onToggleFavorite={() => toggleFavorite(selectedProposalId)}
              onAccept={() => handleAcceptProposal(mockProposals.find(p => p.id === selectedProposalId)!)}
            />
          </motion.div>
        ) : currentPage === "proposal-confirmation" && selectedProposal ? (
          <motion.div key="proposal-confirmation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProposalConfirmationPage 
              proposal={selectedProposal}
              onBack={() => setCurrentPage("proposal-detail")}
              onConfirm={() => {
                setAcceptedProposal(selectedProposal);
                setCurrentPage("authorizations");
              }}
            />
          </motion.div>
        ) : currentPage === "comparison" ? (
          <motion.div key="comparison" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ComparisonPage 
              onBack={() => setCurrentPage("dashboard")}
            />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FormPage 
              onBack={handleBack} 
              formData={formData} 
              updateField={updateField}
              toggleProduct={toggleProduct}
              onSubmit={() => {
                setHasSubmittedRequirement(true);
                setCurrentPage("dashboard");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage("home")}
          >
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <BarChart3 className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">InvestMatch</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">服務條款</a>
            <a href="#" className="hover:text-blue-600 transition-colors">隱私權政策</a>
            <a href="#" className="hover:text-blue-600 transition-colors">聯絡我們</a>
          </div>
          <div className="text-sm text-slate-400">
            © 2026 InvestMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlatformValuesPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 返回首頁
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">平台核心價值</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            我們透過技術與流程創新，為投資人創造更有利的投資環境，落實 4 個核心價值與 1 個區塊鏈特色。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <Users className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">1. 降低一般投資人接觸客製化投資方案的門檻</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              傳統上，較完整或較客製化的投資方案，通常需要投資人主動接觸券商、理專或投資顧問，流程分散且門檻較高。平台透過標準化需求填寫機制，讓一般投資人也能更有效率地表達自身的風險承受度、投資目標與資產偏好，進而接觸到更貼近自身條件的投資方案。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">2. 一次比較多家券商方案，降低資訊分散與比較成本</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              整合多家合作券商，將方案以一致化格式呈現，讓使用者可以在同一介面下快速比較不同方案的風險等級、投資期間、費率與配置方向，提升決策效率。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-200">
              <Search className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">3. 一次比較多家券商方案，降低資訊分散與比較成本</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              透過統一的展示架構與流程設計，讓使用者能清楚掌握每一份方案的來源、更新時間、揭露內容與後續流程，提升資訊透明度與使用信任感。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-amber-200">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">4. 平台專注資訊協作，不直接碰觸資金與交易流程</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              平台本身不直接保管資金，也不執行實際交易，而是專注於需求整理、方案展示、比較與導流。後續的開戶、KYC、正式簽約、下單與交割，皆由合作券商端完成。
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-[40px] bg-blue-600 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0">
              <Database className="text-white w-12 h-12" />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-6">5. 用區塊鏈保存關鍵流程紀錄，提升可驗證性與信任度</h3>
              <p className="text-blue-50 leading-relaxed text-xl">
                利用區塊鏈技術記錄重要流程節點，例如會員資格憑證核發、方案版本更新、授權紀錄與同意時間點等，使平台上的關鍵資訊具備不可任意竄改、可追溯與可驗證的特性。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SecurityServicesPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 返回首頁
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">安全與整合服務</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            我們致力於提供最安全的投資協作環境，透過國際標準與先進技術確保您的資料安全與系統整合的可靠性。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <GitCompare className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">1. 與券商／金控系統正式整合</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              平台透過標準化 API 與合作券商系統串接，確保需求傳遞、方案回覆與流程同步具備一致性與可追蹤性。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">2. API 安全控管</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              所有系統介接皆依 API 安全控管原則設計，降低資料傳輸、權限存取與系統串接風險。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-200">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">3. ISO 27001 資安管理</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              ISO 27001 是國際資訊安全管理系統標準，用來建立一套有制度的資安管理流程，確保資料在蒐集、傳輸、存取與保存過程中，能兼顧機密性、完整性與可用性。導入 ISO 27001 資訊安全管理制度，強化會員資料、投資需求與系統整合流程的安全管理。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-amber-200">
              <Database className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">4. 區塊鏈留痕與可驗證紀錄</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              會員資格憑證、授權紀錄、方案版本與重要流程節點，均保留可追溯的驗證紀錄，提升流程透明度與信任基礎。
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function WorkflowPage({ onBack, onStart }: { onBack: () => void, onStart: () => void }) {
  const steps = [
    { 
      id: "01", 
      title: "註冊會員", 
      icon: UserPlus, 
      desc: "使用者進入平台後，首先完成會員註冊，建立個人基本資料與安全設定。",
      color: "blue"
    },
    { 
      id: "02", 
      title: "資格審核", 
      icon: SearchCheck, 
      desc: "通過平台的資格審核，確保符合投資參與條件，保障平台交易品質。",
      color: "indigo"
    },
    { 
      id: "03", 
      title: "核發平台憑證", 
      icon: Fingerprint, 
      desc: "審核完成後，平台會核發數位資格憑證，作為後續建立需求與簽署的合法依據。",
      color: "emerald"
    },
    { 
      id: "04", 
      title: "建立投資需求", 
      icon: FilePlus, 
      desc: "使用者可正式建立投資需求，填寫投資目標、風險承受度與偏好的代幣化資產類型。",
      color: "amber"
    },
    { 
      id: "05", 
      title: "接收並比較方案", 
      icon: GitCompare, 
      desc: "合作投顧會回傳多份客製化方案，使用者可在平台上集中查看、比較並選定適合方案。",
      color: "purple"
    },
    { 
      id: "06", 
      title: "私鑰簽名確認", 
      icon: Lock, 
      desc: "當決定接受方案後，需透過私鑰簽名完成確認，平台同步保存簽署與方案版本留痕。",
      color: "rose"
    },
    { 
      id: "07", 
      title: "追蹤執行與紀錄", 
      icon: Activity, 
      desc: "持續追蹤已簽署方案的執行情況，以及相關的授權、交易與區塊鏈存證紀錄。",
      color: "slate"
    }
  ];

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 返回首頁
        </button>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">使用者流程</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            從註冊到追蹤，我們為您提供透明、安全且數位化的投資協作體驗。
          </p>
        </div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
            {steps.map((step, i) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:border-${step.color}-500 group-hover:shadow-lg group-hover:shadow-${step.color}-100 transition-all duration-500 relative`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-${step.color}-600 text-white text-xs font-bold flex items-center justify-center border-4 border-white`}>
                    {step.id}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Flow Description */}
        <div className="mt-32 p-12 rounded-[3rem] bg-slate-50 border border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600" /> 流程說明
            </h2>
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                使用者進入平台後，首先完成會員註冊，並通過平台的資格審核。審核完成後，平台會核發資格憑證，使用者便可正式建立投資需求，填寫自己的投資目標、風險承受度與偏好的代幣化資產類型。
              </p>
              <p>
                需求送出後，合作投顧會回傳多份投資方案，使用者可在平台上集中查看、比較並選定適合自己的方案。當決定接受方案後，需透過私鑰簽名完成確認，平台則同步保存該次簽署與方案版本的留痕紀錄。
              </p>
              <p>
                之後，使用者可持續在平台上追蹤已簽署方案的執行情況，以及相關的授權、交易與區塊鏈紀錄。
              </p>
            </div>
            <div className="mt-12 flex justify-center">
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
              >
                立即開始體驗流程 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onStart, onRegister, hasCertificate, onDashboard, onLogin, onViewValues, onViewSecurity, onViewWorkflow }: { onStart: () => void, onRegister: () => void, hasCertificate: boolean, onDashboard: () => void, onLogin: () => void, onViewValues: () => void, onViewSecurity: () => void, onViewWorkflow: () => void }) {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center gap-6 mb-10 text-xs font-bold tracking-widest text-slate-400 uppercase">
              <button onClick={onViewValues} className="hover:text-blue-600 transition-colors">平台價值</button>
              <span className="text-slate-200">|</span>
              <button onClick={onViewSecurity} className="hover:text-blue-600 transition-colors">安全與整合服務</button>
            </div>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
              全台首創券商方案比較平台
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              找到最適合您的 <br />
              <span className="text-blue-600">客製化投資方案</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              輸入您的投資需求，一次比較多家合作券商提案。我們不提供投資建議，而是為您整理、展示並優化與券商的協作流程。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {hasCertificate ? (
                <button 
                  onClick={onDashboard}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                >
                  進入個人儀表板 <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={onRegister}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                  >
                    註冊會員 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={onLogin}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    登入現有帳戶 <Lock className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Positioning */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">平台定位與承諾</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                InvestMatch 是一個資訊整合與流程協作平台。我們致力於打破投資人與大型券商之間的資訊不對稱，讓每位投資人都能獲得透明、多元的選擇。
              </p>
              <ul className="space-y-4">
                {[
                  "不直接提供投資建議，保持中立客觀",
                  "不負責資金保管，交易安全由券商端保障",
                  "專注於需求整理、方案展示與比較",
                  "提供數位化流程協作，提升溝通效率"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button 
                  onClick={onViewValues}
                  className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                >
                  深入了解平台核心價值 <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={onViewSecurity}
                  className="flex items-center gap-2 text-slate-900 font-bold hover:gap-3 transition-all"
                >
                  查看安全與整合服務 <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Users className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">投資人</h4>
                    <p className="text-sm text-slate-600">提交需求，獲取多方提案</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="h-8 w-px bg-slate-200"></div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <BarChart3 className="text-indigo-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">InvestMatch 平台</h4>
                    <p className="text-sm text-slate-600">需求媒合、方案比較、流程追蹤</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="h-8 w-px bg-slate-200"></div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">合作券商</h4>
                    <p className="text-sm text-slate-600">提供專業方案，執行最終交易</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-slate-900 text-white px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] -z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">簡單四步驟，開啟投資新篇章</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              從需求到執行，我們為您簡化每一個環節。
            </p>
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: UserPlus, title: "註冊會員", desc: "完成基本資料與安全設定。" },
              { icon: SearchCheck, title: "資格審核", desc: "通過平台投資資格驗證。" },
              { icon: Fingerprint, title: "核發憑證", desc: "取得數位身分憑證。" },
              { icon: FilePlus, title: "建立需求", desc: "填寫投資目標與偏好。" },
              { icon: GitCompare, title: "比較方案", desc: "集中查看並選定方案。" },
              { icon: Lock, title: "私鑰簽名", desc: "完成方案確認與留痕。" },
              { icon: Activity, title: "追蹤執行", desc: "追蹤執行與區塊鏈紀錄。" }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all h-full text-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 mx-auto">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-blue-500 font-bold text-[10px] mb-1">STEP 0{i+1}</div>
                  <h3 className="text-sm font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{step.desc}</p>
                </div>
                {i < 6 && (
                  <div className="hidden xl:block absolute top-1/2 -right-2 -translate-y-1/2 z-20">
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button 
              onClick={onViewWorkflow}
              className="px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              查看詳細使用者流程 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onBack, onLogin, onRegister }: { onBack: () => void, onLogin: (user: UserAccount) => void, onRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const savedUser = localStorage.getItem("investmatch_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email && user.password === password) {
        onLogin(user);
      } else {
        setError("電子郵件或密碼錯誤");
      }
    } else {
      setError("找不到此用戶，請先註冊");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-20 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 md:p-12"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回首頁
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">歡迎回來</h2>
          <p className="text-slate-500 mt-2">請登入您的 InvestMatch 帳戶</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">電子郵件</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">密碼</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入您的密碼"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 text-lg mt-8"
          >
            登入系統 <ArrowRight className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-10 text-center pt-8 border-t border-slate-50">
          <p className="text-slate-500 text-sm">
            還沒有帳戶？{" "}
            <button 
              onClick={onRegister}
              className="text-blue-600 font-bold hover:underline"
            >
              立即註冊
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function PartnersPage({ onBack }: { onBack: () => void }) {
  const issuingSteps = [
    "資料已提交",
    "資格資料審核中",
    "身分與條件驗證中",
    "平台憑證生成中",
    "憑證已核發"
  ];
  const issuingStep = 5; // For display purposes in the division section if needed, but actually we don't use it there in the same way

  return (
    <div className="flex-1 bg-slate-50">
      {/* Partners Hero */}
      <section className="pt-20 pb-16 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto text-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group mx-auto"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回首頁
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">合作券商專區</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            InvestMatch 與多家頂尖券商深度合作，透過明確的角色分工與技術協作，為您提供最專業、多元且透明的投資方案。
          </p>
        </div>
      </section>

      {/* Partners List */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                name: "富邦證券",
                desc: "台灣領先券商，提供全方位投資服務，深受投資人信賴。",
                specialty: "穩健型投資方案、台股/美股定期定額",
                plans: ["財富管理", "複委託", "基金"],
                color: "blue"
              },
              {
                name: "國泰證券",
                desc: "數位轉型先驅，提供流暢的數位投資體驗與創新理財工具。",
                specialty: "成長型資產配置、數位理財工具",
                plans: ["數位帳戶", "智能投資", "海外股票"],
                color: "emerald"
              },
              {
                name: "元大證券",
                desc: "龍頭券商，擁有強大的研究團隊與豐富的產品開發經驗。",
                specialty: "積極型資產配置、衍生性商品",
                plans: ["權證", "期貨", "客製化結構型商品"],
                color: "indigo"
              }
            ].map((broker, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
              >
                <div className={`h-2 bg-${broker.color}-600`}></div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 bg-${broker.color}-50 rounded-xl flex items-center justify-center`}>
                      <BarChart3 className={`text-${broker.color}-600 w-6 h-6`} />
                    </div>
                    <h3 className="text-xl font-bold">{broker.name}</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-1">
                    {broker.desc}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">專長領域</span>
                      <p className="text-sm font-medium text-slate-900">{broker.specialty}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">提供方案類型</span>
                      <div className="flex flex-wrap gap-2">
                        {broker.plans.map(plan => (
                          <span key={plan} className={`px-2 py-1 bg-${broker.color}-50 text-${broker.color}-700 text-[10px] font-bold rounded`}>
                            {plan}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Role Division */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">平台與券商的角色分工</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  為了確保您的投資體驗既高效又安全，我們與合作券商建立了明確的責任分工體系。
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                      <BarChart3 className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">InvestMatch 平台</h4>
                      <p className="text-sm text-slate-500">負責需求收集、方案整理、比較介面、流程追蹤與數位存證。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                      <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">合作券商</h4>
                      <p className="text-sm text-slate-500">負責正式提案、開戶審核、KYC、交易執行、交割與資產保管。</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/5 rounded-3xl -rotate-2"></div>
                <div className="relative bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">需求提交</span>
                    <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 font-bold rounded">平台負責</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">方案生成</span>
                    <span className="text-[10px] px-2 py-1 bg-slate-900 text-white font-bold rounded">券商負責</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">比較分析</span>
                    <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 font-bold rounded">平台負責</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">交易執行</span>
                    <span className="text-[10px] px-2 py-1 bg-slate-900 text-white font-bold rounded">券商負責</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProposalListPage({ onBack, onViewDetail, onAccept, favoriteIds, onToggleFavorite, isFavoritesOnly = false }: { onBack: () => void, onViewDetail: (id: string) => void, onAccept: (proposal: Proposal) => void, favoriteIds: string[], onToggleFavorite: (id: string) => void, isFavoritesOnly?: boolean }) {
  const [filterAssetType, setFilterAssetType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterIncomeMode, setFilterIncomeMode] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdated");

  const assetTypes = ["股票代幣化資產", "債券代幣化資產", "基金受益權代幣", "不動產收益權型代幣", "資產支持／現金流收益型代幣"];
  const riskLevels = ["低", "中低", "中", "中高", "高"];
  const incomeModes = ["固定收益型", "成長增值型", "現金流分配型", "混合型"];

  const filteredProposals = useMemo(() => {
    let result = mockProposals.filter(p => {
      const assetTypeMatch = filterAssetType === "all" || p.productType === filterAssetType;
      const riskMatch = filterRisk === "all" || p.riskLevel === filterRisk;
      const incomeModeMatch = filterIncomeMode === "all" || p.incomeMode === filterIncomeMode;
      const favoriteMatch = !isFavoritesOnly || favoriteIds.includes(p.id);
      return assetTypeMatch && riskMatch && incomeModeMatch && favoriteMatch;
    });

    if (sortBy === "minInvestment") {
      result.sort((a, b) => {
        const valA = parseInt(a.minInvestment.replace(/[^0-9]/g, ""));
        const valB = parseInt(b.minInvestment.replace(/[^0-9]/g, ""));
        return valA - valB;
      });
    } else if (sortBy === "lastUpdated") {
      result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return result;
  }, [filterAssetType, filterRisk, filterIncomeMode, sortBy, isFavoritesOnly, favoriteIds]);

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回儀表板
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isFavoritesOnly ? "已收藏方案" : "收到方案列表"}
              </h1>
              <p className="text-slate-500">
                {isFavoritesOnly 
                  ? "您收藏的投資方案，方便您隨時深入查看細節。" 
                  : "彙整多家合作券商回覆的投資方案，以標準化格式呈現，方便您快速比較。"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Filters & Sorting */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">方案篩選</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">代幣化資產類型</label>
              <select 
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              >
                <option value="all">全部類型</option>
                {assetTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">風險等級</label>
              <select 
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              >
                <option value="all">全部等級</option>
                {riskLevels.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">收益模式</label>
              <select 
                value={filterIncomeMode}
                onChange={(e) => setFilterIncomeMode(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              >
                <option value="all">全部模式</option>
                {incomeModes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">排序方式</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              >
                <option value="lastUpdated">最後更新時間</option>
                <option value="minInvestment">最低投資門檻</option>
              </select>
            </div>
          </div>
        </div>

        {/* Proposal Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProposals.map((proposal) => (
            <motion.div 
              key={proposal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all overflow-hidden flex flex-col group"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-blue-600">
                        {proposal.brokerName}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{proposal.proposalName}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      proposal.riskLevel === '高' ? 'bg-red-50 text-red-600' :
                      proposal.riskLevel === '中高' ? 'bg-orange-50 text-orange-600' :
                      proposal.riskLevel === '中' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {proposal.riskLevel}風險
                    </span>
                  </div>
                </div>

                <p className="text-slate-500 mb-8 leading-relaxed">
                  <span className="font-bold text-slate-700">適合對象：</span>{proposal.targetAudience}
                </p>

                <div className="grid grid-cols-1 gap-y-4 mb-8">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">代幣化資產類型</span>
                    <span className="text-sm font-medium text-slate-700">{proposal.productType}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">投資期間</span>
                    <span className="text-sm font-medium text-slate-700">{proposal.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">收益模式</span>
                    <span className="text-sm font-medium text-slate-700">{proposal.incomeMode}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">流動性／鎖定期</span>
                    <span className="text-sm font-medium text-slate-700">{proposal.liquidityLockup}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">最低門檻</span>
                    <span className="text-sm font-bold text-blue-600">{proposal.minInvestment}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">費率摘要</span>
                    <span className="text-sm font-medium text-slate-700">{proposal.feeSummary}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400">已驗證標章</span>
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {proposal.verifiedVersion}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    更新日期：{proposal.lastUpdated.split(' ')[0]}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button 
                  onClick={() => onViewDetail(proposal.id)}
                  className="flex-1 bg-slate-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200"
                >
                  查看詳情
                </button>
                <button 
                  onClick={() => onAccept(proposal)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-3 rounded-xl hover:border-blue-200 hover:text-blue-600 transition-all"
                >
                  接受方案
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(proposal.id);
                  }}
                  className={`p-3 rounded-xl border transition-all ${
                    favoriteIds.includes(proposal.id) 
                      ? "bg-amber-50 text-amber-600 border-amber-200" 
                      : "bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                  }`}
                >
                  <Star className={`w-5 h-5 ${favoriteIds.includes(proposal.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">找不到符合條件的方案</h3>
            <p className="text-slate-500">請嘗試調整篩選條件或稍後再試。</p>
          </div>
        )}
      </div>
    </div>
  );
}

const mockPortfolioProposals: PortfolioProposal[] = [
  {
    id: "PORT-001",
    brokerName: "國泰證券",
    proposalName: "全球穩健收益型 RWA 配置方案",
    version: "v1.0",
    signingTime: "2024-03-29 09:15",
    status: "executing",
    performanceStatus: "up",
    returnSummary: "+NT$ 12,450",
    lastUpdated: "2024-03-29 10:00",
    latestNAV: "NT$ 1,084.5",
    cumulativeReturn: "+8.45%",
    periodChange: "+0.24%",
    lastTransactionTime: "2024-03-25 15:00",
    lastAction: "income",
    assetAllocationSummary: "債券代幣 60%, 不動產代幣 30%, 現金 10%"
  },
  {
    id: "PORT-002",
    brokerName: "富邦證券",
    proposalName: "成長導向股票代幣配置方案",
    version: "v1.2",
    signingTime: "2024-03-20 10:30",
    status: "executing",
    performanceStatus: "up",
    returnSummary: "+NT$ 45,200",
    lastUpdated: "2024-03-29 09:45",
    latestNAV: "NT$ 1,125.8",
    cumulativeReturn: "+12.58%",
    periodChange: "+1.12%",
    lastTransactionTime: "2024-03-28 10:15",
    lastAction: "rebalance",
    assetAllocationSummary: "科技股票代幣 70%, 能源股票代幣 20%, 債券 10%"
  }
];

const mockProposals: Proposal[] = [
  {
    id: "PROP-001",
    brokerName: "國泰證券",
    brokerIntro: "國泰證券以穩健經營著稱，提供多元化的投資工具，協助客戶達成財務自由。",
    proposalName: "全球穩健收益型 RWA 配置方案",
    investmentGoal: "創造穩定現金流並兼顧資產成長",
    targetAudience: "適合偏好穩健收益與中期持有的投資人",
    riskLevel: "中低",
    duration: "中期（1–3 年）",
    assetAllocation: "高股息股票 70%, 特別股 20%, 債券 10%",
    assetAllocationData: [
      { name: "高股息股票", value: 70 },
      { name: "特別股", value: 20 },
      { name: "債券", value: 10 }
    ],
    productType: "債券代幣化資產 / 不動產收益權型代幣",
    incomeMode: "定期收益分配",
    liquidityLockup: "中流動性 / 6 個月鎖定期",
    feeSummary: "平台展示費 0% / 券商服務費 1.2%",
    minInvestment: "NT$ 100,000",
    liquidity: "T+2 日贖回入帳",
    riskDisclosure: "個股風險、產業集中風險。高股息並不保證獲利，投資人應評估自身風險承受能力。",
    versionHistory: "v2.0",
    lastUpdated: "2026/03/29 10:15",
    createdAt: "2023-11-20 11:00",
    blockchainHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    fullStrategy: "專注於具有穩定配息紀錄與強健現金流的企業。透過多角化配置於不同產業的高股息龍頭股，並搭配特別股以增強下檔保護，旨在提供優於定存的現金收益。",
    verifiedVersion: "已驗證 v1.0"
  },
  {
    id: "PROP-002",
    brokerName: "富邦證券",
    brokerIntro: "富邦證券為台灣領先的券商之一，提供全方位的金融服務，致力於為客戶創造長期價值。",
    proposalName: "成長導向股票代幣配置方案",
    investmentGoal: "在可控風險下追求長期資本增值",
    targetAudience: "適合希望追求資產增值並可接受波動的投資人",
    riskLevel: "中高",
    duration: "3-5 年",
    assetAllocation: "股票 80%, 債券 15%, 現金 5%",
    assetAllocationData: [
      { name: "股票", value: 80 },
      { name: "債券", value: 15 },
      { name: "現金", value: 5 }
    ],
    productType: "股票代幣化資產",
    incomeMode: "成長增值型",
    liquidityLockup: "高流動性 / 無鎖定期",
    feeSummary: "手續費 0.15%, 管理費 0.5%/年",
    minInvestment: "NT$ 500,000",
    liquidity: "T+3 日贖回入帳",
    riskDisclosure: "本方案涉及市場波動風險、匯率風險及利率變動風險。投資人應注意市場環境變化可能對資產價值產生的影響。",
    versionHistory: "v1.2",
    lastUpdated: "2026/03/29 14:30",
    createdAt: "2024-01-15 09:00",
    blockchainHash: "0x7a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    fullStrategy: "本方案採用核心-衛星配置策略。核心資產配置於全球大型股 ETF 與投資等級債券，衛星資產則視市場情況動態調整至高成長產業。透過定期再平衡機制，維持風險收益比的最佳化。",
    verifiedVersion: "已驗證 v1.0"
  },
  {
    id: "PROP-003",
    brokerName: "元大證券",
    brokerIntro: "元大證券為台灣證券業龍頭，擁有強大的研究團隊與豐富的國際投資經驗。",
    proposalName: "多元收益型資產代幣組合",
    investmentGoal: "透過多元資產配置獲取穩定現金流",
    targetAudience: "適合重視現金流分配與實體資產支持的投資人",
    riskLevel: "中",
    duration: "2-4 年",
    assetAllocation: "資產支持代幣 60%, 債券 30%, 現金 10%",
    assetAllocationData: [
      { name: "資產支持代幣", value: 60 },
      { name: "債券", value: 30 },
      { name: "現金", value: 10 }
    ],
    productType: "資產支持／現金流收益型代幣",
    incomeMode: "現金流分配型",
    liquidityLockup: "中流動性 / 3 個月鎖定期",
    feeSummary: "手續費 0.2%, 管理費 0.6%/年",
    minInvestment: "NT$ 300,000",
    liquidity: "T+4 日贖回入帳",
    riskDisclosure: "信用風險、流動性風險。資產支持型商品價值取決於底層資產表現。",
    versionHistory: "v1.0",
    lastUpdated: "2026/03/29 09:00",
    createdAt: "2024-03-20 15:30",
    blockchainHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    fullStrategy: "精選具備穩定現金流產出能力的實體資產支持代幣。透過分散投資於應收帳款、租金收益等不同來源，降低單一資產波動對整體收益的影響。",
    verifiedVersion: "已驗證 v1.0"
  },
  {
    id: "PROP-004",
    brokerName: "凱基證券",
    brokerIntro: "凱基證券致力於推廣永續投資，結合 ESG 評級與專業研究，為客戶提供優質理財方案。",
    proposalName: "不動產現金流型 RWA 配置方案",
    investmentGoal: "參與不動產市場收益並維持資產流動性",
    targetAudience: "適合希望透過多元代幣化資產分散風險的投資人",
    riskLevel: "中",
    duration: "3-5 年",
    assetAllocation: "不動產代幣 75%, 債券 20%, 現金 5%",
    assetAllocationData: [
      { name: "不動產代幣", value: 75 },
      { name: "債券", value: 20 },
      { name: "現金", value: 5 }
    ],
    productType: "不動產收益權型代幣",
    incomeMode: "現金流分配型",
    liquidityLockup: "低流動性 / 12 個月鎖定期",
    feeSummary: "手續費 0.25%, 管理費 0.7%/年",
    minInvestment: "NT$ 1,000,000",
    liquidity: "T+7 日贖回入帳",
    riskDisclosure: "不動產市場風險、政策風險。不動產代幣化商品流動性較低，適合長期配置。",
    versionHistory: "v1.1",
    lastUpdated: "2026/03/29 16:45",
    createdAt: "2024-02-10 10:20",
    blockchainHash: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    fullStrategy: "鎖定優質商業不動產與租賃住宅之收益權。透過代幣化技術將大額不動產投資門檻降低，讓投資人能以較小金額參與不動產租金收益分配與潛在增值機會。",
    verifiedVersion: "已驗證 v1.0"
  },
  {
    id: "PROP-005",
    brokerName: "中信證券",
    brokerIntro: "中國信託證券提供多元化的投資理財服務，以客戶需求為導向，致力於成為客戶最信賴的金融夥伴。",
    proposalName: "平衡型代幣化資產方案",
    investmentGoal: "平衡風險與收益，追求穩健的資產增長",
    targetAudience: "適合偏好中低風險、兼顧收益與流動性的投資人",
    riskLevel: "中低",
    duration: "1-3 年",
    assetAllocation: "基金受益權代幣 50%, 債券 40%, 現金 10%",
    assetAllocationData: [
      { name: "基金受益權代幣", value: 50 },
      { name: "債券", value: 40 },
      { name: "現金", value: 10 }
    ],
    productType: "基金受益權代幣",
    incomeMode: "混合型",
    liquidityLockup: "中高流動性 / 1 個月鎖定期",
    feeSummary: "手續費 0.1%, 管理費 0.3%/年",
    minInvestment: "NT$ 200,000",
    liquidity: "T+3 日贖回入帳",
    riskDisclosure: "市場風險、基金經理人風險。本方案透過基金代幣化實現多元配置，但仍受市場波動影響。",
    versionHistory: "v1.0",
    lastUpdated: "2026/03/29 11:00",
    createdAt: "2024-03-01 09:00",
    blockchainHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    fullStrategy: "採用動態資產配置策略，根據市場環境調整基金代幣與債券的比例。旨在市場上漲時獲取收益，在市場下跌時提供保護，適合追求長期平穩回報的投資人。",
    verifiedVersion: "已驗證 v1.0"
  }
];

function ProposalDetailPage({ proposal, onBack, isFavorite, onToggleFavorite, onAccept }: { proposal: Proposal; onBack: () => void; isFavorite: boolean; onToggleFavorite: () => void; onAccept: () => void }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                  {proposal.brokerName}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  proposal.riskLevel === '高' ? 'bg-red-50 text-red-600' :
                  proposal.riskLevel === '中高' ? 'bg-orange-50 text-orange-600' :
                  proposal.riskLevel === '中' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  風險等級 {proposal.riskLevel}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{proposal.proposalName}</h1>
              <p className="text-slate-500 text-lg">{proposal.investmentGoal}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onAccept}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                接受方案
              </button>
              <button 
                onClick={onToggleFavorite}
                className={`p-3 border rounded-xl transition-all ${
                  isFavorite 
                    ? "bg-amber-50 text-amber-600 border-amber-200" 
                    : "bg-white border-slate-200 text-slate-400 hover:text-yellow-500 hover:border-yellow-200"
                }`}
              >
                <Star className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Strategy Section */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> 資產配置與策略邏輯
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={proposal.assetAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {proposal.assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">策略摘要</h4>
                  <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                    {proposal.fullStrategy}
                  </p>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">商品類型</span>
                      <span className="font-bold text-slate-700">{proposal.productType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">建議期間</span>
                      <span className="font-bold text-slate-700">{proposal.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">收益模式</span>
                      <span className="font-bold text-slate-700">{proposal.incomeMode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> 適合對象
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {proposal.targetAudience}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" /> 費用明細
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {proposal.feeSummary}
                </p>
              </div>
            </div>

            {/* Risk Disclosure */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> 風險揭露與流動性
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-800 text-sm leading-relaxed">
                    {proposal.riskDisclosure}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">流動性說明</h5>
                    <p className="text-slate-500 text-sm">{proposal.liquidity}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Broker Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4">券商資訊</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                  {proposal.brokerName.substring(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{proposal.brokerName}</div>
                  <div className="text-xs text-slate-500">合作夥伴</div>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {proposal.brokerIntro}
              </p>
              <button className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm">
                查看券商主頁
              </button>
            </div>

            {/* Blockchain Verification */}
            <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-2xl"></div>
              <h4 className="font-bold mb-4 flex items-center gap-2 relative z-10">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> 區塊鏈存證資訊
              </h4>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">方案版本</div>
                  <div className="text-sm font-mono text-blue-400">{proposal.versionHistory}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">存證 Hash</div>
                  <div className="text-[10px] font-mono text-slate-300 break-all bg-white/5 p-2 rounded-lg">
                    {proposal.blockchainHash}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">建立時間</div>
                    <div className="text-xs text-slate-300">{proposal.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">最後更新</div>
                    <div className="text-xs text-slate-300">{proposal.lastUpdated}</div>
                  </div>
                </div>
                <div className="pt-2">
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                    <ExternalLink className="w-3 h-3" /> 驗證存證紀錄
                  </button>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4">相關文件</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-sm text-slate-600">方案詳細說明書.pdf</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-sm text-slate-600">風險預告書.pdf</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonPage({ onBack }: { onBack: () => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["PROP-001", "PROP-002"]);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  const selectedProposals = useMemo(() => {
    return selectedIds.map(id => mockProposals.find(p => p.id === id)).filter(Boolean) as Proposal[];
  }, [selectedIds]);

  const comparisonItems = [
    { key: "brokerName", label: "券商名稱" },
    { key: "proposalName", label: "方案名稱" },
    { key: "investmentGoal", label: "投資目標" },
    { key: "targetAudience", label: "適合對象" },
    { key: "riskLevel", label: "風險等級" },
    { key: "duration", label: "投資期間" },
    { key: "assetAllocation", label: "資產配置摘要" },
    { key: "productType", label: "商品類型" },
    { key: "feeSummary", label: "費率" },
    { key: "minInvestment", label: "最低門檻" },
    { key: "liquidity", label: "流動性說明" },
    { key: "riskDisclosure", label: "風險揭露文件" },
    { key: "versionHistory", label: "版本留痕資訊" },
  ];

  const filteredItems = useMemo(() => {
    if (!showOnlyDiff || selectedProposals.length < 2) return comparisonItems;
    
    return comparisonItems.filter(item => {
      const values = selectedProposals.map(p => p[item.key as keyof Proposal]);
      return !values.every(v => v === values[0]);
    });
  }, [showOnlyDiff, selectedProposals, comparisonItems]);

  const removeProposal = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const addProposal = (id: string) => {
    if (selectedIds.length >= 3) return;
    if (selectedIds.includes(id)) return;
    setSelectedIds(prev => [...prev, id]);
  };

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回儀表板
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">方案橫向比較</h1>
              <p className="text-slate-500">並排查看多個方案細節，協助您客觀理解各項指標差異。</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setShowOnlyDiff(false)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${!showOnlyDiff ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  顯示全部
                </button>
                <button 
                  onClick={() => setShowOnlyDiff(true)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${showOnlyDiff ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  只看差異
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Selection Area */}
        {selectedIds.length < 3 && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
            <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> 您還可以添加方案進行比較（最多 3 個）
            </h3>
            <div className="flex flex-wrap gap-3">
              {mockProposals.filter(p => !selectedIds.includes(p.id)).map(p => (
                <button 
                  key={p.id}
                  onClick={() => addProposal(p.id)}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  + {p.brokerName}: {p.proposalName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-left text-sm font-bold text-slate-400 border-b border-slate-100 w-48">比較項目</th>
                  {selectedProposals.map(p => (
                    <th key={p.id} className="p-6 text-left border-b border-slate-100 min-w-[280px] relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md mb-2">
                            {p.brokerName}
                          </span>
                          <div className="font-bold text-slate-900">{p.proposalName}</div>
                        </div>
                        <button 
                          onClick={() => removeProposal(p.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Empty slots for visual balance if < 3 */}
                  {Array.from({ length: 3 - selectedProposals.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-6 border-b border-slate-100 min-w-[280px] bg-slate-50/20">
                      <div className="flex flex-col items-center justify-center text-slate-300 py-4">
                        <div className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-2">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium">待添加方案</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={item.key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                    <td className="p-6 text-sm font-bold text-slate-600 border-b border-slate-100 align-top">
                      {item.label}
                    </td>
                    {selectedProposals.map(p => (
                      <td key={p.id} className="p-6 text-sm text-slate-700 border-b border-slate-100 align-top leading-relaxed">
                        {item.key === 'riskLevel' ? (
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            p.riskLevel === 'RR5' ? 'bg-red-50 text-red-600' :
                            p.riskLevel === 'RR4' ? 'bg-orange-50 text-orange-600' :
                            p.riskLevel === 'RR3' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {p.riskLevel}
                          </span>
                        ) : item.key === 'riskDisclosure' ? (
                          <button className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                            <FileText className="w-4 h-4" /> 查看文件
                          </button>
                        ) : (
                          p[item.key as keyof Proposal]
                        )}
                      </td>
                    ))}
                    {/* Empty slots for visual balance */}
                    {Array.from({ length: 3 - selectedProposals.length }).map((_, i) => (
                      <td key={`empty-cell-${i}`} className="p-6 border-b border-slate-100 bg-slate-50/10"></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/20 blur-[80px]"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">中立客觀的資訊呈現</h3>
              <p className="text-slate-400 leading-relaxed">
                InvestMatch 僅負責彙整並標準化各家券商提供的方案資訊。我們不對方案進行評分或排名，旨在讓您在充分理解差異的基礎上，做出最符合自身需求的判斷。
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
                下載比較報表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ onNewRequirement, regData, onViewProposals, onViewComparison, onViewFavorites, onViewDetail, onViewAuthorizations, onViewPortfolio, hasSubmittedRequirement, acceptedProposal, favoriteIds }: { onNewRequirement: () => void, regData: RegistrationData, onViewProposals: () => void, onViewComparison: () => void, onViewFavorites: () => void, onViewDetail: (id: string) => void, onViewAuthorizations: () => void, onViewPortfolio: () => void, hasSubmittedRequirement: boolean, acceptedProposal: Proposal | null, favoriteIds: string[] }) {
  const hasAcceptedProposal = !!acceptedProposal;
  const stats = [
    { label: "需求提交", value: hasSubmittedRequirement ? "1" : "0", icon: FileText, color: "blue" },
    { label: "收到方案", value: hasSubmittedRequirement ? "3" : "0", icon: BarChart3, color: "indigo" },
    { label: "收藏方案", value: favoriteIds.length.toString(), icon: Star, color: "amber" },
    { label: "比較紀錄", value: hasSubmittedRequirement ? "1" : "0", icon: GitCompare, color: "emerald" },
  ];

  const notifications = hasSubmittedRequirement ? [
    { id: 1, title: "新方案提交", content: "富邦證券已針對您的需求提交了新的客製化方案。", time: "2小時前", type: "new" },
    { id: 2, title: "方案版本更新", content: "國泰證券更新了「成長型資產配置」方案的預期報酬率。", time: "昨天", type: "update" },
    { id: 3, title: "授權即將到期", content: "您的信用憑證授權將在 7 天後到期，請記得更新。", time: "2天前", type: "alert" },
  ] : [
    { id: 3, title: "授權即將到期", content: "您的信用憑證授權將在 7 天後到期，請記得更新。", time: "2天前", type: "alert" },
  ];

  const requirements = hasSubmittedRequirement ? [
    { 
      id: "REQ-20240327", 
      title: "2024 年度資產配置需求", 
      status: "媒合中", 
      date: "2024-03-27",
      proposals: 3,
      tags: ["穩健型", "定期定額"]
    }
  ] : [];

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">歡迎回來，{regData.basic.name || "投資人"}</h1>
              <p className="text-slate-500">管理您的投資需求、查看券商提案並追蹤所有活動紀錄。</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={onNewRequirement}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                <FilePlus className="w-5 h-5" /> 建立新需求
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all ${((stat.label === "收到方案" || stat.label === "比較紀錄" || stat.label === "收藏方案") && hasSubmittedRequirement) ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : (stat.label !== "需求提交" ? "opacity-50 grayscale cursor-not-allowed" : "")}`}
              onClick={
                (hasSubmittedRequirement || stat.label === "需求提交") ? (
                  stat.label === "收到方案" ? onViewProposals : 
                  stat.label === "比較紀錄" ? onViewComparison : 
                  stat.label === "收藏方案" ? onViewFavorites :
                  undefined
                ) : undefined
              }
            >
              <div className={`w-10 h-10 bg-${stat.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className={`text-${stat.color}-600 w-5 h-5`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* My Portfolio Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
              <Activity className="w-6 h-6 text-blue-600" /> 我的方案
            </h2>
          </div>
          
          <div 
            onClick={onViewPortfolio}
            className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden cursor-pointer group ${!hasAcceptedProposal ? "opacity-75 grayscale-[0.5]" : ""}`}
          >
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="text-blue-600 w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {hasAcceptedProposal ? acceptedProposal?.proposalName : "管理我的投資方案"}
                  </h3>
                  <p className="text-slate-500 max-w-md leading-relaxed">
                    {hasAcceptedProposal ? (
                      <>您目前正在執行 <span className="text-blue-600 font-bold">{acceptedProposal?.brokerName}</span> 的方案。點擊進入管理介面查看即時報酬、資產配置與交易紀錄。</>
                    ) : (
                      <>您尚未接受任何投資方案。在「收到方案」中選定適合您的方案並完成簽署後，即可在此追蹤執行情況。</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                {hasAcceptedProposal && (
                  <div className="hidden lg:flex flex-col items-end mr-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">總體表現</div>
                    <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-5 h-5" /> +4.25%
                    </div>
                  </div>
                )}
                <button className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 ${hasAcceptedProposal ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  {hasAcceptedProposal ? "進入管理流程" : "尚未有方案"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Requirements */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> 我的投資需求
                </h2>
                <button className="text-sm text-blue-600 font-bold hover:underline">查看全部</button>
              </div>
              <div className="space-y-4">
                {requirements.length > 0 ? requirements.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono font-bold text-slate-400">{req.id}</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{req.status}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{req.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {req.date}</span>
                          <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {req.proposals} 個方案</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Search className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={onViewProposals}
                          className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-all"
                        >
                          查看方案
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FilePlus className="text-slate-300 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">尚未建立投資需求</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                      建立您的投資需求後，合作券商將會根據您的目標提供客製化方案。
                    </p>
                    <button 
                      onClick={onNewRequirement}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" /> 立即建立新需求
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> 授權與紀錄
                </h2>
                <button 
                  onClick={onViewAuthorizations}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  查看全部
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" onClick={onViewAuthorizations}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">授權狀態</h4>
                      <p className="text-xs text-slate-500">{hasAcceptedProposal ? "2 個有效授權" : "0 個有效授權"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <History className="text-emerald-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">同意紀錄</h4>
                      <p className="text-xs text-slate-500">{hasAcceptedProposal ? "4 筆存證紀錄" : "0 筆存證紀錄"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400">最後更新：2024/03/29</span>
                  <ChevronRight className="text-slate-300 w-5 h-5" />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-emerald-600" /> 方案比較與收藏
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div 
                  onClick={onViewFavorites}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Star className="text-amber-600 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">已收藏方案</h4>
                    <p className="text-sm text-slate-500">{favoriteIds.length} 個方案</p>
                  </div>
                  <ChevronRight className="text-slate-300 w-5 h-5" />
                </div>
                <div 
                  onClick={onViewComparison}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <GitCompare className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">比較紀錄</h4>
                    <p className="text-sm text-slate-500">1 筆紀錄</p>
                  </div>
                  <ChevronRight className="text-slate-300 w-5 h-5" />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Notifications & Quick Links */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> 近期通知
                </h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {notifications.map((note) => (
                    <div key={note.id} className="p-4 hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                        <span className="text-[10px] text-slate-400">{note.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all">
                  查看所有通知
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" /> 快速管理
                </h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-2 space-y-1">
                  {[
                    { label: "授權管理", icon: ShieldCheck, desc: "管理信用憑證授權", action: onViewAuthorizations },
                    { label: "個人資料", icon: Users, desc: "修改基本資料與偏好" },
                    { label: "安全性設定", icon: Lock, desc: "密碼與登入紀錄" },
                    { label: "幫助中心", icon: HelpCircle, desc: "常見問題與客服" },
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <item.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioPage({ onBack, acceptedProposal }: { onBack: () => void, acceptedProposal: Proposal | null }) {
  const hasAcceptedProposal = !!acceptedProposal;
  const portfolios: PortfolioProposal[] = acceptedProposal ? [
    {
      id: `PORT-${acceptedProposal.id}`,
      brokerName: acceptedProposal.brokerName,
      proposalName: acceptedProposal.proposalName,
      version: "v1.0",
      status: "executing",
      signingTime: new Date().toLocaleDateString('zh-TW'),
      cumulativeReturn: "+4.25%",
      returnSummary: "NT$ 12,450",
      latestNAV: "NT$ 104.25",
      periodChange: "+0.15%",
      performanceStatus: "up",
      assetAllocationSummary: acceptedProposal.assetAllocation,
      lastAction: "income",
      lastTransactionTime: new Date().toLocaleDateString('zh-TW'),
      lastUpdated: new Date().toLocaleString('zh-TW')
    }
  ] : [];

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回儀表板
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">我的方案管理</h1>
          <p className="text-slate-500">查看並管理您所有已簽署且執行中的投資方案表現。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {portfolios.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {portfolios.map((port) => (
              <div key={port.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all overflow-hidden group">
                <div className="p-8">
                  {/* Header: Broker & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{port.brokerName}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs font-bold text-slate-400">{port.version}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{port.proposalName}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        port.status === 'executing' ? 'bg-emerald-50 text-emerald-600' :
                        port.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {port.status === 'executing' ? '執行中' : port.status === 'completed' ? '已完成' : '已終止'}
                      </span>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 簽署於 {port.signingTime}
                      </div>
                    </div>
                  </div>

                  {/* Performance Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">累積報酬率</div>
                      <div className={`text-xl font-bold flex items-center gap-1 ${
                        port.performanceStatus === 'up' ? 'text-emerald-600' :
                        port.performanceStatus === 'down' ? 'text-red-600' :
                        'text-slate-600'
                      }`}>
                        {port.performanceStatus === 'up' ? <TrendingUp className="w-5 h-5" /> : 
                         port.performanceStatus === 'down' ? <TrendingDown className="w-5 h-5" /> : 
                         <Minus className="w-5 h-5" />}
                        {port.cumulativeReturn}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">損益摘要</div>
                      <div className={`text-xl font-bold ${
                        port.performanceStatus === 'up' ? 'text-emerald-600' :
                        port.performanceStatus === 'down' ? 'text-red-600' :
                        'text-slate-600'
                      }`}>
                        {port.returnSummary}
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">最新淨值 / 估值</div>
                      <div className="text-xl font-bold text-slate-900">{port.latestNAV}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">今日變動</div>
                      <div className={`text-sm font-bold ${
                        port.periodChange.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {port.periodChange}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">目前持有資產配置</div>
                      <div className="text-sm font-medium text-slate-700 truncate">{port.assetAllocationSummary}</div>
                    </div>
                  </div>

                  {/* Footer: Last Action & Links */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">最近一次動作</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            port.lastAction === 'buy' ? 'bg-emerald-50 text-emerald-600' :
                            port.lastAction === 'sell' ? 'bg-red-50 text-red-600' :
                            port.lastAction === 'rebalance' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {port.lastAction === 'buy' ? '買入' : 
                             port.lastAction === 'sell' ? '賣出' : 
                             port.lastAction === 'rebalance' ? '再平衡' : '收益分配'}
                          </span>
                          <span className="text-[10px] text-slate-400">{port.lastTransactionTime}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">最後更新</div>
                        <div className="text-[10px] text-slate-500 font-medium">{port.lastUpdated}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 md:flex-none px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200">
                        交易紀錄
                      </button>
                      <button className="flex-1 md:flex-none px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-lg shadow-slate-200">
                        查看執行情況
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">尚未接受任何投資方案</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              您目前還沒有執行中的方案。請先前往個人中心查看券商為您準備的客製化提案。
            </p>
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              前往查看方案
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthorizationsPage({ onBack, acceptedProposal }: { onBack: () => void, acceptedProposal: Proposal | null }) {
  const hasAcceptedProposal = !!acceptedProposal;
  const authorizations: Authorization[] = acceptedProposal ? [
    {
      id: `AUTH-${acceptedProposal.id}`,
      brokerName: acceptedProposal.brokerName,
      scope: ["可查看需求", "可回傳方案", "可更新方案"],
      startTime: new Date().toLocaleDateString('zh-TW'),
      expiryTime: new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString('zh-TW'),
      status: "valid"
    }
  ] : [];

  const consentRecords: ConsentRecord[] = acceptedProposal ? [
    {
      id: "REC-1001",
      eventType: "同意平台提供需求給券商",
      timestamp: "2024-03-27 10:30:15",
      hash: "0x7a2b...4c5d",
      verificationStatus: "已驗證"
    },
    {
      id: "REC-1002",
      eventType: `同意查看「${acceptedProposal.proposalName}」方案`,
      timestamp: "2024-03-28 14:20:00",
      hash: "0x1a2b...8f9a",
      verificationStatus: "已驗證"
    },
    {
      id: "REC-1003",
      eventType: "確認風險揭露事項",
      timestamp: "2024-03-28 14:25:30",
      hash: "0x9a8b...1a0b",
      verificationStatus: "已驗證"
    },
    {
      id: "REC-1004",
      eventType: `接受${acceptedProposal.brokerName}方案`,
      timestamp: new Date().toLocaleString('zh-TW'),
      hash: "0x5a6b...3a4b",
      verificationStatus: "處理中"
    }
  ] : [];

  const proposalVersions: ProposalVersion[] = acceptedProposal ? [
    {
      id: `VER-${acceptedProposal.id}`,
      proposalName: acceptedProposal.proposalName,
      version: "v1",
      updateTime: acceptedProposal.lastUpdated,
      summary: "初始版本發布：包含您所選定的資產組合與風險揭露。",
      brokerName: acceptedProposal.brokerName,
      userStatus: "agreed"
    }
  ] : [];

  const transactionRecords: TransactionRecord[] = acceptedProposal ? [
    {
      id: "TX-9901",
      timestamp: new Date().toLocaleString('zh-TW'),
      brokerName: acceptedProposal.brokerName,
      proposalName: acceptedProposal.proposalName,
      assetName: "初始配置資產組合",
      assetType: "RWA 代幣化",
      action: "buy",
      quantity: "100 單位",
      price: "NT$ 1,000",
      amount: "NT$ 100,000",
      holdingStatus: "持有中",
      status: "completed",
      hash: "0xabc1...def2"
    }
  ] : [];

  const incomeRecords: IncomeRecord[] = [];

  const contractExecutions: ContractExecution[] = acceptedProposal ? [
    {
      id: "EXEC-001",
      timestamp: new Date().toLocaleString('zh-TW'),
      contractName: "投資方案執行合約",
      event: "簽署接受",
      status: "success",
      hash: "0x5a6b...3a4b",
      contractId: "0x92D...B56"
    }
  ] : [];

  const signingRecords: SigningRecord[] = acceptedProposal ? [
    {
      id: "SIG-001",
      timestamp: new Date().toLocaleString('zh-TW'),
      proposalName: acceptedProposal.proposalName,
      version: "v1.0",
      purpose: "方案接受確認",
      credentialId: "DID:IWM:0x71C...A45",
      signatureHash: "0x8f9a...1a2b3c4d",
      status: "verified"
    }
  ] : [];

  return (
    <div className="flex-1 bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回儀表板
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">授權與紀錄</h1>
          <p className="text-slate-500">管理您的券商授權狀態，並查看所有同意與簽署的區塊鏈存證紀錄。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {!hasAcceptedProposal ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">尚未有授權與紀錄</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              當您接受並簽署投資方案後，相關的授權狀態與區塊鏈存證紀錄將會顯示在此處。
            </p>
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              返回儀表板
            </button>
          </div>
        ) : (
          <>
            {/* Section 1: Authorization Status */}
            <section>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">我的授權狀態</h2>
          </div>
          
          <div className="grid gap-4">
            {authorizations.map((auth) => (
              <div key={auth.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{auth.brokerName}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        auth.status === 'valid' ? 'bg-emerald-50 text-emerald-600' :
                        auth.status === 'revoked' ? 'bg-slate-50 text-slate-400' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {auth.status === 'valid' ? '有效' : auth.status === 'revoked' ? '已撤回' : '已過期'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">授權範圍</div>
                        <div className="flex flex-wrap gap-1">
                          {auth.scope.map((s, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">授權期間</div>
                        <div className="text-xs text-slate-600 font-medium">
                          {auth.startTime} ~ {auth.expiryTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">授權 ID</div>
                        <div className="text-xs text-slate-400 font-mono">{auth.id}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                      查看授權內容
                    </button>
                    {auth.status === 'valid' && (
                      <button className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                        撤回授權
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Consent & Signing Records */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">我的同意與簽署紀錄</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">行為描述</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">時間戳記</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">存證 Hash / ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">驗證狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{record.eventType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500">{record.timestamp}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {record.hash}
                          </div>
                          <button className="p-1 text-slate-300 hover:text-slate-500">
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          record.verificationStatus === '已驗證' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" /> {record.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Signing Records */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Fingerprint className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">簽署紀錄</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">簽署時間 / 用途</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">對應方案 / 版本</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Credential ID / Wallet</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Signature Hash</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">驗證狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {signingRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{record.timestamp}</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase">{record.purpose}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{record.proposalName}</div>
                        <div className="text-xs text-slate-400">{record.version}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {record.credentialId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                            {record.signatureHash}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-300" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> 已驗證
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: Proposal Version History */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <GitCompare className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">方案版本歷史</h2>
          </div>

          <div className="grid gap-4">
            {proposalVersions.map((ver) => (
              <div key={ver.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{ver.proposalName}</h3>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                        {ver.version}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{ver.brokerName}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      <span className="font-bold text-slate-900">更新摘要：</span>{ver.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ver.updateTime}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 版本 ID: {ver.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      ver.userStatus === 'agreed' ? 'bg-emerald-50 text-emerald-600' :
                      ver.userStatus === 'viewed' ? 'bg-blue-50 text-blue-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {ver.userStatus === 'agreed' ? '已重新同意' : ver.userStatus === 'viewed' ? '已查看' : '待處理'}
                    </span>
                    <button className="text-sm font-bold text-indigo-600 hover:underline">
                      查看版本詳情
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Transaction Records */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">交易紀錄</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">交易資訊</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">資產與類型</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">動作 / 數量</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">價格 / 金額</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">狀態 / Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactionRecords.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{tx.brokerName}</div>
                        <div className="text-[10px] text-slate-400 mb-1">{tx.proposalName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {tx.timestamp}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{tx.assetName}</div>
                        <div className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded inline-block">
                          {tx.assetType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold mb-0.5 ${
                          tx.action === 'buy' ? 'text-emerald-600' :
                          tx.action === 'sell' ? 'text-red-600' :
                          tx.action === 'income' ? 'text-blue-600' :
                          'text-indigo-600'
                        }`}>
                          {tx.action === 'buy' ? '買入' : 
                           tx.action === 'sell' ? '賣出' : 
                           tx.action === 'income' ? '收益分配' : '再平衡'}
                        </div>
                        <div className="text-xs text-slate-500">{tx.quantity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{tx.price}</div>
                        <div className="text-xs text-slate-500">{tx.amount}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`text-[10px] font-bold mb-2 ${
                          tx.status === 'completed' ? 'text-emerald-600' :
                          tx.status === 'processing' ? 'text-amber-600' :
                          'text-slate-400'
                        }`}>
                          {tx.status === 'completed' ? '已完成' : tx.status === 'processing' ? '處理中' : '已取消'}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] font-mono text-slate-400">{tx.hash}</span>
                          <ExternalLink className="w-3 h-3 text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 6: Income Distribution & Cash Flow Records */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Coins className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">收益分配與現金流紀錄</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分配日期 / 來源</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分配類型</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分配金額</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">對應方案</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">狀態 / 驗證</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {incomeRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{record.date}</div>
                        <div className="text-xs text-slate-500">{record.source}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-emerald-600">{record.amount}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600">{record.proposalName}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`text-[10px] font-bold mb-1 ${
                          record.status === 'credited' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {record.status === 'credited' ? '已入帳' : '待處理'}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-slate-400">
                          {record.hash} <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 7: Smart Contract Execution Records */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">智能合約執行紀錄</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">合約名稱 / 事件</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">執行時間</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contract ID / Tx Hash</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">狀態 / 操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {contractExecutions.map((exe) => (
                    <tr key={exe.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{exe.contractName}</div>
                        <div className="text-xs text-indigo-600 font-medium">{exe.event}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500">{exe.timestamp}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">CID: {exe.contractId}</div>
                        <div className="text-[10px] text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                          TX: {exe.hash}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            exe.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                            exe.status === 'failed' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {exe.status === 'success' ? '成功' : exe.status === 'failed' ? '失敗' : '待確認'}
                          </span>
                          <button className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1">
                            查看詳情 <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 8: Verification Center */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <SearchCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">驗證中心</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "驗證授權紀錄", desc: "核對券商授權之合法性與時效性", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "驗證方案版本", desc: "確保當前方案為最新且經存證之版本", icon: GitCompare, color: "text-indigo-600", bg: "bg-indigo-50" },
              { title: "驗證交易紀錄", desc: "比對鏈上交易 Hash 與資產異動紀錄", icon: Database, color: "text-slate-700", bg: "bg-slate-50" },
              { title: "驗證收益分配", desc: "驗證現金流分配之來源與計算邏輯", icon: Coins, color: "text-amber-600", bg: "bg-amber-50" }
            ].map((item, i) => (
              <button key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left group">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">立即驗證</span>
                  <FileSearch className="w-4 h-4 text-emerald-600" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">查看鏈上摘要</h3>
                <p className="text-xs text-slate-400">獲取當前所有資產與授權在區塊鏈上的完整狀態快照。</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold transition-all whitespace-nowrap">
              下載鏈上存證報告
            </button>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

function RegisterPage({
  onBack,
  regData,
  setRegData,
  regStep,
  setRegStep,
  onComplete
}: {
  onBack: () => void;
  regData: RegistrationData;
  setRegData: Dispatch<SetStateAction<RegistrationData>>;
  regStep: number;
  setRegStep: Dispatch<SetStateAction<number>>;
  onComplete: () => void;
}) {
  const steps = [
    { id: 1, title: "註冊會員", icon: Users },
    { id: 2, title: "身分/資格審核", icon: ShieldCheck },
    { id: 3, title: "核發信用憑證", icon: Database },
    { id: 4, title: "填寫投資需求", icon: FileText },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [regStep]);

  const updateBasic = (field: keyof RegistrationData["basic"], value: any) => {
    setRegData(prev => ({ ...prev, basic: { ...prev.basic, [field]: value } }));
  };

  const updateAudit = (field: keyof RegistrationData["audit"], value: any) => {
    setRegData(prev => ({ ...prev, audit: { ...prev.audit, [field]: value } }));
  };

  const updateCredit = (field: keyof RegistrationData["credit"], value: any) => {
    setRegData(prev => ({ ...prev, credit: { ...prev.credit, [field]: value } }));
  };

  const toggleAuditProduct = (product: string) => {
    setRegData(prev => {
      const products = prev.audit.products.includes(product)
        ? prev.audit.products.filter(p => p !== product)
        : [...prev.audit.products, product];
      return { ...prev, audit: { ...prev.audit, products } };
    });
  };

  const toggleCreditList = (field: "sourceOfFunds" | "purpose", value: string) => {
    setRegData(prev => {
      const list = prev.credit[field].includes(value)
        ? prev.credit[field].filter(v => v !== value)
        : [...prev.credit[field], value];
      return { ...prev, credit: { ...prev.credit, [field]: list } };
    });
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回儀表板
        </button>

        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((regStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    regStep >= step.id 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  regStep >= step.id ? "text-blue-600" : "text-slate-400"
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10">
          {regStep === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">第一層：基本註冊資料</h1>
                  <p className="text-slate-500 text-sm">請填寫您的基本資訊以建立帳號。</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input label="姓名" value={regData.basic.name} onChange={(v) => updateBasic("name", v)} placeholder="請輸入真實姓名" />
                <Input label="電子郵件" value={regData.basic.email} onChange={(v) => updateBasic("email", v)} placeholder="example@mail.com" />
                <Input label="手機號碼" value={regData.basic.phone} onChange={(v) => updateBasic("phone", v)} placeholder="0912345678" />
                <Input label="居住地區 / 國家" value={regData.basic.region} onChange={(v) => updateBasic("region", v)} placeholder="例如：台灣" />
                <Input label="密碼" type="password" value={regData.basic.password} onChange={(v) => updateBasic("password", v)} placeholder="至少 8 位字元" />
                <Input label="確認密碼" type="password" value={regData.basic.confirmPassword} onChange={(v) => updateBasic("confirmPassword", v)} placeholder="再次輸入密碼" />
              </div>

              <div className="space-y-4 pt-4">
                <Checkbox 
                  id="isAdult" 
                  label="我已年滿法定年齡" 
                  checked={regData.basic.isAdult} 
                  onChange={(v) => updateBasic("isAdult", v)} 
                />
                <Checkbox 
                  id="agreedToTerms" 
                  label="我同意服務條款與隱私政策" 
                  checked={regData.basic.agreedToTerms} 
                  onChange={(v) => updateBasic("agreedToTerms", v)} 
                />
              </div>

              <button 
                onClick={() => setRegStep(2)}
                disabled={!regData.basic.name || !regData.basic.email || !regData.basic.agreedToTerms}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-2"
              >
                下一步：身分審核 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {regStep === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">第二層：會員審核資料</h1>
                  <p className="text-slate-500 text-sm">此區塊用於核發平台信用憑證，請務必填寫真實資料。</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Robot Verification */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-2 border-slate-300 rounded flex items-center justify-center bg-white">
                      <Checkbox 
                        id="isNotRobot" 
                        label="" 
                        checked={regData.audit.isNotRobot} 
                        onChange={(v) => updateAudit("isNotRobot", v)} 
                      />
                    </div>
                    <span className="font-bold text-slate-700">我不是機器人</span>
                  </div>
                  <div className="flex flex-col items-center opacity-40 grayscale">
                    <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center mb-1">
                      <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-tighter">reCAPTCHA</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold border-b border-slate-100 pb-2">身分驗證</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="身分證 / 護照姓名" value={regData.audit.idName} onChange={(v) => updateAudit("idName", v)} placeholder="請輸入證件姓名" />
                  <Input label="出生年月日" type="date" value={regData.audit.birthday} onChange={(v) => updateAudit("birthday", v)} />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700">上傳身分證證件照片</label>
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-300 transition-colors cursor-pointer bg-slate-50/50 group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Database className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-slate-700 block">點擊或拖曳上傳證件</span>
                      <span className="text-xs text-slate-400">支援 JPG, PNG, PDF (最大 5MB)</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold border-b border-slate-100 pb-2 pt-4">聯絡與職業基本資料</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="通訊地址" value={regData.audit.address} onChange={(v) => updateAudit("address", v)} className="md:col-span-2" placeholder="請輸入完整地址" />
                  <Input label="職業類別" value={regData.audit.jobCategory} onChange={(v) => updateAudit("jobCategory", v)} placeholder="例如：金融業、科技業" />
                  <Input label="任職產業" value={regData.audit.industry} onChange={(v) => updateAudit("industry", v)} placeholder="例如：軟體開發、電子製造" />
                  <Input label="公司名稱" value={regData.audit.company} onChange={(v) => updateAudit("company", v)} placeholder="請輸入任職公司全名" />
                </div>

                <h3 className="text-lg font-bold border-b border-slate-100 pb-2 pt-4">投資經驗基本資料</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-slate-700">是否有投資經驗？</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => updateAudit("hasExp", true)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${regData.audit.hasExp ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}
                      >
                        是
                      </button>
                      <button 
                        onClick={() => updateAudit("hasExp", false)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${!regData.audit.hasExp ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}
                      >
                        否
                      </button>
                    </div>
                  </div>
                  {regData.audit.hasExp && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input label="投資經驗年數" value={regData.audit.expYears} onChange={(v) => updateAudit("expYears", v)} placeholder="例如：3年" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">接觸過哪些商品？</label>
                    <div className="flex flex-wrap gap-2">
                      {["股票", "ETF", "基金", "債券", "衍生性商品", "虛擬資產", "房地產", "代幣化資產"].map(p => (
                        <button
                          key={p}
                          onClick={() => toggleAuditProduct(p)}
                          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${regData.audit.products.includes(p) ? "bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-50" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button onClick={() => setRegStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">上一步</button>
                <button 
                  onClick={() => setRegStep(3)} 
                  disabled={!regData.audit.isNotRobot || !regData.audit.idName || !regData.audit.birthday}
                  className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  下一步：財務審核 <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {regStep === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Database className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">第三層：信用憑證審核資料</h1>
                  <p className="text-slate-500 text-sm">最後一步，確認您的財務輪廓與使用目的。</p>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-lg font-bold border-b border-slate-100 pb-2">財務基本輪廓</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Select label="年收入區間" value={regData.credit.annualIncome} onChange={(v) => updateCredit("annualIncome", v)} options={["50萬以下", "50-100萬", "100-200萬", "200-500萬", "500萬以上"]} />
                  <Select label="可投資資產區間" value={regData.credit.investableAssets} onChange={(v) => updateCredit("investableAssets", v)} options={["10萬以下", "10-50萬", "50-200萬", "200-500萬", "500萬以上"]} />
                  <Select label="每月可投入金額" value={regData.credit.monthlyInvestment} onChange={(v) => updateCredit("monthlyInvestment", v)} options={["1萬以下", "1-3萬", "3-5萬", "5-10萬", "10萬以上"]} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">資金來源聲明 (可複選)</label>
                  <div className="flex flex-wrap gap-2">
                    {["薪資所得", "投資所得", "事業收入", "財產繼承", "其他"].map(s => (
                      <button
                        key={s}
                        onClick={() => toggleCreditList("sourceOfFunds", s)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${regData.credit.sourceOfFunds.includes(s) ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-500 border-slate-200"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-bold border-b border-slate-100 pb-2 pt-4">平台使用目的</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {["比較投資方案", "尋找較符合需求的配置", "了解市場方案", "未來可能與券商進一步合作"].map(p => (
                    <button
                      key={p}
                      onClick={() => toggleCreditList("purpose", p)}
                      className={`p-4 rounded-xl text-sm font-bold border text-left transition-all ${regData.credit.purpose.includes(p) ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <h3 className="text-lg font-bold border-b border-slate-100 pb-2 pt-4">會員資格聲明</h3>
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Checkbox id="decl1" label="我保證以上填寫資料皆為真實且正確" checked={regData.credit.declarationAgreed} onChange={(v) => updateCredit("declarationAgreed", v)} />
                  <Checkbox id="decl2" label="我同意平台進行審核，並了解審核結果由平台決定" checked={regData.credit.auditAgreed} onChange={(v) => updateCredit("auditAgreed", v)} />
                  <Checkbox id="decl3" label="我同意核發憑證後，將憑證用於需求提交與方案比對流程" checked={regData.credit.certificateAgreed} onChange={(v) => updateCredit("certificateAgreed", v)} />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button onClick={() => setRegStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">上一步</button>
                <button 
                  onClick={onComplete}
                  disabled={!regData.credit.declarationAgreed || !regData.credit.auditAgreed || !regData.credit.certificateAgreed}
                  className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  完成資料填寫並等待核發憑證 <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, className = "" }: { label: string, type?: string, value: string, onChange: (v: string) => void, placeholder?: string, className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
      >
        <option value="">請選擇</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Checkbox({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input 
        type="checkbox" 
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={id} className="text-sm font-medium text-slate-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
}

function WaitingPage({ 
  issuingStep, 
  issuingSteps, 
  onComplete 
}: { 
  issuingStep: number; 
  issuingSteps: string[]; 
  onComplete: () => void; 
}) {
  return (
    <div className="flex-1 bg-slate-50 py-20 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-12 md:p-16 flex flex-col items-center text-center space-y-12"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative">
              <div className="w-32 h-32 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">憑證核發中</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-lg">
              正在為您生成專屬的 InvestMatch 投資信用憑證，這通常需要幾秒鐘的時間。
            </p>
          </div>

          <div className="w-full max-w-sm space-y-5 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            {issuingSteps.map((text, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  issuingStep > index 
                  ? "bg-emerald-500 text-white" 
                  : issuingStep === index 
                  ? "bg-blue-600 text-white animate-pulse" 
                  : "bg-slate-200 text-slate-400"
                }`}>
                  {issuingStep > index ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span className={`text-base font-bold transition-all duration-500 ${
                  issuingStep >= index ? "text-slate-900" : "text-slate-400"
                }`}>
                  {text}
                </span>
                {issuingStep === index && issuingStep < issuingSteps.length && (
                  <div className="flex gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {issuingStep === issuingSteps.length && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm"
            >
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl mb-8">
                <p className="text-emerald-700 font-bold">
                  恭喜！平台已確認您的信用憑證核發成功。
                </p>
              </div>
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 text-lg"
              >
                開始填寫投資需求 <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function FormPage({ 
  onBack, 
  formData, 
  updateField, 
  toggleProduct,
  onSubmit
}: { 
  onBack: () => void;
  formData: InvestmentFormData;
  updateField: (field: keyof InvestmentFormData, value: any) => void;
  toggleProduct: (product: string) => void;
  onSubmit: () => void;
}) {
  const amountOptions = ["10萬 - 50萬", "50萬 - 200萬", "200萬 - 500萬", "500萬 - 1000萬", "1000萬以上"];
  const durationOptions = ["1年以內", "1 - 3年", "3 - 5年", "5 - 10年", "10年以上"];
  const riskOptions = ["保守型 (追求資產保值)", "穩健型 (平衡風險與收益)", "積極型 (追求高成長)", "冒險型 (高風險高回報)"];
  
  const productCategories = [
    {
      id: "stocks",
      title: "股票代幣化資產",
      slogan: "偏向成長型與市場增值機會",
      subTypes: ["個股型代幣", "產業主題型股票代幣", "股票曝險型代幣化商品"]
    },
    {
      id: "bonds",
      title: "債券代幣化資產",
      slogan: "偏向穩健收益與較低波動",
      subTypes: ["投資級債代幣", "固定收益型代幣化商品", "穩健收益型債券代幣"]
    },
    {
      id: "funds",
      title: "基金受益權代幣",
      slogan: "偏向分散配置與專業管理",
      subTypes: ["多資產配置型基金代幣", "主題型基金代幣", "平衡型基金受益權代幣"]
    },
    {
      id: "realestate",
      title: "不動產收益權型代幣",
      slogan: "偏向實體資產連結與租金收益",
      subTypes: ["租金收益型代幣", "不動產資產支持型代幣", "不動產收益分配型商品"]
    },
    {
      id: "rwa",
      title: "資產支持／現金流收益型代幣",
      slogan: "偏向多元現金流來源與 RWA 創新",
      subTypes: ["應收帳款支持型代幣", "收益分配型代幣", "現金流基礎型 RWA 商品"]
    }
  ];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const progress = useMemo(() => {
    let count = 0;
    if (formData.amountRange) count++;
    if (formData.duration) count++;
    if (formData.riskLevel) count++;
    if (formData.maxLoss) count++;
    if (formData.liquidity) count++;
    if (formData.products.length > 0) count++;
    return Math.round((count / 6) * 100);
  }, [formData]);

  return (
    <div className="flex-1 bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回首頁
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">建立您的投資需求</h1>
                  <p className="text-slate-500 text-sm">請填寫以下資訊，讓我們為您媒合最合適的券商方案。</p>
                </div>
              </div>

              {/* Section 1: Basic Info */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    1. 預計投資金額區間 (TWD) <Info className="w-4 h-4 text-slate-400" />
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amountOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateField("amountRange", opt)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          formData.amountRange === opt 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">2. 預計投資期間</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {durationOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateField("duration", opt)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          formData.duration === opt 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4">3. 風險承受度</label>
                    <select 
                      value={formData.riskLevel}
                      onChange={(e) => updateField("riskLevel", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">請選擇...</option>
                      {riskOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4">4. 最大可接受損失範圍 (%)</label>
                    <input 
                      type="text" 
                      placeholder="例如: 10% 或 20萬以內"
                      value={formData.maxLoss}
                      onChange={(e) => updateField("maxLoss", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">5. 流動性需求 (資金提領頻率)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["隨時可提領 (高流動性)", "每季/半年提領", "一年以上不提領", "無特定需求"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateField("liquidity", opt)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${
                          formData.liquidity === opt 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">6. 偏好的投資商品類型 (可複選)</label>
                  <div className="space-y-4">
                    {productCategories.map(cat => (
                      <div key={cat.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div 
                          onClick={() => toggleCategory(cat.id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="font-bold text-slate-900">{cat.title}</span>
                            <span className="text-xs text-slate-400 font-medium italic">
                              {cat.slogan}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {cat.subTypes.some(st => formData.products.includes(st)) && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">
                                已選擇
                              </span>
                            )}
                            {expandedCategories.includes(cat.id) ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedCategories.includes(cat.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                                {cat.subTypes.map(sub => (
                                  <button
                                    key={sub}
                                    onClick={() => toggleProduct(sub)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                                      formData.products.includes(sub)
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200"
                                    }`}
                                  >
                                    <span>{sub}</span>
                                    {formData.products.includes(sub) && <CheckCircle2 className="w-4 h-4" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-10"></div>

              {/* Section 2: Advanced Fields */}
              <div className="space-y-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  進階偏好 <HelpCircle className="w-4 h-4 text-slate-400" />
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">特殊投資目標或排除產業</label>
                  <textarea 
                    rows={3}
                    placeholder="例如：希望避開菸草產業、目標是五年後買房、偏好 ESG 相關標的..."
                    value={formData.specialGoals}
                    onChange={(e) => updateField("specialGoals", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Section 3: Authorization */}
              <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <div className="flex gap-4 mb-4">
                  <Lock className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">資料使用與授權說明</h4>
                    <p className="text-xs text-blue-800/70 leading-relaxed">
                      當您點擊送出後，InvestMatch 將在取得您的同意下，將上述需求整理為標準化格式並提供給合作券商作為提案依據。
                      我們嚴格遵守個資法，且再次強調：<span className="font-bold underline">本平台不直接提供投資建議，亦不負責交易執行。</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => updateField("agreedToTerms", e.target.checked)}
                    className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm font-bold text-blue-900 cursor-pointer">
                    我已閱讀並同意上述說明及平台服務條款
                  </label>
                </div>
              </div>

              <div className="mt-10 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => {/* Handle save draft */}}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> 儲存草稿
                </button>
                <button 
                  onClick={onSubmit}
                  disabled={!formData.agreedToTerms}
                  className={`flex-[2] py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    formData.agreedToTerms 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  確認並送出需求 <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900">需求摘要</h3>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    完成度 {progress}%
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-blue-600 h-full"
                  />
                </div>

                <div className="space-y-4">
                  <SummaryItem label="投資金額" value={formData.amountRange} />
                  <SummaryItem label="投資期間" value={formData.duration} />
                  <SummaryItem label="風險承受" value={formData.riskLevel} />
                  <SummaryItem label="損失範圍" value={formData.maxLoss} />
                  <SummaryItem label="流動性" value={formData.liquidity} />
                  <div className="pt-2">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">偏好商品</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.products.length > 0 ? (
                        formData.products.map(p => (
                          <span key={p} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold border border-slate-100">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300 italic">尚未選擇</span>
                      )}
                    </div>
                  </div>
                </div>

                {progress === 100 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">基本需求已填寫完成！</p>
                  </motion.div>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-indigo-900 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-indigo-300" />
                  <h4 className="font-bold text-sm">溫馨提示</h4>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  填寫越詳細，券商越能提供貼近您需求的方案。若目前不確定，也可以先選擇最接近的選項，後續與券商溝通時仍可調整。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className={`text-xs font-bold ${value ? "text-slate-700" : "text-slate-300 italic"}`}>
        {value || "尚未填寫"}
      </span>
    </div>
  );
}

