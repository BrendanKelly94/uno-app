class CustomError extends Error {
  constructor({ message, status }, ...params){
    super(params);
    this.message = message;
    this.status = status;
  }
}

export default CustomError;
