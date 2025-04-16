
/**
 * Scrollt das Fenster nach oben, nützlich beim Navigieren zwischen Seiten
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
