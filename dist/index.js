///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
var combinator;
(function (combinator) {
    var ItemType;
    (function (ItemType) {
        ItemType[ItemType["first"] = 0] = "first";
        ItemType[ItemType["second"] = 1] = "second";
        ItemType[ItemType["close"] = 2] = "close";
    })(ItemType || (ItemType = {}));
    ;
    function tulpe(type, item) { return { type: type, item: item }; }
    function combine(primaryStream, secondaryStream, primaryStreamClose, secondaryStreamClose) {
        var primaryClose = (primaryStreamClose || Rx.Observable.never())
            .startWith(null)
            .map(function (m) { return { type: ItemType.close, item: m }; });
        var secondaryClose = (secondaryStreamClose || Rx.Observable.never())
            .startWith(null)
            .map(function (m) { return { type: ItemType.close, item: m }; });
        var primes = primaryStream
            .map(function (m) { return tulpe(ItemType.first, m); })
            .merge(primaryClose);
        var seconds = secondaryStream
            .map(function (m) { return tulpe(ItemType.second, m); })
            .merge(secondaryClose);
        var combines = primes.combineLatest(seconds, function (v1, v2) { return [v1, v2]; });
        var closings = combines.filter(function (v) {
            return (v[0].type == ItemType.first && v[1].type == ItemType.second) ||
                (v[0].type == ItemType.close && v[1].type == ItemType.close);
        });
        var windows = combines.buffer(closings)
            .withLatestFrom(closings, function (v, c) {
            var latest_p = v[v.length - 1][0];
            var latest_s = v[v.length - 1][1];
            return v.map(function (m) {
                return [m[0], latest_p.type != ItemType.close ? latest_s : latest_p];
            });
        })
            .selectMany(function (v) { return Rx.Observable.fromArray(v); })
            .distinctUntilChanged(function (v) { return v[0].item; });
        var results = windows.filter(function (v) { return v[0].type != ItemType.close && !(v[0].type == ItemType.close && v[1].type == ItemType.close); });
        return results.map(function (val) {
            return { primary: val[0].item, secondary: val[1].item };
        });
    }
    combinator.combine = combine;
})(combinator = exports.combinator || (exports.combinator = {}));
