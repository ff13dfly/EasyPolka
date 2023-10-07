import Encry from './encry';

let hash="";

const INDEXED={
	getEncry:()=>{
		return hash;
	},
	setEncry:(md5)=>{
		hash=md5;
		Encry.auto(md5);
		return true;
	},
	clearEncry:()=>{
		hash="";
	},
}

export default INDEXED;