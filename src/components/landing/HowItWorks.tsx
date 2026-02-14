import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, CheckCircle2, Rocket } from 'lucide-react';

const STEPS = [
  { icon: MessageSquare, title: 'Describe needs', description: 'Tell us what your team needs to accomplish.' },
  { icon: Search, title: 'We research', description: 'We analyze your workflow and requirements.' },
  { icon: CheckCircle2, title: 'Ranked & validated', description: 'Solutions are prioritized and verified.' },
  { icon: Rocket, title: 'Start conversations', description: 'Hit the ground running with your team.' },
];

const INTERVAL = 3000;
/** Duration of the ball's travel between two bubbles (ms) */
const TRAVEL_MS = 1000;

/**
 * Column center positions (%) in a 4-column layout.
 * col 0 → 12.5%, col 1 → 37.5%, col 2 → 62.5%, col 3 → 87.5%
 */
const COL_CENTER = (i: number) => i * 25 + 12.5;

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  return (
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Four steps to transform your workflow.</p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden md:block relative">
          {/* Traveling ball — vertically centered on bubbles (p-4 = 16px + half of h-16 = 32px → 48px) */}
          {!reducedMotion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="absolute z-[1] w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_3px_hsl(var(--primary)/0.35)]"
                style={{ top: 48, translateX: '-50%', translateY: '-50%' }}
                initial={{
                  left: activeStep === 0
                    ? `${COL_CENTER(0)}%`           /* restart in place */
                    : `${COL_CENTER(activeStep - 1)}%`,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  left: `${COL_CENTER(activeStep)}%`,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  left:    { duration: activeStep === 0 ? 0 : TRAVEL_MS / 1000, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.3, ease: 'easeOut' },
                  scale:   { duration: 0.3, ease: 'easeOut' },
                }}
              />
            </AnimatePresence>
          )}

          <div className="grid grid-cols-4 gap-6 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              const isPast = i <= activeStep;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-4"
                >
                  {/* Bubble — z-10 so the ball travels behind it */}
                  <motion.div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10 transition-colors duration-300 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : isPast
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  <h3 className={`font-semibold mb-1 transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </div>
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
