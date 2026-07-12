import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft } from 'lucide-react';

export function EditAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: asset, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}`)).data
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await apiClient.get('/categories')).data.items
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await apiClient.get('/departments')).data.items
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        assetTag: asset.assetTag,
        serialNumber: asset.serialNumber || '',
        categoryId: asset.categoryId || '',
        departmentId: asset.departmentId || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        purchaseCost: asset.purchaseCost || '',
        vendor: asset.vendor || '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
        condition: asset.condition || 'NEW',
        description: asset.description || '',
        isShared: asset.isShared,
        status: asset.status,
      });
    }
  }, [asset]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.put(`/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate(`/org/assets/${id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to update asset');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const payload = { ...formData };
    if (!payload.serialNumber) payload.serialNumber = null;
    if (!payload.vendor) payload.vendor = null;
    if (!payload.purchaseDate) payload.purchaseDate = null;
    if (!payload.warrantyExpiry) payload.warrantyExpiry = null;
    if (!payload.purchaseCost) payload.purchaseCost = null;
    if (!payload.departmentId) payload.departmentId = null;

    mutation.mutate(payload);
  };

  if (assetLoading || !formData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to={`/org/assets/${id}`} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Asset</h1>
          <p className="mt-1 text-sm text-gray-500">Update asset information</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Asset Tag *</label>
              <input required type="text" value={formData.assetTag} onChange={e => setFormData({ ...formData, assetTag: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input type="text" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="AVAILABLE">Available</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="RESERVED">Reserved</option>
                <option value="UNDER_MAINTENANCE">Maintenance</option>
                <option value="LOST">Lost</option>
                <option value="RETIRED">Retired</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="">Select Category</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="">Unassigned</option>
                {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <input type="text" value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
              <input type="date" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" max={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Cost</label>
              <input type="number" min="0" step="0.01" value={formData.purchaseCost} onChange={e => setFormData({ ...formData, purchaseCost: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
              <input type="date" value={formData.warrantyExpiry} onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" min={formData.purchaseDate || undefined} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="NEW">New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>

          <div className="flex items-center">
            <input id="isShared" type="checkbox" checked={formData.isShared} onChange={e => setFormData({ ...formData, isShared: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
            <label htmlFor="isShared" className="ml-2 block text-sm text-gray-900">
              Shared Resource (Available for booking by multiple users)
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link to={`/org/assets/${id}`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
