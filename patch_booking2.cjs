const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');

content = content.replace(/queryClient\.invalidateQueries\({ queryKey: \['activities'\] }\);/g, "queryClient.invalidateQueries({ queryKey: ['activities'] });\n      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });");

fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);
