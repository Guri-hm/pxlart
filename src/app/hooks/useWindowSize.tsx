import React, { useLayoutEffect, useState } from "react";

const useWindowSize = (): number[] => {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        const updateSize = (): void => {
            setSize([window.innerWidth, window.innerHeight]);

            //デバイスの画面の高さ（1vh）を算出する関数
            //スマホはアドレスバーなどで画面の高さが変更するため、100vhの高さを動的に計算 
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        window.addEventListener("resize", updateSize);
        updateSize();

        return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
};
export default useWindowSize;