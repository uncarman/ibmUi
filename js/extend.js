function deepCopy(data){
    return JSON.parse(JSON.stringify(data));
}

MyAlert = function(str) {
    toastr.info(str);
};

// 扩展array的indexOf方法
Array.prototype.indexOf = function(el) {
    for (var i = 0, n = this.length; i < n; i++) {
        if (this[i] === el) {
            return i;
        }
    }
    return -1;
}

// 扩展Array方法, 去除数组中空白数据
Array.prototype.notEmpty = function() {
    var arr = [];
    this.map(function(val, index) {
        //过滤规则为，不为空串、不为null、不为undefined，也可自行修改
        if (val !== "" && val != undefined) {
            arr.push(val);
        }
    });
    return arr;
}

Array.prototype.Sum = function() {
    var len = this.length;
    if(len == 0){
        return 0;
    } else if (len == 1){
        return this[0];
    } else {
        return this[0] + this.slice(1).Sum();
    }
}

// 扩展function的getName方法
Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}

function ScrollImgLeft($dom, speed){ 
    var MyMar = null;
    var scroll_begin = $dom.find(".rollBegin")[0]; 
    var scroll_end = $dom.find(".rollEnd")[0];
    var scroll_div = $dom[0]; 
    scroll_end.innerHTML=scroll_begin.innerHTML; 
    function Marquee(){ 
        if(scroll_end.offsetWidth-scroll_div.scrollLeft<=0) {
            scroll_div.scrollLeft-=scroll_begin.offsetWidth; 
        }
        else {
            scroll_div.scrollLeft++; 
        }
    } 
    MyMar=setInterval(Marquee,speed);  
    scroll_div.onmouseover = function(){
　　    clearInterval(MyMar);
    }
    scroll_div.onmouseout = function(){
        MyMar = setInterval(Marquee,speed);  　　　　
    }
}