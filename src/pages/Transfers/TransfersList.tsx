import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { Plus } from 'lucide-react';

export function TransfersList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transfers', status, page],
    queryFn: async () => (await apiClient.get('/transfers', {
      params: { status: status || undefined, page, limit: 10 }
    })).data
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/transfers/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/transfers/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transfer Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Manage asset transfer requests between employees</p>
        </div>
        <Link to="/org/transfers/create" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Request Transfer
        </Link>
      </div>

      <div className="mb-6 flex space-x-4">
        <select 
          value={status} 
          onChange={(e: any) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transfer requests found.</td></tr>
            ) : (
              data?.items.map((req: any) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.asset.name}</div>
                    <div className="text-xs text-gray-500">{req.asset.assetTag}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{req.requester.name}</div>
                    <div className="text-xs text-gray-500">{req.requester.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {req.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.status === 'PENDING' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                    ) : req.status === 'APPROVED' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === 'PENDING' && (
                      <>
                        <button onClick={() => { approveMutation.mutate(req.id); }} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                        <button onClick={() => { rejectMutation.mutate(req.id); }} className="text-red-600 hover:text-red-900">Reject</button>
                      </>
                    )}
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
