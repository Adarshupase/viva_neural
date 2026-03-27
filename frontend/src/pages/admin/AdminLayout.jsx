import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/professors', label: 'Professors', icon: '👨‍⚕️' },
  { to: '/admin/topics', label: 'Topics', icon: '📚' },
  { to: '/admin/questions', label: 'Questions', icon: '❓' },
  { to: '/admin/ai-config', label: 'AI Config', icon: '🤖' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="font-bold text-gray-900 text-sm">⚕️ Viva Admin</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
