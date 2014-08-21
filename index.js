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

function buildTitles(tabs) {
  var tpl = [];
  for (var i = 0; i < tabs.length; i++) {
    var cnt = tabs[i].title;
    if (typeof cnt === 'string') {
      tabs[i].title = { t: Ractive.parse(cnt).t };
      cnt = tabs[i].title.t;
    } else if (!!cnt.t) {
      cnt = cnt.t;
    } else {
      cnt = cnt || [];
    }
    var c = i;
    tpl.push({"t":7,"e":"div","a":{"class":["rtb-header",{"t":4,"x":{"r":["currentIndex"],"s":"${0}===" + c},"f":[" selected"]}]},"v":{"click":{"n":"tabChanged","a":[c]}},"f":cnt.concat({"t":4,"r":"tabs." + c + ".closable","f":[" ",{"t":7,"e":"button","v":{"click":{"n":"closeTab","a":[c]}}}]})});
  }
  return tpl;
}

var TabBox = Ractive.extend({
  template: '<div class="ractive-tab-box">{{#rendered}}<div class="rtb-headers">{{>titles}}</div><div class="rtb-contents">{{>tabs}}</div>{{/}}</div>',
  beforeInit: function(opts) {
    opts.data.rendered = false;
  },
  init: function() {
    var me = this;
    var content = me.partials.content;
    var tabs = [], count = 0, tmp;
    for (var i = 0; i < content.length; i++) {
      if (typeof content[i] === 'string') continue;
      count++;
      var attrs = content[i].a || {};
      if (typeof attrs.closable === 'string') {
        tmp = attrs.closable.toLowerCase();
        // yes or true
        attrs.closable = tmp.indexOf('y') === 0 || tmp.indexOf('t') === 0;
      }
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

    var rerender = function(old, val, path) {
      me.set('rendered', false).then(function() {
        me.partials.titles = buildTitles(me.get('tabs'));
        me.partials.tabs = buildTabs(me.get('tabs'));
        me.set('rendered', true);
      });
    };

    me.observe('tabs.*.content', rerender);
    me.observe('tabs.*.title', rerender);
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
