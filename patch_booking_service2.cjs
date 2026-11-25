const fs = require('fs');
let content = fs.readFileSync('src/server/services/booking.service.ts', 'utf8');

// Fix the incorrect replacement on line 19
content = content.replace(
  /if \(!booking\) throw new Error\('Booking not found'\);\s+if \(userRole === 'EMPLOYEE' && booking\.userId !== userId\) throw new Error\('Forbidden\. Cannot cancel other users\\' bookings\.'\);/,
  "if (!booking) throw new Error('Booking not found');"
);

// Now apply it specifically to cancelBooking
content = content.replace(
  /async cancelBooking\(id: string, userId: string, userRole: string = 'EMPLOYEE'\) \{\s+return prisma\.\$transaction\(async \(tx\) => \{\s+const booking = await tx\.resourceBooking\.findUnique\(\{ where: \{ id \}, include: \{ asset: true \} \}\);\s+if \(!booking\) throw new Error\('Booking not found'\);/,
  `async cancelBooking(id: string, userId: string, userRole: string = 'EMPLOYEE') {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id }, include: { asset: true } });
      if (!booking) throw new Error('Booking not found');
      if (userRole === 'EMPLOYEE' && booking.userId !== userId) throw new Error('Forbidden. Cannot cancel other users\\' bookings.');`
);

fs.writeFileSync('src/server/services/booking.service.ts', content);
