// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

// 获取数据库上下文
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  try {

    return await db.collection('book_keeping').get();

  } catch (e) {

    console.log(e)

  }

}


