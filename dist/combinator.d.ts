import * as Rx from "rx";
export interface ICombinedResult<P, S> {
    p: P;
    s: S;
}
export declare function waitFor<P, S>(stream: Rx.Observable<P>, close: (p: P) => Rx.Observable<S>): Rx.Observable<ICombinedResult<P, S>>;
export declare function combine<P, S, R>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, scheduler?: Rx.IScheduler, secondaryUseReplay?: boolean): Rx.Observable<ICombinedResult<P, S>>;
export declare enum StreamType {
    primary = 0,
    secondary = 1,
}
export interface IStreamItem {
    type: StreamType;
    item: any;
}
export declare function combineGroup<P, S>(primary: Rx.Observable<P>, secondary: Rx.Observable<S>, keySelector: (item: IStreamItem) => string, scheduler?: Rx.IScheduler): Rx.Observable<ICombinedResult<P, S>>;
