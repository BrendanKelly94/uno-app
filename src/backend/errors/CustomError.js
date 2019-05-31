class CustomError extends Error{
  constructor({ status, message }, ...params){
    super(params);
    this.status = status;
    this.message = message;
  }
}

module.exports = CustomError;
