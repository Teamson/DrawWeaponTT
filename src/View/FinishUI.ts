import PlayerDataMgr from "../Libs/PlayerDataMgr"
import GameLogic from "../Crl/GameLogic"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import AdMgr from "../Mod/AdMgr"
import Utility from "../Mod/Utility"
import RecorderMgr from "../Mod/RecorderMgr"

export default class FinishUI extends Laya.Scene {
    constructor() {
        super()
    }

    coinPage: Laya.Sprite = this['coinPage']
    boxPage: Laya.Sprite = this['boxPage']

    videoCoinBtn: Laya.Image = this['videoCoinBtn']
    noCoinBtn: Laya.Image = this['noCoinBtn']
    tgBtn: Laya.Image = this['tgBtn']
    videoTG: Laya.CheckBox = this['videoTG']

    openBoxBtn: Laya.Image = this['openBoxBtn']
    nextBtn: Laya.Image = this['nextBtn']

    navNode: Laya.Sprite = this['navNode']

    haveBox: boolean = false
    randTGNum: number = 4
    tgCount: number = 0

    tempRandNum: number = 4

    isChick: boolean = false

    onOpened(param?: any) {
        this.getIsChick()
        WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：通关')
        this.initData()
        this.tempRandNum = Utility.GetRandom(1, 4)
        this.randTGNum = this.tempRandNum

        this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum * 5 : GameLogic.Share.getCoinNum
        AdMgr.instance.showBanner()
        this.changeCloseLabel()


        this.navNode.visible = !WxApi.getIsIos()
        this.initNavNode()

        if (localStorage.getItem('weaponGrade')) {
            localStorage.setItem('weaponGrade', (parseInt(localStorage.getItem('weaponGrade')) + 1).toString())
        }
    }

    onClosed() {
        WxApi.showFinishWudian--
        AdMgr.instance.hideBanner()
    }

    initNavNode() {
        let arr = []
        for (let i = 1; i <= 17; i++) {
            arr.push(i)
        }
        arr = Utility.shuffleArr(arr)
        for (let i = 0; i < this.navNode.numChildren; i++) {
            let item = this.navNode.getChildAt(i) as Laya.Image
            item.skin = 'res/icons/icon (' + arr[i] + ').png'
            item.on(Laya.Event.CLICK, this, () => {
                WxApi.showMoreGamesModal()
            })
        }
    }

    getIsChick() {
        if (PlayerDataMgr.getPlayerData().grade - 1 <= 2) {
            this.isChick = false
        } else if (PlayerDataMgr.getPlayerData().grade - 1 == 3 || PlayerDataMgr.getPlayerData().grade - 1 == 4) {
            this.isChick = false
        } else {
            this.isChick = Math.floor((PlayerDataMgr.getPlayerData().grade - 1) % 2) != 0
        }
    }

    initData() {
        this.videoCoinBtn.on(Laya.Event.CLICK, this, this.videoCoinBtnCB)
        this.noCoinBtn.on(Laya.Event.CLICK, this, this.noCoinBtnCB)
        this.tgBtn.on(Laya.Event.CLICK, this, this.tgBtnCB)
        this.openBoxBtn.on(Laya.Event.CLICK, this, this.openBoxBtnCB)
        this.nextBtn.on(Laya.Event.CLICK, this, this.nextBtnCB)

        let grade = PlayerDataMgr.getPlayerData().grade - 1
        let g = Math.floor(grade % 4) == 0 ? 4 : Math.floor(grade % 4)
        this.haveBox = g == 4

        GameLogic.Share.isHelpStart = false
        GameLogic.Share.gradeIndex = 0
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        PlayerDataMgr.setPlayerData()
    }

    videoCoinBtnCB(ccb?: boolean) {
        WxApi.ttEvent('Event_14')
        let cb: Function = () => {
            WxApi.ttEvent('Event_15')
            PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum * 5)
            this.closeCoinPage()
        }
        if (ccb)
            AdMgr.instance.closeVCB = cb
        AdMgr.instance.showVideo(cb)
    }
    noCoinBtnCB() {
        let isBounes: boolean = this.videoTG.selected
        isBounes = this.isChick ? !isBounes : isBounes
        if (isBounes && this.isSwitch) {
            WxApi.ttEvent('Event_14')
            let cb: Function = () => {
                WxApi.ttEvent('Event_15')
                PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum * 5)
                this.closeCoinPage()
            }
            AdMgr.instance.showVideo(cb)
        } else {
            PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum)
            this.closeCoinPage()
        }
    }
    tgBtnCB() {
        if (this.videoTG.selected) {
            this.tgCount++
            if (this.tgCount > this.randTGNum) {
                this.tgCount = 0
                this.randTGNum = this.tempRandNum
                this.videoTG.selected = false

                //后台控制
                if (WxApi.configData.give_gold_switch == true && PlayerDataMgr.getPlayerData().grade - 1 >= WxApi.configData.GXQT_kg &&
                    (this.tempRandNum == 3 || this.tempRandNum == 4)/*  && WxApi.showFinishWudian <= 0 */) {
                    this.videoCoinBtnCB(true)
                    WxApi.showFinishWudian = 2
                }
            }
        } else {
            this.videoTG.selected = true
        }
        this.changeCloseLabel()
    }
    isSwitch: boolean = true
    changeCloseLabel() {
        if (!WxApi.configData.give_gold_switch || PlayerDataMgr.getPlayerData().grade - 1 < WxApi.configData.GXQT_kg) {
            this.isSwitch = false
            this['coinNum'].value = GameLogic.Share.getCoinNum
            this.noCoinBtn.skin = 'TTRes/dy-sm3.png'
            this.tgBtn.visible = false
            return
        }

        if (this.isChick) {
            this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum : GameLogic.Share.getCoinNum * 5
            this.noCoinBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm3.png' : 'TTRes/dy-sm.png'
            this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz4.png' : 'TTRes/dy-wz2.png'
        } else {
            this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum * 5 : GameLogic.Share.getCoinNum
            this.noCoinBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm.png' : 'TTRes/dy-sm3.png'
            this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz2.png' : 'TTRes/dy-wz4.png'
        }
    }
    closeCoinPage() {
        if (this.haveBox) {
            //Laya.Scene.open('MyScenes/BoxUI.scene')
            this.coinPage.visible = false
            this.boxPage.visible = true
        } else {
            if (WxApi.configData.front_box_wudian_switch) {
                Laya.Scene.open('MyScenes/ClickBoxUI.scene')
            } else {
                Laya.Scene.open('MyScenes/GameUI.scene')
                GameLogic.Share.restartGame()
            }
        }
    }

    openBoxBtnCB() {
        WxApi.ttEvent('Event_16')
        let cb = () => {
            WxApi.ttEvent('Event_17')
            Laya.Scene.open('MyScenes/BoxUI.scene')
        }
        AdMgr.instance.showVideo(cb)
    }

    nextBtnCB() {
        Laya.Scene.open('MyScenes/GameUI.scene')
        GameLogic.Share.restartGame()
    }
}