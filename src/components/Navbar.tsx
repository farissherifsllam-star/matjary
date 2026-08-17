import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
import {
  Crown,
  Store as StoreIcon,
  LayoutDashboard,
  ShieldCheck,
  Code2,
  LogOut,
  ExternalLink,
  ChevronDown,
  UserCheck,
  User,
  Sparkles,
  Zap,
  ShoppingBag
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSqlModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSqlModal }) => {
  const { session, user, profile, isSuperAdmin, loginAs, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const userStore = profile?.id ? db.getStoreByOwner(profile.id) : null;

  const handleRoleSwitch = (role: 'super_admin' | 'merchant' | 'new_merchant') => {
    loginAs(role);
    setShowRoleMenu(false);
    if (role === 'super_admin') {
      onNavigate('/admin');
    } else {
      onNavigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 group cursor-pointer text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  VIPSTORE
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  SaaS Pro
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block -mt-0.5">
                منصة بناء المتاجر الإلكترونية
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('/')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentPath === '/' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('/pricing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentPath === '/pricing' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              الأسعار والخطط (7 باقات)
            </button>
            <button
              onClick={() => onNavigate('/store/elegance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentPath.startsWith('/store') ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>المتجر التجريبي (Storefront)</span>
            </button>
            <button
              onClick={onOpenSqlModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1.5 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>كود SQL و RLS</span>
            </button>
          </nav>
        </div>

        {/* Right Section Actions & Quick Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher for seamless testing */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
              title="تبديل حساب الاختبار السريع"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تبديل الحساب:</span>
              <span className="font-bold text-purple-300">
                {isSuperAdmin ? 'سوبر أدمن' : profile ? profile.full_name?.split(' ')[0] : 'زائر'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
                  اختر هوية لتجربة المنصة
                </div>
                <button
                  onClick={() => handleRoleSwitch('merchant')}
                  className="w-full text-right px-3 py-2 text-xs text-slate-200 hover:bg-purple-600/20 hover:text-purple-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold">أحمد محمود (تاجر بريميوم)</div>
                      <div className="text-[10px] text-slate-400">متجر الأناقة + اشتراك نشط</div>
                    </div>
                  </div>
                  {profile?.id === 'user-merchant-demo-01' && <UserCheck className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('super_admin')}
                  className="w-full text-right px-3 py-2 text-xs text-slate-200 hover:bg-amber-600/20 hover:text-amber-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold">مدير النظام (Super Admin)</div>
                      <div className="text-[10px] text-slate-400">إدارة كافة المتاجر والاشتراكات</div>
                    </div>
                  </div>
                  {isSuperAdmin && <UserCheck className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('new_merchant')}
                  className="w-full text-right px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-200 flex items-center justify-between border-t border-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-semibold">تسجيل تاجر جديد فوراً</div>
                      <div className="text-[10px] text-slate-400">بدء إنشاء متجر واختيار باقة</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Logged In Actions */}
          {session ? (
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPath.startsWith('/admin')
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة السوبر أدمن</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('/dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentPath.startsWith('/dashboard')
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </button>

              {userStore && (
                <button
                  onClick={() => onNavigate(`/store/${userStore.slug}`)}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                  title="عرض متجري المباشر"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>معاينة متجري</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-200 hover:bg-purple-600/50 transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-bold text-xs text-white">{profile?.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email || user?.phone}</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); onNavigate('/dashboard'); }}
                      className="w-full text-right px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-400" />
                      <span>لوحة تحكم المتجر</span>
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('/admin'); }}
                        className="w-full text-right px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>إدارة المنصة (Admin)</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 border-t border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/auth/login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => onNavigate('/auth/register')}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition active:scale-95"
              >
                ابدأ متجرك مجاناً
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
