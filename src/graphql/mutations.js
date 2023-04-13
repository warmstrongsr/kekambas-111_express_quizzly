const { GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const { User, Quiz, Question } = require('../models');
const bcrypt = require('bcrypt');
const { createJWT } = require('../util/auth');
const { QuestionInputType } = require('./types');


const register = {
    type: GraphQLString,
    description: 'Register a new user',
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        const checkUser = await User.findOne({ email: args.email }).exec();
        if (checkUser){
            throw new Error("User with this email address already exists");
        }

        const { username, email, password } = args;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: passwordHash });

        await user.save();

        const token = createJWT(user);

        return token
    }
}
const login = {
	type: GraphQLString,
	description: "Log in a user that exists in the database",
	args: {
		email: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(parent, args) {
		const { email, password } = args;
		const user = await User.findOne({ email }).exec();
		if (!user) {
			throw new Error("User not found");
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new Error("Invalid login");
		}
		const token = createJWT(user);
		return token;
	},
};


const createQuiz = {
    type: GraphQLString,
    description: "Creates a new quiz",
    args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: { type: GraphQLID },
        questions: { type: new GraphQLNonNull(new GraphQLList(QuestionInputType))}
    },
    async resolve(parent, args){
        // Generate a slug for our quiz based on the title
        let slugify = args.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        // Add a random integer to the end of the slug, check that the slug does not already exist,
        // if it does exist, generate a new slug number
        let fullSlug;
        let existingQuiz;
        do {
            let slugId = Math.floor(Math.random() * 1000);
            fullSlug = `${slugify}-${slugId}`;

            existingQuiz = await Quiz.findOne({ slug: fullSlug })
        } while (existingQuiz);

        // Create a new instance of Quiz
        const quiz = new Quiz({
            title: args.title,
            slug: fullSlug,
            description: args.description,
            userId: args.userId
        });

        await quiz.save();

        // Once the quiz is created, loop through all of the questions
        for (let question of args.questions){
            // Create a new Question Instance with QuestionInput Data and quiz id from the newly created quiz
            const newQuestion = new Question({
                title: question.title,
                correctAnswer: question.correctAnswer,
                order: question.order,
                quizId: quiz.id
            })
            // Save to the database
            await newQuestion.save();
        }

        return quiz.slug
    }
}


module.exports = {
    register,
    login,
    createQuiz
}
