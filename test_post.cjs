const http = require('http');

const data = JSON.stringify({
  name: 'Banarasi Saree',
  slug: 'banarasi-saree',
  show_on_menu: 1,
  is_featured: 0
});

const options = {
  hostname: 'localhost',
  port: 80,
  path: '/luxe-haven/api/masters/index.php?type=saree_types',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let resData = '';
  res.on('data', d => resData += d);
  res.on('end', () => console.log('POST Response:', resData));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
