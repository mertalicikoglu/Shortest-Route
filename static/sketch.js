// Cities
var cities = [];
var roads = [];
var totalCities = 10;

// Best path overall
var recordDistance = Infinity;
var bestEver;
var data = [
  {
    "poiName": "Poi 1",
    "latitude": 40.978696156559884,
    "longitude": 29.13730406235724
  },
  {
    "poiName": "Poi 2",
    "latitude": 40.97263724900384,
    "longitude": 29.141359562598126
  },
  {
    "poiName": "Poi 3",
    "latitude": 40.97529416466278,
    "longitude": 29.12781977119488
  },
  {
    "poiName": "Poi 4",
    "latitude": 40.971648978664156,
    "longitude": 29.13672470558623
  },
  {
    "poiName": "Poi 5",
    "latitude": 40.97900394715689,
    "longitude": 29.126296276395397
  },
  {
    "poiName": "Poi 6",
    "latitude": 40.97900394715689,
    "longitude": 29.126296276395397
  },
  {
    "poiName": "Poi 7",
    "latitude": 40.98341005534748,
    "longitude": 29.125395054550385
  },
  {
    "poiName": "Poi 8",
    "latitude": 40.97529416466278,
    "longitude": 29.12781977119488
  },
  {
    "poiName": "Poi 9",
    "latitude": 40.988334180897816,
    "longitude": 29.12507318950866
  },
  {
    "poiName": "Poi 10",
    "latitude": 40.98318327765146,
    "longitude": 29.119558567487996
  }
]

var bounds = { "minLon": 29.119558567487996, "maxLon": 29.141359562598126, "maxLat": 40.988334180897816, "minLat": 40.971648978664156 };


// data.forEach(element => {
//   if (bounds.minLon > element.longitude) bounds.minLon = element.longitude;
//   if (bounds.maxLon < element.longitude) bounds.maxLon = element.longitude;
//   if (bounds.minLat > element.latitude) bounds.minLat = element.latitude;
//   if (bounds.maxLat < element.latitude) bounds.maxLat = element.latitude;
// });

// Population of possible orders
var population = [];
var popTotal = 200;


function getX(x) {
  var position = (x - bounds.minLon) / (bounds.maxLon - bounds.minLon);
  return 590 * position;
}
function getY(y) {
  var position = (y - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  return 590 * position;
}

function setup() {
  var myCanvas = createCanvas(700, 1200);
  myCanvas.parent("square");
  // Make random cities
  for (var i = 0; i < data.length; i++) {
    console.log(getX(data[i].longitude), " ", getY(data[i].latitude))
    var v = { x: getX(data[i].longitude), y: getY(data[i].latitude), poiName: data[i].poiName };
    console.log("vector", v);
    //v.poiName = data[i].poiName;
    //v.p5 = null;
    cities[i] = v;
  }

  // Create population
  for (var i = 0; i < popTotal; i++) {
    population[i] = new DNA(data.length);
  }

}
function createGoogleMapLink(order) {

  const reversed = order.reverse();
  roads.push(reversed);
  const r = roads.reverse();
  let url = "https://www.google.com/maps/dir"
  let vehicle = "/data=!4m7!4m6!1m0!1m3!2m2!1d29.119559!2d40.983183!3e0"
  let href = "";
  if (r.length > 3) {
    for (let i = 0; i < 4; i++) {
      r[i].forEach(e => {
        url += "/'" + data[e].latitude + "," + data[e].longitude + "'"
      });
      url += vehicle;

      if (i == 0) href += '<a href="' + url + '">Google Map (Best Route)</a><br>'
      else href += '<a href="' + url + '">Google Map (Alternative Route)</a><br>'
      url = "https://www.google.com/maps/dir"
    }
  }

  document.getElementById("demo").innerHTML = href;

}

function draw() {
  background(0);


  // Each round let's find the best and worst
  var minDist = Infinity;
  var maxDist = 0;

  // Search for the best this round and overall
  var bestNow;
  for (var i = 0; i < population.length; i++) {
    var d = population[i].calcDistance();

    // Is this the best ever?
    if (d < recordDistance) {
      recordDistance = d;
      bestEver = population[i];
      createGoogleMapLink(population[i].order)
      console.log("best ever", bestEver)
    }

    // Is this the best this round?
    if (d < minDist) {
      minDist = d;
      bestNow = population[i];
    }

    // Is this the worst?
    if (d > maxDist) {
      maxDist = d;
    }
  }

  // Show the best this round
  bestNow.show();
  translate(0, height / 2);
  line(0, 0, width, 0);

  // Show the best ever!
  bestEver.show();

  // Map all the fitness values between 0 and 1
  var sum = 0;
  for (var i = 0; i < population.length; i++) {
    sum += population[i].mapFitness(minDist, maxDist);
  }

  // Normalize them to a probability between 0 and 1
  for (var i = 0; i < population.length; i++) {
    population[i].normalizeFitness(sum);
  }

  // Selection

  // A new population
  var newPop = [];

  // Sam population size
  for (var i = 0; i < population.length; i++) {

    // Pick two
    var a = pickOne(population);
    var b = pickOne(population);

    // Crossover!
    var order = a.crossover(b);
    newPop[i] = new DNA(data.length, order);
  }

  // New population!
  population = newPop;
}

// This is a new algorithm to select based on fitness probability!
// It only works if all the fitness values are normalized and add up to 1
function pickOne() {
  // Start at 0
  var index = 0;

  // Pick a random number between 0 and 1
  var r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= population[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  return population[index];
}
