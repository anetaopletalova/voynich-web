import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useApi } from '../../api/restApi';
import { useMountEffect } from '../../helpers/hooks';
import { IClassificationParameters, IMarking, IPageClassification } from '../../types/general';
import { useAuth } from '../../context/auth';
import { toServerDateFormat } from '../../utils';
import Controls from './controls';
import Canvas from './canvas';
import PageClassificationView from '../classifications/pageClassification';
import { useLookup } from '../../context/data';
const qs = require('query-string');

const Page = () => {
    const { classificationApi } = useApi();
    const { getPages } = useLookup();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    const styles = useMemo(() => createStyles(), []);
    const [pageHeight, setPageHeight] = useState(window.innerHeight);
    const [pageWidth, setPageWidth] = useState(0);
    const [polygons, setPolygons] = useState<IMarking[]>()
    const [page, setPage] = useState(1);
    const { pageId } = useParams<any>();
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const { authState } = useAuth();
    const defaultParams = { pageId: Number(pageId), page, dateTo: toServerDateFormat(dateTo) };
    const [params, setParams] = useState<IClassificationParameters>(defaultParams);
    const [pageName, setPageName] = useState('');
    const history = useHistory();
    const URLparams = useLocation();

    const loadClassifications = async (params: IClassificationParameters = defaultParams) => {
        if (pageId && authState) {
            const res = await classificationApi.getByPageId(authState.userId, params);
            if (res.ok && res.data) {
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
            }
        }
    }

    const loadPages = async () => {
        const res = await getPages();
        if (res) {
            const currentPage = res.find(page => page.id === Number(pageId));
            currentPage && setPageName(currentPage.name);
        }
    };

    useMountEffect(() => {
        loadPages();
        loadClassifications();
        if (URLparams.search) {
            const value = qs.parse(URLparams.search);
            setPage(value.page);
        }
    })

    useEffect(() => {
        const value = qs.parse(URLparams.search);
        if (classifications.length && value.classificationId) {
            const selected = classifications.find(cl => cl.classificationId === Number(value.classificationId));
            selected && setSelectedClassification(selected);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classifications])

    useEffect(() => {
        const newParams = { ...params, page };
        loadClassifications(newParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, params])

    useEffect(() => {
        selectedClassification ? setPolygons(selectedClassification.markings) : setPolygons([]);
    }, [selectedClassification])

    useEffect(() => {
        setPage(1);
        const params: IClassificationParameters = { pageId: Number(pageId), page, dateTo: toServerDateFormat(dateTo), withNote: onlyWithNote, favorite: onlyFavorite };
        setParams(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyWithNote, onlyFavorite, dateTo])

    useLayoutEffect(() => {
        const updateSize = () => {
            setPageWidth(document.querySelector('#page')?.clientWidth || 0);
            setPageHeight(window.innerHeight - 64);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [])

    const setUrlParams = (classif: IPageClassification | null) => {
        let params = new URLSearchParams();
        params.append('page', page.toString());
        if (classif) {
            params.append('classificationId', classif.classificationId.toString());
            history.replace({ pathname: `/page/${Number(pageId)}`, search: '?' + params });
        } else {
            history.replace({ pathname: `/page/${Number(pageId)}`, search: '?' + params });
        }
    }

    return (
        <div style={styles.content}>
            <div id='page' style={styles.pageContent}>
                <Canvas pageName={pageName} pageHeight={pageHeight} pageWidth={pageWidth} polygons={polygons} pageId={Number(pageId)} />
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
                <PageClassificationView
                    classifications={classifications}
                    onClassificationSelect={(cl) => {
                        setUrlParams(cl);
                        setSelectedClassification(cl);
                    }}
                    totalItems={totalItems}
                    page={page}
                    onPaginationChange={(p) => {
                        setPage(p); 
                        history.replace({ pathname: `/page/${Number(pageId)}`, search: '?' + new URLSearchParams({ page: p.toString() }).toString() });
                    }}
                />
            </div>
        </div>
    );
};

const createStyles = (): { [key: string]: React.CSSProperties } => (
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