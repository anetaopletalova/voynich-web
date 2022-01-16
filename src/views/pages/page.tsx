import { useTheme } from '@emotion/react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../api/restApi';
import ClassificationAccordion from '../../components/accordion';
import { useMountEffect } from '../../helpers/hooks';
import { IClassificationParameters, IMarking, IPage, IPageClassification } from '../../types/general';
import { Stage, Layer, Rect, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Checkbox, IconButton, TextField } from '@mui/material';
import { useAuth } from '../../context/auth';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { toServerDateFormat } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';


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


const Page = () => {
    const location = useLocation<IPage>();
    // const canvasRef = useRef<HTMLCanvasElement>(null);
    // const imageRef = useRef<HTMLCanvasElement>(null);
    const { classificationApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    // const [drawCtx, setDrawCtx] = useState<CanvasRenderingContext2D | null>(null);
    // const [imgWidth, setImgWidth] = useState<number>();
    const [imgHeight, setImgHeight] = useState<number>();
    const [polygons, setPolygons] = useState<IMarking[]>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(), []);
    const [pageHeight, setPageHeight] = useState(window.innerHeight);
    const [pageWidth, setPageWidth] = useState(0);
    const [page, setPage] = useState(0);
    const pageId = location.state.id;
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const { authState } = useAuth();
    const defaultParams = { pageId, page, dateTo: toServerDateFormat(dateTo) };


    //TODO probably rfc into just one endpoint with different params for filters
    const loadClassifications = async (page: number, params: IClassificationParameters = defaultParams) => {
        if (pageId && authState) {
            const res = await classificationApi.getByPageId(authState.userId, params);
            if (res.ok && res.data) {
                // console.log(res.data.items);
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
                //TODO asi neni potreba, kdyz klikam v pagination
                //setPage(prev => prev++);
            }
        }
    }

    const loadClassificationsWithNote = async (page: number) => {
        if (authState) {
            const res = await classificationApi.getByPageId(authState.userId, { pageId, page, dateTo: toServerDateFormat(dateTo), withNote: true });
            if (res.ok && res.data) {
                // console.log(res.data.items);
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
                //TODO asi neni potreba, kdyz klikam v pagination
                //setPage(prev => prev++);
            }
        }
    }

    const loadFavoriteClassifications = async (page: number) => {
        if (authState) {
            const res = await classificationApi.getByPageId(authState.userId, { pageId, page, dateTo: toServerDateFormat(dateTo), favorite: true });
            if (res.ok && res.data) {
                // console.log(res.data.items);
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
                //TODO asi neni potreba, kdyz klikam v pagination
                //setPage(prev => prev++);
            }
        }
    }

    useMountEffect(() => {
        loadClassifications(page);
    })

    useEffect(() => {
        selectedClassification && setPolygons(selectedClassification.markings);
    }, [selectedClassification])


    //TODO all filtering here
    useEffect(() => {
        setPage(0);
        let params: IClassificationParameters = defaultParams;
        if (onlyWithNote) {
            params = { pageId, page, dateTo: toServerDateFormat(dateTo), withNote: true };
        } else if (onlyFavorite) {
            params = { pageId, page, dateTo: toServerDateFormat(dateTo), favorite: true };
        } 
        loadClassifications(0, params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyWithNote, onlyFavorite, dateTo])


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

    useLayoutEffect(() => {
        const updateSize = () => {
            console.log(document.querySelector('#page')?.clientWidth);
            setPageWidth(document.querySelector('#page')?.clientWidth || 0);
            setPageHeight(window.innerHeight - 64);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [])


    return (
        <div style={styles.content as React.CSSProperties}>
            <div id='page' style={styles.pageContent}>
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
                </Stage>
            </div>
            <div style={styles.accordionContainer}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Select date to"
                        value={dateTo}
                        onChange={(newValue) => {
                            newValue && setDateTo(newValue);
                            console.log(newValue)
                        }}
                        renderInput={(params) => <TextField {...params} />
                        }
                    />
                </LocalizationProvider>
                <IconButton
                    color='primary'
                    onClick={() => setDateTo(new Date())}
                    component="span"
                //style={styles.addNoteIcon as React.CSSProperties}
                >
                    <CloseIcon />
                </IconButton>
                <div>With note only</div>
                <Checkbox
                    checked={onlyWithNote}
                    onChange={() => {
                        setOnlyFavorite(false);
                        setOnlyWithNote(!onlyWithNote);
                    }}

                //inputProps={{ 'aria-label': 'controlled' }}
                />
                <div>Favorite</div>
                <Checkbox
                    checked={onlyFavorite}
                    onChange={() => {
                        setOnlyWithNote(false);
                        setOnlyFavorite(!onlyFavorite);
                    }}

                //inputProps={{ 'aria-label': 'controlled' }}
                />
                <ClassificationAccordion classifications={classifications} onClassificationSelect={setSelectedClassification} totalItems={totalItems}
                    page={page} onPaginationChange={(p) => loadClassifications(p)} />
            </div>
        </div>
    );
};

const createStyles = () => (
    {
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
        pageContent: {
            flex: 1,
            height: '100%',
        }
    }
);

export default Page;