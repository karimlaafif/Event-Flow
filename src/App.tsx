import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import UserSession from "./pages/UserSession";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
      <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
            <ErrorBoundary>
        <Routes>
                {/* User session (default) */}
                <Route path="/" element={<UserSession />} />
                <Route path="/user" element={<UserSession />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                
                {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
            </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
