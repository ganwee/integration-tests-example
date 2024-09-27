import { InternalServerErrorException } from "@nestjs/common";
import { BlockchainNetwork, tokenData } from "../utils/data";

export class TokenService {
  errors: Record<string, boolean>;
  constructor() {
    this.errors = {};
  }

  async getTokenSymbol(chain: BlockchainNetwork, tokenAddress: string) {
    tokenAddress = tokenAddress?.toLocaleLowerCase();
    try {
      const symbol = tokenData.find(
        (token) =>
          tokenAddress.toLowerCase() === token.address.toLowerCase() &&
          chain === token.chain
      );
      if (!symbol)
        throw new InternalServerErrorException("Error getting token symbol");
      return symbol;
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
