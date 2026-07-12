const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingsList.tsx', 'utf8');

const invalidateReplacement = `
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-calendar'] });
      toast.success('Operation successful');
`;

content = content.replace(/queryClient\.invalidateQueries\(\{ queryKey: \['bookings'\] \}\);\s+toast\.success\('Operation successful'\);/g, invalidateReplacement.trim());

fs.writeFileSync('src/pages/Bookings/BookingsList.tsx', content);
