import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SqlViewerModal } from './components/SqlViewerModal';

import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPages } from './pages/AuthPages';
import { DashboardLayout } from './pages/Dashboard/DashboardLayout';
import { StorefrontView } from './pages/Storefront/StorefrontView';
import { AdminPanel } from './pages/Admin/AdminPanel';

export default function App() {
  // Simple hash/state-based routing for robust preview and navigation
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const isStorefront = currentPath.startsWith('/store/');
  const storeSlug = isStorefront ? currentPath.replace('/store/', '').split('/')[0] : 'elegance';
  const isDashboard = currentPath.startsWith('/dashboard');
  const isAdmin = currentPath.startsWith('/admin');
  const isPricing = currentPath === '/pricing';
  const isLogin = currentPath === '/auth/login';
  const isRegister = currentPath === '/auth/register';
  const isForgotPassword = currentPath === '/auth/forgot-password';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white" dir="rtl">
      
      {/* Top Main Navigation (except for Storefront which has its own branded customer navbar) */}
      {!isStorefront && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
        />
      )}

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col">
        {/* Landing Page */}
        {currentPath === '/' && (
          <LandingPage
            onNavigate={navigate}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        )}

        {/* Pricing Page */}
        {isPricing && (
          <PricingPage onNavigate={navigate} />
        )}

        {/* Auth Pages */}
        {isLogin && (
          <AuthPages mode="login" onNavigate={navigate} />
        )}
        {isRegister && (
          <AuthPages mode="register" onNavigate={navigate} />
        )}
        {isForgotPassword && (
          <AuthPages mode="forgot-password" onNavigate={navigate} />
        )}

        {/* Merchant Dashboard */}
        {isDashboard && (
          <DashboardLayout onNavigate={navigate} />
        )}

        {/* Live Storefront */}
        {isStorefront && (
          <StorefrontView storeSlug={storeSlug} onNavigate={navigate} />
        )}

        {/* Super Admin Panel */}
        {isAdmin && (
          <AdminPanel
            onNavigate={navigate}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        )}
      </div>

      {/* Platform Footer (except for Storefront and Dashboard which has custom bottom controls) */}
      {!isStorefront && !isDashboard && (
        <Footer
          onNavigate={navigate}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
        />
      )}

      {/* SQL Migration & Schema Viewer Modal */}
      {isSqlModalOpen && (
        <SqlViewerModal onClose={() => setIsSqlModalOpen(false)} />
      )}

    </div>
  );
}
