// test/client/src/scripts/index.js
var ViewModel = require('../../../shared/ViewModel');
var api = require('../../../shared/api');
window.vm = ViewModel.client({api: api});