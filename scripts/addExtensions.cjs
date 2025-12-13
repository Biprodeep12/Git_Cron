const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      content = content.replace(/from\s+["'](\.\.[^"']*?)(?<!\.js)["']/g, 'from "$1.js"');
      content = content.replace(/from\s+["'](\.[^"']*?)(?<!\.js)["']/g, 'from "$1.js"');
      
      fs.writeFileSync(fullPath, content, 'utf-8');
    }
  });
}

processDirectory(path.join(__dirname, '..', 'dist'));
console.log('Added .js extensions to relative imports');
