const { filterMessagesToReplyTo, filterTweetsToReplyTo } = require('./lib');

const createTestMessage = (options) => {
  const { recipient_id, sender_id, created_timestamp } = options;
  return {
    type: "message_create",
    id: "1081992109752836102",
    created_timestamp:  created_timestamp,
    message_create: {
      target: {recipient_id:  recipient_id},
      sender_id: sender_id,
      message_data: {
        text: "hey",
        entities: { hashtags: [], symbols: [], user_mentions: [], urls:[] }
      }
    }
  };
}

describe('filterMessagesToReplyTo', () => {
  test('doesn\'t include messages that are too old', () => {
    const messages = [
      createTestMessage({recipient_id: '1', sender_id: '2', created_timestamp: '10'}),
      createTestMessage({recipient_id: '2', sender_id: '1', created_timestamp: '5'}),
    ];
    const filteredMessages = filterMessagesToReplyTo({
      messages,
      selfTwitterUserIdStr: '2',
      usersRepliedTo: new Set(),
      sinceTime: 11
    });

    expect(filteredMessages.length).toBe(0);
  });

  test('includes messages that were sent after the sinceTime', () => {
    const messages = [
      createTestMessage({recipient_id: '1', sender_id: '2', created_timestamp: '10'}),
      createTestMessage({recipient_id: '2', sender_id: '1', created_timestamp: '5'}),
    ];
    const filteredMessages = filterMessagesToReplyTo({
      messages,
      selfTwitterUserIdStr: '2',
      usersRepliedTo: new Set(),
      sinceTime: 6
    });

    expect(filteredMessages.length).toBe(0);
  });

  test('doesn\'t include messages that were sent by myself', () => {
    const messages = [
      createTestMessage({recipient_id: '1', sender_id: '2', created_timestamp: '10'}),
      createTestMessage({recipient_id: '2', sender_id: '1', created_timestamp: '5'}),
    ];
    const filteredMessages = filterMessagesToReplyTo({
      messages,
      selfTwitterUserIdStr: '2',
      usersRepliedTo: new Set(),
      sinceTime: 0
    });

    expect(filteredMessages.length).toBe(1);
    expect(filteredMessages[0].message_create.sender_id).toBe('1');
  });

  test('doesn\'t include messages that were sent by someone who already received the away message', () => {
    const messages = [
      createTestMessage({recipient_id: '1', sender_id: '2', created_timestamp: '10'}),
      createTestMessage({recipient_id: '2', sender_id: '1', created_timestamp: '5'}),
    ];
    const usersRepliedTo = new Set();
    usersRepliedTo.add('1');
    const filteredMessages = filterMessagesToReplyTo({
      messages,
      selfTwitterUserIdStr: '2',
      usersRepliedTo,
      sinceTime: 0
    });

    expect(filteredMessages.length).toBe(0);
  });
});

const createTestTweet = options => {
  const {user_id_str, created_at, id_str} = options;
  return {
    "created_at": created_at,
    "id":1081984301468696600,
    "id_str": id_str,
    "text":"@ericandrewlewis what is your favorite comic book",
    "truncated":false,
    "entities":{
      "hashtags":[],
      "symbols":[],
      "user_mentions":[{"screen_name":"ericandrewlewis",
      "name":"hi i'm troy mcclure you may remember me from such",
      "id":218730107,
      "id_str":"218730107",
      "indices":[0,
      16]}],
      "urls":[]
    },
    "source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    "in_reply_to_status_id":null,
    "in_reply_to_status_id_str":null,
    "in_reply_to_user_id":218730107,
    "in_reply_to_user_id_str":"218730107",
    "in_reply_to_screen_name":"ericandrewlewis",
    "user":{
      "id":1081975880455458800,
      "id_str": user_id_str,
      "name":"ericandrewlewis2",
      "screen_name":"ericandrewlewi1",
      "location":"",
      "description":"",
      "url":null,
      "entities":{"description":{"urls":[]}},
      "protected":false,
      "followers_count":1,
      "friends_count":1,"listed_count":0,
      "created_at":"Sun Jan 06 18:08:46 +0000 2019",
      "favourites_count":0,
      "utc_offset":null,
      "time_zone":null,
      "geo_enabled":false,
      "verified":false,
      "statuses_count":1,
      "lang":"en",
      "contributors_enabled":false,
      "is_translator":false,
      "is_translation_enabled":false,
      "profile_background_color":"F5F8FA",
      "profile_background_image_url":null,
      "profile_background_image_url_https":null,
      "profile_background_tile":false,
      "profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      "profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      "profile_link_color":"1DA1F2",
      "profile_sidebar_border_color":"C0DEED",
      "profile_sidebar_fill_color":"DDEEF6",
      "profile_text_color":"333333",
      "profile_use_background_image":true,
      "has_extended_profile":false,
      "default_profile":true,
      "default_profile_image":true,
      "following":true,
      "follow_request_sent":false,
      "notifications":false,
      "translator_type":"none"
    },
    "geo":null,"coordinates":null,
    "place":null,
    "contributors":null,
    "is_quote_status":false,
    "retweet_count":0,
    "favorite_count":0,
    "favorited":false,
    "retweeted":false,
    "lang":"en"
  };
}

