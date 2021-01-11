
var crypto = require('crypto');
var markDataCipherConfig = {
  key: 'wezhuiyidata.com',
  iv: 'moc.ijekiyiuhzew'
};
function encrypt(str) {
	var { key, iv } = markDataCipherConfig;
	var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	let crypted = cipher.update(str, 'utf8', 'binary');
	console.log('1:', crypted)
	crypted += cipher.final('binary');
	crypted = Buffer.from(crypted, 'binary').toString('hex');
	console.log('4:', crypted)
	return crypted;
}

encrypt('123456')
// console.log()