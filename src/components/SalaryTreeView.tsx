import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldAlert, CheckCircle2, Edit2, Check } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const EditableTreeLevel = ({ title, subtitle, min, max, isPlus, onSave, children }: any) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempMin, setTempMin] = useState(min);
  const [tempMax, setTempMax] = useState(max);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4 flex flex-col items-center min-w-[220px] z-10 relative group">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">{title}</h4>
        
        {isEditing ? (
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 mb-2">
            <span className="text-xs font-semibold text-slate-500">₹</span>
            <input 
              type="number" 
              value={tempMin} 
              onChange={e => setTempMin(Number(e.target.value))}
              className="w-14 px-1 py-1 text-xs font-semibold border border-slate-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center bg-white dark:bg-slate-800"
            />
            <span className="text-xs font-semibold text-slate-500">k</span>
            
            {!isPlus && (
              <>
                <span className="text-xs font-semibold text-slate-400">-</span>
                <span className="text-xs font-semibold text-slate-500">₹</span>
                <input 
                  type="number" 
                  value={tempMax} 
                  onChange={e => setTempMax(Number(e.target.value))}
                  className="w-14 px-1 py-1 text-xs font-semibold border border-slate-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center bg-white dark:bg-slate-800"
                />
                <span className="text-xs font-semibold text-slate-500">k</span>
              </>
            )}
            {isPlus && <span className="text-xs font-semibold text-slate-500">k+</span>}
            
            <button 
              onClick={() => { onSave(tempMin, tempMax); setIsEditing(false); }}
              className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors ml-1"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => { setIsEditing(true); setTempMin(min); setTempMax(max); }}
            className="flex items-center justify-center space-x-2 mb-2 cursor-pointer hover:bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700 w-full"
          >
            <span className="text-lg font-display font-bold text-slate-800 dark:text-slate-200">
              {isPlus ? `₹${min}k+` : `₹${min}k - ₹${max}k`}
            </span>
            <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {subtitle && (
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            subtitle === 'High Risk' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50' :
            subtitle === 'Medium Risk' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' :
            subtitle === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50' :
            'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}>
            {subtitle === 'High Risk' ? `${t('risk_high')} Risk` :
             subtitle === 'Medium Risk' ? `${t('risk_medium')} Risk` :
             subtitle === 'Low Risk' ? `${t('risk_low')} Risk` : subtitle}
          </div>
        )}
      </div>
      {children && (
        <div className="flex flex-col items-center w-full">
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex justify-center w-full relative">
            {children.length > 1 && (
              <div className="absolute top-0 h-px bg-slate-200 dark:bg-slate-700" style={{ left: `${100 / (children.length * 2)}%`, right: `${100 / (children.length * 2)}%` }}></div>
            )}
            <div className="flex w-full justify-around pt-8 relative">
               {children.map((child: any, i: number) => (
                 <div key={i} className="flex flex-col items-center relative flex-1">
                   <div className="absolute top-[-32px] w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                   {child}
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SalaryTreeView() {
  const { t } = useLanguage();
  const [ranges, setRanges] = useState({
    globalMin: 50,
    globalMax: 200,
    belowMin: 50,
    belowMax: 80,
    avgMin: 80,
    avgMax: 140,
    premiumMin: 140,
  });

  const updateRange = (keyMin: string, keyMax: string | null) => (min: number, max: number) => {
    setRanges(prev => ({
      ...prev,
      [keyMin]: min,
      ...(keyMax ? { [keyMax]: max } : {})
    }));
  };

  return (
    <div className="h-full max-w-5xl mx-auto flex flex-col space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('salary_opt_matrix')}</h2>
        <p className="text-sm text-slate-500">{t('corr_tiers')}</p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 relative p-8 custom-scrollbar overflow-auto">
        <div className="min-w-[800px] flex justify-center py-10">
           <EditableTreeLevel 
             title={t('comp_range')} 
             min={ranges.globalMin} 
             max={ranges.globalMax}
             onSave={updateRange('globalMin', 'globalMax')}
           >
             {[
               <EditableTreeLevel 
                 key="1" 
                 title={t('below_market')} 
                 subtitle="High Risk"
                 min={ranges.belowMin}
                 max={ranges.belowMax}
                 onSave={updateRange('belowMin', 'belowMax')}
               >
                 {[
                   <div key="c1" className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-center flex flex-col items-center min-w-[150px]">
                     <ShieldAlert className="w-5 h-5 text-rose-500 mb-2" />
                     <span className="text-xs font-semibold text-rose-700">{t('immediate_review')}</span>
                   </div>
                 ]}
               </EditableTreeLevel>,
               <EditableTreeLevel 
                 key="2" 
                 title={t('market_avg')} 
                 subtitle="Medium Risk"
                 min={ranges.avgMin}
                 max={ranges.avgMax}
                 onSave={updateRange('avgMin', 'avgMax')}
               >
                 {[
                   <div key="c2" className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-center flex flex-col items-center min-w-[150px]">
                     <ArrowRight className="w-5 h-5 text-amber-500 mb-2" />
                     <span className="text-xs font-semibold text-amber-700">{t('monitor_engagement')}</span>
                   </div>
                 ]}
               </EditableTreeLevel>,
               <EditableTreeLevel 
                 key="3" 
                 title={t('premium')} 
                 subtitle="Low Risk"
                 min={ranges.premiumMin}
                 isPlus={true}
                 onSave={updateRange('premiumMin', null)}
               >
                 {[
                   <div key="c3" className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center flex flex-col items-center min-w-[150px]">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                     <span className="text-xs font-semibold text-emerald-700">{t('stable_retention')}</span>
                   </div>
                 ]}
               </EditableTreeLevel>
             ]}
           </EditableTreeLevel>
        </div>
      </div>
    </div>
  );
}

