import PlayerDataMgr from "../Libs/PlayerDataMgr"

export default class FoundWeaponUI extends Laya.Scene {
    constructor() {
        super()
    }

    tipsPic: Laya.Image = this['tipsPic']
    weaponPic: Laya.Image = this['weaponPic']
    weaponName: Laya.Label = this['weaponName']
    info: Laya.Label = this['info']
    sureBtn: Laya.Image = this['sureBtn']

    onOpened(id: number) {
        this.sureBtn.on(Laya.Event.CLICK, this, this.sureBtnCB)

        this.weaponPic.skin = 'weaponRes/sq_wq' + (id + 1) + '.png'
        this.tipsPic.skin = 'weaponRes/sq_tx' + (id + 1) + '.png'
        this.weaponName.text = PlayerDataMgr.getWeaponDataById(id).name
        this.info.text = PlayerDataMgr.getWeaponDataById(id).info
    }

    onClosed() {

    }

    sureBtnCB() {
        this.close()
    }
}