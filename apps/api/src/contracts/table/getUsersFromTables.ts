import { ObjectID } from 'mongodb';
import * as R from 'remeda';
import { TableModel } from '../../collections/Table';
import { UserCollection, UserModel } from '../../collections/User';

async function _getUsersByIds(ids: ObjectID[]): Promise<UserModel[]> {
  if (!ids.length) {
    return [];
  }
  return UserCollection.find({
    _id: { $in: ids },
  }).toArray();
}

export async function getUsersFromTables(items: TableModel[]) {
  const allUserIds = R.pipe(
    items,
    R.flatMap(x => x.players),
    R.map(x => x.userId),
    R.uniq()
  );

  const users = await _getUsersByIds(allUserIds);
  const userMap = R.indexBy(users, x => x._id);
  return { users, userMap };
}
