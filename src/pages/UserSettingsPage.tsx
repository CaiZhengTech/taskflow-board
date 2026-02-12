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
} from 'lucide-react';

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

  const sections = [
    { id: 'profile' as const, label: 'Profile Settings', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'theme' as const, label: 'Theme', icon: Palette },
  ];

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex-1 px-6 py-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left whitespace-nowrap ${
                  activeSection === section.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          {activeSection === 'profile' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your personal information.</p>
              </div>

              {/* Avatar */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4">Profile Photo</h3>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <Button variant="outline">Upload Photo</Button>
                </div>
              </div>

              {/* Editable fields */}
              {[
                { label: 'Display Name', editing: editingName, setEditing: setEditingName, value: editName, setValue: setEditName, current: user?.name, onSave: handleSaveName },
                { label: 'Email Address', editing: editingEmail, setEditing: setEditingEmail, value: editEmail, setValue: setEditEmail, current: user?.email, onSave: handleSaveEmail, type: 'email' },
                { label: 'Username', editing: editingUsername, setEditing: setEditingUsername, value: editUsername, setValue: setEditUsername, current: `@${user?.username}`, onSave: handleSaveUsername, prefix: '@' },
              ].map((field) => (
                <div key={field.label} className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{field.label}</h3>
                    {!field.editing && (
                      <Button variant="ghost" size="sm" onClick={() => field.setEditing(true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {field.editing ? (
                    <div className="flex items-center gap-3">
                      {field.prefix && <span className="text-muted-foreground">{field.prefix}</span>}
                      <Input value={field.value} onChange={(e) => field.setValue(e.target.value)} type={field.type} autoFocus className="flex-1" />
                      <Button size="sm" onClick={field.onSave}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => field.setEditing(false)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <p className="text-foreground">{field.current || 'Not set'}</p>
                  )}
                </div>
              ))}
            </>
          )}

          {activeSection === 'security' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Security</h2>
                <p className="text-muted-foreground">Manage your account security settings.</p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4">Password</h3>
                {showChangePassword ? (
                  <div className="space-y-4">
                    <div><label className="text-sm text-muted-foreground block mb-2">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                    <div><label className="text-sm text-muted-foreground block mb-2">New Password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
                    <div><label className="text-sm text-muted-foreground block mb-2">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    <div className="flex gap-3">
                      <Button onClick={handleChangePassword}>Save Password</Button>
                      <Button variant="ghost" onClick={() => { setShowChangePassword(false); setPasswordError(''); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">••••••••••••</p>
                    <Button variant="outline" onClick={() => setShowChangePassword(true)}>Change Password</Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
                <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                {showDeleteConfirm ? (
                  <div className="space-y-4">
                    <p className="text-sm text-foreground font-medium">Enter your email: <span className="text-primary">{user?.email}</span></p>
                    <Input value={deleteEmailInput} onChange={(e) => setDeleteEmailInput(e.target.value)} placeholder="Enter your email" />
                    <div className="flex gap-3">
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteEmailInput !== user?.email}>Delete My Account</Button>
                      <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteEmailInput(''); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
                )}
              </div>
            </>
          )}

          {activeSection === 'theme' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Theme</h2>
                <p className="text-muted-foreground">Customize how TaskBoard looks.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4">Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      aria-pressed={theme === option.id}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        theme === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <option.icon className={`h-8 w-8 mx-auto mb-3 ${theme === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`font-medium ${theme === option.id ? 'text-primary' : 'text-foreground'}`}>{option.label}</p>
                    </button>
                  ))}
                </div>
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
