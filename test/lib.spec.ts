///<reference path="../typings/tsd.d.ts"/>

import * as chai from 'chai'; 
import * as lib from '../src/index';
import * as Rx from 'rx/index';
var expect = chai.expect;


var onNext = Rx.ReactiveTest.onNext,
    onCompleted = Rx.ReactiveTest.onCompleted,
    subscribe = Rx.ReactiveTest.subscribe;

	
describe("tests for combine",  () => {

	it("simplest case, s-p, should issue result immediately after p arrival",  (done) => {
							
		//[f1]--------
		//------[s1]--
		//============
		//------[f1]--
		//------[s1]--

		
		var scheduler = new Rx.TestScheduler();
								
		var fs = scheduler.createHotObservable(
			onNext(300, "f1"), 
			onCompleted(500)
		);
		
					
		var ss = scheduler.createHotObservable(
			onNext(400, "s1"), 
			onCompleted(500)
		);
		
							
		var res = scheduler.startWithCreate(() => 
			lib.combinator
				.combine(fs, ss, Rx.Observable.never(), Rx.Observable.never())		
		);
							
		expect(res.messages).eqls(
			[onNext(400, {primary : "f1", secondary: "s1"})]
		);
		
		done();
	})	
	
	it.only("p-p-s, should issue 2 results immediately after s arrival",  (done) => {
		//[f1]--[f2]-----------
		//------------[s1]-----
		//=====================
		//------------[f1][f2]-
		//------------[s1][s1]-

		var scheduler = new Rx.TestScheduler();
								
		var fs = scheduler.createHotObservable(
			onNext(300, "f1"), 
			onNext(400, "f2"),
			onCompleted(700)
		);
		
					
		var ss = scheduler.createHotObservable(
			onNext(500, "s1"), 
			onCompleted(700)
		);
		
							
		var res = scheduler.startWithCreate(() => 
			lib.combinator
				.combine(fs, ss, Rx.Observable.never(), Rx.Observable.never())		
		);
							
		expect(res.messages).eqls(
			[
				onNext(500, {primary : "f1", secondary: "s1"}),
				onNext(500, {primary : "f2", secondary: "s1"}),
			]
		);
		
		done();
		
	})	
}) 

