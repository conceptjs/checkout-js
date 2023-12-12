import axios from 'axios'

import { storage } from '../utils'

import envConfig from './envConfig'

export type CustomerIdType = number
export type StoreHashType = string
export type TokenType = string | undefined

export interface GetTokenRequestBody {
  bcToken: TokenType,
  customerId: CustomerIdType,
  storeHash: StoreHashType,
}
export interface GetTokenResponseBody {
  token?: string
}

export interface RequestPoNumber {
  orderId: string
  poNumber: string
}

const env: string = process.env.NODE_ENV === 'none' ? 'staging' : process.env.NODE_ENV ?? 'production'

const b3request = axios.create({
  baseURL: envConfig[env].bundleB2BUrl,
  timeout: 1000 * 10 * 60 * 5,
})

b3request.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    authToken: storage.B3AuthToken.getValue(),
  }
  if (config.params && config.params.orderBy) {
    config.params = {
      ...config.params,
    }
  }

  return config
})

b3request.interceptors.response.use(resp => {
  const {
    code,
    message,
    data,
    detail
  } = resp.data

  if (resp.status !== 200) {
    console.log("bundle b2b api failed:" + (resp.statusText));
  }

  switch (code) {
    case 200: break
    case 10015: return Promise.reject()
    default: {
      console.log("bundle b2b api api failed:" + (message || detail));
      return Promise.reject()
    }
  }

  return data
})

//export const getToken = (): Promise<GetTokenResponseBody> => b3request.get('/api/io/auth/storefront')
export const getToken = (data: GetTokenRequestBody): Promise<GetTokenResponseBody> => b3request.post('/api/v2/login', data)

export const addPoNumber = (data: RequestPoNumber) => b3request.post('/api/v2/orders', data)

export default b3request
