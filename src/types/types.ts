export interface RecipeType {
  id: string;
  name: string;
  preparation: string;
  public?:boolean;
  time: string;
  userId: string;
  categories: Array<string>;
  usersShared:Array<string>;
  constituents: Array<ConstituentType>;
  images:Array<string>;
  opinions?:Array<OpinionType>;
}
export interface ConstituentType {
  ingredient: string;
  recipe: string;
  amount: string;
}
export interface OpinionType {
  opinion: string;
  review: number;
  userID: string;
  date?:Date;
}

//😃😎
