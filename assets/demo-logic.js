// Independent demonstration of revenue reconciliation. Generic aliases and
// fictional amounts; not production code or a full analysis workflow.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TeachingDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const data = {
    metric: '广告收入（通用代称）', unit: '万元', before_total: 800, after_total: 740,
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
  const movement = (value, unit) => Number.isFinite(value)
    ? value === 0 ? '没有变化' : (value < 0 ? '减少 ' : '增加 ') + Math.abs(Number(value.toFixed(8))) + ' ' + unit
    : '金额无效，无法比较';
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
      expected_data: '本次取数记录', referenced_data: name === 'stale' ? '上次取数记录' : '本次取数记录',
      // Fictional context for the visible explanation, not a check of real query dates.
      expected_comparison: '第4周对比第3周',
      referenced_comparison: name === 'stale' ? '第2周对比第1周' : '第4周对比第3周'
    };
  }
  function validate(input) {
    const reasons = [];
    const differentComparison = Boolean(input.expected_comparison && input.referenced_comparison &&
      input.expected_comparison !== input.referenced_comparison);
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
    if (!equalAmount(sum, totalDelta)) reasons.push('各客户收入变化相加，与整体变化不一致。');
    if (numbersValid && equalAmount(sum, totalDelta) &&
        (!equalAmount(input.groups.reduce((n, d) => n + d.before, 0), input.before_total) ||
         !equalAmount(input.groups.reduce((n, d) => n + d.after, 0), input.after_total))) {
      reasons.push('变化量虽然对得上，但两期各客户的收入分别相加，并没有对上各期总收入。');
    }
    if (input.unit !== input.expected_unit) reasons.push('金额单位与本次定义不一致。');
    if (input.expected_data !== input.referenced_data) {
      reasons.push(differentComparison
        ? '本次要解释“' + input.expected_comparison + '”的变化，这份明细却比较“' + input.referenced_comparison + '”。'
        : '应引用' + input.expected_data + '，当前却引用' + input.referenced_data + '。');
      if (differentComparison) reasons.push('金额相同不代表原因相同：另一段时间的客户变化，不能直接用来解释本次下降。');
    }
    const allowNextStep = reasons.length === 0;
    return {
      allowNextStep,
      title: allowNextStep ? '可以继续：进入原因核查'
        : missing.length ? '先暂停：客户名单不完整'
          : input.expected_data !== input.referenced_data
            ? differentComparison ? '先暂停：比较的周次不对' : '先暂停：引用的不是本次数据'
            : '先暂停：这份拆解还未通过检查',
      calculation: '本次整体收入' + movement(totalDelta, input.unit) + '；这份客户明细合计' + movement(sum, input.unit) + '。',
      reasons: allowNextStep ? ['客户齐全、单位一致，两期金额和变化量都能对上，数据也标记为本次取数。'] : reasons,
      next: allowNextStep
        ? 'AI 下一步：围绕已定位的对象核查原因。这些检查通过，不代表原因已证实或报告已完成。'
        : missing.length ? 'AI 必须先补齐' + missing.join('、') + '，重新核对名单与金额；检查通过后，才能进入原因核查。'
          : input.expected_data !== input.referenced_data
            ? differentComparison
              ? 'AI 必须按“' + input.expected_comparison + '”取得客户明细，重新计算各客户的变化并核对后，再分析原因；不能只把旧结果的周次标签改掉。'
              : 'AI 必须使用本次数据重新计算并检查，不能只修改数据标签；此时还不能解释原因。'
            : 'AI 必须先修正上列问题并重新检查，此时还不能进入原因核查。'
    };
  }
  return {data, signed, makeCase, validate, evaluate: name => validate(makeCase(name))};
});
