var express = require('express');
var app = express();

app.use(express.static('/Users/azizkhilawala/Documents/Repositories/D3-Repo-copy'));

app.listen(8085, function() {
    console.log('Example app listening on port 8085!');
});