describe('filterTweetsToReplyTo', () => {
  test('doesn\'t include tweets that are too old', () => {
    const tweetDate = new Date(0);
    const tweets = [
      createTestTweet({
        user_id_str: '2',
        created_at: tweetDate.toString(),
        id_str: '1'
      })
    ];
    const filteredTweets = filterTweetsToReplyTo({
      tweets,
      selfTwitterUserIdStr: '1',
      tweetsRepliedTo: new Set(),
      usersRepliedTo: new Set(),
      sinceTime: 1
    });

    expect(filteredTweets.length).toBe(0);
  });

  test('includes tweets that are new', () => {
    const tweetDate = new Date(5000);
    const tweets = [
      createTestTweet({
        user_id_str: '2',
        created_at: tweetDate.toString(),
        id_str: '1'
      })
    ];
    debugger;
    const filteredTweets = filterTweetsToReplyTo({
      tweets,
      selfTwitterUserIdStr: '1',
      tweetsRepliedTo: new Set(),
      usersRepliedTo: new Set(),
      sinceTime: 4000
    });

    expect(filteredTweets.length).toBe(1);
  });

  test('doesn\'t include tweets for myself', () => {
    const tweetDate = new Date(5000);
    const tweets = [
      createTestTweet({
        user_id_str: '1',
        created_at: tweetDate.toString(),
        id_str: '1'
      })
    ];
    const filteredTweets = filterTweetsToReplyTo({
      tweets,
      selfTwitterUserIdStr: '1',
      tweetsRepliedTo: new Set(),
      usersRepliedTo: new Set(),
      sinceTime: 4000
    });

    expect(filteredTweets.length).toBe(0);
  });

  test('doesn\'t include tweets for myself', () => {
    const tweetDate = new Date(5000);
    const tweets = [
      createTestTweet({
        user_id_str: '1',
        created_at: tweetDate.toString(),
        id_str: '1'
      })
    ];
    const filteredTweets = filterTweetsToReplyTo({
      tweets,
      selfTwitterUserIdStr: '1',
      tweetsRepliedTo: new Set(),
      usersRepliedTo: new Set(),
      sinceTime: 4000
    });

    expect(filteredTweets.length).toBe(0);
  });

  test('doesn\'t include tweets that are from users who have received the away message', () => {
    const tweets = [
      createTestTweet({
        user_id_str: '2',
        created_at: new Date(7000).toString(),
        id_str: '1'
      }),
      createTestTweet({
        user_id_str: '3',
        created_at: new Date(5000).toString(),
        id_str: '1'
      }),
    ];
    const usersRepliedTo = new Set();
    usersRepliedTo.add('2');
    const filteredTweets = filterTweetsToReplyTo({
      tweets,
      selfTwitterUserIdStr: '1',
      tweetsRepliedTo: new Set(),
      usersRepliedTo: usersRepliedTo,
      sinceTime: 4000
    });

    expect(filteredTweets.length).toBe(1);
    expect(filteredTweets[0].user.id_str).toBe('3');
  });

});