const express = require('express');
const app = express();
app.get('*', (req, res) => res.send('catchall'));
app.listen(3001, () => console.log('started'));
