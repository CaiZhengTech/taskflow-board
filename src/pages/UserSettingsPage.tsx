import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import {
  User,
  Shield,
  Palette,
  Check,
  X,
  Pencil,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  Lock,
  KeyRound,
  Smartphone,
  Globe,
  Camera,
  Mail,
  AtSign,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserSettingsPage() {
  const location = useLocation();
  const initialSection = (location.state as any)?.section || 'profile';
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'theme'>(initialSection);

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');

  // Security
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const handleSaveName = () => {
    if (user && editName.trim()) {
      setUser({ ...user, name: editName.trim() });
      setEditingName(false);
      setSuccessModal({ title: 'Name Updated', message: 'Your display name has been changed.' });
    }
  };

  const handleSaveEmail = () => {
    if (user && editEmail.trim()) {
      setUser({ ...user, email: editEmail.trim() });
      setEditingEmail(false);
      setSuccessModal({ title: 'Email Updated', message: 'Your email address has been changed.' });
    }
  };

  const handleSaveUsername = () => {
    if (user && editUsername.trim()) {
      setUser({ ...user, username: editUsername.trim() });
      setEditingUsername(false);
      setSuccessModal({ title: 'Username Updated', message: 'Your username has been changed.' });
    }
  };

  const handleChangePassword = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessModal({ title: 'Password Changed', message: 'Your password has been updated successfully.' });
  };

  const handleDeleteAccount = () => {
    if (deleteEmailInput !== user?.email) return;
    alert('Account deletion would happen here. Backend integration required.');
  };

  const passwordStrength = (() => {
    if (!newPassword) return { level: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  })();

  const sections = [
    { id: 'profile' as const, label: 'Profile', desc: 'Personal info', icon: User },
    { id: 'security' as const, label: 'Security', desc: 'Password & auth', icon: Shield },
    { id: 'theme' as const, label: 'Theme', desc: 'Appearance', icon: Palette },
  ];

  const themeOptions = [
    {
      id: 'light' as const,
      label: 'Light',
      icon: Sun,
      desc: 'Clean & bright',
      preview: { bg: 'bg-white', sidebar: 'bg-gray-100', card: 'bg-gray-50', text: 'bg-gray-300', accent: 'bg-blue-500' },
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      desc: 'Easy on the eyes',
      preview: { bg: 'bg-gray-900', sidebar: 'bg-gray-800', card: 'bg-gray-800', text: 'bg-gray-600', accent: 'bg-blue-500' },
    },
    {
      id: 'system' as const,
      label: 'System',
      icon: Monitor,
      desc: 'Match OS setting',
      preview: { bg: 'bg-gradient-to-br from-white to-gray-900', sidebar: 'bg-gray-400', card: 'bg-gray-400', text: 'bg-gray-500', accent: 'bg-blue-500' },
    },
  ];

  return (
    <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar — decorative with gradient accent */}
        <div className="w-full md:w-56 shrink-0">
          <div className="md:sticky md:top-6 space-y-4">
            {/* Settings title card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-4">
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
              <Sparkles className="h-5 w-5 text-primary mb-2" />
              <h1 className="text-lg font-bold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your account</p>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left whitespace-nowrap w-full group',
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    activeSection === section.id ? 'bg-primary/15' : 'bg-muted group-hover:bg-muted/80',
                  )}>
                    <section.icon className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-[11px] opacity-60">{section.desc}</p>
                  </div>
                  <span className="md:hidden font-medium text-sm">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* ═══════════ PROFILE SECTION ═══════════ */}
          {activeSection === 'profile' && (
            <>
              {/* Hero header with gradient */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/4 to-violet-500/6" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl font-bold text-primary ring-4 ring-background shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 ring-2 ring-background" title="Online" />
                    <button className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-foreground">{user?.name || 'User'}</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">@{user?.username || 'username'}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                        <Globe className="h-3 w-3" />
                        Member since 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable field cards */}
              {[
                { label: 'Display Name', icon: User, editing: editingName, setEditing: setEditingName, value: editName, setValue: setEditName, current: user?.name, onSave: handleSaveName, desc: 'How others see you on the platform' },
                { label: 'Email Address', icon: Mail, editing: editingEmail, setEditing: setEditingEmail, value: editEmail, setValue: setEditEmail, current: user?.email, onSave: handleSaveEmail, type: 'email', desc: 'Used for notifications and recovery' },
                { label: 'Username', icon: AtSign, editing: editingUsername, setEditing: setEditingUsername, value: editUsername, setValue: setEditUsername, current: `@${user?.username}`, onSave: handleSaveUsername, prefix: '@', desc: 'Your unique identifier' },
              ].map((field) => (
                <div key={field.label} className="group rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted">
                          <field.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{field.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{field.desc}</p>
                        </div>
                      </div>
                      {!field.editing && (
                        <Button variant="ghost" size="sm" onClick={() => field.setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {field.editing ? (
                      <div className="flex items-center gap-3 mt-4 pl-11">
                        {field.prefix && <span className="text-muted-foreground font-mono">{field.prefix}</span>}
                        <Input value={field.value} onChange={(e) => field.setValue(e.target.value)} type={field.type} autoFocus className="flex-1" />
                        <Button size="sm" onClick={field.onSave} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => field.setEditing(false)}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium pl-11">{field.current || 'Not set'}</p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ═══════════ SECURITY SECTION ═══════════ */}
          {activeSection === 'security' && (
            <>
              {/* Security header */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5" />
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10">
                      <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Security</h2>
                      <p className="text-muted-foreground text-sm mt-0.5">Protect your account with robust security settings</p>
                    </div>
                  </div>
                  {/* Security score indicator */}
                  <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500" strokeDasharray={`${75} ${126 - 75}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">75</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Good Security Score</p>
                      <p className="text-xs text-muted-foreground">Enable 2FA to reach 100%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Password</h3>
                    <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                </div>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  {showChangePassword ? (
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pl-10 pr-10" />
                          <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                        </div>
                        {/* Password strength bar */}
                        {newPassword && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= passwordStrength.level ? passwordStrength.color : 'bg-muted')} />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                        </div>
                        {confirmPassword && newPassword && (
                          <p className={cn('text-xs mt-1', confirmPassword === newPassword ? 'text-green-500' : 'text-destructive')}>
                            {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </p>
                        )}
                      </div>
                      {passwordError && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{passwordError}</p>}
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleChangePassword} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Update Password</Button>
                        <Button variant="ghost" onClick={() => { setShowChangePassword(false); setPasswordError(''); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2 p-3 rounded-xl bg-muted/40">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-mono tracking-widest">••••••••••••</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-muted">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">Two-Factor Authentication</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-medium">
                      Not enabled
                    </span>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Protect your account with TOTP-based two-factor authentication using apps like Google Authenticator or Authy.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Active Sessions</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Devices logged into your account</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome · Windows · Just now</p>
                        </div>
                      </div>
                      <span className="text-xs text-primary font-medium">This device</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-destructive text-sm">Danger Zone</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Irreversible and destructive actions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 pl-11">
                    Once you delete your account, all data will be permanently removed. This action cannot be undone.
                  </p>
                  {showDeleteConfirm ? (
                    <div className="space-y-4 pl-11">
                      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                        <p className="text-sm font-medium text-foreground mb-2">Type your email to confirm: <span className="text-primary font-mono text-xs">{user?.email}</span></p>
                        <Input value={deleteEmailInput} onChange={(e) => setDeleteEmailInput(e.target.value)} placeholder="Enter your email" className="border-destructive/30" />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteEmailInput !== user?.email} className="gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" /> Delete My Account
                        </Button>
                        <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteEmailInput(''); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-11">
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                        Delete Account
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ═══════════ THEME SECTION ═══════════ */}
          {activeSection === 'theme' && (
            <>
              {/* Theme header */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-pink-500/5 to-amber-500/5" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10">
                      <Palette className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Theme</h2>
                      <p className="text-muted-foreground text-sm mt-0.5">Customize the look and feel of your workspace</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-semibold text-foreground text-sm mb-1">Appearance</h3>
                <p className="text-xs text-muted-foreground mb-5">Choose your preferred color scheme</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const isActive = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        aria-pressed={isActive}
                        className={cn(
                          'relative group rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden',
                          isActive
                            ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-muted-foreground/30 hover:shadow-md'
                        )}
                      >
                        {/* Mini UI preview */}
                        <div className={cn('p-3 aspect-[4/3] relative rounded-t-xl', option.preview.bg)}>
                          {/* Mini sidebar */}
                          <div className={cn('absolute left-2 top-2 bottom-2 w-6 rounded-md', option.preview.sidebar)} />
                          {/* Mini header */}
                          <div className={cn('absolute left-10 top-2 right-2 h-3 rounded-sm', option.preview.sidebar)} />
                          {/* Mini cards */}
                          <div className="absolute left-10 top-7 right-2 space-y-1.5">
                            <div className={cn('h-4 rounded-sm flex gap-1', 'bg-transparent')}>
                              <div className={cn('flex-1 rounded-sm', option.preview.card)} />
                              <div className={cn('flex-1 rounded-sm', option.preview.card)} />
                              <div className={cn('flex-1 rounded-sm', option.preview.card)} />
                            </div>
                            <div className={cn('h-6 rounded-sm', option.preview.card)} />
                            <div className={cn('h-6 rounded-sm', option.preview.card)} />
                          </div>
                          {/* Active badge */}
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Label area */}
                        <div className="p-4 bg-card">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              isActive ? 'bg-primary/10' : 'bg-muted',
                            )}>
                              <option.icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                            </div>
                            <div>
                              <p className={cn('font-semibold text-sm', isActive ? 'text-primary' : 'text-foreground')}>{option.label}</p>
                              <p className="text-[11px] text-muted-foreground">{option.desc}</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent color hint — decorative only */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-semibold text-foreground text-sm mb-1">Accent Color</h3>
                <p className="text-xs text-muted-foreground mb-4">Choose the primary color used throughout the interface</p>
                <div className="flex gap-3">
                  {[
                    { name: 'Blue', class: 'bg-blue-500', active: true },
                    { name: 'Violet', class: 'bg-violet-500', active: false },
                    { name: 'Rose', class: 'bg-rose-500', active: false },
                    { name: 'Emerald', class: 'bg-emerald-500', active: false },
                    { name: 'Amber', class: 'bg-amber-500', active: false },
                  ].map(color => (
                    <button
                      key={color.name}
                      title={color.name}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        color.class,
                        color.active
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                          : 'opacity-40 hover:opacity-70 hover:scale-105 cursor-not-allowed',
                      )}
                      disabled={!color.active}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">More colors coming soon</p>
              </div>
            </>
          )}
        </div>
      </div>

      {successModal && (
        <SuccessModal isOpen onClose={() => setSuccessModal(null)} title={successModal.title} message={successModal.message} />
      )}
    </div>
  );
}
