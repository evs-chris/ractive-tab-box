(function () {

  'use strict';

  "use strict";
  
  /* global Ractive */
  
  // TODO: draggable tab arrangement
  
  var index__template = "<div class=\"ractive-tab-box\">\n  <div class=\"rtb-tabs\">\n    {{#tabs:i}}\n      <div class=\"rtb-tab{{#current === i}} selected{{/}}\" on-click=\"changeTab(i)\">\n        {{>~/tab(i, 'title')}}{{#.closable}} <button on-click=\"closeTab(i)\" />{{/}}\n      </div>\n    {{/}}\n  </div>\n  <div class=\"rtb-contents\">\n    {{#tabs:i}}\n      <div style=\"{{#current !== i}}display: none;{{/}}\">{{>~/tab(i)}}</div>\n    {{/}}\n  </div>\n</div>";
  
  var index__TabBox = Ractive.extend({
    template: index__template,
    onconstruct: function (opts) {
      var tabs = opts.data.tabs = [];
  
      // read tabs from content
      var content = opts.partials.content, c;
      if (content) {
        for (var i = 0; i < content.length && (c = content[i]); i++) {
          if (c.e === "Tab") {
            c.a = c.a || {};
            tabs.push({
              title: c.a.title,
              closable: !!c.a.closable && !!c.a.closable.toString().match(/^t/i),
              content: c.f,
              id: index__getId()
            });
          }
        }
      }
  
      // set current to the first tab
      opts.data.current = 0;
    },
    data: {
      // get the {content,title} of a tab
      tab: function (index, part) {
        if (part === undefined) part = "content";
  
        var tab = this.get("tabs")[index];
  
        if (!tab) return "missing";
  
        var key = part + "-" + tab.id;
        if (key in this.partials) return key;
  
        this.partials[key] = tab[part] || "Tab " + index;
  
        return key;
      } },
  
    partials: { missing: "" },
  
    // switch tabs by index
    changeTab: function (index) {
      return this.set("current", index);
    },
  
    // close tab by index
    closeTab: function (index) {
      var me = this, tab = me.get("tabs")[index];
  
      if (tab !== undefined) {
        var id = tab.id;
        if ((typeof tab.onClose === "function" && tab.onClose.call(this)) || typeof tab.onClose !== "function") {
          delete this.partials["title-" + id];
          delete this.partials["content-" + id];
          return me.splice("tabs", index, 1).then(function () {
            return me.set("current", index > 0 ? index - 1 : 0);
          });
        }
      }
    },
  
    // add a tab to the end
    appendTab: function (options) {
      this.insertTab(-1, options);
    },
  
    // add a tab at index
    insertTab: function (index, options) {
      var me = this, tabs = this.get("tabs");
      if (index < 0) index = tabs.length;
      options.id = index__getId();
      return me.splice("tabs", index, 0, options).then(function () {
        return me.set("current", index);
      });
    },
  
    // reset tab content
    resetTab: function (index, content) {
      var tab = this.get("tabs")[index];
  
      if (tab) {
        return me.resetPartial("content-" + tab.id, content);
      }
    },
  
    // reset tab title
    resetTitle: function (index, title) {
      var tab = this.get("tabs")[index];
  
      if (tab) {
        return me.resetPartial("title-" + tab.id, title);
      }
    }
  });
  
  // module level tab ids
  var index__getId = (function () {
    var i = 0;
    return function getId() {
      return i++;
    };
  })();
  
  var index__default = index__TabBox;
  //# sourceMappingURL=01-_6to5-index.js.map

  exports.default = index__default;

}).call(global);
//# sourceMappingURL=./index.js.map