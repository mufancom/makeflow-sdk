import {FilterQuery} from 'mongodb';
import {Dict} from 'tslang';

interface Condition<T> {
  $exists?: boolean;
  $eq?: T;
  $gt?: T;
  $gte?: T;
  $in?: T[];
  $lt?: T;
  $lte?: T;
  $ne?: T;
  $nin?: T[];
  $and?: (FilterQuery<T> | T)[];
  $or?: (FilterQuery<T> | T)[];
  $not?: (FilterQuery<T> | T)[] | T;
  $expr?: any;
  $jsonSchema?: any;
  $mod?: [number, number];
  $regex?: RegExp;
  $options?: string;
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacraticSensitive?: boolean;
  };
  $where?: object;
  $geoIntersects?: object;
  $geoWithin?: object;
  $near?: object;
  $nearSphere?: object;
  $elemMatch?: object;
  $size?: number;
  $bitsAllClear?: object;
  $bitsAllSet?: object;
  $bitsAnyClear?: object;
  $bitsAnySet?: object;
}

type __FlattenQuerySourceObject<T> = T extends object
  ? FlattenQuerySourceObject<T>
  : never;

export type FlattenQuerySourceObject<T extends object> = {
  [TKey in keyof T]?:
    | T[TKey]
    | Condition<T[TKey]>
    | __FlattenQuerySourceObject<T[TKey]>
    | (T[TKey] extends (infer TElement)[] | undefined
        ? TElement | Condition<TElement> | __FlattenQuerySourceObject<TElement>
        : never);
};

/**
 * @param object object to flatten
 * @param omitUndefined whether to omit if value is undefined
 * @returns query object
 *
 * @example:
 * {
 *   fieldA: {
 *     fieldB: 'one'
 *   },
 *   fieldC: 'two'
 * }
 * {
 *   'fieldA.fieldB': 'one',
 *   fieldC: 'two'
 * }
 */
export function flattenObjectToQuery<T extends object>(
  object: FlattenQuerySourceObject<T>,
  omitUndefined = true,
): object {
  let query: Dict<unknown> = {};

  for (let [key, value] of Object.entries(object)) {
    if (omitUndefined && value === undefined) {
      continue;
    }

    if (key.startsWith('$')) {
      query[key] = value;
      continue;
    }

    let subQuery: Dict<any>;

    // if (value) to prevent null for this branch
    if (typeof value === 'object' && value) {
      subQuery = {};

      for (let [subKey, subValue] of Object.entries(
        flattenObjectToQuery(value, omitUndefined),
      )) {
        if (subKey.startsWith('$')) {
          if (!(subKey in subQuery)) {
            subQuery[key] = {};
          }

          subQuery[key][subKey] = subValue;
        } else {
          subQuery[`${key}.${subKey}`] = subValue;
        }
      }
    } else {
      subQuery = {[key]: value};
    }

    Object.assign(query, subQuery);
  }

  return query;
}
