import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

export default function BookingConfirmedPage() {
  return (
    <main className="pt-32 pb-24 relative min-h-screen grid-bg bg-stone flex flex-col justify-center">
      <div className="absolute inset-0 bg-stone/90"></div>
      
      <div className="max-w-xl mx-auto px-6 relative z-10 w-full text-center">
        <div className="w-20 h-20 system-border-accent rounded-full flex items-center justify-center mx-auto bg-accent/10 mb-8 animate-pulse">
          <Activity className="w-10 h-10 text-accent" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase text-paper">
          Your strategy call is booked.
        </h1>
        
        <p className="text-paper/60 text-base max-w-md mx-auto mb-8 font-sans leading-relaxed">
          Thanks for scheduling with Strategic Growth. Help me prepare for our conversation by completing this optional 2-minute call prep.
        </p>

        <div className="max-w-sm mx-auto space-y-4">
          <Link
            to="/diagnostic-prep"
            className="w-full inline-flex items-center justify-center gap-2 bg-accent text-stone py-4 font-mono font-bold tracking-wider uppercase text-xs hover:bg-paper transition-all"
          >
            Help Me Prepare
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <p className="text-[10px] font-mono text-paper/40 uppercase tracking-widest pt-1">
            Your booking is confirmed. This step is completely optional.
          </p>

          <div className="pt-6 border-t border-paper/10">
            <Link
              to="/"
              className="inline-block text-paper/40 hover:text-accent font-mono text-[10px] uppercase tracking-widest transition-colors"
            >
              &larr; Return to Strategic Growth
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
