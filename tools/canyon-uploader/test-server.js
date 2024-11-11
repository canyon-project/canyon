const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
// app.use(express.static('public'));

app.post('/upload', (req, res) => {
  console.log(req.body)
  res.send('File uploaded!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
