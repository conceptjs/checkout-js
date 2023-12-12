// Get currently logged-in customer's BC token in order to send it to API for verification.
// appClientId: your app's client ID
import axios from 'axios'

import envConfig from './envConfig'

const env: string = process.env.NODE_ENV === 'none' ? 'staging' : process.env.NODE_ENV ?? 'production'

export interface BCResponse {
  status: number
  message: string
  data: object
}

export interface BCResponseError {
  message?: string
}

export interface BCTokenResponseBody {
  token?: string
}

export const getBcToken = async (clientId:string | undefined): Promise<string | undefined> => {
  try {
    const response: BCResponse = await axios
      .get('/customer/current.jwt', {
        params: {
          app_client_id: (clientId)?clientId:envConfig[env].clientId,
        },
      })
    if (response.status !== 200) {
      console.log("bc api failed:" + (response.message));

      return
    }

    return (response.data as BCTokenResponseBody).token
  } catch (error) {
    console.log("bc api failed:" + ((error as BCResponseError).message));
  }
}
