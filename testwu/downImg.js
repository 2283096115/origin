// 引入obs库
// 使用npm安装
var ObsClient = require('esdk-obs-nodejs');
// 使用源码安装
// var ObsClient = require('./lib/obs');
var http = require('http');
var urlLib = require('url');
var crypto = require('crypto');

// 创建ObsClient实例
var obsClient = new ObsClient({
       access_key_id: 'YFCSOD9C4FLKNKOIBZBO',
       secret_access_key: 'FW7D95DMV4hmlkI2vY5EcWQ2dfA93rIg0Foo1Yea',
       server : 'https://obs.cn-east-3.myhuaweicloud.com'
});

let bucketName = 'testbucketbywuwei';
let objectKey = '111111';
let method = 'GET';
let res = obsClient.createSignedUrlSync({Method : method, Bucket : bucketName, Key: objectKey, Expires: 3600});

// 使用GET请求下载对象
// var url = urlLib.parse(res.SignedUrl);
// var req = http.request({
//        method : method,
//        host : url.hostname,
//        port : url.port,
//        path : url.path,
//        rejectUnauthorized : false,
//        headers : res.ActualSignedRequestHeaders || {}
// });


console.log('Creating object using url:' + res.SignedUrl);

// req.on('response',   (serverback) => {
//        var buffers = [];
//        serverback.on('data', (data) => {
//               buffers.push(data);
//        }).on('end', () => {
              
//               if(serverback.statusCode < 300){
//                      console.log('Getting object using temporary signature succeed.');
//               }else{
//                      console.log('Getting object using temporary signature failed!');
//                      console.log('status:' + serverback.statusCode);
//                      console.log('\n');
//               }
//               buffers = Buffer.concat(buffers);
//               if(buffers.length > 0){
//                      console.log(buffers.toString());
//               }
//               console.log('\n');
//        });
// }).on('error',(err) => {
//        console.log('Getting object using temporary signature failed!');
//        console.log(err);
//        console.log('\n');
// });

// req.end();
