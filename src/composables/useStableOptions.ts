import { shallowRef, watchEffect, type MaybeRef, toValue, type ShallowRef } from 'vue';

type WeakKey = object;

function isPlainObjectOrArray(
  obj: unknown
): obj is Record<string, unknown> | unknown[] {
  return (
    (obj !== null &&
      typeof obj === 'object' &&
      [null, Object.prototype].includes(Object.getPrototypeOf(obj))) ||
    Array.isArray(obj)
  );
}

export function deepEqualIgnoringFns(
  a: unknown,
  b: unknown,
  seen = new WeakMap<WeakKey, unknown>()
): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a === 'function' && typeof b === 'function') {
    return true;
  }

  if (!isPlainObjectOrArray(a) || !isPlainObjectOrArray(b)) {
    return false;
  }

  const mapped = seen.get(a as WeakKey);
  if (mapped && mapped === b) return true;
  seen.set(a as WeakKey, b);

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualIgnoringFns(a[i], b[i], seen)) return false;
    }
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    const k = aKeys[i];
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;

    const av = (a as Record<string, unknown>)[k];
    const bv = (b as Record<string, unknown>)[k];

    if (!deepEqualIgnoringFns(av, bv, seen)) return false;
  }

  return true;
}

type ValueRef<T> = Pick<ShallowRef<T>, 'value'>;

export function withLatestFunctionWrappers<T extends Record<string, any>>(
  ref: ValueRef<T>
): T {
  const path: (string | number)[] = [];

  const getByPath = (root: any, p: (string | number)[]) =>
    p.reduce((acc, k) => (acc == null ? acc : acc[k]), root);

  const wrap = (parentPath: (string | number)[], key: string | number) => {
    return (...args: any[]) => {
      const latestParent = getByPath(ref.value, parentPath);
      const latestFn: any = latestParent?.[key];
      if (typeof latestFn === 'function') {
        return latestFn.apply(latestParent, args);
      }
    };
  };

  const visit = (v: any): any => {
    if (typeof v === 'function') {
      const key = path[path.length - 1];
      const parentPath = path.slice(0, -1);
      return wrap(parentPath, key ?? '');
    }
    if (Array.isArray(v)) {
      const base = path.length;
      const out = new Array(v.length);
      for (let i = 0; i < v.length; i++) {
        path[base] = i;
        out[i] = visit(v[i]);
      }
      path.length = base;
      return out as any;
    }
    if (v && typeof v === 'object') {
      const base = path.length;
      const out: Record<string, any> = {};
      for (const k of Object.keys(v)) {
        path[base] = k;
        out[k] = visit(v[k]);
      }
      path.length = base;
      return out as any;
    }
    return v;
  };

  return visit(ref.value);
}

export function useStableOptions<T extends Record<string, any>>(
  options: MaybeRef<T>
): ShallowRef<T> {
  const latestOptions = shallowRef<T>(toValue(options)) as ShallowRef<T>;
  const snapshot = shallowRef<T>(latestOptions.value) as ShallowRef<T>;
  const wrapLatest = () =>
    withLatestFunctionWrappers(latestOptions as ValueRef<T>) as T;
  const shaped = shallowRef<T>(wrapLatest()) as ShallowRef<T>;

  watchEffect(() => {
    const next = toValue(options);
    latestOptions.value = next;

    if (!deepEqualIgnoringFns(snapshot.value, next)) {
      snapshot.value = next;
      shaped.value = wrapLatest();
    }
  });

  return shaped;
}
