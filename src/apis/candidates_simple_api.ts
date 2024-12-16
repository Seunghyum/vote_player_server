import axios from 'axios'
import mongoose from "mongoose";
import "dotenv/config";
import candidatesSimple from '@models/candidates_simple';

const { CANDIDATE_API_KEY, MONGO_URI, MONGO_DBNAME, MONGO_USERNAME, MONGO_PASSWORD } = process.env;


if (!MONGO_URI) throw Error("dontenv 설정을 확인하세요");

mongoose
  .connect(MONGO_URI, {
    authSource: "admin",
    dbName: MONGO_DBNAME,
    user: MONGO_USERNAME,
    pass: MONGO_PASSWORD,
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch((e) => console.error(e));


axios.get(`https://apis.data.go.kr/9710000/NationalAssemblyInfoService/getMemberCurrStateList`, {
    params: {
        serviceKey: CANDIDATE_API_KEY,
        numOfRows: 300,
        pageNo: 1
    },
}).then(async (res) => {
    console.log(res.data.response.body.items.item)
    const items = res.data.response.body.items.item
    if(!items) throw Error('api 응답에 문제가 있습니다.')
  const result = await candidatesSimple.insertMany(items)
  console.log('result : ', result)
}).catch(err => console.log('err : ', err));

