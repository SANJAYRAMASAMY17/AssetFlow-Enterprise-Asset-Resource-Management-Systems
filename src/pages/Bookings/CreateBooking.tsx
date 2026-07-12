import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function CreateBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    assetId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    purpose: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: assets } = useQuery({
    queryKey: ['shared-assets'],
    queryFn: async () => (await apiClient.get('/assets', { params: { isShared: true, limit: 100 } })).data
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/org/bookings');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to create booking');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      setErrorMsg('Please provide start and end date/time');
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    mutation.mutate({
      assetId: formData.assetId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      purpose: formData.purpose
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/org/bookings" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Booking</h1>
          <p className="mt-1 text-sm text-gray-500">Reserve a shared resource</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Resource *</label>
            <select required value={formData.assetId} onChange={e => setFormData({ ...formData, assetId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
              <option value="">Select Resource</option>
              {assets?.items?.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
              ))}
            </select>
            {assets?.items?.length === 0 && <p className="text-xs text-red-500 mt-1">No shared resources found.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time *</label>
              <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" min={formData.startDate || new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time *</label>
              <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <textarea rows={3} value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="e.g. Client presentation, Site visit..." />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to="/org/bookings" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
