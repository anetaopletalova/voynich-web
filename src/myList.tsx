import { useTheme } from '@emotion/react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from './api/restApi';
import SearchInput from './components/search';
import { useAuth } from './context/auth';
import { useMountEffect } from './helpers/hooks';
import { IClassificationParameters, IMarking, IPageClassification } from './types/general';
import { toServerDateFormat } from './utils';
import PageClassificationView from './views/classifications/pageClassification';
import Canvas from './views/pages/canvas';
import Controls from './views/pages/controls';

const MyList = () => {
    const { classificationApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);
    const theme = useTheme();
    const styles = useMemo(() => createStyles(), []);
    const [pageHeight, setPageHeight] = useState(window.innerHeight);
    const [pageWidth, setPageWidth] = useState(0);
    const [polygons, setPolygons] = useState<IMarking[]>()
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const [pageName, setPageName] = useState('');
    const { authState } = useAuth();
    const defaultParams = { page, dateTo: toServerDateFormat(dateTo) };
    const [params, setParams] = useState<IClassificationParameters>(defaultParams);
    const location = useLocation<{ userName: string }>();
    const [userName, setUserName] = useState(location?.state?.userName || '');

    const loadClassifications = async (params: IClassificationParameters = defaultParams) => {
        if (authState) {
            const res = await classificationApi.getAll(authState.userId, params);
            if (res.ok && res.data) {
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
                //TODO mozne reseni - pokud se mi vrati 0 zaznamu, zavolat znovu s page = 0
            }
        }
    }

    //for some reason it otherwise doesnt call the emthod with username param
    useMountEffect(() => {
        //console.log(location.state.userName);
        if (location?.state?.userName) {
            const newParams = { ...params, userName };
            setParams(newParams);
            setUserName(userName);
        } else {
            //loadClassifications();
       }
    })

    useEffect(() => {
        if (selectedClassification) {
            setPolygons(selectedClassification.markings);
            setPageName(selectedClassification.pageName);
        }
    }, [selectedClassification])

    useEffect(() => {
        //TODO vyresit tento problem!!
        //setPage(0);
        const newParams = { page, dateTo: toServerDateFormat(dateTo), withNote: onlyWithNote, favorite: onlyFavorite, userName };
        setParams(newParams);
        console.log('xx', newParams);
        loadClassifications(newParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyWithNote, onlyFavorite, dateTo, userName, page])



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

    const searchByText = (filterText: string) => {
        console.log('ss');
        setUserName(filterText);
        setSelectedClassification(null);
        //TODO napsat nekde, ze se vyhledava pro tohoto uzivatele, misto searchinputu a dat tam moznost to zrusit X
    };

    return (
        <div style={styles.content as React.CSSProperties}>     
            <div id='page' style={styles.pageContent}>        
                {pageName && <Canvas pageName={pageName} pageHeight={pageHeight} pageWidth={pageWidth} polygons={polygons} />}
            </div>
            <div style={styles.accordionContainer}>
                <div>{userName}</div>
                <SearchInput onSearch={searchByText} hasClearButton={true}/>
                <Controls
                    onlyWithNote={onlyWithNote}
                    setOnlyWithNote={setOnlyWithNote}
                    onlyFavorite={onlyFavorite}
                    setOnlyFavorite={setOnlyFavorite}
                    dateTo={dateTo}
                    setDateTo={setDateTo}
                />
                <PageClassificationView classifications={classifications} onClassificationSelect={setSelectedClassification} totalItems={totalItems}
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

export default MyList;