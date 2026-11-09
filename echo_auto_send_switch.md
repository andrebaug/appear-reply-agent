Paste everything below the line into Echo's session (the "Echo reply agent" conversation in Claude Code).

---

Echo, Grischa here. We are switching you from approval mode to AUTO SEND, starting now. Bookings dropped hard in November and this is urgent.

1. Run `git fetch origin claude/eloquent-darwin-c9ua76 && git checkout claude/eloquent-darwin-c9ua76 && git pull origin claude/eloquent-darwin-c9ua76` in /home/user/appear-reply-agent. That branch holds the new reply_agent_playbook.md (built on your current playbook, nothing removed). Read sections 3, 5, 6, 6b, 6c, 6d and 11 again.

2. Update your own scheduled task "Echo reply agent" (trig_01JqMyHaD3Mqj8uUAYrmUMaB) so its prompt says AUTO SEND instead of "Approval mode: never send an email unless a human approved it", follows the playbook on branch claude/eloquent-darwin-c9ua76 (git pull at the start of every run), and includes steps 4 to 6 below. Keep everything else (watcher, Echo voice, TRC rules, hard rules) as it is.

3. What changes:
- Send replies to positive and question replies yourself, right away. Then post a log card in #outbound-agent with their reply and the exact email you sent, and react ✅ on it.
- GIVE FIRST, THEN ASK: when someone says "show me" or "yes", the email must show the real ChatGPT result first (the question we asked, who it named, the review gap), taken only from lead variables or our original email. Then offer 2 times, the first within 1 to 2 business days, plus the booking link. No ChatGPT data saved for that lead? Do not send. Post a "needs you: run audit first" card.
- Pre send checks: no placeholders, no hyphens, every fact traceable, slots still free, no teammate already replied, never from team@, rocky@ or jordon@therankcollective.com.
- Needs you (do not send, tag Grischa only; Kien is no longer on the team, never tag or mention him): angry or legal replies, contract, proposal, discount or custom pricing requests, questions the playbook does not cover, anything ambiguous. Nudge in the thread after 30 minutes and after 2 hours.

4. Follow ups (weekdays, auto send, logged in Slack): for every lead we answered who has not replied or booked:
   - 2 business days later: short bump with 2 fresh times and the link
   - 3 business days after that: one new useful fact from their own data, offer the ChatGPT screenshot
   - 5 business days after that: friendly last note, then stop for good
   Stop the moment they reply, book or say no. Start the backlog today: Russell (Lambs Lawn), Jose (Servin's Tree Care), Ingrid's Cleaning, ValueCrafters, Roger (Mercury Home Remodeling) and every other lead we answered since Oct 19 who never booked begins at follow up 1. Check each Instantly thread first so nobody gets a duplicate.

5. No shows and cancellations (weekdays): one rebook email with 2 times and the link, one follow up 2 business days later, then stop. No Instantly thread for the contact? Post "needs you: rebook" (Brittany Smith and Richard Hill are the current ones).

6. Daily health note (first run each weekday): yesterday's new leads contacted, human replies, interested replies, replies sent, follow ups sent, calls booked. Flag and tag me if new leads contacted is under 1,000, any campaign has under 2 days of new leads left, replies per 1,000 new leads is under 6, or a needs you card waited over 2 hours.

Confirm in #outbound-agent once you are live in auto send mode.
