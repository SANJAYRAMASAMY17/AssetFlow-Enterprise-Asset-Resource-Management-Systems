import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client.ts';
import { History } from 'lucide-react';

export function AllocationHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'ASSET', page],
    queryFn: async () => (await apiClient.get('/activities', { params: { entityType: 'ASSET', page, limit: 15 } })).data
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg mr-4">
          <History className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Allocation History</h1>
          <p className="mt-1 text-sm text-gray-500">Immutable audit log of all asset allocations, transfers, and returns</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <li className="p-4 text-center text-gray-500">Loading...</li>
          ) : data?.items.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No history records found.</li>
          ) : (
            data?.items.map((log: any) => (
              <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</h3>
                      <p className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Asset ID: <span className="font-mono text-xs">{log.entityId}</span>
                    </p>
                    {log.details && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 mt-2">
                        {log.details}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Performed by {log.user?.name} ({log.user?.email})</p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
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
