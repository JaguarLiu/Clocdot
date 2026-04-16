import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarSearch, CheckCircle2, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '總覽' },
  { path: '/attendance', icon: CalendarSearch, label: '月度出勤統計' },
  { path: '/corrections', icon: CheckCircle2, label: '補打卡審核' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <h1 className="text-lg font-black tracking-tight">ClocDot</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.name || '管理員'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          <span>登出</span>
        </button>
      </div>
    </aside>
  )
}
