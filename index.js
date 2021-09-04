const { response } = require('express');
const https = require("https");
const express = require('express');
const app = express();
const port = 3000;

let responseObjectTemplate = {
  responseType: "GOOD",
  responseData: {}
};

app.get('/getCountry', async (req, res) => {
  https.get(`https://api.worldbank.org/v2/country/${req.query.id}?format=json`, (resp) => {
    let responseData = '';

    // Whenever data is received, we store it in case it is returned in pieces and not a single unit.
    resp.on('data', (chunk) => {
      responseData += chunk;
    });

    resp.on('end', () => {
      // Parse the full response in JSON
      let returnData = JSON.parse(responseData);

      // If the returned data has a "message" property, this means a bad request was made.
      // So we ensure that one does not exist.
      if (!returnData[0].hasOwnProperty("message")) {
        responseObjectTemplate.responseType = "GOOD";
        responseObjectTemplate.responseData = {
          name: returnData[1][0].name,
          capital: returnData[1][0].capitalCity
        };
      } else {  // If a "message" property DOES exist, then we alert the user of a bad request and reason for failure.
        responseObjectTemplate.responseType = "BAD";
        responseObjectTemplate.responseData = {message: `Invalid Country Code: ${req.query.id}`};
      }
      
      res.send(responseObjectTemplate);
    });
  });  
});


// Tell the app to watch the given port
app.listen(port, ()=> {
  console.log(`Example app listening on http://localhost:${port}`);
});