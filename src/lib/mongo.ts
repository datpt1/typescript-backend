/* istanbul ignore file */
import mongoose from 'mongoose'
import bluebird from 'bluebird'

import config from "../config";
import logger from "../utils/logger";

const mongodbConfig = config.mongo
const uri = `mongodb://${mongodbConfig.host}:${mongodbConfig.port}/${mongodbConfig.database}?authSource=admin`

mongoose.Promise = bluebird

//  To save the logs in database
mongoose.set('debug', function(coll, method, query, doc, options) {
  let set = {
    coll: coll,
    method: method,
    query: query,
    doc: doc,
    options: options
  };

  logger.info({
    dbQuery: set
  });
});

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: config.mongo.useCreateIndex,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  autoIndex: config.mongo.autoIndex,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
}


export default class MongoConnection {
  static async open(): Promise<void> {
    try {
      await mongoose.connect(uri, {
        user: mongodbConfig.user,
        pass: mongodbConfig.password,
      })
      await mongoose.connection.db.listCollections().toArray().then((collections) => {
        collections.forEach((collection) => {
          logger.info(`db.open: ${collection.name}`)
        })
      })

    } catch (err) {
      logger.error(`db.open: ${err}`)
      throw err
    }
  }

  public async close(): Promise<void> {
    try {
      await mongoose.disconnect()
    } catch (err) {
      logger.error(`db.open: ${err}`)
      throw err
    }
  }
}

// export default MongoConnection.getInstance()
