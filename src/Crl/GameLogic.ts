import WxApi from "../Libs/WxApi";
import Player from "./Player";
import Utility from "../Mod/Utility";
import PlayerDataMgr from "../Libs/PlayerDataMgr";
import GameUI from "../View/GameUI";
import GameTopNode from "../View/GameTopNode";
import Boss from "./Boss";
import PrefabManager from "../Libs/PrefabManager";
import TimeCountMgr from "../Libs/TimeCountMgr";
import ShareMgr from "../Mod/ShareMgr";
import AdMgr from "../Mod/AdMgr";
import RecorderMgr from "../Mod/RecorderMgr";

const LINE_GAP: number = 0.1
const PLAYER_GAP: number = 3
const GRADE_GAP: number = 30
export default class GameLogic {
    public static WEAPON_LENGTH_MAX = 100
    public static WEAPON_LENGTH_MIN = 10

    public static Share: GameLogic

    public _scene: Laya.Scene3D
    public _camera: Laya.Camera
    private _light: Laya.DirectionLight
    private _plane: Laya.Sprite3D
    public _playerNode: Laya.Sprite3D = new Laya.Sprite3D()
    public _aiNode: Laya.Sprite3D = new Laya.Sprite3D()
    public circleEffect: Laya.Sprite3D = new Laya.Sprite3D()

    private camStartPos: Laya.Vector3 = new Laya.Vector3(0, 0, 0)
    public canTouch: boolean = false
    public gameStarted: boolean = false
    public canReady: boolean = false
    public isHelpStart: boolean = false
    public pauseGame: boolean = false

    public gradeIndex: number = 0

    public tempPlayerCount: number = 0

    public getCoinNum: number = 0

    constructor() {
        //localStorage.clear()
        //初始化广告
        AdMgr.instance.initAd()
        //初始化录屏
        RecorderMgr.instance.initRecorder()
        //加载JSON
        Utility.loadJson('res/config/aiConfig.json', (data) => {
            PlayerDataMgr.aiConfig = data
        })
        Utility.loadJson('res/config/posConfig.json', (data) => {
            PlayerDataMgr.posConfig = data
        })
        //初始化用户数据
        PlayerDataMgr.getPlayerData()
        //初始化预制体单例
        PrefabManager.instance()
        //初始化体力计算类
        new TimeCountMgr()
        //初始化分享
        ShareMgr.instance.initShare()
        //初始化小关数据
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        this.gradeIndex = PlayerDataMgr.getPlayerData().gradeIndex

        GameLogic.Share = this

        WxApi.httpRequest('https://tthy.jiujiuhuyu.com/tt/weapon/config.json', 'version=' + WxApi.version, 'get', (res) => {
            res = JSON.parse(res)
            WxApi.configData = res.data.config
            if (WxApi.configData.is_allow_area == 0) {
                WxApi.configData.front_box_wudian_switch = false
                WxApi.configData.give_gold_switch = false
                WxApi.configData.GQQT_kg = false
                WxApi.configData.GQQT_GQKZ = 1
                WxApi.configData.GXQT_kg = 3
            }
            console.log('加载后台配置完成:', res)
        })
        //加载图集
        this.loadAtlas()

        WxApi.WxOnHide(() => {
            PlayerDataMgr.setExitTime()
            localStorage.setItem('lastDate', new Date().getDate().toString())
            localStorage.setItem('front_share_number', WxApi.front_share_number.toString())
        })
    }

    loadAtlas() {
        //预加载资源
        var resUrl: any[] = [
            { url: 'res/atlas/finishUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/finishUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/mainUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/mainUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/offlineUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/offlineUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/normalUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/normalUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/heroSkins.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/heroSkins.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/freeSkins.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/freeSkins.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/skinUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/skinUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/boxUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/boxUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/TTRes.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/TTRes.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/clickBoxUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/clickBoxUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/extractUI.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/extractUI.png', type: Laya.Loader.IMAGE },
            { url: 'res/atlas/weaponRes.atlas', type: Laya.Loader.ATLAS },
            { url: 'res/atlas/weaponRes.png', type: Laya.Loader.IMAGE }
        ];
        var fun = function () {
            Laya.Scene.open('MyScenes/LoadingUI.scene');
        }
        Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
    }

