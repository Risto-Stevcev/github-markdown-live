#!/usr/bin/env node
'use strict'
const express = require('express')
    , https   = require('https')
    , http    = require('http')
    , path    = require('path')
    , fs      = require('fs')

const app    = express()
    , server = http.Server(app)
    , io     = require('socket.io')(server)

const argv = require('yargs')
               .usage('Usage: $0 -p [port] -a [authentication] -f [markdown file]')

               .alias('a', 'authentication')
               .describe('a', 'Authentication: [token] (OAuth) or [user:token] (Basic)')

               .alias('f', 'file')
               .describe('f', 'Markdown file to watch and render')

               .alias('p', 'port')
               .demand(['f'])
               .argv

const file = path.resolve(__dirname, argv.file)

let dateString  = date => (date || new Date()).toLocaleTimeString('en-US', { hour12: false })
  , datePadding = ' -- '.repeat(dateString().length / 4)


app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname })
})


let setOptions = (contentLength, authorization) => {
  let options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/markdown',
    method: 'POST',
    headers: {
      'User-Agent':     'Github-Markdown-Live-App',
      'Connection':     'close',
      'Accept':         'application/vnd.github.v3+json',
      'Content-Type':   'application/json',
      'Content-Length': contentLength,
    }
  }

  if (authorization) {
    if (authorization.split(':').length === 2) 
      options.headers.Authorization = `Basic ${new Buffer(authorization).toString('base64')}`
    else
      options.headers.Authorization = `token ${authorization}`
  }

  return options
}

let parseMarkdown = (content) => {
  const body = JSON.stringify({ text: content, mode: 'gfm' })

  let req = https.request(setOptions(body.length, argv.authentication), (res) => {
    var markdown = ''
    let rateLimitReset = new Date(parseInt(res.headers['x-ratelimit-reset']) * 1000)
    console.info(`[${dateString()}] Status code:       ${res.statusCode}`)
    console.info(`[${datePadding }] Request limit:     ${res.headers['x-ratelimit-limit']}`)
    console.info(`[${datePadding }] Request remaining: ${res.headers['x-ratelimit-remaining']}`)

    if (rateLimitReset.getTime())
      console.info(`[${datePadding }] Request reset:     ${dateString(rateLimitReset)}`)

    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      markdown += chunk.toString()
    })
    res.on('end', () => {
      console.info(`[${datePadding}] Markdown fetched`)
      io.emit('markdown', markdown)
    })
  })

  req.on('error', (err) => {
    console.error(`[${dateString()}] Problem with request: ${err.message}`)
  })

  req.write(body)
  req.end()
}

let readAndParse = () => {
  const content = fs.readFileSync(file, 'utf8')
  parseMarkdown(content)
}

fs.watchFile(file, (curr) => {
  console.info(`[${dateString()}] File modified`)
  readAndParse()
})

io.on('connection', function(socket){
  console.info(`[${datePadding}] User connected`)
  readAndParse()
})

server.listen(argv.port || 3000, () => {
  console.log(`[${datePadding}] Listening on *:${argv.port || 3000}`)
})
