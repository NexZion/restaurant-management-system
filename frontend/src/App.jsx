import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardLayout } from "./layouts/dashboardLayout";
import { Dashboard } from "./pages/dashboard";
import { Components } from "./pages/components";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";
import { Customers } from "./pages/Customers";
import { Orders } from "./pages/Orders/Orders";
import { Menus } from "./pages/Menu/Menus";
import { MenuItems } from "./pages/Menu/MenuItems";
import { MenuCategories } from "./pages/Menu/MenuCategories";
import { CashierBilling } from "./pages/CashierBilling";
import { POSNewOrder } from "./pages/WaiterOrdering";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
          <Route
            path="/pos/new-order"
            element={
              <ProtectedRoute>
                <POSNewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/billing"
            element={
              <ProtectedRoute>
                <CashierBilling />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<Users />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/components" element={<Components />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/Orders/Orders" element={<Orders />} />
            <Route path="/orders/orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
