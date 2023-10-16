import INDEXED from './indexed';
import tools from './tools';

const DBname='w3os_history';

const BILL = {
    save: (mine, from, ctx,way, ck) => {
        // INDEXED.checkDB(DBname, (res) => {
        //     const row = { address:from,msg: ctx,status:(way==="to"?status.NORMAL:status.UNREAD),way:way,stamp: tools.stamp()};
        //     const tbs = res.objectStoreNames;
        //     if (!CHAT.checkTable(mine, tbs)) {
        //         INDEXED.initDB(DBname,[
        //             {table: mine, keyPath: "stamp", map: {address:{ unique: false },way:{ unique: false },stamp: { unique: false }, status: { unique: false } } }
        //         ], res.version + 1).then((db) => {
        //             INDEXED.insertRow(db, mine, [row]);
        //             return ck && ck(map[from]?true:from);
        //         });
        //     }else{
        //         INDEXED.insertRow(res, mine, [row]);
        //         return ck && ck(map[from]?true:from);
        //     }
        // });
    },
    page:(mine,from,step,page,ck)=>{
        // INDEXED.checkDB(DBname, (db) => {
        //     const tbs = db.objectStoreNames;
        //     if (!CHAT.checkTable(mine, tbs)) return ck && ck(false);
        //     INDEXED.searchRows(db,mine,'address',from,ck);
        // });
    },
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
};

export default BILL;