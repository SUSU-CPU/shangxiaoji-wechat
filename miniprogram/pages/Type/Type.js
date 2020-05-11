// miniprogram/pages/Type/Type.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataType:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.name + '账单详情'
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:"get_id_account_data",
      data:{
        ids:options.item_id
      },
      success:res=>{
        wx.hideLoading()
        console.log("请求详情数据成功==>",res)
        this.setData({
          dataType:res.result.data
        })
      },
      fail:res=>{
        wx.hideLoading()
        console.log("请求详情数据失败==>",err)
      }
    })
  },
  
})