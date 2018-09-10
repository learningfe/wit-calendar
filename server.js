const express = require('express');
const app = express();

app.use('/', express.static(__dirname));

app.listen(8080, '192.168.1.101');