import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client.ts';

interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: { users: number };
}

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: departmentData, isLoading, error } = useQuery({
    queryKey: ['departments', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/departments', { params: { page, limit: 10, search } });
      return res.data;
    }
  });

  const departments = departmentData?.items || [];

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });

  if (isLoading) return <div className="p-8">Loading departments...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading departments.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage organizational units</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input 
          type="text" 
          placeholder="Search departments..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((dept: any) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.head?.name || 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept._count?.users || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setEditingId(dept.id); setIsModalOpen(true); }} className="text-gray-600 hover:text-gray-900 mr-4">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { deactivateMutation.mutate(dept.id); }} 
                    className="text-red-600 hover:text-red-900"
                    disabled={dept._count?.users > 0}
                    title={dept._count?.users > 0 ? "Cannot delete department with employees" : ""}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {departmentData && departmentData.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page} of {departmentData.totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(departmentData.totalPages, p + 1))}
            disabled={page === departmentData.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <DepartmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          departmentId={editingId} 
        />
      )}
    </div>
  );
}

function DepartmentModal({ isOpen, onClose, departmentId }: { isOpen: boolean, onClose: () => void, departmentId: string | null }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headId, setHeadId] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => (await apiClient.get('/employees', { params: { limit: 1000 } })).data.items
  });

  useQuery({
    queryKey: ['department', departmentId],
    queryFn: async () => {
      const res = await apiClient.get(`/departments/${departmentId}`);
      setName(res.data.name);
      setDescription(res.data.description || '');
      setHeadId(res.data.headId || '');
      return res.data;
    },
    enabled: !!departmentId
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (departmentId) {
        return apiClient.put(`/departments/${departmentId}`, data);
      }
      return apiClient.post('/departments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-900/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-4">{departmentId ? 'Edit Department' : 'Add Department'}</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ name, description, headId: headId || null });
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Department Head</label>
              <select value={headId} onChange={e => setHeadId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="">Unassigned</option>
                {employees?.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
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
