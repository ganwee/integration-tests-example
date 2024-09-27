import {
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from "class-validator";

export class GetPmmSignQuoteDto {
  @IsNumber()
  @IsNotEmpty()
  nonce: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  signer: string;

  @IsNumber()
  @IsNotEmpty()
  chainId: number;

  @IsString()
  @IsNotEmpty()
  sellerTokenAmount: string;

  @IsString()
  @IsNotEmpty()
  buyerTokenAmount: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  sellerToken: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  buyerToken: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  seller: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  buyer: string; //gw pool address

  @IsString()
  @IsNotEmpty()
  quoteId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  deadlineTimestamp?: number;

  @IsNotEmpty()
  @IsString()
  auth: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  txOrigin: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  pool?: string
}

export class SignedOrderStruct {
  @IsNotEmpty()
  id: number | string; //same as nonce

  @IsEthereumAddress()
  @IsNotEmpty()
  signer: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  buyer: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  seller: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  buyerToken: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  sellerToken: string;

  @IsString()
  @IsNotEmpty()
  buyerTokenAmount: string;

  @IsString()
  @IsNotEmpty()
  sellerTokenAmount: string;

  @IsOptional()
  @IsString()
  deadlineTimestamp: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  caller: string;

  @IsString()
  @IsNotEmpty()
  quoteId: string;
}

export class PmmSignQuoteData {
  @IsNotEmpty()
  @IsBoolean()
  success: boolean;

  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{130}$/)
  signature: string;

  @IsOptional()
  order: SignedOrderStruct | null;
}

export class PmmWsSignQuoteData {
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{130}$/)
  signature: string;

  @IsOptional()
  order: SignedOrderStruct | null;
}

export class PmmSignQuoteRes {
  @IsNotEmpty()
  @IsBoolean()
  success: boolean;

  @IsOptional()
  data?: PmmSignQuoteData | PmmWsSignQuoteData;

  @IsOptional()
  @IsString()
  error?: string;
}
