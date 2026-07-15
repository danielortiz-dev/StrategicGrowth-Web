import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Lock } from 'lucide-react';
import { MicroIntakeSubmission } from '../types/diagnostic';

export default function MicroIntakePage() {
  const [formData, setFormData] = useState<MicroIntakeSubmission>({
    schemaVersion: '1.0',
    submissionKey: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    fullName: "",
    email: "",
    businessName: "",
    websiteUrl: "",
    mainGrowthChallenge: "",
    clientStartedAt: new Date().toISOString(),
    landingPath: window.location.pathname,
    referrer: document.referrer || '',
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    fbclid: "",
    gclid: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData(prev => ({
      ...prev,
      utmSource: params.get('utm_source') || "",
      utmMedium: params.get('utm_medium') || "",
      utmCampaign: params.get('utm_campaign') || "",
      utmTerm: params.get('utm_term') || "",
      utmContent: params.get('utm_content') || "",
      fbclid: params.get('fbclid') || "",
      gclid: params.get('gclid') || ""
    }));
  }, []);

  const updateForm = (key: keyof MicroIntakeSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return formData.fullName.trim() !== "" && 
           formData.email.trim().includes('@') && 
           formData.mainGrowthChallenge.trim() !== "";
  };

  const handleBooking = () => {
    if (!isFormValid() || loading) return;
    
    setLoading(true);
    
    // Simulate slight processing delay without logging raw PII or implying submission
    setTimeout(() => {
      setLoading(false);
      const baseUrl = "https://zcal.co/danielortizceo/10min";
      const params = new URLSearchParams();
      if (formData.fullName) params.append("name", formData.fullName.trim());
      if (formData.email) params.append("email", formData.email.trim());
      
      window.location.href = `${baseUrl}?${params.toString()}`;
    }, 400);
  };

  return (
    <main className="pt-32 pb-24 relative min-h-screen grid-bg bg-stone flex flex-col justify-center">
      <div className="absolute inset-0 bg-stone/90"></div>
      
      <div className="max-w-xl mx-auto px-6 relative z-10 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase">Tell Me What’s Holding Your Growth Back</h1>
          <p className="text-paper/60 text-base max-w-md mx-auto">
            Share the main challenge you want to solve, then choose a time for a short strategy call.
          </p>
        </div>

        <div className="system-border bg-surface p-1 shadow-2xl shadow-accent/5">
          <div className="flex items-center gap-2 p-3 border-b border-paper/10 font-mono text-[10px] text-paper/40 uppercase tracking-widest bg-stone/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="ml-2 text-accent">Strategy Call Intake</span>
          </div>
          
          <div className="p-8 bg-stone/20">
            <div className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Full Name *</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateForm('fullName', e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Business Email *</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Business Name (Optional)</label>
                  <input 
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Website (Optional)</label>
                  <input 
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => updateForm('websiteUrl', e.target.value)}
                    placeholder="https://company.com"
                    className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-paper/50 mb-2">Main Growth Challenge *</label>
                <textarea 
                  value={formData.mainGrowthChallenge}
                  onChange={(e) => updateForm('mainGrowthChallenge', e.target.value)}
                  placeholder="What is the biggest growth problem you want help solving?"
                  rows={4}
                  className="w-full bg-stone system-border p-4 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-sm resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={!isFormValid() || loading}
                  onClick={handleBooking}
                  className="w-full bg-accent text-stone py-4 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  <Terminal className="w-4 h-4" /> 
                  {loading ? 'Processing...' : 'See Available Times'}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-[10px] font-sans text-paper/50 leading-relaxed max-w-sm mx-auto">
                  By continuing, you agree that Strategic Growth may use the information provided to prepare for and follow up about your requested strategy call. Scheduling is handled through Zcal. No payment or service agreement is created.{' '}
                  <Link to="/privacy" className="text-paper/70 hover:text-accent underline">View Privacy Policy</Link>.
                </p>
              </div>

            </div>
          </div>
          
          <div className="p-4 border-t border-paper/10 bg-stone/50 font-mono text-[10px] text-paper/30 uppercase tracking-widest flex items-center justify-between">
            <span>Pre-Call Context // Action Required</span>
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
