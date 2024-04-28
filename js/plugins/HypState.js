(function () {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'CMstate') {
            SceneManager.push(Scene_HypStatus);
        }
    }

    let HypSETTING = {
        Background: { file: 'hyp/status/HypStatus_', vid: "催眠等级" },
        Other: [
            { label: '    ', vid: 1090, wx: 30, wy: 80, width: 150 },
            { label: '  . . . . . .  ', vid: 1019, wx: 180, wy: 135, width: 115 }
        ],
        HeartIdea: [
            { label: '对h的看法', vid:"性看法",wx: 400, wy: 0, width: 150 },
            { label: '主人的名字', vid: "主人名字", wx: 400, wy: 20, width: 150 }
        ],
        Heart: [
            { file: 'hyp/status/HypStatusHeart_', fx: 262, fy: 210, vid: "催眠等级" }
        ],
        Status: [
            { label: '口腔侵蚀度', file: 'hyp/status/hypstate_1_', fx: 938, fy: 95, vid: "口侵蚀", wx: 690, wy: 0, width: 105, border: [0, 1, 2, 3, 4, 5] },
            { label: '胸部侵蚀度', file: 'hyp/status/hypstate_2_', fx: 780, fy: 285, vid: "胸侵蚀", wx: 855, wy: 194, width: 105, border: [0, 1, 2, 3, 4, 5] },
            { label: '小穴侵蚀度', file: 'hyp/status/hypstate_3_', fx: 940, fy: 475, vid: "穴侵蚀", wx: 690, wy: 380, width: 105, border: [0, 1, 2, 3, 4, 5] },
            { label: '屁穴侵蚀度', file: 'hyp/status/hypstate_4_', fx: 780, fy: 665, vid: "股侵蚀", wx: 855, wy: 575, width: 105, border: [0, 1, 2, 3, 4, 5] }
        ],
        Objective: [
            { vid: 80, wx: 398, wy: 600, width: 250 },
            { vid: 81, wx: 398, wy: 640, width: 250 },
            { vid: 82, wx: 398, wy: 680, width: 250 }
        ],
        SpriteAction: { min_scale: 0.95, max_scale: 1.0, duration: 35 }
    }

    // 定义一个新的Scene
    function Scene_HypStatus() {
        this.initialize.apply(this, arguments);
        let setting = HypSETTING.SpriteAction;
        this._fluctuation = (setting.max_scale - setting.min_scale) / setting.duration;
    }

    Scene_HypStatus.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_HypStatus.prototype.constructor = Scene_HypStatus;

    Scene_HypStatus.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };
    //创建
    Scene_HypStatus.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createBaseWindow();
        this.createHeartSprite();
        this.createHypStatusSprite();
        document.addEventListener('keydown', this.onKeyDownB.bind(this));
    }
    //状态图背景
    Scene_HypStatus.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = ImageManager.loadPicture(HypSETTING.Background.file + $CM_value.get(HypSETTING.Background.vid));
        this.addChild(this._backgroundSprite);
    }
    Scene_HypStatus.prototype.settingFont = function (size, color, bold, italic) {
        this._baseWindow.contents.fontSize = size;
        this._baseWindow.standardFontSize = function () { return size; };
        if (color !== undefined) this._baseWindow.contents.textColor = color;
        if (bold !== undefined) this._baseWindow.contents.fontBold = bold;
        if (italic !== undefined) this._baseWindow.contents.fontItalic = italic;
    }
    //创建窗口
    Scene_HypStatus.prototype.createBaseWindow = function () {
        this._baseWindow = new Window_Selectable(0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this._baseWindow.setHandler('cancel', this.popScene.bind(this));
        this._baseWindow.opacity = 0;
        this._baseWindow.activate();
        this.addWindow(this._baseWindow);
    }
    Scene_HypStatus.prototype.createHypStatusSprite = function () {
        HypSETTING.Status.forEach((setting, i) => {
            let num = 0;
            setting.border.forEach((border, index) => {
                if (border <= $CM_value.get(setting.vid)) {
                    num = index;
                }
            });
            let sprite = new Sprite(ImageManager.loadPicture(setting.file + num));
            sprite.x = setting.fx;
            sprite.y = setting.fy;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this._backgroundSprite.addChild(sprite);
        });
    }
    Scene_HypStatus.prototype.createHeartSprite = function () {
        let heart = HypSETTING.Heart[0];
        let sprite = new Sprite(ImageManager.loadPicture(heart.file + $CM_value.get(heart.vid)));
        sprite.x = heart.fx;
        sprite.y = heart.fy;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this._backgroundSprite.addChild(sprite);
    }

    Scene_HypStatus.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this);
        this.drawStatus();
        this.drawObjective();
        this.drawOther();
        this.drawHypinstruct();
        this.drawHeartIdea();
    }

    Scene_HypStatus.prototype.drawStatus = function () {
        HypSETTING.Status.forEach((status) => {
            let wx = status.wx;
            let wy = status.wy;
            let width = status.width;
            this.settingFont(15);
            this._baseWindow.drawTextEx('\\I[484]', wx, wy);
            this._baseWindow.drawText(status.label, wx, wy, width, 'right');
            this._baseWindow.contents.textColor = '#f686f0';
            this._baseWindow.drawText($CM_value.get(status.vid), wx, wy, width + 15, 'right');
            this._baseWindow.resetTextColor();
        });
        delete this._baseWindow.standardFontSize;
        this._baseWindow.contents.fontSize = this._baseWindow.standardFontSize();
    }

    Scene_HypStatus.prototype.drawObjective = function () {
        HypSETTING.Objective.forEach((objective) => {
            let wx = objective.wx;
            let wy = objective.wy;
            let width = objective.width;
            this.settingFont(15, '#f686f0');
            this._baseWindow.drawText($gameActors.actor(objective.vid)._name, wx, wy, width, 'left');
            this._baseWindow.resetTextColor();
        });
        delete this._baseWindow.standardFontSize;
        this._baseWindow.contents.fontSize = this._baseWindow.standardFontSize();
    }
    Scene_HypStatus.prototype.drawHeartIdea = function () {
        HypSETTING.HeartIdea.forEach((heartidea) => {
            let wx = heartidea.wx;
            let wy = heartidea.wy;
            let width = heartidea.width;
            this.settingFont(15, '#f686f0');
            this._baseWindow.drawText(heartidea.label+"： "+$CM_value.get(heartidea.vid), wx, wy, width, 'left');
            this._baseWindow.resetTextColor();
        });
        delete this._baseWindow.standardFontSize;
        this._baseWindow.contents.fontSize = this._baseWindow.standardFontSize();
    }
    Scene_HypStatus.prototype.drawHypinstruct = function () {
        const hypInstruct = $hypnosisbase;
        let wx = 30;
        let wy = 230; 
        for (let key in hypInstruct) {
            if (key <= 3) continue;
            if (key == 44) return;
            if (hypInstruct[key].ParaName == "") continue;
            this.settingFont(15, '#d5b5d8', true, false);
            if ($CM_value.get(key - 2) >= 1) {
                this._baseWindow.drawText(hypInstruct[key].ParaName, wx, wy, 300, 'left');
            }
            else {
                this._baseWindow.drawText("? ? ? ? ? ?", wx, wy, 300, 'left');
            }
            wy += 20;
            if (wy >= 680) { wx = 200; wy = 230; }
        }
        delete this._baseWindow.standardFontSize;
        this._baseWindow.contents.fontSize = this._baseWindow.standardFontSize();
    }

    Scene_HypStatus.prototype.drawOther = function () {
        HypSETTING.Other.forEach((other, index) => {
            let skillID = 0;
            switch ($CM_value.get("催眠等级")) {
                case 1: skillID = 1091; break;
                case 2: skillID = 1092; break;
                case 3: skillID = 1093; break;
                case 4: skillID = 1094; break;
                case 5: skillID = 1095; break;
                default: skillID = 1090;
            }
            let wx = other.wx;
            let wy = other.wy;
            let width = other.width;
            this.settingFont(22, '#d5b5d8', true, true);
            if (index === 0) {
                this._baseWindow.drawText(other.label + $dataSkills[skillID].battleDisplayText, wx, wy, width, 'right');
            }
            else if (index === 1) {
                this._baseWindow.contents.fontItalic = true;
                this._baseWindow.drawText(other.label + $gameVariables.value(other.vid) + " / " + $gameVariables.value(3142), wx, wy, width, 'right');
            }
            this._baseWindow.resetTextColor();
        });
        delete this._baseWindow.standardFontSize;
        this._baseWindow.contents.fontSize = this._baseWindow.standardFontSize();
    }

    Scene_HypStatus.prototype.update = function () {
        Scene_MenuBase.prototype.update.call(this);
        let setting = HypSETTING.SpriteAction;
        let scale = this._backgroundSprite.children[0].scale.x;
        scale += this._fluctuation;
        if (scale <= setting.min_scale) {
            scale = setting.min_scale;
            this._fluctuation *= -1;
        }
        if (scale >= setting.max_scale) {
            scale = setting.max_scale;
            this._fluctuation *= -1;
        }
        this._backgroundSprite.children.forEach((sprite) => {
            sprite.scale.x = scale;
            sprite.scale.y = scale;
        });
    }
    Scene_HypStatus.prototype.onKeyDownB = function (event) {
        if ((SceneManager._scene._sceneName == "Scene_HypStatus" && event.keyCode === 66)) {
            SceneManager.goto(Scene_Map);
        }
    };
})();















