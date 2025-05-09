import { Router } from "express";
import { getAllStudySpots } from "../data/studySpots.js";
const router = Router();

router
  .route('/studyspots')
  .get(async(req,res) => {
    try {
      const allSpots = await getAllStudySpots()
      return res.render('studySpots/list', {spots: allSpots});
    } catch (e) {
      return res.status(400).render('studySpots/list', { error: e });
    }
  }) 

export default router;