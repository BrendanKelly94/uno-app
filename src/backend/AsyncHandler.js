const AsyncHandler = fn => (res, req, next) => {
    Promise.resolve(fn(res, req, next)).catch(err => {
      next(err);
    })
}

module.exports = AsyncHandler;
