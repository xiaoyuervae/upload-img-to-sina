const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')
const config = require('./config.json')
const username = config.auth.username
const password = config.auth.password
const weiboLogin = require('./lib/weibo_login.js').weiboLogin;

async function login(username, password) {
    await new weiboLogin(username, password).init();
}

async function getImgUrl(file) {
    let cookies = fs.readFileSync('./cookies.txt');
    var errTime = 0
    try {
        let bitmap = fs.readFileSync(file)
        let base64Img = new Buffer(bitmap).toString('base64')
        let imageUrl = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog'
        let upImgResp = await axios.post(imageUrl, querystring.stringify({ b64_data: base64Img }), {
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0',
                'cookie': cookies.toString()
            }
        })
        let { data } = JSON.parse(upImgResp.data.replace(/([\s\S]*)<\/script>/g, ''))
        imgUrl = data['pics']['pic_1']['pid']
        if (imgUrl) {
            return imgUrl
        } else {
            throw 'no img url '
        }
    }
    catch (e) {
        errTime += 1
        // console.log('发生错误，重新登录中。。。')
        if (errTime > 5) { //retry time when upload fail
            errTime = 0
            return false
        }
        return login(username, password).then(() => {
            return getImgUrl(file)
        })
    }
}

module.exports = getImgUrl