/// <reference path="../typings/tsd.d.ts" />
import * as Rx from "rx";
export declare module combinator {
    function combine<P, S>(primaryStream: Rx.Observable<P>, secondaryStream: Rx.Observable<S>, primaryStreamClose?: Rx.Observable<any>, secondaryStreamClose?: Rx.Observable<any>): Rx.Observable<{
        primary: P;
        secondary: S;
    }>;
}
