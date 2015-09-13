///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var lib = require('../src/index');
var Rx = require('rx/index');
var expect = chai.expect;
var onNext = Rx.ReactiveTest.onNext, onCompleted = Rx.ReactiveTest.onCompleted, subscribe = Rx.ReactiveTest.subscribe;
describe("tests for combine", function () {
    it("simplest case, s-p, should issue result immediately after p arrival", function (done) {
        //[f1]--------
        //------[s1]--
        //============
        //------[f1]--
        //------[s1]--
        var scheduler = new Rx.TestScheduler();
        var fs = scheduler.createHotObservable(onNext(300, "f1"), onCompleted(500));
        var ss = scheduler.createHotObservable(onNext(400, "s1"), onCompleted(500));
        var res = scheduler.startWithCreate(function () {
            return lib.combinator
                .combine(fs, ss, Rx.Observable.never(), Rx.Observable.never());
        });
        expect(res.messages).eqls([onNext(400, { primary: "f1", secondary: "s1" })]);
        done();
    });
    it.only("p-p-s, should issue 2 results immediately after s arrival", function (done) {
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
        done();
    });
});
