import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class GetPmmFirmQuoteDto {
  @IsString()
  @IsNotEmpty()
  sellerTokenAmount: string; //wei

  @IsNumber()
  @IsNotEmpty()
  chainId: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  sellerToken: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  buyerToken: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  pool: string; //gw pool address

  @IsEthereumAddress()
  @IsNotEmpty()
  seller: string;

  @IsEthereumAddress()
  @IsOptional()
  beneficiary?: string;

  @IsString()
  @IsNotEmpty()
  quoteId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quoteExpiry?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeBps: number;

  @IsOptional()
  @IsEthereumAddress()
  signer?: string;

  @IsNotEmpty()
  @IsString()
  availableBorrowBalance: string;
}

export class PmmFirmQuoteRes {
  success: boolean;
  data?: PmmFirmQuoteData | null;
  error?: string;
}

export class PmmFirmQuoteData {
  @IsNotEmpty()
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsNotEmpty()
  buyerTokenAmount: string;

  @IsNumber()
  @IsNotEmpty()
  deadlineTimestamp: number;

  @IsBoolean()
  @IsOptional()
  isBorrowing?: boolean;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => String(value))
  auth?: string;
}
