import { Stage, Layer, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import PageImage from './pageImage';
import { IMarking } from '../../types/general';
import { useState } from 'react';

interface ICanvasProps {
    pageWidth: number;
    pageHeight: number;
    polygons: IMarking[] | undefined;
    pageName: string;
}

const Canvas: React.FC<ICanvasProps> = ({ pageHeight, pageWidth, polygons, pageName }) => {
    const [originalHeight, setOriginalHeight] = useState(1);
    const [originalWidth, setOriginalWidth] = useState(1);
    const [newWidth, setNewWidth] = useState(1);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        var scaleBy = 1.02;
        //current target je scale, target je rect
        var oldScale = e.currentTarget.scaleX();
        var pointer = e.currentTarget.getRelativePointerPosition();
        if (pointer) {
            var mousePointTo = {
                x: (pointer.x - e.currentTarget.x()) / oldScale,
                y: (pointer.y - e.currentTarget.y()) / oldScale,
            };
            //pointer je pozice mysi v obrazku
            console.log(pointer)
            console.log(mousePointTo);
            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? -1 : 1;
            //console.log('dir', direction)

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
                direction = -direction;
            }

            var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            e.currentTarget.scale({ x: newScale, y: newScale });

            var newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };

            e.currentTarget.position(newPos);
        }
    };

    return (
        <Stage
            width={pageWidth}
            height={pageHeight}
            onWheel={handleWheel}
            draggable={true}
        >
            <Layer>
                <PageImage
                    imgSource={`/images/${pageName}`}
                    height={pageHeight}
                    setOriginalHeight={setOriginalHeight}
                    setOriginalWidth={setOriginalWidth}
                    setNewWidth={setNewWidth}
                />
                {polygons?.map(polygon => <Rect
                    x={(newWidth / originalWidth) * polygon.x}
                    y={(pageHeight / originalHeight) * polygon.y}
                    width={(newWidth / originalWidth) *polygon.width}
                    height={(pageHeight / originalHeight) * polygon.height}
                    strokeWidth={1}
                    stroke="red"
                    shadowBlur={5}
                    onClick={() => console.log('ee')}
                    
                />)}
            </Layer>
        </Stage>)
};

export default Canvas;