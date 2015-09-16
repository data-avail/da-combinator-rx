/// <reference path="../typings/tsd.d.ts" />
import * as Rx from "rx";
export declare function combine<P, R>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<R>): Rx.Observable<{
    p: P;
    r: R;
}>;
