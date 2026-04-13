import { Article } from "../articles/article.model";
import { AppError } from "../../common/utils/app-error";


function hasUser(list: unknown[], userId: string) {
    return list.some((id) => String(id) === userId);
}

export async function toggleLikeArticle(userId: string, slug: string) {
    const article = await Article.findOne({ slug }).populate(
        "author",
        "username email bio avatar"
    );

    if(!article) {
        throw new AppError("Article not found", 404);
    }

    const alreadyLiked = hasUser(article.likedBy as unknown[], userId);

    if(alreadyLiked) {
        article.likedBy = article.likedBy.filter((id) => String(id) != userId);
    }else {
        article.likedBy.push(userId as any);
    }

    article.likesCount = article.likedBy.length;
    await article.save();

    return {
        liked: !alreadyLiked,
        likesCount: article.likesCount,
    };
}

export async function toggleFavoriteArticle(userId: string, slug: string) {
    const article = await Article.findOne({ slug }).populate(
      "author",
      "username email bio avatar"
    );
  
    if (!article) {
      throw new AppError("Article not found", 404);
    }
  
    const alreadyFavorited = hasUser(article.favoritedBy as unknown[], userId);
  
    if (alreadyFavorited) {
      article.favoritedBy = article.favoritedBy.filter((id) => String(id) !== userId);
    } else {
      article.favoritedBy.push(userId as any);
    }
  
    article.favoritesCount = article.favoritedBy.length;
    await article.save();
  
    return {
      favorited: !alreadyFavorited,
      favoritesCount: article.favoritesCount,
    };
  }