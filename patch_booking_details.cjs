const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');

content = content.replace(
  /const \{ data: booking, isLoading, isError, error \} = useQuery/g,
  "console.log('BookingDetails rendering, id:', id);\n  const { data: booking, isLoading, isError, error } = useQuery"
);

content = content.replace(
  /if \(!booking\) return <div className="p-8 text-center text-red-500">Booking not found\.<\/div>;/,
  "if (!booking) { console.log('booking object is falsy', booking); return <div className=\"p-8 text-center text-red-500\">Booking not found.</div>; }"
);

fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);
