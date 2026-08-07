import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Lock, Key, AlertCircle, ArrowRight } from 'lucide-react';

interface SecurityVaultLockProps {
  currentUser: UserProfile;
  onUnlock: (pinEntered: string) => boolean;
}

export const SecurityVaultLock: React.FC<SecurityVaultLockProps> = ({ currentUser, onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    const success = onUnlock(pinInput.trim());
    if (!success) {
      setErrorMsg('Incorrect PIN code or safety passkey.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e1613]/95 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-md bg-[#14211d] border border-[#2e795a] rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Glowing Shield Icon */}
        <div className="relative inline-block">
          <div className="absolute -inset-2 rounded-full bg-[#4ecc97] opacity-30 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 mx-auto rounded-3xl bg-[#0e1613] border border-[#4ecc97]/50 flex items-center justify-center text-[#4ecc97] shadow-xl">
            <Lock className="w-10 h-10" />
          </div>
        </div>

        <div>
          <h2 className="text-[1.777rem] font-bold text-[#e5ebe9]">Vault Safety Lock</h2>
          <p className="text-[0.750rem] text-[#85d1b1] mt-1">
            Logged in as <span className="text-[#4ecc97] font-bold">{currentUser.username}</span>. Enter your security PIN or passkey to unlock your collection.
          </p>
        </div>

        <form onSubmit={handleUnlockSubmit} className="space-y-4 max-w-xs mx-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[0.750rem] font-bold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3 bg-[#0e1613] border border-[#2e795a] focus:border-[#4ecc97] rounded-2xl text-[#e5ebe9] text-[1.333rem] tracking-[0.5em] text-center font-bold outline-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2d5c48] via-[#2e795a] to-[#4ecc97] text-[#0e1613] font-bold text-[0.750rem] sm:text-[1rem] shadow-xl shadow-[#4ecc97]/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Unlock Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-[0.750rem] text-[#85d1b1] pt-2 border-t border-[#1e332d]">
          <span>Forgotten PIN? Use your </span>
          <span className="text-[#4ecc97] font-bold">Backup Safety Passkey</span>
        </div>
      </div>
    </div>
  );
};
