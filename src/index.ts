///<reference path="../typings/tsd.d.ts"/>
import * as Rx from "rx";

export module combinator {

	enum ItemType {
		first, second, close
	}
	
	interface ITulpe {type: ItemType, item: any};
	function tulpe(type: ItemType, item: any) : ITulpe {return {type : type, item: item}}
	

	export function combine<P, S>(
		primaryStream: Rx.Observable<P>,
		secondaryStream: Rx.Observable<S>,
		primaryStreamClose?: Rx.Observable<any>,
		secondaryStreamClose?: Rx.Observable<any>
		): Rx.Observable<{ primary: P, secondary: S }> {
										
		var primaryClose = (primaryStreamClose || Rx.Observable.never())
			.startWith(null)
			.map(m => {return {type : ItemType.close, item : m}});
		
		var secondaryClose = (secondaryStreamClose || Rx.Observable.never())
			.startWith(null)
			.map(m => {return {type : ItemType.close, item : m}});
								
		//(type, x/f)
		var primes = primaryStream
			.map(m => tulpe(ItemType.first, m))
			.merge(primaryClose);
												  	
		//(type, x/s)
		var seconds = secondaryStream
			.map(m => tulpe(ItemType.second, m))
			.merge(secondaryClose);
										
		//[[(type, x/f),(type, x/s)]
		var combines = primes.combineLatest(seconds, (v1, v2) => [v1, v2]);
	 				
		//filter 
		//[f && s] || [x && x], distinct changed [f]  
		var closings = combines.filter(v =>
			(v[0].type == ItemType.first && v[1].type == ItemType.second) ||
			(v[0].type == ItemType.close && v[1].type == ItemType.close));		
		
		//primes.subscribe(val => console.log("iii", val));			
		//combines.subscribe(val => console.log("$$$$", val));			
		//seconds.subscribe(val => console.log("+++", seconds));
		//closings.subscribe(val => console.log("---", val));
		
		//[(f1, s:latest), (f2, s:latest)]
		var windows = combines.buffer(closings)
		//grab latest from secondary and pair it with all primary
		.withLatestFrom(closings, (v, c) => { 

			var latest_p = v[v.length - 1][0];  
			var latest_s = v[v.length - 1][1];
			
			return v.map(m => { 
				return [ m[0], latest_p.type != ItemType.close ? latest_s : latest_p ]; 
			})
		}) 
		.selectMany(v => Rx.Observable.fromArray(v))
		.distinctUntilChanged(v => v[0].item);
		
		
		//windows.subscribe(val => console.log("***", val));
		
		var results = windows.filter(v => v[0].type != ItemType.close && !(v[0].type == ItemType.close && v[1].type == ItemType.close));
			
		return results.map(val => {
			return { primary: val[0].item, secondary: val[1].item }
		});
		
	}
}



