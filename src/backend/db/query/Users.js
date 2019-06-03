const knex = require("../knex.js");
const CustomError = require("../../errors/CustomError.js");
const NotAuthorized = require("../../errors/NotAuthorized.js");
const NotFound = require("../../errors/NotFound.js");
const NotKnown = require("../../errors/NotKnown.js");


//Users

const addUser = async ({ name, pwd }) => {
  let user;
  try{
   user = await findUser({name: name});
  }catch(e){
    //error will be thrown if user not found; don't do anythings
  }
  if(user) throw new CustomError({status: 200, message: "User already exists"})
  const userName = await knex("Users")
    .insert({ name: name, pwd: pwd })
    .returning("name");
  if (!userName[0]) throw new NotKnown();
  return userName[0];
};

const getUsers = async () => {
  const users = await knex("Users").select();
  if (users.length === 0) {
    throw new CustomError({ status: 200, message: "No Users Found" });
  } else {
    return users;
  }
};

const findUser = async ({ name }) => {
  const user = await knex("Users")
    .where("name", name)
    .first();
  if (!user) throw new NotFound();
  return user;
};

module.exports = {
  addUser: addUser,
  getUsers: getUsers,
  findUser: findUser
}
