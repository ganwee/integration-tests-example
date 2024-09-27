import {
  PmmOrderbookWs,
  PmmQuoteWs,
} from "../dtos/pmmWs.dto";
import { BlockchainNetwork, PRICER_GATEWAY_TOPIC } from "../utils/data";
import { compareToken, sleep } from "../utils/helpers";

export let mockCache: Record<string, any> = {};

export class PmmQuoteWsService {
  constructor() {}

  async saveOrderbook(order: Omit<PmmOrderbookWs, "id">) {
    const key = PRICER_GATEWAY_TOPIC.getPmmOrderbook(order.source, order.chain);
    const existing: PmmOrderbookWs[] = mockCache[key];

    order.last_updated_at = new Date();

    let finalOrderbook: PmmOrderbookWs[] = [];

    if (existing) {
      const filtered = existing.filter(
        (item) =>
          !compareToken(item.token_in, order.token_in) &&
          !compareToken(item.token_out, order.token_out)
      );
      finalOrderbook = [...filtered, order];
    } else {
      finalOrderbook = [order];
    }
    mockCache[key] = finalOrderbook;
  }

  async getAllPairOrderbook(chain: BlockchainNetwork, source: string) {
    const key = PRICER_GATEWAY_TOPIC.getPmmOrderbook(source, chain);

    const existing: PmmOrderbookWs[] = mockCache[key];

    return existing || [];
  }

  async saveFirmQuote(quote: Omit<PmmQuoteWs, "id">) {
    const key = PRICER_GATEWAY_TOPIC.getPmmQuote(quote.source, quote.quote_id);
    mockCache[key] = quote;

    return;
  }

  async saveSignQuote(quote: {
    source: string;
    quote_id: string;
    signature: string;
    last_updated_at: Date;
    is_using_aqua?: boolean;
    is_borrowing?: boolean;
  }) {
    const key = PRICER_GATEWAY_TOPIC.getPmmQuote(quote.source, quote.quote_id);

    const existing = mockCache[key];

    if (existing) {
      delete quote.quote_id;

      const updated = {
        ...(existing || {}),
        ...quote,
      };
      mockCache[key] = updated;
    }

    return;
  }

  async getPollingFirmQuote(
    source: string,
    quoteId: string,
    maxTimeOut = 2000
  ) {
    const start = Date.now();
    const key = PRICER_GATEWAY_TOPIC.getPmmQuote(source, quoteId);

    while (Date.now() - start < maxTimeOut && Date.now() - start < 2000) {
      const existing = mockCache[key];

      if (existing) {
        return existing;
      }

      await sleep(100);
    }

    return null;
  }

  async getPollingSignQuote(
    source: string,
    quoteId: string,
    maxTimeOut = 2000
  ) {
    const start = Date.now();
    const key = PRICER_GATEWAY_TOPIC.getPmmQuote(source, quoteId);

    while (Date.now() - start < maxTimeOut && Date.now() - start < 2000) {
      const res = mockCache[key];

      if (res?.signature) {
        return res;
      }
      await sleep(100);
    }

    return null;
  }
}
