import loadable from '@loadable/component';

const Basic = loadable(() => import('./@basic'));
const Configs = loadable(() => import('./@configs'));
const DataSources = loadable(() => import('./@data-sources'));
const Fields = loadable(() => import('./@fields'));
const Pages = loadable(() => import('./@pages'));
const PowerItems = loadable(() => import('./@power-items'));
const PowerNodes = loadable(() => import('./@power-nodes'));
const PowerGlances = loadable(() => import('./@power-glances'));
const PowerCustomCheckableItems = loadable(
  () => import('./@power-custom-checkable-items'),
);
const Resources = loadable(() => import('./@resources'));

export const Components = {
  Basic,
  Configs,
  DataSources,
  Fields,
  Pages,
  PowerItems,
  PowerNodes,
  PowerGlances,
  PowerCustomCheckableItems,
  Resources,
};
