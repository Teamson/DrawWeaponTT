/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import BoxUI from "./View/BoxUI"
import FixAdShareIcon from "./Libs/FixAdShareIcon"
import FixNodeY from "./Libs/FixNodeY"
import ClickBoxUI from "./View/ClickBoxUI"
import ExtractUI from "./View/ExtractUI"
import FinishUI from "./View/FinishUI"
import FreeSkinUI from "./View/FreeSkinUI"
import GameUI from "./View/GameUI"
import GameTopNode from "./View/GameTopNode"
import LoadingUI from "./View/LoadingUI"
import OfflineUI from "./View/OfflineUI"
import ShareVideoUI from "./View/ShareVideoUI"
import SkinUI from "./View/SkinUI"
import FixAiTips from "./Crl/FixAiTips"
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=750;
    static height:number=1334;
    static scaleMode:string="fixedwidth";
    static screenMode:string="vertical";
    static alignV:string="middle";
    static alignH:string="center";
    static startScene:any="MyScenes/LoadingUI.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=false;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
        reg("View/BoxUI.ts",BoxUI);
        reg("Libs/FixAdShareIcon.ts",FixAdShareIcon);
        reg("Libs/FixNodeY.ts",FixNodeY);
        reg("View/ClickBoxUI.ts",ClickBoxUI);
        reg("View/ExtractUI.ts",ExtractUI);
        reg("View/FinishUI.ts",FinishUI);
        reg("View/FreeSkinUI.ts",FreeSkinUI);
        reg("View/GameUI.ts",GameUI);
        reg("View/GameTopNode.ts",GameTopNode);
        reg("View/LoadingUI.ts",LoadingUI);
        reg("View/OfflineUI.ts",OfflineUI);
        reg("View/ShareVideoUI.ts",ShareVideoUI);
        reg("View/SkinUI.ts",SkinUI);
        reg("Crl/FixAiTips.ts",FixAiTips);
    }
}
GameConfig.init();