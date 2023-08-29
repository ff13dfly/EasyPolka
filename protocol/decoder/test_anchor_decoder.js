/**
\0 ：null（\u0000）
\b ：后退键（\u0008）
\f ：换页符（\u000C）
\n ：换行符（\u000A）
\r ：回车键（\u000D）
\t ：制表符（\u0009）
\v ：垂直制表符（\u000B）
\' ：单引号（\u0027）
\" ：双引号（\u0022）
\\ ：反斜杠（\u005C）
**/

const {decoder}=require("./anchor_link");

const list=[
    [   //1. protocol check
        "abc",
        "anchor://",
        "anchor://hello",
        "anchor://hello/2234",
        "anchor://你好/2234",
        "anchor://你好/2234/",
    ],
    [   //2.special characters
        `anchor://hello/22\n34`,
        `anchor://hello/22\r34`,
        NaN,
        null,
        function(){},
        -200,
        ["hell","me"],
        "+anchor", 
    ],
    [   //3. server check
        "anchor://abc@wss://dev.metanchor.net",
        "anchor://abc@fake.metanchor.net",
        "anchor://abc/223@127.0.0.1",
        "anchor://abc/223@ws://localhost",
        "anchor://abc/223@localhost",
        "anchor://abc@ccc@polkadot",
        "anchor://abc@@@",
        "anchor://abc@@@wss://dev.metanchor.net",
        "anchor://abc|@@@",
    ],
    [   //4. parameters check
        "anchor://abc?a=aaa&b=234&input=333",
        "anchor://abc/?a=aaa&b=234&input=333",
        "anchor://abc//?a=aaa&b=234&input=333",
        "anchor://abc?ccc?a=aaa&b=234&input=333",
        "anchor://abc?ccc?a=aaa&b==234&input=333",
    ],
    [   //5. JSON key check
        "anchor://abc|||",
        "anchor://abc|abc|",
        "anchor://abc|ddd?a=33;b=22",
        "anchor://abc|ddd?a=33&b=22",
        "anchor://abc|ddd?a=33&b|=22",
        "anchor://abc/|ddd?a=33&b=22",
    ],
    [   //6. block range check
        "anchor://abc/123/3345~3499",
        "anchor://abc/3345~3499/",
        "anchor://abc/3345~3499",
        "anchor://abc/3345~3499~3945",
        "anchor://abc///3345~3499/",
        "anchor://abc/3345~3499|||?a=33&b=abcd",
        "anchor://abc/123/3345~3499|key_name?tpl=dark&title=today@wss://dev.metanchor.net",
    ],
];
const intro=[
    "Basic protocol check",
    "Special characters check",
    "Server check",
    "Parameters check",
    "JSON key check",
    "Block range check",
];

//1.decode from right ( rule of decode )
console.log('\x1b[33m%s\x1b[0m',`\nAnchor Link Decoder test\n`);
for(let i=0;i<list.length;i++){
    console.log(intro[i]);
    console.log("----------------------------------------------------");
    const row=list[i];
    for(let j=0;j<row.length;j++){
        const res=decoder(row[j]);
        console.log(`[${j}]: ${row[j]}`);
        console.log(`${JSON.stringify(res)}\n`);
    }
}
