// miniprogram/pages/Add/Add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    //轮播图配置
    swiperOptions: {
      indicatorDots: true,
      indicatorActiveColor: '#19ab83',
      indicatorColor: '#CDCDCD'
    },
    accountData: [{
        title: "现金",
        type: "xianjian",
        isActive: true
      },
      {
        title: "支付宝",
        type: "zhifubao",
        isActive: false
      },
      {
        title: "微信",
        type: "weixin",
        isActive: false
      },
      {
        title: "储蓄卡",
        type: "chuxuka",
        isActive: false
      },
      {
        title: "信用卡",
        type: "xinyongka",
        isActive: false
      },
    ],
    opitionDate: {
      start: '',
      end: ''
    },
    // 消费类型数据
    bookKeepingData: [],
    // 账单详情
    bookkeepingDetail: {
      time: "",
      remark: '',
      money: ''
    },
    isPunch: true,
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let start = (year - 1) + '-' + mouth + '-' + day;
    let end = year + '-' + mouth + '-' + day;
    this.setData({
      opitionDate: {
        start,
        end
      },
    })

    wx.showLoading({
      title: '加载中',
    })
    // 调用云函数[book_keeping], 获取记账类型数据
    wx.cloud.callFunction({

      //云函数名称
      name: 'book_keeping',

      //参数
      data: {},

      //请求成功执行
      success: res => {
        wx.hideLoading()
        console.log('[云函数] [book_keeping] res ==> ', res);

        res.result.data.forEach(v => {
          v.isActive = false;
        })

        this.setData({
          bookKeepingData: res.result.data
        })

      },

      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [get_book_keeping] 调用失败 err ==> ', err);
      }
    })

    this.getAccountTime();
    this.getSetting()
  },

  // 查看是否授权
  getSetting(){
    var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function(res) {
                if (!res.authSetting['scope.userInfo']) {
                  // 用户没有授权
                    // 改变 isHide 的值，显示授权页面
                    wx.reLaunch({
                      url: '../Accredit/Accredit'
                  })
                } 
            }
        });

  },

  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
        //用户按了允许授权按钮
        var that = this;
        // 获取到用户的信息了，打印到控制台上看下
        console.log("用户的信息如下：");
        console.log(e.detail.userInfo);
        //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
        that.setData({
            isHide: false
        });
    } else {
        //用户按了拒绝按钮
        wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function(res) {
                // 用户没有授权成功，不需要改变 isHide 的值
                if (res.confirm) {
                    console.log('用户点击了“返回授权”');
                }
            }
        });
    }
},

  // 切换收入支出
  cutType(e) {
    if (e.currentTarget.dataset.active) {
      console.log("当前已激活")
      return;
    }
    let typeName = e.currentTarget.dataset.typename;
    let type = this.data[typeName];
    for (let i = 0; i < type.length; i++) {
      if (type[i].isActive) {
        type[i].isActive = false;
        break;
      }
    }

    type[e.currentTarget.dataset.index].isActive = true;
    this.setData({
      [typeName]: type
    })
  },

  // 选择日期
  bindDateChange(e) {
    let value = e.detail.value;
    this.data.bookkeepingDetail.time = value;
    this.setData({
      bookkeepingDetail: this.data.bookkeepingDetail
    })
  },
  getInfo(e) {
    if (e.currentTarget.dataset.name == "remark") {
      this.data.bookkeepingDetail.remark = e.detail.value
    } else if (e.currentTarget.dataset.name == "money") {
      this.data.bookkeepingDetail.money = e.detail.value
    }
    this.setData({
      bookkeepingDetail: this.data.bookkeepingDetail
    })
  },

  selectBookkeepType() {

    this.getAccountTime()

    let data = {};
    // 获取支出/收入类型
    this.data.type.forEach(v => {
      if (v.isActive) {
        data.accountType = v.type;
        data.type = v.name;
      }
    })
    // 获取消费类型consume
    let isSelect = false;
    for (let i = 0; i < this.data.bookKeepingData.length; i++) {
      if (this.data.bookKeepingData[i].isActive) {
        data.consume = this.data.bookKeepingData[i].title;
        data.consumeType = this.data.bookKeepingData[i].type;
        data.consumeUrl = this.data.bookKeepingData[i].url;
        data.id = this.data.bookKeepingData[i]._id;
        isSelect = true;
        break;
      }
    }
    if (!isSelect) {
      wx.showToast({
        title: '请选择消费类型',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return
    }

    // 获取账户选择payment
    for (let i = 0; i < this.data.accountData.length; i++) {
      if (this.data.accountData[i].isActive) {
        data.payment = this.data.accountData[i].title;
        data.paymentType = this.data.accountData[i].type;
        break;
      }
    }

    // 获取账单详情detail
    if (this.data.bookkeepingDetail.time == '') {
      data.accountTime = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
      this.data.bookkeepingDetail.time = data.accountTime;
      this.setData({
        bookkeepingDetail: this.data.bookkeepingDetail
      })
    } else {
      data.accountTime = this.data.bookkeepingDetail.time;
    }
    if (this.data.bookkeepingDetail.money == '' || this.data.bookkeepingDetail.money == 0) {
      wx.showToast({
        title: '填写消费金额',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }
    data.accountRemark = this.data.bookkeepingDetail.remark;
    data.accountMoney = this.data.bookkeepingDetail.money;

    console.log(data)

    wx.showLoading({
      title: '保存中',
    })

    // 调用云函数[get_book_keeping], 添加记账数据
    wx.cloud.callFunction({
      //云函数名称
      name: 'add_book_keeping',
      //参数
      data,
      //请求成功执行
      success: res => {
        wx.hideLoading()
        // 重置数据
        for (let i = 0; i < this.data.bookKeepingData.length; i++) {
          if (this.data.bookKeepingData[i].isActive) {
            this.data.bookKeepingData[i].isActive = false;
            break
          }
        }
        for (let i = 0; i < this.data.type.length; i++) {
          if (this.data.type[i].isActive) {
            this.data.type[i].isActive = false;
            break
          }
        }
        this.data.type[0].isActive = true;

        for (let i = 0; i < this.data.accountData.length; i++) {
          if (i != 0 && this.data.accountData[i].isActive) {
            this.data.accountData[i].isActive = false;
            break;
          }
        }
        this.data.accountData[0].isActive = true;

        for (let key in this.data.bookkeepingDetail) {
          this.data.bookkeepingDetail[key] = ''
        }
        this.setData({
          accountData: this.data.accountData,
          bookkeepingDetail: this.data.bookkeepingDetail,
          bookKeepingData: this.data.bookKeepingData,
          type: this.data.type
        })

        console.log(this.data.isPunch)
        if (!this.data.isPunch) {
          console.log("今日未记账")
          this.addAccountTime()
        }

        console.log('[云函数] [add_book_keeping] res ==> ', res);
      },
      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.log('[云函数] [add_book_keeping] 调用失败 err ==> ', err);
      }
    })
  },
  // 获取记账天数
  getAccountTime() {
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate()
    let time = year + '-' + mouth + '-' + day
    wx.cloud.callFunction({
      name: "get_account_day",
      data: {},
      success: res => {
        console.log("获取几张天数成功=>", res)
        if(res.result.data<=0){
          this.data.isPunch = false
        }else{
          res.result.data.forEach(v => {
            if (v.time == time) {
              this.data.isPunch = true
            } else {
              this.data.isPunch = false
            }
          })
        }
        
        this.setData({
          isPunch: this.data.isPunch
        })
      },
      fail: err => {
        console.log("获取几张天数成功=>", err)
      }
    })
  },
  // 设置记账天数
  addAccountTime() {
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate()
    let time = year + '-' + mouth + '-' + day
    wx.cloud.callFunction({
      name: "add_account_time",
      data: {
        time
      },
      success: res => {
        console.log("添加记账时间成功=>", res)
         this.setData({
          isPunch:true
         })
      },
      fail: err => {
        console.log("添加记账时间失败=>", err)
      }
    })
  }

})