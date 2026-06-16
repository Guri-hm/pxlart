import styles from "./overlay.module.css";

export default function Overlay() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loader}>
        <div className={styles.one}></div>
        <div className={styles.two}></div>
        <div className={styles.three}></div>
        <div className={styles.four}></div>
      </div>
    </div>
  );
}