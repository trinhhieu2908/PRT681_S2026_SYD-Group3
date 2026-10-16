import { queryClient } from "@/clients/query-client";
import { AuthProvider } from "@/modules/auth/contexts/auth.context";
import AppRouter from "@/routes/app-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
