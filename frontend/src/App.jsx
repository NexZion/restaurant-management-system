import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ResourcePage } from "./components/ResourcePage";
import { ThemeProvider } from "./context/ThemeContext";
import { systemResources } from "./data/systemResources";
import { DashboardLayout } from "./layouts/dashboardLayout";
import { AccessDenied } from "./pages/auth/AccessDenied";
import { CashierBilling } from "./pages/pos/CashierBilling";
import { Components } from "./pages/system/Components";
import { Customers } from "./pages/customers/Customers";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Login } from "./pages/auth/Login";
import { CashierShifts } from "./pages/pos/CashierShifts";
import { KitchenDisplay } from "./pages/kitchen/KitchenDisplay";
import { MenuCategories } from "./pages/Menu/MenuCategories";
import { MenuItems } from "./pages/Menu/MenuItems";
import { Menus } from "./pages/Menu/Menus";
import { NotFound } from "./pages/system/NotFound";
import { Orders } from "./pages/Orders/Orders";
import { Users } from "./pages/administration/Users";
import { POSNewOrder } from "./pages/pos/WaiterOrdering";
import { ProfileSettings } from "./pages/profile/ProfileSettings";
import { PurchaseReceiving } from "./pages/purchasing/PurchaseReceiving";
import { OrderDetails } from "./pages/Orders/OrderDetails";
import { CustomerDetails } from "./pages/customers/CustomerDetails";
import { ACCESS_LEVELS as L } from "./utils/accessControl";

const guarded = (element, allowedLevels) => (
  <ProtectedRoute allowedLevels={allowedLevels}>{element}</ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login/pin" element={<Login initialPinMode />} />
          <Route path="/forbidden" element={guarded(<AccessDenied />)} />

          <Route path="/pos/new-order" element={guarded(<POSNewOrder />, [L.WAITER])} />
          <Route path="/pos/billing" element={guarded(<CashierBilling />, [L.CASHIER])} />
          <Route path="/kitchen/display" element={guarded(<KitchenDisplay />, [L.KITCHEN])} />

          <Route element={guarded(<DashboardLayout />)}>
            <Route path="/dashboard" element={guarded(<Dashboard />, [L.VIEWER, L.RECEPTION, L.ACCOUNTANT])} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/profile/change-password" element={<ProfileSettings />} />
            <Route path="/purchasing/receiving" element={guarded(<PurchaseReceiving />, [L.INVENTORY])} />
            <Route path="/purchasing/orders/:purchaseOrderId/receive" element={guarded(<PurchaseReceiving />, [L.INVENTORY])} />
            <Route path="/pos/cashier-shifts" element={guarded(<CashierShifts />, [L.CASHIER])} />
            <Route path="/pos/shifts" element={guarded(<CashierShifts />, [L.CASHIER])} />
            <Route path="/users" element={guarded(<Users />, [L.SUPER_ADMIN])} />
            <Route path="/administration/users" element={guarded(<Users />, [L.SUPER_ADMIN])} />
            <Route path="/customers" element={guarded(<Customers />, [L.RECEPTION, L.WAITER])} />
            <Route path="/customers/:customerId" element={guarded(<CustomerDetails />, [L.RECEPTION, L.WAITER])} />
            <Route path="/customers/:customerId/addresses" element={guarded(<CustomerDetails />, [L.RECEPTION, L.WAITER])} />
            <Route path="/customers/:customerId/loyalty" element={guarded(<CustomerDetails />, [L.RECEPTION, L.WAITER])} />
            <Route path="/orders" element={guarded(<Orders />, [L.WAITER, L.CASHIER])} />
            <Route path="/orders/:orderId" element={guarded(<OrderDetails />, [L.WAITER, L.CASHIER])} />
            <Route path="/Orders/Orders" element={<Navigate to="/orders" replace />} />
            <Route path="/orders/orders" element={<Navigate to="/orders" replace />} />
            <Route path="/Orders/Payments" element={<Navigate to="/billing/payments" replace />} />
            <Route path="/menu/menus" element={guarded(<Menus />, [L.INVENTORY])} />
            <Route path="/menu/menu-items" element={guarded(<MenuItems />, [L.INVENTORY])} />
            <Route path="/menu/menu-categories" element={guarded(<MenuCategories />, [L.INVENTORY])} />
            <Route path="/menu/categories" element={guarded(<MenuCategories />, [L.INVENTORY])} />
            <Route path="/menu/items" element={guarded(<MenuItems />, [L.INVENTORY])} />
            <Route path="/reservations" element={<Navigate to="/restaurant/reservations" replace />} />
            <Route path="/settings/taxes" element={<Navigate to="/sales/taxes" replace />} />
            <Route path="/inventory/movements" element={<Navigate to="/inventory/stock-movements" replace />} />
            <Route path="/purchasing/orders" element={<Navigate to="/purchasing/purchase-orders" replace />} />
            <Route path="/components" element={guarded(<Components />, [L.SUPER_ADMIN])} />

            {systemResources.map((config) => (
              <Route
                key={config.path}
                path={config.path}
                element={guarded(<ResourcePage config={config} />, config.allowedLevels)}
              />
            ))}

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
