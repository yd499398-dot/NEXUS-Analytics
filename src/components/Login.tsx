import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hexagon, 
  Loader2, 
  ArrowRight, 
  User, 
  Building2, 
  Briefcase, 
  Users, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    emailPlaceholder: "name@company.com",
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
    emailPlaceholder: "name@company.com",
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

export default function Login() {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Multi-lingual Form Labels fallback
  const f = formLabels[language] || formLabels['en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) return;
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const payload = { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', data.role || 'user');
        
        // Dynamically derive a personalized display name from the email if not provided
        const namePart = email.split('@')[0];
        const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
        const finalName = data.name || cleanName || 'Nexus User';
        localStorage.setItem('userFullName', finalName);
        
        navigate('/app');
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 text-slate-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 my-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 text-center border-b border-slate-100 bg-white/50">
            <div className="inline-flex bg-white border border-slate-200 p-3 rounded-xl mb-4 shadow-sm">
              <Hexagon className="w-8 h-8 text-indigo-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-display font-semibold text-slate-900 tracking-tight mb-2">{t('nexus_analytics')}</h1>
            <p className="text-slate-500 text-sm">{t('enterprise_hr')}</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6 relative">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${isLogin ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('login')}
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${!isLogin ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('signup')}
              </button>
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-out ${isLogin ? 'left-1' : 'translate-x-[calc(100%+8px)] left-1'}`}
              />
            </div>
 
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {errorMsg && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }} 
                     exit={{ opacity: 0, height: 0 }}
                     className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg font-medium flex items-start space-x-2 shadow-sm"
                   >
                     <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                     <span>{errorMsg}</span>
                   </motion.div>
                )}
              </AnimatePresence>
 
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isLogin ? t('corp_id') : f.emailLabel}
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={f.emailPlaceholder}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-all outline-none shadow-sm text-sm"
                    required
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isLogin ? t('access_code') : f.passLabel}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-all outline-none shadow-sm text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
 
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none group mt-4 text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? t('init_session') : t('reg_identity')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 px-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-center text-slate-500 text-xs tracking-wide">{t('secure_conn')}</p>
          </div>
          <a href="/admin" className="text-slate-400 hover:text-indigo-600 transition-colors text-xs font-medium">
            {t('admin_access')} &rarr;
          </a>
        </div>
      </motion.div>
    </div>
  );
}
