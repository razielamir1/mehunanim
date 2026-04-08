import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, MessageCircle, Settings as Cog } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '@/i18n';
import WorldBackground from './WorldBackground';
import ErrorBoundary from './ErrorBoundary';

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const t = useT();
  const showNav = pathname !== '/';
  return (
    <div className="min-h-full flex flex-col">
      <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
      <WorldBackground />
      <main
        id="main-content"
        className={clsx(
          'flex-1 w-full mx-auto px-4 pt-6',
          'max-w-3xl md:max-w-5xl lg:max-w-6xl',
          showNav ? 'pb-28 md:pb-32' : 'pb-6'
        )}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      {showNav && (
        <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto grid grid-cols-4 gap-1 p-2">
            {[
              { to: '/dashboard', icon: Home, label: t('home') },
              { to: '/progress', icon: BarChart3, label: t('progress') },
              { to: '/coach', icon: MessageCircle, label: t('coach') },
              { to: '/settings', icon: Cog, label: t('settings') },
            ].map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    'flex flex-col items-center justify-center min-h-[68px] rounded-2xl text-sm font-bold transition',
                    active ? 'bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-50' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
