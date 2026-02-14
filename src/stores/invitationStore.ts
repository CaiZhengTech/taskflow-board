import { create } from 'zustand';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceCode: string;
  invitedBy: string;
  invitedByAvatar: string;
  inviteeEmail: string;
  inviteeName: string;
  role: string;
  status: InvitationStatus;
  message?: string;
  createdAt: Date;
}

interface InvitationStore {
  /** Invitations the current user received (inbox) */
  receivedInvitations: Invitation[];
  /** Invitations the current user sent */
  sentInvitations: Invitation[];

  sendInvitation: (inv: Omit<Invitation, 'id' | 'status' | 'createdAt'>) => Invitation;
  acceptInvitation: (id: string) => void;
  declineInvitation: (id: string) => void;
  dismissInvitation: (id: string) => void;
}

// Seed some mock invitations so the user has something in their inbox
const mockReceived: Invitation[] = [
  {
    id: 'inv-1',
    workspaceId: 'ws-ext-1',
    workspaceName: 'Product Launch 2026',
    workspaceCode: 'PL-2026',
    invitedBy: 'Jessica Park',
    invitedByAvatar: 'J',
    inviteeEmail: 'demo@taskboard.dev',
    inviteeName: 'Demo User',
    role: 'contributor',
    status: 'pending',
    message: "Hey! We'd love to have you on the product launch board. Jump in whenever you're ready!",
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
  },
  {
    id: 'inv-2',
    workspaceId: 'ws-ext-2',
    workspaceName: 'Open Source Collab',
    workspaceCode: 'OSS-42',
    invitedBy: 'Marcus Rivera',
    invitedByAvatar: 'M',
    inviteeEmail: 'demo@taskboard.dev',
    inviteeName: 'Demo User',
    role: 'manager',
    message: "You'd be a great fit as a manager for this project. Let me know!",
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 'inv-3',
    workspaceId: 'ws-ext-3',
    workspaceName: 'Design Systems',
    workspaceCode: 'DS-01',
    invitedBy: 'Emily Zhang',
    invitedByAvatar: 'E',
    inviteeEmail: 'demo@taskboard.dev',
    inviteeName: 'Demo User',
    role: 'viewer',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export const useInvitationStore = create<InvitationStore>((set) => ({
  receivedInvitations: mockReceived,
  sentInvitations: [],

  sendInvitation: (data) => {
    const inv: Invitation = {
      ...data,
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      createdAt: new Date(),
    };
    set((s) => ({ sentInvitations: [inv, ...s.sentInvitations] }));
    return inv;
  },

  acceptInvitation: (id) => {
    set((s) => ({
      receivedInvitations: s.receivedInvitations.map((i) =>
        i.id === id ? { ...i, status: 'accepted' as const } : i
      ),
    }));
  },

  declineInvitation: (id) => {
    set((s) => ({
      receivedInvitations: s.receivedInvitations.map((i) =>
        i.id === id ? { ...i, status: 'declined' as const } : i
      ),
    }));
  },

  dismissInvitation: (id) => {
    set((s) => ({
      receivedInvitations: s.receivedInvitations.filter((i) => i.id !== id),
    }));
  },
}));
