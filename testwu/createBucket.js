// 创建ObsClient实例
// var ObsClient = require('esdk-obs-nodejs');
// var obsClient = new ObsClient({
// 	access_key_id: 'MXLMFLLDSIWYCPHBHWZ1',       
// 	secret_access_key: 'SAd3qJfiwr5nOd7MOjqfbDOfboVxh69ObJm6cuGZ',       
// 	server : 'https://obs.cn-east-2.myhuaweicloud.com'
// });
// var string2fileStream = require('string-to-file-stream');



// var express = require('express')
// var app = express()
// app.get('/test', function(req, res){
// 	// var data = 'hello';
// 	// app.send('err')
// 	obsClient.getObject({
// 		Bucket : 'testbucketbywuwei',
// 		Key : 'testLoadByZhuiyi',
// 		SaveAsStream : true
// 	}, (err, result) => {
// 		if(err){ 
// 			console.error('Error-->' + err); 
// 		}else{ 
// 					console.log('Status-->' + result.CommonMsg.Status); 
// 					if(result.CommonMsg.Status < 300 && result.InterfaceResult){
// 								// 读取对象内容 
// 								console.log('Object Content:\n'); 
// 								result.InterfaceResult.Content.on('data', (data) => { 
// 												console.log(data.toString()); 
// 								}); 
// 					}
// 		} 
// 	});
// })
// app.get('/download', downloadSvg)
// app.listen(8000, function(){
// 	console.log('127.0.0.1:8000')
// })

// async function downloadSvg(req, res) {
// 	// const id = req.body.id;
// 	try {
// 		// 数据库中读取图标
// 		var data = null;
// 		await obsClient.getObject({
// 			Bucket : 'testbucketbywuwei',
// 			Key : 'testLoadByZhuiyi',
// 			SaveAsStream : true
// 		}, (err, result) => {
// 			if(err){ 
// 				console.error('Error-->' + err); 
// 				// res.send(result)
// 			}else{
// 				// res.send(result)
// 							// console.log('Status-->' + result.CommonMsg.Status); 
// 							// 设置请求返回头
// 	res.set({
// 		'Content-Type': 'application/octet-stream',
// 		'Content-Disposition': 'attachment; filename=text.txt' ,
// 	})
// 	// // 返回文件流
// 	// string2fileStream(result.InterfaceResult.content).pipe(res)
// 							if(result.CommonMsg.Status < 300 && result.InterfaceResult){
// 										// 读取对象内容 
// 										console.log('Object Content:\n'); 
// 										result.InterfaceResult.Content.on('data', (data1) => { 
// 											data = data1
// 														// console.log(data1.toString());
// 														res.send(data1)
// 										}); 
// 							}
// 			} 
// 		});
		
// 		// if (data.length > 0) {
// 		// }
// 	} catch(err) {
// 		console.log('获取当前用户上传图标错误', err)
// 		res.send({
// 			code: -1,
// 			data: [],
// 			msg: '获取当前用户上传图标错误'
// 		})
// 	}
// }







var ObsClient = require('esdk-obs-nodejs');
// 使用源码安装
// var ObsClient = require('./lib/obs');
// User Name	Access Key Id	Secret Access Key
// obsuser-dev	8WLXEQTAXMZSZ4YMPCZY	G7rW4ZOeUIsO1ynGNkCuz8pnm4JsTUXV8lyYaH8s
// obsuser-sit	EVB07RYRLY2RDYV5T6UX	JENGEw4egcRGaJI8XLlwNYWIi7JbeU2bn6vMoiEI
// obsuser-uat	XBII2GQYNEZWDI5DQ7PC	Y0SaXWrffE06vJBqvux6GgYNli0wF1G0G6ldDwjh
//  YFCSOD9C4FLKNKOIBZBO      FW7D95DMV4hmlkI2vY5EcWQ2dfA93rIg0Foo1Yea
// 35e323f28ff129c75ed69bca169834158467b0fa4c16ba0760dc65b818174dde   
// b8216c4e5573e21e4ad457883a74179ffa004b5f8e49677ecb2906f458c83749ef678f93544c25bb000cec86ac14fb17

