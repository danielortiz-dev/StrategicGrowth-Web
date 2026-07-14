import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Activity, Terminal, ArrowRight, Lock, FileCode2
} from 'lucide-react';
import { DiagnosticSubmission } from '../types/diagnostic';

export default function DiagnosticPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<DiagnosticSubmission>({
    firstName: "",
    lastName: "",
    email: "",
    infrastructure: "",
    painPoint: "",
    industry: "",
    leadVolume: "",
    investment: ""
  });

  const updateForm = (key: keyof DiagnosticSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setStep(s => s + 1);
  };

  const submitDiagnostic = async () => {
    setLoading(true);
    setSubmitError(null);
    setLoadingLogs(["[OK] Data Packet Received..."]);
    
    setTimeout(() => {
      setLoadingLogs(prev => [...prev, "[OK] Analyzing A.C.R. Alignment..."]);
    }, 800);
    
    setTimeout(() => {
      setLoadingLogs(prev => [...prev, "[OK] Engineering Review Requested..."]);
    }, 1600);
    
    setTimeout(() => {
      // Mocked adapter for Phase 1. Will be replaced by fetch to /api/submit-diagnostic in Phase 2
      console.log("[MOCK] Diagnostic Submission Payload:", formData);
      setLoading(false);
      setStep(6); // Success State
    }, 2400);
  };

  const getStatusText = () => {
    switch(step) {
      case 1: return "Identity & Clearance...";
      case 2: return "Analyzing Infrastructure Layer...";
      case 3: return "Diagnosing A.C.R. Symptoms...";
      case 4: return "Establishing Operational Context...";
      case 5: return "Verifying Capital Allocation...";
      default: return "System Diagnostic Complete";
    }
  };

  // Generate the Zcal URL with prefilled parameters
  const getZcalUrl = () => {
    const baseUrl = "https://zcal.co/danielortizceo/10min";
    const params = new URLSearchParams();
    if (formData.firstName) params.append("name", `${formData.firstName} ${formData.lastName}`.trim());
    if (formData.email) params.append("email", formData.email);
    return `${baseUrl}?${params.toString()}`;
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
                  {/* Gate 01: Identity */}
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest text-center">
                         Gate 01: <span className="text-paper">Identity & Clearance</span>
                       </div>
                       <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">First Name</label>
                             <input 
                               type="text"
                               value={formData.firstName}
                               onChange={(e) => updateForm('firstName', e.target.value)}
                               placeholder="Jane"
                               className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                             />
                           </div>
                           <div>
                             <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Last Name</label>
                             <input 
                               type="text"
                               value={formData.lastName}
                               onChange={(e) => updateForm('lastName', e.target.value)}
                               placeholder="Doe"
                               className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                             />
                           </div>
                         </div>
                         <div>
                           <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Business Email</label>
                           <input 
                             type="email"
                             value={formData.email}
                             onChange={(e) => updateForm('email', e.target.value)}
                             placeholder="jane@company.com"
                             className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                           />
                         </div>
                         
                         <button 
                            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.email.includes('@')}
                            onClick={handleNext}
                            className="w-full bg-accent text-stone py-4 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                          >
                            Verify Identity &rarr;
                          </button>
                       </div>
                    </div>
                  )}

                  {/* Gate 02: Infrastructure */}
                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest">
                         Gate 02: <span className="text-paper">Current System Foundation?</span>
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

                  {/* Gate 03: Pain Point */}
                  {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest">
                         Gate 03: <span className="text-paper">What is the most urgent system failure you're experiencing?</span>
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

                  {/* Gate 04: Context */}
                  {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest text-center">
                         Gate 04: <span className="text-paper">Operational Context</span>
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

                  {/* Gate 05: Investment */}
                  {step === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                       <div className="font-mono text-sm text-paper/60 uppercase tracking-widest text-center">
                         Gate 05: <span className="text-paper">The Qualification</span>
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
                         
                         {submitError && (
                           <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                             [ERROR] {submitError}
                           </div>
                         )}

                         <button 
                            disabled={!formData.investment}
                            onClick={submitDiagnostic}
                            className="w-full bg-accent text-stone py-4 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
                          >
                            <Terminal className="w-4 h-4" /> Submit Diagnostic
                          </button>
                       </div>
                    </div>
                  )}

                  {/* Success State */}
                  {step === 6 && (
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
                         <a href={getZcalUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-accent text-stone px-6 py-4 font-mono font-bold tracking-wider uppercase text-xs hover:bg-paper transition-all">
                           Schedule 10-Min Architecture Call
                         </a>
                         <a href="/Marketing/Assets/Service_Agreement.pdf" target="_blank" className="flex items-center justify-center w-full system-border bg-stone px-6 py-4 font-mono tracking-wider uppercase text-[10px] text-paper/60 hover:text-accent hover:system-border-accent transition-all gap-2">
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
            {step < 6 && <span>Phase 0{step} // Action Required</span>}
            {step === 6 && <span className="text-accent">Phase Complete // Awaiting Governance</span>}
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
