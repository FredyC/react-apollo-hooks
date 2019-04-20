export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function isPlainObject(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}

export function objToKey<T extends Record<string, any>>(obj: T): T | string {
  if (!isPlainObject(obj)) {
    return obj;
  }
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = objToKey(obj[key]);
      return result;
    }, {});
  return JSON.stringify(sortedObj);
}

export function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return value != null && typeof (value as PromiseLike<T>).then === 'function';
}

export function compact(obj: any) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
      }

      return acc;
    },
    {} as any
  );
}
