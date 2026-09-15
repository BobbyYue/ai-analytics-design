(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReportCharts = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function contributionOption(width, c, dataset) {
    const rows = dataset.groups.concat([{name: '整体', before: dataset.before_total, after: dataset.after_total}]);
    const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
    return {
      animation: false, backgroundColor: c.paper,
      textStyle: {fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif", fontSize: 14, color: c.ink},
      grid: {left: width < 500 ? 80 : 92, right: 52, top: 24, bottom: 45},
      tooltip: {trigger: 'item', appendToBody: true, backgroundColor: c.paper, borderColor: c.rule,
        textStyle: {color: c.ink, fontSize: 14}, formatter: p => {
          const d = rows[p.dataIndex];
          return d.name + '（虚构数据）<br>前期：' + d.before + ' ' + dataset.unit + '<br>本期：' + d.after +
            ' ' + dataset.unit + '<br>变化：' + signed(d.after - d.before) + ' ' + dataset.unit;
        }},
      xAxis: {type: 'value', min: -120, max: 60, interval: 30,
        axisLine: {show: false}, axisTick: {show: false},
        axisLabel: {color: c.muted, fontSize: 14, formatter: signed},
        splitLine: {lineStyle: {color: c.rule, type: 'dashed'}}},
      yAxis: {type: 'category', inverse: true, data: rows.map(d => d.name),
        axisLine: {show: false}, axisTick: {show: false}, axisLabel: {color: c.ink, fontSize: 14, margin: 12}},
      series: [{type: 'bar', barWidth: 30,
        data: rows.map((d, i) => ({value: d.after - d.before,
          itemStyle: {color: i === rows.length - 1 ? c.ink : d.after < d.before ? c.accent2 : c.accent}})),
        label: {show: true, position: 'right', distance: 7, color: c.ink, fontSize: 15, formatter: p => signed(p.value)},
        markLine: {silent: true, symbol: ['none', 'none'], label: {show: false},
          lineStyle: {color: c.ink, type: 'solid', width: 1.2}, data: [{xAxis: 0}]}
      }]
    };
  }
  return {contributionOption};
});
