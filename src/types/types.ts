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
  average?:number;
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
  recipe?:any
}

export interface RecipeCardType {
  page: string;
  recipe: RecipeType;
  index: number;
  currentUser: string | undefined;
  elementloading: string | number | null;
  updateRecipePublic: (id: string, data: boolean, i: number) => void;
  deleteFromSaved: (recipe: RecipeType) => void;
  // addToSaved: (recipe: RecipeType) => void;
}

//😃😎
