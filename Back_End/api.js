const marketApi = new Map();
const marketSettings = require("./config/marketSettings.json");
const markets = marketSettings.markets;
const marketModulesPath = "./Market";
const connectMongo = require("./config/DbConnection");
require("dotenv").config({ path: "./config/config.env" });
connectMongo();

markets.forEach((market) => {
  marketApi.set(market, require(`${marketModulesPath}/${market}/index.js`));
});

const fetch = require("node-fetch");
const express = require("express");
const app = express();
var cors = require("cors");
const Market = require("./model/Market");
const Items = require("./model/Items");
const { json } = require("body-parser");
// const { parse } = require('dotenv/types');
const port = 8000;

//using express Body Parser
app.use(express.json());
app.use(express.urlencoded());

app.use(cors());
app.use("/user", require("./routes/Users"));
app.use("/recipe", require("./routes/Recipe"));

app.get("/favicon.ico", (req, res) => res.status(204));

async function parseWebsites(query, location, storePref, pref) {
  marketDataArr = [];

  let locationStr = location.split("&");
  let itemStr = query.split("&");
  let queryRet = pref.split("&");
  let stores = storePref.split("&");
  //default radius is 0, but radius is in meters!!!!!, SO 2000 RADIUS IS NOT AS BIG AS YOU THINK
  //problem here, is that google places API only returns 20, so too big of a radius and it'll sort of be irrelevant how large you make it
  let radius = "0";
  let longitude = "default";
  let latitude = "default";
  let itemsList = [];

  //set the query to the first item in list for now as well, this will change later
  for (const food of itemStr) {
    itemsList.push(food);
  }
  //Parse through query to check for radius, longitude, latitude
  for (const words of locationStr) {
    if (words.includes("radius=")) {
      radius = words.substring(7);
    } else if (words.includes("lo=")) {
      longitude = words.substring(3);
    } else if (words.includes("la=")) {
      latitude = words.substring(3);
    }
    //put all actual searchable items into a list for now
    else {
      itemsList.push(words);
    }
  }

  if (longitude == "default" || latitude == "default") {
    radius = "0";
  }
  //example api localhost:8000/radius=2000&la=34.0689&lo=-118.4452&brocolli
  //http://localhost:8000/radius=2000&la=34.0689&lo=-118.4452/brocolli&chicken/Ralphs&Walmart&Costco&Food4Less/1

  let position = latitude + "," + longitude;
  let API_KEY = process.env.API_KEY;
  //convert radius from m to miles
  let radMeters = parseFloat(radius);
  radMeters = radMeters * 1609.34;

  possibleStoreList = [];
  //store the possible store lists that we will find in google places API
  for (var i = 0; i < stores.length; i++) {
    possibleStoreList.push(stores[i]);
  }
  // console.log(stores)
  // console.log(possibleStoreList)

  var storesAroundMe = [];
  //set the var for the google places API
  for (var i = 0; i < possibleStoreList.length; i++) {
    let storeName = possibleStoreList[i];
    if(storeName == "Food4Less"){
      storeName = "Food 4 Less"
    }
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${API_KEY}&location=${position}&radius=${radMeters}&name=${storeName}`;
    //var possibleStoreList = ["Walmart", "Food4Less", "Ralphs", "Costco"]
    // console.log(url)
    await fetch(url)
      .then((res) => res.json())
      .then((out) => {
        //parse JSON to check if Walmart, Food4Less, Ralphs, Costco is within range
        let jsonVal = out;
        //console.log(jsonVal)
        //go through the list of results
        // console.log(jsonVal["results"].length)
        //go through the list of results
        for(var c = 0; c < jsonVal["results"].length; c++){
           //check if the resulting grocery stores include the names of any of the possible stores
          if(jsonVal["results"][c]["name"].includes(storeName)){
              storesAroundMe.push(possibleStoreList[i]);
          }
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  // console.log("this is the stores aroud me")
  // console.log(storesAroundMe)
  //If given no long no lat, check for all stores
  if (longitude == "default" || latitude == "default") {
    storesAroundMe = possibleStoreList;
  }
  // console.log(storesAroundMe)
  /** Initialize Markets that can be scraped */
  marketDataArr.push(new Market("Costco", "https://www.costco.com/", []));
  marketDataArr.push(new Market("Walmart", "https://www.walmart.com/", []));
  marketDataArr.push(new Market("Ralphs", "https://www.ralphs.com/", []));
  marketDataArr.push(new Market("Food4Less", "https://www.food4less.com/", []));

  //set query as the first item of the list for now
  for (const items of itemsList) {
    query = items;
    for (const [key, module] of marketApi.entries()) {
      //if the store is not around me skip
      if (!storesAroundMe.includes(key)) continue;
      let marketData = await module.search(query, queryRet);

      /** Add specifically to that store's query, don't create new and waste obj space */
      for (i in marketDataArr) {
        if (marketDataArr[i]["name"] == key) {
          marketDataArr[i]["items"].push(
            new Items(query.replace("%20", " "), marketData)
          );
        }
      }
    }
  }
  return marketDataArr;
}

app.get("/:location/:query/:storePref/:pref", async (req, res) => {
  res.json({
    data: await parseWebsites(
      req.params.query,
      req.params.location,
      req.params.storePref,
      req.params.pref
    ),
  });
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

module.exports = {
  parseWebsites: parseWebsites,
};
