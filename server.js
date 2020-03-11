////////////////////////////////////////// REQUIREMENTS ////////////////////////////////////////

const express = require('express'); // import express for routes
const cors = require('cors'); // import cors for whatever it's for
const fs = require('fs'); // import fs module to interact with filesystem
const dotenv = require('dotenv'); // library for environment variables
const helmet = require('helmet'); // library for spoofing headers :)
const figlet = require('figlet'); // cool ASCII art ;)
const util = require('util'); // utility for converting to promises
const exec = util.promisify(require('child_process').exec);

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
	if (!token) return res.status(401).json({"error": "Access Denied!"});
	try {
		if (token === process.env.AUTH_TOKEN) {
       			next();
		}else{
			return res.status(400).json({"error": "Access Denied!"}); 
		}
	} catch (err) {
	        console.log(err);
        	return res.status(400).json({"error":"Bad Request!"});
    	}
}

const run_cmd = async (command) => {
	try {
		return await exec(`${command}`);	
	} catch (error){
		const error_out = {
			"error":"could not process request!",
			"message":`${error}`
		}
		return error_out;
	}
}

const crypto_cmd = async (req, res, crypto, command) => {

	if (crypto === "ltc") {
		const cli = "litecoin-cli ";
		const { stdout, stderr } = await run_cmd(`${cli} ${command}`);
		if (stdout) return res.status(200).json(JSON.parse(stdout));
		if (stderr) return res.status(500).json({"error": `${stderr}`});
	} else if ( crypto === "btc") {
		const cli = "bitcoin-cli ";
		const { stdout, stderr } = await run_cmd(`${cli} ${command}`);
		if (stdout) return res.status(200).json(JSON.parse(stdout));
		if (stderr) return res.status(500).json({"error": `${stderr}`});
	} else {
		return res.status(400).json({"error": "cryptocurrency not supported"});
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

app.get('/api/:crypto/listreceivedbyaddress', verify, async (req, res) => {
	const crypto = req.params.crypto;
	const command = "listreceivedbyaddress";
	return await crypto_cmd(req, res, crypto, command);
});

app.get('/api/:crypto/getnewaddress/:account', verify, async (req, res) => {
	if (!req.params.account) return res.status(400).json({"error": "account name required"});
	const crypto = req.params.crypto;
	const command = `getnewaddress ${req.params.account}`;
	return await crypto_cmd(req, res, crypto, command);
});


// Main app
app.listen(port, () => console.log(`Server started on port ${port}`));
