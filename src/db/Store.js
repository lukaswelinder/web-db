import leveldb from 'level'
import Pathwise from 'level-pathwise'

import { fromJS, Set } from 'immutable'


// This is the base-class for Node.js data-store.
export class Store {

  constructor(db_path) {

    // :TODO: make store-type agnostic by accepting a 'db' instance
    if (!db_path || typeof db_path !== 'string')
      throw 'Missing or invalid path for database...';

    if(!(this instanceof Store))
      return new Store(db_path);

    // Returns promise, resolving with 'this'
    return this.init();

  }

  init() {

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
    // :TODO: validate key_path and object structure/properties

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

  keys(key_path) {

    if(Array.isArray(key_path[0]))
      return Promise.all(key_path.map((path) => this.keys(path)));

    this.validateKeyPath(key_path);

    return new Promise(function(resolve, reject) {
      this.__db.children(key_path, (err, keys) => !err ? resolve(keys) : reject(err));
    });

  }

}