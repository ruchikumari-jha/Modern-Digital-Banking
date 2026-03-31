
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Unlock from './pages/Unlock';
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import Cards from './pages/Cards';
import Account from './pages/Account';
import Bills from './pages/Bills';
import Rewards from './pages/Rewards';
import Rules from './pages/Rules';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import Alerts from './pages/Alerts';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // const isUnlocked = sessionStorage.getItem('isUnlocked') === 'true';
  // const currentUser = localStorage.getItem('currentUser');
  // const location = useLocation();

 
const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
 

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Toast />
        <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction"
          element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rewards"
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rules"
          element={
            <ProtectedRoute>
              <Rules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/budgets"
          element={
            <ProtectedRoute>
              <Budgets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
