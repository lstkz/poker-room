import * as R from 'remeda';
import { Router } from 'express';
import { wrapExpress } from './wrapExpress';
import { BadRequestError, ForbiddenError, UnauthorizedError } from './errors';
import { logger } from './logger';
import { Handler } from '../types';
import { AccessTokenCollection } from '../collections/AccessToken';
import { ObjectID } from 'mongodb';
import { UserCollection } from '../collections/User';
import { getBindings } from './bindings';

export default function loadRoutes(router: Router) {
  const bindings = getBindings('rpc');
  bindings.forEach(options => {
    const actions: Handler[] = [
      async (req, res, next) => {
        const token = req.header('x-token');
        if (!token) {
          return next();
        }
        try {
          const tokenEntity = await AccessTokenCollection.findOne({
            _id: token,
          });
          if (!tokenEntity) {
            return next(new UnauthorizedError('invalid token'));
          }
          const user = await UserCollection.findOneOrThrow({
            _id: ObjectID.createFromHexString(tokenEntity.userId),
          });
          req.user = {
            id: user._id.toHexString(),
            username: user.username,
            isAdmin: user.isAdmin ?? false,
            bankroll: user.bankroll,
          };
          next();
        } catch (e) {
          next(e);
        }
      },
      (req, res, next) => {
        if (options.public) {
          next();
          return;
        }
        if (!req.user) {
          next(new UnauthorizedError('Bearer token required'));
          return;
        }
        if (!req.user.isAdmin && options.admin) {
          next(new ForbiddenError('Admin only'));
          return;
        }
        next();
      },
    ];
    if (process.env.NODE_ENV !== 'test') {
      logger.info(
        `${options.public ? '[Public]' : '[Auth]'} ${options.signature}`
      );
    }
    actions.push((req, res, next) => {
      if (req.body == null) {
        req.body = {};
      } else if (typeof req.body !== 'object') {
        next(new BadRequestError('Body must be an object'));
        return;
      }
      const params = options.handler.getParams();
      if (options.injectUser) {
        params.shift();
      }
      const diff = R.difference(Object.keys(req.body), params);
      if (diff.length) {
        next(
          new BadRequestError(
            'Following params are not allowed: ' + diff.join(', ')
          )
        );
        return;
      }
      const values = params.map(x => req.body[x]);
      if (options.injectUser) {
        values.unshift(req.user);
      }
      Promise.resolve(options.handler(...values))
        .then(ret => {
          res.json(ret);
        })
        .catch(next);
    });
    router.post('/' + options.signature, wrapExpress(actions) as any);
  });
}
