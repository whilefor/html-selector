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

	// root selector for the data
	rootSelector: 'body',

	// count of the rootSelector
	limit: 3,

	// observer selector for wait the htm node appears after loadEventFired
	observerSelector: 'body',

	// observer selector timeout
	observerSelectorTimeout: 10000
};

function getData(config) {
	var _this = this;

	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function () {
		var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(resolve, reject) {
			var _config, url, name, limit, data, rootSelector, observerSelector, timeout, observerSelectorTimeout, datas, tab, client, target, Page, DOM, loadTimer, waitNodeAppearsResult, html, dom, sections, _loop, i, item;

			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							config = _.extend(defaultConfig, config);

							_config = config, url = _config.url, name = _config.name, limit = _config.limit, data = _config.data, rootSelector = _config.rootSelector, observerSelector = _config.observerSelector, timeout = _config.timeout, observerSelectorTimeout = _config.observerSelectorTimeout;
							datas = [];


							data = data ? data : {};

							_context2.prev = 4;
							_context2.next = 7;
							return creatNewTab(options);

						case 7:
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
							_context2.next = 13;
							return Page.enable();

						case 13:
							_context2.next = 15;
							return DOM.enable();

						case 15:
							_context2.next = 17;
							return Page.navigate({ url: url });

						case 17:
							_context2.next = 19;
							return Page.loadEventFired();

						case 19:
							clearTimeout(loadTimer);

							// Wait for the specific element appears
							_context2.next = 22;
							return waitNodeAppears(client, rootSelector, { observerSelector: observerSelector, timeout: observerSelectorTimeout });

						case 22:
							waitNodeAppearsResult = _context2.sent;

							if (!(waitNodeAppearsResult == 0)) {
								_context2.next = 26;
								break;
							}

							reject('rootSelector not valid or DOM not found');
							return _context2.abrupt('return');

						case 26:
							_context2.next = 28;
							return getPageHtml(client, observerSelector);

						case 28:
							html = _context2.sent;

							if (html) {
								_context2.next = 32;
								break;
							}

							reject('get page html error');
							return _context2.abrupt('return');

						case 32:
							// get the data from dom
							dom = new JSDOM(html);
							sections = [].concat(_toConsumableArray(dom.window.document.querySelectorAll(rootSelector))).slice(0, limit);

							_loop = function _loop(i) {
								var section = sections[i];
								datas[i] = {};
								_.forEach(data, function (v, k) {
									var selector = v['selector'];

									var nodes = section.querySelectorAll(selector);
									if (!selector || !nodes || !nodes.length) {
										datas[i][k] = null;
									} else {
										if (nodes.length == 1) {
											datas[i][k] = getNodeInnerHTML(nodes[0], v);
										} else {
											datas[i][k] = [];
											_.forEach(nodes, function (node) {
												var html = getNodeInnerHTML(node, v);
												datas[i][k].push(html);
											});
										}
									}
								});
							};

							for (i = 0; i < sections.length; i++) {
								_loop(i);
							}
							_context2.next = 38;
							return closeTab(target);

						case 38:
							_context2.next = 40;
							return client.close();

						case 40:
							_context2.next = 46;
							break;

						case 42:
							_context2.prev = 42;
							_context2.t0 = _context2['catch'](4);

							console.log(_context2.t0);
							reject(_context2.t0);

						case 46:
							item = {
								url: url,
								name: name,
								data: datas
							};

							resolve(item);

						case 48:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, _this, [[4, 42]]);
		}));

		return function (_x2, _x3) {
			return _ref.apply(this, arguments);
		};
	}());
}

function getNodeInnerHTML(node) {
	var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var attribute = config['attribute'];
	var childNodes = config['childNodes'];
	var children = config['children'];

	var html = '';
	if (attribute && childNodes === undefined && children === undefined) {
		if (node.getAttribute) {
			html = node.getAttribute(attribute);
		}
	} else if (childNodes && _.isNumber(childNodes) || children && _.isNumber(children)) {

		if (childNodes) {
			node = node.childNodes[childNodes];
		} else {
			node = node.children[children];
		}

		if (attribute && node.getAttribute) {
			html = node.getAttribute(attribute);
		} else if (node.innerHTML) {
			html = node.innerHTML;
		} else if (node.nodeValue) {
			html = node.nodeValue;
		} else {
			html = "";
		}
	} else {
		html = node.innerHTML;
	}

	if (html) {
		html = html.replace(/(^\s*)|(\s*$)/g, "");
	}

	return html;
}

module.exports = getData;
