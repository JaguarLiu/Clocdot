import { useState } from 'react'
import { CalendarSearch, Download } from 'lucide-react'
import { getAdminAttendanceList } from '../services/api.js'

function formatHours(minutes) {
  if (!minutes) return '0.0'
  return (minutes / 60).toFixed(1)
}

export default function Attendance() {
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [month, setMonth] = useState(defaultMonth)
  const [records, setRecords] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleQuery() {
    if (!month) return
    setIsLoading(true)
    try {
      const data = await getAdminAttendanceList(month)
      setRecords(data)
    } catch (err) {
      alert(err?.message || '查詢失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8">
        <CalendarSearch size={28} className="text-emerald-500" />
        <div>
          <h2 className="text-2xl font-black text-slate-800">月度出勤統計</h2>
          <p className="text-sm text-slate-400 mt-0.5">查看員工出勤記錄與統計數據</p>
        </div>
      </div>

      {/* Query bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex items-end gap-4">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">選擇月份</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>
        <button
          onClick={handleQuery}
          disabled={isLoading || !month}
          className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {/* Results */}
      {records === null ? (
        <div className="text-center py-20 text-slate-300">
          <CalendarSearch size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-bold text-sm">選擇月份後點擊查詢</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <p className="font-bold text-sm">該月份無出勤紀錄</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">共 {records.length} 位員工</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">員工</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">工號</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">出勤天數</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">總工時 (hr)</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">遲到天數</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">早退天數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record, index) => (
                  <tr key={record.user?.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-700">{record.user?.name || '--'}</p>
                      <p className="text-[11px] text-slate-400">{record.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-mono text-slate-500">
                      {record.user?.empNo || '--'}
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-bold text-slate-700 font-mono">
                      {record.attendanceDays}
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-bold text-slate-700 font-mono">
                      {formatHours(record.totalWorkDuration)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-bold font-mono ${record.lateDays > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {record.lateDays}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-bold font-mono ${record.earlyLeaveDays > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {record.earlyLeaveDays}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
