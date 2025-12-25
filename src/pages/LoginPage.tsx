import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = await login(username, password);
      if (!success) {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Try demo/demo123',
          variant: 'destructive',
        });
      }
    } else {
      if (!username || !email || !password) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }
      await register(username, email, password);
      toast({
        title: 'Account created',
        description: 'Welcome to TaskBoard!',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <LayoutGrid className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">TaskBoard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A GitHub Projects-style Kanban board
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  autoComplete="email"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Demo credentials: <code className="bg-muted px-1 py-0.5 rounded">demo</code> / <code className="bg-muted px-1 py-0.5 rounded">demo123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
