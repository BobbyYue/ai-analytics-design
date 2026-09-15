// Independent demonstration of revenue reconciliation. Generic aliases and
// fictional amounts; not production code or a full analysis workflow.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TeachingDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const data = {
    metric: '服务收入（通用代称）', unit: '万元', before_total: 800, after_total: 740,
    groups: [
      {name: '客户甲', before: 300, after: 210},
      {name: '客户乙', before: 200, after: 250},
      {name: '其他', before: 300, after: 280}
    ]
  };
  const signed = value => {
    const rounded = Number(value.toFixed(8));
    return (rounded > 0 ? '+' : rounded < 0 ? '−' : '') + Math.abs(rounded);
  };
  // A small arithmetic tolerance for this demonstration, not a production
  // currency-rounding policy. Decimal and signed amounts are not counts.
  const equalAmount = (a, b) => Math.abs(a - b) <= 1e-8;
  function makeCase(name) {
    if (!['missing', 'stale', 'valid'].includes(name)) throw new Error('Unknown teaching case');
    return {
      groups: data.groups.filter(d => name !== 'missing' || d.name !== '客户乙').map(d => ({...d})),
      before_total: data.before_total, after_total: data.after_total,
      expected_names: data.groups.map(d => d.name),
      unit: data.unit, expected_unit: data.unit,
      expected_data: '演示数据 B', referenced_data: name === 'stale' ? '演示数据 A' : '演示数据 B'
    };
  }
  function validate(input) {
    const reasons = [];
    const names = input.groups.map(d => d.name);
    const missing = input.expected_names.filter(name => !names.includes(name));
    const extra = names.filter(name => !input.expected_names.includes(name));
    if (missing.length) reasons.push('缺少' + missing.join('、') + '。');
    if (extra.length) reasons.push('出现不在本例范围中的分组。');
    if (new Set(names).size !== names.length) reasons.push('同一分组重复出现。');
    const validNumber = n => Number.isFinite(n);
    const numbersValid = validNumber(input.before_total) && validNumber(input.after_total) &&
      input.groups.every(d => validNumber(d.before) && validNumber(d.after));
    const totalDelta = input.after_total - input.before_total;
    const sum = input.groups.reduce((n, d) => n + d.after - d.before, 0);
    if (!numbersValid) reasons.push('金额必须是有限数值，缺失或无效值不能按零处理。');
    if (!equalAmount(sum, totalDelta)) reasons.push('分组变化合计与整体变化不一致。');
    if (numbersValid && equalAmount(sum, totalDelta) &&
        (!equalAmount(input.groups.reduce((n, d) => n + d.before, 0), input.before_total) ||
         !equalAmount(input.groups.reduce((n, d) => n + d.after, 0), input.after_total))) {
      reasons.push('变化量虽一致，但两期分组金额没有分别对上整体。');
    }
    if (input.unit !== input.expected_unit) reasons.push('金额单位与本次定义不一致。');
    if (input.expected_data !== input.referenced_data) {
      reasons.push('应引用' + input.expected_data + '，当前却引用' + input.referenced_data + '。');
    }
    const allowNextStep = reasons.length === 0;
    return {
      allowNextStep,
      title: allowNextStep ? '交接条件通过：允许进入原因核查' : '暂停在贡献核对',
      calculation: input.groups.map(d => d.name + ' ' + signed(d.after - d.before)).join(' ＋ ') +
        ' ＝ ' + signed(sum) + ' ' + input.unit + '；整体变化为 ' + signed(totalDelta) + ' ' + input.unit + '。',
      reasons: allowNextStep ? ['分组完整，单位、两期金额及变化量一致，引用当前演示数据。'] : reasons,
      next: allowNextStep
        ? '下一步：核查原因证据。这不代表原因已证实，也不代表整篇报告已完成。'
        : missing.length ? '下一步：补齐' + missing.join('、') + '并重新对账；不能直接进入原因解释。'
          : '下一步：用当前演示数据重新计算并核对；旧结果不能沿用。'
    };
  }
  return {data, signed, makeCase, validate, evaluate: name => validate(makeCase(name))};
});
