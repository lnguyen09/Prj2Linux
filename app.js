/* The backend server of the web application, responsible for handling requests and responses */
// Import necessary libraries
const express = require('express')
// Use Express
const app = express()
app.set("view engine", "ejs");
app.set('views', __dirname + '/views');
const bodyParser = require('body-parser');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded()); 

port = 3001
if (process.env.PORT) {
  port = process.env.PORT
}
// Connect to the database using mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lhn15:Anhminhbin2@cluster0.mxykocz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true })
// Get the default schema
const {record} = require("./dataModel")

// Route to the homepage
app.get('/', async (req, res) => {
  //Query the latest 20 records and display it in the table
  details = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
  res.render('home', details)
})

// Route to the homepage
app.get('/home', async (req, res) => {
  //Query the latest 20 records and display it in the table
  details = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
  res.render('home', details)
})

// Route to the text version page
app.get('/textver', async (req, res) => {
  //Query the latest 20 records and display it in the table
  details = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
  res.render('textVer', details)
})

// Route to the about page
app.get('/about', (req, res) => {
  res.render('about')
})

// Handle the POST request when user click the button 
app.post('/result', async (req, res) =>{
  let {PythonShell} = require('python-shell')
  let body = JSON.stringify(req.body.type)
  // Call the python script using python-shell
  let pyshell = new PythonShell('python_files/speech.py');
  // Send the message to the backend
  pyshell.send(body);
  body = "Your input is: " + body

  // sends a message to the Python script via stdin
  pyshell.on('message', async function (message) {
    // No Stress. Send the result back to the client
    if(message.includes('No Stress')){
      message = "Your result is: " + message
      const details = {
        title: "No Stress",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, '')
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
    // Stress. Send the result back to the client
    else if (message.includes('Stress')){
      message = "Your result is: " + message
      const details = {
        title: "Stress",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, '')
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
    // The user does not speak anything
    else {
      message = "Please say something"
      const details = {
        title: "No input",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, ''),
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
  })
})

// Handle the POST request when user click the submit button in the text version 
app.post('/submit', async (req, res) => {
  let {PythonShell} = require('python-shell')
  const text = req.body.message
  // Create option to pass the data to the python script as arguments
  const options = {
    scriptPath: 'python_files',
    args: [text]
  };

  // Call the python script 
  PythonShell.run('text.py', options, async (err, message) => {
    if (err) throw err;
    // No Stress. Send the result back to the client
    if(message.includes('No Stress')){
      message = "Your result is: " + message
      const details = {
        title: "No Stress",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, '')
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
    // Stress. Send the result back to the client
    else if (message.includes('Stress')){
      message = "Your result is: " + message
      const details = {
        title: "Stress",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, '')
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
    // The user does not type anything (which is not allowed in the frontend)
    else {
      message = "Please say something"
      const details = {
        title: "No input",
        message2: message.replace(/[`~!@#$%^&*()_|+\-=?;'"<>\{\}\[\]\\\/]/gi, ''),
      }
      //Query the latest 20 records and display it in the table
      records = await record.find({}, {_id: 0, Input: 1, Result: 1}).sort({$natural:-1}).limit(20);
      res.render('result', {details, records})
    }
  });
});

// Listen to the port 3001
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Route does not exist
app.get('*', (req, res) => {
  res.send({
    "message": "404 not found"
  })
})
