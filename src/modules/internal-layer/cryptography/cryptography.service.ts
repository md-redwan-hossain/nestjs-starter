import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import { ICryptographyService } from "./cryptography-service.interface";

@Injectable()
export class CryptographyService implements ICryptographyService {
  constructor() {}

  async encrypt(plainText: string, encryptor: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.encrypt(plainText, encryptor).toString());
    });
  }

  async decrypt(plainText: string, decryptor: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.decrypt(plainText, decryptor).toString(CryptoJS.enc.Utf8));
    });
  }

  async hash(plainText: string, saltOrRounds: string | number = 8): Promise<string> {
    return await bcrypt.hash(plainText, saltOrRounds);
  }

  async compareHash(plainText: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);
  }
}
