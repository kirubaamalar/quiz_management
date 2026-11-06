# How to create a question with formulas

No codes, no `$` signs, no backslashes. You type formulas the way they look.

## The idea: two kinds of boxes

| Box | Button | What you type |
|---|---|---|
| **Words box** | **Aa** | normal sentences, e.g. *find the output* |
| **Formula box** | **∑** | maths, which formats itself as you type |

A question is just words boxes and formula boxes one after another.
Use **+ Words** and **+ Formula** to add more boxes, and **×** to remove one.

## Step by step

1. Open **Create question**. Fill in Subject, Topic and Marks, then choose a Difficulty and an Answer type.
2. In the **Question** words box, type: `find the output`
3. Click **+ Formula**. A formula box opens with the cursor in it.
4. Type the formula using the keys below. It turns into proper maths as you type.
5. Check the **Student preview** on the right.
6. **Options:** for each option, tap **∑** for a formula or **Aa** for words, then type. Tap the letter A–D of the correct answer (it turns green).
7. Write the **Explanation** the same way, then click **Save question**.

## Typing keys for formula boxes

| Type | You get |
|---|---|
| `/` | fraction. Type `/` first, fill the top, then press ↓ for the bottom |
| `^` | power: `x^2` → x² |
| `_` | subscript: `V_0` → V₀ |
| `+-` | ± |
| `sqrt` | √ |
| `pi`, `theta`, `alpha`, `omega`, `Delta`, `Omega` | π θ α ω Δ Ω |
| `xx` | × |
| `<=`  `>=`  `!=` | ≤ ≥ ≠ |
| `->` | → |
| `infty` | ∞ |
| `int`, `sum`, `lim` | ∫ ∑ lim (with boxes for the limits) |
| `sin`, `cos`, `tan`, `log`, `ln` | written upright automatically |
| arrow keys, Tab | move out of a power, root or fraction |
| ⌨ icon in the box | on-screen maths keyboard (also useful on phones) |

A power with a single number (like `^2`) ends automatically, so you can keep typing.
For longer powers (like `^jθ`), press → to come back down.

## Example 1: x = (−b ± √(b² − 4ac)) / 2a

In a formula box, type:

```
x=   /   -b+-sqrt   b^2-4ac   ↓   2a
```

- `x=` gives x =
- `/` makes an empty fraction, with the cursor on top
- `-b+-sqrt` gives −b ± √
- `b^2-4ac` goes inside the root
- ↓ (down arrow) moves to the bottom of the fraction
- `2a` goes in the bottom

## Example 2: e^{jθ} = cos θ + j sin θ

```
e^jtheta   →   =cos theta+jsin theta
```

- `e^jtheta` gives e with jθ as the power
- → (right arrow) comes back down from the power
- the rest types normally

## Example 3: π = 4 − 4 ∑ (1/n!) (1/(2n+1)) (−n)ₙ₋₁

```
pi=4-4sum   infty  Tab  n=1  Tab   /1 ↓ n! →   /1 ↓ 2n+1 →   (-n)_n-1
```

- `pi=4-4sum` gives π = 4 − 4∑. The cursor goes to the **top** limit first.
- `infty` is the top limit, then Tab
- `n=1` is the bottom limit, then Tab to move into the main part
- `/1` ↓ `n!` → gives 1/n!
- `/1` ↓ `2n+1` → gives 1/(2n+1)
- `(-n)_n-1` gives (−n)ₙ₋₁

Or tap **Engineering formulas → π series** in the toolbar to insert it in one tap.

## The toolbar

- Click inside a formula box, then tap any button (π, √, ∫, matrix, units…). It goes in at the cursor.
- If your cursor is in a words box, tapping a button adds a new formula box for you.
- **Engineering formulas** tab: whole formulas (quadratic, Euler, Bernoulli, beam deflection, resonance, Laplace, Fourier…) in one tap. You can edit them afterwards.

## Numerical answers

