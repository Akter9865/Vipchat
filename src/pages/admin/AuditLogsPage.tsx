import React, { useState, useEffect } from 'react';
import { ShieldAlert, Shield, Clock, Search, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/audit-logs');
      if (res.ok) setLogs(await res.json());
    } catch (e) {}
    finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = search.trim()
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.targetType.toLowerCase().includes(search.toLowerCase()) ||
          (l.user?.fullName && l.user.fullName.toLowerCase().includes(search.toLowerCase()))
      )
    : logs;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-slate-400">
            Immutable forensic log of admin actions, logins, session revocations, and data exports
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit logs..."
            className="w-full bg-[#14141a] border border-[#242430] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/70"
          />
        </div>
      </div>

      <div className="bg-[#14141a] border border-[#242430] rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181822] text-slate-400 font-bold border-b border-[#242430]">
            <tr>
              <th className="p-3">User & Identity</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Target Resource</th>
              <th className="p-3">IP / Metadata</th>
              <th className="p-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e28]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Loading security logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No matching audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1a1a24] transition">
                  <td className="p-3">
                    <div className="font-bold text-white">
                      {log.user?.fullName || 'System Event'}
                    </div>
                    <div className="text-[10px] text-slate-500">{log.user?.email || 'N/A'}</div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">
                    {log.targetType} {log.targetId ? `(${log.targetId.slice(0, 8)}...)` : ''}
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    <code>{log.ipAddress || '127.0.0.1'}</code>
                  </td>
                  <td className="p-3 text-right text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
