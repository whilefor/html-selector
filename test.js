const htmlSelector = require('./index.js');

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