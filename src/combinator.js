///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
function combine(stream, close) {
    return stream.selectMany(function (p) {
        var ps = close(p);
        return Rx.Observable.just(p).zip(ps, function (x, y) { return { p: x, r: y }; });
    }).take(1);
}
exports.combine = combine;
