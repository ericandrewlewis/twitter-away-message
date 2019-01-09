const filterTweetsToReplyTo = options => {
  const { tweets, selfTwitterUserIdStr, sinceTime, tweetsRepliedTo, usersRepliedTo } = options;
  const tweetsToReplyTo = tweets.filter(tweet => {
    // Don't reply to yourself, this could lead to wild recursion.
    const tweetUserIdStr = tweet.user.id_str;
    if (tweetUserIdStr === selfTwitterUserIdStr) {
      return false;
    }

    // Just to be safe...don't reply to tweets that occurred before this script started.
    let tweetTime = new Date(tweet.created_at).getTime();
    if (tweetTime < sinceTime) {
      return false;
    }

    // Skip if the tweet has already been replied to.
    if (tweetsRepliedTo.has(tweet.id_str)) {
      return false;
    }

    // Skip the user if they have already been replied to.
    if (usersRepliedTo.has(tweetUserIdStr)) {
      return false;
    }
    return true;
  });
  return tweetsToReplyTo;
}

const greetings = ['hola', 'aloha', 'jambo'];
const randomGreeting = () => {
  const randomIndex = Math.floor(
    Math.random(
      greetings.length
    )
  );
  return greetings[randomIndex];
}


const replyToTweet = options => {
  const { tweet, client, tweetsRepliedTo, usersRepliedTo } = options;
  const tweetParams = {
    status: `@${tweet.user.screen_name} (away) ${randomGreeting()} - i am not on twitter for a bit! email me instead?`,
    in_reply_to_status_id: tweet.id_str
  }
  client.post('statuses/update', tweetParams).then(tweet => {
    console.log(tweet);  // Raw response object.
    tweetsRepliedTo.add(tweet.id_str);
    usersRepliedTo.add(tweet.user.id_str);
  });
}

const filterMessagesToReplyTo = options => {
  const {messages, selfTwitterUserIdStr, usersRepliedTo, sinceTime} = options;
  const filteredMessages = messages.filter(message => {
    // A direct message should be of this type...just in case it's of any other, bail.
    if (message.type !== 'message_create') {
      return false;
    }

    // Just to be safe...don't reply to messages that occurred before this script started.
    const messageTime = Number(message.created_timestamp);
    if (messageTime < sinceTime) {
      return false;
    }

    // Don't reply to yourself, this could lead to wild recursion.
    const messageSenderIdStr = message.message_create.sender_id;
    if (selfTwitterUserIdStr === messageSenderIdStr) {
      return false;
    }

    // Skip the user if they have already been replied to.
    if (usersRepliedTo.has(messageSenderIdStr)) {
      return false;
    }
    return true;
  });
  return filteredMessages;
}

const replyToMessage = options => {
  const {message, client, usersRepliedTo} = options;
  const messageParams = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: message.message_create.sender_id
        },
        message_data:  {
          text: `away -- ${randomGreeting()}, i am not on twitter for a bit. email me instead?`
        }
      }
    }
  };
  client.post('direct_messages/events/new', messageParams).then(response => {
    console.log(response);  // Raw response object.
    usersRepliedTo.add(message.message_create.sender_id);
  });
}

module.exports = {
  randomGreeting,
  filterTweetsToReplyTo,
  replyToTweet,
  filterMessagesToReplyTo,
  replyToMessage,
};