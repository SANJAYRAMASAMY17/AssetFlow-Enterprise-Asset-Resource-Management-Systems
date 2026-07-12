import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock } from 'lucide-react';
import { apiClient } from '../../api/client.ts';

export function ActivityTimeline() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page],
    queryFn: async () => (await apiClient.get('/activities', { params: { page, limit: 30 } })).data
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-gray-400" />
          System Activity
        </h1>
        <p className="mt-1 text-sm text-gray-500">Timeline of all asset-related events</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading activities...</div>
        ) : data?.items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No activity recorded.</div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {data?.items.map((event: any, eventIdx: number) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== data.items.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium text-gray-900">{event.user?.name || 'System'}</span> 
                            {' '} {event.action} {' '}
                            <span className="font-medium text-gray-900">{event.entityType}</span>
                          </p>
                          {event.details && (
                            <p className="mt-1 text-sm text-gray-500">{event.details}</p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
