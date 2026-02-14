import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { DynamicPhrases } from '@/components/landing/DynamicPhrases';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ContactModal } from '@/components/landing/ContactModal';
import {
  CheckCircle2,
  Zap,
  Users,
  LayoutDashboard,
  Play,
  Mail,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { login, setIsAuthenticated, setUser } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const handleDemoLogin = () => {
    login('demo', 'demo123');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-svh bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" aria-label="Landing page navigation">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskBoard</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
              Sign in
            </Button>
            <Button size="sm" onClick={handleDemoLogin}>
              Try Demo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowContactModal(true)} className="hidden sm:inline-flex">
              Contact
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-svh flex items-center px-6 pt-20">
        <div className="max-w-[1200px] mx-auto px-0 md:px-10 text-center w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Manage projects with
            <span className="block">
              <DynamicPhrases />
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            TaskBoard is a GitHub Projects-style Kanban board that helps teams organize, track,
            and ship work faster. Simple, powerful, and built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg" onClick={handleDemoLogin}>
              <Play className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg" onClick={() => setShowContactModal(true)}>
              <Mail className="mr-2 h-5 w-5" />
              Contact
            </Button>
          </div>
        </div>
      </section>

      {/* Board Preview */}
      <section className="pb-20 px-6">
        <div className="max-w-[1200px] mx-auto px-0 md:px-10">
          <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Backlog', 'Ready', 'In Progress', 'Completed'].map((col, i) => (
                  <div key={col} className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                      <div className={`w-3 h-3 rounded-full ${
                        i === 0 ? 'bg-status-backlog' :
                        i === 1 ? 'bg-status-ready' :
                        i === 2 ? 'bg-status-progress' :
                        'bg-status-completed'
                      }`} />
                      <span className="text-sm font-medium text-foreground">{col}</span>
                    </div>
                    <div className="space-y-2">
                      {[...Array(i === 2 ? 3 : 2)].map((_, j) => (
                        <div key={j} className="p-4 bg-card border border-border rounded-lg shadow-sm">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-3 bg-muted/60 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-0 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TaskBoard combines the best of project management with developer-focused workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', description: 'Drag and drop tasks instantly. No loading spinners, no lag. Just smooth, responsive interactions.' },
              { icon: Users, title: 'Team Collaboration', description: 'Invite your team, assign roles, and work together in real-time. Everyone stays in sync.' },
              { icon: CheckCircle2, title: 'GitHub-Style Workflow', description: 'Familiar Kanban columns: Backlog, Ready, In Progress, Completed. Move fast with clarity.' },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-0 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskBoard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskBoard. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            navigate('/app/dashboard');
          }}
        />
      )}

      {/* Contact Modal */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </div>
  );
}

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      onClose();
      onSuccess();
    } else {
      setError('Invalid credentials. Try demo / demo123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-xl animate-scale-in">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" size="lg">
            {isSignUp ? 'Sign up' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="text-primary hover:underline font-medium" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo credentials: demo / demo123
        </p>
      </div>
    </div>
  );
}
