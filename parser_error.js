class ParserError extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, ParserError);
  }
}

export default ParserError;
