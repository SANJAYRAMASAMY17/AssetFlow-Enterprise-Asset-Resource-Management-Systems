import toast from 'react-hot-toast';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft, Check, X, Calendar, Edit2 } from 'lucide-react';

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ startDate: '', startTime: '', endDate: '', endTime: '' });
  const [errorMsg, setErrorMsg] = useState('');

  console.log('BookingDetails rendering, id:', id);
  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => (await apiClient.get(`/bookings/${id}`)).data
  });

  const approveMutation = useMutation({
    mutationFn: () => apiClient.patch(`/bookings/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  const rejectMutation = useMutation({
    mutationFn: () => apiClient.patch(`/bookings/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.patch(`/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });

  const rescheduleMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/bookings/${id}/reschedule`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      setIsRescheduling(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.error || 'Failed to reschedule')
  });

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const start = new Date(`${rescheduleData.startDate}T${rescheduleData.startTime}`);
    const end = new Date(`${rescheduleData.endDate}T${rescheduleData.endTime}`);
    rescheduleMutation.mutate({ startTime: start.toISOString(), endTime: end.toISOString() });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading booking: {(error as Error).message}</div>;
  if (!booking) { console.log('booking object is falsy', booking); return <div className="p-8 text-center text-red-500">Booking not found.</div>; }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/org/bookings" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Booking Details</h1>
            <p className="mt-1 text-sm text-gray-500">Reservation for {booking.asset.name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {booking.status === 'PENDING' && (
            <>
              <button onClick={() => { approveMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" /> Approve
              </button>
              <button onClick={() => { rejectMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                <X className="w-4 h-4 mr-2" /> Reject
              </button>
            </>
          )}
          {['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status) && (
            <button onClick={() => { cancelMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-md hover:bg-red-50">
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Resource</dt>
              <dd className="mt-1 text-sm text-gray-900">{booking.asset.name} ({booking.asset.assetTag})</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === 'APPROVED' || booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Reserved By</dt>
              <dd className="mt-1 text-sm text-gray-900">{booking.user.name} ({booking.user.email})</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Purpose</dt>
              <dd className="mt-1 text-sm text-gray-900">{booking.purpose || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center justify-between">
                Schedule
                {['PENDING', 'APPROVED'].includes(booking.status) && !isRescheduling && (
                  <button onClick={() => {
                    setRescheduleData({
                      startDate: new Date(booking.startTime).toISOString().split('T')[0],
                      startTime: new Date(booking.startTime).toISOString().split('T')[1].substring(0,5),
                      endDate: new Date(booking.endTime).toISOString().split('T')[0],
                      endTime: new Date(booking.endTime).toISOString().split('T')[1].substring(0,5),
                    });
                    setIsRescheduling(true);
                  }} className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Edit2 className="w-3 h-3 mr-1" /> Reschedule
                  </button>
                )}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Start: {new Date(booking.startTime).toLocaleString()}</div>
                <div className="flex items-center mt-1"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> End: {new Date(booking.endTime).toLocaleString()}</div>
              </dd>
            </div>
            {booking.approver && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Approver</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.approver.name}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {isRescheduling && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Booking</h3>
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>}
          <form onSubmit={handleReschedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Start Date</label>
                <input type="date" required value={rescheduleData.startDate} onChange={e => setRescheduleData({ ...rescheduleData, startDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Start Time</label>
                <input type="time" required value={rescheduleData.startTime} onChange={e => setRescheduleData({ ...rescheduleData, startTime: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New End Date</label>
                <input type="date" required value={rescheduleData.endDate} onChange={e => setRescheduleData({ ...rescheduleData, endDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New End Time</label>
                <input type="time" required value={rescheduleData.endTime} onChange={e => setRescheduleData({ ...rescheduleData, endTime: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsRescheduling(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">Cancel</button>
              <button type="submit" disabled={rescheduleMutation.isPending} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
