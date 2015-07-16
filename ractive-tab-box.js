(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  factory((global.RactiveTabBox = {}))
}(this, function (exports) { 'use strict';

  "use strict";

  /* global Ractive */

  // TODO: draggable tab arrangement

  var template = "<div class=\"ractive-tab-box\">\n  <div class=\"rtb-tabs{{#if ~/fillWidth}} fill-width{{/if}}\">\n    {{#tabs:i}}\n      <div class=\"rtb-tab{{#current === i}} selected{{/}}\" on-click=\"changeTab(i)\">\n        <div>{{>~/tab(i, 'title')}}</div>{{#.closable}} <button on-click=\"closeTab(i)\" />{{/}}\n      </div>\n    {{/}}\n  </div>\n  <div class=\"rtb-contents\">\n    {{#tabs:i}}\n      <div style=\"{{#current !== i}}position: absolute; left: -10000px; top: -10000px; height: 100%;{{/}}\" {{#.class}}class=\"{{.class}}\"{{/}}>{{>~/tab(i)}}</div>\n    {{/}}\n  </div>\n</div>";

  // get the {content,title} of a tab
  function tab(index, part) {
    if (part === undefined) part = "content";

    var tb = this.get("tabs")[index];

    if (!tb) {
      return "missing";
    }var key = part + "-" + tb.id;
    if (key in this.partials) {
      return key;
    }this.partials[key] = tb[part] || "Tab " + index;

    return key;
  }

  var TabBox = Ractive.extend({
    template: template,
    onconstruct: function onconstruct(opts) {
      var tabs = opts.data.tabs = [];

      // read tabs from content
      var content = opts.partials.content,
          c;
      if (content) {
        for (var i = 0; i < content.length && (c = content[i]); i++) {
          if (c.e === "Tab") {
            c.a = c.a || {};
            var _tab = {};

            for (var k in c.a) {
              _tab[k] = c.a[k];
            }_tab.closable = !!c.a.closable && !!c.a.closable.toString().match(/^t/i);
            _tab.content = c.f;
            _tab.id = getId();
            tabs.push(_tab);
          }
        }
      }

      // set current to the first tab
      opts.data.current = 0;
    },
    data: function data() {
      return {
        tab: tab, fillWidth: false
      };
    },

    partials: { missing: "" },

    // switch tabs by index
    changeTab: function changeTab(index) {
      return this.set("current", index);
    },

    // close tab by index
    closeTab: function closeTab(index) {
      var me = this,
          tab = me.get("tabs")[index];

      if (tab !== undefined) {
        var id = tab.id;
        if (typeof tab.onClose === "function" && tab.onClose.call(this) || typeof tab.onClose !== "function") {
          delete this.partials["title-" + id];
          delete this.partials["content-" + id];
          return me.splice("tabs", index, 1).then(function () {
            return me.set("current", index > 0 ? index - 1 : 0);
          });
        }
      }
    },

    // add a tab to the end
    appendTab: function appendTab(options) {
      this.insertTab(-1, options);
    },

    // add a tab at index
    insertTab: function insertTab(index, options) {
      var me = this,
          tabs = this.get("tabs");
      if (index < 0) index = tabs.length;
      options.id = getId();
      return me.splice("tabs", index, 0, options).then(function () {
        return me.set("current", index);
      });
    },

    // reset tab content
    resetTab: function resetTab(index, content) {
      var tab = this.get("tabs")[index];

      if (tab) {
        return me.resetPartial("content-" + tab.id, content);
      }
    },

    // reset tab title
    resetTitle: function resetTitle(index, title) {
      var tab = this.get("tabs")[index];

      if (tab) {
        return me.resetPartial("title-" + tab.id, title);
      }
    }
  });

  // module level tab ids
  var getId = (function () {
    var i = 0;
    return function getId() {
      return i++;
    };
  })();

  var _index = TabBox;

  exports['default'] = _index;

}));
//# sourceMappingURL=ractive-tab-box.js.map
