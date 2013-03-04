"use strict";

importScripts("routing.js")
this.onmessage = function(event) {
    postMessage(RoutingTable(event.data))
}
