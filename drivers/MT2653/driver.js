"use strict";

const path = require("path");
const ZwaveDriver = require("homey-zwavedriver");

// http://www.cd-jackson.com/index.php/zwave/zwave-device-database/zwave-device-list/devicesummary/341

module.exports = new ZwaveDriver(path.basename(__dirname), {
    debug: true,
    capabilities: {
        measure_battery: {
            command_class: 'COMMAND_CLASS_BATTERY',
            command_get: 'BATTERY_GET',
            command_report: 'BATTERY_REPORT',
            command_report_parser: report => {
            if (report['Battery Level'] === "battery low warning") return 1;
                return report['Battery Level (Raw)'][0];
            }
        }
    },
    settings: {
        "button_1_and_3_pair_mode": {
            "index": 1,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "button_2_and_4_pair_mode": {
            "index": 2,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "command_to_control_group_a": {
            "index": 11,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "command_to_control_group_b": {
            "index": 12,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "command_to_control_group_c": {
            "index": 13,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "command_to_control_group_d": {
            "index": 14,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "send_the_following_switch_sll_commands": {
            "index": 21,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "invert_buttons": {
            "index": 22,
            "size": 1,
            "parser": function (input) {
                return new Buffer([( input === true ) ? 1 : 0]);
            }
        },
        "blocks_wakeup_even_when_wakeup_interval_is_set": {
            "index": 25,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        },
        "send_unsolicited_battery_report_on_wake_up": {
            "index": 30,
            "size": 1,
            "parser": function (input) {
                return new Buffer([parseInt(input)]);
            }
        }
    }
})

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
					Homey.manager('flow').triggerDevice(`mt2653_btn${triggerId}`, null, null, node.device_data);
				}
			}
		});
	}
})
