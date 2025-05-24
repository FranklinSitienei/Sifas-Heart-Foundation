import { AdminLayout } from "@/components/AdminLayout";
import { AdminOverview } from "@/components/AdminOverview";
import { UserManagement } from "@/components/UserManagement";
import { BlogManagement } from "@/components/BlogManagement";
import { ChatManagement } from "@/components/ChatManagement";
import { AdminProfile } from "@/components/AdminProfile";
import { Reports } from "@/components/Reports";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/blogs" element={<BlogManagement />} />
              <Route path="/chat" element={<ChatManagement />} />
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
