'use client'


const MOCK_LOADS = [
  { id: 'IF-001', origin: 'Chicago, IL', dest: 'Austin, TX', rate: 2450, status: 'open', broker: 'N. Bond' },
  { id: 'IF-002', origin: 'LA, CA', dest: 'Phoenix, AZ', rate: 1890, status: 'bidding', broker: 'Thai Logistics' },
  { id: 'IF-003', origin: 'Detroit, MI', dest: 'Atlanta, GA', rate: 2100, status: 'open', broker: 'N. Bond' },
]

export function LoadBoardTab() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-white">Load Board</h1>
      <p className="mt-1 text-sm text-white/60">Real-time grid. Brokers post loads. Carriers place bids. On accept, load moves to Carrier Active Loads.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-divider">
        <table className="min-w-full divide-y divide-divider">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Load</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Origin → Dest</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {MOCK_LOADS.map((load) => (
              <tr key={load.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-sm font-medium text-white">{load.id}</td>
                <td className="px-4 py-3 text-sm text-white/80">{load.origin} → {load.dest}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">${load.rate.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-surface px-2 py-0.5 text-xs text-white/80">{load.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90">
                    Place Bid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
