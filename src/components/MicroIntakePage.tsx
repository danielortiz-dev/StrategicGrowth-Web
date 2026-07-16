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
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleBooking = async () => {
    if (!isFormValid() || loading) return;

    setLoading(true);
    setSubmitError(null);

    const payload = {
      submissionId: formData.submissionKey,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      businessName: formData.businessName?.trim() || '',
      website: formData.websiteUrl?.trim() || '',
      mainChallenge: formData.mainGrowthChallenge,
      formStartedAt: formData.clientStartedAt,
      attribution: {
        source: formData.utmSource,
        medium: formData.utmMedium,
        campaign: formData.utmCampaign,
        content: formData.utmContent,
        term: formData.utmTerm,
        referrer: formData.referrer,
        landingPage: formData.landingPath
      }
    };

    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem('sg_lead_id', data.leadId);
        setFormData(prev => ({
          ...prev,
          submissionKey: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
        }));

        const baseUrl = "https://zcal.co/danielortizceo/10min";
        window.location.href = baseUrl;
      } else {
        setLoading(false);
        setSubmitError("Failed to persist lead: " + (data.error?.message || "Please try again."));
      }
    } catch (err) {
      setLoading(false);
      setSubmitError("Network error. Please try submitting again.");
    }
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
                  <label htmlFor="fullName" className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateForm('fullName', e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Business Email *</label>
                  <input
                    id="email"
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
                  <label htmlFor="businessName" className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Business Name (Optional)</label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="websiteUrl" className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Website (Optional)</label>
                  <input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => updateForm('websiteUrl', e.target.value)}
                    placeholder="https://company.com"
                    className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mainGrowthChallenge" className="block font-mono text-[9px] uppercase text-paper/50 mb-1.5">Main Growth Challenge *</label>
                <textarea
                  id="mainGrowthChallenge"
                  value={formData.mainGrowthChallenge}
                  onChange={(e) => updateForm('mainGrowthChallenge', e.target.value)}
                  placeholder="What is the biggest growth problem you want help solving?"
                  rows={3}
                  className="w-full bg-stone system-border p-3 text-paper placeholder:text-paper/20 focus:outline-none focus:border-accent font-sans text-xs resize-none"
                />
              </div>

              <div className="pt-1">
                {submitError && (
                  <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono text-center">
                    {submitError}
                  </div>
                )}
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
