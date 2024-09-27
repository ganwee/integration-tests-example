import { ethers } from "ethers";
import { chainId } from "../../template/rest.config";
import { PmmSignQuoteData } from "../dtos/signQuote.dto";
import * as uuidParse from 'uuid-parse';

export async function recoverRFQTSignature(data: PmmSignQuoteData) {
  const signatureData = {
    types: {
      Order: [
        { name: "id", type: "uint256" },
        { name: "signer", type: "address" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "buyerToken", type: "address" },
        { name: "sellerToken", type: "address" },
        { name: "buyerTokenAmount", type: "uint256" },
        { name: "sellerTokenAmount", type: "uint256" },
        { name: "deadlineTimestamp", type: "uint256" },
        { name: "caller", type: "address" },
        { name: "quoteId", type: "bytes16" },
      ],
    },
    primaryType: "Order",
    domain: {
      name: "gw pool",
      version: "1",
      chainId: chainId,
      verifyingContract: data.order.buyer,
    },
    message: {
      id: data.order.id,
      signer: data.order.signer,
      buyer: data.order.buyer,
      seller: data.order.seller,
      buyerToken: data.order.buyerToken,
      sellerToken: data.order.sellerToken,
      buyerTokenAmount: data.order.buyerTokenAmount,
      sellerTokenAmount: data.order.sellerTokenAmount,
      deadlineTimestamp: data.order.deadlineTimestamp,
      caller: data.order.caller,
      quoteId: Buffer.from(data.order.quoteId.replace(/-/g, ""), "hex"),
    },
  };

  const recoveredAddress = ethers.verifyTypedData(
    signatureData.domain,
    signatureData.types,
    signatureData.message,
    data.signature
  );

  return recoveredAddress;
}

export function compareToken(a: string, b: string) {
  return a?.toLowerCase() === b?.toLowerCase();
}

export const sleep = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));

export function hexToUuid(hexString: string): string {
  if (!hexString.startsWith('0x')) return hexString;

  const parsedHexString = hexString.replace(new RegExp('^0x'), '');

  //Allocate 16 bytes for the uuid bytes representation
  const hexBuffer = Buffer.from(parsedHexString, 'hex');

  //Parse uuid string representation and send bytes into buffer
  const uuidResultBuffer = uuidParse.unparse(hexBuffer);

  //Create uuid utf8 string representation
  return uuidResultBuffer.toString();
}

export function uuidToHex(uuid: string): string {
  if (uuid.startsWith('0x')) return uuid; //already in hex

  // Remove hyphens from the UUID
  const cleanedUuid = uuid.replace(/-/g, '');

  // Convert the cleaned UUID to a BigInt
  const bigIntValue = BigInt('0x' + cleanedUuid);

  // Convert the BigInt to hexadecimal string
  const hexString = bigIntValue.toString(16);

  // Pad the string with leading zeros to ensure it has 32 characters
  const paddedHexString = hexString.padStart(32, '0');

  // Return the hexadecimal string
  return '0x' + paddedHexString;
}

export function getPriceFromNonCumulativeLevels (
  levels: [number, number][],
  amount: number,
) {
  let amountLeft = amount;
  let amountOut = 0;
  for (const level of levels) {
    if (level[0] > amountLeft) {
      amountOut += level[1] * amountLeft;
      amountLeft = 0;
      break;
    }

    amountOut += level[1] * level[0];
    amountLeft -= level[0];
  }

  if (amountLeft > 0) {
    return 0; //not enough inventory
  }

  return amountOut;
};
