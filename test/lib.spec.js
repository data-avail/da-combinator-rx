///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var lib = require('../src/index');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("tests for combine | no cancel", function () {
    it("simplest case, p-s, should issue result immediately after s arrival", function () {
        //[f1]--------
        //------[s1]--
        //============
        //------[f1]--
        //------[s1]--
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(300, "f1"), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(600, "s1"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([onNext(600, { primary: "f1", secondary: "s1" })]);
    });
    it("p-p-s, should issue 2 results immediately after s arrival", function () {
        //[f1]--[f2]-----------
        //------------[s1]-----
        //=====================
        //------------[f1][f2]-
        //------------[s1][s1]-
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(300, "f1"), onNext(400, "f2"), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(500, "s1"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([
            onNext(500, { primary: "f1", secondary: "s1" }),
            onNext(500, { primary: "f2", secondary: "s1" }),
        ]);
    });
    it("s-p, should issue result as soon as p arrive", function () {
        //------------[f1]--
        //[s1]-------------
        //=====================
        //------------[f1]-
        //------------[s1]-
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(500, "f1"), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(300, "s1"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([
            onNext(500, { primary: "f1", secondary: "s1" })
        ]);
    });
    it("s-s-p, should issue result with latest s as soon as p arrive", function () {
        //------------[f1]--
        //[s1]---[s2]-------
        //=====================
        //------------[f1]-
        //------------[s2]-
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(500, "f1"), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(300, "s1"), onNext(400, "s2"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([
            onNext(500, { primary: "f1", secondary: "s2" })
        ]);
    });
    it("s-p-s, should issue single result as soon as p arrive with first s", function () {
        //------[p1]--------
        //[s1]--------[s2]-------
        //=====================
        //------[p1]------
        //------[s2]-------
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(500, "p1"), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(300, "s1"), onNext(600, "s2"), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([
            onNext(500, { primary: "p1", secondary: "s1" })
        ]);
    });
    it("s-s-p-p-s-s-p, should issue results in correct order", function () {
        //------------[p1]--[p2]-------------[p3]--
        //[s1]--[s2]-------------[s3]--[s4]---------
        //=========================================
        //------------[p1]---[p2]-------------[p3]--
        //------------[s2]---[s2]-------------[s4]--
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(500, "p1"), onNext(600, "p2"), onNext(1000, "p3"), onCompleted(1700));
        var ss = scheduler.createHotObservable(onNext(300, "s1"), onNext(400, "s2"), onNext(700, "s3"), onNext(900, "s4"), onCompleted(1700));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([
            onNext(500, { primary: "p1", secondary: "s2" }),
            onNext(600, { primary: "p2", secondary: "s2" }),
            onNext(1000, { primary: "p3", secondary: "s4" })
        ]);
    });
});
