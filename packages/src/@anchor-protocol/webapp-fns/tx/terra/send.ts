import { fabricateCw20Transfer } from '@anchor-protocol/anchor.js';
import { CW20Addr, HumanAddr, Rate, Token, uUST } from '@anchor-protocol/types';
import { pipe } from '@rx-stream/pipe';
import { floor } from '@terra-dev/big-math';
import { NetworkInfo, TxResult } from '@terra-dev/wallet-types';
import {
  Coin,
  CreateTxOptions,
  Dec,
  Int,
  MsgSend,
  StdFee,
} from '@terra-money/terra.js';
import {
  MantleFetch,
  TxResultRendering,
  TxStreamPhase,
} from '@terra-money/webapp-fns';
import { Observable } from 'rxjs';
import { _catchTxError } from '../internal/_catchTxError';
import { _createTxOptions } from '../internal/_createTxOptions';
import { _pollTxInfo } from '../internal/_pollTxInfo';
import { _postTx } from '../internal/_postTx';
import { TxHelper } from '../internal/TxHelper';

export function terraSendTx($: {
  myWalletAddress: HumanAddr;
  toWalletAddress: HumanAddr;
  currency: { cw20Contract: CW20Addr } | { tokenDenom: string };
  memo?: string;
  amount: Token;
  gasFee: uUST<number>;
  gasAdjustment: Rate<number>;
  txFee: uUST;
  network: NetworkInfo;
  mantleEndpoint: string;
  mantleFetch: MantleFetch;
  post: (tx: CreateTxOptions) => Promise<TxResult>;
  txErrorReporter?: (error: unknown) => string;
  onTxSucceed?: () => void;
}): Observable<TxResultRendering> {
  const helper = new TxHelper($);

  return pipe(
    _createTxOptions({
      msgs:
        'cw20Contract' in $.currency
          ? fabricateCw20Transfer({
              amount: $.amount,
              address: $.myWalletAddress,
              contract_address: $.currency.cw20Contract,
              recipient: $.toWalletAddress,
            })
          : [
              new MsgSend($.myWalletAddress, $.toWalletAddress, [
                new Coin(
                  `u${$.currency.tokenDenom}`,
                  new Int(new Dec($.amount).mul(1000000)).toString(),
                ),
              ]),
            ],
      fee: new StdFee($.gasFee, floor($.txFee) + 'uusd'),
      gasAdjustment: $.gasAdjustment,
      memo: $.memo,
    }),
    _postTx({ helper, ...$ }),
    _pollTxInfo({ helper, ...$ }),
    () => {
      try {
        return {
          value: null,

          phase: TxStreamPhase.SUCCEED,
          receipts: [helper.txHashReceipt()],
        } as TxResultRendering;
      } catch (error) {
        return helper.failedToParseTxResult();
      }
    },
  )().pipe(_catchTxError({ helper, ...$ }));
}
