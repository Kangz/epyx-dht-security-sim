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

    console.log(active)

    for(var i = 0; i < 32; i++){
        if((active & 0x80000000) == 0){
            firstActive ++
            active <<= 1
        }
    }

    return firstActive
}
