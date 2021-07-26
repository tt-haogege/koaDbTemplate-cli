#! /usr/bin/env node
var { program } = require('commander');
var ora = require('ora')
var downLoad = require('download-git-repo')
var { resolve } = require('path');
var fs = require('fs');
var chalk = require('chalk')
var MYSQL_TEMPLATE = 'direct:https://github.com/tt-haogege/koa-DBtemplate-mysql.git'
var MONGO_TEMPLATE = 'direct:https://github.com/tt-haogege/koa-DBtemplate-mongo.git'
program
    .version('0.1.0');
program
    .command('create <project>')
    .description('创建项目模板 -m 使用mongo作为数据库 默认使用mysql')
    .option('-r, --mysql', '选择mysql作为数据库')
    .option('-m, --mongo', '选择mongo作为数据库')
    .action(function (env, option) {
        var dbUrl = option.mongo ? MONGO_TEMPLATE : MYSQL_TEMPLATE
        var dir = resolve(env)
        var bar = ora('模板下载中').start()
        downLoad(dbUrl, env, {clone: true}, function (err) {
            var files = fs.readdirSync(dir)
            if (err) {
                console.log(err);
                if(files.length > 0) {
                    bar.succeed()
                    console.log('');
                    console.log('----------start----------');
                    console.log('| cd '+ env);
                    console.log('| npm install');
                    console.log('| npm run dev');
                    console.log('-------------------------');
                    return console.log(chalk.yellow('下载成功'));
                } else {
                    bar.fail()
                    return console.log(lchalk.red('下载失败'));
                }
            } else {
                bar.succeed()
            }
        })
    })

program.parse(process.argv);