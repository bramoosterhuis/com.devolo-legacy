"use strict";

const path = require("path");
const ZwaveDriver = require("homey-zwavedriver");

// http://products.z-wavealliance.org/products/1143

module.exports = new ZwaveDriver(path.basename(__dirname), {
    debug: true,
    capabilities: {
      measure_battery: {
        command_class: 'COMMAND_CLASS_BATTERY',
        command_get: 'BATTERY_GET',
        command_report: 'BATTERY_REPORT',
  			command_report_parser: (report, node) => {
  				// If prev value is not empty and new value is empty
  				if (node && node.state && node.state.measure_battery !== 1 && report['Battery Level (Raw)'][0] == 0xFF) {
  					// Trigger device flow
  					Homey.manager('flow').triggerDevice('battery_alarm', {}, {}, node.device_data, err => {
  						if (err) console.error('Error triggerDevice -> battery_alarm', err);
  					});
  				}
  				if (report['Battery Level (Raw)'][0] == 0xFF) return 1;

  			  return report['Battery Level (Raw)'][0];
        }
      },
    },
    settings: {
      "1": {
        "size": 1,
        "index": 1
      },
      "2": {
        "size": 1,
        "index": 2
      },
      "11": {
        "size": 1,
        "index": 11
      },
      "12": {
        "size": 1,
        "index": 12
      },
      "13": {
        "size": 1,
        "index": 13
      },
      "14": {
        "size": 1,
        "index": 14
      },
      "21": {
        "size": 1,
        "index": 21
      },
      "22": {
        "size": 1,
        "index": 22
      },
      "25": {
        "size": 1,
        "index": 25
      },
      "30": {
        "size": 1,
        "index": 30
      }
    }
});

// bind Flow
module.exports.on('initNode', function( token ){
	var node = module.exports.nodes[ token ];
	if( node ) {
		node.instance.CommandClass['COMMAND_CLASS_CENTRAL_SCENE'].on('report', function( command, report ){
			if( command.name === 'CENTRAL_SCENE_NOTIFICATION' ) {
				var triggerMap = {
					'1': '1_single',
					'2': '2_single',
					'3': '3_single',
					'4': '4_single',
					'5': '1_double',
					'6': '2_double',
					'7': '3_double',
					'8': '4_double'
				}

				var triggerId = triggerMap[ report['Scene ID'] ];
				if (triggerId) {
					Homey.manager('flow').triggerDevice(`mt265_btn${triggerId}`, null, null, node.device_data);
				}
			}
		});
	}
});
