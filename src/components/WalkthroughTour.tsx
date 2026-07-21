import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from './LanguageContext';

// Helper translations for tour content
const tourTranslations: Record<string, Record<string, { title: string; desc: string }>> = {
  en: {
    welcome: {
      title: "Welcome to Nexus Intelligence!",
      desc: "Let's take a quick 3D interactive tour to get you up to speed with your executive command center. Ready?"
    },
    logo: {
      title: "Nexus Neural Core",
      desc: "This interactive 3D node graph core indicates system health. Hover to accelerate the orbit speed and trigger particle streams!"
    },
    predictive: {
      title: "Predictive Analytics",
      desc: "Our primary neural vector engine. Input manager metrics and run predictions to project tenure security and risks."
    },
    tree: {
      title: "Salary Tree Navigation",
      desc: "Visualize deep compensation structures, grading distributions, and dynamic payroll trees across branches."
    },
    compare: {
      title: "Risk Comparison",
      desc: "Run direct risk vectors and structural models to compare staff security and flight probability side-by-side."
    },
    controls: {
      title: "Universal Controls & Profile",
      desc: "Toggle high-contrast themes, switch languages instantly, and view active session credentials in your admin profile."
    },
    complete: {
      title: "Tour Completed!",
      desc: "You are now equipped with Nexus Intelligence. Start optimizing your organizational metrics!"
    }
  },
  hi: {
    welcome: {
      title: "नेक्सस इंटेलिजेंस में आपका स्वागत है!",
      desc: "अपने मुख्य डैशबोर्ड से परिचित होने के लिए आइए एक त्वरित 3D इंटरैक्टिव टूर लें। क्या आप तैयार हैं?"
    },
    logo: {
      title: "नेक्सस न्यूरल कोर",
      desc: "यह 3D नोड ग्राफ कोर सिस्टम स्वास्थ्य को दर्शाता है। कक्षा की गति को तेज करने के लिए ऊपर मंडराएं!"
    },
    predictive: {
      title: "भविष्य कहनेवाला विश्लेषण",
      desc: "हमारा मुख्य तंत्रिका वेक्टर इंजन। अवधि सुरक्षा और जोखिमों का अनुमान लगाने के लिए भविष्यवाणियां चलाएं।"
    },
    tree: {
      title: "वेतन संरचना ट्री",
      desc: "शाखाओं में व्यापक मुआवजा संरचनाओं और वेतन वितरण का दृश्य विश्लेषण करें।"
    },
    compare: {
      title: "जोखिम तुलना मॉड्यूल",
      desc: "कर्मचारी सुरक्षा और उड़ान संभावना की तुलना करने के लिए सीधे जोखिम वेक्टर चलाएं।"
    },
    controls: {
      title: "सार्वभौमिक नियंत्रण और प्रोफ़ाइल",
      desc: "थीम बदलें, भाषाएं स्विच करें, और अपने सुरक्षा क्रेडेंशियल्स की निगरानी करें।"
    },
    complete: {
      title: "टूर पूरा हुआ!",
      desc: "अब आप नेक्सस इंटेलिजेंस से लैस हैं। अपने संगठनात्मक मेट्रिक्स को अनुकूलित करना शुरू करें!"
    }
  },
  es: {
    welcome: {
      title: "¡Bienvenido a Nexus Intelligence!",
      desc: "Hagamos un recorrido interactivo en 3D para familiarizarte con tu centro de control ejecutivo. ¿Listo?"
    },
    logo: {
      title: "Núcleo Neuronal Nexus",
      desc: "Este núcleo gráfico interactivo en 3D representa la salud del sistema. ¡Pasa el mouse para acelerar su órbita!"
    },
    predictive: {
      title: "Motor Predictivo",
      desc: "Nuestro motor vectorial principal. Ingresa métricas y ejecuta predicciones de retención y riesgos."
    },
    tree: {
      title: "Árbol de Salarios",
      desc: "Visualiza estructuras de compensación, distribuciones de grados y nóminas dinámicas."
    },
    compare: {
      title: "Comparación de Riesgos",
      desc: "Analiza y compara la seguridad de tu personal y las probabilidades de fuga lado a lado."
    },
    controls: {
      title: "Controles Universales y Perfil",
      desc: "Cambia temas, idiomas al instante y supervisa tus credenciales en el perfil de usuario."
    },
    complete: {
      title: "¡Recorrido Completado!",
      desc: "Ya estás equipado con Nexus Intelligence. ¡Comienza a optimizar las métricas organizacionales!"
    }
  },
  tr: {
    welcome: {
      title: "Nexus Intelligence'a Hoş Geldiniz!",
      desc: "Yönetici panelinizi tanımak için hızlı bir 3D interaktif tura çıkalım. Hazır mısınız?"
    },
    logo: {
      title: "Nexus Sinirsel Çekirdek",
      desc: "Sistem sağlığını gösteren etkileşimli 3D grafik çekirdeği. Yörünge hızını artırmak için üzerine gelin!"
    },
    predictive: {
      title: "Öngörücü Analiz Motoru",
      desc: "Temel yapay zeka motorumuz. Personel kalıcılığını ve risklerini tahmin etmek için analizleri çalıştırın."
    },
    tree: {
      title: "Maaş Ağacı Navigasyonu",
      desc: "Departmanlar genelindeki maaş yapılarını ve ücret dağılımlarını görselleştirin."
    },
    compare: {
      title: "Risk Karşılaştırma",
      desc: "Personel güvenliğini ve işten ayrılma risklerini yan yana karşılaştırmak için risk vektörleri çalıştırın."
    },
    controls: {
      title: "Evrensel Kontroller ve Profil",
      desc: "Karanlık modu açın, dilleri anında değiştirin ve kullanıcı profilinizi yönetin."
    },
    complete: {
      title: "Tur Tamamlandı!",
      desc: "Artık Nexus Intelligence ile donatıldınız. Organizasyonel metriklerinizi optimize etmeye başlayın!"
    }
  }
};

