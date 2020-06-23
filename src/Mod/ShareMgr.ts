import WxApi from "../Libs/WxApi"
import SoundMgr from "./SoundMgr"
import AdMgr from "./AdMgr"


export default class ShareMgr {
    private static _instance: ShareMgr
    public static get instance(): ShareMgr {
        if (!this._instance) {
            this._instance = new ShareMgr()
        }
        return this._instance
    }

    private path: string = ''
    private picCount: number = 3

    private preT: number = 0

    shareTips: string[] = [
        '请分享到活跃的群！',
        '请分享到不同群！',
        '请分享给好友！',
        '请分享给20人以上的群！']

    //初始化分享  
    initShare() {
        if (Laya.Browser.onWeiXin) {
            //开启右上角的分享
            Laya.Browser.window.wx.showShareMenu({
                withShareTicket: true,
            });

            let dir = 'res/share/share.png'//WxApi.crlConfig.front_share_config.image
            let content = '我画你杀，谁与争锋'//WxApi.crlConfig.front_share_config.title
            Laya.Browser.window.wx.onShareAppMessage(function (res) {
                return {
                    title: content,
                    imageUrl: dir,
                }
            })

            Laya.Browser.window.wx.onShow((para) => {

                SoundMgr.instance.playMusic('bgm.mp3')
                if (WxApi.shareCallback) {
                    let t = new Date().getTime()
                    let diff = t - WxApi.shareTime
                    if (diff / 1000 >= 3 && !WxApi.firstShare) {
                        WxApi.shareCallback()
                        WxApi.front_share_number--
                        Laya.Browser.window.wx.showToast({
                            title: '分享成功',
                            icon: 'none',
                            duration: 2000
                        })
                        WxApi.shareCallback = null
                    } else {
                        WxApi.firstShare = false
                        Laya.Browser.window.wx.showModal({
                            title: '提示',
                            content: this.shareTips[Math.floor(Math.random() * this.shareTips.length)],
                            confirmText: '重新分享',
                            success(res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                    ShareMgr.instance.shareGame(WxApi.shareCallback)
                                } else if (res.cancel) {
                                    console.log('用户点击取消')
                                }
                            }
                        })
                    }
                }
            })
        }
    }

    shareGame(cb: Function) {
        if (WxApi.front_share_number <= 0) {
            AdMgr.instance.showVideo(cb)
            return
        }

        WxApi.shareCallback = cb
        if (!Laya.Browser.onWeiXin) {
            cb();
            return;
        }
        WxApi.shareTime = new Date().getTime()
        let dir = 'res/share/share.png'//WxApi.crlConfig.front_share_config.image
        let content = '我画你杀，谁与争锋'//WxApi.crlConfig.front_share_config.title
        Laya.Browser.window.wx.shareAppMessage({
            title: content,
            imageUrl: dir
        })

        // //延迟3秒 判断成功失败
        // this.preT = Date.parse(new Date().toString());
        // var f: Function = () => {
        //     var t1 = Date.parse(new Date().toString());
        //     if (t1 - this.preT >= 3000) {
        //         Laya.Browser.window.wx.showToast({
        //             title: '分享成功',
        //             icon: 'none',
        //             duration: 2000
        //         })
        //         //发放奖励
        //         cb();
        //     } else {
        //         Laya.Browser.window.wx.showModal({
        //             title: '提示',
        //             content: '分享失败，无法获取奖励',
        //             confirmText: '再次分享',
        //             success(res) {
        //                 if (res.confirm) {
        //                     console.log('用户点击确定')
        //                     self.shareGame(cb)
        //                 } else if (res.cancel) {
        //                     console.log('用户点击取消')
        //                 }
        //             }
        //         })
        //     }
        // }
        // setTimeout(f.bind(this), 1000)
        //Laya.timer.once(1000, this, f);
    }

}