///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
function waitFor(stream, close) {
    return stream.selectMany(function (p) {
        var ps = close(p);
        return Rx.Observable.just(p).zip(ps, function (x, y) { return { p: x, r: y }; }).take(1);
    });
}
exports.waitFor = waitFor;
function combine(primary, secondary, close, scheduler) {
    var secondaryReplay = secondary.shareReplay(1, null, scheduler);
    secondaryReplay.subscribe(function (_) { return _; });
    return waitFor(primary, function () { return secondaryReplay; });
}
exports.combine = combine;
