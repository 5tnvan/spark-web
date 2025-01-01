export const calculatePoints = (longFormFires: Array<any>): number => {
  return longFormFires.reduce((totalPoints, entry) => {
    let points = 0;

    // Add points based on the reaction fields
    if (entry.spark) points += 1; // Spark = 1 point
    if (entry.fire) points += 2; // Fire = 2 points
    if (entry.supernova) points += 3; // Supernova = 3 points

    // Add the points for this entry to the total
    return totalPoints + points;
  }, 0);
};

export const calculateLongFormComments = (longFormComments: any) => {
  let totalComments = 0;

  if (longFormComments && Array.isArray(longFormComments)) {
    longFormComments.forEach(comment => {
      // Count the main comment
      totalComments++;

      // Count all replies to the comment
      if (comment.long_form_replies && Array.isArray(comment.long_form_replies)) {
        totalComments += comment.long_form_replies.length;
      }
    });
  }

  return totalComments;
};

export const calculateIdeaComments = (ideaComments: any) => {

  console.log("ideaComments", ideaComments);
  let totalComments = 0;

  if (ideaComments && Array.isArray(ideaComments)) {
    ideaComments.forEach(comment => {
      // Count the main comment
      totalComments++;

      // Count all replies to the comment
      if (comment.idea_replies && Array.isArray(comment.idea_replies)) {
        totalComments += comment.idea_replies.length;
      }
    });
  }

  return totalComments;
};

