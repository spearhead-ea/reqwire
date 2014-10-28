'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Reqwire(depender, dependees, done) {
	if (!(this instanceof Reqwire)) {
		return new Reqwire(depender, dependees, done);
	}

	EventEmitter.call(this);
	this.depender = depender;
	this.dependees = dependees;
	this.done = done;

	this.init();
}

util.inherits(Reqwire, EventEmitter);

Reqwire.prototype.init = function () {
	var self = this;
	var dependees = self.dependees;

	self.depender.exports.__reqwire__ = self;

	if (!Array.isArray(dependees) || !dependees.length) {
		return self.initDepender();
	}

	self.loaded = 0;
	dependees.forEach(function (dependee) {
		if (dependee.__reqwire__.initialized === true) {
			return self.onDependeeLoad();
		}

		dependee.__reqwire__.on('init', function () {
			self.onDependeeLoad();
		});
	});
};

Reqwire.prototype.onDependeeLoad = function () {
	if (++this.loaded !== this.dependees.length) {
		return;
	}
	this.initDepender();
};

Reqwire.prototype.initDepender = function () {
	var self = this;
	self.done(function (err, data) {
		self.data = data || {};
		self.initialized = true;
		self.emit('init');
	});
};

Reqwire.prototype.get = function (field) {
	return this.data && this.data[field];
};

module.exports = function (depender, dependees, done) {
	if (typeof dependees === 'function') {
		done = dependees;
		dependees = undefined;
	}

	Reqwire(depender, dependees, done);
};
