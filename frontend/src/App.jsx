import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardLayout } from "./layouts/dashboardLayout";
import { Dashboard } from "./pages/dashboard";
import { Components } from "./pages/components";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";
import { Customers } from "./pages/Customers";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
