import INDEXED from './indexed';
import tools from './tools';

const DBname='w3os_history';
const status = {
    UNREAD: 3,
    NORMAL: 1,
    REMOVE: 0
}

const map={};
const stranger={};

const CHAT = {
    friends:(list)=>{       //set friend list

    },
    save: (mine, from, ctx,way, ck) => {
        INDEXED.checkDB(DBname, (res) => {
            const row = { address:from,msg: ctx,status: status.UNREAD,way:way,stamp: tools.stamp()};
            //console.log(row);
            const tbs = res.objectStoreNames;
            if (!CHAT.checkTable(mine, tbs)) {
                INDEXED.initDB(DBname,[
                    {table: mine, keyPath: "stamp", map: {address:{ unique: false },way:{ unique: false },stamp: { unique: false }, status: { unique: false } } }
                ], res.version + 1).then((db) => {
                    INDEXED.insertRow(db, mine, [row]);

                    //check wether from address is friend;
                    return ck && ck(map[from]?true:from);
                });
            }else{
                INDEXED.insertRow(res, mine, [row]);
                //check wether from address is friend;
                return ck && ck(map[from]?true:from);
            }
        });
    },
    page:(mine,from,step,page,ck)=>{
        INDEXED.checkDB(DBname, (db) => {
            const tbs = db.objectStoreNames;
            if (!CHAT.checkTable(mine, tbs)) return ck && ck(false);
            INDEXED.searchRows(db,mine,'address',from,ck);
        });
    },

    unread: (mine,from,ck) => {
        const status=3;
        INDEXED.checkDB(DBname, (db) => {
            INDEXED.countRows(db,mine,"address",from,status,ck);
        });
    },

    toread:(mine,rows,ck)=>{
        INDEXED.checkDB(DBname, (db) => {
            INDEXED.updateRow(db,mine,rows,ck);
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