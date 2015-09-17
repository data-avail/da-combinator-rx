///<reference path="../typings/tsd.d.ts"/>
import * as Rx from "rx";

export function waitFor<P, R>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<R>): Rx.Observable<{p: P, r: R}> {										
	
	return stream.selectMany(p => {
		//zip - will wait till, withLatestFrom - not
		var ps = close(p); 
		
		return Rx.Observable.just(p).zip(ps, (x, y) => {return {p : x, r : y}}).take(1);
	});
			
}

export function combine<P, S, R>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, scheduler?: Rx.IScheduler, secondaryUseReplay: boolean = true): Rx.Observable<{p: P, r: R|S}> {										
 		
		if (secondaryUseReplay) {
			secondary = secondary.shareReplay(1, null, scheduler);
			
			//subscribe immediately to not waiting for while waitFor callback
			//subscription will be disposed on secondaryStream complete
			secondary.subscribe(_=>_);
		}
		
		return waitFor(primary, () => secondary);
	
}

export enum StreamType {primary, secondary}
export interface IStreamItem {
	type : StreamType
	item : any
}
function item(type: StreamType, item: any) : IStreamItem {return {type: type, item : item}} 

export function combineGroup<P, S, R>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, keySelector: (item: IStreamItem) => string, scheduler?: Rx.IScheduler): Rx.Observable<{p: P, r: R|S}> {										
		
		
		var secAcc = secondary.scan((acc: any, val: S) => {
			 acc[keySelector(item(StreamType.secondary, val))] = val;
			 return acc; 
		}, {}).shareReplay(1, null, scheduler);
		
		secAcc.subscribe(_=>_);
				
		var merged = primary.map(p => item(StreamType.primary, p))
		.merge(secAcc.map(s => item(StreamType.secondary, s)));
		
		return merged.groupBy(keySelector)
		.selectMany(v => {  
			var ps = v.filter(p => p.type == StreamType.primary).map(p => p.item);
			var ss = v.filter(p => p.type == StreamType.secondary).map(p => p.item[v.key]);
			return combine(ps, ss, scheduler, false);
		});				
}

