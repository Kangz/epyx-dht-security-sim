"use strict";

importScripts("routing.js", "simulation.js")
this.onmessage = function(event) {
    postMessage(makeSimulationData(event.data.size, event.data.replication))
}
