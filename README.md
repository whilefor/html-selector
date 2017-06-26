# html-selector

Get website data using chrome headless mode

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

## Setup

An instance of either Chrome itself or another implementation needs to be
running on a known port in order to use this module (defaults to
`localhost:9222`).

### Chrome/Chromium

#### Desktop

Start Chrome with the `--remote-debugging-port` option, for example:

```
    google-chrome --remote-debugging-port=9222
```

##### Headless

Since version 59, additionally use the `--headless` option, for example:

```
    google-chrome --headless --remote-debugging-port=9222
```


## API

### htmlSelector(config, [options])

`config` is an object of site info.

* `name` : name
* `url` : url
* `timeout` : timeout of loading page. Defaults to `10000` (ms)
* `rootSelector` : root selector for the data. Defaults to `body`
* `limit` : count for the root selector. Defaults to `3`
* `data` : object, every element data struct of the rootSelector.
    - `selector` :the selector for get the node(default to get innerHTML of the node)
    - `attribute` : get attribute value of the node
    - `childNodes` : the index of the childNodes
    - `children` : the index of the children
* `waitAppearsNode` : string or array, wait node appears after loadEventFired. Defaults to `body`
* `waitAppearsNodeTimeout` : wait node appears timeout. Defaults to `10000` (ms)

`options` is an object of [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface#cdpoptions-callback)

a `Promise` object is returned when done.

* `data` : result data, an array





