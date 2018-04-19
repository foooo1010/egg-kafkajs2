'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const EventEmitter = require('events');
const awaitEvent = require('await-event');
const kafkaLogging = require('kafka-node/logging');
const { Producer, ConsumerGroup } = require('kafka-node');

const Client = require('./client');

module.exports = app => {
  const logger = app.getLogger('kafkaLogger');
  kafkaLogging.setLoggerProvider(logger);

  let appReady = false;

  app.ready(() => {
    appReady = true;
  });

  const heartEvent = new EventEmitter();
  heartEvent.await = awaitEvent;

  function errorHandler(err) {
    // 应用启动前避免错误输出到标准输出
    if (appReady) {
      app.coreLogger.error(err);
    } else {
      app.coreLogger.warn(err);
    }
  }

  const kafkaConfig = app.config.kafka;
  const topic2Subscription = new Map();
  const kafka = {};

  for (const name in kafkaConfig) {
    const options = kafkaConfig[name];
    const client = Client(options);
    const { sub } = options;
    for (const subOption of sub) {
      const topics = subOption.topics || [];
      const defaultOptions = {
        kafkaHost: options.kafkaHost, // connect directly to kafka broker (instantiates a KafkaClient)
        groupId: subOption.groupId,
        sessionTimeout: 15000,
        protocol: [ 'roundrobin' ],
        fromOffset: 'latest', // default
        outOfRangeOffset: 'earliest', // default
        migrateHLC: false, // for details please see Migration section below
        migrateRolling: true,
        encoding: 'buffer', // trans binary data
        keyEncoding: 'utf8',
      };
      const consumer = new ConsumerGroup(defaultOptions, topics);

      consumer.on('error', errorHandler);
      consumer.on('connect', () => {
        heartEvent.emit(`${name}.${subOption.groupId}.consumerConnected`);
      });
      app.beforeStart(function* () {
        yield heartEvent.await(`${name}.${subOption.groupId}.consumerConnected`);
        app.coreLogger.info('[egg-kafkajs] consumer: %s is ready', subOption.groupId);
      });
      app.beforeClose(function* () {
        consumer.close(true, function(error) {
          app.coreLogger.info('[egg-kafkajs] consumer: %s is closed', subOption.groupId, error);
        });
      });

      for (const topic of topics) {
        for (const key of subOption[`${topic}-KEYS`]) {
          const filepath = path.join(app.config.baseDir, `app/kafka/${name}/${topic}/${key}_consumer.js`);
          if (!fs.existsSync(filepath)) {
            app.coreLogger.warn('[egg-kafkajs] CANNOT find the subscription logic in file:`%s` for topic=%s', filepath, topic);
            continue;
          } else {
            const Subscriber = require(filepath);
            topic2Subscription.set(`${name}:${topic}:${key}`, Subscriber);
          }
        }
      }

      consumer.on('message', message => {
        const { topic, key } = message;
        const filepath = path.join(app.config.baseDir, `app/kafka/${name}/${topic}/${key}_consumer.js`);
        let Subscriber = null;
        if (!fs.existsSync(filepath)) {
          Subscriber = topic2Subscription.get(`${name}:${topic}:default`);
        } else {
          Subscriber = topic2Subscription.get(`${name}:${topic}:${key}`);
        }

        if (Subscriber) {
          const ctx = app.createAnonymousContext();
          const subscriber = new Subscriber(ctx);
          subscriber.subscribe(message);
        }
      });

    }

    const ProducerPrototype = new Producer(client);
    const producer = Promise.promisifyAll(ProducerPrototype);

    producer.onAsync('ready').then(function() {
      heartEvent.emit('producerConnected');
    });
    producer.onAsync('error', errorHandler);

    app.beforeStart(function* () {
      app.coreLogger.info('[egg-kafkajs] starting...');
      yield heartEvent.await('producerConnected');
      app.coreLogger.info('[egg-kafkajs] producer: %s is ready', 'producer');
    });
    kafka[name] = {
      async send(topic, key, messages, partition = 0, attributes = 0, timestamp = Date.now()) {
        return await producer.sendAsync([{ topic, key, messages, partition, attributes, timestamp }]);
      },
    };
  }

  app.kafka = kafka;

};
