///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var combinator = require('../src/combinator');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("mix test", function () {
    it("mixed", function () {
        //[pa1]---[pb1]--------------
        //--[sb1]--------------[sa1]-
        //===========================
        //--------[pb1]--------[pa1]-
        //--------[sb1]--------[sa1]-
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(100, { k: "a", v: "pa1" }), onNext(400, { k: "b", v: "pb1" }), onCompleted(1500));
        var ss = scheduler.createHotObservable(onNext(320, { k: "b", v: "sb1" }), onNext(420, { k: "a", v: "sa1" }), onCompleted(1500));
        var res = scheduler.startWithTiming(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        }, 0, 0, 2000);
        expect(res.messages).eqls([
            onNext(401, { p: { k: "b", v: "pb1" }, s: { k: "b", v: "sb1" } }),
            onNext(421, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onCompleted(1500)
        ]);
    });
    it("mixed groups", function () {
        //[pa1]---[pb1]-[pa2]-----------------------[pa3]---[pb2]-
        //--[sb1]--------[sa1]---[sa2]--[sb2]-[sb3]---------------
        //========================================================
        //---------[pb1]-[pa1][pa2]-----------------[pa3]---[pb2]
        //---------[sb1]-[sa1][sa1]-----------------[sa2]---[sb3]
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(100, { k: "a", v: "pa1" }), onNext(300, { k: "b", v: "pb1" }), onNext(400, { k: "a", v: "pa2" }), onNext(1100, { k: "a", v: "pa3" }), onNext(1200, { k: "b", v: "pb2" }), onCompleted(1900));
        var ss = scheduler.createHotObservable(onNext(150, { k: "b", v: "sb1" }), onNext(405, { k: "a", v: "sa1" }), onNext(500, { k: "a", v: "sa2" }), onNext(600, { k: "b", v: "sb2" }), onNext(700, { k: "b", v: "sb3" }), onCompleted(1900));
        var res = scheduler.startWithTiming(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        }, 0, 0, 2000);
        expect(res.messages).eqls([
            onNext(301, { p: { k: "b", v: "pb1" }, s: { k: "b", v: "sb1" } }),
            onNext(406, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onNext(406, { p: { k: "a", v: "pa2" }, s: { k: "a", v: "sa1" } }),
            onNext(1101, { p: { k: "a", v: "pa3" }, s: { k: "a", v: "sa2" } }),
            onNext(1201, { p: { k: "b", v: "pb2" }, s: { k: "b", v: "sb3" } }),
            onCompleted(1900)
        ]);
    });
});
