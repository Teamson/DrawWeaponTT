import Utility from "./Utility";
import WxApi from "../Libs/WxApi";
import ShareMgr from "./ShareMgr";

export default class AdMgr {
    private static _instance: AdMgr
    public static get instance(): AdMgr {
        if (!this._instance) {
            this._instance = new AdMgr()
        }
        return this._instance
    }

    private bannerUnitId: string[] = ['90mc9fdgkm7dbr7i37']
    private videoUnitId: string = '55cpk10le9d24bd43g'
    private bannerAd: any = null
    private videoAd: any = null
    public videoCallback: Function = null
    private curBannerId: number = 0
    public showBannerCount: number = 0

    public closeVCB: Function = null

    private videoIsError: boolean = false

    videoLoaded: boolean = false

    initAd() {
        if (Laya.Browser.onWeiXin) {
            this.initBanner()
            this.initVideo()
        }
    }

    //初始化banner
    initBanner() {
        //适配iphoneX
        let isIphonex = false
        if (Laya.Browser.onWeiXin) {
            Laya.Browser.window.wx.getSystemInfo({
                success: res => {
                    let modelmes = res.model
                    if (modelmes.search('iPhone X') != -1) {
                        isIphonex = true
                    }
                }
            })
        }

        let winSize = Laya.Browser.window.wx.getSystemInfoSync()
        //初始化banner
        this.bannerAd = Laya.Browser.window.wx.createBannerAd({
            adUnitId: this.bannerUnitId[0],
            style: {
                left: 0,
                top: 0,
                width: 100
            }
        })
        //监听banner尺寸修正
        this.bannerAd.onResize((size) => {
            if (isIphonex) {
                this.bannerAd.style.top = winSize.windowHeight - size.height - 10
            } else {
                this.bannerAd.style.top = winSize.windowHeight - size.height - 10
            }
            this.bannerAd.style.left = winSize.windowWidth / 2 - size.width / 2
        })

        this.bannerAd.onError(res => {
            // 错误事件
        })
    }
    //隐藏banner
    hideBanner() {
        if (Laya.Browser.onWeiXin) {
            this.bannerAd.hide()
        }
    }

    //显示banner
    showBanner() {
        if (Laya.Browser.onWeiXin) {
            this.showBannerCount++
            this.bannerAd.show()
        }
    }
    //销毁banner
    destroyBanner() {
        if (Laya.Browser.onWeiXin && this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
    }

    initVideo() {
        //初始化视频
        if (!this.videoAd) {
            this.videoAd = window['tt'].createRewardedVideoAd({
                adUnitId: this.videoUnitId
            })
        }

        this.loadVideo()
        this.videoAd.onLoad(() => {
            console.log('激励视频加载成功')
            this.videoLoaded = true
        })
        //视频加载出错
        this.videoAd.onError(res => {
            console.log('video Error:', JSON.stringify(res))
            this.videoIsError = true
        })


        //监听关闭视频
        this.videoAd.onClose(res => {
            if (res && res.isEnded || res === undefined) {
                console.log('正常播放结束，可以下发游戏奖励')
                this.videoCallback()
            }
            else {
                console.log('播放中途退出，不下发游戏奖励')
            }
            this.closeVCB && this.closeVCB()
            this.closeVCB = null
            //恢复声音
            if (WxApi.isMusic)
                Laya.SoundManager.muted = false
            this.loadVideo()
        })
    }

    loadVideo() {
        if (this.videoAd != null) {
            this.videoIsError = false
            this.videoLoaded = false
            this.videoAd.load()
        }
    }

    //初始化激励视频
    showVideo(cb: Function) {
        this.videoCallback = cb
        if (this.videoIsError) {
            this.videoCallback()
            return
        }

        // if (this.videoLoaded == false) {
        //     WxApi.OpenAlert('视频正在加载中！')
        //     return
        // }

        //关闭声音
        Laya.SoundManager.muted = true

        this.videoAd.show()
    }

}