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
import { gwProvidedWsKey } from "../../tests/web_socket/ws.integration.tests.spec";

//whitelist apiKey and map the source
export const apiKeyMap = {
  [gwProvidedWsKey]: "testingRepo",
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
  path: "/mockExternal",
})
export class MockPartnerEventGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  clients: WsClient[];
  eventIdSent: Record<string, boolean>;
  logger = new Logger("PartnerEventGateway");

  constructor() {
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
    //TODO: need to whitelist IP for each connection source, if not random person can listen and intercept request
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const apiKey = req.headers["apiKey"] || req.headers["apikey"];

    ws.id = randomUUID();
    ws.apiKey = apiKey;
    this.clients.push(ws);
    this.logger.log("client connected", ws.id, apiKey, clientIp);
    return {
      success: true,
    };
  }

  @SubscribeMessage("firmQuote")
  async getFirmQuote(
    @MessageBody() data: any,
    @ConnectedSocket() client: WsClient
  ): Promise<any> {
    return {
      messageType: "quote",
      message: {
        // Same as Firm Quote request
        quoteId: data.message.quoteId,
        chainId: data.message.chainId, // 1 for ETH L1
        baseTokenAddress: data.message.baseTokenAddress,
        quoteTokenAddress: data.message.quoteTokenAddress,

        // Amounts are in wei
        baseTokenAmount: data.message.baseTokenAmount,
        quoteTokenAmount: "100000",

        // The unix timestamp when the quote expires, in seconds.
        deadlineTimestamp: Math.floor(Date.now() / 1000) + 20,
        authId: "hahaha", // <OPTIONAL> Auth Id that we will pass back when we request for a sign quote
        isBorrowing: false, // <OPTIONAL> boolean value to indicate whether you want to use gw's credit pool
      },
    };
  }

  @SubscribeMessage("orderbook")
  private async getOrderbook() {
    return {
      messageType: "orderbook",
      message: {
        chainId: 1,
        baseTokenAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
        quoteTokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        side: "buy",
        levels: [
          { quantity: "1", price: "0.1" },
          { quantity: "2", price: "0.1" },
          { quantity: "4", price: "0.1" },
        ],
      },
    };
  }

  @SubscribeMessage("signQuote")
  private async getSignQuote(
    @MessageBody() data: any,
    @ConnectedSocket() client: WsClient
  ) {
    return {
      messageType: "signature",
      message: {
        quoteId: data.message.quoteId, // This is the quote id previously sent.
        signature:
          "0x4bc541eff5567f60b3cecbe8ca40d6fd84b7e4697bc8822e44c07c3753e2023c0b8b49c0856c01d96a786280ae577107d9c35ea8822b70a2afe6e1a03ad339a21b", // 0x-prefix signature (65 bytes)
      },
    };
  }
}
