import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import RecorderMgr from "../Mod/RecorderMgr"
import Utility from "../Mod/Utility"
import AdMgr from "../Mod/AdMgr"

export default class ShareVideoUI extends Laya.Scene {
    constructor() {
        super()
    }

    shareBtn: Laya.Image = this['shareBtn']
    closeBtn: Laya.Image = this['closeBtn']

    onOpened(param?: any) {
        param && param()

        this.shareBtn.on(Laya.Event.CLICK, this, this.shareBtnCB)
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
        Utility.visibleDelay(this.closeBtn, 2500)
        AdMgr.instance.showBanner()
    }

    onClosed() {
        AdMgr.instance.hideBanner()
    }

    shareBtnCB() {
        WxApi.ttEvent('Event_12')
        let cb = () => {
            WxApi.ttEvent('Event_13')
            PlayerDataMgr.getPlayerData().power += 10
            PlayerDataMgr.getPlayerData().coin += 200
            PlayerDataMgr.setPlayerData()
            WxApi.OpenAlert('分享视频成功，获得奖励')
            this.closeBtnCB()
        }
        RecorderMgr.instance.shareVideo(cb)
    }

    closeBtnCB() {
        this.close()
        Laya.Scene.open('MyScenes/FinishUI.scene', false)
    }
}