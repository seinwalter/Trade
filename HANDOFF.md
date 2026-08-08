# DBTT Trading Strategy — Handoff Document

**Last updated:** 2026-08-08
**Repo:** seinwalter/Trade
**Branch:** `claude/dbtt-trading-strategy-Qt0yC`
**Current file:** `DBTT_Simple_Structure_Strategy.pine` (v2.0.0 — Hybrid ORB + Bias)

---

## 1. Purpose of This Document

Full context handoff so a fresh session (or higher model) can pick up work on this strategy without re-deriving history. Covers:
- What the strategy does now
- Full evolution from v1.x → v2.0.0
- Every bug found + how it was resolved
- Design decisions and why
- Known limitations + suggested next work
- Verification checklist

---

## 2. Current State: v2.0.0 — Hybrid ORB + Structure Bias

### 2.1 Strategy in one paragraph
Each RTH session, capture the Opening Range high/low during a configurable window (default first 30 min = 09:30-10:00 ET). After the OR window closes, wait for price to **close** beyond the OR high (long) or OR low (short). Only enter if the breakout direction matches the confirmed swing bias on both LTF (5m) and MTF (15m). Stop at the opposite side of the OR + buffer. Scale out at 3 TPs with breakeven after TP1. One trade per direction per session. End-of-bar execution only.

### 2.2 Signal flow (per bar, end-of-bar)
1. Session start? → reset OR levels + trade flags
2. In OR window? → expand `orHigh` / `orLow`
3. OR window just ended? → `orDefined = true`
4. Compute LTF bias (confirmed pivot pairs: HH+HL = 1, LH+LL = -1)
5. Compute MTF bias (same)
6. `biasLong = (biasLTF == 1 and biasMTF == 1)`
7. Range OK? `minORRange ≤ range ≤ maxORRange`
8. Breakout? `close > orHigh` (long) or `close < orLow` (short)
9. Bias aligned + direction not already taken this session + in date range?
10. → `strategy.entry()`, mark direction taken, set `lastEntryBar`

### 2.3 Sizes: file & inputs
- **File**: 312 lines (was 748 in v1.x)
- **Inputs**: 25 (was 65 in v1.x)
- Groups: Opening Range, Structure Bias, Filters, Targets/Stops, Execution

### 2.4 Key strategy header flags
```pine
strategy("DBTT Hybrid ORB + Bias v2.0.0",
     overlay = true,
     pyramiding = 0,
     initial_capital = 100000,
     calc_on_every_tick = false,
     calc_on_order_fills = false,   // CRITICAL: was true in v1.x, caused intrabar chaos
     process_orders_on_close = false)
```

---

## 3. Evolution Timeline

### v1.1.4 (initial commit)
- User provided a 734-line Pine v6 strategy: BOS/CHoCH structure detection + A+ confluence (bias + PD + liquidity sweep + FVG) + SMA/MACD support
- `calc_on_order_fills = true`
- 65 inputs

### v1.1.4 + duplicate-entry fix (commit `614904e`)
- **Problem**: `calc_on_order_fills = true` caused entry→exit→re-entry cycles within a single bar during backtesting, inflating trade counts
- **Fix**: added `lastEntryBar` guard — tracks `bar_index` of each entry, blocks new entries on same bar
- Set in both entry blocks AND in `newPos` detection block (redundant but safe)

### v1.1.4 + date filter (commit `aef8528`)
- Added `useDateFilter` + `dateStart` + `dateEnd` inputs
- Wired into `longSignal` / `shortSignal`
- Force-flat with reason `"DateEnd"` on first bar after range ends
- Debug label updated

### v2.0.0 — Hybrid ORB rewrite (commit `ab5c77c`) **← current**
- Complete rewrite based on QC findings (see §4)
- User chose hybrid over pure ORB and pure structure

---

## 4. Heavy QC Findings from v1.x (all resolved in v2.0.0)

### P0 Correctness Bugs

