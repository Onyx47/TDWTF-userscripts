// ==UserScript==
// @name        TDWTF - Show user stats
// @match		http://what.thedailywtf.com/*
// @namespace   TDWTF
// @description Shows post count and unique badge count for users below their avatar
// @version     1
// ==/UserScript==
Ember.View.reopen({
    didInsertElement: function () {
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.insertUserStats);
    },
    insertUserStats: function () {
    }
});
Discourse.View.reopen({
    insertUserStats: function () {
        // This thing triggers for any render, so we check if a post has been rendered
        if (this.post) {
            // Get post ID
            var postID = this.post.post_number;
            // Get user name
            var username = this.post.username;
            // Initialize count variables
            var postCount = 0;
            var badgeCount = 0;
            var userDataJsonUrl = 'http://what.thedailywtf.com/users/' + username + '.json';
            $.get(userDataJsonUrl) .done(function (data) {
                if (data.user) {
                    badgeCount = data.user.badge_count;
                    for (var i in data.user.stats) {
                        if (data.user.stats.hasOwnProperty(i)) {
                            // Security through obscurity!
                            if (data.user.stats[i].action_type === 5) {
                                postCount = data.user.stats[i].count;
                            }
                        }
                    }
                    $('.tdwtf-post-count[data-username="' + data.user.username + '"]') .html(postCount);
                    $('.tdwtf-badge-count[data-username="' + data.user.username + '"]') .html(badgeCount);
                }
            });
            // Find avatar area for the post
            var avatarArea = $('article[id="post_' + postID + '"]') .children('.row') .children('.topic-avatar');
            // Check if the container has already been appended
            if (avatarArea.children('.tdwtf-user-stats') .length == 0) {
                // Append stats elements
                avatarArea.append('<span class="tdwtf-user-stats" data-username="' + username + '" style="font: normal normal 400 10px Arial; color: #A7A7A7;"><i class="fa fa-envelope"></i>&nbsp;<span class="tdwtf-post-count" data-username="' + username + '">' + postCount + '</span><br><i class="fa fa-certificate"></i>&nbsp;<span class="tdwtf-badge-count" data-username="' + username + '">' + badgeCount + '</span>');
            }
        }
    }
});

