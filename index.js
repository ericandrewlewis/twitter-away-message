const Twitter = require('twitter-lite');
const {
  randomGreeting,
  filterTweetsToReplyTo,
  replyToTweet,
  filterMessagesToReplyTo,
  replyToMessage,
} = require('./lib');
require('dotenv').config();

const tweetsRepliedTo = new Set();

const usersRepliedTo = new Set();

const startedAtTime = Date.now();

const client = new Twitter({
  subdomain: "api",
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

const selfTwitterUserIdStr = process.env.TWITTER_SELF_USER_ID;

const run = () => {
  client.get('statuses/mentions_timeline').then(tweets => {
    const tweetsToReplyTo = filterTweetsToReplyTo({
      tweets, selfTwitterUserIdStr, sinceTime: startedAtTime, tweetsRepliedTo, usersRepliedTo
    });
    tweetsToReplyTo.forEach(tweet => {
      replyToTweet({tweet, client, usersRepliedTo, tweetsRepliedTo});
    });
  });

  client.get('direct_messages/events/list')
    .then(data => {
      const messages = data.events;
      const messagesToReplyTo = filterMessagesToReplyTo({
        messages,
        selfTwitterUserIdStr,
        usersRepliedTo,
        sinceTime: startedAtTime
      });
      messagesToReplyTo.forEach(message => {
        replyToMessage({message, client, usersRepliedTo});
      });
    });
};

setInterval(run, 60000 /* every minute */);
run();
