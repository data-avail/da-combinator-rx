///<reference path="../typings/tsd.d.ts"/>
import * as Rx from "rx";

export function waitFor<P, R>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<R>): Rx.Observable<{p: P, r: R}> {										
	
	return stream.selectMany(p => {
		//zip - will wait till, withLatestFrom - not
		var ps = close(p); 
		return Rx.Observable.just(p).zip(ps, (x, y) => {return {p : x, r : y}}).take(1);
	});
			
}

export function combine<P, S, R>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>,  close?: (p: P) => Rx.Observable<R>, scheduler?: Rx.IScheduler): Rx.Observable<{p: P, r: R|S}> {										
		
		var secondaryReplay = secondary.shareReplay(1, null, scheduler);

		//Rx.Observable.using(() => secondaryReplay.subscribe(_=>_), _ => primary);
		secondaryReplay.subscribe(_=>_);
		//primary.subscribe(val => console.log(val));
		return waitFor(primary, () => secondaryReplay);
	
}



