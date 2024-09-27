import {
  IsArray,
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { BlockchainNetwork } from "../utils/data";

export class PmmWsLevelsData {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class PmmWsOrderbookRes {
  @IsNumber()
  @IsNotEmpty()
  chainId: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  baseTokenAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  quoteTokenAddress: string;

  @IsString()
  @IsNotEmpty()
  side: "buy" | "sell";

  @IsNotEmpty()
  @IsArray()
  levels: PmmWsLevelsData[];
}

export class PmmWsFirmQuoteRes {
  @IsNotEmpty()
  @IsString()
  quoteId: string;

  @IsNumber()
  @IsNotEmpty()
  chainId: number;

  @IsNotEmpty()
  @IsEthereumAddress()
  baseTokenAddress: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  quoteTokenAddress: string;

  @IsNotEmpty()
  @IsString()
  baseTokenAmount: string;

  @IsNotEmpty()
  @IsString()
  quoteTokenAmount: string;

  @IsNotEmpty()
  @IsNumber()
  deadlineTimestamp: number;

  @IsOptional()
  @IsString()
  authId?: string;

  @IsOptional()
  @IsBoolean()
  isBorrowing?: boolean;
}

export class PmmWsSignQuoteRes {
  @IsNotEmpty()
  @IsString()
  quoteId: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class PmmWsGeneralMessageRes {
  @IsNotEmpty()
  messageType: "orderbook" | "quote" | "signature";

  @IsNotEmpty()
  message: PmmWsOrderbookRes | PmmWsFirmQuoteRes | PmmWsSignQuoteRes;
}

export class PmmOrderbookWs {
  chain: BlockchainNetwork;
  source: string;
  token_in: string;
  token_out: string;
  token_in_symbol: string;
  token_out_symbol: string;
  max?: number;
  min: number;
  levels: any;
  last_updated_at?: Date;
  created_at?: Date;
}

export class PmmQuoteWs {
  chain: BlockchainNetwork;
  source: string;
  quote_id: string;
  token_in: string;
  token_out: string;
  token_in_amount: string;
  token_out_amount: string;
  auth_id: string;
  deadline_timestamp: number;
  signature?: string;
  last_updated_at?: Date;
  created_at?: Date;
  is_using_aqua?: boolean;
  is_borrowing?: boolean;
}