import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { Plus, History } from 'lucide-react';

export function AllocationsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'ACTIVE' | 'RETURNED' | 'OVERDUE' | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['allocations', status, page],
    queryFn: async () => (await apiClient.get('/allocations', {
      params: { status: status || undefined, page, limit: 10 }
    })).data
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Allocations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage asset assignments and returns</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/org/allocations/history" className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
            <History className="w-4 h-4 mr-2" /> History
          </Link>
          <Link to="/org/allocations/assign" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Assign Asset
          </Link>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <select 
          value={status} 
          onChange={(e: any) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RETURNED">Returned</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Return</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No allocations found.</td></tr>
            ) : (
              data?.items.map((alloc: any) => {
                const expected = alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate) : null;
                const isOverdue = !alloc.returnedAt && expected && expected < new Date();
                const daysOverdue = isOverdue ? Math.floor((new Date().getTime() - expected!.getTime()) / (1000 * 3600 * 24)) : 0;
                
                return (
                  <tr key={alloc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alloc.asset.name}</div>
                      <div className="text-xs text-gray-500">{alloc.asset.assetTag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alloc.user.name}</div>
                      <div className="text-xs text-gray-500">{alloc.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alloc.allocatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expected ? expected.toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alloc.returnedAt ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Returned {new Date(alloc.returnedAt).toLocaleDateString()}
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!alloc.returnedAt && (
                        <Link to={`/org/allocations/${alloc.id}/return`} className="text-blue-600 hover:text-blue-900">
                          Return Asset
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
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
