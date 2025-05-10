import { comments, forumPosts } from "../config/mongoCollections.js"
import { users } from "../config/mongoCollections.js"
import { ObjectId } from 'mongodb'; 
import { checkTitle, checkDescription } from "../helpers.js"

//NOTE: the better approach would to explicitly pass the stringed userId from req.session
async function getUserIdByEmail(email) {
  const userCollection = await users();
  const user = await userCollection.findOne({ email: email.toLowerCase() });
  if (!user) throw "User not found";
  return user._id;
}

export const forums = async (title, content, userEmail) => {
    title = checkTitle(title);
    content = checkDescription(content);
    const forumPostsCollection = await forumPosts();
    const userId = await getUserIdByEmail(userEmail);
    
    const newForumPost = {
        _id: new ObjectId(),
        userId: userId,
        title: title,
        content: content,
        createdAt: new Date(),
        comments: []
    }
    
    const insertInfo = await forumPostsCollection.insertOne(newForumPost);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add forum post';
    }
    
    return { id: newForumPost._id.toString() };
}

export const getAllForumPosts = async () => {
    const forumPostsCollection = await forumPosts();
    const allForumPosts = await forumPostsCollection.find({}).toArray();
    if (!allForumPosts) throw "Could not get all forum posts";
    
    return allForumPosts.map(post => ({
        id: post._id.toString(),
        userId: post.userId,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        comments: post.comments
    }));
}