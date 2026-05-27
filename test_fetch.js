const http = require('http');

http.get('http://localhost/luxe-haven/api/masters/index.php?type=saree_types', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.log('Error: ', err.message));
