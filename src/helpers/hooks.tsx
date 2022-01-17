// This exists specifically for react-hooks/exhaustive-deps to not trigger a semantic error
// every time you want to use useEffect to only fire once. Normally, it would complain
// about whatever props/state/.. you're using not being specified in the deps array.
// Note: Only use this if specifying proper dependencies would cause a problem, like an infinite loop.

import { useEffect } from "react";

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = func => useEffect(func, []);

export const useUnmountEffect = func => {
    const unmount = () => func;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(unmount, []);
};