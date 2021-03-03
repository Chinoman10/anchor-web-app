import type { uANC } from '@anchor-protocol/types';
import { anchorToken } from '@anchor-protocol/types';
import big, { Big } from 'big.js';

export function rewardsAncUstLpReward(
  stakingState: anchorToken.staking.StateResponse | undefined,
  stakerInfo: anchorToken.staking.StakerInfoResponse | undefined,
): uANC<Big> | undefined {
  if (stakingState && stakerInfo) {
    return big(
      big(stakingState.global_reward_index).minus(stakerInfo.reward_index),
    )
      .mul(stakerInfo.bond_amount)
      .plus(stakerInfo.pending_reward) as uANC<Big>;
  }

  return undefined;
}
