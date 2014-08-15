// ==UserScript==
// @name        TDWTF - Remove post / likes heatmap
// @match		http://what.thedailywtf.com/*
// @namespace   TDWTF
// @description Removes the heatmap from the post count
// @version     1
// ==/UserScript==
Ember.View.reopen({
    didInsertElement: function () {
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.removePostHeatmap);
    },
    removePostHeatmap: function () {
    }
});
Discourse.View.reopen({
    removePostHeatmap: function () {
        $('td.num.posts').attr('class', 'num posts');
    }
});
