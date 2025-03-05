var Disqus = require('disqus'),
  request = require('request');

var Discordus = function (config) {
  this.config = config;
  this.forums = config.disqus.forums.split(',');
  this.hooks = config.discord.webhook.split(',');
  this.disqus = new Disqus(config.disqus.authentication);
  this.lastChecked = (new Date()).setHours((new Date()).getHours() - 2);
};

Discordus.prototype.start = function () {
  var milliseconds = this.config.interval * 1000;
  this.interval = setInterval(this.checkAll.bind(this), milliseconds);
  this.checkAll();
};

Discordus.prototype.stop = function () {
  clearInterval(this.interval);
};

Discordus.prototype.checkAll = function () {
  this.forums.forEach(this.checkForum, this);
};

Discordus.prototype.checkForum = function (forum) {
  var options = this.config.disqus.options || {};
  options.limit = this.config.disqus.limit;
  options.forum = forum;
  options.related = 'thread';

  var callback = this.checkComments.bind(this, forum);
  this.disqus.request('posts/list', options, callback);
};

Discordus.prototype.checkComments = function (forum, data) {
  var response;

  if (data.error) {
    response = JSON.parse(data.error.body).response;
    return console.log('[' + forum + '] Something went wrong: ' + response);
  } else {
    response = JSON.parse(data).response;
  }

  if (!response.length) {
    return console.log('[' + forum + '] No comments found.');
  }

  var lastCommentTime;
  var allComments = [];

  for (var i = 0; i < response.length; i++) {
    var commentTime = new Date(response[i].createdAt);

    if (commentTime > this.lastChecked) {
      allComments.push(this.buildMessage(response[i]));

      if (!lastCommentTime) {
        lastCommentTime = commentTime;
      }
    }
  }

  if (allComments.length > 0) {
    this.sendMessage(allComments, forum);
  }

  if (lastCommentTime) {
    this.lastChecked = lastCommentTime;
  }
};

Discordus.prototype.buildMessage = function (comment) {
  var url = comment.thread.link + '#comment-' + comment.id;

  // Prepare message
  var message = {
    title: comment.thread.title,
    description: comment.raw_message,
    url: url,
    timestamp: comment.createdAt,
    author: {
      name: comment.author.name,
      url: comment.author.profileUrl,
      icon_url: comment.author.avatar.permalink.replace('http:', 'https:')
    },
    color: 7506394, // Set a custom color for the embed (e.g., a shade of blue)
  };

  // Include parent comment details if this comment is a reply
  if (comment.parent) {
    this.disqus.request('posts/details', { post: comment.parent }, (data, err) => {
      data = JSON.parse(data);
      if (data.code != 0) {
        console.log('[' + comment.thread.forum + '] Error fetching parent comment: ' + data.error.message);
        return;
      }
      var parentComment = data.response;
      message.description = `**In reply to:** ${parentComment.raw_message}\n\n` + message.description;

      // Include parent author details in the message
      message.author = {
        name: parentComment.author.name,
        url: parentComment.author.profileUrl,
        icon_url: parentComment.author.avatar.permalink.replace('http:', 'https:')
      };
    });
  }

  return message;
};

Discordus.prototype.sendMessage = function (comments, forum) {
  comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let messageCount = 0;
  const maxMessagesPerMinute = 30;
  const interval = 60000 / maxMessagesPerMinute;

  const sendNextMessage = () => {
    if (comments.length === 0) {
      return;
    }

    const comment = comments.shift();
    this.hooks.forEach(function (hook) {
      const message = {
        embeds: [comment]
      };
      request.post({
        url: hook,
        json: message
      }, function (err, res) {
        if (err) {
          return console.log('[' + forum + '] Error sending message: ' + err);
        }
        if (res.statusCode !== 204) {
          console.log('[' + forum + '] Error sending message:');
          console.log(res.body);
        }
      });
    });

    messageCount++;
    if (messageCount < maxMessagesPerMinute) {
      setTimeout(sendNextMessage, interval);
    } else {
      console.log('Rate limit reached, pausing for a minute.');
      setTimeout(() => {
        messageCount = 0;
        sendNextMessage();
      }, 60000);
    }
  };

  sendNextMessage();
};

module.exports = Discordus;
