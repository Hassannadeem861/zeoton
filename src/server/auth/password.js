import 'server-only';
import bcrypt from 'bcryptjs';

const ROUNDS = 12;
// Used to keep login timing similar whether or not the email exists.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('zeoton-timing-equalizer', ROUNDS));

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);

export async function verifyPassword(plain, hash) {
  if (!hash) {
    await bcrypt.compare(plain, await getDummyHash());
    return false;
  }
  return bcrypt.compare(plain, hash);
}
