import { useState, useEffect } from 'react';
import { Database, Clock, Mail, ShieldCheck, TrendingUp, ScatterChart as ScatterIcon } from 'lucide-react';
import { UserLogin } from '../../db';
import { useLanguage } from './LanguageContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

const attritionData = [
  { month: 'Jan', rate: 2.1 },
  { month: 'Feb', rate: 2.3 },
  { month: 'Mar', rate: 2.0 },
  { month: 'Apr', rate: 3.5 },
  { month: 'May', rate: 4.1 },
  { month: 'Jun', rate: 4.8 },
  { month: 'Jul', rate: 4.5 },
  { month: 'Aug', rate: 5.2 },
];

const satisfactionData = [
  { satisfaction: 1, risk: 92, count: 120 },
  { satisfaction: 2, risk: 85, count: 150 },
  { satisfaction: 3, risk: 75, count: 200 },
  { satisfaction: 4, risk: 68, count: 250 },
  { satisfaction: 5, risk: 55, count: 300 },
  { satisfaction: 6, risk: 45, count: 400 },
  { satisfaction: 7, risk: 32, count: 500 },
  { satisfaction: 8, risk: 22, count: 450 },
  { satisfaction: 9, risk: 12, count: 300 },
  { satisfaction: 10, risk: 5, count: 150 },
];

export default function StatsView() {
  const { t } = useLanguage();
  const [logins, setLogins] = useState<UserLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const customTooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: '8px',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  };

  useEffect(() => {
    fetch('/api/logins')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogins(data.reverse());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('system_telemetry')}</h2>
        <p className="text-sm text-slate-500">{t('realtime_metrics')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-600">
            <Database className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('global_access')}</div>
            <div className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">{logins.length}</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-600">
            <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('network_status')}</div>
            <div className="text-xl font-display font-bold text-emerald-600">{t('secured')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
          <div className="bg-violet-50 p-3 rounded-xl border border-violet-100 text-violet-600">
            <Clock className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('core_uptime')}</div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">99.99%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">{t('hist_attrition')}</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attritionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#4f46e5' }} />
                <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" name="Attrition Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <ScatterIcon className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">{t('satisfaction_risk_corr')}</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis type="number" dataKey="satisfaction" name="Satisfaction" domain={[0, 11]} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="risk" name="Risk Score" domain={[0, 100]} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="count" range={[50, 400]} name="Volume" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={customTooltipStyle} />
                <Scatter name="Correlation" data={satisfactionData} fill="#f43f5e" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {t('immutable_audit')}
          </h3>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white dark:bg-slate-800">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm tracking-wide">{t('sync_streams')}</div>
          ) : logins.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">{t('no_telemetry')}</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-[10px] uppercase tracking-widest bg-slate-50 dark:bg-slate-900 text-slate-500 sticky top-0 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('identifier')}</th>
                  <th className="px-6 py-4 font-semibold">{t('unix_ts')}</th>
                  <th className="px-6 py-4 font-semibold">{t('integrity')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logins.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:bg-slate-900 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{log.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.loginTime).toISOString()}</td>
                    <td className="px-6 py-4">
                      {log.status === 'success' ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">{t('valid')}</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">{t('failed')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
