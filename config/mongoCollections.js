import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
}


export const users = getCollectionFn('users')
export const studySpots = getCollectionFn('studySpots')
export const reviews = getCollectionFn('reviews')
export const comments = getCollectionFn('comments')
export const forumPosts = getCollectionFn('forumPosts')
export const reports = getCollectionFn('reports')
// privateMessages: getCollectionFn('privateMessages'), EXTRA FEATURE
