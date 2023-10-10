import INDEXED from './indexed';
import tools from './tools';

const prefix = 'w3os_chat_';
const DBname='w3os_history';
//let curDB=null;

const status = {
    UNREAD: 3,
    NORMAL: 1,
    REMOVE: 0
}
const CHAT = {
    save: (mine, from, ctx, ck) => {
        INDEXED.checkDB(DBname, (res) => {
            //curDB=res;
            const row = { from:from,msg: ctx,to:"", status: status.UNREAD, stamp: tools.stamp()};
            const tbs = res.objectStoreNames;
            if (!CHAT.checkTable(mine, tbs)) {
                INDEXED.initDB(DBname,[
                    {table: mine, keyPath: "stamp", map: {from:{ unique: false }, stamp: { unique: false }, status: { unique: false } } }
                ], res.version + 1).then((db) => {
                    //curDB=db;
                    INDEXED.insertRow(db, mine, [row]);
                    return ck && ck(true);
                });
            }else{
                INDEXED.insertRow(res, mine, [row]);
                return ck && ck(true);
            }
        });
    },
    page:(mine,from,step,page,ck)=>{
        INDEXED.checkDB(DBname, (db) => {
            INDEXED.searchRows(db,mine,'from',from,ck);
        });
    },
    unread: (mine,from,ck) => {

    },
    
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
};

export default CHAT;