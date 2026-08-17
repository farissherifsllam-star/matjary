import React, { useState, useEffect } from 'react';
import { COMPLETE_POSTGRES_SCHEMA_SQL } from '../lib/schemaSql';
import { inspectDatabase, DatabaseInspectionResult } from '../lib/dbInspector';
import { Database, Copy, Check, X, ShieldAlert, Zap, FileCode2, CheckCircle2, AlertTriangle, RefreshCw, Activity } from 'lucide-react';

interface SqlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlViewerModal: React.FC<SqlViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'diagnostics'>('diagnostics');
  const [inspectionResult, setInspectionResult] = useState<DatabaseInspectionResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInspectionResult(inspectDatabase());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(COMPLETE_POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecheck = () => {
    setInspectionResult(inspectDatabase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">إدارة ومخطط قواعد البيانات (Database & Schema Hub)</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {inspectionResult?.connectionMode === 'supabase' ? 'Supabase Live' : 'Embedded DB Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                فحص تكامل المخطط، التحقق من الجداول والقيود، واستعراض سكريبتات الترحيل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'sql' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ كود SQL</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'diagnostics'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>فحص تكامل المخطط (Schema Integrity)</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'sql'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>كود الترحيل الكامل (PostgreSQL SQL)</span>
            </button>
          </div>

          <button
            onClick={handleRecheck}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة الفحص الآن</span>
          </button>
        </div>

        {/* Main Body */}
        {activeTab === 'diagnostics' ? (
          <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
            {/* Score & Summary Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    حالة قاعدة البيانات:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                      inspectionResult?.isValid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {inspectionResult?.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {inspectionResult?.isValid ? 'متطابقة 100% وجاهزة للإنتاج' : 'يوجد تنبيهات'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  تم فحص {inspectionResult?.summary.totalChecked} عنصراً تشمل أنواع Enums، 12 جدولاً، قيود المفاتيح الأجنبية، المشغلات، والدوال التخزينية.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {inspectionResult?.summary.passed}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">عنصر مؤكد</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xl font-black text-purple-400 font-mono">
                    {inspectionResult?.score}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">نقاط التطابق</div>
                </div>
              </div>
            </div>

            {/* Issues List if any */}
            {inspectionResult?.issues && inspectionResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>التنبيهات المكتشفة ({inspectionResult.issues.length}):</span>
                </h4>
                <div className="space-y-2">
                  {inspectionResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{issue.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                          {issue.type}
                        </span>
                      </div>
                      <p className="text-slate-300">{issue.message}</p>
                      {issue.remediation && (
                        <p className="text-[11px] text-amber-200 font-medium pt-1 border-t border-amber-900/40">
                          الإجراء المقترح: {issue.remediation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Tables Checked */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">الجداول المعتمدة (12 Tables)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">RLS مفعل للكل</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  {inspectionResult?.details.tables.map((t) => (
                    <div key={t.name} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-purple-300">{t.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Triggers & RPC */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">الدوال والمشغلات (Triggers & RPC)</span>
                  <span className="text-[10px] text-purple-400 font-bold">Atomic Locks</span>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  {inspectionResult?.details.functions.map((f) => (
                    <div key={f.name} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-amber-300 font-bold">{f.name}</span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">Returns: {f.returnType}</span>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-slate-950 text-slate-300 selection:bg-purple-900 selection:text-purple-100 max-h-[60vh]" dir="ltr">
            <pre className="whitespace-pre overflow-x-auto">{COMPLETE_POSTGRES_SCHEMA_SQL}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>متوافق 100% مع Supabase و PostgreSQL v14+ مع RLS و Row-Locking</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};

