import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';

interface RoleToggleProps {
  currentView: 'manager' | 'employee';
  onToggle: (view: 'manager' | 'employee') => void;
}

export function RoleToggle({ currentView, onToggle }: RoleToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5" role="group" aria-label="Role preview toggle">
      <Button
        variant={currentView === 'manager' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-3 text-xs gap-1.5"
        onClick={() => onToggle('manager')}
        aria-pressed={currentView === 'manager'}
      >
        <Shield className="h-3 w-3" />
        Manager
      </Button>
      <Button
        variant={currentView === 'employee' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-3 text-xs gap-1.5"
        onClick={() => onToggle('employee')}
        aria-pressed={currentView === 'employee'}
      >
        <User className="h-3 w-3" />
        Employee
      </Button>
    </div>
  );
}
