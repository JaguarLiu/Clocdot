import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { fetcher, reviewCorrectionRequest } from '../services/api.js'

function parseReason(reason) {
  const match = reason.match(/^\[(.+?)\]\s*(\d{1,2}:\d{2})\s*-\s*(.*)$/)
  if (match) return { type: match[1], time: match[2], detail: match[3] }
  return { type: '--', time: '--', detail: reason }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function Corrections() {
  const [tab, setTab] = useState('pending')
  const { data: requests, mutate } = useSWR(`/admin/correction-requests?status=${tab}`, fetcher)
  const [processing, setProcessing] = useState(null)

  async function handleReview(id, status) {
    setProcessing(id)
    try {
      await reviewCorrectionRequest(id, status)
      mutate()
    } catch (err) {
      alert(err?.message || '操作失敗')
    } finally {
      setProcessing(null)
    }
  }

  const list = requests ?? []

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle2 size={28} className="text-orange-500" />
        <div>
          <h2 className="text-2xl font-black text-slate-800">補打卡審核</h2>
          <p className="text-sm text-slate-400 mt-0.5">審核員工提交的補打卡申請</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: 'pending', label: '待審核' },
          { key: 'approved', label: '已通過' },
          { key: 'rejected', label: '已駁回' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
              tab === t.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {list.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-bold text-sm">
            {tab === 'pending' ? '目前沒有待審核的申請' : '沒有相關紀錄'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">員工</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">日期</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">類型</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">時間</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">原因</th>
                  {tab === 'pending' && (
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">操作</th>
                  )}
                  {tab !== 'pending' && (
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">狀態</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((req) => {
                  const parsed = parseReason(req.reason)
                  const userName = req.attendance?.user?.name || req.attendance?.user?.email || '--'
                  const workDate = req.attendance?.workDate ? formatDate(req.attendance.workDate) : '--'
                  const isProcessing = processing === req.id

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">{userName}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-mono">{workDate}</td>
                      <td className="px-5 py-4">
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                          {parsed.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-mono">{parsed.time}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 max-w-xs truncate">{parsed.detail}</td>
                      {tab === 'pending' ? (
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleReview(req.id, 'approved')}
                              disabled={isProcessing}
                              className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                              通過
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'rejected')}
                              disabled={isProcessing}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              駁回
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                            tab === 'approved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {tab === 'approved' ? '已通過' : '已駁回'}
                          </span>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
