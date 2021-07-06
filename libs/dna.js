class Dna {

    constructor(total, cities, order) {
        // Start assuming it's distance is infinity and fitness is zero
        this.dist = Infinity;
        this.fitness = 0;
        this.cities = cities;

        // Is this being made from another DNA object?
        if (order instanceof Array) {
            // Just copy the order
            this.order = order.slice();
            // Mutation
            // 50% of the time shuffle one spot to see if it improves
            if (Math.random(1) < 0.05) {
                this.shuffle();
            }
        } else {
            // Create a random order
            this.order = [];
            for (var i = 0; i < total; i++) {
                this.order[i] = i;
            }

            // Shuffle randomly 100 times
            // Is this good enough for variation?
            for (var n = 0; n < 100; n++) {
                this.shuffle();
            }
        }
    }
    // A generic function to swap two elements in an array
    swap(a, i, j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }

    // Shuffle array one time
    shuffle = function () {
        var i = Math.floor(this.random(this.order.length));
        var j = Math.floor(this.random(this.order.length));
        this.swap(this.order, i, j);
    }


    
    random = function (min, max) {

        var rand = Math.random();

        if (arguments.length === 0) {
            return rand;
        } else
            if (arguments.length === 1) {
                if (arguments[0] instanceof Array) {
                    return arguments[0][Math.floor(rand * arguments[0].length)];
                } else {
                    return rand * min;
                }
            } else {
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                return rand * (max - min) + min;
            }
    };

    distFunc = function (x1, y1, z1, x2, y2, z2) {
        if (arguments.length === 4) {
            // In the case of 2d: z1 means x2 and x2 means y2
            return Math.sqrt((z1 - x1) * (z1 - x1) + (x2 - y1) * (x2 - y1));
        } else if (arguments.length === 6) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
        }
    };

    // How long is this particular path?
    calcDistance = function () {
        var sum = 0;
        for (var i = 0; i < this.order.length - 1; i++) {
            var cityAIndex = this.order[i];
            var cityA = this.cities[cityAIndex];
            var cityBIndex = this.order[i + 1];
            var cityB = this.cities[cityBIndex];
            var d = this.distFunc(cityA.x, cityA.y, cityB.x, cityB.y);
            sum += d;
        }
        this.dist = sum;
        return this.dist;
    }

    // Map the fitess where shortest is best, longest is worst
    mapFitness = function (minD, maxD) {
        this.fitness = this.map(this.dist, minD, maxD, 1, 0);
        return this.fitness;
    }


    map = function (n, start1, stop1, start2, stop2) {
        return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    };


    // Normalize against total fitness
    normalizeFitness = function (total) {
        this.fitness /= total;
    }

    // This is one way to crossover two paths
    crossover = function (other) {

        // Grab two orders
        var order1 = this.order;
        var order2 = other.order;

        // Pick a random start and endpoint
        var start = Math.floor(Math.random(order1.length));
        var end = Math.floor(Math.random(start + 1, order1.length + 1));

        // Grab part of the the first order
        var neworder = order1.slice(start, end);

        // How many spots do we need to add?
        var leftover = order1.length - neworder.length;

        // Go through order 2
        var count = 0;
        var i = 0;
        // As long as we aren't finished
        while (count < leftover) {
            // Take a city from order2
            var city = order2[i];
            // If it isn't part of the new child path yet
            if (!neworder.includes(city)) {
                // Add it!
                neworder.push(city);
                count++;
            }
            i++;
        }
        return neworder;
    }



}

module.exports = Dna