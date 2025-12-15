// firebase-service.ts
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as moment from 'moment';

const serviceAccount = {
  type: 'service_account',
  projectId: 'kaggu-pdf',
  privateKeyId: '4c5ed7b76eed4f160a9008cc3def94ca18f03ce6',
  privateKey:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSr6bihxxTbB/Z\nUeT0xmK4oUeho3Dxb2T7dy81Lgxodu6ydxAGmcvsbkM6vlx8+VXVV33fTtq9aNew\nkokY/Wf+UJ8dlBLc+wec+hGeh77UlpxsJoaoXgwuN923tzs+t0FvhV/Ad6URGD7Y\nV13cSz9PriDb22Oh82qEsgTUH7665ZBpVHaeKYILqXZV+CUnzRuSWMI4ckrFPCEQ\nU/6S4oJ2nBcuM9M3TYZ7MolWAqNBQqC/g7TATbpL1X5/hydIQpC7ggA61JqF3Kok\nWpSXx5Crdpuj06rLg99oELevCTJ4l6hj05ZfrTRrDgQllaDXmbvmC7utkLhh8mNG\nrxqK+ssRAgMBAAECggEAAWmRSTXLoHou0IvyVlHzyThR/fNac+wtKO4KV8eVX1Fo\nE2qqKjaXeklLlfmIHDq5LBA57Sq39trF6YeiPFPY/S0egWDquRkyEXWQDuzGNz2o\nTffxXOcMWy1Ru/0/14OqBN3aHXTaKPK7JLF00G2D7HDpDajUcFE6erxa/S5op9zU\nGVDdtDPKti/fXyAGs+57SO53moZdfPeadDqEErsfJtKpQmbAe4HcBGNBZS5wUSid\nLT72Qav0iq2M8svgEIM5uK7xquJ/NHZGmMIYpq0Uk9KFMqVaVT8/gnBMnL3muCfQ\no0ZDw3XeORpQPzQwilncFWoZnlaodJC5Vw+N6IJ4AQKBgQDyFejlzieOY2YNxilq\n17oElCjgZsJLtglnj9rBKUxkvkBL61zRoVvdh7GqxbGfJN4WJeOjZKObQVTSG+pV\n5XRhML5h+HRpWWJ9h1BeSCPF+6S5IxRIbQQV4MTDRdnZtZko+TVuXBStLSiLG9IZ\n+6EygDGYXcgeipj3dpu25m1sAQKBgQDey7mikM8G011ggmxs/CHShmvrsBjE+zqt\nsjpnW5ee1FKMPeQMmXrxXOUwGCZFs2cKepQXBh05dy7904+p3ADLscqaj6c9Ieqx\nh+tUi8r5zm1ZGTzs4J8VE35pR4QhYhdJ+Z8qDrxpv+DLd/4B7fUOzLnE04eVlIbF\nLxXE76KfEQKBgQDmzuTiVY95PmPKtig+6bc9LlVavh55OPH2fz099TYUxx9eQuSY\nKZQAvqMyApK6/NeRnkZPPmCOYdeRC3R8uOwgzex2VAAJgWNZ8204tucEmEwRB9UK\nyIWgplBzLWHrJC0G17ONqNU911RUbQ4AH90s3PRsJN3r4JC/P6Ju23twAQKBgE8q\nRqj8GYQMYLalQU+se3wp5XkW1oZP2rbTiKsnQYXfXgGVEE5lzuiqoIlpW1gS+j8f\n9TUFKCc+MUViAj9R/Dpkz2ACQWOYhKNWb4lYLuR6tCIftKVa30wG5DkWf125VBsm\nBqdUGyDcXE0QMwKOgjAjELNekmPVJdo08+BJYhhxAoGALRWlpHEE5yj5jZ2VgtpI\nrZAXmGKg9n/UB3fIM/KLkL7g1UTA/Nq5UEnc0ndEPbRKp6dWTS/MyzAwRB4aFDys\ndmVILb3HPrtDa9dfykB6Lg6Yhc6DyY30Z4LEsJI1qurWR0szDu+eYJcRZy4LGLLI\nDra1uEym2bQaRr3HXpbylYI=\n-----END PRIVATE KEY-----\n',
  clientEmail: 'firebase-adminsdk-9hwmt@kaggu-pdf.iam.gserviceaccount.com',
  clientId: '116118697856919993124',
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
  clientX509CertUrl:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9hwmt%40kaggu-pdf.iam.gserviceaccount.com',
  universeDomain: 'googleapis.com'
};

