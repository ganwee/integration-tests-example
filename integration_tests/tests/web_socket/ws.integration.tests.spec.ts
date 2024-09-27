import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { PmmEventGateway } from "../../src/gateways/pmm.gateway";
import { PmmQuoteWsService } from "../../src/services/pmmQuoteWs.service";
import { BlockchainService } from "../../src/services/blockchain.service";
import { TokenService } from "../../src/services/token.service";
import { WebSocket } from "ws";
import { sendEvent } from "../../src/utils/websocket";
import { WsAdapter } from "@nestjs/platform-ws";
import {
  buyerToken,
  chainId,
  partnerWsHeaders,
  partnerWsUrl,
  poolAddresses,
  sellerToken,
  signer,
} from "../../template/ws.config";
import { handleMessageEvent } from "../../src/utils/websocket";
import { MockPartnerEventGateway } from "../../src/mock/partner.gateway";
import { plainToInstance } from "class-transformer";
import {
  PmmWsFirmQuoteRes,
  PmmWsGeneralMessageRes,
  PmmWsOrderbookRes,
  PmmWsSignQuoteRes,
} from "../../src/dtos/pmmWs.dto";
import { validate } from "class-validator";
import { randomUUID } from "crypto";
import { PmmSignQuoteData } from "integration_tests/src/dtos/signQuote.dto";
import { recoverRFQTSignature } from "../../../integration_tests/src/utils/helpers";

const port = 8080;
export const gwProvidedWsKey = "integratingPmm";
export const gwWsUrl = `ws://localhost:${port}/v1/pmm/ws`;
const sellerTokenAmount = "10000000";
const serverWsHeaders = { WSKey: gwProvidedWsKey };

const constraints = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

