import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PHRASES = ['Efficiency', 'Momentum', 'Precision', 'Flow', 'Impact'];
const INTERVAL = 2500;

export function DynamicPhrases() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);

  const handleFocus = useCallback(() => setPaused(true), []);
  const handleBlur = useCallback(() => setPaused(false), []);

  if (reducedMotion) {
    return <span className="text-primary">{PHRASES[0]}</span>;
  }

  return (
    <span
      className="inline-block relative"
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      role="status"
      aria-live="polite"
      aria-label={`Manage projects with ${PHRASES[index]}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={PHRASES[index]}
          className="text-primary inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {PHRASES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
