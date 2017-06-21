require('babel-polyfill');
const _      = require('lodash');
const jsdom  = require("jsdom");
const { JSDOM } = jsdom;

const chrome = require('./chrome.js');
const creatNewTab     = chrome.creatNewTab;
const getPageHtml     = chrome.getPageHtml;
const waitNodeAppears = chrome.waitNodeAppears;
const closeAllTab     = chrome.closeAllTab;
const closeTab        = chrome.closeTab;

const defaultConfig = {
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
}

function getData(config, options = {}) {
	return new Promise(async (resolve, reject)=>{
		config = _.extend(defaultConfig, config);

		let { url,
			name,
			limit,
			data,
			rootSelector,
			observerSelector, 
			timeout,
			observerSelectorTimeout } = config;
		let datas = [];

		data = data ? data : {}

		try{
			// create a new tab through chrome headless mode.
			let tab = await creatNewTab(options);
			let { client, target } = tab;
			const { Page, DOM } = client;

			// loading timeout
			let loadTimer = setTimeout(async ()=>{
				await closeTab(target);
		    	await client.close();
		    	reject(`loading page timeout after ${timeout}ms`);
		    	return;
			}, timeout);

		    await Page.enable();
		    await DOM.enable();
		    await Page.navigate({url: url});
		    // console.log(`Page navigate to ${url}`);
		    await Page.loadEventFired();
		    clearTimeout(loadTimer);

		    // Wait for the specific element appears
			let waitNodeAppearsResult = await waitNodeAppears(client, rootSelector, {observerSelector: observerSelector, timeout: observerSelectorTimeout});
			if(waitNodeAppearsResult == 0){
				reject('rootSelector not valid or DOM not found');
				return;
			}

			// get the html for analysis
			let html = await getPageHtml(client, observerSelector);
			if(!html){
				reject('get page html error');
				return;
			}
			// get the data from dom
			const dom = new JSDOM(html);
			let sections = [...dom.window.document.querySelectorAll(rootSelector)].slice(0, limit);
			for(let i = 0; i < sections.length; i++){
				let section = sections[i];
				datas[i] = {};
				_.forEach(data, (v, k)=>{
					let selector   = v['selector'];

					let nodes = section.querySelectorAll(selector);
					if(!selector || !nodes || !nodes.length){
						datas[i][k] = null;
					} else {
						if(nodes.length == 1){
							datas[i][k] = getNodeInnerHTML(nodes[0], v);
						} else {
							datas[i][k] = [];
							_.forEach(nodes, (node)=>{
								let html = getNodeInnerHTML(node, v);
								datas[i][k].push(html);
							})
						}
					}
				})
			}
			await closeTab(target);
		    await client.close();

		} catch(error){
			console.log(error);
			reject(error);
		}

		let item = {
			url    : url,
			name   : name,
			data  : datas
		};
		resolve(item);
	})
}


function getNodeInnerHTML(node, config = {}){
	let attribute  = config['attribute'];
	let childNodes = config['childNodes'];
	let children   = config['children'];

	let html = '';
	if(attribute && childNodes === undefined && children === undefined){
		if(node.getAttribute){
			html = node.getAttribute(attribute);
		}
	} else if((childNodes && _.isNumber(childNodes)) || 
				(children && _.isNumber(children))){

		if(childNodes){
			node = node.childNodes[childNodes];
		} else {
			node = node.children[children];
		}

		if(attribute && node.getAttribute){
			html = node.getAttribute(attribute);
		} else if(node.innerHTML){
			html = node.innerHTML;
		} else if(node.nodeValue){
			html = node.nodeValue;
		} else {
			html = "";
		}
	} else {
		html = node.innerHTML;
	}

	if(html){
		html = html.replace(/(^\s*)|(\s*$)/g, "");
	}

	return html;
}

module.exports = getData