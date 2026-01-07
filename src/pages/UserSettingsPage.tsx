import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { 
  ArrowLeft,
  User,
  Shield,
  Palette,
  Check,
  X,
  Pencil,
  Sun,
  Moon,
  Monitor,
  AlertTriangle
} from 'lucide-react';

interface UserSettingsPageProps {
  initialSection?: 'profile' | 'security' | 'theme';
  onBack: () => void;
}

export function UserSettingsPage({ initialSection = 'profile', onBack }: UserSettingsPageProps) {
  const { user, setUser, theme, setTheme } = useAuthStore();
  const [activeSection, setActiveSection] = useState(initialSection);
  
  // Profile editing states
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  
  // Security states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  
  // Success modal
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

  // TODO: Implement with backend - validate current password and update
  const handleChangePassword = () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    // TODO: Call backend API to change password
    // For now, just show success
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessModal({ title: 'Password Changed', message: 'Your password has been updated successfully.' });
  };

  // TODO: Implement with backend - delete account
  const handleDeleteAccount = () => {
    if (deleteEmailInput !== user?.email) {
      return;
    }
    
    // TODO: Call backend API to delete account
    // For now, just show alert
    alert('Account deletion would happen here. Backend integration required.');
  };

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as typeof activeSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Profile Settings</h2>
                  <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                </div>

                {/* Avatar */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <Button variant="outline" className="mb-2">
                        {/* TODO: Implement file upload with backend */}
                        Upload Photo
                      </Button>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Display Name</h3>
                    {!editingName && (
                      <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingName ? (
                    <div className="flex items-center gap-3">
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your display name"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-foreground">{user?.name || 'Not set'}</p>
                  )}
                </div>

                {/* Email */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Email Address</h3>
                    {!editingEmail && (
                      <Button variant="ghost" size="sm" onClick={() => setEditingEmail(true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingEmail ? (
                    <div className="flex items-center gap-3">
                      <Input 
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEmail}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingEmail(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-foreground">{user?.email || 'Not set'}</p>
                  )}
                </div>

                {/* Username */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Username</h3>
                    {!editingUsername && (
                      <Button variant="ghost" size="sm" onClick={() => setEditingUsername(true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingUsername ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center flex-1">
                        <span className="text-muted-foreground mr-1">@</span>
                        <Input 
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          placeholder="username"
                          autoFocus
                        />
                      </div>
                      <Button size="sm" onClick={handleSaveUsername}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-foreground">@{user?.username}</p>
                  )}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Security</h2>
                  <p className="text-muted-foreground">Manage your account security settings.</p>
                </div>

                {/* Change Password */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-4">Password</h3>
                  
                  {showChangePassword ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">Current Password</label>
                        <Input 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">New Password</label>
                        <Input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">Confirm New Password</label>
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                      
                      <div className="flex gap-3">
                        <Button onClick={handleChangePassword}>Save Password</Button>
                        <Button variant="ghost" onClick={() => {
                          setShowChangePassword(false);
                          setPasswordError('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">••••••••••••</p>
                      <Button variant="outline" onClick={() => setShowChangePassword(true)}>
                        Change Password
                      </Button>
                    </div>
                  )}
                </div>

                {/* Delete Account */}
                <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
                  <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-4">
                      <p className="text-sm text-foreground font-medium">
                        To confirm, please enter your full email address: <span className="text-primary">{user?.email}</span>
                      </p>
                      <Input 
                        value={deleteEmailInput}
                        onChange={(e) => setDeleteEmailInput(e.target.value)}
                        placeholder="Enter your email address"
                      />
                      <div className="flex gap-3">
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={deleteEmailInput !== user?.email}
                        >
                          Delete My Account
                        </Button>
                        <Button variant="ghost" onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteEmailInput('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      Delete Account
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Theme Section */}
            {activeSection === 'theme' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Theme</h2>
                  <p className="text-muted-foreground">Customize how TaskBoard looks for you.</p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-4">Appearance</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as 'light' | 'dark' | 'system')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          theme === option.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <option.icon className={`h-8 w-8 mx-auto mb-3 ${
                          theme === option.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className={`font-medium ${
                          theme === option.id ? 'text-primary' : 'text-foreground'
                        }`}>
                          {option.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <SuccessModal
          isOpen={true}
          onClose={() => setSuccessModal(null)}
          title={successModal.title}
          message={successModal.message}
        />
      )}
    </div>
  );
}
