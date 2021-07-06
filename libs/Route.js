const DNA = require('./dna');


class Route {

    constructor(data) {
        this.cities = [];
        this.routes = [];

        this.recordDistance = Infinity;
        this.bestEver;
        this.data = data

        this.bounds = { "minLon": 29.119558567487996, "maxLon": 29.141359562598126, "maxLat": 40.988334180897816, "minLat": 40.971648978664156 };

        // Population of possible orders
        this.population = [];
        this.popTotal = 200;
    }



    getX(x) {
        var position = (x - this.bounds.minLon) / (this.bounds.maxLon - this.bounds.minLon);
        return position;
    }

    getY(y) {
        var position = (y - this.bounds.minLat) / (this.bounds.maxLat - this.bounds.minLat);
        return position;
    }

    setup() {
        for (var i = 0; i < this.data.length; i++) {
            // Model map coordinates in xy graph
            var v = { x: this.getX(this.data[i].longitude), y: this.getY(this.data[i].latitude), poiName: this.data[i].poiName };
            this.cities[i] = v;
        }
        // Create population
        for (var i = 0; i < this.popTotal; i++) {
            this.population[i] = new DNA(this.data.length, this.cities);
        }

    }

    //Edit response data
    jsonData(order) {
        const reversed = order.reverse();
        this.routes.push(reversed);
        const r = this.routes.reverse();
        let response = { "bestRoute": [], "alternative": {} };
        if (r.length > 3) {
            for (let i = 0; i < 4; i++) {
                r[i].forEach(e => {
                    if (i == 0) {
                        response["bestRoute"].push({
                            "poiName": this.data[e].poiName,
                            "latitude": this.data[e].latitude,
                            "longitude": this.data[e].longitude
                        })
                    }
                    else {
                        if (!response["alternative"][i]) response["alternative"][i] = [];
                        response["alternative"][i].push({
                            "poiName": this.data[e].poiName,
                            "latitude": this.data[e].latitude,
                            "longitude": this.data[e].longitude
                        })
                    }

                });
            }
        }

        return response;
    }

    run() {

        this.setup()
        let control = true;

        while (control) {
            var minDist = Infinity;
            var maxDist = 0;

            for (var i = 0; i < this.population.length; i++) {
                var d = this.population[i].calcDistance();
                // Is this the best ever?
                if (d < this.recordDistance) {
                    this.recordDistance = d;
                    this.bestEver = this.population[i];
                    //createGoogleMapLink(population[i].order)
                    //console.log("best ever", this.bestEver.order,this.bestEver.dist);
                    let response = this.jsonData(this.bestEver.order)
                    if (Math.floor(this.bestEver.dist * 100) == 225) {
                        control = false;
                        console.log("end")
                        return response;
                    }
                }

                // Is this the best this round?
                if (d < minDist) {
                    minDist = d;
                    //bestNow = population[i];
                }

                // Is this the worst?
                if (d > maxDist) {
                    maxDist = d;
                }
            }



            // Map all the fitness values between 0 and 1
            var sum = 0;
            for (var i = 0; i < this.population.length; i++) {
                sum += this.population[i].mapFitness(minDist, maxDist);
            }

            // Normalize them to a probability between 0 and 1
            for (var i = 0; i < this.population.length; i++) {
                this.population[i].normalizeFitness(sum);
            }



            // Selection

            // A new population
            var newPop = [];

            // Sam population size
            for (var i = 0; i < this.population.length; i++) {

                // Pick two
                var a = this.pickOne(this.population);
                var b = this.pickOne(this.population);

                // Crossover!
                var order = a.crossover(b);
                newPop[i] = new DNA(this.data.length, this.cities, order);
            }

            // New population!
            this.population = newPop;
        }



    }



    pickOne() {
        // Start at 0
        var index = 0;

        // Pick a random number between 0 and 1
        var r = Math.random(1);

        // Keep subtracting probabilities until you get less than zero
        // Higher probabilities will be more likely to be fixed since they will
        // subtract a larger number towards zero
        while (r > 0) {
            r -= this.population[index].fitness;
            // And move on to the next
            index += 1;
        }

        // Go back one
        index -= 1;

        return this.population[index];
    }





}

exports.Route = Route
