import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ArrowLeft, Edit2, QrCode, Upload, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase.ts';
import { v4 as uuidv4 } from 'uuid';

export function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}`)).data
  });

  const { data: qrData } = useQuery({
    queryKey: ['asset-qr', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/qrcode`)).data
  });

  const updateAssetMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(`/assets/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asset', id] })
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate('/org/assets');
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${asset.assetTag}/${fileName}`;
      
      const token = localStorage.getItem('auth_token');
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
          headers: {
            'x-custom-auth': `Bearer ${token}`
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (type === 'image') {
        await updateAssetMutation.mutateAsync({ imageUrl: publicUrl });
      } else {
        const docs = [...(asset.documents || []), publicUrl];
        await updateAssetMutation.mutateAsync({ documents: docs });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeDocument = async (docUrl: string) => {
    
    const docs = asset.documents.filter((d: string) => d !== docUrl);
    await updateAssetMutation.mutateAsync({ documents: docs });
  };

  if (isLoading) return <div className="p-8">Loading asset details...</div>;
  if (error || !asset) return <div className="p-8 text-red-600">Failed to load asset.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Link to="/org/assets" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{asset.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{asset.assetTag}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/org/assets/${asset.id}/edit`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Link>
          <button onClick={() => { deleteMutation.mutate(); }} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500 block">Category</span><span className="text-sm font-medium">{asset.category?.name || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Department</span><span className="text-sm font-medium">{asset.department?.name || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Serial Number</span><span className="text-sm font-medium">{asset.serialNumber || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Vendor</span><span className="text-sm font-medium">{asset.vendor || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Purchase Date</span><span className="text-sm font-medium">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Purchase Cost</span><span className="text-sm font-medium">{asset.purchaseCost ? `$${asset.purchaseCost.toFixed(2)}` : '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Warranty Expiry</span><span className="text-sm font-medium">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Condition</span><span className="text-sm font-medium">{asset.condition || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Location</span><span className="text-sm font-medium">{asset.location?.name || '-'}</span></div>
              <div><span className="text-sm text-gray-500 block">Status</span>
                <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {asset.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            {asset.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 block mb-1">Description</span>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{asset.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e => handleFileUpload(e, 'document')} disabled={isUploading} />
                + Add Document
              </label>
            </div>
            {asset.documents && asset.documents.length > 0 ? (
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-md">
                {asset.documents.map((docUrl: string, idx: number) => (
                  <li key={idx} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div className="flex w-0 flex-1 items-center">
                      <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <span className="ml-2 w-0 flex-1 truncate">Document {idx + 1}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0 space-x-3">
                      <a href={docUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:text-blue-500">View</a>
                      <button onClick={() => removeDocument(docUrl)} className="font-medium text-red-600 hover:text-red-500">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No documents attached.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">History</h2>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Allocations</h3>
              {asset.allocations?.length > 0 ? (
                <ul className="text-sm text-gray-600 space-y-2">
                  {asset.allocations.map((a: any) => (
                    <li key={a.id}>
                      Allocated to {a.user.name} on {new Date(a.allocatedAt).toLocaleDateString()}
                      {a.returnedAt && ` (Returned ${new Date(a.returnedAt).toLocaleDateString()})`}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No allocation history.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h2 className="text-lg font-medium text-gray-900 mb-4 self-start">QR Code</h2>
            {qrData?.qrCode ? (
              <img src={qrData.qrCode} alt="Asset QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-md">
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4 text-center">Scan this code to quickly access asset details.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Photo</h2>
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} disabled={isUploading} />
                {asset.imageUrl ? 'Change' : 'Upload'}
              </label>
            </div>
            {asset.imageUrl ? (
              <img src={asset.imageUrl} alt={asset.name} className="w-full rounded-md" />
            ) : (
              <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-md text-gray-400 flex-col">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">No photo available</span>
              </div>
            )}
            {isUploading && <p className="text-sm text-center text-gray-500 mt-2">Uploading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
