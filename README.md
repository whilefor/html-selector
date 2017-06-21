# html-selector

Get website data using chrome headless mode

## Installation

```
npm install html-selector
```

## Sample API usage

```js
    const htmlSelector = require('html-selector');
    
    // get the Google input value
    // document.querySelector('.tsf-p center input'))
    htmlSelector({
        name: 'Google',
        url: 'https://www.google.com',
        rootSelector: '.tsf-p',
        data: {
            inputValues: { 
                selector: 'center input',
                attribute: 'value'
            },
            logocont: {
                selector: '#logocont'
            }
        }
    }).then((res)=>{
        console.log(res.data);
    }).catch((err)=>{
        console.log(err);
    });

    // output:
    [{ 
        inputValues: ["Google Search", "I\'m Feeling Lucky"],
        logocont: '<a href="https://www.goo....... </a>'
    }] 
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
* `url` : site url
* `timeout` : timeout of loading page 
* `rootSelector` : root selector for the data
* `limit` : count for the rootSelector
* `data` : data struct of every element (key:object)
    - for every object:
        + `selector` :the selector for get the node(default to get innerHTML of the node)
        + `attribute` : get attribute value of the node
        + `childNodes` : the index of the childNodes
        + `children` : the index of the children
* `observerSelector` : observer selector for wait the htm node appears after loadEventFired
* `observerSelectorTimeout` : observer selector timeout

`options` is an object of [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface#cdpoptions-callback)

a `Promise` object is returned when done.

* `data` : result data, an array





