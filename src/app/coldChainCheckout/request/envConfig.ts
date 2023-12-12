interface ConfigBody {
  clientId: string
  baseUrl: string
  bundleB2BUrl: string
  storeHash: string
  bundleB2BClientId: string
}

export interface Config {
  [propertyName: string]: ConfigBody
}

const envConfig: Config = {
  development: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/cctidev/private/CeYFEa-kEz8bAKZorVN9FD',
    bundleB2BUrl: "https://dev-v2.bundleb2b.net/api",
    storeHash: "utoumbe034",
    bundleB2BClientId: 'npjs1ubfnbxqqhmjxazbfy0cosfq4s4'
  },
  staging: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/cctidev/private/CeYFEa-kEz8bAKZorVN9FD',
    bundleB2BUrl: "https://staging-v2.bundleb2b.net",
    storeHash: "utoumbe034",
    bundleB2BClientId: 'r2x8j3tn54wduq47b4efct5tqxio5z2'
  },
  production: {
    clientId: '71rnax65s4abzi3vk78w1bo48hoocr3',
    baseUrl: 'https://smartsolutions.coldchaintech.com/eval/rest/cctidev/private/CeYFEa-kEz8bAKZorVN9FD',
    bundleB2BUrl: "https://api.bundleb2b.net",
    storeHash: "utoumbe034",
    bundleB2BClientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx'
  },
}

export default envConfig
