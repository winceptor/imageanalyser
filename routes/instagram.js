var http = require('http');
var express = require('express');
var ig = require('instagram-node').instagram();
var router = require('express').Router();

var secret = require('../config/secret');
 
ig.use({
  client_id: secret.instagram_client_id,
  client_secret: secret.instagram_client_secret
});

router.use(function(req, res, next) {
	res.instagram_redirect_uri = res.locals.hosturl + "/handleauth";
});
 
var redirect_uri = 'http://yoursite.com/handleauth'; //res.instagram_redirect_uri
 
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(res.instagram_redirect_uri, { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, res.instagram_redirect_uri, function(err, result) {
	var result = {};
    if (err) {
      console.log(err.body);
	  result.status = "error";
	  result.message = err.body;
    } else {
      console.log('Yay! Access token is ' + result.access_token);
	  result.status = "success";
	  result.message = 'You made it!!';
    }
	res.send(JSON.stringify(result));
  });
};
 
// This is where you would initially send users to authorize 
router.get('/authorize_user', exports.authorize_user);
// This is your redirect URI 
router.get('/handleauth', exports.handleauth);

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