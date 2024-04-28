//=============================================================================
// SAN_ExtendedEventPage.js
//=============================================================================
// Copyright (c) 2016-2018 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================
// GitHub  https://github.com/rev2nym
// Twitter https://twitter.com/rev2nym
//=============================================================================

/*:
 * @plugindesc 拡張イベントページ制御 ver1.1.0
 * 任意のイベントページの出現条件と出現時処理を設定します。
 * @author Sanshiro https://twitter.com/rev2nym
 * @help
 * ■概要
 * イベントページの制御を拡張します。
 * イベントコマンド「注釈」によって
 * 任意のイベントページの出現条件と出現時処理を設定します。
 * 
 * ■書式
 * イベントページの先頭にイベントコマンド「注釈」を以下の書式で記述します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "trigger":"「出現条件のスクリプト」",
 *   "handler":"「出現時処理のスクリプト」"
 * }>
 * 
 * "trigger"要素と"handler"要素はいずれも省略可能です。
 * ただしカンマの有無に注意してください。
 * また記号", <, >は使用できません。
 * 
 * ■出現条件の拡張
 * 前述の書式に従って条件式のスクリプト記述してください。
 * 例えば次の記述は出現条件「変数1が5のとき」を表します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "trigger":"$gameVariables.value(1) === 5"
 * }>
 * 
 * なお"trigger"要素が設定されている場合
 * 通常のイベントページの出現条件は無視されます。
 * 
 * ■出現時処理の設定
 * 前述の書式に従って出現時処理のスクリプト記述してください。
 * 例えば次の記述で「このイベントを左90度回転」を表します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "handler":"this.turnLeft90()"
 * }>
 * 
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_ExtendedEventPage = true;

var Sanshiro = Sanshiro || {};
Sanshiro.ExtendedEventPage = Sanshiro.ExtendedEventPage || {};
Sanshiro.ExtendedEventPage.version = '1.1.0';

(function() {
'use strict';

//-----------------------------------------------------------------------------
// Game_Event
//
// イベント

// メンバ変数の初期化
var _Game_Event_initMembers =
    Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
    this._exTriggres = []; // 拡張イベントページ出現条件
    this._exHandlers = []; // 拡張イベントページ出現時処理
};

// リフレッシュ
var _Game_Event_refresh =
    Game_Event.prototype.refresh;
Game_Event.prototype.refresh = function() {
    this.setupExtendedEventPage();
    _Game_Event_refresh.call(this);
};

// 拡張イベントページのセットアップ
Game_Event.prototype.setupExtendedEventPage = function() {
    this.event().pages.forEach(
        function(page, pageIndex) {
            var parameters = this.extractExtendedEventPageParameters(page);
            if (!parameters) {
                return;
            }
            if (!!parameters.trigger) {
                var trigger = new Function('return ' + parameters.trigger);
                this._exTriggres[pageIndex] = trigger;
            }
            if (!!parameters.handler) {
                var handler = new Function('return ' + parameters.handler);
                this._exHandlers[pageIndex] = handler;
            }
        }, this
    );
};

// 拡張イベントページパラメータの抽出
Game_Event.prototype.extractExtendedEventPageParameters = function(page) {
    var comment = this.extractPageHeaderComment(page);
    if (!comment) {
        return null;
    }
    var data = this.extractPageMetadata(comment);
    if (!data || !data.meta.SAN_ExtendedEventPage) {
        return null;
    }
    var json = data.meta.SAN_ExtendedEventPage;
    var parameters = JSON.parse(json);
    return parameters;
};

// ページ先頭コメントの抽出
Game_Event.prototype.extractPageHeaderComment = function(page) {
    var comment = "";
    var commandIndex = 0;
    while (this.isCommentCommand(page.list[commandIndex])) {
        comment += page.list[commandIndex].parameters[0];
        commandIndex++;
    }
    return comment;
};

// コメントコマンド判定
Game_Event.prototype.isCommentCommand = function(command) {
    return !!command && (
        command.code === 108 ||
        command.code === 408
    );
};

// メタデータの抽出
Game_Event.prototype.extractPageMetadata = function(note) {
    var data = {
        note: note,
        meta: undefined
    };
    DataManager.extractMetadata(data);
    return data;
};

// ページ出現条件合致判定
var _Game_Event_meetsConditions =
    Game_Event.prototype.meetsConditions;
Game_Event.prototype.meetsConditions = function(page) {
    var pageIndex = this.event().pages.indexOf(page);
    var trigger = this._exTriggres[pageIndex];
    if (!!trigger) {
        return trigger.call(this);
    } else {
        return _Game_Event_meetsConditions.call(this, page);
    }
};

// イベントページ設定のセットアップ
var _Game_Event_setupPageSettings =
    Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);
    var handler = this._exHandlers[this._pageIndex];
    if (!!handler) {
        handler.call(this);
    }
};

})();
