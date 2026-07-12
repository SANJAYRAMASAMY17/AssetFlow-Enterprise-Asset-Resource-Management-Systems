import toast from 'react-hot-toast';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { Calendar as CalendarIcon, Plus, Check, X } from 'lucide-react';

export function BookingsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | ''>('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', status, page],
    queryFn: async () => (await apiClient.get('/bookings', {
      params: { status: status || undefined, page, limit: 10 }
    })).data
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/bookings/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/bookings/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resource Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage reservations for shared assets like meeting rooms and vehicles</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/org/bookings/calendar" className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
            <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
          </Link>
          <Link to="/org/bookings/create" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Create Booking
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
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No bookings found.</td></tr>
            ) : (
              data?.items.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.asset.name}</div>
                    <div className="text-xs text-gray-500">{booking.asset.assetTag}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.user.name}</div>
                    <div className="text-xs text-gray-500">{booking.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(booking.startTime).toLocaleString()}</div>
                    <div>to {new Date(booking.endTime).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'APPROVED' || booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/org/bookings/${booking.id}`} className="text-gray-600 hover:text-gray-900 mr-4">View</Link>
                    {booking.status === 'PENDING' && (
                      <>
                        <button onClick={() => { approveMutation.mutate(booking.id); }} className="text-green-600 hover:text-green-900 mr-3" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { rejectMutation.mutate(booking.id); }} className="text-red-600 hover:text-red-900" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  
                    {['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status) && (
                        <button onClick={() => { cancelMutation.mutate(booking.id); }} className="text-gray-400 hover:text-gray-600 ml-3" title="Cancel">
                          Cancel
                        </button>
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
