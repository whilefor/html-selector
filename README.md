# html-selector

Get website data using chrome headless

## Installation

```
npm install html-selector
```

## Sample API usage

```js
    const htmlSelector = require('./index.js');
    htmlSelector({
        name: 'Google',
        url: 'https://www.google.com',
        waitAppearsNode: ['#fsl'],
        data: {
            inputValues: { 
                selector: '.tsf-p center input',
                attribute: 'value'
            },
            logocont: {
                selector: '.tsf-p #logocont'
            },
            fsl: {
                selector: '#fsl a'
            },
            fsl1: {
                selector: '#fsl',
                children: 0
            },
            fsl2: {
                selector: '#fsl',
                children: 1
            },
            fsl3_class: {
                selector: '#fsl',
                children: 2,
                attribute: 'class'
            }
        }
    }).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });

    // output:
    { url: 'https://www.google.com',
      name: 'Google',
      data:
       [ { inputValues: [Object],
           logocont: '<h1><a href="https://www.google.com.hk/webhp?hl=zh-TW&amp;sa=X&amp;ved=0ahUKEwj9y-ytmdvUAhWIsJQKHTAmAs8QPAgD" title="Google 首頁" id="logo" data-hveid="3"><img src="/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png" alt="Google" height="44" width="120" onload="google.aft&amp;&amp;google.aft(this)"></a></h1>',
           fsl: [Object],
           fsl1: '廣告',
           fsl2: '企業',
           fsl3_class: '_Gs' } ] }
```


## API

### htmlSelector(config)

`config` is an object of site info.

* `name` : name
* `url` : url
* `timeout` : Maximum navigation time in milliseconds, defaults to 300000 ms.
* `waitUntil`: When to consider navigation succeeded, defaults to load. Could be either:
    - load - consider navigation to be finished when the load event is fired.
    - networkidle - consider navigation to be finished when the network activity stays "idle" for at least networkIdleTimeout ms.
* `networkIdleTimeout`: A timeout to wait before completing navigation. Takes effect only with waitUntil: 'networkidle' parameter. Defaults to 1000 ms.
* `selector` : selector for the data. Defaults to `body`
* `limit` : limit of selector items. Defaults to `3`
* `data` : object, every element data struct of the rootSelector.
    - `selector` :the selector for get the node(default to get innerHTML of the node)
    - `attribute` : get attribute value of the node
    - `childNodes` : the index of the childNodes
    - `children` : the index of the children
* `waitAppearsNode` : string or array, wait node appears after loadEventFired. Defaults to `body`
* `waitAppearsNodeTimeout` : wait node appears timeout. Defaults to `10000` (ms)

* returns: a `Promise` object is returned when done.