    initScene() {
        Laya.Scene3D.load(WxApi.UnityPath + 'MyScene.ls', Laya.Handler.create(this, this.onLoadScene));
    }
    onLoadScene(scene) {
        this._scene = Laya.stage.addChild(scene) as Laya.Scene3D
        Laya.stage.setChildIndex(this._scene, 0)
        this._scene.addChild(this._playerNode)
        this._scene.addChild(this._aiNode)

        this._camera = this._scene.getChildByName('Main Camera') as Laya.Camera
        this._light = this._scene.getChildByName('Directional Light') as Laya.DirectionLight
        this._plane = this._scene.getChildByName('Plane') as Laya.Sprite3D

        this.camStartPos = this._camera.transform.position.clone()
        this.fixCameraField()

        let circleRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Circle_1.lh') as Laya.Sprite3D
        this.circleEffect = Laya.Sprite3D.instantiate(circleRes, this._scene, true, new Laya.Vector3(0, 0.1, 0));
        this.circleEffect.active = false

        Laya.timer.frameLoop(1, this, this.updateCircle)
        //this.createPlayer()
        //this.createAi()
    }

    fixCameraField() {
        let staticDT: number = 1624 - 1334
        let curDT: number = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334
        let per = curDT / staticDT * 10
        this._camera.fieldOfView = 70 + per
    }

    moveCamera(z: number, duration: number = 2000) {
        let cam = this._camera as Laya.Sprite3D
        let camPos = cam.transform.position.clone()
        camPos.z += z
        Utility.TmoveTo(cam, duration, camPos, () => { })
    }

    createPlayer() {
        let playerRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh') as Laya.Sprite3D
        let sx: number = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * PLAYER_GAP / 2
        for (let i = 0; i < PlayerDataMgr.getPlayerCount() + this.tempPlayerCount; i++) {
            let player: Laya.Sprite3D = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
            let pCrl: Player = player.addComponent(Player)
            pCrl.initData(i, true)
            player.transform.translate(new Laya.Vector3(sx, 0, GRADE_GAP * this.gradeIndex), false)
            sx -= PLAYER_GAP

            GameUI.Share.createHpBar(player)
        }
    }
    pushPlayer() {
        let playerRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh') as Laya.Sprite3D
        let sx: number = (PlayerDataMgr.getPlayerCount() - 1) * PLAYER_GAP / 2
        for (let i = 0; i < PlayerDataMgr.getPlayerCount(); i++) {
            if (i + 1 <= this._playerNode.numChildren) {
                sx -= PLAYER_GAP
                let crl = this._playerNode.getChildAt(i).getComponent(Player) as Player
                crl.hp = crl.hpMax
                continue
            }
            let player: Laya.Sprite3D = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
            let pCrl: Player = player.addComponent(Player)
            pCrl.initData(i, true)
            player.transform.translate(new Laya.Vector3(sx, 0, GRADE_GAP * this.gradeIndex), false)
            sx -= PLAYER_GAP

            GameUI.Share.createHpBar(player)
        }
    }

    updateCircle() {
        if (!this._playerNode || this._playerNode.numChildren <= 0) {
            this.circleEffect.active = false
            return
        }
        for (let i = 0; i < this._playerNode.numChildren; i++) {
            let player = this._playerNode.getChildAt(i) as Laya.Sprite3D
            let crl = player.getComponent(Player) as Player
            if (!crl.haveWeapon) {
                let pos = player.transform.position.clone()
                let p = new Laya.Vector3(pos.x, 0.1, pos.z + 0.1)
                this.circleEffect.transform.position = p
                this.circleEffect.active = true
                return
            }
        }
        this.circleEffect.active = false
    }

