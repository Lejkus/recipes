import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { OpinionType } from "../types/types";
import { db } from "../config/firebase";

export async function averageOpinions(id: string) {
  try {
    const recipeDocRef = doc(collection(db, "recipes"), id);
    const opinionsQuerySnapshot = await getDocs(
      query(collection(db, "opinions"), where("recipe", "==", recipeDocRef))
    );
    const opinions: OpinionType[] = [];

    opinionsQuerySnapshot.forEach((doc) => {
      const opinionData = doc.data() as OpinionType;
      //delete opinionData.recipe;
      opinions.push(opinionData);
    });

    const totalRating = opinions.reduce(
      (sum, opinion) => sum + opinion.review,
      0
    );
    const average = totalRating / opinions.length;

    return { average, opinions };
  } catch (error) {
    return null;
  }
}
