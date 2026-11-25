const fs = require('fs');

let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');
content = content.replace(/if\(confirm\('.*?'\)\) /g, "");
fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);

let listContent = fs.readFileSync('src/pages/Bookings/BookingsList.tsx', 'utf8');
listContent = listContent.replace(/if\(confirm\('.*?'\)\) /g, "");
fs.writeFileSync('src/pages/Bookings/BookingsList.tsx', listContent);

