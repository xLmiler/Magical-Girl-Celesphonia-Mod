//=============================================================================
// AnotherCurrencyShop.js
//-----------------------------------------------------------------------------
// Version
// 1.0.0 プラグイン公開
// 1.0.1 パラメーターのバグを修正＆購入ウィンドウコマンド項目名を指定可能とする
//=============================================================================
/*:ja
 * @plugindesc ゴールドではなく、変数の値で売買を行うショップを表示します
 * @author rinne_grid
 *
 * @param Currency Name
 * @desc 通貨の名称です。（ＭＰ、ＰＴ等を指定します）
 * @default ＰＴ
 *
 * @param Variable Number
 * @desc 通貨として利用する変数の値です。(デフォルトでは1番目の変数が指定されます)
 * @default 1
 *
 * @param Buy Command Name
 * @desc アイテムを購入する際に表示するコマンド文字列です。必要に応じて「交換する」等を指定します
 * @default 購入する
 *
 * @param Sell Command Name
 * @desc アイテムを売却する際に表示するコマンド文字列です。
 * @default 売却する
 *
 * @help
 *
 * プラグインコマンド
 *    AnotherCurrencyShop on    # ゴールドを使わないショップを有効にします
 *    AnotherCurrencyShop off   # ゴールドを使わないショップを無効にします
 */

(function(){

    var parameters = PluginManager.parameters('AnotherCurrencyShop');
    var currencyName = String(parameters['Currency Name'] || 'ＰＴ');
    var variableNumber = String(parameters['Variable Number'] || '1');
    var buyCommandName = String(parameters['Buy Command Name'] || '購入する');
    var sellCommandName = String(parameters['Sell Command Name'] || '売却する');

    //-------------------------------------------------------------------------
    // 関数退避
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;

    var _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
    var _Scene_Shop_doSell = Scene_Shop.prototype.doSell;
    var _Window_Gold_value = Window_Gold.prototype.value;
    var _Window_Gold_currencyUnit = Window_Gold.prototype.currencyUnit;
    var _Window_ShopCommand_makeCommandList = Window_ShopCommand.prototype.makeCommandList;


    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if(command === 'AnotherCurrencyShop') {
            switch(args[0]) {
            case 'on':
                $gameSystem.rngd_hook_on_AnotherCurrencyShop();
                break;
            case 'off':
                $gameSystem.rngd_hook_off_AnotherCurrecyShop();
                break;
            }
        }
    };

    //-------------------------------------------------------------------------
    // ゴールド以外のショップON
    //-------------------------------------------------------------------------
    Game_System.prototype.rngd_hook_on_AnotherCurrencyShop = function() {
        Scene_Shop.prototype.doBuy = function(number) {
            var _current = $gameVariables.value(variableNumber);
            _current -= number * this.buyingPrice();
            $gameVariables.setValue(variableNumber, _current);
            $gameParty.gainItem(this._item, number);
        };

        Scene_Shop.prototype.doSell = function(number) {
            var _current = $gameVariables.value(variableNumber);
            _current += number * this.sellingPrice();
            $gameVariables.setValue(variableNumber, _current);
            $gameParty.loseItem(this._item, number);
        };

        Window_Gold.prototype.value = function() {
            // プラグインで指定した変数の値を金額として返す
            return $gameVariables.value(variableNumber);
        };

        Window_Gold.prototype.currencyUnit = function() {
            return currencyName;
        };

        Window_ShopCommand.prototype.makeCommandList = function() {
            this.clearCommandList();
            this.addCommand(buyCommandName,    'buy');
            this.addCommand(sellCommandName,   'sell',   !this._purchaseOnly);
            this.addCommand(TextManager.cancel, 'cancel');
        };

    };

    //-------------------------------------------------------------------------
    // ゴールド以外のショップOFF
    //-------------------------------------------------------------------------
    Game_System.prototype.rngd_hook_off_AnotherCurrecyShop = function() {
        Scene_Shop.prototype.doBuy = function(number) {
            _Scene_Shop_doBuy.call(this, number);
        };

        Scene_Shop.prototype.doSell = function(number) {
            _Scene_Shop_doSell.call(this, number);
        };

        Window_Gold.prototype.value = function() {
            return _Window_Gold_value.call(this);
        };

        Window_Gold.prototype.currencyUnit = function() {
            return _Window_Gold_currencyUnit.call(this);
        };

        Window_ShopCommand.prototype.makeCommandList = function() {
            _Window_ShopCommand_makeCommandList.call(this);
        };

    };

})();