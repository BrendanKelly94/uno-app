class NotKnown extends Error{
  constructor(params){
    super(params);
    this.status = 500;
    this.message = "Something went wrong";
  }
}

module.exports = NotKnown;
