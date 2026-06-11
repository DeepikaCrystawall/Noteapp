import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppSidebar, { SidebarLogoutButton } from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import MobileNav from '@/components/layout/MobileNav';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import api from '@/services/api';

export default function DashboardLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      useSocketStore.getState().disconnect();
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-foreground)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 h-screen fixed left-0 top-0 flex-col border-r border-[var(--color-outline-variant)] z-50 overflow-y-auto custom-scrollbar">
        <AppSidebar />
        <SidebarLogoutButton onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="md:hidden max-h-[85vh]">
          <div className="overflow-y-auto custom-scrollbar flex flex-col max-h-[75vh]">
            <AppSidebar onNavigate={() => setDrawerOpen(false)} />
            <SidebarLogoutButton onLogout={() => { setDrawerOpen(false); handleLogout(); }} />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="md:ml-72 flex flex-col min-h-screen">
        <AppHeader onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileNav onMenuClick={() => setDrawerOpen(true)} />
    </div>
  );
}
