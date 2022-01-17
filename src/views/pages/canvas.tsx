import { Stage, Layer, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import PageImage from './pageImage';
import { IMarking, IPage } from '../../types/general';
import { useLocation } from 'react-router-dom';

interface ICanvasProps {
    pageWidth: number;
    pageHeight: number;
    polygons: IMarking[] | undefined;
}

const Canvas: React.FC<ICanvasProps> = ({ pageHeight, pageWidth, polygons }) => {
    const location = useLocation<IPage>();

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
        <Stage width={pageWidth} height={pageHeight} onWheel={handleWheel} draggable={true} >
            <Layer>
                <PageImage imgSource={`/images/${location.state.name}`} height={pageHeight} />
                {polygons?.map(polygon => <Rect
                    //TODO FIX THIS THING
                    x={polygon.x}
                    y={polygon.y}
                    width={polygon.width}
                    height={polygon.height}
                    strokeWidth={1}
                    stroke="red"
                    shadowBlur={5}
                    onClick={() => console.log('ee')}
                />)}
            </Layer>
        </Stage>)
};

export default Canvas;