// Interactive 3D Tour Assistant component rendered inside the tooltip
function TourAssistant3D({ stepIndex, hovered }: { stepIndex: number; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Rotation gets wilder when hovered
      meshRef.current.rotation.x = time * (hovered ? 1.2 : 0.6) + stepIndex;
      meshRef.current.rotation.y = time * (hovered ? 0.9 : 0.4);
      // Pulsing up & down
      meshRef.current.position.y = Math.sin(time * 2.5) * 0.15;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.y = -time * 0.8;
      ringRef1.current.rotation.x = Math.PI / 4 + Math.sin(time) * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = time * 0.5;
      ringRef2.current.rotation.z = Math.sin(time * 1.5) * 0.3;
    }
  });

  // Different geometry for different tour steps to keep it exciting!
  const getGeometry = () => {
    switch (stepIndex % 4) {
      case 0:
        return <octahedronGeometry args={[0.7, 0]} />;
      case 1:
        return <coneGeometry args={[0.5, 1.0, 4]} />;
      case 2:
        return <icosahedronGeometry args={[0.6, 0]} />;
      default:
        return <torusGeometry args={[0.45, 0.18, 8, 24]} />;
    }
  };

  const getColor = () => {
    const colors = ['#6366f1', '#10b981', '#f43f5e', '#a855f7', '#06b6d4', '#eab308'];
    return colors[stepIndex % colors.length];
  };

  const getEmissive = () => {
    const emissives = ['#4f46e5', '#059669', '#e11d48', '#9333ea', '#0891b2', '#ca8a04'];
    return emissives[stepIndex % emissives.length];
  };

  return (
    <group>
      {/* Dynamic Main Pointer */}
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getEmissive()}
          emissiveIntensity={hovered ? 1.4 : 0.7}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.1, 0.04, 8, 32]} />
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.4} 
          wireframe 
        />
      </mesh>

      {/* Orbiting Ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[0.9, 0.03, 8, 32]} />
        <meshStandardMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.3} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

export default function WalkthroughTour() {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);
  const [hovered3D, setHovered3D] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 100, left: 100, position: 'absolute' });
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('left');

  // Multi-language strings selector
  const strings = tourTranslations[language] || tourTranslations['en'];

  const tourSteps = [
    {
      id: 'welcome',
      selector: 'body',
      key: 'welcome',
      placement: 'center'
    },
    {
      id: 'logo',
      selector: '#tour-logo',
      key: 'logo',
      placement: 'right'
    },
    {
      id: 'predictive',
      selector: '#tour-predictive',
      key: 'predictive',
      placement: 'right'
    },
    {
      id: 'tree',
      selector: '#tour-tree',
      key: 'tree',
      placement: 'right'
    },
    {
      id: 'compare',
      selector: '#tour-compare',
      key: 'compare',
      placement: 'right'
    },
    {
      id: 'controls',
      selector: '#tour-user-controls',
      key: 'controls',
      placement: 'left'
    },
    {
      id: 'complete',
      selector: 'body',
      key: 'complete',
      placement: 'center'
    }
  ];

  // Auto trigger for first time managers/users (checks localStorage)
  useEffect(() => {
    const hasSeen = localStorage.getItem('nexus_tour_completed');
    if (!hasSeen) {
      // Small timeout to allow the dashboard layout to mount completely
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Recalculate positions based on active step selector
  useEffect(() => {
    if (!isActive) return;

    const currentStep = tourSteps[step];
    if (currentStep.placement === 'center') {
      setTooltipPos({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        position: 'fixed'
      });
      return;
    }

    const element = document.querySelector(currentStep.selector);
    if (!element) {
      // Fallback to center if element is not present (e.g. admin routes on standard user role)
      setTooltipPos({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        position: 'fixed'
      });
      return;
    }

    // Scroll to the targeted element smoothly to ensure it's in view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    // Calculate popup target coordinates based on element size & placement
    if (currentStep.placement === 'right') {
      top = rect.top + scrollTop + rect.height / 2;
      left = rect.right + scrollLeft + 20;
      setArrowDirection('left');
    } else if (currentStep.placement === 'left') {
      top = rect.top + scrollTop + rect.height / 2;
      left = rect.left + scrollLeft - 340; // width of tooltip + padding
      setArrowDirection('right');
    } else if (currentStep.placement === 'bottom') {
      top = rect.bottom + scrollTop + 20;
      left = rect.left + scrollLeft + rect.width / 2;
      setArrowDirection('top');
    } else {
      top = rect.top + scrollTop - 240;
      left = rect.left + scrollLeft + rect.width / 2;
      setArrowDirection('bottom');
    }

    // Boundaries checking
    if (left < 10) left = 10;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 340;
    if (top < 10) top = 10;

    setTooltipPos({ top, left, position: 'absolute' });
  }, [step, isActive]);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('nexus_tour_completed', 'true');
    setIsActive(false);
    setStep(0);
  };

  const handleStartManual = () => {
    setIsActive(true);
    setStep(0);
  };

  const currentStepData = tourSteps[step];
  const stepContent = strings[currentStepData.key] || strings['welcome'];

  return (
    <>
      {/* Floating launcher trigger for manual tour guidance */}
      <button
        onClick={handleStartManual}
        id="tour-trigger"
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-3 rounded-full shadow-lg hover:shadow-indigo-500/20 transition-all border border-indigo-400/20 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        title="Start Guided Interactive 3D Tour"
        aria-label="Start interactive dashboard walkthrough"
      >
        <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        <span>{language === 'tr' ? 'Rehberli Tur' : language === 'hi' ? 'मार्गदर्शन टूर' : language === 'es' ? 'Recorrido' : 'Interactive Tour'}</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-100"></span>
        </span>
      </button>

      <AnimatePresence>
        {isActive && (
          <>
            {/* Backdrop highlights elements or dims background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950 z-40 pointer-events-none"
            />

            {/* Targeted Pulse Glow effect overlay for focused element */}
            {currentStepData.placement !== 'center' && (
              <motion.div
                key={`glow-${step}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-40 border border-indigo-400 pointer-events-none rounded-xl"
                style={{
                  top: document.querySelector(currentStepData.selector)?.getBoundingClientRect() ? (document.querySelector(currentStepData.selector)!.getBoundingClientRect().top + (window.scrollY || document.documentElement.scrollTop) - 4) : 0,
                  left: document.querySelector(currentStepData.selector)?.getBoundingClientRect() ? (document.querySelector(currentStepData.selector)!.getBoundingClientRect().left + (window.scrollX || document.documentElement.scrollLeft) - 4) : 0,
                  width: document.querySelector(currentStepData.selector)?.getBoundingClientRect() ? (document.querySelector(currentStepData.selector)!.getBoundingClientRect().width + 8) : 0,
                  height: document.querySelector(currentStepData.selector)?.getBoundingClientRect() ? (document.querySelector(currentStepData.selector)!.getBoundingClientRect().height + 8) : 0,
                  boxShadow: '0 0 20px 2px rgba(99, 102, 241, 0.4)',
                }}
              />
            )}

            {/* Dynamic Step Popup */}
            <motion.div
              key={`tooltip-${step}`}
              initial={{ 
                opacity: 0, 
                scale: 0.92, 
                x: currentStepData.placement === 'center' ? '-50%' : 0, 
                y: currentStepData.placement === 'center' ? '-50%' : 0 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: currentStepData.placement === 'center' ? '-50%' : 0, 
                y: currentStepData.placement === 'center' ? '-50%' : 0 
              }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              style={{
                position: tooltipPos.position as any,
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: currentStepData.placement === 'center' ? 'translate(-50%, -50%)' : 'none',
              }}
              className="z-50 w-[330px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col space-y-4"
            >
              {/* Tooltip Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step {step + 1} of {tourSteps.length}
                  </span>
                </div>
                <button 
                  onClick={handleComplete}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Skip tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Holographic Interactive 3D assistant canvas */}
              <div 
                className="h-28 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 overflow-hidden relative group cursor-grab active:cursor-grabbing select-none"
                onMouseEnter={() => setHovered3D(true)}
                onMouseLeave={() => setHovered3D(false)}
                title="Holographic Core - Orbit control active"
              >
                {/* 3D Canvas */}
                <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }}>
                  <ambientLight intensity={1.1} />
                  <pointLight position={[5, 5, 5]} intensity={1.5} color="#818cf8" />
                  <pointLight position={[-5, -5, -5]} intensity={0.4} color="#38bdf8" />
                  <TourAssistant3D stepIndex={step} hovered={hovered3D} />
                </Canvas>

                {/* Info Overlay */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/25 dark:border-slate-700/20 text-[8px] text-slate-500 font-mono tracking-wider">
                  <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                  <span>Hologram Active</span>
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-1.5 text-left">
                <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                  {stepContent.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {stepContent.desc}
                </p>
              </div>

              {/* Buttons Toolbar */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 shrink-0">
                <button
                  onClick={handleComplete}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest px-2 py-1.5 transition-colors"
                >
                  Skip
                </button>

                <div className="flex space-x-2">
                  {step > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-indigo-500/10 border border-indigo-400/20 transition-all outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
                  >
                    <span>{step === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Speech bubble indicator / arrow */}
              {currentStepData.placement !== 'center' && (
                <div 
                  className={`absolute w-3 h-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rotate-45 transform pointer-events-none hidden md:block ${
                    arrowDirection === 'left' ? 'left-[-7px] top-[calc(50%-6px)] border-r-0 border-t-0' :
                    arrowDirection === 'right' ? 'right-[-7px] top-[calc(50%-6px)] border-l-0 border-b-0' :
                    arrowDirection === 'top' ? 'top-[-7px] left-[calc(50%-6px)] border-r-0 border-b-0' :
                    'bottom-[-7px] left-[calc(50%-6px)] border-l-0 border-t-0'
                  }`}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
