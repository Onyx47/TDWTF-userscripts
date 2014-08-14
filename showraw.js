// ==UserScript==
// @name        TDWTF - Show raw button
// @namespace   TDWTF
// @match		http://what.thedailywtf.com/*
// @description Shows raw form of the post
// @version     1
// ==/UserScript==

function getRawPost(e)
{
	console.log('ping?');
    var topicID = e.data.topicID;
    var postID = e.data.postID;
    var callingButton = $(e.target);

    // Fuck your inconsistency Discourse! Why don't post numbers match??? Now I have to do this shit...
    var postArea = $('button[data-post-number="' + postID + '"][data-action="share"]') .closest('.contents');

    callingButton.toggleClass('active');

    if (callingButton.hasClass('active'))
    {
        //Prettify
        callingButton.css({backgroundColor: '#08C', color: '#FFF'});

        if (postArea.children('.tdwtf-raw-area') .length == 0 || postArea.children('.tdwtf-raw-area') .html() == '')
        {
            $.get('/raw/' + topicID + '/' + postID) .done(function (content) {
                if (postArea.children('.tdwtf-raw-area') .length == 0)
                {
                    postArea.children('.cooked') .after('<pre class="tdwtf-raw-area"></pre>');
                    postArea.children('.cooked') .hide();
                }
                postArea.children('.tdwtf-raw-area').css("white-space", "pre-wrap") .text(content);
                //postArea.children('.tdwtf-raw-area') .html(postArea.children('.tdwtf-raw-area') .text() .replace(/\n/g, '<br>'));
            });
        } 
        else
        {
            postArea.children('.cooked') .hide();
            postArea.children('.tdwtf-raw-area') .show();
        }
    } 
    else
    {
        //Unprettify :(
        callingButton.css({backgroundColor: 'transparent', color: '#A7A7A7'});

        postArea.children('.cooked') .show();
        postArea.children('.tdwtf-raw-area') .hide();
    }
}
Ember.View.reopen({
    didInsertElement: function () {
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.insertRawButton);
    },
    insertRawButton: function () {
    }
});
Discourse.View.reopen({
    insertRawButton: function () {
        // This thing triggers for any render, so we check if a post has been rendered
        if (this.post) {
            // Get post ID
            var postID = this.post.post_number;
            // Get topic ID
            var topicID = this.post.topic_id;
            // Find action area for the post
            var actionArea = $('button[data-post-number="' + postID + '"][data-action="share"]') .parent('.actions');
            var postArea = actionArea.parents('div.contents') .children('.cooked') [0];
            // This triggers for every render, so we check for existence of the button
            if (actionArea.children('.tdwtf-view-raw') .length == 0) {
                // Add the button!
                actionArea.prepend('<button title="view raw post" class="tdwtf-view-raw" data-post-id="' + postID + '"><i class="fa fa-code"></i>&nbsp;#' + topicID + ':' + postID + '</button>') .children('.tdwtf-view-raw') .on('click', {
                    topicID: topicID,
                    postID: postID
                }, getRawPost);
            }
        }
    }
});
