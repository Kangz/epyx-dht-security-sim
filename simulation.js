function makeSimulationData(nNodes, nReplication){
    var ids = []
    for(var i = 0; i < nNodes; i++){
        var id = Id()
        Id_randomize(id)
        ids.push(id)
        id.n = i
    }

    var rt = RoutingTable(ids)

    var neighbours = []
    for(var i in ids){
        var neighs = RT_findClosest(rt, ids[i], nReplication)
        neighbours[i] = neighs.map(function(id){return id.n})
    }

    return {
        rt: rt,
        ids: ids,
        neighbours: neighbours,
        nNodes: nNodes,
        nReplication: nReplication,
    }
}

function Simulation(data, options){
    this.mask = (1 << data.nReplication) - 1

    //Initializes the state of the network
    this.state = new Array(data.nNodes)
    for(var i = 0; i < data.nNodes; i++){
        this.state[i] = 0
    }
    var zeroId = Id()
    for(var i in zeroId.data){
        zeroId.data[i] = 0
    }
    var closests = RT_findClosest(data.rt, zeroId, data.nReplication)
    for(var i in closests){
        this.state[closests[i].n] = 1 << i
    }

    this.rt = data.rt
    this.neighs = data.neighbours
    this.ids = data.ids
    this.nReplication = data.nReplication
    this.nNodes = data.nNodes

    this.doClosePull = "closePull" in options
    this.doClosePush = "closePush" in options
    this.doRandomPull = "randomPull" in options
    this.doRandomPush = "randomPush" in options
    this.doRandomApproxPull = "randomApproxPull" in options
    this.doRandomApproxPush = "randomApproxPush" in options

    this.result = {
        runningTime: 0,
        completion: [],
        nNodes: data.nNodes,
        nReplication: data.nReplication,
    }
}

Simulation.prototype = {
    run: function(){
        this.running = true
        this.round = 0

        order = this.ids.map(function(id){return id.n})

        while(this.running){
            this.shuffle(order)

            var state = []
            for(var i in this.state){
                state[i] = this.state[i]
            }

            for(var i = 0; i < order.length; i++){
                var current = order[i]

                if(this.doClosePull){
                    var n = this.neighs[current]
                    for(var j = 0; j < n.length; j++){
                        state[current] |= this.state[n[j]]
                    }
                }
                if(this.doClosePush){
                    var n = this.neighs[current]
                    for(var j = 0; j < n.length; j++){
                        state[n[j]] |= this.state[current]
                    }
                }
                if(this.doRandomPull){
                    var id = Id()
                    Id_randomize(id)
                    var c = RT_findClosest(this.rt, id, this.nReplication)
                    for(var j = 0; j < c.length; j++){
                        state[current] |= this.state[c[j].n]
                    }
                }
                if(this.doRandomPush){
                    var id = Id()
                    Id_randomize(id)
                    var c = RT_findClosest(this.rt, id, this.nReplication)
                    for(var j = 0; j < c.length; j++){
                        state[c[j].n] |= this.state[current]
                    }
                }
                if(this.doRandomApproxPull){
                    var n = this.choice(this.neighs)
                    for(var j = 0; j < n.length; j++){
                        state[current] |= this.state[n[j]]
                    }
                }
                if(this.doRandomApproxPush){
                    var n = this.choice(this.neighs)
                    for(var j = 0; j < n.length; j++){
                        state[n[j]] |= this.state[current]
                    }
                }
            }

            this.state = state

            this.checkCompletion()
            this.round ++
        }

        return this.result
    },

    shuffle: function(o){
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){}
        return o
    },

    choice: function(o){
        return o[parseInt(Math.random() * o.length)]
    },

    checkCompletion: function(){
        var completed = 0
        for(var i in this.state){
            if(this.state[i] == this.mask){
                completed ++
            }
        }
        this.result.completion[this.round] = completed
        if(completed == this.nNodes || this.round > 40){
            this.running = false
            this.result.runningTime = this.round + 1
        }
    }
}
