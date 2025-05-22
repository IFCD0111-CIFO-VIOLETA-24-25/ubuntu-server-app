const express = require('express');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '10.199.160.199',   
  user: 'admin1234',        
  password: 'admin1234',        
  database: 'pruebaDB'   
});

db.connect((err) => {
  if (err) {
    console.error('Error MySQL connex: ' + err.stack);
    return;
  }
  console.log('MySQL conn successful.');
});

const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running!');
});
