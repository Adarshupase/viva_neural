import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import ProfessorPage from './pages/ProfessorPage.jsx';
import TopicPage from './pages/TopicPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProfessorsManager from './pages/admin/ProfessorsManager.jsx';
import TopicsManager from './pages/admin/TopicsManager.jsx';
import QuestionsManager from './pages/admin/QuestionsManager.jsx';
import AIConfigEditor from './pages/admin/AIConfigEditor.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/professor/:id" element={<ProfessorPage />} />
        <Route path="/topic/:id" element={<TopicPage />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="professors" element={<ProfessorsManager />} />
          <Route path="topics" element={<TopicsManager />} />
          <Route path="questions" element={<QuestionsManager />} />
          <Route path="ai-config" element={<AIConfigEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
