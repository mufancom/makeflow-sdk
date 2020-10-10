import {PowerAppRoute} from '@makeflow/power-app-server-adapter';

import {PowerApp} from '../app';

import {ContextType} from './context';
import {
  dataSourceHandler,
  fieldSourceHandler,
  installationHandler,
  pageHandler,
  powerCustomCheckableItemHandler,
  powerGlanceHandler,
  powerItemHandler,
  powerNodeHandler,
} from './handler';
import {handlerCatcher} from './utils';

export function buildRoutes(
  app: PowerApp,
): PowerAppRoute<ContextType, any, any, any>[] {
  return [
    {
      type: 'installation',
      paths: [
        'installation',
        {
          name: 'type',
        },
      ],
      handler: handlerCatcher(app, installationHandler),
    },
    {
      type: 'power-item',
      paths: [
        'power-item',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
        {
          name: 'action',
          optional: true,
        },
      ],
      handler: handlerCatcher(app, powerItemHandler),
    },
    {
      type: 'power-node',
      paths: [
        'power-node',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
        {
          name: 'action',
          optional: true,
        },
      ],
      handler: handlerCatcher(app, powerNodeHandler),
    },
    {
      type: 'power-glance',
      paths: [
        'power-glance',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerCatcher(app, powerGlanceHandler),
    },
    {
      type: 'power-custom-checkable-item',
      paths: [
        'power-custom-checkable-item',
        {
          name: 'name',
        },
      ],
      handler: handlerCatcher(app, powerCustomCheckableItemHandler),
    },
    {
      type: 'page',
      paths: [
        'page',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerCatcher(app, pageHandler),
    },
    {
      type: 'data-source',
      paths: [
        'data-source',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerCatcher(app, dataSourceHandler),
    },
    {
      type: 'field-source',
      paths: [
        'procedure-field',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerCatcher(app, fieldSourceHandler),
    },
  ];
}
