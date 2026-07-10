import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
      <p className="text-gray-600">Welcome back, {user?.name || user?.email}. Your CRM is ready.</p>
    </div>
  );
}
