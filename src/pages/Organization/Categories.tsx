import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client.ts';

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: { assets: number };
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['categories', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/categories', { params: { page, limit: 10, search } });
      return res.data;
    }
  });

  const categories = categoryData?.items || [];

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  if (isLoading) return <div className="p-8">Loading categories...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading categories.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Asset Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Manage types of assets</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input 
          type="text" 
          placeholder="Search categories..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 w-64"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat: Category) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat._count?.assets || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setEditingId(cat.id); setIsModalOpen(true); }} className="text-gray-600 hover:text-gray-900 mr-4">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { deactivateMutation.mutate(cat.id); }} 
                    className="text-red-600 hover:text-red-900"
                    disabled={cat._count?.assets > 0}
                    title={cat._count?.assets > 0 ? "Cannot delete category with assets" : ""}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {categoryData && categoryData.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page} of {categoryData.totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(categoryData.totalPages, p + 1))}
            disabled={page === categoryData.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <CategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          categoryId={editingId} 
        />
      )}
    </div>
  );
}

function CategoryModal({ isOpen, onClose, categoryId }: { isOpen: boolean, onClose: () => void, categoryId: string | null }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const res = await apiClient.get(`/categories/${categoryId}`);
      setName(res.data.name);
      setDescription(res.data.description || '');
      return res.data;
    },
    enabled: !!categoryId
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (categoryId) {
        return apiClient.put(`/categories/${categoryId}`, data);
      }
      return apiClient.post('/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-900/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-4">{categoryId ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ name, description });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
