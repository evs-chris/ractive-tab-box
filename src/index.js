/* global Ractive */

// TODO: title, etc reset; functions for index/id adjustments; draggable tab arrangement

var template = `<div class="ractive-tab-box">
  <div class="rtb-tabs">
    {{#tabs}}
      <div class="rtb-tab{{#current === .id}} selected{{/}}" on-click="changeTab(.id)">
        {{>~/title(.id)}}{{#.closable}} <button on-click="closeTab(.id)" />{{/}}
      </div>
    {{/}}
  </div>
  <div class="rtb-contents">
    {{#tabs}}
      <div style="{{#current !== .id}}display: none;{{/}}">{{>~/tab(.id)}}</div>
    {{/}}
  </div>
</div>`;

var TabBox = Ractive.extend({
  template: template,
  onconstruct: function(opts) {
    var tabs = opts.data.tabs = [];

    // read tabs from content
    var content = opts.partials.content, c;
    if (content) {
      for (var i = 0; i < content.length && (c = content[i]); i++) {
        if (c.e === 'Tab') {
          c.a = c.a || {};
          tabs.push({
            title: c.a.title,
            closable: !!c.a.closable && !!c.a.closable.toString().match(/^t/i),
            content: c.f,
            id: getId()
          });
        }
      }
    }

    // set initial tab, if provided
    if (tabs.length > 0) opts.data.current = tabs[0].id;
  },
  data: {

    // get the title of a tab
    title: function(id) {
      var key = 'title-' + id;
      if (key in this.partials) return key;
      
      var {tab,index} = findTab(this.get('tabs'), id);

      if (tab) {
        this.partials[key] = tab.title || 'Tab ' + index;
      } 

      return key;
    },

    // get the content of a tab
    tab: function(id) {
      var key = 'tab-' + id;
      if (key in this.partials) return key;
      
      var {tab,index} = findTab(this.get('tabs'), id);

      if (tab) {
        this.partials[key] = tab.content;
      } 

      return key;
    }
  },

  // switch tabs by id
  changeTab: function(id) {
    return this.set('current', id);
  },

  // close tab by id
  closeTab: function(id) {
    var me = this, tabs = me.get('tabs'), {tab,index} = findTab(tabs, id);

    if (index !== undefined) {
      if ((typeof tab.onClose === 'function' && tab.onClose.call(this)) || typeof tab.onClose !== 'function') { 
        delete this.partials['title-' + id];
        delete this.partials['tab-' + id];
        return me.splice('tabs', index, 1).then(function() {
          return me.set('current', tabs[index > 0 ? index - 1 : 0].id);
        });
      }
    }
  },

  // add a tab to the end
  appendTab: function(options) {
    this.insertTab(-1, options);
  },

  // add a tab at index
  insertTab: function(index, options) {
    var me = this, tabs = this.get('tabs');
    if (index < 0) index = tabs.length;
    options.id = getId();
    return me.splice('tabs', index, 0, options).then(function() {
      return me.set('current', options.id);
    });
  },

  // reset tab content
  resetTab: function(index, content) {
    var me = this, tabs = me.get('tabs'), tab = tabs[index];

    if (tab) {
      return me.resetPartial('tab-' + tab.id, content);
    }
  }
});

function findTab(tabs, id) {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].id === id) return { tab: tabs[i], index: i };
  }
}

// module level tab ids
var getId = (function() {
  var i = 0;
  return function getId() {
    return i++;
  };
})();
