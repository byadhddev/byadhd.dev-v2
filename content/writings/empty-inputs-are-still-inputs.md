---
title: "Empty inputs are still inputs"
description: "How an empty poll choice exposed a state-accounting gap, and what it taught me about validating transitions rather than shapes."
date: 2022-05-02
category: security
tags:
  - business logic
  - race conditions
  - ruby
featured: true
redacted: true
---

A poll-voting endpoint accepted an empty list of choices. That sounds like "no vote," but the service still advanced one piece of voting state: the cached voter count.

The result was a mismatch. No vote row was created, so the account remained eligible to call the endpoint. The voter count still increased. Repeating the same empty request could move the displayed total without adding a corresponding vote.

The affected company and endpoint are redacted. The application logic below is reconstructed from the report with names that are important to the control flow preserved.

## Reading the service as a state machine

```ruby
class VoteService < BaseService
  include Authorization
  include Lockable

  def call(account, poll, choices)
    authorize_with account, poll, :vote?

    @account = account
    @poll = poll
    @choices = choices
    @votes = []

    already_voted = true

    with_lock("vote:#{@poll.id}:#{@account.id}") do
      already_voted = @poll.votes.where(account: @account).exists?

      ApplicationRecord.transaction do
        @choices.each do |choice|
          @votes << @poll.votes.create!(
            account: @account,
            choice: Integer(choice),
          )
        end
      end
    end

    increment_voters_count! unless already_voted
  end
end
```

At first glance, the lock and transaction make the flow look careful. My question was narrower: **what establishes that the account has voted?**

The answer is the loop body. A vote row exists only if `@choices.each` runs at least once. That makes collection cardinality part of the state transition, even though it was not validated as one.

## Walking the empty input

For a new account and an empty array:

```ruby
choices = []
already_voted = poll.votes.where(account: account).exists? # false

choices.each do |choice|
  # Executes zero times. No vote row is persisted.
end

increment_voters_count! unless already_voted # increments
```

The state before and after one request looks like this:

| State | Before | After empty request |
| --- | ---: | ---: |
| persisted votes for account | 0 | 0 |
| account considered already voted | false | false on next request |
| cached voter count | n | n + 1 |

Because the eligibility query still returns `false`, the same transition can run again. The issue is not that an empty string bypassed per-choice validation. There is no choice to validate. The collection itself is empty, so all item validators are skipped.

## The broken invariant

The invariant I used to explain the finding was:

> Every voter-count increment must correspond to at least one persisted vote, and one account may cross from not-voted to voted only once per poll.

This framing mattered during disclosure. A proposed "presence" check on individual options would not close the gap because item validation never executes for an empty collection. The precondition belongs before the loop.

## Reproduction strategy

I reduced the report to two inputs:

```ruby
valid_choices = ["1", "2"]
empty_choices = []
```

Then I compared database state and the public voter count after each request. I was not trying to generate a large fake result; one or two requests were enough to prove the count and persisted rows could diverge.

The endpoint and poll identifiers are omitted, but the sequence was:

1. Create a fresh poll and a fresh test account.
2. Submit `choices: []` through the normal voting endpoint.
3. Observe a successful transition.
4. Verify there is no vote row for the account.
5. Verify the voter count increased.
6. Repeat once to show the account is still eligible.

## Fixing the boundary

The minimum repair is to reject an empty collection before entering the lock and transaction.

```ruby
def call(account, poll, choices)
  raise ArgumentError, "at least one choice is required" if choices.empty?

  # authorization and voting transaction
end
```

I would also make the count derive from, or be updated atomically with, persisted votes. A cache is safe only when every path that changes the source of truth changes the cache under the same invariant.

The regression matrix should include:

- empty collection;
- one valid choice;
- multiple valid choices when allowed;
- duplicate choices;
- out-of-range choices;
- mixed valid and invalid choices;
- a second request from an account that has already voted;
- concurrent requests for the same account and poll.

## Severity reasoning

The demonstrated impact was integrity: poll participation numbers could be manipulated remotely without a prior authenticated vote state or victim interaction. The report was assessed with this vector:

```text
CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N
```

The [FIRST CVSS calculator](https://www.first.org/cvss/calculator/3.1) documents what each metric means. The more important part of my reasoning was separating a corrupted aggregate from corrupted vote choices: the count could be inflated, while the option rows themselves were not created by the empty request.

My public security profiles: [HackerOne](https://hackerone.com/0xrj_?type=user) and [Intigriti](https://app.intigriti.com/researcher/profile/0_x_r_j).

*Publication note: the target, endpoint, report identifier, test account, and private correspondence are obfuscated. The vulnerable control flow, annotated reasoning, reproduction sequence, and severity model are retained.*
