import AdMgr from "../Mod/AdMgr"
import GameLogic from "../Crl/GameLogic"

export default class ClickBoxUI extends Laya.Scene {
    constructor() {
        super()
    }

    box: Laya.Image = this['box']
    tips: Laya.Image = this['tips']
    tick: Laya.Image = this['tick']
    sureBtn: Laya.Image = this['sureBtn']
    bar: Laya.ProgressBar = this['bar']

    curProgress: number = 0

    gotBox: boolean = false

    onOpened() {
        this.initData()
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    initData() {
        this.sureBtn.on(Laya.Event.CLICK, this, this.clickBoxBtnCB)
        this.tips.on(Laya.Event.CLICK, this, this.tickCB)
        Laya.timer.frameLoop(1, this, this.decProgress)
    }

    decProgress() {
        if (this.curProgress >= 1) {
            Laya.timer.clear(this, this.decProgress)
            this.bar.value = this.curProgress
            return
        }
        this.curProgress -= 0.005
        if (this.curProgress < 0) {
            this.curProgress = 0
        }
        this.bar.value = this.curProgress
    }

    clickBoxBtnCB() {
        if (this.gotBox) {
            let cb = () => {
                this.close()
                Laya.Scene.open('MyScenes/GameUI.scene')
                GameLogic.Share.restartGame()
            }
            if (this.tick.visible) {
                AdMgr.instance.showVideo(cb)
            } else {
                cb()
            }
        } else {
            this.curProgress += 0.1
            if (this.curProgress >= 1) {
                this.gotBox = true
                this.tips.visible = true
                this.tick.visible = true
                this.bar.visible = false
                this.box.skin = 'clickBoxUI/cj-bx2.png'
                this.sureBtn.skin = 'clickBoxUI/cj-an.png';
                (this.sureBtn.getChildAt(0) as Laya.Sprite).visible = false;
            }
        }
    }

    tickCB() {
        this.tick.visible = !this.tick.visible
    }
}