'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const result = await this.app.kafka.kafka1.send('topic1', 'key1', 'message');
    console.log(result, '>>>>');
    this.ctx.body = 'hi, ' + this.app.plugins.kafkajs2.name;
  }
}

module.exports = HomeController;
