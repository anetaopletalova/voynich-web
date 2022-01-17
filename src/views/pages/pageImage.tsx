import { useEffect, useState } from "react";
import { useMountEffect } from "../../helpers/hooks";
import { Image } from 'react-konva';

interface IPageImageProps {
    imgSource: string,
    height: number,
}

const PageImage: React.FC<IPageImageProps> = ({ imgSource, height }) => {
    const [img, setImg] = useState<any>();
    const [newWidth, setNewWidth] = useState<number>();

    useMountEffect(() => {
        const image = new window.Image();
        image.src = imgSource;
        image.onload = () => {
            setImg(image);

        };
    });

    useEffect(() => {
        if (img) {
            const ratio = img.height / img.width;
            console.log(img.height);
            const scaledWidth = height / ratio;
            setNewWidth(scaledWidth);
        }
    }, [img, height])

    return (img ? <Image image={img} height={height} width={newWidth} /> : null);
}

export default PageImage;