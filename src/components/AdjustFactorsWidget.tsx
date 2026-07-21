import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  RotateCcw, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert,
  Sliders,
  DollarSign,
  Briefcase,
  Compass,
  Heart,
  Clock,
  Mail,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { EmployeeData, AnalysisResult } from '../types';
import { useLanguage } from './LanguageContext';

interface AdjustFactorsWidgetProps {
  baselineData: EmployeeData;
  baselineResult: AnalysisResult | null;
  onApplySimulation: (simulatedData: EmployeeData) => void;
}

export default function AdjustFactorsWidget({ 
  baselineData, 
  baselineResult, 
  onApplySimulation 
}: AdjustFactorsWidgetProps) {
  const { t } = useLanguage();
  
  // State for the temporary/simulated factors
  const [simData, setSimData] = useState<EmployeeData>({ ...baselineData });
  const [simScore, setSimScore] = useState<number>(38);
  const [scoreDiff, setScoreDiff] = useState<number>(0);

  // Sync state when baseline changes (e.g. if parent form is submitted)
  useEffect(() => {
    setSimData({ ...baselineData });
  }, [baselineData]);

  // Calculate simulated score in real-time based on deltas
  useEffect(() => {
    const baseScore = baselineResult?.riskScore ?? 38;
    
    let delta = 0;

    // 1. Satisfaction Difference
    const satDiff = simData.satisfaction - baselineData.satisfaction;
    delta -= satDiff * 8; // -8% risk per point of satisfaction increase

    // 2. Overtime Workload Difference
    if (simData.overTime !== baselineData.overTime) {
      delta += simData.overTime ? 15 : -15;
    }

    // 3. Compensation Difference (percentage based)
    const pctSalaryChange = (simData.salary - baselineData.salary) / (baselineData.salary || 50000);
    delta -= pctSalaryChange * 35; // Every 10% raise reduces risk by 3.5 points

    // 4. Transit Commute Difference
    const commuteDiff = simData.commute - baselineData.commute;
    delta += (commuteDiff / 5) * 2; // Every 5km reduction decreases risk by 2 points

    // 5. Job Involvement Difference
    const involvementDiff = simData.jobInvolvement - baselineData.jobInvolvement;
    delta -= involvementDiff * 6; // Every level of involvement increase reduces risk by 6 points

    // 6. Telemetry Risk Indicators Differences
    if ((simData.emailVolumeDecline ?? false) !== (baselineData.emailVolumeDecline ?? false)) {
      delta += simData.emailVolumeDecline ? 12 : -12;
    }
    if ((simData.emailAfterHours ?? false) !== (baselineData.emailAfterHours ?? false)) {
      delta += simData.emailAfterHours ? 8 : -8;
    }
    if ((simData.emailSentimentRisk ?? false) !== (baselineData.emailSentimentRisk ?? false)) {
      delta += simData.emailSentimentRisk ? 15 : -15;
    }
    if ((simData.emailResponseDelay ?? false) !== (baselineData.emailResponseDelay ?? false)) {
      delta += simData.emailResponseDelay ? 10 : -10;
    }

    const finalSimulated = Math.min(Math.max(Math.round(baseScore + delta), 4), 98);
    setSimScore(finalSimulated);
    setScoreDiff(finalSimulated - baseScore);
  }, [simData, baselineData, baselineResult]);

  const handleSliderChange = (name: keyof EmployeeData, value: number) => {
    setSimData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name: keyof EmployeeData) => {
    setSimData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Preset Scenarios
  const applyPreset = (presetType: 'retention' | 'worklife' | 'commute' | 'burnout') => {
    switch (presetType) {
      case 'retention':
        setSimData(prev => ({
          ...prev,
          salary: Math.min(2000000, Math.round(baselineData.salary * 1.15)), // 15% increase
          satisfaction: Math.min(10, baselineData.satisfaction + 1),
          overTime: false,
          emailAfterHours: false
        }));
        break;
      case 'worklife':
        setSimData(prev => ({
          ...prev,
          overTime: false,
          emailAfterHours: false,
          satisfaction: Math.min(10, baselineData.satisfaction + 1)
        }));
        break;
      case 'commute':
        setSimData(prev => ({
          ...prev,
          commute: Math.max(1, Math.min(5, baselineData.commute - 15)) // Reduce commute as if remote/hybrid
        }));
        break;
      case 'burnout':
        setSimData(prev => ({
          ...prev,
          overTime: true,
          emailAfterHours: true,
          satisfaction: Math.max(1, baselineData.satisfaction - 2),
          emailVolumeDecline: true
        }));
        break;
    }
  };

  const resetToBaseline = () => {
    setSimData({ ...baselineData });
  };

  const applyAsBaseline = () => {
    onApplySimulation(simData);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-rose-500 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20';
    if (score >= 35) return 'text-amber-500 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20';
    return 'text-emerald-500 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20';
  };

  const getRiskLevelName = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 35) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Factors Adjustment Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust variables and evaluate retention impact in real-time.
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetToBaseline}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Middle: Adjustable Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Preset Quick Actions */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 rounded-xl p-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Scenario Presets</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('retention')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-150 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Retention Raise (+15%)</span>
              </button>
              <button
                onClick={() => applyPreset('worklife')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-150 dark:border-indigo-900/40 text-indigo-750 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Limit Overtime</span>
              </button>
              <button
                onClick={() => applyPreset('commute')}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-900/40 border border-sky-150 dark:border-sky-900/40 text-sky-750 dark:text-sky-450 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Hybrid/Remote Policy</span>
              </button>
              <button
                onClick={() => applyPreset('burnout')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-150 dark:border-rose-900/40 text-rose-750 dark:text-rose-450 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Burnout Scenario</span>
              </button>
            </div>
          </div>

          {/* Interactive Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Salary */}
            <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  Monthly Salary
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{simData.salary.toLocaleString('en-IN')}
                </span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="2000000" 
                step="25000" 
                value={simData.salary} 
                onChange={(e) => handleSliderChange('salary', Number(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹50K</span>
                <span>₹2M</span>
              </div>
            </div>

            {/* Satisfaction */}
            <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-slate-400" />
                  Satisfaction Score
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {simData.satisfaction} / 10
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={simData.satisfaction} 
                onChange={(e) => handleSliderChange('satisfaction', Number(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (Low)</span>
                <span>10 (High)</span>
              </div>
            </div>

            {/* Commute */}
            <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Compass className="w-4 h-4 mr-1 text-slate-400" />
                  Transit/Commute
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {simData.commute} km
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1" 
                value={simData.commute} 
                onChange={(e) => handleSliderChange('commute', Number(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Job Involvement */}
            <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-slate-400" />
                  Job Involvement Index
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  Level {simData.jobInvolvement} / 4
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="4" 
                step="1" 
                value={simData.jobInvolvement} 
                onChange={(e) => handleSliderChange('jobInvolvement', Number(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (Low)</span>
                <span>4 (High)</span>
              </div>
            </div>
          </div>

          {/* Overtime and Email toggles */}
          <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-150 dark:border-slate-750">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Workload & Digital Touchpoints</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-150 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  Excessive Overtime
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={simData.overTime} 
                    onChange={() => handleToggleChange('overTime')} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-200 dark:after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-150 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  Disengagement (&gt;30% Volume Drop)
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={simData.emailVolumeDecline || false} 
                    onChange={() => handleToggleChange('emailVolumeDecline')} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-200 dark:after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-150 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  After-Hours/Weekend Activity
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={simData.emailAfterHours || false} 
                    onChange={() => handleToggleChange('emailAfterHours')} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-200 dark:after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-150 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-slate-400" />
                  Detached Communication Tone
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={simData.emailSentimentRisk || false} 
                    onChange={() => handleToggleChange('emailSentimentRisk')} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-slate-200 dark:after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

            </div>
          </div>
        </div>

        {/* Right: Comparative Score display & apply buttons */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-2xl -mr-16 -mt-16" />

            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-4">
              Simulated Attrition Output
            </span>

            {/* Simulated Score Meter */}
            <div className="relative flex items-center justify-center w-36 h-36">
              
              {/* Outer circular indicator trail */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  className="stroke-slate-200 dark:stroke-slate-800" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <motion.circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  className={
                    simScore >= 70 ? 'stroke-rose-500' :
                    simScore >= 35 ? 'stroke-amber-500' : 'stroke-emerald-500'
                  }
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 62 * (1 - simScore / 100)}` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>

              {/* Central Text Panel */}
              <div className="text-center z-10 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Simulated</span>
                <span className="text-4xl font-display font-black text-slate-900 dark:text-slate-100">
                  {simScore}%
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 px-2 py-0.5 rounded-full inline-block ${getRiskColor(simScore)}`}>
                  {getRiskLevelName(simScore)} Risk
                </span>
              </div>
            </div>

            {/* Score Comparison Delta */}
            <div className="mt-5 w-full flex items-center justify-around text-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 dark:border-slate-750">
              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Baseline</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {baselineResult?.riskScore ?? '--'}%
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Risk Shift</span>
                <div className="flex items-center justify-center space-x-1 mt-0.5">
                  {scoreDiff > 0 ? (
                    <span className="text-xs font-bold text-rose-500 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                      +{scoreDiff}%
                    </span>
                  ) : scoreDiff < 0 ? (
                    <span className="text-xs font-bold text-emerald-500 flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                      {scoreDiff}%
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">
                      No Change
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={applyAsBaseline}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center uppercase tracking-wider space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Apply to Employee Baseline Profile</span>
            </button>
            <div className="flex items-start space-x-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-lg text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Applying will update the primary profile attributes and trigger a full AI decision path projection via the deep inference engine.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
