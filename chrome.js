const _      = require('lodash');
const CDP    = require('chrome-remote-interface');

function creatNewTab(options = {}){
	return new Promise((resolve, reject)=>{
        let _target;
		CDP.New(options).then((target) => {
            _target = target;
		    return CDP({target});
		}).then((client) => {
			// console.log('New Tab Created');
			resolve({
                client: client,
                target: _target
            });
		}).catch((err) => {
			console.log('Create New Tab error');
			reject(err);
		});	
	})
}

async function getPageHtml(client, selector = 'body'){
	const { DOM } = client;
	try {
        let dom  = await DOM.getDocument();
		let nodeId = await DOM.querySelector({nodeId: 1,selector: selector});
        let html = await DOM.getOuterHTML(nodeId);
        return html.outerHTML;
	} catch (err) {
	    console.error(err);
		return false;
	}
}

// wait node appears, return 0 for time out(not found), return 1 for appeared.
async function waitNodeAppears(client, {observerSelector = 'body', timeout = 10000} = {}) {
	if(!_.isNumber(timeout)){
        timeout = 10000;
	}

    // browser code to register and parse mutations
    const browserCode = (observerSelector, timeout) => {
        return new Promise((resolve, reject) => {
            function isArray(o) {    
                return Object.prototype.toString.call(o) === '[object Array]';     
            }
            function isString(o) {    
                return Object.prototype.toString.call(o) === '[object String]';     
            }
            function isFindAll(observerSelector) {
                if(isArray(observerSelector)){
                    let resolves = observerSelector.map((x)=>{
                        return document.querySelector(x);
                    });
                    if(resolves.find((r)=>{return !r}) === undefined){
                        return true;
                    }
                } else if(isString(observerSelector)){
                    if(document.querySelector(observerSelector)){
                        return true;
                    }
                }
            }

        	if(isFindAll(observerSelector)){
        		resolve(1);
        		return;
        	}

            if(timeout <= 0){
                resolve(0);
                return;
            }

            let observerSelectorTimer = setInterval(()=>{
                if(isFindAll(observerSelector)){
                    clearInterval(observerSelectorTimer);
                    resolve(1);
                }
            }, 500);

            // wait node appears timeout
	        setTimeout(function() {
                clearInterval(observerSelectorTimer)
	            resolve(0);
	        }, timeout);
        });
    };

    // inject the browser code
    const {Runtime} = client;
    let RuntimeResult = await Runtime.evaluate({
        expression: `(${browserCode})(${JSON.stringify(observerSelector)}, ${JSON.stringify(timeout)})`,
        awaitPromise: true
    });

    let val = RuntimeResult.result.value;
    if (val == 0) {
    	// wait node appears timeout, not found
    	return val; 
    } else if(val == 1){
    	// found
		return val; 
    }
}

function closeAllTab(options = {}){
    return new Promise(async (resolve, reject)=>{
        let targets = await CDP.List(options);
        targets.forEach(async (target)=>{
            await closeTab(target);
        })
    })
}

function closeTab(target){
    return new Promise((resolve, reject)=>{
        CDP.Close(target).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            console.log(err);
            reject(err);
        })
    })
}

module.exports = {
    creatNewTab     : creatNewTab,
    getPageHtml     : getPageHtml,
    waitNodeAppears : waitNodeAppears,
    closeAllTab     : closeAllTab,
    closeTab        : closeTab
}
