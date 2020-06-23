import RecorderMgr from "../Mod/RecorderMgr"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"
import GameLogic from "../Crl/GameLogic"
import WxApi from "../Libs/WxApi"

export default class ExtractUI extends Laya.Scene {
    constructor() {
        super()
    }

    heroSkin: Laya.Image = this['heroSkin']
    shareBtn: Laya.Image = this['shareBtn']
    noBtn: Laya.Image = this['noBtn']

    skinId: number = -1

    onOpened() {
        this.shareBtn.on(Laya.Event.CLICK, this, this.shareBtnCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB)
        let sArr: number[] = PlayerDataMgr.getFreeSkins()
        this.skinId = Utility.getRandomItemInArr(sArr)
        this.heroSkin.skin = 'freeSkins/HeroD_' + (this.skinId + 1) + '.png'
        Utility.visibleDelay(this.noBtn, 2000)
    }

    onClosed() {

    }

    shareBtnCB() {
        let cb = () => {
            WxApi.ExtractUIGapGrade = 3
            PlayerDataMgr.getPlayerSkin(PlayerDataMgr.getPlayerArrIndexByValue(this.skinId), this.skinId)
            GameLogic.Share.changePlayerSkin()
            this.noBtnCB()
        }
        RecorderMgr.instance.shareVideo(cb)
    }

    noBtnCB() {
        this.close()
    }
}