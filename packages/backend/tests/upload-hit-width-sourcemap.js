const data = require('./mock-data/data.json');

fetch(`http://localhost:8080/api/coverage/client`, {
  method: 'POST',
  body: JSON.stringify({
    coverage: data,
    scene: {
      hi: 'shoppingpage',
    },
  }),
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .then((res) => {
    console.log('Response from server:', res);
  })
  .catch((err) => {
    console.error('Error occurred:', err);
  });
