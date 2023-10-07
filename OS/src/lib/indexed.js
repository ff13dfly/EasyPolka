import Encry from './encry';

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

	test: () => {
		const DB = 'chat';
		const dbOpen = indexedDB.open(DB, 1);
		console.log(dbOpen);
		dbOpen.onupgradeneeded = (e) => {
			const db = dbOpen.result;
			const store = db.createObjectStore("cars", { keyPath: "id" });
			// store.createIndex("cars_colour", ["colour"], {
			// 	unique: true
			// });

			// 创建复合索引
			// store.createIndex("colour_and_make", ["colour", "make"], {
			// 	unique: false,
			// });
		}
		dbOpen.onsuccess = () => {
			const db = dbOpen.result;
			const transaction = db.transaction("cars", "readwrite");
			const store = transaction.objectStore("cars");
			store.put({ id: 1, colour: "Red", make: "Toyota" });
			store.put({ id: 2, colour: "Red", make: "Kia" });
			store.put({ id: 3, colour: "Blue", make: "Honda" });
			store.put({ id: 4, colour: "Silver", make: "Subaru" });
		}
	}
}

export default INDEXED;