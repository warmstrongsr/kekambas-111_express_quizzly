const express = require('express');
const app = express();
const port = 3000;
const path = require('path')

app.set('view engine', 'ejs');
// Update the location of the folder for res.render to use (default is './views')
app.set('views', path.join(__dirname, 'src/templates/views'));

// Set up middleware to parse form data and add body property to the request
app.use(express.urlencoded( { extended: true }))

// Add logging middleware
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Import the function from the routes module
const initRoutes = require('./src/routes');
// Execute the function with the app as an argument
initRoutes(app);


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
