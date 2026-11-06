// Queues MathJax typesetting so many formulas can render safely one after another.
let queue = Promise.resolve();

export function typeset(el) {
  queue = queue
    .then(() => {
      const MJ = window.MathJax;
      if (!MJ || !MJ.startup || !MJ.startup.promise) return;
      return MJ.startup.promise.then(() => {
        if (!el.isConnected) return;
        MJ.typesetClear([el]);
        return MJ.typesetPromise([el]);
      });
    })
    .catch((err) => console.warn('MathJax', err));
}
