import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { useNotificationStore } from '@/stores/notificationStore';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import NotesPage from '@/pages/NotesPage';
import NoteEditorPage from '@/pages/NoteEditorPage';
import VersionHistoryPage from '@/pages/VersionHistoryPage';
import TeamsPage from '@/pages/TeamsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import api from '@/services/api';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const connect = useSocketStore((s) => s.connect);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = connect(accessToken);

      api.get('/notifications/unread-count').then((res) => {
        setUnreadCount(res.data.data.count);
      });

      socket?.on('notification:new', (notification) => {
        addNotification(notification);
      });

      return () => socket?.off('notification:new');
    }
  }, [isAuthenticated, accessToken]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/:noteId" element={<NoteEditorPage />} />
        <Route path="notes/:noteId/history" element={<VersionHistoryPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
