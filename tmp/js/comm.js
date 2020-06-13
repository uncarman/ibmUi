/* normal functions and settings include by each page */

var _colors = ['#259eaf','#197898', '#0e5483',
    "#ff7f50", "#87cefa", "#da70d6", "#32cd32", "#6495ed", "#ff69b4",
    "#ba55d3", "#cd5c5c", "#ffa500", "#40e0d0", "#1e90ff", "#ff6347", "#7b68ee",
    "#00fa9a", "#ffd700", "#6699FF", "#ff6666", "#3cb371", "#b8860b", "#30e0e0"];
var settings = {
    AMAP_SRC : 'https://webapi.amap.com/maps?v=1.3&key=02fc113eb5fa70cbaabd7b94b106244f&plugin=AMap.ToolBar',
    is_debug : true,
    domain: "http://47.100.196.152:8095/",
    cross_domain: true,
    ajax_base_url: "http://47.100.196.152:8095/",
    ajax_func: {
        "ajaxTotal" : "/ajax/ajaxTotal",
        "ajaxDevices" : "/ajax/ajaxDevices",
        "ajaxOtherDevices" : "/ajax/ajaxOtherDevices",
        "ajaxEnergyData" : "/ajax/ajaxEnergyData",
        "ajaxDistributionRoomData" : "/ajax/ajaxDistributionRoomData",
        
        login: "login",
        getLoginCode: "api/backend/v1/base/verify",
        user: "user",
        getList: "getList",
        profile: "profile",

        "baseTableList": "/system/base/table_list", // table列表
        "baseTableDetail": "/system/base/table_detail/{table_name}", // table列表


        "ajaxGetSummary": "/ajax_get_building_total", //
        "ajaxGetSummaryByDate": "/ajax_get_building_total_by_date", //
        "ajaxGetMeters": "/ajax_get_meters", //
        "ajaxGetMeterDatas": "/ajax_get_meter_datas", //



        // 可用apis
        "ajaxLogin": "api/login",
        "ajaxLogout": "api/logout",
        "ajaxGetUserBuildings": "api/getBuildingsByUserId", // 用户下所有建筑

        "getBuildingSummaryTotalData": "api/getBuildingSummaryTotalData", // 4大类汇总数据
        "getBuildingChartDataByType": "api/getBuildingChartDataByType", // 获取某个建筑的汇总数据
        "getBuildingTableDataByType": "api/getBuildingTableDataByType", // 获取对应的table数据(可export需要server端生成)

        "getEnergyTotalDataByType": "api/getEnergyTotalDataByType", // 某一类表汇总数据
        "getEnergyChartDataByType": "api/getEnergyChartDataByType", //

        "getItemGroupByType": "api/getItemGroupByType",
        "getEnergyTableDataByType": "api/getEnergyTableDataByType",

        "ajaxGetItemById": "api/getItem", // 获取单个设备
        "ajaxGetItemGroups": "api/getItemGroups", // 获取所有分组列表
        "ajaxGetItemsByGroupId": "api/getItemsByGroupId",  // 获取某个分组下的所有设备
        "ajaxRemoveItemGroup": "api/removeItemGroup",  // 删除
        "ajaxUpdateItemGroup": "api/updateItemGroup",  // 更新
        "ajaxCreateItemGroup": "api/createItemGroup",  // 创建

        "ajaxGetBuildingItems": "api/getBuildingItems",  // 所有设备
        "ajaxRemoveItem": "api/removeItem",  // 删除
        "ajaxUpdateItem": "api/updateItem",  // 更新
        "ajaxCreateItem": "api/createItem",  // 创建
        "ajaxUpdateGroupItem": "api/updateGroupItem",  // 更新设备编组下绑定的设备
        "ajaxGetItemCurrentData": "api/getItemCurrentData",  // 获取设备相关数据

        "ajaxGetBasicDatas": "api/getBasicDatas", // 基础数据
        "ajaxRemoveBasicData": "api/removeBasicData",  // 删除
        "ajaxUpdateBasicData": "api/updateBasicData",  // 更新
        "ajaxCreateBasicData": "api/createBasicData",  // 创建

        "getEnergyPlans": "api/getEnergyPlans", // 节能计划列表
        "removeEnergyPlan": "api/removeEnergyPlan",  // 删除
        "updateEnergyPlan": "api/updateEnergyPlan",  // 更新
        "createEnergyPlan": "api/createEnergyPlan",  // 创建

        // 商户，电表充值相关
        "ajaxGetHouseholdList": "api/householdList",  // 商户列表
        //"ajaxRemoveHouseHold": "api/householdRemove",  // 删除
        "ajaxUpdateHouseHold": "api/householdUpdate",  // 更新
        "ajaxCreateHouseHold": "api/householdAdd",  // 创建
        "ajaxGetHouseholdByItemId": "api/householdByItemId", // 根据设备号，查询对应商户

        "ajaxGetCashflow": "api/cashFlowList", // 充值记录
        "ajaxCreateCashflow": "api/cashFlowAdd", // 充值添加

        "ajaxEnergyData": "api/homeEnergyData", // 首页获取所有能耗数据接口
        "ajaxDeviceData": "api/homeDeviceData", // 首页获取所有设备数据接口
    },
    ajax_timeout: 30*1000, //ajax超时时间 (单位:毫秒)
    ajax_succ_code : 200,       // ajax 成功code
    // 分页参数
    items_per_page: 10,     // 数据每页显示10条
    items_num_edge: 3,      // 两侧首尾，主体分页条目数
    prev_text: "上一页",    // 上一页文字
    next_text: "下一页",    // 下一页文字

    WEATHER : {
        UNSET: { text: 'unset', class: 'default' },
        UNKNOWN: { text: '获取异常', class: 'default' },
        SUNNY: { text: '晴', class: 'sunny' },
        SNOW: { text: '雪', class: 'snow' },
        SNOW1: { text: '雨夹雪', class: 'snow' },
        RAIN: { text: '雨', class: 'rainy' },
        RAIN1: { text: '中雨', class: 'rainy' },
        RAIN2: { text: '小雨', class: 'rainy' },
        SMOG: { text: '雾霾', class: 'smog' },
        SMOG1: { text: '雾', class: 'smog' },
        SMOG1: { text: '霾', class: 'smog' },
        SLEET: { text: '雨夹雪', class: 'sleet' },
        CLOUDY: { text: '多云', class: 'cloudy' },
        OVERCAST: { text: '阴', class: 'overcast' },
        OVERCAST1: { text: '浮尘', class: 'overcast' },
        SAND_STORM: { text: '沙尘暴', class: 'sandstorm' },
        SAND_STORM1: { text: '扬沙', class: 'sandstorm' },
        THUNDER_SHOWER: { text: '雷阵雨', class: 'thunderstorm' },
        THUNDER_SHOWER1: { text: '阵雨', class: 'thunderstorm' },
    },

    colors : _colors,
    defaultLineOpt: {
        //color: _colors,
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            data:[],
            y: "10px",
        },
        grid: {
            top: "50",
            left: "50",
            right: "10",
            bottom: "20",
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: "#2E92FF"
                    }
                },
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: "#2E92FF"
                    }
                },
            }
        ],
        series : [
            // {
            //   name:'用电量',
            //   type:'bar',
            //   data:[]
            // }
        ]
    },

    defaultPieOpt: {
        color: _colors,
        tooltip : {
            trigger: 'top',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            data:[],
            x : 'center',
            y: "10px",
        },
        calculable : true,
        series : [
            {
                name:'占比',
                type:'pie',
                radius : [30, 110],
                center : ['50%', '50%'],
                roseType : 'area',
                x: '50%',               // for funnel
                max: 40,                // for funnel
                sort : 'ascending',     // for funnel
                data:[]
            }
        ]
    },

    defaultBarOption: {
        dataZoom: {
            type: 'inside'
        },
        color: ['#2E92FF'],
        grid: {
            top: 10,
            left: 5,
            right: 5,
            bottom: 5,
        },
        tooltip: {
            trigger: 'axis',
            position: function (pos, params, dom, rect, size) {
                var obj = {top: 60};
                return obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            },
            axisLabel: null,
            axisLine: {
                lineStyle: {
                    color: "#2E92FF"
                }
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            },
            axisLabel: null,
            axisLine: {
                lineStyle: {
                    color: "#2E92FF"
                }
            },
        },
        series: [
            {
                name:'日发电',
                type:'bar',
                barWidth: "60%",
                smooth:true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: 'rgba(104,193,252,1)'},
                            {offset: 1, color: 'rgba(102,92,255,1)'}
                        ]
                    )
                },
                data: [],
            }
        ],
    },

    types: {
        "01" : "electricity",
        "02": "water",
        "03": "gas",
        "04": "cah",
        "05": "steam",
    },
    typeNames: {
        "01" : "电",
        "02": "水",
        "03": "燃气",
        "04": "冷热",
        "05": "蒸汽",
    },
    subTypes: {
        "能耗分项": "subentry",
        "建筑区域": "area",
        "组织机构": "org",
        "自定义": "custom"
    },

    defaultDateTypes: [
        {
            val: "hour",
            name: "按小时",
            "paramFmt" : "YYYY-MM-DD HH",
            "fmt" : "YYYY-MM-DD HH",
        },
        {
            val: "day",
            name: "按日",
            "paramFmt" : "YYYY-MM-DD",
            "fmt" : "YYYY-MM-DD",
        },
        {
            val: "month",
            name: "按月",
            "paramFmt" : "YYYY-MM",
            "fmt" : "YYYY-MM",
        },
        {
            val: "year",
            name: "按年",
            "paramFmt" : "YYYY",
            "fmt" : "YYYY",
        }
    ],

    maintanceColors: _colors,
}

