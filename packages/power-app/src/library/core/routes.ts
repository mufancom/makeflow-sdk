import {
  PowerAppHandlerReturn,
  PowerAppRoute,
} from '@makeflow/power-app-server-adapter';
import _ from 'lodash';

import {PowerApp} from '../app';

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

export type RouteHandler = Parameters<typeof handlerCatcher>[1];

export function buildRoutes(app: PowerApp): PowerAppRoute[] {
  const handlerWrapper = (handler: RouteHandler): PowerAppRoute['handler'] => {
    let sources = _.castArray(app.options.source);

    return async (request): Promise<PowerAppHandlerReturn> => {
      let {body} = request;

      if (!body.source) {
        return {
          error: {
            status: 400,
            msg: 'Invalid request !',
          },
        };
      }

      if (
        sources.length &&
        sources.every(source => !_.isEqual(source.token, body.source.token))
      ) {
        return {
          error: {
            status: 403,
            msg: 'Permission denied !',
          },
        };
      }

      return {
        data: await handlerCatcher(app, handler)(request),
      };
    };
  };

  return [
    {
      type: 'installation',
      path: [
        'installation',
        {
          name: 'type',
        },
      ],
      handler: handlerWrapper(installationHandler),
    },
    {
      type: 'power-item',
      path: [
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
      handler: handlerWrapper(powerItemHandler),
    },
    {
      type: 'power-node',
      path: [
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
      handler: handlerWrapper(powerNodeHandler),
    },
    {
      type: 'power-glance',
      path: [
        'power-glance',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerWrapper(powerGlanceHandler),
    },
    {
      type: 'power-custom-checkable-item',
      path: [
        'power-custom-checkable-item',
        {
          name: 'name',
        },
      ],
      handler: handlerWrapper(powerCustomCheckableItemHandler),
    },
    {
      type: 'page',
      path: [
        'page',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerWrapper(pageHandler),
    },
    {
      type: 'data-source',
      path: [
        'data-source',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerWrapper(dataSourceHandler),
    },
    {
      type: 'field-source',
      path: [
        'procedure-field',
        {
          name: 'name',
        },
        {
          name: 'type',
        },
      ],
      handler: handlerWrapper(fieldSourceHandler),
    },
  ];
}
