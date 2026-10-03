import { create } from 'zustand';
import { MOCK_USERS } from '../mocks/fixtures';
import { Role, User } from '../types';
import { storage } from '../utils/storage';

interface AuthState {
  currentUser: User | null;
  selectedRole: Role;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setRole: (role: Role) => void;
  loginAsMockUser: (userId: string) => void;
  logout: () => void;
  updateUserCallsign: (callsign: string, unit: string) => void;
}

const initialSavedUser = storage.get<User | null>('auth_user', MOCK_USERS[0]);

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: initialSavedUser,
  selectedRole: initialSavedUser?.role || 'INSTRUCTOR',
  isAuthenticated: !!initialSavedUser,

  setUser: (user: User) => {
    storage.set('auth_user', user);
    set({ currentUser: user, selectedRole: user.role, isAuthenticated: true });
  },

  setRole: (role: Role) => {
    set((state) => {
      const updatedUser = state.currentUser
        ? { ...state.currentUser, role }
        : {
            id: `user-${Date.now()}`,
            name: role === 'INSTRUCTOR' ? 'Lt. Col. Vikram Sharma' : 'Maj. Ananya Roy',
            role,
            callsign: role === 'INSTRUCTOR' ? 'CONTROL-1' : 'ALPHA-1',
            unit: 'Defence Services Staff College',
          };
      storage.set('auth_user', updatedUser);
      return { selectedRole: role, currentUser: updatedUser, isAuthenticated: true };
    });
  },

  loginAsMockUser: (userId: string) => {
    const found = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
    storage.set('auth_user', found);
    set({ currentUser: found, selectedRole: found.role, isAuthenticated: true });
  },

  logout: () => {
    storage.remove('auth_user');
    set({ currentUser: null, isAuthenticated: false });
  },

  updateUserCallsign: (callsign: string, unit: string) => {
    set((state) => {
      if (!state.currentUser) return state;
      const updated = { ...state.currentUser, callsign, unit };
      storage.set('auth_user', updated);
      return { currentUser: updated };
    });
  },
}));
