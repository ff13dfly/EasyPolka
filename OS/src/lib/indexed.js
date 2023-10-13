import Encry from './encry';
import tools from './tools';

let hash = "";
const INDEXED = {
	getEncry: () => {
		return hash;
	},
	setEncry: (md5) => {
		hash = md5;
		Encry.auto(md5);
		return true;
	},
	clearEncry: () => {
		hash = "";
	},

	initDB: (name, tables, version) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const request = indexedDB.open(name, version);
			request.onsuccess = (ev) => {
				resolve(ev.target.result);
			};
			request.onerror = (ev) => {
				resolve(false);
			};
			request.onupgradeneeded = (ev) => {
				const db = ev.target.result;
				for (let i = 0; i < tables.length; i++) {
					const row = tables[i];
					const store = db.createObjectStore(row.table, { keyPath: row.keyPath, unique: true });
					for (var k in row.map) {
						store.createIndex(k, k, row.map);
					}
				}
			};
		});
	},
	checkDB: (name, ck) => {
		const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		const request = indexedDB.open(name);
		request.onsuccess = (ev) => {
			return ck && ck(ev.target.result);
		};
		request.onerror = (ev) => {
			return ck && ck(false);
		};
	},

	insertRow: (db, table, list) => {
		const request = db.transaction([table], "readwrite").objectStore(table);
		for (let i = 0; i < list.length; i++) {
			request.add(list[i]);
		}

		request.onsuccess = function (ev) {
			console.log("Insert successful");
		};

		request.onerror = function (ev) {
			console.log("Failed to insert");
		};
	},
	searchRows: (db, table, key, val, ck) => {
		let list = [];
		var store = db.transaction(table, "readwrite").objectStore(table);
		var request = store.index(key).openCursor(IDBKeyRange.only(val));

		request.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				// 必须要检查
				list.push(cursor.value);
				cursor.continue(); // 遍历了存储对象中的所有内容
			} else {
				return ck && ck(list);
			}
		};
		request.onerror = function (e) { };
	},
	countRows: (db, table, key, val, status, ck) => {
		if(db.objectStoreNames.length===0)return false;
		let count=0;
		var store = db.transaction(table, "readwrite").objectStore(table);
		var request = store.index(key).openCursor(IDBKeyRange.only(val));

		request.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				if(cursor.value.status===status) count++;
				cursor.continue(); // 遍历了存储对象中的所有内容
			} else {
				return ck && ck(count);
			}
		};
		request.onerror = function (e) { };
	},
	updateRow: (db, table, list) => {
		console.log(table);
		var store = db.transaction(table, "readwrite").objectStore(table);
		for(let i=0;i<list.length;i++){
			const data=list[i];
			console.log(data);
			const request = store.put(data);
			request.onsuccess = function () {
				console.log("数据更新成功");
			};
	
			request.onerror = function () {
				console.log("数据更新失败");
			};
		}
	},

	getDataByKey: (db, storeName, key) => {
		return new Promise((resolve, reject) => {
			var transaction = db.transaction([storeName]);
			var objectStore = transaction.objectStore(storeName);
			var request = objectStore.get(key);

			request.onerror = function (event) {
				console.log("failed");
			};

			request.onsuccess = function (event) {
				console.log("Result: ", request.result);
				resolve(request.result);
			};
		});
	},

	test: () => {
		//https://juejin.cn/post/7026900352968425486
		const name = 'w3os_chat';
		//const name =`w3os_chat_${address}`;
		INDEXED.checkDB(name, (db) => {
			INDEXED.insertRow(db, "address_a", [{ address: "acc", msg: "hello", status: 3, stamp: 0 }, { address: "acc_a", msg: "hello a", status: 3, stamp: 0 }, { address: "acc_b", msg: "hello b", status: 3, stamp: 0 }])
			INDEXED.searchRows(db, "address_a", "status", 3, (list) => {
				console.log(list);
			});
			// INDEXED.initDB(name,[
			// 	{ table: "address_"+tools.rand(1,100), keyPath: "address", map: { stamp: { unique: false },status: { unique: false } } },
			// 	{ table: "address_"+tools.rand(1,100), keyPath: "address", map: { stamp: { unique: false },status: { unique: false } } },
			// ],db.version+1)
		});
	},
}

export default INDEXED;