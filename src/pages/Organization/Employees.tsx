import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Power, PowerOff, Building } from 'lucide-react';
import { apiClient } from '../../api/client.ts';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department?: { id: string, name: string };
}

interface Department {
  id: string;
  name: string;
}

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  
  const { data: employeeData, isLoading, error } = useQuery<{ items: Employee[], totalPages: number, page: number }>({
    queryKey: ['employees', search, page],
    queryFn: async () => {
      const res = await apiClient.get('/employees', { 
        params: { search: search || undefined, page, limit: 10 } 
      });
      return res.data;
    }
  });

  const employees = employeeData?.items;

  const { data: departmentData } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: async () => {
      const res = await apiClient.get('/departments', { params: { limit: 1000 } });
      return res.data;
    }
  });

  const departments = departmentData?.items || [];

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { id: string, isActive: boolean }) => 
      data.isActive 
        ? apiClient.put(`/employees/${data.id}/deactivate`)
        : apiClient.put(`/employees/${data.id}/reactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });

  if (isLoading) return <div className="p-8">Loading employees...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading employees.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage access and roles</p>
        </div>
        <div className="w-64">
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees?.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department?.name || 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => { setEditingId(emp.id); setIsRoleModalOpen(true); }} 
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    title="Change Role"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setEditingId(emp.id); setIsDeptModalOpen(true); }} 
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    title="Assign Department"
                  >
                    <Building className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { toggleStatusMutation.mutate({ id: emp.id, isActive: emp.isActive }); }} 
                    className={emp.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                    title={emp.isActive ? "Deactivate" : "Reactivate"}
                  >
                    {emp.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employeeData && employeeData.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page} of {employeeData.totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(employeeData.totalPages, p + 1))}
            disabled={page === employeeData.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isRoleModalOpen && (
        <RoleModal 
          isOpen={isRoleModalOpen} 
          onClose={() => setIsRoleModalOpen(false)} 
          employeeId={editingId!} 
        />
      )}
      
      {isDeptModalOpen && (
        <DepartmentAssignmentModal 
          isOpen={isDeptModalOpen} 
          onClose={() => setIsDeptModalOpen(false)} 
          employeeId={editingId!}
          departments={departments || []}
        />
      )}
    </div>
  );
}

function RoleModal({ isOpen, onClose, employeeId }: { isOpen: boolean, onClose: () => void, employeeId: string }) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState('EMPLOYEE');

  useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const res = await apiClient.get(`/employees/${employeeId}`);
      setRole(res.data.role);
      return res.data;
    },
    enabled: !!employeeId
  });

  const mutation = useMutation({
    mutationFn: (data: { role: string }) => apiClient.put(`/employees/${employeeId}/promote`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-900/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-4">Change Employee Role</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ role });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none">
                <option value="EMPLOYEE">Employee</option>
                <option value="ASSET_MANAGER">Asset Manager</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
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

function DepartmentAssignmentModal({ isOpen, onClose, employeeId, departments }: { isOpen: boolean, onClose: () => void, employeeId: string, departments: Department[] }) {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState('');

  useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const res = await apiClient.get(`/employees/${employeeId}`);
      setDepartmentId(res.data.departmentId || '');
      return res.data;
    },
    enabled: !!employeeId
  });

  const mutation = useMutation({
    mutationFn: (data: { departmentId: string | null }) => apiClient.put(`/employees/${employeeId}/department`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-900/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-4">Assign Department</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ departmentId: departmentId || null });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none">
                <option value="">Unassigned</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
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
