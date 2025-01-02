// Update localstorage with whatever is input
const updateLSBasic = (lsKey: string, lsValue: string) => {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(lsKey, lsValue);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const retrieveLSBasic = (lsKey: string) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(localStorage.getItem(lsKey));
    } catch (error) {
      reject(error);
    }
  });
};

export { updateLSBasic, retrieveLSBasic };
