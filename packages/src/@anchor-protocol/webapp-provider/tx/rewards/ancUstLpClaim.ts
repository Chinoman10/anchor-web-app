import { uUST } from '@anchor-protocol/types';
import { rewardsAncUstLpClaimTx } from '@anchor-protocol/webapp-fns';
import { useStream } from '@rx-stream/react';
import { useOperationBroadcaster } from '@terra-dev/broadcastable-operation';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import {
  useRefetchQueries,
  useTerraWebapp,
} from '@terra-money/webapp-provider';
import { useCallback } from 'react';
import { useAnchorWebapp } from '../../contexts/context';
import { ANCHOR_TX_KEY } from '../../env';

export interface RewardsAncUstLpClaimTxParams {
  onTxSucceed?: () => void;
}

export function useRewardsAncUstLpClaimTx() {
  const connectedWallet = useConnectedWallet();

  const { addressProvider, constants } = useAnchorWebapp();

  const { mantleEndpoint, mantleFetch, txErrorReporter } = useTerraWebapp();

  const refetchQueries = useRefetchQueries();

  // TODO remove
  const { dispatch } = useOperationBroadcaster();

  const stream = useCallback(
    ({ onTxSucceed }: RewardsAncUstLpClaimTxParams) => {
      if (!connectedWallet || !connectedWallet.availablePost) {
        throw new Error('Can not post!');
      }

      return rewardsAncUstLpClaimTx({
        // fabricateStakingWithdraw
        address: connectedWallet.walletAddress,
        // post
        network: connectedWallet.network,
        post: connectedWallet.post,
        fixedGas: constants.fixedGas.toString() as uUST,
        gasFee: constants.gasFee,
        gasAdjustment: constants.gasAdjustment,
        addressProvider,
        // query
        mantleEndpoint,
        mantleFetch,
        // error
        txErrorReporter,
        // side effect
        onTxSucceed: () => {
          onTxSucceed?.();
          refetchQueries(ANCHOR_TX_KEY.REWARDS_UST_BORROW_CLAIM);
          dispatch('', 'done');
        },
      });
    },
    [
      connectedWallet,
      constants.fixedGas,
      constants.gasFee,
      constants.gasAdjustment,
      addressProvider,
      mantleEndpoint,
      mantleFetch,
      txErrorReporter,
      refetchQueries,
      dispatch,
    ],
  );

  const streamReturn = useStream(stream);

  return connectedWallet ? streamReturn : [null, null];
}