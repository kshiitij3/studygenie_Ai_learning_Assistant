import Document from "../models/Document";
import FlashCard from "../models/Flashcard";
import Quiz from "../models/Quiz";
//@desc Get user statistics
//@route GET/api/progress/dashboard
//@access Private
export const getDashboard = async(req, res, next) =>{ 
  try {
    const userId = req.user._id;
    }catch(error){
    next(error);
  }
}
