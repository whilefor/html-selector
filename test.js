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