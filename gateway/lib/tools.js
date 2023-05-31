const self={
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
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