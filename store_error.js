class StoreError extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, StoreError);
  }
}

export default StoreError;
