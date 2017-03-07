'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
    debug: true,
    capabilities: {
        alarm_contact: {
            'command_class': 'COMMAND_CLASS_SENSOR_BINARY',
            'command_report': 'SENSOR_BINARY_REPORT',
            'command_report_parser': report => {
            if (report['Sensor Type'] === 'Door/Window')
return report['Sensor Value'] === 'detected an event';

return null;
}
},
alarm_tamper: {
    'getOnWakeUp': true,
        'command_class': 'COMMAND_CLASS_SENSOR_BINARY',
        'command_get': 'SENSOR_BINARY_GET',
        'command_get_parser': () => ({
        'Sensor Type': 'Tamper'
    }),
        'command_report': 'SENSOR_BINARY_REPORT',
        'command_report_parser': report => {
        if (report['Sensor Type'] === 'Tamper')
            return report['Sensor Value'] === 'detected an event';

        return null;
    }
},
measure_luminance: {
    'command_class': 'COMMAND_CLASS_SENSOR_MULTILEVEL',
        'command_get': 'SENSOR_MULTILEVEL_GET',
        'command_get_parser': function () {
        return {
            'Sensor Type': "Luminance (version 1)",
            'Properties1': {'Scale': 0 }
        }
    },
    'command_report': 'SENSOR_MULTILEVEL_REPORT',
        'command_report_parser': function (report) {
        if(report['Sensor Type'] !== 'Luminance (version 1)') {
            return null;
        } else {
            return report['Sensor Value (Parsed)'];
        }
    }
},
measure_temperature: {
    'command_class': 'COMMAND_CLASS_SENSOR_MULTILEVEL',
        'command_report': 'SENSOR_MULTILEVEL_REPORT',
        'command_report_parser': report => {
        if (report['Sensor Type'] === "Temperature (version 1)" &&
            report.hasOwnProperty("Level") &&
            report.Level.hasOwnProperty("Scale")) {
            if (report.Level.Scale === 0)
                return report['Sensor Value (Parsed)'];

            if (report.Level.Scale === 1)
                return (report['Sensor Value (Parsed)'] - 32) / 1.8;

            return null;
        }

        return null;
    }
},
measure_battery: {
    command_class: 'COMMAND_CLASS_BATTERY',
        command_get: 'BATTERY_GET',
        command_report: 'BATTERY_REPORT',
        command_report_parser: (report, node) => {
        if (node && node.state && node.state.measure_battery !== 1 && report['Battery Level (Raw)'][0] == 0xFF) {
            Homey.manager('flow').triggerDevice('battery_alarm', {}, {}, node.device_data, err => {
                if (err) console.error('Error triggerDevice -> battery_alarm', err);
        });
        }
        if (report['Battery Level (Raw)'][0] == 0xFF) return 1;
        return report['Battery Level (Raw)'][0];
    }
}
},
settings: {
    "basic_set_level": {
        "index": 2,
            "size": 1,
            "signed": false,
            "parser": input => {
            if (input >= 100 && input < 255)
                input = 255;

            return new Buffer([input]);
        },
    },
    "light_sensitivity": {
        "index": 4,
            "size": 1,
    },
    "test_mode": {
        "index": 5,
            "size": 1,
            "parser": (input, settings) => {
            // Operation mode bit 0 (0000000x)
            let param5 = Number(settings.operation_mode);

            // Operation mode bit 1 (000000x0)
            if (input)
                param5 += 2;

            // Operation mode bit 2 (00000x00)
            if (settings["door/window_mode"])
                param5 += 4;

            return new Buffer([param5 + 8]);
        },
    },
    "operation_mode": {
        "index": 5,
            "size": 1,
            "parser": (input, settings) => {
            // Operation mode bit 0 (0000000x)
            let param5 = Number(input);

            // Operation mode bit 1 (000000x0)
            if (settings.test_mode)
                param5 += 2;

            // Operation mode bit 2 (00000x00)
            if (settings["door/window_mode"])
                param5 += 4;

            return new Buffer([param5 + 8]);
        },
    },
    "door/window_mode": {
        "index": 5,
            "size": 1,
            "parser": (input, settings) => {
            // Operation mode bit 0 (0000000x)
            let param5 = Number(settings.operation_mode);

            // Operation mode bit 1 (000000x0)
            if (settings.test_mode)
                param5 += 2;

            // Operation mode bit 2 (00000x00)
            if (input)
                param5 += 4;

            return new Buffer([param5 + 8]);
        },
    },
    "temperature_monitoring": {
        "index": 6,
            "size": 1,
            "parser": input => {
            // Multi-Sensor Function Switch bit 6 (0x000000)
            let param6 = 4;	// Default value: Disable magetic integrate PIR

            if (input)
                param6 += 64;

            return new Buffer([param6]);
        },
    },
    "turn_off_light_time": {
        "index": 9,
            "size": 1,
            "parser": value => new Buffer([Math.round(value / 8)]),
    },
    "battery_report_time": {
        "index": 10,
            "size": 1,
            "parser": value => new Buffer([Math.round(value * 2)]),
    },
    "contact_report_time": {
        "index": 11,
            "size": 1,
            "parser": value => new Buffer([Math.round(value * 2)]),
    },
    "illumination_report_time": {
        "index": 12,
            "size": 1,
            "parser": value => new Buffer([Math.round(value * 2)]),
    },
    "temperature_report_time": {
        "index": 13,
            "size": 1,
            "parser": value => new Buffer([Math.round(value * 2)]),
    },
}
});
