import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { EmployeeData } from '../types';
import { useLanguage } from './LanguageContext';

interface ComparativeAnalysisProps {
  currentData: EmployeeData | null;
  riskScore: number | null;
}

export default function ComparativeAnalysis({ currentData, riskScore }: ComparativeAnalysisProps) {
  const { t } = useLanguage();

  if (!currentData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest text-center whitespace-pre-line leading-relaxed">
        {t('init_scenario')}
      </div>
    );
  }

  // Mock baseline data 
  const industryAverages = {
    salary: Math.max(300000, currentData.salary * 0.8), 
    commute: 15,
    satisfaction: 6.5,
    tenure: 3,
    jobInvolvement: 2.5
  };

  const radarData = [
    { metric: t('satisfaction_idx'), current: currentData.satisfaction, industry: industryAverages.satisfaction, fullMark: 10 },
    { metric: t('involvement'), current: currentData.jobInvolvement * 2.5, industry: industryAverages.jobInvolvement * 2.5, fullMark: 10 },
    { metric: t('tenure_yrs'), current: Math.min(currentData.tenure, 10), industry: industryAverages.tenure, fullMark: 10 },
    { metric: t('transit'), current: 10 - Math.min(currentData.commute, 30)/3, industry: 10 - industryAverages.commute/3, fullMark: 10 }, 
  ];

  const riskData = [
    { name: t('subject'), Risk: riskScore || 0 },
    { name: t('dept_avg'), Risk: 34 },
    { name: t('ind_avg'), Risk: 42 }
  ];

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #64748b',
    borderRadius: '8px',
    color: '#0f172a',
    fontSize: '12px'
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex-1 min-h-[180px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
            <PolarGrid stroke="#64748b" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar name={t('subject')} dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
            <Radar name={t('industry')} dataKey="industry" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b' }} iconSize={8} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#64748b' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} width={75} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={tooltipStyle} />
            <Bar dataKey="Risk" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
