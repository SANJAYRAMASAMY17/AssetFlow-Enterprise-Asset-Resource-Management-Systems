const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('grep -rl "confirm(" src/').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/if\s*\(!?confirm\('.*?'\)\)\s*(return;)?/g, "");
  fs.writeFileSync(file, content);
}
