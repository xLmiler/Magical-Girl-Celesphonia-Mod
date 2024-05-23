/*---------------------------------------------------------------------------*
 * 2020/01/7 shimo8
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc 立ち絵表示プラグイン
 * @author しもや
 * @help
 * ・プラグインコマンド
 *   CallStand 立ち絵IDor立ち絵エロ名 アニメX アニメY //衣装指定とかもできると〇
 * 
 * 戦闘エロのメモ
 * v[351] = 口を塞いでいる相手のID
 * v[352] = 前の以下略
 * v[353] = 後ろの以下略
 * v[415] = 拘束相手
 * 
 * 種族[1,human][2,tentacle][3,demon][4,worm?]
 */


(function () {
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		//角色部分
		const user = $gameActors.actor(1);
		if (command === 'CallStand' || command === 'CallStandForce') {
			let StandPoseID = 0;
			if (args[0].match(/\\v/)) {
				//args[0]包含\v时的处理
				array = args[0].match(/[0-9]+\.?[0-9]*/g);
				for (var i = 0; i < array.length; i++) {
					args[0] = Number(array);
					StandPoseID = $gameVariables.value(args[0]);
				}
			} else { StandPoseID = args[0] }
			if (args[1] != null) { var StandAnimeX = Number(args[1]) } else { var StandAnimeX = 0 };//アニメーション座標X
			if (args[2] != null) { var StandAnimeY = Number(args[2]) } else { var StandAnimeY = 0 };//アニメーション座標Y
			if (args[3] != null) { var StandAnimeWait = Number(args[3]) } else { var StandAnimeWait = 1 };//アニメーションウェイト


			//此部分是进行变量初始化部分

			if (typeof StandPoseIDsave === "undefined") StandPoseIDsave = StandPoseID;//保存当前立绘编号
			if (typeof StandAltFlagtsave === "undefined") StandAltFlagtsave = $gameSwitches.value(131);//保存当前立绘编号
			//立绘坐标部分
			let Stand1X = 380; //立绘的X坐标
			let Stand1Y = 0;//立绘的Y坐标
			let origin = 0;//立绘的原点 0左上，1中间
			let scale = 100;//立绘的缩放大小

			//通用编号
			const StandAltFlag = $gameSwitches.value(131) ? true : false //是否变身状态
			const blackBody = $gameSwitches.value(3001)//日晒皮肤开关
			const demonBody = $gameSwitches.value(98)//魔人皮肤开关
			let ClothUpdate = 0

			//避免因为姿势更换图层未清除手动清除图层
			setTimeout(() => {
				if (StandPoseIDsave != StandPoseID || StandAltFlagtsave != StandAltFlag) {
					for (var i = 110; i <= 151; i++) { $gameScreen.erasePicture(i); }
					StandPoseIDsave = StandPoseID;
					StandAltFlagtsave = StandAltFlag
				}
			}, 0);
			//立绘显示部分，用于输入调用文件名
			let BasePoseFileName = 'actor01_pose' //显示的角色的姿势文件名前缀1
			let BaseID = demonBody ? "0006" : blackBody ? "0004" : "0003" //显示角色变身与否显示的身体的后缀id
			let weaponIndex = '' //显示的武器id
			let FileName = 0 //立绘文件名
			let Dif1PicFileName = 0;// 显示的立绘文件名1
			let Dif2PicFileName = 0;// 显示的立绘文件名2

			//获取身上装备的id编号
			const weaponId = user._equips[0] ? user._equips[0]._itemId : 0 //获取角色装备的武器的id
			let StandEqNum = user._equips[1] ? user._equips[1]._itemId : 1//获取角色穿着衣服的id
			const legId = user._equips[7] ? user._equips[7]._itemId : 0//获取角色穿着裤子的id
			const neckId = user._equips[8] ? user._equips[8]._itemId : 0//获取角色穿着项圈的id
			const eyeId = user._equips[9] ? user._equips[9]._itemId : 0//获取角色佩戴的眼罩的id
			const pierceId = user._equips[10] ? user._equips[10]._itemId : 0//获取角色装备的乳环的id
			const mouthId = user._equips[11] ? user._equips[11]._itemId : 0//获取角色佩戴的口部装备的id
			const underPicId = user._equips[12] ? user._equips[12]._itemId : 0;//获取角色的装备的内衣id
			const earId = user._equips[13] ? user._equips[13]._itemId : 0;//获取角色穿着耳朵装备的id
			const clitId = user._equips[14] ? user._equips[14]._itemId : 0//获取角色穿着阴蒂装备的id

			//获取身上装备的文件编号
			const EyePicFileNum = eyeId >= 5 ? eval($dataArmors[user._equips[9]._itemId].meta.PID) : 0;//眼部图片文件编号
			const MouthPicFileNum = mouthId >= 5 ? eval($dataArmors[user._equips[11]._itemId].meta.PID) : 0;//口部图片文件编号
			const NeckPicFileNum = neckId >= 5 ? eval($dataArmors[user._equips[8]._itemId].meta.PID) : 0;//项圈图片文件编号
			const EarPicFileNum = earId >= 5 ? eval($dataArmors[earId].meta.PID) : 0;//耳朵图片文件编号
			let UnderPicFileNum = 0;//内衣的编号，由UnderPicFlag控制开关
			const LegPicFileNum = legId >= 5 ? $dataArmors[legId].meta.PID : 0;//获取腿部的装备图片编号
			const LegOpacity = legId >= 5 ? $dataArmors[legId].meta.LegOpacity : 0; //获取腿部的装备
			const ClitPicFileNum = clitId >= 5 ? eval($dataArmors[clitId].meta.PID) : 0;//角色的阴蒂图片文件编号
			let ClothPicFileNum = 0;//获取角色穿着衣服的图片编号
			let PiercePicFileNum = pierceId >= 5 ? eval($dataArmors[pierceId].meta.PID) : 0; //需要显示在衣服外的文件编号
			let PiercePicFileNumR = PiercePicFileNum;//需要显示在衣服外右部分的文件编号
			let PierceL = -1//左乳钉，大于0代表有超出身体
			let PierceR = -1;//右乳钉，大于0代表有超出身体


			//获取身上装备的特殊属性值
			let EqClothOpacity = StandEqNum >= 5 ? $dataArmors[StandEqNum].meta.ClothOpacity : 0 //获取角色衣服的不透明度数值
			let UnderPicFlag = StandEqNum >= 5 ? Number($dataArmors[StandEqNum].meta.ClothUnderFlag) : 0; //获取角色内衣的标志，是否显示内衣
			let NippleL = StandEqNum >= 5 ? $dataArmors[StandEqNum].meta.ClothNippleL[StandPoseID - 1] : 1
			let NippleR = StandEqNum >= 5 ? $dataArmors[StandEqNum].meta.ClothNippleR[StandPoseID - 1] : 1
			let Cosplay = StandEqNum >= 5 && $dataArmors[StandEqNum].meta.Cosplay ? 1 : 0;//获取角色衣服是否是cosplay


			//检查各种立绘状态标志
			let LovejuiceFlag = 0 //爱液标志
			let SweatFlag = 0//汗液标志
			let BreathFlag = 0//呼气标志
			let Mark1 = "0";//身体的纹路标志1
			let Mark2 = "0";//身体的纹路标志2
			let PaintIndex = "0";//身体的涂鸦标志
			let ScarFlag = 0;//身体的伤痕标志
			let HYMark = "0";//身体的纹路标志2

			//色情立绘的处理部分
			const MouthStateID = $gameVariables.value(351)//口塞ぎの相手番号
			const VaginaStateID = $gameVariables.value(352)//小穴状态
			const AnusStateID = $gameVariables.value(353)//屁穴状态
			let poseName = 0;
			const BindType = $gameVariables.value(415)//拘束的物种
			const WaitStateID = $gameVariables.value(354)//挿入前相手番号
			let OrganID = 0;

			//精液染色程度
			let SemenBody = $gameVariables.value(942) //身体部分
			let SemenFace = $gameVariables.value(941) //脸部部分
			let SemenAnus = $gameVariables.value(945)//肛门部分
			let SemenVagina = $gameVariables.value(944)//小穴部分
			let SemenMouth = $gameVariables.value(943)//嘴部部分

			//身体颜色部分
			let staining = $gameVariables.value(4846) >= 100 ? 100 : $gameVariables.value(4846)
			let bodyTone = [staining * 0.5, 0, staining * 0.3, 0];//存储身体的色调变化

			//其他变量设置

			//衣装耐久
			$gameVariables._data[741] = $gameVariables.value(702)
			$gameVariables._data[742] = $gameVariables.value(722)

			let CosplayFlag = 0
			//发型样式的确定
			let hairStyle = (StandAltFlag || Cosplay == 1) ? 6 : 1 //默认为未变身的样式 1未变身2变身
			if (user.hairStyle) {
				if (StandAltFlag || Cosplay == 1) {
					hairStyle = user.hairStyle[hairStyle - 5] <= 5 ? 6 : user.hairStyle[hairStyle - 5]
				}
				else {
					hairStyle = user.hairStyle[hairStyle - 1] >= 5 ? 1 : user.hairStyle[hairStyle - 1]
				}
			}//用户自定义发型样式
			//发饰确定
			const hairDress = [1, , , , , 6, 7, , ,][hairStyle - 1]//未变身，变身，高马尾
			//处理部分衣服的发饰颜色差异
			user.hairDtone = hairStyle !== 1 && $dataArmors[StandEqNum] && $dataArmors[StandEqNum].meta.ChangeHairD ? $dataArmors[StandEqNum].meta.ChangeHairD : null;

			//这里开始是游戏的立绘处理

			//确定图像的显示位置
			if ($gameSwitches.value(180)) {
				Stand1X = 512
				Stand1Y = 384
				scale = 82
				origin = 1;
			}
			else if (user.zoomIn) {
				Stand1X = 480
				Stand1Y = 30
				scale = 80
			}
			//传递给游戏内部变量
			$gameVariables._data[902] = Stand1X
			$gameVariables._data[903] = Stand1Y

			//立绘的姿势变量以及矫正
			if (StandPoseID == "0" || StandPoseID == 0 || StandPoseID == null) { StandPoseID = 1 }
			else if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].some(ID => StandPoseID == ID)) { StandPoseID = Number(StandPoseID); }
			else if ($sexPoseId[StandPoseID]) {
				$gameVariables._data[356] = StandPoseID;
				$gameVariables._data[415] = $sexPoseId[StandPoseID].BindType;
				$gameVariables._data[351] = $sexPoseId[StandPoseID].MouthStateID;
				$gameVariables._data[352] = $sexPoseId[StandPoseID].VaginaStateID;
				$gameVariables._data[353] = $sexPoseId[StandPoseID].AnusStateID;
				$gameVariables._data[354] = $sexPoseId[StandPoseID].WaitStateID;
				poseName = $gameVariables._data[356];
				StandPoseID = $sexPoseId[StandPoseID].poseID;
			}
			else {
				console.error('ポーズIDが不正'); StandPoseID = 1;
			}

			$gameVariables._data[915] = StandPoseID//ゲーム内変数に入れておく
			$gameVariables._data[916] = StandPoseID//ゲーム内変数に入れておく
			if (StandPoseID == 11) {//土下座
				for (var i = 110; i <= 150; i++) { $gameScreen.erasePicture(i); }
				if ($gameSwitches.value(131)) {
					if (user.isStateAffected(95)) submitCloth = 12;
					else submitCloth = 11;
					$gameScreen.showPicture(111, 'submit/2', 0, Stand1X, Stand1Y, scale, scale, 255, 0);
				} else {
					submitCloth = 14;
					$gameScreen.showPicture(111, 'submit/1', 0, Stand1X, Stand1Y, scale, scale, 255, 0);
				}
				FileName = 'submit/' + submitCloth;
				$gameScreen.showPicture(112, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
				this.wait(10);
				return;
			}


			if (command == 'CallStandForce') { $gameVariables._data[912] = StandPoseID }
			else { $gameVariables._data[912] = 0 }

			//标志赋予
			if ($gameVariables.value(1027) >= 100) {
				LovejuiceFlag = 1
				SweatFlag = 1
				BreathFlag = 1
			} else {
				if ($gameVariables.value(1027) >= 50) LovejuiceFlag = 1
				if ($gameVariables.value(1026) >= 500) {
					SweatFlag = 1
					BreathFlag = 1
				}
			}

			//伤痕
			if (user.isStateAffected(320)) ScarFlag = 1;
			//淫纹
			if (user.isStateAffected(321)) {
				if (user.mark) Mark1 = user.mark;
				else Mark1 = "6";
				if ([6, 7].includes(StandPoseID)) Mark1 = "0";
			}
			if (user.isStateAffected(322)) Mark2 = "10";
			//大淫纹
			if (user.isStateAffected(407)) {
				Mark1 = "16";
			}
			if ($CM_value.get("催眠等级") >= 1) {
				HYMark = ["01", "02", "03", "04", "05"][$CM_value.get("催眠等级") - 1]
			}

			//涂鸦
			if ($gameVariables.value(4900) > 0) {
				if ($gameVariables.value(4900) <= 1) { PaintIndex = "11" }
				else if ($gameVariables.value(4900) <= 2) { PaintIndex = "12" }
				else { PaintIndex = "13" }
			}

			var [
				stand_difback,
				stand_base, //136、201、229 身体
				stand_Bhair,//后发
				stand_hairDress,//发饰
				stand_tail, //尾巴
				stand_vb,
				stand_bb,
				stand_pv,
				stand_pvb,
				stand_scar,
				stand_paint,
				stand_mark1,
				stand_mark2,
				stand_hymark,
				stand_ero,
				stand_sweat,
				stand_semenhole,
				stand_face,
				stand_eye,
				stand_mouth,
				stand_clitRing,
				stand_pierceL,
				stand_pierceR,
				stand_under,
				stand_leg,
				effect_splash,
				stand_cloth, //乳环处理到此为止
				stand_Lmark1,
				stand_Lmark2,
				stand_Lhymark,
				stand_neck,
				stand_potion,
				stand_byt,
				stand_semenbody,
				stand_Shair,//发型阴影
				stand_Fhair,//前发 +f
				stand_ear,
				stand_semenface,
				stand_semenmouth, //尾巴处理到此为止
				effect_breath,
				stand_diffront] = Array(41).fill(null).map((_, i) => i); //diffront在下面reset_ERO
			//动图层数量必须改数组长度
			var stand_array = Array(41).fill(null).map((_, i) => i + 110);

			//如果您想指定服装，请在此处更改流程
			if (StandEqNum >= 5) {
				if (user.isStateAffected(55) || user.addedSkills().contains(722) || user.isLearnedSkill(722)) {
					EqClothOpacity = EqClothOpacity / 2
				}//すけすけステート食らっている場合
				if ($gameVariables.value(4964) != EqClothOpacity) {
					ClothUpdate = 1
				} else { ClothUpdate = 0 }//透過度が違う場合保存して更新フラグオン
				$gameVariables._data[4964] = EqClothOpacity

				//衣服破损切换		
				if (user.isStateAffected(94)) {
					let biriIndex = [65, 67, 71, 76].indexOf(StandEqNum);//永恒、淫咒、无垢、邪障
					if (biriIndex >= 0) StandEqNum = [315, 317, 321, 326][biriIndex];
				}
				if (user.isStateAffected(95)) {
					let biriIndex = [65, 67, 71, 76].indexOf(StandEqNum);
					if (biriIndex >= 0) StandEqNum = [316, 318, 322, 327][biriIndex];
				}
				//
				if (StandEqNum == 74 && user.isStateAffected(382)) StandEqNum = 324; //魅魔衣服切换

				//获取衣服的文件id
				ClothPicFileNum = $dataArmors[StandEqNum].meta.PID;
				//淫触魔衣切换
				if (StandEqNum == 70 && $gameSwitches.value(1838)) ClothPicFileNum += 'b';
				//乳牛服装切换
				if (StandEqNum == 77 && $CM_runiu < 3) {
					switch ($CM_runiu) {
						case 1: ClothPicFileNum = "39a"; break;
						case 2: ClothPicFileNum = "39b";
					}
				}
				//乳牛服装状态增加
				(StandEqNum == 77 && $CM_runiu == 3) ? user.addState(423) : user.removeState(423);
				//永恒特效
				if ([65, 315, 316].includes(StandEqNum) && (user.isStateAffected(88))) ClothPicFileNum += 'b';
				//魔人状态转换
				if (StandPoseID <= 2 && StandEqNum == 75) ClothPicFileNum += updatestate_for_value([435, 436, 437, 438, 439], ['a', 'b', 'c', 'd', 'e'])
			}
			else {
				EqClothOpacity = 255 //衣装透過度
				UnderPicFlag = 1; //下着
				ClothPicFileNum = 0
			}

			//cosplay衣服处理
			if (Cosplay) CosplayFlag = 1

			//处理尾巴
			if (earId >= 5 && StandPoseID == 6) {
				stand_array.splice(stand_tail, 0, ...stand_array.splice(stand_ear, 1));
			}
			//内衣的显示处理
			if (underPicId) {
				if (underPicId == 87 || underPicId == 284 || underPicId == 286) UnderPicFlag = 1;//奶牛内衣与榨乳器显示
				if ([312, 313].includes(StandEqNum) && (StandAltFlag || CosplayFlag == 1)) UnderPicFlag = 0;
				if (underPicId >= 5 && (UnderPicFlag >= 1 || $dataArmors[underPicId].meta.ForceDisplay)) {
					UnderPicFileNum = eval($dataArmors[underPicId].meta.PID)
					if (NippleL == 1) NippleL = $dataArmors[underPicId].meta.UnderNippleL[StandPoseID - 1];
					if (NippleR == 1) NippleR = $dataArmors[underPicId].meta.UnderNippleR[StandPoseID - 1];
				}
			}

			//打开露出判定开关
			$gameSwitches._data[2922] = NippleL >= 1 ? true : false;
			$gameSwitches._data[2923] = NippleR >= 1 ? true : false;

			PierceL = pierceId >= 5 && $dataArmors[pierceId].meta["CorrectL"] && $dataArmors[pierceId].meta["CorrectR"] ? $dataArmors[pierceId].meta.CorrectL[StandPoseID - 1] : -1;//左乳钉，大于0代表有超出身体
			PierceR = pierceId >= 5 && $dataArmors[pierceId].meta["CorrectL"] && $dataArmors[pierceId].meta["CorrectR"] ? $dataArmors[pierceId].meta.CorrectR[StandPoseID - 1] : -1;//右乳钉，大于0代表有超出身体
			//处理吊坠
			if (PierceR + PierceL >= 0) {
				PiercePicFileNum += 'l';
				PiercePicFileNumR += 'r';
				if (PierceL >= 1 && NippleL < 1) PiercePicFileNum += 'b';
				if (PierceR >= 1 && NippleR < 1) PiercePicFileNumR += 'b';
				if (NippleR >= 1) stand_array.splice(stand_pierceR, 0, ...stand_array.splice(stand_cloth, 1));
				if (NippleL >= 1) stand_array.splice(stand_pierceL, 0, ...stand_array.splice(stand_cloth, 1));
			}

			//大淫纹处理
			if (user.isStateAffected(407)) { stand_array.splice(stand_mark1, 0, ...stand_array.splice(stand_cloth, 1)); }
			if ((hairDress != 1 && StandPoseID == 6) || (hairDress == 1 && (StandPoseID == 6))) {

			}
			if (StandPoseID == 6) {
				stand_array.splice(stand_hairDress, 0, ...stand_array.splice(stand_ear, 1));
				if (demonBody) stand_array.splice(stand_neck, 0, ...stand_array.splice(stand_difback, 1));
			}
			else {
				if (hairDress == 1) stand_array.splice(stand_hairDress, 0, ...stand_array.splice(stand_ear, 1));
			}
			if (hairStyle === 2) stand_array.splice(stand_base, 0, ...stand_array.splice(stand_Bhair, 1));
			//心乳贴处理
			let heartNipple = (UnderPicFileNum == 8 && StandEqNum !== 41) ? 1 : 0;
			[
				stand_difback,
				stand_base, //136、201、229
				stand_Bhair,
				stand_hairDress,
				stand_tail,
				stand_vb,
				stand_bb,
				stand_pv,
				stand_pvb,
				stand_scar,
				stand_paint,
				stand_mark1,
				stand_mark2,
				stand_hymark,
				stand_ero,
				stand_sweat,
				stand_semenhole,
				stand_face,
				stand_eye,
				stand_mouth,
				stand_clitRing,
				stand_pierceL,
				stand_pierceR,
				stand_under,
				stand_leg,
				effect_splash,
				stand_cloth, //乳环处理到此为止
				stand_Lmark1,
				stand_Lmark2,
				stand_Lhymark,
				stand_neck,
				stand_potion,
				stand_byt,
				stand_semenbody,
				stand_Shair,
				stand_Fhair,
				stand_ear,
				stand_semenface,
				stand_semenmouth, //尾巴处理到此为止
				effect_breath,
				stand_diffront] = stand_array; //diffront在下面reset_ERO

			window.savePicIndex = { bhair: stand_Bhair, fhair: stand_Fhair, under: stand_under, socks: stand_leg, cloth: stand_cloth, ear: stand_ear, tail: stand_tail };

			//立ち絵ポーズ基本ファイル名
			StandPoseID = ('00' + StandPoseID).slice(-2);//ゼロ埋め
			BasePoseFileName += StandPoseID//ポーズ名を結合

			//变身后的立绘的身体部分处理以及武器图像处理;
			if (CosplayFlag == 1 || StandAltFlag) {
				//变身后武器立绘处理
				if (StandPoseID <= 2 && weaponId >= 5) {
					weaponIndex = $dataWeapons[weaponId].meta.PID ? eval($dataWeapons[weaponId].meta.PID) : 1;
					if ($dataWeapons[weaponId].meta.feat) {
						if (user.isStateAffected(445) || window.weaponEffect) weaponIndex += 'b';
					}
				}
			}
			//立绘显示的文件名处理
			if (BaseID == '0004' && (CosplayFlag == 1 || StandAltFlag)) BaseID += "a"
			FileName = "body/" + BasePoseFileName + "_body_" + BaseID
			if ($gameScreen.picture(stand_base) && $gameScreen.picture(stand_base)._name == FileName) { }
			else {
				$gameScreen.showPicture(stand_base, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0)
			}

			//身体色调
			if ($gameScreen.picture(stand_base) && bodyTone != $gameScreen.picture(stand_base)._tone) $gameScreen.picture(stand_base).tint(bodyTone, 0);

			//性器变黑
			if (ConfigManager.noBlacken) { $gameScreen.erasePicture(stand_vb); $gameScreen.erasePicture(stand_bb); }
			else {
				FileName = 'organ/' + StandPoseID + 'v';
				if ($gameScreen.picture(stand_vb) && $gameScreen.picture(stand_vb)._name == FileName) {
				} else {
					$gameScreen.showPicture(stand_vb, FileName, origin, Stand1X, Stand1Y, scale, scale, ((($gameVariables.value(1104) + $gameVariables.value(1106)) * 10 + $gameVariables.value(1045)) / 2.5).clamp(0, 160), 0)
				}
				FileName = 'organ/' + StandPoseID + 'b';
				if ($gameScreen.picture(stand_bb) && $gameScreen.picture(stand_bb)._name == FileName) {
				} else {
					$gameScreen.showPicture(stand_bb, FileName, origin, Stand1X, Stand1Y, scale, scale, (($gameVariables.value(1103) + $gameVariables.value(1074) * 0.25 + $gameVariables.value(1072) * 0.5) / 20 * 255).clamp(0, 255), 0);
				}
			}

			//头发
			if (!$gameScreen.picture(stand_base) || blackBody || demonBody) {
				$gameScreen.erasePicture(stand_Fhair);//清除头发
				$gameScreen.erasePicture(stand_Shair);
				$gameScreen.erasePicture(stand_Bhair);
				$gameScreen.erasePicture(stand_hairDress);
			}
			else {
				//前发 需要染色的部分
				FileName = 'hair/' + StandPoseID + '_' + hairStyle;
				hairStyles(stand_Bhair, FileName, origin, Stand1X, Stand1Y, scale)
				//后发
				FileName += "f"
				hairStyles(stand_Fhair, FileName, origin, Stand1X, Stand1Y, scale)
				//发饰
				if (hairDress) {
					FileName = 'hairDress/' + StandPoseID + '_' + hairStyle;
					hairStyles(stand_hairDress, FileName, origin, Stand1X, Stand1Y, scale)
				}

				//阴影 不需要染色的部分
				FileName = 'hair/' + StandPoseID + '_' + hairStyle + "s";
				if ($gameScreen.picture(stand_Shair) && $gameScreen.picture(stand_Shair)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_Shair, FileName, origin, Stand1X, Stand1Y, scale, scale, 200, 0);
				}
			}
			//衣装
			if (ClothPicFileNum != 0 && heartNipple == 0) {
				FileName = "cloth/" + StandPoseID + "_00" + (ClothPicFileNum.replace(/\D/g, '').length > 1 ? "" : "0") + ClothPicFileNum
				if ($gameScreen.picture(stand_cloth) && $gameScreen.picture(stand_cloth)._name == FileName && ClothUpdate == 0) {
				} else {
					var realPictureId = $gameScreen.realPictureId(stand_cloth);
					var P = new Game_Picture();
					P.show(FileName, origin, Stand1X, Stand1Y, scale, scale, EqClothOpacity, 0);
					P._tone = $gameActors.actor(2).toneArray[user._equips[1]._itemId];
					$gameScreen._pictures[realPictureId] = P;
				}
			} else { $gameScreen.erasePicture(stand_cloth) }
			//脚　変身中は反映なし
			if (LegPicFileNum != 0 && (!StandAltFlag || CosplayFlag == 1)) {
				FileName = "leg/" + StandPoseID + "_00" + (LegPicFileNum.replace(/\D/g, '').length > 1 ? "" : "0") + LegPicFileNum
				if ($gameScreen.picture(stand_leg) && $gameScreen.picture(stand_leg)._name == FileName) {
				} else {
					var realPictureId = $gameScreen.realPictureId(stand_leg);
					var P = new Game_Picture();
					P.show(FileName, origin, Stand1X, Stand1Y, scale, scale, LegOpacity, 0);
					P._tone = $gameActors.actor(2).toneArray[user._equips[7]._itemId];
					$gameScreen._pictures[realPictureId] = P;
				}
			} else { $gameScreen.erasePicture(stand_leg); }

			//下着
			if (UnderPicFileNum != 0) { //取得した装備タグの衣装ファイル名が0(全裸)以外の場合 
				FileName = 'under/' + StandPoseID + "_" + UnderPicFileNum
				if ($gameScreen.picture(stand_under) && $gameScreen.picture(stand_under)._name == FileName) {
				} else {
					var realPictureId = $gameScreen.realPictureId(stand_under);
					var P = new Game_Picture();
					P.show(FileName, origin, Stand1X, Stand1Y, scale, scale, 240, 0);
					P._tone = $gameActors.actor(2).toneArray[user._equips[12]._itemId];
					$gameScreen._pictures[realPictureId] = P;
				}
			} else {
				$gameScreen.erasePicture(stand_under)//全裸の場合消去
			}
			//息
			FileName = "breath/" + StandPoseID + "_0035"
			if ($gameScreen.picture(effect_breath) && $gameScreen.picture(effect_breath)._name == FileName) {
			} else {
				if (BreathFlag >= 1) {
					$gameSwitches._data[52] = true; //吐息アニメ    
					$gameScreen.showPicture(effect_breath, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
				} else {
					$gameSwitches._data[52] = false; //吐息アニメ
					$gameScreen.erasePicture(effect_breath);
				}
			}
			//表情    
			var FaceId = AutoFaceId(user);
			//魔人表情
			if (user._classId == 4 && StandPoseID <= 2) {
				FaceId = updatestate_for_value([435, 436, 437, 438, 439], ['62a', '62b', '62c', '62d', '62e'])
				if (FaceId == 0) FaceId = AutoFaceId(user)
			}
			//永恒发光表情
			if ([2, 5, 7, 13, 15, 17, 25, 31, 32, 33, 34, 35, 36, 37, 38, 41].includes(FaceId) && (user.isStateAffected(88))) FaceId += "a";

			if (FaceId == 0 || ['06', '10'].includes(StandPoseID) || !$gameScreen.picture(stand_base)) {
				if ($gameScreen.picture(stand_face)) $gameScreen.erasePicture(stand_face);
			} else {
				FaceId = ('0000' + FaceId).slice(-4); //ゼロ埋め
				FileName = 'faces/' + BasePoseFileName + "_face_" + FaceId;
				if ($gameScreen.picture(stand_face) && $gameScreen.picture(stand_face)._name == FileName) {
				} else {
					$gameScreen.showPicture(stand_face, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
				}
			}

			//汗水+爱液
			if (SweatFlag < 1 && LovejuiceFlag < 1) { $gameScreen.erasePicture(stand_sweat); }
			else {
				if (SweatFlag >= 1 && LovejuiceFlag >= 1) { var SweatPicFileNum = "0032" }
				else if (SweatFlag >= 1 && LovejuiceFlag == 0) { var SweatPicFileNum = "0036" }
				else if (SweatFlag == 0 && LovejuiceFlag >= 1) { var SweatPicFileNum = "0031" }
				else { }
				FileName = BasePoseFileName + "_option_" + SweatPicFileNum;
				if ($gameScreen.picture(stand_sweat) && $gameScreen.picture(stand_sweat)._name == FileName) { }
				else { $gameScreen.showPicture(stand_sweat, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//侵蚀
			if (!ConfigManager.Erode) { $gameScreen.erasePicture(stand_ero); }
			else {
				FileName = 'mark/' + StandPoseID + "_9";
				var s = ($gameVariables.value(1030) - 45) * 5;
				if ($gameScreen.picture(stand_ero) && $gameScreen.picture(stand_ero)._name == FileName && $gameScreen.picture(stand_ero)._opacity == s) { }
				else { $gameScreen.showPicture(stand_ero, FileName, origin, Stand1X, Stand1Y, scale, scale, s, 0); }
			}
			//伤痕
			if (ScarFlag < 1) { $gameScreen.erasePicture(stand_scar); }
			else {
				FileName = 'mark/' + StandPoseID + "_8";
				if ($gameScreen.picture(stand_scar) && $gameScreen.picture(stand_scar)._name == FileName) { }
				else { $gameScreen.showPicture(stand_scar, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//涂鸦
			if (PaintIndex == "0") { $gameScreen.erasePicture(stand_paint); }
			else {
				FileName = 'mark/' + StandPoseID + "_" + PaintIndex;
				if ($gameScreen.picture(stand_paint) && $gameScreen.picture(stand_paint)._name == FileName) { }
				else { $gameScreen.showPicture(stand_paint, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//淫紋
			if (Mark1 == "0") { $gameScreen.erasePicture(stand_mark1); }
			else {
				FileName = 'mark/' + StandPoseID + "_" + Mark1;
				if ($gameScreen.picture(stand_mark1) && $gameScreen.picture(stand_mark1)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_mark1, FileName, origin, Stand1X, Stand1Y, scale, scale, 200, 0);
					$gameScreen.picture(stand_mark1)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
					$gameScreen.showPicture(stand_Lmark1, FileName, origin, Stand1X, Stand1Y, scale, scale, 66, 0);
					$gameScreen.picture(stand_Lmark1)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
				}
			}
			if (Mark2 == "0") { $gameScreen.erasePicture(stand_mark2); }
			else {
				FileName = 'mark/' + StandPoseID + "_" + Mark2;
				if ($gameScreen.picture(stand_mark2) && $gameScreen.picture(stand_mark2)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_mark2, FileName, origin, Stand1X, Stand1Y, scale, scale, 200, 0);
					$gameScreen.picture(stand_mark2)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
					$gameScreen.showPicture(stand_Lmark2, FileName, origin, Stand1X, Stand1Y, scale, scale, 66, 0);
					$gameScreen.picture(stand_Lmark2)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
				}
			}
			if (HYMark == "0") { $gameScreen.erasePicture(stand_hymark); }//催眠侵蚀纹
			else {
				FileName = 'hyp/mark/' + StandPoseID + "_" + HYMark;
				if ($gameScreen.picture(stand_hymark) && $gameScreen.picture(stand_hymark)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_hymark, FileName, origin, Stand1X, Stand1Y, scale, scale, 200, 0);
					$gameScreen.picture(stand_hymark)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
					$gameScreen.showPicture(stand_Lhymark, FileName, origin, Stand1X, Stand1Y, scale, scale, 66, 0);
					$gameScreen.picture(stand_Lhymark)._blendMode = PIXI.BLEND_MODES.MULTIPLY;
				}
			}
			//眼罩
			if (EyePicFileNum == 0) { $gameScreen.erasePicture(stand_eye); }
			else {
				FileName = 'eye/' + StandPoseID + "_" + EyePicFileNum;
				if ($gameScreen.picture(stand_eye) && $gameScreen.picture(stand_eye)._name == FileName) { }
				else { $gameScreen.showPicture(stand_eye, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//口球
			if (MouthPicFileNum == 0) { $gameScreen.erasePicture(stand_mouth); }
			else {
				FileName = 'mouth/' + StandPoseID + "_" + MouthPicFileNum;
				if ($gameScreen.picture(stand_mouth) && $gameScreen.picture(stand_mouth)._name == FileName) { }
				else { $gameScreen.showPicture(stand_mouth, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//项链
			if (NeckPicFileNum == 0) { $gameScreen.erasePicture(stand_neck); }
			else {
				FileName = 'neck/' + StandPoseID + "_" + NeckPicFileNum;
				if ($gameScreen.picture(stand_neck) && $gameScreen.picture(stand_neck)._name == FileName) { }
				else { $gameScreen.showPicture(stand_neck, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//耳朵
			if (EarPicFileNum == 0) { $gameScreen.erasePicture(stand_ear); }
			else {
				FileName = 'ear/' + StandPoseID + "_" + EarPicFileNum;
				if ($gameScreen.picture(stand_ear) && $gameScreen.picture(stand_ear)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_ear, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
					if (!$dataArmors[earId].meta.noTone) {
						if ((CosplayFlag == 1 || StandAltFlag)) $gameScreen.picture(stand_ear)._tone = user.hairToneb;
						else $gameScreen.picture(stand_ear)._tone = user.hairTone;
					}
				}
				//发饰的尾巴处理
				FileName += 't';
				// if (earId == 6 && [51, 52, 53, 54, 55, 56].includes(FaceId)) {
				// 	switch (FaceId) {
				// 		case 51: FileName += "_a"; break;
				// 		case 52: FileName += "_b"; break;
				// 		case 53: FileName += "_c"; break;
				// 		case 54: FileName += "_d"; break;
				// 		case 55: FileName += "_e"; break;
				// 		case 56: FileName += "_f"; break;
				// 	}
				// }
				if ($gameScreen.picture(stand_tail) && $gameScreen.picture(stand_tail)._name == FileName) { }
				else {
					$gameScreen.showPicture(stand_tail, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
					if ($dataArmors[earId] && !$dataArmors[earId].meta.noTone) {
						if (StandAltFlag) $gameScreen.picture(stand_tail)._tone = user.hairToneb;
						else $gameScreen.picture(stand_tail)._tone = user.hairTone;
					}
				}
			}
			//避孕套
			if (!$gameSwitches.value(2910)) { $gameScreen.erasePicture(stand_byt); }
			else {
				FileName = 'BYT/' + StandPoseID + '_' + $gameVariables.value(4888);
				if ($gameScreen.picture(stand_byt) && $gameScreen.picture(stand_byt)._name == FileName) { }
				else { $gameScreen.showPicture(stand_byt, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//阴蒂环
			if (ClitPicFileNum == 0 || (clitId == 296 && $gameVariables._data[352] != 0)) { $gameScreen.erasePicture(stand_clitRing); }
			else {
				FileName = 'clit/' + StandPoseID + "_" + ClitPicFileNum;
				if ($gameScreen.picture(stand_clitRing) && $gameScreen.picture(stand_clitRing)._name == FileName) { }
				else { $gameScreen.showPicture(stand_clitRing, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//ピアスL
			if (PiercePicFileNum == 0) { $gameScreen.erasePicture(stand_pierceL); }
			else {
				FileName = 'nipple/' + StandPoseID + "_" + PiercePicFileNum;
				if ($gameScreen.picture(stand_pierceL) && $gameScreen.picture(stand_pierceL)._name == FileName) { }
				else { $gameScreen.showPicture(stand_pierceL, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//ピアスR
			if (PiercePicFileNumR == 0) { $gameScreen.erasePicture(stand_pierceR); }
			else {
				FileName = 'nipple/' + StandPoseID + "_" + PiercePicFileNumR;
				if ($gameScreen.picture(stand_pierceR) && $gameScreen.picture(stand_pierceR)._name == FileName) { }
				else { $gameScreen.showPicture(stand_pierceR, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//喷水
			if (!$gameSwitches.value(2914)) { $gameScreen.erasePicture(effect_splash); }
			else {
				FileName = BasePoseFileName + "_option_" + "0037";
				if ($gameScreen.picture(effect_splash) && $gameScreen.picture(effect_splash)._name == FileName) { }
				else { $gameScreen.showPicture(effect_splash, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//媚药
			if ($gameVariables.value(4845) <= 0) { $gameScreen.erasePicture(stand_potion); }
			else {
				if ($gameVariables.value(4845) <= 1) {
					FileName = 'mark/' + StandPoseID + "_14";
					if ($gameScreen.picture(stand_potion) && $gameScreen.picture(stand_potion)._name == FileName) { }
					else {
						$gameScreen.showPicture(stand_potion, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
					}
				} else {
					FileName = 'mark/' + StandPoseID + "_15";
					if ($gameScreen.picture(stand_potion) && $gameScreen.picture(stand_potion)._name == FileName) { }
					else {
						$gameScreen.showPicture(stand_potion, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
					}
				}
			}
			//精液body
			if (SemenBody < 1) { $gameScreen.erasePicture(stand_semenbody); }
			else {
				if (SemenBody >= 15) { var SemenBodyPicFileNum = "0006" }
				else if (SemenBody >= 8) { var SemenBodyPicFileNum = "0005" }
				else { var SemenBodyPicFileNum = "0004" }
				FileName = BasePoseFileName + "_semen_" + SemenBodyPicFileNum;
				if ($gameScreen.picture(stand_semenbody) && $gameScreen.picture(stand_semenbody)._name == FileName) { }
				else { $gameScreen.showPicture(stand_semenbody, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//精液face
			if (SemenFace < 1) { $gameScreen.erasePicture(stand_semenface); }
			else {
				if (SemenFace >= 15) { var SemenFacePicFileNum = "0003" }
				else if (SemenFace >= 8) { var SemenFacePicFileNum = "0002" }
				else { var SemenFacePicFileNum = "0001" }
				FileName = BasePoseFileName + "_semen_" + SemenFacePicFileNum;
				if ($gameScreen.picture(stand_semenface) && $gameScreen.picture(stand_semenface)._name == FileName) { }
				else { $gameScreen.showPicture(stand_semenface, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//精液下体
			if (SemenVagina < 1 && SemenAnus < 1) { $gameScreen.erasePicture(stand_semenhole); }
			else {
				if (SemenVagina >= 1 && SemenAnus >= 1) { var SemenHolePicFileNum = "0009" }
				else if (SemenVagina >= 1 && SemenAnus == 0) { var SemenHolePicFileNum = "0007" }
				else if (SemenVagina == 0 && SemenAnus >= 1) { var SemenHolePicFileNum = "0008" }
				else { }
				FileName = BasePoseFileName + "_semen_" + SemenHolePicFileNum;
				if ($gameScreen.picture(stand_semenhole) && $gameScreen.picture(stand_semenhole)._name == FileName) { }
				else { $gameScreen.showPicture(stand_semenhole, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//精液口
			if (SemenMouth < 1) { $gameScreen.erasePicture(stand_semenmouth); }
			else {
				FileName = BasePoseFileName + "_semen_" + "0010";
				if ($gameScreen.picture(stand_semenmouth) && $gameScreen.picture(stand_semenmouth)._name == FileName) { }
				else { $gameScreen.showPicture(stand_semenmouth, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0); }
			}
			//赋值
			if (poseName != 0 && StandPoseID >= 4) {
				OrganID = $sexPoseId[poseName].OrganID;
				Dif1PicFileName = $sexPoseId[poseName].Dif1PicFileName;
				Dif2PicFileName = $sexPoseId[poseName].Dif2PicFileName;
			}
			//还是if判断吧
			if (StandPoseID == 4) {//4(拘束)
				if (BindType == 2) { Dif1PicFileName = "tentacle"; }
				else if (BindType == 1) { Dif1PicFileName = "manhand"; Dif2PicFileName = "man"; }
				else if (BindType == 3) { Dif1PicFileName = "tentaclewall"; Dif2PicFileName = "tentaclewallback"; }
				else if (BindType == 4) { Dif1PicFileName = "worm"; }
				else if (BindType == 10) { Dif1PicFileName = "chain"; }
				else if (BindType == 11) { Dif1PicFileName = "tickle"; }
			}
			else if (StandPoseID == 5) {//5(片足上げ)
				if (VaginaStateID == 2 && AnusStateID == 2 && MouthStateID == 2) { Dif1PicFileName = "tentacle_07"; }//触手三穴
				else if (VaginaStateID == 2 && AnusStateID == 2) { Dif1PicFileName = "tentacle_04"; }
				else if (VaginaStateID == 2 && MouthStateID == 2) { Dif1PicFileName = "tentacle_05"; }//触手口膣
				else if (AnusStateID == 2 && MouthStateID == 2) { Dif1PicFileName = "tentacle_06"; }//触手口尻
				else if (VaginaStateID == 2) { Dif1PicFileName = "tentacle_02"; }
				else if (AnusStateID == 2) { Dif1PicFileName = "tentacle_03"; }
				else if (BindType == 2) { Dif1PicFileName = "tentacle_01"; }
				else if (VaginaStateID == 1) { Dif1PicFileName = "man01_penis_v"; Dif2PicFileName = "man01"; OrganID = 51; }
				else if (WaitStateID == 1) { Dif1PicFileName = "man01_penis"; Dif2PicFileName = "man01"; }
				else if (BindType == 20 && MouthStateID == 20) { Dif1PicFileName = "tentacleman_02"; Dif2PicFileName = "tentacleman"; }
				else if (BindType == 21 && MouthStateID == 21) { Dif1PicFileName = "tentacleman_03"; Dif2PicFileName = "tentacleman"; }
				else if (BindType == 21 && MouthStateID == 21 && WaitStateID == 21) { Dif1PicFileName = "tentacleman_04"; Dif2PicFileName = "tentacleman"; }
				else if (BindType == 21 && MouthStateID == 21 && VaginaStateID == 21) { Dif1PicFileName = "tentacleman_05"; Dif2PicFileName = "tentacleman"; }
				else if (BindType == 21 && MouthStateID == 21 && AnusStateID == 21) { Dif1PicFileName = "tentacleman_06"; Dif2PicFileName = "tentacleman"; }
				else if (BindType == 20) { Dif1PicFileName = "tentacleman_01"; }

			} else if (StandPoseID == 6) {//6(バック)
				if (VaginaStateID == 1) { Dif1PicFileName = "man01"; }
				else if (AnusStateID == 1) { Dif1PicFileName = "man01"; }

			} else if (StandPoseID == 7) {//7(二穴)
				if (VaginaStateID == 1 && AnusStateID == 1 && BindType == 10) { Dif1PicFileName = "man01_hand02"; Dif2PicFileName = "man01"; }
				else if (VaginaStateID == 1 && BindType == 10) { Dif1PicFileName = "man02_hand"; Dif2PicFileName = "man02"; }
				else if (VaginaStateID == 1 && AnusStateID == 1) { Dif1PicFileName = "man01_hand"; Dif2PicFileName = "man01"; }

			} else if (StandPoseID == 8) {//8(開脚))
				if (VaginaStateID == 1 && AnusStateID == 1 && BindType == 9) { Dif1PicFileName = "tentaclechair_w";; Dif2PicFileName = "tentaclechair"; }
				else if (BindType == 9) { Dif1PicFileName = "tentaclechair_f";; Dif2PicFileName = "tentaclechair"; }
				else if (BindType == 8) { Dif1PicFileName = "tentaclehypnosis"; }
				else if (AnusStateID == 1 && MouthStateID == 1 && VaginaStateID == 1) { Dif1PicFileName = "penis_maa";; Dif2PicFileName = "man01"; OrganID = 82; }
				else if (VaginaStateID == 1 && MouthStateID == 1) { Dif1PicFileName = "penis_m";; Dif2PicFileName = "man01"; OrganID = 81; }
				else if (AnusStateID == 1 && MouthStateID == 1) { Dif1PicFileName = "penis_ma";; Dif2PicFileName = "man01"; }
				else if (VaginaStateID == 1) { Dif1PicFileName = "man01_penis_v";; Dif2PicFileName = "man01"; OrganID = 81; }
				else if (AnusStateID == 1) { Dif1PicFileName = "man01_penis_a";; Dif2PicFileName = "man01"; }

			} else if (StandPoseID == 9) {//9(奉仕)
				if (MouthStateID == 1) { Dif1PicFileName = "mouthhuman"; }
				else if (MouthStateID == 2) { Dif1PicFileName = "mouthtentacle"; }

			} else if (StandPoseID == 10) {//10倒地
				if (VaginaStateID == 1) { Dif1PicFileName = "man"; }
			} else { }





			// let key = `${StandPoseID}_${BindType}_${MouthStateID}_${VaginaStateID}_${AnusStateID}_${WaitStateID}`;
			// // 检查组合是否存在于映射中，并相应更新文件名
			// if (BindTypeRestraint.hasOwnProperty(key)) {
			// 	[Dif1PicFileName, Dif2PicFileName, OrganID] = BindTypeRestraint[key];
			// }
			// //方便自动创建字典列表
			// // if (typeof bbb === "undefined") bbb = 0;
			// // var aaa = "'"+key+"'"+":['"+Dif1PicFileName+"','"+Dif2PicFileName+"','"+OrganID+"']"
			// // if(aaa !== bbb)
			// // {
			// // 	console.log(aaa)
			// // 	bbb = aaa;
			// // }

			if (user.hasArmor($dataArmors[83]) && StandPoseID == 8 && VaginaStateID == 1) Dif1PicFileName += 'b';
			if (VaginaStateID > 0) user.biriSocks();
			if (StandPoseID <= 2) { FileName = 'weapon/' + StandPoseID + '_' + weaponIndex; Dif1PicFileName = weaponIndex; }
			else FileName = "sexual/" + StandPoseID + "_" + Dif1PicFileName;
			if ($gameScreen.picture(stand_diffront) && $gameScreen.picture(stand_diffront)._name == FileName) {
				//既に同じファイル名が表示されてる場合はスルー
			} else {
				if (Dif1PicFileName != 0) {
					$gameScreen.showPicture(stand_diffront, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
				} else {
					$gameScreen.erasePicture(stand_diffront)
				}
			}
			FileName = "organ/" + OrganID + 'v';
			if ($gameScreen.picture(stand_pv) && $gameScreen.picture(stand_pv)._name == FileName) {
				//既に同じファイル名が表示されてる場合はスルー
			} else {
				if (OrganID != 0) {
					$gameScreen.showPicture(stand_pv, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0)
					if (!ConfigManager.noBlacken) $gameScreen.showPicture(stand_pvb, FileName + 'b', origin, Stand1X, Stand1Y, scale, scale, ((($gameVariables.value(1104) + $gameVariables.value(1106)) * 10 + $gameVariables.value(1045)) / 2.5).clamp(0, 160), 0)
				} else {
					$gameScreen.erasePicture(stand_pv)
					$gameScreen.erasePicture(stand_pvb)
				}
			}


			FileName = "sexual/" + StandPoseID + "_" + Dif2PicFileName//ファイル名指定
			if ($gameScreen.picture(stand_difback) && $gameScreen.picture(stand_difback)._name == FileName) {
				//既に同じファイル名が表示されてる場合はスルー
			} else {
				if (Dif2PicFileName != 0) {
					$gameScreen.showPicture(stand_difback, FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0)
				} else {
					$gameScreen.erasePicture(stand_difback)
				}
			}

			//アニメーション座標
			if (StandAnimeX != 0 || StandAnimeY != 0) {
				$gameVariables._data[902] = Stand1X
				$gameVariables._data[903] = Stand1Y
				var StandMoveX = Stand1X
				var StandMoveY = Stand1Y
				StandMoveX = Stand1X + StandAnimeX
				StandMoveY = Stand1Y + StandAnimeY
				this.wait(5)

				//動かす処理
				for (var i = 0; i < stand_array.length; i++) {
					MovePic(stand_array[i], Stand1X, Stand1Y, StandMoveX, StandMoveY, StandAnimeWait)
				}
				this.wait(5)
			}

			//呼吸处理
			if ($gameScreen.picture(effect_breath)) {
				if (!window.breathDir) window.breathDir = -5
				if (window.breathDir >= 0) {
					window.breathDir -= 5;
					if (Math.abs(window.breathDir) < 10) {
						if (user.isStateAffected(316)) {
							window.breathDir = -25;
							$gameScreen.movePicture(effect_breath, origin, Stand1X, Stand1Y, scale, scale, 255, 0, 15);
						} else {
							window.breathDir = -35;
							$gameScreen.movePicture(effect_breath, origin, Stand1X, Stand1Y, scale, scale, 180, 0, 20);
						}
					}
				} else {
					window.breathDir += 5;
					if (Math.abs(window.breathDir) < 10) {
						if (user.isStateAffected(316)) {
							window.breathDir = 65;
							$gameScreen.movePicture(effect_breath, origin, Stand1X, Stand1Y, scale, scale, 0, 0, 45);
						} else {
							window.breathDir = 95;
							$gameScreen.movePicture(effect_breath, origin, Stand1X, Stand1Y, scale, scale, 0, 0, 60);
						}
					}
				}
			}
		};//おわり


		//消去コマンド
		if (command === 'ResetStandEro') {//消去1
			$gameVariables._data[912] = 0//強制指定解除
			$gameVariables._data[415] = 0//拘束相手
			$gameVariables._data[351] = 0//口
			$gameVariables._data[352] = 0//膣
			$gameVariables._data[353] = 0//尻
			$gameVariables._data[354] = 0//挿入まち
			$gameScreen.erasePicture(110)
			$gameScreen.erasePicture(149) //这俩为敌人图层
		}

		if (command === 'EraceStand1' || command === 'EraceStand') {//消去1
			for (var i = 34; i <= 59; i++) { $gameScreen.erasePicture(i); }
			for (var i = 110; i <= 151; i++) { $gameScreen.erasePicture(i); }
		}


		if (command === 'TempEraceStand1' || command === 'イベント中一時立ち絵消去') {//消去1
			$gameSwitches._data[46] = true;
		}


		if (command === 'StandAnimation') {//アニメーションのみ
			var Stand1X = 450
			var Stand1Y = 50
			if (args[0] != null) { var StandAnimeX = Number(args[0]) } else { var StandAnimeX = 0 };//アニメーション座標X
			if (args[1] != null) { var StandAnimeY = Number(args[1]) } else { var StandAnimeY = 0 };//アニメーション座標Y
			if (args[2] != null) { var StandAnimeWait = Number(args[2]) } else { var StandAnimeWait = 1 };//アニメーションウェイト
			if (StandAnimeX != 0 || StandAnimeY != 0) {
				var StandMoveX = Stand1X + StandAnimeX
				var StandMoveY = Stand1Y + StandAnimeY
				for (var i = 110; i <= 150; i++) {
					MovePic(i, Stand1X, Stand1Y, StandMoveX, StandMoveY, StandAnimeWait)
				}
			}
		}
	};
	/**
	 * 根据状态更新对应变量的值
	 * @param {Array} userStates 需要判断的状态数组
	 * @param {Array} assignment 需要根据对应状态增加或修改的值数组
	 * @returns 
	 */
	function updatestate_for_value(userStates, assignment) {
		const stateIndex = userStates.findIndex(id => $gameActors.actor(1)._states.includes(id));
		if (stateIndex >= 0) return assignment[stateIndex]
		if (stateIndex <= -1) return typeof assignment[0] === 'number' ? 0 : ""
	}
	/**
	 * @param MovePic 移动图片函数
	 * @param TempPicNum：图片编号
	 * @param Stand1X：图片1的X坐标
	 * @param Stand1Y：图片1的Y坐标
	 * @param StandMoveX：移动点的X坐标
	 * @param StandMoveY：移动点的Y坐标
	 * @param StandAnimeWait：移动动画等待时间
	 */
	function MovePic(TempPicNum, Stand1X, Stand1Y, StandMoveX, StandMoveY, StandAnimeWait) {
		if ($gameScreen.picture(TempPicNum)) {
			Torigoya.Tween.create($gameScreen.picture(TempPicNum))
				.to({ _x: StandMoveX, _y: StandMoveY }, StandAnimeWait, Torigoya.Tween.Easing.easeOutSine)
				.to({ _x: Stand1X, _y: Stand1Y }, StandAnimeWait, Torigoya.Tween.Easing.easeOutSine).start()
		}
	}
	function AutoFaceId(user) {
		if ($gameSwitches.value(15) || $gameSwitches.value(34)) { var FaceId = $gameVariables.value(895) }//イベント中or立ち絵エロ中はFaceIdで指定
		else {
			var FaceId = 2
			var Estrus = 35
			var Battle = 13
			var Extasy = 34
			var ShameSmile = 33
			var ShameUnhappy = 32
			var Shame = 31
			var Jito = 17
			var Joy = 5
			var Stern = 7
			var Yoin = 37
			var PokerFace = 2
			var MouthOpen = 25
			var Damage = 15
			var Orgasm = 36
			var BigOrgasm = 41
			var Hyp = 38

			if (user._classId > 2) { FaceId = 50; }//魅魔
			else if ($gameVariables.value(916) == 9 && $gameVariables.value(351) >= 1) { FaceId = MouthOpen }//奉仕
			else if (user.isStateAffected(164)) { FaceId = BigOrgasm }//强绝顶
			else if (user.isStateAffected(163)) { FaceId = Orgasm }//弱绝顶
			else if ($gameVariables.value(1027) >= 150) { FaceId = 61; }//発情150
			else if ($gameVariables.value(1027) >= 100) { FaceId = 60; }//発情100
			else if (user.isStateAffected(165)) {
				if ($gameVariables.value(1033) == 3) FaceId = 40;
				else FaceId = 37;
			}//绝顶余韵
			else if ($gameVariables.value(1027) >= 50) { FaceId = Estrus; }//発情50
			else if ($gameVariables.value(1026) >= $gameVariables.value(619) * 0.5) { FaceId = Extasy }//快感高
			else if ($gameVariables.value(1020) >= 1) { FaceId = ShameUnhappy }//ぶっかけ
			else if (user.isStateAffected(28)) { FaceId = Shame }//羞恥
			else if ($gameParty.inBattle()) {
				if ($gameSwitches.value(38)) { FaceId = Joy }//战斗结束
				else if ($gameSwitches.value(170)) { FaceId = Damage }//战斗受伤
				else if (user.isStateAffected(410)) { FaceId = Hyp }
				else { FaceId = Battle }//战斗开始
			}//暫定
			else if (user.isStateAffected(220)) { FaceId = Damage }//感情受伤
			else if (user.isStateAffected(219)) { FaceId = Jito }//感情じとー
			else if (user.isStateAffected(216)) { FaceId = Yoin }//感情余韻
			else if (user.isStateAffected(221)) { FaceId = Shame }//感情羞恥
			else if ($gameSwitches.value(228)) { FaceId = Shame }//露出中オン
			else if (user._equips[1]._itemId == 0 && $dataMap.meta["PubricSpot"]) {
				if ($gameVariables.value(1021) >= 100) {
					FaceId = ShameSmile
				} else { FaceId = Shame }
			}//全裸
			else if (user.hp < user.mhp / 4) { FaceId = 14 }
			else if ($dataMap.meta["EnemyBase"]) { FaceId = Stern }//平常敵ダンジョン攻略中
			else { FaceId = PokerFace };//平常
		}
		$gameVariables._data[895] = FaceId //変数に代入しておく
		return FaceId
	}
	/**
	 * @param stand_hair 发型的图层
	 * @param {String} FileName 发型的文件名 
	 */
	hairStyles = (stand_hair, FileName, origin, Stand1X, Stand1Y, scale) => {
		if ($gameScreen.picture(stand_hair) && $gameScreen.picture(stand_hair)._name == FileName) { }
		else {
			const StandAltFlag = $gameSwitches.value(131) ? true : false
			const user = $gameActors.actor(1);
			var realPictureId = $gameScreen.realPictureId(stand_hair);
			var P = new Game_Picture();
			P.show(FileName, origin, Stand1X, Stand1Y, scale, scale, 255, 0);
			P._tone = StandAltFlag ? user.hairToneb : user.hairTone;
			if (FileName.slice(0, 9) == 'hairDress') P._tone = user.hairDtone;
			$gameScreen._pictures[realPictureId] = P;
		}
	}
})();