/*
Do not edit this file
Edit params via integration_tests/template/ws.config.ts
*/
describe("WS Integration Tests with gw", () => {
  let app: INestApplication;
  let serverWs: WebSocket;
  let partnerWs: WebSocket;

  serverWs = new WebSocket(`${gwWsUrl}`, { headers: serverWsHeaders });
  partnerWs = new WebSocket(`${partnerWsUrl}`, { headers: partnerWsHeaders });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PmmEventGateway,
        MockPartnerEventGateway,
        PmmQuoteWsService,
        BlockchainService,
        TokenService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.init();
    await app.listen(port);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Orderbook WS Tests", () => {
    it("Validate successful Orderbook response structure", async () => {
      const intervalId = setInterval(() => {
        console.log("Requesting orderbook..");
        sendEvent(partnerWs, "orderbook", {});
      }, 1000);

      const orderbook = (await handleMessageEvent(
        partnerWs
      )) as PmmWsGeneralMessageRes;

      clearInterval(intervalId);

      const [dataResult, messageResult] = [
        plainToInstance(PmmWsGeneralMessageRes, orderbook),
        plainToInstance(PmmWsOrderbookRes, orderbook.message),
      ];
      const [dataValidationErrors, messageValidationErrors] = [
        await validate(dataResult, constraints),
        await validate(messageResult, constraints),
      ];

      expect(dataValidationErrors.length).toStrictEqual(0);
      expect(messageValidationErrors.length).toStrictEqual(0);
      expect(orderbook.messageType).toStrictEqual("orderbook");

      sendEvent(serverWs, orderbook.messageType, orderbook.message);

      const receivedMsg = await handleMessageEvent(serverWs);
      expect(receivedMsg["success"]).toStrictEqual(true);
    });
  });

  describe("Firm Quote WS Tests", () => {
    it("Validate successful Firm Quote response structure (with optional params)", async () => {
      const intervalId = setInterval(() => {
        console.log("Requesting firmQuote..");
        sendEvent(partnerWs, "firmQuote", {
          messageType: "firmQuote",
          message: {
            quoteId: randomUUID(),
            chainId: chainId,
            baseTokenAddress: sellerToken,
            quoteTokenAddress: buyerToken,
            baseTokenAmount: sellerTokenAmount,
            seller: "0xDB714C6c6bd7D1bab01C8E8787f41a8E6B9F2d0c",
            pool: poolAddresses[chainId],
            feeBps: 1,
            quoteExpire: 10,
            availableBorrowBalance: "10000000",
          },
        });
      }, 1000);

      const firmQuote = (await handleMessageEvent(
        partnerWs
      )) as PmmWsGeneralMessageRes;

      clearInterval(intervalId);

      const [dataResult, messageResult] = [
        plainToInstance(PmmWsGeneralMessageRes, firmQuote),
        plainToInstance(PmmWsFirmQuoteRes, firmQuote.message),
      ];
      const [dataValidationErrors, messageValidationErrors] = [
        await validate(dataResult, constraints),
        await validate(messageResult, constraints),
      ];

      expect(dataValidationErrors.length).toStrictEqual(0);
      expect(messageValidationErrors.length).toStrictEqual(0);
      expect(firmQuote.messageType).toStrictEqual("quote");

      sendEvent(serverWs, firmQuote.messageType, firmQuote.message);

      const receivedMsg = await handleMessageEvent(serverWs);
      expect(receivedMsg["success"]).toStrictEqual(true);
    });

    it("Validate successful Firm Quote response structure (without optional params)", async () => {
      const intervalId = setInterval(() => {
        console.log("Requesting firmQuote..");
        sendEvent(partnerWs, "firmQuote", {
          messageType: "firmQuote",
          message: {
            quoteId: randomUUID(),
            chainId: chainId,
            baseTokenAddress: sellerToken,
            quoteTokenAddress: buyerToken,
            baseTokenAmount: sellerTokenAmount,
            seller: "0xDB714C6c6bd7D1bab01C8E8787f41a8E6B9F2d0c",
            pool: poolAddresses[chainId],
            feeBps: 10,
            quoteExpire: 0,
          },
        });
      }, 1000);

      const firmQuote = (await handleMessageEvent(
        partnerWs
      )) as PmmWsGeneralMessageRes;

      clearInterval(intervalId);

      const [dataResult, messageResult] = [
        plainToInstance(PmmWsGeneralMessageRes, firmQuote),
        plainToInstance(PmmWsFirmQuoteRes, firmQuote.message),
      ];
      const [dataValidationErrors, messageValidationErrors] = [
        await validate(dataResult, constraints),
        await validate(messageResult, constraints),
      ];

      expect(dataValidationErrors.length).toStrictEqual(0);
      expect(messageValidationErrors.length).toStrictEqual(0);
      expect(firmQuote.messageType).toStrictEqual("quote");

      sendEvent(serverWs, firmQuote.messageType, firmQuote.message);

      const receivedMsg = await handleMessageEvent(serverWs);
      expect(receivedMsg["success"]).toStrictEqual(true);
    });
  });

  describe("Sign Quote WS Tests", () => {
    it("Validate successful Sign Quote response structure and signature", async () => {
      const quoteId = randomUUID();
      const nonce = "8020303003020032";

      let intervalId = setInterval(() => {
        console.log("Requesting firmQuote..");
        sendEvent(partnerWs, "firmQuote", {
          messageType: "firmQuote",
          message: {
            quoteId: quoteId,
            chainId: chainId,
            baseTokenAddress: sellerToken,
            quoteTokenAddress: buyerToken,
            baseTokenAmount: sellerTokenAmount,
            seller: "0xDB714C6c6bd7D1bab01C8E8787f41a8E6B9F2d0c",
            pool: poolAddresses[chainId],
            feeBps: 10,
            quoteExpire: 0,
          },
        });
      }, 1000);

      const firmQuote = (await handleMessageEvent(
        partnerWs
      )) as PmmWsGeneralMessageRes;
      const fqWsData = firmQuote.message as PmmWsFirmQuoteRes;

      clearInterval(intervalId);

      const quoteData = {
        id: nonce,
        signer: signer,
        buyer: poolAddresses[chainId],
        seller: "0xDB714C6c6bd7D1bab01C8E8787f41a8E6B9F2d0c",
        buyerToken: buyerToken,
        sellerToken: sellerToken,
        buyerTokenAmount: fqWsData.quoteTokenAmount,
        sellerTokenAmount: sellerTokenAmount,
        deadlineTimestamp: String(fqWsData.deadlineTimestamp),
        caller: "0xDB714C6c6bd7D1bab01C8E8787f41a8E6B9F2d0c",
        quoteId: fqWsData.quoteId,
      };

      intervalId = setInterval(() => {
        console.log("Requesting signQuote..");
        sendEvent(partnerWs, "signQuote", {
          messageType: "signQuote",
          message: {
            chainId: chainId,
            quoteId: fqWsData.quoteId,
            availableBorrowBalance: "10000000",
            isBorrowing: true,
            quoteData: quoteData,
          },
        });
      }, 1000);

      const signQuote = (await handleMessageEvent(
        partnerWs
      )) as PmmWsGeneralMessageRes;
      const sqWsData = signQuote.message as PmmWsSignQuoteRes;

      clearInterval(intervalId);

      const [dataResult, messageResult] = [
        plainToInstance(PmmWsGeneralMessageRes, signQuote),
        plainToInstance(PmmWsSignQuoteRes, signQuote.message),
      ];
      const [dataValidationErrors, messageValidationErrors] = [
        await validate(dataResult, constraints),
        await validate(messageResult, constraints),
      ];

      expect(dataValidationErrors.length).toStrictEqual(0);
      expect(messageValidationErrors.length).toStrictEqual(0);
      expect(signQuote.messageType).toStrictEqual("signature");
      expect(sqWsData.quoteId).toStrictEqual(fqWsData.quoteId);

      sendEvent(serverWs, signQuote.messageType, signQuote.message);

      const receivedMsg = await handleMessageEvent(serverWs);
      expect(receivedMsg["success"]).toStrictEqual(true);

      const sqData: PmmSignQuoteData = {
        success: true,
        signature: sqWsData.signature,
        order: quoteData,
      };

      const recoveredSignerAddress = await recoverRFQTSignature(sqData);

      expect(recoveredSignerAddress.toLowerCase()).toStrictEqual(
        quoteData.signer.toLowerCase()
      );
    });
  });
});
