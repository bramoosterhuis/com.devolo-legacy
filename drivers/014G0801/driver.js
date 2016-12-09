'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Get the driver object
var driver = findWhere(Homey.manifest.drivers, { id: path.basename(__dirname) });
// Get the wakeUpInterval from the driver object (in order to set the pollInterval to the same value)
var wakeUpInterval = driver.zwave.wakeUpInterval * 1000;
Homey.log("Will set pollInterval to the same value as wakeUpInterval, which is: " + wakeUpInterval + " ms");

// http://www.vesternet.com/downloads/dl/file/id/196/z_wave_danfoss_lc_13_living_connect_radiator_thermostat_manual.pdf
// http://www.devolo.co.uk/fileadmin/user_upload/Products/devolo-Home-Control-Radiator-Control/Documents/PDF_en/Manual-devolo-Home-Control-Radiator-Thermostat-com.pdf
// http://products.z-wavealliance.org/products/1258/embedpics
// http://heating.danfoss.com/PCMPDF/Z_wave_commands_VDFNN202_teamcent.pdf
// http://www.benext.eu/static/manual/danfoss/livingconnect.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {
		measure_battery: {			
			// http://z-wave.sigmadesigns.com/wp-content/uploads/2016/08/SDS12657-12-Z-Wave-Command-Class-Specification-A-M.pdf, page 125
			// 
			// The Battery Level Get Command is used to request the level of a battery.
			// The Battery Level Report Command MUST be returned in response to this command.
			//
			// The Battery Command Class is used to request and report battery levels for a given device.
			// The battery level reports percentage of the full battery.
			// The field can take values from 0 to 100% (0x00–0x64).
			// The value 0xFF indicates a battery low warning.
			//
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',   
			command_report_parser: (report, node) => {
				// If prev value is not empty and new value is empty
				if (node && node.state && node.state.measure_battery !== 1 && report['Battery Level (Raw)'][0] == 0xFF) {

					// Trigger device flow
					Homey.manager('flow').triggerDevice('014g0801_battery_alarm', {}, {}, node.device_data, err => {
						if (err) console.error('Error triggerDevice -> battery_alarm', err);
					});
				}
				if (report['Battery Level (Raw)'][0] == 0xFF) return 1;
					return report['Battery Level (Raw)'][0];
            },
			pollInterval: wakeUpInterval
		},
		
		measure_temperature: {
			// http://z-wave.sigmadesigns.com/wp-content/uploads/2016/08/SDS12657-12-Z-Wave-Command-Class-Specification-A-M.pdf, page 525
			//
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => {
				return {
					'Sensor Type': 'Temperature (version 1)',
					'Properties1': {
						'Scale': 0
					}
				};
			},
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				return Math.round (report['Sensor Value (Parsed)'] * 10) / 10;
			},
			pollInterval: wakeUpInterval
		},
		
		target_temperature: {
			// http://z-wave.sigmadesigns.com/wp-content/uploads/2016/08/SDS12652-13-Z-Wave-Command-Class-Specification-N-Z.pdf, page 321
			//
			command_class: 'COMMAND_CLASS_THERMOSTAT_SETPOINT',
			command_get: 'THERMOSTAT_SETPOINT_GET',
			command_get_parser: () => {
				return {
					'Level': {
						'Setpoint Type': 'Heating 1',
					}
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
			command_set: 'THERMOSTAT_SETPOINT_SET',
			command_set_parser: function (value, node) {

				module.exports.realtime(node.device_data, 'target_temperature', Math.round(value * 2) / 2);

				// Create value buffer
				let a = new Buffer(2);
				a.writeUInt16BE(( Math.round(value * 2) / 2 * 10).toFixed(0));

				return {
					'Level': {
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
			pollInterval: wakeUpInterval
		}
	},
	settings: {}
});

/**
 * Plain js implementation of underscore's findWhere.
 * @param array
 * @param criteria
 * @returns {*}
 */
function findWhere(array, criteria) {
	return array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]));
}

/**
 * Respond to user changes in the configuration of the device
 * Currently supported: protection
 */
module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {
	for (let key of changedKeysArr) {
		
		// Manage the protection setting
		if (key === "protected") {
			let value = newSettingsObj[key];
			Homey.log ("Changing setting for '" + key + "' to '" + value + "'");
        	
			// get the node by our device_data object (which is generated by the Z-Wave pairing wizard)
			Homey.wireless('zwave').getNode( device_data, function( err, node ) {
				if (err) return console.error( err );			
				/*				
			    <cmd key="0x01" name="PROTECTION_SET" help="Protection Set" comment="">
			      <param key="0x00" name="Level" type="STRUCT_BYTE" typehashcode="0x07" comment="">
			        <bitfield key="0x00" fieldname="Local Protection State" fieldmask="0x0F" shifter="0" />
			        <bitfield key="0x01" fieldname="Reserved1" fieldmask="0xF0" shifter="4" />
			      </param>
			      <param key="0x01" name="Level2" type="STRUCT_BYTE" typehashcode="0x07" comment="">
			        <bitfield key="0x00" fieldname="RF Protection State" fieldmask="0x0F" shifter="0" />
			        <bitfield key="0x01" fieldname="Reserved2" fieldmask="0xF0" shifter="4" />
			      </param>
				*/
				let protectionStatus = (value ? new Buffer([2]) : new Buffer ([0]));
				node.CommandClass.COMMAND_CLASS_PROTECTION.PROTECTION_SET({
					'Level': protectionStatus, // 0 = unprotected, 1 = protected by sequence, 2 = no operation
					'Level2': new Buffer([0]) // 0 = RF unprotected, 1 = No RF control, 2 = No RF response at all
				}, function( err, result ){
    				if( err ) return console.error( err );
				});
			});
		}
	}
    callback( null, true );
}
