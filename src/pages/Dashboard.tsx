
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { MakerDashboard } from '@/components/dashboards/MakerDashboard';
import { CheckerDashboard } from '@/components/dashboards/CheckerDashboard';
import { Navbar } from '@/components/Navbar';
import { TasksProvider } from '@/contexts/TasksContext';

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'maker':
        return <MakerDashboard />;
      case 'checker':
        return <CheckerDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <TasksProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderDashboard()}
        </main>
      </div>
    </TasksProvider>
  );
}
