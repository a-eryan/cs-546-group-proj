import { forumPosts } from "../config/mongoCollections.js"
import { users } from "../config/mongoCollections.js"
import { ObjectId } from 'mongodb'; 
import { checkTitle, checkDescription, checkID } from "../helpers.js"

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
        createdAt: new Date().toLocaleString(),
        comments: []
    }
    
    const insertInfo = await forumPostsCollection.insertOne(newForumPost);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add forum post';
    }
    
    return { id: newForumPost._id.toString() };
}

export const getForumPostById = async (id) => {
    if (!id) throw "You must provide an id";
    if (typeof id !== 'string') throw "Id must be a string";
    
    const forumPostsCollection = await forumPosts();
    const forumPost = await forumPostsCollection.findOne({ _id: new ObjectId(id) });
    if (!forumPost) throw "Forum post not found";
    
    return {
        _id: forumPost._id.toString(),
        userId: forumPost.userId,
        title: forumPost.title,
        content: forumPost.content,
        createdAt: forumPost.createdAt,
        comments: forumPost.comments
    };
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

export const findEmailById = async (id) => {
    if (!id) throw "You must provide an id";
    if (typeof id !== 'string') throw "Id must be a string";
    
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "User not found";
    return {
        email: user.email
    };
}

export const addCommentToForumPost = async (forumId, comment, userId) => {
    const isOnlyWhiteSpace = /^\s*$/.test(comment);
    if (!comment || isOnlyWhiteSpace === 0) throw "Comment cannot be empty";
    if (!forumId) throw "You must provide a forum post id";
    if (!userId) throw "You must provide a user id";
    
    let authorEmail;
    try {
        const author = await findEmailById(userId);
        authorEmail = author.email;
    } catch (e) {
        authorEmail = "Unknown user";
    }

    const forumPostsCollection = await forumPosts();
    const newComment = {
        _id: new ObjectId(),
        content: comment,           // Change to text to match your template
        createdAt: new Date().toLocaleString(),
        author: authorEmail
    };

    const updatedInfo = await forumPostsCollection.updateOne(
        { _id: new ObjectId(forumId) },
        { $push: { comments: newComment } }
    );
    
    if (updatedInfo.modifiedCount === 0) {
        throw "We're sorry, we couldn't add your comment";
    }

		// Check if the user has made 5 or more comments
		let totalComments = 0;
		const allForumPosts = await getAllForumPosts();

		for (const post of allForumPosts) {
			if (post.comments && Array.isArray(post.comments)) {
				const userComments = post.comments.filter(comment => comment.author === authorEmail);
				totalComments += userComments.length;
			}
		}

		// Add the Study Spotter achievement if they have
		if (totalComments >= 5) {
			const usersCollection = await users();
			const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

			if (!user)
				return newComment;

			const hasAchievement = user.achievements && user.achievements.includes('Big Talker');
			if (!hasAchievement) {
				await usersCollection.updateOne(
					{ _id: new ObjectId(userId) },
					{ $push: { achievements: 'Big Talker' } }
				);
			}
		}
    
    return newComment;
}

export const deleteForumPost = async (forumId, userId, isAdmin=false) => {
    forumId = checkID(forumId);
    userId = checkID(userId);

    const forumCollection = await forumPosts();

    const post = await forumCollection.findOne({_id:new ObjectId(forumId)});

    if (!post){
        throw "Forum post not found";
    }

    if (post.userId.toString() !== userId && !isAdmin){
        throw "You are not authorized to delete this post";
    }
  
    const result = await forumCollection.deleteOne({_id:new ObjectId(forumId)});

    if (!result.acknowledged){
      throw "Could not delete forum post";
    }
  
    return {deleted:true};
};

export const editForumPost = async (forumId, title, content, userId, isAdmin=false) => {
    if (!forumId) throw "You must provide a forum post id";
    if (!ObjectId.isValid(forumId)) throw "Invalid forum post ID";
    
    title = checkTitle(title);
    content = checkDescription(content);
    
    const forumPostsCollection = await forumPosts();
    
    const post = await forumPostsCollection.findOne({ _id: new ObjectId(forumId) });
    if (!post) throw "Forum post not found";
    
    if (post.userId.toString() !== userId.toString()) {
        throw "You are not authorized to edit this post";
    }
    
    const updateInfo = await forumPostsCollection.updateOne(
        { _id: new ObjectId(forumId) },
        { 
            $set: { 
                title: title,
                content: content,
                updatedAt: new Date().toLocaleString()
            } 
        }
    );
    
    if (updateInfo.modifiedCount === 0) {
        throw "Could not update forum post";
    }
    
    return {updated: true};
}