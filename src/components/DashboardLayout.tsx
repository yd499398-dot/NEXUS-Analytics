import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Hexagon, Activity, LogOut, BarChart3, Database, Shield, Terminal, Moon, Sun, Scale, User, Power, ChevronDown, Settings, Bell, Key, Sliders, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage, LanguageSwitcher, SUPPORTED_LANGUAGES } from './LanguageContext';
import Interactive3DLogo from './Interactive3DLogo';
import WalkthroughTour from './WalkthroughTour';

const logoutLabels: Record<string, string> = {
  en: "Log Out",
  hi: "लॉग आउट",
  es: "Cerrar sesión",
  de: "Abmelden",
  fr: "Se déconnecter",
  tr: "Çıkış Yap",
  zh: "退出登录",
  ar: "تسجيل الخروج",
  pt: "Encerrar Sessão",
  ja: "ログアウト"
};

const signoutLabels: Record<string, string> = {
  en: "Sign Out",
  hi: "साइन आउट",
  es: "Desconectarse",
  de: "Ausloggen",
  fr: "Déconnexion",
  tr: "Oturumu Kapat",
  zh: "登出",
  ar: "خروج",
  pt: "Sair",
  ja: "サインアウト"
};

export default function DashboardLayout() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  // Dynamic reactive states for user configuration
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'yd499398@gmail.com');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const [userFullName, setUserFullName] = useState(() => {
    const savedName = localStorage.getItem('userFullName');
    if (savedName) return savedName;
    const email = localStorage.getItem('userEmail') || 'yd499398@gmail.com';
    const namePart = email.split('@')[0];
    const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
    return cleanName || 'Nexus User';
  });
  
  const isAdmin = userRole === 'admin';
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return document.documentElement.classList.contains('dark');
  });
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'security' | 'notifications' | 'preferences'>('general');
  
  // Temporary form states for settings modal
  const [tempFullName, setTempFullName] = useState(userFullName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempRole, setTempRole] = useState(userRole);
  const [tempNotifications, setTempNotifications] = useState(true);
  const [tempTelemetryLogs, setTempTelemetryLogs] = useState(true);

  // Sync state when modal is opened or fields are changed
  useEffect(() => {
    if (settingsModalOpen) {
      setTempFullName(userFullName);
      setTempEmail(userEmail);
      setTempRole(userRole);
    }
  }, [settingsModalOpen, userFullName, userEmail, userRole]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    navigate('/');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userEmail', tempEmail);
    localStorage.setItem('userRole', tempRole);
    localStorage.setItem('userFullName', tempFullName);
    
    setUserEmail(tempEmail);
    setUserRole(tempRole);
    setUserFullName(tempFullName);
    setSettingsModalOpen(false);
  };

  const getLogoutLabel = () => logoutLabels[language] || logoutLabels['en'];
  const getSignoutLabel = () => signoutLabels[language] || signoutLabels['en'];

  const navItemClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none ${
      isActive 
        ? darkMode ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 shadow-sm' : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
        : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
    }`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} flex overflow-hidden selection:bg-indigo-500/30`}>
      {/* Skip Link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside 
        className={`w-64 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r flex flex-col hidden md:flex shrink-0 relative z-20 shadow-sm`}
        aria-label="Sidebar Navigation"
        role="complementary"
      >
        <div id="tour-logo" className="p-6 flex items-center space-x-3">
          <div className="dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"><Interactive3DLogo /></div>
          <div>
            <h1 className={`font-display font-bold ${darkMode ? 'text-white drop-shadow-sm' : 'text-slate-900'} text-sm tracking-tight leading-tight`}>Nexus</h1>
            <p className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-500'} font-semibold uppercase tracking-widest mt-0.5`}>Intelligence</p>
          </div>
        </div>

        {/* User Profile Card on the upper side */}
        <div className="px-4 pb-2">
          <div className={`${darkMode ? 'bg-slate-850 border-slate-700/50' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4 flex flex-col`}>
            <div className="flex items-center space-x-3 p-1 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs shadow-inner shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'} truncate`}>{userFullName}</p>
                <div className="flex items-center text-[10px] text-slate-500 mt-0.5 font-medium min-w-0">
                  <Shield className="w-3 h-3 mr-1 text-emerald-500 shrink-0" /> 
                  <span className="truncate">{userEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2" aria-label="Main Navigation">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 px-4">{t('core_modules')}</div>
          
          <NavLink id="tour-predictive" to="/app" end className={navItemClass} aria-label={t('predictive_engine')}>
            <Activity className="w-4 h-4" />
            <span className="font-medium text-sm">{t('predictive_engine')}</span>
          </NavLink>
          
          <NavLink id="tour-tree" to="/app/tree" className={navItemClass} aria-label={t('salary_tree')}>
            <Hexagon className="w-4 h-4" />
            <span className="font-medium text-sm">{t('salary_tree')}</span>
          </NavLink>
          
          <NavLink id="tour-compare" to="/app/compare" className={navItemClass} aria-label={t('risk_comparison')}>
            <Scale className="w-4 h-4" />
            <span className="font-medium text-sm">{t('risk_comparison')}</span>
          </NavLink>
          
          {isAdmin && (
            <>
              <NavLink to="/app/stats" end className={navItemClass} aria-label={t('global_metrics')}>
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium text-sm">{t('global_metrics')}</span>
              </NavLink>

              <NavLink to="/app/users" end className={navItemClass} aria-label={t('access_registry')}>
                <Database className="w-4 h-4" />
                <span className="font-medium text-sm">{t('access_registry')}</span>
              </NavLink>
              
              <NavLink to="/app/telemetry" end className={navItemClass} aria-label={t('system_telemetry')}>
                <Terminal className="w-4 h-4" />
                <span className="font-medium text-sm">{t('system_telemetry')}</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main 
        id="main-content"
        tabIndex={-1}
        className={`flex-1 flex flex-col min-w-0 overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} relative outline-none`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
        
        <header className={`${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shrink-0 relative z-40 shadow-sm`}>
          <h2 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'} text-sm tracking-wide`}>{t('workspace_env')}</h2>
          <div id="tour-user-controls" className="flex items-center space-x-3">
            <LanguageSwitcher dark={darkMode} />
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'} outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`}
              title={t('toggle_theme')}
              aria-label={t('toggle_theme')}
            >
              {darkMode ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Sun className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-haspopup="listbox"
                aria-expanded={userMenuOpen}
                aria-label="User profile menu"
                className={`flex items-center space-x-1 p-1 rounded-lg border transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-200 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs shadow-inner">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div 
                    role="listbox"
                    aria-label="User options"
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50 p-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-150 ${
                      darkMode 
                        ? 'bg-slate-800/95 backdrop-blur-md border-slate-700 text-slate-200' 
                        : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* User Info Header */}
                    <div className="px-2.5 py-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                      <p className={`text-[10px] font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>
                        MY PROFILE
                      </p>
                      <p className={`text-sm font-semibold truncate mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        {userFullName}
                      </p>
                      <p className={`text-xs font-mono font-medium truncate mt-0.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {userEmail}
                      </p>
                      <div className="flex flex-col mt-2 space-y-1">
                        <div className="flex items-center text-[10px] text-slate-500 font-medium">
                          <Shield className="w-3 h-3 mr-1 text-emerald-500 shrink-0 animate-pulse" /> 
                          <span className="truncate capitalize">{userRole === 'admin' ? t('administrator') : t('operator')} / Secured</span>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500 font-medium">
                          <span className="w-3 h-3 mr-1 shrink-0"></span>
                          <span className="truncate">{userRole === 'admin' ? 'Access Level: Premium Developer' : 'Role: IT Systems Administrator'}</span>
                        </div>
                      </div>
                    </div>

                    {/* System Settings Shortcuts */}
                    <div className="space-y-1 pt-1 pb-1">
                      <button 
                        onClick={() => {
                          setActiveSettingsTab('general');
                          setSettingsModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>General Settings</span>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveSettingsTab('security');
                          setSettingsModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Security & Access</span>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveSettingsTab('notifications');
                          setSettingsModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notifications</span>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveSettingsTab('preferences');
                          setSettingsModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Preferences</span>
                      </button>
                    </div>

                    {/* Dual Action Logout / Signout Buttons inside Profile menu */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 mt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                          darkMode ? 'hover:bg-rose-500/10 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                        }`}
                        aria-label={getLogoutLabel()}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="font-semibold">{getLogoutLabel()}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar relative z-10">
          <Outlet context={{ darkMode }} />
        </div>
      </main>
      <WalkthroughTour />

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
            onClick={() => setSettingsModalOpen(false)} 
          />
          
          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[480px] border z-10 animate-in fade-in zoom-in-95 duration-200 ${
            darkMode 
              ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}>
            
            {/* Modal Left Sidebar (Tabs) */}
            <div className={`w-full md:w-56 p-4 flex flex-col justify-between shrink-0 border-r ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-250'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between md:justify-start md:space-x-2 px-2 pb-2">
                  <div className="flex items-center space-x-2">
                    <Settings className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className="font-bold text-sm tracking-tight">System Settings</span>
                  </div>
                </div>
                
                <nav className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none animate-in fade-in" aria-label="Settings tabs">
                  <button
                    onClick={() => setActiveSettingsTab('general')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold w-full transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeSettingsTab === 'general'
                        ? darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                        : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>General Settings</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('security')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold w-full transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeSettingsTab === 'security'
                        ? darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                        : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Security & Access</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('notifications')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold w-full transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeSettingsTab === 'notifications'
                        ? darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                        : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('preferences')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold w-full transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeSettingsTab === 'preferences'
                        ? darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                        : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Preferences</span>
                  </button>
                </nav>
              </div>
              
              <div className="hidden md:block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Secured Hub 4.2.1
              </div>
            </div>
            
            {/* Modal Right Panel (Active Tab Contents) */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Header with Close */}
              <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
                darkMode ? 'border-slate-700' : 'border-slate-150'
              }`}>
                <h3 className="font-bold text-xs tracking-wider uppercase text-slate-400">
                  {activeSettingsTab === 'general' && 'General Profile Settings'}
                  {activeSettingsTab === 'security' && 'Security Clearance Control'}
                  {activeSettingsTab === 'notifications' && 'System Notifications'}
                  {activeSettingsTab === 'preferences' && 'User Environment Preferences'}
                </h3>
                <button 
                  onClick={() => setSettingsModalOpen(false)}
                  className={`p-1 rounded-md transition-colors ${
                    darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Close settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeSettingsTab === 'general' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Full Name
                      </label>
                      <input 
                        type="text"
                        value={tempFullName}
                        onChange={(e) => setTempFullName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          darkMode 
                            ? 'bg-slate-950 border-slate-700 text-slate-200' 
                            : 'bg-white border-slate-250 text-slate-850'
                        }`}
                        placeholder="Yash Bipin Darji"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Email Address
                      </label>
                      <input 
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          darkMode 
                            ? 'bg-slate-950 border-slate-700 text-slate-200' 
                            : 'bg-white border-slate-250 text-slate-850'
                        }`}
                        placeholder="yd499398@gmail.com"
                      />
                    </div>
                    <div className="p-3 rounded-lg border bg-slate-500/5 border-slate-500/10 text-xs text-slate-500 leading-relaxed">
                      General profile changes will propagate immediately across active session metrics and the local Handshake telemetry logs.
                    </div>
                  </div>
                )}
                
                {activeSettingsTab === 'security' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Role / Clearance Level
                      </label>
                      <select
                        value={tempRole}
                        onChange={(e) => setTempRole(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          darkMode 
                            ? 'bg-slate-950 border-slate-700 text-slate-200' 
                            : 'bg-white border-slate-250 text-slate-850'
                        }`}
                      >
                        <option value="user">Operator (IT Systems Administrator)</option>
                        <option value="admin">Premium Developer (Administrator)</option>
                      </select>
                    </div>
                    <div className="border border-indigo-500/10 bg-indigo-500/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                        <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>Security Clearances Active</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Upgrading your clearance level to "Premium Developer" instantly reveals all system administration endpoints including Global Metrics, Access Registry databases, and raw system telemetry.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 transition-colors">
                      <div>
                        <p className="text-xs font-semibold">Real-time Attrition Alerts</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Toggle notification banners for high risk levels</p>
                      </div>
                      <button 
                        onClick={() => setTempNotifications(!tempNotifications)}
                        className={`w-9 h-5 rounded-full transition-colors relative outline-none focus:ring-2 focus:ring-indigo-500 ${
                          tempNotifications ? 'bg-indigo-600' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                          tempNotifications ? 'right-0.75' : 'left-0.75'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 transition-colors">
                      <div>
                        <p className="text-xs font-semibold">Infrastructure Audit Feed</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Stream infrastructure health logs to active feed</p>
                      </div>
                      <button 
                        onClick={() => setTempTelemetryLogs(!tempTelemetryLogs)}
                        className={`w-9 h-5 rounded-full transition-colors relative outline-none focus:ring-2 focus:ring-indigo-500 ${
                          tempTelemetryLogs ? 'bg-indigo-600' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                          tempTelemetryLogs ? 'right-0.75' : 'left-0.75'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}
                
                {activeSettingsTab === 'preferences' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Active Workspace Theme
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setDarkMode(false)}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                            !darkMode 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                              : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span>Day Mode (Light)</span>
                        </button>
                        <button 
                          onClick={() => setDarkMode(true)}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                            darkMode 
                              ? 'bg-indigo-950 border-indigo-800 text-indigo-400 shadow-sm' 
                              : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span>Night Mode (Dark)</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Workspace Language
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto border border-slate-500/15 p-2 rounded-xl custom-scrollbar bg-slate-500/5">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`text-left px-2.5 py-1.5 text-xs flex items-center space-x-2 rounded-lg transition-colors outline-none ${
                              language === lang.code
                                ? darkMode ? 'bg-indigo-950 text-indigo-400 font-bold' : 'bg-indigo-50 text-indigo-700 font-bold'
                                : darkMode ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-sm shrink-0">{lang.flag}</span>
                            <span className="truncate">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer with actions */}
              <div className={`p-4 border-t flex items-center justify-end space-x-2 shrink-0 ${
                darkMode ? 'border-slate-700' : 'border-slate-150'
              }`}>
                <button 
                  onClick={() => setSettingsModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

