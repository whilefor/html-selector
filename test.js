const htmlSelector = require('./index_es5.js');

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