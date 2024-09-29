"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, getCategories, setSelectedCategory } from "./redux/slice";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./product.module.css";

function ProductList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { product, category, selectedCategory } = useSelector(
    (state: any) => state.products
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([dispatch(getProducts()), dispatch(getCategories())]);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    filterProducts();
  }, [product, selectedCategory, searchTerm]);

  useEffect(() => {
    loadMoreProducts();
  }, [filteredProducts, page]);

  const filterProducts = () => {
    let filtered = product;
    if (selectedCategory) {
      filtered = filtered.filter(
        (item: any) => item.category === selectedCategory
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((item: any) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    setPage(1);
    setDisplayedProducts([]);
  };

  const loadMoreProducts = () => {
    const startIndex = (page - 1) * 12;
    const endIndex = startIndex + 12;
    const newProducts = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts((prev) => [...prev, ...newProducts]);
    setHasMore(endIndex < filteredProducts.length);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value.toLowerCase();
    if (value === "") {
      dispatch(setSelectedCategory(null));
    } else {
      dispatch(setSelectedCategory(value));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParam(e.target.value);
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    filterProducts();
  };

  const updateSearchParam = (search: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (search) {
      newSearchParams.set("search", search);
    } else {
      newSearchParams.delete("search");
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
          <button className={styles.searchBtn} onClick={handleSearchClick}>
            Search
          </button>
        </div>
        <select
          className={styles.selectCategory}
          onChange={handleCategoryChange}
          value={selectedCategory || ""}
        >
          <option value="">All Categories</option>
          {category.length > 0 &&
            category.map((categorie: any, index: number) => (
              <option key={index} value={categorie.name}>
                {categorie.name}
              </option>
            ))}
        </select>
      </div>
      <div className={styles.subContainer}>
        {displayedProducts.length > 0 ? (
          displayedProducts.map((productItem: any, index: number) => (
            <div
              className={styles.card}
              key={productItem.id}
              ref={
                index === displayedProducts.length - 1
                  ? lastProductElementRef
                  : null
              }
            >
              <img src={productItem.images[0]} alt={productItem.title} />
              <div>{productItem.title}</div>
              <div>{productItem.price} &#x20B9;</div>
            </div>
          ))
        ) : (
          <div className={styles.message}>No products found</div>
        )}
        {loading && <div>Loading more...</div>}
      </div>
    </div>
  );
}

export default ProductList;
