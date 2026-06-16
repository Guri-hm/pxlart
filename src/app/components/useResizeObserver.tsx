import { useEffect } from 'react'

const useResizeObserver = (elements: any, callback: any) => {
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            callback(entries);
        });

        for (const elem of elements) {
            elem.current && resizeObserver.observe(elem.current);
        }

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line
    }, []);
};

export default useResizeObserver