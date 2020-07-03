(function () {
    'use strict';

    class WxApi {
        static LoginWx(cb) {
            if (!Laya.Browser.onWeiXin)
                return;
            let launchData = Laya.Browser.window.wx.getLaunchOptionsSync();
            Laya.Browser.window.wx.login({
                success(res) {
                    if (res.code) {
                        console.log('res.code:', res.code);
                        if (cb) {
                            cb(res.code, launchData.query);
                        }
                    }
                }
            });
        }
        static checkScope(btnNode) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.getSetting({
                    success: (response) => {
                        if (!response.authSetting['scope.userInfo']) {
                            console.log('没有授权');
                            this.createScope(btnNode);
                        }
                        else {
                            console.log('已经授权');
                        }
                    }
                });
            }
        }
        static createScope(btnNode) {
            this.scopeBtn = Laya.Browser.window.wx.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    left: btnNode.x,
                    top: btnNode.y,
                    width: btnNode.width,
                    height: btnNode.height,
                    lineHeight: 40,
                    backgroundColor: '#ffffff',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 0
                }
            });
            this.scopeBtn.onTap((res) => {
                if (res.errMsg == "getUserInfo:ok") {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
                else if (res.errMsg == 'getUserInfo:fail auth deny') {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
            });
        }
        static GetLaunchParam(fun) {
            if (Laya.Browser.onWeiXin) {
                this.OnShowFun = fun;
                fun(this.GetLaunchPassVar());
                Laya.Browser.window.wx.onShow((para) => {
                    if (this.OnShowFun != null) {
                        this.OnShowFun(para);
                    }
                    console.log("wx on show");
                });
            }
        }
        static GetLaunchPassVar() {
            if (Laya.Browser.onWeiXin) {
                return Laya.Browser.window.wx.getLaunchOptionsSync();
            }
            else {
                return null;
            }
        }
        static WxOnHide(fun) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onHide(fun);
            }
        }
        static httpRequest(url, params, type = 'get', completeHandler) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 5000;
            xhr.once(Laya.Event.COMPLETE, this, completeHandler);
            xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
            if (type == "get") {
                xhr.send(url + '?' + params, "", type, "text");
            }
            else if (type == "post") {
                xhr.send(url, JSON.stringify(params), type, "text");
            }
        }
        static DoVibrate(isShort = true) {
            if (Laya.Browser.onWeiXin && this.isVibrate) {
                if (isShort) {
                    Laya.Browser.window.wx.vibrateShort();
                }
                else {
                    Laya.Browser.window.wx.vibrateLong();
                }
            }
        }
        static OpenAlert(msg, dur = 2000, icon = false) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showToast({
                    title: msg,
                    duration: dur,
                    mask: false,
                    icon: icon ? 'success' : 'none',
                });
            }
        }
        static NavigateApp(appid, path, title, cancelCB, successCB) {
            if (Laya.Browser.onWeiXin) {
                let self = this;
                Laya.Browser.window.wx.navigateToMiniProgram({
                    appId: appid,
                    path: path,
                    success(res) {
                        console.log('打开成功');
                        successCB();
                    },
                    fail(res) {
                        console.log('打开失败');
                        cancelCB();
                    }
                });
            }
        }
        static preViewImage(url) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.previewImage({
                    current: url,
                    urls: [url]
                });
            }
        }
        static aldEvent(str) {
            return;
            if (Laya.Browser.onWeiXin)
                Laya.Browser.window.wx.aldSendEvent(str);
        }
        static ttEvent(key) {
            if (Laya.Browser.onWeiXin)
                Laya.Browser.window.tt.reportAnalytics(key, {});
        }
        static createMoreGamesButton(px, py, width, height) {
            let pixelW = Laya.Browser.clientWidth / Laya.stage.displayWidth;
            let pixelH = Laya.Browser.clientHeight / Laya.stage.displayHeight;
            px *= pixelW;
            py *= pixelH;
            width *= pixelW;
            height *= pixelH;
            const btn = Laya.Browser.window.tt.createMoreGamesButton({
                type: "text",
                image: "",
                style: {
                    left: px,
                    top: py,
                    width: width,
                    height: height,
                    lineHeight: 0,
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                    textAlign: "center",
                    fontSize: 16,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: "#000000"
                },
                appLaunchOptions: [
                    { appId: "tt49703fcdd64ab8f4" },
                    { appId: "ttcbf5bd4854cff760" },
                    { appId: "tt2def5b52b2c5a4ee" },
                    { appId: "tt3eb2480fa19877fb" },
                    { appId: "tt3fc3497ea0e924bc" },
                    { appId: "ttccd7ba6a53fd8cfe" }
                ],
                onNavigateToMiniGameBox(res) {
                    console.log("跳转到小游戏盒子", res);
                }
            });
            btn.onTap(() => {
                console.log("点击更多游戏");
            });
        }
        static showMoreGamesModal() {
            if (Laya.Browser.onWeiXin) {
                const systemInfo = Laya.Browser.window.tt.getSystemInfoSync();
                if (systemInfo.platform !== "ios") {
                    Laya.Browser.window.tt.showMoreGamesModal({
                        appLaunchOptions: [
                            { appId: "tt49703fcdd64ab8f4" },
                            { appId: "ttcbf5bd4854cff760" },
                            { appId: "tt2def5b52b2c5a4ee" },
                            { appId: "tt3eb2480fa19877fb" },
                            { appId: "tt3fc3497ea0e924bc" },
                            { appId: "ttccd7ba6a53fd8cfe" }
                        ],
                        success(res) {
                            console.log("success", res.errMsg);
                        },
                        fail(res) {
                            console.log("fail", res.errMsg);
                        }
                    });
                }
            }
        }
        static getIsIos() {
            if (!Laya.Browser.onWeiXin) {
                return false;
            }
            const systemInfo = Laya.Browser.window.tt.getSystemInfoSync();
            return systemInfo.platform === "ios";
        }
    }
    WxApi.UnityPath = 'LayaScene_MyScene/Conventional/';
    WxApi.version = '1.0.8';
    WxApi.isVibrate = true;
    WxApi.isMusic = true;
    WxApi.OnShowFun = null;
    WxApi.scopeBtn = null;
    WxApi.shareCallback = null;
    WxApi.front_share_number = 0;
    WxApi.gotOfflineBounes = false;
    WxApi.configData = null;
    WxApi.shareTime = 0;
    WxApi.firstShare = true;
    WxApi.launchGameUI = false;
    WxApi.firstStartGame = false;
    WxApi.showFinishWudian = 0;
    WxApi.ExtractUIGapGrade = 0;

    class Utility {
        static calcDistance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        static getDirectionAToB(A, B, normalize = true) {
            let pA = A.transform.position.clone();
            let pB = B.transform.position.clone();
            let dir = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(pB, pA, dir);
            if (normalize)
                Laya.Vector3.normalize(dir, dir);
            return dir;
        }
        static fixPosY(y, designHeight = 1334) {
            return y * Laya.stage.displayHeight / designHeight;
        }
        static findNodeByName(rootNode, name) {
            let targetNode = null;
            let funC = (node) => {
                for (let i = 0; i < node.numChildren; i++) {
                    if (node.getChildAt(i).name == name) {
                        targetNode = node.getChildAt(i);
                        return;
                    }
                    else {
                        funC(node.getChildAt(i));
                    }
                }
            };
            funC(rootNode);
            return targetNode;
        }
        static TmoveTo(node, duration, des, cb, ease) {
            let t = new Laya.Tween();
            var posOld = node.transform.position;
            t.to(node.transform.position, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, () => {
                    node.transform.position = posOld;
                })
            }, duration, ease ? ease : Laya.Ease.cubicOut, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static RotateTo(node, duration, des, cb) {
            var rotationOld = node.transform.localRotationEuler;
            Laya.Tween.to(node.transform.localRotationEuler, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, function () {
                    if (node)
                        node.transform.localRotationEuler = rotationOld;
                })
            }, duration, Laya.Ease.cubicOut, Laya.Handler.create(this, function () {
                cb && cb();
            }));
        }
        static tMove2D(node, x, y, t, cb) {
            Laya.Tween.to(node, { x: x, y: y }, t, null, new Laya.Handler(this, () => {
                if (cb)
                    cb();
            }));
        }
        static updateNumber(baseNum, times, label, labelOrFont = true, inclease, cb) {
            let timesNum = baseNum * times;
            let dt = Math.floor((timesNum - baseNum) / 60);
            dt = dt <= 0 ? 1 : dt;
            let func = () => {
                if (inclease) {
                    baseNum += dt;
                    if (baseNum >= timesNum) {
                        baseNum = timesNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = baseNum.toString();
                    else
                        label.value = baseNum.toString();
                }
                else {
                    timesNum -= dt;
                    if (timesNum <= baseNum) {
                        timesNum = baseNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = timesNum.toString();
                    else
                        label.value = timesNum.toString();
                }
            };
            Laya.timer.frameLoop(1, this, func);
        }
        static loadJson(str, complete) {
            Laya.loader.load(str, Laya.Handler.create(this, complete), null, Laya.Loader.JSON);
        }
        static objectShake(target, shakeTime = 1, shakeAmount = 0.7) {
            var shake = shakeTime;
            var decreaseFactor = 1;
            var originalPos = target.transform.localPosition.clone();
            Laya.timer.frameLoop(1, this, updateShake);
            function randomPos() {
                var x = Math.random() > 0.5 ? Math.random() : -(Math.random());
                var y = Math.random() > 0.5 ? Math.random() : -(Math.random());
                return new Laya.Vector3(x, y, 0);
            }
            function updateShake() {
                if (shake > 0) {
                    var pos = new Laya.Vector3();
                    Laya.Vector3.scale(randomPos(), shakeAmount, pos);
                    Laya.Vector3.add(originalPos, pos, pos);
                    target.transform.localPosition = pos;
                    shake -= 0.02 * decreaseFactor;
                }
                else {
                    shake = 0;
                    target.transform.localPosition = originalPos;
                    Laya.timer.clear(this, updateShake);
                }
            }
        }
        static getRandomItemInArr(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        static shuffleArr(arr) {
            let i = arr.length;
            while (i) {
                let j = Math.floor(Math.random() * i--);
                [arr[j], arr[i]] = [arr[i], arr[j]];
            }
            return arr;
        }
        static GetRandom(mix, max, isInt = true) {
            let w = max - mix + 1;
            let r1 = Math.random() * w;
            r1 += mix;
            return isInt ? Math.floor(r1) : r1;
        }
        static coinCollectAnim(startPos, endPos, parent, amount = 10, callBack) {
            let am = amount;
            for (var i = 0; i < amount; i++) {
                let coin = Laya.Pool.getItemByClass("coin", Laya.Image);
                coin.skin = "mainUI/sy-jb.png";
                coin.x = startPos.x;
                coin.y = startPos.y;
                parent.addChild(coin);
                let time = 300 + Math.random() * 100 - 50;
                Laya.Tween.to(coin, { x: coin.x + Math.random() * 250 - 125, y: coin.y + Math.random() * 250 - 125 }, time);
                Laya.timer.once(time + 50, this, function () {
                    Laya.Tween.to(coin, { x: endPos.x, y: endPos.y }, 400, null, new Laya.Handler(this, function () {
                        parent.removeChild(coin);
                        Laya.Pool.recover("coin", coin);
                        am--;
                        if (am == 0 && callBack)
                            callBack();
                    }));
                });
            }
        }
        static scaleLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { scaleX: rate, scaleY: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { scaleX: 1, scaleY: 1 }, t, null, new Laya.Handler(this, () => {
                    this.scaleLoop(node, rate, t);
                }));
            }));
        }
        static rotateLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { rotation: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { rotation: -rate }, 2 * t, null, new Laya.Handler(this, () => {
                    Laya.Tween.to(node, { rotation: 0 }, t, null, new Laya.Handler(this, () => {
                        this.rotateLoop(node, rate, t);
                    }));
                }));
            }));
        }
        static visibleDelay(node, duration) {
            node.visible = false;
            Laya.timer.once(duration, this, () => { node.visible = true; });
        }
        static pointInPolygon(point, vs) {
            var x = point.x, y = point.y;
            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i].x, yi = vs[i].y;
                var xj = vs[j].x, yj = vs[j].y;
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
    }

    class PlayerData {
        constructor() {
            this.grade = 1;
            this.gradeIndex = 0;
            this.power = 10;
            this.playerCountLv = 1;
            this.playerPowerLv = 1;
            this.playerOfflineLv = 1;
            this.coin = 0;
            this.playerId = 0;
            this.playerArr = [];
            this.unlockSkinCount = 0;
            this.exitTime = 0;
        }
    }
    class PlayerDataMgr {
        static getPlayerData() {
            if (!localStorage.getItem('playerData')) {
                this._playerData = new PlayerData();
                for (let i = 0; i < 27; i++) {
                    if (i == 0) {
                        this._playerData.playerArr.push(0);
                    }
                    else {
                        this._playerData.playerArr.push(-1);
                    }
                }
                localStorage.setItem('playerData', JSON.stringify(this._playerData));
            }
            else {
                if (this._playerData == null) {
                    this._playerData = JSON.parse(localStorage.getItem('playerData'));
                }
            }
            return this._playerData;
        }
        static setPlayerData() {
            localStorage.setItem('playerData', JSON.stringify(this._playerData));
        }
        static getPlayerYet() {
            let arr = [];
            for (let i = 0; i < this._playerData.playerArr.length; i++) {
                if (this._playerData.playerArr[i] < 0) {
                    arr.push(i);
                }
            }
            return arr;
        }
        static getCoinSkins() {
            let idArr = [].concat(this.skinArr1);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static getVideoSkins() {
            let idArr = [].concat(this.skinArr2);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i + 9] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static getFreeSkins() {
            let idArr = [].concat(this.skinArr1, this.skinArr2, this.skinArr3);
            idArr = Utility.shuffleArr(idArr);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                let playerArrIndex = this.getPlayerArrIndexByValue(idArr[i]);
                if (this._playerData.playerArr[playerArrIndex] < 0) {
                    arr.push(idArr[i]);
                    if (arr.length >= 1)
                        break;
                }
            }
            return arr;
        }
        static getBoxSkins() {
            let idArr = [].concat(this.skinArr3);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i + 18] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static changeCoin(dt) {
            this._playerData.coin += dt;
            this.setPlayerData();
        }
        static getPlayerSkin(id, value) {
            this._playerData.playerArr[id] = value;
            this._playerData.playerId = value;
            this.setPlayerData();
        }
        static getPlayerCountLv() {
            return this._playerData.playerCountLv;
        }
        static upgradePlayerCountLv() {
            if (this._playerData.playerCountLv >= 5) {
                return;
            }
            this._playerData.playerCountLv += 1;
            this.setPlayerData();
        }
        static getPlayerCount() {
            return this._playerData.playerCountLv;
        }
        static getCountLvMax() {
            return this._playerData.playerCountLv >= 5;
        }
        static getPlayerPowerLv() {
            return this._playerData.playerPowerLv;
        }
        static upgradePlayerPowerLv() {
            if (this._playerData.playerPowerLv >= 35) {
                return;
            }
            this._playerData.playerPowerLv += 1;
            this.setPlayerData();
        }
        static getPlayerPowerData() {
            let data = {
                hp: 125,
                atk: 20
            };
            data.hp = 125 + 4 * (this._playerData.playerPowerLv - 1);
            data.atk = 20 + 2 * (this._playerData.playerPowerLv - 1);
            return data;
        }
        static getPowerLvMax() {
            return this._playerData.playerPowerLv >= 35;
        }
        static getPlayerOfflineLv() {
            return this._playerData.playerOfflineLv;
        }
        static upgradePlayerOfflineLv() {
            if (this._playerData.playerOfflineLv >= 56) {
                return;
            }
            this._playerData.playerOfflineLv += 1;
            this.setPlayerData();
        }
        static getPlayerOffline(min) {
            return Math.floor(min * (1 + 0.05 * (this._playerData.playerOfflineLv - 1)));
        }
        static getOfflineLvMax() {
            return this._playerData.playerOfflineLv >= 56;
        }
        static getNpcData() {
            let data = {
                hp: 100,
                atk: 10
            };
            let g = Math.floor((this._playerData.grade - 1) / 5) + 1;
            data.hp = 100 + 10 * (g - 1);
            data.atk = 10 + 5 * (g - 1);
            if (data.hp > 240) {
                data.hp = 240;
            }
            if (data.atk > 90) {
                data.atk = 90;
            }
            return data;
        }
        static getUpgradePlayerCountLvCost() {
            let cost = 100;
            let lv = this.getPlayerCountLv();
            cost = 100 + 500 * (lv - 1);
            return cost;
        }
        static getUpgradePlayerPowerLvCost() {
            let cost = 50;
            let lv = this.getPlayerPowerLv();
            cost = 50 + 50 * (lv - 1);
            return cost;
        }
        static getUpgradeOfflineLvCost() {
            let cost = 50;
            let lv = this.getPlayerOfflineLv();
            cost = 50 + 50 * (lv - 1);
            return cost;
        }
        static getUnlockSkinCost() {
            return 100 + (100 * this._playerData.unlockSkinCount);
        }
        static getHeroSkinDir(id) {
            return 'heroSkins/Hero_' + (id + 1) + '.png';
        }
        static setExitTime() {
            this._playerData.exitTime = new Date().getTime();
            this.setPlayerData();
        }
        static getPlayerArrIndexByValue(value) {
            for (let i = 0; i < this.skinArr1.length; i++) {
                if (this.skinArr1.indexOf(value) != -1) {
                    return this.skinArr1.indexOf(value);
                }
            }
            for (let i = 0; i < this.skinArr2.length; i++) {
                if (this.skinArr2.indexOf(value) != -1) {
                    return this.skinArr2.indexOf(value) + 9;
                }
            }
            for (let i = 0; i < this.skinArr3.length; i++) {
                if (this.skinArr3.indexOf(value) != -1) {
                    return this.skinArr3.indexOf(value) + 18;
                }
            }
            return -1;
        }
        static getWeaponDataById(id) {
            switch (id) {
                case 0:
                    return { name: '塔卡纳', info: '移动速度增加10%' };
                case 1:
                    return { name: '超能战刃', info: '挥动速度增加30%' };
                case 2:
                    return { name: '棒棒!棒球棒', info: '击退距离增加30%' };
                case 3:
                    return { name: '屠龙刀', info: '攻击力增加+30%' };
                case 4:
                    return { name: '隐匿匕首', info: '移动速度降低10%一击必杀' };
                case 5:
                    return { name: '黑武士之剑', info: '击杀一名敌人恢复25%血量' };
                case 6:
                    return { name: '雷神之锤', info: '击中时对所有敌人造成40%的伤害' };
                case 7:
                    return { name: '平底锅', info: '自身受到的伤害减少30%' };
                case 8:
                    return { name: '越来越有电锯', info: '挥动速度降低10%,恢复2%生命/s' };
            }
        }
    }
    PlayerDataMgr.maxPower = 10;
    PlayerDataMgr._playerData = null;
    PlayerDataMgr.tempSkinId = -1;
    PlayerDataMgr.aiConfig = null;
    PlayerDataMgr.posConfig = null;
    PlayerDataMgr.freeSkinId = -1;
    PlayerDataMgr.skinArr1 = [0, 1, 2, 8, 9];
    PlayerDataMgr.skinArr2 = [3, 4];
    PlayerDataMgr.skinArr3 = [5, 6, 7];
    PlayerDataMgr.skinArr4 = [8, 9];

    class SoundMgr {
        static get instance() {
            if (!this._instance) {
                this._instance = new SoundMgr();
            }
            return this._instance;
        }
        initLoading(fun) {
            var resUrl = [
                { url: 'res/sounds/bgm.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/getCoin.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit4.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponReady.mp3', type: Laya.Loader.SOUND }
            ];
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
            Laya.SoundManager.useAudioMusic = true;
            Laya.SoundManager.setMusicVolume(1);
        }
        playMusic(str, loops = 0, cb) {
            Laya.SoundManager.playMusic('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
        stopMusic() {
            Laya.SoundManager.stopMusic();
        }
        playSoundEffect(str, loops = 1, cb) {
            Laya.SoundManager.playSound('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
    }

    class Boss extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.isHited = false;
            this.isDied = false;
            this.hp = 100;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
        }
        onDisable() {
        }
        playDied() {
            this._ani.speed = 1;
            this._ani.crossFade("Take 001", 0.05);
        }
        hitBack(atk) {
            if (this.isDied || this.isHited) {
                return;
            }
            let id = Utility.GetRandom(1, 3);
            SoundMgr.instance.playSoundEffect('castleHit' + id + '.mp3');
            WxApi.DoVibrate();
            Utility.objectShake(this.myOwner, 0.2, 0.1);
            this.hp -= atk;
            if (this.hp <= 0) {
                this.isDied = true;
                this.playDied();
                GameLogic.Share.getCoinNum += 10;
                Laya.timer.once(1000, this, () => {
                    this.owner.destroy();
                });
                return;
            }
            this.isHited = true;
            Laya.timer.once(500, this, () => { this.isHited = false; });
        }
    }

    class TimeCountMgr {
        constructor() {
            this.tCount = 0;
            TimeCountMgr.Share = this;
            this.init();
        }
        init() {
            if (localStorage.getItem('powerTime')) {
                this.tCount = parseInt(localStorage.getItem('powerTime'));
            }
            else {
                localStorage.setItem('power', '0');
            }
            this.calculateExitTime();
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onShow((para) => {
                    this.calculateExitTime();
                });
                Laya.Browser.window.wx.onHide((para) => {
                    localStorage.setItem('powerTime', this.tCount.toString());
                    localStorage.setItem('exitTime', new Date().getTime().toString());
                });
            }
            Laya.timer.loop(1000, this, this.calculateTime);
        }
        calculateExitTime() {
            let exitTime = 0;
            if (localStorage.getItem('exitTime')) {
                exitTime = new Date().getTime() - parseInt(localStorage.getItem('exitTime'));
            }
            if (exitTime <= 0)
                return;
            exitTime /= 1000;
            let t = Math.floor(exitTime / 600);
            PlayerDataMgr.getPlayerData().power += t;
            if (PlayerDataMgr.getPlayerData().power > PlayerDataMgr.maxPower) {
                PlayerDataMgr.getPlayerData().power = PlayerDataMgr.maxPower;
                PlayerDataMgr.setPlayerData();
            }
        }
        calculateTime() {
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < PlayerDataMgr.maxPower) {
                    this.tCount = 600;
                }
                else {
                    this.tCount = 0;
                }
                return;
            }
            this.tCount--;
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < PlayerDataMgr.maxPower) {
                    PlayerDataMgr.getPlayerData().power += 1;
                    PlayerDataMgr.setPlayerData();
                    this.tCount = PlayerDataMgr.getPlayerData().power < PlayerDataMgr.maxPower ? 600 : 0;
                }
            }
        }
    }

    class GameTopNode extends Laya.Script {
        constructor() {
            super();
            this.iconIndex = 1;
        }
        onEnable() {
            GameTopNode.Share = this;
            this.calculateTime();
            Laya.timer.loop(1000, this, this.calculateTime);
            this.initData();
            Utility.rotateLoop(this.navNode, 10, 200);
            this.navNode.on(Laya.Event.CLICK, this, () => {
                WxApi.showMoreGamesModal();
            });
            this.navNode.visible = !WxApi.getIsIos();
            let icon = this.navNode.getChildByName('icon');
            icon.skin = 'res/icons/icon (1).png';
            Laya.timer.loop(3000, this, this.changeIcon);
        }
        changeIcon() {
            this.iconIndex++;
            if (this.iconIndex > 17)
                this.iconIndex = 1;
            let icon = this.navNode.getChildByName('icon');
            icon.skin = 'res/icons/icon (' + this.iconIndex + ').png';
        }
        initData() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
            this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString();
            this.gradeNum.text = PlayerDataMgr.getPlayerData().grade.toString();
            this.bar.width = (PlayerDataMgr.getPlayerData().gradeIndex + 1) / 4 * 480;
            this.bossPic.visible = this.bar.width >= 480;
            let g = Math.floor(PlayerDataMgr.getPlayerData().grade % 4) == 0 ? 4 : Math.floor(PlayerDataMgr.getPlayerData().grade % 4);
            for (let i = 0; i < this.keyNode.numChildren; i++) {
                let key = this.keyNode.getChildAt(i);
                key.skin = g > i + 1 ? 'mainUI/sy-ys1.png' : 'mainUI/sy-ys2.png';
            }
        }
        onDisable() {
            Laya.timer.clearAll(this);
        }
        calculateTime() {
            let t = TimeCountMgr.Share.tCount;
            let m = Math.floor(t / 60);
            let s = Math.floor(t - m * 60);
            this.powerTime.text = m.toString() + ':' + s.toString();
            this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString();
            this.powerTime.visible = PlayerDataMgr.getPlayerData().power < PlayerDataMgr.maxPower;
        }
    }

    var PrefabItem;
    (function (PrefabItem) {
        PrefabItem["HpBar"] = "prefab/hpBar.prefab";
        PrefabItem["Smile"] = "prefab/smile.prefab";
        PrefabItem["Cry"] = "prefab/cry.prefab";
    })(PrefabItem || (PrefabItem = {}));
    class PrefabManager {
        constructor() {
            this.init();
            Laya.loader.load(this.url, Laya.Handler.create(this, this.loadComplete), Laya.Handler.create(this, this.loadProgress), Laya.Loader.PREFAB);
        }
        static instance() {
            return PrefabManager._instance ? PrefabManager._instance : PrefabManager._instance = new PrefabManager();
        }
        init() {
            this.url = [];
            for (let prefab in PrefabItem) {
                this.url.push(PrefabItem[prefab]);
            }
        }
        getItem(name) {
            let prefab = Laya.loader.getRes(name);
            if (prefab) {
                return Laya.Pool.getItemByCreateFun(name, prefab.create, prefab);
            }
            else
                return null;
        }
        recoverItem(name, item) {
            Laya.Pool.recover(name, item);
        }
        loadProgress(res) {
            console.log("预制体资源加载中...", res);
        }
        loadComplete() {
            console.log("预制体资源加载完成!");
        }
    }

    class FixPlayerHpBar extends Laya.Script {
        constructor() {
            super();
            this.playerNode = null;
            this.playerCrl = null;
            this.ready = false;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        initData(node) {
            this.playerNode = node;
            this.ready = true;
            this.playerCrl = this.playerNode.getComponent(Player);
        }
        onUpdate() {
            if (!this.ready) {
                return;
            }
            if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
                this.myOwner.destroy();
                return;
            }
            this.myOwner.value = this.playerCrl.hp / this.playerCrl.hpMax;
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = this.playerNode.transform.position.clone();
            if (!this.playerCrl.isPlayer)
                hPos.y += 4;
            else
                hPos.z -= 1;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
        }
    }

    class FixAiTips extends Laya.Script {
        constructor() {
            super();
            this.playerNode = null;
            this.playerCrl = null;
            this.ready = false;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        initData(node) {
            this.playerNode = node;
            this.playerCrl = this.playerNode.getComponent(Player);
            this.ready = true;
            Laya.timer.once(2000, this, () => { this.myOwner.destroy(); });
        }
        onUpdate() {
            if (!this.ready) {
                return;
            }
            if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
                this.myOwner.destroy();
                return;
            }
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = this.playerNode.transform.position.clone();
            hPos.y += 3.5;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
        }
    }

    class AdMgr {
        constructor() {
            this.bannerUnitId = ['90mc9fdgkm7dbr7i37'];
            this.videoUnitId = '55cpk10le9d24bd43g';
            this.bannerAd = null;
            this.videoAd = null;
            this.videoCallback = null;
            this.curBannerId = 0;
            this.showBannerCount = 0;
            this.closeVCB = null;
            this.videoIsError = false;
            this.videoLoaded = false;
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new AdMgr();
            }
            return this._instance;
        }
        initAd() {
            if (Laya.Browser.onWeiXin) {
                this.initBanner();
                this.initVideo();
            }
        }
        initBanner() {
            let isIphonex = false;
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.getSystemInfo({
                    success: res => {
                        let modelmes = res.model;
                        if (modelmes.search('iPhone X') != -1) {
                            isIphonex = true;
                        }
                    }
                });
            }
            let winSize = Laya.Browser.window.wx.getSystemInfoSync();
            this.bannerAd = Laya.Browser.window.wx.createBannerAd({
                adUnitId: this.bannerUnitId[0],
                style: {
                    left: 0,
                    top: 0,
                    width: 100
                }
            });
            this.bannerAd.onResize((size) => {
                if (isIphonex) {
                    this.bannerAd.style.top = winSize.windowHeight - size.height - 10;
                }
                else {
                    this.bannerAd.style.top = winSize.windowHeight - size.height - 10;
                }
                this.bannerAd.style.left = winSize.windowWidth / 2 - size.width / 2;
            });
            this.bannerAd.onError(res => {
            });
        }
        hideBanner() {
            if (Laya.Browser.onWeiXin) {
                this.bannerAd.hide();
            }
        }
        showBanner() {
            if (Laya.Browser.onWeiXin) {
                this.showBannerCount++;
                this.bannerAd.show();
            }
        }
        destroyBanner() {
            if (Laya.Browser.onWeiXin && this.bannerAd) {
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
        }
        initVideo() {
            if (!this.videoAd) {
                this.videoAd = window['tt'].createRewardedVideoAd({
                    adUnitId: this.videoUnitId
                });
            }
            this.loadVideo();
            this.videoAd.onLoad(() => {
                console.log('激励视频加载成功');
                this.videoLoaded = true;
            });
            this.videoAd.onError(res => {
                console.log('video Error:', JSON.stringify(res));
                this.videoIsError = true;
            });
            this.videoAd.onClose(res => {
                if (res && res.isEnded || res === undefined) {
                    console.log('正常播放结束，可以下发游戏奖励');
                    this.videoCallback();
                }
                else {
                    console.log('播放中途退出，不下发游戏奖励');
                }
                this.closeVCB && this.closeVCB();
                this.closeVCB = null;
                if (WxApi.isMusic)
                    Laya.SoundManager.muted = false;
                this.loadVideo();
            });
        }
        loadVideo() {
            if (this.videoAd != null) {
                this.videoIsError = false;
                this.videoLoaded = false;
                this.videoAd.load();
            }
        }
        showVideo(cb) {
            this.videoCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                this.videoCallback();
                return;
            }
            if (this.videoIsError) {
                this.videoCallback();
                return;
            }
            Laya.SoundManager.muted = true;
            this.videoAd.show();
        }
    }

    class RecorderMgr {
        constructor() {
            this.isRecording = false;
            this.recorder = null;
            this.videoPath = '';
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new RecorderMgr();
            }
            return this._instance;
        }
        initRecorder() {
            if (Laya.Browser.onWeiXin) {
                this.recorder = window['tt'].getGameRecorderManager();
                this.onStopListener();
                this.onInterrupBegin();
                this.onInterrupEnd();
            }
        }
        recordStart() {
            if (!Laya.Browser.onWeiXin)
                return;
            console.log('录屏开始');
            this.recorder.start({
                duration: 300,
            });
            this.isRecording = true;
        }
        recordPause() {
            if (!Laya.Browser.onWeiXin)
                return;
            console.log('录屏暂停');
            this.recorder.pause();
        }
        recordResume() {
            if (!Laya.Browser.onWeiXin)
                return;
            console.log('录屏继续');
            this.recorder.resume();
        }
        recordStop() {
            if (!Laya.Browser.onWeiXin)
                return;
            if (!this.isRecording) {
                return;
            }
            console.log('录屏停止');
            this.recorder.stop();
        }
        onStopListener() {
            this.recorder.onStop(res => {
                console.log('录屏结束：', res.videoPath);
                this.videoPath = res.videoPath;
                this.isRecording = false;
            });
        }
        shareVideo(cb) {
            if (this.videoPath == '') {
                WxApi.OpenAlert('请开始游戏录制视频！');
                return;
            }
            window['tt'].shareAppMessage({
                channel: 'video',
                extra: {
                    videoPath: this.videoPath,
                    videoTopics: ["我画你杀", "抖音小游戏"],
                    hashtag_list: ["我画你杀", "抖音小游戏"],
                    createChallenge: true,
                    withVideoId: true
                },
                success: () => {
                    console.log("分享成功");
                    cb && cb();
                },
                fail: (e) => {
                    console.log("分享失败");
                    WxApi.OpenAlert('分享失败！');
                }
            });
        }
        onInterrupBegin() {
            this.recorder.onInterruptionBegin(() => {
                console.log('录屏被打断开始');
                this.recordPause();
            });
        }
        onInterrupEnd() {
            this.recorder.onInterruptionEnd(() => {
                console.log('录屏被打断结束');
                this.recordResume();
            });
        }
    }

    class GameUI extends Laya.Scene {
        constructor() {
            super();
            this.touchPanel = this['touchPanel'];
            this.touchNode = this['touchNode'];
            this.drawSp = this['drawSp'];
            this.btnNode = this['btnNode'];
            this.noPowerNode = this['noPowerNode'];
            this.upgradeNode = this['upgradeNode'];
            this.closeUpgradePlane = this['closeUpgradePlane'];
            this.moveNode = this['moveNode'];
            this.item1 = this['item1'];
            this.item2 = this['item2'];
            this.item3 = this['item3'];
            this.getPowerBtn = this['getPowerBtn'];
            this.upgradeBtn = this['upgradeBtn'];
            this.skinBtn = this['skinBtn'];
            this.reviveBtn = this['reviveBtn'];
            this.startBtn = this['startBtn'];
            this.overNode = this['overNode'];
            this.bottomNode = this['bottomNode'];
            this.gameOverNode = this['gameOverNode'];
            this.helpBtn = this['helpBtn'];
            this.giveUpBtn = this['giveUpBtn'];
            this.gameOverBtnNode = this['gameOverBtnNode'];
            this.playerHp = this['playerHp'];
            this.aiHp = this['aiHp'];
            this.shareVideo = this['shareVideo'];
            this.touchStarted = false;
            this.startPos = null;
            this.lineArr = [];
            this.lineArrVec2 = [];
            this.weaponNode = this['weaponNode'];
            this.polyNode = this['polyNode'];
            this.weaponPicNode = this['weaponPicNode'];
            this.weaponTips = this['weaponTips'];
            this.godWeaponBtn = this['godWeaponBtn'];
            this.refreshBtn = this['refreshBtn'];
            this.cmds = [];
            this.pointsArr = [];
            this.refreshArr = [];
            this.curWeaponId = -1;
        }
        onOpened(param) {
            GameUI.Share = this;
            this.initData();
            param && param();
            Laya.timer.frameLoop(1, this, this.checkIsNoPower);
            if (PlayerDataMgr.getPlayerData().grade >= 2 && PlayerDataMgr.getPlayerData().gradeIndex == 0) {
                if (!localStorage.getItem('weapon0')) {
                    Laya.Scene.open('MyScenes/FoundWeaponUI.scene', false, 0);
                    localStorage.setItem('weapon0', '1');
                }
                if (!localStorage.getItem('weaponGrade')) {
                    localStorage.setItem('weaponGrade', '0');
                }
                for (let i = 1; i < 9; i++) {
                    if (!localStorage.getItem('weapon' + i) && i * 2 - parseInt(localStorage.getItem('weaponGrade')) == 0) {
                        localStorage.setItem('weapon' + i, '1');
                        Laya.Scene.open('MyScenes/FoundWeaponUI.scene', false, i);
                        break;
                    }
                }
                Laya.timer.frameOnce(1, this, this.initWeaponData);
            }
            this.godWeaponBtn.visible = PlayerDataMgr.getPlayerData().grade >= 2;
            if (!WxApi.launchGameUI) {
                WxApi.GetLaunchParam((param) => {
                    let et = PlayerDataMgr.getPlayerData().exitTime;
                    if (et > 0) {
                        let curT = new Date().getTime();
                        let diffT = Math.floor((curT - et) / 1000 / 60);
                        if (diffT >= 1) {
                            Laya.Scene.open('MyScenes/OfflineUI.scene', false, diffT);
                        }
                    }
                });
                WxApi.launchGameUI = true;
                GameLogic.Share.checkCanUpgrade();
            }
            else {
                if (localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade > 1 && PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
                    PlayerDataMgr.getFreeSkins().length > 0) {
                    if (WxApi.ExtractUIGapGrade > 0) {
                        WxApi.ExtractUIGapGrade--;
                    }
                    else {
                        Laya.timer.once(100, this, () => {
                            Laya.Scene.open('MyScenes/ExtractUI.scene', false);
                        });
                    }
                }
            }
            this['drawTips'].visible = PlayerDataMgr.getPlayerData().grade <= 1;
            this['drawTips'].skin = PlayerDataMgr.getPlayerData().grade == 1 ? 'mainUI/sy_ck2.png' : 'mainUI/sy_ck1.png';
            if (!localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade == 1) {
                this['fingerAni'].visible = true;
            }
            else {
                this['fingerAni'].visible = false;
            }
            SoundMgr.instance.playMusic('bgm.mp3');
            AdMgr.instance.hideBanner();
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        initData() {
            this.touchPanel.y = Utility.fixPosY(this.touchPanel.y);
            this.bottomNode.y = Utility.fixPosY(this.bottomNode.y);
            this.gameOverBtnNode.y = Utility.fixPosY(this.gameOverBtnNode.y);
            this.touchNode.on(Laya.Event.MOUSE_DOWN, this, this.touchStart);
            this.touchNode.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.touchNode.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.touchNode.on(Laya.Event.MOUSE_OUT, this, this.touchOut);
            this.upgradeBtn.on(Laya.Event.CLICK, this, this.upgradeBtnCB);
            this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB);
            this.item1.on(Laya.Event.CLICK, this, this.upgradePlayerCountCB);
            this.item2.on(Laya.Event.CLICK, this, this.upgradePlayerAtkCB);
            this.item3.on(Laya.Event.CLICK, this, this.upgradeOfflineCB);
            this.reviveBtn.on(Laya.Event.CLICK, this, this.reviveBtnCB);
            this.startBtn.on(Laya.Event.CLICK, this, this.startCB);
            this.helpBtn.on(Laya.Event.CLICK, this, this.helpBtnCB);
            this.giveUpBtn.on(Laya.Event.CLICK, this, this.giveUpBtnCB);
            this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB);
            this.shareVideo.on(Laya.Event.CLICK, this, this.shareVideoCB);
            this.updatePlayerItem();
            Laya.timer.loop(1000, this, this.updatePlayerItem);
            GameLogic.Share.canTouch = true;
        }
        updatePlayerItem() {
            let item = null;
            let showTips = false;
            for (let i = 1; i <= 3; i++) {
                item = this['item' + i];
                let lvNum = item.getChildByName('lvNum');
                let cost = item.getChildByName('cost');
                let panel = item.getChildByName('panel');
                switch (i) {
                    case 1:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerCountLv().toString();
                        cost.text = PlayerDataMgr.getUpgradePlayerCountLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradePlayerCountLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getCountLvMax();
                        break;
                    case 2:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerPowerLv().toString();
                        cost.text = PlayerDataMgr.getUpgradePlayerPowerLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradePlayerPowerLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getPowerLvMax();
                        break;
                    case 3:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerOfflineLv().toString();
                        cost.text = PlayerDataMgr.getUpgradeOfflineLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradeOfflineLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getOfflineLvMax();
                        break;
                }
                if (!panel.visible) {
                    showTips = true;
                }
            }
            let tips = this.upgradeBtn.getChildAt(0);
            tips.visible = showTips;
        }
        touchStart(event) {
            if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !GameLogic.Share.canTouch) {
                return;
            }
            this['fingerAni'].visible = false;
            if (!localStorage.getItem('guide')) {
                localStorage.setItem('guide', '1');
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted) {
                PlayerDataMgr.getPlayerData().power--;
                PlayerDataMgr.setPlayerData();
                GameLogic.Share.gameStarted = true;
                RecorderMgr.instance.recordStart();
                switch (PlayerDataMgr.getPlayerData().grade) {
                    case 1:
                        WxApi.ttEvent('Event_4');
                        break;
                    case 2:
                        WxApi.ttEvent('Event_5');
                        break;
                    case 3:
                        WxApi.ttEvent('Event_6');
                        break;
                    case 4:
                        WxApi.ttEvent('Event_7');
                        break;
                    case 5:
                        WxApi.ttEvent('Event_8');
                        break;
                    case 6:
                        WxApi.ttEvent('Event_9');
                        break;
                }
            }
            this.touchStarted = true;
            this.startPos = new Laya.Vector2(event.stageX, event.stageY);
            this.lineArr = [];
            this.lineArr.push(this.startPos.x);
            this.lineArr.push(this.startPos.y);
            this.lineArrVec2 = [];
            this.lineArrVec2.push(this.startPos);
        }
        touchMove(event) {
            if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !this.touchStarted) {
                return;
            }
            let p = new Laya.Vector2(event.stageX, event.stageY);
            let dis = Utility.calcDistance(this.startPos, p);
            if (dis >= 10 && this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MAX) {
                this.lineArr.push(p.x);
                this.lineArr.push(p.y);
                this.lineArrVec2.push(p);
                this.startPos = p;
                this.drawLine();
            }
        }
        touchEnd(event) {
            if (!this.touchStarted) {
                return;
            }
            this.touchStarted = false;
            this.drawSp.graphics.clear();
            if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
                WxApi.OpenAlert('武器太短啦，请重画！');
                return;
            }
            let polyId = this.checkLineInPoly(this.lineArrVec2);
            console.log('polyId:', polyId);
            if (polyId != -1) {
                GameLogic.Share.createGodWeapon(polyId);
                this.dealWithAddWeapon(polyId);
            }
            else {
                GameLogic.Share.createLine3D(this.lineArrVec2);
            }
        }
        touchOut(event) {
            if (!this.touchStarted) {
                return;
            }
            this.touchStarted = false;
            this.drawSp.graphics.clear();
            if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
                WxApi.OpenAlert('武器太短啦，请重画！');
                return;
            }
            let polyId = this.checkLineInPoly(this.lineArrVec2);
            console.log('polyId:', polyId);
            if (polyId != -1) {
                GameLogic.Share.createGodWeapon(polyId);
                this.dealWithAddWeapon(polyId);
            }
            else {
                GameLogic.Share.createLine3D(this.lineArrVec2);
            }
        }
        drawLine() {
            this.drawSp.graphics.clear();
            this.drawSp.graphics.drawLines(0, 0, this.lineArr, "#000000", 8);
        }
        safeArea(pos) {
            let x1 = this.touchPanel.x - this.touchPanel.width / 2;
            let x2 = this.touchPanel.x + this.touchPanel.width / 2;
            let y1 = this.touchPanel.y - this.touchPanel.height / 2;
            let y2 = this.touchPanel.y + this.touchPanel.height / 2;
            if (pos.x < x1 || pos.x > x2 || pos.y < y1 || pos.y > y2) {
                return false;
            }
            else {
                return true;
            }
        }
        upgradeBtnCB() {
            if (this.upgradeNode.visible) {
                return;
            }
            else {
                WxApi.aldEvent('首页升级按钮：点击');
                this.upgradeNode.visible = true;
                Utility.tMove2D(this.moveNode, -606, this.moveNode.y, 200, () => {
                    this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode);
                    this.closeUpgradePlane.on(Laya.Event.CLICK, this, this.closeUpgradeNode);
                });
            }
        }
        closeUpgradeNode() {
            this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode);
            Utility.tMove2D(this.moveNode, 0, this.moveNode.y, 200, () => {
                this.upgradeNode.visible = false;
            });
        }
        skinBtnCB() {
            WxApi.aldEvent('皮肤界面：点击');
            Laya.Scene.open('MyScenes/SkinUI.scene', false, () => { });
        }
        upgradePlayerCountCB() {
            if (PlayerDataMgr.getPlayerCountLv() >= 5) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerCountLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：人数');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerCountLvCost());
            PlayerDataMgr.upgradePlayerCountLv();
            this.updatePlayerItem();
            GameLogic.Share.upgradePlayerCount();
            GameTopNode.Share.initData();
        }
        upgradePlayerAtkCB() {
            if (PlayerDataMgr.getPlayerPowerLv() >= 35) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerPowerLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：攻击力');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerPowerLvCost());
            PlayerDataMgr.upgradePlayerPowerLv();
            this.updatePlayerItem();
            GameTopNode.Share.initData();
        }
        upgradeOfflineCB() {
            if (PlayerDataMgr.getPlayerOfflineLv() >= 56) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradeOfflineLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：离线收益');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradeOfflineLvCost());
            PlayerDataMgr.upgradePlayerOfflineLv();
            this.updatePlayerItem();
            GameTopNode.Share.initData();
        }
        visibleOverNode(visible) {
            if (visible)
                WxApi.aldEvent('复活战士按钮弹出展示');
            this.touchPanel.visible = !visible;
            this.overNode.visible = visible;
            this.upgradeBtn.visible = !visible;
            this.skinBtn.visible = !visible;
            this.shareVideo.visible = !visible;
            this.refreshBtn.visible = !visible && PlayerDataMgr.getPlayerData().grade >= 2;
        }
        reviveBtnCB() {
            GameLogic.Share.revivePlayer();
            this.visibleOverNode(false);
        }
        startCB() {
            this.visibleOverNode(false);
            GameLogic.Share.goAhead();
        }
        visibleBottomUI(visible) {
            this.touchPanel.visible = visible;
            this.upgradeBtn.visible = visible;
            this.skinBtn.visible = visible;
            this.shareVideo.visible = visible;
            this.godWeaponBtn.visible = visible && PlayerDataMgr.getPlayerData().grade >= 2;
            this.refreshBtn.visible = visible && PlayerDataMgr.getPlayerData().grade >= 2;
        }
        visibleGameOverNode(visible) {
            this.gameOverNode.visible = visible;
        }
        helpBtnCB() {
            WxApi.aldEvent('请求帮助：点击');
            let cb = () => {
                WxApi.aldEvent('请求帮助：成功');
                this.visibleGameOverNode(false);
                GameLogic.Share.isHelpStart = true;
                GameLogic.Share.tempPlayerCount = 1;
                GameLogic.Share.restartGame();
            };
            AdMgr.instance.showVideo(cb);
        }
        giveUpBtnCB() {
            RecorderMgr.instance.recordStop();
            WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：失败');
            GameLogic.Share.isHelpStart = false;
            GameLogic.Share.gradeIndex = 0;
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            PlayerDataMgr.setPlayerData();
            Laya.Scene.open('MyScenes/GameUI.scene');
            GameLogic.Share.restartGame();
        }
        createHpBar(node) {
            let bar = PrefabManager.instance().getItem(PrefabItem.HpBar);
            this.playerHp.addChild(bar);
            let crl = bar.addComponent(FixPlayerHpBar);
            crl.initData(node);
        }
        createSmile(node) {
            let smlie = PrefabManager.instance().getItem(PrefabItem.Smile);
            this.addChild(smlie);
            let crl = smlie.getComponent(FixAiTips);
            crl.initData(node);
        }
        createCry(node) {
            let cry = PrefabManager.instance().getItem(PrefabItem.Cry);
            this.addChild(cry);
            let crl = cry.getComponent(FixAiTips);
            crl.initData(node);
        }
        getPowerBtnCB() {
            WxApi.aldEvent('获得体力：点击');
            let cb = () => {
                WxApi.aldEvent('获得体力：成功');
                PlayerDataMgr.getPlayerData().power += 5;
                PlayerDataMgr.setPlayerData();
                this.refreshBtn.visible = true;
            };
            AdMgr.instance.showVideo(cb);
        }
        checkIsNoPower() {
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted && !GameLogic.Share.isHelpStart) {
                let p = PlayerDataMgr.getPlayerData().power;
                this.touchPanel.visible = p > 0;
                this.touchNode.visible = p > 0;
                this.noPowerNode.visible = p <= 0;
            }
        }
        createCoinBoom(node) {
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = node.transform.position.clone();
            hPos.y += 1.75;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            let pos = new Laya.Vector2(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
            let desPos = new Laya.Vector2(75, 100);
            Utility.coinCollectAnim(pos, desPos, this);
            GameTopNode.Share.initData();
        }
        shareVideoCB() {
            WxApi.ttEvent('Event_20');
            RecorderMgr.instance.shareVideo();
        }
        initWeaponData() {
            this.godWeaponBtn.on(Laya.Event.CLICK, this, this.clickGodWeapon);
            this.refreshBtn.on(Laya.Event.CLICK, this, this.refreshBtnCB);
            for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
                if (localStorage.getItem('weapon' + i))
                    this.refreshArr.push(i);
            }
            this.refreshWeaponTips();
            this.cmds = this.polyNode.graphics.cmds;
            let gPoint = this.polyNode.localToGlobal(new Laya.Point(0, 0));
            for (let i = 0; i < this.cmds.length; i++) {
                let points = this.cmds[i].points;
                let arr = [];
                for (let j = 0; j < points.length; j++) {
                    if (j > 0 && j % 2 != 0) {
                        let pos = new Laya.Vector2(points[j - 1], points[j]);
                        pos.x += gPoint.x + 22;
                        pos.y += gPoint.y + 23;
                        arr.push(pos);
                    }
                }
                this.pointsArr.push(arr);
            }
        }
        checkLineInPoly(lineArr) {
            let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            for (let i = 0; i < this.pointsArr.length; i++) {
                let posArr = this.pointsArr[i];
                for (let j = 0; j < lineArr.length; j++) {
                    if (!Utility.pointInPolygon(lineArr[j], posArr)) {
                        arr.splice(arr.indexOf(i), 1);
                        break;
                    }
                }
            }
            if (arr.length <= 0)
                return -1;
            for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
                if (arr.indexOf(i) == -1)
                    continue;
                let polyPointNode = this.weaponPicNode.getChildAt(i).getChildByName('pointNode');
                let posArr = [];
                for (let j = 0; j < polyPointNode.numChildren; j++) {
                    let p = polyPointNode.getChildAt(j);
                    let gp = polyPointNode.localToGlobal(new Laya.Point(p.x, p.y));
                    posArr.push(new Laya.Vector2(gp.x, gp.y));
                }
                if (!this.checkPointDistancePoint(posArr, lineArr)) {
                    arr.splice(arr.indexOf(i), 1);
                }
            }
            if (arr.length <= 0)
                return -1;
            if (arr.indexOf(this.curWeaponId) != -1 && localStorage.getItem('weapon' + this.curWeaponId)) {
                return this.curWeaponId;
            }
            else {
                return -1;
            }
        }
        checkPointDistancePoint(polyArr, lineArr) {
            for (let i = 0; i < polyArr.length; i++) {
                let pp = polyArr[i];
                let isDis = false;
                for (let j = 0; j < lineArr.length; j++) {
                    let lp = lineArr[j];
                    let dis = Utility.calcDistance(pp, lp);
                    if (dis < 50) {
                        isDis = true;
                        break;
                    }
                }
                if (!isDis) {
                    return false;
                }
            }
            return true;
        }
        clickGodWeapon() {
            Laya.Scene.open('MyScenes/WeaponDicUI.scene', false);
        }
        hideAllWeaponPics() {
            for (let i = 0; i < this.weaponPicNode.numChildren; i++) {
                let pic = this.weaponPicNode.getChildAt(i);
                pic.visible = false;
            }
        }
        refreshWeaponTips() {
            this.weaponTips.visible = false;
            if (this.refreshArr.length <= 0)
                return;
            let id = Utility.getRandomItemInArr(this.refreshArr);
            this.curWeaponId = id;
            this.hideAllWeaponPics();
            let pic = this.weaponPicNode.getChildAt(id);
            pic.visible = true;
            this.weaponTips.visible = true;
            this.refreshBtn.visible = this.weaponTips.visible && this.refreshArr.length > 1 && this.touchPanel.visible;
        }
        refreshBtnCB() {
            let arr = [].concat(this.refreshArr);
            if (arr.length <= 0) {
                this.refreshBtn.visible = false;
                return;
            }
            arr.splice(arr.indexOf(this.curWeaponId), 1);
            if (arr.length <= 0) {
                this.refreshBtn.visible = false;
                return;
            }
            let id = Utility.getRandomItemInArr(arr);
            this.curWeaponId = id;
            this.hideAllWeaponPics();
            let pic = this.weaponPicNode.getChildAt(id);
            pic.visible = true;
            this.refreshBtn.visible = this.weaponTips.visible;
        }
        dealWithAddWeapon(id) {
            this.refreshArr.splice(this.refreshArr.indexOf(id), 1);
            let pic = this.weaponPicNode.getChildAt(this.curWeaponId);
            pic.visible = false;
            this.curWeaponId = -1;
            this.refreshWeaponTips();
        }
    }

    class Player extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.weaponNode = null;
            this.enemyNode = null;
            this.embNode = null;
            this.closeNode = null;
            this.isPlayer = true;
            this.isHited = false;
            this.haveWeapon = false;
            this.isDied = false;
            this.fightStarted = false;
            this.weaponLength = 5;
            this.walkSpeed = 0.08;
            this.myId = 0;
            this.backDistance = 8;
            this.weaponSpeed = 1;
            this.hpMax = 100;
            this.hp = 100;
            this.atk = 20;
            this.embScale = null;
            this.embPos = null;
            this.embRotation = null;
            this.isBossState = false;
            this.backDisTemp = 0;
            this.healValue = 0;
            this.isAllDamage = false;
            this.decDamage = 0;
            this.isOneKill = false;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
            this.playIdle1();
            this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms');
            this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb');
            let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb');
            this.embScale = emb.transform.localScale.clone();
            this.embPos = emb.transform.localPosition.clone();
            this.embRotation = emb.transform.localRotation.clone();
        }
        initData(id, isPlayer) {
            this.myId = id;
            this.isPlayer = isPlayer;
            if (!this.isPlayer) {
                this.playIdle2();
            }
            if (isPlayer) {
                this.changeSkin(PlayerDataMgr.freeSkinId != -1 ? PlayerDataMgr.freeSkinId : PlayerDataMgr.getPlayerData().playerId);
                this.hp = PlayerDataMgr.getPlayerPowerData().hp;
                this.hpMax = this.hp;
                this.atk = PlayerDataMgr.getPlayerPowerData().atk;
            }
        }
        playIdle1() {
            this._ani.speed = 1;
            this._ani.crossFade("idle1", 0.05);
        }
        playIdle2() {
            this._ani.speed = 1;
            this._ani.crossFade("idle2", 0.05);
        }
        playWalk() {
            this._ani.play("walk", 0, 0);
            this._ani.crossFade("hit", 0.05, 1);
            let crl = this._ani.getControllerLayer(1);
            crl.getAnimatorState('hit').speed = this.getPlayerAniSpeed();
        }
        playDied() {
            this._ani.crossFade("died", 0.05);
            let crl = this._ani.getControllerLayer(1);
            crl.getAnimatorState('hit').speed = 0;
        }
        getPlayerAniSpeed() {
            let wLength = this.weaponLength;
            if (wLength > 50) {
                return this.weaponSpeed - this.weaponSpeed * (wLength - 50) * 0.01;
            }
            else {
                return this.weaponSpeed;
            }
        }
        getHitbackDistance(eCrl) {
            let wLength = this.weaponLength;
            if (wLength > 50) {
                let v = this.backDistance - this.backDistance * (wLength - 50) * 0.01;
                if (eCrl) {
                    return v * (1 + eCrl.backDisTemp);
                }
                else {
                    return v;
                }
            }
            else {
                if (eCrl) {
                    return this.backDistance * (1 + eCrl.backDisTemp);
                }
                else {
                    return this.backDistance;
                }
            }
        }
        addGodWeapon(id) {
            let weaponRes = Laya.loader.getRes(WxApi.UnityPath + 'H_Arms_' + (id + 1) + '.lh');
            let weapon = Laya.Sprite3D.instantiate(weaponRes, null, true, new Laya.Vector3(0, 0, 0));
            this.addWeapon(weapon);
            this.addWeaponData(id);
        }
        addWeapon(weapon) {
            this.weaponNode.addChild(weapon);
            this.weaponLength = this.weaponNode.getChildAt(0).numChildren > 100 ? 100 : this.weaponNode.getChildAt(0).numChildren;
            weapon.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.haveWeapon = true;
            if (this.weaponNode.numChildren > 30) {
                this.atk = this.atk * (1 + (this.weaponNode.numChildren - 30) * 0.005);
            }
            if (this.isPlayer) {
                SoundMgr.instance.playSoundEffect('weaponReady.mp3');
            }
            this.playIdle2();
        }
        removeWeapon() {
            this.weaponNode.destroyChildren();
        }
        goToFight(enemyNode) {
            if (this.isPlayer) {
                if (this.hp == this.hpMax) {
                    this.hp = PlayerDataMgr.getPlayerPowerData().hp;
                    this.hpMax = this.hp;
                }
                this.atk = this.isOneKill ? 9999999 : PlayerDataMgr.getPlayerPowerData().atk;
            }
            else {
                if (this.hp == this.hpMax) {
                    this.hp = PlayerDataMgr.getNpcData().hp;
                    this.hpMax = this.hp;
                }
                this.atk = PlayerDataMgr.getNpcData().atk;
            }
            this.fightStarted = true;
            this.enemyNode = enemyNode;
            this.isBossState = PlayerDataMgr.getPlayerData().gradeIndex >= 3;
            this.playWalk();
        }
        onUpdate() {
            if (this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
                let myPos = this.myOwner.transform.position.clone();
                let disMin = 99999;
                let closeNode = null;
                for (let i = 0; i < this.enemyNode.numChildren; i++) {
                    let eNode = this.enemyNode.getChildAt(i);
                    if (!eNode || !eNode.transform)
                        continue;
                    let crl = eNode.getComponent(Player);
                    if (crl && crl.isDied)
                        continue;
                    let dis = Laya.Vector3.distance(myPos, eNode.transform.position.clone());
                    if (dis < disMin) {
                        disMin = dis;
                        closeNode = eNode;
                    }
                }
                if (this.closeNode && this.closeNode.transform && this.closeNode.getComponent(Player) && !(this.closeNode.getComponent(Player).isDied)) {
                    closeNode = this.closeNode;
                }
                else {
                    this.closeNode = null;
                    this.closeNode = closeNode;
                }
                if (!closeNode)
                    return;
                this.myOwner.transform.lookAt(closeNode.transform.position, new Laya.Vector3(0, 1, 0));
                this.myOwner.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
                let dir = Utility.getDirectionAToB(this.myOwner, closeNode);
                dir = new Laya.Vector3(dir.x * this.walkSpeed, dir.y * this.walkSpeed, dir.z * this.walkSpeed);
                let desPos = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(myPos, dir, desPos);
                if (this.isBossState && disMin < 6) {
                    return;
                }
                else if (!this.isBossState && disMin < 0.5) {
                    return;
                }
                this.myOwner.transform.position = desPos;
            }
        }
        onLateUpdate() {
            if (this.weaponNode && this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
                this.checkIsHitEnemy();
            }
        }
        checkIsHitEnemy() {
            let lineNode = this.weaponNode.getChildAt(0);
            if (!lineNode || lineNode == null || lineNode == undefined || this.isDied) {
                return;
            }
            for (let i = 0; i < lineNode.numChildren; i++) {
                let w = lineNode.getChildAt(i);
                let wPos = w.transform.position.clone();
                wPos.y = 0;
                for (let j = 0; j < this.enemyNode.numChildren; j++) {
                    let e = this.enemyNode.getChildAt(j);
                    let ePos = e.transform.position.clone();
                    ePos.y = 0;
                    let dis = Laya.Vector3.distance(wPos, ePos);
                    if (!this.isBossState && dis <= 1) {
                        if (!this.isAllDamage) {
                            let pCrl = e.getComponent(Player);
                            pCrl.hitBack(w, this.atk, this.myOwner);
                        }
                        else {
                            for (let k = 0; k < this.enemyNode.numChildren; k++) {
                                let en = this.enemyNode.getChildAt(k);
                                let ec = en.getComponent(Player);
                                if (ec)
                                    ec.hitBack(w, this.atk * 0.4, this.myOwner);
                            }
                        }
                        return;
                    }
                    else if (this.isBossState && dis <= 5) {
                        let pCrl = e.getComponent(Boss);
                        pCrl.hitBack(this.atk);
                        return;
                    }
                }
            }
        }
        hitBack(node, atk, from) {
            if (this.isDied || this.isHited) {
                return;
            }
            if (!this.isPlayer) {
                WxApi.DoVibrate();
            }
            let id = Utility.GetRandom(1, 4);
            SoundMgr.instance.playSoundEffect('weaponHit' + id + '.mp3');
            this.createHitFX();
            this.hp -= atk * (1 - this.decDamage);
            if (this.hp <= 0) {
                if (!this.isPlayer) {
                    GameUI.Share.createCry(this.myOwner);
                    GameUI.Share.createCoinBoom(this.myOwner);
                    GameLogic.Share.getCoinNum += 10;
                    SoundMgr.instance.playSoundEffect('getCoin.mp3');
                    if (from) {
                        let fCrl = from.getComponent(Player);
                        fCrl.hp = fCrl.hp + fCrl.hpMax * fCrl.healValue;
                        if (fCrl.hp > fCrl.hpMax)
                            fCrl.hp = fCrl.hpMax;
                    }
                }
                else {
                    GameUI.Share.createSmile(from);
                }
                let id = Utility.GetRandom(1, 2);
                SoundMgr.instance.playSoundEffect('die' + id + '.mp3');
                this.isDied = true;
                this.playDied();
                Laya.timer.once(1000, this, () => {
                    this.owner.destroy();
                });
                return;
            }
            this.isHited = true;
            let pA = node.transform.position.clone();
            let pB = this.myOwner.transform.position.clone();
            let dir = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(pB, pA, dir);
            Laya.Vector3.normalize(dir, dir);
            dir = new Laya.Vector3(dir.x * this.getHitbackDistance(from ? (from.getComponent(Player)) : null), 0, dir.z * this.getHitbackDistance(from ? (from.getComponent(Player)) : null));
            let myPos = this.myOwner.transform.position.clone();
            Laya.Vector3.add(myPos, dir, myPos);
            Utility.TmoveTo(this.myOwner, 200, myPos, () => { this.isHited = false; });
        }
        createHitFX() {
            let hit = Laya.loader.getRes(WxApi.UnityPath + 'hitFX.lh');
            let fx = Laya.Sprite3D.instantiate(hit, this.myOwner, true, new Laya.Vector3(0, 2, 0));
            fx.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            Laya.timer.once(1000, GameLogic.Share, () => {
                fx.destroy();
            });
        }
        changeSkin(id) {
            let mats = new Laya.UnlitMaterial();
            Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
                mats.albedoTexture = tex;
            }));
            for (let i = 1; i <= 4; i++) {
                let mesh3d = this.owner.getChildAt(i);
                mesh3d.skinnedMeshRenderer.material = mats;
            }
            this.embNode.destroyChildren();
            let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh');
            let emb = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
            emb.transform.localScale = this.embScale;
            emb.transform.localPosition = this.embPos;
            emb.transform.localRotation = this.embRotation;
        }
        addWeaponData(id) {
            switch (id) {
                case 0:
                    this.walkSpeed = this.walkSpeed * (1 + 0.1);
                    break;
                case 1:
                    this.weaponSpeed = this.weaponSpeed * (1 + 0.3);
                    break;
                case 2:
                    this.backDisTemp = 0.3;
                    break;
                case 3:
                    this.atk = this.atk * (1 + 0.3);
                    break;
                case 4:
                    this.walkSpeed = this.walkSpeed * (1 - 0.1);
                    this.isOneKill = true;
                    break;
                case 5:
                    this.healValue = 0.25;
                    break;
                case 6:
                    this.isAllDamage = true;
                    break;
                case 7:
                    this.decDamage = 0.3;
                    break;
                case 8:
                    this.weaponSpeed = this.weaponSpeed * (1 + 0.1);
                    Laya.timer.loop(1000, this, () => {
                        if (this.hp > 0) {
                            this.hp += this.hpMax * 0.02;
                            if (this.hp > this.hpMax)
                                this.hp = this.hpMax;
                        }
                    });
                    break;
            }
        }
    }

    class ShareMgr {
        constructor() {
            this.path = '';
            this.picCount = 3;
            this.preT = 0;
            this.shareTips = [
                '请分享到活跃的群！',
                '请分享到不同群！',
                '请分享给好友！',
                '请分享给20人以上的群！'
            ];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new ShareMgr();
            }
            return this._instance;
        }
        initShare() {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showShareMenu({
                    withShareTicket: true,
                });
                let dir = 'res/share/share.png';
                let content = '我画你杀，谁与争锋';
                Laya.Browser.window.wx.onShareAppMessage(function (res) {
                    return {
                        title: content,
                        imageUrl: dir,
                    };
                });
                Laya.Browser.window.wx.onShow((para) => {
                    SoundMgr.instance.playMusic('bgm.mp3');
                    if (WxApi.shareCallback) {
                        let t = new Date().getTime();
                        let diff = t - WxApi.shareTime;
                        if (diff / 1000 >= 3 && !WxApi.firstShare) {
                            WxApi.shareCallback();
                            WxApi.front_share_number--;
                            Laya.Browser.window.wx.showToast({
                                title: '分享成功',
                                icon: 'none',
                                duration: 2000
                            });
                            WxApi.shareCallback = null;
                        }
                        else {
                            WxApi.firstShare = false;
                            Laya.Browser.window.wx.showModal({
                                title: '提示',
                                content: this.shareTips[Math.floor(Math.random() * this.shareTips.length)],
                                confirmText: '重新分享',
                                success(res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定');
                                        ShareMgr.instance.shareGame(WxApi.shareCallback);
                                    }
                                    else if (res.cancel) {
                                        console.log('用户点击取消');
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        shareGame(cb) {
            if (WxApi.front_share_number <= 0) {
                AdMgr.instance.showVideo(cb);
                return;
            }
            WxApi.shareCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                cb();
                return;
            }
            WxApi.shareTime = new Date().getTime();
            let dir = 'res/share/share.png';
            let content = '我画你杀，谁与争锋';
            Laya.Browser.window.wx.shareAppMessage({
                title: content,
                imageUrl: dir
            });
        }
    }

    const LINE_GAP = 0.1;
    const PLAYER_GAP = 3;
    const GRADE_GAP = 30;
    class GameLogic {
        constructor() {
            this._playerNode = new Laya.Sprite3D();
            this._aiNode = new Laya.Sprite3D();
            this.circleEffect = new Laya.Sprite3D();
            this.camStartPos = new Laya.Vector3(0, 0, 0);
            this.canTouch = false;
            this.gameStarted = false;
            this.canReady = false;
            this.isHelpStart = false;
            this.pauseGame = false;
            this.gradeIndex = 0;
            this.tempPlayerCount = 0;
            this.getCoinNum = 0;
            AdMgr.instance.initAd();
            RecorderMgr.instance.initRecorder();
            Utility.loadJson('res/config/aiConfig.json', (data) => {
                PlayerDataMgr.aiConfig = data;
            });
            Utility.loadJson('res/config/posConfig.json', (data) => {
                PlayerDataMgr.posConfig = data;
            });
            PlayerDataMgr.getPlayerData();
            PrefabManager.instance();
            new TimeCountMgr();
            ShareMgr.instance.initShare();
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            this.gradeIndex = PlayerDataMgr.getPlayerData().gradeIndex;
            GameLogic.Share = this;
            WxApi.httpRequest('https://tthy.jiujiuhuyu.com/tt/weapon/config.json', 'version=' + WxApi.version, 'get', (res) => {
                res = JSON.parse(res);
                WxApi.configData = res.data.config;
                if (WxApi.configData.is_allow_area == 0) {
                    WxApi.configData.front_box_wudian_switch = false;
                    WxApi.configData.give_gold_switch = false;
                    WxApi.configData.GQQT_kg = false;
                    WxApi.configData.GQQT_GQKZ = 1;
                    WxApi.configData.GXQT_kg = 3;
                }
                console.log('加载后台配置完成:', res);
            });
            this.loadAtlas();
            WxApi.WxOnHide(() => {
                PlayerDataMgr.setExitTime();
                localStorage.setItem('lastDate', new Date().getDate().toString());
                localStorage.setItem('front_share_number', WxApi.front_share_number.toString());
            });
        }
        loadAtlas() {
            var resUrl = [
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
            };
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
        }
        initScene() {
            Laya.Scene3D.load(WxApi.UnityPath + 'MyScene.ls', Laya.Handler.create(this, this.onLoadScene));
        }
        onLoadScene(scene) {
            this._scene = Laya.stage.addChild(scene);
            Laya.stage.setChildIndex(this._scene, 0);
            this._scene.addChild(this._playerNode);
            this._scene.addChild(this._aiNode);
            this._camera = this._scene.getChildByName('Main Camera');
            this._light = this._scene.getChildByName('Directional Light');
            this._plane = this._scene.getChildByName('Plane');
            this.camStartPos = this._camera.transform.position.clone();
            this.fixCameraField();
            let circleRes = Laya.loader.getRes(WxApi.UnityPath + 'Circle_1.lh');
            this.circleEffect = Laya.Sprite3D.instantiate(circleRes, this._scene, true, new Laya.Vector3(0, 0.1, 0));
            this.circleEffect.active = false;
            Laya.timer.frameLoop(1, this, this.updateCircle);
        }
        fixCameraField() {
            let staticDT = 1624 - 1334;
            let curDT = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334;
            let per = curDT / staticDT * 10;
            this._camera.fieldOfView = 70 + per;
        }
        moveCamera(z, duration = 2000) {
            let cam = this._camera;
            let camPos = cam.transform.position.clone();
            camPos.z += z;
            Utility.TmoveTo(cam, duration, camPos, () => { });
        }
        createPlayer() {
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * PLAYER_GAP / 2;
            for (let i = 0; i < PlayerDataMgr.getPlayerCount() + this.tempPlayerCount; i++) {
                let player = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, true);
                player.transform.translate(new Laya.Vector3(sx, 0, GRADE_GAP * this.gradeIndex), false);
                sx -= PLAYER_GAP;
                GameUI.Share.createHpBar(player);
            }
        }
        pushPlayer() {
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = (PlayerDataMgr.getPlayerCount() - 1) * PLAYER_GAP / 2;
            for (let i = 0; i < PlayerDataMgr.getPlayerCount(); i++) {
                if (i + 1 <= this._playerNode.numChildren) {
                    sx -= PLAYER_GAP;
                    let crl = this._playerNode.getChildAt(i).getComponent(Player);
                    crl.hp = crl.hpMax;
                    continue;
                }
                let player = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, true);
                player.transform.translate(new Laya.Vector3(sx, 0, GRADE_GAP * this.gradeIndex), false);
                sx -= PLAYER_GAP;
                GameUI.Share.createHpBar(player);
            }
        }
        updateCircle() {
            if (!this._playerNode || this._playerNode.numChildren <= 0) {
                this.circleEffect.active = false;
                return;
            }
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let player = this._playerNode.getChildAt(i);
                let crl = player.getComponent(Player);
                if (!crl.haveWeapon) {
                    let pos = player.transform.position.clone();
                    let p = new Laya.Vector3(pos.x, 0.1, pos.z + 0.1);
                    this.circleEffect.transform.position = p;
                    this.circleEffect.active = true;
                    return;
                }
            }
            this.circleEffect.active = false;
        }
        createAi() {
            if (PlayerDataMgr.getPlayerData().gradeIndex >= 3) {
                this.createBoss();
                return;
            }
            let aiDataMaxGrade = 19;
            let data = null;
            let skinId = 0;
            let sort = [];
            let gidArr = [];
            let wpId = 0;
            if (PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade) {
                sort = PlayerDataMgr.posConfig.sort;
                skinId = Utility.GetRandom(0, 9);
                gidArr = Utility.getRandomItemInArr(sort);
                wpId = Utility.GetRandom(1, 7);
            }
            else {
                data = PlayerDataMgr.aiConfig['grade' + PlayerDataMgr.getPlayerData().grade];
                skinId = data.skinId;
                sort = data.sort;
                gidArr = sort[PlayerDataMgr.getPlayerData().gradeIndex];
            }
            this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (GRADE_GAP * this.gradeIndex));
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = PLAYER_GAP;
            for (let i = 0; i < gidArr.length; i++) {
                let player = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, false);
                pCrl.changeSkin(skinId);
                player.transform.localPosition.x = gidArr[i][0] * sx;
                player.transform.localPosition.y = 0;
                player.transform.localPosition.z = gidArr[i][1] * sx;
                player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
                GameUI.Share.createHpBar(player);
                let weaponId = PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade ? wpId : gidArr[i][2] + 1;
                let weaponRes = Laya.loader.getRes(WxApi.UnityPath + 'Arms_' + weaponId + '.lh');
                let weapon = Laya.Sprite3D.instantiate(weaponRes, null, true, new Laya.Vector3(0, 0, 0));
                pCrl.addWeapon(weapon);
            }
        }
        createBoss() {
            this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (GRADE_GAP * this.gradeIndex));
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_Boss.lh');
            let ani = playerRes.getComponent(Laya.Animator);
            ani.getControllerLayer().playOnWake = false;
            let player = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
            let pCrl = player.addComponent(Boss);
            player.transform.localPosition.x = 0;
            player.transform.localPosition.y = 0;
            player.transform.localPosition.z = 0;
            player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
        }
        createGodWeapon(id) {
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                if (!pCrl.haveWeapon) {
                    pCrl.addGodWeapon(id);
                    break;
                }
            }
            if (this.checkWeaponed()) {
                this.readyGo();
            }
        }
        createLine3D(lineArr) {
            let lineNode = new Laya.Sprite3D();
            let lineRes = Laya.loader.getRes(WxApi.UnityPath + 'line.lh');
            let bottomPos = new Laya.Vector3(0, 0, 0);
            for (let i = 0; i < lineArr.length; i++) {
                if (i == 0) {
                    let line = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                    line.transform.position = new Laya.Vector3(0, 0, 0);
                    bottomPos = line.transform.position.clone();
                }
                else {
                    let p1 = new Laya.Vector3(-lineArr[i - 1].x, 0, -lineArr[i - 1].y);
                    let p2 = new Laya.Vector3(-lineArr[i].x, 0, -lineArr[i].y);
                    let preL = lineNode.getChildAt(lineNode.numChildren - 1);
                    let prePos = preL.transform.position.clone();
                    let dis = Laya.Vector3.distance(p1, p2);
                    for (let j = 0; j < Math.floor(dis / 10); j++) {
                        let line = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                        let dir = new Laya.Vector3(0, 0, 0);
                        Laya.Vector3.subtract(p2, p1, dir);
                        Laya.Vector3.normalize(dir, dir);
                        let d = (LINE_GAP * (j + 1));
                        dir = new Laya.Vector3(dir.x * d, dir.y * d, dir.z * d);
                        let pos = new Laya.Vector3(0, 0, 0);
                        Laya.Vector3.add(prePos, dir, pos);
                        line.transform.position = pos;
                        if (line.transform.position.z < bottomPos.z) {
                            bottomPos = line.transform.position.clone();
                        }
                    }
                }
            }
            for (let i = 0; i < lineNode.numChildren; i++) {
                let node = lineNode.getChildAt(i);
                let p = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.subtract(node.transform.position, bottomPos, p);
                node.transform.position = p;
            }
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                if (!pCrl.haveWeapon) {
                    pCrl.addWeapon(lineNode);
                    break;
                }
            }
            if (this.checkWeaponed()) {
                this.readyGo();
            }
        }
        checkWeaponed() {
            let allWeapon = true;
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                if (!pCrl.haveWeapon) {
                    allWeapon = false;
                }
            }
            return allWeapon;
        }
        readyGo() {
            if (PlayerDataMgr.getFreeSkins().length > 0 &&
                !this.canReady &&
                PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
                PlayerDataMgr.getPlayerData().grade > 1) {
                RecorderMgr.instance.recordPause();
                Laya.Scene.open('MyScenes/FreeSkinUI.scene', false);
                return;
            }
            if (!WxApi.firstStartGame) {
                WxApi.firstStartGame = true;
                WxApi.aldEvent('进入游戏后首次点击开始游戏');
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !this.isHelpStart) {
                WxApi.aldEvent('开始游戏');
                WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：进入');
            }
            this.canTouch = false;
            GameUI.Share.visibleBottomUI(false);
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                pCrl.goToFight(this._aiNode);
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex < 3) {
                for (let i = 0; i < this._aiNode.numChildren; i++) {
                    let pCrl = this._aiNode.getChildAt(i).getComponent(Player);
                    pCrl.goToFight(this._playerNode);
                }
            }
            Laya.timer.clear(this, this.checkIsOver);
            Laya.timer.frameLoop(1, this, this.checkIsOver);
        }
        checkIsOver() {
            if (this._aiNode.numChildren <= 0) {
                if (this._playerNode.numChildren <= PlayerDataMgr.getPlayerCount()) {
                    this.tempPlayerCount = 0;
                }
                this.gradeIndex += 1;
                Laya.timer.clear(this, this.checkIsOver);
                if (this.gradeIndex >= 4) {
                    RecorderMgr.instance.recordStop();
                    this.tempPlayerCount = 0;
                    PlayerDataMgr.getPlayerData().grade += 1;
                    PlayerDataMgr.getPlayerData().gradeIndex = 0;
                    PlayerDataMgr.setPlayerData();
                    Laya.Scene.close('MyScenes/GameUI.scene');
                    let cb = () => {
                        if (PlayerDataMgr.getPlayerData().grade <= 1) {
                            Laya.Scene.open('MyScenes/FinishUI.scene', false);
                        }
                        else {
                            Laya.Scene.open('MyScenes/ShareVideoUI.scene', false);
                        }
                    };
                    if (WxApi.configData.GQQT_kg && Math.floor((PlayerDataMgr.getPlayerData().grade - 1 - WxApi.configData.GQQT_GQKZ) % 3) == 0 &&
                        PlayerDataMgr.getPlayerData().grade - 1 - WxApi.configData.GQQT_GQKZ >= 0) {
                        AdMgr.instance.closeVCB = cb;
                        AdMgr.instance.showVideo(() => { });
                    }
                    else {
                        cb();
                    }
                    return;
                }
                PlayerDataMgr.getPlayerData().gradeIndex = this.gradeIndex;
                PlayerDataMgr.setPlayerData();
                GameTopNode.Share.initData();
                Laya.timer.once(200, this, () => {
                    this.moveCamera(GRADE_GAP, 1800);
                });
                let sx = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * PLAYER_GAP / 2;
                for (let i = 0; i < this._playerNode.numChildren; i++) {
                    let player = this._playerNode.getChildAt(i);
                    let pCrl = player.getComponent(Player);
                    pCrl.fightStarted = false;
                    let desPos = new Laya.Vector3(sx - i * PLAYER_GAP, 0, GRADE_GAP * this.gradeIndex);
                    Utility.TmoveTo(player, 2000, desPos, () => {
                        pCrl.playIdle2();
                    });
                    Utility.RotateTo(player, 1000, new Laya.Vector3(0, 0, 0), () => { });
                }
                this.createAi();
                Laya.timer.once(2000, this, () => {
                    this.checkIsNeedCreatePlayer();
                });
            }
            if (this._playerNode.numChildren <= 0) {
                this.tempPlayerCount = 0;
                GameUI.Share.visibleGameOverNode(true);
            }
        }
        getIsOver() {
            if (this._playerNode.numChildren <= 0) {
                return true;
            }
            else {
                let isOver = true;
                for (let i = 0; i < this._playerNode.numChildren; i++) {
                    let p = this._playerNode.getChildAt(i);
                    let crl = p.getComponent(Player);
                    if (!crl.isDied) {
                        isOver = false;
                        break;
                    }
                }
                return isOver;
            }
        }
        checkIsNeedCreatePlayer() {
            if (this._playerNode.numChildren < PlayerDataMgr.getPlayerCount() && this.gradeIndex < 3) {
                AdMgr.instance.hideBanner();
                GameUI.Share.reviveBtnCB();
            }
            else {
                this.readyGo();
            }
        }
        revivePlayer() {
            this.canTouch = true;
            this.pushPlayer();
        }
        goAhead() {
            this.readyGo();
        }
        upgradePlayerCount() {
            this._playerNode.destroyChildren();
            this.createPlayer();
        }
        changePlayerSkin(freeId) {
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let player = this._playerNode.getChildAt(i);
                let crl = player.getComponent(Player);
                if (freeId)
                    crl.changeSkin(freeId);
                else
                    crl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            }
        }
        checkCanUpgrade() {
            let c = PlayerDataMgr.getPlayerData().coin;
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
                (c >= PlayerDataMgr.getUpgradePlayerCountLvCost() || c >= PlayerDataMgr.getUpgradePlayerPowerLvCost() || c >= PlayerDataMgr.getUpgradeOfflineLvCost())) {
                GameUI.Share.upgradeBtnCB();
            }
        }
        restartGame() {
            this.gameStarted = false;
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0) {
                this._camera.transform.position = this.camStartPos;
                if (!this.isHelpStart) {
                    this.getCoinNum = 0;
                    this.canReady = false;
                    if (PlayerDataMgr.freeSkinId != -1) {
                        PlayerDataMgr.freeSkinId = -1;
                    }
                }
            }
            this._aiNode.destroyChildren();
            this._playerNode.destroyChildren();
            this.createAi();
            this.createPlayer();
            GameUI.Share.visibleBottomUI(true);
            this.canTouch = true;
            GameTopNode.Share.initData();
            this.checkCanUpgrade();
        }
    }
    GameLogic.WEAPON_LENGTH_MAX = 100;
    GameLogic.WEAPON_LENGTH_MIN = 10;

    class BoxUI extends Laya.Scene {
        constructor() {
            super();
            this.backBtn = this['backBtn'];
            this.coinNum = this['coinNum'];
            this.skinIcon = this['skinIcon'];
            this.boxNode = this['boxNode'];
            this.keyNode = this['keyNode'];
            this.videoBtn = this['videoBtn'];
            this.keyNum = 3;
            this.clickCount = 0;
            this.skinId = -1;
            this.skinIndex = -1;
            this.gotBounes = false;
        }
        onOpened(param) {
            this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB);
            this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB);
            this.initKey();
            this.initCoin();
            this.getBoxSkinId();
            for (let i = 0; i < this.boxNode.numChildren; i++) {
                let item = this.boxNode.getChildAt(i);
                item.on(Laya.Event.CLICK, this, this.itemCB, [i]);
                let coinNode = item.getChildByName('coinNode');
                coinNode.visible = false;
            }
        }
        onClosed() {
        }
        getBoxSkinId() {
            let arr = PlayerDataMgr.getBoxSkins();
            if (arr.length <= 0) {
                this.skinId = -1;
                this.skinIcon.skin = 'mainUI/sy-jb.png';
                return;
            }
            this.skinIndex = Math.floor(Math.random() * arr.length);
            this.skinId = arr[this.skinIndex];
            if (this.skinId == -1) {
                this.skinIcon.skin = 'mainUI/sy-jb.png';
            }
            else {
                this.skinIcon.skin = PlayerDataMgr.getHeroSkinDir(this.skinId);
            }
        }
        initKey() {
            for (let i = 0; i < 3; i++) {
                let key = this.keyNode.getChildAt(i);
                key.skin = i < this.keyNum ? 'boxUI/bx-ys1.png' : 'boxUI/bx-ys2.png';
            }
        }
        initCoin() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
        }
        itemCB(id) {
            let item = this.boxNode.getChildAt(id);
            let box = item.getChildByName('box');
            let coinNode = item.getChildByName('coinNode');
            let coinNum = coinNode.getChildByName('coinNum');
            if (item.skin == 'boxUI/bx-di2.png' || this.keyNum <= 0)
                return;
            item.skin = 'boxUI/bx-di2.png';
            this.keyNum--;
            this.clickCount++;
            this.initKey();
            if (this.clickCount >= 9) {
                this.keyNode.visible = false;
                this.videoBtn.visible = false;
            }
            else if (this.keyNum <= 0) {
                this.keyNode.visible = false;
                this.videoBtn.visible = true;
            }
            let isSkin = false;
            let bounes = 5;
            let randNum = Math.random() * 100;
            if (randNum <= 20) {
            }
            else if (randNum <= 35) {
                bounes = 10;
            }
            else if (randNum <= 45) {
                bounes = 15;
            }
            else if (randNum <= 55) {
                bounes = 20;
            }
            else if (randNum <= 65) {
                bounes = 25;
            }
            else if (randNum <= 75) {
                bounes = 30;
            }
            else if (randNum <= 85) {
                bounes = 35;
            }
            else if (randNum <= 95) {
                bounes = 50;
            }
            else {
                if (this.skinId == -1 || this.gotBounes) {
                    isSkin = false;
                    bounes = 50;
                }
                else {
                    this.gotBounes = true;
                    isSkin = true;
                }
            }
            if (this.clickCount >= 9 && this.skinId != -1 && !this.gotBounes) {
                this.gotBounes = true;
                isSkin = true;
            }
            if (isSkin) {
                PlayerDataMgr.getPlayerSkin(PlayerDataMgr.skinArr3.indexOf(this.skinId) + 18, this.skinId);
                box.visible = true;
                box.skin = PlayerDataMgr.getHeroSkinDir(this.skinId);
                box.y = 65;
            }
            else {
                SoundMgr.instance.playSoundEffect('getCoin.mp3');
                PlayerDataMgr.changeCoin(bounes);
                this.initCoin();
                box.visible = false;
                coinNode.visible = true;
                coinNum.value = bounes.toString();
            }
        }
        videoBtnCB() {
            WxApi.aldEvent('增加三个钥匙：点击');
            let cb = () => {
                WxApi.aldEvent('增加三个钥匙：成功');
                this.keyNum = 3;
                this.videoBtn.visible = false;
                this.keyNode.visible = true;
                this.initKey();
            };
            AdMgr.instance.showVideo(cb);
        }
        backBtnCB() {
            Laya.Scene.open('MyScenes/GameUI.scene', true, () => { GameLogic.Share.restartGame(); });
        }
    }

    class FixAdShareIcon extends Laya.Script {
        constructor() {
            super();
            this.shareIconStr = '';
            this.videoIconStr = '';
            this.myOwner = null;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        onUpdate() {
            if (WxApi.front_share_number > 0) {
                this.myOwner.skin = this.shareIconStr;
            }
            else {
                this.myOwner.skin = this.videoIconStr;
            }
        }
    }

    class FixNodeY extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            let myOwner = this.owner;
            myOwner.y = myOwner.y * Laya.stage.displayHeight / 1334;
        }
    }

    class ClickBoxUI extends Laya.Scene {
        constructor() {
            super();
            this.box = this['box'];
            this.tips = this['tips'];
            this.tick = this['tick'];
            this.sureBtn = this['sureBtn'];
            this.bar = this['bar'];
            this.curProgress = 0;
            this.gotBox = false;
        }
        onOpened() {
            this.initData();
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        initData() {
            this.sureBtn.on(Laya.Event.CLICK, this, this.clickBoxBtnCB);
            this.tips.on(Laya.Event.CLICK, this, this.tickCB);
            Laya.timer.frameLoop(1, this, this.decProgress);
        }
        decProgress() {
            if (this.curProgress >= 1) {
                Laya.timer.clear(this, this.decProgress);
                this.bar.value = this.curProgress;
                return;
            }
            this.curProgress -= 0.005;
            if (this.curProgress < 0) {
                this.curProgress = 0;
            }
            this.bar.value = this.curProgress;
        }
        clickBoxBtnCB() {
            if (this.gotBox) {
                let cb = () => {
                    this.close();
                    Laya.Scene.open('MyScenes/GameUI.scene');
                    GameLogic.Share.restartGame();
                };
                if (this.tick.visible) {
                    AdMgr.instance.showVideo(cb);
                }
                else {
                    cb();
                }
            }
            else {
                this.curProgress += 0.1;
                if (this.curProgress >= 1) {
                    this.gotBox = true;
                    this.tips.visible = true;
                    this.tick.visible = true;
                    this.bar.visible = false;
                    this.box.skin = 'clickBoxUI/cj-bx2.png';
                    this.sureBtn.skin = 'clickBoxUI/cj-an.png';
                    this.sureBtn.getChildAt(0).visible = false;
                }
            }
        }
        tickCB() {
            this.tick.visible = !this.tick.visible;
        }
    }

    class ExtractUI extends Laya.Scene {
        constructor() {
            super();
            this.heroSkin = this['heroSkin'];
            this.shareBtn = this['shareBtn'];
            this.noBtn = this['noBtn'];
            this.skinId = -1;
        }
        onOpened() {
            this.shareBtn.on(Laya.Event.CLICK, this, this.shareBtnCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB);
            let sArr = PlayerDataMgr.getFreeSkins();
            this.skinId = Utility.getRandomItemInArr(sArr);
            this.heroSkin.skin = 'freeSkins/HeroD_' + (this.skinId + 1) + '.png';
            Utility.visibleDelay(this.noBtn, 2000);
        }
        onClosed() {
        }
        shareBtnCB() {
            let cb = () => {
                WxApi.ExtractUIGapGrade = 3;
                PlayerDataMgr.getPlayerSkin(PlayerDataMgr.getPlayerArrIndexByValue(this.skinId), this.skinId);
                GameLogic.Share.changePlayerSkin();
                this.noBtnCB();
            };
            RecorderMgr.instance.shareVideo(cb);
        }
        noBtnCB() {
            this.close();
        }
    }

    class FinishUI extends Laya.Scene {
        constructor() {
            super();
            this.coinPage = this['coinPage'];
            this.boxPage = this['boxPage'];
            this.videoCoinBtn = this['videoCoinBtn'];
            this.noCoinBtn = this['noCoinBtn'];
            this.tgBtn = this['tgBtn'];
            this.videoTG = this['videoTG'];
            this.openBoxBtn = this['openBoxBtn'];
            this.nextBtn = this['nextBtn'];
            this.navNode = this['navNode'];
            this.haveBox = false;
            this.randTGNum = 4;
            this.tgCount = 0;
            this.tempRandNum = 4;
            this.isChick = false;
            this.isSwitch = true;
        }
        onOpened(param) {
            this.getIsChick();
            WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：通关');
            this.initData();
            this.tempRandNum = Utility.GetRandom(1, 4);
            this.randTGNum = this.tempRandNum;
            this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum * 5 : GameLogic.Share.getCoinNum;
            AdMgr.instance.showBanner();
            this.changeCloseLabel();
            this.navNode.visible = !WxApi.getIsIos();
            this.initNavNode();
            if (localStorage.getItem('weaponGrade')) {
                localStorage.setItem('weaponGrade', (parseInt(localStorage.getItem('weaponGrade')) + 1).toString());
            }
        }
        onClosed() {
            WxApi.showFinishWudian--;
            AdMgr.instance.hideBanner();
        }
        initNavNode() {
            let arr = [];
            for (let i = 1; i <= 17; i++) {
                arr.push(i);
            }
            arr = Utility.shuffleArr(arr);
            for (let i = 0; i < this.navNode.numChildren; i++) {
                let item = this.navNode.getChildAt(i);
                item.skin = 'res/icons/icon (' + arr[i] + ').png';
                item.on(Laya.Event.CLICK, this, () => {
                    WxApi.showMoreGamesModal();
                });
            }
        }
        getIsChick() {
            if (PlayerDataMgr.getPlayerData().grade - 1 <= 2) {
                this.isChick = false;
            }
            else if (PlayerDataMgr.getPlayerData().grade - 1 == 3 || PlayerDataMgr.getPlayerData().grade - 1 == 4) {
                this.isChick = false;
            }
            else {
                this.isChick = Math.floor((PlayerDataMgr.getPlayerData().grade - 1) % 2) != 0;
            }
        }
        initData() {
            this.videoCoinBtn.on(Laya.Event.CLICK, this, this.videoCoinBtnCB);
            this.noCoinBtn.on(Laya.Event.CLICK, this, this.noCoinBtnCB);
            this.tgBtn.on(Laya.Event.CLICK, this, this.tgBtnCB);
            this.openBoxBtn.on(Laya.Event.CLICK, this, this.openBoxBtnCB);
            this.nextBtn.on(Laya.Event.CLICK, this, this.nextBtnCB);
            let grade = PlayerDataMgr.getPlayerData().grade - 1;
            let g = Math.floor(grade % 4) == 0 ? 4 : Math.floor(grade % 4);
            this.haveBox = g == 4;
            GameLogic.Share.isHelpStart = false;
            GameLogic.Share.gradeIndex = 0;
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            PlayerDataMgr.setPlayerData();
        }
        videoCoinBtnCB(ccb) {
            WxApi.ttEvent('Event_14');
            let cb = () => {
                WxApi.ttEvent('Event_15');
                PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum * 5);
                this.closeCoinPage();
            };
            if (ccb)
                AdMgr.instance.closeVCB = cb;
            AdMgr.instance.showVideo(cb);
        }
        noCoinBtnCB() {
            let isBounes = this.videoTG.selected;
            isBounes = this.isChick ? !isBounes : isBounes;
            if (isBounes && this.isSwitch) {
                WxApi.ttEvent('Event_14');
                let cb = () => {
                    WxApi.ttEvent('Event_15');
                    PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum * 5);
                    this.closeCoinPage();
                };
                AdMgr.instance.showVideo(cb);
            }
            else {
                PlayerDataMgr.changeCoin(GameLogic.Share.getCoinNum);
                this.closeCoinPage();
            }
        }
        tgBtnCB() {
            if (this.videoTG.selected) {
                this.tgCount++;
                if (this.tgCount > this.randTGNum) {
                    this.tgCount = 0;
                    this.randTGNum = this.tempRandNum;
                    this.videoTG.selected = false;
                    if (WxApi.configData.give_gold_switch == true && PlayerDataMgr.getPlayerData().grade - 1 >= WxApi.configData.GXQT_kg &&
                        (this.tempRandNum == 3 || this.tempRandNum == 4)) {
                        this.videoCoinBtnCB(true);
                        WxApi.showFinishWudian = 2;
                    }
                }
            }
            else {
                this.videoTG.selected = true;
            }
            this.changeCloseLabel();
        }
        changeCloseLabel() {
            if (!WxApi.configData.give_gold_switch || PlayerDataMgr.getPlayerData().grade - 1 < WxApi.configData.GXQT_kg) {
                this.isSwitch = false;
                this['coinNum'].value = GameLogic.Share.getCoinNum;
                this.noCoinBtn.skin = 'TTRes/dy-sm3.png';
                this.tgBtn.visible = false;
                return;
            }
            if (this.isChick) {
                this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum : GameLogic.Share.getCoinNum * 5;
                this.noCoinBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm3.png' : 'TTRes/dy-sm.png';
                this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz4.png' : 'TTRes/dy-wz2.png';
            }
            else {
                this['coinNum'].value = this.videoTG.selected ? GameLogic.Share.getCoinNum * 5 : GameLogic.Share.getCoinNum;
                this.noCoinBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm.png' : 'TTRes/dy-sm3.png';
                this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz2.png' : 'TTRes/dy-wz4.png';
            }
        }
        closeCoinPage() {
            if (this.haveBox) {
                this.coinPage.visible = false;
                this.boxPage.visible = true;
            }
            else {
                if (WxApi.configData.front_box_wudian_switch) {
                    Laya.Scene.open('MyScenes/ClickBoxUI.scene');
                }
                else {
                    Laya.Scene.open('MyScenes/GameUI.scene');
                    GameLogic.Share.restartGame();
                }
            }
        }
        openBoxBtnCB() {
            WxApi.ttEvent('Event_16');
            let cb = () => {
                WxApi.ttEvent('Event_17');
                Laya.Scene.open('MyScenes/BoxUI.scene');
            };
            AdMgr.instance.showVideo(cb);
        }
        nextBtnCB() {
            Laya.Scene.open('MyScenes/GameUI.scene');
            GameLogic.Share.restartGame();
        }
    }

    class FoundWeaponUI extends Laya.Scene {
        constructor() {
            super();
            this.tipsPic = this['tipsPic'];
            this.weaponPic = this['weaponPic'];
            this.weaponName = this['weaponName'];
            this.info = this['info'];
            this.sureBtn = this['sureBtn'];
        }
        onOpened(id) {
            this.sureBtn.on(Laya.Event.CLICK, this, this.sureBtnCB);
            this.weaponPic.skin = 'weaponRes/sq_wq' + (id + 1) + '.png';
            this.tipsPic.skin = 'weaponRes/sq_tx' + (id + 1) + '.png';
            this.weaponName.text = PlayerDataMgr.getWeaponDataById(id).name;
            this.info.text = PlayerDataMgr.getWeaponDataById(id).info;
        }
        onClosed() {
        }
        sureBtnCB() {
            this.close();
        }
    }

    class FreeSkinUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
            this.itemNode = this['itemNode'];
            this.randBtn = this['randBtn'];
            this.videoTG = this['videoTG'];
            this.tgBtn = this['tgBtn'];
            this.skinArr = [];
            this.randTGNum = 3;
            this.tgCount = 0;
            this.tempRandNum = 3;
            this.isChick = false;
            this.isSwitch = true;
        }
        onOpened(param) {
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            this.randBtn.on(Laya.Event.CLICK, this, this.randBtnCB);
            this.tgBtn.on(Laya.Event.CLICK, this, this.toggleCB);
            this.skinArr = PlayerDataMgr.getFreeSkins();
            this.tempRandNum = Utility.GetRandom(1, 3);
            this.randTGNum = this.tempRandNum;
            this.getIsChick();
            this.initData();
            AdMgr.instance.showBanner();
            this.changeCloseLabel();
        }
        onClosed() {
            RecorderMgr.instance.recordResume();
            AdMgr.instance.hideBanner();
        }
        getIsChick() {
            if (PlayerDataMgr.getPlayerData().grade <= 2) {
                this.isChick = false;
            }
            else if (PlayerDataMgr.getPlayerData().grade == 3 || PlayerDataMgr.getPlayerData().grade == 4) {
                this.isChick = true;
            }
            else {
                this.isChick = Math.floor(PlayerDataMgr.getPlayerData().grade % 2) == 0;
            }
        }
        initData() {
            let icon = this['icon'];
            icon.skin = 'freeSkins/HeroD_' + (this.skinArr[0] + 1) + '.png';
        }
        itemCB(id) {
            PlayerDataMgr.freeSkinId = id;
            GameLogic.Share.changePlayerSkin(id);
        }
        randBtnCB() {
            WxApi.ttEvent('Event_10');
            let cb = () => {
                WxApi.ttEvent('Event_11');
                let id = Utility.getRandomItemInArr(this.skinArr);
                this.itemCB(id);
                this.closeCB();
            };
            AdMgr.instance.showVideo(cb);
        }
        closeBtnCB() {
            let isBounes = this.videoTG.selected;
            isBounes = this.isChick ? !isBounes : isBounes;
            if (isBounes && this.isSwitch) {
                this.randBtnCB();
            }
            else {
                this.closeCB();
            }
        }
        closeCB() {
            Laya.Scene.close('MyScenes/FreeSkinUI.scene');
            GameLogic.Share.canReady = true;
            GameLogic.Share.readyGo();
        }
        toggleCB() {
            if (this.videoTG.selected) {
                this.tgCount++;
                if (this.tgCount > this.randTGNum) {
                    this.tgCount = 0;
                    this.randTGNum = this.tempRandNum;
                    this.videoTG.selected = false;
                }
            }
            else {
                this.videoTG.selected = true;
            }
            this.changeCloseLabel();
        }
        changeCloseLabel() {
            if (!WxApi.configData.give_gold_switch || PlayerDataMgr.getPlayerData().grade < WxApi.configData.GXQT_kg) {
                this.closeBtn.skin = 'TTRes/dy-sm2.png';
                this.tgBtn.visible = false;
                this.videoTG.visible = false;
                this.isSwitch = false;
                return;
            }
            if (this.isChick) {
                this.closeBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm2.png' : 'TTRes/dy-sm4.png';
                this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz4.png' : 'TTRes/dy-wz.png';
            }
            else {
                this.closeBtn.skin = this.videoTG.selected ? 'TTRes/dy-sm4.png' : 'TTRes/dy-sm2.png';
                this['tgTips'].skin = this.videoTG.selected ? 'TTRes/dy-wz.png' : 'TTRes/dy-wz4.png';
            }
        }
    }

    class LoadingUI extends Laya.Scene {
        constructor() {
            super();
            this.perNum = this['perNum'];
            this.bar = this['bar'];
        }
        onOpened(param) {
            WxApi.ttEvent('Event_1');
            SoundMgr.instance.initLoading(() => {
                this.loadRes();
            });
        }
        onClosed() {
        }
        loadRes() {
            var resUrl = [
                WxApi.UnityPath + 'line.lh',
                WxApi.UnityPath + 'Hero_1.lh',
                WxApi.UnityPath + 'Hero_Boss.lh',
                WxApi.UnityPath + 'Circle_1.lh',
                WxApi.UnityPath + 'hitFX.lh'
            ];
            for (let i = 0; i < 7; i++) {
                resUrl.push(WxApi.UnityPath + 'Arms_' + (i + 1) + '.lh');
            }
            for (let i = 0; i < 9; i++) {
                resUrl.push(WxApi.UnityPath + 'H_Arms_' + (i + 1) + '.lh');
            }
            for (let i = 0; i < 10; i++) {
                resUrl.push(WxApi.UnityPath + 'Hero' + (i + 1) + '_Emb.lh');
            }
            Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
        }
        onComplete() {
            console.log('加载完成');
            GameLogic.Share.initScene();
            Laya.timer.once(1000, this, () => {
                let cb = () => {
                    WxApi.ttEvent('Event_2');
                    GameLogic.Share.createPlayer();
                    GameLogic.Share.createAi();
                };
                Laya.Scene.open('MyScenes/GameUI.scene', true, cb);
            });
        }
        onProgress(value) {
            this.perNum.text = Math.floor(value * 100) + '%';
            this.bar.width = 560 * value;
        }
    }

    class OfflineUI extends Laya.Scene {
        constructor() {
            super();
            this.coinNum = this['coinNum'];
            this.noBtn = this['noBtn'];
            this.trippleBtn = this['trippleBtn'];
            this.toggleBtn = this['toggleBtn'];
            this.point = this['point'];
            this.exTimeMin = 0;
            this.bounesNum = 0;
            this.bounesNumTriple = 0;
            this.isTripple = true;
            this.updateCompleted = true;
        }
        onOpened(param) {
            this.toggleBtn.on(Laya.Event.CLICK, this, this.trippleBtnCB);
            this.trippleBtn.on(Laya.Event.CLICK, this, this.getBounesCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.getBounesCB);
            this.exTimeMin = param;
            this.bounesNum = PlayerDataMgr.getPlayerOffline(this.exTimeMin);
            this.bounesNumTriple = this.bounesNum * 3;
            this.initData();
            AdMgr.instance.showBanner();
        }
        onClosed() {
            AdMgr.instance.hideBanner();
        }
        initData() {
            this.coinNum.value = this.bounesNumTriple.toString();
            this.changePoint();
            this.changeBtn();
        }
        trippleBtnCB() {
            if (!this.updateCompleted)
                return;
            this.updateCompleted = false;
            this.isTripple = !this.isTripple;
            this.changePoint();
            this.changeBtn();
            Utility.updateNumber(this.bounesNum, 3, this.coinNum, false, this.isTripple, () => {
                this.updateCompleted = true;
            });
        }
        getBounesCB() {
            let cb = () => {
                if (this.isTripple)
                    WxApi.ttEvent('Event_19');
                PlayerDataMgr.changeCoin(this.isTripple ? this.bounesNumTriple : this.bounesNum);
                GameTopNode.Share.initData();
                this.close();
            };
            if (this.isTripple) {
                WxApi.aldEvent('离线收益三倍：点击');
                WxApi.ttEvent('Event_18');
                AdMgr.instance.showVideo(cb);
            }
            else {
                cb();
            }
        }
        changePoint() {
            this.point.skin = this.isTripple ? 'offlineUI/lx-yuan.png' : 'offlineUI/lx-yuan2.png';
        }
        changeBtn() {
            this.noBtn.visible = !this.isTripple;
            this.trippleBtn.visible = this.isTripple;
        }
    }

    class ShareVideoUI extends Laya.Scene {
        constructor() {
            super();
            this.shareBtn = this['shareBtn'];
            this.shareBtn1 = this['shareBtn1'];
            this.shareBtn2 = this['shareBtn2'];
            this.closeBtn = this['closeBtn'];
        }
        onOpened(param) {
            param && param();
            this.shareBtn2.on(Laya.Event.CLICK, this, this.shareBtnCB);
            this.shareBtn1.on(Laya.Event.CLICK, this, this.shareBtnCB);
            this.shareBtn.on(Laya.Event.CLICK, this, this.shareBtnCB);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            Utility.visibleDelay(this.shareBtn2, 1500);
            Utility.visibleDelay(this.closeBtn, 3000);
            AdMgr.instance.showBanner();
        }
        onClosed() {
            AdMgr.instance.hideBanner();
        }
        shareBtnCB() {
            WxApi.ttEvent('Event_12');
            let cb = () => {
                WxApi.ttEvent('Event_13');
                PlayerDataMgr.getPlayerData().power += 5;
                PlayerDataMgr.getPlayerData().coin += 200;
                PlayerDataMgr.setPlayerData();
                WxApi.OpenAlert('分享视频成功，获得奖励');
                this.closeBtnCB();
            };
            RecorderMgr.instance.shareVideo(cb);
        }
        closeBtnCB() {
            this.close();
            Laya.Scene.open('MyScenes/FinishUI.scene', false);
        }
    }

    class SkinUIPlayer extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.weaponNode = null;
            this.embNode = null;
            this.embScale = null;
            this.embPos = null;
            this.embRotation = null;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
            this.playIdle1();
            this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms');
            this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb');
            let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb');
            this.embScale = emb.transform.localScale.clone();
            this.embPos = emb.transform.localPosition.clone();
            this.embRotation = emb.transform.localRotation.clone();
            this.changeSkin(PlayerDataMgr.getPlayerData().playerId);
        }
        onDisable() {
        }
        playIdle1() {
            this._ani.crossFade("walk", 0.05);
            this._ani.crossFade("hit", 0.05, 1);
        }
        changeSkin(id) {
            let mats = new Laya.UnlitMaterial();
            Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
                mats.albedoTexture = tex;
            }));
            for (let i = 1; i <= 4; i++) {
                let mesh3d = this.owner.getChildAt(i);
                mesh3d.skinnedMeshRenderer.material = mats;
            }
            this.embNode.destroyChildren();
            let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh');
            let emb = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
            emb.transform.localScale = this.embScale;
            emb.transform.localPosition = this.embPos;
            emb.transform.localRotation = this.embRotation;
        }
    }

    class SkinUI extends Laya.Scene {
        constructor() {
            super();
            this.topBar = this['topBar'];
            this.backBtn = this['backBtn'];
            this.coinNum = this['coinNum'];
            this.typePic = this['typePic'];
            this.itemNode = this['itemNode'];
            this.leftBtn = this['leftBtn'];
            this.rightBtn = this['rightBtn'];
            this.pointNode = this['pointNode'];
            this.btn1 = this['btn1'];
            this.btn2 = this['btn2'];
            this.btn3 = this['btn3'];
            this.pageIndex = 0;
            this.scene3D = null;
            this.light = null;
            this.camera = null;
            this.role = null;
            this.roleCrl = null;
        }
        onOpened(param) {
            this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB);
            this.leftBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [true]);
            this.rightBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [false]);
            this.leftBtn.visible = false;
            this.btn1.on(Laya.Event.CLICK, this, this.btnCB1);
            this.btn2.on(Laya.Event.CLICK, this, this.btnCB2);
            this.updateCoinNum();
            this.initData();
            this.init3DScene();
        }
        onClosed() {
        }
        init3DScene() {
            this.scene3D = Laya.stage.addChild(new Laya.Scene3D());
            this.light = this.scene3D.addChild(new Laya.DirectionLight());
            this.light.color = new Laya.Vector3(1, 0.956, 0.839);
            this.light.transform.rotate(new Laya.Vector3(59.3, -55.16, 0), true, false);
            this.camera = this.scene3D.addChild(new Laya.Camera(0, 0.1, 100));
            this.camera.transform.translate(new Laya.Vector3(0, 2, 7));
            this.camera.transform.rotate(new Laya.Vector3(-10, 0, 0), true, false);
            this.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
            this.fixCameraField();
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            this.role = Laya.Sprite3D.instantiate(playerRes, this.scene3D, false, new Laya.Vector3(0, 0, 0));
            this.role.transform.position = new Laya.Vector3(0, 2.6, 0);
            this.role.transform.rotationEuler = new Laya.Vector3(0, 0, 0);
            this.role.transform.setWorldLossyScale(new Laya.Vector3(0.5, 0.5, 0.5));
            this.roleCrl = this.role.addComponent(SkinUIPlayer);
        }
        fixCameraField() {
            let staticDT = 1624 - 1334;
            let curDT = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334;
            let per = curDT / staticDT * 10;
            this.camera.fieldOfView += per;
        }
        initData() {
            this.typePic.skin = 'skinUI/pf-an' + (this.pageIndex + 1) + '.png';
            for (let i = 0; i < this.pointNode.numChildren; i++) {
                let p = this.pointNode.getChildAt(i);
                p.skin = i == this.pageIndex ? 'skinUI/pf-yuan2.png' : 'skinUI/pf-yuan1.png';
            }
            let coinNum = this.btn1.getChildAt(0);
            coinNum.text = PlayerDataMgr.getUnlockSkinCost().toString();
            this.btn1.visible = this.pageIndex == 0;
            this.btn2.visible = this.pageIndex == 1;
            this.btn3.visible = this.pageIndex == 2;
            this.initItem();
        }
        initItem() {
            for (let i = 0; i < this.itemNode.numChildren; i++) {
                let item = this.itemNode.getChildAt(i);
                let icon = item.getChildByName('icon');
                let tick = item.getChildByName('tick');
                item.off(Laya.Event.CLICK, this, this.itemCB);
                let index = i + this.pageIndex * 9;
                let isHave = PlayerDataMgr.getPlayerData().playerArr[index] >= 0;
                let skinArr = PlayerDataMgr.skinArr1;
                switch (this.pageIndex) {
                    case 0:
                        skinArr = PlayerDataMgr.skinArr1;
                        break;
                    case 1:
                        skinArr = PlayerDataMgr.skinArr2;
                        break;
                    case 2:
                        skinArr = PlayerDataMgr.skinArr3;
                        break;
                }
                if (i + 1 <= skinArr.length) {
                    icon.visible = isHave;
                    item.skin = isHave ? 'skinUI/pf-di2.png' : 'skinUI/pf-di.png';
                    if (isHave) {
                        icon.skin = 'heroSkins/Hero_' + (skinArr[i] + 1) + '.png';
                        item.on(Laya.Event.CLICK, this, this.itemCB, [index]);
                    }
                    tick.visible = isHave && PlayerDataMgr.getPlayerData().playerId == skinArr[i];
                }
                else {
                    tick.visible = false;
                    icon.visible = false;
                    item.skin = 'skinUI/pf-di.png';
                }
            }
        }
        itemCB(id) {
            PlayerDataMgr.getPlayerData().playerId = PlayerDataMgr.getPlayerData().playerArr[id];
            this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            GameLogic.Share.changePlayerSkin();
            this.initData();
        }
        updateCoinNum() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
            GameTopNode.Share.initData();
        }
        turnPageCB(isLeft) {
            if (isLeft) {
                this.pageIndex--;
            }
            else {
                this.pageIndex++;
            }
            this.leftBtn.visible = this.pageIndex > 0;
            this.rightBtn.visible = this.pageIndex < 2;
            this.initData();
        }
        btnCB1() {
            let skinArr = [].concat(PlayerDataMgr.getCoinSkins());
            if (skinArr.length <= 0) {
                WxApi.OpenAlert('敬请期待！');
                return;
            }
            WxApi.aldEvent('皮肤界面：金币解锁');
            let cost = PlayerDataMgr.getUnlockSkinCost();
            if (cost > PlayerDataMgr.getPlayerData().coin) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('皮肤界面：金币解锁成功');
            PlayerDataMgr.getPlayerData().unlockSkinCount++;
            PlayerDataMgr.changeCoin(-cost);
            this.updateCoinNum();
            let value = Utility.getRandomItemInArr(skinArr);
            let skinId = PlayerDataMgr.skinArr1.indexOf(value);
            PlayerDataMgr.getPlayerSkin(skinId, value);
            this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            GameLogic.Share.changePlayerSkin();
            this.initData();
        }
        btnCB2() {
            let skinArr = [].concat(PlayerDataMgr.getVideoSkins());
            console.log(skinArr);
            if (skinArr.length <= 0) {
                WxApi.OpenAlert('敬请期待！');
                return;
            }
            WxApi.aldEvent('皮肤界面：视频/分享解锁');
            let cb = () => {
                WxApi.aldEvent('皮肤界面：视频/分享解锁成功');
                let value = Utility.getRandomItemInArr(skinArr);
                let skinId = PlayerDataMgr.skinArr2.indexOf(value) + 9;
                PlayerDataMgr.getPlayerSkin(skinId, value);
                this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
                GameLogic.Share.changePlayerSkin();
                this.initData();
            };
            AdMgr.instance.showVideo(cb);
        }
        backBtnCB() {
            this.scene3D.destroy();
            this.close();
        }
    }

    class WeaponDicUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
            this.gotNum = this['gotNum'];
            this.weaponName = this['weaponName'];
            this.weaponPic = this['weaponPic'];
            this.tipsPic = this['tipsPic'];
            this.info = this['info'];
            this.leftBtn = this['leftBtn'];
            this.rightBtn = this['rightBtn'];
            this.pointNode = this['pointNode'];
            this.tipsBg = this['tipsBg'];
            this.findBtn = this['findBtn'];
            this.lightAni = this['lightAni'];
            this.curPage = 0;
        }
        onOpened() {
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            this.leftBtn.on(Laya.Event.CLICK, this, this.turnPageBtnCB, [true]);
            this.rightBtn.on(Laya.Event.CLICK, this, this.turnPageBtnCB, [false]);
            this.findBtn.on(Laya.Event.CLICK, this, this.findBtnCB);
            this.initWeaponData(this.curPage);
        }
        onClosed() {
        }
        turnPageBtnCB(isLeft) {
            if (isLeft) {
                this.curPage--;
            }
            else {
                this.curPage++;
            }
            this.initWeaponData(this.curPage);
        }
        initWeaponData(id) {
            this.weaponPic.skin = 'weaponRes/sq_wq' + (id + 1) + '.png';
            this.tipsPic.skin = 'weaponRes/sq_tx' + (id + 1) + '.png';
            this.weaponName.text = PlayerDataMgr.getWeaponDataById(id).name;
            this.info.text = PlayerDataMgr.getWeaponDataById(id).info;
            this.leftBtn.visible = this.curPage > 0;
            this.rightBtn.visible = this.curPage < 8;
            for (let i = 0; i < this.pointNode.numChildren; i++) {
                let p = this.pointNode.getChildAt(i);
                p.skin = 'weaponRes/sq_yd' + (i == id ? '2' : '1') + '.png';
            }
            if (!localStorage.getItem('weapon' + id)) {
                this.weaponName.text = '通关' + (id * 2 - parseInt(localStorage.getItem('weaponGrade'))) + '个关卡后解锁';
                this.weaponPic.skin = 'weaponRes/sq_wh.png';
                this.tipsBg.visible = false;
                this.info.visible = false;
                this.findBtn.visible = true;
                this.lightAni.y = 300;
                this.weaponPic.y = 300;
                this.weaponPic.scale(1, 1);
            }
            else {
                this.tipsBg.visible = true;
                this.info.visible = true;
                this.findBtn.visible = false;
                this.lightAni.y = 342;
                this.weaponPic.y = 342;
                this.weaponPic.scale(0.5, 0.5);
            }
            let count = 0;
            for (let i = 0; i < 9; i++) {
                if (localStorage.getItem('weapon' + i)) {
                    count++;
                }
            }
            this.gotNum.text = count.toString() + '/9';
        }
        findBtnCB() {
            let cb = () => {
                localStorage.setItem('weapon' + this.curPage, '1');
                GameUI.Share.refreshArr.push(this.curPage);
                GameUI.Share.refreshWeaponTips();
                this.initWeaponData(this.curPage);
            };
            AdMgr.instance.showVideo(cb);
        }
        closeBtnCB() {
            this.close();
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("View/BoxUI.ts", BoxUI);
            reg("Libs/FixAdShareIcon.ts", FixAdShareIcon);
            reg("Libs/FixNodeY.ts", FixNodeY);
            reg("View/ClickBoxUI.ts", ClickBoxUI);
            reg("View/ExtractUI.ts", ExtractUI);
            reg("View/FinishUI.ts", FinishUI);
            reg("View/FoundWeaponUI.ts", FoundWeaponUI);
            reg("View/FreeSkinUI.ts", FreeSkinUI);
            reg("View/GameUI.ts", GameUI);
            reg("View/GameTopNode.ts", GameTopNode);
            reg("View/LoadingUI.ts", LoadingUI);
            reg("View/OfflineUI.ts", OfflineUI);
            reg("View/ShareVideoUI.ts", ShareVideoUI);
            reg("View/SkinUI.ts", SkinUI);
            reg("View/WeaponDicUI.ts", WeaponDicUI);
            reg("Crl/FixAiTips.ts", FixAiTips);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "MyScenes/LoadingUI.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            new GameLogic();
        }
    }
    new Main();

}());
