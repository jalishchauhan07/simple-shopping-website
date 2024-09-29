import styles from "./page.module.css";
import ProductList from "./productList";
import StoreProvider from "./redux/storeProvider";

export default function Home() {
  return (
    <StoreProvider>
      <div className={styles.page}>
        <ProductList />
      </div>
    </StoreProvider>
  );
}
