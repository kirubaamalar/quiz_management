// Boolean expressions: parse "Y = AB + C'" into a tree, evaluate it, and lay it out as a gate circuit.
const KEYWORDS = { AND: 'and', OR: 'or', NOT: 'not', XOR: 'xor', NAND: 'nand', NOR: 'nor', XNOR: 'xnor' };

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(' || c === ')') { out.push({ t: c }); i++; continue; }
    if (c === "'" || c === '’') { out.push({ t: 'post-not' }); i++; continue; }
    if ('!~¬'.includes(c)) { out.push({ t: 'op', v: 'not' }); i++; continue; }
    if ('+|∨'.includes(c)) { out.push({ t: 'op', v: 'or' }); i++; continue; }
    if ('·.*&∧'.includes(c)) { out.push({ t: 'op', v: 'and' }); i++; continue; }
    if ('^⊕'.includes(c)) { out.push({ t: 'op', v: 'xor' }); i++; continue; }
    if (c === '0' || c === '1') { out.push({ t: 'const', v: +c }); i++; continue; }
    const m = /^[A-Za-z][A-Za-z]*[0-9]*/.exec(src.slice(i));
    if (m) {
      const w = m[0];
      if (KEYWORDS[w.toUpperCase()] && w === w.toUpperCase()) out.push({ t: 'op', v: KEYWORDS[w.toUpperCase()] });
      else if (/^[A-Za-z]+$/.test(w)) for (const ch of w) out.push({ t: 'var', v: ch });   // AB means A·B
      else {
        const letters = w.replace(/[0-9]+$/, ''), digits = w.slice(letters.length);
        for (let k = 0; k < letters.length - 1; k++) out.push({ t: 'var', v: letters[k] });
        out.push({ t: 'var', v: letters[letters.length - 1] + digits });           // A1 stays one input
      }
      i += w.length;
      continue;
    }
    throw new Error(`Unexpected “${c}”`);
  }
  return out;
}

export function parseLogic(text) {
  let src = String(text || '').trim(), out = 'Y';
  const eq = src.indexOf('=');
  if (eq >= 0) { out = src.slice(0, eq).trim() || 'Y'; src = src.slice(eq + 1); }
  const toks = tokenize(src);
  let pos = 0;
  const peek = () => toks[pos];
  const startsOperand = (t) => t && (t.t === 'var' || t.t === 'const' || t.t === '(' || (t.t === 'op' && t.v === 'not'));
  const orExpr = () => {
    let left = xorExpr();
    while (peek() && peek().t === 'op' && (peek().v === 'or' || peek().v === 'nor')) {
      const op = toks[pos++].v; left = { op, kids: [left, xorExpr()] };
    }
    return left;
  };
  const xorExpr = () => {
    let left = andExpr();
    while (peek() && peek().t === 'op' && (peek().v === 'xor' || peek().v === 'xnor')) {
      const op = toks[pos++].v; left = { op, kids: [left, andExpr()] };
    }
    return left;
  };
  const andExpr = () => {
    let left = unary();
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === 'and' || t.v === 'nand')) { pos++; left = { op: t.v, kids: [left, unary()] }; }
      else if (startsOperand(t)) left = { op: 'and', kids: [left, unary()] }; // implicit AND: AB
      else return left;
    }
  };
  const unary = () => {
    const t = peek();
    if (t && t.t === 'op' && t.v === 'not') { pos++; return { op: 'not', kids: [unary()] }; }
    let node = primary();
    while (peek() && peek().t === 'post-not') { pos++; node = { op: 'not', kids: [node] }; }
    return node;
  };
  const primary = () => {
    const t = toks[pos++];
    if (!t) throw new Error('The expression ends too early');
    if (t.t === 'var') return { v: t.v };
    if (t.t === 'const') return { c: t.v };
    if (t.t === '(') {
      const e = orExpr();
      if (!peek() || peek().t !== ')') throw new Error('A closing bracket “)” is missing');
      pos++;
      return e;
    }
    throw new Error('Something is missing before “' + (t.v || t.t) + '”');
  };
  if (!toks.length) throw new Error('Type an expression, for example Y = AB + C\'');
  const tree = orExpr();
  if (pos < toks.length) throw new Error('Check the expression near the end');
  return { out, tree };
}

export function variablesOf(tree, acc = []) {
  if (tree.v && !acc.includes(tree.v)) acc.push(tree.v);
  (tree.kids || []).forEach((k) => variablesOf(k, acc));
  return acc;
}

export function evaluate(tree, env) {
  if ('v' in tree) return env[tree.v] ? 1 : 0;
  if ('c' in tree) return tree.c;
  const k = tree.kids.map((x) => evaluate(x, env));
  switch (tree.op) {
    case 'not': return k[0] ? 0 : 1;
    case 'and': return k[0] & k[1];
    case 'or': return k[0] | k[1];
    case 'xor': return k[0] ^ k[1];
    case 'nand': return (k[0] & k[1]) ? 0 : 1;
    case 'nor': return (k[0] | k[1]) ? 0 : 1;
    case 'xnor': return (k[0] ^ k[1]) ? 0 : 1;
    default: return 0;
  }
}

/** Truth table rows for several "Y = ..." lines sharing the listed inputs. */
export function truthTable(inputs, exprs) {
  const parsed = exprs.map(parseLogic);
  const vars = inputs.length ? inputs : [...new Set(parsed.flatMap((p) => variablesOf(p.tree)))].sort();
  const rows = [[...vars, ...parsed.map((p) => p.out)]];
  for (let i = 0; i < 2 ** vars.length; i++) {
    const env = Object.fromEntries(vars.map((v, k) => [v, (i >> (vars.length - 1 - k)) & 1]));
    rows.push([...vars.map((v) => String(env[v])), ...parsed.map((p) => String(evaluate(p.tree, env)))]);
  }
  return rows;
}

/** Turns the tree into drawing elements (gates + wires), inputs on the left, output on the right. */
export function layoutLogic({ out, tree }, uid) {
  const els = [];
  const SP = 50, COL = 150;
  let row = 0;
  const level = (n) => (n.kids ? 1 + Math.max(...n.kids.map(level)) : 0);
  const W = (...pts) => els.push({ id: uid(), t: 'wire', pts });
  const place = (n) => {
    if (!n.kids) {
      const y = row++ * SP;
      els.push({ id: uid(), t: 'text', x: -34, y, label: 'c' in n ? String(n.c) : n.v, size: 17, italic: true });
      W([-14, y], [0, y]);
      return [0, y];
    }
    const kids = n.kids.map(place);
    const gx = level(n) * COL;
    const gy = n.kids.length === 1 ? kids[0][1] : Math.round((kids[0][1] + kids[1][1]) / 2);
    const pins = n.kids.length === 1 ? [[gx - 20, gy]] : [[gx - 20, gy - 10], [gx - 20, gy + 10]];
    kids.forEach(([kx, ky], k) => {
      const [px, py] = pins[k];
      if (ky === py) W([kx, ky], [px, py]);
      else { const mx = gx - 45 - k * 12; W([kx, ky], [mx, ky], [mx, py], [px, py]); }
    });
    els.push({ id: uid(), t: 'sym', s: n.op, x: gx, y: gy, rot: 0, label: '' });
    return [gx + 70, gy];
  };
  const [ox, oy] = place(tree);
  W([ox, oy], [ox + 40, oy]);
  els.push({ id: uid(), t: 'text', x: ox + 48, y: oy, label: out, size: 17, italic: true });
  return els;
}
