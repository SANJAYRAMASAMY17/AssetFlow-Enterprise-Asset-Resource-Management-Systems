import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function AssignAssetPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    assetId: '',
    userId: '',
    expectedReturnDate: '',
    notes: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: assets } = useQuery({
    queryKey: ['available-assets'],
    queryFn: async () => (await apiClient.get('/assets', { params: { status: 'AVAILABLE', limit: 100 } })).data
  });

  const { data: users } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await apiClient.get('/employees', { params: { limit: 100 } })).data.items
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/allocations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate('/org/allocations');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to assign asset');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const payload = { ...formData };
    if (!payload.expectedReturnDate) delete (payload as any).expectedReturnDate;
    mutation.mutate(payload);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/org/allocations" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Assign Asset</h1>
          <p className="mt-1 text-sm text-gray-500">Allocate an available asset to an employee</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Asset *</label>
            <select required value={formData.assetId} onChange={e => setFormData({ ...formData, assetId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
              <option value="">Select Asset</option>
              {assets?.items?.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employee *</label>
            <select required value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
              <option value="">Select Employee</option>
              {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Return Date</label>
            <input type="date" value={formData.expectedReturnDate} onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" min={new Date().toISOString().split('T')[0]} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to="/org/allocations" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Assign Asset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
