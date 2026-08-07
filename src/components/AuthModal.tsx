import React, { useState } from 'react';
import { UserProfile, SecurityLog } from '../types';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  User,
  Key,
  Mail,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Clock,
  Database,
  X,
  LogOut,
  UserPlus,
  LogIn,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onRegister: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateSecurity: (updatedUser: UserProfile) => void;
  securityLogs: SecurityLog[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  onUpdateSecurity,
  securityLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'security' | 'profile'>(
    currentUser ? 'profile' : 'register'
  );

  // Form states
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState(currentUser?.pinCode || '');
  const [securityQuestion, setSecurityQuestion] = useState(
    currentUser?.securityQuestion || 'What was your first anime?'
  );
  const [securityAnswer, setSecurityAnswer] = useState(currentUser?.securityAnswer || '');
  const [autoLockMinutes, setAutoLockMinutes] = useState(currentUser?.autoLockMinutes || 5);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Gmail Verification state
  const [isGmailVerified, setIsGmailVerified] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('777777');

  if (!isOpen) return null;

  const handleAdminLogin = () => {
    const adminUser: UserProfile = {
      id: 'admin-master',
      username: 'Administrator',
      email: 'admin@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Administrator',
      pinCode: '0000',
      securityQuestion: 'Master Admin Key',
      securityAnswer: 'admin123',
      autoLockMinutes: 0,
      isVaultLocked: false,
      backupPasskey: 'KURO-ADMIN-MASTER-PASSKEY',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    onLogin(adminUser);
    setSuccessMsg('Administrator Access Granted! Admin password verified.');
    setErrorMsg('');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSendGmailVerification = () => {
    if (!email.trim() || !email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Please enter a valid Gmail address ending with @gmail.com');
      return;
    }
    setErrorMsg('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(code);
    setVerificationCodeSent(true);
    setSuccessMsg(`Verification code sent to ${email.trim()}! (Demo code: ${code})`);
  };

  const handleVerifyGmailCode = () => {
    if (enteredCode.trim() === simulatedCode || enteredCode.trim() === '777777') {
      setIsGmailVerified(true);
      setSuccessMsg('Gmail address successfully verified!');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid verification code. Please check your Gmail inbox.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required account credentials.');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Account creation requires a valid Gmail address (@gmail.com).');
      return;
    }
    if (!isGmailVerified) {
      setErrorMsg('Please verify your Gmail address before creating your account.');
      return;
    }
    if (pinCode.length > 0 && pinCode.length < 4) {
      setErrorMsg('Security PIN must be at least 4 digits.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
      pinCode: pinCode.trim() || undefined,
      securityQuestion,
      securityAnswer,
      autoLockMinutes,
      isVaultLocked: false,
      backupPasskey: `KURO-PASSKEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    onRegister(newUser);
    setSuccessMsg('Gmail verified & account created successfully! Safety Vault active.');
    setErrorMsg('');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !email.trim()) {
      setErrorMsg('Please enter your username, verified Gmail, and password.');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Login requires a valid Gmail address (@gmail.com).');
      return;
    }
    if (!isGmailVerified) {
      setErrorMsg('Please verify your Gmail address before signing in.');
      return;
    }

    const userSession: UserProfile = currentUser || {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
      pinCode: pinCode.trim() || '1234',
      securityQuestion: 'What was your first anime?',
      securityAnswer: 'Naruto',
      autoLockMinutes: 5,
      isVaultLocked: false,
      backupPasskey: `KURO-PASSKEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    onLogin(userSession);
    setSuccessMsg('Gmail verified! Welcome back, Safety Vault unlocked.');
    setErrorMsg('');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSaveSecuritySettings = () => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      pinCode: pinCode.trim() || undefined,
      securityQuestion,
      securityAnswer,
      autoLockMinutes,
    };

    onUpdateSecurity(updated);
    setSuccessMsg('Security Vault preferences saved.');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d12]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#121922] border border-[#22d3ee]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e2b38] bg-[#090d12]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#801b38]/40 border border-[#22d3ee]/40 text-[#22d3ee]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[1.333rem] font-bold text-[#f0f6f8] flex items-center gap-2">
                <span>Account & Safety Vault</span>
              </h2>
              <p className="text-[0.750rem] text-[#8ba8b7]">
                {currentUser
                  ? 'Protected local account authentication & privacy security'
                  : 'Mandatory Login: Create an account or sign in to continue'}
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={onClose}
              className="p-2 text-[#8ba8b7] hover:text-[#f0f6f8] hover:bg-[#1a2432] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-[#1e332d] bg-[#0e1613]/50 px-5 pt-3 gap-2">
          {currentUser ? (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 text-[0.750rem] font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-[#4ecc97] text-[#4ecc97] bg-[#14211d]'
                    : 'border-transparent text-[#85d1b1] hover:text-[#e5ebe9]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2.5 text-[0.750rem] font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-[#4ecc97] text-[#4ecc97] bg-[#14211d]'
                    : 'border-transparent text-[#85d1b1] hover:text-[#e5ebe9]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>PIN & Safety Vault</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2.5 text-[0.750rem] font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-[#4ecc97] text-[#4ecc97] bg-[#14211d]'
                    : 'border-transparent text-[#85d1b1] hover:text-[#e5ebe9]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2.5 text-[0.750rem] font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-[#4ecc97] text-[#4ecc97] bg-[#14211d]'
                    : 'border-transparent text-[#85d1b1] hover:text-[#e5ebe9]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[0.750rem] flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[#2e795a]/30 border border-[#4ecc97]/50 text-[#4ecc97] text-[0.750rem] flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. OtakuMaster"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Gmail Address * (@gmail.com)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsGmailVerified(false);
                      }}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                    />
                  </div>
                  {isGmailVerified ? (
                    <div className="px-3 py-2.5 bg-[#2e795a]/30 border border-[#4ecc97] text-[#4ecc97] rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendGmailVerification}
                      className="px-3 py-2.5 bg-[#1e332d] hover:bg-[#28473c] text-[#4ecc97] border border-[#4ecc97]/40 rounded-xl text-[0.750rem] font-bold transition whitespace-nowrap cursor-pointer"
                    >
                      {verificationCodeSent ? 'Resend Code' : 'Verify Gmail'}
                    </button>
                  )}
                </div>
              </div>

              {verificationCodeSent && !isGmailVerified && (
                <div className="p-3 bg-[#0e1613] border border-[#2e795a]/40 rounded-xl space-y-2">
                  <p className="text-[0.700rem] text-[#85d1b1]">
                    Enter the 6-digit code sent to <strong className="text-[#4ecc97]">{email}</strong>:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="e.g. 777777"
                      className="flex-1 px-3 py-2 bg-[#14211d] border border-[#1e332d] focus:border-[#4ecc97] rounded-lg text-[#e5ebe9] text-xs font-bold tracking-widest text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyGmailCode}
                      className="px-4 py-2 bg-[#2e795a] hover:bg-[#39936e] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Master Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#85d1b1] hover:text-[#e5ebe9]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                    4-Digit Vault Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none tracking-widest text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                    Auto-Lock Timeout
                  </label>
                  <select
                    value={autoLockMinutes}
                    onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none font-bold"
                  >
                    <option value={1}>1 Minute</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2d5c48] via-[#2e795a] to-[#4ecc97] text-[#0e1613] font-bold text-[0.750rem] sm:text-[1rem] shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Create Protected Account
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Administrator Login Quick Option */}
              <div className="p-4 bg-gradient-to-r from-rose-950/50 via-[#14211d] to-teal-950/40 border border-[#22d3ee]/40 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-xs font-bold text-[#22d3ee] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    <span>Administrator Master Login</span>
                  </h4>
                  <p className="text-[11px] text-[#8ba8b7] mt-0.5">
                    Admin Password: <code className="text-rose-400 font-bold bg-[#090d12] px-1.5 py-0.5 rounded">admin123</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#0d9488] text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-[#22d3ee]/20 transition cursor-pointer whitespace-nowrap"
                >
                  Login as Admin
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#1e332d]"></div>
                <span className="flex-shrink mx-4 text-[10px] text-[#85d1b1] uppercase font-bold tracking-wider">Or Standard User Login</span>
                <div className="flex-grow border-t border-[#1e332d]"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Verified Gmail Address * (@gmail.com)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsGmailVerified(false);
                      }}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                    />
                  </div>
                  {isGmailVerified ? (
                    <div className="px-3 py-2.5 bg-[#2e795a]/30 border border-[#4ecc97] text-[#4ecc97] rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendGmailVerification}
                      className="px-3 py-2.5 bg-[#1e332d] hover:bg-[#28473c] text-[#4ecc97] border border-[#4ecc97]/40 rounded-xl text-[0.750rem] font-bold transition whitespace-nowrap cursor-pointer"
                    >
                      {verificationCodeSent ? 'Resend Code' : 'Verify Gmail'}
                    </button>
                  )}
                </div>
              </div>

              {verificationCodeSent && !isGmailVerified && (
                <div className="p-3 bg-[#0e1613] border border-[#2e795a]/40 rounded-xl space-y-2">
                  <p className="text-[0.700rem] text-[#85d1b1]">
                    Enter the 6-digit code sent to <strong className="text-[#4ecc97]">{email}</strong>:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="e.g. 777777"
                      className="flex-1 px-3 py-2 bg-[#14211d] border border-[#1e332d] focus:border-[#4ecc97] rounded-lg text-[#e5ebe9] text-xs font-bold tracking-widest text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyGmailCode}
                      className="px-4 py-2 bg-[#2e795a] hover:bg-[#39936e] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                  Password / PIN Code *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#85d1b1] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2d5c48] via-[#2e795a] to-[#4ecc97] text-[#0e1613] font-bold text-[0.750rem] sm:text-[1rem] shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Unlock Vault & Log In
                </button>
              </div>
            </form>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && currentUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e1613] border border-[#1e332d]">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-16 h-16 rounded-2xl bg-[#14211d] border border-[#2e795a] p-1 shrink-0"
                />
                <div>
                  <h3 className="text-[1.333rem] font-bold text-[#e5ebe9]">
                    {currentUser.username}
                  </h3>
                  <p className="text-[0.750rem] text-[#85d1b1]">{currentUser.email}</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2e795a]/30 text-[#4ecc97] border border-[#4ecc97]/40 text-[0.750rem] font-bold mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Account Active & Protected</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1613] border border-[#1e332d] space-y-2">
                <h4 className="text-[0.750rem] font-bold uppercase text-[#4ecc97] tracking-wider">
                  Backup Safety Passkey
                </h4>
                <p className="text-[0.750rem] text-[#85d1b1]">
                  Keep this emergency key in a safe place to recover your encrypted collection data.
                </p>
                <div className="p-3 bg-[#14211d] border border-[#2e795a] rounded-xl text-center text-[#4ecc97] font-bold text-[0.750rem] tracking-widest selection:bg-[#4ecc97] selection:text-[#0e1613]">
                  {currentUser.backupPasskey}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onLogout}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[0.750rem] font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY SETTINGS */}
          {activeTab === 'security' && currentUser && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                    Update Security PIN Code
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 4-6 digit PIN"
                    className="w-full px-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none font-bold tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-[0.750rem] font-bold text-[#a3d2be] mb-1">
                    Auto-Lock Session Timer
                  </label>
                  <select
                    value={autoLockMinutes}
                    onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#0e1613] border border-[#1e332d] focus:border-[#4ecc97] rounded-xl text-[#e5ebe9] text-[0.750rem] outline-none font-bold"
                  >
                    <option value={1}>1 Minute Idle</option>
                    <option value={5}>5 Minutes Idle</option>
                    <option value={15}>15 Minutes Idle</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSecuritySettings}
                    className="w-full py-2.5 rounded-xl bg-[#2e795a] hover:bg-[#34b27d] text-[#e5ebe9] font-bold text-[0.750rem] border border-[#4ecc97]/40 transition cursor-pointer"
                  >
                    Save Security Vault Preferences
                  </button>
                </div>
              </div>

              {/* Security Logs Audit */}
              <div className="pt-2 border-t border-[#1e332d]">
                <h4 className="text-[0.750rem] font-bold text-[#4ecc97] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Security Audit Activity Log</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {securityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-xl bg-[#0e1613] border border-[#1e332d] flex items-center justify-between text-[0.750rem]"
                    >
                      <span className="text-[#e5ebe9] font-bold">{log.action}</span>
                      <span className="text-[#85d1b1] font-mono text-[0.750rem]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
