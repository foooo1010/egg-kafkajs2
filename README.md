# egg-kafkajs

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-kafkajs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-kafkajs
[download-image]: https://img.shields.io/npm/dm/egg-kafkajs.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-kafkajs

<!--
Description here.
-->

[kafka-node](https://github.com/SOHU-Co/kafka-node) plugin for Egg.js.

> NOTE: This plugin just for integrate kafka-node into Egg.js, more documentation please visit https://github.com/SOHU-Co/kafka-node.

## Install

```bash
$ npm i egg-kafkajs2 --save
```
or

```bash
$ yarn add egg-kafkajs2
```

## Usage

```js
// {app_root}/config/plugin.js
exports.kafkajs = {
  enable: true,
  package: 'egg-kafkajs2',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.kafka = {
  kafka1: {
    kafkaHost: '127.0.0.1:2181',
    sub: [{
      groupId: 'consumer-topic1',
      topics: [
        'topic1',
      ],
      'topic1-KEYS': [
        'default', // default consumer if you need
        'key1'
      ],
    }],
  },
  kafka2: {
    kafkaHost: '127.0.0.1:2181',
    sub: [{
      groupId: 'consumer-topic2',
      topics: [
        'topic2',
      ],
      'topic2-KEYS': [
        'key2',
      ],
    }],
  },
};

```

## Structure

```
egg-project
├── package.json
├── app.js (optional)
├── app
|   ├── router.js
│   ├── controller
│   |   └── home.js
│   ├── service (optional)
│   |   └── user.js
│   |   └── response_time.js
│   └── kafka (optional)  --------> like `controller, service...`
|       └──kafka1
│         ├── topic1 (optional)  -------> topic name of kafka
│            ├── key1_comsumer.js(optional)  ------> `key` is the key of topic
|            └── default_comsumer.js(optional) -----> `default` when key canot find , default_comsumer.js will consume it
|       └──kafka2
│         ├── topic1 (optional)  
│            ├── key1_comsumer.js(optional) 
|            └── default_comsumer.js(optional) 
├── config
|   ├── plugin.js
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.test.js (optional)
|   ├── config.local.js (optional)
|   └── config.unittest.js (optional)
```


## Example

see [test/fixtures/apps/kafkajs2-test/](test/fixtures/apps/kafkajs2-test) for more detail.

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
