// miniprogram/pages/Bill/Bill.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    billType: [{
        name: '月账单',
        type: "mouth",
        isActive: true
      },
      {
        name: '年账单',
        type: "year",
        isActive: false
      }
    ],
    consumeType: [{
        name: '支出',
        type: "zhichu",
        isActive: true
      },
      {
        name: '收入',
        type: "shouru",
        isActive: false
      }
    ],
    multiArray: [],
    multiIndex: [0, 0],
    // 是否首次加载页面
    isFirst: true,
    login_time: '',
    billData: {
      // 开始时间
      start: '',
      // 结束时间
      end: '',
      time: "",
      // 账单类型
      billtype: '',
      // 消费类型
      comsumetypetext: '',
      comsumetype: '',
      // 账单数量
      count: 0,
      // 账单总合计      
      total: '',
      // 账单分类列表
      billList: [],
      notHavaData:false
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 是否首次进入页面
    if (this.data.isFirst) {
      setTimeout(() => {
        this.setData({
          isFirst: false
        }, 1000)
      })
    }
    this.getFirstLoginTime()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isFirst) {
      console.log("首次加载拦截")
      return
    }

    this.getFirstLoginTime()
  },

  // 切换导航
  switchTab(e) {
    console.log(e)
    let dataset = e.currentTarget.dataset
    let key = dataset.name;
    if (dataset.active) {
      console.log("当前已激活")
      return
    }

    for (let i = 0; i < this.data[dataset.name].length; i++) {
      if (this.data[dataset.name][i].isActive) {
        this.data[dataset.name][i].isActive = false;
        break
      }
    }
    this.data[dataset.name][dataset.index].isActive = true;
    // 初始化时间
    if (key == "billType") {
      this.clearTime(this.data.login_time)
      // let time = (this.data.billData.time).split(/[\u4e00-\u9fa5]/g)
      // console.log(time)
    } else if (key == "consumeType") {
      this.data.billData.comsumetype = dataset.type
      this.data.billData.comsumetypetext = dataset.names
      // 根据时间筛选数据
      this.getBookKeeping()
    }
    this.setData({
      [dataset.name]: this.data[dataset.name],
      billData: this.data.billData
    })
  },
  // 时间选择器
  bindMultiPickerChange(e) {
    let isNow = false;
    let data = e.detail.value
    let day = new Date().getDate();
    let nowyear = new Date().getFullYear();
    let nowmouth = new Date().getMonth() + 1;
    day = day < 10 ? '0' + day : day
    nowmouth = nowmouth < 10 ? '0' + nowmouth : nowmouth
    let year = this.data.multiArray[0][data[0]];
    let nowtime = this.data.billData.time.split(/[\u4e00-\u9fa5]/g)
    console.log(data)
    console.log(this.data.multiArray)
    // 判断是否是点击相同时间
    if (data.length <= 1 && this.data.multiArray[0][data[0]] == nowtime[0]) {
      console.log("当前数据已更新")
      return
    } else if (data.length >= 2 && this.data.multiArray[0][data[0]] == nowtime[0] && this.data.multiArray[1][data[1]] == nowtime[1]) {
      console.log("当前数据已更新")
      return
    }


    this.data.billData.time = year + '年';

    // 年账单
    // 如果是当前的年份
    if (year == nowyear) {
      isNow = true
      this.data.billData.start = nowyear + '-' + 1 + '-' + this.getLastDay(nowyear, 1, 0)
      this.data.billData.end = nowyear + '-' + nowmouth + '-' + day
    } else {
      this.data.billData.start = year + '-' + 1 + '-' + this.getLastDay(year, 1, 0)
      this.data.billData.end = year + '-' + 12 + '-' + this.getLastDay(year, 12, 0)
    }

    // 月账单
    if (data.length >= 2) {
      let mouth = this.data.multiArray[1][data[1]]
      this.data.billData.time += mouth + "月"
      this.data.billData.start = year + '-' + mouth + '-' + '01'
      if (isNow && mouth == nowmouth) {
        this.data.billData.end = year + '-' + nowmouth + '-' + day
      } else {
        this.data.billData.end = year + '-' + mouth + '-' + this.getLastDay(year, 12, 0)
      }
    }
    console.log(this.data.billData)
    this.setData({
      billData: this.data.billData
    })
    // 根据时间筛选数据
    this.getBookKeeping()
  },

  // 获取某个月的最后一天
  getLastDay(year, mouth) {
    return new Date(year, mouth, 0).getDate()
  },
  // 获取第一次登录时间
  getFirstLoginTime() {
    wx.cloud.callFunction({
      name: "get_first_login_time",
      data: {},
      success: res => {
        console.log("获取第一次登陆时间成功=>", res)
        this.setData({
          login_time: res.result.data[0].login_time
        })
        this.clearTime(res.result.data[0].login_time)
      },
      fail: err => {
        console.log("获取第一次登陆时间失败=>", err)

      }
    })
  },
  // 初始化时间
  clearTime(loginTime) {
    let type = '';
    let timeArr = loginTime.split('-');
    let yearArr = []
    let mouthArr = []
    // 月账单/年账单
    for (let i = 0; i < this.data.billType.length; i++) {
      if (this.data.billType[i].isActive) {
        type = this.data.billType[i].type;
        this.data.billData.billtype = type
        break
      }
    }

    // 支出/收入
    for (let i = 0; i < this.data.consumeType.length; i++) {
      if (this.data.consumeType[i].isActive) {
        this.data.billData.comsumetypetext = this.data.consumeType[i].name
        this.data.billData.comsumetype = this.data.consumeType[i].type
        break
      }
    }

    // 获取当前时间
    let year = new Date().getFullYear();
    let mouth = new Date().getMonth() + 1;
    let day = new Date().getDate();
    mouth = mouth < 10 ? '0' + mouth : mouth
    day = day < 10 ? '0' + day : day
    // 年
    for (let i = Number(timeArr[0]); i <= year; i++) {
      yearArr.push(i)
    }
    // 月
    for (let j = 1; j <= mouth; j++) {
      mouthArr.push('0' + j)
    }


    this.data.multiArray = []
    this.data.multiIndex[0] = yearArr.length - 1
    this.data.multiArray.push(yearArr)
    this.data.billData.time = yearArr[this.data.multiIndex[0]] + "年"


    if (type == 'mouth') {
      this.data.multiIndex[1] = mouthArr.length - 1
      this.data.multiArray.push(mouthArr)
      this.data.billData.time += mouthArr[this.data.multiIndex[1]] + '月'
    }

    if(this.data.billData.billtype == 'year'){
      this.data.billData.end = year + "-" + mouth + '-' + day
      this.data.billData.start = year + "-" +'01' + '-' + '01';
    }else if(this.data.billData.billtype == 'mouth'){
      this.data.billData.end = year + "-" + mouth + '-' + day
    this.data.billData.start = year + "-" + mouth + '-' + '01';
    }
    


    this.setData({
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
      billData: this.data.billData
    })
    // 根据时间筛选数据
    this.getBookKeeping()

  },
  // 根据条件筛选数据
  getBookKeeping() {
    let o = {
      startDate: this.data.billData.start,
      endDate: this.data.billData.end,
      accountType: this.data.billData.comsumetype
    }
    this.data.billData.billList = []
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "get_chart_data",
      data: o,
      success: res => {
        wx.hideLoading()
        console.log("根据时间条件筛选数据成功==>", res)
        let data = res.result.data;
        let billList = this.data.billData.billList
        this.data.billData.total = 0;
        if(data.length <= 0){
          this.data.notHavaData = false
          console.log("没有数据")
        }else{
          this.data.notHavaData = true
        }
        let obj = {}
        data.forEach(v => {
          this.data.billData.total += Number(v.accountMoney)
          obj[v.consumeType] = ''
        })
        this.data.billData.total = (this.data.billData.total.toFixed(2)).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g,'$1,')
        this.data.billData.index = data.length
        for (let key in obj) {
          billList.push({
            consumeType: key
          })
        }
        // return
        billList.forEach(v => {
          v.count = 0;
          v.num = 0;
          v.item_id = ''
          data.forEach(val => {
            if (v.consumeType == val.consumeType) {
              v.consume = val.consume;
              v.consumeUrl = val.consumeUrl
              v.count += Number(val.accountMoney)
              v.item_id += val._id +'@'
              v.num+=1
            }
          })
          v.count = (v.count.toFixed(2)).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g,'$1,')
        })
        // console.log(billList)
        // this.data.billData.billList = billList
        console.log(this.data.billData)
        this.setData({
          billData: this.data.billData,
          notHavaData:this.data.notHavaData
        })
      },
      fail: err => {
        wx.hideLoading()
        console.log("根据时间条件筛选数据失败==>", err)

      }
    })

  },
  // 跳转到typq页面
  goPage(e){
    console.log(e)
    let promes = ""
    for(let key in e.currentTarget.dataset){
      console.log(key)
      if(key == "item_id"){
        e.currentTarget.dataset[key] =  e.currentTarget.dataset[key].slice(0,-1)
      }
      promes += key + '=' + e.currentTarget.dataset[key] + '&'
    }
    promes = promes.slice(0,-1)
    wx.navigateTo({
      url: '../Type/Type?'+  promes
    })
  }

})