#! /usr/bin/env node
var { program } = require('commander')
var ora = require('ora')
var downLoad = require('download-git-repo')
var { resolve } = require('path')
var fs = require('fs')
var inquirer = require('inquirer')
var chalk = require('chalk')
var bar = ora('模板拉取中\n')
var child_process = require('child_process')
var MYSQL_TEMPLATE =
  'https://gitee.com/tt_haogege/koa-DBtemplate-mysql.git'
var MONGO_TEMPLATE =
  'https://gitee.com/tt_haogege/koa-DBtemplate-mongo.git'

const questions = [
  {
    type: 'input',
    message: '项目名称',
    name: 'project',
    default: 'koaDbTemplate',
    validate(val) {
      if (!val) {
        // 验证一下输入是否正确
        return '请输入项目名'
      }
      if (fs.existsSync(val)) {
        // 判断文件是否存在
        return '项目已存在'
      } else {
        return true
      }
    },
  },
  {
    type: 'list',
    message: '选择数据库',
    choices: ['mysql', 'mongodb'],
    default: 'mysql',
    name: 'db',
  },
]
const editFile = function ({ projectName }) {
  // 读取文件
  fs.readFile(`${process.cwd()}/${projectName}/package.json`, (err, data) => {
    if (err) throw err
    // 获取json数据并修改项目名称和版本号
    let _data = JSON.parse(data.toString())
    _data.name = projectName
    let str = JSON.stringify(_data, null, 4)
    // 写入文件
    fs.writeFile(
      `${process.cwd()}/${projectName}/package.json`,
      str,
      function (err) {
        if (err) throw err
      }
    )
    bar.succeed(chalk.yellow('下载成功'))
    initGit(projectName)
    console.log('----------success----------')
    console.log('| cd ' + projectName)
    console.log('| npm install')
    console.log('| npm run dev')
    console.log('-------------------------')
  })
}

function initGit (projectName) {
  var { spawn } = child_process
  spawn('rm', ['-rf', '.git'], {
    cwd: `${process.cwd()}/${projectName}`
  })
  spawn('git', ['init'], {
    cwd: `${process.cwd()}/${projectName}`
  })
}

function downLoadProject({ url, projectName, success, error, branch = 'main' }) {
  var { spawn } = child_process
  var g = spawn('git', ['clone', '-b', branch, url, projectName])
  const errorArray = []
  g.stdout.on('data', function (data) {
    console.log(`g.stdout: ${data}`);
  })
  g.stderr.on('data', function (data) {
    errorArray.push(data)
  })
  g.on('exit', function(code, signal) {
    if (code !==0 || signal) {
      for(var i = 1; i < errorArray.length; i ++) {
        console.log(chalk.red(errorArray[i]));
      }
      error()
    }
    if (code === 0 && !signal) {
      success()
    }
  })
}

program.version('0.1.0')
program
  .command('create')
  .description('创建项目模板 -m 使用mongo作为数据库 默认使用mysql')
  .action(function (env, option) {
    console.log(process.cwd(), 'option')
    inquirer.prompt(questions).then(answer => {
      console.log(answer, 2222, env)
      var dbUrl = answer.db === 'mongodb' ? MONGO_TEMPLATE : MYSQL_TEMPLATE
      bar.start()
      downLoadProject({
        url: dbUrl,
        projectName: answer.project,
        error() {
          bar.fail('拉取失败\n')
        },
        success() {
          editFile({ projectName: answer.project })
        }
      })
      
      // downLoad(dbUrl, answer.project, { clone: true }, function (err) {
      //   if (err) {
      //     console.log(err)
      //     bar.fail()
      //     return console.log(chalk.red('下载失败'));
      //   } 
      //   editFile({ projectName: answer.project })
      // })
    })
  })

program.parse(process.argv)
