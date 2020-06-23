import WxApi from "../Libs/WxApi";
import GameLogic from "../Crl/GameLogic";
import SoundMgr from "../Mod/SoundMgr";

export default class LoadingUI extends Laya.Scene {
    constructor() {
        super()
    }

    perNum: Laya.Label = this['perNum']
    bar: Laya.Label = this['bar']

    onOpened(param?: any) {
        WxApi.ttEvent('Event_1')
        SoundMgr.instance.initLoading(() => {
            this.loadRes()
        })
    }

    onClosed() {

    }

    loadRes() {
        //预加载3d资源
        var resUrl = [
            WxApi.UnityPath + 'line.lh',
            WxApi.UnityPath + 'Hero_1.lh',
            WxApi.UnityPath + 'Hero_Boss.lh',
            WxApi.UnityPath + 'Circle_1.lh',
            WxApi.UnityPath + 'hitFX.lh'
        ];
        for (let i = 0; i < 7; i++) {
            resUrl.push(WxApi.UnityPath + 'Arms_' + (i + 1) + '.lh')
        }
        for (let i = 0; i < 9; i++) {
            resUrl.push(WxApi.UnityPath + 'H_Arms_' + (i + 1) + '.lh')
        }
        for (let i = 0; i < 10; i++) {
            resUrl.push(WxApi.UnityPath + 'Hero' + (i + 1) + '_Emb.lh')
        }
        Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
    }

    onComplete() {
        console.log('加载完成')
        GameLogic.Share.initScene()
        Laya.timer.once(1000, this, () => {
            let cb = () => {
                WxApi.ttEvent('Event_2')
                GameLogic.Share.createPlayer()
                GameLogic.Share.createAi()
            }
            Laya.Scene.open('MyScenes/GameUI.scene', true, cb)
        })
    }

    onProgress(value) {
        this.perNum.text = Math.floor(value * 100) + '%'
        this.bar.width = 560 * value
    }
}