"use strict"

var ID_SIZE = 256/32

function Id(){
    return Uint32Array(ID_SIZE)
}

function Id_randomize(id){
    for(var i in id){
        id[i] = Math.floor(Math.random() * 65536) * 65536 + Math.floor(Math.random() * 65536)
    }
}

function Id_toString(id){
    var res = []
    var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]
    for(var i in id){
        var value = Math.floor(id[i] / 65536)
        res.push(digits[Math.floor(value / 16 / 16 / 16) % 16])
        res.push(digits[Math.floor(value / 16 / 16) % 16])
        res.push(digits[Math.floor(value / 16) % 16])
        res.push(digits[value % 16])
        res.push(digits[Math.floor(id[i] / 16 / 16 / 16) % 16])
        res.push(digits[Math.floor(id[i] / 16 / 16) % 16])
        res.push(digits[Math.floor(id[i] / 16) % 16])
        res.push(digits[id[i] % 16])
    }
    return res.join("")
}

function Id_distance(a, b){
    var data = Id()
    for(var i in data){
        data[i] = a[i] ^ b[i]
    }
    return data
}

function Id_bitAt(id, pos){
    var value = id[Math.floor(pos / 32)]
    if(((value << (pos % 32)) & 0x80000000) != 0){
        return 1
    }
    return 0
}

function Id_getFirstBit(id){
    var firstActive = 0
    var firstActiveInt = -1

    for(var i in id){
        if(firstActiveInt == -1){
            if(id[i] == 0){
                firstActive += 32
            }else{
                firstActiveInt = i
            }
        }
    }

    if(firstActiveInt == -1){
        return
    }

    var active = id[firstActiveInt]

    for(var i = 0; i < 32; i++){
        if((active & 0x80000000) == 0){
            firstActive ++
            active <<= 1
        }
    }

    return firstActive
}

//Horribly inefficient but it is only used for some tests
function Id_compare(a, b){
    //JS integers are signed be default so we cannot compare directly
    //thus we do it bit by bit
    for(var i = 0; i < 256; i++){
        var ba = Id_bitAt(a, i)
        var bb = Id_bitAt(b, i)

        if(ba < bb){
            return -1
        }else if(ba > bb){
            return 1
        }
    }
    return 0
}

function RoutingTable(ids){
    if(ids.length == 1){
        return {
            size: 1,
            zero: null,
            one:null,
            bit: -1,
            id: ids[0],
        }
    }

    var splitBit = 1000
    for(var i = 1; i < ids.length; i++){
        var bit = Id_getFirstBit(Id_distance(ids[0], ids[i]))
        splitBit = Math.min(bit, splitBit)
    }

    var zero = []
    var one = []

    for(var i in ids){
        if(Id_bitAt(ids[i], splitBit) == 0){
            zero.push(ids[i])
        }else{
            one.push(ids[i])
        }
    }

    return {
        size: ids.length,
        zero: RoutingTable(zero),
        one: RoutingTable(one),
        bit: splitBit,
        id: ids[0],
    }
}

function RT_toString(rt, level){
    level = level || 0
    var lineStart = ""
    for(var i = 0; i < level; i++){
        lineStart += "  "
    }
    if(rt.bit == -1){
        return lineStart + Id_toString(rt.id)
    }else{
        return lineStart + "(b:" + rt.bit + ",s:" + rt.size + ")\n" +
            RT_toString(rt.zero, level + 1) + "\n"+ RT_toString(rt.one, level + 1)
    }
}

function RT_findClosest(rt, id, n){
    if(n == rt.size){
        if(rt.bit == -1){
            return [rt.id]
        }else{
            return RT_findClosest(rt.zero, id, rt.zero.size).concat(RT_findClosest(rt.one, id, rt.one.size))
        }
    }

    var good = null
    var bad = null
    if(Id_bitAt(id, rt.bit) == 0){
        good = rt.zero
        bad = rt.one
    }else{
        good = rt.one
        bad = rt.zero
    }

    if(good.size >= n){
        return RT_findClosest(good, id, n)
    }else{
        return RT_findClosest(good, id, good.size).concat(RT_findClosest(bad, id, n - good.size))
    }
}


