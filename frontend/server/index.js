const axios = require('axios');
const express = require('express');
const path = require('path');
const app = express();

// a test route to make sure we can reach the backend
//this would normally go in a routes file
app.get('/test', (req, res) => {
    axios.get('http://localhost:5000/supported-types')
        .then((response) => {
            res.send(response.data);
        });
});

//Set the port that you want the server to run on
const port = process.env.PORT || 4000;
app.listen(port);
console.log('App is listening on port ' + port);