import crypto from 'crypto';

export const stableId = (value: string): string => {
  return crypto.createHash('md5').update(value).digest('hex');
};

export const normalizeUrl = (raw: string): string => {
  try {
    const url = new URL(raw);

    const keep = ['tag', 'matt_word'];

    [...url.searchParams.keys()].forEach((key) => {
      if (!keep.includes(key)) {
        url.searchParams.delete(key);
      }
    });

    return url.toString();
  } catch {
    return raw;
  }
};