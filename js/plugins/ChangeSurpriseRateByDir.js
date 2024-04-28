//=============================================================================
// ChangeSurpriseRateByDir.js (Individual Specified Plugin)
//=============================================================================
/*:
 * @plugindesc On Symbol Encount System, change surprise rate according to direction.
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [Summary]
 * This plugin is the order-made.
 * see https://forum.tkool.jp/index.php?threads/1300/
 * (Japanese page)
 *
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc シンボルエンカウントで、イベントの向きによって先制や不意打ち率を変更します。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■概要
 * このプラグインは、下記の要望によって作られたオーダーメイドのプラグインです。
 * https://forum.tkool.jp/index.php?threads/1300/
 *
 * 具体的には以下の機能を実装しています。
 * ・「シンボルに背後から接触された場合」に100％の確率で不意打ち
 * ・「シンボルに背後から接触した場合」は100％の確率で先制攻撃
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // judge the position and direction of troop event and player
  //
  Game_Character.prototype._isEventAdjacent = function (direction, eventId) {
    var x = $gameMap.roundXWithDirection(this.x, direction);
    var y = $gameMap.roundYWithDirection(this.y, direction);
    return $gameMap.eventsXyNt(x, y).some(function (e) {
      return e.eventId() === eventId && e.direction() === this.direction();
    }, this);
  };

  Game_Character.prototype._isEventThere = function (eventId) {
    return this._isEventAdjacent(this.direction(), eventId);
  };

  Game_Character.prototype._isEventBehind = function (eventId) {
    return this._isEventAdjacent(10 - this.direction(), eventId);
  };

  //
  // change the rate of preemptive and surprise
  //
  var nowBattleHasBegun = function () {
    return BattleManager._phase === 'init';
  };

  var _Game_Interpreter_command301 = Game_Interpreter.prototype.command301;
  Game_Interpreter.prototype.command301 = function() {
    var wasInBattle = $gameParty.inBattle();
    _Game_Interpreter_command301.call(this);
    var symbolEventId = this._eventId;
    if (!wasInBattle && nowBattleHasBegun() && $gameTroop.troop()) {
      if ($gamePlayer._isEventThere(symbolEventId)) {
        BattleManager._preemptive = true;
        BattleManager._surprise = false;
      } else if ($gamePlayer._isEventBehind(symbolEventId)) {
        BattleManager._preemptive = false;
        BattleManager._surprise = true;
      }
    }
    return true;
  };

})();
