var http = require('http');
var express = require('express');
var ig = require('instagram-node').instagram();
var InstagramAPI = require('instagram-api');
var router = require('express').Router();

var secret = require('../config/secret');
 
ig.use({
  client_id: secret.instagram_client_id || '',
  client_secret: secret.instagram_client_secret || ''
});

var redirect_uri = 'http://saasnodeiggoogle-jpef.c9users.io/handleauth'; //res.locals.hosturl + "/handleauth"
 
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
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
	  req.session.instagram = result;
	  req.flash('message', 'Instagram login authenticated!');
    }
	//res.send(JSON.stringify(json));
	//console.log(JSON.stringify(json));
	
	return res.redirect('/');
  });
};

 
exports.unauthorize_user = function(req, res) {
	req.session.instagram = null;
	req.flash('message', 'Instagram logged out!');
  return res.redirect('/');
};
 
// This is where you would initially send users to authorize 
router.get('/login_ig', exports.authorize_user);
// This is your redirect URI 
router.get('/handleauth', exports.handleauth);

// This is where you logout users
router.get('/logout_ig', exports.unauthorize_user);

router.use(function(req, res, next) {
	//console.log(req.session.instagram);
	res.locals.ig_user = null;
	res.locals.ig_token = null;
		
	if (req.session && req.session.instagram) {
		res.locals.ig_user = req.session.instagram.user;
		res.locals.ig_token = req.session.instagram.access_token;
	}
	res.locals.maps_key = secret.google_maps_key;
	next();
});


router.get('/view_ig',function(req, res, next) {
	//ig.use({ access_token: req.session.instagram.access_token });
	
	//console.log(req.session.instagram);
	
	
	
	/*ig.user_self_feed(options, function(err, medias, pagination, remaining, limit) {
		console.log(err);
		console.log(medias);
		res.render('view_ig.ejs', { data: medias, errors: req.flash('error') }); // load the index.ejs file
	});*/
	
	var instagramAPI = new InstagramAPI(res.locals.ig_token);
	var options = {};
	instagramAPI.userSelfMedia(options).then(function(result) {
		//console.log(result);
		//console.log(result.data); // user info 
		//console.log(result.limit); // api limit 
		//console.log(result.remaining) // api request remaining 
		req.session.instagram.data = result.data;
		res.render('view_ig.ejs', { data: result.data }); // load the index.ejs file
	}, function(err){
		res.resultmessage("error", JSON.stringify(err));
		//res.render('index.ejs', { errors: req.flash('error') }); // load the index.ejs file
		return res.redirect('/');
	});

	
});

router.get('/view_ig_api',function(req, res, next) {
	var token = req.query.access_token || res.locals.ig_token || '';
	
	var instagramAPI = new InstagramAPI(token);
	var options = {};
	instagramAPI.userSelfMedia(options).then(function(result) {
		//console.log(result);
		//console.log(result.data); // user info 
		//console.log(result.limit); // api limit 
		//console.log(result.remaining) // api request remaining 
		
		var imagelist = [];
		var data = result.data;
		
		
		if (data.length>0) {
			for (var i=0;i<data.length;i++) { var entry = data[i]; if (typeof entry != "undefined") {
				var imagedata = {};
				imagedata.id = entry.id;
				imagedata.url = entry.images.standard_resolution.url;
				imagedata.text = entry.caption.text;
				imagedata.location = entry.location;
				imagelist.push(imagedata);
			} }
		}
		
			
		var apijson = {status: "success", images: imagelist};
		//res.render('view_ig.ejs', { data: result.data }); // load the index.ejs file
		res.send(JSON.stringify(apijson));
	}, function(err){
		
		//res.resultmessage("error", JSON.stringify(err));
		//res.render('index.ejs', { errors: req.flash('error') }); // load the index.ejs file
		//return res.redirect('/');
		var apijson = {status: "error", error: err};
		//res.render('view_ig.ejs', { data: result.data }); // load the index.ejs file
		res.send(JSON.stringify(apijson));
	});
});


router.get('/view_ig_single',function(req, res, next) {
	//ig.use({ access_token: req.session.instagram.access_token });
	
	//console.log(req.session.instagram);
	
	
	
	/*ig.user_self_feed(options, function(err, medias, pagination, remaining, limit) {
		console.log(err);
		console.log(medias);
		res.render('view_ig.ejs', { data: medias, errors: req.flash('error') }); // load the index.ejs file
	});*/
	
	var instagramAPI = new InstagramAPI(req.session.instagram.access_token);
	//var options = {};
	var mediaId = req.query.id || 0;
	instagramAPI.media(mediaId).then(function(result) {
		//console.log(result);
		//console.log(result.data); // user info 
		//console.log(result.limit); // api limit 
		//console.log(result.remaining) // api request remaining 
		req.session.instagram.data = result.data;
		res.render('view_ig_single.ejs', { data: result.data }); // load the index.ejs file
	}, function(err){
		console.log(err);
		res.resultmessage("error", JSON.stringify(err));
		//res.render('index.ejs', { errors: req.flash('error') }); // load the index.ejs file
		return res.redirect('/');
	});
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