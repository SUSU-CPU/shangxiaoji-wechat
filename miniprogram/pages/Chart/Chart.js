// miniprogram/pages/Chart/Chart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [{
        name: 'year',
        value: '周',
        isActive: true
      },
      {
        name: 'mouth',
        value: '月',
        isActive: false
      },
      {
        name: 'week',
        value: '年',
        isActive: false
      },
    ],
    type: [{
        name: "支出",
        type: "zhichu",
        isActive: true
      },
      {
        name: "收入",
        type: "shouru",
        isActive: false
      }
    ],
    // 是否首次登录
    isFirst: true,
    // 图标数据
    pieChartData: [],
    // 消费类型
    consumeType: [],
    // 饼图数据分类
    series: [],
    seriesData: [],
    screenWidth: 0,
    isNotData:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (this.data.isFirst) {
      setTimeout(() => {
        this.setData({
          isFirst: false
        }, 1000)
      })
    }
    //获取屏幕宽度
    let screenWidth = wx.getSystemInfoSync().screenWidth;

    this.setData({
      screenWidth
    })
    // 获取消费类型
    this.getConsumeType()
    // 获取当前日期图标数据，默认支出/周
    // this.selectTime()
    // this.getChartData()
    
    // this.pieChartCanvas()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {



  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    if (this.data.isFirst) {
      console.log("首次进入，拦截")
      return;
    }
    // 获取消费类型
    this.getConsumeType()
    // 获取当前日期图标数据，默认支出/周
    // this.selectTime()
    // this.getChartData()
    

  },


  // 绘制图饼
  drawChart(series) {
    var Charts = require('../../js/wxcharts-min');
    new Charts({
      canvasId: 'pieCanvas',
      type: 'pie',
      series,
      width: this.data.screenWidth,
      height: 250,
      dataLabel: true
    });
  },
     // 切换导航
     radioChange: function (e) {
      console.log('radio发生change事件，携带value值为：', e)
      if (e.currentTarget.dataset.active) {
        console.log("当前已激活");
        return
      }
  
      let typeData = this.data[e.currentTarget.dataset.type]
      for (let i = 0; i < typeData.length; i++) {
        if (typeData[i].isActive) {
          typeData[i].isActive = false;
          break;
        }
      }
      typeData[e.currentTarget.dataset.index].isActive = true;
  
      this.setData({
        [e.currentTarget.dataset.type]: typeData
      })
      this.selectTime()
      console.log(typeData)
  
  
    },
  // 绘制图形
  pieChartCanvas() {
    console.log("消费类型==>", this.data.consumeType)
    console.log("图标数据==>", this.data.pieChartData)
    let consumeType = this.data.consumeType;
    let pieChartData = this.data.pieChartData;
    let o = {}
    consumeType.forEach((v, i) => {
      pieChartData.forEach((val, index) => {
        if (val.consumeType == v.type) {
          o[v.type] = []
        }
      })
    })
    let total = 0;
    pieChartData.forEach((val, index) => {
      total += Number(val.accountMoney) 
      for (let key in o) {
        if (val.consumeType == key) {
          o[key].push(val)
        }
      }
    })
    this.data.series = []
    for (let key in o) {
      this.data.series.push({
        type: key
      })
    }

    this.data.series.forEach(v => {
      let count = 0;
      let r =Math.random()*255
      let g =Math.random()*255
      let b =Math.random()*255
      o[v.type].forEach(val => {
        if (v.type == val.consumeType) {
          v.name = val.consume;
          v.url = val.consumeUrl;
          v.color = 'rgb'+'('+r+','+g+','+b+')'
          count += Number(val.accountMoney)
          v.rat = ((count / total) * 100).toFixed(2) + '%'
          v.format = function(val){
            return v.name +' '+v.rat
          }
        }
      })
      v.data = count
      v.money = (count.toFixed(2)).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g,'$1,')
    })
    o.total = (total.toFixed(2)).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g,'$1,')
    console.log('seriesData==>',o)
    console.log(this.data.series)
   
    this.setData({
      seriesData: o,
      series: this.data.series
    })
      this.drawChart(this.data.series)
    
  },

  // 获取消费类型
  getConsumeType() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "book_keeping",
      data: {},
      success: res => {
        wx.hideLoading()
        console.log("请求消费类型数据成功==>", res)
        this.setData({
          // 获取消费类型
          consumeType: res.result.data
        })
        this.selectTime()
      },
      fail: err => {
        wx.hideLoading()
        console.log("请求消费类型数据失败==>", err)
      }
    })
  },
  // 选择时间
  selectTime: function (e) {
    let o = {}
    // 支出或收入
    this.data.type.forEach(v => {
      if (v.isActive) {
        o.accountType = v.type
      }
    })
    let newYear = new Date().getFullYear();
    let newMouth = new Date().getMonth() + 1;
    let newDay = new Date().getDate();
    newMouth = newMouth < 10 ? '0' + newMouth : newMouth
    newDay = newDay < 10 ? '0' + newDay : newDay
    o.endDate = newYear + '-' + newMouth + '-' + newDay
    // 周/月/年
    for (let i = 0; i < this.data.items.length; i++) {
      if (this.data.items[i].isActive) {
        if (this.data.items[i].value == "周") {
          let new_date = new Date(newYear, (newMouth - 1), 1).getTime()
          let lastDay = new Date(new_date - 1000 * 60 * 60 * 24).getDate()
          let startDay;
          if (newDay - 7 <= 0) {
            startDay = lastDay + (newDay - 7);
            newMouth = newMouth - 1
          } else {
            startDay = newDay - 7
          }
          startDay = startDay < 10 ? '0' + startDay : startDay
          o.startDate = newYear + '-' + newMouth + '-' + startDay
        } else if (this.data.items[i].value == "月") {
          o.startDate = newYear + '-' + newMouth + '-' + '01'
        } else if (this.data.items[i].value == "年") {
          o.startDate = newYear + '-' + "01" + '-' + '01'
        }
      }
    }
    console.log("当前激活时间==>", o)
    // 根据时间筛选数据
    this.getChartData(o)

  },
 
  // 获取图标数据
  getChartData: function (data) {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'get_chart_data',
      data,
      success: res => {
        wx.hideLoading()
        console.log("请求图表数据成功==>", res)
        if(res.result.data.length<=0){
          console.log("没有数据")
          this.data.isNotData = true;
          // return
        }else{
          this.data.isNotData = false;
        }
        
        console.log(this.data.isNotData)
        this.setData({
          pieChartData: res.result.data,
          isNotData:this.data.isNotData
        })
        console.log(res.result.data)
        if(this.data.isNotData){
          return
        }
        // 获取消费类型
        // this.getConsumeType()
        // 绘制图表
        this.pieChartCanvas()
      },
      fail: err => {
        wx.hideLoading()
        console.log("请求图表数据失败==>", err)
      }
    })
  },
  
})