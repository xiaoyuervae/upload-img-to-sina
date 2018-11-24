# upload-img-to-sina
upload img to sina

## 将图片文件上传到新浪图床

最近七牛云的域名过期了, 没有一个稳定的图床可以用了，然后上网找了发现是可以用新浪微博的API来做图床，于是找了下Git上有没有类似的代码，确实是有的，但是我clone 下来之后没办法使用: [sinaPicHostingApi](https://github.com/J3n5en/sinaPicHostingApi), 作者`J3n5en`可能是没有再去做维护了, 发现是由于微博的登录流程上有点问题，于是看了一下新浪微博的登录流程, 修复了一下`J3n5en`的登录功能, 主要用于`MWeb`写`Markdown`时用做图床.

## 新浪微博作图床的优缺点

- 优点： 
个人感觉比较稳定、而且完全是免费的, 不需要额外收费。同时可以集成到各个软件中。

- 缺点
图片暂时不支持删除、作为图床上传的文件是到了新浪的服务器、但是并不会到你个人的相册中、所以你自己也没办法去浏览。

## 使用方法

1、下载代码: 
``` bash
 git clone https://github.com/xiaoyuervae/upload-img-to-sina.git 
```
2、安装依赖: 
``` bash
npm install 
```

3、配置新浪微博账号密码:

在`config.json`文件中填入自己的账号密码:

![](https://ws1.sinaimg.cn/large/e1417e4bly1fxjk8s6o96j20k30jl0up)

3、启动服务
```bash
node index.js
```
4、MWeb配置:

![](https://ws1.sinaimg.cn/large/e1417e4bly1fxjjxv3u1vj20ez0evab9)

5、ctrl+c / ctrl + v

## 附：Chrome插件新浪图床

![](https://ws1.sinaimg.cn/large/e1417e4bly1fxjjt597gaj20m80fagmm)

插件名: 新浪微博图床

![](https://ws1.sinaimg.cn/large/e1417e4bly1fxjjub2t9yj20bl062gm5)

具体怎么使用我就不废话了。


