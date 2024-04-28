/*---------------------------------------------------------------------------*
 * 2019/03/13 kido0617
 * http://kido0617.github.io/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc 表情選択を簡単にする
 * @author kido0617（改変：しもや）
 * @help
 * ・プラグインコマンド
 *   FaceId charactorid faceid
 */



(function(){
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'FaceId') {
      if(args[0] == "アマネ"){args[0] = 1}
      if(args[0] == "メモリア"){args[0] = 2}
      if(args[0] == "ハヅキ"){args[0] = 2}
      if(args[1] == "微笑"){args[1] = 1}
      if(args[1] == "無表情"){args[1] = 2}
      var charaid = args[0];
      var facenum = args[1];
      if(charaid >= 2){$gameVariables._data[780] = facenum
        $gameSwitches._data[119] = true};
      if(charaid <= 1){$gameVariables._data[895] = facenum};
            
    }
  };
})();