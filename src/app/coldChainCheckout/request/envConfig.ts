interface ConfigBody {
  clientId: string
  baseUrl: string
}

export interface Config {
  [propertyName: string]: ConfigBody
}

const envConfig: Config = {
  development: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/ccti/private/tu3zDOuNM98wf4CRleuDN4',
  },
  staging: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/ccti/private/tu3zDOuNM98wf4CRleuDN4',
  },
  production: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/ccti/private/tu3zDOuNM98wf4CRleuDN4',
  },
}

export default envConfig
