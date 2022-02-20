import { Stage, Layer, Rect, Label, Tag, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import PageImage from './pageImage';
import { IMarking } from '../../types/general';
import { useState } from 'react';
import { useApi } from '../../api/restApi';

interface ICanvasProps {
    pageWidth: number;
    pageHeight: number;
    polygons: IMarking[] | undefined;
    pageName: string;
    pageId: number;
}

interface ITooltip {
    x: number;
    y: number;
    idx: number;
    markings?: IMarking[];
}

const Canvas: React.FC<ICanvasProps> = ({ pageHeight, pageWidth, polygons, pageName, pageId }) => {
    const [originalHeight, setOriginalHeight] = useState(1);
    const [originalWidth, setOriginalWidth] = useState(1);
    const [newWidth, setNewWidth] = useState(1);
    const [selectedTooltip, setSelectedTooltip] = useState<ITooltip | null>(null);
    const { markingsApi } = useApi();
    const [markings, setMarkings] = useState<IMarking[]>();
    const [canvasMode, setCanvasMode] = useState(false);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        var scaleBy = 1.02;
        var oldScale = e.currentTarget.scaleX();
        var pointer = e.currentTarget.getRelativePointerPosition();
        if (pointer) {
            var mousePointTo = {
                x: (pointer.x - e.currentTarget.x()) / oldScale,
                y: (pointer.y - e.currentTarget.y()) / oldScale,
            };

            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? -1 : 1;

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

    const showTooltip = () => {
        if (canvasMode) {
            
            // misto tooltipu treba by to slo jinak - zobrazit neco jineho
            if (selectedTooltip === null || !markings || ! markings.length) return null;

            const markingDescriptions = markings.map(item => item.description).join('\n');

            return (
            <Label x={selectedTooltip.x} y={selectedTooltip.y} opacity={0.75}>
                <Tag
                    fill={"black"}
                    pointerWidth={10}
                    pointerHeight={10}
                    lineJoin={"round"}
                    shadowColor={"black"}
                    shadowBlur={10}
                    shadowOffsetX={10}
                    shadowOffsetY={10}
                    shadowOpacity={0.2}
                />
                <Text text={markingDescriptions} fill={"white"} fontSize={18} padding={5} width={300} />
            </Label>);

        } else {
            if (selectedTooltip === null || !polygons) return null;

            return (
                <Label x={selectedTooltip.x} y={selectedTooltip.y} opacity={0.75}>
                    <Tag
                        fill={"black"}
                        pointerWidth={10}
                        pointerHeight={10}
                        lineJoin={"round"}
                        shadowColor={"black"}
                        shadowBlur={10}
                        shadowOffsetX={10}
                        shadowOffsetY={10}
                        shadowOpacity={0.2}
                    />
                    <Text text={polygons[selectedTooltip.idx].description} fill={"white"} fontSize={18} padding={5} width={300} />
                </Label>
            );
        }
    }

    function onMouseOver(evt: KonvaEventObject<MouseEvent>, idx: number) {
        var rectangle = evt.target.attrs;
        if (rectangle) {
            setSelectedTooltip({ x: rectangle.x + rectangle.width + 10, y: rectangle.y + rectangle.height / 2, idx });
        }
    }

    const handleCoordinatesClick = async (e) => {
        const { x, y } = e.currentTarget.getRelativePointerPosition();
        const newX = (originalWidth / newWidth) * x;
        const newY = (originalHeight / pageHeight) * y;
        if (newX && newY) {
            const coordinates = { x: newX, y: newY };
            const res = await markingsApi.getByCoordinates(pageId, coordinates);
            if (res.ok && res.data) {
                //TODO asi nebude ani potreba nastavovat takto
                setCanvasMode(true);
                setMarkings(res.data.items);
                setSelectedTooltip({ x, y, markings: res.data.items, idx: 0 });
                
            }
        }
    }

    return (
        //TODO make canvas sticky
        //TODO tlacitko na prepnuti canvasMode
        <Stage
            //TODO newWidth + 100 =? is 100 reasonable?
            width={pageWidth}
            height={pageHeight}
            onWheel={handleWheel}
            draggable={true}
            style={{}}
        >
            <Layer onClick={e => handleCoordinatesClick(e)}>
                <PageImage
                    imgSource={`/images/${pageName}`}
                    height={pageHeight}
                    setOriginalHeight={setOriginalHeight}
                    setOriginalWidth={setOriginalWidth}
                    setNewWidth={setNewWidth}
                />
                {!canvasMode &&
                    polygons?.map((polygon, idx) =>
                        <Rect
                            key={idx}
                            x={(newWidth / originalWidth) * polygon.x}
                            y={(pageHeight / originalHeight) * polygon.y}
                            width={(newWidth / originalWidth) * polygon.width}
                            height={(pageHeight / originalHeight) * polygon.height}
                            strokeWidth={1}
                            stroke="red"
                            shadowBlur={5}
                            onMouseOver={e => onMouseOver(e, idx)}
                            onMouseLeave={() => setSelectedTooltip(null)}
                        />
                    )}

            </Layer>
            <Layer>{showTooltip()}</Layer>
        </Stage>)
};

export default Canvas;