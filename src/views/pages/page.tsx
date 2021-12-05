import { Theme, useTheme } from '@emotion/react';
import { flexbox, style } from '@mui/system';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../api/restApi';
import ClassificationAccordion from '../../components/accordion';
import { useMountEffect } from '../../helpers/hooks';
import { IPage, IPageClassification } from '../../types/general';

const Page = () => {
    const location = useLocation<IPage>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLCanvasElement>(null);
    const { pagesApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    const [drawCtx, setDrawCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [imgWidth, setImgWidth] = useState<number>();
    const [imgHeight, setImgHeight] = useState<number>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme, imgHeight && imgHeight * 0.7, imgWidth && imgWidth * 0.7), [theme, imgHeight, imgWidth]);


    useMountEffect(() => {
        const loadClassifications = async (pageId: number) => {
            const res = await pagesApi.get(pageId);
            if (res.ok && res.data) {
                setClassifications(res.data.pageClassifications)
            }
        }

        const pageId = location.state.id;
        if (pageId) {
            loadClassifications(pageId);
        }
    })

    useEffect(() => {
        if (location.state && imageRef.current) {
            const ctx = imageRef.current?.getContext('2d');
            const img = new Image();
            img.src = `/images/${location.state.name}`;

            if (ctx) {
                img.onload = () => {      
                    ctx.canvas.width = img.width;
                    ctx.canvas.height = img.height;
                    setImgHeight(img.height);
                    setImgWidth(img.width);
                    ctx.drawImage(img, 0, 0);
                }
            }
        }
    }, [imageRef, location]);

    useEffect(() => {
        const drawContext = canvasRef.current?.getContext('2d');
        if (drawContext && imgHeight && imgWidth) {
            drawContext.canvas.width = imgWidth;
            drawContext.canvas.height = imgHeight;
            setDrawCtx(drawContext);
        }
    }, [imgWidth, imgHeight, canvasRef])

    useEffect(() => {
        if (drawCtx) {
            drawCtx.clearRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height);
            if (selectedClassification) {
                selectedClassification.markings.forEach(item => {
                    console.log('draw', item)
                    const { x, y, width, height } = item;
                    drawCtx.beginPath();
                    drawCtx.moveTo(x, y);
                    drawCtx.lineTo(x, y + height);
                    drawCtx.lineTo(x + width, y + height);
                    drawCtx.lineTo(x + width, y);
                    drawCtx.lineTo(x, y);
                    drawCtx.strokeStyle = 'green';
                    drawCtx.lineWidth = 2;
                    drawCtx.stroke();
                })
            }
        }
    }, [drawCtx, selectedClassification])


    return (
        <div style={styles.content as React.CSSProperties}>
            <div style={styles.canvasWrapper as React.CSSProperties}>
                <canvas ref={imageRef} width={imgWidth} height={imgHeight} style={styles.canvas as React.CSSProperties} />
                <canvas ref={canvasRef} width={imgWidth} height={imgHeight} style={styles.drawCanvas as React.CSSProperties} />
            </div>
            <div style={styles.accordionContainer}>
                <ClassificationAccordion classifications={classifications} onClassificationSelect={setSelectedClassification} />
            </div>
        </div>
    );
};

const createStyles = (theme, imgHeight, imgWidth) => (
    {
        canvasWrapper: {
            transform: 'scale(0.7)',
            // width: imgWidth,
            // height: imgHeight,
        },
        canvas: {
            position: 'absolute',
            top: 20,
            left: 50,
        },
        drawCanvas: {
            position: 'absolute',
            top: 20,
            left: 50,
            zIndex: 10,
        },
        content: {
            display: 'flex',
            justifyContent: 'space-between',
            marginRight: '20px',
            marginLeft: '20px,'
        },
        accordionContainer: {
            marginTop: '25px',
            width: '500px',
        },
    }
);

export default Page;