//-----------------------------------------------------------------------------
//  Galv's Image Cache
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ImageCache.js
//-----------------------------------------------------------------------------
//  2017-10-12 - Version 1.1 - updated to work with MV 1.5.1 files
//  2017-04-26 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ImageCache = true;

var Galv = Galv || {};                  // Galv's main object
Galv.CACHE = Galv.CACHE || {};          // Galv's stuff


//-----------------------------------------------------------------------------
/*:ja
 * @plugindesc (v.1.1) 事前に画像をキャッシュし、問題を回避できます
 *
 * @author Galv - galvs-scripts.com
 *
 * @param Folder 1
 * @text フォルダ 1
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default animations|
 *
 * @param Folder 2
 * @text フォルダ 2
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default battlebacks1|
 *
 * @param Folder 3
 * @text フォルダ 3
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default battlebacks2|
 *
 * @param Folder 4
 * @text フォルダ 4
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default characters|
 *
 * @param Folder 5
 * @text フォルダ 5
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default enemies|
 *
 * @param Folder 6
 * @text フォルダ 6
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default faces|
 *
 * @param Folder 7
 * @text フォルダ 7
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default parallaxes|
 *
 * @param Folder 8
 * @text フォルダ 8
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default pictures|
 *
 * @param Folder 9
 * @text フォルダ 9
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default sv_actors|
 *
 * @param Folder 10
 * @text フォルダ 10
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default sv_enemies|
 *
 * @param Folder 11
 * @text フォルダ 11
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default system|
 *
 * @param Folder 12
 * @text フォルダ 12
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default tilesets|
 *
 * @param Folder 13
 * @text フォルダ 13
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default titles1|
 *
 * @param Folder 14
 * @text フォルダ 14
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default titles2|
 *
 * @param Folder 15
 * @text フォルダ 15
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 16
 * @text フォルダ 16
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 17
 * @text フォルダ 17
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 18
 * @text フォルダ 18
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 19
 * @text フォルダ 19
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 20
 * @text フォルダ 20
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 21
 * @text フォルダ 21
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 22
 * @text フォルダ 22
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 23
 * @text フォルダ 23
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 24
 * @text フォルダ 24
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @param Folder 25
 * @text フォルダ 25
 * @desc /img/内のフォルダから事前読み込みする画像リスト
 * フォルダ名|画像ファイル名,画像ファイル名,...
 * @default
 *
 * @help
 * 翻訳:ムノクラ
 * https://fungamemake.com/
 * https://twitter.com/munokura/
 *
 * 元プラグイン:
 * https://galvs-scripts.com/2017/04/26/mv-image-cache/
 *
 *   Galv's Image Cache
 * ---------------------------------------------------------------------------
 * このプラグインは、プロジェクトの/img/フォルダ内のフォルダから
 * 特定の画像を指定して、
 * 問題(ラグ、一時的に消える、ウィンドウに読み込まれないなど)を
 * 回避できるように書かれています。
 *
 * フォルダ15+は、使用している他のプラグインによって作成された
 * カスタム画像フォルダの場所に使用できます。
 *
 * これらの画像をメモリにプリロード/プリキャッシュすると、
 * 既にメモリ内にあるため、(上記の問題を回避できる可能性がある)
 * 必要に応じてすぐに実行する必要がなくなります。
 *
 * プラグイン設定には、
 * ゲームのロード時に事前キャッシュする画像のリストが含まれています。
 * 以下のスクリプトコールを使用して、
 * ゲーム中に必要な画像を事前にキャッシュすることもできます。
 *
 *      Galv.CACHE.load('folder','img');
 *
 * ---------------------------------------------------------------------------
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

ImageManager.reserveSpecific = function(filename, folder, hue, reservationId) {
	var folder = folder ? folder + '/' : '';
    return this.reserveBitmap('img/' + folder, filename, hue, false, reservationId || this._systemReservationId);
};

Galv.CACHE.loadOnBoot = function() {
	var params = PluginManager.parameters('Galv_ImageCache')
	var proceed = true;
	var i = 1;
	
	do {
		var txt = params['Folder ' + i];
		if (txt === undefined || txt === '') {
			proceed = false;
		} else {
			var arr = txt.split('|');
			if (arr) {
				var folder = arr[0];
				var list = arr[1].split(',');
				if (list[0] != '') {
					for (var j in list) {
						Galv.CACHE.load(folder,list[j]);
					}
				}
			}
			i += 1;
		}
	} while (proceed);
};


Galv.CACHE.load = function(folder,img) {
	ImageManager.reserveSpecific(img,folder);
};

Galv.CACHE.Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function() {
	Galv.CACHE.Scene_Boot_loadSystemImages.call(this);
	Galv.CACHE.loadOnBoot();
};

})();