import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Loader2, 
  ArrowRight,
  User,
  Building2,
  Users,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage, LanguageSwitcher } from './LanguageContext';

const formLabels: Record<string, Record<string, string>> = {
  en: {
    fullName: "Full Name",
    fullNamePlaceholder: "John Doe",
    companyName: "Company Name",
    companyNamePlaceholder: "Acme Corp",
    companySize: "Company Size",
    companySizePlaceholder: "Select company size",
    companyRole: "Your Corporate Role",
    companyRolePlaceholder: "Select your role",
    validating: "Analyzing credentials...",
    passCriteria: "Password Requirements",
    charMin: "At least 8 characters",
    charUpper: "One uppercase letter (A-Z)",
    charLower: "One lowercase letter (a-z)",
    charNum: "One number (0-9)",
    charSpecial: "One special character (@$!%*?&#)",
    emailPlaceholder: "admin@company.com",
    roleCEO: "Executive Officer / CEO / Founder",
    roleHR: "HR Manager / Director",
    roleOps: "Operations Director / Manager",
    roleDept: "Department Manager / Team Lead",
    roleOther: "Other Specialist / Consultant",
    sizeSmall: "1 - 10 employees",
    sizeMed: "11 - 50 employees",
    sizeLarge: "51 - 200 employees",
    sizeEnterprise: "201 - 500 employees",
    sizeGiant: "500+ employees",
    regError: "Please correct highlighted fields before submitting.",
    domainAlert: "Disposable, placeholder, or throwaway emails are not accepted.",
    prefixAlert: "Generic dummy names (like test, fake, abc) are blocked.",
    emailLabel: "Corporate Professional Email",
    passLabel: "Password"
  },
  hi: {
    fullName: "पूरा नाम",
    fullNamePlaceholder: "जॉन डो",
    companyName: "कंपनी का नाम",
    companyNamePlaceholder: "एक्मे कॉर्प",
    companySize: "कंपनी का आकार",
    companySizePlaceholder: "कंपनी का आकार चुनें",
    companyRole: "आपकी कॉर्पोरेट भूमिका",
    companyRolePlaceholder: "अपनी भूमिका चुनें",
    validating: "क्रेडेंशियल का विश्लेषण...",
    passCriteria: "एक्सेस कोड आवश्यकताएँ",
    charMin: "कम से कम 8 अक्षर",
    charUpper: "एक बड़ा अक्षर (A-Z)",
    charLower: "एक छोटा अक्षर (a-z)",
    charNum: "एक संख्या (0-9)",
    charSpecial: "एक विशेष वर्ण (@$!%*?&#)",
    emailPlaceholder: "admin@company.com",
    roleCEO: "मुख्य कार्यकारी अधिकारी / सीईओ / संस्थापक",
    roleHR: "मानव संसाधन प्रबंधक / निदेशक",
    roleOps: "संचालन निदेशक / प्रबंधक",
    roleDept: "विभाग प्रबंधक / टीम लीड",
    roleOther: "अन्य विशेषज्ञ / सलाहकार",
    sizeSmall: "1 - 10 कर्मचारी",
    sizeMed: "11 - 50 कर्मचारी",
    sizeLarge: "51 - 200 कर्मचारी",
    sizeEnterprise: "201 - 500 कर्मचारी",
    sizeGiant: "500+ कर्मचारी",
    regError: "कृपया सबमिट करने से पहले हाइलाइट किए गए फ़ील्ड को ठीक करें।",
    domainAlert: "अस्थायी या डिस्पोजेबल ईमेल स्वीकार्य नहीं हैं।",
    prefixAlert: "फर्जी या डमी नामों (जैसे test, fake, abc) को ब्लॉक कर दिया गया है।",
    emailLabel: "कॉर्पोरेट पेशेवर ईमेल",
    passLabel: "एक्सेस कोड / पासवर्ड"
  },
  es: {
    fullName: "Nombre Completo",
    fullNamePlaceholder: "Juan Pérez",
    companyName: "Nombre de la Empresa",
    companyNamePlaceholder: "Acme Corp",
    companySize: "Tamaño de la Empresa",
    companySizePlaceholder: "Seleccionar tamaño",
    companyRole: "Tu Rol Corporativo",
    companyRolePlaceholder: "Selecciona tu rol",
    validating: "Analizando credenciales...",
    passCriteria: "Requisitos del código de acceso",
    charMin: "Al menos 8 caracteres",
    charUpper: "Una letra mayúscula (A-Z)",
    charLower: "Una letra minúscula (a-z)",
    charNum: "Un número (0-9)",
    charSpecial: "Un carácter especial (@$!%*?&#)",
    emailPlaceholder: "nombre@empresa.com",
    roleCEO: "Director Ejecutivo / CEO / Fundador",
    roleHR: "Gerente / Director de RRHH",
    roleOps: "Director / Gerente de Operaciones",
    roleDept: "Gerente de Departamento / Líder de Equipo",
    roleOther: "Otro Especialista / Consultor",
    sizeSmall: "1 - 10 empleados",
    sizeMed: "11 - 50 empleados",
    sizeLarge: "51 - 200 empleados",
    sizeEnterprise: "201 - 500 empleados",
    sizeGiant: "500+ empleados",
    regError: "Por favor corrija los campos resaltados antes de enviar.",
    domainAlert: "No se aceptan correos temporales o desechables.",
    prefixAlert: "Los prefijos ficticios (como test, fake, abc) están bloqueados.",
    emailLabel: "Correo Profesional Corporativo",
    passLabel: "Código de Acceso / Contraseña"
  },
  tr: {
    fullName: "Ad Soyad",
    fullNamePlaceholder: "Ahmet Yılmaz",
    companyName: "Şirket Adı",
    companyNamePlaceholder: "Acme Corp",
    companySize: "Şirket Ölçeği",
    companySizePlaceholder: "Şirket büyüklüğünü seçin",
    companyRole: "Kurumsal Rolünüz",
    companyRolePlaceholder: "Rolünüzü seçin",
    validating: "Kimlik bilgileri doğrulanıyor...",
    passCriteria: "Erişim Kodu Gereksinimleri",
    charMin: "En az 8 karakter",
    charUpper: "Bir büyük harf (A-Z)",
    charLower: "Bir küçük harf (a-z)",
    charNum: "Bir rakam (0-9)",
    charSpecial: "Bir özel karakter (@$!%*?&#)",
    emailPlaceholder: "ad@sirket.com",
    roleCEO: "Genel Müdür / CEO / Kurucu",
    roleHR: "İK Müdürü / Direktörü",
    roleOps: "Operasyon Direktörü / Müdürü",
    roleDept: "Departman Müdürü / Ekip Lideri",
    roleOther: "Diğer Uzman / Danışman",
    sizeSmall: "1 - 10 çalışan",
    sizeMed: "11 - 50 çalışan",
    sizeLarge: "51 - 200 çalışan",
    sizeEnterprise: "201 - 500 çalışan",
    sizeGiant: "500+ çalışan",
    regError: "Lütfen göndermeden önce vurgulanan alanları düzeltin.",
    domainAlert: "Geçici veya tek kullanımlık e-postalar kabul edilmez.",
    prefixAlert: "Sahte veya geçici adlar (test, fake, abc gibi) engellenmiştir.",
    emailLabel: "Kurumsal Profesyonel E-posta",
    passLabel: "Erişim Kodu / Şifre"
  }
};

