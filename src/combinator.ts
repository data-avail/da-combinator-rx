///<reference path="../typings/tsd.d.ts"/>
import * as Rx from "rx";

export interface ICombinedResult<P, S> {
	p: P,
	s: S
} 

function result<P, S>(p: P, s: S) {return {p: p, s: s} };

export function waitFor<P, S>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<S>): Rx.Observable<ICombinedResult<P, S>> {										
	
	return stream.selectMany(p => {
		//zip - will wait till, withLatestFrom - not
		var ps = close(p); 
		
		return Rx.Observable.just(p).zip(ps, result).take(1);
	});
			
}

export function combine<P, S, R>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, scheduler?: Rx.IScheduler, secondaryUseReplay: boolean = true): Rx.Observable<ICombinedResult<P, S>> {										
 		
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

export function combineGroup<P, S>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, keySelector: (item: IStreamItem) => string, scheduler?: Rx.IScheduler): Rx.Observable<ICombinedResult<P, S>> {										
		
		
		var secAcc = secondary.scan((acc: any, val: S) => {
			 acc[keySelector(item(StreamType.secondary, val))] = val;
			 return acc; 
		}, {}).shareReplay(1, null, scheduler);
		
		secAcc.subscribe(_=>_);			
		
		//primary.subscribe(_=>console.log("---", _));
			
        /*									
		var merged = primary.map(p => item(StreamType.primary, p))
		.merge(secAcc.map(s => item(StreamType.secondary, s)));
		*/
									
		var res = primary.groupBy(p => keySelector(item(StreamType.primary, p)))
		.flatMap(gp => {
			var gs = secAcc.map(s => s[gp.key]).filter(f => !!f);
			
			
			/*  
			var ps = v.filter(p => p.type == StreamType.primary).map(p => p.item);
			var ss = v.filter(s => s.type == StreamType.secondary).map(s => s.item[v.key]);
			*/
			return combine(gp, gs, scheduler, false);
		});
				
		//res.subscribe(_=>console.log("---", _));
		
		return res;		
}

