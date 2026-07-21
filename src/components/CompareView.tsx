import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Scale, 
  Download, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Check, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { EmployeeData, AnalysisResult } from '../types';
import { generateEmployeePDF } from '../utils/pdfGenerator';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar
} from 'recharts';

interface EmployeeWithPreset extends EmployeeData {
  name: string;
}

const PRESETS: EmployeeWithPreset[] = [
  {
    name: "High Performer (At Attrition Risk)",
    role: "Software Engineer",
    salary: 1150000,
    commute: 35,
    satisfaction: 3,
    tenure: 2,
    overTime: true,
    jobInvolvement: 4
  },
  {
    name: "Stable HR Leader",
    role: "HR Manager",
    salary: 850000,
    commute: 5,
    satisfaction: 9,
    tenure: 8,
    overTime: false,
    jobInvolvement: 3
  },
  {
    name: "Overworked Analyst",
    role: "Data Analyst",
    salary: 450000,
    commute: 22,
    satisfaction: 5,
    tenure: 1,
    overTime: true,
    jobInvolvement: 2
  },
  {
    name: "Disengaged Sales Rep",
    role: "Sales Executive",
    salary: 600000,
    commute: 15,
    satisfaction: 2,
    tenure: 4,
    overTime: false,
    jobInvolvement: 1
  }
];

