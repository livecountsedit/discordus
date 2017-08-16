var Disqus = require('disqus'),
  request = require('request')

var Discordus = function (config) {
  this.config = config
  this.forums = config.disqus.forums.split(',')
  this.hooks = config.discord.webhook.split(',')
  this.disqus = new Disqus(config.disqus.authentication)
  this.lastChecked = new Date()
}

Discordus.prototype.start = function () {
  var milliseconds = this.config.interval * 1000
  this.interval = setInterval(this.checkAll.bind(this), milliseconds)
  this.checkAll()
}

Discordus.prototype.stop = function () {
  clearInterval(this.interval)
}

Discordus.prototype.checkAll = function () {
  this.forums.forEach(this.checkForum, this)
}

Discordus.prototype.checkForum = function (forum) {
  var options = this.config.disqus.options || {}
  options.limit = this.config.disqus.limit
  options.forum = forum
  options.related = 'thread'

  var callback = this.checkComments.bind(this, forum)
  this.disqus.request('posts/list', options, callback)
}

Discordus.prototype.checkComments = function (forum, data) {
  var response

  if (data.error) {
    response = JSON.parse(data.error.body).response
    return console.log('[' + forum + '] Something went wrong: ' + response)
  } else {
    response = JSON.parse(data).response
  }

  if (!response.length) {
    return console.log('[' + forum + '] No comments found.')
  }

  // The creation time of the most recent comment.
  var lastCommentTime
  // Make an array of comments
  var allComments = []

  var i
  for (i = 0; i < response.length; i++) {
    var commentTime = new Date(response[i].createdAt)

    if (commentTime > this.lastChecked) {
      allComments.push(this.buildMessage(response[i]))

      if (!lastCommentTime) {
        lastCommentTime = commentTime
      }
    }
  }

  if (allComments.length > 0) {
    this.sendMessage(allComments, forum)
  }

  if (lastCommentTime) {
    this.lastChecked = lastCommentTime
  }
}

Discordus.prototype.buildMessage = function (comment) {
  var url = comment.thread.link + '#comment-' + comment.id

  var message = {
    title: comment.thread.title,
    description: comment.raw_message,
    url: url,
    timestamp: comment.createdAt,
    author: {
      name: comment.author.name,
      url: comment.author.profileUrl,
      icon_url: comment.author.avatar.permalink.replace('http:', 'https:')
    }
  }

  return message
}

Discordus.prototype.sendMessage = function (messages, forum) {
  this.hooks.forEach(function (hook) {
    var options = {
      url: hook,
      method: 'POST',
      json: {
        embeds: messages
      }
    }

    request(options, function (error, response, body) {
      if (error) {
        return console.log('[' + forum + '] Something went wrong: ' + error)
      }
      console.log('[' + forum + '] New Disqus comment! Message sent to Discord.')
    })
  }, this)
}

module.exports = Discordus
