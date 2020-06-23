import PlayerDataMgr from "../Libs/PlayerDataMgr"
import GameLogic from "../Crl/GameLogic"
import Utility from "../Mod/Utility"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import AdMgr from "../Mod/AdMgr"
import RecorderMgr from "../Mod/RecorderMgr"

export default class FreeSkinUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    itemNode: Laya.Sprite = this['itemNode']
    randBtn: Laya.Image = this['randBtn']
    videoTG: Laya.CheckBox = this['videoTG']
    tgBtn: Laya.CheckBox = this['tgBtn']

    skinArr: number[] = []

    randTGNum: number = 3
    tgCount: number = 0

    tempRandNum: number = 3

    isChick: boolean = false

    onOpened(param?: any) {
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
        this.randBtn.on(Laya.Event.CLICK, this, this.randBtnCB)
        this.tgBtn.on(Laya.Event.CLICK, this, this.toggleCB)
        this.skinArr = PlayerDataMgr.getFreeSkins()
        this.tempRandNum = Utility.GetRandom(1, 3)
        this.randTGNum = this.tempRandNum
        this.getIsChick()
        this.initData()
        AdMgr.instance.showBanner()
        this.changeCloseLabel()
    }

    onClosed() {
        RecorderMgr.instance.recordResume()
        AdMgr.instance.hideBanner()
    }

    getIsChick() {
        if (PlayerDataMgr.getPlayerData().grade <= 2) {
            this.isChick = false
        } else if (PlayerDataMgr.getPlayerData().grade == 3 || PlayerDataMgr.getPlayerData().grade == 4) {
            this.isChick = true
        } else {
            this.isChick = Math.floor(PlayerDataMgr.getPlayerData().grade % 2) == 0
        }
    }

    initData() {
        let icon = this['icon'] as Laya.Image
        icon.skin = 'freeSkins/HeroD_' + (this.skinArr[0] + 1) + '.png'
    }

    itemCB(id: number) {
        PlayerDataMgr.freeSkinId = id
        GameLogic.Share.changePlayerSkin(id)
    }

    randBtnCB() {
        WxApi.ttEvent('Event_10')
        let cb = () => {
            WxApi.ttEvent('Event_11')
            let id = Utility.getRandomItemInArr(this.skinArr)
            this.itemCB(id)
            this.closeCB()
        }
        AdMgr.instance.showVideo(cb)
    }

    closeBtnCB() {
        let isBounes: boolean = this.videoTG.selected
        isBounes = this.isChick ? !isBounes : isBounes
        if (isBounes && this.isSwitch) {
            this.randBtnCB()
        } else {
            this.closeCB()
        }
    }

    closeCB() {
        Laya.Scene.close('MyScenes/FreeSkinUI.scene')
        GameLogic.Share.canReady = true
        GameLogic.Share.readyGo()
    }

    toggleCB() {
        if (this.videoTG.selected) {
            this.tgCount++
            if (this.tgCount > this.randTGNum) {
                this.tgCount = 0
                this.randTGNum = this.tempRandNum
                this.videoTG.selected = false
            }
        } else {
            this.videoTG.selected = true
        }
        this.changeCloseLabel()
    }

    isSwitch: boolean = true
    changeCloseLabel() {
        if (!WxApi.configData.give_gold_switch || PlayerDataMgr.getPlayerData().grade < WxApi.configData.GXQT_kg) {
            this.closeBtn.skin = 'TTRes/dy-sm2.png'
            this.tgBtn.visible = false
            this.videoTG.visible = false
            this.isSwitch = false
            return
        }

        if (this.isChick) {
            this.closeBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm2.png' : 'TTRes/dy-sm4.png'
            this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz4.png' : 'TTRes/dy-wz.png'
        } else {
            this.closeBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm4.png' : 'TTRes/dy-sm2.png'
            this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz.png' : 'TTRes/dy-wz4.png'
        }
    }
}