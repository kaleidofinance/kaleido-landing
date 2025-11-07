import { Collection } from 'mongodb';

export async function generateReferralCode(collection: Collection): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  let isUnique = false;
  let referralCode = '';

  while (!isUnique) {
    referralCode = Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join('');

    // Check if code exists in database
    const existing = await collection.findOne({ referralCode });
    if (!existing) {
      isUnique = true;
    }
  }

  return referralCode;
}