const PORT = process.env.PORT || 3000;
export const IS_PRIMARY_APP = PORT == 3000;

console.log({ PORT, IS_PRIMARY_APP });

export function formatDate(date: number) {
  return getMoment(date).format('DD/MM/YYYY');
}

export function isNew(date: number) {
  return getMoment().diff(getMoment(date), 'days') <= 2;
}

export const PATHS = {
  products: 'products',
  users: 'users'
};

// --- Initialize new-style firebase-admin ---
initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: 'https://kaggu-pdf.firebaseio.com'
});

const db = getFirestore();

export const usersListner = (cb: (data: UserInfos[]) => void) => {
  return db
    .collection(PATHS.users)
    .where('isSubscribedAsShop', '==', true)
    .onSnapshot((snapshot) => {
      const data: UserInfos[] = [];
      snapshot.forEach((doc) => {
        data.push(getDocData<UserInfos>(doc as any));
      });
      cb(data);
    });
};

export const productsListner = (cb: (data: Product[]) => void) => {
  return db.collection(PATHS.products).onSnapshot((snapshot) => {
    const data: Product[] = [];
    snapshot.forEach((doc) => {
      data.push(getDocData<Product>(doc as any));
    });
    cb(data);
  });
};

export const getUserByUid = async (uid: string) => {
  const doc = await db.collection(PATHS.users).doc(uid).get();
  if (doc.exists) {
    return getDocData<UserInfos>(doc as any);
  }
  return null;
};

export const updateUser = async (uid: string, data: Partial<UserInfos>) => {
  return await db.collection(PATHS.users).doc(uid).update(data);
};

export function getDocData<T>(doc: any) {
  const data = doc.data?.() ?? doc.data ?? {};
  const item: any = {
    ...data,
    uid: doc.id,
    id: doc.id
  };
  if (item.created_at) {
    // created_at might be a Firestore Timestamp: use toDate() if present
    if (data.created_at && typeof data.created_at.toDate === 'function') {
      item.created_at = data.created_at.toDate().getTime();
    } else if (typeof data.created_at === 'number') {
      item.created_at = data.created_at;
    } else {
      item.created_at = Date.now();
    }
    item.formattedDate = formatDate(item.created_at);
  }
  return item as T;
}

export function chunk<T>(array: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function getMoment(date?: string | number) {
  // @ts-ignore
  return moment(date) as moment.Moment;
}

export type UserInfos = {
  uid: string;
  email: string;
  token: string;
  created_at: any;
  disableAds?: boolean;
  deviceId?: string;
  accepted?: boolean;
  qacidas?: string[];
  isAdmin?: boolean;
  counts?: { [key: string]: number };
  isSubscribed?: boolean;
  favorites?: { [key: string]: boolean };
  fullName: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  shopTikTokLink: string;
  showImage: string;
  lastPaiementDate?: number;
  city: string;
  country: string;
  isSubscribedAsShop: boolean;
  isShopActive: boolean;
  whatsAppContact: string;
};

export type Product = {
  uid: string;
  created_at: number;
  title: string;
  image: string;
  video: string;
  userId: string;
  user: UserInfos;
  nbContacted: number;
};

export type GlobalObject = {
  users: UserInfos[];
  products: Product[];
};
