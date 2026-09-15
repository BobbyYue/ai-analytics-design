(function () {
  'use strict';
  if (!window.echarts || !window.ReportCharts || !window.TeachingDemo) return;
  const style = getComputedStyle(document.documentElement);
  const colors = Object.fromEntries(['paper', 'ink', 'muted', 'rule', 'accent', 'accent2']
    .map(key => [key, style.getPropertyValue('--' + key).trim()]));
  const element = document.getElementById('contribution-chart');
  const wrap = document.getElementById('contribution-wrap');
  if (!element || !wrap) return;
  const containers = [];
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') containers.push(parent);
  }
  let chart;
  function render() {
    if (containers.some(parent => !parent.open)) return;
    try {
      wrap.classList.add('live');
      if (element.clientWidth <= 0) {wrap.classList.remove('live'); return;}
      if (!chart) chart = echarts.init(element, null, {renderer: 'svg'});
      else chart.resize();
      chart.setOption(ReportCharts.contributionOption(element.clientWidth, colors, TeachingDemo.data));
    } catch (error) {
      if (chart) chart.dispose();
      chart = undefined;
      wrap.classList.remove('live');
    }
  }
  let frame;
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  }
  containers.forEach(parent => parent.addEventListener('toggle', schedule));
  window.addEventListener('resize', schedule);
  render();
})();
