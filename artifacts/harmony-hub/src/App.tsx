import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { HarmonyHub } from "./components/HarmonyHub";
import { LoginScreen } from "./components/LoginScreen";
import { useAuth, AuthProvider } from "@workspace/replit-auth-web";

const queryClient = new QueryClient();

function AppContent() {
  const { isLoading, isAuthenticated, refetch } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0D0D3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'VT323', monospace",
        fontSize: 24,
        color: '#FFD600',
        letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={refetch} />;
  }

  return <HarmonyHub />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppContent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
