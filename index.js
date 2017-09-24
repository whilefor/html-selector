require('babel-polyfill');
const puppeteer = require('puppeteer');

const _      = require('lodash');
const jsdom  = require("jsdom");
const { JSDOM } = jsdom;

const defaultConfig = {
	// name of the config
	name: '',

	// site url
	url: '',

	// options of page.goto
	timeout: 30000,           // Maximum navigation time in milliseconds
	waitUntil: 'load',        // load or networkidle
	networkIdleTimeout: 1000, // only with waitUntil: 'networkidle' parameter

	// selector
	selector: 'body',

	// limit of selector items
	limit: 3,

	// wait node appears after page load
	waitAppearsNode: 'body',
	waitAppearsNodeTimeout: 10000,
}

function getData(config, options = {}) {
	return new Promise(async (resolve, reject)=>{
		config = _.extend(defaultConfig, config);

		let { url,
			name,
			timeout,
			waitUntil,
			networkIdleTimeout,
			selector,
			limit,
			data = {},
			waitAppearsNode, 
			waitAppearsNodeTimeout } = config;

		if( !url || !name ){
			reject('url and name required');
			return;
		}

		let datas = [];

		try {
			const browser = await puppeteer.launch({headless: false});
			const page    = await browser.newPage();

			await page.goto(url, {
				timeout,
				waitUntil,
				networkIdleTimeout
			});

		    console.log(`page goto: ${url}`);

		    // Wait for the specific element appears
		    await page.waitForSelector(waitAppearsNode, {
		    	timeout: waitAppearsNodeTimeout
		    });

			// get the body html for analysis
			let html = await page.evaluate(() => {
				return '<body>' + document.querySelector('body').innerHTML + '</body>';
			});

			// generate data from html
			const dom = new JSDOM(html);
			let sections = [...dom.window.document.querySelectorAll(selector)].slice(0, limit);
			sections.forEach((section, i)=>{
				datas[i] = {};
				_.forEach(data, (v, k)=>{
					let selector = v['selector'];
					let nodes = section.querySelectorAll(selector);

					if(!selector || !nodes || !nodes.length){
						datas[i][k] = null;
						return;
					}

					if(nodes.length == 1){
						datas[i][k] = getNodeData(nodes[0], v);
					} else {
						datas[i][k] = [];
						_.forEach(nodes, (node)=>{
							let html = getNodeData(node, v);
							datas[i][k].push(html);
						})
					}
				})

			})

			await page.close();
			await browser.close()

		} catch(error){
			console.log(error);
			reject(error);
		}

		let item = {
			url  : url,
			name : name,
			data : datas
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