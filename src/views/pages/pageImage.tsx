import { useEffect, useState } from "react";
import { Image } from 'react-konva';

interface IPageImageProps {
    imgSource: string,
    height: number,
    setOriginalHeight: (height: number) => void,
    setOriginalWidth: (width: number) => void,
    setNewWidth: (width: number) => void,
}

const PageImage: React.FC<IPageImageProps> = ({ imgSource, height, setOriginalHeight, setOriginalWidth, setNewWidth }) => {
    const [img, setImg] = useState<any>();
    const [scaledWidth, setScaledWidth] = useState<number>();

    useEffect(() => {
        const image = new window.Image();
        image.src = imgSource;
        image.onload = () => {
            setImg(image);
        };
    }, [imgSource]);

    useEffect(() => {
        if (img) {
            console.log('reloaded');
            const ratio = img.height / img.width;
            setOriginalHeight(img.height);
            const scaledWidth = height / ratio;
            setOriginalWidth(img.width);
            setNewWidth(scaledWidth);
            setScaledWidth(scaledWidth);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [img, height])

    return (img ? <Image image={img} height={height} width={scaledWidth} /> : null);
}

export default PageImage;