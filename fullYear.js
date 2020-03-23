(function () {
    var yearSelectBefore;
    //记录当前选中的日期
    var fullYearPicker_nowSelect = null;
    var fullYearPicker_last = null;
    var _viewer_ = this;
    function tdClass(i, disabledDay, sameMonth, values, dateStr, tradeDays) {
        var cls = i == 0 || i == 6 ? 'weekend' : '';
        if (disabledDay && disabledDay.indexOf(i) != -1) cls += (cls ? ' ' : '') + 'disabled';
        if (!sameMonth) cls += (cls ? ' ' : '') + 'empty';
        if (sameMonth && values && cls.indexOf('disabled') == -1 && values.indexOf(dateStr) != -1) cls += (cls ? ' ' : '') + 'selected';
        if (tradeDays && tradeDays.indexOf(dateStr) == -1) cls += (cls ? ' ' : '') + 'disabled';
        return cls == '' ? '' : ' class="' + cls + '"';
    }

    function renderMonth(year, month, clear, disabledDay, values, tradeDays) {
        var d = new Date(year, month - 1, 1),
            s = '<table cellpadding="3" cellspacing="1" border="0"' + (clear ? ' class="right"' : '') + '>'
                + '<tr><th colspan="7" class="head">' + month + '月</th></tr>'
                + '<tr><th class="weekend">日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th class="weekend">六</th></tr>';
        var dMonth = month - 1;
        var firstDay = d.getDay(), hit = false;
        // month = month.toString().padStart(2, "0");
        month = month.toString()
        if(parseInt(month) < 10){
            month = "0" + month.toString()
        }
        s += '<tr>';
        for (var i = 0; i < 7; i++) {
            if (firstDay == i || hit) {
                // var day = d.getDate().toString().padStart(2, "0");
                var day = d.getDate().toString();
                if(parseInt(day) < 10){
                    day = "0" + day.toString()
                }
                var dateStr = year.toString() + month + day;
                s += '<td date="' + dateStr + '"' + tdClass(i, disabledDay, true, values, dateStr, tradeDays) + '>' + d.getDate() + '</td>';
                d.setDate(d.getDate() + 1);
                hit = true;
            } else s += '<td date=""' + tdClass(i, disabledDay, false) + '>&nbsp;</td>';
        }
        s += '</tr>';
        for (var i = 0; i < 5; i++) {
            s += '<tr>';
            for (var j = 0; j < 7; j++) {
                // var day = d.getDate().toString().padStart(2, "0");
                var day = d.getDate().toString();
                if(parseInt(day) < 10){
                    day = "0" + day.toString()
                }
                var dateStr = d.getMonth() == dMonth ? year.toString() + month + day : "";
                s += '<td date="' + dateStr + '"' + tdClass(j, disabledDay, d.getMonth() == dMonth, values, dateStr, tradeDays) + '>' + (d.getMonth() == dMonth ? d.getDate() : '&nbsp;') + '</td>';
                //当超过当月天数时，月份会加1，则d.getMonth()==dMonth为false
                d.setDate(d.getDate() + 1);
            }
            s += '</tr>';
        }
        return s + '</table>' + (clear ? '<br>' : '');
    }

    function getDateStr(td) {
        //兼容IE
        var attr = td.attributes;
        var daySelectedValue;
        for(var i = 0; i < attr.length; i++){
            if(attr[i].name == "date"){
                daySelectedValue = attr[i].value;
                break;
            }
        }
        return daySelectedValue;
    }

    function renderYear(year, el, disabledDay, value, tradeDays) {
        el.find('td').unbind();
        var s = '', values = ',' + value.join(',') + ',';
        tradeDays = tradeDays.join(',');
        for (var i = 1; i <= 12; i++) s += renderMonth(year, i, i % 6 == 0, disabledDay, values, tradeDays);
        //所有选中的日期的回调函数
        el.find('div.picker').html(s).find('td').click(function () {
            if (!/disabled|empty/g.test(this.className)) {
                $(this).toggleClass('selected');
            }
            if (this.className.indexOf('empty') == -1) {
                $(".fullYearPicker td").removeClass("arrow_box");
                $(this).addClass("arrow_box");
            }
        });
    }

    //批量选中日期
    // $.fn.selectDates = function (dateArray) {
    //     dateArray.forEach(function (item) {
    //         $("[date='" + item + "']").addClass("selected");
    //     });
    // }

    //@config：配置，具体配置项目看下面
    //@param：为方法时需要传递的参数
    $.fn.fullYearPicker = function (config, param) {
        if (config === 'setDisabledDay' || config === 'setYear' || config === 'getSelected' || config === 'acceptChange' || config === 'setColors' || config === 'initDate' || config === 'getAllSelect') {//方法
            var me = $(this);
            if (config == 'setYear') {//重置年份
                me.data('config').year = param;//更新缓存数据年份
                me.find('div.year a:first').trigger('click', true);
            }
            else if (config == 'getSelected') {//获取当前年份选中的日期集合
                return me.find('td.selected').map(function () {
                    var selectStr = getDateStr(this);
                    return selectStr;
                }).get();
            }
            else if (config == 'acceptChange') {//更新日历值，这样才会保存选中的值，更换其他年份后，再切换到当前年份才会自动选中上一次选中的值
                var yearSelect = yearSelectBefore;
                var arr = me.data('config').value;
                arr1 = [];
                for (var i = 0;i < arr.length; i++){
                    if(arr[i].toString().substr(0,4).indexOf(yearSelect)==-1){
                        arr1.push(arr[i]);
                    }
                }
                var arr2 = arr1.concat(me.fullYearPicker('getSelected'));
                me.data('config').value = arr2;
            }
            else if (config == 'setColors') {//设置单元格颜色 param格式为{defaultColor:'#f00',dc:[{d:'2017-8-2',c:'blue'}..]}，dc数组c缺省会用defaultColor代替，defaultColor也缺省默认红色
                return me.find('td').each(function () {
                    var d = getDateStr(this);
                    for (var i = 0; i < param.dc.length; i++) if (d == param.dc[i].d) this.style.backgroundColor = param.dc[i].c || param.defaultColor || '#f00';
                });
            }
            else if (config == 'getAllSelect'){
                yearSelectBefore = me.data('config').year;
                $('#oneYearPicker').fullYearPicker('acceptChange');
                var arrDateSelected = me.data('config').value;
                arrDateSelected.sort(compare);
                return arrDateSelected;
            }
            else {
                me.find('td.disabled').removeClass('disabled');
                me.data('config').disabledDay = param;//更新不可点击星期
                if (param) {
                    me.find('table tr:gt(1)').find('td').each(function () {
                        if (param.indexOf(this.cellIndex) != -1)
                            this.className = (this.className || '').replace('selected', '') + (this.className ? ' ' : '') + 'disabled';
                    });
                }
            }
            return this;
        }
        //@year:显示的年份
        //@disabledDay:不允许选择的星期列，注意星期日是0，其他一样
        //@value:选中的值，注意为数组字符串，格式如['20160625','20160826'.......]
        //@yearScale:配置这个年份变为下拉框，格式如{min:2000,max:2020}
        //@tradeDays:交易日期集合
        config = $.extend({year: new Date().getFullYear(), disabledDay: '', value: [],initDate:[],format:"",disable:false}, config);
        return this.addClass('fullYearPicker').each(function () {
            _viewer_ = $(this);
            _viewer_.html("");
            var me = $(this), year = config.year || new Date().getFullYear();
                newConifg = {
                    disabledDay: config.disabledDay,
                    year: year,
                    value: config.value,
                    yearScale: config.yearScale,
                    initDate:config.initDate,
                    format:config.format,
                    disable:config.disable,
                    tradeDays:config.tradeDays
                };
            me.data('config', newConifg);
            var selYear = '';
            if (newConifg.yearScale) {
                selYear = '<select>';
                for (var i = newConifg.yearScale.min, j = newConifg.yearScale.max+1; i < j; i++) selYear += '<option value="' + i + '"' + (i == year ? ' selected' : '') + '>' + i + '</option>';
                selYear += '</select>';
            }
            selYear = selYear || year;
            me.append('<div class="year"><a href="#"><button>&lt;&lt;</button></a>' + selYear + '年<a href="#" class="next"><button>&gt;&gt;</button></a></div><div class="picker"></div>')
            .find('a').click(function (e, setYear) {
                yearSelectBefore = year;
                $('#oneYearPicker').fullYearPicker('acceptChange');
                if (setYear){
                    year = me.data('config').year;
                }
                else {
                    var yearcontain = year;
                    e.srcElement.innerHTML == '&lt;&lt;' ? year-- : year++;
                    if(year < newConifg.yearScale.min || year > newConifg.yearScale.max){
                        year = yearcontain;
                    }
                    me.data('config').year = year;
                }
                me.find('select').val(year);
                renderYear(year, $(this).closest('div.fullYearPicker'), newConifg.disabledDay, newConifg.value, newConifg.tradeDays);
                this.parentNode.firstChild.nextSibling.data = year + '年';
                return false;
            }).end().find('select').change(function () {
                me.fullYearPicker('setYear', this.value);
            });
            // if(_viewer_.data('config').disable === true){
            //     _viewer_.data('config').disabledDay = '0,1,2,3,4,5,6';
            // }
            me.data('config').value = newConifg.initDate;
            renderYear(year, me, newConifg.disabledDay, newConifg.value, newConifg.tradeDays);

            if(newConifg.initDate.length > 0){
                newConifg.initDate.forEach(function (p1, p2, p3) {
                    $("[date='"+p1+"']").addClass("selected")
                })
            }
        });
    };
})();

function compare(val1,val2){
    return val1-val2;
};
