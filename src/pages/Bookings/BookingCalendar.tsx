import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiClient } from '../../api/client.ts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

export function BookingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get start of month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data: bookings } = useQuery({
    queryKey: ['bookings-calendar', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: async () => (await apiClient.get('/bookings', {
      params: { 
        startDate: startOfMonth.toISOString(), 
        endDate: endOfMonth.toISOString(),
        limit: 1000 
      }
    })).data
  });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getBookingsForDate = (date: Date) => {
    if (!bookings?.items) return [];
    return bookings.items.filter((b: any) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      
      const checkDate = new Date(date);
      checkDate.setHours(0,0,0,0);
      
      const startDate = new Date(bStart);
      startDate.setHours(0,0,0,0);
      
      const endDate = new Date(bEnd);
      endDate.setHours(0,0,0,0);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resource Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">View upcoming bookings and availability</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/org/bookings" className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
            List View
          </Link>
          <Link to="/org/bookings/create" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Book Resource
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={today} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 uppercase">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(120px,1fr))] border-l border-gray-200">
          {days.map((date, idx) => (
            <div key={idx} className="min-h-[120px] p-2 border-r border-b border-gray-200 relative group">
              {date && (
                <>
                  <span className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </span>
                  <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px]">
                    {getBookingsForDate(date).map((b: any) => (
                      <Link 
                        key={b.id} 
                        to={`/org/bookings/${b.id}`}
                        className={`block px-2 py-1 text-xs truncate rounded-sm ${
                          b.status === 'APPROVED' || b.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}
                        title={`${b.asset.name} - ${b.status}`}
                      >
                        {b.asset.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