**P0.1 — BOS/CHoCH repaint against break-bar wick**
- `msPackStr()` used `ta.pivothigh(high, structLength, structLength)` which has inherent `structLength`-bar lag
- After a break, `prevHigh := high` (the break bar's wick) — chased the wick instead of waiting for the next confirmed pivot
- Result: signals repainted on historical bars once the true pivot formed later
- **Resolved**: new `biasCalc()` uses only confirmed pivot pairs and never overwrites with wicks

**P0.2 — `structLength` not scaled per timeframe**
- Same `structLength=20` used across LTF (5m = 100 min), MTF (15m = 300 min), HTF (Daily = 20 days)
- Made TF pivots wildly inconsistent
- **Resolved**: single `swingLen` param applied via `request.security` per-TF; each TF gets its own confirmed pivots in its own timescale

**P0.3 — Stop reference inconsistency**
- `newPos` block used `lastStopLo[1]` (prior bar's pivot)
- `needRecovery` block used `lastStopLo` (current bar) — could differ
- Result: stop could shift on recovery
- **Resolved**: `needRecovery` block eliminated; stop locked once at `newPos` using OR levels

**P0.4 — `entryWindowBars` allowed one break → multiple trades**
- Window stayed open for `entryWindowBars` bars post-break
- Even with `lastEntryBar` guard, if trade stopped on bar N+1, window was still open → new entry
- **Resolved**: ORB entries use `orLongTaken` / `orShortTaken` flags per session — one long + one short max per day

**P0.5 — `calc_on_order_fills = true` was root cause**
- Drove most intrabar bugs across the whole file
- **Resolved**: set to `false` in v2.0.0 header

### P1 Accuracy Issues (all resolved)

- HTF alignment created massive lag (Daily pivot on 5m = ~40+ bars lag) — dropped HTF as hard gate; only LTF + MTF required
- Stop was not locked at entry (could tighten mid-trade when new pivot printed) — now locked once at OR opposite side
- "Wicks" BOS mode allowed noise breaks — v2.0.0 uses only close-based breakout

### P2 Complexity / Dead Weight (all removed)

| Removed in v2.0.0 | Lines saved |
|---|---|
| FVG engine | ~45 |
| Liquidity sweep engine | ~35 |
| Premium/Discount zone | ~10 |
| SMA / MACD filters | ~30 |
| A+ Confluence aggregator | ~20 |
| BOS/CHoCH string-packing helpers | ~30 |
| `needRecovery` block | ~25 |
| Failsafe stop-close | ~15 |
| Audit counter table | ~25 |
| Debug label | ~30 |
| Instrument auto-detect | ~15 |
| Custom targets override | ~15 |
| `tradingMode` input (dup with `tradeSide`) | ~10 |
| TF preset selector | ~15 |
| `entrySignalMode` dropdown | ~10 |
| `f_snapQty` helpers | ~10 |

---

## 5. Key Design Decisions

### 5.1 Why Hybrid over Pure ORB or Pure Structure?
User chose **C: Hybrid** after evaluating:
- **Pure ORB** (~200 lines): simplest, mechanical, but chops on range days with false breakouts
- **Pure Structure** (~350 lines): adaptive but pivot lag causes late entries + repainting risk
- **Hybrid** (~300 lines): ORB entry mechanics (fast, mechanical, tight stops) + structure bias filter (kills false breakouts). Best of both.

### 5.2 Bias detection algorithm
Uses **confirmed pivot pairs** to determine bias — the standard "swing" interpretation of trend:
- `HH + HL` (higher high + higher low) → bias = 1 (bullish)
- `LH + LL` (lower high + lower low) → bias = -1 (bearish)
- Mixed (HH + LL, or LH + HL) → bias unchanged (stays with prior direction)

Why this doesn't repaint: `ta.pivothigh/low` returns a value only after `swLen` bars confirm the pivot. Bias only flips when a new confirmed pair forms. Never overwritten with break-bar wicks.

### 5.3 Why LTF + MTF (no HTF)?
Requiring HTF alignment on a 5m chart introduces massive lag — the daily pivot takes ~40+ 5m bars to confirm. This filtered out almost every valid setup. Two-TF alignment is a good balance: enough context to filter chop, fast enough to catch actual moves.

### 5.4 Why one-per-direction-per-session?
Once the OR breaks in one direction and you take the trade, further breakouts of the same level tend to be less clean (already tested + fading). One shot per direction per day keeps risk defined and avoids revenge trades on the same setup.

### 5.5 Why close-based breakout (not wick)?
A wick above OR high that closes back inside is noise. A close above is commitment. Filters out ~50% of false breakouts.

---

## 6. Full Input Reference

### Opening Range
| Input | Default | Purpose |
|---|---|---|
| OR Window | `"0930-1000"` | Session string defining the range window |
| Min OR Range (pts) | `2.0` | Skip if OR too tight (noise) |
| Max OR Range (pts) | `15.0` | Skip if OR too wide (stop too far, bad R:R) |
| Show OR Levels | `true` | Plot the high/low lines |

### Structure Bias
| Input | Default | Purpose |
|---|---|---|
| LTF | `"5"` | Lower timeframe for swing bias |
| MTF | `"15"` | Mid timeframe for swing bias |
| Swing Lookback | `10` | Pivot left/right bars |
| Require LTF+MTF | `true` | If false, LTF bias alone is enough |

### Filters
| Input | Default | Purpose |
|---|---|---|
| Trade Side | `"Both"` | Both / Long Only / Short Only |
| Session Timezone | `"America/New_York"` | Reused for OR window + RTH |
| Only Trade RTH | `true` | Blocks entries outside RTH |
| RTH Session | `"0930-1600"` | |
| Enable Date Filter | `false` | |
| Start Date / End Date | 2025-01-01 / 2026-12-31 | |

### Targets / Stops
| Input | Default | Purpose |
|---|---|---|
| Profile | `"MNQ"` | Selects TP defaults (MNQ or ES) |
| MNQ TP1/TP2/TP3 | 6 / 20 / 50 | Points from entry |
| ES TP1/TP2/TP3 | 1.5 / 3 / 7 | Points from entry |
| Stop Mode | `"OR Range"` | `OR Range` (opposite side of OR) or `Fixed` |
| Stop Buffer | `0.5` | Added beyond OR opposite side |
| Fixed SL | `10.0` | Used if Stop Mode = Fixed |

### Execution
| Input | Default | Purpose |
|---|---|---|
| Total Contracts | `3` | |
| TP1 Contracts | `1` | |
| TP2 Contracts | `1` | |
| BE Offset | `0.0` | Where to move stop to after TP1 (entry + this) |
| Force Flat At RTH Close | `true` | |
| Max Bars In Trade | `0` | 0 = off |

**Note**: TP3 quantity = `contracts - TP1Q - TP2Q` (auto-computed).

---

## 7. Code Architecture (v2.0.0)

### 7.1 File structure (top → bottom)
1. **Strategy header** (lines 1-10) — with `calc_on_order_fills = false`
2. **Inputs** (lines 12-59) — 5 groups, 25 inputs
3. **Derived constants** (lines 60-68) — TP/SL selection from profile, quantity splits
4. **`biasCalc()` helper** (lines 68-87) — non-repainting bias
5. **Bias per TF** (lines 89-92) — LTF/MTF via `request.security`
6. **Session filters** (lines 93-99) — RTH + date range
7. **Opening Range logic** (lines 100-132) — session detection, level tracking, range validation
8. **Breakout + bias signal** (lines 133-146) — combined entry gate
9. **Position state** (lines 147-155) — flat/newPos/flatNow detection
10. **Entry block** (lines 156-166) — with per-session direction flags + `lastEntryBar`
11. **Trade management state** (lines 167-202) — locked stop, TP hit tracking, reset on flat
12. **TP hit inference** (lines 203-215) — infers TP1/TP2 from position size (reliable vs closedtrades)
13. **BE trigger** (lines 216-222) — detects TP1 touch
14. **Force-flat logic** (lines 223-237) — RTH close, date end, max bars
15. **Exit orders** (lines 238-300) — 3-TP scale-out, long + short branches
16. **Plots** (lines 301-312) — OR lines + fill + entry markers

### 7.2 Critical invariants
- `orDefined` becomes true only after OR window closes; no entries before that
- `orLongTaken` / `orShortTaken` reset only when a new OR window opens (session start)
- `lastEntryBar` never resets (survives across flat states) → guarantees one entry per bar
- `lockedStop` set once at `newPos`, cleared at `flatNow`, never updated mid-trade
- TP hit inference uses position size (not `strategy.closedtrades.exit_id` which is unreliable)

### 7.3 Long/Short mirror duplication
The exit block (lines 245-300) is a near-duplicate for long and short paths. Kept as separate blocks for clarity in Pine v6 (extracting to a helper is possible but Pine's constraints on `strategy.exit()` inside functions make it awkward). If simplified later, would save ~30 lines.

---

## 8. Known Limitations / Possible Future Work

### 8.1 Feature ideas not implemented
- **VWAP filter**: could require price above/below session VWAP for bias confirmation
- **ADR filter**: skip days where average daily range is exceptionally low (chop days)
- **News blackout**: block entries during high-impact news windows (would need external data)
- **Trailing stop** for TP3: currently the runner uses locked BE stop; could trail beyond a swing high/low
- **Multi-OR windows**: some traders track initial OR + a second reference OR (e.g. first 5 min AND first 30 min)
- **Asymmetric TPs by profile**: different TP structure for trend vs range days

### 8.2 Verification not yet performed
The rewrite has NOT been run in TradingView yet. The user needs to:
1. Paste into Pine editor, confirm compilation
2. Load on MNQ 5m chart, verify OR lines plot correctly
3. Spot-check bias direction on 10 random trades
4. Run 1 year of backtesting, verify trades-per-session ≤ 2 (one long + one short max)
5. Verify stop = OR opposite side ± buffer on all trades

### 8.3 Pine Script quirks to remember
- `var` variables persist across bars (like static in C)
- `request.security` with `lookahead=barmerge.lookahead_off` is critical to avoid repaint bias
- `barstate.isconfirmed` is always true on historical bars during backtest — real-time distinguishes closed vs forming
- `strategy.position_size` is technically a float but always represents integer contracts (no fractional futures)
- Comparing `posSize == 0` is safe (no fractional accumulation possible)

---

## 9. Repo State / Branch Info

- **Branch**: `claude/dbtt-trading-strategy-Qt0yC`
- **Base**: `main`
- **Commits on branch** (newest first):
  - `ab5c77c` — Rewrite to Hybrid ORB + Structure Bias v2.0.0
  - `aef8528` — Add date filter to restrict backtesting to a date range
  - `614904e` — Add DBTT trading strategy with one-entry-per-bar duplicate fix
  - `b31119f` — Initial commit (main branch base)
- **PR status**: no PR opened (may need to be created)
- **Files**:
  - `DBTT_Simple_Structure_Strategy.pine` — the strategy (312 lines)
  - `README.md` — placeholder
  - `HANDOFF.md` — this document

---

## 10. Quick Reference — How to Continue Work

### If instructed to add a feature
- All entry logic is between lines 133-166 in `DBTT_Simple_Structure_Strategy.pine`
- Bias detection is in `biasCalc()` around line 68
- Exit orders are lines 238-300
- Follow the pattern of existing input groups; use short-circuit guards on optional filters (`not useX or condition`)

### If a bug is reported
1. First check the P0 list in §4 — has it been seen before?
2. Enable a quick debug print by adding `label.new(bar_index, high, "<msg>")` in the code path
3. Common causes:
   - `calc_on_order_fills` was flipped back to true (check line 9)
   - `orDefined` never becomes true (check `orSession` string matches chart's actual RTH open)
   - Bias never fires (`swingLen` too high for the TF's history)

### If asked to convert to a different market/instrument
- Adjust `Profile` in inputs (add new profile string + defaults)
- Update `orSession` and `rthSession` for that market's hours
- Set `sessionTZ` to the market's exchange timezone

### If asked to add HTF back as a bias input
Add a third `request.security` call:
```pine
int biasHTF = request.security(syminfo.tickerid, htfTF, biasCalc(swingLen), lookahead = barmerge.lookahead_off)
```
And extend the `biasLong`/`biasShort` conditions. But be aware of the lag issue documented in §4 (P1) — probably not recommended for intraday.

---

## 11. Session Chat Summary

The full evolution in one paragraph, for context:

User dropped in a 734-line Pine v6 strategy called "DBTT Simple Structure Strategy" with sophisticated A+ confluence logic (BOS/CHoCH + PD zones + liquidity sweeps + FVG + SMA/MACD filters). First task was noticing that `calc_on_order_fills=true` was causing same-bar duplicate entries during backtesting — fixed with a `lastEntryBar` guard. Then added a date filter for backtesting specific windows. Then user asked for a "heavy QC" to "perfect this ORB strategy" — clarified that the existing code was NOT actually ORB (it was structure-break), showed the differences, and user chose a **hybrid ORB + structure bias** approach. Full rewrite: kept the non-negotiable protections (one-entry-per-bar, force-flat, 3-TP scale-out, BE, date/RTH filters) and swapped the entry mechanics from BOS/CHoCH to Opening Range breakout with LTF+MTF bias filter. Stripped ~430 lines of dead weight in the process. Set `calc_on_order_fills=false` to eliminate the whole class of intrabar re-entry risk.
