import { dbConnection, closeConnection } from './config/mongoConnections.js';
import { register, login } from './data/users.js';
import { uploadStudySpot } from './data/studySpots.js';
import { createReview } from './data/reviews.js';
import { addCommentToReview } from './data/reviews.js';
import { createComment } from './data/comments.js';
import { createForumPost, addCommentToForumPost } from './data/forumPosts.js';

try {
	// Prepare the database
	console.log("Opening a connection");
	const db = await dbConnection();
	await db.dropDatabase();

	// Seed the database
	console.log("Seeding database (This may take a while)");

	// Create users
	await register("student1@stevens.edu", "Student1!");
	const student1 = await login("student1@stevens.edu", "Student1!");

	await register("student2@stevens.edu", "Student2!");
	const student2 = await login("student2@stevens.edu", "Student2!");

	await register("student3@stevens.edu", "Student3!");
	const student3 = await login("student3@stevens.edu", "Student3!");

	// Upload study spots
	const spot1 = await uploadStudySpot(student1._id, "Library Quietest Floor", "This very quiet study spot is the perfect place to prepare you for finals!", "3rd floor of the library", ["printer"], 3);
	const spot2 = await uploadStudySpot(student1._id, "That One Big Horse", "Very windy, but what a memorable spot.", "Outside of the library", [], 1, "/public/uploads/horse.jpg");
	const spot3 = await uploadStudySpot(student1._id, "The Spooky Basement", "No one even knows where it is!", "Find it if you can", ["water fountain", "outlets"], 2);
	const spot4 = await uploadStudySpot(student2._id, "The Roof of the Library", "And you thought the 3rd floor was quiet!", "Library roof", ["outlets"], 3, "/public/uploads/roof.png");
	const spot5 = await uploadStudySpot(student2._id, "Your Room", "There's no beating your own safe space.", "You don't know? How..?", ["water fountain", "vending machine", "outlets"], 2);
	const spot6 = await uploadStudySpot(student3._id, "The Park", "I guess it's close enough to on-campus.", "Stevens Park", ["vending machine"], 2, "/public/uploads/stevens_park.png");

	// Review study spots
	await createReview(spot1._id, student2._id, "Soooo quiet!", "I can hear the paint drying", 5);
	const review2 = await createReview(spot1._id, student3._id, "Too quiet... it's eerie", "It's unsettling", 2);
	const review3 = await createReview(spot3._id, student3._id, "I can't find it", "Please tell me where it is", 2);
	await createReview(spot4._id, student1._id, "????????", "Hey you're not supposed to be up there!!", 1);

	// Comment on reviews
	await addCommentToReview(review2._id, student1._id, "How could you say that :(");
	await addCommentToReview(review3._id, student1._id, "No.");

	// Comment on study spots
	await createComment(spot2._id, student2._id, "Legend has it that touching the horse on the way to your finals will give you good luck");
	await createComment(spot5._id, student3._id, "I come to this website to get OUT of my room though...");
	await createComment(spot6._id, student1._id, "This is definitely not on campus");

	// Create forum posts
	const forum1 = await createForumPost(student1._id, "Who wants to study for the CS546 test?", "Pretty pleaseeeeeee");
	const forum2 = await createForumPost(student2._id, "Woah what's this feature?", "Is this the new Discord");
	const forum3 = await createForumPost(student1._id, "Why does no one want to study with me", "You are all ignoring me I just need a study buddy :(");
	const forum4 = await createForumPost(student3._id, "Hallo wie geht's?", "Auf wiedersehen");

	// Comment on forum posts
	await addCommentToForumPost(forum1._id, student1._id, "Hello..?");
	await addCommentToForumPost(forum1._id, student2._id, "That class doesn't even have tests...");
	await addCommentToForumPost(forum1._id, student3._id, "I'll study with you!!");
	await addCommentToForumPost(forum1._id, student2._id, "What are you even studying");
	await addCommentToForumPost(forum2._id, student2._id, "Ignored, just like on Discord...");
	await addCommentToForumPost(forum3._id, student2._id, "Do you mean you need help with the lab??");
	await addCommentToForumPost(forum3._id, student1._id, "No who mentioned a lab");
	await addCommentToForumPost(forum4._id, student2._id, "What");

	// Close the connection
	await closeConnection();
	console.log("Finished seeding database");
} catch (e) {
	console.error(e);
}