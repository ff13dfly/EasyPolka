import INDEXED from './indexed';
import tools from './tools';

const DBname = "w3os_history";
const BILL = {
    save: (mine, to, details, ck) => {
        const table=`bill_${mine}`;
        INDEXED.checkDB(DBname, (res) => {
            const tbs = res.objectStoreNames;
            const row = { 
                address:to,
                amount:details.amount,
                block:details.block?details.block:"",
                hash:details.hash?details.hash:"",
                more:null,
                stamp:tools.stamp(),
                status:details.status?details.status:"unknown",
            };
            if (!BILL.checkTable(table, tbs)) {
                INDEXED.initDB(DBname,[
                    {table: table, keyPath: "hash", map: {
                        address:{ unique: false },
                        block:{unique: false},
                        hash:{unique: false},
                        more:{ unique: false },
                        stamp: { unique: false }, 
                        status: { unique: false } } }
                ],res.version + 1).then((db) => {
                    INDEXED.insertRow(db, table, [row]);
                    return ck && ck();
                });
            }else{
                INDEXED.insertRow(res, table, [row]);
                return ck && ck();
            }
        });
    },
    update:(mine,rows,ck)=>{
        INDEXED.checkDB(DBname, (db) => {
            const table=`bill_${mine}`;
            INDEXED.updateRow(db,table,rows,ck);
        });
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