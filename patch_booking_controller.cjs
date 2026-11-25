const fs = require('fs');
let content = fs.readFileSync('src/server/controllers/booking.controller.ts', 'utf8');

content = content.replace(
  /const userId = \(req as any\)\.user\.userId;\s+const booking = await bookingService\.cancelBooking\(req\.params\.id, userId\);/,
  `const user = (req as any).user;\n      const booking = await bookingService.cancelBooking(req.params.id, user.userId, user.role);`
);

fs.writeFileSync('src/server/controllers/booking.controller.ts', content);