// 创建ObsClient实例
var obsClient = new ObsClient({
    access_key_id: 'MXLMFLLDSIWYCPHBHWZ1',       
    secret_access_key: 'SAd3qJfiwr5nOd7MOjqfbDOfboVxh69ObJm6cuGZ',       
    server : 'https://obs.cn-east-2.myhuaweicloud.com'
});
// 创建桶
// obsClient.createBucket({
// 	Bucket : 'testbucketbywuwei',
// }, (err, result) => {
// 	if(err){
// 				 console.error('Error-->' + err);
// 	}else{
// 		mapObject(result)
// 				//  console.log('Status-->' + mapObject(result));
// 	}
// });

function mapObject(obj, key){
	
	if (obj != null && obj.toString() === '[object Object]') {
		// console.log(key + '---------')
		var keys = Object.keys(obj)
		keys.forEach(key => {
			mapObject(obj[key], key)
		})
	} else {
		console.log(key+ ':' + obj)
	}
}
// 列举桶
// obsClient.listBuckets({
// 	QueryLocation : true
// }, (err, result) => {
// 	if(err){
// 				 console.error('Error-->' + err);
// 	}else{
// 		mapObject(result)
// 				//  console.log('Status-->' + result.CommonMsg.Status);
// 				//  if(result.CommonMsg.Status < 300 && result.InterfaceResult){
// 				// 				console.log('RequestId-->' + result.InterfaceResult.RequestId);
// 				// 				console.log('Owner:');
// 				// 				console.log('ID-->' + result.InterfaceResult.Owner.ID);
// 				// 				console.log('Name-->' + result.InterfaceResult.Owner.Name);
// 				// 				console.log('Buckets:');
// 				// 				 for(let i=0;i<result.InterfaceResult.Buckets.length;i++){
// 				// 							console.log('Bucket[' + i + ']:');
// 				// 							console.log('BucketName-->' + result.InterfaceResult.Buckets[i].BucketName);
// 				// 							console.log('CreationDate-->' + result.InterfaceResult.Buckets[i].CreationDate);
// 				// 							console.log('Location-->' + result.InterfaceResult.Buckets[i].Location);
// 				// 				 }
// 				//  }
// 	}
// });
// 列举对象
// obsClient.listObjects({
// 	Bucket : 'testbukbywuwei'
// }, (err, result) => {
// 	if(err){
// 				 console.error('Error-->' + err);
// 	}else{
// 		mapObject(result)
// 				//  console.log('Status-->' + result.CommonMsg.Status);
// 				//  if(result.CommonMsg.Status < 300 && result.InterfaceResult){
// 				// 				for(let i=0;i<result.InterfaceResult.Contents.length;i++){
// 				// 							console.log('Contents[' + j +  ']:');
// 				// 							console.log('Key-->' + result.InterfaceResult.Contents[j]['Key']);
// 				// 							console.log('LastModified-->' + result.InterfaceResult.Contents[j]['LastModified']);
// 				// 							console.log('Size-->' + result.InterfaceResult.Contents[j]['Size']);
// 				// 				}
// 				//  }
// 	}
// });

// 上传对象
obsClient.putObject({
	Bucket : 'ccbucket-dev',
	Key : 'test.png',
	SourceFile : './public/test.png'  // localfile为待上传的本地文件路径，需要指定到具体的文件名
}, (err, result) => {
	if(err){
				 console.error('Error-->' + err);
	}else{
		mapObject(result)
				//  console.log('Status-->' + result.CommonMsg.Status);
	}
});
// 下载对象
// obsClient.getObject({
// 	Bucket : 'testbucketbywuwei',
// 	Key : 'testLoadByZhuiyi'
// }, (err, result) => {
// 	if(err){
// 				 console.error('Error-->' + err);
// 	}else{
// 		mapObject(result)
// 	}
// });