import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 gap-2">
        <h1 className="text-xl font-bold mb-6">AlphaCRM</h1>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `px-3 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Contacts
        </NavLink>
        <NavLink
          to="/pipeline"
          className={({ isActive }) =>
            `px-3 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Pipeline
        </NavLink>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
          <span className="text-gray-600">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
