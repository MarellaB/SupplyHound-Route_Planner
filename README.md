# SupplyHound-Route_Planner
Code Challenge for Supply Hound to design a route planner using The World Bank API.

## To Use
* Must Have NodeJS installed
* Postman

Create a new Postman (or equivilent API Test Application) GET request.

Point the request to "http://localhost:3000/" and use one of the following endpoints:
* Task 1: "/getCountry"
  * Query Parameters:
    * countryCode = **###** (Replacing **###** with an appropriate Country Code)
* Task 2: "/getNearbyCities"
  * Query Parameters:
    * minLongitude = **##** (replacing **##** with the longitude value)
    * maxLongitude = **##** (replacing **##** with the longitude value)
    * minLatitude = **##** (replacing **##** with the latitude value)
    * maxLatitude = **##** (replacing **##** with the latitude value)
* trask 3: "/getRoute"
  * Query Parameters:
    * citiesToVisit = [START, A, B, END] (replacing values with capital city names)
