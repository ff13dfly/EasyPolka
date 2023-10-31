import INDEXED from './indexed';
import tools from './tools';

//const DBname='w3os_history';
let DBname='w3os_indexed';
let prefix='chat_';

const table={
    table: 'TABLE_NAME',
    keyPath: "stamp", 
    map: {
        address:{ unique: false },
        way:{ unique: false },
        stamp: { unique: false }, 
        status: { unique: false }
    }
}

const status = {
    UNREAD: 3,
    NORMAL: 1,
    REMOVE: 0
}

const map={};

const CHAT = {
    friends:(fs)=>{       //set friend list
        for(var k in fs) map[k]=true;
    },
    setConfig:(name,pre)=>{
        DBname=name;
        prefix=pre;
    },
    getTable:(name)=>{
        const data=JSON.parse(JSON.stringify(table));
        data.table=name;
        return data;
    },
    save: (mine, from, ctx,way, ck) => {
        const table=`${prefix}${mine}`;
        INDEXED.checkDB(DBname, (res) => {
            const row = { address:from,msg: ctx,status:(way==="to"?status.NORMAL:status.UNREAD),way:way,stamp: tools.stamp()};
            const tbs = res.objectStoreNames;
            if (!CHAT.checkTable(table, tbs)) {
                const tb=CHAT.getTable(table);
                INDEXED.initDB(DBname,[tb], res.version + 1).then((db) => {
                    INDEXED.insertRow(db, table, [row]);
                    return ck && ck(map[from]?true:from);
                });
            }else{
                INDEXED.insertRow(res, table, [row]);
                return ck && ck(map[from]?true:from);
            }
        });
    },
    page:(mine,from,step,page,ck)=>{
        INDEXED.checkDB(DBname, (db) => {
            const target=`${prefix}${mine}`;
            const tbs = db.objectStoreNames;
            if (!CHAT.checkTable(target, tbs)) return ck && ck(false);
            INDEXED.searchRows(db,target,'address',from,ck);
        });
    },

    unread: (mine,from,ck) => {
        const status=3;
        const target=`${prefix}${mine}`;
        INDEXED.checkDB(DBname, (db) => {
            INDEXED.countRows(db,target,"address",from,status,ck);
        });
    },

    toread:(mine,rows,ck)=>{
        const target=`${prefix}${mine}`;
        INDEXED.checkDB(DBname, (db) => {
            INDEXED.updateRow(db,target,rows,ck);
        });
    },
    
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
};

export default CHAT;