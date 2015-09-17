///<reference path="../typings/tsd.d.ts"/>
import * as Rx from "rx";

export function combine<P, R>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<R>): Rx.Observable<{p: P, r: R}> {										
	return stream.selectMany(p => {
		//zip - will wait till, withLatestFrom - not
		var ps = close(p); 
		return Rx.Observable.just(p).zip(ps, (x, y) => {return {p : x, r : y}});
	}).take(1);	
}




