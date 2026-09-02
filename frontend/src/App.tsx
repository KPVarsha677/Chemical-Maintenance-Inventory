import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard";
import { InventoryPage } from "@/pages/inventory";
import { ChemicalDetailsPage } from "@/pages/chemical-details";
import { TransactionsPage } from "@/pages/transactions";
import { AlertsPage } from "@/pages/alerts";
import { AiAssistantPage } from "@/pages/ai-assistant";
import { NotFoundPage } from "@/pages/not-found";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/:id" element={<ChemicalDetailsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="assistant" element={<AiAssistantPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
