# Discordus
> Based on [Slackus by Jonathan Wiesel](https://github.com/jonathanwiesel/slackus) and the [fork by Richard Pearson](https://github.com/catdevnull/slackus)

***

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

This simple application monitors a Disqus forum (website) and sends a
notification to a Discord channel when a new comment is made in said forum.
Can be easily deployed to Heroku.

To configure the application, either edit config.js or set the following
environment variables:

```
DISCORDUS_DISQUS_API_KEY=[your api key]
DISCORDUS_DISQUS_API_SECRET=[your api secret]
DISCORDUS_DISQUS_ACCESS_TOKEN=[your access token]
DISCORDUS_DISQUS_FORUM=[your forum's shortname]
DISCORDUS_DISCORD_WEBHOOK=[your incoming webhook's url]
```

It's possible to check for comments on multiple forums simultaneously. To do so,
enter their shortnames as a comma seperated list, for example `cats,stuff`.

It's possible to post to multiple Discord webhooks simultaneously. To do so enter
their webhook URLS as a comma seperated list.

Your Disqus API key, secret and access token can be found by creating an
application on https://disqus.com/api/applications/.

Your Disqus forum's shortname can be found on the settings page for your site
(https://disqus.com/admin/, select your site under Settings).

Finally, you can set up an Incoming WebHook for Discord. Read more at
https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks.

Optional environment variables:
```
DISCORDUS_INTERVAL=60       # Seconds between each check (60 by default)
DISCORDUS_DISQUS_LIMIT=25   # Number of comments to check (25 by default, max 100)
```

The server will every X seconds (`DISCORDUS_INTERVAL`) request the X most recent
comments (`DISCORDUS_DISQUS_LIMIT`) to check for new ones. If your forum may
receive more than 25 new comments in a 60 second window, tweak those two
variables to your liking.

Some more configuration options for Disqus and Discord are available in config.js.


***

## Notes

This application was built using:
* [disqus](https://github.com/hay/node-disqus)
* [request](https://github.com/request/request)

***

## License

[http://nlr.mit-license.org/](http://nlr.mit-license.org/)
