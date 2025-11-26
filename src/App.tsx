import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import GlobalHub from "./pages/GlobalHub";
import Actualites from "./pages/Actualites";
import Login from "./pages/Login";
import DemoPortal from "./pages/DemoPortal";
import EntityPortal from "./pages/EntityPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GlobalHub />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo-portal" element={<DemoPortal />} />
            <Route path="/entity/:entityId" element={<EntityPortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DemoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
