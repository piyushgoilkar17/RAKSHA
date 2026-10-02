import { Component, lazy, Suspense, useLayoutEffect, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

const LandingPage = lazy(() => import('./landing/LandingPage'));
const Dashboard = lazy(() => import('./App'));

class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return (
      <main className="p-8" role="alert">
        <h1>Unable to load this page</h1>
        <p>Please refresh to try again.</p>
        <button onClick={() => window.location.reload()}>Refresh page</button>
      </main>
    );
    return this.props.children;
  }
}

function Page({ surface, children }: { surface: 'landing' | 'dashboard'; children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = surface;
    document.title = surface === 'landing'
      ? 'RakshaAI | Autonomous Disaster Intelligence'
      : 'Raksha AI — Disaster Command Center';
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector<HTMLElement>('#page-content')?.focus({ preventScroll: true });
    return () => { delete document.documentElement.dataset.surface; };
  }, [surface, pathname, hash]);
  return <div id="page-content" tabIndex={-1} className="outline-none">{children}</div>;
}

function LegacyLandingRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`/${search}${hash}`} replace />;
}

export function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <PageErrorBoundary key={pathname}>
      <Suspense fallback={<p className="p-8" role="status">Loading page…</p>}>
        <Routes>
          <Route path="/" element={<Page surface="landing"><LandingPage /></Page>} />
          <Route path="/landing" element={<LegacyLandingRedirect />} />
          <Route path="/dashboard" element={<Page surface="dashboard"><Dashboard /></Page>} />
          <Route path="*" element={
            <Page surface="dashboard">
              <main className="p-8">
                <h1 className="text-2xl font-bold">Page not found</h1>
                <p className="my-4">This address does not match a page.</p>
                <Link to="/" className="underline">Back to home</Link>
              </main>
            </Page>
          } />
        </Routes>
      </Suspense>
    </PageErrorBoundary>
  );
}
