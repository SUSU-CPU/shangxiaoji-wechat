// miniprogram/pages/My/My.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    operateData: [{
        type: "patch",
        text: "累计打卡天数",
        count: 0
      },
      {
        type: "day",
        text: "已记账天数",
        count: 0
      },
      {
        type: "num",
        text: "已记账笔数",
        count: 0
      }
    ],
    isFirst: true,
    punchData: [],
    isPunch: false,
    punchTimeCount: 0,
    opacity: 0,
    userInfo: {}
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
    // 获取天数
    this.getAccountTime();
    // 获取笔数
    this.getbookKeeping()
    // 获取打卡天数
    this.getpunchCard();
    this.getUserInfo()
  },

  getUserInfo() {
    let that = this;
    wx.getUserInfo({

      success(res) {

        // var app = getApp();
        // app.globalData.userInfo = res.userInfo;
        console.log(res)
        that.setData({
          userInfo: res.userInfo
        })
      }

    })

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
      return
    }
    // 获取天数
    this.getAccountTime()
    // 获取笔数
    this.getbookKeeping()
    // 获取打卡天数
    this.getpunchCard()
  },
  // 获取记账天数
  getAccountTime() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "get_account_day",
      data: {},
      success: res => {
        wx.hideLoading()
        console.log("获取几张天数成功=>", res)
        if (res.result.data.length > 0) {
          this.data.operateData[1].count = res.result.data.length
        }
        this.setData({
          operateData: this.data.operateData
        })
      },
      fail: err => {
        wx.hideLoading()
        console.log("获取几张天数成功=>", err)
      }
    })
  },
  // 获取记账笔数
  getbookKeeping() {
    wx.cloud.callFunction({
      name: "get_all_book_keeping",
      data: {},
      success: res => {
        console.log("获取记账笔数成功=>", res)
        if (res.result.data.length > 0) {
          this.data.operateData[2].count = res.result.data.length
        }
        this.setData({
          operateData: this.data.operateData
        })
      },
      fail: err => {
        console.log("获取记账笔数成功=>", err)
      }
    })
  },
  // 获取打卡数据
  getpunchCard() {
    wx.cloud.callFunction({
      name: "get_punch_time_data",
      data: {},
      success: res => {
        console.log("获取打卡日期成功=>", res)
        let year = new Date().getFullYear();
        let mouth = new Date().getMonth() + 1;
        let day = new Date().getDate();
        let time = year + '-' + mouth + '-' + day
        if (res.result.data.length <= 0) {
          this.data.isPunch = false
        } else {
          for (let i = 0; i < res.result.data.length; i++) {
            console.log(res.result.data[i])
            if (res.result.data[i].punch_time == time) {
              console.log("今日已打卡")
              this.data.isPunch = true;
              break
            } else {
              console.log("今日未打卡")
              this.data.isPunch = false
            }
          }
        }
        this.data.operateData[0].count = res.result.data.length;
        this.setData({
          operateData: this.data.operateData,
          isPunch: this.data.isPunch,
          punchData: res.result.data
        })


      },
      fail: err => {
        console.log("获取打卡日期成功=>", err)
      }
    })
  },
  // 打卡
  addPunchTime() {
    this.getpunchCard()
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let time = year + '-' + mouth + '-' + day

    console.log(this.data.isPunch)

    if (!this.data.isPunch) {
      console.log('打卡')
      wx.cloud.callFunction({
        name: "add_punch_time_data",
        data: {
          punch_time: time
        },
        success: res => {
          wx.showToast({
            title: '打卡成功',
            icon: '',
            duration: 2000
          })
          console.log("打卡成功", res)
          this.data.operateData[0].count += 1
          this.setData({
            operateData: this.data.operateData,
            isPunch: true
          })
        },
        fail: err => {
          console.log("打卡成功", err)
        }
      })
    }else{
      wx.showToast({
        title: '今日已打卡',
        icon: '',
        duration: 2000
      })
    }
    this.offPopWindow()
  },
  // 打开弹窗
  popWindow() {
    this.setData({
      opacity: 1
    })
  },
  // 关闭弹窗
  offPopWindow() {
    this.setData({
      opacity: 0
    })
  },
  // 点击跳转到
  goOrderPage() {
    wx.navigateTo({
      url: '../Order/Order'
    })
  }
})