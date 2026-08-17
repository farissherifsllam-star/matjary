import React from 'react';
import { Crown, ShieldCheck, Zap, Globe, Sparkles, Heart, Server } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenSqlModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSqlModal }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-bold text-base text-white">VIPSTORE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              المنصة السحابية الرائدة لإنشاء وإدارة المتاجر الإلكترونية في الشرق الأوسط. بنيت للمحترفين والتجار الطموحين.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>نظام أمني متكامل مع RLS & Atomic Locks</span>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">المنصة والحلول</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-purple-400 transition">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-purple-400 transition">
                  الباقات والأسعار (7 باقات)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/store/elegance')} className="hover:text-purple-400 transition">
                  معاينة متجر تجريبي مباشر
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-purple-400 transition">
                  لوحة تحكم التاجر (Salla UX)
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">البنية التحتية والبيانات</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenSqlModal} className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>مخطط قواعد البيانات (Postgres SQL)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-amber-400 transition">
                  لوحة السوبر أدمن (Super Admin)
                </button>
              </li>
              <li>
                <span className="text-slate-500">حماية المخزون عبر Atomic place_order RPC</span>
              </li>
              <li>
                <span className="text-slate-500">تخزين الملفات في باقة store-assets</span>
              </li>
            </ul>
          </div>

          {/* Standards & Specs */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">المعايير والامتثال</h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>العملة الافتراضية:</span>
                <span className="text-purple-400 font-mono">EGP (جنيه مصري)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>دقة العمليات المالية:</span>
                <span className="text-emerald-400 font-mono">NUMERIC(10,2)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>فحص الروابط المحجوزة:</span>
                <span className="text-amber-400">Trigger Guard</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} VIPSTORE Platform — جميع الحقوق محفوظة لرواد التجارة الإلكترونية.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              صنع بأعلى معايير الحرفية والبرمجة النظيفة
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
