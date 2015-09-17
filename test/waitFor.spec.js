///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var combinator = require('../src/combinator');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("combintor test", function () {
    it("simplest case, p-x, should issue result immediately after x arrival", function () {
        //[p1]--------
        //------[x1]--
        //============
        //------[p1]--
        //------[x1]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, "p1"), onCompleted(700));
        var xs = scheduler.createHotObservable(onNext(600, "x1"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.waitFor(ps, function (p) { return xs; });
        });
        expect(res.messages).eqls([
            onNext(600, { p: "p1", r: "x1" }),
            onCompleted(700)
        ]);
    });
    it("simplest case, x(replyed)-p, should issue result after p arrival + interval of x", function () {
        //-----------[p1]------------
        //---[x1]--------------------
        //=========================
        //------------------[p1]-----
        //------------------[x1]----
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(400, "p1"), onCompleted(800));
        var xs = scheduler.createColdObservable(onNext(100, "x1"), onCompleted(800)).shareReplay(null, 1);
        var res = scheduler.startWithCreate(function () {
            return combinator.waitFor(ps, function (p) { return xs; });
        });
        expect(res.messages).eqls([
            onNext(500, { p: "p1", r: "x1" }),
            onCompleted(800)
        ]);
    });
    it("x-p, should issue result after p arrival", function () {
        //-----------[p1]------------
        //---[x1]--------------------
        //=========================
        //-----------[p1]-----
        //-----------[x1]----
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(400, "p1"), onCompleted(800));
        var xs = scheduler.createColdObservable(onNext(100, "x1"), onCompleted(800)).shareReplay(1, null, scheduler);
        xs.subscribe(function (_) { return _; });
        var res = scheduler.startWithCreate(function () {
            return combinator.waitFor(ps, function (p) { return xs; });
        });
        expect(res.messages).eqls([
            onNext(401, { p: "p1", r: "x1" }),
            onCompleted(800)
        ]);
    });
    it("x1-x2-p, should issue p1+x2 after p arrival", function () {
        //------------[p1]------------
        //--[x1]-[x2]-------------------
        //=========================
        //------------[p1]-----
        //------------[x2]----
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(400, "p1"), onCompleted(800));
        var xs = scheduler.createColdObservable(onNext(100, "x1"), onNext(200, "x2"), onCompleted(800)).shareReplay(1, null, scheduler);
        xs.subscribe(function (_) { return _; });
        var res = scheduler.startWithCreate(function () {
            return combinator.waitFor(ps, function (p) { return xs; });
        });
        expect(res.messages).eqls([
            onNext(401, { p: "p1", r: "x2" }),
            onCompleted(800)
        ]);
    });
});
