import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useApi } from '../api/restApi';
import SearchInput from '../components/search';
import { useAuth } from '../context/auth';
import { useMountEffect } from '../helpers/hooks';
import { IClassificationParameters, IMarking, IPageClassification } from '../types/general';
import { toServerDateFormat } from '../utils';
import PageClassificationView from './classifications/pageClassification';
import Canvas from './pages/canvas';
import Controls from './pages/controls';
const qs = require('query-string');

const MyList = () => {
    const { classificationApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    const styles = useMemo(() => createStyles(), []);
    const [pageHeight, setPageHeight] = useState(window.innerHeight);
    const [pageWidth, setPageWidth] = useState(0);
    const [polygons, setPolygons] = useState<IMarking[]>()
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const [pageName, setPageName] = useState('');
    const [pageId, setPageId] = useState<number | null>(null);
    const { authState } = useAuth();
    const defaultParams = { page, dateTo: toServerDateFormat(dateTo) };
    const [params, setParams] = useState<IClassificationParameters>(defaultParams);
    const location = useLocation<{ userName: string }>();
    const [userName, setUserName] = useState(location?.state?.userName || '');
    const history = useHistory();
    const URLparams = useLocation();

    const loadClassifications = async (params: IClassificationParameters = defaultParams) => {
        if (authState) {
            const res = await classificationApi.getAll(authState.userId, params);
            if (res.ok && res.data) {
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
            }
        }
    }

    useMountEffect(() => {
        if (URLparams.search) {
            const value = qs.parse(URLparams.search);
            setPage(Number(value.page));
        }
        if (location?.state?.userName) {
            const newParams = { ...params, userName };
            setParams(newParams);
            setUserName(userName);
        } 
    })

    useEffect(() => {
        if (selectedClassification) {
            setPolygons(selectedClassification.markings);
            setPageName(selectedClassification.pageName);
            setPageId(selectedClassification.pageId);
        }
    }, [selectedClassification])

    useEffect(() => {
        const newParams = { page, dateTo: toServerDateFormat(dateTo), withNote: onlyWithNote, favorite: onlyFavorite, userName };
        setParams(newParams);
        loadClassifications(newParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyWithNote, onlyFavorite, dateTo, userName, page])

    useEffect(() => {
        const value = qs.parse(URLparams.search);
        if (classifications.length && value.classificationId) {
            const selected = classifications.find(cl => cl.classificationId === Number(value.classificationId));
            selected && setSelectedClassification(selected);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classifications])

    useLayoutEffect(() => {
        const updateSize = () => {
            setPageWidth(document.querySelector('#page')?.clientWidth || 0);
            setPageHeight(window.innerHeight - 64);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [])

    const searchByText = (filterText: string) => {
        setUserName(filterText);
        setSelectedClassification(null);
        setPageName('');
    };

    const setUrlParams = (classif: IPageClassification | null) => {
        let params = new URLSearchParams();
        params.append('page', page.toString());
        if (classif) {                  
            params.append('classificationId', classif.classificationId.toString());
            history.replace({ pathname: `/myList`, search: '?' + params });
        } else {
            history.replace({ pathname: `/myList`, search: '?' + params }); 
        }
    }

    return (
        <div style={styles.content}>
            <div id='page' style={styles.pageContent}>
                {pageName && pageId && <Canvas pageName={pageName} pageHeight={pageHeight} pageWidth={pageWidth} polygons={polygons} pageId={pageId} />}
            </div>
            <div style={styles.accordionContainer}>
                <SearchInput onSearch={searchByText} hasClearButton={true} defaultValue={userName} />
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
                        setSelectedClassification(cl);
                        setUrlParams(cl);
                    }}
                    totalItems={totalItems}
                    page={page}
                    onPaginationChange={(p) => {
                        setPage(p); 
                        history.replace({ pathname: `/myList`, search: '?' + new URLSearchParams({ page: p.toString() }).toString()})}}
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

export default MyList;