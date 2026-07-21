import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Users, Network, ShieldAlert, ArrowRight, Loader2, FileText, Download, Copy, Check, X } from 'lucide-react';
import { AnalysisResult, EmployeeData } from '../types';
import { useLanguage } from './LanguageContext';
import ThreeDecisionTree from './ThreeDecisionTree';
import ComparativeAnalysis from './ComparativeAnalysis';
import { generateEmployeePDF } from '../utils/pdfGenerator';
import CareerTimeline from './CareerTimeline';
import AdjustFactorsWidget from './AdjustFactorsWidget';

export default function AnalysisView() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<EmployeeData>({
    role: 'Software Engineer',
    salary: 500000,
    commute: 12,
    satisfaction: 7,
    tenure: 3,
    overTime: false,
    jobInvolvement: 3,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  
  const [selectedDirective, setSelectedDirective] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateEmailTemplate = (directive: string) => {
    const empName = formData.name || "[Employee Name]";
    const empEmail = formData.email ? ` <${formData.email}>` : "";
    return `To: ${empName}${empEmail}
Subject: ${t('private_consultation')}

Hi ${empName},

I hope you're having a good week.

I'm reaching out because I'd love to schedule a brief touchpoint with you. As a valued ${formData.role === 'Software Engineer' ? 'Software Engineer' : formData.role === 'Sales Executive' ? 'Sales Executive' : formData.role === 'HR Manager' ? 'HR Manager' : formData.role === 'Research Scientist' ? 'Research Scientist' : 'Data Analyst'} on our team, your continued growth and satisfaction are very important to us.

Currently, I understand you're navigating a transit distance of ${formData.commute}km and balancing your responsibilities at your current compensation level. I also noted your recent satisfaction indicators, and I want to ensure we are doing everything we can to support you.
${formData.emailAfterHours ? `\nIn particular, we want to ensure your workload is sustainable and support a healthy work-life communication boundary (noting recent high volumes of late-night/weekend emailing).\n` : ''}${formData.emailVolumeDecline ? `\nI also want to check in on how you're feeling about team collaboration and support, ensuring you have everything needed to stay engaged and energized.\n` : ''}
Specifically, I'd like to dedicate some time to ${directive.toLowerCase()}.

Please let me know when you might be free for a 15-minute chat this week.

Best regards,

[Your Name]
HR Business Partner`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const runAnalysis = async (e?: React.FormEvent, customData?: EmployeeData) => {
    if (e) e.preventDefault();
    
    const targetData = customData || formData;
    
    // Enforce required validation when submitted via form (e is defined)
    if (e) {
      if (!formData.name?.trim()) {
        alert('Employee Name is required.');
        return;
      }
      if (!formData.email?.trim()) {
        alert('Employee Email is required.');
        return;
      }
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/analyze-attrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetData, lang: language })
      });
      
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setLogEntries(prev => [...prev, { timestamp: new Date().toISOString(), input: targetData, output: data }]);
      } else {
        alert(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateMilestone = (simData: EmployeeData) => {
    setFormData(simData);
    runAnalysis(undefined, simData);
  };

  const exportLogs = () => {
    let rowsToExport = [...logEntries];
    
    // Always append the current slider state as the latest entry, even if un-analyzed
    // or just use the current analysis result if available
    const currentEntry = {
      timestamp: new Date().toISOString(),
      input: formData,
      output: result || {
        riskScore: 0,
        riskLevel: 'Unknown',
        recommendations: ['Run analysis to generate recommendations'],
        decisionPath: []
      }
    };
    
    rowsToExport.push(currentEntry);
    
    const headers = [
      'Timestamp',
      'Role',
      'Salary',
      'Commute (km)',
      'Satisfaction (1-10)',
      'Tenure (Yrs)',
      'Involvement (1-4)',
      'OverTime',
      'Risk Score',
      'Risk Level',
      'Recommendations',
      'Decision Path'
    ].join(',');

    const csvRows = rowsToExport.map(log => {
      const { timestamp, input, output } = log;
      
      const recommendations = `"${output.recommendations.join(' | ').replace(/"/g, '""')}"`;
      const pathLogs = `"${output.decisionPath.map((p: any) => `${p.step}: ${p.outcome}`).join(' -> ').replace(/"/g, '""')}"`;
      
      return [
        timestamp,
        `"${input.role}"`,
        input.salary,
        input.commute,
        input.satisfaction,
        input.tenure,
        input.jobInvolvement,
        input.overTime ? 'Yes' : 'No',
        output.riskScore,
        output.riskLevel,
        recommendations,
        pathLogs
      ].join(',');
    });

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "nexus_attrition_report.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    document.body.removeChild(downloadAnchorNode);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100">{t('predictive_model')}</h2>
          <p className="text-xs text-slate-500 mt-1">{t('config_profile')}</p>
        </div>
        <button 
          onClick={exportLogs}
          className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('export_csv')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Input Form */}
        <motion.div 
          id="tour-predictive"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-5 flex flex-col overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center space-x-3 mb-6 text-slate-900 dark:text-slate-100">
            <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-display font-semibold text-sm">{t('subject_profile')}</h2>
          </div>
          
          <form onSubmit={runAnalysis} className="space-y-5 flex-1">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="e.g. Jane Doe"
                  value={formData.name || ''} 
                  onChange={handleInputChange} 
                  required
                  className="w-full text-xs border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 border outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-300 dark:[color-scheme:dark]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Emp Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="jane@corp.com"
                  value={formData.email || ''} 
                  onChange={handleInputChange} 
                  required
                  className="w-full text-xs border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 border outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-300 dark:[color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('designation')}</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 p-2.5 border outline-none transition-all text-slate-900 dark:text-slate-100 shadow-sm dark:[color-scheme:dark]">
                <option value="Software Engineer">{t('se_eng')}</option>
                <option value="Sales Executive">{t('se_sales')}</option>
                <option value="HR Manager">{t('se_hr')}</option>
                <option value="Research Scientist">{t('se_rs')}</option>
                <option value="Data Analyst">{t('se_da')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex justify-between">
                <span>{t('monthly_comp')}</span>
                <span className="text-indigo-700 font-mono tracking-tight text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">₹{formData.salary.toLocaleString('en-IN')}</span>
              </label>
              <input type="range" name="salary" min="50000" max="2000000" step="25000" value={formData.salary} onChange={handleInputChange} className="w-full accent-indigo-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex justify-between">
                <span>{t('satisfaction_idx')}</span>
                <span className="text-indigo-700 font-mono tracking-tight text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{formData.satisfaction}/10</span>
              </label>
              <input type="range" name="satisfaction" min="1" max="10" step="1" value={formData.satisfaction} onChange={handleInputChange} className="w-full accent-indigo-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex justify-between">
                <span>{t('transit_dist')}</span>
                <span className="text-indigo-700 font-mono tracking-tight text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{formData.commute} km</span>
              </label>
              <input type="range" name="commute" min="1" max="50" step="1" value={formData.commute} onChange={handleInputChange} className="w-full accent-indigo-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('tenure_yrs')}</label>
                <input type="number" name="tenure" min="0" max="40" value={formData.tenure} onChange={handleInputChange} className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 border outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-300 dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('involvement')}</label>
                <input type="number" name="jobInvolvement" min="1" max="4" value={formData.jobInvolvement} onChange={handleInputChange} className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 border outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-300 dark:[color-scheme:dark]" title="1 to 4 scale" />
              </div>
            </div>             <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600">
                <div className="relative">
                  <input type="checkbox" name="overTime" checked={formData.overTime} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-slate-200 dark:after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide">{t('excess_hours')}</span>
              </label>
            </div>

            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700 pt-3">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Email Risk Factors</label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center space-x-3 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    name="emailVolumeDecline"
                    checked={formData.emailVolumeDecline || false} 
                    onChange={handleInputChange}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Volume decline &gt;30% (Disengagement)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    name="emailAfterHours"
                    checked={formData.emailAfterHours || false} 
                    onChange={handleInputChange}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Excessive after-hours email (Burnout)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    name="emailSentimentRisk"
                    checked={formData.emailSentimentRisk || false} 
                    onChange={handleInputChange}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Detached/negative tone detected</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    name="emailResponseDelay"
                    checked={formData.emailResponseDelay || false} 
                    onChange={handleInputChange}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Prolonged response delays</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Hexagon className="w-4 h-4 mr-2" strokeWidth={2} /> {t('execute_projection')}</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Center Column: 3D Visualization */}
        <div className="lg:col-span-6 flex flex-col space-y-4 min-h-[500px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 flex flex-col relative overflow-hidden"
          >
             <ThreeDecisionTree 
                decisionPath={result?.decisionPath || []} 
                riskLevel={result?.riskLevel || null} 
                hoveredStepIndex={hoveredStepIndex}
              />
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                      {t('strategic_directives')}
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-indigo-600 mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                          <span 
                            className="leading-relaxed hover:text-indigo-600 cursor-pointer transition-colors border-b border-transparent hover:border-indigo-300"
                            onClick={() => setSelectedDirective(rec)}
                          >
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-right ml-6 shrink-0 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">{t('calculated_risk')}</div>
                    <div className={`text-4xl font-display font-bold ${
                      result.riskLevel === 'High' ? 'text-rose-600' : 
                      result.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {result.riskScore}<span className="text-base font-medium opacity-40">/100</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => generateEmployeePDF(formData, result)}
                      className="mt-3 w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Comparative Analysis & Decision Path Text */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 flex flex-col space-y-4"
        >
          <div className="h-1/2 min-h-[300px]">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-5 text-slate-900 dark:text-slate-100 shrink-0">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-display font-semibold text-sm">{t('market_vector')}</h2>
              </div>
              <div className="flex-1 min-h-0">
                <ComparativeAnalysis 
                  currentData={result ? formData : null} 
                  riskScore={result?.riskScore || null} 
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-5 text-slate-900 dark:text-slate-100 shrink-0">
                <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="font-display font-semibold text-sm">{t('logic_trace')}</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {!result ? (
                   <div className="h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest text-center whitespace-pre-line">
                     {t('awaiting_seq')}
                   </div>
                ) : result.decisionPath.map((step, idx) => (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setHoveredStepIndex(idx)}
                    onMouseLeave={() => setHoveredStepIndex(null)}
                    className={`p-3 rounded-lg border text-sm transition-colors cursor-default ${hoveredStepIndex === idx ? 'border-indigo-400 shadow-md bg-indigo-50/50 dark:bg-indigo-900/40' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                  >
                    <div className="text-[10px] font-bold text-indigo-600 mb-1 tracking-widest uppercase">{step.step}</div>
                    <div className="text-slate-800 dark:text-slate-200 text-xs font-mono mb-2 bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm break-words">{step.condition}</div>
                    <div className="text-slate-600 dark:text-slate-200 text-xs flex items-start">
                      <ArrowRight className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="leading-relaxed">{step.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Adjust Factors Sandbox */}
      <AdjustFactorsWidget 
        baselineData={formData} 
        baselineResult={result} 
        onApplySimulation={handleSimulateMilestone} 
      />

      {/* Interactive Career Timeline */}
      <CareerTimeline 
        formData={formData} 
        result={result} 
        onSimulateMilestone={handleSimulateMilestone} 
      />

      {/* Email Template Modal */}
      <AnimatePresence>
        {selectedDirective && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDirective(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">{t('comm_template')}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">{t('ai_generated_outreach')}</p>
                </div>
                <button 
                  onClick={() => setSelectedDirective(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <textarea 
                  readOnly
                  className="w-full h-64 p-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none custom-scrollbar"
                  value={generateEmailTemplate(selectedDirective)}
                />
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="text-xs text-slate-500 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  {t('ready_to_send')}
                </div>
                <button 
                  onClick={() => handleCopy(generateEmailTemplate(selectedDirective))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('copy_clipboard')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

