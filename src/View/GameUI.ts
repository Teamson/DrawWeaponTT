import Utility from "../Mod/Utility"
import GameLogic from "../Crl/GameLogic"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import GameTopNode from "./GameTopNode"
import PrefabManager, { PrefabItem } from "../Libs/PrefabManager"
import FixPlayerHpBar from "../Crl/FixPlayerHpBar"
import FixAiTips from "../Crl/FixAiTips"
import SoundMgr from "../Mod/SoundMgr"
import ShareMgr from "../Mod/ShareMgr"
import AdMgr from "../Mod/AdMgr"
import RecorderMgr from "../Mod/RecorderMgr"

export default class GameUI extends Laya.Scene {
    constructor() {
        super()
    }

    public static Share: GameUI

    touchPanel: Laya.Panel = this['touchPanel']
    touchNode: Laya.Panel = this['touchNode']
    drawSp: Laya.Sprite = this['drawSp']

    btnNode: Laya.Sprite = this['btnNode']
    noPowerNode: Laya.Sprite = this['noPowerNode']
    upgradeNode: Laya.Sprite = this['upgradeNode']
    closeUpgradePlane: Laya.Panel = this['closeUpgradePlane']
    moveNode: Laya.Sprite = this['moveNode']
    item1: Laya.Image = this['item1']
    item2: Laya.Image = this['item2']
    item3: Laya.Image = this['item3']
    getPowerBtn: Laya.Image = this['getPowerBtn']
    upgradeBtn: Laya.Image = this['upgradeBtn']
    skinBtn: Laya.Image = this['skinBtn']
    reviveBtn: Laya.Image = this['reviveBtn']
    startBtn: Laya.Image = this['startBtn']
    overNode: Laya.Sprite = this['overNode']
    bottomNode: Laya.Sprite = this['bottomNode']
    gameOverNode: Laya.Sprite = this['gameOverNode']
    helpBtn: Laya.Image = this['helpBtn']
    giveUpBtn: Laya.Image = this['giveUpBtn']
    gameOverBtnNode: Laya.Sprite = this['gameOverBtnNode']
    playerHp: Laya.Sprite = this['playerHp']
    aiHp: Laya.Sprite = this['aiHp']
    shareVideo: Laya.Image = this['shareVideo']

    touchStarted: boolean = false
    startPos: Laya.Vector2 = null
    lineArr: number[] = []
    lineArrVec2: Laya.Vector2[] = []

