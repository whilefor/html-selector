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

	fireType: 'loadEventFired',

	// root selector for the result array
	rootSelector: 'body',

	// count of the rootSelector
	limit: 3,

	// wait node appears after loadEventFired
	waitAppearsNode: 'body',
	waitAppearsNodeTimeout: 10000,
}

function getData(config, options = {}) {
	return new Promise(async (resolve, reject)=>{
		config = _.extend(defaultConfig, config);

		let { url,
			name,
			timeout,
			fireType,
			rootSelector,
			limit,
			data,
			waitAppearsNode, 
			waitAppearsNodeTimeout } = config;

		if( !url || !name ){
			reject('url and name required');
			return;
		}

		let datas = [];
		data = data ? data : {};

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

		    if(fireType === 'loadEventFired'){
		    	await Page.loadEventFired();
		    } else if(fireType === 'domContentEventFired'){
		    	await Page.domContentEventFired();
		    } else {
		    	await Page.loadEventFired();
		    }

		    clearTimeout(loadTimer);

		    // Wait for the specific element appears
			let waitNodeAppearsResult = await waitNodeAppears(client, {observerSelector: waitAppearsNode, timeout: waitAppearsNodeTimeout});
			if(waitNodeAppearsResult == 0){
				reject('waitAppearsNode not valid or DOM not appears');
				return;
			}

			// get the body html for analysis
			let html = await getPageHtml(client, 'body');
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
					// console.log('selector: ', selector);
					// console.log('nodes: ', nodes);
					if(!selector || !nodes || !nodes.length){
						datas[i][k] = null;
					} else {
						if(nodes.length == 1){
							datas[i][k] = getNodeData(nodes[0], v);
						} else {
							datas[i][k] = [];
							_.forEach(nodes, (node)=>{
								let html = getNodeData(node, v);
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


function getNodeData(node, config = {}){
	if(!_.isElement(node)){
		return;
	}

	let attribute       = config['attribute'];
	let childNodesIndex = config['childNodes'];
	let childrenIndex   = config['children'];

	let data = '';
	if(_.isNumber(childNodesIndex)){
		node = getNodeChildNode(node, childNodesIndex);
	} else if(_.isNumber(childrenIndex)){
		node = getNodeChild(node, childrenIndex);
	}

	if(!node) {
		return data;
	}

	if(attribute){
		data = getNodeAttribute(node, attribute);
	} else if(node.innerHTML){
		data = node.innerHTML;
	} else if(node.nodeValue){
		data = node.nodeValue;
	}

	if(data){
		data = data.replace(/(^\s*)|(\s*$)/g, "");
	}

	return data;
}

function getNodeAttribute(node, attribute = ''){
	if(!_.isElement(node) || !node.getAttribute){
		return;
	}

	return node.getAttribute(attribute);
}

function getNodeChildNode(node, index = -1){
	if(!_.isElement(node) || !node.childNodes){
		return;
	}

	return node.childNodes[index];
}

function getNodeChild(node, index = -1){
	if(!_.isElement(node) || !node.children){
		return;
	}

	return node.children[index];
}

module.exports = getData