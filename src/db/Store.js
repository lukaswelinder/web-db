import Pathwise from 'level-pathwise'

import { fromJS, Set } from 'immutable'


export class Store {

  // takes instance of levelDB (
  constructor(db) {

    // if (!db_path || typeof db_path !== 'string')
    //   throw 'Missing or invalid path for database...';

    if(!(this instanceof Store))
      return new Store(db_path);


    // TODO: error handling and type-checking
    this.__db = Pathwise(db);

    // Returns promise, resolving with 'this'
    return this.init();

  }

  init() {

    // TODO: check properties upon initialization
    return new Promise(function(resolve, reject) {

      this.__db = new Pathwise(leveldb(db_path));

      this.__db.put([], {

        __nodes: {}, // nodes indexed by '_id' property
        __node_temp: {}, // other indices on nodes

        __edges: {}, // edges indexed by '_id' property
        __edge_temp: {}, // other indices on edges

      }, (err) => (err) => !err ? resolve(this) : reject(err));

    });

  }

  validateKeyPath(key_path) {

    switch (key_path[0]) {
      case '__nodes':
        break;
      case '__node_temp':
        break;
      case '__edges':
        break;
      case '__edge_temp':
        break;
      default:
        throw 'Invalid key_path entry point...';
    }

    return key_path;

  }

  setIn(key_path, obj) {

    // Check if batch.
    if(Array.isArray(obj))
      return this.batch(key_path.map((data) => ({ type: 'put', path: key_path, data: data })));

    this.validateKeyPath(key_path);

    return new Promise(function(resolve, reject) {
      this.__db.put(key_path, obj, (err) => !err ? resolve(key_path) : reject(err));
    });

  }

  getIn(key_path) {

    // Check if batch.
    if(Array.isArray(key_path[0]))
      return this.batch(key_path.map((path) => ({ type: 'get', path: path })));

    this.validateKeyPath(key_path);

    return new Promise(function(resolve, reject) {
      this.__db.put(key_path, obj, (err) => !err ? resolve(key_path) : reject(err));
    });

  }

  keysIn(key_path) {

    // Check if batch (runs recursively).
    if(Array.isArray(key_path[0]))
      return Promise.all(key_path.map((path) => this.keys(path)));

    this.validateKeyPath(key_path);

    return new Promise(function(resolve, reject) {
      this.__db.children(key_path, (err, keys) => !err ? resolve(keys) : reject(err));
    });

  }

  deleteIn(key_path) {

    // Check if batch.
    if(Array.isArray(key_path[0]))
      return this.batch(key_path.map((path) => ({ type: 'del', path: path })));

    this.validateKeyPath(key_path);

    return new Promise(function(resolve, reject) {
      this.__db.put(key_path, obj, (err) => !err ? resolve(key_path) : reject(err));
    });

  }

  batch(batch_data) {

    return new Promise(function(resolve, reject) {
      this.batch(batch_data, (err) => !err ? resolve(batch_data) : reject(err));
    });

  }

}