export default function CompareView() {
  const { t, language } = useLanguage();

  // Employee A state
  const [empA, setEmpA] = useState<EmployeeData>({
    name: '',
    email: '',
    role: 'Software Engineer',
    salary: 600000,
    commute: 10,
    satisfaction: 8,
    tenure: 3,
    overTime: false,
    jobInvolvement: 3,
    emailVolumeDecline: false,
    emailAfterHours: false,
    emailSentimentRisk: false,
    emailResponseDelay: false,
  });

  // Employee B state
  const [empB, setEmpB] = useState<EmployeeData>({
    name: '',
    email: '',
    role: 'Sales Executive',
    salary: 450000,
    commute: 25,
    satisfaction: 4,
    tenure: 2,
    overTime: true,
    jobInvolvement: 2,
    emailVolumeDecline: false,
    emailAfterHours: false,
    emailSentimentRisk: false,
    emailResponseDelay: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    empA: AnalysisResult | null;
    empB: AnalysisResult | null;
  }>({ empA: null, empB: null });

  const [selectedPresetIndexA, setSelectedPresetIndexA] = useState<string>("");
  const [selectedPresetIndexB, setSelectedPresetIndexB] = useState<string>("");

  const handlePresetSelect = (target: 'A' | 'B', presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;
    
    const { name, ...data } = preset;
    if (target === 'A') {
      setSelectedPresetIndexA(presetIndex.toString());
      setEmpA(prev => ({
        ...prev,
        ...data,
        name: prev.name.trim() ? prev.name : '',
        email: prev.email.trim() ? prev.email : '',
        emailVolumeDecline: data.emailVolumeDecline || false,
        emailAfterHours: data.emailAfterHours || false,
        emailSentimentRisk: data.emailSentimentRisk || false,
        emailResponseDelay: data.emailResponseDelay || false,
      }));
    } else {
      setSelectedPresetIndexB(presetIndex.toString());
      setEmpB(prev => ({
        ...prev,
        ...data,
        name: prev.name.trim() ? prev.name : '',
        email: prev.email.trim() ? prev.email : '',
        emailVolumeDecline: data.emailVolumeDecline || false,
        emailAfterHours: data.emailAfterHours || false,
        emailSentimentRisk: data.emailSentimentRisk || false,
        emailResponseDelay: data.emailResponseDelay || false,
      }));
    }
  };

  const handleInputChange = (target: 'A' | 'B', field: keyof EmployeeData, value: any) => {
    if (target === 'A') {
      setEmpA(prev => ({ ...prev, [field]: value }));
    } else {
      setEmpB(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateFallback = (data: EmployeeData): AnalysisResult => {
    const { 
      salary, 
      commute, 
      satisfaction, 
      role, 
      tenure, 
      overTime, 
      jobInvolvement,
      emailVolumeDecline,
      emailAfterHours,
      emailSentimentRisk,
      emailResponseDelay 
    } = data;
    
    // Formula approximation matching backend fallback
    let score = 50;
    
    // satisfaction subtracts risk
    score -= (satisfaction - 5) * 8;
    // commute adds risk
    score += (commute - 10) * 0.8;
    // salary subtracts risk
    score -= (salary / 100000) * 2.5;
    // overtime adds risk
    if (overTime) score += 15;
    // job involvement adds/subtracts
    score -= (jobInvolvement - 2) * 5;
    // tenure adds stability
    score -= Math.min(tenure, 5) * 3;

    // Email risk multipliers
    if (emailVolumeDecline) score += 12;
    if (emailAfterHours) score += 8;
    if (emailSentimentRisk) score += 15;
    if (emailResponseDelay) score += 10;

    const riskScore = Math.min(Math.max(Math.round(score), 5), 95);
    const riskLevel = riskScore > 70 ? 'High' : (riskScore > 35 ? 'Medium' : 'Low');

    const decisionPath = [
      { 
        step: "Evaluate Satisfaction", 
        condition: `Satisfaction index is ${satisfaction}/10`, 
        outcome: satisfaction < 5 ? "Significant dissatisfaction risk detected" : "Employee reports healthy workplace sentiment" 
      },
      { 
        step: "Analyze Compensation", 
        condition: `Monthly compensation is ₹${salary.toLocaleString('en-IN')}`, 
        outcome: salary < 500000 ? "Below average baseline, elevating risk factor" : "Competitive bracket, stabilizes retention" 
      },
      { 
        step: "Verify Commute Strain", 
        condition: `Commute distance is ${commute} km`, 
        outcome: commute > 20 ? "Elevated transit burnout probability" : "Commute is within a manageable radius" 
      },
      {
        step: "Audit Email Risk",
        condition: `Active digital communications flags`,
        outcome: (emailSentimentRisk || emailVolumeDecline) 
          ? "Unfavorable communication sentiment or volume decline flags active" 
          : "Digital communication tone and volume remain within nominal ranges"
      }
    ];

    const recommendations = [
      satisfaction < 5 
        ? "Initiate a private stay interview to identify root causes of low satisfaction."
        : "Maintain existing engagement strategies and support career progression.",
      salary < 600000
        ? "Perform a compensation review to align compensation with current market averages."
        : "Leverage performance bonuses or spot rewards for high contributions.",
      commute > 20
        ? "Consider transitioning to a hybrid work model or offering commute-easing subsidies."
        : "Commute is within normal parameters; no immediate remote-work transitions required.",
      ...(emailVolumeDecline ? ["Address drop in digital communications volume with a supportive, non-critical conversation."] : []),
      ...(emailAfterHours ? ["Establish guidelines on after-hours email communication to alleviate digital burnout."] : []),
      ...(emailSentimentRisk ? ["Review recent communication sentiment flags and touch base privately to offer support."] : [])
    ];

    return {
      riskLevel,
      riskScore,
      decisionPath,
      recommendations
    };
  };

  const executeComparison = async () => {
    if (selectedPresetIndexA === "") {
      setError("Please load a preset profile for Employee Profile A.");
      return;
    }
    if (selectedPresetIndexB === "") {
      setError("Please load a preset profile for Employee Profile B.");
      return;
    }
    if (!empA.name?.trim()) {
      setError("Employee A Name is required.");
      return;
    }
    if (!empA.email?.trim()) {
      setError("Employee A Email is required.");
      return;
    }
    if (!empB.name?.trim()) {
      setError("Employee B Name is required.");
      return;
    }
    if (!empB.email?.trim()) {
      setError("Employee B Email is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parallel API calls to keep latency low
      const [resA, resB] = await Promise.allSettled([
        fetch('/api/analyze-attrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...empA, lang: language })
        }),
        fetch('/api/analyze-attrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...empB, lang: language })
        })
      ]);

      let dataA: AnalysisResult;
      let dataB: AnalysisResult;

      if (resA.status === 'fulfilled' && resA.value.ok) {
        dataA = await resA.value.json();
      } else {
        console.warn("Using fallback calculations for Employee A");
        dataA = calculateFallback(empA);
      }

      if (resB.status === 'fulfilled' && resB.value.ok) {
        dataB = await resB.value.json();
      } else {
        console.warn("Using fallback calculations for Employee B");
        dataB = calculateFallback(empB);
      }

      setResults({ empA: dataA, empB: dataB });
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Displaying calculated projection data.");
      setResults({
        empA: calculateFallback(empA),
        empB: calculateFallback(empB)
      });
    } finally {
      setLoading(false);
    }
  };

  const exportComparisonReport = () => {
    if (!results.empA || !results.empB) return;

    const nameA = empA.name || 'Employee A';
    const nameB = empB.name || 'Employee B';

    const headers = [
      'Metric',
      `[${nameA}] Configuration`,
      `[${nameA}] Result`,
      `[${nameB}] Configuration`,
      `[${nameB}] Result`,
      'Comparison Delta'
    ].join(',');

    const formatRow = (metric: string, configA: string, resultA: string, configB: string, resultB: string, delta: string) => {
      return [
        `"${metric}"`,
        `"${configA}"`,
        `"${resultA}"`,
        `"${configB}"`,
        `"${resultB}"`,
        `"${delta}"`
      ].join(',');
    };

    const deltaSalary = empB.salary - empA.salary;
    const deltaRisk = results.empB.riskScore - results.empA.riskScore;
    const deltaSatis = empB.satisfaction - empA.satisfaction;

    const rows = [
      formatRow('Employee Name', nameA, '-', nameB, '-', '-'),
      formatRow('Employee Email', empA.email || 'N/A', '-', empB.email || 'N/A', '-', '-'),
      formatRow('Role / Designation', empA.role, '-', empB.role, '-', '-'),
      formatRow('Monthly Salary', `₹${empA.salary.toLocaleString('en-IN')}`, '-', `₹${empB.salary.toLocaleString('en-IN')}`, '-', `${deltaSalary >= 0 ? '+' : ''}₹${deltaSalary.toLocaleString('en-IN')}`),
      formatRow('Satisfaction Index', `${empA.satisfaction}/10`, '-', `${empB.satisfaction}/10`, '-', `${deltaSatis >= 0 ? '+' : ''}${deltaSatis}`),
      formatRow('Commute Distance', `${empA.commute} km`, '-', `${empB.commute} km`, '-', `${empB.commute - empA.commute} km`),
      formatRow('Tenure in Company', `${empA.tenure} yrs`, '-', `${empB.tenure} yrs`, '-', `${empB.tenure - empA.tenure} yrs`),
      formatRow('Job Involvement', `${empA.jobInvolvement}/4`, '-', `${empB.jobInvolvement}/4`, '-', `${empB.jobInvolvement - empA.jobInvolvement}`),
      formatRow('Excess Hours / Overtime', empA.overTime ? 'Yes' : 'No', '-', empB.overTime ? 'Yes' : 'No', '-', '-'),
      formatRow('Email Volume Decline (>30%)', empA.emailVolumeDecline ? 'Yes' : 'No', '-', empB.emailVolumeDecline ? 'Yes' : 'No', '-', '-'),
      formatRow('After-Hours Email Activity', empA.emailAfterHours ? 'Yes' : 'No', '-', empB.emailAfterHours ? 'Yes' : 'No', '-', '-'),
      formatRow('Negative Tone Sentiment Flags', empA.emailSentimentRisk ? 'Yes' : 'No', '-', empB.emailSentimentRisk ? 'Yes' : 'No', '-', '-'),
      formatRow('Email Response Delays', empA.emailResponseDelay ? 'Yes' : 'No', '-', empB.emailResponseDelay ? 'Yes' : 'No', '-', '-'),
      formatRow('At-Risk Prediction Score', '-', `${results.empA.riskScore}/100`, '-', `${results.empB.riskScore}/100`, `${deltaRisk >= 0 ? '+' : ''}${deltaRisk}%`),
      formatRow('Predicted Risk Category', '-', results.empA.riskLevel, '-', results.empB.riskLevel, '-')
    ];

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "side_by_side_risk_evaluation.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Recharts combined radar chart mapping
  const radarData = [
    { 
      metric: t('satisfaction_idx') || 'Satisfaction', 
      A: empA.satisfaction, 
      B: empB.satisfaction,
      fullMark: 10 
    },
    { 
      metric: t('involvement') || 'Involvement', 
      A: empA.jobInvolvement * 2.5, 
      B: empB.jobInvolvement * 2.5,
      fullMark: 10 
    },
    { 
      metric: t('tenure_yrs') || 'Tenure', 
      A: Math.min(empA.tenure, 10), 
      B: Math.min(empB.tenure, 10),
      fullMark: 10 
    },
    { 
      metric: t('transit') || 'Transit Ease', 
      A: Math.max(1, 10 - Math.min(empA.commute, 30)/3), 
      B: Math.max(1, 10 - Math.min(empB.commute, 30)/3),
      fullMark: 10 
    },
  ];

  // Combined Bar Chart Data
  const barData = [
    { name: empA.name || 'Employee A', Score: results.empA?.riskScore || 0, fill: '#6366f1' },
    { name: empB.name || 'Employee B', Score: results.empB?.riskScore || 0, fill: '#10b981' },
    { name: 'Industry Avg', Score: 42, fill: '#94a3b8' }
  ];

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '12px',
    padding: '8px 12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" />
            <span>Dual Profile Evaluator</span>
          </div>
          <h1 className="font-display font-semibold text-2xl text-slate-900 dark:text-slate-100 mt-1">Side-by-Side Comparison</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simultaneously evaluate, analyze, and map attrition risk levels for two employee profiles.
          </p>
        </div>
        {results.empA && results.empB && (
          <button 
            onClick={exportComparisonReport}
            className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Comparison Report</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl text-amber-800 dark:text-amber-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Entry Form Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employee A Form */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col space-y-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">A</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-950 dark:text-slate-100 text-sm">Employee Profile A</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Configuration Engine</p>
              </div>
            </div>
            
            {/* Preset Selector */}
            <select 
              value={selectedPresetIndexA}
              onChange={(e) => handlePresetSelect('A', parseInt(e.target.value))}
              required
              className="text-xs border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 border outline-none text-slate-700 dark:text-slate-300 max-w-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>Load Preset Profile</option>
              {PRESETS.map((preset, idx) => (
                <option key={idx} value={idx}>{preset.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {/* Name and Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe"
                  value={empA.name || ''} 
                  onChange={(e) => handleInputChange('A', 'name', e.target.value)}
                  required
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Email</label>
                <input 
                  type="email" 
                  placeholder="jane@corp.com"
                  value={empA.email || ''} 
                  onChange={(e) => handleInputChange('A', 'email', e.target.value)}
                  required
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Role select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('designation')}</label>
              <select 
                value={empA.role} 
                onChange={(e) => handleInputChange('A', 'role', e.target.value)}
                className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 shadow-sm"
              >
                <option value="Software Engineer">{t('se_eng')}</option>
                <option value="Sales Executive">{t('se_sales')}</option>
                <option value="HR Manager">{t('se_hr')}</option>
                <option value="Research Scientist">{t('se_rs')}</option>
                <option value="Data Analyst">{t('se_da')}</option>
              </select>
            </div>

            {/* Salary slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('monthly_comp')}</label>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                  ₹{empA.salary.toLocaleString('en-IN')}
                </span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="2000000" 
                step="25000" 
                value={empA.salary} 
                onChange={(e) => handleInputChange('A', 'salary', parseInt(e.target.value))}
                className="w-full accent-indigo-600" 
              />
            </div>

            {/* Satisfaction slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('satisfaction_idx')}</label>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                  {empA.satisfaction}/10
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={empA.satisfaction} 
                onChange={(e) => handleInputChange('A', 'satisfaction', parseInt(e.target.value))}
                className="w-full accent-indigo-600" 
              />
            </div>

            {/* Commute slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('transit_dist')}</label>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                  {empA.commute} km
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1" 
                value={empA.commute} 
                onChange={(e) => handleInputChange('A', 'commute', parseInt(e.target.value))}
                className="w-full accent-indigo-600" 
              />
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('tenure_yrs')}</label>
                <input 
                  type="number" 
                  min="0" 
                  max="40" 
                  value={empA.tenure} 
                  onChange={(e) => handleInputChange('A', 'tenure', parseInt(e.target.value) || 0)}
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('involvement')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  value={empA.jobInvolvement} 
                  onChange={(e) => handleInputChange('A', 'jobInvolvement', parseInt(e.target.value) || 1)}
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Overtime */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all">
                <input 
                  type="checkbox" 
                  checked={empA.overTime} 
                  onChange={(e) => handleInputChange('A', 'overTime', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('excess_hours')}</span>
              </label>
            </div>

            {/* Email Risks */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700 pt-3">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Email Risk Factors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empA.emailVolumeDecline || false} 
                    onChange={(e) => handleInputChange('A', 'emailVolumeDecline', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Volume decline &gt;30%</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empA.emailAfterHours || false} 
                    onChange={(e) => handleInputChange('A', 'emailAfterHours', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">After-hours email</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empA.emailSentimentRisk || false} 
                    onChange={(e) => handleInputChange('A', 'emailSentimentRisk', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Negative tone flags</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empA.emailResponseDelay || false} 
                    onChange={(e) => handleInputChange('A', 'emailResponseDelay', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Response delays</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Employee B Form */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col space-y-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">B</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-950 dark:text-slate-100 text-sm">Employee Profile B</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Configuration Engine</p>
              </div>
            </div>
            
            {/* Preset Selector */}
            <select 
              value={selectedPresetIndexB}
              onChange={(e) => handlePresetSelect('B', parseInt(e.target.value))}
              required
              className="text-xs border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 border outline-none text-slate-700 dark:text-slate-300 max-w-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="" disabled>Load Preset Profile</option>
              {PRESETS.map((preset, idx) => (
                <option key={idx} value={idx}>{preset.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {/* Name and Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe"
                  value={empB.name || ''} 
                  onChange={(e) => handleInputChange('B', 'name', e.target.value)}
                  required
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Email</label>
                <input 
                  type="email" 
                  placeholder="jane@corp.com"
                  value={empB.email || ''} 
                  onChange={(e) => handleInputChange('B', 'email', e.target.value)}
                  required
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Role select */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('designation')}</label>
              <select 
                value={empB.role} 
                onChange={(e) => handleInputChange('B', 'role', e.target.value)}
                className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 shadow-sm"
              >
                <option value="Software Engineer">{t('se_eng')}</option>
                <option value="Sales Executive">{t('se_sales')}</option>
                <option value="HR Manager">{t('se_hr')}</option>
                <option value="Research Scientist">{t('se_rs')}</option>
                <option value="Data Analyst">{t('se_da')}</option>
              </select>
            </div>

            {/* Salary slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('monthly_comp')}</label>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                  ₹{empB.salary.toLocaleString('en-IN')}
                </span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="2000000" 
                step="25000" 
                value={empB.salary} 
                onChange={(e) => handleInputChange('B', 'salary', parseInt(e.target.value))}
                className="w-full accent-emerald-600" 
              />
            </div>

            {/* Satisfaction slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('satisfaction_idx')}</label>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                  {empB.satisfaction}/10
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={empB.satisfaction} 
                onChange={(e) => handleInputChange('B', 'satisfaction', parseInt(e.target.value))}
                className="w-full accent-emerald-600" 
              />
            </div>

            {/* Commute slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('transit_dist')}</label>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                  {empB.commute} km
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1" 
                value={empB.commute} 
                onChange={(e) => handleInputChange('B', 'commute', parseInt(e.target.value))}
                className="w-full accent-emerald-600" 
              />
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('tenure_yrs')}</label>
                <input 
                  type="number" 
                  min="0" 
                  max="40" 
                  value={empB.tenure} 
                  onChange={(e) => handleInputChange('B', 'tenure', parseInt(e.target.value) || 0)}
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('involvement')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  value={empB.jobInvolvement} 
                  onChange={(e) => handleInputChange('B', 'jobInvolvement', parseInt(e.target.value) || 1)}
                  className="w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 border outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Overtime */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all">
                <input 
                  type="checkbox" 
                  checked={empB.overTime} 
                  onChange={(e) => handleInputChange('B', 'overTime', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('excess_hours')}</span>
              </label>
            </div>

            {/* Email Risks */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700 pt-3">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block text-emerald-600 dark:text-emerald-400">Email Risk Factors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empB.emailVolumeDecline || false} 
                    onChange={(e) => handleInputChange('B', 'emailVolumeDecline', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Volume decline &gt;30%</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empB.emailAfterHours || false} 
                    onChange={(e) => handleInputChange('B', 'emailAfterHours', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">After-hours email</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empB.emailSentimentRisk || false} 
                    onChange={(e) => handleInputChange('B', 'emailSentimentRisk', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Negative tone flags</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={empB.emailResponseDelay || false} 
                    onChange={(e) => handleInputChange('B', 'emailResponseDelay', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Response delays</span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Evaluate Trigger Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={executeComparison}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-3 disabled:opacity-75 disabled:cursor-not-allowed transform active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Simulating Comparative Paths...</span>
            </>
          ) : (
            <>
              <Scale className="w-5 h-5" />
              <span>Execute Parallel Attrition Evaluation</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Area */}
      <AnimatePresence mode="wait">
        {results.empA && results.empB && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Primary Scores Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Employee A Risk Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs px-3 mb-3 uppercase tracking-wider">
                  {empA.name || 'EMPLOYEE A'}
                </div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attrition Risk Score</h4>
                <div className={`text-6xl font-display font-extrabold my-2 ${
                  results.empA.riskLevel === 'High' ? 'text-rose-600' : 
                  results.empA.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {results.empA.riskScore}
                  <span className="text-lg font-medium text-slate-400">/100</span>
                </div>
                
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                  results.empA.riskLevel === 'High' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800/50' : 
                  results.empA.riskLevel === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-200 dark:border-amber-800/50' : 
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border-emerald-200 dark:border-emerald-800/50'
                }`}>
                  {results.empA.riskLevel} Risk
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-xs leading-relaxed">
                  Based on AI synthesis of designated characteristics and current market vectors.
                </p>
                <button
                  type="button"
                  onClick={() => generateEmployeePDF(empA, results.empA!)}
                  className="mt-4 w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  PDF Summary Report
                </button>
              </div>

              {/* Dynamic Risk Differential Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold text-xs px-3 mb-3">
                  DIFFERENTIAL LOG
                </div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Predicted Risk Gap</h4>
                
                {results.empA.riskScore === results.empB.riskScore ? (
                  <div className="flex flex-col items-center my-4">
                    <Minus className="w-14 h-14 text-slate-400" />
                    <div className="text-xl font-display font-bold text-slate-700 dark:text-slate-300 mt-2">Zero Variance</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center my-2">
                    <div className={`text-6xl font-display font-extrabold ${
                      Math.abs(results.empA.riskScore - results.empB.riskScore) > 30 ? 'text-rose-600' : 'text-indigo-600'
                    }`}>
                      {Math.abs(results.empA.riskScore - results.empB.riskScore)}
                      <span className="text-xl font-medium text-slate-400">%</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium mt-3">
                      {results.empA.riskScore > results.empB.riskScore ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-rose-500" />
                          <span>{empA.name || 'Employee A'} holds a higher attrition risk</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span>{empB.name || 'Employee B'} holds a higher attrition risk</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-3 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block" />
                    <span className="truncate max-w-[100px]">{empA.name || 'A'}: {results.empA.riskScore}%</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                    <span className="truncate max-w-[100px]">{empB.name || 'B'}: {results.empB.riskScore}%</span>
                  </div>
                </div>
              </div>

              {/* Employee B Risk Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 mb-3 uppercase tracking-wider">
                  {empB.name || 'EMPLOYEE B'}
                </div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attrition Risk Score</h4>
                <div className={`text-6xl font-display font-extrabold my-2 ${
                  results.empB.riskLevel === 'High' ? 'text-rose-600' : 
                  results.empB.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {results.empB.riskScore}
                  <span className="text-lg font-medium text-slate-400">/100</span>
                </div>
                
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                  results.empB.riskLevel === 'High' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800/50' : 
                  results.empB.riskLevel === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-200 dark:border-amber-800/50' : 
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border-emerald-200 dark:border-emerald-800/50'
                }`}>
                  {results.empB.riskLevel} Risk
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-xs leading-relaxed">
                  Based on AI synthesis of designated characteristics and current market vectors.
                </p>
                <button
                  type="button"
                  onClick={() => generateEmployeePDF(empB, results.empB!)}
                  className="mt-4 w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  PDF Summary Report
                </button>
              </div>

            </div>

            {/* Combined Visualization & Analysis Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radar Chart Overlay (Comparison of profiles) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Combined Profile Vector Overlay</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-50 dark:bg-slate-900 p-1 rounded text-slate-500 uppercase">Normalized (10 Max)</span>
                </div>
                
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#94a3b8" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      
                      <Radar name={empA.name || "Employee A"} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                      <Radar name={empB.name || "Employee B"} dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                      
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} iconSize={10} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attrition Risk Comparison Bar Chart */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Risk Benchmark comparison</h3>
                </div>
                
                <div className="flex-1 min-h-0 py-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(99,102,241,0.03)' }} contentStyle={tooltipStyle} />
                      <Bar 
                        dataKey="Score" 
                        radius={[8, 8, 0, 0]} 
                        barSize={32}
                      >
                        {barData.map((entry, index) => (
                          <rect key={`rect-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Direct Feature Parameter Comparison Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                <Scale className="w-4 h-4 text-slate-500" />
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Metrics Variance Ledger</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Evaluation Parameter</th>
                      <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">Employee A</th>
                      <th className="py-3 px-4 text-emerald-500">Employee B</th>
                      <th className="py-3 px-4">Variance / Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-3 px-4 font-semibold">Designation / Role</td>
                      <td className="py-3 px-4">{empA.role}</td>
                      <td className="py-3 px-4">{empB.role}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">-</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Monthly Compensation</td>
                      <td className="py-3 px-4 font-mono">₹{empA.salary.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-mono">₹{empB.salary.toLocaleString('en-IN')}</td>
                      <td className={`py-3 px-4 font-mono font-bold ${empB.salary - empA.salary >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {empB.salary - empA.salary >= 0 ? '+' : ''}₹{(empB.salary - empA.salary).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Job Satisfaction Index</td>
                      <td className="py-3 px-4 font-mono">{empA.satisfaction} / 10</td>
                      <td className="py-3 px-4 font-mono">{empB.satisfaction} / 10</td>
                      <td className={`py-3 px-4 font-mono font-bold ${empB.satisfaction - empA.satisfaction >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {empB.satisfaction - empA.satisfaction >= 0 ? '+' : ''}{empB.satisfaction - empA.satisfaction}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Commute Distance</td>
                      <td className="py-3 px-4 font-mono">{empA.commute} km</td>
                      <td className="py-3 px-4 font-mono">{empB.commute} km</td>
                      <td className={`py-3 px-4 font-mono font-bold ${empB.commute - empA.commute > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {empB.commute - empA.commute >= 0 ? '+' : ''}{empB.commute - empA.commute} km
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Company Tenure</td>
                      <td className="py-3 px-4 font-mono">{empA.tenure} years</td>
                      <td className="py-3 px-4 font-mono">{empB.tenure} years</td>
                      <td className={`py-3 px-4 font-mono font-semibold ${empB.tenure - empA.tenure >= 0 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                        {empB.tenure - empA.tenure >= 0 ? '+' : ''}{empB.tenure - empA.tenure} yrs
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Job Involvement Rating</td>
                      <td className="py-3 px-4 font-mono">{empA.jobInvolvement} / 4</td>
                      <td className="py-3 px-4 font-mono">{empB.jobInvolvement} / 4</td>
                      <td className={`py-3 px-4 font-mono font-semibold ${empB.jobInvolvement - empA.jobInvolvement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {empB.jobInvolvement - empA.jobInvolvement >= 0 ? '+' : ''}{empB.jobInvolvement - empA.jobInvolvement}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Excess Hours (Overtime)</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${empA.overTime ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                          {empA.overTime ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${empB.overTime ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                          {empB.overTime ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Directives Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Employee A Directives */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all flex flex-col">
                <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Strategic Directives - Employee A</h3>
                </div>
                
                <ul className="space-y-3 flex-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {results.empA.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700">
                      <span className="text-indigo-600 mr-2.5 font-bold mt-0.5">#{idx + 1}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Employee B Directives */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-all flex flex-col">
                <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Strategic Directives - Employee B</h3>
                </div>
                
                <ul className="space-y-3 flex-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {results.empB.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700">
                      <span className="text-emerald-500 mr-2.5 font-bold mt-0.5">#{idx + 1}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Decision Paths Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Employee A Paths */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Logic Trace - Employee A</h3>
                </div>
                
                <div className="space-y-3 flex-1">
                  {results.empA.decisionPath.map((path, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-750">
                      <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">{path.step}</div>
                      <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{path.condition}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0 mt-0.5" />
                        <span>{path.outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee B Paths */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 mb-4 shrink-0">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Logic Trace - Employee B</h3>
                </div>
                
                <div className="space-y-3 flex-1">
                  {results.empB.decisionPath.map((path, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-750">
                      <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">{path.step}</div>
                      <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{path.condition}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0 mt-0.5" />
                        <span>{path.outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
