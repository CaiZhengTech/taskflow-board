import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, CheckCircle2, Rocket } from 'lucide-react';

const STEPS = [
  { icon: MessageSquare, title: 'Describe needs', description: 'Tell us what your team needs to accomplish.' },
  { icon: Search, title: 'We research', description: 'We analyze your workflow and requirements.' },
  { icon: CheckCircle2, title: 'Ranked & validated', description: 'Solutions are prioritized and verified.' },
  { icon: Rocket, title: 'Start conversations', description: 'Hit the ground running with your team.' },
];

const INTERVAL = 3000;

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (pinned || reducedMotion) return;
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [pinned, reducedMotion]);

  const handlePin = useCallback((idx: number) => {
    setPinned(true);
    setActiveStep(idx);
  }, []);

  const handleUnpin = useCallback(() => setPinned(false), []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Four steps to transform your workflow.</p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" />
          {/* Animated progress */}
          <motion.div
            className="absolute top-8 left-0 h-0.5 bg-primary"
            animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          <div className="grid grid-cols-4 gap-6 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              const isPast = i <= activeStep;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-4"
                  onMouseEnter={() => handlePin(i)}
                  onMouseLeave={handleUnpin}
                  onFocus={() => handlePin(i)}
                  onBlur={handleUnpin}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors z-10 ${
                    isActive ? 'bg-primary text-primary-foreground scale-110' : isPast ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`font-semibold mb-1 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden space-y-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  i <= activeStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
