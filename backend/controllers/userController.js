import sql from "../configs/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth;

    const creations =
      await sql`SELECT * from creations where user_id=${userId} ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations =
      await sql`SELECT * from creations where publish = true ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.body;
    const [creation] = await sql`SELECT * from creations where id=${id}`;
    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }
    const currentLikes = creation.likes;
    const userIdStr = userId.toString();
    let message = "";
    let updatedLikes = [];
    if (currentLikes.includes(userIdStr)) {
      // Unlike
      updatedLikes = currentLikes.filter((uid) => uid !== userIdStr);
      message = "Creation unliked";
    } else {
      // Like
      
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }
    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes=${formattedArray}::text[] where id=${id}`;
    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
