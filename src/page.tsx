import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import './page.scss';

interface IPolygonParams {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Page = ({ }) => {
    const history = useHistory();
    const location = useLocation<string>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //const from = location?.state?.from || { pathname: '/' };

    const x = 100;
    const y = 100;
    const width = 114;
    const height = 108.3;

    useEffect(() => {
        if (location.state && canvasRef.current) {
            const ctx = canvasRef.current?.getContext('2d');
            console.log(ctx)
            const img = new Image();
            img.src = location.state;
            console.log(img)


            if (ctx) {
                ctx.fillStyle = "#FF0000";

                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    ctx.fillRect(x, y, width, height);
                    drawRectangle({ x, y, width, height }, ctx)
                }
                // ctx.fillRect(0, 0, 150, 75);

            }
        }
    }, [canvasRef, location]);

    console.log(location.state)




    const drawRectangle = (polygon: IPolygonParams, ctx: CanvasRenderingContext2D) => {
        const { x, y, width, height } = polygon;


        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    return (
        <div className='container'>
            <canvas ref={canvasRef} width={1202} height={1456} />

            {/* <img src={'/images/voy.jpeg'} alt={'voynich'} /> */}
        </div>
    );
};

export default Page;