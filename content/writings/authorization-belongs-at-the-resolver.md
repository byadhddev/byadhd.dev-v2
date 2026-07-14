---
title: "Authorization belongs at the resolver"
description: "A GraphQL field can be perfectly typed and still expose data or mutations that the current user should never reach."
date: 2025-10-21
category: security
tags:
  - graphql
  - access control
  - api security
featured: true
redacted: true
---

A production GraphQL API at `https://<redacted-host>/graphql` exposed two sides of the same authorization failure to an ordinary authenticated account:

1. a query returned redeemable reward records belonging to other users;
2. an administrative mutation accepted writes from a standard user.

I found the read path first. Instead of stopping at "sensitive data is visible," I looked for the inverse operation in the schema. If a standard user could enumerate the records, could the same role also create them? That second question exposed an integrity issue alongside the original confidentiality issue.

## The unauthorized read

The query did not require an object identifier or ownership filter. A standard session could ask for the collection and receive fields including the redeemable value.

```graphql
query rewardCards {
  rewardCards {
    amount
    checked
    claimCode
    createdAt
    sentAt
    usedFor
    uuid
  }
}
```

The real operation and host are redacted, but the important shape is unchanged: a list resolver returned every row and selected the secret itself. In my test, the response contained hundreds of records with monetary value. I did not redeem any value; seeing valid secrets outside my account was enough to demonstrate impact.

My impact model was broader than "a field leaked":

- **Confidentiality:** another user's redeemable secret is disclosed.
- **Integrity:** an unauthorized user can redeem it and change who receives the value.
- **Availability:** the intended recipient can no longer use an already-redeemed code.

## The unauthorized write

I then replayed a staff-shaped mutation using the same standard session. The payload below keeps the original structure while replacing target-owned names and values.

```graphql
mutation createRewardCards($input: CreateRewardCardInput) {
  createRewardCards(input: $input) {
    createdCards {
      amount
      checked
      claimCode
      usedFor
      uuid
    }
  }
}
```

```json
{
  "input": {
    "cards": [
      {
        "claimCode": "<redacted-value>",
        "amount": 10,
        "usedFor": "referral:<redacted-id>",
        "checked": false
      }
    ]
  }
}
```

The API returned the created object. That response mattered because it separated a real authorization failure from a harmless schema-discovery result: the standard user had caused a privileged database write.

## How I tested it

1. Created the lowest-privileged valid account.
2. Captured a normal GraphQL request in Burp Suite.
3. Sent it to Repeater so the session context stayed identical.
4. Replaced only the operation and variables.
5. Confirmed the read returned cross-account records.
6. Confirmed the write returned a newly created record.
7. Stopped after proving access, without redeeming exposed values or creating more data than necessary.

This is the test I keep returning to: take an operation that appears in an administrative workflow and replay it with the least-privileged authenticated identity. Frontend visibility is irrelevant because GraphQL clients construct their own documents.

## Why the schema was not the boundary

Nothing was wrong with the GraphQL type system. It correctly validated that `amount` was numeric and `checked` was boolean. Those checks answer whether input is well formed. They do not answer whether this caller may perform this action.

Authentication establishes identity. Authorization must still be enforced at the resolver or service layer for every object and operation. For the query, that means filtering by ownership or requiring a privileged role. For the mutation, it means rejecting the call before any write unless the server-side identity has staff scope.

```ts
async function createRewardCards(
  _parent: unknown,
  args: CreateRewardCardsArgs,
  context: GraphQLContext,
) {
  requireRole(context.viewer, "staff");

  return context.rewardCards.create(args.input);
}
```

For owner-scoped reads, authorization belongs inside the data access itself, not as a filter applied after all rows and secret fields have already been loaded.

```ts
return database.rewardCard.findMany({
  where: { ownerId: context.viewer.id },
  select: {
    amount: true,
    checked: true,
    claimCode: true,
  },
});
```

## Severity reasoning

I rated the unauthorized write as medium because it required a standard account, needed no user interaction, and primarily affected integrity. The vector I used was:

```text
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N
```

The read issue was more severe because the exposed values were directly redeemable and the collection could be enumerated. Severity should follow demonstrated impact, not the fact that the transport happens to be GraphQL. The [FIRST CVSS calculator](https://www.first.org/cvss/calculator/3.1) is useful for documenting that reasoning consistently.

## What I would verify in the fix

- Anonymous, standard, owner, staff, and administrator roles receive different expected results.
- Collection queries cannot return another user's records.
- Secret fields are selected only when the caller is allowed to use them.
- Privileged mutations reject standard sessions before database work begins.
- Denied calls are logged without logging claim codes or authentication headers.
- New resolvers default to denied until a policy is attached.

My public security profiles: [HackerOne](https://hackerone.com/0xrj_?type=user) and [Intigriti](https://app.intigriti.com/researcher/profile/0_x_r_j).

*Publication note: the target name, host, operation names, record identifiers, secret values, authentication material, and private disclosure correspondence are obfuscated. The request shapes, reasoning, impact, and remediation are preserved.*
