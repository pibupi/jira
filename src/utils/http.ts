import * as qs from "qs";
import * as auth from "auth-provider";
import { useAuth } from "context/auth-context";
const apiUrl = process.env.REACT_APP_API_URL;

interface Config extends RequestInit {
  token?: string;
  data?: object;
}

export const http = async (
  endpoint: string,
  { data, token, headers, ...customConfig }: Config = {}
) => {
  const config = {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customConfig,
  };
  if (config.method.toUpperCase() === "GET") {
    endpoint += `${qs.stringify(data)}`;
  } else {
    config.body = JSON.stringify(data || {});
  }
  return window.fetch(`${apiUrl}/${endpoint}`, config).then(async (res) => {
    if (res.status === 401) {
      await auth.logout();
      window.location.reload();
      return Promise.reject({ message: "请重新登录" });
    }
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  });
};

// JS中的typeof 是在runtime时运行的
// TS中的typeof 是在静态环境运行的
export const useHttp = () => {
  const { user } = useAuth();
  // * Utility types 用泛型给他传入一个其他类型，然后utility type对这个类型进行某种操作
  return (...[endpoint, config]: Parameters<typeof http>) =>
    http(endpoint, { ...config, token: user?.token });
};

// Parameters<typeof http>
// 获取http的参数类型，给当前

// 联合类型
// let myFaviriteNumber: string | number;
// myFaviriteNumber = 7;
// myFaviriteNumber = "seven";

// 类型别名 在很多情况下可以和interface互换
// 1.联合类型 interface就没法替代type
// type FavoriteNumber = string | number;
// let roseFavoriNumber: FavoriteNumber = "6";
// 2.interce也没法实现Utility type

// type Person = {
// name: string;
// age: number;
// };
// 属性都变为可选  Partial
// const xiaoMing: Partial<Person> = { name: "xiaoming" };
// 某一个属性变为可选，另一个还是必选！！Omit操作的是键值对，Exclude操作的是联合类型
// const shemmiRen: Omit<Person, "name" | "age"> = {};

// keyof 把属性联合起来，形成联合类型
// type PersonKyes = keyof Person;
// Pick 从类型中，挑选几个类型，组成新的类型
// type PersonOnlyName = Pick<Person, "name" | "age">;
// exclude
// Exclude<联合类型，需要过滤掉的属性> 返回剩下的类型
// type Age = Exclude<PersonKyes, "name">;

// Partial实现
// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };
