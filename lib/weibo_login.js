// 模拟登录微博，并保存cookie备用
"use strict";
const request = require('request');
const fs = require('fs');
const querystring = require('querystring');
const encodePostData = require('./encode_post_data.js');
const readline = require('readline');
class weiboLogin {
  constructor(userName, userPwd) {
    // 初始化一些登录信息
    // 用户名
    this.userName = userName;
    // 密码
    this.userPwd = userPwd;
    // 预登陆地址，不带base64编码后的用户名,用于获取登录信息
    this.preLoginUrl = "http://login.sina.com.cn/sso/prelogin.php?entry=weibo&checkpin=1&callback=sinaSSOController.preloginCallBack&rsakt=mod&client=ssologin.js(v1.4.18)";
    // 登录的网页地址
    this.loginUrl = "http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.18)";
    // 初始化预登陆数据为空
    this.preLoginData = '';
    // 初始化验证码为空
    this.pinCode = null;
    // 登录状态
    // this.loginStatus = 0;
  };
  init() {
    // 初始化预登陆url，加上base64编码的用户名
    this.encodePreLoginUrl();
    return (async () => {
      try {
        // 获取预登陆原始数据
        let preLoginInitData = await this.getPreLoginData();
        // 解析预登陆原始数据
        this.preLoginData = await this.parsePreLoginData(preLoginInitData);
        // 是否需要验证码
        if(this.preLoginData['showpin'] == 1) {
          this.getPinImg();
          this.pinCode = await this.inputPinCode();
        }
        let responseBody = await this.postData();
        let finnalLoginUrl = await this.getFinnalLoginUrl(responseBody);
        return await this.getCookies(finnalLoginUrl);
      } catch(err) {
        console.log(err);
      }
    })()
  }
  // preLoginUrl构造，加上base64编码的用户名
  encodePreLoginUrl() {
    let encodeUserName = encodePostData.encryptUserName(this.userName);
    this.preLoginUrl = this.preLoginUrl + `&su=${encodeUserName}`;
  }

  // 获取预登录数据
  getPreLoginData() {
    return new Promise((resolve, reject) => {
      request(this.preLoginUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(response.body);
        } else {
          reject('没有获取到预登录数据');
        }
      });
    });
  }
  // 解析获取到的预登录数据
  parsePreLoginData(data) {
    return new Promise((resolve, reject) => {
      let reg = /\((.*)\)/;
      let preLoginData = JSON.parse(reg.exec(data)[1]);
      if(preLoginData) {
        resolve(preLoginData);
      } else {
        reject('没有获取到json');
      }
    })
  };
  // 如果有验证码则要输入验证码
  getPinImg() {
    // 构造验证码的url
    let pinImgUrl = `http://login.sina.com.cn/cgi/pin.php?r=${Math.floor(Math.random() * 1e8)}&s=0&p=${this.preLoginData['pcid']}`;
    request(pinImgUrl).pipe(fs.createWriteStream(__dirname + '/../pinCode.png'));
  }
  inputPinCode() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve, reject) => {
      rl.question('请输入验证码，验证码图片在根目录下\n', (pinCode) => {
        console.log(`你输入的验证码为：${pinCode}`);
        rl.close();
        resolve(pinCode);
      })
    })
  }
  // post数据到服务器
  postData(pinCode) {
    let headers = {
      "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0",
      'Accept-Language': 'zh-cn',
      'Content-Type':'application/x-www-form-urlencoded',
      'Connection': 'Keep-Alive'
    };
    let encodeBody = encodePostData.encodePostData(this.userName, this.userPwd, this.preLoginData.servertime,
    this.preLoginData.nonce, this.preLoginData.pubkey, this.preLoginData.rsakv, this.pinCode, this.preLoginData['pcid']);
    let options = {
      method: 'POST',
      url: this.loginUrl,
      headers: headers,
      body: encodeBody,
      gzip: true
    };
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          response.setEncoding('utf-8');
          resolve(response.body);
        }
      })
    })
  }
  // 获取最终重定向后的地址
  getFinnalLoginUrl(responseBody) {
    return new Promise((resolve, reject) => {
      let reg = /location\.replace\((?:"|')(.*)(?:"|')\)/;
      let loginUrl = reg.exec(responseBody)[1];
      let parseLoginUrl = querystring.parse(loginUrl);
      if(parseLoginUrl.retcode == 0) {
        resolve(loginUrl);
      } else if (parseLoginUrl.retcode == 101){
        reject("登录失败，登录名或密码错误");
      } else if (parseLoginUrl.retcode == 2070){
        reject("登录失败，验证码错误");
      } else {
        reject("未知错误");
      }
    });
  }
  // 获取cookie
  getCookies(finnalLoginUrl) {
    return new Promise((resolve, reject) => {
      let j = request.jar();
      request.get({url: finnalLoginUrl, jar: j}, function (error, reponse, body) {
        let cookies = j.getCookieString(finnalLoginUrl);
        fs.writeFile(__dirname + '/../cookies.txt', cookies, (error) => {
          if(error) {
            reject(0);
          }
          else {
            resolve(body);
          }
        });
      })
    })
  }
}
exports.weiboLogin = weiboLogin;
