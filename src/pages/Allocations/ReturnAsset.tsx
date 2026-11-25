import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function ReturnAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    condition: '',
    remarks: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: allocation, isLoading } = useQuery({
    queryKey: ['allocation', id],
    queryFn: async () => {
      const res = await apiClient.get(`/allocations/${id}`);
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/allocations/${id}/return`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate('/org/allocations');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to return asset');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const payload = { ...formData };
    if (!payload.condition) delete (payload as any).condition;
    mutation.mutate(payload);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/org/allocations" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Return Asset</h1>
          <p className="mt-1 text-sm text-gray-500">Record asset return and condition</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Return Condition</label>
            <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
              <option value="">Same as before</option>
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Return Remarks</label>
            <textarea rows={3} value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to="/org/allocations" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Complete Return</button>
          </div>
        </form>
      </div>
    </div>
  );
}
