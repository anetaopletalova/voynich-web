import { useTheme } from '@emotion/react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../api/restApi';
import ClassificationAccordion from '../../components/accordion';
import { useMountEffect } from '../../helpers/hooks';
import { IClassificationParameters, IMarking, IPage, IPageClassification } from '../../types/general';
import { useAuth } from '../../context/auth';
import { toServerDateFormat } from '../../utils';
import Controls from './controls';
import Canvas from './canvas';
import PageClassificationView from '../classifications/pageClassification';


const Page = () => {
    const location = useLocation<IPage>();
    const { classificationApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    // const [drawCtx, setDrawCtx] = useState<CanvasRenderingContext2D | null>(null);
    // const [imgWidth, setImgWidth] = useState<number>();
    const [imgHeight, setImgHeight] = useState<number>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(), []);
    const [pageHeight, setPageHeight] = useState(window.innerHeight);
    const [pageWidth, setPageWidth] = useState(0);
    const [polygons, setPolygons] = useState<IMarking[]>()
    const [page, setPage] = useState(0);
    const pageId = location.state.id;
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const { authState } = useAuth();
    const defaultParams = { pageId, page, dateTo: toServerDateFormat(dateTo) };
    const [params, setParams] = useState<IClassificationParameters>(defaultParams);


    const loadClassifications = async (params: IClassificationParameters = defaultParams) => {
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

    useMountEffect(() => {
        loadClassifications();
    })

    useEffect(() => {
        //TODO check if it updates correctly
        const newParams = { ...params, page };
        loadClassifications(newParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, params])

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
        setParams(params);
        // loadClassifications(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyWithNote, onlyFavorite, dateTo])

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
                <Canvas pageHeight={pageHeight} pageWidth={pageWidth} polygons={polygons} />
            </div>
            <div style={styles.accordionContainer}>
                <Controls
                    onlyWithNote={onlyWithNote}
                    setOnlyWithNote={setOnlyWithNote}
                    onlyFavorite={onlyFavorite}
                    setOnlyFavorite={setOnlyFavorite}
                    dateTo={dateTo}
                    setDateTo={setDateTo}
                />
                <ClassificationAccordion classifications={classifications} onClassificationSelect={setSelectedClassification} totalItems={totalItems}
                    page={page} onPaginationChange={(p) => setPage(p)} />
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