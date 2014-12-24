function Drag() {
	this.initialize.apply(this, arguments)
}
Drag.prototype = {
	//初始化
	initialize : function (drag, options) {
		this.drag = this.$(drag);
		this._x = this._y = 0;

		//这里用bind方法，改变了this的指向，指回到new出来的对象,执行了moveDrag方法
		//然后先赋值给this._moveDrag是为了后面删除绑定事件
		//否则绑定和解除的function不一样，无法解除
		this._moveDrag = this.bind(this, this.moveDrag);
		this._stopMoveDrag = this.bind(this, this.stopMoveDrag);

		this.setOptions(options);

		this.handler = this.$(this.options.handler);
		this.maxContainer = this.$(this.options.maxContainer);
		this.maxTop = Math.max(this.maxContainer.clientHeight, this.maxContainer.scrollHeight) - this.drag.offsetHeight;
		this.maxLeft = Math.max(this.maxContainer.clientWidth, this.maxContainer.scrollWidth) - this.drag.offsetWidth;

		this.lock = this.options.lock;
		this.lockX = this.options.lockX;
		this.lockY = this.options.lockY;

		this.onStart = this.options.onStart;
		this.onMove = this.options.onMove;
		this.onStop = this.options.onStop;

		this.handler.style.cursor = "move";
		this.changeLayout();

		this.addHandler(this.handler, "mousedown", this.bind(this, this.startDrag));
	},
	changeLayout : function () {
		this.drag.style.top = this.drag.offsetTop + "px";
		this.drag.style.left = this.drag.offsetLeft + "px";
		this.drag.style.position = "absolute";
		this.drag.style.margin = "0";
	},
	startDrag : function (event) {
		var event = event || window.event;
		this._x = event.clientX - this.drag.offsetLeft;
		this._y = event.clientY - this.drag.offsetTop;

		this.addHandler(document, "mousemove", this._moveDrag);
		this.addHandler(document, "mouseup", this._stopMoveDrag);

		this.preventDefault(event);
        this.handler.setCapture && this.handler.setCapture();

        this.onStart();
	},
	moveDrag : function (event) {
		var event = event || window.event;
		var iTop = event.clientY - this._y;
		var iLeft = event.clientX - this._x;
		//锁定位置
		if (this.lock) return;
		//锁定范围
		this.limit && (iTop < 0 && (iTop = 0), iTop > this.maxTop && (iTop = this.maxTop), iLeft < 0 && (iLeft = 0), iLeft > this.maxLeft && (iLeft = this.maxLeft));
		//锁定Y轴
		this.lockY || (this.drag.style.top = iTop + "px");
		//锁定X轴
		this.lockX || (this.drag.style.left = iLeft + "px");

		this.preventDefault(event);

		this.onMove();
	},
	stopMoveDrag : function () {
		this.removeHandler(document, "mousemove", this._moveDrag);
		this.removeHandler(document, "mouseup", this._stopMoveDrag);

		this.handler.releaseCapture && this.handler.releaseCapture();

		this.onStop()
	},
	setOptions : function (options) {
		this.options = {
			handler : 		this.drag,	//事件对象
			limit : 		true,		//锁定范围
			lock : 			false,		//锁定位置
			lockX : 		false,		//锁定X轴
			lockY : 		false,		//锁定Y轴
			maxContainer :	document.documentElement || document.body, //指定容器
			onStart : 		function () {},		//开始时回调函数
			onMove : 		function () {},		//拖拽时回调函数
			onStop : 		function () {}		//结束时回调函数
		}
		for (var p in options) {this.options[p] = options[p]}
	},
	//获取id
	$ : function (id) {
		return typeof id === "string" ? documnet.getElementById(id) : id
	},
	//添加绑定事件
	addHandler  : function (oElement, sEventType, fnHandler) {
		return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
	},
	//删除绑定事件
	removeHandler : function (oElement, sEventType, fnHandler) {
		return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler,false) : oElement.detachEvent("on" + sEventType, fnHandler)
	},
	//绑定事件到对象
	//上下文对象在事件侦听器中this指的就是发生事件的对象
	//改变了this的指向，指回到new出来的对象,执行对象中的方法
	bind : function (object, fnHandler) {
		return function () {
			return fnHandler.apply(object, arguments)
		}
	},
	getEvent: function (event) {
        return event ? event : window.event;
    },
    preventDefault: function (event) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }
}




//应用
window.onload = function () {
	var oBox = document.getElementById("box");
	var oTitle = oBox.getElementsByTagName("h2")[0];
	var oSpan = document.getElementsByTagName("span")[0];

	var oDrag = new Drag(oBox, {handler:oTitle, limit:false});
	var aInput = document.getElementsByTagName("input");

	//锁定范围接口
	aInput[0].onclick = function () {
		oDrag.limit = !oDrag.limit;
		this.value = oDrag.limit ? "取消锁定范围" : "锁定范围"
	};

	//水平锁定接口
	aInput[1].onclick = function () {
		oDrag.lockX = !oDrag.lockX;
		this.value = oDrag.lockX ? "取消水平锁定" : "水平锁定"
	};

	//垂直锁定接口
	aInput[2].onclick = function () {
		oDrag.lockY = !oDrag.lockY;
		this.value = oDrag.lockY ? "取消垂直锁定" : "垂直锁定"
	};

	//锁定位置接口
	aInput[3].onclick = function () {
		oDrag.lock = !oDrag.lock;
		this.value = oDrag.lock ? "取消锁定位置" : "锁定位置"
	};

	//开始拖拽时方法
	oDrag.onStart = function () {
		oSpan.innerHTML = "开始拖拽"
	};

	//拖拽中方法
	oDrag.onMove = function () {
		oSpan.innerHTML = "left:" + this.drag.offsetLeft + ", top:" + this.drag.offsetTop
	};

	//结束拖拽后方法
	oDrag.onStop = function () {
		oSpan.innerHTML = "结束拖拽"
	};
}