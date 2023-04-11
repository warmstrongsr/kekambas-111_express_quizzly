const { User } = require('../../models');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    console.log(req.body);
    // First check if that passwords match
    if (req.body.password !== req.body.confirmPass){
        res.status(400).send({ error: "Your passwords do not match" })
    } else {
        // Get the data from the request body
        const { username, email, password } = req.body
        // Hash and salt the password before storing 
        const passwordHash = await bcrypt.hash(password, 10);
        // Create a new instance of User 
        const user = new User({ username, email, password: passwordHash })
        try{
            await user.save();
            res.send(`New User Created - ${user.username}`);
        } catch (err){
            console.log(err);
            res.send('There was an issue')
        }
    }
}