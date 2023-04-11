// Import Type from graphql
const { GraphQLList } = require('graphql');
// Import our own created type
const { UserType } = require('./types');
// Import the User model so we can query MongoDB
const { User } = require('../models');


const users = {
    type: new GraphQLList(UserType),
    description: 'Get all users from the database',
    async resolve(parent, args){
        return await User.find()
    }
}

module.exports = {
    users
}
