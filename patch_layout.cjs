const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

content = "import { Toaster } from 'react-hot-toast';\n" + content;

content = content.replace(
  /<div className="flex min-h-screen bg-gray-50">/,
  "<div className=\"flex min-h-screen bg-gray-50\">\n      <Toaster position=\"top-right\" />"
);

fs.writeFileSync('src/components/layout/Layout.tsx', content);
