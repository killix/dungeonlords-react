var express = require('express');
var router = express.Router();
var restify = require('express-restify-mongoose');
var mongoose = require('mongoose');
var _ = require('lodash');

var f = function(){ return false; };

restify.defaults({
    prefix: '',
    strict: true,
    fullErrors: process.env.NODE_ENV === 'development'
});

restify.serve(router, mongoose.model('User'), {
    prereq: f,
    contextFilter: function(model, req, cb) {
        if (req.isAuthenticated()) {
            cb(model.find().select('_id name'));
        } else {
            cb();
        }
    }
});

restify.serve(router, mongoose.model('Game'), {
    prereq: function(req) {
        if (!req.user || !req.isAuthenticated()) {
            return false;
        }

        if (req.method === 'PUT' || req.method === 'DELETE') {
            return false; // no admins yet, no one can modify games once they have been created
        }

        return true;
    }
});

module.exports = router;
