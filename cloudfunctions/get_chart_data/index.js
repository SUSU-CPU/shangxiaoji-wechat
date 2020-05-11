// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let o = {
    userInfo:event.userInfo,
    accountTime:_.gte(event.startDate).and(_.lte(event.endDate)),
    accountType:event.accountType
  }

  try {
    
    return await db.collection('book_keeping_data').where(o).get();

  } catch (e) {

    console.log(e)

  }
}