import { CalendarSearch, CheckCircle2, Users, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher } from '../services/api.js'

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md hover:border-slate-300 transition-all text-left w-full"
    >
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: pendingCorrections } = useSWR('/admin/correction-requests?status=pending', fetcher)

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { data: attendance } = useSWR(`/admin/attendance?month=${currentMonth}`, fetcher)

  const totalEmployees = attendance?.length ?? 0
  const pendingCount = pendingCorrections?.length ?? 0

  const totalWorkHours = attendance
    ? (attendance.reduce((sum, r) => sum + (r.totalWorkDuration || 0), 0) / 60).toFixed(0)
    : 0

  const totalLateDays = attendance
    ? attendance.reduce((sum, r) => sum + (r.lateDays || 0), 0)
    : 0

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800">管理總覽</h2>
        <p className="text-sm text-slate-400 mt-1">{currentMonth} 月度數據</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="出勤員工數"
          value={totalEmployees}
          color="bg-emerald-500"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          icon={Clock}
          label="總工時 (hr)"
          value={totalWorkHours}
          color="bg-sky-500"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          icon={CalendarSearch}
          label="遲到天數合計"
          value={totalLateDays}
          color="bg-orange-500"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          icon={CheckCircle2}
          label="待審核補卡"
          value={pendingCount}
          color="bg-red-500"
          onClick={() => navigate('/corrections')}
        />
      </div>

      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-orange-500" />
            <div>
              <p className="font-bold text-slate-700">有 {pendingCount} 筆補打卡申請待審核</p>
              <button
                onClick={() => navigate('/corrections')}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 mt-1"
              >
                前往審核 &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
