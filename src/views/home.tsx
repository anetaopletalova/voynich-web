import { Badge, Theme, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApi } from '../api/restApi';
import SearchInput from '../components/search';
import { IPage } from '../types/general';

interface IPageContainerProps {
    page: IPage;
}

const Home = () => {
    const { pagesApi } = useApi();
    const [pages, setPages] = useState<IPage[]>([]);
    const [filteredPages, setFilteredPages] = useState<IPage[]>([]);
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const loadPages = async () => {
            const res = await pagesApi.getAll();
            if (res.ok && res.data) {
                setPages(res.data.pages);
                setFilteredPages(res.data.pages);
            }
        };

        loadPages();
    }, [])

    const searchByText = (filterText: string) => {
        if (filterText === '') setFilteredPages(pages);
        const filtered = pages.filter(item => item.id.toString().indexOf(filterText) !== -1)
        setFilteredPages(filtered);
    };

    return (
        <>
            <div style={styles.searchContainer}>
            {/* nechat true??? */}
            <SearchInput onSearch={searchByText} onTextChange={true} />
            </div>
            <div style={styles.pagesContainer as React.CSSProperties}>
                {filteredPages &&
                    filteredPages.map(page => (
                        <PageContainer page={page} key={page.id}/>
                    ))}
            </div>
        </>
    );
};

const PageContainer: React.FC<IPageContainerProps> = ({ page }) => {
    const history = useHistory();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const displayPage = () => {
        history.push({
            pathname: '/page',
            state: page,
        });
    }
    return (
        <div onClick={displayPage} style={styles.imagePreview}>
            <Badge color="secondary" badgeContent={`#${page.id}`} anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
                <img src={`/previews/${page.name}`} alt={'voynich'} width={140} height={200} style={styles.pagePreview} />
            </Badge>
        </div>)
}

const createStyles = (theme: Theme) => (
    {
        imagePreview: {
            paddingLeft: '25px',
            paddingTop: '25px',
        },
        pagesContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingBottom: '25px',
        },
        pagePreview: {
            borderRadius: '7px',
        },
        searchContainer: {
            justifyContent: 'flex-end',
            display: 'flex',
            marginTop: '10px'
        },
    }
);

export default Home;