    createAi() {
        if (PlayerDataMgr.getPlayerData().gradeIndex >= 3) {
            this.createBoss()
            return
        }

        let aiDataMaxGrade: number = 19
        let data: any = null
        let skinId: number = 0
        let sort: any[] = []
        let gidArr: any[] = []
        let wpId = 0
        if (PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade) {
            sort = PlayerDataMgr.posConfig.sort
            skinId = Utility.GetRandom(0, 9)
            gidArr = Utility.getRandomItemInArr(sort)
            wpId = Utility.GetRandom(1, 7)
        } else {
            data = PlayerDataMgr.aiConfig['grade' + PlayerDataMgr.getPlayerData().grade]
            skinId = data.skinId
            sort = data.sort
            gidArr = sort[PlayerDataMgr.getPlayerData().gradeIndex]
        }

        this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (GRADE_GAP * this.gradeIndex))
        let playerRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh') as Laya.Sprite3D
        let sx: number = PLAYER_GAP
        for (let i = 0; i < gidArr.length; i++) {
            let player: Laya.Sprite3D = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
            let pCrl: Player = player.addComponent(Player) as Player
            pCrl.initData(i, false)
            pCrl.changeSkin(skinId)
            player.transform.localPosition.x = gidArr[i][0] * sx
            player.transform.localPosition.y = 0
            player.transform.localPosition.z = gidArr[i][1] * sx
            player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false)
            //sx -= PLAYER_GAP

            GameUI.Share.createHpBar(player)

