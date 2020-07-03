import WxApi from "../Libs/WxApi"

export default class RecorderMgr {
    private static _instance: RecorderMgr
    public static get instance(): RecorderMgr {
        if (!this._instance) {
            this._instance = new RecorderMgr()
        }
        return this._instance
    }

    isRecording: boolean = false
    recorder: any = null
    videoPath: string = ''

    initRecorder() {
        if (Laya.Browser.onWeiXin) {
            this.recorder = window['tt'].getGameRecorderManager();
            this.onStopListener()
            this.onInterrupBegin()
            this.onInterrupEnd()
        }
    }

    //开始录屏
    recordStart() {
        if (!Laya.Browser.onWeiXin) return
        console.log('录屏开始');
        this.recorder.start({
            duration: 300,
        })
        this.isRecording = true;
    }
    //暂停录屏
    recordPause() {
        if (!Laya.Browser.onWeiXin) return
        console.log('录屏暂停');
        this.recorder.pause();
    }
    //继续录屏
    recordResume() {
        if (!Laya.Browser.onWeiXin) return
        console.log('录屏继续');
        this.recorder.resume();
    }

    //停止录屏
    recordStop() {
        if (!Laya.Browser.onWeiXin) return
        if (!this.isRecording) {
            return;
        }
        console.log('录屏停止');
        this.recorder.stop();
    }

    //监听录屏结束
    onStopListener() {
        this.recorder.onStop(res => {
            console.log('录屏结束：', res.videoPath);
            this.videoPath = res.videoPath
            this.isRecording = false
        })
    }

    //分享视频
    shareVideo(cb?: Function) {
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
                cb && cb()
            },
            fail: (e) => {
                console.log("分享失败");
                WxApi.OpenAlert('分享失败！');
            }
        });
        // window['tt'].shareVideo({
        //     videoPath: this.videoPath,
        //     extra: {
        //         createChallenge: true
        //     },
        //     success: () => {
        //         console.log('分享成功！')
        //         cb && cb()
        //     },
        //     fail: (e) => {
        //         console.log('分享失败！')
        //         WxApi.OpenAlert('分享失败！');
        //     }
        // });
    }

    //监听中断开始
    onInterrupBegin() {
        this.recorder.onInterruptionBegin(() => {
            console.log('录屏被打断开始');
            this.recordPause();
        });
    }
    //监听中断结束
    onInterrupEnd() {
        this.recorder.onInterruptionEnd(() => {
            console.log('录屏被打断结束');
            this.recordResume();
        });
    }

}