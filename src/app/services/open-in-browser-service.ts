import openUrl from 'open';
import Joi from 'joi';

export async function open(url: string) {
  if (
    Joi.string()
      .uri({
        scheme: ['http', 'https'],
      })
      .validate(url).error
  ) {
    throw new Error('非法链接格式。');
  }

  await openUrl(url);
}
