// Formula toolbar buttons: [label, LaTeX snippet]. '#' marks where the cursor goes.
// Add your own buttons or formulas to any group below.
const R = String.raw;

export const TOOLS = [
  { group: 'Basic', items: [
    ['x²', R`#^{2}`], ['x³', R`#^{3}`], ['xⁿ', R`#^{n}`], ['xₙ', R`#_{n}`], ['√x', R`\sqrt{#}`], ['∛x', R`\sqrt[3]{#}`],
    ['ⁿ√x', R`\sqrt[n]{#}`], ['a⁄b', R`\frac{#}{}`], ['( )', R`\left( # \right)`], ['[ ]', R`\left[ # \right]`], ['|x|', R`\left| # \right|`],
    ['±', R`\pm `], ['×', R`\times `], ['÷', R`\div `], ['·', R`\cdot `], ['°', R`^{\circ}`], ['%', R`\%`], ['n!', R`#!`] ] },
  { group: 'Greek', items: [
    ['π', R`\pi `], ['θ', R`\theta `], ['α', R`\alpha `], ['β', R`\beta `], ['γ', R`\gamma `], ['δ', R`\delta `], ['Δ', R`\Delta `],
    ['ε', R`\varepsilon `], ['η', R`\eta `], ['λ', R`\lambda `], ['μ', R`\mu `], ['ρ', R`\rho `], ['σ', R`\sigma `], ['τ', R`\tau `],
    ['φ', R`\phi `], ['ω', R`\omega `], ['Ω', R`\Omega `], ['Σ', R`\Sigma `], ['ψ', R`\psi `], ['ν', R`\nu `] ] },
  { group: 'Calculus', items: [
    ['∫', R`\int # \,dx`], ['∫ₐᵇ', R`\int_{a}^{b} # \,dx`], ['∬', R`\iint # \,dA`], ['∮', R`\oint # \,ds`], ['d/dx', R`\frac{d}{dx}\left( # \right)`],
    ['dy/dx', R`\frac{d#}{dx}`], ['d²y/dx²', R`\frac{d^{2}#}{dx^{2}}`], ['∂/∂x', R`\frac{\partial #}{\partial x}`], ['lim', R`\lim_{x \to #}`],
    ['∑', R`\sum_{n=1}^{\infty} #`], ['∏', R`\prod_{i=1}^{n} #`], ['∞', R`\infty `], ['∇', R`\nabla `], ['ℒ{ }', R`\mathcal{L}\left\{ # \right\}`] ] },
  { group: 'Functions', items: [
    ['sin', R`\sin\left( # \right)`], ['cos', R`\cos\left( # \right)`], ['tan', R`\tan\left( # \right)`], ['sin⁻¹', R`\sin^{-1}\left( # \right)`],
    ['cos⁻¹', R`\cos^{-1}\left( # \right)`], ['tan⁻¹', R`\tan^{-1}\left( # \right)`], ['sinh', R`\sinh\left( # \right)`], ['cosh', R`\cosh\left( # \right)`],
    ['log₁₀', R`\log_{10}\left( # \right)`], ['ln', R`\ln\left( # \right)`], ['eˣ', R`e^{#}`], ['10ˣ', R`10^{#}`], ['f(x)', R`f\left( # \right)`] ] },
  { group: 'Relations', items: [
    ['=', '= '], ['≠', R`\neq `], ['≈', R`\approx `], ['≤', R`\leq `], ['≥', R`\geq `], ['<', '< '], ['>', '> '], ['∝', R`\propto `],
    ['→', R`\to `], ['⇒', R`\Rightarrow `], ['⇔', R`\Leftrightarrow `], ['∈', R`\in `], ['∴', R`\therefore `], ['≡', R`\equiv `], ['∀', R`\forall `], ['∃', R`\exists `] ] },
  { group: 'Matrix & vector', items: [
    ['[2×2]', R`\begin{bmatrix} # & b \\ c & d \end{bmatrix}`], ['[3×3]', R`\begin{bmatrix} # & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{bmatrix}`],
    ['|det|', R`\begin{vmatrix} # & b \\ c & d \end{vmatrix}`], ['Aᵀ', R`#^{T}`], ['A⁻¹', R`#^{-1}`], ['v⃗', R`\vec{#}`], ['x̂', R`\hat{#}`],
    ['ẋ', R`\dot{#}`], ['ẍ', R`\ddot{#}`], ['x̄', R`\bar{#}`], ['cases', R`\begin{cases} # & x > 0 \\ 0 & x \leq 0 \end{cases}`], ['a·b', R`\vec{a}\cdot\vec{b}`], ['a×b', R`\vec{a}\times\vec{b}`] ] },
  { group: 'Units', items: [
    ['text', R`\text{#}`], ['Ω', R`\,\Omega`], ['kΩ', R`\,\text{k}\Omega`], ['μF', R`\,\mu\text{F}`], ['mH', R`\,\text{mH}`], ['V', R`\,\text{V}`],
    ['A', R`\,\text{A}`], ['W', R`\,\text{W}`], ['Hz', R`\,\text{Hz}`], ['N', R`\,\text{N}`], ['N·m', R`\,\text{N}\cdot\text{m}`], ['Pa', R`\,\text{Pa}`],
    ['m/s²', R`\,\text{m/s}^{2}`], ['kg/m³', R`\,\text{kg/m}^{3}`], ['K', R`\,\text{K}`], ['°C', R`\,^{\circ}\text{C}`] ] },
  { group: 'Engineering formulas', templates: true, items: [
    ['Quadratic formula', R`x = \frac{-b \pm \sqrt{b^{2}-4ac}}{2a}`],
    ['Euler’s formula', R`e^{j\theta} = \cos\theta + j\sin\theta`],
    ['Electrical power', R`P = VI = I^{2}R = \frac{V^{2}}{R}`],
    ['RC charging', R`v_C(t) = V_s\left(1 - e^{-t/RC}\right)`],
    ['Impedance (RLC)', R`Z = R + j\left(\omega L - \frac{1}{\omega C}\right)`],
    ['Resonant frequency', R`f_0 = \frac{1}{2\pi\sqrt{LC}}`],
    ['Bernoulli', R`P + \frac{1}{2}\rho v^{2} + \rho g h = \text{constant}`],
    ['Beam deflection (UDL)', R`\delta_{max} = \frac{5wL^{4}}{384EI}`],
    ['Torsion', R`\frac{T}{J} = \frac{\tau}{r} = \frac{G\theta}{L}`],
    ['Ideal gas', R`PV = nRT`],
    ['Carnot efficiency', R`\eta = 1 - \frac{T_C}{T_H}`],
    ['Laplace transform', R`\mathcal{L}\{f(t)\} = \int_{0}^{\infty} f(t)\,e^{-st}\,dt`],
    ['Fourier series', R`f(x) = \frac{a_0}{2} + \sum_{n=1}^{\infty}\left(a_n\cos nx + b_n\sin nx\right)`],
    ['Taylor series', R`f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^{n}`],
    ['π series', R`\pi = 4 - 4\sum_{n=1}^{\infty} \frac{1}{n!}\,\frac{1}{2n+1}\,(-n)_{n-1}`] ] }
];
