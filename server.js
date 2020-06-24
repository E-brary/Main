const express = require('express');
const app = express();
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require('path');
const Register = require('./Models/Register');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const secure = require('./Api/secured');
const session = require('express-session');
require('./Config/config')(passport);
//Middleware part
app.use(
	session({
		secret:'important',
		resave: false,
		saveUninitialized: true
	})
);
app.use('/',secure);
app.set('view engine', 'ejs');
app.set(path.join(__dirname));
app.use(express.static(path.join(__dirname, 'views')));
const urlencodedparser = BodyParser.urlencoded({extended: false});
const jsonParser = BodyParser.json();
mongoose.connect('mongodb://localhost:27017/Project_1',{useNewUrlParser: true});
//socketing
let encounter = 0;
io.on('connection',function (socket) {
		encounter++;
		socket.emit('encounter',encounter)
		socket.on('disconnect',function () {
			encounter--;
			socket.emit('encounter',encounter)
		})

	});
//Requests

app.get('/Register',function(req,res){
	res.render('Register');
});
app.post('/Register',urlencodedparser,function(req,res){
	var form = new Register({
		name: req.body.name,
		password: req.body.password,
		email: req.body.email
	});
	bcrypt.genSalt(10,(err,salt) => {
		bcrypt.hash(form.password,salt,function(err,hash){
			if(err){
				throw err;
			} else{
				form.password = hash;
				form.save(function(err,Register){
					if(err){throw err;}
					else {
						console.log(Register);
						res.redirect('/');
					}
				});
			}
		})
	})

});
function checker(req,res,next){
	if(!req.isAuthenticated()){
		res.redirect('/Register');
	} else{
		next();
	}
}

app.get('/logout',function(req,res){
	req.logOut();
	console.log('successfully logged out');
	res.redirect('/');
});

app.get('/Feed',checker,urlencodedparser,function(req,res){
	res.send('coming soon!');
});

http.listen(3000, function(){
	console.log('server is on port 3000');
});
