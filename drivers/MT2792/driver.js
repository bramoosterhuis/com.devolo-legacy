'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
		capabilities: {
			onoff: {
				command_class: 'COMMAND_CLASS_SWITCH_BINARY',
				command_get: 'SWITCH_BINARY_GET',
				command_set: 'SWITCH_BINARY_SET',
				command_set_parser: value => ({
					'Switch Value': (value > 0) ? 'on/enable' : 'off/disable',
				}),
				command_report: 'SWITCH_BINARY_REPORT',
				command_report_parser: report => report.Value === 'on/enable',
			},

			measure_power: {
				command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
				command_get: 'SENSOR_MULTILEVEL_GET',
				command_get_parser: () => ({
					'Sensor Type': 'Power (version 2)',
					Properties1: {
						Scale: 0,
					},
				}),
				command_report: 'SENSOR_MULTILEVEL_REPORT',
				command_report_parser: report => {
					if (report['Sensor Type'] === 'Power (version 2)' &&
						report.hasOwnProperty('Level') &&
						report.Level.hasOwnProperty('Scale') &&
						report.Level.Scale === 0) { return report['Sensor Value (Parsed)']; }

					return null;
				},
			},

			meter_power: {
				command_class: 'COMMAND_CLASS_METER',
				command_get: 'METER_GET',
				command_get_parser: () => ({
					Properties1: {
						Scale: 0,
					},
				}),
				command_report: 'METER_REPORT',
				command_report_parser: report => {
					if (report.hasOwnProperty('Properties2') &&
						report.Properties2.hasOwnProperty('Scale') &&
						report.Properties2.Scale === 0) { return report['Meter Value (Parsed)']; }

					return null;
				},
			},
		},
	  settings: {
			"1": {
	      "size": 1,
	      "index": 1,
				"parser": function (input) {
						return new Buffer([parseInt(input)]);
				}
	    },
	    "2": {
	      "size": 1,
	      "index": 2,
				"parser": function (input) {
						return new Buffer([parseInt(input)]);
				}
	    },
	    "3": {
	      "size": 1,
	      "index": 3,
				"parser": function (input) {
						return new Buffer([parseInt(input)]);
				}
	    },
	    "4": {
	      "size": 1,
	      "index": 4,
				"parser": function (input) {
						return new Buffer([parseInt(input)]);
				}
	    },
	    "5": {
	      "size": 1,
	      "index": 5
	    },
	    "6": {
	      "size": 1,
	      "index": 6
	    },
	    "7": {
	      "size": 1,
	      "index": 7
	    },
	    "8": {
	      "size": 1,
	      "index": 8,
				"parser": function (input) {
						return new Buffer([parseInt(input)]);
				}
	    },
	    "9": {
	      "size": 1,
	      "index": 9
	    }
		}
});
