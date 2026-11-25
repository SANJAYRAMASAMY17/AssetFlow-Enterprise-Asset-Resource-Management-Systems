import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { Plus, Wrench } from 'lucide-react';

export function MaintenanceList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', status, page],
    queryFn: async () => (await apiClient.get('/maintenance', {
      params: { status: status || undefined, page, limit: 10 }
    })).data
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage asset repairs and service requests</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/org/maintenance/create" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Raise Request
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
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved (Awaiting Tech)</option>
          <option value="TECHNICIAN_ASSIGNED">Technician Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Problem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No maintenance requests found.</td></tr>
            ) : (
              data?.items.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.asset.name}</div>
                    <div className="text-xs text-gray-500">{req.asset.assetTag}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{req.description}</div>
                    <div className="text-xs text-gray-500 mt-1">By {req.requester.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      req.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                      req.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      req.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ['RESOLVED', 'CLOSED'].includes(req.status) ? 'bg-green-100 text-green-800' :
                      ['PENDING'].includes(req.status) ? 'bg-yellow-100 text-yellow-800' :
                      ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'].includes(req.status) ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/org/maintenance/${req.id}`} className="text-gray-600 hover:text-gray-900">View Details</Link>
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
