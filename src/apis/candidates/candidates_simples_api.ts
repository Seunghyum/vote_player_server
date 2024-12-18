import axios from 'axios'
import "dotenv/config";

const { CANDIDATE_API_KEY } = process.env;

export default function getCandidatesSimples() {
  return axios.get(`https://apis.data.go.kr/9710000/NationalAssemblyInfoService/getMemberCurrStateList`, {
    params: {
        serviceKey: CANDIDATE_API_KEY,
        numOfRows: 300,
        pageNo: 1
    },
  }).then(async (res) => {
      const items = res.data.response.body.items.item
      if(!items) throw Error('api 응답에 문제가 있습니다.')
      return items
  }).catch(err => console.log('err : ', err));
}