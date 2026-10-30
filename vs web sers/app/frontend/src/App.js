import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PortalLayout from "@/pages/portal/PortalLayout";
import Dashboard from "@/pages/portal/Dashboard";
import Tests from "@/pages/portal/Tests";
import TestEngine from "@/pages/portal/TestEngine";
import TestResult from "@/pages/portal/TestResult";
import Library from "@/pages/portal/Library";
import AiChat from "@/pages/portal/AiChat";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Protected = ({ children }) => {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-ink text-white/60 font-mono text-sm">
        loading your ascent…
      </div>
    );
  }
  if (user === false) return <Navigate to="/login" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  if (user === null) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <PortalLayout />
                </Protected>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tests" element={<Tests />} />
              <Route path="tests/:testId" element={<TestEngine />} />
              <Route path="results/:resultId" element={<TestResult />} />
              <Route path="library" element={<Library />} />
              <Route path="ai" element={<AiChat />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
