///<reference path="../typings/tsd.d.ts"/>

import * as chai from 'chai';
import * as combinator from '../src/combinator';
import * as Rx from 'rx/index';
var expect = chai.expect;


var onNext = Rx.ReactiveTest.onNext,
    onCompleted = Rx.ReactiveTest.onCompleted,
    subscribe = Rx.ReactiveTest.subscribe;


describe("mix test", () => {
	
	it("mixed", () => {
							
		//[pa1]---[pb1]--------------
		//--[sb1]--------------[sa1]-
		//===========================
		//--------[pb1]--------[pa1]-
		//--------[sb1]--------[sa1]-

		/**
		 * Important, tests from 300 - ms
		 */
		
		var scheduler = new Rx.TestScheduler();

		var ps = scheduler.createHotObservable(
			onNext(100, {k : "a", v : "pa1"}),
			onNext(400, {k : "b", v : "pb1"}),
			onCompleted(1500)
			);


		var ss = scheduler.createHotObservable(
			onNext(320, {k : "b", v : "sb1"}),
			onNext(420, {k : "a", v : "sa1"}),
			onCompleted(1500)
			);


		var res = scheduler.startWithTiming(() =>
			combinator.combineGroup(ps, ss, (i) => i.item.k, scheduler)
		,0 , 0, 2000);
	

		expect(res.messages).eqls(
			[
				onNext(401, { p: {k : "b", v : "pb1"}, s: {k : "b", v : "sb1"} }),
				onNext(421, { p: {k : "a", v : "pa1"}, s: {k : "a", v : "sa1"} }),
				onCompleted(1500)
			]
			);
			
		//setTimeout(done, 5000);			
	})
	

	it("mixed groups", () => {
							
		//[pa1]---[pb1]-[pa2]-----------------------[pa3]---[pb2]-
		//--[sb1]--------[sa1]---[sa2]--[sb2]-[sb3]---------------
		//========================================================
		//---------[pb1]-[pa1][pa2]-----------------[pa3]---[pb2]
		//---------[sb1]-[sa1][sa1]-----------------[sa2]---[sb3]

		
		var scheduler = new Rx.TestScheduler();

		var ps = scheduler.createHotObservable(
			onNext(100, {k : "a", v : "pa1"}),
			onNext(300, {k : "b", v : "pb1"}),
			onNext(400, {k : "a", v : "pa2"}),
			onNext(1100, {k : "a", v : "pa3"}),
			onNext(1200, {k : "b", v : "pb2"}),
			onCompleted(1900)
			);


		var ss = scheduler.createHotObservable(
			onNext(150, {k : "b", v : "sb1"}),
			onNext(405, {k : "a", v : "sa1"}),
			onNext(500, {k : "a", v : "sa2"}),
			onNext(600, {k : "b", v : "sb2"}),
			onNext(700, {k : "b", v : "sb3"}),
			onCompleted(1900)
			);


		var res = scheduler.startWithTiming(() =>
			combinator.combineGroup(ps, ss, (i) => i.item.k, scheduler)
		,0,0,2000);
		
		expect(res.messages).eqls(
			[
				onNext(301, { p: {k : "b", v : "pb1"}, s: {k : "b", v : "sb1"} }),
				onNext(406, { p: {k : "a", v : "pa1"}, s: {k : "a", v : "sa1"} }),
				onNext(406, { p: {k : "a", v : "pa2"}, s: {k : "a", v : "sa1"} }),
				onNext(1101, { p: {k : "a", v : "pa3"}, s: {k : "a", v : "sa2"} }),
				onNext(1201, { p: {k : "b", v : "pb2"}, s: {k : "b", v : "sb3"} }),
				onCompleted(1900)
			]
			);
			
		//setTimeout(done, 5000);			
	})
	
});