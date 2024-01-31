import { Injectable } from "@nestjs/common";
import CryptoJS from "crypto-js";

@Injectable()
export class CryptographyService {
  constructor() {}

  async encrypt(value: string, encryptor: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.encrypt(value, encryptor).toString());
    });
  }

  async decrypt(value: string, decryptor: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.decrypt(value, decryptor).toString(CryptoJS.enc.Utf8));
    });
  }
}
