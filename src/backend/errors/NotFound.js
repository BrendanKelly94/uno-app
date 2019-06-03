class NotFound extends Error{
  constructor(params){
    super(params);
    this.status = 404;
    this.message = "Not Found";
  }
}

module.exports = NotFound;
