import _ from 'lodash';
import {compare, intersects, lt, minVersion, satisfies} from 'semver';

import {PowerAppVersion, PowerAppVersionInfo} from '../types';

import {warning} from './log';

function matchVersionInfoIndex(
  version: string,
  infos: PowerAppVersionInfo[],
  initialIndex = infos.length - 1,
): number {
  for (let index = initialIndex; index >= 0; index--) {
    let {range} = infos[index];

    if (satisfies(version, range)) {
      return index;
    }
  }

  throw Error('没有匹配的版本');
}

export function getChangeAndMigrations<TChange>(
  comingVersion: string | undefined,
  savedVersion: string | undefined,
  infos: PowerAppVersionInfo[],
  getChange: (definition: PowerAppVersion.Definition) => TChange | undefined,
  getMigrations?: (
    type: keyof PowerAppVersion.Migrations,
    definitions: PowerAppVersion.Definition[],
  ) => PowerAppVersion.MigrationFunction[],
):
  | {
      change: TChange | undefined;
      migrations: PowerAppVersion.MigrationFunction[];
    }
  | undefined {
  if (!comingVersion) {
    return undefined;
  }

  let index = matchVersionInfoIndex(comingVersion, infos);

  let {range, definition} = infos[index];

  let change = getChange(definition);

  if (!savedVersion || !getMigrations || satisfies(savedVersion, range)) {
    return {
      change,
      migrations: [],
    };
  }

  return {
    change,
    migrations: lt(comingVersion, savedVersion)
      ? getMigrations(
          'down',
          _.reverse(
            _.slice(
              infos,
              index + 1,
              matchVersionInfoIndex(savedVersion, infos) + 1,
            ),
          ).map(info => info.definition),
        )
      : getMigrations(
          'up',
          _.slice(
            infos,
            matchVersionInfoIndex(savedVersion, infos, index) + 1,
            index + 1,
          ).map(info => info.definition),
        ),
  };
}

export function checkVersionsQualified(
  _definitions: PowerAppVersionInfo[],
): PowerAppVersionInfo[] {
  let definitions = _.clone(_definitions);

  if (!definitions.length) {
    throw Error('至少需要一个版本定义');
  }

  let intersectionDefinitions = _.intersectionWith(
    definitions,
    definitions,
    ({range: ra}, {range: rb}) => !_.isEqual(ra, rb) && intersects(ra, rb),
  );

  if (intersectionDefinitions.length) {
    throw Error('版本定义有交集');
  }

  definitions = definitions.sort(({range: ra}, {range: rb}) =>
    compare(minVersion(ra)!, minVersion(rb)!),
  );

  let headInfo = definitions[0];

  if (headInfo.definition.ancestor) {
    warning(`${headInfo.range} 不应该有 ancestor`);
  }

  for (let index = 1; index < definitions.length; index++) {
    let info = definitions[index];

    let ancestor = info.definition.ancestor;

    if (!ancestor) {
      warning(`${info.range} 未指定 ancestor`);
      continue;
    }

    if (ancestor !== definitions[index - 1].range) {
      warning(`${headInfo.range} 的 ancestor 不是前一个版本的版本号`);
    }
  }

  return definitions;
}
