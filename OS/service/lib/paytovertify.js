//

//Storage part 
const map={};
let checker=null;   //checking interval
const agent={
    success:null,
    failed:null,
};

//Config part
const config={
    expired:10*60000,       // 10 minutes to expire the vertification
    at:2000,                // checking interval
};

//Functions
const self={
    amount:(address)=>{
        const n=self.rand(1,99);
        map[address]={  //set the amount and expired time
            amount:n,
            stamp:self.stamp()+config.expired,
        };
        return n;
    },
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.round(Math.random() * (m-n) + n);},
}

module.exports={
    agent:(success,failed)=>{
        agent.success=success;
        agent.failed=failed;
    },
    subcribe:(fun)=>{
        if(agent.success===null || agent.failed===null) return {error:"No agent to sent the result"};

        if(checker===null){
            checker=setInterval(()=>{
                console.log("Checking expired requests.");
                for(let k in map){
                    //check expired
                };

                //agent.success(`Success:${self.stamp()}`);
                //agent.failed(`Failed:${self.stamp()}`);
            },config.at);
        }
        fun((block,trans)=>{
            // checking the accounts


        });
    },
    add:(address,ck)=>{
        const amount=self.amount(address);
        return ck && ck(amount);
    },
}