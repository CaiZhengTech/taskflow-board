import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  autoCloseDelay?: number; // ms, 0 = no auto close
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message = '',
  autoCloseDelay = 3000 
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-xl animate-scale-in text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="w-16 h-16 rounded-full bg-status-completed/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-status-completed" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          {title}
        </h2>
        
        {message && (
          <p className="text-muted-foreground">
            {message}
          </p>
        )}
        
        <Button 
          onClick={onClose} 
          className="mt-6 w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
