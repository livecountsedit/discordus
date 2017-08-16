var config = module.exports = {}
config.disqus = {}
config.discord = {}

// Number of seconds between each check (optional, default 60).
config.interval = process.env.DISCORDUS_INTERVAL

// The number of recent comments to check (optional, default 25, max 100).
config.disqus.limit = process.env.DISCORDUS_DISQUS_LIMIT

// Disqus forum to check, specified by its shortname (required).
// To check multiple forums, enter their shortnames separated by comma.
config.disqus.forums = process.env.DISCORDUS_DISQUS_FORUM

// Disqus authentication (required).
config.disqus.authentication = {
  api_secret: process.env.DISCORDUS_DISQUS_API_SECRET,
  api_key: process.env.DISCORDUS_DISQUS_API_KEY,
  access_token: process.env.DISCORDUS_DISQUS_ACCESS_TOKEN
}

// URL of your Discord Incoming WebHook (required).
// To post to multiple Discord channels, enter the webhook URLs seperated by comma.
config.discord.webhook = process.env.DISCORDUS_DISCORD_WEBHOOK

// Additional options for API requests to Disqus (optional).
// See https://disqus.com/api/docs/posts/list/.
config.disqus.options = {}
