const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingsList.tsx', 'utf8');

content = content.replace(
  /onSuccess: \(\) => queryClient.invalidateQueries\(\{ queryKey: \['bookings'\] \}\)/g,
  "onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: ['bookings'] });\n      alert('Operation successful');\n    },\n    onError: (err: any) => alert(err.response?.data?.error || 'Operation failed')"
);

fs.writeFileSync('src/pages/Bookings/BookingsList.tsx', content);
