const https = require("https");
const express = require('express');
const app = express();
const port = 3000;

let responseObjectTemplate = {
  responseType: "GOOD",
  responseData: {}
};

// Find a single country based on a given Country Code
app.get('/getCountry', async (req, res) => {
  https.get(`https://api.worldbank.org/v2/country/${req.query.countryCode}?format=json`, (resp) => {
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
          country: returnData[1][0].name,
          capital: returnData[1][0].capitalCity
        };
      } else {  // If a "message" property DOES exist, then we alert the user of a bad request and reason for failure.
        responseObjectTemplate.responseType = "BAD";
        responseObjectTemplate.responseData = {message: `Invalid Country Code: ${req.query.countryCode}`};
      }
      
      res.send(responseObjectTemplate);
    });
  });  
});

// Find a list of cities based on a given latitude and longitude range
app.get('/getNearbyCities', async (req, res) => {
  const longitude = {
    min: req.query.minLongitude,
    max: req.query.maxLongitude
  };
  const latitude = {
    min: req.query.minLatitude,
    max: req.query.maxLatitude
  };

  // Get a list of every country in the world bank
  https.get(`https://api.worldbank.org/v2/country/?format=json&per_page=500`, (resp) => {
    let responseData = "";

    // Whenever data is received, we store it in case it is returned in pieces and not a single unit.
    resp.on("data", (chunk) => {
      responseData += chunk;
    });

    resp.on('end', () => {
      let nearbyCities = [];

      // Parse the full response in JSON, but only save them if they are within the range given
      JSON.parse(responseData)[1].forEach(city => {
        if (city.longitude >= longitude.min && city.longitude <= longitude.max) {
          if (city.latitude >= latitude.min && city.latitude <= latitude.max) {
            nearbyCities.push(city.capitalCity);
          }
        }
      });

      // Create the response object using the template for consistency
      responseObjectTemplate.responseType = nearbyCities.length > 0 ? "GOOD" : "BAD";
      responseObjectTemplate.responseData = {
        cities: nearbyCities,
        longitude,
        latitude
      }

      res.send(responseObjectTemplate);
    })
  });
})

// Find the most efficient route through a list of 4 cities with a start and end city
app.get('/getRoute', async (req, res) => {
  let citiesToVisit = JSON.parse(req.query.citiesToVisit);
  let route = [];
  
  https.get(`https://api.worldbank.org/v2/country/?format=json&per_page=500`, (resp) => {
    let responseData = "";

    resp.on("data", (chunk) => {
      responseData += chunk;
    });

    resp.on('end', () => {
      // Parse through all cities, and save each one that has a matching capital
      JSON.parse(responseData)[1].forEach(city => {
        if (citiesToVisit.includes(city.capitalCity)) {
          route.push(city);
        }
      });

      // Organize the route to have the proper starting and ending city
      let newRoute = [];
      for (let i=0; i<route.length; i++) {
        newRoute.push(route.find(element => element.capitalCity == citiesToVisit[i]));
      }

      responseObjectTemplate.responseType = "GOOD";
      responseObjectTemplate.responseData = GetRoute(newRoute);

      res.send(responseObjectTemplate);
    });
  });
});

// Parse between two possible routes and get the shortest route and the distance covered
function GetRoute(cityList) {
  // A -> B -> C -> D
  let distanceA = GetDistance(cityList[0], cityList[1]) + GetDistance(cityList[1], cityList[2]) + GetDistance(cityList[2], cityList[3]);
  // A -> C -> B -> D
  let distanceB = GetDistance(cityList[0], cityList[2]) + GetDistance(cityList[2], cityList[1]) + GetDistance(cityList[1], cityList[3]);

  // Determine which route is shortest, then return that with the distance traveled
  if (distanceA > distanceB) {
    return {
      distance: distanceB,
      route: [cityList[0], cityList[2], cityList[1], cityList[3]]
    };
  } else {
    return {
      distance: distanceA,
      route: [cityList[0], cityList[1], cityList[2], cityList[3]]
    };
  }
}

// Get the distance between two cities
function GetDistance(start, end) {
  let distance_longitude = Math.abs(start.longitude - end.longitude);
  let distance_latitude = Math.abs(start.latitude - end.latitude);
  return Math.sqrt(distance_longitude*distance_longitude + distance_latitude*distance_latitude);
}

// Tell the app to watch the given port
app.listen(port, ()=> {
  console.log(`Example app listening on http://localhost:${port}`);
});