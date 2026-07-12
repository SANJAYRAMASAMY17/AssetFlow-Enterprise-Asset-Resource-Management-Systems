import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { KeyRound, Mail, UserPlus, LogIn, ShieldAlert, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { login, registerUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('EMPLOYEE');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      // toast is already handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    setIsSubmitting(true);
    try {
      await registerUser(regName, regEmail, regPassword, regRole);
      // Auto fill and switch to login
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setIsRegister(false);
    } catch (err) {
      // toast handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (email: string, pass: string) => {
    setIsSubmitting(true);
    try {
      await login(email, pass);
    } catch (err) {
      // toast handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <div className="bg-gray-900 text-white p-3 rounded-xl shadow-md">
            <KeyRound className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          AssetFlow Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enterprise Asset Tracking and Lifecycle Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-all ${
                !isRegister
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <LogIn className="w-4 h-4" />
                Employee Sign In
              </div>
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-all ${
                isRegister
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                Register Employee
              </div>
            </button>
          </div>

          {!isRegister ? (
            /* Login Form */
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form className="space-y-5" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="employee@assetflow.local"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Permission
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="EMPLOYEE">Employee (Request Bookings/Transfers)</option>
                  <option value="DEPARTMENT_HEAD">Department Head (Approve Transfers)</option>
                  <option value="ASSET_MANAGER">Asset Manager (Manage Assets & Audits)</option>
                  <option value="ADMIN">System Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Register Employee'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Login Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Accounts
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Select an role below to quickly sign in and test layout capabilities.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickLogin('admin@assetflow.local', 'admin123')}
                className="flex items-center justify-between p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">System Admin</div>
                  <div className="text-[10px] text-gray-500">Full Access</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  // Register on the fly or log in if they exist
                  quickLogin('manager@assetflow.local', 'password123').catch(() => {
                    // if fails, register it first
                    registerUser('Asset Manager User', 'manager@assetflow.local', 'password123', 'ASSET_MANAGER')
                      .then(() => quickLogin('manager@assetflow.local', 'password123'));
                  });
                }}
                className="flex items-center justify-between p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">Asset Manager</div>
                  <div className="text-[10px] text-gray-500">Audits & Allocations</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  quickLogin('head@assetflow.local', 'password123').catch(() => {
                    registerUser('Department Head User', 'head@assetflow.local', 'password123', 'DEPARTMENT_HEAD')
                      .then(() => quickLogin('head@assetflow.local', 'password123'));
                  });
                }}
                className="flex items-center justify-between p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">Dept Head</div>
                  <div className="text-[10px] text-gray-500">Approval Workflow</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  quickLogin('employee@assetflow.local', 'password123').catch(() => {
                    registerUser('Standard Employee User', 'employee@assetflow.local', 'password123', 'EMPLOYEE')
                      .then(() => quickLogin('employee@assetflow.local', 'password123'));
                  });
                }}
                className="flex items-center justify-between p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">Employee</div>
                  <div className="text-[10px] text-gray-500">Request & Bookings</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
