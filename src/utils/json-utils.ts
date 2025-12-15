import { GlobalObject, Product, UserInfos } from './firebase';
import { createDataJsonFile, getDataJson } from './utils';

export type AppJsonData = {
  _users: UserInfos[];
  _products: Product[];
  _globalObject: GlobalObject | undefined;
};

export function setJsonDataToFile(data: AppJsonData) {
  console.log('setJsonDataToFile');
  createDataJsonFile(JSON.stringify(data));
}
export function getJsonDataFromFile() {
  return new Promise<AppJsonData>((r) => {
    const getData = () => {
      const data = getDataJson();
      if (data) r(JSON.parse(data));
      else {
        setTimeout(() => {
          getData();
        }, 3000);
      }
    };
    getData();
  });
}
