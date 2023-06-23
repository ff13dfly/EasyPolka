const request = require('request');

const self = {
    curl: (url, ck) => {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body)
                try {
                    const json=JSON.parse(body);
                    return ck && ck(json);
                } catch (error) {

                }
            } else {
                console.log("Error " + response)
            }
        })
    },
    stamp:()=>{
        return new Date().getTime();
    },
    multi:(spam,count)=>{
        console.log(`${count} times requests.`);
        for(let i=0;i<count;i++){
            const stamp=self.stamp();
            const url=`http://localhost:8001?id=testing_${stamp}&method=auto&svc=vHistory&act=testing&index=${i}&stamp=${stamp}&spam=${spam}`
            self.curl(url,(res)=>{
                console.log(`[${i}] Result ${JSON.stringify(res)}`);
            });
        }
    },
}

//var url_spam='http://localhost:8001?id=system_spam_id&method=spam&callback=?';
const url_spam = 'http://localhost:8001?id=system_spam_id&method=spam';

self.curl(url_spam,(res)=>{
    const spam=res.result.spam;
    console.log(spam);

    self.multi(spam,1000);
});
