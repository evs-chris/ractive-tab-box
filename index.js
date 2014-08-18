var Ractive = require('Ractive');

function buildTabs(tabs) {
  var tpl = [];
  for (var i = 0; i < tabs.length; i++) {
    var cnt = tabs[i].content;
    if (typeof cnt === 'string') {
      tabs[i].content = { t: Ractive.parse(cnt).t };
      cnt = tabs[i].content.t;
    } else if (!!cnt.t) {
      cnt = cnt.t;
    } else {
      cnt = cnt || [];
    }
    delete cnt[0].a.title;
    cnt[0].a.style = [{ t: 4, x: { r: ['.currentIndex'], s: '${0}!==' + i }, f: ['display: none'] }];
    tpl.push(cnt[0]);
  }
  return tpl;
}

var TabBox = Ractive.extend({
  template: '<div class="ractive-tab-box"><div class="rtb-headers">{{#.tabs:i}}<div class="rtb-header{{#(currentIndex === i)}} selected{{/}}" on-click="tabChanged:{{i}}">{{.title}}{{#.closable}}<button on-click="closeTab:{{i}}"></button>{{/}}</div>{{/}}</div><div class="rtb-contents">{{#rendered}}{{>tabs}}{{/}}</div></div>',
  beforeInit: function(opts) {
    opts.data.rendered = false;
  },
  init: function() {
    var me = this;
    var content = me.partials.content;
    var tabs = [], count = 0;
    for (var i = 0; i < content.length; i++) {
      if (typeof content[i] === 'string') continue;
      count++;
      var attrs = content[i].a || {};
      tabs.push({ title: (attrs.title || 'Tab ' + count), content: [content[i]], closable: attrs.closable === undefined ? false : attrs.closable });
    }

    me.on('tabChanged', function(e, i) {
      me.set('currentIndex', i);
    });

    me.on('closeTab', function(e, i) {
      me.removeTab(i);
    });

    me.partials.tabs = buildTabs(tabs);
    me.set({
      tabs: tabs,
      currentIndex: 0
    });

    me.observe('tabs.*.content', function(old, val, path) {
      me.set('rendered', false).then(function() {
        me.partials.tabs = buildTabs(me.get('tabs'));
        me.set('rendered', true);
      });
    });
  },
  appendTab: function(title, content) {
    this.get('tabs').push(arguments.length === 1 ? title : { title: title, content: content });
  },
  insertTab: function(index, title, content) {
    this.get('tabs').splice(index, 0, arguments.length === 2 ? title : { title: title, content: content });
  },
  removeTab: function(index) {
    var tabs = this.get('tabs');
    if (index === undefined || index === null) index = tabs.length - 1;
    var t = tabs[index];
    var me = this;
    if (!!!t) return;
    if (!!t.onClose && typeof t.onClose === 'function') {
      var res = t.onClose.call(this, index, t);
      if (typeof res === 'boolean' && res) me.killTab(index);
      else if (!!res && typeof res.then === 'function') res.then(function() { me.killTab(index); });
    } else {
      me.killTab(index);
    }
  },
  killTab: function(index) {
    var tabs = this.get('tabs');
    if (index === undefined || index === null) index = tabs.length - 1;
    if (!!tabs[index]) {
      tabs.splice(index, 1);
      var ci = this.get('currentIndex');
      if (ci === index) this.set('currentIndex', index > 0 ? index - 1 : 0);
      else if (ci > index) this.set('currentIndex', ci - 1);
    }
  }
});

module.exports = TabBox;
