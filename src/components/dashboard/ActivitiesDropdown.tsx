import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  Menu,
  Activity,
  UserCheck,
  History,
  HelpCircle,
  Keyboard,
  BarChart3,
  CheckCircle2,
  Clock,
  ListTodo
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivitiesDropdownProps {
  onFilterAssignedToMe?: () => void;
}

export function ActivitiesDropdown({ onFilterAssignedToMe }: ActivitiesDropdownProps) {
  const { userStats, recentActivities } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'assigned' | 'activity' | 'help'>('stats');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'stats', label: 'My Statistics', icon: BarChart3 },
    { id: 'assigned', label: 'Assigned to Me', icon: UserCheck },
    { id: 'activity', label: 'Recent Activity', icon: History },
    { id: 'help', label: 'Help / Shortcuts', icon: HelpCircle },
  ];

  const shortcuts = [
    { key: 'N', action: 'Create new task' },
    { key: 'F', action: 'Focus search' },
    { key: '/', action: 'Open command menu' },
    { key: 'Esc', action: 'Close modal/panel' },
    { key: '?', action: 'Show this help' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        title="Activities & Stats"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 p-3 text-center transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-muted text-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4 mx-auto" />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin">
            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  My Statistics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Tasks created (7 days)</span>
                    <span className="font-semibold text-foreground">{userStats.tasksCreatedLast7Days}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Tasks created (30 days)</span>
                    <span className="font-semibold text-foreground">{userStats.tasksCreatedLast30Days}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-status-completed/10">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-status-completed" />
                      Tasks completed
                    </span>
                    <span className="font-semibold text-status-completed">{userStats.tasksCompleted}</span>
                  </div>
                </div>

                <h4 className="font-medium text-foreground mt-4 flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  Current Workload
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-status-backlog/10 text-center">
                    <p className="text-lg font-bold text-status-backlog">{userStats.backlogCount}</p>
                    <p className="text-xs text-muted-foreground">Backlog</p>
                  </div>
                  <div className="p-3 rounded-lg bg-status-ready/10 text-center">
                    <p className="text-lg font-bold text-status-ready">{userStats.readyCount}</p>
                    <p className="text-xs text-muted-foreground">Ready</p>
                  </div>
                  <div className="p-3 rounded-lg bg-status-progress/10 text-center">
                    <p className="text-lg font-bold text-status-progress">{userStats.inProgressCount}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned to Me Tab */}
            {activeTab === 'assigned' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assigned to Me
                </h3>
                
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-3xl font-bold text-primary">{userStats.assignedToMe}</p>
                  <p className="text-sm text-muted-foreground mt-1">tasks assigned to you</p>
                </div>

                <button
                  onClick={() => {
                    onFilterAssignedToMe?.();
                    setIsOpen(false);
                  }}
                  className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  View My Tasks
                </button>
              </div>
            )}

            {/* Recent Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Activity
                </h3>
                
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-2">
                    {recentActivities.slice(0, 10).map((activity) => (
                      <div 
                        key={activity.id} 
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <p className="text-sm text-foreground">
                          You <span className="font-medium">{activity.action}</span>
                          {activity.taskName && (
                            <span className="text-primary"> {activity.taskName}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Help / Shortcuts Tab */}
            {activeTab === 'help' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </h3>
                
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div 
                      key={shortcut.key}
                      className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono text-foreground">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">How Statuses Work</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="inline-block w-3 h-3 rounded-full bg-status-backlog mr-2" />Backlog - Tasks to be prioritized</p>
                    <p><span className="inline-block w-3 h-3 rounded-full bg-status-ready mr-2" />Ready - Ready to start</p>
                    <p><span className="inline-block w-3 h-3 rounded-full bg-status-progress mr-2" />In Progress - Currently working</p>
                    <p><span className="inline-block w-3 h-3 rounded-full bg-status-completed mr-2" />Completed - Done!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
