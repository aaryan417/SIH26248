import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { MOCK_USERS } from '../../mocks/fixtures';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsMockUser } = useAuthStore();

  const handleSelectUser = (userId: string) => {
    loginAsMockUser(userId);
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-command-900 border border-command-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
            <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTICATION ADAPTER
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wider">
            TACTICAL LOGIN
          </h1>
          <p className="text-xs text-slate-400">
            Select a mock user profile to initialize user credentials.
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="w-full flex items-center justify-between p-4 bg-command-950 border border-command-800 rounded-xl hover:border-cyan-500/50 hover:bg-command-850 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-command-800 flex items-center justify-center text-cyan-400 font-bold font-mono">
                  {user.callsign.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold font-mono text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user.callsign} • {user.role}
                  </div>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
