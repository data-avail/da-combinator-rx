///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var combinator = require('../src/combinator');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe.only("combintor grouped test", function () {
    it("p-s => p+s after s arrival", function () {
        //[pa1]--------
        //------[sa1]--
        //============
        //------[pa1]--
        //------[sa1]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, { k: "a", v: "pa1" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(600, { k: "a", v: "sa1" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(601, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onCompleted(700)
        ]);
    });
    it("p1-p2-s => p1+s1, p2+s1 after s arrival", function () {
        //[pa1]-[pa2]------------
        //-----------[sa1]------
        //======================
        //-----------[pa1]-[pa2]--
        //-----------[sa1]-[sa1]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, { k: "a", v: "pa1" }), onNext(400, { k: "a", v: "pa2" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(600, { k: "a", v: "sa1" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(601, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onNext(601, { p: { k: "a", v: "pa2" }, s: { k: "a", v: "sa1" } }),
            onCompleted(700)
        ]);
    });
    it("s-p => p+s after p arrival", function () {
        //------[pa1]--
        //-[sa1]-------
        //============
        //------[pa1]--
        //------[sa1]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(500, { k: "a", v: "pa1" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(300, { k: "a", v: "sa1" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(501, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onCompleted(700)
        ]);
    });
    it("s1-s2-p1 => p1+s2 after p arrival", function () {
        //------------[pa1]---
        //-[sa1]-[sa2]---------
        //==================
        //------------[pa1]--
        //------------[sa2]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(500, { k: "a", v: "pa1" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(300, { k: "a", v: "sa1" }), onNext(400, { k: "a", v: "sa2" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(501, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa2" } }),
            onCompleted(700)
        ]);
    });
    it("p1-s-p2 => p1+s-p2+s", function () {
        //--[pa1]------[pa2]--
        //-------[sa1]-------
        //==================
        //-------[pa1]-[pa2]--
        //-------[sa1]-[sa1]--
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, { k: "a", v: "pa1" }), onNext(500, { k: "a", v: "pa2" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(400, { k: "a", v: "sa1" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(401, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onNext(501, { p: { k: "a", v: "pa2" }, s: { k: "a", v: "sa1" } }),
            onCompleted(700)
        ]);
    });
    it("p1-s1-p2-s2 => p1+s1-p2+s1", function () {
        //--[pa1]------[pa2]------
        //-------[sa1]-------[sa2]
        //======================
        //-------[pa1]-[pa2]------
        //-------[sa1]-[sa1]-------
        var scheduler = new Rx.TestScheduler();
        var ps = scheduler.createHotObservable(onNext(300, { k: "a", v: "pa1" }), onNext(500, { k: "a", v: "pa2" }), onCompleted(700));
        var ss = scheduler.createHotObservable(onNext(400, { k: "a", v: "sa1" }), onNext(600, { k: "a", v: "sa2" }), onCompleted(700));
        var res = scheduler.startWithCreate(function () {
            return combinator.combineGroup(ps, ss, function (i) { return i.item.k; }, scheduler);
        });
        expect(res.messages).eqls([
            onNext(401, { p: { k: "a", v: "pa1" }, s: { k: "a", v: "sa1" } }),
            onNext(501, { p: { k: "a", v: "pa2" }, s: { k: "a", v: "sa1" } }),
            onCompleted(700)
        ]);
    });
});
