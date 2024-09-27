import request from "supertest";
import { GetPmmOrderBookDto, PmmOrderbookRes } from "../dtos/orderbook.dto";
import {
  baseUrl,
  signer,
  headers,
} from "../../template/rest.config";
import { GetPmmFirmQuoteDto, PmmFirmQuoteRes } from "../dtos/firmQuote.dto";
import { GetPmmSignQuoteDto, PmmSignQuoteRes } from "../dtos/signQuote.dto";

export class PmmService {
  async callOrderbook(arg: GetPmmOrderBookDto): Promise<PmmOrderbookRes> {
    const orderbookEndpoint = `/orderbook`;
    try {
      const response = await request(baseUrl)
        .get(orderbookEndpoint)
        .query(arg)
        .set(headers)
        .timeout(1_500)
        .expect(200);

      const data = JSON.parse(response.text);

      if (data) {
        return {
          success: true,
          data,
        };
      }
      return {
        success: false,
        data: [],
        error: data,
      };
    } catch (err) {
      return {
        success: false,
        data: [],
        error: err.response?.text || err.message,
      };
    }
  }

  async callFirmQuote(arg: GetPmmFirmQuoteDto): Promise<PmmFirmQuoteRes> {
    const firmQuoteEndpoint = `/firm-quote`;
    const params: GetPmmFirmQuoteDto = {
      ...arg,
      feeBps: arg.feeBps ?? 0,
      beneficiary: arg.beneficiary ?? arg.seller,
      quoteExpiry: arg.quoteExpiry || undefined,
    };

    try {
      const response = await request(baseUrl)
        .get(firmQuoteEndpoint)
        .query(params)
        .set(headers)
        .timeout(2_000)
        .expect(200);

      const data = JSON.parse(response.text);

      if (data.success) {
        return {
          success: true,
          data,
        };
      }
      return {
        success: false,
        data: null,
        error: data,
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: err.response?.text || err.message,
      };
    }
  }

  async callSignQuote(arg: GetPmmSignQuoteDto): Promise<PmmSignQuoteRes> {
    const signQuoteEndpoint = `/sign-quote`;
    const params = {
      ...arg,
      signer: arg.signer || signer,
    };

    try {
      const response = await request(baseUrl)
        .post(signQuoteEndpoint)
        .send(params)
        .set(headers)
        .timeout(2_000)
        .expect((res) => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error(`Expected 200 or 201, got ${res.status}`);
          }
        });

      const data = JSON.parse(response.text);

      if (data.success) {
        return {
          success: true,
          data,
        };
      }
      return {
        success: false,
        data: null,
        error: data,
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: err.response?.text || err.message,
      };
    }
  }
}
