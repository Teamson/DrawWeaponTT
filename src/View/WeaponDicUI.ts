import PlayerDataMgr from "../Libs/PlayerDataMgr"
import AdMgr from "../Mod/AdMgr"
import GameUI from "./GameUI"

export default class WeaponDicUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    gotNum: Laya.Label = this['gotNum']
    weaponName: Laya.Label = this['weaponName']
    weaponPic: Laya.Image = this['weaponPic']
    tipsPic: Laya.Image = this['tipsPic']
    info: Laya.Label = this['info']
    leftBtn: Laya.Image = this['leftBtn']
    rightBtn: Laya.Image = this['rightBtn']
    pointNode: Laya.Sprite = this['pointNode']
    tipsBg: Laya.Image = this['tipsBg']
    findBtn: Laya.Image = this['findBtn']
    lightAni: Laya.Animation = this['lightAni']

    curPage: number = 0

    onOpened() {
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
        this.leftBtn.on(Laya.Event.CLICK, this, this.turnPageBtnCB, [true])
        this.rightBtn.on(Laya.Event.CLICK, this, this.turnPageBtnCB, [false])
        this.findBtn.on(Laya.Event.CLICK, this, this.findBtnCB)

        this.initWeaponData(this.curPage)
    }

    onClosed() {

    }

    turnPageBtnCB(isLeft: boolean) {
        if (isLeft) {
            this.curPage--
        } else {
            this.curPage++
        }
        this.initWeaponData(this.curPage)
    }

    initWeaponData(id: number) {
        this.weaponPic.skin = 'weaponRes/sq_wq' + (id + 1) + '.png'
        this.tipsPic.skin = 'weaponRes/sq_tx' + (id + 1) + '.png'
        this.weaponName.text = PlayerDataMgr.getWeaponDataById(id).name
        this.info.text = PlayerDataMgr.getWeaponDataById(id).info

        this.leftBtn.visible = this.curPage > 0
        this.rightBtn.visible = this.curPage < 8

        for (let i = 0; i < this.pointNode.numChildren; i++) {
            let p = this.pointNode.getChildAt(i) as Laya.Image
            p.skin = 'weaponRes/sq_yd' + (i == id ? '2' : '1') + '.png'
        }

        if (!localStorage.getItem('weapon' + id)) {
            this.weaponName.text = '未知神器'
            this.weaponPic.skin = 'weaponRes/sq_wh.png'
            this.tipsBg.visible = false
            this.info.visible = false
            this.findBtn.visible = true
            this.lightAni.y = 300
            this.weaponPic.y = 300
            this.weaponPic.scale(1, 1)
        } else {
            this.tipsBg.visible = true
            this.info.visible = true
            this.findBtn.visible = false
            this.lightAni.y = 342
            this.weaponPic.y = 342
            this.weaponPic.scale(0.5, 0.5)
        }

        let count: number = 0
        for (let i = 0; i < 9; i++) {
            if (localStorage.getItem('weapon' + i)) {
                count++
            }
        }
        this.gotNum.text = count.toString() + '/9'
    }

    findBtnCB() {
        let cb = () => {
            localStorage.setItem('weapon' + this.curPage, '1')
            GameUI.Share.refreshArr.push(this.curPage)
            this.initWeaponData(this.curPage)
        }
        AdMgr.instance.showVideo(cb)
    }

    closeBtnCB() {
        this.close()
    }
}