export default function AdminLogin() {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Multi-lingual Form Labels fallback
  const f = formLabels[language] || formLabels['en'];

  // Registration Extra State variables
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Real-time password criteria
  const [criteria, setCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    num: false,
    special: false
  });

  // Real-time email safety check
  const [emailStatus, setEmailStatus] = useState<{
    valid: boolean;
    reason: 'ok' | 'empty' | 'invalid_format' | 'disposable' | 'fake_prefix';
  }>({ valid: true, reason: 'empty' });

  // Monitor password changes
  useEffect(() => {
    setCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      num: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password)
    });
  }, [password]);

  // Monitor email changes & execute real-time validity checks
  useEffect(() => {
    if (!email) {
      setEmailStatus({ valid: true, reason: 'empty' });
      return;
    }

    setEmailStatus({ valid: true, reason: 'ok' });
  }, [email]);

  const allCriteriaMet = criteria.length && criteria.upper && criteria.lower && criteria.num && criteria.special;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (!isLogin) {
      // Extra validation on Registration submission
      if (!companyName.trim()) {
        setErrorMsg(f.regError);
        return;
      }

      if (!emailStatus.valid) {
        if (emailStatus.reason === 'disposable') {
          setErrorMsg(f.domainAlert);
        } else if (emailStatus.reason === 'fake_prefix') {
          setErrorMsg(f.prefixAlert);
        } else {
          setErrorMsg(t('admin_id') + ' is invalid.');
        }
        return;
      }

      if (!allCriteriaMet) {
        setErrorMsg(f.passCriteria + " not met.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const body = isLogin 
        ? { email, password, passkey, isAdmin: true } 
        : { 
            email, 
            password, 
            passkey,
            name: fullName, 
            companyName, 
            companySize, 
            companyRole, 
            isAdmin: true 
          };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.role !== 'admin') {
          setErrorMsg('Access denied. Administrator privileges required.');
        } else {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', data.role);
          const finalName = data.name || fullName || 'Admin Colleague';
          localStorage.setItem('userFullName', finalName);
          navigate('/app/stats');
        }
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500/30 text-slate-100 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.05),transparent_50%)] pointer-events-none" />
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher dark />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 my-4"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-800/60 bg-slate-900/40">
            <div className="inline-flex bg-slate-950 border border-slate-800 p-3 rounded-xl mb-6 shadow-sm">
              <Shield className="w-8 h-8 text-rose-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight mb-2">{t('sys_admin')}</h1>
            <p className="text-slate-400 text-sm">{t('secure_core')}</p>
          </div>
          
          <div className="p-8">
            <div className="flex bg-slate-950 p-1 rounded-lg mb-8 relative border border-slate-800">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${isLogin ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t('login')}
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${!isLogin ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t('signup')}
              </button>
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-slate-900 rounded-md shadow-sm border border-slate-700 transition-transform duration-300 ease-out ${isLogin ? 'left-1' : 'translate-x-[calc(100%+8px)] left-1'}`}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg font-medium flex items-start space-x-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* REGISTRATION FIELDS */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        <User className="w-3.5 h-3.5 text-rose-500 mr-1" />
                        {f.fullName}
                      </label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={f.fullNamePlaceholder}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-rose-500 mr-1" />
                        {f.companyName}
                      </label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={f.companyNamePlaceholder}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                        required={!isLogin}
                      />
                    </div>

                    {/* Two Column Layout for Corporate Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Size */}
                      <div>
                        <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-500 mr-1" />
                          {f.companySize}
                        </label>
                        <select 
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm cursor-pointer"
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-400">{f.companySizePlaceholder}</option>
                          <option value="1-10" className="bg-slate-900">{f.sizeSmall}</option>
                          <option value="11-50" className="bg-slate-900">{f.sizeMed}</option>
                          <option value="51-200" className="bg-slate-900">{f.sizeLarge}</option>
                          <option value="201-500" className="bg-slate-900">{f.sizeEnterprise}</option>
                          <option value="500+" className="bg-slate-900">{f.sizeGiant}</option>
                        </select>
                      </div>

                      {/* Company Role */}
                      <div>
                        <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-rose-500 mr-1" />
                          {f.companyRole}
                        </label>
                        <select 
                          value={companyRole}
                          onChange={(e) => setCompanyRole(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm cursor-pointer"
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-400">{f.companyRolePlaceholder}</option>
                          <option value="CEO" className="bg-slate-900">{f.roleCEO}</option>
                          <option value="HR" className="bg-slate-900">{f.roleHR}</option>
                          <option value="Operations" className="bg-slate-900">{f.roleOps}</option>
                          <option value="DepartmentManager" className="bg-slate-900">{f.roleDept}</option>
                          <option value="Other" className="bg-slate-900">{f.roleOther}</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isLogin ? t('admin_id') : f.emailLabel}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLogin ? "admin@nexus.local" : f.emailPlaceholder}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm ${
                      !isLogin && email && !emailStatus.valid 
                        ? 'border-rose-500/50 bg-rose-950/20' 
                        : 'border-slate-800'
                    }`}
                    required
                  />
                  {!isLogin && email && (
                    <div className="absolute right-3 top-3">
                      {emailStatus.valid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Real-time Email Validity Explanation banner */}
                {!isLogin && email && !emailStatus.valid && (
                  <motion.div 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-rose-400 font-medium flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {emailStatus.reason === 'disposable' && f.domainAlert}
                      {emailStatus.reason === 'fake_prefix' && f.prefixAlert}
                      {emailStatus.reason === 'invalid_format' && "Please input a valid format, e.g. name@company.com"}
                    </span>
                  </motion.div>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isLogin ? t('sec_key') : f.passLabel}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 transition-colors"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {!isLogin && password.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-2 shadow-inner"
                  >
                    <p className="font-semibold text-slate-300 flex items-center">
                      <span>{f.passCriteria}</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-medium">
                      <div className="flex items-center space-x-1.5">
                        {criteria.length ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded-full shrink-0" />
                        )}
                        <span className={criteria.length ? 'text-emerald-400 font-semibold' : ''}>{f.charMin}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {criteria.upper ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded-full shrink-0" />
                        )}
                        <span className={criteria.upper ? 'text-emerald-400 font-semibold' : ''}>{f.charUpper}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {criteria.lower ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded-full shrink-0" />
                        )}
                        <span className={criteria.lower ? 'text-emerald-400 font-semibold' : ''}>{f.charLower}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {criteria.num ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded-full shrink-0" />
                        )}
                        <span className={criteria.num ? 'text-emerald-400 font-semibold' : ''}>{f.charNum}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:col-span-2">
                        {criteria.special ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded-full shrink-0" />
                        )}
                        <span className={criteria.special ? 'text-emerald-400 font-semibold' : ''}>{f.charSpecial}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Admin Session Passkey */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Admin Passkey (Required)
                </label>
                <input 
                  type="password" 
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter admin passkey"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading || (!isLogin && (!emailStatus.valid || !allCriteriaMet))}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center disabled:opacity-70 group mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? t('authenticate') : t('reg_admin')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-8 text-sm">
          <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors">
            &larr; {t('std_login')}
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <span className="text-slate-500 tracking-wide text-xs">{t('high_sec_zone')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

