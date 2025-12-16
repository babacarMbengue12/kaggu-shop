import { Injectable } from '@nestjs/common';

// const DEVICES = ['3e76f40eb7c59387', '3BD439A6-2820-4730-9FAD-1818A3CCBC3D'];

import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import {
  GlobalObject,
  IS_PRIMARY_APP,
  Product,
  productsListner,
  UserInfos,
  usersListner
} from './utils/firebase';
import { getJsonDataFromFile, setJsonDataToFile } from './utils/json-utils';
import { watchJsonFile } from './utils/utils';
let expo = new Expo({ maxConcurrentRequests: 100 });

@Injectable()
export class AppService {
  _products: Product[] = [];
  _users: UserInfos[] = [];
  _timeout: NodeJS.Timeout;
  _globalObject: GlobalObject = {
    products: [],
    users: []
  };
  constructor() {
    if (IS_PRIMARY_APP) {
      this._listen();
    } else {
      const getDataCb = () => {
        getJsonDataFromFile().then((data) => {
          for (let [k, v] of Object.entries(data)) {
            this[k] = v;
          }
        });
      };
      getDataCb();
      watchJsonFile(getDataCb);
    }
  }

  _isEmpty() {
    return this._products.length === 0 || this._users.length === 0;
  }

  _syncData() {
    if (this._isEmpty()) {
      console.log('ignore sync');
      return;
    }
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = undefined;
    }
    this._timeout = setTimeout(() => {
      console.log('sync data');
      const users = this._users;
      const usersMap = new Map(users.map((u) => [u.uid, u]));
      const allProducts = this._products.sort(
        (a, b) => b.nbContacted - a.nbContacted
      );
      const products: Product[] = [];
      for (let p of allProducts) {
        const u = usersMap.get(p.userId);
        if (u) {
          products.push({ ...p, user: u });
        }
      }

      const obj: GlobalObject = {
        users,
        products
      };
      this._globalObject = obj;
      setJsonDataToFile({
        _globalObject: obj,
        _products: products,
        _users: users
      });
    }, 2000);
  }

  _listen() {
    productsListner((data) => {
      this._products = data;
      this._syncData();
    });
    usersListner((data) => {
      this._users = data;
      this._syncData();
    });
  }

  async _commonGet<T>(key: keyof GlobalObject) {
    return this._globalObject[key] as T;
  }

  getAll() {
    return this._globalObject;
  }

  async getProducts() {
    return this._commonGet<Product[]>('products');
  }

  async getUsers() {
    return this._commonGet<UserInfos[]>('users');
  }

  async sendNotifications(
    title: string,
    body: string,
    plaform: string,
    data: any = {}
  ) {
    const tokens = [];
    return this._sendNotifications(tokens, title, body, data);
  }

  async _sendNotifications(
    tokens: string[],
    title: string,
    body: string,
    data: any
  ) {
    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t,
      sound: 'default',
      priority: 'high',
      body: body,
      title: title,
      badge: 0,
      data: data || {}
    }));
    const total = tokens.length;
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        console.log('chunk length', chunk.length);
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('error send push', error);
      }
    }
    console.log('Send push done', total);
    return true;
  }
}
