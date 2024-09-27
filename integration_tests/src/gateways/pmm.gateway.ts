import { randomUUID } from "crypto";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server } from "ws";
import {
  PmmWsFirmQuoteRes,
  PmmWsGeneralMessageRes,
  PmmWsOrderbookRes,
  PmmWsSignQuoteRes,
} from "../dtos/pmmWs.dto";
import { PmmQuoteWsService } from "../services/pmmQuoteWs.service";
import { TokenService } from "../services/token.service";
import { hexToUuid } from "../utils/helpers";
import { BlockchainService } from "../services/blockchain.service";
import { wsPartnerName } from "../../../integration_tests/template/ws.config";
import { gwProvidedWsKey } from "../../../integration_tests/tests/web_socket/ws.integration.tests.spec";

//whitelist apiKey and map the source
export const apiKeyMap = {
  [gwProvidedWsKey]: wsPartnerName,
};

interface WsClient {
  id: string;
  apiKey: string;
  source: string;
  send?: (data: any) => void;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  transports: ["websocket"],
  path: "/v1/pmm/ws",
})
export class PmmEventGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  clients: WsClient[];
  eventIdSent: Record<string, boolean>;
  logger = new Logger("PmmEventGateway");

  constructor(
    private pmmQuoteWsService: PmmQuoteWsService,
    private blockchainService: BlockchainService,
    private tokenService: TokenService
  ) {
    this.clients = [];
    this.eventIdSent = {};
  }

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: WsClient) {
    this.clients = this.clients.filter((item) => item.id !== client.id);
    this.logger.log("client disconnected, ", client.id, client.source);
  }

  handleConnection(ws: any, req: any) {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const apiKey = req.headers["apiKey"] || req.headers["apikey"];

    const source = this.checkWhitelist(apiKey);
    if (!source)
      return {
        success: false,
        error: "Invalid Credentials",
      };

    ws.id = randomUUID();
    ws.apiKey = apiKey;
    ws.source = source;
    this.clients.push(ws);
    this.logger.log("client connected", ws.id, apiKey, clientIp);
    return {
      success: true,
    };
  }

  @SubscribeMessage("message")
  async handleGeneralMessage(
    @MessageBody() data: PmmWsGeneralMessageRes,
    @ConnectedSocket() client: WsClient
  ): Promise<any> {
    const apiKey = client.apiKey;
    const source = this.checkWhitelist(apiKey);
    if (!source)
      return {
        success: false,
        error: "Invalid Credentials",
      };

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    this.logger.log("Receive message: ", JSON.stringify(parsedData));
    let res = {};
    if (parsedData.messageType === "orderbook") {
      res = await this.saveOrderbook(
        parsedData.message as PmmWsOrderbookRes,
        source
      );
    } else if (parsedData.messageType === "quote") {
      res = await this.saveQuote(
        parsedData.message as PmmWsFirmQuoteRes,
        source
      );
    } else if (parsedData.messageType === "signature") {
      res = await this.saveQuote(
        parsedData.message as PmmWsSignQuoteRes,
        source
      );
    } else {
      return {
        success: false,
        error: "Invalid messageType",
      };
    }

    return (
      res || {
        success: true,
      }
    );
  }

  @SubscribeMessage("orderbook")
  async postOrderbook(
    @MessageBody() data: any,
    @ConnectedSocket() client: WsClient
  ): Promise<any> {
    const apiKey = client.apiKey;
    const source = this.checkWhitelist(apiKey);
    if (!source)
      return {
        success: false,
        error: "Invalid Credentials",
      };

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    const res = await this.saveOrderbook(
      parsedData as PmmWsOrderbookRes,
      source
    );
    return res;
  }

  @SubscribeMessage("quote")
  async getFirmQuote(
    @MessageBody() data: any,
    @ConnectedSocket() client: WsClient
  ): Promise<any> {
    const apiKey = client.apiKey;
    const source = this.checkWhitelist(apiKey);
    if (!source)
      return {
        success: false,
        error: "Invalid Credentials",
      };

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const res = await this.saveQuote(parsedData as PmmWsFirmQuoteRes, source);

    return res;
  }

  @SubscribeMessage("signature")
  async getSignQuote(
    @MessageBody() data: any,
    @ConnectedSocket() client: WsClient
  ): Promise<any> {
    const apiKey = client.apiKey;
    const source = this.checkWhitelist(apiKey);
    if (!source)
      return {
        success: false,
        error: "Invalid Credentials",
      };

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    return await this.saveQuote(parsedData as PmmWsSignQuoteRes, source);
  }

  @SubscribeMessage("ping")
  async getPing(): Promise<any> {
    return {
      success: true,
    };
  }

  async emitEvent(apiKey: string, eventName: string, data: any) {
    const clients = this.clients.filter((item) => item.apiKey === apiKey);
    const eventId = randomUUID();

    clients.forEach((client) => {
      console.log("send event to client: ", eventName);
      client?.send(
        JSON.stringify({
          event: "message",
          data: {
            messageType: eventName,
            message: data,
          },
        })
      );
      this.eventIdSent[eventId] = true;
    });
  }

  private checkWhitelist(apiKey: string) {
    const source = apiKeyMap[apiKey];
    if (!source) {
      return null;
    }
    return source;
  }

  private async saveOrderbook(data: PmmWsOrderbookRes, source: string) {
    const blockchainMetadata =
      this.blockchainService.getBlockchainMetadataByChainId(
        Number(data.chainId)
      );

    //validation
    if (
      !data.chainId ||
      !blockchainMetadata?.value ||
      !data.levels ||
      !data.baseTokenAddress ||
      !data.quoteTokenAddress
    )
      return {
        success: false,
        error: "Invalid data",
      };

    const [tokenInSymbol, tokenOutSymbol] = await Promise.all([
      this.tokenService.getTokenSymbol(
        blockchainMetadata.value,
        data.baseTokenAddress
      ),
      this.tokenService.getTokenSymbol(
        blockchainMetadata.value,
        data.quoteTokenAddress
      ),
    ]);

    if (!tokenInSymbol || !tokenOutSymbol) {
      return {
        success: false,
        error: "Token is not supported",
      };
    }

    // For sell side, we inverse the token pairs and price
    if (data.side === "sell") {
      await this.pmmQuoteWsService.saveOrderbook({
        chain: blockchainMetadata.value,
        source,
        token_in: data.quoteTokenAddress,
        token_out: data.baseTokenAddress,
        token_in_symbol: tokenOutSymbol,
        token_out_symbol: tokenInSymbol,
        min: data.levels?.[0]?.[0] || 0,
        levels:
          data.levels?.map((item) => [
            Number(item.quantity) / (1 / Number(item.price)),
            1 / Number(item.price),
          ]) || [],
        last_updated_at: new Date(),
      });

      return {
        success: true,
      };
    }

    await this.pmmQuoteWsService.saveOrderbook({
      chain: blockchainMetadata.value,
      source,
      token_in: data.baseTokenAddress,
      token_out: data.quoteTokenAddress,
      token_in_symbol: tokenInSymbol,
      token_out_symbol: tokenOutSymbol,
      min: data.levels?.[0]?.[0] || 0,
      levels:
        data.levels?.map((item) => [
          Number(item.quantity),
          Number(item.price),
        ]) || [],
      last_updated_at: new Date(),
    });
    return {
      success: true,
    };
  }

  private async saveQuote(
    data: PmmWsFirmQuoteRes | PmmWsSignQuoteRes,
    source: string
  ) {
    //validation
    this.logger.log("Quote saved received: ", data);
    if (!data.quoteId) {
      return {
        success: false,
        error: "Quote id is not valid",
      };
    }

    if ((data as PmmWsSignQuoteRes).signature) {
      const chosenData = data as PmmWsSignQuoteRes;
      //save uuid format
      const quoteId = hexToUuid(chosenData.quoteId) || chosenData.quoteId;

      await this.pmmQuoteWsService.saveSignQuote({
        quote_id: quoteId,
        signature: chosenData.signature,
        source,
        last_updated_at: new Date(),
      });
      return {
        success: true,
      };
    }

    const chosenData = data as PmmWsFirmQuoteRes;
    const blockchainMetadata =
      this.blockchainService.getBlockchainMetadataByChainId(
        (data as PmmWsFirmQuoteRes)?.chainId
      );

    //validation
    if (
      !chosenData.chainId ||
      !blockchainMetadata?.value ||
      !chosenData.baseTokenAddress ||
      !chosenData.quoteTokenAddress ||
      !chosenData.baseTokenAmount ||
      !chosenData.quoteTokenAmount ||
      !chosenData.deadlineTimestamp
    ) {
      return {
        success: false,
        error: "Invalid data",
      };
    }

    //save uuid format
    const quoteId = hexToUuid(chosenData.quoteId) || chosenData.quoteId;

    await this.pmmQuoteWsService.saveFirmQuote({
      chain: blockchainMetadata?.value,
      source,
      quote_id: quoteId,
      token_in: chosenData.baseTokenAddress,
      token_out: chosenData.quoteTokenAddress,
      token_in_amount: chosenData.baseTokenAmount,
      token_out_amount: chosenData.quoteTokenAmount,
      auth_id: chosenData.authId,
      deadline_timestamp: chosenData.deadlineTimestamp,
      last_updated_at: new Date(),
      is_borrowing: chosenData.isBorrowing,
    });
    return {
      success: true,
    };
  }
}
