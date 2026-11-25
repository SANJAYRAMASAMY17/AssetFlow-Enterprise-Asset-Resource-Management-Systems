import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client.ts';

export function NotificationList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, filter, search],
    queryFn: async () => (await apiClient.get('/notifications', { 
        params: { page, limit: 15, isRead: filter === 'unread' ? false : undefined, search: search || undefined } 
    })).data,
    refetchInterval: 60000 // Refetch every minute
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiClient.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-gray-400" />
            Notification Center
          </h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your alerts and reminders</p>
        </div>
        <div className="flex items-center space-x-4">
           {data?.unreadCount > 0 && (
              <button 
                onClick={() => markAllRead.mutate()} 
                disabled={markAllRead.isPending}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All as Read
              </button>
           )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
         <div className="flex space-x-2">
            <button 
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                All
            </button>
            <button 
                onClick={() => { setFilter('unread'); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'unread' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Unread {data?.unreadCount > 0 ? `(${data.unreadCount})` : ''}
            </button>
         </div>
         <div className="w-full sm:w-64">
             <input 
                 type="text" 
                 placeholder="Search notifications..."
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                 className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" 
             />
         </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
             <Bell className="w-8 h-8 mx-auto text-gray-300 mb-3" />
             <p>No notifications found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data?.items.map((notification: any) => (
              <li key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors flex ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                 <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-blue-900'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-blue-800'}`}>
                        {notification.message}
                    </p>
                 </div>
                 <div className="ml-4 flex items-center space-x-2">
                    {!notification.isRead && (
                        <button 
                            onClick={() => markRead.mutate(notification.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Mark as read"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => deleteNotification.mutate(notification.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white">Next</button>
        </div>
      )}
    </div>
  );
}
