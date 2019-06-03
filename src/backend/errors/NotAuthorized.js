class NotAuthorized extends Error{
  constructor(params){
    super(params);
    this.status = 401;
    this.message = "You are not Authorized";
  }
}

module.exports = NotAuthorized;
