import PlayerDataMgr from "./PlayerDataMgr"
import AdMgr from "../Mod/AdMgr"

export default class WxApi {
    public static UnityPath: string = 'LayaScene_MyScene/Conventional/'

    public static version: string = '1.0.8'
    public static isVibrate: boolean = true
    public static isMusic: boolean = true
    public static OnShowFun: Function = null
    public static scopeBtn: any = null
    public static shareCallback: Function = null
    public static front_share_number: number = 0

    public static gotOfflineBounes: boolean = false
    public static configData: any = null

    public static shareTime: number = 0
    public static firstShare: boolean = true

    public static launchGameUI: boolean = false

    public static firstStartGame: boolean = false

    public static showFinishWudian: number = 0

    public static ExtractUIGapGrade: number = 0

    //微信登录
    public static LoginWx(cb: Function) {
        if (!Laya.Browser.onWeiXin) return
        let launchData = Laya.Browser.window.wx.getLaunchOptionsSync();
        Laya.Browser.window.wx.login({
            success(res) {
                if (res.code) {
                    console.log('res.code:', res.code);
                    if (cb) {
                        cb(res.code, launchData.query)
                    }
                }
            }
        })
    }

    //检查授权
    public static checkScope(btnNode: any) {
        if (Laya.Browser.onWeiXin) {
            //检查是否授权
            Laya.Browser.window.wx.getSetting({
                success: (response) => {
                    if (!response.authSetting['scope.userInfo']) {
                        //没有授权
                        console.log('没有授权');
                        this.createScope(btnNode);
                    } else {
                        //已经授权
                        console.log('已经授权');
                    }
                }
            })
        }
    }
    //创建授权按钮
    public static createScope(btnNode: any) {
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
        })
        this.scopeBtn.onTap((res) => {
            if (res.errMsg == "getUserInfo:ok") {
                this.scopeBtn.destroy();
                this.scopeBtn = null
            } else if (res.errMsg == 'getUserInfo:fail auth deny') {
                this.scopeBtn.destroy();
                this.scopeBtn = null
            }
        })
    }

    //监听启动
    //Usually get fun(obj) obj.query
    public static GetLaunchParam(fun: Function) {
        if (Laya.Browser.onWeiXin) {
            this.OnShowFun = fun
            fun(this.GetLaunchPassVar())
            Laya.Browser.window.wx.onShow((para) => {
                //check onshow Fun
                if (this.OnShowFun != null) {
                    this.OnShowFun(para)
                }
                console.log("wx on show")
            })
        }
    }
    public static GetLaunchPassVar(): any {
        if (Laya.Browser.onWeiXin) {
            return Laya.Browser.window.wx.getLaunchOptionsSync()
        } else {
            return null
        }
    }

    public static WxOnHide(fun: Function) {
        if (Laya.Browser.onWeiXin) {
            Laya.Browser.window.wx.onHide(fun)
        }
    }

    //网络请求
    public static httpRequest(url: string, params: any, type: string = 'get', completeHandler?: Function) {
        var xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.http.timeout = 5000;//设置超时时间；
        xhr.once(Laya.Event.COMPLETE, this, completeHandler);
        xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
        if (type == "get") {
            xhr.send(url + '?' + params, "", type, "text");
        } else if (type == "post") {
            xhr.send(url, JSON.stringify(params), type, "text");
        }

    }

    //震动
    public static DoVibrate(isShort: boolean = true) {
        if (Laya.Browser.onWeiXin && this.isVibrate) {
            if (isShort) {
                Laya.Browser.window.wx.vibrateShort()
            } else {
                Laya.Browser.window.wx.vibrateLong()
            }
        }
    }

    //系统提示
    public static OpenAlert(msg: string, dur: number = 2000, icon: boolean = false) {
        if (Laya.Browser.onWeiXin) {
            Laya.Browser.window.wx.showToast({
                title: msg,//提示文字
                duration: dur,//显示时长
                mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
                icon: icon ? 'success' : 'none', //图标，支持"success"、"loading"  
            })
        }
    }

    //跳转
    public static NavigateApp(appid: string, path: string, title: string, cancelCB: Function, successCB: Function) {
        if (Laya.Browser.onWeiXin) {
            let self = this
            Laya.Browser.window.wx.navigateToMiniProgram({
                appId: appid,
                path: path,
                success(res) {
                    // 打开成功
                    console.log('打开成功')
                    successCB()
                },
                fail(res) {
                    // 打开失败
                    console.log('打开失败')
                    cancelCB()
                }
            })
        }
    }

    //预览图片
    public static preViewImage(url) {
        if (Laya.Browser.onWeiXin) {
            Laya.Browser.window.wx.previewImage({
                current: url, // 当前显示图片的http链接
                urls: [url] // 需要预览的图片http链接列表
            })
        }
    }

    //阿拉丁统计事件
    public static aldEvent(str: string) {
        return
        if (Laya.Browser.onWeiXin)
            Laya.Browser.window.wx.aldSendEvent(str)
    }

    //头条统计事件
    public static ttEvent(key: string) {
        if (Laya.Browser.onWeiXin)
            Laya.Browser.window.tt.reportAnalytics(key, {});
    }

    public static createMoreGamesButton(px, py, width, height) {
        let pixelW = Laya.Browser.clientWidth / Laya.stage.displayWidth
        let pixelH = Laya.Browser.clientHeight / Laya.stage.displayHeight

        px *= pixelW
        py *= pixelH
        width *= pixelW
        height *= pixelH

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

    public static showMoreGamesModal() {
        if (Laya.Browser.onWeiXin) {
            const systemInfo = Laya.Browser.window.tt.getSystemInfoSync();
            // iOS 不支持，建议先检测再使用
            if (systemInfo.platform !== "ios") {
                // 打开互跳弹窗
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

    public static getIsIos() {
        if (!Laya.Browser.onWeiXin) {
            return false
        }

        const systemInfo = Laya.Browser.window.tt.getSystemInfoSync();
        return systemInfo.platform === "ios"
    }
}