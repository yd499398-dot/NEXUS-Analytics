import { useState, useEffect } from 'react';
import { Terminal, Shield, Activity, Download } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface AuditLog {
  id: number;
  email: string;
  timestamp: string;
  event: string;
  integrity: 'VALID' | 'WARNING';
}

const MOCK_USERS = [
  'admin@nexus.local',
  'operator1@nexus.local',
  'sys_service@nexus.local',
  'audit_bot@nexus.local'
];

const MOCK_EVENTS = [
  'Database Query Executed',
  'Clearance Level Modified',
  'Session Terminated',
  'Firewall Rules Updated',
  'Data Export Initiated',
  'Unauthorized Access Attempt Detected',
  'Authentication Token Refreshed'
];

let globalLogId = 1;

export default function TelemetryView() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Generate initial logs
    const initialLogs: AuditLog[] = Array.from({ length: 5 }).map(() => generateMockLog());
    setLogs(initialLogs);

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateMockLog();
        const updatedLogs = [newLog, ...prev];
        return updatedLogs.slice(0, 10);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockLog = (): AuditLog => {
    const isWarning = Math.random() > 0.8;
    return {
      id: globalLogId++,
      email: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
      timestamp: new Date().toISOString(),
      event: MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)],
      integrity: isWarning ? 'WARNING' : 'VALID'
    };
  };

  const handleExport = () => {
    const headers = 'ID,Timestamp,Principal,Event,Integrity\n';
    const csvContent = logs.map(log => 
      `${log.id},${log.timestamp},${log.email},"${log.event}",${log.integrity}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full max-w-5xl mx-auto flex flex-col space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('system_telemetry')}</h2>
        <p className="text-sm text-slate-500">{t('live_feed')}</p>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col min-h-0 font-mono">
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 text-slate-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">{t('immutable_audit')}</span>
            <button 
              onClick={handleExport}
              title={t('export_trail')}
              className="ml-2 p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase text-emerald-500 tracking-widest font-semibold">{t('live_stream')}</span>
          </div>
        </div>

        
        <div className="flex-1 overflow-auto p-4 custom-scrollbar space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 p-2 rounded hover:bg-slate-900/50 transition-colors text-xs border border-transparent hover:border-slate-800">
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-slate-600 dark:text-slate-400 w-8">#{log.id.toString().padStart(4, '0')}</span>
                <span className="text-slate-500">{log.timestamp}</span>
              </div>
              
              <div className="flex-1 text-slate-300 truncate">
                <span className="text-indigo-400 mr-2">{log.email}</span>
                <span>{log.event}</span>
              </div>
              
              <div className="shrink-0 flex justify-end sm:w-24">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                  log.integrity === 'VALID' 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' 
                    : 'bg-amber-950 text-amber-400 border-amber-900/50'
                }`}>
                  {log.integrity === 'VALID' ? (
                    <Shield className="w-3 h-3 mr-1" />
                  ) : (
                    <Activity className="w-3 h-3 mr-1" />
                  )}
                  {log.integrity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