            let weaponId: number = PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade ? wpId : gidArr[i][2] + 1
            let weaponRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Arms_' + weaponId + '.lh') as Laya.Sprite3D
            let weapon: Laya.Sprite3D = Laya.Sprite3D.instantiate(weaponRes, null, true, new Laya.Vector3(0, 0, 0));
            pCrl.addWeapon(weapon)
        }
    }

    createBoss() {
        this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (GRADE_GAP * this.gradeIndex))
        let playerRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Hero_Boss.lh') as Laya.Sprite3D
        let ani = playerRes.getComponent(Laya.Animator) as Laya.Animator
        ani.getControllerLayer().playOnWake = false
        let player: Laya.Sprite3D = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
        let pCrl: Boss = player.addComponent(Boss) as Boss
        player.transform.localPosition.x = 0
        player.transform.localPosition.y = 0
        player.transform.localPosition.z = 0
        player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false)
    }

    createLine3D(lineArr: Laya.Vector2[]) {
        let lineNode: Laya.Sprite3D = new Laya.Sprite3D()
        let lineRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'line.lh') as Laya.Sprite3D
        let bottomPos: Laya.Vector3 = new Laya.Vector3(0, 0, 0)
        for (let i = 0; i < lineArr.length; i++) {
            if (i == 0) {
                let line: Laya.Sprite3D = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                line.transform.position = new Laya.Vector3(0, 0, 0)
                bottomPos = line.transform.position.clone()
            } else {
                let p1 = new Laya.Vector3(-lineArr[i - 1].x, 0, -lineArr[i - 1].y)
                let p2 = new Laya.Vector3(-lineArr[i].x, 0, -lineArr[i].y)
                let preL = lineNode.getChildAt(lineNode.numChildren - 1) as Laya.Sprite3D
                let prePos = preL.transform.position.clone()
                let dis = Laya.Vector3.distance(p1, p2)
                for (let j = 0; j < Math.floor(dis / 10); j++) {
                    let line: Laya.Sprite3D = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                    let dir = new Laya.Vector3(0, 0, 0)
                    Laya.Vector3.subtract(p2, p1, dir)
                    Laya.Vector3.normalize(dir, dir)
                    let d = (LINE_GAP * (j + 1))
                    dir = new Laya.Vector3(dir.x * d, dir.y * d, dir.z * d)
                    let pos = new Laya.Vector3(0, 0, 0)
                    Laya.Vector3.add(prePos, dir, pos)
                    line.transform.position = pos
                    if (line.transform.position.z < bottomPos.z) {
                        bottomPos = line.transform.position.clone()
                    }
                }
            }
        }

        //以最底下的点作为原点
        for (let i = 0; i < lineNode.numChildren; i++) {
            let node = lineNode.getChildAt(i) as Laya.Sprite3D
            let p = new Laya.Vector3(0, 0, 0)
            Laya.Vector3.subtract(node.transform.position, bottomPos, p)
            node.transform.position = p
        }

        //添加武器到人物
        for (let i = 0; i < this._playerNode.numChildren; i++) {
            let pCrl = this._playerNode.getChildAt(i).getComponent(Player) as Player
            if (!pCrl.haveWeapon) {
                pCrl.addWeapon(lineNode)
                break
            }
        }

        if (this.checkWeaponed()) {
            this.readyGo()
        }

    }

    //检测是否所有角色都有武器了
    checkWeaponed() {
        let allWeapon: boolean = true
        for (let i = 0; i < this._playerNode.numChildren; i++) {
            let pCrl = this._playerNode.getChildAt(i).getComponent(Player) as Player
            if (!pCrl.haveWeapon) {
                allWeapon = false
            }
        }
        return allWeapon
    }

    //开始移动
    readyGo() {
        if (
            PlayerDataMgr.getFreeSkins().length > 0 &&
            !this.canReady &&
            PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
            PlayerDataMgr.getPlayerData().grade > 1
        ) {
            RecorderMgr.instance.recordPause()
            Laya.Scene.open('MyScenes/FreeSkinUI.scene', false)
            return
        }

        if (!WxApi.firstStartGame) {
            WxApi.firstStartGame = true
            WxApi.aldEvent('进入游戏后首次点击开始游戏')
        }

        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !this.isHelpStart) {
            WxApi.aldEvent('开始游戏')
            WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：进入')
        }
        this.canTouch = false
        GameUI.Share.visibleBottomUI(false)

        for (let i = 0; i < this._playerNode.numChildren; i++) {
            let pCrl = this._playerNode.getChildAt(i).getComponent(Player) as Player
            pCrl.goToFight(this._aiNode)
        }

        if (PlayerDataMgr.getPlayerData().gradeIndex < 3) {
            for (let i = 0; i < this._aiNode.numChildren; i++) {
                let pCrl = this._aiNode.getChildAt(i).getComponent(Player) as Player
                pCrl.goToFight(this._playerNode)
            }
        }

        Laya.timer.clear(this, this.checkIsOver)
        Laya.timer.frameLoop(1, this, this.checkIsOver)
    }

    checkIsOver() {
        if (this._aiNode.numChildren <= 0) {
            if (this._playerNode.numChildren <= PlayerDataMgr.getPlayerCount()) {
                this.tempPlayerCount = 0
            }
            this.gradeIndex += 1
            Laya.timer.clear(this, this.checkIsOver)
            if (this.gradeIndex >= 4) {
                //关卡胜利
                RecorderMgr.instance.recordStop()
                this.tempPlayerCount = 0
                PlayerDataMgr.getPlayerData().grade += 1
                PlayerDataMgr.getPlayerData().gradeIndex = 0
                PlayerDataMgr.setPlayerData()
                Laya.Scene.close('MyScenes/GameUI.scene')

                let cb = () => {
                    if (PlayerDataMgr.getPlayerData().grade <= 2) {
                        Laya.Scene.open('MyScenes/FinishUI.scene', false)
                    } else {
                        Laya.Scene.open('MyScenes/ShareVideoUI.scene', false)
                    }
                }

                if (WxApi.configData.GQQT_kg && Math.floor((PlayerDataMgr.getPlayerData().grade - 1 - WxApi.configData.GQQT_GQKZ) % 3) == 0) {
                    AdMgr.instance.closeVCB = cb
                    AdMgr.instance.showVideo(() => { })
                } else {
                    cb()
                }

                return
            }
            PlayerDataMgr.getPlayerData().gradeIndex = this.gradeIndex
            PlayerDataMgr.setPlayerData()

            GameTopNode.Share.initData()
            Laya.timer.once(200, this, () => {
                this.moveCamera(GRADE_GAP, 1800)
            })
            let sx = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * PLAYER_GAP / 2
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let player = this._playerNode.getChildAt(i) as Laya.Sprite3D
                let pCrl = player.getComponent(Player) as Player
                pCrl.fightStarted = false
                let desPos = new Laya.Vector3(sx - i * PLAYER_GAP, 0, GRADE_GAP * this.gradeIndex)
                Utility.TmoveTo(player, 2000, desPos, () => {
                    pCrl.playIdle2()
                })
                Utility.RotateTo(player, 1000, new Laya.Vector3(0, 0, 0), () => { })
            }
            this.createAi()
            Laya.timer.once(2000, this, () => {
                this.checkIsNeedCreatePlayer()
            })
        }
        //失败
        if (this._playerNode.numChildren <= 0) {
            this.tempPlayerCount = 0
            GameUI.Share.visibleGameOverNode(true)
        }
    }

    getIsOver() {
        if (this._playerNode.numChildren <= 0) {
            return true
        } else {
            let isOver = true
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let p = this._playerNode.getChildAt(i) as Laya.Sprite3D
                let crl = p.getComponent(Player) as Player
                if (!crl.isDied) {
                    isOver = false
                    break
                }
            }
            return isOver
        }
    }

    checkIsNeedCreatePlayer() {
        if (this._playerNode.numChildren < PlayerDataMgr.getPlayerCount() && this.gradeIndex < 3) {
            //GameUI.Share.visibleOverNode(true)
            AdMgr.instance.hideBanner()
            GameUI.Share.reviveBtnCB()
        } else {
            this.readyGo()
        }
    }

    revivePlayer() {
        this.canTouch = true
        this.pushPlayer()
    }

    goAhead() {
        this.readyGo()
    }

    upgradePlayerCount() {
        this._playerNode.destroyChildren()
        this.createPlayer()
    }

    changePlayerSkin(freeId?: number) {
        for (let i = 0; i < this._playerNode.numChildren; i++) {
            let player = this._playerNode.getChildAt(i) as Laya.Sprite3D
            let crl: Player = player.getComponent(Player)
            if (freeId)
                crl.changeSkin(freeId)
            else
                crl.changeSkin(PlayerDataMgr.getPlayerData().playerId)
        }
    }

    checkCanUpgrade() {
        let c = PlayerDataMgr.getPlayerData().coin
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
            (c >= PlayerDataMgr.getUpgradePlayerCountLvCost() || c >= PlayerDataMgr.getUpgradePlayerPowerLvCost() || c >= PlayerDataMgr.getUpgradeOfflineLvCost())) {
            GameUI.Share.upgradeBtnCB()
        }
    }

    restartGame() {
        this.gameStarted = false
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0) {
            this._camera.transform.position = this.camStartPos
            if (!this.isHelpStart) {
                this.getCoinNum = 0
                this.canReady = false
                if (PlayerDataMgr.freeSkinId != -1) {
                    PlayerDataMgr.freeSkinId = -1
                }
            }
        }

        this._aiNode.destroyChildren()
        this._playerNode.destroyChildren()
        this.createAi()
        this.createPlayer()
        GameUI.Share.visibleBottomUI(true)
        this.canTouch = true
        GameTopNode.Share.initData()
        this.checkCanUpgrade()
    }

}