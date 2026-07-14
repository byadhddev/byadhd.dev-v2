---
title: "Bounded work is a smart-contract invariant"
description: "Why attacker-controlled arrays and linear cleanup can turn an ordinary staking path into a permanent availability problem."
date: 2023-12-27
category: smart-contracts
tags:
  - solidity
  - denial of service
  - gas
featured: true
redacted: false
---

This review produced two findings from the same staking subsystem. They looked different at first: one was an availability problem, the other a reward-accounting problem. Both came from asking the same question:

> Which collections define protocol truth, and can a user make those collections disagree or become too expensive to process?

The code is public in Cyfrin's [2023-12 The Standard audit repository](https://github.com/Cyfrin/2023-12-the-standard).

## H-01: cheap writes create unbounded future work

The staking entry point accepted any positive token amount and appended a new pending item.

```solidity
function increasePosition(uint256 tstValue, uint256 eurosValue) external {
  if (tstValue > 0) {
    IERC20(TST).safeTransferFrom(msg.sender, address(this), tstValue);
  }

  if (eurosValue > 0) {
    IERC20(EUROs).safeTransferFrom(msg.sender, address(this), eurosValue);
  }

  // @audit Any amount creates another unit of future work.
  pendingStakes.push(
    PendingStake(msg.sender, block.timestamp, tstValue, eurosValue)
  );
}
```

Source: [`LiquidationPool.sol` staking path](https://github.com/Cyfrin/2023-12-the-standard/blob/91132936cb09ef9bf82f38ab1106346e2ad60f91/contracts/LiquidationPool.sol#L136).

Pending stakes were consolidated the next day. Consolidation ran during common actions such as increasing a position, decreasing a position, and distributing assets. The attack did not need to steal anything:

1. Obtain a minimal amount of one accepted token.
2. Call `increasePosition` repeatedly with a dust amount such as one wei.
3. Create one `pendingStakes` entry per transaction.
4. Wait until those entries become eligible for consolidation.
5. Let the next ordinary user action pay to iterate and delete them.

The attacker pays a small, predictable cost to append. A future caller pays a growing cost to process the entire backlog. When that work no longer fits in the block gas limit, core pool operations revert.

## Why deletion made it worse

The cleanup path removed processed entries by shifting later elements left. One deletion is linear in the number of remaining items. Repeating it while walking the same array can approach quadratic work.

```solidity
function deletePendingStake(uint256 index) private {
  for (uint256 i = index; i < pendingStakes.length - 1; i++) {
    pendingStakes[i] = pendingStakes[i + 1];
  }

  pendingStakes.pop();
}
```

This is where I stopped thinking in terms of "the loop might be large" and wrote the actual asymmetry:

```text
attacker cost   = O(1) per appended dust position
protocol cost   = O(n) scan + repeated O(n) shifts
victim outcome  = gas growth, then transaction failure
```

The relevant invariant became:

> No externally reachable operation should require completing work over a collection whose size an attacker controls.

## H-01 impact and mitigation

The impact is protocol availability. `increasePosition`, `decreasePosition`, and asset distribution can become prohibitively expensive or impossible.

A minimum stake makes spam more expensive, and that was my immediate recommendation, but it is not enough as the only control. The stronger design is bounded processing:

```solidity
function consolidatePendingStakes(uint256 maxItems) external {
  uint256 processed;

  while (processed < maxItems && nextPendingIndex < pendingStakes.length) {
    _consolidate(pendingStakes[nextPendingIndex]);
    nextPendingIndex++;
    processed++;
  }
}
```

Use a cursor or queue so each transaction chooses a maximum amount of work. If ordering does not matter, use swap-and-pop for constant-time deletion. Most importantly, make every partially processed state valid so the pool remains usable while progress is advanced over multiple calls.

## M-01: a holder exists in one collection but not another

The companion finding involved `positions`, `pendingStakes`, and `holders`. A user could withdraw the entirety of their processed position while still having a new stake pending. The withdrawal removed them from `holders`, but later consolidation recreated value in `positions` without restoring membership in `holders`.

The empty check considered only the processed position:

```solidity
function empty(Position memory position) private pure returns (bool) {
  return position.TST == 0 && position.EUROs == 0;
}
```

The pending position was consolidated later:

```solidity
positions[stake.holder].holder = stake.holder;
positions[stake.holder].TST += stake.TST;
positions[stake.holder].EUROs += stake.EUROs;
```

But reward distribution iterated `holders`, not `positions`:

```solidity
for (uint256 i = 0; i < holders.length; i++) {
  address holder = holders[i];

  // @audit A consolidated position can exist while its owner is absent here.
  positions[holder].EUROs +=
    amount * positions[holder].TST / tstTotal;
}
```

Public source references: [`deleteHolder`](https://github.com/Cyfrin/2023-12-the-standard/blob/91132936cb09ef9bf82f38ab1106346e2ad60f91/contracts/LiquidationPool.sol#L161), [`empty`](https://github.com/Cyfrin/2023-12-the-standard/blob/91132936cb09ef9bf82f38ab1106346e2ad60f91/contracts/LiquidationPool.sol#L92), and the [position update path](https://github.com/Cyfrin/2023-12-the-standard/blob/91132936cb09ef9bf82f38ab1106346e2ad60f91/contracts/LiquidationPool.sol#L105-L110).

## Walking the missed-reward state

1. A user stakes 10 TST and waits for it to become processed.
2. On the next day, the user stakes another 10 TST; this amount remains pending.
3. The user withdraws the 10 processed TST.
4. The processed position reaches zero, so `deleteHolder` removes the address.
5. Consolidation later adds the pending 10 TST back into `positions[user]`.
6. Fee distribution iterates `holders`; the user is absent and receives no reward.

The important mental model was not "does the mapping have a balance?" It was **set membership**. The protocol used an array as the enumerable index for a mapping, but updates did not preserve the equivalence between them.

```text
positions[user].TST > 0  <=>  user is present in holders
```

That equivalence should hold after every public transition, including when pending state exists.

## M-01 mitigation

Do not remove a holder while they still have pending stakes:

```solidity
function deleteHolder(address holder) private {
  (uint256 pendingTST, uint256 pendingEUROs) = holderPendingStakes(holder);

  if (pendingTST > 0 || pendingEUROs > 0) return;

  for (uint256 i = 0; i < holders.length; i++) {
    if (holders[i] == holder) {
      holders[i] = holders[holders.length - 1];
      holders.pop();
      return;
    }
  }
}
```

I used manual review for the unbounded-work finding and a Hardhat state-sequence test for the holder-accounting case. The tests I would keep are invariant based: queue processing remains bounded, and every positive position is represented exactly once in the enumerable holder set.

*This article preserves the original public audit links, code paths, scenarios, tools, and recommendations. No target obfuscation is needed because the contest repository and reviewed code are already public.*
