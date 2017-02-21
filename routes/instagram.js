var http = require('http');
var express = require('express');
var ig = require('instagram-node').instagram();
var router = require('express').Router();

var secret = require('../config/secret');
 
ig.use({
  client_id: secret.instagram_client_id || '',
  client_secret: secret.instagram_client_secret || ''
});

//var redirect_uri = 'http://yoursite.com/handleauth'; //res.instagram_redirect_uri
 
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(res.locals.hosturl + "/handleauth", { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, res.locals.hosturl + "/handleauth", function(err, result) {
	var json = {};
    if (err) {
      //console.log(err.body);
	  json.status = "error";
	  json.message = err;
	  req.flash('error', 'Instagram login failed!');
    } else {
      //console.log('Yay! Access token is ' + result.access_token);
	  json.status = "success";
	  json.message = result;
	  req.flash('message', 'Instagram login authenticated!');
    }
	//res.send(JSON.stringify(json));
	console.log(JSON.stringify(json));
	
	return res.redirect('/');
  });
};
 
// This is where you would initially send users to authorize 
router.get('/authorize_user', exports.authorize_user);
// This is your redirect URI 
router.get('/handleauth', exports.handleauth);

router.use(function(req, res, next) {
	
	
	next();
});

/*
router.get('/search',function(req,res,next){

	var page = req.query.p || 1;
	var num = req.query.n || res.locals.default_searchlimit;
	num = Math.min(num, 1000);
	var frm = Math.max(0,page*num-num);
	
	var query = req.query.q || "";
	var options = {};
	
	instagramAPI.userSearch(query, options).then(function(result) {
		console.log(result);
		res.resultmessage("success", result);
		
		instagramAPI.userMedia(result.userid, null).then(function(result) {
			console.log(result);
			res.resultmessage("success", result);
			
			
			
		}, function(err){
			res.resultmessage("error", err);
		});
	}, function(err){
		console.log(err);
		res.resultmessage("error", err);
	});
	
	return false;
});
*/

module.exports= router;