    onOpened(param?: any) {
        GameUI.Share = this
        this.initData()

        param && param()
        Laya.timer.frameLoop(1, this, this.checkIsNoPower)

        if (PlayerDataMgr.getPlayerData().grade >= 2 && PlayerDataMgr.getPlayerData().gradeIndex == 0) {
            if (!localStorage.getItem('weapon0')) {
                Laya.Scene.open('MyScenes/FoundWeaponUI.scene', false, 0)
                localStorage.setItem('weapon0', '1')
            }
            if (!localStorage.getItem('weaponGrade')) {
                localStorage.setItem('weaponGrade', '0')
            }
            for (let i = 1; i < 9; i++) {
                if (!localStorage.getItem('weapon' + i) && i * 2 - parseInt(localStorage.getItem('weaponGrade')) == 0) {
                    localStorage.setItem('weapon' + i, '1')
                    Laya.Scene.open('MyScenes/FoundWeaponUI.scene', false, i)
                    break
                }
            }
            Laya.timer.frameOnce(1, this, this.initWeaponData)
        }
        this.godWeaponBtn.visible = PlayerDataMgr.getPlayerData().grade >= 2

        if (!WxApi.launchGameUI) {
            WxApi.GetLaunchParam((param) => {
                let et = PlayerDataMgr.getPlayerData().exitTime
                if (et > 0) {
                    let curT = new Date().getTime()
                    let diffT = Math.floor((curT - et) / 1000 / 60)
                    if (diffT >= 1) {
                        Laya.Scene.open('MyScenes/OfflineUI.scene', false, diffT)
                    }
                }
            })
            WxApi.launchGameUI = true
            GameLogic.Share.checkCanUpgrade()
        } else {
            if (localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade > 1 && PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
                PlayerDataMgr.getFreeSkins().length > 0) {
                if (WxApi.ExtractUIGapGrade > 0) {
                    WxApi.ExtractUIGapGrade--
                } else {
                    Laya.timer.once(100, this, () => {
                        Laya.Scene.open('MyScenes/ExtractUI.scene', false)
                    })
                }
            }
        }

        this['drawTips'].visible = PlayerDataMgr.getPlayerData().grade <= 1
        this['drawTips'].skin = PlayerDataMgr.getPlayerData().grade == 1 ? 'mainUI/sy_ck2.png' : 'mainUI/sy_ck1.png'

        if (!localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade == 1) {
            this['fingerAni'].visible = true
        } else {
            this['fingerAni'].visible = false
        }

        SoundMgr.instance.playMusic('bgm.mp3')

        AdMgr.instance.hideBanner()
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    initData() {
        this.touchPanel.y = Utility.fixPosY(this.touchPanel.y)
        this.bottomNode.y = Utility.fixPosY(this.bottomNode.y)
        this.gameOverBtnNode.y = Utility.fixPosY(this.gameOverBtnNode.y)
        this.touchNode.on(Laya.Event.MOUSE_DOWN, this, this.touchStart)
        this.touchNode.on(Laya.Event.MOUSE_MOVE, this, this.touchMove)
        this.touchNode.on(Laya.Event.MOUSE_UP, this, this.touchEnd)
        this.touchNode.on(Laya.Event.MOUSE_OUT, this, this.touchOut)

        this.upgradeBtn.on(Laya.Event.CLICK, this, this.upgradeBtnCB)
        this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB)

        this.item1.on(Laya.Event.CLICK, this, this.upgradePlayerCountCB)
        this.item2.on(Laya.Event.CLICK, this, this.upgradePlayerAtkCB)
        this.item3.on(Laya.Event.CLICK, this, this.upgradeOfflineCB)

        this.reviveBtn.on(Laya.Event.CLICK, this, this.reviveBtnCB)
        this.startBtn.on(Laya.Event.CLICK, this, this.startCB)

        this.helpBtn.on(Laya.Event.CLICK, this, this.helpBtnCB)
        this.giveUpBtn.on(Laya.Event.CLICK, this, this.giveUpBtnCB)

        this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB)

        this.shareVideo.on(Laya.Event.CLICK, this, this.shareVideoCB)

        this.updatePlayerItem()
        Laya.timer.loop(1000, this, this.updatePlayerItem)

        GameLogic.Share.canTouch = true

        //Laya.Scene.open('MyScenes/BoxUI.scene')

