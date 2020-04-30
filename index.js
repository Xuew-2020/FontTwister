function Text(parentNode){
	this.canvas = document.createElement('canvas');
	this.radius = 2; //半径
	this.margin = 2; //粒子间距
	this.cnt = 100;	 //移动多少次完成聚合
	this.timer = null; //定时器
	this.animation = null; //粒子波动动画
	this.iter = null; //生成器
	this.pos = []; //保存页面所有粒子
	this.cut = 0;
	this.parentNode = parentNode;
}
Text.prototype.init = function(){ //初始化
	function create_pos(pos,array,radius,width,height,cnt,margin,paddingX,paddingY){
		var pot = array;
		var xlen = pot[0].length;
		var ylen = pot.length;
		for (var i = 0; i < xlen; i++) {
			for(var j =0; j < ylen; j++){
				if(pot[j][i] === 1){
					var pos_x = radius+2*i*radius+i*margin+paddingX;
					var pos_y = radius+2*j*radius+j*margin+paddingY;
					var pos_X = Math.random()*width;
					var pos_Y = Math.random()*height;
					pos.push({
						pos:[pos_x,pos_y],
						new_pos:[pos_X,pos_Y],
						offsetX:(pos_X-pos_x)/cnt,
						offsetY:(pos_Y-pos_y)/cnt,
						scale:1,
						offsetScale:0,
					});
				}
			}
		}
	}
	try{
		this.canvas.width = 1328;
		this.canvas.height = 627;
		var text = this.create_lattice("Welcome",30)
		var textWidth = text[0].length*2*this.radius+(text[0].length-1)*this.margin;
		var textHeight = text.length*2*this.radius+(text.length-1)*this.margin;
		var x = (this.canvas.width - textWidth)/2;
		var y = (this.canvas.height - textHeight)/2;
		create_pos(this.pos,this.create_lattice("Welcome",30),this.radius,this.canvas.width,this.canvas.height,this.cnt,this.margin,x,y);
		this.iter = this.builder();
		this.parentNode.appendChild(this.canvas);
	}catch(e){
		console.log("初始化失败");
	}
}
Text.prototype.update = function(text){
	function recreate(pos,array,radius,width,height,cnt,margin,paddingX,paddingY){
		var pot = array;
		var xlen = pot[0].length;
		var ylen = pot.length;
		var poslen = pos.length;
		for(var i=0; i<poslen; i++){
			var pos_x = Math.random()*width;
			var pos_y = Math.random()*height;		
			var tmp = pos[i];
			tmp.pos = [pos_x,pos_y];
			tmp.offsetX = (tmp.new_pos[0]-pos_x)/cnt;
			tmp.offsetY = (tmp.new_pos[1]-pos_y)/cnt;
			tmp.scale = 10;
			tmp.offsetScale = (tmp.scale-0.5)/cnt;
		}
		for (var i = 0; i < xlen; i++) {
			for(var j =0; j < ylen; j++){
				if(pot[j][i] === 1){
					var pos_x = radius+2*i*radius+i*margin+paddingX;
					var pos_y = radius+2*j*radius+j*margin+paddingY;
					var pos_X = Math.random()*width;
					var pos_Y = Math.random()*height;
					pos.push({
						pos:[pos_x,pos_y],
						new_pos:[pos_X,pos_Y],
						offsetX:(pos_X-pos_x)/cnt,
						offsetY:(pos_Y-pos_y)/cnt,
						scale:1,
						offsetScale:0,
					});
				}
			}
		}
	}
	clearInterval(this.timer);
	window.cancelAnimationFrame(this.animation);
	text = this.create_lattice(text,26)
	var textWidth = text[0].length*2*this.radius+(text[0].length-1)*this.margin;
	var textHeight = text.length*2*this.radius+(text.length-1)*this.margin;
	var x = (this.canvas.width - textWidth)/2;
	var y = (this.canvas.height - textHeight)/2;
	this.pos.splice(0,this.cut);
	this.cut = this.pos.length;
	recreate(this.pos,text,this.radius,this.canvas.width,this.canvas.height,this.cnt,this.margin,x,y);
	this.iter = this.builder();
}
Text.prototype.drew = function(obj){ //绘图
	try{
		var cxt = this.canvas.getContext('2d');
		var len = obj.length;
		cxt.fillStyle = "#FFF";
		cxt.clearRect(0,0,this.canvas.width,this.canvas.height);
		for(var i=0; i<len; i++){
			cxt.beginPath();
			cxt.arc(obj[i].new_pos[0],obj[i].new_pos[1],this.radius*obj[i].scale,0,360*Math.PI/180,true);
			cxt.closePath();
			cxt.fill();
		}
	}catch(e){
		console.log("绘制失败！")
	}
}
Text.prototype.start = function(){ //开始动画
	try{
		var that = this;
		this.timer = setInterval(function(){
			var data = that.iter.next();
			if(data.done === true){
				clearInterval(that.timer);
				console.log(that.cut,that.pos.length);
				that.offset();
				that.cnt = 50;
				return;
			}
			that.drew(data.value);
		},30);
	}catch(e){
		console.log("运行失败");
	}
}
Text.prototype.create_lattice = function(text,size){
	var tempcanvas = document.createElement('canvas');
	var tempcxt = tempcanvas.getContext("2d");
	tempcanvas.width = size*(text.length+1);
	tempcanvas.height = size;
	tempcxt.fillStyle = "red";
	tempcxt.font = `${size}px SimSun`;
	tempcxt.textAlign = "center";
	tempcxt.textBaseline = "middle";
	tempcxt.fillText(text,tempcanvas.width/2,tempcanvas.height/2);
	var ImageData = tempcxt.getImageData(0,0,tempcanvas.width,tempcanvas.height);
	var lattice = [];
	var [cols,rows] = [tempcanvas.width,tempcanvas.height];
	for(var i=0; i<rows; i++){
		var tempArr = [];
		for(var j=0; j<cols; j++){
			var pos = i*cols+j;
			if(ImageData.data[pos*4] > 0){
				tempArr[j] = 1;
			}else{
				tempArr[j] = 0;
			}
		}
		lattice.push(tempArr);
	}
	tempcanvas = null;
	return lattice;
}
Text.prototype.builder = function*(){ //生成器
	try{
		var obj = this.pos;
		var len = obj.length;
		for(var i=0; i<this.cnt; i++){
			for(var j=0; j<len; j++){
				obj[j].new_pos[0]-=obj[j].offsetX;
				obj[j].new_pos[1]-=obj[j].offsetY;
				obj[j].scale-=obj[j].offsetScale;
			}
			yield obj;
		}
	}catch(e){
		console.log("创建生成器失败");
	}
}
Text.prototype.offset = function(){ //波动效果
	try{
	    var obj = this.pos;
		var len = obj.length;
		var that = this;
		(function frame(){
			that.animation = window.requestAnimationFrame(frame);
			for(var i=0; i<len; i++){
				obj[i].new_pos[0] = obj[i].pos[0]+Math.random()*that.margin;
				obj[i].new_pos[1] = obj[i].pos[1]+Math.random()*that.margin;
			}
			that.drew(obj);
		})();
	}catch(e){
		console.log("波动效果异常！");
	}
}