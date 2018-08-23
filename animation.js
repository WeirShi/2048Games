/*
 *  移动每个格子的动画
 */

//定义每次，每个格子，两个方向移动步长的对象
function Task(div, stepX, stepY) {
    this.div = div;
    this.stepX = stepX;
    this.stepY = stepY;
}
var animation = {
    CSIZE: 100, //保存每个格子的大小
    MARGIN: 16, //保存格子之间的间距
    DURATION: 200, //动画的总时间
    STEPS: 40, //动画的总步数
    moved: 0, //动画已经移动了的步数
    interval: 0, //动画的时间间隔
    timer: null, //动画的序号
    tasks: [], //保存所有要移动的任务
    init: function() {
        this.interval = this.DURATION / this.STEPS;
    },
    //向tasks数组中添加task
    addTask: function(
        divR, divC, offsetC, offsetR) {
        //查找页面上id为c+divR+divC的div，保存在变量div中
        var div =
            document.getElementById(
                "c" + divR + divC
            );
        console.log(div);
        //offsetC*(CSIZE+MARGIN)/STEPS,保存在变量stepX中
        var stepX =
            offsetC * (this.CSIZE + this.MARGIN) /
            this.STEPS;
        //offsetR*(CSIZE+MARGIN)/STEPS,保存在变量stepY中
        var stepY =
            offsetR * (this.CSIZE + this.MARGIN) /
            this.STEPS;
        this.tasks.push(
            new Task(div, stepX, stepY)
        );
    },
    start: function(callback) { //启动动画
        console.log("启动动画");
        this.timer = setInterval(
            this.moveStep.bind(this, callback),
            this.interval
        );
    },
    moveStep: function(callback) { //移动每一步
        //遍历当前对象的tasks数组中每个任务
        for (var i = 0; i < this.tasks.length; i++) {
            var task = this.tasks[i];
            //获得当前任务中的div对象计算后的样式，保存在变量style中
            var style =
                getComputedStyle(task.div);
            //设置当前任务的div对象的left属性为style的left，转为浮点数+当前任务的stepX
            task.div.style.left =
                parseFloat(style.left) +
                task.stepX + "px";
            //设置当前任务的div对象的top属性为style的top，转为浮点数+当前任务的stepY
            task.div.style.top =
                parseFloat(style.top) +
                task.stepY + "px";
        } //(遍历结束)
        this.moved++; //moved+1
        //如果moved等于STEPS
        if (this.moved == this.STEPS) {
            //停止定时器,清除timer,moved归零
            clearInterval(this.timer);
            this.timer = null;
            this.moved = 0;
            //遍历tasks数组中每个任务
            for (var i = 0; i < this.tasks.length; i++) {
                var task = this.tasks[i];
                //清除当前任务的div的left
                task.div.style.left = "";
                //清除当前任务的div的top
                task.div.style.top = "";
            }
            this.tasks.length = 0; //清除tasks数组
            //执行动画接受后的善后工作
            callback();
        }
    }
}