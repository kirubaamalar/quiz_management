// Sample questions loaded the first time the app opens.
import { uid } from '../lib/utils';

const R = String.raw;

export const SEED = [
  { subject: 'Engineering Mathematics', topic: 'Series', difficulty: 'Hard', marks: 3, type: 'mcq',
    text: R`Starting from
$$\pi = 4 - 4\sum_{n=1}^{\infty} \frac{1}{n!}\,\frac{1}{2n+1}\,(-n)_{n-1}$$
where $(a)_k$ is the Pochhammer symbol, which series does it simplify to?`,
    options: [R`$4 - 4\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^{n-1}}{2n+1}$`, R`$4 - 4\displaystyle\sum_{n=1}^{\infty} \frac{1}{2n+1}$`, R`$4\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^{n}}{n!\,(2n+1)}$`, R`$4 - 4\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^{n}\,n!}{2n+1}$`],
    correct: 0, explanation: R`$(-n)_{n-1} = (-n)(-n+1)\cdots(-2) = (-1)^{n-1}\,n!$, so the $n!$ cancels and the result is the Leibniz series $\frac{\pi}{4} = 1 - \frac{1}{3} + \frac{1}{5} - \cdots$` },
  { subject: 'Electrical', topic: 'Transients', difficulty: 'Easy', marks: 1, type: 'numeric',
    text: R`For the series RC circuit shown,
[[img:rccircuit]]
find the time constant $\tau = RC$.`,
    images: { rccircuit: { type: 'circuit', data: { template: 'seriesRC', p: { V: '12 V', R: '10 kΩ', C: '100 μF', sw: 'yes' } }, size: 'm', caption: 'Fig. 1 – Series RC circuit, S closes at t = 0' } },
    answer: 1, answerExpr: '10e3 * 100e-6', tolerance: 1, unit: 's',
    explanation: R`$\tau = RC = (10\times10^{3})(100\times10^{-6}) = 1\,\text{s}$` },
  { subject: 'Mechanical', topic: 'Beam reactions', difficulty: 'Medium', marks: 2, type: 'numeric',
    text: R`The simply supported beam shown carries a point load and a uniformly distributed load.
[[img:beam1]]
Find the vertical reaction at support $B$.`,
    images: { beam1: { type: 'beam', size: 'l', caption: 'Fig. 2', data: {
      L: 6, lu: 'm', fu: 'kN', dims: true,
      supports: [{ id: 'a', type: 'pin', x: 0, name: 'A' }, { id: 'b', type: 'roller', x: 6, name: 'B' }],
      loads: [{ id: 'p', type: 'point', x: 2, P: 12, angle: 90 }, { id: 'w', type: 'udl', x1: 3, x2: 6, w: 4 }] } } },
    answer: 13, answerExpr: '(12*2 + 4*3*4.5)/6', tolerance: 1, unit: 'kN',
    explanation: R`Taking moments about $A$: $R_B \times 6 = 12 \times 2 + (4 \times 3)(4.5)$, so $R_B = \dfrac{24 + 54}{6} = 13\,\text{kN}$.` },
  { subject: 'Electronics', topic: 'Logic gates', difficulty: 'Easy', marks: 1, type: 'mcq',
    text: R`Which Boolean expression does this logic circuit implement?
[[img:logic1]]`,
    images: { logic1: { type: 'logic', size: 'm', caption: '', data: { expr: "Y = AB + C'", truth: false } } },
    options: [R`$Y = AB + \overline{C}$`, R`$Y = (A + B)\,\overline{C}$`, R`$Y = \overline{AB} + C$`, R`$Y = A + B + \overline{C}$`], correct: 0,
    explanation: R`The AND gate gives $AB$, the NOT gate gives $\overline{C}$, and the OR gate adds them: $Y = AB + \overline{C}$.` },
  { subject: 'Electrical', topic: 'Transients', difficulty: 'Medium', marks: 2, type: 'numeric',
    text: R`The graph shows the voltage across a discharging capacitor, $v(t) = 10e^{-t/\tau}$. The marked point is where the voltage has fallen to 36.8% of its initial value.
[[img:graph1]]
What is the time constant $\tau$ in seconds?`,
    images: { graph1: { type: 'graph', size: 'l', caption: 'Fig. 3 – Capacitor discharge', data: {
      curves: [{ expr: '10*e^(-t/2)', label: 'v(t)', dashed: false }], v: 't', xmin: 0, xmax: 10, ymin: '', ymax: '',
      xlabel: 't (s)', ylabel: 'v (V)', grid: true, points: [{ x: 2, y: 3.68, label: '3.68 V' }], table: '', connect: true } } },
    answer: 2, answerExpr: '2', tolerance: 2, unit: 's',
    explanation: R`At $t = \tau$, $v = 10e^{-1} = 3.68\,\text{V}$. The graph reaches 3.68 V at $t = 2\,\text{s}$, so $\tau = 2\,\text{s}$.` },
  { subject: 'Civil', topic: 'Trusses', difficulty: 'Medium', marks: 1, type: 'mcq',
    text: R`For the Pratt truss shown, how many members does it have?
[[img:truss1]]`,
    images: { truss1: { type: 'truss', size: 'l', caption: 'Fig. 4 – Pratt truss', data: {
      kind: 'Pratt', panels: 4, span: 12, height: 3, lu: 'm', fu: 'kN', dims: true, names: true,
      joints: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 3, y: 0 }, { n: 'C', x: 6, y: 0 }, { n: 'D', x: 9, y: 0 }, { n: 'E', x: 12, y: 0 }, { n: 'F', x: 3, y: 3 }, { n: 'G', x: 6, y: 3 }, { n: 'H', x: 9, y: 3 }],
      members: 'A-B, B-C, C-D, D-E, A-F, H-E, F-G, G-H, B-F, C-G, D-H, F-C, H-C',
      supports: [{ j: 'A', type: 'pin' }, { j: 'E', type: 'roller' }], loads: [{ j: 'G', P: 10, angle: 90 }] } } },
    options: ['$13$', '$12$', '$11$', '$15$'], correct: 0,
    explanation: R`A simple truss satisfies $m = 2j - 3$. With $j = 8$ joints, $m = 2(8) - 3 = 13$.` },
  { subject: 'Mechanical', topic: 'Strength of materials', difficulty: 'Medium', marks: 2, type: 'mcq',
    text: R`The maximum deflection of a simply supported beam of span $L$ carrying a uniformly distributed load $w$ per unit length is:`,
    options: [R`$\dfrac{5wL^{4}}{384EI}$`, R`$\dfrac{wL^{4}}{8EI}$`, R`$\dfrac{wL^{3}}{48EI}$`, R`$\dfrac{5wL^{3}}{384EI}$`],
    correct: 0, explanation: R`$\dfrac{wL^{4}}{8EI}$ is the cantilever result and $\dfrac{WL^{3}}{48EI}$ is for a central point load.` },
  { subject: 'Engineering Mathematics', topic: 'Matrices', difficulty: 'Easy', marks: 1, type: 'numeric',
    text: R`Find $\det A$ for $A = \begin{bmatrix} 2 & 3 \\ 1 & 4 \end{bmatrix}$.`,
    answer: 5, answerExpr: '2*4 - 3*1', tolerance: 0, unit: '',
    explanation: R`$\det A = (2)(4) - (3)(1) = 5$` },
  { subject: 'Electrical', topic: 'Complex numbers', difficulty: 'Easy', marks: 1, type: 'mcq',
    text: R`Using Euler’s formula $e^{j\theta} = \cos\theta + j\sin\theta$, the value of $e^{j\pi} + 1$ is:`,
    options: ['$0$', '$1$', '$-1$', '$2j$'], correct: 0,
    explanation: R`$e^{j\pi} = \cos\pi + j\sin\pi = -1$, so $e^{j\pi} + 1 = 0$.` },
  { subject: 'Fluid Mechanics', topic: 'Bernoulli', difficulty: 'Medium', marks: 2, type: 'numeric',
    text: R`Water flows out of a small orifice $h = 5\,\text{m}$ below the free surface of a large tank. Using Torricelli’s result $v = \sqrt{2gh}$ with $g = 9.81\,\text{m/s}^{2}$, find the exit velocity.`,
    answer: Math.sqrt(2 * 9.81 * 5), answerExpr: 'sqrt(2*9.81*5)', tolerance: 1, unit: 'm/s',
    explanation: R`$v = \sqrt{2(9.81)(5)} \approx 9.90\,\text{m/s}$` },
  { subject: 'Engineering Mathematics', topic: 'Laplace transforms', difficulty: 'Medium', marks: 2, type: 'mcq',
    text: R`$\mathcal{L}\left\{ e^{-at} \right\}$ is equal to:`,
    options: [R`$\dfrac{1}{s+a}$`, R`$\dfrac{1}{s-a}$`, R`$\dfrac{a}{s^{2}+a^{2}}$`, R`$\dfrac{s}{s^{2}+a^{2}}$`], correct: 0,
    explanation: R`$\int_{0}^{\infty} e^{-at}e^{-st}\,dt = \dfrac{1}{s+a}$ for $s > -a$.` },
  { subject: 'Engineering Mathematics', topic: 'Integration', difficulty: 'Easy', marks: 1, type: 'numeric',
    text: R`Evaluate $\displaystyle\int_{0}^{\pi} \sin x \,dx$.`,
    answer: 2, answerExpr: '2', tolerance: 0.5, unit: '',
    explanation: R`$\left[-\cos x\right]_{0}^{\pi} = -\cos\pi + \cos 0 = 2$` },
  { subject: 'Thermodynamics', topic: 'Heat engines', difficulty: 'Easy', marks: 1, type: 'numeric',
    text: R`A Carnot engine works between $T_H = 500\,\text{K}$ and $T_C = 300\,\text{K}$. Find its efficiency $\eta = 1 - \dfrac{T_C}{T_H}$ in percent.`,
    answer: 40, answerExpr: '(1 - 300/500)*100', tolerance: 0.5, unit: '%',
    explanation: R`$\eta = 1 - \dfrac{300}{500} = 0.4 = 40\%$` },
  { subject: 'Electronics', topic: 'Resonance', difficulty: 'Hard', marks: 3, type: 'numeric',
    text: R`Find the resonant frequency of an LC circuit with $L = 10\,\text{mH}$ and $C = 1\,\mu\text{F}$, using $f_0 = \dfrac{1}{2\pi\sqrt{LC}}$.`,
    answer: 1 / (2 * Math.PI * Math.sqrt(10e-3 * 1e-6)), answerExpr: '1/(2*pi*sqrt(10e-3*1e-6))', tolerance: 1, unit: 'Hz',
    explanation: R`$f_0 = \dfrac{1}{2\pi\sqrt{(10^{-2})(10^{-6})}} \approx 1591.5\,\text{Hz}$` }
].map((q) => ({ ...q, id: uid(), createdAt: Date.now() }));
