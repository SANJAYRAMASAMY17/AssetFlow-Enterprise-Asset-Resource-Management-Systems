import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft, Check, X, Wrench, Play, CheckCircle2, UserPlus, FileText } from 'lucide-react';

export function MaintenanceDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignData, setAssignData] = useState({ technicianId: '', estimatedCompletionDate: '', cost: '', notes: '' });
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionData, setResolutionData] = useState({ resolution: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: request, isLoading } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => (await apiClient.get(`/maintenance/${id}`)).data
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => (await apiClient.get('/employees', { params: { role: 'ASSET_MANAGER', limit: 100 } })).data, // Assuming asset managers can be technicians, or anyone
    enabled: isAssigning
  });

  const approveMutation = useMutation({ mutationFn: () => apiClient.post(`/maintenance/${id}/approve`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', id] }) });
  const rejectMutation = useMutation({ mutationFn: () => apiClient.post(`/maintenance/${id}/reject`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', id] }) });
  const startMutation = useMutation({ mutationFn: () => apiClient.post(`/maintenance/${id}/start`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', id] }) });
  const closeMutation = useMutation({ mutationFn: () => apiClient.post(`/maintenance/${id}/close`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', id] }) });

  const assignMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/maintenance/${id}/assign`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
      setIsAssigning(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.error || 'Failed to assign')
  });

  const resolveMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/maintenance/${id}/resolve`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
      setIsResolving(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.error || 'Failed to resolve')
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!request) return <div className="p-8 text-center text-red-500">Maintenance request not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/org/maintenance" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Maintenance Details</h1>
            <p className="mt-1 text-sm text-gray-500">Request #{id?.substring(0,8)}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {request.status === 'PENDING' && (
            <>
              <button onClick={() => { approveMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" /> Approve
              </button>
              <button onClick={() => { rejectMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                <X className="w-4 h-4 mr-2" /> Reject
              </button>
            </>
          )}
          {request.status === 'APPROVED' && (
            <button onClick={() => setIsAssigning(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" /> Assign Technician
            </button>
          )}
          {request.status === 'TECHNICIAN_ASSIGNED' && (
            <button onClick={() => startMutation.mutate()} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">
              <Play className="w-4 h-4 mr-2" /> Start Maintenance
            </button>
          )}
          {request.status === 'IN_PROGRESS' && (
            <button onClick={() => setIsResolving(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
              <Wrench className="w-4 h-4 mr-2" /> Mark Resolved
            </button>
          )}
          {request.status === 'RESOLVED' && (
            <button onClick={() => { closeMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Close Maintenance
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Request Info</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ['RESOLVED', 'CLOSED'].includes(request.status) ? 'bg-green-100 text-green-800' :
                      ['PENDING'].includes(request.status) ? 'bg-yellow-100 text-yellow-800' :
                      ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'].includes(request.status) ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.asset.name} ({request.asset.assetTag})</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Requested By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.requester.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.priority}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Problem Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{request.description}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Maintenance Execution</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Technician</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.technician?.name || 'Not assigned yet'}</dd>
                </div>
                {request.estimatedCompletionDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Est. Completion</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(request.estimatedCompletionDate).toLocaleDateString()}</dd>
                  </div>
                )}
                {request.cost !== null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
                    <dd className="mt-1 text-sm text-gray-900">${request.cost.toFixed(2)}</dd>
                  </div>
                )}
                {request.notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Technician Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.notes}</dd>
                  </div>
                )}
                {request.resolution && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <dt className="text-sm font-medium text-gray-900 flex items-center mb-1">
                      <FileText className="w-4 h-4 mr-1 text-gray-500" /> Resolution
                    </dt>
                    <dd className="text-sm text-gray-700 whitespace-pre-wrap">{request.resolution}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {isAssigning && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Technician</h3>
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>}
          <form onSubmit={(e) => {
            e.preventDefault();
            assignMutation.mutate({
              technicianId: assignData.technicianId,
              estimatedCompletionDate: assignData.estimatedCompletionDate,
              cost: assignData.cost ? parseFloat(assignData.cost) : undefined,
              notes: assignData.notes
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Technician *</label>
                <select required value={assignData.technicianId} onChange={e => setAssignData({ ...assignData, technicianId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select Technician</option>
                  {technicians?.items?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Est. Completion Date *</label>
                <input type="date" required value={assignData.estimatedCompletionDate} onChange={e => setAssignData({ ...assignData, estimatedCompletionDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
              <input type="number" step="0.01" value={assignData.cost} onChange={e => setAssignData({ ...assignData, cost: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Notes</label>
              <textarea rows={2} value={assignData.notes} onChange={e => setAssignData({ ...assignData, notes: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsAssigning(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">Cancel</button>
              <button type="submit" disabled={assignMutation.isPending} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md">Assign</button>
            </div>
          </form>
        </div>
      )}

      {isResolving && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mark as Resolved</h3>
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{errorMsg}</div>}
          <form onSubmit={(e) => {
            e.preventDefault();
            resolveMutation.mutate(resolutionData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Resolution Details *</label>
              <textarea required rows={4} value={resolutionData.resolution} onChange={e => setResolutionData({ resolution: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Describe how the problem was resolved..." />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsResolving(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">Cancel</button>
              <button type="submit" disabled={resolveMutation.isPending} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md">Submit Resolution</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
