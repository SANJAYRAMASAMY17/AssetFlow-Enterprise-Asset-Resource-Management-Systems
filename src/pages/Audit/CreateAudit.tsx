import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function CreateAuditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    auditorIds: [] as string[]
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => (await apiClient.get('/departments', { params: { limit: 100 } })).data });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await apiClient.get('/locations', { params: { limit: 100 } })).data });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: async () => (await apiClient.get('/employees', { params: { limit: 100 } })).data });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/audits', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      navigate('/org/audits');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to create audit cycle');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate({
      ...formData,
      departmentId: formData.departmentId || undefined,
      locationId: formData.locationId || undefined,
      endDate: formData.endDate || undefined
    });
  };

  const toggleAuditor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      auditorIds: prev.auditorIds.includes(id) 
        ? prev.auditorIds.filter(aid => aid !== id)
        : [...prev.auditorIds, id]
    }));
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/org/audits" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Audit Cycle</h1>
          <p className="mt-1 text-sm text-gray-500">Define a new physical asset verification process</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Audit Name *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="e.g. Q3 Annual Asset Verification" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Department (Optional)</label>
              <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">All Departments</option>
                {departments?.items?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Location (Optional)</label>
              <select value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">All Locations</option>
                {locations?.items?.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Auditors</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
              {employees?.items?.map((emp: any) => (
                <label key={emp.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.auditorIds.includes(emp.id)}
                    onChange={() => toggleAuditor(emp.id)}
                    className="rounded text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-900">{emp.name} <span className="text-gray-500">({emp.role})</span></span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to="/org/audits" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Create Cycle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
