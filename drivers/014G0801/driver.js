'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://www.vesternet.com/downloads/dl/file/id/196/product/1128/z_wave_danfoss_lc_13_living_connect_radiator_thermostat_manual.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === "battery low warning") return 1;
				return report['Battery Level (Raw)'][0];
			}
		},
		target_temperature: {
			command_class: 'COMMAND_CLASS_THERMOSTAT_SETPOINT',
			command_get: 'THERMOSTAT_SETPOINT_GET',
			command_get_parser: function () {
				return {
					'Level': {
						'Setpoint Type': 'Heating 1',
					}
				};
			},
			command_set: 'THERMOSTAT_SETPOINT_SET',
			command_set_parser: function (value) {

				// Create value buffer
				let a = new Buffer(2);
				a.writeUInt16BE(( Math.round(value * 2) / 2 * 10).toFixed(0));

				return {
					'Level' : {
						'Setpoint Type': 'Heating 1'
					},
					'Level2': {
						'Size': 2,
						'Scale': 0,
						'Precision': 1
					},
					'Value': a
				};
			},
			command_report: 'THERMOSTAT_SETPOINT_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Level2')
					&& report.Level2.hasOwnProperty('Scale')
					&& report.Level2.hasOwnProperty('Precision')
					&& report.Level2['Scale'] === 0
					&& report.Level2['Size'] !== 'undefined'
					&& typeof report['Value'].readUIntBE(0, report.Level2['Size']) !== 'undefined') {

					return report['Value'].readUIntBE(0, report.Level2['Size']) / Math.pow(10, report.Level2['Precision']);
				}
				return null;
			},
		},
	},
	settings: {

	}
});