////////////////////////////////////////// REQUIREMENTS ////////////////////////////////////////

const express = require('express'); // import express for routes
const cors = require('cors'); // import cors for whatever it's for
const fs = require('fs'); // import fs module to interact with filesystem
const dotenv = require('dotenv'); // library for environment variables
const helmet = require('helmet'); // library for spoofing headers :)
const figlet = require('figlet'); // cool ASCII art ;)

//////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////

// generate UUID
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// for user session verification
const verify = (req, res, next) => {
    const token = req.header('auth-token');
    if(token_blacklist.includes(token)) return res.status(401).json({"error": "Expired Token!"});
    if (!token) return res.status(401).json({"error": "Access Denied!"});
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(verified);
        req.user = verified;
        next();
    } catch (err) {
        console.log(err);
        return res.status(400).json({"error":"Bad Request!"});
    }
}

//////////////////////////////////////////// INITIALIZATION /////////////////////////////////////////

// initialize express
const app = express();
const port = 5000;

// initialize dotenv - environment variables
dotenv.config();

// ASCII art on startup :)
console.log(figlet.textSync('\nKRYPT.PAY', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

///////////////////////////////////////////// MIDDLE WARES /////////////////////////////////////////////

// Cross Origin Resource Sharing (frontend talking to backend on different server )
app.use(cors({
  origin: '*',
  exposedHeaders: ['auth-token']
}));

// parsing request bodies
app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

// initialize helmet - header obfuscation and security
app.use(helmet());

// initialize uploaded file handling in express
//app.use(fileUpload());

///////////////////////////////////////////////// ROUTES ////////////////////////////////////////////////

app.get('/api/user/billing', verify, async (req, res) => {

});


// Main app
app.listen(port, () => console.log(`Server started on port ${port}`));

