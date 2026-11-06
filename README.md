# FormulaDesk

Engineering question studio and quiz app. React + Vite, **no backend** (data is saved in the browser).

- **Create question** – staff type formulas visually (MathLive editor: type `x^2`, `sqrt`, `pi`, `+-`, `/` and it formats live, no LaTeX needed), plus a toolbar of symbols and ready-made engineering formulas, with a live student preview.
- **Diagrams** – a tabbed Diagram Studio: circuit templates, a drawing board with electrical/mechanical/logic symbols, beams, trusses, free-body diagrams, equation graphs, tables and truth tables, flowcharts and block diagrams, logic circuits from Boolean expressions, timing diagrams, and compressed image upload. Diagrams are saved as small data, not pictures.
- **Question bank** – search, filter, edit, duplicate, delete, import/export JSON.
- **Take quiz** – timed quiz with shuffling, question navigator, review flags, scientific calculator, instant marking and worked explanations.

## Run it

You need Node.js 18 or newer (https://nodejs.org).

```bash
npm install      # also copies MathJax and MathLive fonts into public/ so formulas work offline
npm run dev      # open the link it prints, usually http://localhost:5173
```

Build for hosting (any static host: Netlify, Vercel, GitHub Pages, college web server):

```bash
npm run build    # output goes to dist/
npm run preview  # check the built version locally
```

## Project structure

```
src/
  App.jsx                  page switching, shared state
  styles.css               all styling (colors are CSS variables at the top)
  components/
    Tex.jsx                renders text containing $LaTeX$ with MathJax
    FormulaComposer.jsx    question editor made of words boxes and formula boxes
    MathInput.jsx          one visual formula box (MathLive <math-field>)
    Toolbar.jsx            symbol toolbar
    ShortcutHelp.jsx       typing shortcuts panel
    QuestionView.jsx       question as students see it
    Calculator.jsx         scientific calculator (mathjs)
    ScoreRing.jsx, Header.jsx
  diagrams/                one file per diagram type (viewer + editor)
    registry.js            the list of tabs; add new diagram types here
    DiagramStudio.jsx      the tabbed "Add a diagram" window
    FigureView.jsx         shows any saved diagram
    symbols.js             the symbol library (resistor, pin support, AND gate…)
    svgParts.jsx           shared SVG pieces (arrows, labels, dimensions)
    Drawing.jsx Circuit.jsx Beam.jsx Truss.jsx Fbd.jsx Graph.jsx
    Table.jsx Flow.jsx Logic.jsx boolean.js Timing.jsx ImageTab.jsx
  pages/
    Home.jsx, Studio.jsx, Bank.jsx
    quiz/Quiz.jsx, QuizSetup.jsx, QuizRun.jsx, QuizResult.jsx
  data/
    tools.js               toolbar buttons – add your own here
    seedQuestions.js       sample questions loaded on first run
    constants.js           subject list, difficulty levels
  lib/
    parts.js               converts between saved text ($...$) and editor boxes
    mathlive.js            MathLive setup + toolbar insertion
    calc.js                safe expression evaluation and marking
    mathjax.js, storage.js, utils.js
  hooks/
    useHashView.js, useLocalStorage.js
```

## Common changes

- **Add a toolbar button:** in `src/data/tools.js`, add `['label', R\`latex snippet\`]` to a group. Put `#` where the cursor should land, e.g. `['√', R\`\sqrt{#}\`]`.
- **How questions are stored:** as plain text with LaTeX between `$` signs, e.g. `find the output $\displaystyle x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$`. Staff never see this; the editor converts automatically.
- **Add a subject:** edit `src/data/constants.js`.
- **Change colors:** edit the variables at the top of `src/styles.css`.
- **Start with an empty bank:** in `src/App.jsx` change `useLocalStorage(BANK_KEY, SEED)` to `useLocalStorage(BANK_KEY, [])`.

## How diagrams are stored

Each question has an `images` object. The text holds a marker like `[[img:abc123]]` where the diagram goes,
and `images.abc123` holds the diagram, for example
`{ "type": "beam", "data": { "L": 6, "supports": [...], "loads": [...] }, "size": "l", "caption": "Fig. 2" }`.
Uploaded images use `{ "type": "image", "src": "data:image/webp;base64,..." }`.
Questions (including diagrams) are kept in the browser's IndexedDB, which holds far more than localStorage.
Export/Import in the Question bank includes the diagrams.

## Important: data storage

Questions and results are saved in **this browser on this computer** (localStorage).
To share questions with students on other computers, use **Question bank → Export**, then **Import** on the other machine.
For a real multi-user setup (staff and students on different devices), connect a backend such as Firebase, Supabase, or your own API and replace `useLocalStorage` for the bank.

See **HOW_TO_CREATE_QUESTIONS.md** for the staff guide.
