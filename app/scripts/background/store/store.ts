import memoize from 'lodash-es/memoize';

export type Subscriber<T> = (state: T) => void;
export type Effect<T> = (state: T, action: Action<T>) => Action<T> | Action<T>[] | void
export class Action<T> {
  readonly type: string;
  reduce: (state: T) => T;
}

export class Store<T extends { [key: string]: any }> {
  private subscribers: Subscriber<T>[];
  private effects = new Map<string, Set<Effect<T>>>();
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

  public addEffect(effect: Effect<T>, actionType: string) {
    let s = this.effects.get(actionType);
    if (!s) {
      s = new Set();
    }
    s.add(effect);
    this.effects.set(actionType, s);
  }

  public dispatch(action: Action<T>) {
    this.state = this.reduce(this.state, action);
    const effects = this.effects.get(action.constructor.name)
    if (effects) {
      const actions: Action<T>[] = [];
      for (var e of effects.values()) {
        const ret = e(this.state, action);
        if (ret instanceof Action) {
          actions.push(ret);
        } else if (ret instanceof Array) {
          actions.push(...ret);
        }
      }
    }
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
