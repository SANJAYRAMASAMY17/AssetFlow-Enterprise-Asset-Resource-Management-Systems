const fs = require('fs');
let content = fs.readFileSync('src/server/services/booking.service.ts', 'utf8');

content = content.replace(
  /async cancelBooking\(id: string, userId: string\) \{/,
  `async cancelBooking(id: string, userId: string, userRole: string = 'EMPLOYEE') {`
);

content = content.replace(
  /if \(!booking\) throw new Error\('Booking not found'\);/,
  `if (!booking) throw new Error('Booking not found');\n      if (userRole === 'EMPLOYEE' && booking.userId !== userId) throw new Error('Forbidden. Cannot cancel other users\\' bookings.');`
);

fs.writeFileSync('src/server/services/booking.service.ts', content);
