'use strict';

exports.keys = '123456';

exports.kafka = {
  kafka1: {
    kafkaHost: '127.0.0.1:9092',
    encoding: 'buffer', // trans binary data
    keyEncoding: 'utf8',
    sub: [{
      groupId: 'consumer-topic1',
      topics: [
        'topic1',
      ],
      'topic1-KEYS': [
        'key1',
      ],
    }],
  },
  // kafka2: {
  //   kafkaHost: '127.0.0.1:2181',
  //   encoding: 'buffer', // trans binary data
  //   keyEncoding: 'utf8',
  //   sub: [{
  //     groupId: 'consumer-topic2',
  //     topics: [
  //       'topic1',
  //     ],
  //     'topic1-KEYS': [
  //       'key1',
  //     ],
  //   }],
  // },
};
