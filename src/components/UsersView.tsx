import { useState, useEffect } from 'react';
import { Database, Mail, Search, Filter, ShieldOff, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { UserLogin } from '../../db';
import { useLanguage } from './LanguageContext';

const revokeTranslations: Record<string, {
  confirmTitle: string;
  confirmDesc: string;
  cancel: string;
  deleteBtn: string;
  errorMsg: string;
}> = {
  en: {
    confirmTitle: "Revoke & Delete Principal",
    confirmDesc: "Are you sure you want to revoke access and delete all database records for {email}? This action is irreversible and will remove all credentials and session logs.",
    cancel: "Cancel",
    deleteBtn: "Revoke & Delete",
    errorMsg: "Failed to revoke access."
  },
  hi: {
    confirmTitle: "पहुंच रद्द करें और हटाएं",
    confirmDesc: "क्या आप वाकई {email} के लिए पहुंच रद्द करना और सभी डेटाबेस रिकॉर्ड हटाना चाहते हैं? यह कार्रवाई अपरिवर्तनीय है।",
    cancel: "रद्द करें",
    deleteBtn: "रद्द करें और हटाएं",
    errorMsg: "पहुंच रद्द करने में विफल।"
  },
  es: {
    confirmTitle: "Revocar y Eliminar Principal",
    confirmDesc: "¿Está seguro de que desea revocar el acceso y eliminar todos los registros de la base de datos de {email}? Esta acción es irreversible.",
    cancel: "Cancelar",
    deleteBtn: "Revocar y Eliminar",
    errorMsg: "Error al revocar el acceso."
  },
  de: {
    confirmTitle: "Zugriff widerrufen & löschen",
    confirmDesc: "Sind Sie sicher, dass Sie den Zugriff für {email} widerrufen und alle Datenbankeinträge löschen möchten? Diese Aktion ist unwiderruflich.",
    cancel: "Abbrechen",
    deleteBtn: "Widerrufen & löschen",
    errorMsg: "Fehler beim Widerrufen des Zugriffs."
  },
  fr: {
    confirmTitle: "Révoquer et supprimer le principal",
    confirmDesc: "Êtes-vous sûr de vouloir révoquer l'accès et supprimer tous les enregistrements de la base de données pour {email} ? Cette action est irréversible.",
    cancel: "Annuler",
    deleteBtn: "Révoquer et supprimer",
    errorMsg: "Échec de la récoquation de l'accès."
  },
  tr: {
    confirmTitle: "Erişimi İptal Et ve Sil",
    confirmDesc: "{email} için erişimi iptal etmek ve tüm veritabanı kayıtlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    cancel: "İptal",
    deleteBtn: "Erişimi İptal Et ve Sil",
    errorMsg: "Erişim iptal edilemedi."
  },
  zh: {
    confirmTitle: "撤销并删除主体",
    confirmDesc: "您确定要撤销 {email} 的访问权限并删除所有数据库记录吗？此操作不可逆。",
    cancel: "取消",
    deleteBtn: "撤销并删除",
    errorMsg: "撤销访问权限失败。"
  }
};

type SessionRecord = { 
  email: string;
  loginTime: string;
  clearance: string;
  status: 'active' | 'revoked';
  id: string;
};

export default function UsersView() {
  const { t, language } = useLanguage();
  const [logins, setLogins] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('All');
  const [emailToRevoke, setEmailToRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/logins')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const currentUserEmail = localStorage.getItem('userEmail');
          
          // Deduplicate by email to show unique identity distribution
          const uniqueData: UserLogin[] = [];
          const seen = new Set();
          for (const log of [...data].reverse()) {
            if (!seen.has(log.email)) {
              seen.add(log.email);
              uniqueData.push(log);
            }
          }

          setLogins(uniqueData.map((log, index) => ({ 
            ...log, 
            id: `${log.email}-${index}`,
            clearance: log.email === currentUserEmail ? 'Administrator' : 'Operator',
            status: 'active'
          })));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleClearanceChange = (id: string, newClearance: string) => {
    setLogins(logins.map(log => 
      log.id === id ? { ...log, clearance: newClearance } : log
    ));
  };

  const triggerRevoke = (email: string) => {
    setEmailToRevoke(email);
    setErrorMessage(null);
  };

  const handleConfirmRevoke = async () => {
    if (!emailToRevoke) return;
    setRevoking(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(emailToRevoke)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setLogins(logins.filter(log => log.email !== emailToRevoke));
        const currentUserEmail = localStorage.getItem('userEmail');
        if (emailToRevoke === currentUserEmail) {
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }
        setEmailToRevoke(null);
      } else {
        const activeLang = revokeTranslations[language] || revokeTranslations.en;
        setErrorMessage(activeLang.errorMsg);
      }
    } catch (err) {
      console.error(err);
      const activeLang = revokeTranslations[language] || revokeTranslations.en;
      setErrorMessage(activeLang.errorMsg);
    } finally {
      setRevoking(false);
    }
  };

  const filteredLogins = logins.filter(log => {
    const matchesSearch = log.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClearance = clearanceFilter === 'All' || log.clearance === clearanceFilter;
    return matchesSearch && matchesClearance;
  });

  return (
    <div className="h-full max-w-6xl mx-auto flex flex-col">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 shrink-0">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('identity_control_plane')}</h2>
        <p className="text-sm text-slate-500">{t('master_record')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
            <Database className="w-3.5 h-3.5 mr-2 text-indigo-600" />
            {t('registry_matrix')}
          </h3>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('search_principal')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 bg-white dark:bg-slate-800"
              />
            </div>
            
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3" />
              <select
                value={clearanceFilter}
                onChange={(e) => setClearanceFilter(e.target.value)}
                className="pl-9 pr-8 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none bg-white dark:bg-slate-800 cursor-pointer"
              >
                <option value="All">{t('all_clearances')}</option>
                <option value="Operator">{t('operator')}</option>
                <option value="Administrator">{t('administrator')}</option>
                <option value="Guest">{t('guest')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-800">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm tracking-wide">{t('handshake')}</div>
          ) : filteredLogins.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">{t('no_identity')}</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-[10px] uppercase tracking-widest bg-slate-50 dark:bg-slate-900 text-slate-500 sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('user_principal_name')}</th>
                  <th className="px-6 py-4 font-semibold">{t('auth_utc')}</th>
                  <th className="px-6 py-4 font-semibold">{t('status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('clearance')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredLogins.map((log) => (
                  <tr key={log.id} className={`transition-colors group ${log.status === 'revoked' ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-75' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-slate-400" />
                      <span className={log.status === 'revoked' ? 'line-through text-slate-400 dark:text-slate-500' : ''}>{log.email}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.loginTime).toUTCString()}</td>
                    <td className="px-6 py-4">
                      {log.status === 'active' ? (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          {t('active')}
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-600 dark:text-rose-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          {t('revoked')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border
                        ${log.clearance === 'Administrator' ? 'bg-purple-50 text-purple-700 border-purple-500 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-500' : 
                           log.clearance === 'Guest' ? 'bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' : 
                           'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500/30'}`}>
                        {log.clearance === 'Administrator' ? t('administrator') : log.clearance === 'Guest' ? t('guest') : t('operator')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'active' && (
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <select
                              value={log.clearance}
                              onChange={(e) => handleClearanceChange(log.id, e.target.value)}
                              className="pl-3 pr-7 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer shadow-sm font-medium"
                            >
                              <option value="Operator">{t('operator')}</option>
                              <option value="Administrator">{t('administrator')}</option>
                              <option value="Guest">{t('guest')}</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          
                          <button 
                            onClick={() => triggerRevoke(log.email)}
                            className="flex items-center px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 border border-rose-100 hover:border-rose-200 dark:border-rose-800 dark:hover:border-rose-700 rounded transition-colors shadow-sm"
                          >
                            <ShieldOff className="w-3 h-3 mr-1.5" />
                            {t('revoke')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {emailToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
              <ShieldOff className="w-5 h-5 text-rose-500 mr-2.5" />
              {(revokeTranslations[language] || revokeTranslations.en).confirmTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {(revokeTranslations[language] || revokeTranslations.en).confirmDesc.replace('{email}', emailToRevoke)}
            </p>
            {errorMessage && (
              <div className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50">
                {errorMessage}
              </div>
            )}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEmailToRevoke(null)}
                disabled={revoking}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
              >
                {(revokeTranslations[language] || revokeTranslations.en).cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={revoking}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-sm"
              >
                {revoking ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldOff className="w-3.5 h-3.5" />
                )}
                <span>{(revokeTranslations[language] || revokeTranslations.en).deleteBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
