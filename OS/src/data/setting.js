module.exports={
  "basic":{   //OS basic parameters
    "endpoint":["ws://127.0.0.1:9944"],
    "contact":[
      "ws://localhost:7788",
      "wss://hub.metanchor.net"
    ],
    "trend":["BTC","ETH"]
  },
  "storage":{   //localstorage key definition
    "contact":"w3os_contact",
    "apps":"w3os_apps",
    "accounts":"w3os_account",
    "system":"w3os_system",
  },
  "format":{    //basic data structure
    "app":{ //app basic information
      "name":"account",
      "src":"",
      "block":0,
      "base":true,
      "status":"normal",
      "type":"system",
      "grid":{
        "size":[1,1],
        "position":[0,0],
      },
      "icon":"icons/app_01.jpg",
      "short":"Account",
      "desc":""
    },
    "contact":{ //contact data structure
      "intro":"",
      "status":"",
      "type":"friend",
      "network":"Anchor",
    },
    "account":{ //account data structure
      "address":"5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw",
      "short":"",
      "type":[],
      "file":"",
    }
  },
  "network":{  //support networks
    "anchor":[
      "ws://127.0.0.1:9944",
      "wss://dev.metanchor.net"
    ],
    "polkadot":[
      
    ],
    "bitcoin":[
      
    ]
  },
  "apps":{
    "lottery":{
      "network":"Anchor",
      "interval":600,
      "node":"",
    }
  }
}