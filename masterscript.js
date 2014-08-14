// ==UserScript==
// @name        TDWTF - Userscript masterscript
// @namespace   TDWTF
// @match		http://what.thedailywtf.com/*
// @description Unifies various userscripts designed for what.thedailywtf.com and adds a menu to manage them. WARNING: Uses cookies. If you're bothered by it, well, tough tits.
// @version     1
// ==/UserScript==

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

// Templates
menu = '<section class="d-dropdown" id="tdwtf-manager-dropdown" style="display: none;">\
      			<ul>\
					<li>\
						<a href="#" data-userscript="raw" class="tdwtf-manager-toggle">\
							<p style="margin: 0;"><i class="fa fa-check-circle"></i> Show raw </p>\
						</a>\
					</li>\
					<li>\
						<a href="#" data-userscript="userstats" class="tdwtf-manager-toggle">\
							<p style="margin: 0;"><i class="fa fa-check-circle"></i> Show userstats </p>\
						</a>\
					</li>\
        		</ul>\
			</section>';

function tdwtfShowMenu(e) {
	e.preventDefault();
	$(this).append(menu);
}

function getRawPost(e)
{

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
        Ember.run.scheduleOnce('afterRender', this, this.insertManagementMenu);
		Ember.run.scheduleOnce('afterRender', this, this.insertRawButton);
		Ember.run.scheduleOnce('afterRender', this, this.insertUserStats);
    },
    insertManagementMenu: function () {
		if($('.tdwtf-manager-menu').length == 0) {
			
			$('	<li class="tdwtf-manager-menu"></li>').insertBefore('li.notifications');
			$('div.panel.clearfix').append(menu);
			
			$('.tdwtf-manager-toggle').each(function() {
				var targetScript = $(this).data('userscript');
				var scriptOn = getCookie(targetScript);
				
				if(scriptOn == 'false') {
					$(this).find('i').removeClass('fa-check-circle').addClass('fa-circle');
				}
			});
			
			$('.tdwtf-manager-menu').append('<a class="icon tdwtf-manager-menuicon" href="#" title="TDWTF userscripts manager">\
						<i class="fa fa-cogs tdwtf-manager-icon"></i>\
					</a>').on('click', function(e)
					{
						e.preventDefault();
						$(this).toggleClass('active');
						$('#tdwtf-manager-dropdown').toggle();
					});
			
			$('.tdwtf-manager-toggle').on('click', function(e) {
				e.preventDefault();
				
				var menuItem = $(this).find('.fa');
				
				menuItem.toggleClass('fa-circle').toggleClass('fa-check-circle');
				
				if(menuItem.hasClass('fa-check-circle')) {
					var targetScript = menuItem.closest('a').data('userscript');
					document.cookie = targetScript + "=true";
				}
				else
				{
					var targetScript = menuItem.closest('a').data('userscript');
					document.cookie = targetScript + "=false";
				}
			})
		}
		
		$('body').on('click', function(e) 
		{
			if($(e.target).attr('class')) {
				if( $(e.target).attr('class').indexOf('tdwtf-manager') == -1 ) {
					$('#tdwtf-manager-dropdown').hide(); 
					$('.tdwtf-manager-menu').removeClass('active');
				}
			}
		});
    },
	insertRawButton: function () {},
	insertUserStats: function () {}
});

Discourse.View.reopen({
    insertRawButton: function () {
		var rawCookie = getCookie('raw');
		
		if(rawCookie == 'true') {
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
    },
	insertUserStats: function () {
		var statsCookie = getCookie('userstats');
		
		if(statsCookie == 'true')
		{
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
    }
});
