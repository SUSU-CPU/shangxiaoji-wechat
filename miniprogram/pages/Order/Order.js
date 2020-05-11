// miniprogram/pages/Order/Order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clientHeight: 0,
    orderData: [],
    isDisplay: 'none',
    deleteId: '',
    page:0,
    more:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取记账信息
    this.getAllAccount()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // if(!more){
    //   return
    // }
    // this.setData({
    //   page:this.data.page + 1
    // })
    // this. getAllAccount()
  },
  // 获取所有商品数据
  getAllAccount() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "get_page_book_keeping",
      data: {},
      success: res => {
        wx.hideLoading()
        console.log("获取所有账单信息成功==>", res)
        let data = this.sortOrder(res.result.data);
        this.setData({
          orderData: data
        })
      },
      fail: err => {
        wx.hideLoading()
        console.log("获取所有账单信息失败==>", err)
      }
    })
  },
  // 排序
  sortOrder(data) {
    return data.sort((a, b) => {
      return b.accountTime > a.accountTime ? 1 : -1
    })
  },
  longClick(e) {
    console.log(e)
    this.setData({
      isDisplay: 'block',
      deleteId: e.currentTarget.dataset.id
    })
  },
  deleteOrder() {
    wx.cloud.callFunction({
      name: "remove_account_data",
      data: {
        _id: this.data.deleteId
      },
      success: res => {
        wx.showToast({
          title: '删除成功',
        })
        console.log("删除单条数据成功==>", res)
        // 前端删除
        for (let i = 0; i < this.data.orderData.length; i++) {
          if (this.data.orderData[i]._id == this.data.deleteId) {
            console.log(this.data.orderData[i])
            this.data.orderData.splice(i, 1)
          }
        }
        this.setData({
          orderData:this.data.orderData
        })
        this.closeDeleteBox()
      },
      fail: err => {
        console.log("删除单条数据失败==>", err)
      }
    })

  },
  // 点击遮罩层关闭
  closeDeleteBox() {
    this.setData({
      isDisplay: 'none'
    })
  }
})