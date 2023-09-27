module.exports={
  "basic":{   //OS basic parameters
    "endpoint":["ws://127.0.0.1:9944"],
    "name":"W3OS",
    "desc":"Full on chain OS for Web3.0, base on Anchor Network.",
    "version":"1.0.1",
    "auth":["Fuu"],
    "loader":"loader.html",
    "protocol":["Easy Protocol"],
  },
  "APIs":{
    "Polkadot":{
      "latest":"anchor://polkadot",
      "stable":"anchor://polkadot"
    },
    "anchorJS":{
      "latest":"anchor://anchorjs",
      "stable":"anchor://anchorjs"
    },
    "Easy":{
      "latest":"anchor://easy",
      "stable":"anchor://easy"
    },
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
    "contact":{
      "node":[
        "ws://localhost:7788",
        "wss://hub.metanchor.net"
      ],
      "max":500,
      "permit":{},
      "icon":"https://robohash.org/",
      "format":"png",
    },
    "account":{
      "max":10,
      "icon":"https://robohash.org/",
      "format":"png",
    },
    "trend":{
      "list":["BTC","ETH","DOT"],
      "node":[
        "ws://localhost:7788",
        "wss://hub.metanchor.net"
      ],
      "link":"anchor://trend",
    },
    "lottery":{
      "network":"Anchor",
      "interval":600,
      "node":[
        "ws://127.0.0.1:1688",
        "ws://127.0.0.1:9944"
      ],
    }
  }
}