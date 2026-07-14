import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Network, Database, Cpu, ChevronRight, Activity, Terminal, 
  ShieldAlert, ArrowRight, CheckCircle2, Lock, Command, FileCode2, GitMerge, Search, LayoutTemplate, RefreshCw, BarChart, ChevronLeft, Menu, X
} from 'lucide-react';
import { servicesData } from './data';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-stone/90 backdrop-blur-md border-b border-paper/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center system-border-accent bg-accent/10 rounded-sm z-50 relative">
              <Command className="w-5 h-5 text-accent" />
            </div>
            <span className="font-mono font-bold tracking-widest uppercase text-sm z-50 relative">Strategic Growth</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase text-paper/60 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              System Online
            </div>
            <Link 
              to="/services"
              className="font-mono text-xs uppercase tracking-wider px-2 hover:text-accent transition-colors hidden sm:block"
            >
              Services
            </Link>
            <Link 
              to="/about"
              className="font-mono text-xs uppercase tracking-wider px-2 hover:text-accent transition-colors hidden sm:block"
            >
              About
            </Link>
            <Link 
              to="/process"
              className="font-mono text-xs uppercase tracking-wider px-2 hover:text-accent transition-colors hidden sm:block"
            >
              Process
            </Link>
            <Link 
              to="/diagnostic" 
              className="font-mono text-xs uppercase tracking-wider px-5 py-2.5 bg-paper text-stone hover:bg-accent transition-colors duration-300 font-semibold hidden sm:inline-block"
            >
              Deploy System
            </Link>
            <button 
              className="sm:hidden text-paper hover:text-accent transition-colors z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-stone/95 backdrop-blur-xl sm:hidden flex flex-col pt-24 px-6 pb-12"
          >
            <div className="flex flex-col gap-8 text-center flex-grow justify-center">
              <Link 
                to="/services"
                className="font-mono text-xl uppercase tracking-wider text-paper hover:text-accent transition-colors"
              >
                Services
              </Link>
              <Link 
                to="/about"
                className="font-mono text-xl uppercase tracking-wider text-paper hover:text-accent transition-colors"
              >
                About
              </Link>
              <Link 
                to="/process"
                className="font-mono text-xl uppercase tracking-wider text-paper hover:text-accent transition-colors"
              >
                Process
              </Link>
              <Link 
                to="/diagnostic" 
                className="font-mono text-lg uppercase tracking-wider px-8 py-4 bg-paper text-stone hover:bg-accent transition-colors duration-300 font-bold mx-auto mt-4"
              >
                Deploy System
              </Link>
            </div>
            <div className="mt-auto pt-8 border-t border-paper/10 flex items-center justify-center gap-2 font-mono text-[10px] uppercase text-paper/40 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              System Online
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-stone/80"></div>
      
      {/* Decorative vertical rails */}
      <div className="absolute left-6 inset-y-0 w-px bg-paper/10 hidden md:block"></div>
      <div className="absolute right-6 inset-y-0 w-px bg-paper/10 hidden md:block"></div>
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 system-border bg-surface/50 backdrop-blur-sm rounded-sm">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Infrastructure Engineering</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
            AI-Powered Growth <br className="hidden md:block" />
            <span className="text-paper/40 italic">Infrastructure</span> for Modern <span className="text-accent cyber-glow">Businesses</span>
          </h1>
          
          <p className="text-lg md:text-xl text-paper/70 font-light max-w-xl leading-relaxed mt-6">
            Websites, automation, and growth systems engineered to help businesses scale intelligently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-2">
            <Link 
              to="/diagnostic"
              className="inline-flex items-center justify-center gap-2 bg-accent text-stone px-8 py-4 font-mono font-bold tracking-wider uppercase hover:bg-paper transition-all duration-300 group"
            >
              Request Diagnostic
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/services"
              className="inline-flex items-center justify-center gap-2 system-border bg-transparent text-paper px-8 py-4 font-mono font-medium tracking-wider uppercase hover:bg-surface transition-colors duration-300"
            >
              View Services
            </Link>
          </div>
          
          <div className="pt-8 border-t border-paper/10 flex items-center justify-between text-paper/40 font-mono text-[10px] tracking-widest uppercase">
            <span>Provider: Daniel Ortiz</span>
            <span>ID: SGAE-01</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="aspect-square w-full max-w-md mx-auto relative">
            <div className="absolute inset-0 system-border-accent rounded-full animate-[spin_60s_linear_infinite] border-t-transparent border-l-transparent opacity-50"></div>
            <div className="absolute inset-4 system-border rounded-full animate-[spin_40s_linear_infinite_reverse] border-b-transparent opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 bg-surface system-border flex items-center justify-center relative z-10">
                 <Network className="w-12 h-12 text-accent" />
               </div>
               
               {/* Fractal nodes */}
               {[0, 1, 2].map((i) => (
                 <motion.div 
                    key={i}
                    className="absolute w-2 h-2 bg-accent rounded-full"
                    animate={{ 
                      x: [0, Math.cos(i * 120 * Math.PI / 180) * 120, 0],
                      y: [0, Math.sin(i * 120 * Math.PI / 180) * 120, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                 />
               ))}
            </div>
            
            <div className="absolute -right-12 top-1/4 bg-surface system-border p-3 flex flex-col gap-1">
               <span className="font-mono text-[8px] text-paper/50 uppercase tracking-wider">A.C.R. Status</span>
               <span className="font-mono text-xs text-accent">Optimized</span>
            </div>
            <div className="absolute -left-8 bottom-1/4 bg-surface system-border p-3 flex flex-col gap-1">
               <span className="font-mono text-[8px] text-paper/50 uppercase tracking-wider">AI Substitute</span>
               <span className="font-mono text-xs text-accent">Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-24 bg-surface relative grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-surface/90"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-stone/20 px-3 py-1 text-xs mb-6 font-bold uppercase tracking-wider text-accent bg-accent/5">
            <ShieldAlert className="w-4 h-4" />
            System Vulnerabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-black leading-none mb-6">
            Manual effort and fragmented systems are choking your growth.
          </h2>
          <p className="text-paper/60 text-lg max-w-md">
            Most businesses operate on a tangled web of weak online presence, manual operations, and inconsistent lead flow. The result is lost revenue and capped scaling potential.
          </p>
        </div>
        
        <div className="space-y-4">
           {[
             { id: "01", title: "Fragmented Systems", desc: "Disconnected tools breaking data flow." },
             { id: "02", title: "Weak Online Presence", desc: "Failing to convert traffic into qualified leads." },
             { id: "03", title: "Inconsistent Lead Flow", desc: "Unpredictable pipeline causing revenue spikes and dips." },
             { id: "04", title: "Manual Operations", desc: "Human intervention bottlenecking scale." }
           ].map((leak, i) => (
             <div key={i} className="bg-stone text-paper p-4 font-mono text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 system-border border-red-500/10 hover:border-red-500/30 transition-colors">
                <div>
                   <div className="text-paper/40 text-[10px] uppercase">Inefficiency {leak.id}</div>
                   <div className="font-bold cursor-default">{leak.title}</div>
                   <div className="text-[10px] text-paper/50 mt-1">{leak.desc}</div>
                </div>
                <div className="text-red-500/80 font-bold border border-red-500/20 px-2 py-1 text-[10px] uppercase whitespace-nowrap self-start sm:self-center">Loss Detected</div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

function ServicePillars() {
  const pillars = [
    {
      title: "Website Infrastructure",
      outcome: "Convert visitors into qualified leads.",
      icon: <LayoutTemplate className="w-6 h-6" />
    },
    {
      title: "AI Automation",
      outcome: "Reduce manual operations & eliminate bottlenecks.",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      title: "SEO & Visibility",
      outcome: "Increase discoverability & capture intent.",
      icon: <Search className="w-6 h-6" />
    },
    {
      title: "Growth Optimization",
      outcome: "Improve conversion and maximize retention.",
      icon: <BarChart className="w-6 h-6" />
    }
  ];

  return (
    <section id="services" className="py-32 bg-stone relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-mono text-sm tracking-widest uppercase text-accent mb-4 block">Resolution Protocol</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Service Pillars</h3>
          <p className="text-paper/60 text-lg">
            We architect solutions that replace manual friction with engineered leverage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 system-border bg-surface hover:bg-surface/80 transition-colors group relative flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 text-paper/40 group-hover:text-accent transition-colors">
                  {pillar.icon}
                </div>
                <h4 className="font-mono text-lg font-bold mb-3 uppercase tracking-wider">{pillar.title}</h4>
                <p className="text-paper/60 text-sm leading-relaxed mb-6 font-sans">
                  <span className="text-accent text-[10px] uppercase tracking-widest block mb-1">Outcome</span>
                  {pillar.outcome}
                </p>
              </div>
              <Link 
                to={`/services/${pillar.title.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`}
                className="mt-4 font-mono text-[10px] uppercase tracking-wider text-paper/50 hover:text-accent transition-colors inline-flex items-center gap-1 self-start"
              >
                Configure Service <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiation() {
  const points = [
    { title: "Systems-First Approach", desc: "We don't just build sites; we build data-driven conversion systems." },
    { title: "AI-Enhanced Workflows", desc: "Leveraging intelligent agents to handle routine tasks autonomously." },
    { title: "Modern Infrastructure", desc: "High-performance tech stacks (Vercel, React) for unparalleled speed." },
    { title: "Personalized Implementation", desc: "Custom architecture designed around your specific bottlenecks." },
    { title: "Growth-Focused", desc: "Every element engineered to capture, qualify, and convert." }
  ];

  return (
    <section className="py-24 bg-surface relative grid-bg">
      <div className="absolute inset-0 bg-surface/90"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-mono text-sm tracking-widest uppercase text-accent mb-4 block">The Advantage</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Why Strategic Growth?</h3>
            <ul className="space-y-6">
              {points.map((pt, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 system-border-accent rounded-full flex items-center justify-center bg-accent/10">
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{pt.title}</h4>
                    <p className="text-paper/60 text-sm mt-1">{pt.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md aspect-square system-border relative flex flex-col items-center justify-center p-8 bg-stone/50 overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15),transparent_70%)]"></div>
               <Activity className="w-16 h-16 text-accent mb-6 relative z-10" />
               <div className="font-mono text-center text-sm uppercase tracking-widest space-y-2 relative z-10">
                 <div className="text-paper/50">Performance Delta</div>
                 <div className="text-4xl text-paper font-bold">+300%</div>
                 <div className="text-[10px] text-accent">Efficiency Gain Detected</div>
               </div>
               {/* Decorative structural framing */}
               <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-accent/50"></div>
               <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-accent/50"></div>
               <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-accent/50"></div>
               <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-accent/50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSnapshot() {
  const steps = [
    { title: "Diagnose", icon: <Activity className="w-5 h-5" />, desc: "Identify structural leaks and operational bottlenecks." },
    { title: "Architect", icon: <Network className="w-5 h-5" />, desc: "Design the custom A.C.R. framework integration." },
    { title: "Deploy", icon: <Terminal className="w-5 h-5" />, desc: "Launch high-performance infrastructure online." },
    { title: "Optimize", icon: <RefreshCw className="w-5 h-5" />, desc: "Iterative improvements for maximum conversion." }
  ];

  return (
    <section className="py-32 bg-stone relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-mono text-sm tracking-widest uppercase text-accent mb-4 block">Execution Plan</h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Process Snapshot</h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 md:gap-4 relative">
           <div className="hidden md:block absolute top-[36px] left-[10%] right-[10%] h-px bg-paper/10"></div>
           {steps.map((step, i) => (
             <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 system-border bg-surface flex items-center justify-center rounded-full mb-6 relative group hover:system-border-accent hover:bg-accent/10 transition-all cursor-default">
                   <div className="text-paper/50 group-hover:text-accent transition-colors">
                     {step.icon}
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-stone system-border rounded-full flex items-center justify-center font-mono text-[10px] text-paper/70 font-bold">
                     0{i+1}
                   </div>
                </div>
                <h4 className="font-bold font-mono tracking-wider uppercase mb-2 text-lg">{step.title}</h4>
                <p className="text-sm text-paper/50 max-w-[200px] leading-relaxed">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

function DiagnosticPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    infrastructure: "",
    painPoint: "",
    leadVolume: "",
    industry: "",
    investment: ""
  });

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setStep(s => s + 1);
  };

  const submitDiagnostic = () => {
    setLoading(true);
    setLoadingLogs(["[OK] Data Packet Received..."]);
    
    setTimeout(() => {
      setLoadingLogs(prev => [...prev, "[OK] Analyzing A.C.R. Alignment..."]);
    }, 800);
    
    setTimeout(() => {
      setLoadingLogs(prev => [...prev, "[OK] Engineering Review Requested..."]);
    }, 1600);
    
    setTimeout(() => {
      setLoading(false);
      setStep(5); // Success State
    }, 2400);
  };

  const getStatusText = () => {
    switch(step) {
      case 1: return "Analyzing Infrastructure Layer...";
      case 2: return "Diagnosing A.C.R. Symptoms...";
      case 3: return "Establishing Operational Context...";
      case 4: return "Verifying Capital Allocation...";
      default: return "System Diagnostic Complete";
    }
  };

  return (
    <main className="pt-32 pb-24 relative min-h-screen grid-bg bg-stone flex flex-col justify-center">
      <div className="absolute inset-0 bg-stone/90"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 uppercase">Request Your Growth Audit</h1>
          <p className="text-paper/60 text-lg max-w-lg mx-auto">
            Qualify your business for AI-powered growth infrastructure.
          </p>
        </div>

        <div className="system-border bg-surface p-1 shadow-2xl shadow-accent/5">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 p-3 border-b border-paper/10 font-mono text-[10px] text-paper/40 uppercase tracking-widest bg-stone/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="ml-2 text-accent">{getStatusText()}</span>
          </div>
          
          <div className="p-8 md:p-12 min-h-[450px] flex flex-col justify-center bg-stone/20">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-start justify-center gap-4 text-paper/80 font-mono text-sm h-full max-w-sm mx-auto w-full"
                >
                  <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4 text-center mx-auto"></div>
                  {loadingLogs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-accent tracking-widest uppercase text-xs"
                    >
                      {log}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key={`step-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex-grow flex flex-col justify-center"
                >
                  {/* Gate 01 */}
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest">
                         Gate 01: <span className="text-paper">Current System Foundation?</span>
                       </div>
                       <div className="grid sm:grid-cols-3 gap-4">
                         {[
                           { val: 'active', label: 'Active Website/App' },
                           { val: 'placeholder', label: 'Placeholder/Landing Page' },
                           { val: 'zero', label: 'No Existing Infrastructure - Starting from Zero' }
                         ].map((opt, i) => (
                            <button 
                              key={i} 
                              onClick={() => { updateForm('infrastructure', opt.val); handleNext(); }}
                              className="text-left p-6 system-border hover:system-border-accent hover:bg-accent/5 transition-all group flex flex-col justify-between h-32 bg-stone/40"
                            >
                              <div className="font-bold text-sm leading-tight text-paper group-hover:text-accent transition-colors">{opt.label}</div>
                              <ArrowRight className="w-4 h-4 text-paper/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </button>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Gate 02 */}
                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest">
                         Gate 02: <span className="text-paper">What is the most urgent system failure you're experiencing?</span>
                       </div>
                       <div className="grid sm:grid-cols-2 gap-4">
                         {[
                           { val: 'acquisition', title: 'Visibility Void', desc: 'Nobody knows we exist. (Acquisition)' },
                           { val: 'conversion', title: 'The Ghost Town', desc: "We have visitors, but they don't take action. (Conversion)" },
                           { val: 'operations', title: 'Manual Chaos', desc: 'We are overwhelmed by repetitive tasks and follow-ups. (Operations)' },
                           { val: 'audit', title: 'System Blindness', desc: "I'm not sure where the leak is; I just know we aren't scaling." }
                         ].map((opt, i) => (
                            <button 
                              key={i} 
                              onClick={() => { updateForm('painPoint', opt.val); handleNext(); }}
                              className="text-left p-6 system-border hover:system-border-accent hover:bg-accent/5 transition-all group bg-stone/40"
                            >
                              <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">{opt.title}</div>
                              <div className="font-bold text-sm leading-relaxed text-paper/80 group-hover:text-paper transition-colors">{opt.desc}</div>
                            </button>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Gate 03 */}
                  {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest text-center">
                         Gate 03: <span className="text-paper">Operational Context</span>
                       </div>
                       <div className="space-y-6">
                         <div>
                           <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Primary industry/niche?</label>
                           <input 
                             type="text"
                             value={formData.industry}
                             onChange={(e) => updateForm('industry', e.target.value)}
                             placeholder="e.g. Legal, SaaS, Local Service"
                             className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                           />
                         </div>
                         <div>
                           <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Current monthly lead volume?</label>
                           <select
                             value={formData.leadVolume}
                             onChange={(e) => updateForm('leadVolume', e.target.value)}
                             className="w-full bg-stone system-border p-4 text-paper focus:outline-none focus:border-accent font-sans text-sm appearance-none cursor-pointer"
                           >
                             <option value="" disabled>Select volume...</option>
                             <option value="0-10">0 - 10 Leads / mo</option>
                             <option value="11-50">11 - 50 Leads / mo</option>
                             <option value="51-200">51 - 200 Leads / mo</option>
                             <option value="200+">200+ Leads / mo</option>
                           </select>
                         </div>
                         
                         <button 
                            disabled={!formData.industry || !formData.leadVolume}
                            onClick={handleNext}
                            className="w-full bg-accent text-stone py-4 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                          >
                            Establish Context &rarr;
                          </button>
                       </div>
                    </div>
                  )}

                  {/* Gate 04 */}
                  {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest text-center">
                         Gate 04: <span className="text-paper">The Qualification</span>
                       </div>
                       <div className="space-y-6">
                         <div>
                           <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Target growth investment for the next 90 days?</label>
                           <select
                             value={formData.investment}
                             onChange={(e) => updateForm('investment', e.target.value)}
                             className="w-full bg-stone system-border p-4 text-paper focus:outline-none focus:border-accent font-sans text-sm appearance-none cursor-pointer"
                           >
                             <option value="" disabled>Select investment range...</option>
                             <option value="1k-3k">$1,000 - $3,000</option>
                             <option value="3k-10k">$3,000 - $10,000</option>
                             <option value="10k-25k">$10,000 - $25,000</option>
                             <option value="25k+">$25,000+</option>
                           </select>
                         </div>
                         
                         <button 
                            disabled={!formData.investment}
                            onClick={submitDiagnostic}
                            className="w-full bg-accent text-stone py-4 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
                          >
                            <Terminal className="w-4 h-4" /> Initialize Diagnostic
                          </button>
                       </div>
                    </div>
                  )}

                  {/* Success State */}
                  {step === 5 && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-700 max-w-md mx-auto">
                       <div className="w-20 h-20 system-border-accent rounded-full flex items-center justify-center mx-auto bg-accent/10 mb-8">
                         <Activity className="w-10 h-10 text-accent" />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-paper">
                         Diagnostic Data Uplink Complete.
                       </h3>
                       <p className="text-paper/60 text-sm leading-relaxed mb-10">
                         Our Lead Architect is reviewing your infrastructure symptoms. You will receive a personalized Blueprint Briefing within 24 hours.
                       </p>
                       
                       <div className="space-y-4">
                         <a href="https://zcal.co/danielortizceo/10min" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-accent text-stone px-6 py-4 font-mono font-bold tracking-wider uppercase text-xs hover:bg-paper transition-all">
                           Schedule 10-Min Architecture Call
                         </a>                         <a href="/Marketing/Assets/Service_Agreement.pdf" target="_blank" className="flex items-center justify-center w-full system-border bg-stone px-6 py-4 font-mono tracking-wider uppercase text-[10px] text-paper/60 hover:text-accent hover:system-border-accent transition-all gap-2">
                           <FileCode2 className="w-3 h-3" /> Download Governance Protocol (PDF)
                         </a>
                         <Link to="/" className="flex items-center justify-center w-full text-paper/40 hover:text-accent px-6 py-4 font-mono tracking-wider uppercase text-[10px] transition-colors mt-2">
                           &larr; Return Home
                         </Link>
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="p-4 border-t border-paper/10 bg-stone/50 font-mono text-[10px] text-paper/30 uppercase tracking-widest flex items-center justify-between">
            {step < 5 && <span>Phase 0{step} // Action Required</span>}
            {step === 5 && <span className="text-accent">Phase Complete // Awaiting Governance</span>}
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="bg-stone border-t border-paper/10 py-12 text-sm font-mono uppercase tracking-wider text-paper/40">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4 text-paper font-bold">
            <Command className="w-4 h-4 text-accent" />
            STRATEGIC GROWTH
          </div>
          <p className="max-w-sm normal-case text-xs text-paper/50 font-sans leading-relaxed">
            AI systems intelligence firm engineering repeatable growth infrastructure. We build high-performance digital environments for serious operators.
          </p>
        </div>
        <div>
          <div className="font-bold text-paper mb-4">Contact</div>
          <ul className="space-y-2 text-[10px]">
             <li><a href="mailto:STRATEGICGROWTH.BIZ@OUTLOOK.COM" className="hover:text-accent transition-colors">STRATEGICGROWTH.BIZ@OUTLOOK.COM</a></li>
             <li><a href="tel:3854607852" className="hover:text-accent transition-colors">(385) 460-7852</a></li>
             <li className="normal-case">1879 S 875 E, Clearfield, UT 84015</li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-paper mb-4">Governance</div>
          <ul className="space-y-2 text-[10px]">
             <li><a href="/Marketing/Assets/Service_Agreement.pdf" target="_blank" className="hover:text-accent transition-colors flex items-center gap-1.5"><FileCode2 className="w-3 h-3" /> Service_Agreement.pdf</a></li>
             <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
        <div>&copy; {new Date().getFullYear()} Strategic Growth. All rights reserved.</div>
        <div className="flex items-center gap-2">
           Status: <span className="text-accent flex items-center gap-1"><span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span> Operational</span>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <ServicePillars />
      <Differentiation />
      <ProcessSnapshot />
    </main>
  );
}

function ServicesHub() {
  return (
    <main className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-6">
          Growth Systems Built <br /> Around Your <span className="text-accent">Business</span>
        </h1>
        <p className="text-lg text-paper/70 font-light max-w-2xl leading-relaxed">
          Select an architectural component to view detailed parameters, deliverables, and deployment configurations.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {servicesData.map((srv, i) => (
          <Link 
            key={i} 
            to={`/services/${srv.slug}`}
            className="system-border bg-surface hover:bg-surface/80 transition-colors p-8 group relative flex flex-col items-start"
          >
             <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-500"></div>
             <div className="text-paper/40 group-hover:text-accent transition-colors mb-6">
               {srv.icon}
             </div>
             <h3 className="text-2xl font-bold tracking-tight mb-4 uppercase">{srv.title}</h3>
             <p className="text-paper/60 text-sm leading-relaxed mb-8 flex-grow">
               {srv.description}
             </p>
             <div className="font-mono text-[10px] uppercase tracking-wider text-accent inline-flex items-center gap-2">
               View Protocol <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
             </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

function ServiceDetail() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').pop();
  const service = servicesData.find(s => s.slug === slug);

  if (!service) {
    return (
      <main className="pt-40 min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Module Not Found</h1>
          <Link to="/services" className="text-accent underline font-mono text-sm uppercase">Return to Hub</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        {service.icon}
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/services" className="inline-flex items-center gap-2 font-mono text-[10px] text-paper/40 hover:text-paper uppercase tracking-widest mb-12 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Services Hub
        </Link>
        
        {/* Hero */}
        <div className="mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 system-border bg-surface/50 backdrop-blur-sm rounded-sm mb-6">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Deployment Module: {service.title}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-6 max-w-4xl">
            {service.hero.headline}
          </h1>
          <p className="text-lg md:text-xl text-paper/70 font-light max-w-2xl leading-relaxed">
            {service.hero.subheadline}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-24">
             {/* Problems */}
             <section>
                <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-accent/30"></span> The Bottlenecks
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {service.problems.map((p, i) => (
                    <div key={i} className="bg-surface system-border p-6 border-l-2 border-l-red-500/50">
                       <h4 className="font-bold mb-2 uppercase text-sm tracking-wider">{p.title}</h4>
                       <p className="text-paper/60 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
             </section>

             {/* Outcomes */}
             <section>
                <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-accent/30"></span> Performance Outcomes
                </div>
                <div className="flex flex-wrap gap-4">
                  {service.outcomes.map((o, i) => (
                    <div key={i} className="px-4 py-3 system-border-accent bg-accent/5 font-mono text-sm uppercase tracking-wider text-paper">
                       {o}
                    </div>
                  ))}
                </div>
             </section>

             {/* Process */}
             <section>
                <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-accent/30"></span> Deployment Protocol
                </div>
                <div className="space-y-6">
                  {service.process.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full border border-paper/20 flex items-center justify-center font-mono text-xs text-paper/50 flex-shrink-0 mt-1">
                          0{i+1}
                       </div>
                       <div>
                          <h4 className="font-bold uppercase tracking-wider mb-2">{step.step}</h4>
                          <p className="text-paper/60 text-sm">{step.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </section>

             {/* FAQ */}
             <section>
                <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-accent/30"></span> System Parameters (FAQ)
                </div>
                <div className="space-y-6">
                  {service.faq.map((fq, i) => (
                    <div key={i} className="border-b border-paper/10 pb-6">
                       <h4 className="font-bold uppercase tracking-wider text-sm mb-3 text-paper/80">Q: {fq.q}</h4>
                       <p className="text-paper/50 text-sm leading-relaxed font-mono">A: {fq.a}</p>
                    </div>
                  ))}
                </div>
             </section>
          </div>

          <div>
             {/* Sticky Sidebar */}
             <div className="sticky top-24 space-y-8">
                {/* Deliverables Card */}
                <div className="system-border bg-stone p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-full h-1 bg-accent/20"></div>
                   <h3 className="font-mono uppercase tracking-widest text-sm text-paper mb-6">Component Deliverables</h3>
                   <ul className="space-y-4">
                     {service.deliverables.map((del, i) => (
                       <li key={i} className="flex items-start gap-3">
                         <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-accent" /></div>
                         <span className="text-sm text-paper/70 font-sans">{del}</span>
                       </li>
                     ))}
                   </ul>
                </div>
                
                {/* CTA Card */}
                <div className="system-border-accent bg-surface p-8 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
                   <Activity className="w-8 h-8 text-accent mx-auto mb-4" />
                   <h3 className="font-bold text-xl uppercase tracking-wider mb-4">Initialize Build</h3>
                   <p className="text-xs text-paper/60 font-mono mb-6">
                     Deploy this architectural component to your business infrastructure.
                   </p>
                   <Link 
                     to="/diagnostic"
                     className="w-full inline-block bg-accent py-3 font-mono font-bold text-xs uppercase tracking-wider text-stone hover:bg-paper transition-colors"
                   >
                     Request Audit
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProcessPage() {
  const steps = [
    {
      title: "Initialization & Diagnostic",
      subtitle: "The A.C.R. Audit",
      goal: "Identify leaks in Acquisition, Conversion, and Retention.",
      detailType: "Output",
      detail: "Strategic Architecture Blueprint.",
      icon: <Search className="w-8 h-8" />
    },
    {
      title: "Governance & Lock-In",
      subtitle: "The Legal Gateway",
      goal: "Secure the $950 deposit and sign the 'Service_Agreement.pdf' via the Stripe QR-Protocol.",
      detailType: "Gate",
      detail: "Project does not move to Phase 03 until Governance is active.",
      icon: <Lock className="w-8 h-8" />
    },
    {
      title: "Infrastructure Build",
      subtitle: "The Anchor Grid",
      goal: "Develop the conversion-focused website and AI automation layers.",
      detailType: "Tech",
      detail: "Git-controlled deployment to Edge Infrastructure (Vercel).",
      icon: <Terminal className="w-8 h-8" />
    },
    {
      title: "System Optimization",
      subtitle: "The Scale Phase",
      goal: "Continuous SEO signal monitoring and conversion tuning.",
      icon: <RefreshCw className="w-8 h-8" />
    }
  ];

  return (
    <main className="pt-32 pb-24 relative overflow-hidden bg-stone">
      <div className="absolute inset-0 grid-bg"></div>
      
      {/* Decorative vertical rails */}
      <div className="absolute left-6 inset-y-0 w-px bg-paper/5 hidden md:block"></div>
      <div className="absolute right-6 inset-y-0 w-px bg-paper/5 hidden md:block"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 system-border bg-surface/50 backdrop-blur-sm rounded-sm mb-6">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Deployment Lifecycle</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-6">
          AegisMind Deployment<br className="hidden sm:block"/>
          <span className="text-paper/40 italic">Lifecycle</span>
        </h1>
        <p className="text-lg md:text-xl text-paper/70 font-light leading-relaxed max-w-2xl mx-auto">
          We don't guess. We operate on a rigid process of diagnosis, architectural planning, deployment, and continuous iteration.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={i} className="relative flex gap-6 md:gap-12 group">
              {/* Timeline Connector */}
              {i !== steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-[-3rem] w-px bg-paper/10 group-hover:bg-accent/30 transition-colors hidden sm:block"></div>
              )}
              
              <div className="hidden sm:flex w-16 h-16 system-border bg-surface items-center justify-center rounded-full flex-shrink-0 z-10 hover:system-border-accent hover:bg-accent/10 transition-all text-paper/40 hover:text-accent">
                {step.icon}
              </div>
              
              <div className="p-8 system-border bg-surface/80 hover:bg-surface transition-colors flex-grow relative overflow-hidden group-hover:system-border-accent">
                <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-500"></div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 block">
                  Phase {String(i + 1).padStart(2, '0')} // {step.subtitle}
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-4 uppercase">{step.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[10px] text-paper/40 uppercase tracking-widest mb-1">Goal</div>
                    <p className="text-paper/80 text-base leading-relaxed">
                      {step.goal}
                    </p>
                  </div>
                  
                  {step.detail && (
                    <div className="pt-4 border-t border-paper/10">
                      <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1">{step.detailType}</div>
                      <p className="text-paper/60 text-sm font-mono">
                        {step.detail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center system-border bg-surface p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
          <Activity className="w-10 h-10 text-accent mx-auto mb-6" />
          <h3 className="font-bold text-2xl uppercase tracking-wider mb-4">Initialize Sequence</h3>
          <p className="text-paper/60 font-mono text-sm mb-8 max-w-sm mx-auto">
            Ready to transition from fragmented effort to engineered systems?
          </p>
          <Link 
            to="/diagnostic"
            className="inline-block bg-accent py-4 px-8 font-mono font-bold text-sm uppercase tracking-wider text-stone hover:bg-paper hover:scale-[1.02] active:scale-95 transition-all"
          >
            Request Infrastructure Review
          </Link>
        </div>
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="pt-32 pb-24 relative min-h-screen bg-stone">
      <div className="absolute inset-0 grid-bg opacity-50"></div>
      
      {/* Decorative vertical rails */}
      <div className="absolute left-6 inset-y-0 w-px bg-paper/5 hidden md:block"></div>
      <div className="absolute right-6 inset-y-0 w-px bg-paper/5 hidden md:block"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Hero Section */}
        <div className="mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 system-border bg-surface/50 backdrop-blur-sm rounded-sm mb-6">
             <Terminal className="w-3.5 h-3.5 text-accent" />
             <span className="font-mono text-[10px] uppercase tracking-widest text-accent">SGAE-01 // About</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 max-w-4xl">
            Precision <span className="text-paper/40 italic">Engineering</span> for the Sovereign <span className="text-accent cyber-glow">Founder.</span>
          </h1>
          <p className="text-lg md:text-xl text-paper/70 font-light max-w-2xl leading-relaxed">
            Strategic Growth is not an agency. It is an AI-powered systems architecture firm built for operators who demand performance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-24">
            
            {/* Founder Section */}
            <section>
              <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                <span className="w-8 h-px bg-accent/30"></span> Behind the Code
              </div>
              <p className="text-paper/80 text-lg leading-relaxed mb-6">
                Strategic Growth was founded by Daniel — a self-taught AI systems architect. No formal degrees, no bloated agency models. The skillset was built through raw experimentation, terminal-driven workflows, and an obsession with solving genuine business bottlenecks.
              </p>
              <p className="text-paper/60 leading-relaxed mb-6">
                His philosophy operates on the premise that true vision and creativity "flow from a place no certificate can teach." He does not outsource your infrastructure. He is the architect building the systems, ensuring that every code block and automation pipeline is forged with intent.
              </p>
            </section>

            {/* The AegisMind Core */}
            <section>
              <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                <span className="w-8 h-px bg-accent/30"></span> The AegisMind Protocol
              </div>
              <p className="text-paper/80 text-lg leading-relaxed mb-6">
                Our infrastructure is governed by a tripartite command chain inspired by a sovereign AI framework: AegisMind.
              </p>
              <p className="text-paper/60 leading-relaxed">
                Systems are designed leveraging local LLM governance, terminal-based engineering, and a rigid philosophy of "Revenue Influence Infrastructure." We build closed-loop systems that remain robust, adaptive, and fully aligned with the operator's end goals.
              </p>
            </section>

            {/* The A.C.R. Doctrine */}
            <section>
              <div className="font-mono text-sm tracking-widest uppercase text-accent mb-6 flex items-center gap-4">
                <span className="w-8 h-px bg-accent/30"></span> Fixing the Leaks
              </div>
              <div className="system-border bg-surface p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-48 h-48" />
                 </div>
                 <h3 className="font-bold text-xl uppercase tracking-wider mb-4 relative z-10">The A.C.R. Backbone</h3>
                 <p className="text-paper/70 leading-relaxed mb-6 relative z-10">
                   Acquisition, Conversion, and Retention form the vital backbone of every business. Most SMBs suffer from "leaky systems" — wasted traffic, broken follow-up sequences, and inconsistent retention loops.
                 </p>
                 <p className="text-paper/70 leading-relaxed relative z-10">
                   Strategic Growth doesn't just build websites; we seal the infrastructure. We engineer the environment so that traffic flows efficiently into conversion, and retention scales automatically.
                 </p>
              </div>
            </section>
            
          </div>

          <div>
             {/* Sticky Sidebar */}
             <div className="sticky top-24 space-y-8">
                
                {/* Visual Element */}
                <div className="system-border bg-[#0a0a0a] rounded-sm overflow-hidden flex flex-col shadow-2xl shadow-accent/5">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-2 p-3 border-b border-paper/10 bg-stone/80">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="font-mono text-[10px] text-paper/40 uppercase tracking-widest ml-2 flex items-center gap-2">
                       <Terminal className="w-3 h-3" /> daniel@sgae-01:~
                    </span>
                  </div>
                  {/* Terminal Body */}
                  <div className="p-5 font-mono text-[10px] sm:text-xs text-accent leading-relaxed bg-[#0a0a0a] min-h-[200px]">
                    <div className="text-paper/50 mb-2"># Initializing AegisMind...</div>
                    <div className="mb-2">&gt; Loading tripartite_protocol.sh</div>
                    <div className="mb-4 text-paper/60 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> [OK] Framework Active</div>
                    <div className="text-paper/50 mb-2"># Compiling A.C.R architecture...</div>
                    <div className="mb-2 text-paper">&gt; Deploying Revenue Influence Layer</div>
                    <div className="mb-4 text-paper/60 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> [OK] Leaks Sealed</div>
                    <div className="animate-pulse flex items-center gap-2"><span className="w-2 h-4 bg-accent inline-block"></span></div>
                  </div>
                </div>

                {/* System Specs */}
                <div className="system-border bg-stone p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Cpu className="w-32 h-32" />
                   </div>
                   <div className="absolute top-0 left-0 w-1 h-full bg-accent/50"></div>
                   <div className="flex items-center justify-between mb-6 relative z-10">
                     <h3 className="font-mono uppercase tracking-widest text-sm text-paper">System Specs</h3>
                   </div>
                   
                   <ul className="space-y-4 font-mono text-[10px] uppercase tracking-wider text-paper/60 relative z-10">
                     <li className="flex justify-between border-b border-paper/10 pb-3">
                       <span>Deployment</span>
                       <span className="text-accent font-bold">Vercel Edge</span>
                     </li>
                     <li className="flex justify-between border-b border-paper/10 pb-3">
                       <span>Source Control</span>
                       <span className="text-accent font-bold">Git</span>
                     </li>
                     <li className="flex justify-between border-b border-paper/10 pb-3">
                       <span>Governance</span>
                       <span className="text-accent font-bold">Local LLM</span>
                     </li>
                     <li className="flex justify-between border-b border-paper/10 pb-3">
                       <span>Engineering</span>
                       <span className="text-accent font-bold">Terminal-Based</span>
                     </li>
                     <li className="flex justify-between border-b border-paper/10 pb-3">
                       <span>Protocol</span>
                       <span className="text-accent font-bold">AegisMind Tripartite</span>
                     </li>
                     <li className="flex justify-between pt-1">
                       <span>Architecture</span>
                       <span className="text-accent font-bold">SGAE-01 Standard</span>
                     </li>
                   </ul>
                </div>

             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-stone text-paper font-sans overflow-x-hidden selection:bg-accent selection:text-stone">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesHub />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

