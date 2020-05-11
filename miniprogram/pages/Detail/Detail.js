// miniprogram/pages/Home/Home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opitionDate: {
      start: '',
      end: ''
    },
    data: {
      year: '',
      mouth: '',
      day: '',
      week: ''
    },
    week: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    // 账目列表
    accountDetailData: [],
    // 记录首次登录
    isFirstLoaded: true,
    isToday: true,
    // 当日账目
    dayAccounts: {
      // 支出
      expend: 0,
      // 收入
      income: 0
    },
    // 当月账目
    mouthAccounts: {
      // 支出
      expend: 0,
      // 收入
      income: 0
    },
    isNotData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (this.data.isFirstLoaded) {

      setTimeout(() => {
        this.setData({
          isFirstLoaded: false
        })
      }, 1000)

    }
    this.getTime();
    // 加载当天记账数据
    this.getTodayAccountData(this.data.data)
    // 查询月账单
    this.getMouthAccountDat()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
    if (this.data.isFirstLoaded) {
      console.log('onShow拦截');
      return;
    }
    this.setData({
      isToday: true
    })
    this.getTime()
    // 加载当天记账数据
    this.getTodayAccountData(this.data.data);
    // 查询月账单
    this.getMouthAccountDat()
  },
  getTime() {
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let week = new Date().getDay();
    let start = (year - 1) + '-' + mouth + '-' + day;
    let end = year + '-' + mouth + '-' + day;
    mouth = mouth < 10 ? '0' + mouth : mouth
    day = day < 10 ? '0' + day : day
    if (this.data.isToday) {
      week = "今天"
    }
    this.setData({
      opitionDate: {
        start,
        end
      },
      data: {
        year,
        mouth,
        day,
        week: week
      }
    })
  },
  getTodayAccountData(data) {
    wx.showLoading({
      title: '加载中',
    })
    let date = "";
    for (let key in data) {
      if (key != "week") {
        date += data[key] + '-'
      }
    }
    date = date.slice(0, -1);
    wx.cloud.callFunction({
      // 云函数名称
      name: "get_book_keeping",

      // 参数
      data: {
        accountTime: date,
        //获取当前日期的记账数据
        count: 1
      },
      // 请求成功时执行
      success: res => {
        wx.hideLoading()
        console.log(res)
        if(res.result.data.length <=0){
          this.data.isNotData = false
        }else{
          this.data.isNotData = true
        }
        res.result.data.forEach(v => {
          v.accountMoney = Number(v.accountMoney).toFixed(2)
        })

        this.setData({
          accountDetailData: res.result.data,
          isNotData:this.data.isNotData
        })

        // 计算日账目
        this.statistcsAccount("dayAccounts", this.data.accountDetailData)
      },
      // 请求成功时执行
      fail: err => {
        wx.hideLoading()
        console.log(err)
      }
    })
  },
  // 计算当日账目
  statistcsAccount(typeName, data) {

    this.data[typeName] = {
      expend: 0,
      income: 0
    }
    data.forEach(v => {
      if (v.accountType == "zhichu") {
        this.data[typeName].expend += Number(v.accountMoney)
      } else if (v.accountType == "shouru") {
        this.data[typeName].income += Number(v.accountMoney)
      }
    })

    this.setData({
      [typeName]: {
        expend: this.data[typeName].expend.toFixed(2),
        income: this.data[typeName].income.toFixed(2)
      }
    })
    console.log("月账单", this.data.mouthAccounts)
    console.log("日账单", this.data.dayAccounts)
  },
  // 选择日期
  bindDateChange(e) {
    let value = e.detail.value;
    let week = new Date(value).getDay();
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let data = value.split('-');
    if (data[0] != year || data[1] != mouth || data[2] != day) {
      week = this.data.week[week]
      // this.data.isToday = false;
    } else {
      week = "今天";
      // this.data.isToday = true;
    }


console.log(value)
let lastDate = this.data.data.year +'-'+this.data.data.mouth+'-'+this.data.data.day;
console.log(lastDate)
if(lastDate == value){
  console.log("当前数据已更新")
  return
}
    this.setData({
      data: {
        year: data[0],
        mouth: data[1],
        day: data[2],
        week: week
      }
    })

    // if (!this.data.isToday) {
      // 获取指定日期记账数据
      this.getTodayAccountData(this.data.data)
      // 查询本月账单
      this.getMouthAccountDat()
    // }


  },
  // 查询本月账单
  getMouthAccountDat() {
    let endDate = '';
    let startDate = '';
    for (let key in this.data.data) {
      if (key != "week") {
        endDate += this.data.data[key] + '-'
      }

    }
    startDate += this.data.data.year + '-' + this.data.data.mouth + '-' + '01'
    endDate = endDate.slice(0, -1);
    console.log("startDate", startDate)
    console.log("endDate", endDate)
    console.log(this.data.isToday)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "get_book_keeping",
      data: {
        startDate,
        endDate,
      },
      success: res => {
        wx.hideLoading()
        console.log("当月账单请求成功时==>", res)
        let data = res.result.data
        this.statistcsAccount("mouthAccounts", data)
      },
      fail: err => {
        wx.hideLoading()
        console.log("当月账单请求失败时==>", err)
      }
    })

  }

})