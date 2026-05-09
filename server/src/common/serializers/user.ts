export const PUBLIC_USER_SELECT = "username bio avatar";

export type PublicUserLike = {
  _id: unknown;
  username: string;
  bio?: string;
  avatar?: string;
};

export type PrivateUserLike = PublicUserLike & {
  email: string;
};

export function sanitizePublicUser(user: PublicUserLike) {
  return {
    id: String(user._id),
    username: user.username,
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
  };
}

export function sanitizePrivateUser(user: PrivateUserLike) {
  return {
    ...sanitizePublicUser(user),
    email: user.email,
  };
}
