"use strict";

const path = require("path");
const ZwaveDriver = require("homey-zwavedriver");

// http://products.z-wavealliance.org/products/1143

module.exports = new ZwaveDriver(path.basename(__dirname), {
    debug: true,
    capabilities: {
        "onoff": {
            "command_class": "COMMAND_CLASS_SWITCH_MULTILEVEL",
            "command_get": "SWITCH_MULTILEVEL_GET",
            "command_set": "SWITCH_MULTILEVEL_SET",
            "command_set_parser": function (value) {
                return {
                    "Value": value
                }
            },
            "command_report": "SWITCH_MULTILEVEL_REPORT",
            "command_report_parser": function (report) {
                if (typeof report["Value"] === "string") {
                    return report["Value"] === "on/enable";
                } else {
                    return report["Value (Raw)"][0] > 0;
                }

            }
        },
        "dim": {
            "command_class": "COMMAND_CLASS_SWITCH_MULTILEVEL",
            "command_get": "SWITCH_MULTILEVEL_GET",
            "command_set": "SWITCH_MULTILEVEL_SET",
            "command_set_parser": function (value) {
                return {
                    "Value": value * 100
                }
            },
            "command_report": "SWITCH_MULTILEVEL_REPORT",
            "command_report_parser": function (report) {
                if (typeof report["Value"] === "string") {
                    return ( report["Value"] === "on/enable" ) ? 1.0 : 0.0;
                } else {
                    return report["Value (Raw)"][0] / 100;
                }
            }
        },
        "measure_battery": {
            "command_class": "COMMAND_CLASS_BATTERY",
            "command_get": "BATTERY_GET",
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
