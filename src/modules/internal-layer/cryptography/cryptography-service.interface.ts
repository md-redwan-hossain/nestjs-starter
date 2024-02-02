export interface ICryptographyService {
  encrypt(plainText: string, encryptor: string): Promise<string>;
  decrypt(plainText: string, decryptor: string): Promise<string>;
  hash(plainText: string, saltOrRounds: string | number): Promise<string>;
  compareHash(plainText: string, hash: string): Promise<boolean>;
}
