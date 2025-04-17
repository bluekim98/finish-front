import type { paths } from '~/types/api';

export type Method = 'get' | 'post' | 'put' | 'delete';

/**
 * OAS 에서 정의한 특정 API [PATH][METHOD] 의 모든 응답 타입
 */
export type CaribbeanApiResponse = {
  [Path in keyof paths as Path extends `/${string}` ? Path : never]: {
    [Method in keyof paths[Path] as Lowercase<Method & string>]: paths[Path][Method];
  };
};

/**
 *  OAS 에서 정의한 특정 API [PATH][METHOD] 정상응답 responseBody
 */
export type CaribbeanApiResponseBody = {
  [Path in keyof paths as Path extends `/${string}` ? Path : never]: {
    [Method in keyof paths[Path] as Lowercase<Method & string>]: paths[Path][Method] extends {
      responses: { 200: { content: { 'application/json': infer R } } };
    }
      ? R
      : never;
  };
};

export type CaribbeanApiQueryParams = {
  [Path in keyof paths as Path extends `/${string}` ? Path : never]: {
    [Method in keyof paths[Path] as Lowercase<Method & string>]: paths[Path][Method] extends {
      parameters?: { query?: infer Q };
    }
      ? Q
      : never;
  };
};

export type CaribbeanApiRequestBody = {
  [Path in keyof paths as Path extends `/${string}` ? Path : never]: {
    [Method in keyof paths[Path] as Lowercase<Method & string>]: paths[Path][Method] extends {
      requestBody: { content: { 'application/json': infer R } };
    }
      ? R
      : never;
  };
};

export type CaribbeanApiPostRequestBody = {
  [Path in keyof paths as Path extends `/${string}` ? Path : never]: paths[Path] extends {
    post: { requestBody: { content: { 'application/json': infer R } } };
  }
    ? R
    : never;
};
