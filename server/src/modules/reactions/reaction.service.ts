import { Article } from "../articles/article.model";
import { AppError } from "../../common/utils/app-error";
import { ReactionEvent } from "./reaction-event.model";


function hasUser(list: unknown[], userId: string) {
    return list.some((id) => String(id) === userId);
}

function articleAuthorId(article: { author: unknown }): string {
    const a = article.author;
    if (a && typeof a === "object" && "_id" in a) {
        return String((a as { _id: unknown })._id);
    }
    return String(a);
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
        await ReactionEvent.deleteOne({
            article: article._id,
            user: userId,
            type: "like",
        });
    } else {
        article.likedBy.push(userId as any);
        if (articleAuthorId(article) !== userId) {
            await ReactionEvent.updateOne(
                {
                    article: article._id,
                    user: userId,
                    type: "like",
                },
                {
                    $setOnInsert: {
                        article: article._id,
                        articleAuthor: article.author,
                        user: userId,
                        type: "like",
                    },
                },
                { upsert: true }
            );
        }
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
      await ReactionEvent.deleteOne({
        article: article._id,
        user: userId,
        type: "favorite",
      });
    } else {
      article.favoritedBy.push(userId as any);
      if (articleAuthorId(article) !== userId) {
        await ReactionEvent.updateOne(
          {
            article: article._id,
            user: userId,
            type: "favorite",
          },
          {
            $setOnInsert: {
              article: article._id,
              articleAuthor: article.author,
              user: userId,
              type: "favorite",
            },
          },
          { upsert: true }
        );
      }
    }
  
    article.favoritesCount = article.favoritedBy.length;
    await article.save();
  
    return {
      favorited: !alreadyFavorited,
      favoritesCount: article.favoritesCount,
    };
  }