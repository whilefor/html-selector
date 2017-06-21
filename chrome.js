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
async function waitNodeAppears(client, selector, {observerSelector = 'body', timeout = 10000} = {}) {
	if(!_.isNumber(timeout)){
		throw new Error('timeout not valid, require number') 
	}

    // browser code to register and parse mutations
    const browserCode = (selector, observerSelector, timeout) => {
        return new Promise((resolve, reject) => {
        	if(document.querySelector(selector)){
        		resolve(1);
        		return;
        	}

            let observerSelectorTimer;
            if(window.MutationObserver && typeof window.MutationObserver === 'function'){
                // https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
                let observer = new MutationObserver((mutations, observer) => {
                    const nodes = [];
                    mutations.forEach((mutation) => {
                        nodes.push(...mutation.addedNodes);
                    });

                    if (nodes.find((node) => node.matches(selector))) {
                        observer.disconnect();
                        resolve(1);
                    }

                    for(let i = 0; i < nodes.length; i++){
                        if(nodes[i] && nodes[i].querySelector && nodes[i].querySelector(selector)){
                            observer.disconnect();
                            resolve(1);
                            break;
                        }
                    }
                })

                observer.observe(document.querySelector(observerSelector), {
                    childList: true
                });
            } else {
                observerSelectorTimer = setInterval(()=>{
                    if(document.querySelector(selector)){
                        clearInterval(observerSelectorTimer);
                        resolve(1);
                    }
                }, 500);
            }

            // wait node appears timeout
	        setTimeout(function() {
                clearInterval(observerSelectorTimer)
	        	observer.disconnect();
	            resolve(0);
	        }, timeout);
        });
    };

    // inject the browser code
    const {Runtime} = client;
    let RuntimeResult = await Runtime.evaluate({
        expression: `(${browserCode})(${JSON.stringify(selector)}, ${JSON.stringify(observerSelector)}, ${JSON.stringify(timeout)})`,
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
