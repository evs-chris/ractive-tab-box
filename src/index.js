/* global Ractive */

// TODO: draggable tab arrangement

var template = `<div class="ractive-tab-box">
  <div class="rtb-tabs{{#if ~/fillWidth}} fill-width{{/if}}">
    {{#tabs:i}}
      <div class="rtb-tab{{#current === i}} selected{{/}}" on-click="changeTab(i)">
        <div>{{>~/tab(i, 'title')}}</div>{{#.closable}} <button on-click="closeTab(i)" />{{/}}
      </div>
    {{/}}
  </div>
  <div class="rtb-contents">
    {{#tabs:i}}
      <div style="{{#current !== i}}position: absolute; left: -10000px; top: -10000px; height: 100%;{{/}}" {{#.class}}class="{{.class}}"{{/}}>{{>~/tab(i)}}</div>
    {{/}}
  </div>
</div>`;

// get the {content,title} of a tab
function tab(index, part) {
  if (part === undefined) part = 'content';

  let tb = this.get('tabs')[index];

  if (!tb) return 'missing';

  var key = part + '-' + tb.id;
  if (key in this.partials) return key;

  this.partials[key] = tb[part] || 'Tab ' + index;

  return key;
}

var TabBox = Ractive.extend({
  template: template,
  onconstruct(opts) {
    var tabs = opts.data.tabs = [];

    // read tabs from content
    var content = opts.partials.content, c;
    if (content) {
      for (var i = 0; i < content.length && (c = content[i]); i++) {
        if (c.e === 'Tab') {
          c.a = c.a || {};
          let tab = {};

          for (let k in c.a) tab[k] = c.a[k];

          tab.closable = !!c.a.closable && !!c.a.closable.toString().match(/^t/i);
          tab.content = c.f;
          tab.id = getId();
          tabs.push(tab);
        }
      }
    }

    // set current to the first tab
    opts.data.current = 0;
  },
  data() {
    return {
      tab, fillWidth: false
    };
  },

  partials: { 'missing': '' },

  // switch tabs by index
  changeTab(index) {
    return this.set('current', index);
  },

  // close tab by index
  closeTab(index) {
    var me = this, tab = me.get('tabs')[index];

    if (tab !== undefined) {
      var id = tab.id;
      if ((typeof tab.onClose === 'function' && tab.onClose.call(this)) || typeof tab.onClose !== 'function') {
        delete this.partials['title-' + id];
        delete this.partials['content-' + id];
        return me.splice('tabs', index, 1).then(() => me.set('current', index > 0 ? index - 1 : 0));
      }
    }
  },

  // add a tab to the end
  appendTab(options) {
    this.insertTab(-1, options);
  },

  // add a tab at index
  insertTab(index, options) {
    var me = this, tabs = this.get('tabs');
    if (index < 0) index = tabs.length;
    options.id = getId();
    return me.splice('tabs', index, 0, options).then(() => me.set('current', index));
  },

  // reset tab content
  resetTab(index, content) {
    var tab = this.get('tabs')[index];

    if (tab) {
      return me.resetPartial('content-' + tab.id, content);
    }
  },

  // reset tab title
  resetTitle(index, title) {
    var tab = this.get('tabs')[index];

    if (tab) {
      return me.resetPartial('title-' + tab.id, title);
    }
  }
});

// module level tab ids
var getId = (function() {
  var i = 0;
  return function getId() {
    return i++;
  };
})();

export default TabBox;