        //WxApi.createMoreGamesButton(558, 280, 144, 180)
    }

    //更新升级面板
    updatePlayerItem() {
        let item = null
        let showTips: boolean = false
        for (let i = 1; i <= 3; i++) {
            item = this['item' + i]
            let lvNum = item.getChildByName('lvNum') as Laya.Label
            let cost = item.getChildByName('cost') as Laya.Label
            let panel = item.getChildByName('panel') as Laya.Image

            switch (i) {
                case 1:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerCountLv().toString()
                    cost.text = PlayerDataMgr.getUpgradePlayerCountLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradePlayerCountLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getCountLvMax()
                    break
                case 2:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerPowerLv().toString()
                    cost.text = PlayerDataMgr.getUpgradePlayerPowerLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradePlayerPowerLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getPowerLvMax()
                    break
                case 3:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerOfflineLv().toString()
                    cost.text = PlayerDataMgr.getUpgradeOfflineLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradeOfflineLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getOfflineLvMax()
                    break
            }
            if (!panel.visible) {
                showTips = true
            }
        }
        let tips = this.upgradeBtn.getChildAt(0) as Laya.Image
        tips.visible = showTips
    }

    touchStart(event: Laya.Event) {
        if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !GameLogic.Share.canTouch) {
            return
        }
        //关闭引导
        this['fingerAni'].visible = false
        if (!localStorage.getItem('guide')) {
            localStorage.setItem('guide', '1')
        }
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted) {
            PlayerDataMgr.getPlayerData().power--
            PlayerDataMgr.setPlayerData()
            GameLogic.Share.gameStarted = true
            RecorderMgr.instance.recordStart()
            switch (PlayerDataMgr.getPlayerData().grade) {
                case 1:
                    WxApi.ttEvent('Event_4')
                    break
                case 2:
                    WxApi.ttEvent('Event_5')
                    break
                case 3:
                    WxApi.ttEvent('Event_6')
                    break
                case 4:
                    WxApi.ttEvent('Event_7')
                    break
                case 5:
                    WxApi.ttEvent('Event_8')
                    break
                case 6:
                    WxApi.ttEvent('Event_9')
                    break
            }
        }
        this.touchStarted = true
        this.startPos = new Laya.Vector2(event.stageX, event.stageY)
        this.lineArr = []
        this.lineArr.push(this.startPos.x)
        this.lineArr.push(this.startPos.y)
        this.lineArrVec2 = []
        this.lineArrVec2.push(this.startPos)


    }
    touchMove(event: Laya.Event) {
        if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !this.touchStarted) {
            return
        }
        let p = new Laya.Vector2(event.stageX, event.stageY)
        let dis = Utility.calcDistance(this.startPos, p)
        if (dis >= 10 && this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MAX) {
            this.lineArr.push(p.x)
            this.lineArr.push(p.y)
            this.lineArrVec2.push(p)
            this.startPos = p
            this.drawLine()
        }
    }
    touchEnd(event: Laya.Event) {
        if (!this.touchStarted) {
            return
        }
        this.touchStarted = false
        this.drawSp.graphics.clear()
        if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
            WxApi.OpenAlert('武器太短啦，请重画！')
            return
        }

        let polyId = this.checkLineInPoly(this.lineArrVec2)
        console.log('polyId:', polyId)

        if (polyId != -1) {
            GameLogic.Share.createGodWeapon(polyId)
            this.dealWithAddWeapon(polyId)
        } else {
            GameLogic.Share.createLine3D(this.lineArrVec2)
        }
    }
    touchOut(event: Laya.Event) {
        if (!this.touchStarted) {
            return
        }
        this.touchStarted = false
        this.drawSp.graphics.clear()
        if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
            WxApi.OpenAlert('武器太短啦，请重画！')
            return
        }

        let polyId = this.checkLineInPoly(this.lineArrVec2)
        console.log('polyId:', polyId)

        if (polyId != -1) {
            GameLogic.Share.createGodWeapon(polyId)
            this.dealWithAddWeapon(polyId)
        } else {
            GameLogic.Share.createLine3D(this.lineArrVec2)
        }
    }

    drawLine() {
        this.drawSp.graphics.clear()
        this.drawSp.graphics.drawLines(0, 0, this.lineArr, "#000000", 8)
    }

    //是否点击在绘画区域
    safeArea(pos: Laya.Vector2) {
        let x1 = this.touchPanel.x - this.touchPanel.width / 2
        let x2 = this.touchPanel.x + this.touchPanel.width / 2
        let y1 = this.touchPanel.y - this.touchPanel.height / 2
        let y2 = this.touchPanel.y + this.touchPanel.height / 2
        if (pos.x < x1 || pos.x > x2 || pos.y < y1 || pos.y > y2) {
            return false
        } else {
            return true
        }
    }

    //升级按钮回调
    upgradeBtnCB() {
        if (this.upgradeNode.visible) {
            return
        } else {
            WxApi.aldEvent('首页升级按钮：点击')
            this.upgradeNode.visible = true
            Utility.tMove2D(this.moveNode, -606, this.moveNode.y, 200, () => {
                this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode)
                this.closeUpgradePlane.on(Laya.Event.CLICK, this, this.closeUpgradeNode)
            })
        }
    }
    //关闭升级面板
    closeUpgradeNode() {
        this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode)
        Utility.tMove2D(this.moveNode, 0, this.moveNode.y, 200, () => {
            this.upgradeNode.visible = false
        })
    }

    //皮肤按钮回调
    skinBtnCB() {
        WxApi.aldEvent('皮肤界面：点击')
        Laya.Scene.open('MyScenes/SkinUI.scene', false, () => { })
    }

    //升级人数
    upgradePlayerCountCB() {
        if (PlayerDataMgr.getPlayerCountLv() >= 5) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerCountLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }
        WxApi.aldEvent('升级界面：人数')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerCountLvCost())
        PlayerDataMgr.upgradePlayerCountLv()
        this.updatePlayerItem()
        GameLogic.Share.upgradePlayerCount()
        GameTopNode.Share.initData()
    }
    //升级攻击力
    upgradePlayerAtkCB() {
        if (PlayerDataMgr.getPlayerPowerLv() >= 35) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerPowerLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }

        WxApi.aldEvent('升级界面：攻击力')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerPowerLvCost())
        PlayerDataMgr.upgradePlayerPowerLv()
        this.updatePlayerItem()
        GameTopNode.Share.initData()
    }
    //升级离线收益
    upgradeOfflineCB() {
        if (PlayerDataMgr.getPlayerOfflineLv() >= 56) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradeOfflineLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }

        WxApi.aldEvent('升级界面：离线收益')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradeOfflineLvCost())
        PlayerDataMgr.upgradePlayerOfflineLv()
        this.updatePlayerItem()
        GameTopNode.Share.initData()
    }

    //复活按钮
    visibleOverNode(visible: boolean) {
        if (visible)
            WxApi.aldEvent('复活战士按钮弹出展示')
        this.touchPanel.visible = !visible
        this.overNode.visible = visible
        this.upgradeBtn.visible = !visible
        this.skinBtn.visible = !visible
        this.shareVideo.visible = !visible
        this.refreshBtn.visible = !visible && PlayerDataMgr.getPlayerData().grade >= 2
    }
    reviveBtnCB() {
        GameLogic.Share.revivePlayer()
        this.visibleOverNode(false)
        // WxApi.aldEvent('复活战士：点击')
        // let cb: Function = () => {
        //     WxApi.aldEvent('复活战士：成功')
        //     this.visibleOverNode(false)
        //     GameLogic.Share.revivePlayer()
        // }
        // ShareMgr.instance.shareGame(cb)
    }
    startCB() {
        this.visibleOverNode(false)
        GameLogic.Share.goAhead()
    }

    visibleBottomUI(visible: boolean) {
        this.touchPanel.visible = visible
        this.upgradeBtn.visible = visible
        this.skinBtn.visible = visible
        this.shareVideo.visible = visible
        this.godWeaponBtn.visible = visible && PlayerDataMgr.getPlayerData().grade >= 2
        this.refreshBtn.visible = visible && PlayerDataMgr.getPlayerData().grade >= 2
        // this.moreGameBtn.visible = visible
        // this.drawGameBtn.visible = visible

        // if (visible)
        //     AdMgr.instance.hideBanner()
        // else
        //     AdMgr.instance.showBanner()
    }

    visibleGameOverNode(visible: boolean) {
        // if (visible && !this.gameOverNode.visible) {
        //     AdMgr.instance.showBanner()
        // } else if (!visible) {
        //     AdMgr.instance.hideBanner()
        // }
        this.gameOverNode.visible = visible
    }

    helpBtnCB() {
        WxApi.aldEvent('请求帮助：点击')
        let cb: Function = () => {
            WxApi.aldEvent('请求帮助：成功')
            this.visibleGameOverNode(false)
            GameLogic.Share.isHelpStart = true
            GameLogic.Share.tempPlayerCount = 1
            GameLogic.Share.restartGame()
        }
        AdMgr.instance.showVideo(cb)
    }
    giveUpBtnCB() {
        RecorderMgr.instance.recordStop()
        WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：失败')
        GameLogic.Share.isHelpStart = false
        GameLogic.Share.gradeIndex = 0
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        PlayerDataMgr.setPlayerData()
        //this.visibleGameOverNode(false)
        Laya.Scene.open('MyScenes/GameUI.scene')
        GameLogic.Share.restartGame()
    }

    createHpBar(node: Laya.Sprite3D) {
        let bar = PrefabManager.instance().getItem(PrefabItem.HpBar) as Laya.ProgressBar
        this.playerHp.addChild(bar)
        let crl = bar.addComponent(FixPlayerHpBar) as FixPlayerHpBar
        crl.initData(node)
    }

    createSmile(node: Laya.Sprite3D) {
        let smlie = PrefabManager.instance().getItem(PrefabItem.Smile) as Laya.Image
        this.addChild(smlie)
        let crl = smlie.getComponent(FixAiTips) as FixAiTips
        crl.initData(node)
    }
    createCry(node: Laya.Sprite3D) {
        let cry = PrefabManager.instance().getItem(PrefabItem.Cry) as Laya.Image
        this.addChild(cry)
        let crl = cry.getComponent(FixAiTips) as FixAiTips
        crl.initData(node)
    }

    getPowerBtnCB() {
        WxApi.aldEvent('获得体力：点击')
        let cb: Function = () => {
            WxApi.aldEvent('获得体力：成功')
            PlayerDataMgr.getPlayerData().power += 5
            PlayerDataMgr.setPlayerData()
            this.refreshBtn.visible = true
        }
        AdMgr.instance.showVideo(cb)
    }
    checkIsNoPower() {
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted && !GameLogic.Share.isHelpStart) {
            let p = PlayerDataMgr.getPlayerData().power
            this.touchPanel.visible = p > 0
            this.touchNode.visible = p > 0
            this.noPowerNode.visible = p <= 0
        }
    }

    createCoinBoom(node: Laya.Sprite3D) {
        let op: Laya.Vector4 = new Laya.Vector4(0, 0, 0)
        let hPos = node.transform.position.clone()
        hPos.y += 1.75
        GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op)
        let pos = new Laya.Vector2(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY)
        let desPos = new Laya.Vector2(75, 100)

        Utility.coinCollectAnim(pos, desPos, this)
        GameTopNode.Share.initData()
    }

    shareVideoCB() {
        WxApi.ttEvent('Event_20')
        RecorderMgr.instance.shareVideo()
    }

    //*********神器系统**********/
    weaponNode: Laya.Sprite = this['weaponNode']
    polyNode: Laya.Sprite = this['polyNode']
    weaponPicNode: Laya.Sprite = this['weaponPicNode']
    weaponTips: Laya.Sprite = this['weaponTips']
    godWeaponBtn: Laya.Image = this['godWeaponBtn']
    refreshBtn: Laya.Image = this['refreshBtn']
    cmds: Laya.DrawPolyCmd[] = []
    pointsArr: any[] = []
    refreshArr: number[] = []
    curWeaponId: number = -1
    //初始化神器数据
    initWeaponData() {
        this.godWeaponBtn.on(Laya.Event.CLICK, this, this.clickGodWeapon)
        this.refreshBtn.on(Laya.Event.CLICK, this, this.refreshBtnCB)

        for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
            // let pic = this.weaponPicNode.getChildAt(i) as Laya.Image
            // pic.visible = i == 0
            if (localStorage.getItem('weapon' + i)) this.refreshArr.push(i)
        }
        this.refreshWeaponTips()
        this.cmds = this.polyNode.graphics.cmds
        let gPoint = this.polyNode.localToGlobal(new Laya.Point(0, 0))
        for (let i = 0; i < this.cmds.length; i++) {
            let points = this.cmds[i].points
            let arr = []
            for (let j = 0; j < points.length; j++) {
                if (j > 0 && j % 2 != 0) {
                    let pos: Laya.Vector2 = new Laya.Vector2(points[j - 1], points[j])
                    pos.x += gPoint.x + 22
                    pos.y += gPoint.y + 23
                    arr.push(pos)
                }
            }
            this.pointsArr.push(arr)
        }
    }
    //线段是否在多边形内
    checkLineInPoly(lineArr: Laya.Vector2[]) {
        let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        for (let i = 0; i < this.pointsArr.length; i++) {
            let posArr: Laya.Vector2[] = this.pointsArr[i]
            for (let j = 0; j < lineArr.length; j++) {
                if (!Utility.pointInPolygon(lineArr[j], posArr)) {
                    arr.splice(arr.indexOf(i), 1)
                    break
                }
            }
        }

        if (arr.length <= 0) return -1
        //检测是否契合
        for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
            if (arr.indexOf(i) == -1) continue
            let polyPointNode = this.weaponPicNode.getChildAt(i).getChildByName('pointNode') as Laya.Sprite
            let posArr: Laya.Vector2[] = []
            for (let j = 0; j < polyPointNode.numChildren; j++) {
                let p = polyPointNode.getChildAt(j) as Laya.Sprite
                let gp = polyPointNode.localToGlobal(new Laya.Point(p.x, p.y))
                posArr.push(new Laya.Vector2(gp.x, gp.y))
            }

            if (!this.checkPointDistancePoint(posArr, lineArr)) {
                arr.splice(arr.indexOf(i), 1)
            }
        }

        if (arr.length <= 0) return -1
        if (arr.indexOf(this.curWeaponId) != -1 && localStorage.getItem('weapon' + this.curWeaponId)) {
            return this.curWeaponId
        } else {
            return -1
        }

    }
    checkPointDistancePoint(polyArr: Laya.Vector2[], lineArr: Laya.Vector2[]) {
        for (let i = 0; i < polyArr.length; i++) {
            let pp: Laya.Vector2 = polyArr[i]
            let isDis: boolean = false
            for (let j = 0; j < lineArr.length; j++) {
                let lp = lineArr[j]
                let dis = Utility.calcDistance(pp, lp)
                if (dis < 50) {
                    isDis = true
                    break
                }
            }
            if (!isDis) {
                return false
            }
        }
        return true
    }

    clickGodWeapon() {
        Laya.Scene.open('MyScenes/WeaponDicUI.scene', false)
    }

    hideAllWeaponPics() {
        for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
            let pic = this.weaponPicNode.getChildAt(i) as Laya.Image
            pic.visible = false
        }
    }

    refreshWeaponTips() {
        this.weaponTips.visible = false
        if (this.refreshArr.length <= 0) return
        let id = Utility.getRandomItemInArr(this.refreshArr)
        this.curWeaponId = id
        this.hideAllWeaponPics()
        let pic = this.weaponPicNode.getChildAt(id) as Laya.Image
        pic.visible = true
        this.weaponTips.visible = true
        this.refreshBtn.visible = this.weaponTips.visible && this.refreshArr.length > 1 && this.touchPanel.visible
    }
    refreshBtnCB() {
        let arr = [].concat(this.refreshArr)
        if (arr.length <= 0) {
            this.refreshBtn.visible = false
            return
        }
        arr.splice(arr.indexOf(this.curWeaponId), 1)
        if (arr.length <= 0) {
            this.refreshBtn.visible = false
            return
        }
        let id = Utility.getRandomItemInArr(arr)
        this.curWeaponId = id
        this.hideAllWeaponPics()
        let pic = this.weaponPicNode.getChildAt(id) as Laya.Image
        pic.visible = true
        this.refreshBtn.visible = this.weaponTips.visible
    }

    dealWithAddWeapon(id: number) {
        this.refreshArr.splice(this.refreshArr.indexOf(id), 1)
        let pic = this.weaponPicNode.getChildAt(this.curWeaponId) as Laya.Image
        pic.visible = false
        this.curWeaponId = -1
        this.refreshWeaponTips()
    }

    //*********神器系统**********/
}