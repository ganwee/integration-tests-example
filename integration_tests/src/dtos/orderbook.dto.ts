import {
  IsEthereumAddress,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

export class GetPmmOrderBookDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  chainId: number;
}
export class PmmOrderbookRes {
  success: boolean;
  data: PmmOrderbookItem[];
  error?: string;
}

export class PmmOrderbookItem {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  base_address: string;

  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  quote_address: string;

  @IsString()
  @IsNotEmpty()
  base_symbol: string;

  @IsString()
  @IsNotEmpty()
  quote_symbol: string;

  @IsNotEmpty()
  levels: [number, number][]; //[quantity, price] //non cumulative

  @IsString()
  @IsIn(["bid", "ask"])
  @IsNotEmpty()
  side: string; //bid | ask, only use bid price

  @IsNumber()
  @IsNotEmpty()
  minimum_in_base: number;
}
