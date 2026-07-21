import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Briefcase, 
  Coins, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Milestone, 
  UserCheck, 
  Compass, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { EmployeeData, AnalysisResult } from '../types';
import { useLanguage } from './LanguageContext';

interface MilestoneData {
  id: string;
  title: string;
  timeLabel: string;
  year: number;
  status: 'completed' | 'current' | 'simulated';
  role: string;
  salary: number;
  satisfaction: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  milestoneDescription: string;
  positiveDrivers: string[];
  riskSignals: string[];
  actionPlan: string;
  // Form fields to simulate
  formDataState: EmployeeData;
}

interface CareerTimelineProps {
  formData: EmployeeData;
  result: AnalysisResult | null;
  onSimulateMilestone: (data: EmployeeData) => void;
}

export default function CareerTimeline({ formData, result, onSimulateMilestone }: CareerTimelineProps) {
  const { t } = useLanguage();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('current');
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);

  // Generate milestones dynamically when formData or result changes
  useEffect(() => {
    const currentTenure = formData.tenure;
    const finalRiskScore = result?.riskScore ?? 38; // Default or calculated
    const finalRiskLevel = result?.riskLevel ?? 'Low';

    const generated: MilestoneData[] = [];
    const points: number[] = [0];

    if (currentTenure === 1) {
      points.push(1);
    } else if (currentTenure === 2) {
      points.push(1);
      points.push(2);
    } else if (currentTenure > 2) {
      const p1 = Math.round(currentTenure / 3);
      const p2 = Math.round((currentTenure * 2) / 3);
      if (p1 > 0 && p1 < currentTenure) points.push(p1);
      if (p2 > p1 && p2 < currentTenure) points.push(p2);
      points.push(currentTenure);
    }

    points.forEach((year, index) => {
      const isCurrent = year === currentTenure;
      const isFirst = year === 0;

      // Calculate state for this year based on linear interpolation/assumptions
      const progressRatio = currentTenure > 0 ? year / currentTenure : 1;
      
      let computedSalary = formData.salary;
      let computedSatisfaction = formData.satisfaction;
      let computedRiskScore = finalRiskScore;
      
      if (!isCurrent) {
         // rough simulation for past data
         computedSalary = Math.round(formData.salary * (0.82 + (0.18 * progressRatio)));
         computedSatisfaction = Math.min(10, Math.max(1, Math.round(formData.satisfaction + (1 - progressRatio) * 2)));
         computedRiskScore = Math.max(12, Math.round(finalRiskScore * (0.4 + (0.6 * progressRatio))));
      }

      const computedRiskLevel = computedRiskScore > 65 ? 'High' : computedRiskScore > 35 ? 'Medium' : 'Low';

      let title = '';
      let desc = '';
      let role = formData.role;

      if (isFirst) {
        title = 'Onboarding & Integration';
        desc = 'Initial entry, baseline orientation, and operational equipment alignment phase.';
        role = `Associate ${formData.role}`;
      } else if (isCurrent) {
        title = 'Active Retention State';
        desc = 'The current calculated active state representing immediate retention indicators.';
      } else if (index === 1) {
        title = 'Early Growth & Autonomy';
        desc = 'Transitioning from structured guidance to autonomous work ownership.';
        role = formData.role;
      } else {
        title = 'Mid-Tenure Calibration';
        desc = 'Middle tenure calibration. Potential fatigue factors may surface.';
        role = `Senior ${formData.role}`;
      }

      const positiveDrivers = isCurrent ? [
        formData.satisfaction >= 7 ? 'Sufficient satisfaction levels' : 'Baseline engagement remains',
        formData.jobInvolvement >= 3 ? 'High organizational and role involvement index' : '',
        !formData.overTime ? 'Healthy work hours distribution' : ''
      ].filter(Boolean) as string[] : [
        'Strong organizational knowledge base',
        'Integration with critical workflow assets'
      ];

      const riskSignals = isCurrent ? [
        formData.overTime ? 'Active overtime burnout danger indicators' : '',
        formData.commute > 20 ? `Severe transit stress (${formData.commute} km distance)` : '',
        formData.emailSentimentRisk ? 'Linguistic sentiment flags detected in communications' : '',
        formData.emailVolumeDecline ? 'Severe communication volume dropoff (>30%)' : ''
      ].filter(Boolean) as string[] : [
        formData.overTime && progressRatio > 0.5 ? 'Occasional overtime spikes impacting balance' : ''
      ].filter(Boolean) as string[];

      generated.push({
        id: isCurrent ? 'current' : `year-${year}`,
        title,
        timeLabel: isFirst ? 'Month 0' : (isCurrent ? `Current (Yr ${year})` : `Year ${year}`),
        year,
        status: isCurrent ? 'current' : 'completed',
        role,
        salary: computedSalary,
        satisfaction: computedSatisfaction,
        riskScore: computedRiskScore,
        riskLevel: computedRiskLevel,
        milestoneDescription: desc,
        positiveDrivers,
        riskSignals,
        actionPlan: isCurrent 
          ? (result?.recommendations?.[0] || 'Schedule an immediate formal evaluation of career objectives and work boundaries.')
          : 'Provide opportunity for cross-functional project leadership.',
        formDataState: {
          ...formData,
          salary: computedSalary,
          satisfaction: computedSatisfaction,
          tenure: year,
        }
      });
    });

    setMilestones(generated);
  }, [formData, result]);

  const activeMilestone = milestones.find(m => m.id === selectedMilestoneId) || milestones[milestones.length - 1];

  const getRiskColorClasses = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'High':
        return {
          text: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-900/50',
          dot: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]',
          glow: 'after:bg-rose-500/20'
        };
      case 'Medium':
        return {
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-900/50',
          dot: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
          glow: 'after:bg-amber-500/20'
        };
      default:
        return {
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-900/50',
          dot: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
          glow: 'after:bg-emerald-500/20'
        };
    }
  };

  if (milestones.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
            <Milestone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Career & Risk Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track progression, compensation scaling, and historical attrition threat thresholds.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Interactive Playback Node</span>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE DISPLAY */}
      <div className="relative mb-8 px-4 py-3 overflow-x-auto custom-scrollbar min-h-[160px]">
        {/* Nodes Container */}
        <div className="relative flex justify-between min-w-[600px] px-8">
          {/* Track Line */}
          <div className="absolute top-[22px] left-[6rem] right-[6rem] h-1 bg-slate-100 dark:bg-slate-700 rounded-full" />
          {/* Connection Line Progress Indicator */}
          <div 
            className="absolute top-[22px] left-[6rem] h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{
              width: `calc(${Math.max(0, milestones.findIndex(m => m.id === selectedMilestoneId) / Math.max(1, milestones.length - 1)) * 100}% * (100% - 12rem) / 100%)`
            }}
          />

          {milestones.map((milestone, idx) => {
            const riskColors = getRiskColorClasses(milestone.riskLevel);
            const isSelected = milestone.id === selectedMilestoneId;

            return (
              <button
                key={milestone.id}
                onClick={() => setSelectedMilestoneId(milestone.id)}
                className="flex flex-col items-center group relative focus:outline-none cursor-pointer w-32"
                style={{ width: `${100 / milestones.length}%` }}
              >
                {/* Time Indicator Bubble */}
                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 py-0.5 rounded-full transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-sm scale-105' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200'
                }`}>
                  {milestone.timeLabel}
                </span>

                {/* Node Dot */}
                <div className="relative flex items-center justify-center z-10">
                  {/* Outer Pulsing Ring */}
                  {isSelected && (
                    <span className="absolute inline-flex h-7 w-7 rounded-full animate-ping bg-indigo-400/20 opacity-75" />
                  )}
                  {/* Outer Solid Ring */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-white dark:bg-slate-850 scale-125 shadow-md' 
                      : 'border-slate-300 dark:border-slate-650 bg-slate-50 dark:bg-slate-800 hover:scale-110'
                  }`}>
                    {/* Inner Colored Core */}
                    <div className={`w-2.5 h-2.5 rounded-full ${riskColors.dot}`} />
                  </div>
                </div>

                {/* Milestone Node Title */}
                <span className={`text-xs mt-2 font-semibold text-center leading-tight transition-colors ${
                  isSelected ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900'
                }`}>
                  {milestone.title}
                </span>

                {/* Risk Score indicator */}
                <span className={`text-[10px] font-bold mt-1 ${riskColors.text}`}>
                  Risk: {milestone.riskScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAIL DRAWER / CARD */}
      <AnimatePresence mode="wait">
        {activeMilestone && (
          <motion.div
            key={activeMilestone.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-750 p-5 shadow-inner"
          >
            {/* LEFT PROFILE PANELS */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
                {/* Accent border */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  activeMilestone.riskLevel === 'High' ? 'bg-rose-500' :
                  activeMilestone.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />

                <div className="flex justify-between items-start pl-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      Milestone Phase Overview
                    </span>
                    <h4 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">
                      {activeMilestone.title}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    getRiskColorClasses(activeMilestone.riskLevel).bg
                  } ${getRiskColorClasses(activeMilestone.riskLevel).text} border ${getRiskColorClasses(activeMilestone.riskLevel).border}`}>
                    {activeMilestone.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed pl-2">
                  {activeMilestone.milestoneDescription}
                </p>

                {/* Simulation Button */}
                <button
                  type="button"
                  onClick={() => onSimulateMilestone(activeMilestone.formDataState)}
                  className="mt-5 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-350 text-xs font-bold rounded-lg border border-indigo-150 dark:border-indigo-900/50 transition-all uppercase tracking-wide group"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse group-hover:scale-110 transition-transform" />
                  <span>Simulate Milestone Variables</span>
                </button>
              </div>

              {/* STATS BREAKDOWN GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-450">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Assigned Role</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {activeMilestone.role}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-450">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Est. Compensation</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      INR {activeMilestone.salary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900/20 text-pink-600 dark:text-pink-450">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Satisfaction Index</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {activeMilestone.satisfaction} / 10
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm flex items-center space-x-3">
                  <div className={`p-2 rounded-lg border text-indigo-600 ${
                    activeMilestone.riskLevel === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/50' :
                    activeMilestone.riskLevel === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/50' :
                    'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Calculated Attrition</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {activeMilestone.riskScore}% Score
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PROGRESSION DETAILS */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {/* Positive Factors */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm flex-1">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                  Key Preservation & Engagement Anchors
                </h5>
                <ul className="space-y-2">
                  {activeMilestone.positiveDrivers.length > 0 ? (
                    activeMilestone.positiveDrivers.map((driver, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 mr-2 mt-0.5 font-bold">✓</span>
                        <span className="leading-relaxed">{driver}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 italic">No specific positive drivers noted for this phase.</li>
                  )}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm flex-1">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-rose-600 dark:text-rose-400 mb-3 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                  Active Attrition Risk Milestones & Flags
                </h5>
                <ul className="space-y-2">
                  {activeMilestone.riskSignals.length > 0 ? (
                    activeMilestone.riskSignals.map((signal, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-rose-500 mr-2 mt-0.5 font-bold">!</span>
                        <span className="leading-relaxed">{signal}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 dark:text-slate-500 italic">No critical risk indicators active. Healthy state.</li>
                  )}
                </ul>
              </div>

              {/* Strategic Action Directive */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 shadow-sm">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                  Target retention recommendation
                </h5>
                <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-medium">
                  {activeMilestone.actionPlan}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
