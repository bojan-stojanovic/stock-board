import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import PortfolioPage from "./pages/PortfolioPage";
import StockPage from "./pages/StockPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="stock/:symbol" element={<StockPage />} />
      </Route>
    </Routes>
  );
}