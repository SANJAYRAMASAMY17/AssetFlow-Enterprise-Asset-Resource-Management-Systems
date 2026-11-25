import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, PackageX, ScanLine } from 'lucide-react';

export function AuditDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'discrepancies'>('pending');
  const [verifyData, setVerifyData] = useState<{ itemId: string | null, status: string, notes: string }>({ itemId: null, status: 'VERIFIED', notes: '' });

  const { data: cycle, isLoading } = useQuery({
    queryKey: ['audits', id],
    queryFn: async () => (await apiClient.get(`/audits/${id}`)).data
  });

  const verifyMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/audits/items/${data.itemId}/verify`, { status: data.status, notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits', id] });
      setVerifyData({ itemId: null, status: 'VERIFIED', notes: '' });
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => apiClient.post(`/audits/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits', id] });
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!cycle) return <div className="p-8 text-center text-red-500">Audit cycle not found.</div>;

  const pendingItems = cycle.auditItems.filter((i: any) => i.status === 'PENDING');
  const verifiedItems = cycle.auditItems.filter((i: any) => i.status === 'VERIFIED');
  const discrepancyItems = cycle.auditItems.filter((i: any) => ['MISSING', 'DAMAGED', 'RETIRED'].includes(i.status));

  const itemsToShow = activeTab === 'pending' ? pendingItems : activeTab === 'verified' ? verifiedItems : discrepancyItems;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/org/audits" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{cycle.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(cycle.startDate).toLocaleDateString()} {cycle.endDate && `- ${new Date(cycle.endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {cycle.status !== 'COMPLETED' && pendingItems.length === 0 && (
            <button onClick={() => { closeMutation.mutate(); }} className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
              Close Audit Cycle
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Assets</div>
          <div className="text-2xl font-semibold text-gray-900">{cycle.auditItems.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('pending')}>
          <div className="text-sm font-medium text-gray-500 mb-1">Pending</div>
          <div className={`text-2xl font-semibold ${activeTab === 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>{pendingItems.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('verified')}>
          <div className="text-sm font-medium text-green-600 mb-1">Verified OK</div>
          <div className={`text-2xl font-semibold ${activeTab === 'verified' ? 'text-green-600' : 'text-gray-400'}`}>{verifiedItems.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('discrepancies')}>
          <div className="text-sm font-medium text-red-600 mb-1">Discrepancies</div>
          <div className={`text-2xl font-semibold ${activeTab === 'discrepancies' ? 'text-red-600' : 'text-gray-400'}`}>{discrepancyItems.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === 'pending' ? 'Assets to Verify' : activeTab === 'verified' ? 'Verified Assets' : 'Discrepancy Report'}
          </h2>
          {activeTab === 'discrepancies' && discrepancyItems.length > 0 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Export Report</button>
          )}
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {activeTab !== 'pending' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor Notes</th>}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemsToShow.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No items found.</td></tr>
            ) : (
              itemsToShow.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.asset.name}</div>
                    <div className="text-xs text-gray-500">{item.asset.assetTag}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'PENDING' ? <span className="text-gray-400 text-sm">Pending</span> :
                     item.status === 'VERIFIED' ? <span className="inline-flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1"/> Verified</span> :
                     item.status === 'MISSING' ? <span className="inline-flex items-center text-red-600 text-sm"><XCircle className="w-4 h-4 mr-1"/> Missing</span> :
                     item.status === 'DAMAGED' ? <span className="inline-flex items-center text-orange-600 text-sm"><AlertTriangle className="w-4 h-4 mr-1"/> Damaged</span> :
                     <span className="inline-flex items-center text-gray-600 text-sm"><PackageX className="w-4 h-4 mr-1"/> Retired</span>
                    }
                  </td>
                  {activeTab !== 'pending' && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.notes || '-'}</div>
                      {item.auditedBy && <div className="text-xs text-gray-500 mt-1">by {item.auditedBy.name}</div>}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {cycle.status !== 'COMPLETED' && (
                      <button onClick={() => setVerifyData({ itemId: item.id, status: item.status === 'PENDING' ? 'VERIFIED' : item.status, notes: item.notes || '' })} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        {item.status === 'PENDING' ? 'Verify' : 'Edit'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {verifyData.itemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Asset</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              verifyMutation.mutate(verifyData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Audit Status</label>
                <select value={verifyData.status} onChange={e => setVerifyData({ ...verifyData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none">
                  <option value="VERIFIED">Verified (Present & Good Condition)</option>
                  <option value="MISSING">Missing</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="RETIRED">Retired (To be disposed)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea rows={3} value={verifyData.notes} onChange={e => setVerifyData({ ...verifyData, notes: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" placeholder="Add context regarding the status..." />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setVerifyData({ itemId: null, status: 'VERIFIED', notes: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={verifyMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800">Save Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
