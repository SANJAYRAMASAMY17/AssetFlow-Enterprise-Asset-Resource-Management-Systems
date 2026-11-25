import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function CreateTransferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    assetId: '',
    reason: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await apiClient.get('/assets', { params: { limit: 100 } })).data
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/transfers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      navigate('/org/transfers');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to request transfer');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/org/transfers" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Request Transfer</h1>
          <p className="mt-1 text-sm text-gray-500">Request ownership or assignment of an asset</p>
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
              {assets?.items?.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.assetTag}) - {a.status}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea rows={3} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to="/org/transfers" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
