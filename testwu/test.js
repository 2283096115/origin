// 引入obs库
// User Name	Access Key Id	Secret Access Key
// obsuser-dev	8WLXEQTAXMZSZ4YMPCZY	G7rW4ZOeUIsO1ynGNkCuz8pnm4JsTUXV8lyYaH8s
// obsuser-sit	EVB07RYRLY2RDYV5T6UX	JENGEw4egcRGaJI8XLlwNYWIi7JbeU2bn6vMoiEI
// obsuser-uat	XBII2GQYNEZWDI5DQ7PC	Y0SaXWrffE06vJBqvux6GgYNli0wF1G0G6ldDwjh
// ccobsuser-dev        MXLMFLLDSIWYCPHBHWZ1        SAd3qJfiwr5nOd7MOjqfbDOfboVxh69ObJm6cuGZ

// 使用npm安装
var ObsClient = require('esdk-obs-nodejs');
// 使用源码安装
// var ObsClient = require('./lib/obs');

// 创建ObsClient实例
var obsClient = new ObsClient({
    access_key_id: '*** Provide your Access Key ***',       
    secret_access_key: '*** Provide your Secret Key ***',       
    server : 'https://your-endpoint'
});

obsClient.createBucket({
	Bucket : 'test',
}, (err, result) => {
	if(err){
				 console.error('Error-->' + err);
	}else{
				 console.log('Status-->' + result.CommonMsg.Status);
	}
});

obsClient.putObject({
       Bucket : 'bucketname',
       Key : 'objectname',
       SourceFile : 'localfile'  // localfile为待上传的本地文件路径，需要指定到具体的文件名
}, (err, result) => {
       if(err){
              console.error('Error-->' + err);
       }else{
              console.log('Status-->' + result.CommonMsg.Status);
       }
});