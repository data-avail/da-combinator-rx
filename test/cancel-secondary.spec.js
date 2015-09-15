///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var lib = require('../src/index');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("tests for combine | cancel secondary", function () {
    it("simplest case, p-s-y, should issue single p+s result immediately after s arrival", function () {
        //[p1]---------------
        //------[s1]---[y1]-----
        //===================
        //------[p1]---------
        //------[s1]--------
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, "p1"), onCompleted(1000));
        var ss = scheduler.createHotObservable(onNext(600, "s1"), onCompleted(1000));
        var sp = scheduler.createHotObservable(onNext(700, "y1"), onCompleted(1000));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(ps, ss, null, sp);
        });
        expect(res.messages).eqls([onNext(600, { primary: "p1", secondary: "s1" })]);
    });
    it("p-y-s, should issue p1+s1 results", function () {
        //[p1]-------------
        //-----[y1]---[s1]----
        //==================
        //------------------
        //------------------
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, "p1"), onCompleted(1000));
        var ss = scheduler.createHotObservable(onNext(600, "s1"), onCompleted(1000));
        var ys = scheduler.createHotObservable(onNext(400, "y1"), onCompleted(1000));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(ps, ss, null, ys);
        });
        expect(res.messages).eqls([
            onNext(600, { primary: "p1", secondary: "s1" }),
        ]);
    });
    it("s-y-p, should issue no results", function () {
        //----------------[p1]--
        //---[s1]----[y1]-------
        //======================
        //----------------------
        //----------------------
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(700, "p1"), onCompleted(1000));
        var ss = scheduler.createHotObservable(onNext(300, "s1"), onCompleted(1000));
        var yp = scheduler.createHotObservable(onNext(400, "y1"), onCompleted(1000));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(ps, ss, null, yp);
        });
        expect(res.messages).eqls([]);
    });
    it("p-s-y-p, should issue p+s results", function () {
        //[p1]--------------[p2]---
        //------[s1]--[y1]-------------
        //=========================
        //------[p1]--------------
        //------[s1]------------
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, "p1"), onNext(700, "p2"), onCompleted(1000));
        var ss = scheduler.createHotObservable(onNext(400, "s1"), onCompleted(1000));
        var yp = scheduler.createHotObservable(onNext(500, "y1"), onCompleted(1000));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(ps, ss, null, yp);
        });
        expect(res.messages).eqls([
            onNext(400, { primary: "p1", secondary: "s1" })
        ]);
    });
});
