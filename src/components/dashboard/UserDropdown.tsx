import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { User, Shield, Palette, ChevronDown, LogOut } from 'lucide-react';

interface UserDropdownProps {
  onNavigate?: (section: 'profile' | 'security' | 'theme') => void;
}

export function UserDropdown({ onNavigate }: UserDropdownProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'profile' as const, label: 'Profile Settings', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'theme' as const, label: 'Theme', icon: Palette },
  ];

  const handleNav = (section: 'profile' | 'security' | 'theme') => {
    if (onNavigate) {
      onNavigate(section);
    } else {
      navigate('/app/settings', { state: { section } });
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-foreground truncate">{user?.name || user?.username}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="py-2">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => handleNav(item.id)} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border py-2">
            <button onClick={handleLogout} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-destructive/10 transition-colors text-left">
              <LogOut className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
