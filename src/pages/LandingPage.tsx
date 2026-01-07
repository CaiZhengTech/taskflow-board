import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { 
  CheckCircle2, 
  Zap, 
  Users, 
  LayoutDashboard,
  ArrowRight,
  Calendar,
  ChevronRight,
  Star,
  Play,
  ExternalLink
} from 'lucide-react';

// =============================================================================
// CALENDLY CONFIGURATION
// To add your Calendly scheduling, replace the URL below with your Calendly link.
// Example: 'https://calendly.com/your-username/30min'
// =============================================================================
const CALENDLY_URL = 'https://calendly.com/YOUR_USERNAME/30min'; // <-- REPLACE THIS

export function LandingPage() {
  const { setIsAuthenticated, setUser } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const handleDemoLogin = () => {
    setUser({ 
      id: 'demo-user', 
      username: 'demo', 
      email: 'demo@taskboard.io',
      name: 'Demo User'
    });
    setIsAuthenticated(true);
    setSuccessMessage({
      title: 'Welcome to TaskBoard!',
      message: "You're now logged in as a demo user. Explore all features!"
    });
    setShowSuccessModal(true);
  };

  // Opens Calendly in a new tab (or you can embed it)
  const handleBookDemo = () => {
    if (CALENDLY_URL.includes('YOUR_USERNAME')) {
      // Fallback: show demo booking form section
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(CALENDLY_URL, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskBoard</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <button 
              onClick={handleBookDemo}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Book Demo
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setShowLoginModal(true)}>
              Sign in
            </Button>
            <Button onClick={handleDemoLogin}>
              Try Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Star className="h-4 w-4" />
            Trusted by 10,000+ teams worldwide
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Manage projects with
            <span className="text-primary block">clarity & speed</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            TaskBoard is a GitHub Projects-style Kanban board that helps teams organize, track, 
            and ship work faster. Simple, powerful, and built for modern teams.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-6 text-lg" onClick={handleDemoLogin}>
              <Play className="mr-2 h-5 w-5" />
              Try TaskBoard Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg" onClick={handleBookDemo}>
              <Calendar className="mr-2 h-5 w-5" />
              Book a Demo
              {!CALENDLY_URL.includes('YOUR_USERNAME') && (
                <ExternalLink className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Board Preview */}
      <section className="pb-20 px-6">
        <div className="container mx-auto">
          <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-4 gap-4">
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
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
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
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Drag and drop tasks instantly. No loading spinners, no lag. Just smooth, responsive interactions.'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Invite your team, assign roles, and work together in real-time. Everyone stays in sync.'
              },
              {
                icon: CheckCircle2,
                title: 'GitHub-Style Workflow',
                description: 'Familiar Kanban columns: Backlog, Ready, In Progress, Completed. Move fast with clarity.'
              }
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more power.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for individuals',
                features: ['Up to 3 boards', '10 tasks per board', 'Basic integrations', 'Community support'],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Pro',
                price: 'TBD',
                description: 'For growing teams',
                features: ['Unlimited boards', 'Unlimited tasks', 'Priority support', 'Team collaboration', 'Advanced analytics'],
                cta: 'Coming Soon',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'TBD',
                description: 'For large organizations',
                features: ['Everything in Pro', 'SSO & SAML', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-2xl border ${
                  plan.popular 
                    ? 'border-primary bg-primary/5 relative' 
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-foreground mb-6">
                  {plan.price}
                  {plan.price !== 'TBD' && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={i === 0 ? handleDemoLogin : undefined}
                >
                  {plan.cta}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Booking Section */}
      <section id="demo" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Book a personalized demo
            </h2>
            <p className="text-lg text-muted-foreground">
              See how TaskBoard can transform your team's workflow. Schedule a 30-minute call with our team.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-card border border-border">
            {/* 
              =================================================================
              CALENDLY INTEGRATION OPTIONS:
              
              Option 1: Direct Link (Current Implementation)
              - Uses CALENDLY_URL constant at top of file
              - Opens Calendly in new tab when "Book a Demo" is clicked
              
              Option 2: Embed Widget (Uncomment below and add script to index.html)
              - Add to index.html: <script src="https://assets.calendly.com/assets/external/widget.js"></script>
              - Then uncomment the iframe below
              
              <div className="calendly-inline-widget" 
                   data-url="https://calendly.com/YOUR_USERNAME/30min" 
                   style={{ minWidth: '320px', height: '630px' }} 
              />
              =================================================================
            */}
            
            {CALENDLY_URL.includes('YOUR_USERNAME') ? (
              // Fallback form when Calendly not configured
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                setSuccessMessage({
                  title: 'Demo Request Submitted!',
                  message: "We'll get back to you within 24 hours to schedule your demo."
                });
                setShowSuccessModal(true);
              }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                    <Input placeholder="Company name" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input type="email" placeholder="you@company.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
                  <Input placeholder="e.g., 5-10 people" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Request Demo
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  We'll get back to you within 24 hours.
                </p>
              </form>
            ) : (
              // When Calendly is configured, show direct booking button
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Schedule a 30-minute call
                </h3>
                <p className="text-muted-foreground mb-6">
                  Pick a time that works for you and we'll show you how TaskBoard can help your team.
                </p>
                <Button size="lg" onClick={handleBookDemo}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Open Scheduling
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskBoard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 TaskBoard. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => {
            setSuccessMessage({
              title: 'Welcome Back!',
              message: 'Successfully logged in to your account.'
            });
            setShowSuccessModal(true);
          }}
        />
      )}

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
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <Button className="w-full" size="lg">
            {isSignUp ? 'Sign up' : 'Sign in'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            className="text-primary hover:underline font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
          >
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
