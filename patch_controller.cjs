const fs = require('fs');
let content = fs.readFileSync('src/server/controllers/booking.controller.ts', 'utf8');
content = content.replace(/const booking = await bookingService\.getBookingById\(req\.params\.id\);/, "console.log('GET BOOKING BY ID:', req.params.id);\n      const booking = await bookingService.getBookingById(req.params.id);");
fs.writeFileSync('src/server/controllers/booking.controller.ts', content);