function MyAlert(msg, type) {
    alert(msg);
}

var global = {
    //读取共享存储区域的session字段
    read_storage: function(field){
        //read data from window.localStorage['field']
        field = field || "session";
        var res = {};
        if(settings.can_localStorage){
             try{
                res = JSON.parse(d);
            }catch(e){ res = d; }
        }
        return res || {};
    },
    //默认修改localStorage的session字段
    write_storage: function(field, data){
        var k = null, v = null;
        if(typeof field == "string"){
            k = field;
            v = data;
        }
        else if(typeof field == "object"){
            //only pass a value, write to window.localStorage.session
            k = "session";
            v = field
        }
        else{
            k = "session";
            v = window.session;
        }
        if(settings.can_localStorage){
            window.localStorage[k] = (typeof v == "string") ? v : JSON.stringify(v);
        }
    },
    //为localStorage的field字段添加新的键值对key-data
    set_storage_key: function(field, array){
        if(typeof field == "string" && typeof array == "object"){
            var res = global.read_storage(field);
            for(var item in array){
                var temp_key = array[item].key;
                var temp_val = array[item].val;
                if(typeof temp_key == "string" && typeof temp_val != "undefined"){
                    res[temp_key] = temp_val;
                }
            }
            global.write_storage(field, JSON.stringify(res));
        }

    },

    loading_num: 0,    // for ajax loading number record

    default_ajax_error_func: function(data) {
        if (data != '' && data != null) {
            if(angular.isObject(data))
            {
                if(angular.isString(data.message) && data.message != "")
                {
                    var msg = data.message;
                }
                else
                {
                    var msg = '连接失败...';
                }
                MyAlert(msg, 'warning');
                /*
                new MyMsg({
                    str: msg,
                    classtype: 'warning',
                    time: settings.msg_duration
                });
                */
                return msg;
            }
            else if(angular.isString(data))
            {
                MyAlert(data, 'warning');
                /*
                new MyMsg({
                    str: data,
                    classtype: 'warning',
                    time: settings.msg_duration
                });
                */
                return data;
            }
        }
        else {
            MyAlert('连接失败...', 'warning');
            /*
            new MyMsg({
                str: '连接失败...',
                classtype: 'warning',
                time: settings.msg_duration
            });
            */
            return '连接失败...';
        }
    },

    //校验手机号码
    check_mobile_number: function(mobile_number){
        //var re = /^1[3|4|5|6|7|8]\d{9}$/;
        var re = /^1[0-9]{10}$/;
        if (!mobile_number || !re.test(mobile_number)) {
            //alert('您输入的手机号码有误，请重新输入');
            return false;
        }
        return true;
    },

    //校验手机验证码
    check_sms: function(sms){
        var codeRe = /^\d{6}$/;
        if (!codeRe.test(sms)) {
            //alert('您尚未通过手机号码验证，请先提交6位数字验证码');
            return false;
        }
        return true;
    },

    // 解析url字符串
    request: function(str_parame) {
        var args = new Object( );
        var query = location.search.substring(1); //location.pathname
        var arr = new Array();
        arr = query.split("&");
        for(var i = 0; i < arr.length; i++) {
            var pos = arr[i].indexOf('=');
            if (pos == -1) continue;
            var argname = arr[i].substring(0,pos);
            var value = arr[i].substring(pos+1);
            value = decodeURIComponent(value);
            args[argname] = value;
        }
        return str_parame ? args[str_parame] : args;
    },

    // 校验登录密码规则
    // 返回：
    //    成功： null
    //    失败： 错误信息
    check_login_pwd: function(pwd) {
        if(pwd)
        {
            var fail = !/(?!^\d+$)(?!^[A-z]+$)(?!^[^A-z\d]+$)^.{6,16}$/.test(pwd) || /[\u4E00-\u9FA5]/.test(pwd);
            return fail ? '密码为6~16位的数字和字母组合' : null;
        }
        else
        {
            return "登录密码不能为空";
        }
    },

    // 替换敏感字符串
    crossfade_str:function (str) {
        if(str == '')
        {
            return '';
        }
        else if(str.length>7)
        {
            var strLeft = str.substr(0, 3);
            var strRight = str.substr(str.length-4, str.length);
            return strLeft + "****" + strRight;
        }
        else
        {
            var strLeft = str.substr(0, str.length/2);
            return strLeft + "****";
        }
    },

    return_promise : function ($scope, param) {
        return new Promise(function(resolve, reject) {
            global.ajax_data($scope, param,
                function (data) {
                    //接口调用成功
                    if(data) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                }, [200]);
        });
    },

    ajax:function($scope, param, success_func, error_func) {
        var np = angular.copy(param);
        var method = (np._method != 'post' && np._method != 'get') ? 'get' : np._method;
        var url = settings.domain + np._url;
        var timeout = (angular.isNumber(np._timeout)) ? np._timeout : settings.ajax_timeout;
        var cache = !!np._cache;

        var _param = param._param || {};

        // 替换 url 中的参数
        for(o in _param) {
            url = url.replace("{"+o+"}", _param[o]);
        }

        // 补充 sign 信息
        //_param = global.generateSign(_param);

        // var header = {
        //     "authorization" : global.generateAuthorization() || "",
        // };

        var req = {
            method : method,
            url: url,
            cache : cache,
            timeout: timeout,
            data : _param,
            //headers : header,
            crossDomain : Object.hasOwnProperty(param.crossDomain) ? param.crossDomain : settings.cross_domain,
            success : function(data) {
                try{
                    data = JSON.parse(data);
                    data = JSON.parse(data);
                } catch(e) {}
                console.log(url, data);
                success_func(data);
                global.loading_num -= 1;
                global.loading_hide();
            },
            error: function(data){
                if(angular.isFunction(error_func)){
                    error_func(data);
                }
                else {
                    global.default_ajax_error_func(data, _param, success_func);
                }
                global.loading_num -= 1;
                global.loading_hide();
            }
        };

        // 添加formData需要的参数
        if(param["_is_form_file"] === true) {
            req.dataType = "json";
            req.cache = false; // 上传文件无需缓存
            req.processData = false; // 用于对data参数进行序列化处理 这里必须false
            req.contentType = false; // 必须
        }

        console.log("service req: ", req);
        jQuery.ajax(req);

        global.loading_num += 1;
        global.loading_show();
    },

    // 和服务器交互接口，做code=0检查，忽略包含success_code错误码的结果
    // success_code 为避免报错的自定义code, 可以为 string, list
    ajax_data: function($scope, params, success_func, success_code, error_func) {
        if(settings.is_fake_ajax) {
            try{
                setTimeout(function(){
                    console.log(params);
                    if(fake_data[params._url]) {
                        console.log(fake_data[params._url]);
                        return success_func(fake_data[params._url]);
                    } else {
                        return success_func({"code":0, "data": {}});
                    }
                }, 100);
            } catch(e) {
                // pass
            }
            return false;
        };

        global.ajax($scope, params, function(data){
            //console.log("controllers ajax_data result: " + JSON.stringify(data));

            if ($scope) {
                $scope.$apply(function(){
                    // 尝试去掉按钮loading状态
                    $scope.ajax_loading = false;
                });
            }

            if (!success_code) {
                success_code = "";
            }
            try{
                success_code = "," + success_code.join(',') + ",";
            }
            catch(e){}

            try{
                if (data.code == settings.ajax_succ_code || success_code.indexOf(","+data.code+",") >= 0 ) // 指定code码,不报错
                {
                    success_func(data);
                }
                // 用户验证失败
                else if (data.code == settings.ajax_auth_failed_code)
                {
                    global.do_logout();
                }
                else  //接口调用失败
                {
                    if(angular.isFunction(error_func)){
                        error_func(data);
                    }
                }
            }
            catch(e)
            {
                MyAlert("系统错误："+e.message, "error");
            }
        }, error_func);
    },

    ajax_bak:function($scope, param, success_func, error_func) {
        console.log(param);
        setTimeout(function(){
            var res = fakeData[param._url];
            success_func(res);
        }, 100);

        var np = angular.copy(param);
        var method = (np._method != 'post' && np._method != 'get') ? 'get' : np._method;
        var url = settings.ajax_base_url + np._url;
        var timeout = (angular.isNumber(np._timeout)) ? np._timeout : settings.ajax_timeout;
        var cache = !!np._cache;

        var _param = param._param;

        if(url){
            for(var key in _param) {
                if(url.indexOf(key) > -1) {
                    url = url.replace("{"+key+"}", _param[key]);
                }
            }
        }

        var _headers = {
            ...param._headers,
        };

        var req = {
            method : method,
            url: url,
            cache : param._cache,
            timeout: timeout,
            data : _param,
            params : _param,
            headers: _headers,
            crossDomain: true,
            success : function(data)
            {
                try{
                    data =     JSON.parse(data);
                    data =     JSON.parse(data);
                } catch(e) {}
                success_func(data);
                global.loading_num -= 1;
                global.loading_hide();
                $(".loading").css("display", "none");
            },
            // beforeSend : function(data)
            // {
            //     $(".loading").css("display","block");
            // },

            error: function(data){
                console.log(data);
                global.loading_num -= 1;
                global.loading_hide();
            }
        }
        jQuery.ajax(req);

        global.loading_num += 1;
        global.loading_show();
    },

    // 和服务器交互接口，做code=0检查，忽略包含success_code错误码的结果
    // success_code 为避免报错的自定义code, 可以为 string, list
    ajax_data_bak: function($scope, params, success_func, success_code, error_func) {
        console.log("ajax_data is called");
        if(!angular.isFunction(error_func))
        {
            error_func = global.default_ajax_error_func
        }
        global.ajax($scope, params, function(data){
            console.log("controllers ajax_data result: " + JSON.stringify(data));

            if ($scope) {
                $scope.$apply(function(){
                    // 尝试去掉按钮loading状态
                    $scope.is_loading = false;
                });
            }

            if (!success_code) {
                success_code = "";
            }
            try{
                success_code = success_code.join(',');
            }
            catch(e){}
            console.log("success_code = " + success_code);

            try{
                //接口调用成功
                if (data.code == 0)
                {
                    success_func(data);
                }
                //未登录（接口需要登陆）
                else if (data.code == -200)
                {
                    MyAlert("您离开页面很久了，请重新登录。", function(){
                        window.session = {
                            mobile: "",
                            password: "",
                            from:""
                        };
                        // 清除本地缓存
                        if(settings.can_localStorage)
                        {
                            window.localStorage.session = JSON.stringify(window.session);
                        }
                        window.location.href = "login.html";
                    }, "warning");
                }
                else if(success_code.indexOf(data.code) >= 0)    // 指定code码,不报错
                {
                    success_func(data);
                }
                else     //接口调用失败
                {
                    // 查询错误码, 找到对应错误描述, 如果没有, 返回 Undefind
                    var msg = settings.error_code[data.code];

                    // 如果没有对应错误码, 从已有报错信息字典中获取, 如果没有, 返回 Undefind
                    if(angular.isUndefined(msg) || msg == "")
                    {
                        msg = settings.error_code[data.message];
                    }
                    // 如果都找不到, 直接返回错误信息
                    if(angular.isUndefined(msg) || msg == "")
                    {
                        if(angular.isUndefined(data.code))
                        {
                            msg = "服务器错误，请稍后重试或联系客服。";
                        }
                        else
                        {
                            msg = "错误编号：" + data.code + " ，请重试或联系客服。";
                        }
                    }
                    MyAlert(msg, 'warning');
                    /*
                    new MyMsg({
                        str: msg,
                        classtype: 'warning',
                        time: settings.msg_duration
                    });
                    */
                    return msg;
                }
            }
            catch(e)
            {
                MyAlert("系统错误："+e.message, 'warning');
                /*
                new MyMsg({
                    str: msg,
                    classtype: 'warning',
                    time: settings.msg_duration
                });
                */
                return "系统错误："+e.message;
            }
        }, error_func);
    },

    // 请求该方法的接口不做code=0检查，直接执行回调函数
    cal_data: function($scope, params, success_func, success_code) {
        global.ajax($scope, params, function(data){
            console.log("controllers cal_data result: " + JSON.stringify(data));
            //接口调用成功
            success_func(data);
        }, global.default_ajax_error_func);
    },

    // 该方法发送ajax为了做心跳请求，即使ajax超时或异常也忽略错误。
    heathit_data: function($scope, Ajax, params, success_func, success_code) {
        global.ajax($scope, params, function(data){
            console.log("controllers heathit_data result: " + JSON.stringify(data));
            //接口调用成功
            success_func(data);
        }, function(data){
            // ajax 失败, 忽略错误
            console.log("controllers heathit_data result: " + JSON.stringify(data));
            //接口调用失败, 继续回调
            success_func({});
        });
    },

    /**
     * ajax等待层处理
     * @param showFlag true/false： 显示/隐藏，传false时，以下两个参数省略
     * @param tipWords 可不传，默认显示器"请等待..."
     * @param isShowOverLay 是否显示遮罩层，默认显示
     */
    iloading : function(showFlag, tipWords, isShowOverLay)
    {
        if (showFlag) {
            var iloadingDom = $("#iloadingbox");
            if (iloadingDom.length > 0) {
                $("#iloadingbox").show();
            } else {
                $('body').append(
                    '<div style="z-index: 20000; left: 0; width: 100%; height: 100%; top: 0; margin-left: 0;" id="iloadingbox" class="xubox_layer" type="page">' +
                    '<div style="z-index: 20000; height: 0; background-color: rgb(255, 255, 255);" class="xubox_main">' +
                    '<div class="xubox_page">' +
                    '<div class="xuboxPageHtml">' +
                    '<div id="iLoading_overlay" class="iLoading_overlay" style="display: block;"></div>' +
                    '<div class="iLoading_showbox" style="display: block; opacity: 1;">' +
                    '<div class="iLoading_pic">' +
                    '<div class="iLoading_loading_pic"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<span class="xubox_botton"></span>' +
                    '</div>' +
                    '<div id="xubox_border2" class="xubox_border" style="z-index: 19891015; opacity: 0; top: 0px; left: 0px; width: 0px; height: 0px; background-color: rgb(255, 255, 255);"></div>' +
                    '</div>'
                );
            }
        } else {
            $("#iloadingbox").hide();
        }
    },

    // 在屏幕中间显示loading图标
    loading_show: function() {
        global.iloading (true, '', false);
    },

    // 在屏幕中间隐藏loading图标
    loading_hide: function() {
        if(global.loading_num <= 0)
        {
            global.loading_num = 0;
            global.iloading (false, '', false);
        }
    },

    get_current_page: function(){
        // 根据页面名字修改body的class
        var url_list = window.location.href.split("#").pop();
        var page = url_list.split("/")[1];
        if(page.indexOf("?") > 0)
        {
            page = page.split("?")[0];
        }
        console.log(page);
        return page;
    },

    "goto": function(page, param){
        if(!page || page == '#' || page == '/'){ return; }
        // 当前页面
        var cur_page = global.get_current_page();
        // 需要跳转的页面
        var new_page = page+ ".html";
        if(page.indexOf("http://")<0 && page.indexOf("https://")<0)//page中既没有http也没有https:非直接跳转的情况
        {
            if(page.indexOf("./") < 0)
            {
                new_page = page + ".html";
            }
            if(typeof param == "string") {
                new_page += "?" + param;
            }
            if(typeof param == "object") {
                new_page += "?";
                for(o in param) {
                    new_page += "&"+o+"="+param[o];
                };
            }
        }

        // 如果是因为需要登录跳转的 login 页面，替换 history 页面中的登录/注册记录
        if(cur_page == "register")
        {
            // 替换当前history entry的页面跳转
            window.location.replace(new_page);
        }
        else
        {
            //html page
            window.location.href = new_page;
        }
    },

    on_load_func: function () {

    },

    on_loaded_func: function ($scope) {
        window._scope = $scope;
        // 复用 goto 函数到每个页面, 因统计代码所需, 挪至最前面
        $scope["goto"] = global["goto"];
    },

    fmtEChartData: function (data){
        var tmpSeriesData = [];
        data.datas.map(function (p) {
            tmpSeriesData.push([
                new Date(p.key),
                (p.val == "" ? 0 : parseFloat(p.val).toFixed(2))
            ])
        });
        return tmpSeriesData;
    },
    drawEChart: function (echart, opt) {
        echart.setOption(opt, true);
        echart.resize();
    },

    // 过期可选，毫秒数
    "setLocalObject": function(key, value, exp) {
        if(exp) {
            value = {
                val: value,
                _exp: new Date().getTime() + exp,
           }
        }
        window.localStorage[key] = JSON.stringify(value);
    },

    "getLocalObject": function(key) {
        var vals = window.localStorage.getItem(key) || false;
        try{
            vals = JSON.parse(vals);
        } catch(e) {
            //
        }
        if(vals.hasOwnProperty("_exp")) {
            if(new Date().getTime() > vals._exp) {
                return false;
            } else {
                if(typeof vals.val == "string") {
                    return JSON.parse(vals.val);
                }
                return vals.val;
            }
        } else {
            if(typeof vals == "string") {
                return JSON.parse(vals);
            }
            return vals;
        }
    },

    "LHsetObject": function(key, value) {
        console.log("LHsetObject called");
        window.localStorage[key] = JSON.stringify(value);
    },

    "LHgetObject": function(key) {
        console.log(window.localStorage[key]);
        return JSON.parse(window.localStorage[key] || '{}');
    },

    "LHremove": function(key) {
        window.localStorage.removeItem(key);
    },

    "LHclear": function() {
        for (var key in this.localStorage) {
            window.localStorage.removeItem(key);
        }
    }
}

