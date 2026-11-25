const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');

const replacement = `
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      alert('Operation successful');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Operation failed')
`;

content = content.replace(/onSuccess: \(\) => queryClient\.invalidateQueries\({ queryKey: \['booking', id\] }\)/g, replacement.trim());

fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);
