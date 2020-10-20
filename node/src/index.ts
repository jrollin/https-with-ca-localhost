import express from 'express'
import https from 'https'
import * as fs from 'fs'
import pino from 'pino'
import * as dotenv from 'dotenv'

const logger = pino()

// config
dotenv.config()

// check env
if (!process.env.PORT) {
    logger.error('PORT is not defined')
    process.exit(1)
}
if (!process.env.HOSTNAME) {
    console.error('HOSTNAME is not defined')
    process.exit(1)
}
// SSL
if (!process.env.SSL_KEY) {
    logger.error('SSL_KEY is not defined')
    process.exit(1)
}
if (!process.env.SSL_CERT) {
    logger.error('SSL_CERT is not defined')
    process.exit(1)
}

// env const
const PORT = parseInt(process.env.PORT)
const HOSTNAME = process.env.HOSTNAME
const SSL_KEY = process.env.SSL_KEY
const SSL_CERT = process.env.SSL_CERT

// express
const app = express()

// routes
app.get('/', (req: any, res: any) => {
    res.send('Express + TypeScript api !')
})

// server
const server = https.createServer(
    {
        key: fs.readFileSync(SSL_KEY),
        cert: fs.readFileSync(SSL_CERT),
    },
    app
)
server.listen(PORT, HOSTNAME, () => {
    const URL = `https://${HOSTNAME}:${PORT}`
    logger.info(`Started server ${URL}`)
    process.on('SIGABRT', cleanTerminate)
    process.on('SIGINT', cleanTerminate)
    process.on('SIGBREAK', cleanTerminate)
})

// track server termination
const cleanTerminate = (signal: NodeJS.Signals): void => {
    logger.info('cleaning before terminating process ...', { signal })
    process.exit(0)
}
