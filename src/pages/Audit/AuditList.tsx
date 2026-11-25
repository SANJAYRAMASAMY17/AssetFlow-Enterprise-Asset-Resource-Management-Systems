import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { Plus, ClipboardCheck } from 'lucide-react';

export function AuditList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['audits', status, page],
    queryFn: async () => (await apiClient.get('/audits', {
      params: { status: status || undefined, page, limit: 10 }
    })).data
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Asset Audits</h1>
          <p className="mt-1 text-sm text-gray-500">Manage physical asset verification cycles</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/org/audits/create" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> New Audit Cycle
          </Link>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <select 
          value={status} 
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No audit cycles found.</td></tr>
            ) : (
              data?.items.map((cycle: any) => (
                <tr key={cycle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cycle.name}</div>
                    <div className="text-xs text-gray-500">{cycle.department?.name || 'All Depts'} • {cycle.location?.name || 'All Locations'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cycle.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      cycle.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cycle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cycle._count.auditItems} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(cycle.startDate).toLocaleDateString()}</div>
                    {cycle.endDate && <div className="text-xs text-gray-500">to {new Date(cycle.endDate).toLocaleDateString()}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/org/audits/${cycle.id}`} className="text-gray-600 hover:text-gray-900">View Details</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm">Previous</button>
          <span className="text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
