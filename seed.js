import { dbConnection} from "./config/mongoConnections";
import { createComment, removeComment } from "./data/comments";
import { createForumPost, removeForumPost } from "./data/forumPosts";
import { uploadStudySpot, removeStudySpot } from "./data/studySpots";
import { createUser, removeUser } from "./data/users";

main = async () => {
    const db = await dbConnection();
    await db.dropDatabase(); //clear existing  data
}