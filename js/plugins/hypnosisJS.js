var $CM_value = null;
//QTE需求变量
var $CM_speed = null;
var $CM_speedLevel = 1;
var $CM_pointX = null;
var $CM_pendulum = null;
var $CM_pendulum_num = null;
//真白线变量
var $CM_runiu = 1;

(function () {
    function CM_Game_Variables() {
        this.initialize.apply(this, arguments);
    }
    CM_Game_Variables.prototype.initialize = function () {
        this._data = new Map();
        this.clear();
    };

    CM_Game_Variables.prototype.clear = function () {
        this._data.clear();
    };

    // 获取变量的值
    CM_Game_Variables.prototype.get = function (variableId) {
        return this._data.get(variableId) || 0;
    };

    // 设置变量的值
    CM_Game_Variables.prototype.set = function (variableId, value) {
        this._data.set(variableId, value);
        $gameMap.requestRefresh();
    };

    // 自增变量的方法
    CM_Game_Variables.prototype.add = function (variableId, value) {
    if (this._data.get(variableId) == null || this._data.get(variableId) == 0) {
        this._data.set(variableId, value);
    } else {
        this._data.set(variableId, this._data.get(variableId) + value);
    }
    $gameMap.requestRefresh();
};

// 在创建游戏对象时初始化自定义变量
const CM_DataManagerCreateGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function () {
    CM_DataManagerCreateGameObjects.call(this);
    $CM_value = new CM_Game_Variables();
};

// 在保存游戏数据时，将自定义变量添加到保存内容中
const CM_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function () {
    var contents = CM_makeSaveContents.call(this);
    contents.CM_speedLevel = $CM_speedLevel;
    contents.CM_runiu = $CM_runiu;
    contents.cmSaveCustomValue = JSON.stringify([...$CM_value._data]);
    return contents;
};

// 在加载游戏数据时，从保存内容中提取自定义变量数据
const CM_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function (contents) {
    CM_extractSaveContents.call(this, contents);
    $CM_speedLevel = contents.CM_speedLevel;
    $CM_runiu = contents.CM_runiu;
    if (contents.cmSaveCustomValue) {
        $CM_value._data = new Map(JSON.parse(contents.cmSaveCustomValue));
    }
};

const window_base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function (text) {
    text = window_base_convertEscapeCharacters.call(this, text);
    text = text.replace(/\x1bCM\[(.*?)\]/gi, function () {
        var numericValue = parseInt(arguments[1]);
        return isNaN(numericValue) ? $CM_value.get(arguments[1].toString()) : $CM_value.get(numericValue);
    }.bind(this));
    return text;
};
}) ();