export interface SuspenseResource<T> {
  read(): T;
}

export function createSuspenseResource<T>(
  promise: Promise<T>,
): SuspenseResource<T> {
  let status: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (value) => {
      status = 'fulfilled';
      result = value;
    },
    (err) => {
      status = 'rejected';
      error = err;
    },
  );

  return {
    read() {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'rejected':
          throw error;
        case 'fulfilled':
          return result;
      }
    },
  };
}
