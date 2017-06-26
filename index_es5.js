'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-polyfill');
var _ = require('lodash');
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;


var chrome = require('./chrome.js');
var creatNewTab = chrome.creatNewTab;
var getPageHtml = chrome.getPageHtml;
var waitNodeAppears = chrome.waitNodeAppears;
var closeAllTab = chrome.closeAllTab;
var closeTab = chrome.closeTab;

var defaultConfig = {
	// name of the config
	name: '',

	// site url
	url: '',

	// timeout of loading page
	timeout: 10000,

	// root selector for the result array
	rootSelector: 'body',

	// count of the rootSelector
	limit: 3,

	// wait node appears after loadEventFired
	waitAppearsNode: 'body',
	waitAppearsNodeTimeout: 10000
};

function getData(config) {
	var _this = this;

	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function () {
		var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(resolve, reject) {
			var _config, url, name, timeout, rootSelector, limit, data, waitAppearsNode, waitAppearsNodeTimeout, datas, tab, client, target, Page, DOM, loadTimer, waitNodeAppearsResult, html, dom, sections, _loop, i, item;

			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							config = _.extend(defaultConfig, config);

							_config = config, url = _config.url, name = _config.name, timeout = _config.timeout, rootSelector = _config.rootSelector, limit = _config.limit, data = _config.data, waitAppearsNode = _config.waitAppearsNode, waitAppearsNodeTimeout = _config.waitAppearsNodeTimeout;

							if (!(!url || !name)) {
								_context2.next = 5;
								break;
							}

							reject('url and name required');
							return _context2.abrupt('return');

						case 5:
							datas = [];

							data = data ? data : {};

							_context2.prev = 7;
							_context2.next = 10;
							return creatNewTab(options);

						case 10:
							tab = _context2.sent;
							client = tab.client, target = tab.target;
							Page = client.Page, DOM = client.DOM;

							// loading timeout

							loadTimer = setTimeout(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
								return regeneratorRuntime.wrap(function _callee$(_context) {
									while (1) {
										switch (_context.prev = _context.next) {
											case 0:
												_context.next = 2;
												return closeTab(target);

											case 2:
												_context.next = 4;
												return client.close();

											case 4:
												reject('loading page timeout after ' + timeout + 'ms');
												return _context.abrupt('return');

											case 6:
											case 'end':
												return _context.stop();
										}
									}
								}, _callee, _this);
							})), timeout);
							_context2.next = 16;
							return Page.enable();

						case 16:
							_context2.next = 18;
							return DOM.enable();

						case 18:
							_context2.next = 20;
							return Page.navigate({ url: url });

						case 20:
							_context2.next = 22;
							return Page.loadEventFired();

						case 22:
							clearTimeout(loadTimer);

							// Wait for the specific element appears
							_context2.next = 25;
							return waitNodeAppears(client, { observerSelector: waitAppearsNode, timeout: waitAppearsNodeTimeout });

						case 25:
							waitNodeAppearsResult = _context2.sent;

							if (!(waitNodeAppearsResult == 0)) {
								_context2.next = 29;
								break;
							}

							reject('waitAppearsNode not valid or DOM not appears');
							return _context2.abrupt('return');

						case 29:
							_context2.next = 31;
							return getPageHtml(client, 'body');

						case 31:
							html = _context2.sent;

							if (html) {
								_context2.next = 35;
								break;
							}

							reject('get page html error');
							return _context2.abrupt('return');

						case 35:

							// get the data from dom
							dom = new JSDOM(html);
							sections = [].concat(_toConsumableArray(dom.window.document.querySelectorAll(rootSelector))).slice(0, limit);

							_loop = function _loop(i) {
								var section = sections[i];
								datas[i] = {};
								_.forEach(data, function (v, k) {
									var selector = v['selector'];

									var nodes = section.querySelectorAll(selector);
									// console.log('selector: ', selector);
									// console.log('nodes: ', nodes);
									if (!selector || !nodes || !nodes.length) {
										datas[i][k] = null;
									} else {
										if (nodes.length == 1) {
											datas[i][k] = getNodeData(nodes[0], v);
										} else {
											datas[i][k] = [];
											_.forEach(nodes, function (node) {
												var html = getNodeData(node, v);
												datas[i][k].push(html);
											});
										}
									}
								});
							};

							for (i = 0; i < sections.length; i++) {
								_loop(i);
							}
							_context2.next = 41;
							return closeTab(target);

						case 41:
							_context2.next = 43;
							return client.close();

						case 43:
							_context2.next = 49;
							break;

						case 45:
							_context2.prev = 45;
							_context2.t0 = _context2['catch'](7);

							console.log(_context2.t0);
							reject(_context2.t0);

						case 49:
							item = {
								url: url,
								name: name,
								data: datas
							};

							resolve(item);

						case 51:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, _this, [[7, 45]]);
		}));

		return function (_x2, _x3) {
			return _ref.apply(this, arguments);
		};
	}());
}

function getNodeData(node) {
	var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (!_.isElement(node)) {
		return;
	}

	var attribute = config['attribute'];
	var childNodesIndex = config['childNodes'];
	var childrenIndex = config['children'];

	var data = '';
	if (_.isNumber(childNodesIndex)) {
		node = getNodeChildNode(node, childNodesIndex);
	} else if (_.isNumber(childrenIndex)) {
		node = getNodeChild(node, childrenIndex);
	}

	if (!node) {
		return data;
	}

	if (attribute) {
		data = getNodeAttribute(node, attribute);
	} else if (node.innerHTML) {
		data = node.innerHTML;
	} else if (node.nodeValue) {
		data = node.nodeValue;
	}

	if (data) {
		data = data.replace(/(^\s*)|(\s*$)/g, "");
	}

	return data;
}

function getNodeAttribute(node) {
	var attribute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	if (!_.isElement(node) || !node.getAttribute) {
		return;
	}

	return node.getAttribute(attribute);
}

function getNodeChildNode(node) {
	var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

	if (!_.isElement(node) || !node.childNodes) {
		return;
	}

	return node.childNodes[index];
}

function getNodeChild(node) {
	var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

	if (!_.isElement(node) || !node.children) {
		return;
	}

	return node.children[index];
}

module.exports = getData;
