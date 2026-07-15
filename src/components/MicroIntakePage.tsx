import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
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
    <main className="pt-28 pb-16 relative min-h-screen grid-bg bg-stone flex flex-col justify-center">
      <div className="absolute inset-0 bg-stone/90"></div>
      
      <div className="max-w-[800px] mx-auto px-6 relative z-10 w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 uppercase">Tell Me What’s Holding Your Growth Back</h1>
          <p className="text-paper/60 text-xs max-w-md mx-auto">
            Share the main challenge you want to solve, then choose a time for a short strategy call.
          </p>
        </div>

        <div className="system-border bg-surface p-1 shadow-2xl shadow-accent/5">
          <div className="flex items-center gap-2 p-2 border-b border-paper/10 font-mono text-[9px] text-paper/40 uppercase tracking-widest bg-stone/50">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
            <span className="ml-2 text-accent">Strategy Call Intake</span>
          </div>
          
          <div className="p-6 bg-stone/20">
            <div className="space-y-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Full Name *</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateForm('fullName', e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Business Email *</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Business Name (Optional)</label>
                  <input 
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Website (Optional)</label>
                  <input 
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => updateForm('websiteUrl', e.target.value)}
                    placeholder="https://company.com"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Main Growth Challenge *</label>
                <textarea 
                  value={formData.mainGrowthChallenge}
                  onChange={(e) => updateForm('mainGrowthChallenge', e.target.value)}
                  placeholder="What is the biggest growth problem you want help solving?"
                  rows={3}
                  className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs resize-none"
                />
              </div>

              <div className="pt-1">
                <button 
                  disabled={!isFormValid() || loading}
                  onClick={handleBooking}
                  className="w-full bg-accent text-stone py-3 font-mono uppercase tracking-widest font-bold text-xs hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  <Terminal className="w-4 h-4" /> 
                  {loading ? 'Processing...' : 'See Available Times'}
                </button>
              </div>

              <div className="text-center pt-2 border-t border-paper/10">
                <p className="text-[10px] text-paper/50 font-sans mb-2">
                  Want to give me more context first?
                </p>
                <Link
                  to="/diagnostic-prep"
                  className="w-full inline-flex items-center justify-center bg-transparent system-border border-accent/40 hover:border-accent/80 text-accent py-3 font-mono uppercase tracking-widest font-bold text-[10px] hover:bg-accent/10 transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  Complete Optional 2-Minute Call Preparation
                </Link>
              </div>

              <div className="text-center pt-1">
                <p className="text-[9px] font-sans text-paper/40 leading-relaxed max-w-md mx-auto">
                  By continuing, you agree that Strategic Growth may use the information provided to prepare for and follow up about your requested strategy call. Scheduling is handled through Zcal. No payment or service agreement is created.{' '}
                  <Link to="/privacy" className="text-paper/60 hover:text-accent underline">View Privacy Policy</Link>.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
