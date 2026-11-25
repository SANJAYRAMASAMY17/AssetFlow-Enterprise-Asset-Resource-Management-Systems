const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');

content = content.replace(/queryKey: \['dashboard'\]/g, "queryKey: ['analytics-dashboard']");
content = content.replace(/queryKey: \['activity'\]/g, "queryKey: ['activities']");

fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);
