// copy from https://github.com/personalizedrefrigerator/joplin-plugin-diff-tool/blob/main/src/pickNote/
const debounce = (fn: () => void, timeoutMs: number) => {
  let timeoutRef: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    timeoutRef = setTimeout(() => {
      timeoutRef = null;
      fn();
    }, timeoutMs);
  };
};

export default debounce;
