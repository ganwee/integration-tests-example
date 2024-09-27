import { BlockchainNetwork, blockchains, tokenData } from "../utils/data";

export class BlockchainService {
  getBlockchainMetadata(chain: BlockchainNetwork) {
    return blockchains.find((item) => item.value === chain);
  }

  getBlockchainMetadataByChainId(chainId: number | string) {
    return blockchains.find(
      (item) => Number(item.chainIdNumber) == Number(chainId),
    );
  }
}
