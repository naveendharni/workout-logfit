import * as argon2 from 'argon2';

// argon2's defaults are argon2id with the parameters its authors recommend.
export const hashPassword = (password: string) => argon2.hash(password);

export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);

let dummyHash: Promise<string> | undefined;

// Used when the email doesn't exist, so a failed login takes the same time either way
// and response timing can't reveal which emails have accounts.
export const verifyAgainstDummy = async (password: string) => {
  dummyHash ??= argon2.hash('dummy-password-for-timing');
  await argon2.verify(await dummyHash, password);
  return false;
};
