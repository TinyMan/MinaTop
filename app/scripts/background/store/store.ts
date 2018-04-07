export type Subsriber<T> = (state: T) => void;
export interface Action<T> {
  readonly type: string;
  reduce: (state: T) => T;
}

export class Store<T extends { [key: string]: any }> {
  private subscribers: Subsriber<T>[];
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