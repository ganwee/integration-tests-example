//Complete steps 1-4 for test configuration

/* 
1. Configure Your API's Base Url
Set the base url for your API's endpoint
*/
export const baseUrl = "https://test-eth.test.com/";

/*
2. Configure Your API Headers
If your API requires any specific headers to be called, fill in the necessary params in the headers object
If your API does not need any headers to be accessed, leave headers as an empty object, {}
*/
export const yourApiKey = "api_key_provided_by_gw"; //API_KEY provided to you by gw
export const headers = {
  apiKey: yourApiKey,
  // Add any other necessary headers to call API below
  // key1: value1,
};

/*
3. Configure Testing Params
Update chainId to ID of the chain which is being tested or integrated
Update buyerToken and/or sellerToken to tokens intended to be tested or integrated
By default, poolAddresses is populated with gw Pool addresses
If you are not intending to use gw Pool, update poolAddresses to the pool which you use to fulfil orders on the specified chain
*/
export const chainId = 1; //Default: ethereum mainnet
export const sellerToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; //Default: USDC
export const buyerToken = "0xdac17f958d2ee523a2206206994597c13d831ec7"; //Default: USDT
export const poolAddresses: Record<number, string> = {
  1: "0x9e2505ff3565d7c83a9cbcfd260c4a545780b402", //Ethereum
  56: "0xd1ab6402c9d938aef06c108400d437c8b99e7d1a", //BSC
  5000: "0xB9e1E3777cF8271b27Eb994f0a432f35cB723319", //Mantle
  7000: "0xefb4EC569DA5f55bDb5d9BD40917EBae96a25F47", //Zetachain
  8453: "0xB9e1E3777cF8271b27Eb994f0a432f35cB723319", //Base
  42161: "0x5B0711EEE0c6366AA35A98b14fD8b4B4C6d1D04C", //Arbitrum
  534352: "0x814ca7f878513b4179927112972f483b724b620f", //Scroll
  810180: "0x4712707F93Ea7544052Cbb2616D9407578cC149b", //Zklink
};

/*
4. Configure Signer
Provide the address of the signer you use to sign transactions on the specified chain
*/
export const signer = "0x0000000000000000000000000000000000000000";
