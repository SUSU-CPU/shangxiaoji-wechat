// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  
  try {
    
    return await db.collection('punch_time_data').where(event).get();

  } catch (e) {

    console.log(e)

  }
}