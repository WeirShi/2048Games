/*
 *  localStorage
 *  @param { key, value }
 */

function setStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}

function getStorage(name) {
    return JSON.parse(localStorage.getItem(name));
}

var game = {
        data: null, //保存游戏的数据:二维数组
        RN: 4,
        CN: 4, //总行数,总列数
        score: 0, //保存当前得分
        topScore: 0, //保存最高分
        state: 1, //保存游戏状态
        RUNNING: 1, //运行中
        GAMEOVER: 0, //游戏结束
        init: function() {
            /*动态生成gridPanel中的div*/
            //r从0开始，到<RN结束，同时创建空数组arr
            for (var r = 0, arr = []; r < this.RN; r++) {
                //c从0开始，到<CN结束
                for (var c = 0; c < this.CN; c++) {
                    //向arr中压入:""+r+c
                    arr.push("" + r + c);
                }
            }
            var strGrid = '<div id="g' +
                arr.join('" class="grid"></div><div id="g') +
                '" class="grid"></div>';
            var strCell = '<div id="c' +
                arr.join('" class="cell"></div> <div id="c') +
                '" class="cell"></div>';
            //设置id为gridPanel的内容为strGrid+strCell
            gridPanel.innerHTML = strGrid + strCell;
            //计算gridPanel的宽
            var width = this.CN * 116 + 16 + "px";
            var height = this.RN * 116 + 16 + "px";
            //设置gridPanel的宽和高
            gridPanel.style.width = width;
            gridPanel.style.height = height;
        },
        start: function() {
            //动态生成gridPanel中的div
            this.init();
            this.state = this.RUNNING;
            //从cookie中读取出最高分
            this.topScore = getStorage("topScore");
            this.topScore == "" && (this.topScore = 0);
            this.score = 0; //分数归零
            /*初始化data为RNxCN的二维数组*/
            //新建空数组保存在当前对象的data属性中
            this.data = [];
            //r从0开始，到<RN结束,每次增1
            for (var r = 0; r < this.RN; r++) {
                //创建空数组，保存在data数组的r位置
                this.data[r] = [];
                //c从0开始，到<CN结束，每次增1
                for (var c = 0; c < this.CN; c++) {
                    //设置data中r行c列为0
                    this.data[r][c] = 0;
                }
            } //(遍历结束)
            //调用2次randomNum方法，生成2个随机数
            this.randomNum();
            this.randomNum();
            this.updateView(); //更新界面
            //绑定键盘事件:
            document.onkeydown = function(e) {
                console.log(this);
                //this->start方法的this->game
                switch (e.keyCode) {
                    case 37:
                        this.moveLeft();
                        break;
                    case 38:
                        this.moveUp();
                        break;
                    case 39:
                        this.moveRight();
                        break;
                    case 40:
                        this.moveDown();
                        break;
                }
            }.bind(this);
        },
        isGameOver: function() { //判断游戏是否结束
            //遍历data中每个元素
            for (var r = 0; r < this.RN; r++) {
                for (var c = 0; c < this.CN; c++) {
                    //如果当前元素是0
                    if (this.data[r][c] == 0) {
                        return false; //返回false
                    }
                    //如果c<CN-1,且当前元素等于右侧元素
                    if (c < this.CN - 1 &&
                        this.data[r][c] ==
                        this.data[r][c + 1]) {
                        return false; //返回false
                    }
                    //如果r<RN-1,且当前元素等于下方元素
                    if (r < this.RN - 1 &&
                        this.data[r][c] ==
                        this.data[r + 1][c]) {
                        return false; //返回false
                    }
                }
            } //(遍历结束)
            return true; //返回true
        },
        // 移动格子时 数据的对比
        move: function(iterator) {
            //给data拍照，保存在before中
            var before = String(this.data);
            iterator(); //this->game
            //给data拍照，保存在after中
            var after = String(this.data);
            if (before != after) { //如果before!=after
                //生成随机数，更新页面
                this.randomNum();
                //如果游戏结束
                if (this.isGameOver()) {
                    //修改游戏状态为GAMEOVER
                    this.state = this.GAMEOVER;
                    //如果当前得分>最高分
                    if (this.score > this.topScore) {
                        //在缓存中写入最高分
                        setStorage(
                            "topScore",
                            this.score
                        );
                    }
                }
                this.updateView();
            }
        },
        moveUp: function() { //上移所有列
            this.move(function() {
                for (var c = 0; c < this.CN; c++) {
                    this.moveUpInCol(c);
                }
            }.bind(this));
        },
        moveUpInCol: function(c) { //上移第c列
            //r从0开始，到<RN-1结束,递增1
            for (var r = 0; r < this.RN - 1; r++) {
                //查找r行c列下方下一个不为0的位置nextr
                var nextr = this.getNextInCol(r, c);
                //如果nextr是-1，退出循环
                if (nextr == -1) { break; } else { //否则  
                    //如果r行c列的值为0
                    if (this.data[r][c] == 0) {
                        //将nextr行c列的值保存到r行c列
                        this.data[r][c] =
                            this.data[nextr][c];
                        //将nextr行c列改为0
                        this.data[nextr][c] = 0;
                        r--; //r留在原地
                    } else if (this.data[r][c] ==
                        this.data[nextr][c]) {
                        //否则，如果r行c列等于nextr行c列
                        //将r行c列*2
                        this.data[r][c] *= 2;
                        //将nextr行c列改为0
                        this.data[nextr][c] = 0;
                        //将r行c列的新值累加到score中
                        this.score += this.data[r][c];
                    }
                }
            }
        },
        getNextInCol: function(r, c) {
            //nextr从r+1开始，到<CN结束，递增1
            for (var nextr = r + 1; nextr < this.CN; nextr++) {
                //如果nextr行c列不等于0
                if (this.data[nextr][c] != 0) {
                    return nextr; //返回nextr
                }
            } //(遍历结束)
            return -1; //返回-1
        },
        moveDown: function(c) { // 下移所有列
            console.log("Down");
            this.move(function() {
                for (var c = 0; c < this.CN; c++) {
                    this.moveDownInCol(c);
                }
            }.bind(this));
        },
        moveDownInCol: function(c) { //下移第c列
            for (var r = this.RN - 1; r > 0; r--) {
                var prevr = this.getPrevInCol(r, c);
                if (prevr == -1) {
                    break;
                } else {
                    if (this.data[r][c] == 0) {
                        //将nextr行c列的值保存到r行c列
                        this.data[r][c] =
                            this.data[prevr][c];
                        //将nextr行c列改为0
                        this.data[prevr][c] = 0;
                        r++; //r留在原地
                    } else if (this.data[r][c] ==
                        this.data[prevr][c]) {
                        //否则，如果r行c列等于nextr行c列
                        //将r行c列*2
                        this.data[r][c] *= 2;
                        //将nextr行c列改为0
                        this.data[prevr][c] = 0;
                        //将r行c列的新值累加到score中
                        this.score += this.data[r][c];
                    }
                }
            }
        },
        getPrevInCol: function(r, c) {
            //nextr从r+1开始，到<CN结束，递增1
            for (var ptevr = r - 1; ptevr >= 0; ptevr--) {
                //如果nptevr行c列不等于0
                if (this.data[ptevr][c] != 0) {
                    return ptevr; //返回nextr
                }
            } //(遍历结束)
            return -1; //返回-1
        },
        moveLeft: function() { //左移所有行
            this.move(function() {
                //r从0开始，到<RN结束，遍历data每一行
                for (var r = 0; r < this.RN; r++) {
                    this.moveLeftInRow(r);
                } //(遍历结束)
            }.bind(this));
        },
        moveLeftInRow: function(r) { //左移第r行
            //c从0开始，到<CN-1结束,遍历data中r行的每个元素
            for (var c = 0; c < this.CN - 1; c++) {
                var nextc = this.getNextInRow(r, c);
                //如果nextc等于-1，退出循环
                if (nextc == -1) { break; } else { //否则
                    //如果data中r行c列等于0
                    if (this.data[r][c] == 0) {
                        //将data中r行c列的值设置为data中r行nextc列的值
                        this.data[r][c] =
                            this.data[r][nextc];
                        //将data中r行nextc列的值置为0
                        this.data[r][nextc] = 0;
                        c--; //c留在原地
                    } else if (this.data[r][c] ==
                        this.data[r][nextc]) {
                        //否则，如果data中r行c列等于data中r行nextc列的值
                        //将data中r行c列的值*2
                        this.data[r][c] *= 2;
                        //将data中r行nextc列的值置为0
                        this.data[r][nextc] = 0;
                        //将r行c列的新值累加到score中
                        this.score += this.data[r][c];
                    }
                }
            }
        },
        getNextInRow: function(r, c) {
            /*查找r行c列右侧下一个不为0的位置*/
            //nextc从c+1开始，nextc到<CN结束
            for (var nextc = c + 1; nextc < this.CN; nextc++) {
                //如果data中r行nextc位置不等于0
                if (this.data[r][nextc] != 0) {
                    return nextc; //返回nextc
                }
            } //(遍历结束)
            return -1; //返回-1
        },

        moveRight: function() { //右移所有行
            this.move(function() {
                //遍历data中每一行
                for (var r = 0; r < this.RN; r++) {
                    this.moveRightInRow(r);
                } //(遍历结束) 
            }.bind(this));
        },
        moveRightInRow: function(r) { //右移第r行
            //c从CN-1开始，到>0结束，每次递减1
            for (var c = this.CN - 1; c > 0; c--) {
                //查找r行c列左侧前一个不为0的位置prevc
                var prevc = this.getPrevInRow(r, c);
                //如果prevc等于-1，就退出循环
                if (prevc == -1) { break; } else { //否则
                    //如果c位置的值等于0
                    if (this.data[r][c] == 0) {
                        //将prevc位置的值保存到c位置
                        this.data[r][c] =
                            this.data[r][prevc]
                            //将prevc位置的值改为0
                        this.data[r][prevc] = 0;
                        c++; //c留在原地
                    } else if (this.data[r][c] ==
                        this.data[r][prevc]) {
                        //否则，如果c位置的值等于prevc位置的值
                        //将c位置的值*2
                        this.data[r][c] *= 2;
                        //将prevc位置的值改为0
                        this.data[r][prevc] = 0;
                        //将r行c列的新值累加到score中
                        this.score += this.data[r][c];
                    }
                }
            }
        },
        getPrevInRow: function(r, c) {
            /*查找r行c列左侧前一个不为0的位置*/
            //prevc从c-1开始，到>=0结束，递减1
            for (var prevc = c - 1; prevc >= 0; prevc--) {
                //如果data中r行prevc列的值不等于0
                if (this.data[r][prevc] != 0) {
                    return prevc; //返回prevc
                }
            } //(遍历结束)
            return -1; //返回-1
        },

        updateView: function() {
            //设置id为topScore的元素内容为当前对象的topScore属性
            topScore.innerHTML = this.topScore;
            /*将data中的数据更新到页面对应的div中*/
            //遍历data中每个元素
            for (var r = 0; r < this.RN; r++) {
                for (var c = 0; c < this.CN; c++) {
                    //声明变量id，值为:"c"+r+c
                    //找到id等于id的元素，保存在变量div
                    var div =
                        document.getElementById("c" + r + c);
                    //如果data中r行c列不等于0
                    if (this.data[r][c] != 0) {
                        //设置div的内容为data中r行c列的值
                        div.innerHTML = this.data[r][c];
                        //设置div的className属性为:
                        //"cell n"+data中r行c列的值
                        div.className =
                            "cell n" + this.data[r][c];
                    } else { //否则
                        //清除div的内容
                        div.innerHTML = "";
                        //设置div的className属性为:"cell"
                        div.className = "cell";
                    }
                }
            }
            //这是id为score的元素的内容为当前对象的score属性
            score.innerHTML = this.score;
            //如果游戏的状态是GAMEOVER
            if (this.state == this.GAMEOVER) {
                //设置id为finalScore的span的内容为score属性
                finalScore.innerHTML = this.score;
                //找到id为gameOver的div，设置其显示
                gameOver.style.display = "block";
            } else { //否则
                //找到id为gameOver的div，设置其隐藏
                gameOver.style.display = "none";
            }
        },
        randomNum: function() {
            /*在随机的空白位置生成一个2或4*/
            //循环执行
            while (true) {
                //在0~RN-1之间生成一个随机整数，保存在变量r中
                var r = parseInt(Math.random() * this.RN);
                //在0~CN-1之间生成一个随机整数，保存在变量c中
                var c = parseInt(Math.random() * this.CN);
                console.log(r, c);
                //如果data中r行c列等于0
                if (this.data[r][c] == 0) {
                    //设置data中r行c列的值为:
                    //调用Math.random(),如果>0.5，值为4，否则值为2;
                    this.data[r][c] =
                        Math.random() > 0.5 ? 4 : 2;
                    break; //退出循环
                }
            }
        },
    }
    //页面加载后，启动游戏
window.onload = function() { game.start() }