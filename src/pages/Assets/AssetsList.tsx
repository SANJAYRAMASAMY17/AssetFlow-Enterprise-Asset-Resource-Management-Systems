import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Edit2 } from 'lucide-react';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  serialNumber: string | null;
  status: string;
  department?: { id: string, name: string };
  category?: { id: string, name: string };
  purchaseCost?: number;
  condition?: string;
}

export function AssetsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data, isLoading, error } = useQuery<{ items: Asset[], totalPages: number, page: number }>({
    queryKey: ['assets', search, page, statusFilter, sortBy],
    queryFn: async () => {
      const res = await apiClient.get('/assets', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          sortBy,
          page,
          limit: 10
        }
      });
      return res.data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ALLOCATED': return 'bg-blue-100 text-blue-800';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      case 'RETIRED': return 'bg-gray-100 text-gray-800';
      case 'DISPOSED': return 'bg-gray-800 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
          <p className="mt-1 text-sm text-gray-500">Manage organizational assets</p>
        </div>
        <Link 
          to="/org/assets/create"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Link>
      </div>

      <div className="mb-6 flex space-x-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by tag, name, serial..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ALLOCATED">Allocated</option>
          <option value="RESERVED">Reserved</option>
          <option value="UNDER_MAINTENANCE">Maintenance</option>
          <option value="LOST">Lost</option>
          <option value="RETIRED">Retired</option>
          <option value="DISPOSED">Disposed</option>
        </select>
        <select 
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="purchaseCost">Highest Cost</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading assets...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">Failed to load assets</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.items.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                        <span className="text-xs text-gray-500">{asset.assetTag} {asset.serialNumber ? `• SN: ${asset.serialNumber}` : ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.category?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.department?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/org/assets/${asset.id}`} className="text-gray-600 hover:text-gray-900 mr-4" title="View Details">
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <Link to={`/org/assets/${asset.id}/edit`} className="text-gray-600 hover:text-gray-900" title="Edit">
                        <Edit2 className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No assets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">Page {page} of {data.totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
