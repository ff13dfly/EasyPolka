import INDEXED from './indexed';
import tools from './tools';

const prefix = 'w3os_chat_';
const DBname='w3os_history';
const status = {
    UNREAD: 3,
    NORMAL: 1,
    REMOVE: 0
}
const CHAT = {
    save: (mine, from, ctx, ck) => {
        INDEXED.checkDB(DBname, (res) => {
            const row = { from:from,msg: ctx,to:"", status: status.UNREAD, stamp: tools.stamp()};
            const tbs = res.objectStoreNames;
            if (!CHAT.checkTable(mine, tbs)) {
                INDEXED.initDB(DBname,[
                    {table: mine, keyPath: "stamp", map: {from:{ unique: false }, stamp: { unique: false }, status: { unique: false } } }
                ], res.version + 1).then((db) => {
                    INDEXED.insertRow(db, mine, [row]);
                    return ck && ck(true);
                });
            }else{
                INDEXED.insertRow(res, mine, [row]);
                return ck && ck(true);
            }
        });
    },
    unread: (from) => {

    },
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
};

export default CHAT;