For "Numerical answer" questions, the **Correct answer** box takes a calculation, for example `1/(2*pi*sqrt(10e-3*1e-6))`.
The app works out the value. Set the **Allowed error (%)** (1% suits most problems) and the **Unit**.

## Tips

- **Own line** (next to a formula box) shows that formula centred on its own line, which is good for long formulas.
- Select part of a formula, then tap √ or a fraction button to wrap it.
- Made a mistake? Use Backspace as normal, or **×** to delete the whole box.

---

# Adding diagrams

Click **+ Diagram** under the question, or the **◫** button on any box or answer option.
The **Diagram Studio** opens. Choose a tab at the top, build the diagram, check the preview, and click **Insert diagram**.

| Tab | Use it for | How |
|---|---|---|
| ⚡ **Circuit** | series/parallel resistors, RC, RL, RLC, voltage divider, Wheatstone bridge, op-amp amplifiers, rectifier, filters | Pick the circuit, type the values (10 kΩ, 100 μF). Empty value = name only. |
| ✎ **Drawing board** | any custom circuit, free-body diagram, mechanism, logic circuit | Click a symbol, then click the board to place it. Join parts with the **Wire** tool. |
| ▬ **Beam** | simply supported, cantilever, overhanging beams | Set the span, add supports and loads (point, UDL, UVL, moment). Dimensions are automatic. |
| △ **Truss** | Pratt, Howe, Warren and roof trusses | Choose a type, panels, span and height. Then set supports and joint loads. |
| ↘ **Free body** | block on an incline or floor, hanging mass | Choose the scene, the angles and which forces to show. |
| 📈 **Graph** | plots of equations and lab readings | Type `y = 10*e^(-t/2)`, set the range, mark points. |
| ▦ **Table** | data tables, given values, truth tables | Type in the grid, or use **Fill the table** to create a truth table. |
| ⬦ **Flowchart** | algorithms, block diagrams | Add steps (Start, Process, Decision…) and arrows with labels such as Yes / No. |
| ⊃ **Logic gates** | gate circuits | Type `Y = AB + C'` and the circuit is drawn. |
| ⎍ **Timing** | clock and signal timing diagrams | One letter per clock cycle: `p` clock, `0`/`1` low/high, `.` same, `x` unknown, `=` data. |
| 🖼 **Image** | photos, scans | Choose, drop or paste an image. It is compressed automatically. |

At the bottom of the window:
- **Caption**, for example *Fig. 1 – Simply supported beam*.
- **Size**: Small, Medium, Large or Full width.

After inserting, click the diagram (or **Edit**) to change it later. Students can click a diagram during the quiz to see it full screen.

## Drawing board tips

- **Place a symbol:** click it in the left panel, then click on the board.
- **Move:** drag it. **Rotate:** select it and press **R**, or click ⟳ Rotate.
- **Label:** select it and type in the Label box on the right (e.g. `R1 = 10 Ω`). The quick buttons add Ω μ θ ° ² and more.
- **Wires:** choose **Wire**, click at each corner, and double-click (or press Enter) to finish. Wires bend at right angles and snap to the symbol ends.
- **Forces and currents:** use **Arrow**. Drag from the tail to the tip, then type a label like `F = 20 N`.
- **Undo / redo:** Ctrl+Z / Ctrl+Y. **Delete:** select and press Delete.
- The Circuit and Logic tabs have **Customize in the drawing board**, which lets you start from a template and add your own parts.

## Why drawn diagrams instead of images?

A drawn diagram is saved as a few numbers and labels (usually 1–5 KB), stays sharp on any screen and projector, adapts to dark mode, and can be edited later, for example changing 10 kN to 15 kN for a new version of a question. An uploaded photo is typically 100–300 KB even after compression.

## Examples

**Beam question:** Beam tab → *Simply supported, central load* → change the span to 6 and the load to 12 → Insert. Question text: *Find the reactions at A and B.*

**Logic question:** Logic gates tab → type `Y = (A + B)C'` → Insert. Options: four Boolean expressions.

**Graph question with graph options:** for each option, click ◫ → Graph tab → type a different curve, so students pick the correct graph.
