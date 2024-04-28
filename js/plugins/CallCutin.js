/*---------------------------------------------------------------------------*
 * 2020/01/7 shimo8
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc カットイン表示プラグイン
 * @author しもや
 * @help
 * ・プラグインコマンド
 *   callcutin ID アニメX アニメY SE(1以上でオン) BGS(1以上でオン)
 */


(function () {
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    const user = $gameActors.actor(1);
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'CallCutin') {
      //プラグインコマンド
      if (args[0].match(/\\v/)) {//変数を含む場合の処理
        array = args[0].match(/[0-9]+\.?[0-9]*/g);
        for (var i = 0; i < array.length; i++) {//戦闘の場合自動加算したい？
          args[0] = array;
          var EroCutinAddID = $gameVariables.value(args[0]);//カットイン名
        }
      } else {
        var EroCutinAddID = args[0]//カットイン名
      }

      if (args[1] != null) { var AnimeX = Number(args[1]) } else { var AnimeX = 0 };//アニメーション座標X
      if (args[2] != null) { var AnimeY = Number(args[2]) } else { var AnimeY = 0 };//アニメーション座標Y
      if (args[3] != null) { var CutinSE = args[3] } else { var CutinSE = 0 };//SEフラグ
      if (args[4] != null) { var CutinBGS = args[4] } else { var CutinBGS = 0 };//BGSフラグ

      //表示中
      $gameSwitches.setValue(155, true)

      //呼び出しファイル名入力用
      let Dif2ID = $cutinData[EroCutinAddID].Dif2ID || "なし"
      let DifID = $cutinData[EroCutinAddID].DifID || "なし"
      let DifSE = $cutinData[EroCutinAddID].DifSE || "なし"
      let DifSemen = "なし"
      let DifBGS = "なし"//未使用

      //座標
      let Cutin1X = 240
      let Cutin1Y = 256

      let StandPoseID = 1;//不能删，其实是调用了的
      //着用中衣装パラメータ
      var Nipple = true;
      var FileNameCloth = 0;
      //是否是在变身中
      const ChangeFlag = $gameSwitches.value(131) ? true : false;

      let EqNum = user._equips[1] ? user._equips[1]._itemId : 1//获取角色穿着衣服的id
      const legId = user._equips[7] ? user._equips[7]._itemId : 0//获取角色穿着裤子的id
      const eyeId = user._equips[9] ? user._equips[9]._itemId : 0//获取角色佩戴的眼罩的id
      const pierceId = user._equips[10] ? user._equips[10]._itemId : 0//获取角色装备的乳环的id
      const underPicId = user._equips[12] ? user._equips[12]._itemId : 0;//获取角色的装备的内衣id
      const clitId = user._equips[14] ? user._equips[14]._itemId : 0//获取角色穿着阴蒂装备的id


      const [CLOTHTAG, UNDERFLAG] = (() => {
        let CLOTHTAG = 'Naked';
        let UNDERFLAG = 1
        if (EqNum >= 5) {
          if (user.isStateAffected(94)) {
            let biriIndex = [65, 67, 71, 76].indexOf(EqNum);//永恒、淫咒、无垢、邪障
            if (biriIndex >= 0) EqNum = [315, 317, 321, 326][biriIndex];
          }
          if (user.isStateAffected(95)) {
            let biriIndex = [65, 67, 71, 76].indexOf(EqNum);
            if (biriIndex >= 0) EqNum = [316, 318, 322, 327][biriIndex];
          }
          if (EqNum == 74 && user.isStateAffected(382)) EqNum = 324;
          if ([65, 61, 62].includes(EqNum) && user.isStateAffected(88)) FileNameCloth += 'b';
          if (!$dataArmors[EqNum].meta["CutinNipple"]) Nipple = false;
          FileNameCloth = $dataArmors[EqNum].meta.PID;

          CLOTHTAG = $dataArmors[EqNum].meta.ClothName || CLOTHTAG;
          UNDERFLAG = Number($dataArmors[EqNum].meta.ClothUnderFlag); //下着
          if ([312, 313].includes(EqNum) && ChangeFlag) UNDERFLAG = 0;
        }

        if (underPicId >= 5) {
          if ($dataArmors[underPicId].meta.ForceDisplay) UNDERFLAG = 1;
          if (UNDERFLAG >= 1 && Nipple && !$dataArmors[underPicId].meta["CutinNipple"]) Nipple = false;
        }
        else UNDERFLAG = 0;

        return [CLOTHTAG, UNDERFLAG];
      })();


      //定義
      let CUTINBASENUM = $cutinData[EroCutinAddID].CUTINBASENUM || 0//部位ベース名
      let CUTINFILENUM = $cutinData[EroCutinAddID].CUTINFILENUM || 0//ファイル名末尾の番号
      let CUTINALTFLAG = 0//変身差分(ベース番号に加算)
      let CUTINCLOTHFLAG = EqNum >= 5 ? 1 : 0//是否有服装差异
      let CUTINTITESFLAG = (ChangeFlag == false && [300, 301, 307, 309, 310].includes(legId)) ? 1 : 0//タイツ反映
      let CUTINOPTIONFLAG = (UNDERFLAG >= 1 && underPicId > 5) ? 1 : 0//下着反映(タイツが優先)
      const balckFlag = $gameSwitches.value(3001);

      //ベースファイル指定
      let EyeFlag = (eyeId > 5) ? 1 : 0;  //Expand2 k 眼罩flag
      let HairFlag = 0; //Expand5 k bl a 头发flag
      let BYTFlag = $gameSwitches.value(2910) ? 1 : 0;  //Expand5 v h 避孕套flag
      let RingFlag = (pierceId > 5) ? 1 : 0; //Expand2 b a 乳环flag
      let ScarFlag = user.isStateAffected(320) ? 1 : 0; //Expand1 k b v h a 伤痕flag
      let PaintFlag = $gameVariables.value(4900) > 0 ? 1 : 0;//Expand3 b v h a 涂鸦flag
      let EroFlag = ($gameVariables.value(1030) > 45 && ConfigManager.Erode) ? 1 : 0;  //Expand4 k b v h a 侵蚀flag
      let SemenFlag = $gameVariables.value(942) > 0 ? 1 : 0;//Cutin1Semen1 精液flag
      let BlackenFlag = !ConfigManager.noBlacken ? 1 : 0;//Blacken 黑乳头/逼flag
      let ClitFlag = (clitId > 5) ? 1 : 0; //Expand2 v 阴蒂flag
      let PotionFlag = $gameVariables.value(4845) > 0 ? 1 : 0; //Cutin1Potion1 媚药flag

      const FLAGMAP = {
        kiss: {
          othert: () => {
            CUTINCLOTHFLAG = 0;
            CUTINTITESFLAG = 0;
            CUTINOPTIONFLAG = 0;
            CUTINALTFLAG = 1;
            BlackenFlag = 0;
            HairFlag = 1;
            ClitFlag = 0
            RingFlag = 0
            PaintFlag = 0
            PotionFlag = 0
            BYTFlag = 0
            SemenFlag = 0
            if (pierceId == 235) RingFlag = 1;//奶牛乳环的鼻环

          },
        },
        breast: {
          othert: () => {
            ClitFlag = 0
            EyeFlag = 0
            BYTFlag = 0
          }
        },
        vagina: {
          othert: () => {

            BlackenFlag = 0
            ClitFlag = 0
            RingFlag = 0
            EyeFlag = 0
          }
        },
        hip: {
          othert: () => {
            BlackenFlag = 0
            ClitFlag = 0
            RingFlag = 0
            EyeFlag = 0
          }
        },
        handjob: {
          othert: () => {
            CUTINCLOTHFLAG = 0
            CUTINTITESFLAG = 0
            CUTINOPTIONFLAG = 0
            CUTINALTFLAG = 1

            BlackenFlag = 0
            ScarFlag = 0
            ClitFlag = 0
            RingFlag = 0
            EyeFlag = 0
            PaintFlag = 0
            EroFlag = 0
            PotionFlag = 0
            BYTFlag = 0
            SemenFlag = 0
          }
        },
        tites:
        {
          othert: () => {
            CUTINCLOTHFLAG = 0
            CUTINTITESFLAG = 0
            CUTINOPTIONFLAG = 0

            BlackenFlag = 0
            ScarFlag = 0
            ClitFlag = 0
            RingFlag = 0
            EyeFlag = 0
            PaintFlag = 0
            EroFlag = 0
            PotionFlag = 0
            BYTFlag = 0
            SemenFlag = 0
          }
        },
        blowjob: {
          othert: () => {
            CUTINCLOTHFLAG = 0
            CUTINTITESFLAG = 0
            CUTINOPTIONFLAG = 0
            HairFlag = 1
            CUTINALTFLAG = 1

            BlackenFlag = 0
            ScarFlag = 0
            ClitFlag = 0
            RingFlag = 0
            EyeFlag = 0
            PaintFlag = 0
            EroFlag = 0
            PotionFlag = 0
            BYTFlag = 0
            SemenFlag = 0
          }
        },
        acme: {
          othert: () => {
            CUTINCLOTHFLAG = 0
            CUTINTITESFLAG = 0
            CUTINALTFLAG = 1
            HairFlag = 1;
            ClitFlag = 0
            EyeFlag = 0
            PotionFlag = 0
            BYTFlag = 0
            SemenFlag = 0
          }
        }
      }

      if (FLAGMAP[CUTINBASENUM]) {
        FLAGMAP[CUTINBASENUM].othert();
      }
      else { { console.error(CUTINBASENUM + 'ベースファイル名未指定'); } };

      //SE演奏
      if (CutinSE == 1 && DifSE != "なし") {
        var seindex = $se_list.seID.indexOf(DifSE);
        if (seindex != -1) {
          var file = $se_list.File[seindex];
          AudioManager.playSe({ name: file, volume: 90, pitch: 100, pan: 0 })
        }
      }

      EraceCutinTotal();

      // 创建一个新的Sprite对象
      var total = new Sprite();
      // 将新创建的Sprite对象添加到SceneManager._scene._spriteset中
      SceneManager._scene._spriteset.addChild(total)
      // 设置新创建的Sprite对象的x坐标和y坐标
      total.x = Cutin1X; total.y = Cutin1Y;
      // 将新创建的Sprite对象赋值给SceneManager._scene.total
      SceneManager._scene.total = total;

      //cutin图层底部(Dif2)
      if (Dif2ID != "なし") {
        FILENAME = "cutin/" + CUTINBASENUM + "_h_" + Dif2ID
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Dif2 = s;
      }

      //素体表示
      if (CUTINALTFLAG >= 1) {
        switch (CLOTHTAG) {
          case "Change": CUTINFILENUM += 1; break;
          case "DarkChange": CUTINFILENUM += 2; break;
          case "EvilChange": CUTINFILENUM = CUTINFILENUM + 2 + "b"; break;
          default: if (balckFlag) CUTINFILENUM += "a"; break;
        }
      }
      else if (balckFlag) {//如果黑皮
        CUTINFILENUM += "a"
      }

      if (CUTINFILENUM >= 10) {
        FILENAME = "cutin/" + CUTINBASENUM + "_00" + CUTINFILENUM
      } else {
        FILENAME = "cutin/" + CUTINBASENUM + "_000" + CUTINFILENUM
      }
      var bitmap = ImageManager.loadPicture(FILENAME);
      var s = new Sprite(bitmap);
      s.setColorTone([$gameVariables.value(4846) * 0.5, 0, $gameVariables.value(4846) * 0.3, 0]);
      SceneManager._scene.total.addChild(s);
      SceneManager._scene.total.Cutin1Base = s;

      //性器变黑
      if (BlackenFlag >= 1) {
        FILENAME = "organ/" + CUTINBASENUM + "_" + "b"
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        s.opacity = (($gameVariables.value(1103) + $gameVariables.value(1074) * 0.25 + $gameVariables.value(1072) * 0.5) / 20 * 255).clamp(0, 255);
        SceneManager._scene.total.Blacken = s;
      }

      //扩展
      if (ScarFlag >= 1) {//伤痕
        FILENAME = 'mark/' + CUTINBASENUM + "_8";
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand1 = s;
      }
      if (ClitFlag >= 1) {//阴蒂环
        FILENAME = 'clit/' + CUTINBASENUM + "_" + eval($dataArmors[clitId].meta.PID);
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand2 = s;
      }

      if (RingFlag >= 1) {//物件乳环
        FILENAME = 'nipple/' + CUTINBASENUM + "_" + eval($dataArmors[pierceId].meta.PID);
        if (Nipple) FILENAME += "b"
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand2 = s;
      }
      if (EyeFlag >= 1) {//眼罩
        FILENAME = 'eye/' + CUTINBASENUM + "_" + eval($dataArmors[eyeId].meta.PID);
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand2 = s;
      }
      if (PaintFlag >= 1) {//涂鸦
        PaintIndex = ["13", "12", "11"][$gameVariables.value(4900) >= 2 ? 2 : $gameVariables.value(4900)]
        FILENAME = 'mark/' + CUTINBASENUM + "_" + PaintIndex;
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand3 = s;
      }
      if (EroFlag >= 1) {//侵蚀
        FILENAME = 'mark/' + CUTINBASENUM + "_9";
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        s.opacity = Math.min(($gameVariables.value(1030) - 45) * 5, 255);
        SceneManager._scene.total.Cutin1Expand4 = s;
      }
      if (HairFlag >= 1) {//头发换色       
        FILENAME = 'hair/' + CUTINBASENUM + "_" + CUTINFILENUM;
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        //换色
        if (CLOTHTAG == "Change" && CUTINALTFLAG >= 1) s.setColorTone(user.hairToneb);
        else s.setColorTone(user.hairTone);
        SceneManager._scene.total.Cutin1Expand5 = s;
      }
      //オプション
      if (CUTINOPTIONFLAG >= 1) {//タイツオフ、下着オンかつ未返信
        var FILENAME = 'under/' + CUTINBASENUM + "_" + eval($dataArmors[underPicId].meta.PID);
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        if ($gameActors.actor(2).toneArray[underPicId]) s.setColorTone($gameActors.actor(2).toneArray[underPicId]);
        SceneManager._scene.total.Cutin1Option = s;
      }

      //タイツ・足装備
      if (CUTINTITESFLAG >= 1) {//タイツフラグonかつ足装備ID300かつ未変身
        var FileNameLeg = $dataArmors[user._equips[7]._itemId].meta.PID;
        var FILENAME = "cutin/" + CUTINBASENUM + "_option_" + "00" + (FileNameLeg.replace(/\D/g, '').length > 1 ? "" : "0") + FileNameLeg
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        s.opacity = 230;
        if ($gameActors.actor(2).toneArray[legId]) s.setColorTone($gameActors.actor(2).toneArray[legId]);
        SceneManager._scene.total.Cutin1Tites = s;
      }

      //衣装表示
      if (CUTINCLOTHFLAG >= 1) {//衣装フラグオンかつ5以上
        var FILENAME = "cutin/" + CUTINBASENUM + "_cloth_" + "00" + (FileNameCloth.replace(/\D/g, '').length > 1 ? "" : "0") + FileNameCloth
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        s.opacity = $gameVariables.value(4964);
        if ($gameActors.actor(2).toneArray[EqNum]) s.setColorTone($gameActors.actor(2).toneArray[EqNum]);
        SceneManager._scene.total.Cutin1Cloth = s;
      }

      //身上带的媚药
      if (PotionFlag >= 1) {
        if ($gameVariables.value(4845) <= 1) FILENAME = 'mark/' + CUTINBASENUM + "_14";
        else FILENAME = 'mark/' + CUTINBASENUM + "_15";
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Potion1 = s;
      }

      if (BYTFlag >= 1) {//避孕套
        FILENAME = 'BYT/' + CUTINBASENUM + "_" + $gameVariables.value(4888);
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Expand5 = s;
      }

      //身上带的精液 
      if (SemenFlag >= 1) {
        FILENAME = "cutin/" + CUTINBASENUM + "_" + "Semen_0001"
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Semen1 = s;
      }
      //cutin图层上部
      if (DifID != "なし") {
        if (["sex01", "sex02"].includes(DifID)) FILENAME = 'hyp/' + CUTINBASENUM + "_" + DifID
        else FILENAME = "cutin/" + CUTINBASENUM + "_h_" + DifID
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Dif1 = s;
      };
      //发射的精液
      if (DifSemen != "なし") {
        FILENAME = "cutin/" + CUTINBASENUM + "_" + DifSemen
        var bitmap = ImageManager.loadPicture(FILENAME);
        var s = new Sprite(bitmap);
        SceneManager._scene.total.addChild(s);
        SceneManager._scene.total.Cutin1Semen1 = s;
      }

      //アニメーション座標
      var CutinAnimeX = 0 + Cutin1X
      var CutinAnimeY = 0 + Cutin1Y
      if (AnimeX != 0) CutinAnimeX += AnimeX;
      if (AnimeY != 0) CutinAnimeY += AnimeY;

      if (AnimeX != 0 || AnimeY != 0) {

        //番号、原点、X,Y,拡大、不透明、合成、移動ウェイト
        //アニメウェイト
        var AnimeWait = 6;

        //動かす処理、スプライトに置き換える場合上部の処理変更
        if (SceneManager._scene.total) {
          Torigoya.Tween.create(SceneManager._scene.total)
            .to({ x: CutinAnimeX, y: CutinAnimeY }, AnimeWait, Torigoya.Tween.Easing.easeOutSine)
            .to({ x: Cutin1X, y: Cutin1Y }, AnimeWait, Torigoya.Tween.Easing.easeOutSine).start()
        }

      }

      //ライン2

      $gameVariables._data[4869] = 0;
      $gameSwitches._data[2919] = true;
      this.wait(5);

      //おわり
    };
    
    if (command === 'EraceCutinAll' || command === 'eracecutinall' || command === 'EraceCutin1' || command === 'eracecutin1') {//全消去
      EraceCutinTotal()
    }
  };

  //消去用関数
  function EraceCutinTotal() {
    if (SceneManager._scene.total) {//既に表示がある場合消す処理//シーン名変更
      SceneManager._scene._spriteset.removeChild(SceneManager._scene.total)//シーン名変更
      SceneManager._scene.total = null;//シーン名変更
    }
  };


})();