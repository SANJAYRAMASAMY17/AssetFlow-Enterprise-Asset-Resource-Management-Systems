const fs = require('fs');

let content = fs.readFileSync('src/pages/Bookings/BookingDetails.tsx', 'utf8');
content = "import toast from 'react-hot-toast';\n" + content;
content = content.replace(/alert\('Operation successful'\)/g, "toast.success('Operation successful')");
content = content.replace(/alert\((.*?)\)/g, "toast.error($1)");
fs.writeFileSync('src/pages/Bookings/BookingDetails.tsx', content);

let listContent = fs.readFileSync('src/pages/Bookings/BookingsList.tsx', 'utf8');
listContent = "import toast from 'react-hot-toast';\n" + listContent;
listContent = listContent.replace(/alert\('Operation successful'\)/g, "toast.success('Operation successful')");
listContent = listContent.replace(/alert\((.*?)\)/g, "toast.error($1)");
fs.writeFileSync('src/pages/Bookings/BookingsList.tsx', listContent);

