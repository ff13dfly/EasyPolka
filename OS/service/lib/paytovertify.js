const {output}=require("../lib/output");

// Storage part 
const map={};
let count=0;
let target="";

let checker=null;   //checking interval
const agent={
    success:null,
    failed:null,
};

// Config part
const config={
    expired:10*60000,       // 10 minutes to expire the vertification
    at:4000,                // checking interval
};

// Callback message format
const format={
    success:{address:"",block:0,index:0},
    failed:{address:"",message:""},
}

//Functions
const self={
    amount:(address,force)=>{
        if(!map[address]){
            const n=self.rand(1,99);
            map[address]={  //set the amount and expired time
                amount:n,
                stamp:self.stamp()+config.expired,
            };
        }else{
            map[address].stamp=self.stamp()+config.expired;
        }
        return map[address].amount;
    },
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.round(Math.random() * (m-n) + n);},
}

module.exports={
    account:(acc)=>{
        target=acc;
    },
    agent:(success,failed)=>{
        agent.success=success;
        agent.failed=failed;
    },
    subcribe:(fun,convert)=>{
        if(agent.success===null || agent.failed===null) return {error:"No agent to sent the result"};

        if(checker===null){
            checker=setInterval(()=>{
                count++;
                output(`[${count}] Checking expired requests.`);
                for(let acc in map){
                    console.log(map[acc]);
                };

            },config.at);
        }

        fun((block,trans)=>{
            // console.log(`[ ${block} ]:${JSON.stringify(trans)}`);
            // console.log(map);
            // console.log(target);
            const list=convert(trans);

        });
    },
    add:(address,force,ck)=>{
        const amount=self.amount(address,force);
        return ck && ck(amount);
    },
}