const AsyncHandler = fn => (res, req, next) => {
  if(!res){
    Promise.resolve(fn()).catch(err => {
      next(err);
    })
  }else{
    Promise.resolve(fn(res, req, next)).catch(err => {
      next(err);
    })
  }
}

module.exports = AsyncHandler;
