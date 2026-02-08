import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './components/AuthProvider'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Agency Imports
import AgencyLayout from './layouts/AgencyLayout'
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AgencyExperts from './pages/agency/AgencyExperts'
import AgencyWorkspaces from './pages/agency/AgencyWorkspaces'
import AgencySettings from './pages/agency/AgencySettings'
import AgencyHireRequests from './pages/agency/HireRequests'

// Expert Imports
import ExpertLayout from './layouts/ExpertLayout'
import ExpertDashboard from './pages/expert/ExpertDashboard'
import ExpertWorkspaces from './pages/expert/ExpertWorkspaces'
import ExpertProfile from './pages/expert/ExpertProfile'
import ExpertSettings from './pages/expert/ExpertSettings'

// Admin Imports
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AgenciesManagement from './pages/admin/AgenciesManagement'
import ExpertsManagement from './pages/admin/ExpertsManagement'
import ExpertModeration from './pages/admin/ExpertModeration'
import WorkspacesManagement from './pages/admin/WorkspacesManagement'
import AuditTrail from './pages/admin/AuditTrail'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAgreements from './pages/admin/AdminAgreements'
import HireRequests from './pages/admin/HireRequests'

// Public & Flow Pages
import ExpertOnboarding from './pages/ExpertOnboarding'
import ExpertAgreement from './pages/ExpertAgreement'
import TalentMarketplace from './pages/TalentMarketplace'
import PublicExpertProfile from './pages/PublicExpertProfile'
import './App.css'

function BannedScreen() {
  const { signOut } = useAuth()

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fef2f2',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#991b1b', marginBottom: '1rem' }}>
          Account Suspended
        </h1>
        <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
          Your account has been suspended. Please contact support for more information.
        </p>
        <button
          onClick={signOut}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function PrivateRoute({ children, allowedRoles }) {
  const { user, role, loading, isBanned } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isBanned) {
    return <BannedScreen />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'expert') return <Navigate to="/expert" replace />
    return <Navigate to="/agency" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (user) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'expert') return <Navigate to="/expert" replace />
    return <Navigate to="/agency" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/expert/onboard" element={<ExpertOnboarding />} />
        <Route path="/expert/agreement" element={<ExpertAgreement />} />

        <Route path="/agency" element={
          <PrivateRoute allowedRoles={['agency']}>
            <AgencyLayout />
          </PrivateRoute>
        }>
          <Route index element={<AgencyDashboard />} />
          <Route path="experts" element={<AgencyExperts />} />
          <Route path="workspaces" element={<AgencyWorkspaces />} />
          <Route path="requests" element={<AgencyHireRequests />} />
          <Route path="settings" element={<AgencySettings />} />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/agency" replace />} />

        <Route path="/talents" element={
          <PrivateRoute allowedRoles={['agency']}>
            <TalentMarketplace />
          </PrivateRoute>
        } />

        <Route path="/experts/:id" element={
          <PrivateRoute allowedRoles={['agency']}>
            <PublicExpertProfile />
          </PrivateRoute>
        } />

        <Route path="/expert" element={
          <PrivateRoute allowedRoles={['expert']}>
            <ExpertLayout />
          </PrivateRoute>
        }>
          <Route index element={<ExpertDashboard />} />
          <Route path="workspaces" element={<ExpertWorkspaces />} />
          <Route path="profile" element={<ExpertProfile />} />
          <Route path="settings" element={<ExpertSettings />} />
        </Route>

        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="agencies" element={<AgenciesManagement />} />
          <Route path="experts" element={<ExpertsManagement />} />
          <Route path="experts/moderation" element={<ExpertModeration />} />
          <Route path="workspaces" element={<WorkspacesManagement />} />
          <Route path="agreements" element={<AdminAgreements />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="requests" element={<HireRequests />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
