'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Wire(depender, dependees, done) {
	if (!(this instanceof Wire)) {
		return new Wire(depender, dependees, done);
	}

	EventEmitter.call(this);
	this.depender = depender;
	this.dependees = dependees;
	this.done = done;

	this.init();
}

util.inherits(Wire, EventEmitter);

Wire.prototype.init = function () {
	var self = this;
	var dependees = self.dependees;

	self.depender.exports.__wire = self;

	if (!Array.isArray(dependees) || !dependees.length) {
		return self.initDepender();
	}

	self.loaded = 0;
	dependees.forEach(function (dependee) {
		//console.info('[nfs-wire]      ', self.depender.id, '->', dependee.__wire.depender.id);
		if (dependee.__wire.initialized === true) {
			return self.onDependeeLoad();
		}

		dependee.__wire.on('init', function () {
			self.onDependeeLoad();
		});
	});
};

Wire.prototype.onDependeeLoad = function () {
	if (++this.loaded !== this.dependees.length) {
		return;
	}
	this.initDepender();
};

Wire.prototype.initDepender = function () {
	var self = this;
	self.done(function (err, data) {
		//console.info('[nfs-wire] INIT:', self.depender.id);
		self.data = data || {};
		self.initialized = true;
		self.emit('init');
	});
};

Wire.prototype.get = function (field) {
	return this.data && this.data[field];
};

module.exports = function (depender, dependees, done) {
	//console.info('[nfs-wire] WIRE:', depender.id);
	if (typeof dependees === 'function') {
		done = dependees;
		dependees = undefined;
	}

	Wire(depender, dependees, done);
};
