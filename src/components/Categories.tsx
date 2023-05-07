import { useEffect, useRef, useState } from 'react';

interface CategoriesProps {
  allCategories: string[];
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Categories({ allCategories, categories, setCategories }: CategoriesProps) {

  const handleCategoryClick = (category: string) => {
    if (categories.includes(category)) {
      setCategories((oldArray: string[]) => oldArray.filter(item => item !== category));
    } else {
      setCategories((oldArray: string[]) => [...oldArray, category]);
    }
  };

  return (
    <>
      <div className='categories-container' >
        <button className={categories.length === 0 ? 'categories-button-active' : 'categories-button '} onClick={() => setCategories([])}>Wszystkie</button>
        {allCategories.map((category, i) => {
          return <button key={i} className={categories.includes(category) ? 'categories-button-active' : 'categories-button'} onClick={() => handleCategoryClick(category)}>{category}</button>
        })}
      </div>
    </>
  );
}
