"use strict";

importScripts("routing.js", "simulation.js")

this.onmessage = function(event){
    var edata = event.data
    var data = edata.data || makeSimulationData(edata.size, edata.replication)

    var simClass = {
        "FP": FastPropagationSimulation,
        "SP": SlowPropagationSimulation,
    }[edata.type]

    var sim = new simClass(data, edata.parameter)
    var res = sim.run()
    postMessage({"res": res, "type": edata.type, workerId: edata.workerId})
}
