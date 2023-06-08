const self={
    jsonp:(server,data,ck)=>{
        var uri=server+'?';
        if(data.id) uri += `id=${data.id}&`;
        if(data.method) uri += `method=${data.method}&`;
        for(var k in data.params) uri += `${k}=${data.params[k]}&`;
        uri+='callback=?';
        console.log(`${uri}`);
        if(!window.$) return {error:"Need jQuery support."}
        window.$.getJSON({type:'get',url:uri,async:false,success:function(res){
            return ck && ck(res);
        }});
    },
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.round(Math.random() * (m-n) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
    sn:(n)=>{
        n=n||24;let str='';
        for(let i=0;i<n;i++){
            if(i%6===0 && i!=0) str+='-';
            str+=self.rand(9,0);
        }
        return str;
    },
}

module.exports=self;