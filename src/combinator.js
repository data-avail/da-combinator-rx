///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
function waitFor(stream, close) {
    return stream.selectMany(function (p) {
        var ps = close(p);
        return Rx.Observable.just(p).zip(ps, function (x, y) { return { p: x, r: y }; }).take(1);
    });
}
exports.waitFor = waitFor;
function combine(primary, secondary, scheduler) {
    var secondaryReplay = secondary.shareReplay(1, null, scheduler);
    secondaryReplay.subscribe(function (_) { return _; });
    return waitFor(primary, function () { return secondaryReplay; });
}
exports.combine = combine;
(function (StreamType) {
    StreamType[StreamType["primary"] = 0] = "primary";
    StreamType[StreamType["secondary"] = 1] = "secondary";
})(exports.StreamType || (exports.StreamType = {}));
var StreamType = exports.StreamType;
function item(type, item) { return { type: type, item: item }; }
function combineGroup(primary, secondary, keySelector, scheduler) {
    var merged = primary.map(function (p) { return item(StreamType.primary, p); })
        .merge(secondary.map(function (s) { return item(StreamType.secondary, s); }));
    var grouped = merged.groupBy(keySelector)
        .selectMany(function (v) {
        var ps = v.filter(function (p) { return p.type == StreamType.primary; }).map(function (p) { return p.item; });
        var ss = v.filter(function (p) { return p.type == StreamType.secondary; }).map(function (p) { return p.item; });
        return combine(ps, ss);
    });
}
exports.combineGroup = combineGroup;
