import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import RenterDashboard from './pages/RenterDashboard.jsx';
import PublicSearch from './pages/PublicSearch.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<PublicSearch />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute allowedRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/renter"
          element={
            <ProtectedRoute allowedRole="renter">
              <RenterDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
