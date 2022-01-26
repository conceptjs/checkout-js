import axios from 'axios'

import envConfig from './envConfig'
import { storage } from '../utils'

const env: string = process.env.NODE_ENV === 'none' ? 'staging' : process.env.NODE_ENV ?? 'production'

const ccrequest = axios.create({
  baseURL: envConfig[env].baseUrl,
  timeout: 1000 * 10 * 60 * 5,
})

ccrequest.interceptors.request.use(config => {
  if (!config.headers){
    config.headers = {};
  }
  config.headers.Authorization = storage.BCToken.getValue();
  console.log("set bc jwt token:"+storage.BCToken.getValue());

  return config
})

ccrequest.interceptors.response.use(resp => {
  if (resp.status !== 200) {
    console.log("cc api failed:" + resp.statusText);
  }

  switch (resp.status) {
    case 200: break
    case 10015: return Promise.reject()
    default: {
      return Promise.reject()
    }
  }

  return resp.data;
})

export default ccrequest
