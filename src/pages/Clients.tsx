
import { ClientList } from '@/components/clients/ClientList';

export default function Clients() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ClientList />
      </main>
    </div>
  );
}
