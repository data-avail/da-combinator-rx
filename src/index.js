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
        var primes = primaryStream
            .map(function (m) { return tulpe(ItemType.first, m); })
            .merge(primaryStreamClose.map(function (m) { return tulpe(ItemType.close, m); }));
        var seconds = secondaryStream
            .map(function (m) { return tulpe(ItemType.second, m); })
            .merge(secondaryStreamClose.map(function (m) { return tulpe(ItemType.close, m); }))
            .shareReplay(null, 1);
        var combines = primes.combineLatest(seconds, function (v1, v2) { return [v1, v2]; });
        var closings = combines.filter(function (v) {
            return (v[0].type == ItemType.first && v[1].type == ItemType.second) ||
                (v[0].type == ItemType.close && v[1].type == ItemType.close);
        })
            .distinctUntilChanged(function (v) { return v[0].item; });
        var windows = primes.join(seconds, function (_) { return closings; }, function (_) { return closings; }, function (v1, v2) { return [v1, v2]; });
        var results = windows.filter(function (v) { return v[0].type != ItemType.close && v[1].type != ItemType.close; });
        return results.map(function (val) {
            return { primary: val[0].item, secondary: val[1].item };
        });
    }
    combinator.combine = combine;
})(combinator = exports.combinator || (exports.combinator = {}));
