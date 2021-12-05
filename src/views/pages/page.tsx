import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { useApi } from '../../api/restApi';
import ClassificationAccordion from '../../components/accordion';
import { useAuth } from '../../context/auth';
import { useMountEffect } from '../../helpers/hooks';
import { IPage, IPageClassification } from '../../types/general';
import './page.scss';


const Page = () => {
    const location = useLocation<IPage>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { pagesApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
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

    }, [])

    useEffect(() => {
        if (location.state && canvasRef.current) {
            const ctx = canvasRef.current?.getContext('2d');
            setCtx(ctx);
            const img = new Image();
            img.src = `/images/${location.state.name}`;

            if (ctx) {
                ctx.fillStyle = "#FF0000";

                img.onload = () => {
                    ctx.canvas.width = img.width;
                    ctx.canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                   
                    
                }
            }
        }
    }, [canvasRef, location]);

    useEffect(() => {
        if (ctx){
            if (selectedClassification) {
                selectedClassification.markings.forEach(item => {
                    console.log('draw', item)
                    const { x, y, width, height } = item;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + height);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = 'green';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                })
            } else {
                console.log('clear')
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                const img = new Image();
                img.src = `/images/${location.state.name}`;
                img.onload = () => {
                    console.log(img.width, img.height);
                    ctx.drawImage(img, 0, 0);
                }
            }
        }
    }, [ctx, selectedClassification])


return (
    <div className='page-detail'>
        <canvas ref={canvasRef} className='canvas' width={1202} height={1456} />

        {/* <img src={'/images/voy.jpeg'} alt={'voynich'} /> */}
        <ClassificationAccordion classifications={classifications} onClassificationSelect={setSelectedClassification} />
    </div>
);
};

export default Page;