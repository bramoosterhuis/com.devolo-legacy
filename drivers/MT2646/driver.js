'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
  debug: true,
  capabilities: {
      onoff: [
          {
              command_class: 'COMMAND_CLASS_SWITCH_BINARY',
              command_set: 'SWITCH_BINARY_SET',
              command_set_parser: value => ({
                  'Switch Value': value,
              }),
          },
          {
              command_class: 'COMMAND_CLASS_BASIC',
              command_get: 'BASIC_GET',
              command_report: 'BASIC_REPORT',
              command_report_parser: report => {
                  if (report.hasOwnProperty('Current Value')) return report['Current Value'] !== 0;
                  if (report.hasOwnProperty('Value')) return report['Value'] !== 0;
                  return null;
              },
          },
      ],
      measure_power: {
          command_class: 'COMMAND_CLASS_METER',
          command_get: 'METER_GET',
          command_get_parser: () => ({
              'Sensor Type': 'Electric meter',
              'Properties1': {
                  'Scale': 0,
              },
          }),
          command_report: 'METER_REPORT',
          command_report_parser: report => {
              if (report.hasOwnProperty('Properties2') &&
                  report.Properties2.hasOwnProperty('Scale bits 10') &&
                  report.Properties2['Scale bits 10'] === 2) {
                  return report['Meter Value (Parsed)'];
              }
              return null;
          }
      },
      meter_power: {
          command_class: 'COMMAND_CLASS_METER',
          command_get: 'METER_GET',
          command_get_parser: () => ({
              'Sensor Type': 'Electric meter',
              'Properties1': {
                  'Scale': 2,
              },
          }),
          command_report: 'METER_REPORT',
          command_report_parser: report => {
              if (report.hasOwnProperty('Properties2') &&
                  report.Properties2.hasOwnProperty('Scale bits 10') &&
                  report.Properties2['Scale bits 10'] === 0) {
                  return report['Meter Value (Parsed)'];
              }
              return null;
          },
      },
  },
  settings: {
    "enable_watt_meter_report": {
      "size": 2,
      "index": 1,
      "parser": (value, settings) => new Buffer([
				   (value) ? Math.round(settings.watt_meter_report_period / 5) : 0
			  ]),
    },
    "enable_kwh_meter_report": {
      "size": 2,
      "index": 2,
      "parser": (value, settings) => new Buffer([
				   (value) ? Math.round(settings.kwh_meter_report_period / 10) : 0
			  ]),
    },
    "watt_meter_report_period": {
      "size": 2,
      "index": 1,
      "parser": (value, settings) => new Buffer([
           (settings.enable_watt_meter_report) ? Math.round(value / 5) : 0
				 ])
    },
    "kwh_meter_report_period:": {
      "size": 2,
      "index": 2,
      "parser": (value, settings) => new Buffer([
           (settings.enable_kwh_meter_report) ? Math.round(value / 10) : 0
				 ])
    },
    "threshold_of_current_for_load_caution": {
      "size": 2,
      "index": 3,
      "parser": (value) => new Buffer([ value * 100 ]),
    },
    "enable_kwh_for_load_caution": {
      "size": 2,
      "index": 2,
      "parser": (value, settings) => new Buffer([
				   (value) ? Math.round(settings.threshold_of_kwh_for_load_caution) : 0
			  ]),
    },
    "threshold_of_kwh_for_load_caution": {
      "size": 2,
      "index": 4,
      "parser": (value, settings) => new Buffer([
           (settings.enable_kwh_for_load_caution) ? Math.round(value) : 0
				 ])
    },
    "restore_switch_state_mode": {
      "size": 1,
      "index": 5
    },
    "mode_of_switch_off_function": {
      "size": 1,
      "index": 6,
      "parser": (value) => new Buffer([
				   (value) ? 0 : 1
			  ]),
    },
    "led_indication_mode": {
      "size": 1,
      "index": 7
    },
    "enable_auto_off_timer": {
      "size": 1,
      "index": 8,
      "parser": (value, settings) => new Buffer([
				   (value) ? Math.round(settings.auto_off_timer) : 0
			  ]),
    },
    "auto_off_timer": {
      "size": 1,
      "index": 8,
      "parser": (value, settings) => new Buffer([
           (settings.enable_auto_off_timer) ? Math.round(value) : 0
				 ])
    },
    "rf_off_command_mode": {
      "size": 1,
      "index": 9
    }
  }
});
