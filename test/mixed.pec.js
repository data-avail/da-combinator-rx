///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var combinator = require('../src/combinator');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("mix test", function () {
    it.only("mixed", function () {
        //[pa1]---[pb1]--------------
        //--[sb1]--------------[sa1]-
        //===========================
        //--------[pb1]--------[pa1]-
        //--------[sb1]--------[sa1]-
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, { k: "a", v: "pa1" }), onNext(400, { k: "b", v: "pb1" }), onCompleted(1500));
        var ss = scheduler.createHotObservable(onNext(320, { k: "b", v: "sb1" }), onNext(420, { k: "a", v: "sa1" }), onCompleted(1500));
        var res = scheduler.startWithDispose(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        }, 2000);
        expect(res.messages).eqls([
            onNext(401, { p: { k: "b", v: "pb1" }, s: { k: "b", v: "sb1" } }),
            onNext(421, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onCompleted(1500)
        ]);
    });
    it("mixed groups", function () {
        //[oa1]---[ob1]-[oa2]-----------------------[oa3]---[ob3]-
        //--[qb1]--------[qa1]---[qa2]--[qb2]-[qb3]---------------
        //========================================================
        //---------[ob1]-[oa1][oa2]-----------------[oa3]---[ob3]
        //---------[qb1]-[qa1][qa1]-----------------[qa2]---[qb3]
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(100, { k: "a", v: "pa1" }), onNext(300, { k: "b", v: "pb1" }), onCompleted(1000));
        var ss = scheduler.createHotObservable(onNext(150, { k: "b", v: "sb1" }), onNext(405, { k: "a", v: "sa1" }), onNext(500, { k: "a", v: "sa2" }), onNext(600, { k: "b", v: "sb2" }), onNext(700, { k: "b", v: "sb3" }), onCompleted(1000));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        console.log(res.messages);
        expect(res.messages).eqls([
            onNext(301, { p: { k: "b", v: "pb1" }, s: { k: "b", v: "sb1" } }),
            onNext(406, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onCompleted(1000)
        ]);
    });
});
