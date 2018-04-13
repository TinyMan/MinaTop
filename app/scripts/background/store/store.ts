import memoize from 'lodash-es/memoize';

export type Subscriber<T> = (state: T) => void;
export interface Action<T> {
  readonly type: string;
  reduce: (state: T) => T;
}

export class Store<T extends { [key: string]: any }> {
  private subscribers: Subscriber<T>[];
  private state: T;

  constructor(initialState: T) {
    this.subscribers = [];
    this.state = initialState;
  }

  get value() {
    return this.state;
  }

  public subscribe(fn: (state: T) => void) {
    this.subscribers = [...this.subscribers, fn];
    this.notify();
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }

  public dispatch(action: Action<T>) {
    this.state = this.reduce(this.state, action);
    this.notify();
  }

  private reduce(state: T, action: Action<T>) {
    return action.reduce(this.state);
  }

  private notify() {
    this.subscribers.map(fn => fn(this.state));
  }
}


export type Selector<T, T1> = (state: T) => T1;

export function makeSelector<T, T1>(fun: (state: T) => T1) {
  return memoize(fun);
}
