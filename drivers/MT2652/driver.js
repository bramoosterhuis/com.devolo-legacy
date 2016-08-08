"use strict";

const path = require("path");
const ZwaveDriver = require("homey-zwavedriver");

// http://products.z-wavealliance.org/products/1143

module.exports = new ZwaveDriver(path.basename(__dirname), {
    debug: true,
    capabilities: {
        "battery_report": {
            "command_class": "COMMAND_CLASS_BATTERY",
            "command_report": "BATTERY_REPORT",
            "command_report_parser": function (report) {
                if (report["Battery Level"] === "battery low warning") return 1;
                return report["Battery Level (Raw)"][0];
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

				var trigger = 'mt2652_btn';

				switch( report['Scene Number'] ) {
					case 1:
						trigger += '1_single';
						break;
                    case 2:
                        trigger += '2_single';
                        break;
                    case 3:
                        trigger += '3_single';
                        break;
                    case 4:
                        trigger += '4_single';
                        break;
					case 5:
						trigger += '1_double';
						break;
                    case 6:
                        trigger += '2_double';
                        break;
                    case 7:
                        trigger += '3_double';
                        break
                    case 8:
                        trigger += '4_double';
                        break;
				}

				Homey.manager('flow').triggerDevice(trigger, null, null, node.device_data);
			}
		});
	}
})
