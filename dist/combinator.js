///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
function result(p, s) { return { p: p, s: s }; }
;
function waitFor(stream, close) {
    return stream.selectMany(function (p) {
        var ps = close(p);
        return Rx.Observable.just(p).zip(ps, result).take(1);
    });
}
exports.waitFor = waitFor;
function combine(primary, secondary, scheduler, secondaryUseReplay) {
    if (secondaryUseReplay === void 0) { secondaryUseReplay = true; }
    if (secondaryUseReplay) {
        secondary = secondary.shareReplay(1, null, scheduler);
        secondary.subscribe(function (_) { return _; });
    }
    return waitFor(primary, function () { return secondary; });
}
exports.combine = combine;
(function (StreamType) {
    StreamType[StreamType["primary"] = 0] = "primary";
    StreamType[StreamType["secondary"] = 1] = "secondary";
})(exports.StreamType || (exports.StreamType = {}));
var StreamType = exports.StreamType;
function item(type, item) { return { type: type, item: item }; }
function combineGroup(primary, secondary, keySelector, scheduler) {
    var secAcc = secondary.scan(function (acc, val) {
        acc[keySelector(item(StreamType.secondary, val))] = val;
        return acc;
    }, {}).shareReplay(1, null, scheduler);
    secAcc.subscribe(function (_) { return _; });
    var res = primary.groupBy(function (p) { return keySelector(item(StreamType.primary, p)); })
        .flatMap(function (gp) {
        var gs = secAcc.map(function (s) { return s[gp.key]; }).filter(function (f) { return !!f; });
        return combine(gp, gs, scheduler, false);
    }).share();
    return res;
}
exports.combineGroup = combineGroup;
